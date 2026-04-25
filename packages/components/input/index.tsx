import React, { forwardRef } from 'react';

interface BaseProps {
    label?: string;
    type?: "text" | "email" | "password" | "number" | "textarea";
    className?: string;
    error?: string;
    rows?: number;
    cols?: number;
}

type InputProps = BaseProps & React.InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>;
type Props = InputProps | TextareaProps;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
    ({ label, type = "text", className, error, rows, cols, ...props }, ref) => {
        return (
            <div className="w-full flex flex-col gap-1">
                {label && (
                    <label className="text-sm font-medium text-gray-300">
                        {label}
                    </label>
                )}

                {type === "textarea" ? (
                    <textarea
                        ref={ref as React.Ref<HTMLTextAreaElement>}
                        rows={rows ?? 4}
                        cols={cols}
                        className={`
                            w-full bg-transparent border border-gray-700
                            rounded-md px-3 py-2 text-white text-sm
                            placeholder-gray-500 outline-none resize-none
                            focus:border-blue-500 transition-colors
                            ${className ?? ""}
                        `}
                        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                    />
                ) : (
                    <input
                        ref={ref as React.Ref<HTMLInputElement>}
                        type={type}
                        className={`
                            w-full bg-transparent border border-gray-700
                            rounded-md px-3 py-2 text-white text-sm
                            placeholder-gray-500 outline-none
                            focus:border-blue-500 transition-colors
                            ${className ?? ""}
                        `}
                        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
                    />
                )}

                {error && (
                    <span className="text-red-400 text-xs mt-0.5">{error}</span>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
export default Input;