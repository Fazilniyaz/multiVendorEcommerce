"use client";
import { ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import ImagePlaceholder from '../../../../shared/components/image-placeholder';

const Page = () => {

    const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm();

    const [openImageModal, setOpenImageModal] = useState(false);
    const [isChanged, setIsChanged] = useState(false);
    const [images, setImages] = useState<(File | null)[]>([null]);
    const [loading, setLoading] = useState(false);

    const onSubmit = (data: any) => {
        console.log(data);
    }

    const handleImageChange = (file: File | null, index: number) => {
        const updatedImages = [...images];
        updatedImages[index] = file;

        if (index === images.length - 1 && images.length < 8) {
            updatedImages.push(null);
        }

        setImages(updatedImages);
        setValue("images", updatedImages);
    }

    const handleRemoveImage = (index: number) => {
        setImages((prevImages) => {
            let updatedImages = [...prevImages];

            if (index === -1) {
                updatedImages = [null];
            } else {
                updatedImages.splice(index, 1);
            }

            if (!updatedImages.includes(null) && updatedImages.length < 8) {
                updatedImages.push(null);
            }

            return updatedImages;
        })
    }

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className='w-full mx-auto p-8 shadow-md rounded-lg text-white'>

                {/* Heading & Breadcrumbs */}
                <h2 className='text-2xl py-2 font-semibold font-Poppins text-white'>Create Product</h2>
                <div className='flex items-center'>
                    <span className='text-[#80Deea]'>Dashboard</span>
                    <ChevronRight size={20} className='opacity-[.8]' />
                    <span>Create Products</span>
                </div>


                {/* Content Layout */}
                <div className="py-4 w-full flex gap-6">
                    <ImagePlaceholder
                        setOpenImageModal={setOpenImageModal}
                        small={false}
                        size="765x850"
                        index={0}
                        onImageChange={handleImageChange}
                        onRemove={handleRemoveImage}
                    />
                </div>


            </form>
        </>

    );

}

export default Page;