import crypto from 'crypto';
import { ValidationError } from "@packages/error-handler";
import { sendEmail } from './sendMail';
import redis from '@packages/libs/redis';
import { NextFunction, Request, Response } from 'express';
import prisma from "@multi-vendor-ecommerce/prisma";


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (data: any, userType: "user" | "seller") => {

    const { name, email, password, phone_number, country } = data;

    console.log("data", data)

    if (!name || !email || !password || (userType === "seller" && (!phone_number || !country))) {
        console.log(name, email, password, phone_number, country)
        throw new ValidationError("Missing required fields");

    }

    if (!emailRegex.test(email)) {
        throw new ValidationError("Invalid email address");
    }

    // if(password.length < 6){
    //     throw new ValidationError("Password must be at least 6 characters long");
    // }
}

export const sendOtp = async (
    name: string,
    email: string,
    template: string,
) => {
    const otp = crypto.randomInt(1000, 9999).toString();
    await sendEmail(email, "Verify your email address", template, { name, otp });
    console.log("stage 1 completed")
    await redis.set(`otp:${email}`, otp, "EX", 60 * 5);
    await redis.set(`otp_cooldown:${email}`, "true", "EX", 60);

}

export const checkOtpRestrictions = async (email: string, next: NextFunction) => {
    if (await redis.get(`otp_lock:${email}`)) {
        return next(
            new ValidationError("Please wait 60 seconds before requesting another OTP")
        )
    }

    if (await redis.get(`otp_spam_lock:${email}`)) {
        return next(
            new ValidationError("Too many requests. Please try again after 1 hour")
        )
    }

    if (await redis.get(`otp_cooldown:${email}`)) {
        return next(
            new ValidationError("Please wait 60 seconds before requesting another OTP")
        )
    }
}

export const trackOtpRequests = async (email: string, next: NextFunction) => {
    const otpRequestKey = `otp_request_count:${email}`;
    const otpRequests = parseInt((await redis.get(otpRequestKey)) || "0")
    if (otpRequests >= 2) {
        await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 60 * 60);
        return next(
            new ValidationError("Too many requests. Please try again after 1 hour")
        )
    }

    await redis.set(otpRequestKey, (otpRequests + 1).toString(), "EX", 60 * 60);
}

export const verifyOtp = async (email: string, otp: string, next: NextFunction) => {
    const storedOtp = await redis.get(`otp:${email}`);
    if (!storedOtp) {
        throw next(
            new ValidationError("Invalid or expired OTP!")
        )
    }

    const failedAttemptsKey = `otp_attempts${email}`
    const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || "0")

    if (storedOtp !== otp) {
        if (failedAttempts >= 2) {
            await redis.set(`otp_lock:${email}`, "locked", "EX", 1800);
            await redis.del(`otp:${email}`, failedAttemptsKey)
            throw next(
                new ValidationError("Too many failed attempts. Please try again after 30 minutes")
            )
        }
        await redis.set(failedAttemptsKey, (failedAttempts + 1).toString(), "EX", 300);
        throw next(
            new ValidationError(`Invalid OTP. ${2 - failedAttempts} attempts remaining`)
        )
    }

    await redis.del(`otp:${email}`, failedAttemptsKey);


}

export const handleForgetPassword = async (req: Request, res: Response, next: NextFunction, userType: "user" | "seller") => {
    try {
        const { email } = req.body;

        if (!email) {
            throw next(new ValidationError("Email is required"));
        }

        const user = userType === "user" ? await prisma.users.findUnique({ where: { email } }) : await prisma.sellers.findUnique({ where: { email } });
        if (!user) {
            throw next(new ValidationError(`${userType} not found`));
        }

        //check otp restrictions
        await checkOtpRestrictions(email, next);
        await trackOtpRequests(email, next);

        //generate OTP & send email
        await sendOtp(user.name, email, userType === "user" ? "forgot-password-user-mail" : "forgot-password-seller-mail")
        res.status(200).json({
            message: "OTP sent successfully!, Please verify your account"
        })
    } catch (error) {
        return next(error);
    }
}

export const verifyForgotPasswordOtpHelper = async (req: Request, res: Response, next: NextFunction, userType: "user" | "seller") => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            throw next(new ValidationError("Email and OTP are required"));
        }

        //verify OTP
        await verifyOtp(email, otp, next);

        res.status(200).json({
            message: "OTP verified successfully! You can now reset your password"
        })
    } catch (error) {
        return next(error);
    }
}

