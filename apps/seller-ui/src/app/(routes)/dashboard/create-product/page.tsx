"use client";
import { ChevronRight, Wand, X } from "lucide-react";
import React, { useMemo, useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import ImagePlaceholder from "../../../../shared/components/image-placeholder";
import Input from "packages/components/input";
import ColorSelector from "packages/components/color-selector";
import CustomSpecifications from "packages/custom-specifications";
import CustomProperties from "packages/components/custom-properties";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(
  () => import("packages/components/rich-text-editor"),
  { ssr: false },
);
import SizeSelector from "packages/components/size-selector";
import Link from "next/link";
import Image from "next/image";
import { enhancements } from "apps/seller-ui/src/utils/aiEnhancements";

interface UploadedImage {
  fileId: string;
  file_url: string;
}

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
  const [images, setImages] = useState<(UploadedImage | null)[]>([]);
  const [isChanged, setIsChanged] = useState(true);
  const [loading, setLoading] = useState(false);
  const [pictureUploadLoader, setPictureUploadLoader] = useState(false);
  const [selectedImage, setSelectedImage] = useState('')
  const [activeEffect, setActiveEffect] = useState('')

  const onSubmit = (data: any) => console.log(data);

  // Keep react-hook-form in sync with the images state
  useEffect(() => {
    setValue("images", images.filter(Boolean));
  }, [images, setValue]);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return;
    setPictureUploadLoader(true);

    // Immediately reserve slots so the next thumbnail placeholder appears right away
    setImages((prev) => {
      const updated = [...prev];
      // Fill up to current index if needed
      while (updated.length <= index) updated.push(null);
      // Always ensure there's one more slot after this index for the next upload
      if (updated.length <= index + 1 && updated.length < 8) {
        updated.push(null);
      }
      return updated;
    });

    try {
      const fileName = await convertFileToBase64(file);
      const response = await axiosInstance.post(
        "/product/api/upload-product-image",
        { fileName },
      );

      const uploadedImage: UploadedImage = {
        fileId: response.data.fileId,
        file_url: response.data.file_url,
      };

      setImages((prev) => {
        const updated = [...prev];
        updated[index] = uploadedImage;
        // Ensure there's always one null slot available for the next image
        if (!updated.includes(null) && updated.length < 8) {
          updated.push(null);
        }
        return updated;
      });

    } catch (error) {
      console.log(error);
      // Revert the slot back to null on failure
      setImages((prev) => {
        const updated = [...prev];
        updated[index] = null;
        return updated;
      });
    } finally {
      setPictureUploadLoader(false);
    }
  };

  const handleSaveDraft = () => { };

  const handleRemoveImage = async (index: number) => {
    console.log("Coming");
    try {
      const updatedImages = [...images];

      const imageToDelete = updatedImages[index];

      console.log(imageToDelete);

      if (imageToDelete && imageToDelete.fileId) {
        await axiosInstance.delete("/product/api/delete-product-image", {
          data: { fileId: imageToDelete.fileId },
        });
      }

      updatedImages.splice(index, 1);
      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }
      setImages(updatedImages);
      setValue("images", updatedImages);
    } catch (error) {
      console.log(error);
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/product/api/get-categories");
        return res.data;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const { data: discountCodes = [], isLoading: discountLoading } = useQuery({
    queryKey: ["shop-discounts"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-all-discount-codes",
      );
      return res?.data?.discountCodes || [];
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
  }, [selectedCategory, subCategoriesData]);

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
        <div className="flex items-center text-white mb-8">
          <Link href="/dashboard" className="cursor-pointer">
            Dashboard
          </Link>
          <ChevronRight size={14} className="text-gray-500" />
          <span className="text-white">Create Product</span>
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
              pictureUploadLoader={pictureUploadLoader}
              images={images}
              setSelectedImage={setSelectedImage}
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
                    setSelectedImage={setSelectedImage}
                    images={images}
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
                  const count = val.trim().split(/\s+/).filter(Boolean).length;
                  return count <= 150 || `Max 150 words (${count} entered)`;
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
                <p className="text-gray-400 text-sm">Loading categories...</p>
              ) : isError ? (
                <p className="text-red-400 text-sm">Error loading categories</p>
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
                      <option
                        className="bg-primary"
                        key={subcategory}
                        value={subcategory}
                      >
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
              <label className={labelClass}>
                Detailed Description * (Min 100 words)
              </label>
              <Controller
                name="detailed_description"
                control={control}
                rules={{
                  required: "Detailed description is required!",
                  validate: (value) => {
                    const wordCount = value
                      ?.split(/\s+/)
                      .filter((word: string) => word).length;
                    return (
                      wordCount >= 100 ||
                      "Detailed description must be at least 100 words"
                    );
                  },
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
              <Input
                label="Video URL"
                placeholder="https://www.youtube.com/embed/xyz123"
                {...register("video_url", {
                  pattern: {
                    value:
                      /^https:\/\/(?:www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+$/,
                    message: "Please enter a valid youtube embed url",
                  },
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
                validate: (val) => !isNaN(val) || "Only numbers are allowed",
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
                min: {
                  value: 1,
                  message: "Sale Price cannot be zero or negative",
                },
                validate: (val) => {
                  if (isNaN(val)) return "Only numbers are allowed";
                  if (regularPrice && val >= regularPrice)
                    return "Sale price cannot be greater than regular price";
                  return true;
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
                max: {
                  value: 1000,
                  message: "Stock cannot be greater than 1000",
                },
                validate: (value) => {
                  !isNaN(value) || "Only numbers are allowed";
                  if (!Number.isInteger(value))
                    return "Stock must be an integer";
                  return true;
                },
              })}
              error={errors.stock?.message as string}
            />

            <SizeSelector control={control} errors={errors} />

            <div className="flex flex-col gap-1">
              <label className={labelClass}>
                Select Discount Codes (optional)
              </label>
              {discountLoading ? (
                <p className="text-gray-400 ">Loading discount codes...</p>
              ) : (
                <>
                  {discountCodes?.map((code: any) => {
                    const currentSelection = watch("discount_codes") || [];
                    const isSelected = currentSelection.includes(code._id);
                    return (
                      <button
                        onClick={() => {
                          const updatedSelection = isSelected
                            ? currentSelection.filter(
                              (id: string) => id !== code._id,
                            )
                            : [...currentSelection, code._id];
                          setValue("discount_codes", updatedSelection);
                        }}
                        type="button"
                        key={code._id}
                        className={`px-3 py-1 rounded-md text-sm font-semibold border ${isSelected ? "bg-blue-600 text-white border-blue-600" : "border-gray-800 hover:border-gray-600"}`}
                      >
                        {code?.publicName} ({code.discountValue}{" "}
                        {code.discountType === "percentage" ? "%" : "₹"})
                      </button>
                    );
                  })}
                </>
              )}
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

        <div className="mt-6 flex justify-end gap-3">
          {isChanged && (
            <button
              className="px-4 py-2 bg-gray-700 text-white rounded-mg"
              type="button"
              onClick={handleSaveDraft}
            >
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

        {openImageModal && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-[450px] text-white">
              <div className="flex justify-between items-center pb-3 mb-4">
                <h2 className="text-llg font-semibold">
                  Enhance Product Image
                </h2>
                <X size={20} className="cursor-pointer" onClick={() => {
                  setOpenImageModal(false)

                }} />
              </div>
              {selectedImage && (
                <div className="relative w-full h-[250px] rounded-md overflow-hidden border border-gray-600">
                  <Image
                    src={selectedImage}
                    alt="Enhanced product image"
                    layout="fill"
                    className="object-cover rounded-lg"
                  />
                </div>
                
              )}
                {selectedImage && (
    <div className="mt-4 space-y-2">
        <h3 className="text-white font-sm font-semibold">
            AI Enhancements
        </h3>

        <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2">
            {enhancements?.map(({ label, effect }) => (
                <button
                    key={effect}
                    className={`p-2 rounded-md flex items-center gap-2 ${
                        activeEffect === effect
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 hover:bg-gray-600"
                    }`}
                >
                    <Wand size={18} />
                    {label}
                </button>
            ))}
        </div>
    </div>
)}
             
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default Page;
