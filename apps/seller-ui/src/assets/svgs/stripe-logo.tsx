import React from "react";

type StripeLogoProps = {
    width?: number;
    height?: number;
    className?: string;
};

const StripeLogo: React.FC<StripeLogoProps> = ({
    width = 180,
    height = 60,
    className = "",
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 180 60"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="stripeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#635BFF" />
                    <stop offset="100%" stopColor="#00D4FF" />
                </linearGradient>
            </defs>

            {/* Background */}
            <rect
                x="5"
                y="5"
                rx="12"
                ry="12"
                width="170"
                height="50"
                fill="url(#stripeGradient)"
            />

            {/* Stylized S */}
            <path
                d="M60 38c0-4-3-6-8-8-3-1-4-2-4-3s1-2 3-2c2 0 4 .6 6 1.5l2-5c-2-1-5-2-8-2-6 0-10 3-10 8 0 4 3 6 8 8 3 1 4 2 4 3s-1 2-3 2c-3 0-6-1-8-2l-2 5c3 1.5 6 2.5 10 2.5 6 0 10-3 10-8z"
                fill="#ffffff"
            />

            {/* Text */}
            <text
                x="80"
                y="38"
                fontFamily="Arial, Helvetica, sans-serif"
                fontSize="18"
                fill="#ffffff"
                fontWeight="bold"
            >
                Stripe
            </text>
        </svg>
    );
};

export default StripeLogo;