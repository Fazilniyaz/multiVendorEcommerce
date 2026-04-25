import React, { useState, useEffect } from 'react';
import { X, WandSparkles, Pencil } from 'lucide-react';
import Image from 'next/image';

interface ImagePlaceholderProps {
    size: string;
    small?: boolean;
    onImageChange: (file: File | null, index: number) => void;
    onRemove?: (index: number) => void;
    defaultImage?: string | null;
    index?: number;
    setOpenImageModal?: (open: boolean) => void;
}

function ImagePlaceholder({
    size,
    small = false,
    onImageChange,
    onRemove,
    defaultImage = null,
    index = 0,
    setOpenImageModal,
}: ImagePlaceholderProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(defaultImage);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImagePreview(url);
            onImageChange(file, index);
        }
    };

    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const inputId = `image-upload-${index}`;

    return (
        <div
            onClick={() => document.getElementById(inputId)?.click()}
            className={`
                relative cursor-pointer bg-[#1a1a1a] border border-gray-700
                rounded-xl flex flex-col justify-center items-center
                overflow-hidden transition-colors hover:border-gray-500
                ${small ? "h-[100px] w-[100px]" : "w-full h-[420px]"}
            `}
        >
            {/* Hidden file input */}
            <input
                id={inputId}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                onClick={(e) => e.stopPropagation()}
            />

            {/* Top-right action buttons */}
            <div
                className="absolute top-2 right-2 flex gap-2 z-10"
                onClick={(e) => e.stopPropagation()}
            >
                {imagePreview ? (
                    <>
                        {/* AI enhance button */}
                        <button
                            type="button"
                            onClick={() => setOpenImageModal?.(true)}
                            className="p-1.5 rounded-md bg-blue-600 hover:bg-blue-500
                                shadow-lg transition-colors"
                        >
                            <WandSparkles size={14} />
                        </button>
                        {/* Remove button */}
                        <button
                            type="button"
                            onClick={() => {
                                setImagePreview(null);
                                onRemove?.(index);
                            }}
                            className="p-1.5 rounded-md bg-red-600 hover:bg-red-500
                                shadow-lg transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </>
                ) : (
                    /* Edit / upload button */
                    <label
                        htmlFor={inputId}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-md bg-gray-700 hover:bg-gray-600
                            shadow-lg cursor-pointer transition-colors"
                    >
                        <Pencil size={14} />
                    </label>
                )}
            </div>

            {/* Content */}
            {imagePreview ? (
                <Image
                    src={imagePreview}
                    alt="Product image"
                    fill
                    className="object-cover rounded-xl"
                />
            ) : (
                <div className="flex flex-col items-center gap-2 px-4 text-center pointer-events-none">
                    <p className={`text-gray-500 font-semibold
                        ${small ? "text-xs" : "text-3xl"}`}>
                        {size}
                    </p>
                    {!small && (
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Please choose an image<br />
                            according to the expected ratio
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default ImagePlaceholder;