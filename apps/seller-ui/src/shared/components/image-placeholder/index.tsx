import React, { useState, useEffect } from 'react';
import { X, WandSparkles, Pencil } from 'lucide-react';
import Image from 'next/image';

function ImagePlaceHolder({
  size,
  small,
  onImageChange,
  onRemove,
  defaultImage = null,
  index = 0,
  setOpenImageModal
}: {
  size: string;
  small?: boolean;
  onImageChange: (file: File | null, index: number) => void;
  onRemove?: (index: number) => void;
  defaultImage?: string | null;
  index?: number;
  setOpenImageModal?: (openImageModal: boolean) => void;
}) {
  const [imagePreview, setImagePreview] = useState<string | null>(defaultImage);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      onImageChange(file, index);
    }
  };

  // 🔥 Cleanup memory (important)
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div
      className={`relative ${small ? "h-[180px] w-[200px]" : "h-[450px] w-[450px]"} cursor-pointer bg-[#1e1e1e] border border-gray-600 rounded-lg flex flex-col justify-center items-center overflow-hidden`}
      onClick={() =>
        document.getElementById(`image-upload-${index}`)?.click()
      }
    >
      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id={`image-upload-${index}`}
        onChange={handleFileChange}
      />

      {/* Buttons when image exists */}
      {imagePreview && (
        <>
          {/* Remove Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.(index);
              setImagePreview(null);
            }}
            className="absolute top-3 right-3 p-2 rounded bg-red-600 shadow-lg"
          >
            <X size={16} />
          </button>

          {/* AI / Edit Button */}
          <button
            type="button"
            className="absolute top-3 right-[70px] p-2 rounded bg-blue-500 shadow-lg cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setOpenImageModal?.(true);
            }}
          >
            <WandSparkles size={16} />
          </button>
        </>
      )}

      {/* Upload Button when no image */}
      {!imagePreview && (
        <label
          htmlFor={`image-upload-${index}`}
          className="absolute top-3 right-3 p-2 rounded bg-slate-700 shadow-lg cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <Pencil size={16} />
        </label>
      )}

      {/* Image Preview */}
      {imagePreview ? (
        <Image
          src={imagePreview}
          alt="uploaded"
          fill
          className="object-cover rounded-lg"
        />
      ) : (
        <p
          className={`text-gray-400 ${small ? "text-xl" : "text-4xl"
            } font-semibold`}
        >
          {size}
        </p>
      )}
    </div>
  );
}

export default ImagePlaceHolder;