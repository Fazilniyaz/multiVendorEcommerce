import * as React from "react";

const ProfileIcon = (props: any) => (
    <svg
        width={20}
        height={23}
        viewBox="0 0 17 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <circle
            cx={8.57894}
            cy={5.77803}
            r={4.77803}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15.4211 18.778C14.0526 16.4737 11.5789 15.0002 8.57894 15.0002C5.57894 15.0002 3.10526 16.4737 1.73684 18.778"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default ProfileIcon;