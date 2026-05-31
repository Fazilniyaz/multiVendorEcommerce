"use client"

import { useRouter } from "next/navigation"
import {
    ArrowRight,
    ShieldCheck,
    Truck,
    HeadphonesIcon,
    ShoppingBag,
    Tag,
    BadgeCheck,
    RefreshCw,
} from "lucide-react"
import SectionTitle from "../../components/section/section-title"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "../../../utils/axiosInstance"
import ProductCard from "../../components/cards/product-card"

const Hero = () => {


      const {data : products , isLoading, isError} = useQuery({
    queryKey : ["products"],
    queryFn : async () => {
      const res = await axiosInstance.get("/product/api/get-all-products?page=1&limit=10");
      return res.data.products
    },
    staleTime : 1000 * 60 * 5
  })

   const {data : latestProducts } = useQuery({
    queryKey : ["latest-products"],
    queryFn : async () => {
      const res = await axiosInstance.get("/product/api/get-all-products?page=1&limit=10&type=latest");
      return res.data.products
    },
    staleTime : 1000 * 60 * 5
  })

    const router = useRouter()

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&display=swap');

                .hero-root {
                    font-family: 'Manrope', sans-serif;
                    width: 100%;
                }

                /* ── HERO CARD ─────────────────────────────────────────────
                   Single block — image fills entire card as background,
                   text content sits on top (left side), no left/right split.
                ─────────────────────────────────────────────────────────── */
                .hero-card {
                    position: relative;
                    border-radius: 20px;
                    overflow: hidden;
                    min-height: 500px;
                    margin: 12px 0 0 0;
                    width: 100%;
                    background: #dce8fd;
                    display: flex;
                    align-items: stretch;
                }

                /* ── BACKGROUND IMAGE — full width, full height ── */
                .hero-bg-img {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: right center;
                    z-index: 10;
                    display: block;
                }

                /* ── BLUE CIRCLE — sits right-center behind products ── */
                .hero-circle {
                    position: absolute;
                    width: 56%;
                    padding-bottom: 56%;
                    bottom: -18%;
                    right: -4%;
                    border-radius: 50%;
                    background: #b2ccf5;
                    z-index: 1;
                    pointer-events: none;
                }

                /* ── LEFT GRADIENT FADE — makes text readable over image ── */
                .hero-overlay {
                    position: absolute;
                    inset: 0;
                    /* strong fade on the left where text lives, transparent on right */
                    background: linear-gradient(
                        90deg,
                        #dce8fd 0%,
                        #dce8fd 38%,
                        rgba(220,232,253,0.85) 52%,
                        rgba(220,232,253,0.2) 68%,
                        transparent 100%
                    );
                    z-index: 2;
                    pointer-events: none;
                }

                /* ── TEXT CONTENT — sits over everything, left-aligned ── */
                .hero-content {
                    position: relative;
                    z-index: 3;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    padding: 64px 52px;
                }

                .hero-text {
                    max-width: 520px;
                    display: flex;
                    flex-direction: column;
                }

                /* eyebrow pill */
                .hero-eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: #fff;
                    border-radius: 30px;
                    padding: 7px 16px 7px 12px;
                    width: fit-content;
                    margin-bottom: 26px;
                    box-shadow: 0 2px 10px rgba(26,86,219,0.10);
                }
                .hero-eyebrow svg {
                    color: #1a56db;
                    width: 14px; height: 14px; flex-shrink: 0;
                }
                .hero-eyebrow span {
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 0.10em;
                    text-transform: uppercase;
                    color: #1a56db;
                }

                /* BIG headline */
                .hero-headline {
                    font-size: clamp(2.8rem, 4.5vw, 5.2rem);
                    font-weight: 900;
                    color: #0d1b3e;
                    line-height: 1.04;
                    margin: 0 0 20px 0;
                    letter-spacing: -0.025em;
                }

                .hero-body {
                    font-size: 0.95rem;
                    color: #4a5a7a;
                    line-height: 1.75;
                    margin-bottom: 36px;
                }

                /* buttons */
                .hero-btns {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin-bottom: 48px;
                    flex-wrap: wrap;
                }

                .hero-btn-primary {
                    display: inline-flex;
                    align-items: center;
                    gap: 9px;
                    background: #1a56db;
                    color: #fff;
                    font-family: 'Manrope', sans-serif;
                    font-weight: 700;
                    font-size: 0.94rem;
                    padding: 15px 30px;
                    border-radius: 10px;
                    border: none;
                    cursor: pointer;
                    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
                    box-shadow: 0 6px 20px rgba(26,86,219,0.38);
                }
                .hero-btn-primary:hover {
                    background: #1447c0;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 28px rgba(26,86,219,0.45);
                }
                .hero-btn-primary:hover .hero-arrow { transform: translateX(4px); }
                .hero-arrow { transition: transform 0.2s ease; }

                .hero-btn-outline {
                    display: inline-flex;
                    align-items: center;
                    gap: 9px;
                    background: #fff;
                    color: #0d1b3e;
                    font-family: 'Manrope', sans-serif;
                    font-weight: 700;
                    font-size: 0.94rem;
                    padding: 14px 26px;
                    border-radius: 10px;
                    border: 1.5px solid #dde4f5;
                    cursor: pointer;
                    transition: border-color 0.2s, transform 0.15s;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                }
                .hero-btn-outline:hover {
                    border-color: #1a56db;
                    transform: translateY(-2px);
                }
                .hero-btn-outline svg { color: #1a56db; }

                /* trust strip */
                .hero-trust {
                    display: flex;
                    gap: 24px;
                    flex-wrap: wrap;
                }
                .hero-trust-item {
                    display: flex;
                    align-items: center;
                    gap: 11px;
                }
                .hero-trust-icon {
                    width: 38px; height: 38px;
                    background: #fff;
                    border-radius: 9px;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
                }
                .hero-trust-icon svg { color: #1a56db; width: 17px; height: 17px; }
                .hero-trust-label { font-size: 0.82rem; font-weight: 700; color: #0d1b3e; line-height: 1.25; }
                .hero-trust-sub   { font-size: 0.70rem; color: #8a9abf; line-height: 1.25; }

                /* 50% OFF badge — top right corner of hero card */
                .hero-badge {
                    position: absolute;
                    top: 28px;
                    right: 28px;
                    z-index: 4;
                    width: 90px; height: 90px;
                    background: #fff;
                    border-radius: 50%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 6px 24px rgba(0,0,0,0.12);
                    border: 2.5px dashed #c8d8f0;
                }
                .hero-badge-top { font-size: 0.50rem; font-weight: 700; color: #8a9abf; letter-spacing: 0.07em; text-transform: uppercase; line-height: 1; }
                .hero-badge-num { font-size: 1.65rem; font-weight: 900; color: #0d1b3e; line-height: 1.05; margin: 1px 0; }
                .hero-badge-off { font-size: 0.58rem; font-weight: 800; color: #0d1b3e; letter-spacing: 0.05em; text-transform: uppercase; line-height: 1; }

                /* ── FEATURES BAR ─────────────────────────────────────── */
                .hero-features {
                    background: #fff;
                    border-radius: 16px;
                    padding: 22px 40px;
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-top: 10px;
                    box-shadow: 0 2px 14px rgba(0,0,0,0.06);
                }
                .hero-feat-item {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }
                .hero-feat-icon {
                    width: 46px; height: 46px;
                    border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                }
                .hero-feat-icon svg { width: 22px; height: 22px; }
                .hero-feat-icon.orange { background: #fff3ea; }
                .hero-feat-icon.orange svg { color: #f97316; }
                .hero-feat-icon.pink   { background: #fef0f7; }
                .hero-feat-icon.pink svg   { color: #ec4899; }
                .hero-feat-icon.blue   { background: #eff6ff; }
                .hero-feat-icon.blue svg   { color: #3b82f6; }
                .hero-feat-icon.purple { background: #f5f3ff; }
                .hero-feat-icon.purple svg { color: #8b5cf6; }
                .hero-feat-title { font-size: 0.86rem; font-weight: 700; color: #0d1b3e; }
                .hero-feat-sub   { font-size: 0.72rem; color: #8a9abf; }

                /* ── RESPONSIVE ───────────────────────────────────────── */
                @media (max-width: 768px) {
                    .hero-card { min-height: 420px; }
                    .hero-content { padding: 48px 28px; }
                    .hero-text { max-width: 100%; }
                    .hero-overlay {
                        background: linear-gradient(
                            90deg,
                            #dce8fd 0%,
                            #dce8fd 50%,
                            rgba(220,232,253,0.9) 70%,
                            rgba(220,232,253,0.4) 100%
                        );
                    }
                    .hero-circle { width: 65%; padding-bottom: 65%; }
                    .hero-features { grid-template-columns: repeat(2, 1fr); padding: 20px; }
                    .hero-badge { width: 75px; height: 75px; top: 16px; right: 16px; }
                    .hero-badge-num { font-size: 1.35rem; }
                }

                @media (max-width: 520px) {
                    .hero-headline { font-size: 2.4rem; }
                    .hero-content  { padding: 40px 20px; }
                    .hero-card     { min-height: 480px; }
                    .hero-bg-img   { object-position: 80% center; }
                    .hero-overlay  {
                        background: linear-gradient(
                            90deg,
                            #dce8fd 0%,
                            #dce8fd 60%,
                            rgba(220,232,253,0.95) 80%,
                            rgba(220,232,253,0.5) 100%
                        );
                    }
                    .hero-features { grid-template-columns: 1fr 1fr; gap: 10px; padding: 16px; }
                    .hero-trust    { gap: 16px; }
                }
            `}</style>

            <div className="hero-root">

                {/* ══ HERO CARD — single block, image as background ══ */}
                <div className="hero-card">

                    {/* Blue circle behind product image (right side) */}
                    <div className="hero-circle" />

                    {/* Full-width background image — replace src with your actual path */}
                    <img
                        className="hero-bg-img"
                        src="/images/hero-banner.png"
                        alt=""
                        aria-hidden="true"
                    />

                    {/* Gradient overlay so left text stays readable */}
                    <div className="hero-overlay"   style={{zIndex : 20}}/>

                    {/* Text content — overlaid on left side */}
                    <div className="hero-content"  style={{zIndex : 20}}>
                        <div className="hero-text">
                            <div className="hero-eyebrow">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                                    strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                                <span>Best Quality Products</span>
                            </div>

                            <h1 className="hero-headline"  style={{zIndex : 20}}>
                                Shop More.<br />Save More.
                            </h1>

                            <p className="hero-body"  style={{zIndex : 20}}>
                                Discover top quality products at unbeatable prices.<br />
                                Shop smart, save big!
                            </p>

                            <div className="hero-btns"  style={{zIndex : 20}}>
                                <button className="hero-btn-primary" onClick={() => router.push("/products")}>
                                    Shop Now <ArrowRight size={16} className="hero-arrow" />
                                </button>
                                <button className="hero-btn-outline" onClick={() => router.push("/offers")}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71A2.41 2.41 0 0 0 10.3 2.71Z" />
                                    </svg>
                                    Explore Offers
                                </button>
                            </div>

                            <div className="hero-trust"  style={{zIndex : 20}}>
                                <div className="hero-trust-item">
                                    <div className="hero-trust-icon"><ShieldCheck /></div>
                                    <div>
                                        <div className="hero-trust-label">Secure Payments</div>
                                        <div className="hero-trust-sub">100% Protected</div>
                                    </div>
                                </div>
                                <div className="hero-trust-item">
                                    <div className="hero-trust-icon"><Truck /></div>
                                    <div>
                                        <div className="hero-trust-label">Free Delivery</div>
                                        <div className="hero-trust-sub">On orders above ₹499</div>
                                    </div>
                                </div>
                                <div className="hero-trust-item">
                                    <div className="hero-trust-icon"><HeadphonesIcon /></div>
                                    <div>
                                        <div className="hero-trust-label">24/7 Support</div>
                                        <div className="hero-trust-sub">We're here to help</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 50% OFF badge */}
                    <div className="hero-badge"  style={{zIndex : 20}}>
                        <span className="hero-badge-top">UP TO</span>
                        <span className="hero-badge-num">50%</span>
                        <span className="hero-badge-off">OFF</span>
                    </div>

                </div>
                {/* ══ END HERO CARD ══ */}


                {/* ══ FEATURES BAR ══ */}
                <div className="hero-features">
                    <div className="hero-feat-item"  style={{zIndex : 20}}>
                        <div className="hero-feat-icon orange"><ShoppingBag /></div>
                        <div>
                            <div className="hero-feat-title">Wide Selection</div>
                            <div className="hero-feat-sub">Thousands of products</div>
                        </div>
                    </div>
                    <div className="hero-feat-item"  style={{zIndex : 20}}>
                        <div className="hero-feat-icon pink"><Tag /></div>
                        <div>
                            <div className="hero-feat-title">Best Prices</div>
                            <div className="hero-feat-sub">Unbeatable deals</div>
                        </div>
                    </div>
                    <div className="hero-feat-item"  style={{zIndex : 20}}>
                        <div className="hero-feat-icon blue"><BadgeCheck /></div>
                        <div>
                            <div className="hero-feat-title">Trusted Sellers</div>
                            <div className="hero-feat-sub">Quality you can trust</div>
                        </div>
                    </div>
                    <div className="hero-feat-item"  style={{zIndex : 20}}>
                        <div className="hero-feat-icon purple"><RefreshCw /></div>
                        <div>
                            <div className="hero-feat-title" >Easy Returns</div>
                            <div className="hero-feat-sub">Hassle free returns</div>
                        </div>
                    </div>
                </div>
                {/* ══ END FEATURES BAR ══ */}


                {/* ══ SUGGESTED PRODUCTS ══ */}
                <div className="md:w-[80%] w-[90%] my-10 m-auto">
                    <div className="mb-8">
                        <SectionTitle title="Suggested Products" />
                    </div>

                    {isLoading && ( <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="h-[250px] bg-gray-300 animate-pulse rounded-xl" />
                        ))}
                    </div>) }

                    {!isLoading && !isError && <div  className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
                        {products.map((product: any) => (
                            // <div key={product._id} className="h-[250px] bg-gray-100 rounded-xl flex items-center justify-center">
                            //     <span className="text-sm font-medium text-gray-500">{product.name}</span>
                            // </div>
                            <ProductCard key={product._id} product={product} isEvent={false} />
                        ))}
                    </div>}


                </div>
                

            </div>
        </>
    )
}

export default Hero