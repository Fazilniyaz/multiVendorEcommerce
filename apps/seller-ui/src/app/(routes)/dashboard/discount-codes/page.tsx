"use client"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import DeleteDiscountModal from 'apps/seller-ui/src/shared/components/modals/delete.discount-codes'
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance'
import { ChevronRight, Loader, Plus, Trash, X } from 'lucide-react'
import Link from 'next/link'
import Input from 'packages/components/input'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'

const Page = () => {

    const [showModal, setShowModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedDiscount, setSelectedDiscount] = useState<any>(null)
    const queryClient = useQueryClient()

    // ── Fetch all discount codes ──────────────────────────
    const { data: discountCodes = [], isLoading } = useQuery({
        queryKey: ["shop-discounts"],
        queryFn: async () => {
            const res = await axiosInstance.get("/product/api/get-all-discount-codes")
            return res?.data?.discountCodes || []
        },
        staleTime: 1000 * 60 * 5,
        retry: 2,
    })

    // ── Form ──────────────────────────────────────────────
    const {
        handleSubmit,
        control,
        register,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            publicName: "",
            discountType: "percentage",
            discountValue: "",
            discountCode: "",
        }
    })

    // ── Create mutation ───────────────────────────────────
    const createDiscountCodeMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await axiosInstance.post("/product/api/create-discount-code", data)
            return res.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shop-discounts"] })
            toast.success("Discount code created successfully")
            setShowModal(false)
            reset()
        },
        onError: () => {
            toast.error("Failed to create discount code")
        }
    })

    // ── Delete mutation ───────────────────────────────────
    const deleteDiscountMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await axiosInstance.delete(`/product/api/delete-discount-code/${id}`)
            return res.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shop-discounts"] })
            toast.success("Discount code deleted successfully")
            setShowDeleteModal(false)
            setSelectedDiscount(null)
        },
        onError: () => {
            toast.error("Failed to delete discount code")
        }
    })

    const onSubmit = (data: any) => {
        if (discountCodes.length >= 8) {
            toast.error("You can only have 8 discount codes at a time")
            return
        }
        createDiscountCodeMutation.mutate(data)
    }

    const handleDeleteClick = (discount: any) => {
        setSelectedDiscount(discount)
        setShowDeleteModal(true)
    }

    // ── Shared styles ─────────────────────────────────────
    const selectClass = `
        w-full border border-gray-700 rounded-md bg-transparent
        text-white text-sm px-3 py-2 outline-none
        focus:border-blue-500 transition-colors
        [&>option]:bg-[#1a1a1a] [&>option]:text-white
    `

    return (
        <div className="w-full min-h-screen bg-[#111] px-8 py-8 text-white">

            {/* ── Header ── */}
            <div className="flex justify-between items-center mb-1">
                <h2 className="text-2xl font-semibold">Discount Codes</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500
                        text-white text-sm font-medium px-4 py-2 rounded-lg
                        transition-colors duration-150"
                >
                    <Plus size={16} />
                    Create Discount
                </button>
            </div>

            {/* ── Breadcrumb ── */}
            <div className="flex items-center gap-1 text-sm mb-8">
                <Link
                    href="/dashboard"
                    className="text-[#80DEEA] hover:underline cursor-pointer"
                >
                    Dashboard
                </Link>
                <ChevronRight size={14} className="text-gray-500" />
                <span className="text-gray-400">Discount Codes</span>
            </div>

            {/* ── Table Card ── */}
            <div className="w-full bg-gray-900 border border-gray-800 rounded-xl shadow-lg overflow-hidden">

                {/* Card header */}
                <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-white">
                        Your Discount Codes
                    </h3>
                    <span className="text-xs text-gray-500">
                        {discountCodes.length} / 8 used
                    </span>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader className="animate-spin text-gray-500" size={24} />
                    </div>
                ) : discountCodes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-2">
                        <p className="text-gray-500 text-sm">
                            No discount codes yet
                        </p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="text-blue-500 hover:text-blue-400 text-sm
                                underline underline-offset-2 transition-colors"
                        >
                            Create your first one
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-800 bg-gray-800/50">
                                    <th className="px-6 py-3 text-left text-xs font-medium
                                        text-gray-400 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium
                                        text-gray-400 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium
                                        text-gray-400 uppercase tracking-wider">
                                        Value
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium
                                        text-gray-400 uppercase tracking-wider">
                                        Code
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium
                                        text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {discountCodes.map((discount: any) => (
                                    <tr
                                        key={discount?._id}
                                        className="hover:bg-gray-800/40 transition-colors duration-100"
                                    >
                                        <td className="px-6 py-4 text-white font-medium">
                                            {discount?.publicName}
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            {discount?.discountType === "percentage"
                                                ? "Percentage (%)"
                                                : "Flat (₹)"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5
                                                rounded-full text-xs font-medium
                                                bg-blue-900/40 text-blue-300 border border-blue-800">
                                                {discount?.discountType === "percentage"
                                                    ? `${discount?.discountValue}%`
                                                    : `₹${discount?.discountValue}`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="px-2 py-1 bg-gray-800 rounded text-xs
                                                text-green-400 font-mono border border-gray-700">
                                                {discount?.discountCode}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDeleteClick(discount)}
                                                className="p-1.5 rounded-md text-gray-400 hover:text-red-400
                                                    hover:bg-red-900/20 transition-colors duration-150"
                                                title="Delete discount"
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Create Discount Modal ── */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm
                    flex items-center justify-center z-50 px-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl
                        w-full max-w-[480px] shadow-2xl">

                        {/* Modal header */}
                        <div className="flex justify-between items-center
                            px-6 py-4 border-b border-gray-700">
                            <h3 className="text-base font-semibold text-white">
                                Create Discount Code
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-md text-gray-400 hover:text-white
                                    hover:bg-gray-700 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal body */}
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="px-6 py-5 flex flex-col gap-4"
                        >
                            {/* Title */}
                            <div className="flex flex-col gap-1">
                                <Input
                                    label="Title (Public Name)"
                                    placeholder="e.g. Summer Sale"
                                    {...register("publicName", {
                                        required: "Title is required",
                                    })}
                                />
                                {errors.publicName && (
                                    <span className="text-red-400 text-xs">
                                        {errors.publicName.message}
                                    </span>
                                )}
                            </div>

                            {/* Discount Type */}
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-300">
                                    Discount Type
                                </label>
                                <Controller
                                    control={control}
                                    name="discountType"
                                    render={({ field }) => (
                                        <select {...field} className={selectClass}>
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Flat (₹)</option>
                                        </select>
                                    )}
                                />
                            </div>

                            {/* Discount Value */}
                            <div className="flex flex-col gap-1">
                                <Input
                                    label="Discount Value"
                                    type="number"
                                    placeholder="e.g. 10"
                                    min={1}
                                    {...register("discountValue", {
                                        required: "Value is required",
                                        valueAsNumber: true,
                                    })}
                                />
                                {errors.discountValue && (
                                    <span className="text-red-400 text-xs">
                                        {errors.discountValue.message}
                                    </span>
                                )}
                            </div>

                            {/* Discount Code */}
                            <div className="flex flex-col gap-1">
                                <Input
                                    label="Discount Code"
                                    placeholder="e.g. SUMMER10 (leave empty to auto-generate)"
                                    {...register("discountCode", {
                                        required: "Discount code is required",
                                    })}
                                />
                                {errors.discountCode && (
                                    <span className="text-red-400 text-xs">
                                        {errors.discountCode.message}
                                    </span>
                                )}
                            </div>

                            {/* Modal footer */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); reset() }}
                                    className="flex-1 px-4 py-2 border border-gray-600
                                        text-gray-300 hover:text-white hover:bg-gray-700
                                        rounded-md text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || createDiscountCodeMutation.isPending}
                                    className="flex-1 flex items-center justify-center gap-2
                                        px-4 py-2 bg-blue-600 hover:bg-blue-500
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        text-white rounded-md text-sm font-medium
                                        transition-colors"
                                >
                                    {isSubmitting || createDiscountCodeMutation.isPending
                                        ? <Loader className="animate-spin" size={16} />
                                        : "Create Discount Code"
                                    }
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation Modal ── */}
            {showDeleteModal && selectedDiscount && (
                <DeleteDiscountModal
                    discount={selectedDiscount}
                    onClose={() => {
                        setShowDeleteModal(false)
                        setSelectedDiscount(null)
                    }}
                    onConfirm={() => deleteDiscountMutation.mutate(selectedDiscount?.id)}
                />
            )}

        </div>
    )
}

export default Page