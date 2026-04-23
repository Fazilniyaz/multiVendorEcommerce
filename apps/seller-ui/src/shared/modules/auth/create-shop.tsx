import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import React from "react";
import { useForm } from "react-hook-form";
import { shopCategories } from "../../../utils/categories";

export default function CreateShop({ sellerId, setActiveStep }: { sellerId: string, setActiveStep: (step: number) => void }) {

    const { register, handleSubmit, formState: { errors } } = useForm()

    const shopCreateMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-shop`, data, { withCredentials: true })
            return response.data
        },
        onSuccess: (data) => {
            setActiveStep(3)
            // setServerError(null)
            // router.push("/")
        },
        // onError: (error: AxiosError) => {
        //     setServerError((error.response?.data as { message?: string })?.message || "Invalid Credentials!")
        // }
    })

    const onSubmit = (data: any) => {
        const shopData = {
            ...data,
            sellerId
        }
        shopCreateMutation.mutate(shopData)
    }

    const countWords = (text: string) => {
        return text.trim().split(/\s+/).length
    }

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <h3 className='text-2xl font-semibold text-center mb-4'>Setup your Shop</h3>

                <div className='flex flex-col gap-1'>
                    <label className='text-gray-800 text-sm font-medium'>Shop Name</label>
                    <input
                        type="text"
                        placeholder='Shop Name'
                        className='w-full p-2 border border-gray-300 outline-none '
                        {...register("name", {
                            required: "Shop Name is required",
                        })}
                    />
                    {errors.name && (
                        <p className='text-red-500 text-sm'>{errors.name.message as string}</p>
                    )}
                </div>

                {/* <div className='flex flex-col gap-1'>
                    <label className='text-gray-800 text-sm font-medium'>Shop Description</label>
                    <input
                        type="text"
                        placeholder='Shop Description'
                        className='w-full p-2 border border-gray-300 outline-none rounded'
                        {...register("shopDescription", {
                            required: "Shop Description is required",
                        })}
                    />
                    {errors.shopDescription && (
                        <p className='text-red-500 text-sm'>{errors.shopDescription.message as string}</p>
                    )}
                </div> */}

                {/* Bio */}
                <div className='flex flex-col gap-1'>
                    <label className='text-gray-800 text-sm font-medium'>Bio (Max 100 words)</label>
                    <textarea
                        placeholder='shop bio'
                        className='w-full p-2 border border-gray-300 outline-none '
                        {...register("bio", {
                            required: "Bio is required",
                            validate: (value) =>
                                countWords(value) <= 100 || "Bio must be less than 100 words"

                        })}
                    />
                    {errors.bio && (
                        <p className='text-red-500 text-sm'>{errors.bio.message as string}</p>
                    )}
                </div>

                {/* Address */}
                <div className='flex flex-col gap-1'>
                    <label className='text-gray-800 text-sm font-medium'>Address</label>
                    <input
                        type="text"
                        placeholder='shop location'
                        className='w-full p-2 border border-gray-300 outline-none '
                        {...register("address", {
                            required: "Address is required",
                        })}
                    />
                    {errors.address && (
                        <p className='text-red-500 text-sm'>{errors.address.message as string}</p>
                    )}
                </div>

                {/* Opening hours */}
                <div className='flex flex-col gap-1'>
                    <label className='text-gray-800 text-sm font-medium'>Opening Hours</label>
                    <input
                        type="text"
                        placeholder='Mon - Sun (10 AM - 6 PM)'
                        className='w-full p-2 border border-gray-300 outline-none '
                        {...register("opening_hours", {
                            required: "Opening Hours is required",
                        })}
                    />
                    {errors.openingHours && (
                        <p className='text-red-500 text-sm'>{errors.openingHours.message as string}</p>
                    )}
                </div>

                {/* Website */}
                <div className='flex flex-col gap-1'>
                    <label className='text-gray-800 text-sm font-medium'>Website</label>
                    <input
                        type="text"
                        placeholder='www.yourshopdomain.com'
                        className='w-full p-2 border border-gray-300 outline-none '
                        {...register("website", {
                            required: "Website is required",
                            pattern: {
                                value: /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/,
                                message: "Invalid website URL"
                            }
                        })}
                    />
                    {errors.website && (
                        <p className='text-red-500 text-sm'>{errors.website.message as string}</p>
                    )}
                </div>

                {/* Shop category */}
                <div className='flex flex-col gap-1'>
                    <label className='text-gray-800 text-sm font-medium'>Shop Category</label>
                    <select
                        className='w-full p-2 border border-gray-300 outline-none '
                        {...register("category", {
                            required: "Shop Category is required",
                        })}
                    >
                        <option value="">Select Category</option>
                        {shopCategories.map((category) => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>
                    {errors.category && (
                        <p className='text-red-500 text-sm'>{errors.category.message as string}</p>
                    )}
                </div>

                <button
                    type="submit"
                    className='w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors'
                >
                    Create Shop
                </button>
            </form>
        </div>
    )
}