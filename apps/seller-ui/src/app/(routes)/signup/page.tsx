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

// type FormData = {
//     email: string,
//     password: string,
//     name: string,
//     phone: string,
// }

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
            console.log(formData)
            console.log(otp.join(""))
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
            if (!sellerData) return;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-seller`, { ...sellerData, otp: otp.join("") })
            return response.data
        },
        onSuccess: (response: any) => {
            // router.push("/login")
            setShowOtp(false)
            setActiveStep(2)
            // setCanResend(false)
            // setTimer(60)
            // startResetTimer()
            setSellerId(response.data?.seller?.id)
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

    const connectStripe = async () => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-stripe-link`, { sellerId })
            console.log(response.data)
            if (response.data.url) {
                window.location.href = response.data.url
            }
        } catch (error) {
            console.error("Stripe Connection Error: ", error)
        }
    }

    return (
        <div className='w-full flex flex-col items-center pt-10 min-h-screen'>
            {/* Stepper */}
            <div className='relative flex items-center justify-between md:w-[50%] mb-8'>
                <div className='absolute top-[25%] left-0 w-[80%] md:w-[90%] h-1 bg-gray-300 -z-10' />
                {[1, 2, 3].map((step) => (
                    <div key={step}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${step <= activeStep ? "bg-blue-600" : "bg-gray-300"}`}>
                            {step}
                        </div>
                        <span className='ml-[-15px]'>
                            {step === 1 ? "Create Account" : step === 2 ? "Setup Shop" : step === 3 ? "Connect Bank" : ""}
                        </span>
                    </div>
                ))}

            </div>

            {/* Steps content */}
            <div className='md:w-[480px] p-8 bg-white shadow rounded-lg'>
                {activeStep === 1 && (
                    <>
                        {!showOtp ? (
                            <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
                                <h3 className='text-2xl font-semibold text-center mb-4'>Create Account</h3>

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
                                    <label className='text-gray-800 text-sm font-medium'>Phone Number</label>
                                    <input
                                        type="tel"
                                        placeholder='your phone number'
                                        className='w-full p-2 border border-gray-300 outline-none rounded'
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
                                    <label className='text-gray-800 text-sm font-medium'>Country</label>
                                    <select
                                        className='w-full p-2 border border-gray-300 outline-none rounded'
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

                                {signupMutation.isError && signupMutation.error instanceof AxiosError && (
                                    <p className='text-red-500 text-sm text-center'>{signupMutation.error?.response?.data?.message || signupMutation.error?.message}</p>
                                )}

                                <p className='text-center text-sm mt-4'>
                                    Already have an account?{" "}
                                    <Link href="/login" className='text-blue-500 hover:underline cursor-pointer'>
                                        Login
                                    </Link>
                                </p>

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


                    </>
                )}
                {activeStep === 2 && (
                    <CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />
                )}
                {activeStep === 3 && (
                    <div className='text-center'>
                        <h3 className='text-2xl font-semibold text-center mb-4'>Withdraw Method</h3>
                        <br />
                        <p className='text-gray-600 mb-6'>Connect your bank account to receive payments</p>
                        <button
                            type='button'
                            onClick={connectStripe}
                            className='w-full m-auto flex items-center justify-center gap-3 text-lg cursor-pointer bg-[#334155] text-white py-2 rounded-lg'
                        >
                            Connect Stripe <StripeLogo width={100} />
                        </button>
                    </div>
                )}
            </div>



        </div>
    )
}