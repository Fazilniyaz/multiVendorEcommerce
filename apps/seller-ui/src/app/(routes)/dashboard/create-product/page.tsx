"use client";
import { ChevronRight } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import ImagePlaceholder from '../../../../shared/components/image-placeholder';
import Input from 'packages/components/input';
import ColorSelector from 'packages/components/color-selector';
import CustomSpecifications from 'packages/custom-specifications';
import CustomProperties from 'packages/components/custom-properties';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import RichTextEditor from 'packages/components/rich-text-editor';
import SizeSelector from 'packages/components/size-selector';
import Link from 'next/link';

const Page = () => {
    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm();

    const [openImageModal, setOpenImageModal] = useState(false);
    const [images, setImages] = useState<(File | null)[]>([null]);
    const [isChanged, setIsChanged] = useState(true);
    const [loading, setLoading] = useState(false);

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

    const handleSaveDraft = () => {

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

    const { data, isLoading, isError } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            try {
                const res = await axiosInstance.get("/product/api/get-categories");
                return res.data;
            } catch (error) {
                console.log(error);
            }
        },
        staleTime: 1000 * 60 * 5,
        retry: 2,
    });

    const categories = data?.categories || [];
    const subCategoriesData = data?.subCategories || {};
    const selectedCategory = watch("category");
    const regularPrice = watch("regular_price");

    const subCategories = useMemo(() => {
        return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
    }, [selectedCategory, subCategoriesData])

    // ── Reusable select class ──────────────────────────────
    const selectClass = `
        w-full border border-gray-700 rounded-md bg-transparent
        text-white text-sm px-3 py-2 outline-none
        focus:border-blue-500 transition-colors
        [&>option]:bg-[#1a1a1a] [&>option]:text-white
    `;

    // ── Reusable label class ───────────────────────────────
    const labelClass = "text-sm font-medium text-gray-300 mb-1 block";

    return (
        <div className="w-full min-h-screen bg-[#111] px-8 py-8 text-white">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-[1200px] mx-auto"
            >
                {/* ── Header ── */}
                <h2 className="text-2xl font-semibold mb-1">Create Product</h2>
                <div className='flex items-center text-white mb-8'>
                    <Link href="/dashboard" className='cursor-pointer'>Dashboard</Link>
                    <ChevronRight size={14} className="text-gray-500" />
                    <span className='text-white'>Create Product</span>
                </div>

                {/* ── Three Column Layout ── */}
                <div className="flex gap-6 w-full items-start">

                    {/* ══ COL 1 — Images (30%) ══ */}
                    <div className="w-[30%] flex-shrink-0 flex flex-col gap-3">

                        {/* Large primary image */}
                        <ImagePlaceholder
                            setOpenImageModal={setOpenImageModal}
                            small={false}
                            size="765 x 850"
                            index={0}
                            onImageChange={handleImageChange}
                            onRemove={handleRemoveImage}
                        />

                        {/* Thumbnails — only after first upload */}
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

                    {/* ══ COL 2 — Main form fields (35%) ══ */}
                    <div className="w-[35%] flex flex-col gap-4">

                        <Input
                            label="Product Title *"
                            placeholder="Enter product title"
                            {...register("title", {
                                required: "Product title is required",
                            })}
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
                                    const count = val
                                        .trim()
                                        .split(/\s+/)
                                        .filter(Boolean).length;
                                    return (
                                        count <= 150 ||
                                        `Max 150 words (${count} entered)`
                                    );
                                },
                            })}
                            error={errors.description?.message as string}
                        />

                        <Input
                            label="Tags *"
                            placeholder="apple, flagship"
                            {...register("tags", {
                                required: "Separate tags with commas",
                            })}
                            error={errors.tags?.message as string}
                        />

                        <Input
                            label="Warranty *"
                            placeholder="1 Year / 2 Year / No Warranty"
                            {...register("warranty", {
                                required: "Warranty information is required",
                            })}
                            error={errors.warranty?.message as string}
                        />

                        <Input
                            label="Slug *"
                            placeholder="product-slug"
                            {...register("slug", {
                                required: "Slug is required",
                                pattern: {
                                    value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                                    message:
                                        "Lowercase letters, numbers and hyphens only",
                                },
                                minLength: { value: 3, message: "Min 3 characters" },
                                maxLength: { value: 50, message: "Max 50 characters" },
                            })}
                            error={errors.slug?.message as string}
                        />

                        <Input
                            label="Brand *"
                            placeholder="Samsung"
                            {...register("brand", {
                                required: "Brand is required",
                            })}
                            error={errors.brand?.message as string}
                        />

                        <ColorSelector control={control} errors={errors} />

                        <CustomSpecifications control={control} errors={errors} />

                        <CustomProperties control={control} errors={errors} />

                        {/* Cash On Delivery */}
                        <div className="flex flex-col gap-1">
                            <label className={labelClass}>Cash On Delivery *</label>
                            <select
                                defaultValue=""
                                className={selectClass}
                                {...register("cash_on_delivery", {
                                    required: "Cash On Delivery is required",
                                })}
                            >
                                <option value="" disabled>
                                    Select Cash On Delivery
                                </option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                            {errors.cash_on_delivery && (
                                <span className="text-red-400 text-xs">
                                    {errors.cash_on_delivery.message as string}
                                </span>
                            )}
                        </div>

                    </div>

                    {/* ══ COL 3 — Category + extra fields (30%) ══ */}
                    <div className="w-[30%] flex flex-col gap-4">

                        {/* Category */}
                        <div className="flex flex-col gap-1">
                            <label className={labelClass}>Category *</label>
                            {isLoading ? (
                                <p className="text-gray-400 text-sm">
                                    Loading categories...
                                </p>
                            ) : isError ? (
                                <p className="text-red-400 text-sm">
                                    Error loading categories
                                </p>
                            ) : (
                                <Controller
                                    name="category"
                                    control={control}
                                    defaultValue=""
                                    rules={{
                                        required: "Please select a category",
                                    }}
                                    render={({ field }) => (
                                        <select className={selectClass} {...field}>
                                            <option value="" disabled>
                                                Select Category
                                            </option>
                                            {categories?.map((category: string) => (
                                                <option key={category} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                />
                            )}
                            {errors.category && (
                                <span className="text-red-400 text-xs">
                                    {errors.category.message as string}
                                </span>
                            )}
                        </div>

                        {/* Sub Category — only shows when category is selected */}

                        <div className="flex flex-col gap-1">
                            <label className={labelClass}>Sub Category *</label>
                            <Controller
                                name="sub_category"
                                control={control}
                                defaultValue=""
                                rules={{
                                    required: "Please select a sub category",
                                }}
                                render={({ field }) => (
                                    <select className={selectClass} {...field}>
                                        <option value="" disabled>
                                            Select Sub Category
                                        </option>
                                        {subCategories.map((subcategory: string) => (
                                            <option className='bg-primary' key={subcategory} value={subcategory}>
                                                {subcategory}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            />
                            {errors.sub_category && (
                                <span className="text-red-400 text-xs">
                                    {errors.sub_category.message as string}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className={labelClass}>Detailed Description * (Min 100 words)</label>
                            <Controller name="detailed_description" control={control}
                                rules={{
                                    required: "Detailed description is required!", validate: (value) => {
                                        const wordCount = value?.split(/\s+/).filter((word: string) => word).length;
                                        return wordCount >= 100 || "Detailed description must be at least 100 words"
                                    }
                                }}
                                render={({ field }) => (
                                    <RichTextEditor
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {errors.detailed_description && (
                                <span className="text-red-400 text-xs">
                                    {errors.detailed_description.message as string}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <Input label="Video URL"
                                placeholder="https://www.youtube.com/embed/xyz123"
                                {...register("video_url", {
                                    pattern: {
                                        value: /^https:\/\/(?:www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+$/,
                                        message: "Please enter a valid youtube embed url"
                                    }
                                })}

                            />
                            {errors.video_url && (
                                <span className="text-red-400 text-xs">
                                    {errors.video_url.message as string}
                                </span>
                            )}
                        </div>



                        {/* Regular Price */}
                        <Input
                            label="Regular Price *"
                            type="number"
                            placeholder="0.00"
                            {...register("regular_price", {
                                valueAsNumber: true,
                                required: "Regular price is required",
                                min: { value: 1, message: "Price cannot be zero or negative" },
                                validate: (val) => !isNaN(val) || "Only numbers are allowed"
                            })}
                            error={errors.regular_price?.message as string}
                        />

                        {/* Sale Price */}
                        <Input
                            label="Sale Price"
                            type="number"
                            placeholder="0.00"
                            {...register("sale_price", {
                                required: "Sale price is required",
                                valueAsNumber: true,
                                min: { value: 1, message: "Sale Price cannot be zero or negative" },
                                validate: (val) => {
                                    if (isNaN(val)) return "Only numbers are allowed"
                                    if (regularPrice && val >= regularPrice) return "Sale price cannot be greater than regular price"
                                    return true
                                },
                            })}
                            error={errors.sale_price?.message as string}
                        />

                        {/* Stock */}
                        <Input
                            label="Stock *"
                            type="number"
                            placeholder="100"
                            {...register("stock", {
                                valueAsNumber: true,
                                required: "Stock is required",
                                min: { value: 1, message: "Stock cannot be zero or negative" },
                                max: { value: 1000, message: "Stock cannot be greater than 1000" },
                                validate: (value) => {
                                    !isNaN(value) || "Only numbers are allowed"
                                    if (!Number.isInteger(value)) return "Stock must be an integer"
                                    return true
                                }
                            })}
                            error={errors.stock?.message as string}
                        />

                        <SizeSelector control={control} errors={errors} />

                        <div className="flex flex-col gap-1">
                            <label className={labelClass}>Select Discount Codes (optional)</label>

                        </div>

                        {/* Submit button */}
                        {/* <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full px-6 py-2.5 bg-blue-600 hover:bg-blue-500
                                    text-white text-sm font-medium rounded-md
                                    transition-colors duration-150"
                            >
                                Create Product
                            </button>
                        </div> */}

                    </div>

                </div>

                <div className='mt-6 flex justify-end gap-3'>
                    {isChanged && (
                        <button className='px-4 py-2 bg-gray-700 text-white rounded-mg' type='button' onClick={handleSaveDraft}>
                            Save Draft
                        </button>
                    )}

                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md"
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create"}
                    </button>
                </div>


            </form>
        </div>
    );
};

export default Page;