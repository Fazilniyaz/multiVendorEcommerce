"use client";
import { ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import ImagePlaceholder from '../../../../shared/components/image-placeholder';
import Input from 'packages/components/input';
import ColorSelector from 'packages/components/color-selector';
import CustomSpecifications from 'packages/custom-specifications';
import CustomProperties from 'packages/components/custom-properties';

const Page = () => {
    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm();

    const [openImageModal, setOpenImageModal] = useState(false);
    const [images, setImages] = useState<(File | null)[]>([null]);

    const onSubmit = (data: any) => console.log(data);

    const handleImageChange = (file: File | null, index: number) => {
        const updated = [...images];
        updated[index] = file;
        if (index === images.length - 1 && images.length < 8) {
            updated.push(null);
        }
        setImages(updated);
        setValue("images", updated);
    };

    const handleRemoveImage = (index: number) => {
        setImages((prev) => {
            let updated = [...prev];
            if (index === -1) {
                updated = [null];
            } else {
                updated.splice(index, 1);
            }
            if (!updated.includes(null) && updated.length < 8) {
                updated.push(null);
            }
            return updated;
        });
    };

    return (
        <div className="w-full min-h-screen bg-[#111] px-8 py-8 pr-20 text-white">
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[1100px] mx-auto">

        {/* Header */}
        <h2 className="text-2xl font-semibold mb-1">Create Product</h2>
        <div className="flex items-center gap-1 text-sm mb-8">
            <span className="text-[#80DEEA] cursor-pointer hover:underline">Dashboard</span>
            <ChevronRight size={14} className="text-gray-500" />
            <span className="text-gray-400">Create Products</span>
        </div>

        {/* Two Column Layout */}
        <div className="flex gap-10 w-full">

            {/* LEFT — 38% */}
            <div className="w-1/3 flex-shrink-0 flex flex-col gap-3">
                <ImagePlaceholder
                    setOpenImageModal={setOpenImageModal}
                    small={false}
                    size="765 x 850"
                    index={0}
                    onImageChange={handleImageChange}
                    onRemove={handleRemoveImage}
                />
                {images.length > 1 && (
                    <div className="flex flex-wrap gap-2">
                        {images.slice(1).map((_, i) => (
                            <ImagePlaceholder
                                key={i}
                                setOpenImageModal={setOpenImageModal}
                                small={true}
                                size="765x850"
                                index={i + 1}
                                onImageChange={handleImageChange}
                                onRemove={handleRemoveImage}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* RIGHT — 58% — NOT flex-1, fixed width so right gap exists */}
            <div className="w-1/2.5 flex flex-col gap-4">
                <Input
                    label="Product Title *"
                    placeholder="Enter product title"
                    {...register("title", { required: "Product title is required" })}
                    error={errors.title?.message as string}
                />
                <Input
                    type="textarea"
                    rows={6}
                    label="Short Description * (Max 150 words)"
                    placeholder="Enter product description for quick view"
                    {...register("description", {
                        required: "Description is required",
                        validate: (val) => {
                            const count = val.trim().split(/\s+/).filter(Boolean).length;
                            return count <= 150 || `Max 150 words (${count} entered)`;
                        },
                    })}
                    error={errors.description?.message as string}
                />
                <Input
                    label="Tags *"
                    placeholder="apple, flagship"
                    {...register("tags", { required: "Separate tags with commas" })}
                    error={errors.tags?.message as string}
                />
                <Input
                    label="Warranty *"
                    placeholder="1 Year / 2 Year / No Warranty"
                    {...register("warranty", { required: "Warranty information is required" })}
                    error={errors.warranty?.message as string}
                />
                <Input
                    label="Slug *"
                    placeholder="product-slug"
                    {...register("slug", {
                        required: "Slug is required",
                        pattern: {
                            value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                            message: "Lowercase letters, numbers and hyphens only",
                        },
                        minLength: { value: 3, message: "Min 3 characters" },
                        maxLength: { value: 50, message: "Max 50 characters" },
                    })}
                    error={errors.slug?.message as string}
                />
                <Input
                    label="Brand *"
                    placeholder="Samsung"
                    {...register("brand", { required: "Brand is required" })}
                    error={errors.brand?.message as string}
                />
                <ColorSelector control={control} errors={errors} />

                <CustomSpecifications control={control} errors={errors} />

                <CustomProperties control={control} errors={errors} />

                {/* Cash On Delivery */}
                <div className='mt-2'>
                    <label className='block font-semibold text-gray-300 mb-1'>
                        Cash On Delivery*
                    </label>
                    <select 
                        className='w-full border border-gray-700 rounded-md bg-[#222] text-white'
                        {...register("cash_on_delivery", { required: "Cash On Delivery is required" })}
                    >
                        <option value="" disabled selected>Select Cash On Delivery</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                    {errors.cash_on_delivery && <p className='text-red-500 text-sm mt-1'>{errors.cash_on_delivery.message as string}</p>}
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500
                            text-white text-sm font-medium rounded-md transition-colors"
                    >
                        Create Product
                    </button>
                </div>
            </div>

            <div className="w-1/2.5 flex flex-col gap-4">
            <label className="block font-semibold text-gray-300 mb-1">Category *</label>
            </div>

        </div>
    </form>
</div>
    );
};

export default Page;