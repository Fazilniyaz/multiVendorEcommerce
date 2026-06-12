"use client"
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Ratings from '../ratings'
import { Eye, Heart, ShoppingBag } from 'lucide-react'
import ProductDetails from './product-details'
import { createPortal } from 'react-dom'
import { useStore } from '../../../store'
import { useUser } from '../../../hooks/useUser'
import useLocationTracker from '../../../hooks/useLocation'
import useDeviceTracker from '../../../hooks/useDeviceTracking'

function ProductCard({ product, isEvent }: { product: any; isEvent?: boolean }) {

    const [timeLeft, setTimeLeft]   = useState('')
    const [open, setOpen]           = useState(false)
    const [mounted, setMounted]     = useState(false)
    const addToWishList =  useStore((state : any) => state.addToWishlist)
    const removeFromWishList =  useStore((state : any) => state.removeFromWishlist)
    const addToCart = useStore((state : any) => state.addToCart)
    const removeFromCart = useStore((state : any) => state.removeFromCart)
    const isWishListed = useStore((state: any) => state.isInWishlist(product.id))
    const isInCart = useStore((state: any) => state.isInCart(product.id))
    const user = useUser()
    const location = useLocationTracker()
    const deviceInfo = useDeviceTracker()

    // ── Portal needs document to be available (Next.js SSR safe) ──
    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!isEvent || !product?.ending_date) return

        const tick = () => {
            const now     = Date.now()
            const endTime = new Date(product.ending_date).getTime()
            const diff    = endTime - now

            if (diff <= 0) {
                setTimeLeft('Expired')
                clearInterval(interval)
                return
            }
            const days    = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours   = Math.floor((diff / (1000 * 60 * 60)) % 24)
            const minutes = Math.floor((diff / (1000 * 60)) % 60)
            setTimeLeft(`${days}d ${hours}h ${minutes}m left`)
        }

        tick()
        const interval = setInterval(tick, 60000)
        return () => clearInterval(interval)
    }, [isEvent, product?.ending_date])

    // ── Lock body scroll when modal is open ──
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [open])

    const discountPercent =
        product?.regular_price && product?.sale_price
            ? Math.round(
                  ((product.regular_price - product.sale_price) /
                      product.regular_price) * 100
              )
            : null

    const discountColor =
        discountPercent && discountPercent >= 15
            ? "bg-red-500 text-white"
            : "bg-green-500 text-white"

    return (
        <>
            <div className="group relative w-full bg-white border border-gray-100
                rounded-2xl overflow-hidden shadow-sm hover:shadow-md
                transition-shadow duration-200 flex flex-col">

                {/* ── Image Area ── */}
                <div className="relative bg-[#EEF2FF] flex items-center
                    justify-center h-[220px] sm:h-[240px] overflow-hidden">

                    <Link
                        href={`/product/${product?.slug}`}
                        className="w-full h-full flex items-center justify-center p-4"
                    >
                        <img
                            src={product?.images?.[0]?.url || ""}
                            alt={product?.title}
                            className="h-full w-full object-contain
                                hover:scale-105 transition-transform duration-300"
                        />
                    </Link>

                    {/* Top left badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {discountPercent && discountPercent > 0 && (
                            <span className={`text-[11px] font-semibold px-2 py-0.5
                                rounded-full ${discountColor}`}>
                                -{discountPercent}%
                            </span>
                        )}
                        {isEvent && (
                            <span className="text-[11px] font-semibold px-2 py-0.5
                                rounded-full bg-orange-500 text-white">
                                OFFER
                            </span>
                        )}
                        {product?.stock <= 5 && product?.stock > 0 && (
                            <span className="text-[11px] font-semibold px-2 py-0.5
                                rounded-full bg-yellow-400 text-white">
                                Low Stock
                            </span>
                        )}
                    </div>

                    {/* Top right icons */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <button
                            type="button"
                            aria-label="Wishlist"
                            className="w-8 h-8 rounded-full bg-white shadow-sm
                                border border-gray-100 flex items-center justify-center
                                hover:bg-red-50 transition-colors"
                        >
                            <Heart onClick={() => {
                              isWishListed ? removeFromWishList(product.id, user, location, deviceInfo) : addToWishList({...product, quantity: 1}, user, location, deviceInfo)
                            }} size={15} stroke={isWishListed ? "red" : "#4B5563"} className="text-gray-400
                                hover:text-red-500 transition-colors" />
                        </button>
                        <button
                            type="button"
                            aria-label="Quick view"
                            onClick={() => setOpen(true)}
                            className="w-8 h-8 rounded-full bg-white shadow-sm
                                border border-gray-100 flex items-center justify-center
                                hover:bg-blue-50 transition-colors"
                        >
                            <Eye size={15} className="text-gray-400
                                hover:text-blue-500 transition-colors" />
                        </button>
                    </div>

                    {/* Image dots */}
                    {product?.images?.length > 1 && (
                        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2
                            flex items-center gap-1.5">
                            {product.images.slice(0, 3).map((_: any, i: number) => (
                                <span
                                    key={i}
                                    className={`rounded-full transition-all
                                        ${i === 0
                                            ? "w-2.5 h-2 bg-gray-500"
                                            : "w-2 h-2 bg-gray-300"
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Card Body ── */}
                <div className="flex flex-col flex-1 px-4 pt-3 pb-4 gap-1.5">

                    <Link
                        href={`/shop/${product?.shop?.id}`}
                        className="text-blue-500 text-[13px] font-semibold
                            hover:text-blue-600 transition-colors leading-tight"
                    >
                        {product?.shop?.name}
                    </Link>

                    <Link href={`/product/${product?.slug}`}>
                        <h3 className="text-[15px] font-bold text-gray-900
                            leading-snug hover:text-blue-600 transition-colors
                            line-clamp-1">
                            {product?.title}
                        </h3>
                    </Link>

                    {(product?.colors?.length > 0 || product?.tags) && (
                        <p className="text-[12px] text-gray-400 leading-tight line-clamp-1">
                            {[
                                product?.colors?.length > 0
                                    ? `${product.colors.length} colors`
                                    : null,
                                product?.tags
                                    ? (Array.isArray(product.tags)
                                        ? product.tags.slice(0, 2).join(" • ")
                                        : product.tags.split(",").slice(0, 2).join(" • "))
                                    : null,
                            ]
                                .filter(Boolean)
                                .join(" • ")}
                        </p>
                    )}

                    <div className="flex items-center gap-1.5 mt-0.5">
                        <Ratings rating={product?.ratings} />
                        {product?.reviews_count && (
                            <span className="text-[12px] text-gray-400">
                                ({product.reviews_count})
                            </span>
                        )}
                    </div>

                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-[18px] font-bold text-gray-900">
                            ₹{(product?.sale_price ?? product?.regular_price)
                                ?.toLocaleString('en-IN')}
                        </span>
                        {product?.regular_price &&
                            product?.sale_price &&
                            product.regular_price !== product.sale_price && (
                                <span className="text-[13px] text-gray-400 line-through">
                                    ₹{product.regular_price?.toLocaleString('en-IN')}
                                </span>
                            )}
                        {product?.totalSales && (
                            <span className="text-[12px] text-green-500 font-medium ml-auto">
                                {product.totalSales} sold
                            </span>
                        )}
                    </div>

                    {isEvent && timeLeft && (
                        <div className="mt-1">
                            <span className="inline-block text-[11px] bg-orange-50
                                text-orange-600 font-medium px-2 py-0.5 rounded-full
                                border border-orange-200">
                                ⏱ {timeLeft}
                            </span>
                        </div>
                    )}

                    {/* Add to cart */}
                    <div className="flex items-center gap-2 mt-auto pt-3">
                        <button
                            type="button"
                            onClick={() => !isInCart && addToCart({...product, quantity: 1}, user, location, deviceInfo)}
                            className="flex-1 flex items-center justify-center gap-2
                                bg-blue-600 hover:bg-blue-700 active:scale-[0.98]
                                text-white text-[13px] font-semibold
                                px-4 py-2.5 rounded-xl transition-all duration-150 disabled:opacity-50"
                            disabled={isInCart}
                        >
                            <ShoppingBag size={15} />
                            {isInCart ? "In Cart" : "Add to Cart"}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Modal rendered via portal — completely outside the card DOM ── */}
            {mounted && open &&
                createPortal(
                    <ProductDetails data={product} setOpen={setOpen} />,
                    document.body
                )
            }
        </>
    )
}

export default ProductCard