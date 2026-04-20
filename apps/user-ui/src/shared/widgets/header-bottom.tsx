'use client'
import { navItems } from '../../configs/constants'
import { AlignLeft, ChevronDown } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import ProfileIcon from '../../assets/svgs/profile-icon'
import HeartIcon from '../../assets/svgs/heart-icon'
import CartIcon from '../../assets/svgs/cart-icon'
import { useUser } from '../../hooks/useUser'

export default function HeaderBottom() {
    const [show, setShow] = useState(false)
    const [isSticky, setIsSticky] = useState(false)
    const { user, isLoading } = useUser();

    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > 100)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className={`w-full transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 right-0 z-[100] bg-white shadow-lg' : 'relative'}`}>
            <div className={`w-[80%] m-auto flex items-center justify-between relative ${isSticky ? 'py-3' : 'py-0'}`}>

                {/* Left: All Departments dropdown + Nav links */}
                <div className='flex items-center'>

                    {/* Dropdown trigger */}
                    <div
                        onClick={() => setShow(!show)}
                        className={`w-[260px] ${isSticky ? 'mb-0' : ''} cursor-pointer flex items-center justify-between px-5 h-[50px] bg-[#3489FF] relative`}
                    >
                        <div className="flex items-center gap-2">
                            <AlignLeft color="white" />
                            <span className='text-white font-medium'>All Departments</span>
                        </div>
                        <ChevronDown color='white' />

                        {/* Dropdown menu */}
                        {show && (
                            <div className='absolute left-0 top-[50px] w-[260px] h-[400px] bg-[#f5f5f5] z-50 shadow-md' />
                        )}
                    </div>

                    {/* Nav links — outside dropdown div */}
                    <div className='flex items-center'>
                        {navItems.map((i: NavItemsTypes, index: number) => (
                            <Link key={index} href={i.href}>
                                <span className='px-5 text-base font-medium hover:text-[#3489FF] transition-colors'>{i.title}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Right: Sticky icons */}
                {isSticky && (
                    <div className='flex items-center gap-8'>
                        <div className='flex items-center gap-2'>
                            {!isLoading && user ? (
                                <><Link
                                    className='border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]'
                                    href="/profile"
                                >
                                    <ProfileIcon />
                                </Link><Link href="/login">
                                        <span className='block font-medium'>Hello,</span>
                                        <span className='font-semibod'>{user ? user.name.split(" ")[0] : ""}</span>
                                    </Link></>

                            ) : (
                                <><Link
                                    className='border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]'
                                    href="/login"
                                >
                                    <ProfileIcon />
                                </Link><Link href="/login">
                                        <span className='block font-medium'>Hello,</span>
                                        <span className='font-semibod'>{isLoading ? "..." : "Sign in"}</span>
                                    </Link></>
                            )}


                        </div>
                        <div className='flex items-center gap-5'>
                            <Link href="/wishlist" className='relative'>
                                <HeartIcon />
                                <div className='w-5 h-5 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-6px] right-[-6px]'>
                                    <span className='text-white font-medium text-[10px]'>0</span>
                                </div>
                            </Link>
                            <Link href="/cart" className='relative'>
                                <CartIcon />
                                <div className='w-5 h-5 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-6px] right-[-6px]'>
                                    <span className='text-white font-medium text-[10px]'>9+</span>
                                </div>
                            </Link>
                        </div>

                    </div>
                )}

            </div>
        </div>
    )
}