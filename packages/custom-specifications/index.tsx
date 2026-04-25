import { PlusCircle, Trash } from 'lucide-react';
import Input from 'packages/components/input';
import React from 'react'
import { Controller, useFieldArray , } from 'react-hook-form';

export default function CustomSpecifications({control, errors}: any) {

    const {fields , append, remove} = useFieldArray({
        control,
        name: "custom_specifications"
    });



  return (
    <div>
        <label className="block font-semibold text-gray-300 mb-2">
            Custom Specifications
        </label>
        <div className='flex flex-col gap-3'>
            { fields.map((item: any, index: number) => (
                <div key={index} className='flex gap-2 items-center'>
                    <Controller  name={`custom_specifications.${index}.name`}
                        control={control}
                        rules={{ required: "Specification name is required" }}
                        render={({ field }) => (
                            <Input
                                label="Specification Name"
                                placeholder="e.g., Material, Dimensions, etc."
                                {...field}
                                error={errors.custom_specifications?.[index]?.name?.message as string}
                            />
                        )}
                    />
                    <Controller  name={`custom_specifications.${index}.value`}
                        control={control}
                        rules={{ required: "Specification value is required" }}
                        render={({ field }) => (
                            <Input
                                label="Specification Value"
                                placeholder="Enter specification value e.g., Cotton, 10x20cm, etc."
                                {...field}
                                error={errors.custom_specifications?.[index]?.value?.message as string}
                            />
                        )}
                    />
                    <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                    >
                         <Trash size={20} />
                    </button>
                </div>
            )) }

            <button type="button" onClick={() => append({name: "", value: ""})} 
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 mt-2">
                <PlusCircle size={20} />
                Add Specification
            </button>
        </div>
        {errors.custom_specifications?.message && (
            <p className="text-red-500 text-sm mt-1">
                {errors.custom_specifications.message as string}
            </p>
        )}
    </div>
  )
}
