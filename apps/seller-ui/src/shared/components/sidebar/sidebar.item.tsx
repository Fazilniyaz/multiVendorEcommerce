import Link from 'next/link';
import React from 'react';

interface Props {
    icon: React.ReactNode;
    title: string;
    isActive?: boolean;
    href: string;
}

const SidebarItem = ({ icon, title, isActive, href }: Props) => {
    return (
        <Link href={href} className='block'>
            <div
                className={`
                    flex items-center gap-3 w-full h-10 px-3 rounded-md
                    cursor-pointer transition-all duration-150
                    ${isActive
                        ? 'bg-[#0f3158] text-white'
                        : 'text-[#8a8a8a] hover:bg-[#161616] hover:text-[#d4d4d4]'
                    }
                `}
            >
                <span className='flex-shrink-0 w-5 h-5 flex items-center justify-center'>
                    {icon}
                </span>
                <span className='text-sm font-medium tracking-[0.2px] truncate'>
                    {title}
                </span>
                {isActive && (
                    <span className='ml-auto w-1 h-4 rounded-full bg-[#0085ff] flex-shrink-0' />
                )}
            </div>
        </Link>
    );
};

export default SidebarItem;