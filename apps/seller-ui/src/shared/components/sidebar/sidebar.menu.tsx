import React from 'react';

interface Props {
    title: string;
    children: React.ReactNode;
}

const SidebarMenu = ({ title, children }: Props) => {
    return (
        <div className='flex flex-col mt-4 first:mt-1'>
            <p className='text-[10px] font-semibold tracking-[1.2px] uppercase text-[#4a4a4a] px-3 mb-1'>
                {title}
            </p>
            <div className='flex flex-col gap-0.5'>
                {children}
            </div>
        </div>
    );
};

export default SidebarMenu;