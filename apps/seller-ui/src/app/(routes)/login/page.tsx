"use client"
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import axios, { AxiosError } from 'axios'

type FormData = {
    email: string,
    password: string,
}

export default function Login() {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

    const [passwordVisible, setPasswordVisible] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)

    const onSubmit = (data: FormData) => {
        loginMutation.mutate(data)
    }

    const router = useRouter()

    const loginMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/login-seller`, data, { withCredentials: true })
            return response.data
        },
        onSuccess: (data) => {
            setServerError(null)
            router.push("/dashboard")
        },
        onError: (error: AxiosError) => {
            setServerError((error.response?.data as { message?: string })?.message || "Invalid Credentials!")
        }
    })

    return (
        <div className='w-full py-10 min-h-screen bg-[#f1f1f1]'>
            <h1 className='text-4xl font-Poppins font-semibold text-black text-center mb-2'>
                Login
            </h1>
            <p className='text-center text-lg font-medium py-3 text-[#00000099]'>Home . Login</p>

            <div className='w-full flex items-center justify-center mt-6'>
                <div className='w-full md:w-[480px] p-8 bg-white shadow rounded-lg'>
                    <h3 className='text-3xl font-semibold text-center mb-2'>
                        Login to Eshop
                    </h3>
                    <p className='text-center text-gray-500 mb-6'>
                        Don't have an account?{" "}
                        <Link href="/signup" className='text-blue-500'>Sign Up</Link>
                    </p>


                    <div className="flex items-center my-5 text-gray-400 text-sm">
                        <div className="flex-1 border-t border-gray-300" />
                        <span className="px-4">Or Sign in with Email</span>
                        <div className="flex-1 border-t border-gray-300" />
                    </div>

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

                        <div className='flex items-center justify-between'>
                            <label className='flex items-center gap-2 text-gray-700 text-sm'>
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                Remember me
                            </label>
                            <Link href="/forgot-password" className='text-blue-500 text-sm'>Forgot password?</Link>
                        </div>

                        <button
                            type='submit'
                            disabled={loginMutation.isPending}
                            className='w-full text-lg cursor-pointer bg-black text-white py-2 rounded-lg'
                        >
                            {loginMutation.isPending ? "Logging in..." : "Login"}
                        </button>

                        {serverError && (
                            <p className='text-red-500 text-sm text-center'>{serverError}</p>
                        )}

                    </form>
                </div>
            </div>
        </div>
    )
}