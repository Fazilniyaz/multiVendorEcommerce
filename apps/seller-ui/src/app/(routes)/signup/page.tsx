"use client"
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import axios, { AxiosError } from 'axios'
import { useMutation } from '@tanstack/react-query'
import { countries } from 'apps/seller-ui/src/utils/countries'
import CreateShop from 'apps/seller-ui/src/shared/modules/auth/create-shop'
import StripeLogo from 'apps/seller-ui/src/assets/svgs/stripe-logo'

export default function Signup() {
    const { register, handleSubmit, formState: { errors } } = useForm()

    const [passwordVisible, setPasswordVisible] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)
    const [canResend, setCanResend] = useState(false)
    const [otp, setOtp] = useState<string[]>(["", "", "", ""])
    const [timer, setTimer] = useState(60)
    const [showOtp, setShowOtp] = useState(false)
    const [sellerData, setSellerData] = useState<FormData | null>(null)
    const inputRef = useRef<(HTMLInputElement | null)[]>([])
    const [sellerId, setSellerId] = useState("")
    const [activeStep, setActiveStep] = useState(1)

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
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/seller-registration`, data)
            return response.data
        },
        onSuccess: (_, formData) => {
            setSellerData(formData)
            setShowOtp(true)
            setCanResend(false)
            setTimer(60)
            startResetTimer()
        },
        onError: (error) => {
            setServerError(error.message)
        }
    })

    const onSubmit = (data: any) => {
        signupMutation.mutate(data)
    }

    const handleOtpChange = (index: number, value: string) => {
        if (!/^[0-9]$/.test(value)) return
        const newOtp = [...otp]
        newOtp[index] = value
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
            if (!sellerData) return;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-seller`, { ...sellerData, otp: otp.join("") })
            return response.data
        },
        onSuccess: (response: any) => {
            setShowOtp(false)
            setActiveStep(2)
            setSellerId(response.data?.seller?.id)
        },
        onError: (error) => {
            setServerError(error.message)
        }
    })

    const resentOtp = () => {
        setTimer(60)
        setCanResend(false)
    }

    const connectStripe = async () => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-stripe-link`, { sellerId })
            if (response.data.url) {
                window.location.href = response.data.url
            }
        } catch (error) {
            console.error("Stripe Connection Error: ", error)
        }
    }

    const steps = [
        { number: 1, label: "Create Account" },
        { number: 2, label: "Setup Shop" },
        { number: 3, label: "Connect Bank" },
    ]

    return (
        <div className='w-full flex flex-col items-center pt-10 min-h-screen bg-white'>

            {/* Stepper */}
            <div className='w-full max-w-lg px-6 mb-10'>
                <div className='flex items-start justify-between relative'>
                    {/* Connector line behind the circles */}
                    <div className='absolute top-5 left-0 right-0 flex items-center px-5'>
                        <div className='w-full h-[2px] bg-gray-200'>
                            <div
                                className='h-full bg-blue-600 transition-all duration-500'
                                style={{ width: activeStep === 1 ? '0%' : activeStep === 2 ? '50%' : '100%' }}
                            />
                        </div>
                    </div>

                    {steps.map((step) => (
                        <div key={step.number} className='flex flex-col items-center z-10 flex-1'>
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                                    step.number <= activeStep
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-400'
                                }`}
                            >
                                {step.number}
                            </div>
                            <span
                                className={`mt-2 text-xs font-medium text-center whitespace-nowrap transition-colors duration-300 ${
                                    step.number <= activeStep ? 'text-blue-600' : 'text-gray-400'
                                }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Card */}
            <div className='w-full max-w-md px-4'>
                <div className='bg-white border border-gray-200 shadow-sm rounded-xl p-8'>

                    {/* Step 1 */}
                    {activeStep === 1 && (
                        <>
                            {!showOtp ? (
                                <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
                                    <h3 className='text-2xl font-semibold text-center text-gray-900 mb-4'>Create Account</h3>

                                    <div className='flex flex-col gap-1'>
                                        <label className='text-gray-700 text-sm font-medium'>Email</label>
                                        <input
                                            type="email"
                                            placeholder='yourmail@gmail.com'
                                            className='w-full p-2.5 border border-gray-300 outline-none rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition'
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
                                        <label className='text-gray-700 text-sm font-medium'>Name</label>
                                        <input
                                            type="text"
                                            placeholder='Your name'
                                            className='w-full p-2.5 border border-gray-300 outline-none rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition'
                                            {...register("name", {
                                                required: "Name is required",
                                            })}
                                        />
                                        {errors.name && (
                                            <p className='text-red-500 text-xs mt-1'>{String(errors.name.message)}</p>
                                        )}
                                    </div>

                                    <div className='flex flex-col gap-1'>
                                        <label className='text-gray-700 text-sm font-medium'>Phone Number</label>
                                        <input
                                            type="tel"
                                            placeholder='Your phone number'
                                            className='w-full p-2.5 border border-gray-300 outline-none rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition'
                                            {...register("phone_number", {
                                                required: "Phone number is required",
                                                pattern: {
                                                    value: /^[0-9]{10}$/,
                                                    message: "Invalid phone number"
                                                },
                                                minLength: {
                                                    value: 10,
                                                    message: "Phone number must be at least 10 digits"
                                                },
                                                maxLength: {
                                                    value: 15,
                                                    message: "Phone number must be at most 15 digits"
                                                }
                                            })}
                                        />
                                        {errors.phone && (
                                            <p className='text-red-500 text-xs mt-1'>{String(errors.phone.message)}</p>
                                        )}
                                    </div>

                                    <div className='flex flex-col gap-1'>
                                        <label className='text-gray-700 text-sm font-medium'>Country</label>
                                        <select
                                            className='w-full p-2.5 border border-gray-300 outline-none rounded-lg text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition'
                                            {...register("country", {
                                                required: "Country is required",
                                            })}
                                        >
                                            <option value="">Select Your Country</option>
                                            {countries.map((country) => (
                                                <option key={country.code} value={country.name}>
                                                    {country.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.country && (
                                            <p className='text-red-500 text-xs mt-1'>{String(errors.country.message)}</p>
                                        )}
                                    </div>

                                    <div className='flex flex-col gap-1'>
                                        <label className='text-gray-700 text-sm font-medium'>Password</label>
                                        <div className='relative'>
                                            <input
                                                type={passwordVisible ? "text" : "password"}
                                                placeholder='Min. 6 characters'
                                                className='w-full p-2.5 border border-gray-300 outline-none rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition pr-10'
                                                {...register("password", {
                                                    required: "Password is required",
                                                    minLength: {
                                                        value: 6,
                                                        message: "Password must be at least 6 characters long"
                                                    }
                                                })}
                                            />
                                            <button
                                                className='absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600'
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
                                        className='w-full mt-2 text-base font-medium cursor-pointer bg-black text-white py-2.5 rounded-lg hover:bg-gray-800 transition disabled:opacity-60'
                                    >
                                        {signupMutation.isPending ? "Signing up..." : "Signup"}
                                    </button>

                                    {serverError && (
                                        <p className='text-red-500 text-sm text-center'>{serverError}</p>
                                    )}

                                    {signupMutation.isError && signupMutation.error instanceof AxiosError && (
                                        <p className='text-red-500 text-sm text-center'>
                                            {signupMutation.error?.response?.data?.message || signupMutation.error?.message}
                                        </p>
                                    )}

                                    <p className='text-center text-sm mt-2 text-gray-600'>
                                        Already have an account?{" "}
                                        <Link href="/login" className='text-blue-600 hover:underline font-medium'>
                                            Login
                                        </Link>
                                    </p>
                                </form>
                            ) : (
                                <div>
                                    <h3 className='text-xl font-semibold text-center text-gray-900 mb-2'>Verify your email</h3>
                                    <p className='text-sm text-gray-500 text-center mb-6'>Enter the 4-digit code sent to your email</p>

                                    <div className='flex justify-center gap-4 mb-6'>
                                        {otp?.map((digit, index) => (
                                            <input
                                                key={index}
                                                type="text"
                                                maxLength={1}
                                                className='w-13 h-13 text-center text-lg font-semibold border-2 border-gray-300 outline-none rounded-lg focus:border-blue-500 transition'
                                                style={{ width: '52px', height: '52px' }}
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
                                        className='w-full text-base font-medium cursor-pointer bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-60'
                                    >
                                        {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
                                    </button>

                                    <p className='text-center text-sm mt-4 text-gray-500'>
                                        {canResend ? (
                                            <button
                                                type='button'
                                                className='text-blue-600 hover:underline font-medium'
                                                onClick={resentOtp}
                                            >
                                                Resend OTP
                                            </button>
                                        ) : (
                                            `Resend OTP in ${timer}s`
                                        )}
                                    </p>

                                    {verifyOtpMutation.isError && verifyOtpMutation.error instanceof AxiosError && (
                                        <p className='text-red-500 text-sm mt-2 text-center'>
                                            {verifyOtpMutation.error.response?.data?.message || verifyOtpMutation.error.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* Step 2 */}
                    {activeStep === 2 && (
                        <CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />
                    )}

                    {/* Step 3 */}
                    {activeStep === 3 && (
                        <div className='text-center'>
                            <h3 className='text-2xl font-semibold text-gray-900 mb-2'>Withdraw Method</h3>
                            <p className='text-gray-500 text-sm mb-8'>Connect your bank account to receive payments</p>
                            <button
                                type='button'
                                onClick={connectStripe}
                                className='w-full flex items-center justify-center gap-3 text-base font-medium cursor-pointer bg-[#334155] text-white py-3 rounded-lg hover:bg-[#1e293b] transition'
                            >
                                Connect Stripe <StripeLogo width={100} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}