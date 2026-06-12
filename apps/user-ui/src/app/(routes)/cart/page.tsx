"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '../../../hooks/useUser'
import useLocationTracking from '../../../hooks/useLocation'
import useDeviceTracking from '../../../hooks/useDeviceTracking'
import Link from 'next/link'
import Image from 'next/image'
import { useStore } from '../../../store'
import {
    ShoppingCart, Trash2, ArrowRight, Tag,
    ShoppingBag, Truck, Shield, RotateCcw,
    CheckCircle, XCircle, ChevronRight, Minus, Plus,
} from 'lucide-react'

export default function CartPage() {
    const router = useRouter()
    const { user } = useUser()
    const location = useLocationTracking()
    const deviceInfo = useDeviceTracking()

    const cart           = useStore((state: any) => state.cart)
    const removeFromCart = useStore((state: any) => state.removeFromCart)

    // ── Coupon state ──────────────────────────────────────
    const [couponCode, setCouponCode]               = useState('')
    const [discountPercent, setDiscountPercent]     = useState(0)
    const [discountedProductId, setDiscountedProductId] = useState('')
    const [couponStatus, setCouponStatus]           = useState<'idle' | 'success' | 'error'>('idle')
    const [couponMsg, setCouponMsg]                 = useState('')
    const [loading, setLoading]                     = useState(false)

    // ── Shipping & Payment ────────────────────────────────
    const [shippingAddress, setShippingAddress] = useState('Home - New York - USA')
    const [paymentMethod, setPaymentMethod]     = useState('Online Payment')

    // ── Quantity helpers ──────────────────────────────────
    const increaseQty = (id: string) => {
        useStore.setState((state: any) => ({
            cart: state.cart.map((i: any) =>
                i.id === id ? { ...i, quantity: i.quantity + 1 } : i
            ),
        }))
    }

    const decreaseQty = (id: string) => {
        useStore.setState((state: any) => ({
            cart: state.cart.map((i: any) =>
                i.id === id && i.quantity > 1
                    ? { ...i, quantity: i.quantity - 1 }
                    : i
            ),
        }))
    }

    // ── Coupon apply ──────────────────────────────────────
    const applyCoupon = async () => {
        if (!couponCode.trim()) return
        setLoading(true)
        try {
            const res = await fetch('/api/coupon/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode, cart }),
            })
            const data = await res.json()
            if (data.success) {
                setDiscountPercent(data.discountPercent ?? 0)
                setDiscountedProductId(data.productId ?? '')
                setCouponStatus('success')
                setCouponMsg(`${data.discountPercent}% off applied!`)
            } else {
                setDiscountPercent(0)
                setDiscountedProductId('')
                setCouponStatus('error')
                setCouponMsg(data.message ?? 'Invalid code')
            }
        } catch {
            setCouponStatus('error')
            setCouponMsg('Could not verify coupon')
        }
        setLoading(false)
    }

    // ── Totals ────────────────────────────────────────────
    const subtotal = cart.reduce(
        (sum: number, i: any) => sum + (i.sale_price ?? i.regular_price) * i.quantity,
        0
    )
    const discountAmount = discountedProductId
        ? cart
              .filter((i: any) => i.id === discountedProductId)
              .reduce(
                  (sum: number, i: any) =>
                      sum + ((i.sale_price ?? i.regular_price) * i.quantity * discountPercent) / 100,
                  0
              )
        : (subtotal * discountPercent) / 100

    const total      = subtotal - discountAmount
    const totalItems = cart.reduce((sum: number, i: any) => sum + i.quantity, 0)

    return (
        <>
            <style>{`
                .cr { font-family:'Inter',system-ui,sans-serif; }

                /* breadcrumb */
                .cr-bc { display:flex; align-items:center; gap:6px; font-size:0.8rem; color:#6b7280; margin-bottom:4px; }
                .cr-bc a { color:#6b7280; text-decoration:none; transition:color .15s; }
                .cr-bc a:hover { color:#3489FF; }

                /* layout */
                .cr-layout { display:grid; grid-template-columns:1fr 320px; gap:20px; align-items:start; }
                @media(max-width:1024px) { .cr-layout { grid-template-columns:1fr; } }

                /* items card */
                .cr-card { background:#fff; border-radius:16px; border:1px solid #e5e7eb; overflow:hidden; }

                /* table head */
                .cr-head {
                    display:grid; grid-template-columns:3fr 1fr 1.2fr 1fr 44px;
                    gap:12px; padding:12px 24px;
                    background:#f9fafb; border-bottom:1px solid #e5e7eb;
                }
                .cr-head span { font-size:0.68rem; font-weight:600; text-transform:uppercase; letter-spacing:0.07em; color:#9ca3af; }
                @media(max-width:768px) { .cr-head { display:none; } }

                /* row */
                .cr-row {
                    display:grid; grid-template-columns:3fr 1fr 1.2fr 1fr 44px;
                    gap:12px; padding:18px 24px; align-items:center;
                    border-bottom:1px solid #f3f4f6; transition:background .12s;
                }
                .cr-row:last-child { border-bottom:none; }
                .cr-row:hover { background:#fafafa; }
                @media(max-width:768px) { .cr-row { grid-template-columns:1fr; gap:12px; } }

                /* product cell */
                .cr-prod { display:flex; align-items:flex-start; gap:12px; }
                .cr-img {
                    width:72px; height:72px; flex-shrink:0;
                    background:#EEF2FF; border-radius:12px;
                    border:1px solid #e0e7ff; overflow:hidden;
                    display:flex; align-items:center; justify-content:center; padding:6px;
                }
                .cr-prod-info { min-width:0; flex:1; }
                .cr-brand { font-size:0.68rem; font-weight:700; color:#3489FF; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:2px; }
                .cr-title { font-size:0.9rem; font-weight:600; color:#111827; line-height:1.35; text-decoration:none; display:block; }
                .cr-title:hover { color:#3489FF; }

                /* option chips — selected variant only */
                .cr-opts { display:flex; flex-wrap:wrap; gap:5px; margin-top:6px; }
                .cr-chip {
                    display:inline-flex; align-items:center; gap:4px;
                    font-size:0.68rem; font-weight:500; color:#374151;
                    background:#f3f4f6; border:1px solid #e5e7eb;
                    border-radius:6px; padding:2px 8px;
                }
                .cr-color-dot {
                    width:10px; height:10px; border-radius:50%;
                    border:1px solid rgba(0,0,0,0.15); flex-shrink:0;
                }

                /* discount badge */
                .cr-disc-badge {
                    display:inline-flex; align-items:center; gap:4px;
                    font-size:0.65rem; font-weight:600; color:#ea580c;
                    background:#fff7ed; border:1px solid #fed7aa;
                    border-radius:6px; padding:2px 7px; margin-top:5px;
                }

                /* price */
                .cr-price { display:flex; flex-direction:column; gap:1px; }
                .cr-price-main { font-size:0.9rem; font-weight:700; color:#111827; }
                .cr-price-orig { font-size:0.75rem; color:#9ca3af; text-decoration:line-through; }

                /* qty stepper */
                .cr-qty {
                    display:inline-flex; align-items:center;
                    border:1.5px solid #e5e7eb; border-radius:10px; overflow:hidden; width:fit-content;
                }
                .cr-qty-btn {
                    width:34px; height:34px; display:flex; align-items:center; justify-content:center;
                    background:transparent; border:none; cursor:pointer; color:#6b7280;
                    transition:background .12s;
                }
                .cr-qty-btn:hover:not(:disabled) { background:#f3f4f6; }
                .cr-qty-btn:disabled { opacity:0.3; cursor:not-allowed; }
                .cr-qty-val {
                    width:34px; height:34px; text-align:center;
                    font-size:0.85rem; font-weight:700; color:#111827;
                    border-left:1px solid #e5e7eb; border-right:1px solid #e5e7eb;
                    display:flex; align-items:center; justify-content:center;
                }

                /* subtotal */
                .cr-sub { font-size:0.9rem; font-weight:700; color:#111827; }
                .cr-sub-disc { font-size:0.72rem; color:#16a34a; font-weight:600; margin-top:2px; }

                /* remove */
                .cr-remove {
                    width:34px; height:34px; border-radius:8px;
                    border:1.5px solid #e5e7eb; background:transparent;
                    display:flex; align-items:center; justify-content:center;
                    cursor:pointer; color:#9ca3af; transition:all .12s;
                }
                .cr-remove:hover { background:#fef2f2; border-color:#fca5a5; color:#ef4444; }

                /* discounted row */
                .cr-row.cr-discounted { border-left:3px solid #f97316; background:#fffbf5; }

                /* ── SUMMARY ── */
                .cr-sum {
                    background:#fff; border-radius:16px; border:1px solid #e5e7eb;
                    padding:22px; position:sticky; top:88px;
                }
                .cr-sum h3 { font-size:1rem; font-weight:700; color:#111827; margin-bottom:18px; }

                /* coupon */
                .cr-coupon { display:flex; gap:8px; margin-bottom:16px; }
                .cr-coupon-in {
                    flex:1; height:42px; padding:0 14px;
                    font-family:inherit; font-size:0.85rem;
                    border:1.5px solid #e5e7eb; border-radius:10px;
                    outline:none; color:#111827; background:#f9fafb;
                    transition:border-color .2s, box-shadow .2s;
                }
                .cr-coupon-in:focus { border-color:#3489FF; box-shadow:0 0 0 3px rgba(52,137,255,0.1); background:#fff; }
                .cr-coupon-in::placeholder { color:#9ca3af; }
                .cr-coupon-btn {
                    height:42px; padding:0 16px;
                    background:#3489FF; color:#fff;
                    font-family:inherit; font-size:0.82rem; font-weight:600;
                    border:none; border-radius:10px; cursor:pointer;
                    display:flex; align-items:center; gap:6px;
                    transition:background .15s;
                }
                .cr-coupon-btn:hover:not(:disabled) { background:#2563eb; }
                .cr-coupon-btn:disabled { opacity:0.5; cursor:not-allowed; }
                .cr-coupon-msg {
                    display:flex; align-items:center; gap:5px;
                    font-size:0.78rem; font-weight:600;
                    margin-top:-8px; margin-bottom:14px;
                }
                .cr-coupon-msg.success { color:#16a34a; }
                .cr-coupon-msg.error   { color:#dc2626; }

                /* select */
                .cr-select-label {
                    font-size:0.68rem; font-weight:600; text-transform:uppercase;
                    letter-spacing:0.07em; color:#9ca3af; margin-bottom:6px; display:block;
                }
                .cr-select {
                    width:100%; height:42px; padding:0 14px;
                    font-family:inherit; font-size:0.85rem; font-weight:500;
                    border:1.5px solid #e5e7eb; border-radius:10px;
                    outline:none; color:#111827; background:#f9fafb;
                    cursor:pointer; transition:border-color .2s;
                    appearance:none;
                    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%236b7280' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E");
                    background-repeat:no-repeat; background-position:right 12px center; padding-right:32px;
                    margin-bottom:14px;
                }
                .cr-select:hover { border-color:#3489FF; }
                .cr-select:focus { border-color:#3489FF; background:#fff; }

                /* summary rows */
                .cr-srow {
                    display:flex; justify-content:space-between; align-items:center;
                    font-size:0.85rem; color:#4b5563; margin-bottom:10px;
                }
                .cr-srow.cr-total {
                    font-size:1rem; font-weight:700; color:#111827;
                    padding-top:12px; border-top:1.5px solid #e5e7eb;
                    margin-top:4px; margin-bottom:0;
                }
                .cr-srow .v   { font-weight:700; color:#111827; }
                .cr-srow .dv  { font-weight:700; color:#16a34a; }
                .cr-srow .fv  { font-weight:700; color:#3489FF; }

                /* checkout */
                .cr-checkout {
                    width:100%; margin-top:16px;
                    display:flex; align-items:center; justify-content:center; gap:8px;
                    background:#3489FF; color:#fff;
                    font-family:inherit; font-weight:700; font-size:0.92rem;
                    padding:14px; border-radius:12px; border:none; cursor:pointer;
                    transition:background .15s, transform .12s;
                }
                .cr-checkout:hover:not(:disabled) { background:#2563eb; transform:translateY(-1px); }
                .cr-checkout:disabled { opacity:0.5; cursor:not-allowed; }

                .cr-continue {
                    width:100%; margin-top:10px;
                    display:flex; align-items:center; justify-content:center; gap:6px;
                    background:transparent; color:#6b7280;
                    font-family:inherit; font-weight:500; font-size:0.85rem;
                    padding:11px; border-radius:12px; border:1.5px solid #e5e7eb;
                    cursor:pointer; text-decoration:none; transition:all .12s;
                }
                .cr-continue:hover { border-color:#3489FF; color:#3489FF; background:#f0f7ff; }

                /* trust badges */
                .cr-trust { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:16px; padding-top:16px; border-top:1px solid #f3f4f6; }
                .cr-trust-item { display:flex; flex-direction:column; align-items:center; gap:4px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; padding:10px 4px; }
                .cr-trust-item svg { color:#3489FF; }
                .cr-trust-label { font-size:0.62rem; font-weight:600; color:#9ca3af; text-align:center; line-height:1.3; }

                /* empty */
                .cr-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px 24px; background:#fff; border-radius:16px; border:1px solid #e5e7eb; text-align:center; }
                .cr-empty-icon { width:72px; height:72px; background:#eff6ff; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:16px; }
                .cr-empty h2 { font-size:1.2rem; font-weight:700; color:#111827; margin-bottom:6px; }
                .cr-empty p { font-size:0.88rem; color:#6b7280; margin-bottom:24px; max-width:280px; }
                .cr-empty-btn { display:inline-flex; align-items:center; gap:8px; background:#3489FF; color:#fff; font-weight:600; font-size:0.88rem; padding:12px 24px; border-radius:12px; text-decoration:none; transition:background .15s; }
                .cr-empty-btn:hover { background:#2563eb; }
            `}</style>

            <div className="cr w-full bg-gray-50 min-h-screen">
                <div className="w-[90%] md:w-[85%] max-w-[1280px] mx-auto py-8">

                    {/* ── Header ── */}
                    <div className="mb-7">
                        <nav className="cr-bc">
                            <Link href="/">Home</Link>
                            <ChevronRight size={12} />
                            <span style={{ color: '#111827', fontWeight: 600 }}>Shopping Cart</span>
                        </nav>
                        <div className="flex items-center justify-between flex-wrap gap-3 mt-1">
                            <div className="flex items-center gap-3">
                                <h1 style={{
                                    fontSize: 'clamp(1.5rem,3vw,2rem)',
                                    fontWeight: 800, color: '#111827',
                                    lineHeight: 1.1, margin: 0
                                }}>
                                    Shopping Cart
                                </h1>
                                {cart.length > 0 && (
                                    <span style={{
                                        background: '#3489FF', color: '#fff',
                                        fontSize: '0.78rem', fontWeight: 600,
                                        padding: '3px 11px', borderRadius: '20px',
                                    }}>
                                        {totalItems} {totalItems === 1 ? 'item' : 'items'}
                                    </span>
                                )}
                            </div>
                            {cart.length > 0 && (
                                <Link href="/products" style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    fontSize: '0.84rem', fontWeight: 600,
                                    color: '#3489FF', textDecoration: 'none',
                                }}>
                                    Continue Shopping <ArrowRight size={14} />
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* ── Empty state ── */}
                    {cart.length === 0 ? (
                        <div className="cr-empty">
                            <div className="cr-empty-icon">
                                <ShoppingCart size={32} color="#3489FF" />
                            </div>
                            <h2>Your cart is empty</h2>
                            <p>Add items you love and come back to checkout when ready.</p>
                            <Link href="/products" className="cr-empty-btn">
                                <ShoppingBag size={16} /> Browse Products
                            </Link>
                        </div>
                    ) : (
                        <div className="cr-layout">

                            {/* ══ LEFT — Items ══ */}
                            <div className="cr-card">

                                {/* Table header */}
                                <div className="cr-head">
                                    <span>Product</span>
                                    <span>Price</span>
                                    <span>Quantity</span>
                                    <span>Subtotal</span>
                                    <span />
                                </div>

                                {/* Rows */}
                                {cart.map((item: any) => {
                                    const price   = item.sale_price ?? item.regular_price
                                    const rowSub  = price * item.quantity
                                    const isDisc  = discountedProductId === item.id
                                    const discVal = isDisc ? (rowSub * discountPercent) / 100 : 0

                                    // ── Selected variant fields ────────────────────────
                                    // (selectedColor, selectedSize, selectedCustomProps are
                                    //  stored directly on the cart item when added)

                                    return (
                                        <div
                                            key={item.id}
                                            className={`cr-row${isDisc ? ' cr-discounted' : ''}`}
                                        >
                                            {/* ── Product info ── */}
                                            <div className="cr-prod">
                                                <Link
                                                    href={`/product/${item.slug}`}
                                                    className="cr-img"
                                                >
                                                    {item.images?.[0]?.url
                                                        ? <Image
                                                            src={item.images[0].url}
                                                            alt={item.title}
                                                            width={60}
                                                            height={60}
                                                            style={{ width:'100%', height:'100%', objectFit:'contain' }}
                                                          />
                                                        : <ShoppingBag size={24} color="#9ca3af" />
                                                    }
                                                </Link>
                                                <div className="cr-prod-info">
                                                    {item.brand && (
                                                        <div className="cr-brand">{item.brand}</div>
                                                    )}
                                                    <Link
                                                        href={`/product/${item.slug}`}
                                                        className="cr-title"
                                                    >
                                                        {item.title}
                                                    </Link>

                                                    {/* ✅ Selected variant chips only */}
                                                    {(() => {
                                                        const chips: React.ReactNode[] = [];

                                                        // Selected color
                                                        if (item.selectedColor) {
                                                            chips.push(
                                                                <span key="color" className="cr-chip">
                                                                    <span
                                                                        className="cr-color-dot"
                                                                        style={{ backgroundColor: item.selectedColor }}
                                                                    />
                                                                    {item.selectedColor}
                                                                </span>
                                                            );
                                                        }

                                                        // Selected size
                                                        if (item.selectedSize) {
                                                            chips.push(
                                                                <span key="size" className="cr-chip">
                                                                    Size: {item.selectedSize}
                                                                </span>
                                                            );
                                                        }

                                                        // Selected custom properties
                                                        if (item.selectedCustomProps) {
                                                            Object.entries(item.selectedCustomProps as Record<string, string>)
                                                                .filter(([, v]) => v)
                                                                .forEach(([k, v]) => {
                                                                    chips.push(
                                                                        <span key={k} className="cr-chip">
                                                                            {k}: {v}
                                                                        </span>
                                                                    );
                                                                });
                                                        }

                                                        return chips.length > 0
                                                            ? <div className="cr-opts">{chips}</div>
                                                            : null;
                                                    })()}

                                                    {/* Discount badge */}
                                                    {isDisc && discountPercent > 0 && (
                                                        <div className="cr-disc-badge">
                                                            <Tag size={9} />
                                                            {discountPercent}% off applied
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* ── Price ── */}
                                            <div className="cr-price">
                                                <span className="cr-price-main">
                                                    ₹{price?.toLocaleString('en-IN')}
                                                </span>
                                                {item.regular_price !== item.sale_price && (
                                                    <span className="cr-price-orig">
                                                        ₹{item.regular_price?.toLocaleString('en-IN')}
                                                    </span>
                                                )}
                                            </div>

                                            {/* ── Quantity stepper ── */}
                                            <div className="cr-qty">
                                                <button
                                                    className="cr-qty-btn"
                                                    onClick={() => decreaseQty(item.id)}
                                                    disabled={item.quantity <= 1}
                                                    aria-label="Decrease"
                                                >
                                                    <Minus size={13} />
                                                </button>
                                                <span className="cr-qty-val">{item.quantity}</span>
                                                <button
                                                    className="cr-qty-btn"
                                                    onClick={() => increaseQty(item.id)}
                                                    aria-label="Increase"
                                                >
                                                    <Plus size={13} />
                                                </button>
                                            </div>

                                            {/* ── Row subtotal ── */}
                                            <div>
                                                <div className="cr-sub">
                                                    ₹{rowSub?.toLocaleString('en-IN')}
                                                </div>
                                                {isDisc && discVal > 0 && (
                                                    <div className="cr-sub-disc">
                                                        −₹{discVal.toFixed(0)}
                                                    </div>
                                                )}
                                            </div>

                                            {/* ── Remove ── */}
                                            <button
                                                className="cr-remove"
                                                onClick={() => removeFromCart(item.id, user, location, deviceInfo)}
                                                aria-label="Remove"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* ══ RIGHT — Summary ══ */}
                            <div className="cr-sum">
                                <h3>Order Summary</h3>

                                {/* Coupon */}
                                <div className="cr-coupon">
                                    <input
                                        className="cr-coupon-in"
                                        placeholder="Enter coupon code"
                                        value={couponCode}
                                        onChange={(e) => {
                                            setCouponCode(e.target.value)
                                            setCouponStatus('idle')
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                                    />
                                    <button
                                        className="cr-coupon-btn"
                                        onClick={applyCoupon}
                                        disabled={loading || !couponCode.trim()}
                                    >
                                        <Tag size={13} />
                                        {loading ? '...' : 'Apply'}
                                    </button>
                                </div>
                                {couponStatus !== 'idle' && (
                                    <div className={`cr-coupon-msg ${couponStatus}`}>
                                        {couponStatus === 'success'
                                            ? <CheckCircle size={13} />
                                            : <XCircle size={13} />
                                        }
                                        {couponMsg}
                                    </div>
                                )}

                                {/* Shipping */}
                                <label className="cr-select-label">Shipping Address</label>
                                <select
                                    className="cr-select"
                                    value={shippingAddress}
                                    onChange={(e) => setShippingAddress(e.target.value)}
                                >
                                    <option value="Home - New York - USA">Home — New York, USA</option>
                                    <option value="Office - San Francisco - USA">Office — San Francisco, USA</option>
                                    <option value="Home - Los Angeles - USA">Home — Los Angeles, USA</option>
                                </select>

                                {/* Payment */}
                                <label className="cr-select-label">Payment Method</label>
                                <select
                                    className="cr-select"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    <option value="Online Payment">Online Payment</option>
                                    <option value="Cash on Delivery">Cash on Delivery</option>
                                </select>

                                {/* Totals */}
                                <div className="cr-srow">
                                    <span>Subtotal ({totalItems} items)</span>
                                    <span className="v">₹{subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="cr-srow">
                                        <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                                            <Tag size={12} color="#16a34a" /> Coupon Discount
                                        </span>
                                        <span className="dv">−₹{discountAmount.toFixed(0)}</span>
                                    </div>
                                )}
                                <div className="cr-srow">
                                    <span>Delivery</span>
                                    <span className="fv">Free</span>
                                </div>
                                <div className="cr-srow cr-total">
                                    <span>Total</span>
                                    <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
                                </div>

                                {/* Checkout button */}
                                <button
                                    className="cr-checkout"
                                    onClick={() => router.push('/checkout')}
                                    disabled={cart.length === 0}
                                >
                                    Proceed to Checkout <ArrowRight size={16} />
                                </button>
                                <Link href="/products" className="cr-continue">
                                    Continue Shopping
                                </Link>

                                {/* Trust badges */}
                                <div className="cr-trust">
                                    {[
                                        { icon: Truck,     label: 'Free Delivery'   },
                                        { icon: Shield,    label: 'Secure Payment'  },
                                        { icon: RotateCcw, label: 'Easy Returns'    },
                                    ].map(({ icon: Icon, label }) => (
                                        <div key={label} className="cr-trust-item">
                                            <Icon size={16} />
                                            <span className="cr-trust-label">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </>
    )
}