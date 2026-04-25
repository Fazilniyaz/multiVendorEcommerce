import { Plus, PlusCircle, X } from 'lucide-react';
import React, { useState } from 'react';
import { Controller } from 'react-hook-form';

type Property = {
  label: string;
  values: string[];
};

export default function CustomProperties({ control, errors }: any) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [newLabel, setNewLabel] = useState('');
  // Per-property value input state: keyed by index
  const [newValues, setNewValues] = useState<Record<number, string>>({});

  const addProperty = () => {
    if (!newLabel.trim()) return;
    setProperties([...properties, { label: newLabel.trim(), values: [] }]);
    setNewLabel('');
  };

  const addValue = (index: number) => {
    const val = newValues[index] ?? '';
    if (!val.trim()) return;
    const updated = [...properties];
    updated[index] = {
      ...updated[index],
      values: [...updated[index].values, val.trim()],
    };
    setProperties(updated);
    setNewValues((prev) => ({ ...prev, [index]: '' }));
  };

  const removeValue = (propIndex: number, valueIndex: number) => {
    const updated = [...properties];
    updated[propIndex] = {
      ...updated[propIndex],
      values: updated[propIndex].values.filter((_, i) => i !== valueIndex),
    };
    setProperties(updated);
  };

  const removeProperty = (index: number) => {
    setProperties(properties.filter((_, i) => i !== index));
    setNewValues((prev) => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
  };

  return (
    <div>
      {/* <label className="block font-semibold text-gray-300 mb-2">
        Custom Properties
      </label> */}

      <Controller
        name="custom_properties"
        control={control}
        render={({ field }) => {
          // Sync local state into form on every render via onChange
          // We call this inside handlers below, not in a useEffect
          const syncToForm = (updated: Property[]) => {
            setProperties(updated);
            field.onChange(updated);
          };

          const handleAddProperty = () => {
            if (!newLabel.trim()) return;
            const updated = [
              ...properties,
              { label: newLabel.trim(), values: [] },
            ];
            syncToForm(updated);
            setNewLabel('');
          };

          const handleAddValue = (index: number) => {
            const val = newValues[index] ?? '';
            if (!val.trim()) return;
            const updated = [...properties];
            updated[index] = {
              ...updated[index],
              values: [...updated[index].values, val.trim()],
            };
            syncToForm(updated);
            setNewValues((prev) => ({ ...prev, [index]: '' }));
          };

          const handleRemoveValue = (propIndex: number, valueIndex: number) => {
            const updated = [...properties];
            updated[propIndex] = {
              ...updated[propIndex],
              values: updated[propIndex].values.filter((_, i) => i !== valueIndex),
            };
            syncToForm(updated);
          };

          const handleRemoveProperty = (index: number) => {
            const updated = properties.filter((_, i) => i !== index);
            syncToForm(updated);
            setNewValues((prev) => {
              const copy = { ...prev };
              delete copy[index];
              return copy;
            });
          };

          return (
            <div className="mt-2">
              <label className="block font-semibold text-gray-300 mb-1">
                Custom Properties
              </label>

              <div className="flex flex-col gap-3 mb-4">
                {/* Existing Properties */}
                {properties.map((property, index) => (
                  <div
                    key={index}
                    className="border border-gray-700 p-3 rounded-lg bg-gray-900"
                  >
                    {/* Property Header */}
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-white">
                        {property.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProperty(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Existing Values */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {property.values.map((value, valueIndex) => (
                        <span
                          key={valueIndex}
                          className="flex items-center gap-1 px-2 py-1 bg-gray-700 text-white rounded-md text-sm"
                        >
                          {value}
                          <button
                            type="button"
                            onClick={() => handleRemoveValue(index, valueIndex)}
                            className="text-gray-400 hover:text-red-400 ml-1"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Add Value to this Property */}
                    <div className="flex items-center gap-2">
                      <input
                        className="border outline-none border-gray-700 bg-gray-800 p-2 rounded-md text-white w-full text-sm"
                        type="text"
                        placeholder="Add value"
                        value={newValues[index] ?? ''}
                        onChange={(e) =>
                          setNewValues((prev) => ({
                            ...prev,
                            [index]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddValue(index);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddValue(index)}
                        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                      >
                        <PlusCircle size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add New Property */}
                <div className="flex items-center gap-2 mt-1">
                  <input
                    className="border outline-none border-gray-700 bg-gray-800 p-2 rounded-md text-white w-full text-sm"
                    type="text"
                    placeholder="Add property label"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddProperty();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddProperty}
                    className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {errors?.custom_properties?.message && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.custom_properties.message as string}
                </p>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}