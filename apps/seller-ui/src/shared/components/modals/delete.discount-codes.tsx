import { Loader, X } from 'lucide-react'
import React from 'react'

interface DeleteDiscountModalProps {
    discount: any
    onClose: () => void
    onConfirm: () => void
    isLoading?: boolean
}

const DeleteDiscountModal = ({
    discount,
    onClose,
    onConfirm,
    isLoading = false,
}: DeleteDiscountModalProps) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm
            flex items-center justify-center z-50 px-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl
                w-full max-w-[420px] shadow-2xl">

                {/* Header */}
                <div className="flex justify-between items-center
                    px-6 py-4 border-b border-gray-700">
                    <h3 className="text-base font-semibold text-white">
                        Delete Discount Code
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-md text-gray-400 hover:text-white
                            hover:bg-gray-700 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                    <p className="text-gray-300 text-sm leading-relaxed">
                        Are you sure you want to delete{" "}
                        <span className="text-blue-400 font-semibold">
                            {discount?.publicName}
                        </span>
                        ? This action{" "}
                        <span className="text-red-400 font-medium">
                            cannot be undone
                        </span>
                        .
                    </p>

                    {/* Code preview */}
                    <div className="mt-4 px-4 py-3 bg-gray-800 rounded-lg
                        border border-gray-700 flex items-center justify-between">
                        <span className="text-gray-400 text-xs">Discount code</span>
                        <code className="text-green-400 font-mono text-sm">
                            {discount?.discountCode}
                        </code>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 pb-5">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-600
                            text-gray-300 hover:text-white hover:bg-gray-700
                            rounded-md text-sm transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-2
                            px-4 py-2 bg-red-600 hover:bg-red-500
                            disabled:opacity-50 disabled:cursor-not-allowed
                            text-white rounded-md text-sm font-medium
                            transition-colors"
                    >
                        {isLoading
                            ? <Loader className="animate-spin" size={16} />
                            : "Delete"
                        }
                    </button>
                </div>

            </div>
        </div>
    )
}

export default DeleteDiscountModal