"use client";
import { useUser } from '../../../hooks/useUser'
import { useStore } from '../../../store/index'
import useLocationTracker from '../../../hooks/useLocation'
import useDeviceTracker from '../../../hooks/useDeviceTracking'
import { ShoppingCart, Trash2, Heart, ArrowRight, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const WishlistPage = () => {
    const { user } = useUser();
    const location = useLocationTracker();
    const deviceInfo = useDeviceTracker();

    const wishlist     = useStore((state: any) => state.wishlist);
    const addToCart    = useStore((state: any) => state.addToCart);
    const isInCart     = useStore((state: any) => state.isInCart);
    const removeFromWishlist  = useStore((state: any) => state.removeFromWishlist);

    const increaseQuantity = (id: string) => {
        useStore.setState((state: any) => ({
            wishlist: state.wishlist.map((item: any) =>
                item.id === id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        }));
    };

    const decreaseQuantity = (id: string) => {
        useStore.setState((state: any) => ({
            wishlist: state.wishlist.map((item: any) =>
                item.id === id && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        }));
    };

    const removeItem = (id: string) => {
        removeFromWishlist(id, user, location, deviceInfo);
    };

    const handleAddToCart = (item: any) => {
        addToCart({ ...item }, user, location, deviceInfo);
    };

    // ── Totals ──────────────────────────────────────────────
    const totalItems  = wishlist.reduce((sum: number, i: any) => sum + i.quantity, 0);
    const totalPrice  = wishlist.reduce(
        (sum: number, i: any) => sum + (i.sale_price ?? i.regular_price) * i.quantity, 0
    );

    return (
        <div className="w-full min-h-screen bg-gray-50">
            <div className="w-[90%] md:w-[85%] max-w-[1200px] mx-auto py-8">

                {/* ── Header ── */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <Link href="/" className="hover:text-[#3489FF] transition-colors">
                            Home
                        </Link>
                        <span>›</span>
                        <span className="text-gray-800 font-medium">Wishlist</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-semibold text-gray-900">
                                My Wishlist
                            </h1>
                            {wishlist.length > 0 && (
                                <span className="px-2.5 py-0.5 bg-[#3489FF] text-white
                                    text-sm font-medium rounded-full">
                                    {wishlist.length}
                                </span>
                            )}
                        </div>
                        {wishlist.length > 0 && (
                            <Link
                                href="/products"
                                className="flex items-center gap-1.5 text-sm text-[#3489FF]
                                    hover:text-blue-700 font-medium transition-colors"
                            >
                                Continue Shopping
                                <ArrowRight size={15} />
                            </Link>
                        )}
                    </div>
                </div>

                {/* ── Empty state ── */}
                {wishlist.length === 0 ? (
                    <div className="flex flex-col items-center justify-center
                        py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center
                            justify-center mb-4">
                            <Heart size={36} className="text-red-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            Your wishlist is empty
                        </h2>
                        <p className="text-gray-500 text-sm mb-6 text-center max-w-xs">
                            Save items you love to your wishlist and come back to them anytime.
                        </p>
                        <Link
                            href="/products"
                            className="flex items-center gap-2 px-6 py-2.5
                                bg-[#3489FF] hover:bg-blue-600 text-white text-sm
                                font-medium rounded-xl transition-colors"
                        >
                            <ShoppingBag size={16} />
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-6 items-start">

                        {/* ── Left — Items table ── */}
                        <div className="flex-1 min-w-0">
                            <div className="bg-white rounded-2xl border border-gray-100
                                shadow-sm overflow-hidden">

                                {/* Table header */}
                                <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto]
                                    gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100">
                                    {["Product", "Price", "Quantity", "Subtotal", ""].map((h) => (
                                        <span key={h}
                                            className="text-[12px] font-semibold text-gray-500
                                                uppercase tracking-wider">
                                            {h}
                                        </span>
                                    ))}
                                </div>

                                {/* Items */}
                                <div className="divide-y divide-gray-50">
                                    {wishlist.map((item: any) => {
                                        const price    = item.sale_price ?? item.regular_price;
                                        const subtotal = price * item.quantity;
                                        const inCart   = isInCart(item.id);

                                        return (
                                            <div
                                                key={item.id}
                                                className="flex flex-col md:grid
                                                    md:grid-cols-[2fr_1fr_1fr_1fr_auto]
                                                    gap-4 items-center px-6 py-5
                                                    hover:bg-gray-50/60 transition-colors"
                                            >
                                                {/* Product info */}
                                                <div className="flex items-center gap-4 w-full">
                                                    <Link
                                                        href={`/product/${item.slug}`}
                                                        className="flex-shrink-0 w-[72px] h-[72px]
                                                            bg-[#EEF2FF] rounded-xl overflow-hidden
                                                            border border-gray-100 flex items-center
                                                            justify-center p-1.5"
                                                    >
                                                        <Image
                                                            src={item.images?.[0]?.url || ""}
                                                            alt={item.title}
                                                            width={64}
                                                            height={64}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </Link>
                                                    <div className="min-w-0">
                                                        <Link href={`/product/${item.slug}`}>
                                                            <p className="text-[14px] font-semibold
                                                                text-gray-800 line-clamp-2
                                                                hover:text-[#3489FF] transition-colors
                                                                leading-snug">
                                                                {item.title}
                                                            </p>
                                                        </Link>
                                                        {item.brand && (
                                                            <p className="text-[12px] text-gray-400 mt-0.5">
                                                                {item.brand}
                                                            </p>
                                                        )}
                                                        {/* Mobile: price below name */}
                                                        <p className="md:hidden text-[13px]
                                                            font-bold text-gray-900 mt-1">
                                                            ₹{price?.toLocaleString('en-IN')}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Price */}
                                                <div className="hidden md:flex flex-col">
                                                    <span className="text-[15px] font-bold text-gray-900">
                                                        ₹{price?.toLocaleString('en-IN')}
                                                    </span>
                                                    {item.regular_price !== item.sale_price && (
                                                        <span className="text-[12px] text-gray-400
                                                            line-through">
                                                            ₹{item.regular_price?.toLocaleString('en-IN')}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Quantity stepper */}
                                                <div className="flex items-center">
                                                    <div className="flex items-center border border-gray-200
                                                        rounded-xl overflow-hidden">
                                                        <button
                                                            type="button"
                                                            onClick={() => decreaseQuantity(item.id)}
                                                            disabled={item.quantity <= 1}
                                                            className="w-9 h-9 flex items-center justify-center
                                                                text-gray-600 hover:bg-gray-100
                                                                disabled:opacity-30 disabled:cursor-not-allowed
                                                                transition-colors text-lg font-medium"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="w-9 text-center text-[14px]
                                                            font-semibold text-gray-800">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => increaseQuantity(item.id)}
                                                            className="w-9 h-9 flex items-center justify-center
                                                                text-gray-600 hover:bg-gray-100
                                                                transition-colors text-lg font-medium"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Subtotal */}
                                                <div className="hidden md:block">
                                                    <span className="text-[15px] font-bold text-gray-900">
                                                        ₹{subtotal?.toLocaleString('en-IN')}
                                                    </span>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 w-full md:w-auto">
                                                    <button
                                                        type="button"
                                                        onClick={() => !inCart && handleAddToCart(item)}
                                                        disabled={inCart}
                                                        className={`flex items-center gap-1.5 px-3 py-2
                                                            rounded-lg text-[12px] font-semibold
                                                            transition-all duration-150
                                                            ${inCart
                                                                ? "bg-green-50 text-green-600 border border-green-200 cursor-default"
                                                                : "bg-[#3489FF] hover:bg-blue-600 text-white active:scale-95"
                                                            }`}
                                                    >
                                                        <ShoppingCart size={13} />
                                                        {inCart ? "In Cart" : "Add to Cart"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(item.id)}
                                                        aria-label="Remove from wishlist"
                                                        className="p-2 rounded-lg text-gray-400
                                                            hover:text-red-500 hover:bg-red-50
                                                            transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* ── Right — Order summary ── */}
                        <div className="w-full lg:w-[300px] flex-shrink-0">
                            <div className="bg-white rounded-2xl border border-gray-100
                                shadow-sm p-5 sticky top-24">
                                <h3 className="text-base font-semibold text-gray-900 mb-4">
                                    Summary
                                </h3>

                                <div className="flex flex-col gap-3 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Items ({totalItems})</span>
                                        <span className="font-medium text-gray-800">
                                            ₹{totalPrice.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Delivery</span>
                                        <span className="text-green-600 font-medium">Free</span>
                                    </div>
                                    <div className="border-t border-gray-100 pt-3 flex
                                        justify-between font-semibold text-gray-900 text-[15px]">
                                        <span>Total</span>
                                        <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        wishlist.forEach((item: any) => {
                                            if (!isInCart(item.id)) {
                                                handleAddToCart(item);
                                            }
                                        });
                                    }}
                                    className="w-full mt-5 flex items-center justify-center gap-2
                                        bg-[#3489FF] hover:bg-blue-600 active:scale-[0.98]
                                        text-white font-semibold text-sm py-3 rounded-xl
                                        transition-all duration-150"
                                >
                                    <ShoppingCart size={16} />
                                    Add All to Cart
                                </button>

                                <Link
                                    href="/products"
                                    className="w-full mt-3 flex items-center justify-center gap-2
                                        border border-gray-200 hover:border-gray-300
                                        text-gray-600 hover:text-gray-800
                                        text-sm font-medium py-3 rounded-xl
                                        transition-all duration-150"
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;