"use client"
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import Ratings from "../ratings";
import {
    X, MapPin, MessageCircle, ShoppingCart, Heart,
    Shield, Truck, RotateCcw, Star, ChevronLeft,
    ChevronRight, Package, Clock, ExternalLink
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "../../../store";
import { useUser } from "../../../hooks/useUser";
import useLocationTracker from "../../../hooks/useLocation";
import useDeviceTracker from "../../../hooks/useDeviceTracking";

const ProductDetails = ({
    data,
    setOpen,
}: {
    data: any;
    setOpen: (open: boolean) => void;
}) => {
    const [activeImage, setActiveImage]   = useState(0);
    const router = useRouter();
    const user = useUser();
    const location = useLocationTracker();
    const deviceInfo = useDeviceTracker();

    // ── Variant selection state ──────────────────────────────────────
    const [selectedColor, setSelectedColor] = useState<string | null>(
        data?.colors?.length > 0 ? data.colors[0] : null
    );
    const [selectedSize, setSelectedSize] = useState<string | null>(
        data?.sizes?.length > 0 ? data.sizes[0] : null
    );
    // custom_specifications: { name, value }[] — we just display, nothing to select
    // custom_properties: { name, value }[] — user picks one value per property group
    // NOTE: Prisma stores this as `customProperties` (camelCase). The API returns camelCase.
    const buildDefaultCustomProps = () => {
        if (!data?.customProperties?.length) return {};
        const defaults: Record<string, string> = {};
        data.customProperties.forEach((prop: any) => {
            if (prop.name && prop.value) defaults[prop.name] = prop.value;
        });
        return defaults;
    };
    const [selectedCustomProps, setSelectedCustomProps] = useState<Record<string, string>>(
        buildDefaultCustomProps()
    );

    // Store hooks
    const addToCart = useStore((state: any) => state.addToCart);
    const addToWishlist = useStore((state: any) => state.addToWishlist);
    const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
    
    // Check if product is in wishlist/cart using helper methods
    const isWishlisted = useStore((state: any) => state.isInWishlist(data.id));
    const isInCart = useStore((state: any) => state.isInCart(data.id));

    // ── Helper: build product payload with selected variants ─────────
    const buildCartProduct = () => ({
        ...data,
        quantity: 1,
        selectedColor,
        selectedSize,
        selectedCustomProps: Object.keys(selectedCustomProps).length > 0
            ? selectedCustomProps
            : null,
    });

    const discountPercent =
        data?.regular_price && data?.sale_price
            ? Math.round(
                  ((data.regular_price - data.sale_price) / data.regular_price) * 100
              )
            : null;

    const handlePrev = () =>
        setActiveImage((p) => (p === 0 ? data.images.length - 1 : p - 1));
    const handleNext = () =>
        setActiveImage((p) => (p === data.images.length - 1 ? 0 : p + 1));

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center
                bg-black/50 mt-20 backdrop-blur-sm px-4 py-6"
            onClick={() => setOpen(false)}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto
                    bg-white rounded-2xl shadow-2xl
                    [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {/* ── Close button ── */}
                <button
                    onClick={() => setOpen(false)}
                    className="absolute top-4 right-4 z-20 p-2 rounded-xl
                        bg-gray-100 hover:bg-gray-200 text-gray-500
                        hover:text-gray-800 transition-colors"
                    aria-label="Close"
                >
                    <X size={18} />
                </button>

                <div className="flex flex-col md:flex-row">

                    {/* ══ LEFT — Image Gallery ══ */}
                    <div className="w-full md:w-[45%] flex-shrink-0 p-5 flex flex-col gap-3">

                        {/* Main image */}
                        <div className="relative bg-[#EEF2FF] rounded-xl overflow-hidden
                            aspect-square flex items-center justify-center">

                            <Image
                                src={data?.images?.[activeImage]?.url || "/placeholder.png"}
                                alt={data?.title}
                                width={480}
                                height={480}
                                className="w-full h-full object-contain p-4
                                    transition-opacity duration-200"
                            />

                            {/* Discount badge */}
                            {discountPercent && discountPercent > 0 && (
                                <div className="absolute top-3 left-3">
                                    <span className={`text-[12px] font-bold px-2.5 py-1
                                        rounded-full ${discountPercent >= 15
                                            ? "bg-red-500 text-white"
                                            : "bg-green-500 text-white"
                                        }`}>
                                        -{discountPercent}%
                                    </span>
                                </div>
                            )}

                            {/* Wishlist */}
                            <button
                                onClick={() => {
                                    isWishlisted 
                                        ? removeFromWishlist(data.id, user, location, deviceInfo)
                                        : addToWishlist(buildCartProduct(), user, location, deviceInfo)
                                }}
                                className="absolute top-3 right-3 p-2 rounded-full
                                    bg-white shadow-md hover:scale-110 transition-all"
                                aria-label="Wishlist"
                            >
                                <Heart
                                    size={16}
                                    className={isWishlisted
                                        ? "fill-red-500 stroke-red-500"
                                        : "stroke-gray-400"}
                                />
                            </button>

                            {/* Prev/Next arrows — only if multiple images */}
                            {data?.images?.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrev}
                                        className="absolute left-2 top-1/2 -translate-y-1/2
                                            p-1.5 rounded-full bg-white/80 shadow
                                            hover:bg-white transition-colors"
                                    >
                                        <ChevronLeft size={16} className="text-gray-600" />
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="absolute right-2 top-1/2 -translate-y-1/2
                                            p-1.5 rounded-full bg-white/80 shadow
                                            hover:bg-white transition-colors"
                                    >
                                        <ChevronRight size={16} className="text-gray-600" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnail strip */}
                        {data?.images?.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto
                                [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                {data.images.map((img: any, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`flex-shrink-0 w-16 h-16 rounded-lg
                                            overflow-hidden border-2 transition-all
                                            ${activeImage === i
                                                ? "border-blue-500 scale-105"
                                                : "border-transparent hover:border-gray-300"
                                            }`}
                                    >
                                        <Image
                                            src={img.url}
                                            alt={`${data.title} ${i + 1}`}
                                            width={64}
                                            height={64}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Trust badges */}
                        <div className="grid grid-cols-3 gap-2 mt-1">
                            {[
                                { icon: Truck,      label: "Free Delivery"  },
                                { icon: RotateCcw,  label: "Easy Returns"   },
                                { icon: Shield,     label: "Secure Payment" },
                            ].map(({ icon: Icon, label }) => (
                                <div
                                    key={label}
                                    className="flex flex-col items-center gap-1 py-2
                                        bg-gray-50 rounded-lg border border-gray-100"
                                >
                                    <Icon size={15} className="text-blue-600" />
                                    <span className="text-[10px] font-medium text-gray-500
                                        text-center leading-tight">
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ══ RIGHT — Product Info ══ */}
                    <div className="flex-1 flex flex-col p-5 md:pl-2 md:pr-6 md:py-6 gap-4">

                        {/* Shop card */}
                        <div className="flex items-center justify-between p-3
                            bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                                {/* Shop avatar initials */}
                                <div className="w-10 h-10 rounded-full bg-blue-100
                                    flex items-center justify-center flex-shrink-0">
                                    <span className="text-blue-700 font-bold text-sm">
                                        {data?.shop?.name?.[0]?.toUpperCase() ?? "S"}
                                    </span>
                                </div>
                                <div>
                                    <Link
                                        href={`/shop/${data?.shop?.id}`}
                                        className="text-sm font-semibold text-gray-800
                                            hover:text-blue-600 transition-colors flex
                                            items-center gap-1"
                                    >
                                        {data?.shop?.name}
                                        <ExternalLink size={11} className="text-gray-400" />
                                    </Link>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <MapPin size={11} className="text-gray-400" />
                                        <span className="text-[11px] text-gray-500">
                                            {data?.shop?.address ?? "Location N/A"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => router.push(`/inbox?shopId=${data?.shop?.id}`)}
                                className="flex items-center gap-1.5 px-3 py-1.5
                                    bg-blue-600 hover:bg-blue-500 text-white text-xs
                                    font-medium rounded-lg transition-colors flex-shrink-0"
                            >
                                <MessageCircle size={13} />
                                Chat
                            </button>
                        </div>

                        {/* Product title + brand */}
                        <div>
                            {data?.brand && (
                                <span className="text-[12px] font-semibold text-blue-600
                                    tracking-wide uppercase">
                                    {data.brand}
                                </span>
                            )}
                            <h2 className="text-xl font-bold text-gray-900 leading-snug mt-1">
                                {data?.title}
                            </h2>
                            <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed
                                line-clamp-3">
                                {data?.short_description}
                            </p>
                        </div>

                        {/* Ratings + stock */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Ratings rating={data?.ratings} />
                                <span className="text-[12px] text-gray-500">
                                    ({data?.reviewCount ?? 0} reviews)
                                </span>
                            </div>
                            <span className={`text-[12px] font-semibold px-2.5 py-1
                                rounded-full
                                ${data?.stock > 10
                                    ? "bg-green-50 text-green-600"
                                    : data?.stock > 0
                                        ? "bg-amber-50 text-amber-600"
                                        : "bg-red-50 text-red-500"
                                }`}>
                                {data?.stock > 10
                                    ? `${data.stock} in stock`
                                    : data?.stock > 0
                                        ? `Only ${data.stock} left`
                                        : "Out of stock"}
                            </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-3 py-2
                            border-y border-gray-100">
                            <span className="text-3xl font-extrabold text-gray-900">
                                ₹{data?.sale_price?.toLocaleString("en-IN")}
                            </span>
                            {data?.regular_price !== data?.sale_price && (
                                <span className="text-base text-gray-400 line-through">
                                    ₹{data?.regular_price?.toLocaleString("en-IN")}
                                </span>
                            )}
                            {discountPercent && discountPercent > 0 && (
                                <span className="text-sm font-semibold text-green-600">
                                    {discountPercent}% off
                                </span>
                            )}
                        </div>

                        {/* ── Colors (selectable) ── */}
                        {data?.colors?.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">
                                    Color
                                    {selectedColor && (
                                        <span className="ml-2 normal-case font-normal text-gray-700">
                                            — {selectedColor}
                                        </span>
                                    )}
                                </span>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {data.colors.map((color: string, i: number) => (
                                        <button
                                            key={i}
                                            title={color}
                                            onClick={() => setSelectedColor(
                                                selectedColor === color ? null : color
                                            )}
                                            className={`w-8 h-8 rounded-full border-2 transition-all duration-150
                                                hover:scale-110 focus:outline-none
                                                ${
                                                    selectedColor === color
                                                        ? 'border-blue-500 scale-110 ring-2 ring-blue-300'
                                                        : 'border-white ring-1 ring-gray-300 hover:ring-blue-400'
                                                }`}
                                            style={{ backgroundColor: color }}
                                            aria-label={`Select color ${color}`}
                                            aria-pressed={selectedColor === color}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Sizes (selectable) ── */}
                        {data?.sizes?.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">
                                    Size
                                    {selectedSize && (
                                        <span className="ml-2 normal-case font-normal text-gray-700">
                                            — {selectedSize}
                                        </span>
                                    )}
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {data.sizes.map((size: string, i: number) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedSize(
                                                selectedSize === size ? null : size
                                            )}
                                            aria-pressed={selectedSize === size}
                                            className={`px-3 py-1.5 text-[12px] font-semibold
                                                rounded-lg border transition-all duration-150
                                                ${
                                                    selectedSize === size
                                                        ? 'border-blue-500 bg-blue-50 text-blue-600 ring-1 ring-blue-300'
                                                        : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Custom Properties (selectable per property name) ── */}
                        {data?.customProperties?.length > 0 && (() => {
                            // Group by name
                            const groups: Record<string, string[]> = {};
                            data.customProperties.forEach((p: any) => {
                                if (!groups[p.name]) groups[p.name] = [];
                                if (!groups[p.name].includes(p.value)) groups[p.name].push(p.value);
                            });
                            return (
                                <div className="flex flex-col gap-3">
                                    {Object.entries(groups).map(([propName, values]) => (
                                        <div key={propName} className="flex flex-col gap-1.5">
                                            <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">
                                                {propName}
                                                {selectedCustomProps[propName] && (
                                                    <span className="ml-2 normal-case font-normal text-gray-700">
                                                        — {selectedCustomProps[propName]}
                                                    </span>
                                                )}
                                            </span>
                                            <div className="flex flex-wrap gap-2">
                                                {values.map((val: string, i: number) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setSelectedCustomProps(prev => ({
                                                            ...prev,
                                                            [propName]: prev[propName] === val ? '' : val,
                                                        }))}
                                                        aria-pressed={selectedCustomProps[propName] === val}
                                                        className={`px-3 py-1.5 text-[12px] font-semibold
                                                            rounded-lg border transition-all duration-150
                                                            ${
                                                                selectedCustomProps[propName] === val
                                                                    ? 'border-blue-500 bg-blue-50 text-blue-600 ring-1 ring-blue-300'
                                                                    : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600'
                                                            }`}
                                                    >
                                                        {val}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}

                        {/* Quick specs */}
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: "Category",   value: data?.category   },
                                { label: "Sub",        value: data?.subCategory },
                                { label: "Warranty",   value: data?.warranty ? `${data.warranty} Year` : null },
                                { label: "Delivery",   value: data?.cash_on_delivery === "yes" ? "COD Available" : "Prepaid Only" },
                            ]
                                .filter((s) => s.value)
                                .map(({ label, value }) => (
                                    <div
                                        key={label}
                                        className="flex flex-col gap-0.5 px-3 py-2
                                            bg-gray-50 rounded-lg border border-gray-100"
                                    >
                                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                                            {label}
                                        </span>
                                        <span className="text-[13px] font-medium text-gray-700">
                                            {value}
                                        </span>
                                    </div>
                                ))}
                        </div>

                        {/* Custom specifications */}
                        {data?.custom_specifications?.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">
                                    Specifications
                                </span>
                                <div className="flex flex-col divide-y divide-gray-100
                                    border border-gray-100 rounded-lg overflow-hidden">
                                    {data.custom_specifications.map((spec: any, i: number) => (
                                        <div
                                            key={i}
                                            className="flex items-center px-3 py-2 gap-4
                                                bg-white hover:bg-gray-50 transition-colors"
                                        >
                                            <span className="text-[12px] text-gray-500 w-28 flex-shrink-0">
                                                {spec.name}
                                            </span>
                                            <span className="text-[13px] font-medium text-gray-800">
                                                {spec.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {data?.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {data.tags.map((tag: string, i: number) => (
                                    <span
                                        key={i}
                                        className="px-2.5 py-0.5 bg-blue-50 text-blue-600
                                            text-[11px] font-medium rounded-full
                                            border border-blue-100"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* CTA Buttons */}
                        <div className="flex gap-3 pt-1 mt-auto">
                            <button
                                onClick={() => !isInCart && addToCart(buildCartProduct(), user, location, deviceInfo)}
                                className="flex-1 flex items-center justify-center gap-2
                                    bg-blue-600 hover:bg-blue-500 active:scale-[0.98]
                                    text-white font-semibold text-sm py-3 rounded-xl
                                    transition-all duration-150 disabled:opacity-50"
                                disabled={isInCart}
                            >
                                <ShoppingCart size={16} />
                                {isInCart ? "Already in Cart" : "Add to Cart"}
                            </button>
                            <Link
                                href={`/product/${data?.slug}`}
                                className="flex-1 flex items-center justify-center gap-2
                                    border border-gray-300 hover:border-blue-400
                                    hover:text-blue-600 text-gray-700 font-semibold
                                    text-sm py-3 rounded-xl transition-all duration-150"
                            >
                                <Package size={16} />
                                View Full Details
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;