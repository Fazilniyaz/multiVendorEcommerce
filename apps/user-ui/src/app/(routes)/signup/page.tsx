"use client"
import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import GoogleButton from '../../../shared/components/google-button'
import { Eye, EyeOff } from 'lucide-react'
import axios, { AxiosError } from 'axios'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

type FormData = {
    email: string,
    password: string,
    name: string,
}

export default function Signup() {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

    const [passwordVisible, setPasswordVisible] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)
    const [canResend, setCanResend] = useState(false)
    const [otp, setOtp] = useState<string[]>(["", "", "", ""])
    const [timer, setTimer] = useState(60)
    const [showOtp, setShowOtp] = useState(false)
    const [userData, setUserData] = useState<FormData | null>(null)
    const inputRef = useRef<(HTMLInputElement | null)[]>([])
    const router = useRouter()

    const startResetTimer = () => {
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    setCanResend(true)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const signupMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user-registration`, data)
            return response.data
        },
        onSuccess: (_, formData) => {
            setUserData(formData)
            setShowOtp(true)
            setCanResend(false)
            setTimer(60)
            startResetTimer()
        },
        onError: (error) => {
            setServerError(error.message)
        }
    })

    const onSubmit = (data: FormData) => {
        signupMutation.mutate(data)
    }

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

    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            if (!userData) return;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-registration`, { ...userData, otp: otp.join("") })
            return response.data
        },
        onSuccess: () => {
            router.push("/login")
            setShowOtp(false)
            setCanResend(false)
            setTimer(60)
            startResetTimer()
        },
        onError: (error) => {
            setServerError(error.message)
        }
    })

    const resentOtp = () => {
        // ✅ Fix 3: reset timer and canResend on resend
        setTimer(60)
        setCanResend(false)
        // handle resend otp here
    }

    return (
        <div className='w-full py-10 min-h-[85vh] bg-[#f1f1f1]'>
            <h1 className='text-4xl font-Poppins font-semibold text-black text-center mb-2'>
                Signup
            </h1>
            <p className='text-center text-lg font-medium py-3 text-[#00000099]'>Home . Signup</p>

            <div className='w-full flex items-center justify-center mt-6'>
                <div className='w-full md:w-[480px] p-8 bg-white shadow rounded-lg'>
                    <h3 className='text-3xl font-semibold text-center mb-2'>
                        Signup to Eshop
                    </h3>
                    <p className='text-center text-gray-500 mb-6'>
                        Already have an account?{" "}
                        <Link href="/login" className='text-blue-500'>Login</Link>
                    </p>

                    <GoogleButton />

                    <div className="flex items-center my-5 text-gray-400 text-sm">
                        <div className="flex-1 border-t border-gray-300" />
                        <span className="px-4">Or Sign in with Email</span>
                        <div className="flex-1 border-t border-gray-300" />
                    </div>

                    {!showOtp ? (
                        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>

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
                            <div className='flex flex-col gap-1'>
                                <label className='text-gray-800 text-sm font-medium'>Name</label>
                                <input
                                    type="text"
                                    placeholder='your name'
                                    className='w-full p-2 border border-gray-300 outline-none rounded'
                                    {...register("name", {
                                        required: "Name is required",
                                    })}
                                />
                                {errors.name && (
                                    <p className='text-red-500 text-xs mt-1'>{String(errors.name.message)}</p>
                                )}
                            </div>

                            <div className='flex flex-col gap-1'>
                                <label className='text-gray-800 text-sm font-medium'>Password</label>
                                <div className='relative'>
                                    <input
                                        type={passwordVisible ? "text" : "password"}
                                        placeholder='Min. 6 characters'
                                        className='w-full p-2 border border-gray-300 outline-none rounded'
                                        {...register("password", {
                                            required: "Password is required",
                                            minLength: {
                                                value: 6,
                                                message: "Password must be at least 6 characters long"
                                            }
                                        })}
                                    />
                                    <button
                                        className='absolute inset-y-0 right-3 flex items-center text-gray-400'
                                        type='button'
                                        onClick={() => setPasswordVisible(!passwordVisible)}
                                    >
                                        {passwordVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className='text-red-500 text-xs mt-1'>{String(errors.password.message)}</p>
                                )}
                            </div>

                            <button
                                type='submit'
                                disabled={signupMutation.isPending}
                                className='w-full mt-4 text-lg cursor-pointer bg-black text-white py-2 rounded-lg'
                            >
                                {signupMutation.isPending ? "Signing up..." : "Signup"}
                            </button>

                            {serverError && (
                                <p className='text-red-500 text-sm text-center'>{serverError}</p>
                            )}

                        </form>
                    ) : (
                        <div>
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
                                        onClick={resentOtp}
                                    >
                                        Resend OTP
                                    </button>
                                ) : (
                                    `Resend OTP in ${timer} seconds`
                                )}
                            </p>
                            {verifyOtpMutation.isError && verifyOtpMutation.error instanceof AxiosError && (
                                <p className='text-red-500 text-sm mt-2'>{verifyOtpMutation.error.message || verifyOtpMutation.error.response?.data?.message}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}