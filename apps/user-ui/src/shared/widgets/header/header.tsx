"use client"

import Link from 'next/link'
import React, { useState } from 'react'
import { Search, Menu, X } from 'lucide-react'
import ProfileIcon from '../../../assets/svgs/profile-icon'
import HeartIcon from '../../../assets/svgs/heart-icon'
import CartIcon from '../../../assets/svgs/cart-icon'
import HeaderBottom from '../header-bottom'
import { useUser } from '../../../hooks/useUser'

export default function Header() {
    const { user, isLoading } = useUser()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [searchValue, setSearchValue] = useState("")

    return (
        <div className='w-full bg-white border-b border-gray-100'>

            {/* ── Top bar ── */}
            <div className='w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex items-center justify-between h-[72px] gap-4'>

                    {/* ── Logo ── */}
                    <Link
                        href="/"
                        className='flex-shrink-0 text-[26px] font-semibold
                            text-gray-900 tracking-tight hover:text-[#3489FF]
                            transition-colors duration-150'
                    >
                        Eshop
                    </Link>

                    {/* ── Search bar — hidden on mobile ── */}
                    <div className='hidden sm:flex flex-1 max-w-[560px] relative'>
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder='Search for products...'
                            className='w-full h-[46px] pl-4 pr-14 text-sm
                                border-2 border-[#3489FF] outline-none
                                placeholder-gray-400 text-gray-800
                                focus:border-[#2563eb] transition-colors'
                        />
                        <button
                            aria-label="Search"
                            className='absolute right-0 top-0 w-[50px] h-[46px]
                                bg-[#3489FF] hover:bg-[#2563eb] active:scale-95
                                flex items-center justify-center transition-all'
                        >
                            <Search className='text-white' size={20} />
                        </button>
                    </div>

                    {/* ── Right side ── */}
                    <div className='flex items-center gap-6 flex-shrink-0'>

                        {/* Profile */}
                        <div className='hidden sm:flex items-center gap-2.5'>
                            <Link
                                href={user ? "/profile" : "/login"}
                                className='w-[44px] h-[44px] flex items-center justify-center
                                    rounded-full border border-gray-200 hover:border-[#3489FF]
                                    hover:bg-blue-50 transition-all duration-150 flex-shrink-0'
                            >
                                <ProfileIcon />
                            </Link>
                            <Link href={user ? "/profile" : "/login"} className='flex flex-col'>
                                <span className='text-[12px] text-gray-500 leading-tight'>Hello,</span>
                                <span className='text-[14px] font-semibold text-gray-800 leading-tight'>
                                    {isLoading ? "..." : user ? user.name.split(" ")[0] : "Sign in"}
                                </span>
                            </Link>
                        </div>

                        {/* Wishlist + Cart */}
                        <div className='flex items-center gap-4'>
                            <Link
                                href="/wishlist"
                                className='relative p-1.5 hover:scale-110 transition-transform'
                                aria-label="Wishlist"
                            >
                                <HeartIcon />
                                <span className='absolute -top-1 -right-1 w-5 h-5 bg-red-500
                                    border-2 border-white rounded-full flex items-center
                                    justify-center text-white text-[9px] font-bold'>
                                    0
                                </span>
                            </Link>
                            <Link
                                href="/cart"
                                className='relative p-1.5 hover:scale-110 transition-transform'
                                aria-label="Cart"
                            >
                                <CartIcon />
                                <span className='absolute -top-1 -right-1 w-5 h-5 bg-red-500
                                    border-2 border-white rounded-full flex items-center
                                    justify-center text-white text-[9px] font-bold'>
                                    9+
                                </span>
                            </Link>
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className='sm:hidden p-2 rounded-md text-gray-600
                                hover:bg-gray-100 transition-colors'
                            aria-label="Menu"
                        >
                            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>

                {/* ── Mobile search ── */}
                <div className='sm:hidden pb-3'>
                    <div className='relative'>
                        <input
                            type="text"
                            placeholder='Search for products...'
                            className='w-full h-[42px] pl-4 pr-12 text-sm
                                border-2 border-[#3489FF] outline-none
                                placeholder-gray-400'
                        />
                        <button
                            aria-label="Search"
                            className='absolute right-0 top-0 w-[42px] h-[42px]
                                bg-[#3489FF] flex items-center justify-center'
                        >
                            <Search className='text-white' size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Mobile nav drawer ── */}
            {mobileMenuOpen && (
                <div className='sm:hidden bg-white border-t border-gray-100
                    px-4 py-3 flex flex-col gap-1'>

                    {/* Profile row in mobile */}
                    <div className='flex items-center gap-3 py-3
                        border-b border-gray-100 mb-2'>
                        <div className='w-9 h-9 rounded-full border border-gray-200
                            flex items-center justify-center'>
                            <ProfileIcon />
                        </div>
                        <div>
                            <p className='text-[11px] text-gray-500'>Hello,</p>
                            <p className='text-[14px] font-semibold text-gray-800'>
                                {isLoading ? "..." : user ? user.name.split(" ")[0] : "Sign in"}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Header bottom (nav bar) ── */}
            <HeaderBottom />
        </div>
    )
}