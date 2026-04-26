"use client"
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import GoogleButton from '../../../shared/components/google-button'
import { Eye, EyeOff, ShoppingBag } from 'lucide-react'
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
        setTimer(60)
        setCanResend(false)
        // handle resend otp here
    }

    // ─── Shared: Google SSO + divider ────────────────────────────────────────────
    const formHeader = (
        <>
            <GoogleButton />
            <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-300" />
                <span className="text-xs text-gray-400 font-medium whitespace-nowrap">or continue with email</span>
                <div className="flex-1 h-px bg-gray-300" />
            </div>
        </>
    )

    // ─── Shared: Signup form ──────────────────────────────────────────────────────
    const signupForm = (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Email address</label>
                <input
                    type="email"
                    placeholder="you@example.com"
                    className={`w-full px-4 py-3 text-sm border rounded-xl outline-none transition-all bg-white
                        placeholder:text-gray-300
                        focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                        ${errors.email ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}`}
                    {...register("email", {
                        required: "Email is required",
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address"
                        }
                    })}
                />
                {errors.email && <p className="text-red-500 text-xs">{String(errors.email.message)}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Full name</label>
                <input
                    type="text"
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 text-sm border rounded-xl outline-none transition-all bg-white
                        placeholder:text-gray-300
                        focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                        ${errors.name ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}`}
                    {...register("name", { required: "Name is required" })}
                />
                {errors.name && <p className="text-red-500 text-xs">{String(errors.name.message)}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                    <input
                        type={passwordVisible ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        className={`w-full px-4 py-3 pr-11 text-sm border rounded-xl outline-none transition-all bg-white
                            placeholder:text-gray-300
                            focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                            ${errors.password ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}`}
                        {...register("password", {
                            required: "Password is required",
                            minLength: { value: 6, message: "Password must be at least 6 characters long" }
                        })}
                    />
                    <button
                        className="absolute inset-y-0 right-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        type="button"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                        aria-label={passwordVisible ? "Hide password" : "Show password"}
                    >
                        {passwordVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs">{String(errors.password.message)}</p>}
            </div>

            {serverError && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-2.5">
                    <p className="text-red-600 text-sm">{serverError}</p>
                </div>
            )}

            <button
                type="submit"
                disabled={signupMutation.isPending}
                className="w-full mt-1 bg-black text-white text-sm font-semibold py-3.5 rounded-xl
                    hover:bg-gray-800 active:scale-[0.98] transition-all duration-150
                    disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {signupMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Creating account...
                    </span>
                ) : "Create account"}
            </button>

            <p className="text-xs text-gray-400 text-center leading-relaxed">
                By signing up, you agree to our{" "}
                <Link href="/terms" className="underline underline-offset-2 hover:text-gray-600 transition-colors">Terms</Link>
                {" "}and{" "}
                <Link href="/privacy" className="underline underline-offset-2 hover:text-gray-600 transition-colors">Privacy Policy</Link>.
            </p>
        </form>
    )

    // ─── Shared: OTP screen ───────────────────────────────────────────────────────
    const otpScreen = (
        <div className="space-y-5 w-full">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full mb-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Check your email</h3>
                <p className="text-sm text-gray-400 mt-1">
                    We sent a 4-digit code to{" "}
                    <span className="font-medium text-gray-600">{userData?.email}</span>
                </p>
            </div>

            <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="w-14 h-14 text-center text-xl font-bold
                            border-2 border-gray-200 rounded-xl outline-none
                            focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                            transition-all bg-gray-50 focus:bg-white caret-transparent"
                        ref={(el) => { if (el) inputRef.current[index] = el }}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    />
                ))}
            </div>

            <button
                type="button"
                disabled={verifyOtpMutation.isPending}
                onClick={() => verifyOtpMutation.mutate()}
                className="w-full bg-blue-600 text-white text-sm font-semibold py-3.5 rounded-xl
                    hover:bg-blue-700 active:scale-[0.98] transition-all duration-150
                    disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {verifyOtpMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Verifying...
                    </span>
                ) : "Verify & continue"}
            </button>

            <p className="text-center text-sm text-gray-400">
                {canResend ? (
                    <button
                        type="button"
                        className="text-blue-600 font-medium hover:underline underline-offset-2 cursor-pointer"
                        onClick={resentOtp}
                    >
                        Resend code
                    </button>
                ) : (
                    <span>Resend code in <span className="font-medium text-gray-600 tabular-nums">{timer}s</span></span>
                )}
            </p>

            {verifyOtpMutation.isError && verifyOtpMutation.error instanceof AxiosError && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-2.5">
                    <p className="text-red-600 text-sm">
                        {verifyOtpMutation.error.message || verifyOtpMutation.error.response?.data?.message}
                    </p>
                </div>
            )}
        </div>
    )

    return (
        <>
            {/* ════════════════════════════════════════════════════
                MOBILE  (hidden on md+)
                Full-screen white, no header/footer chrome.
                Brand mark at top, then form fills the rest.
            ════════════════════════════════════════════════════ */}
            <div className="flex md:hidden flex-col min-h-screen bg-white">

                {/* Brand mark */}
                <div className="px-6 pt-10 pb-6 flex items-center gap-2 text-black font-bold text-lg tracking-tight font-Poppins">
                    <ShoppingBag size={20} />
                    <span>Eshop</span>
                </div>

                {/* Form area — scrollable if content overflows */}
                <div className="flex-1 overflow-y-auto px-6 pb-10">
                    <div className="mb-7">
                        <h1 className="text-2xl font-semibold text-gray-900 font-Poppins tracking-tight">
                            {showOtp ? "Verify your email" : "Create account"}
                        </h1>
                        {!showOtp && (
                            <p className="text-sm text-gray-400 mt-1.5">
                                Already have an account?{" "}
                                <Link href="/login" className="text-blue-600 font-medium underline-offset-2 hover:underline">
                                    Log in
                                </Link>
                            </p>
                        )}
                    </div>

                    {!showOtp && formHeader}
                    {showOtp ? otpScreen : signupForm}
                </div>
            </div>

            {/* ════════════════════════════════════════════════════
                DESKTOP  (hidden below md)
                Gray background page with top navbar, centered card.
            ════════════════════════════════════════════════════ */}
            <div className="hidden md:flex flex-col min-h-screen bg-[#f4f4f5]">

                {/* Navbar */}
                <div className="w-full bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-black font-bold text-lg tracking-tight font-Poppins">
                        <ShoppingBag size={20} />
                        <span>Eshop</span>
                    </div>
                    <nav className="flex items-center gap-1 text-sm text-gray-400">
                        <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
                        <span className="mx-1">·</span>
                        <span className="text-gray-800 font-medium">Signup</span>
                    </nav>
                </div>

                {/* Centered card */}
                <div className="flex-1 flex items-center justify-center px-6 py-14">
                    <div className="w-full max-w-[440px]">
                        <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                            {/* Card header */}
                            <div className="px-8 pt-8 pb-6 border-b border-gray-50">
                                <h1 className="text-3xl font-semibold text-gray-900 font-Poppins tracking-tight">
                                    {showOtp ? "Verify your email" : "Create account"}
                                </h1>
                                {!showOtp && (
                                    <p className="text-sm text-gray-400 mt-1.5">
                                        Already have an account?{" "}
                                        <Link href="/login" className="text-blue-600 font-medium hover:underline underline-offset-2">
                                            Log in
                                        </Link>
                                    </p>
                                )}
                            </div>

                            {/* Card body */}
                            <div className="px-8 py-7">
                                {!showOtp && formHeader}
                                {showOtp ? otpScreen : signupForm}
                            </div>
                        </div>

                        <p className="text-center text-xs text-gray-400 mt-5">
                            © {new Date().getFullYear()} Eshop. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}