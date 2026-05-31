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
    const [show, setShow]           = useState(false)
    const [isSticky, setIsSticky]   = useState(false)
    const { user, isLoading }       = useUser()

    useEffect(() => {
        const handleScroll = () => setIsSticky(window.scrollY > 100)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // ── Close dropdown on outside click ──
    useEffect(() => {
        if (!show) return
        const close = () => setShow(false)
        window.addEventListener('click', close)
        return () => window.removeEventListener('click', close)
    }, [show])

    return (
        <>
            {/* ── Sticky spacer — prevents layout jump ── */}
            {isSticky && <div className='h-[54px] hidden sm:block' />}

            <div className={`
                w-full bg-[#3489FF] transition-all duration-300
                ${isSticky
                    ? 'fixed top-0 left-0 right-0 z-[100] shadow-lg'
                    : 'relative'
                }
            `}>
                <div className='w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex items-center justify-between'>

                        {/* ── Left: Departments + Nav ── */}
                        <div className='flex items-center'>

                            {/* All Departments trigger */}
                            <div
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setShow(!show)
                                }}
                                className='relative flex items-center gap-2.5
                                    px-5 h-[54px] bg-[#2563eb] cursor-pointer
                                    hover:bg-[#1d4ed8] transition-colors select-none
                                    flex-shrink-0'
                            >
                                <AlignLeft size={18} color="white" />
                                <span className='text-white text-[14px] font-medium
                                    hidden md:block whitespace-nowrap'>
                                    All Departments
                                </span>
                                <ChevronDown
                                    size={16}
                                    color='white'
                                    className={`transition-transform duration-200
                                        ${show ? 'rotate-180' : ''}`}
                                />

                                {/* Departments dropdown */}
                                {show && (
                                    <div
                                        onClick={(e) => e.stopPropagation()}
                                        className='absolute left-0 top-[54px] w-[260px]
                                            bg-white shadow-xl border border-gray-100
                                            z-50 py-2'
                                    >
                                        {/* Placeholder — replace with your category items */}
                                        {[
                                            "Electronics", "Fashion", "Home & Garden",
                                            "Sports", "Books", "Toys", "Health & Beauty",
                                            "Automotive", "Food & Grocery"
                                        ].map((cat) => (
                                            <Link
                                                key={cat}
                                                href={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                                                className='flex items-center px-4 py-2.5
                                                    text-[13px] text-gray-700 hover:bg-blue-50
                                                    hover:text-[#3489FF] transition-colors'
                                            >
                                                {cat}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Nav links */}
                            <nav className='hidden md:flex items-center'>
                                {navItems?.map((item: any, index: number) => (
                                    <Link
                                        key={index}
                                        href={item.href}
                                        className='px-4 h-[54px] flex items-center
                                            text-[14px] font-medium text-white/90
                                            hover:text-white hover:bg-white/10
                                            transition-all duration-150 whitespace-nowrap'
                                    >
                                        {item.title}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* ── Right: Sticky icons (only visible when sticky) ── */}
                        {isSticky && (
                            <div className='hidden md:flex items-center gap-6
                                flex-shrink-0'>

                                {/* Profile */}
                                <div className='flex items-center gap-2'>
                                    <Link
                                        href={user ? "/profile" : "/login"}
                                        className='w-[38px] h-[38px] flex items-center
                                            justify-center rounded-full border
                                            border-white/30 hover:bg-white/10
                                            transition-colors flex-shrink-0'
                                    >
                                        <ProfileIcon />
                                    </Link>
                                    <Link href={user ? "/profile" : "/login"}>
                                        <span className='block text-[11px] text-white/70
                                            leading-tight'>Hello,</span>
                                        <span className='block text-[13px] font-semibold
                                            text-white leading-tight'>
                                            {isLoading ? "..." : user
                                                ? user.name.split(" ")[0]
                                                : "Sign in"}
                                        </span>
                                    </Link>
                                </div>

                                {/* Wishlist + Cart */}
                                <div className='flex items-center gap-4'>
                                    <Link
                                        href="/wishlist"
                                        className='relative p-1.5 hover:scale-110
                                            transition-transform'
                                        aria-label="Wishlist"
                                    >
                                        <HeartIcon />
                                        <span className='absolute -top-1 -right-1 w-[18px] h-[18px]
                                            bg-red-500 border-2 border-[#3489FF] rounded-full
                                            flex items-center justify-center
                                            text-white text-[8px] font-bold'>
                                            0
                                        </span>
                                    </Link>
                                    <Link
                                        href="/cart"
                                        className='relative p-1.5 hover:scale-110
                                            transition-transform'
                                        aria-label="Cart"
                                    >
                                        <CartIcon />
                                        <span className='absolute -top-1 -right-1 w-[18px] h-[18px]
                                            bg-red-500 border-2 border-[#3489FF] rounded-full
                                            flex items-center justify-center
                                            text-white text-[8px] font-bold'>
                                            9+
                                        </span>
                                    </Link>
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}