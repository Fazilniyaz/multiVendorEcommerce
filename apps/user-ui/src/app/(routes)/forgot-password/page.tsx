"use client"
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import axios, { AxiosError } from 'axios'
import toast from 'react-hot-toast'

type FormData = {
    email: string,
    password: string,
}

export default function ForgotPassword() {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

    const [step, setStep] = useState<"email" | "otp" | "reset">("email");

    const [otp, setOtp] = useState(["", "", "", ""]);

    const [userEmail, setUserEmail] = useState<string | null>(null);

    const [canResend, setCanResend] = useState(true);

    const [timer, setTimer] = useState(60);

    const inputRef = useRef<(HTMLInputElement | null)[]>([]);

    const [serverError, setServerError] = useState<string | null>(null);

    const onSubmitEmail = ({ email }: { email: string }) => {
        requestOtpMutation.mutate({ email })
    }

    const onSubmitPassword = ({ password }: { password: string }) => {
        resetPasswordMutation.mutate({ password })
    }

    const startResendTimer = () => {
        setCanResend(false);
        setTimer(60);
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            })
        }, 1000);
    };

    const requestOtpMutation = useMutation({
        mutationFn: async ({ email }: { email: string }) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/forgot-password-user`, { email }, { withCredentials: true })
            return response.data
        },
        onSuccess: (_, { email }) => {
            setServerError(null)
            setUserEmail(email)
            setStep("otp")
            setCanResend(false)
            startResendTimer()
        },
        onError: (error: AxiosError) => {
            const errorMessage = (error.response?.data as { message?: string })?.message || "Invalid OTP. Please try again!"
            setServerError(errorMessage)
        }
    })

    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            if (!userEmail) return;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-forgot-password-user`, { email: userEmail, otp: otp.join("") }, { withCredentials: true })
            return response.data
        },
        onSuccess: () => {
            setServerError(null)
            setStep("reset")
        },
        onError: (error: AxiosError) => {
            const errorMessage = (error.response?.data as { message?: string })?.message || "Invalid OTP. Please try again!"
            setServerError(errorMessage)
        }
    })

    const resetPasswordMutation = useMutation({
        mutationFn: async ({ password }: { password: string }) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/reset-password-user`, { email: userEmail, newPassword: password }, { withCredentials: true })
            return response.data
        },
        onSuccess: () => {
            setServerError(null)
            setStep("email")
            router.push("/login")
            toast.success("Password reset successfully!")
        },
        onError: (error: AxiosError) => {
            const errorMessage = (error.response?.data as { message?: string })?.message || "Invalid OTP. Please try again!"
            setServerError(errorMessage)
        }
    })

    const handleOtpChange = (index: number, value: string) => {
        if (!/^[0-9]$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value  // ✅ Fix 1: was Number(value), otp is string[]
        setOtp(newOtp)

        if (value && index < inputRef.current.length - 1) {
            inputRef.current[index + 1]?.focus()
        }
    }

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRef.current[index - 1]?.focus()
        }
    }

    // const resendOtp = () => {
    //     if (userData) {
    //         signupMutation.mutate(userData)
    //     }
    // }

    const router = useRouter()

    return (
        <div className='w-full py-10 min-h-[85vh] bg-[#f1f1f1]'>
            <h1 className='text-4xl font-Poppins font-semibold text-black text-center mb-2'>
                Reset Password
            </h1>
            <p className='text-center text-lg font-medium py-3 text-[#00000099]'>Home . Forgot Password</p>

            <div className='w-full flex items-center justify-center mt-6'>
                <div className='w-full md:w-[480px] p-8 bg-white shadow rounded-lg'>
                    {step === "email" && (<>
                        <h3 className='text-3xl font-semibold text-center mb-2'>
                            Login to Eshop
                        </h3>
                        <p className='text-center text-gray-500 mb-6'>
                            Go back to{" "}
                            <Link href="/login" className='text-blue-500'>Login</Link>
                        </p>

                        <form onSubmit={handleSubmit(onSubmitEmail)} className='space-y-5'>

                            <div className='flex flex-col gap-1'>
                                <label className='text-gray-800 text-sm font-medium'>Email</label>
                                <input
                                    type="email"
                                    placeholder='yourmail@gmail.com'
                                    className='w-full p-2 border border-gray-300 outline-none rounded'
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address"
                                        }
                                    })}
                                />
                                {errors.email && (
                                    <p className='text-red-500 text-xs mt-1'>{String(errors.email.message)}</p>
                                )}
                            </div>

                            <button
                                type='submit'
                                disabled={requestOtpMutation.isPending}
                                className='w-full text-lg cursor-pointer bg-black text-white py-2 rounded-lg'
                            >
                                {requestOtpMutation.isPending ? "Sending OTP..." : "Send OTP"}
                            </button>

                            {serverError && (
                                <p className='text-red-500 text-sm text-center'>{serverError}</p>
                            )}

                        </form></>
                    )}

                    {step === "otp" && (<>
                        <h3 className='text-xl font-semibold text-center mb-4'>Enter OTP</h3>
                        <div className='flex justify-center gap-6'>
                            {otp?.map((digit, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength={1}
                                    className='w-12 h-12 text-center border border-gray-300 outline-none rounded'
                                    ref={(el) => { if (el) inputRef.current[index] = el }}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                />
                            ))}
                        </div>
                        <button
                            type='button'
                            disabled={verifyOtpMutation.isPending}
                            onClick={() => verifyOtpMutation.mutate()}
                            className='w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg'
                        >
                            {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
                        </button>
                        <p className='text-center text-sm mt-4'>
                            {canResend ? (
                                <button
                                    type='button'
                                    className='text-blue-500 hover:underline cursor-pointer'
                                    onClick={() => userEmail && requestOtpMutation.mutate({ email: userEmail })}
                                >
                                    Resend OTP
                                </button>
                            ) : (
                                `Resend OTP in ${timer} seconds`
                            )}
                        </p>
                        {serverError && (
                            <p className='text-red-500 text-sm mt-2'>{serverError}</p>
                        )}
                    </>)}

                    {step === "reset" && (<>
                        <h3 className='text-xl font-semibold text-center mb-4'>Reset Password</h3>
                        <form onSubmit={handleSubmit(onSubmitPassword)} className='space-y-5'>
                            <div className='flex flex-col gap-1'>
                                <label className='block text-gray-700 mb-1'>New Password</label>
                                <input
                                    type="password"
                                    placeholder='Min. 6 characters'
                                    className='w-full p-2 border border-gray-300 outline-none rounded mb-1'
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: {
                                            value: 6,
                                            message: "Password must be at least 6 characters long"
                                        }
                                    })}
                                />
                                {errors.password && (
                                    <p className='text-red-500 text-xs mt-1'>{String(errors.password.message)}</p>
                                )}
                                {serverError && (
                                    <p className='text-red-500 text-sm mt-2'>{serverError}</p>
                                )}
                            </div>
                            <button
                                type='submit'
                                disabled={resetPasswordMutation.isPending}
                                className='w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg'
                            >
                                {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                            </button>
                            {serverError && (
                                <p className='text-red-500 text-sm mt-2'>{serverError}</p>
                            )}
                        </form>
                    </>)}
                </div>
            </div>
        </div>
    )
}