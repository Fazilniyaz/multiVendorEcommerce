import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Controller } from 'react-hook-form';

const defaultColors = [
    { name: "White",   value: "#FFFFFF" },
    { name: "Silver",  value: "#C0C0C0" },
    { name: "Red",     value: "#FF0000" },
    { name: "Blue",    value: "#2563EB" },
    { name: "Navy",    value: "#1E3A8A" },
    { name: "Yellow",  value: "#FFFF00" },
    { name: "Magenta", value: "#FF00FF" },
    { name: "Cyan",    value: "#00FFFF" },
    { name: "Green",   value: "#16A34A" },
];

const lightColors = ["#FFFF00", "#00FFFF", "#FF00FF", "#FFFFFF", "#C0C0C0"];

const ColorSelector = ({ control, errors }: any) => {
    const [customColors, setCustomColors] = useState<{ name: string; value: string }[]>([]);
    const [showPicker, setShowPicker] = useState(false);
    const [newColor, setNewColor] = useState("#ffffff");

    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-300">Colors</label>

            <Controller
                name="colors"
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                    <div className="flex flex-wrap items-center gap-2 mt-1">

                        {/* Color swatches */}
                        {[...defaultColors, ...customColors].map((color) => {
                            const isSelected = (field.value || []).includes(color.value);
                            const isLight = lightColors.includes(color.value);

                            return (
                                <button
                                    key={color.value}
                                    type="button"
                                    title={color.name}
                                    onClick={() => {
                                        const current: string[] = field.value || [];
                                        field.onChange(
                                            isSelected
                                                ? current.filter((c) => c !== color.value)
                                                : [...current, color.value]
                                        );
                                    }}
                                    className={`
                                        w-8 h-8 rounded-md flex-shrink-0 transition-all duration-150
                                        ${isSelected
                                            ? "ring-2 ring-offset-2 ring-offset-[#111] ring-white scale-110"
                                            : isLight
                                                ? "ring-1 ring-gray-500"
                                                : "ring-1 ring-transparent hover:ring-gray-500"
                                        }
                                    `}
                                    style={{ backgroundColor: color.value }}
                                />
                            );
                        })}

                        {/* Add color button */}
                        <button
                            type="button"
                            title="Add custom color"
                            onClick={() => setShowPicker(!showPicker)}
                            className="w-8 h-8 rounded-md flex-shrink-0 flex items-center justify-center
                                bg-gray-700 hover:bg-gray-600 ring-1 ring-gray-600
                                transition-colors duration-150"
                        >
                            <Plus size={15} className="text-gray-300" />
                        </button>

                        {/* Inline color picker */}
                        {showPicker && (
                            <div className="flex items-center gap-2 ml-1">
                                <input
                                    type="color"
                                    value={newColor}
                                    onChange={(e) => setNewColor(e.target.value)}
                                    className="w-8 h-8 rounded cursor-pointer border-0
                                        bg-transparent p-0 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCustomColors([
                                            ...customColors,
                                            { name: "Custom", value: newColor },
                                        ]);
                                        setShowPicker(false);
                                    }}
                                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600
                                        text-white text-xs rounded-md transition-colors"
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPicker(false)}
                                    className="px-3 py-1 bg-transparent hover:bg-gray-700
                                        text-gray-400 text-xs rounded-md transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                )}
            />

            {errors?.colors && (
                <span className="text-red-400 text-xs">
                    {errors.colors.message}
                </span>
            )}
        </div>
    );
};

export default ColorSelector;