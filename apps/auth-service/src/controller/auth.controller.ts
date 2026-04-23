import { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, handleForgetPassword, sendOtp, trackOtpRequests, validateRegistrationData, verifyForgotPasswordOtpHelper, verifyOtp } from "../utils/auth.helper";
import prisma from "@multi-vendor-ecommerce/prisma";
import { AuthenticationError, ValidationError } from "@packages/error-handler";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2026-03-25.dahlia",
});

export const userRegistration = async (req: Request, res: Response, next: NextFunction) => {
    console.log("userRegistration", req.body);
    try {
        validateRegistrationData(req.body, "user");
        const { name, email } = req.body;

        const existingUser = await prisma.users.findUnique({ where: { email } });
        if (existingUser) {
            return next(new ValidationError("User already exists with this email"));
        }

        await checkOtpRestrictions(email, next)
        await trackOtpRequests(email, next)
        await sendOtp(name, email, "user-activation-mail")

        res.status(200).json({
            success: true,
            message: "OTP sent successfully",
        })

    } catch (error) {
        return next(error);
    }
}

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp, name, password } = req.body;

        if (!email || !otp || !name || !password) {
            return next(new ValidationError("All fields are required"));
        }

        const existingUser = await prisma.users.findUnique({ where: { email } });
        if (existingUser) {
            return next(new ValidationError("User already exists with this email"));
        }

        await verifyOtp(email, otp, next);

        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.users.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "user",
            }
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
        })
    } catch (error) {
        return next(error);
    }
}

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ValidationError("All fields are required"));
        }

        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) {
            return next(new AuthenticationError("User not found"));
        }

        const isMatch = await bcrypt.compare(password, user.password!);
        if (!isMatch) {
            return next(new AuthenticationError("Invalid password"));
        }

        res.clearCookie("seller-access-token")
        res.clearCookie("seller-refresh-token")

        //generate access and refresh tokens

        const accessToken = jwt.sign({ id: user.id, role: user.role }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ id: user.id, role: user.role }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: "7d" });

        //store refresh and access token in secure http only cookies
        setCookie(res, "access_token", accessToken);
        setCookie(res, "refresh_token", refreshToken);

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        })
    } catch (error) {
        return next(error);
    }
}

export const refreshToken = async (req: any, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies["refresh_token"] || req.cookies["seller_refresh_token"] || req.headers.authorization?.split(" ")[1];

        if (!refreshToken) {
            return next(new AuthenticationError("Unauthorized or No Refresh Token"));
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as { id: string, role: string };
        if (!decoded || !decoded.id || !decoded.role) {
            return next(new JsonWebTokenError("Invalid Refresh Token"));
        }


        let account;
        if (decoded.role === "user") {
            account = await prisma.users.findUnique({ where: { id: decoded.id } });
        } else if (decoded.role == "seller") {
            account = await prisma.sellers.findUnique({ where: { id: decoded.id }, include: { shop: true } });
        }

        if (!account) {
            return next(new AuthenticationError("User/Seller not found"));
        }

        const newAccessToken = jwt.sign({ id: decoded.id, role: decoded.role }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" });
        // setCookie(res, "access_token", newAccessToken);

        if (decoded.role === "user") {
            setCookie(res, "access_token", newAccessToken)
        } else if (decoded.role === "seller") {
            setCookie(res, "seller-access-token", newAccessToken)
        }

        req.role = decoded.role;


        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully",

        })
    } catch (error) {
        return next(error);
    }
}

export const getUser = async (req: any, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        if (!user) {
            return next(new AuthenticationError("User not found"));
        }
        res.status(200).json({
            success: true,
            message: "User found successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        })
    } catch (error) {
        return next(error);
    }
}

export const userForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    await handleForgetPassword(req, res, next, "user");
}

export const verifyForgotPasswordOtp = async (req: Request, res: Response, next: NextFunction) => {
    await verifyForgotPasswordOtpHelper(req, res, next, "user");
}

export const resetUserPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return next(new ValidationError("All fields are required"));
        }
        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) {
            return next(new AuthenticationError("User not found"));
        }

        //compare new & exisitng password
        const isSamePassword = await bcrypt.compare(newPassword, user.password!);
        if (isSamePassword) {
            return next(new ValidationError("New password cannot be same as old password"));
        }

        //hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.users.update({
            where: { email },
            data: { password: hashedPassword }
        })

        res.status(200).json({
            message: "Password reset successfull"
        })

    } catch (error) {
        return next(error);
    }
}

//register a new seller
export const registerSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, "seller")
        const { name, email } = req.body;

        const existingSeller = await prisma.sellers.findUnique({
            where: { email }
        })

        if (existingSeller) {
            return next(new ValidationError("Seller already exists with this email"));
        }

        await checkOtpRestrictions(email, next)
        await trackOtpRequests(email, next)
        await sendOtp(name, email, "seller-activation-mail")

        res.status(200).json({
            success: true,
            message: "OTP sent successfully, Please verify your account",
        })


    } catch (error) {
        return next(error);
    }
}

//verify seller with OTP
export const verifySeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp, name, password, phone_number, country } = req.body;
        console.log(email, otp, name, password, phone_number, country);
        if (!email || !otp || !name || !password || !phone_number || !country) {
            return next(new ValidationError("All fields are required"));
        }
        const existingSeller = await prisma.sellers.findUnique({ where: { email } });
        if (existingSeller) {
            return next(new ValidationError("Seller already exists with this email"));
        }

        await verifyOtp(email, otp, next)

        const hashedPassword = await bcrypt.hash(password, 10);
        const seller = await prisma.sellers.create({
            data: {
                name,
                email,
                country,
                phone_number,
                password: hashedPassword,

            }
        });
        res.status(201).json({
            success: true,
            message: "Seller registered successfully",
            data: {
                seller: {
                    id: seller.id,
                    email: seller.email,
                    name: seller.name
                }
            }
        })
    } catch (error) {
        return next(error);
    }
}



//Create new shop
export const createShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, bio, address, opening_hours, website, category, sellerId, socialLinks } = req.body;

        if (!name || !address || !opening_hours || !website || !category || !sellerId || !bio) {
            return next(new ValidationError("All fields are required"));
        }


        const shopData: any = {
            name,
            bio,
            address,
            opening_hours,
            website,
            category,
            sellerId,
        }

        if (website && website.trim() !== "") {
            shopData.website = website.trim();
        }

        if (socialLinks && socialLinks.trim() !== "") {
            shopData.socialLinks = socialLinks.trim();
        }

        await prisma.shops.create({
            data: shopData
        });
        res.status(201).json({
            success: true,
            message: "Shop created successfully",
        })
    } catch (error) {
        return next(error);
    }
}

// Create stripe connect account link
export const createStripeConnectLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sellerId } = req.body;
        console.log("sellerId", sellerId)
        if (!sellerId) {
            return next(new ValidationError("Seller ID is required"));
        }
        const seller = await prisma.sellers.findUnique({ where: { id: sellerId } });
        if (!seller) {
            return next(new AuthenticationError("Seller not found"));
        }

        console.log("seller completed")
        const account = await stripe.accounts.create({
            type: "express",
            country: "US",
            email: seller?.email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
        });
        console.log("seller completed")


        await prisma.sellers.update({
            where: { id: sellerId },
            data: { stripeId: account.id }
        })

        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: "http://localhost:4200/login",
            return_url: "http://localhost:4200/login",
            type: "account_onboarding",
        });

        res.status(200).json({
            success: true,
            url: accountLink.url
        })
    } catch (error: any) {
        // Handle Stripe-specific errors
        if (error.type === 'StripeInvalidRequestError' && error.raw?.message?.includes('signed up for Connect')) {
            return next(new ValidationError("Stripe Connect is not enabled on your account. Please enable it at https://dashboard.stripe.com/connect"));
        }
        return next(error);
    }
}

//login seller
export const loginSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new ValidationError("All fields are required"));
        }
        const seller = await prisma.sellers.findUnique({ where: { email } });
        if (!seller) {
            return next(new AuthenticationError("Seller not found"));
        }
        const isPasswordValid = await bcrypt.compare(password, seller.password!);
        if (!isPasswordValid) {
            return next(new AuthenticationError("Invalid password"));
        }


        res.clearCookie("access_token")
        res.clearCookie("refresh_token")

        const accessToken = jwt.sign({ id: seller.id, role: "seller" }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ id: seller.id, role: "seller" }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: "7d" });

        setCookie(res, "seller-access-token", accessToken);
        setCookie(res, "seller-refresh-token", refreshToken);


        res.status(200).json({
            success: true,
            message: "Seller logged in successfully",
            seller: {
                id: seller.id,
                name: seller.name,
                email: seller.email,
                role: "seller"
            }
        })
    } catch (error) {
        return next(error);
    }
}

//get logged in seller
export const getSeller = async (req: any, res: Response, next: NextFunction) => {
    try {
        const seller = req.seller;
        res.status(200).json({
            success: true,
            seller
        })
    } catch (error) {
        return next(error);
    }
}