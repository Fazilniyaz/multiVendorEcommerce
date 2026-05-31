import {create} from 'zustand';
import {persist} from 'zustand/middleware';


type Product = {
    id: string;
    title: string;
    price: number;
    image: string;
    quantity?: number;
    shopId: string;
}


type Store = {
    cart : Product[];
    wishlist : Product[];
    addToCart: (product: Product, user:any, location : any, deviceInfo : string) => void;
    removeFromCart: (productId: string, user:any, location : any, deviceInfo : string) => void;
    addToWishlist: (product: Product, user:any, location : any, deviceInfo : string) => void;
    removeFromWishlist: (productId: string, user:any, location : any, deviceInfo : string) => void;
}

export const useStore = create<Store>()(
    persist(
        (set, get) => ({
            cart: [],
            wishlist: [],

            addToCart: (product, user, location, deviceInfo) => {
                set((state) => {
                    const existing = state.cart.find(p => p.id === product.id);
                    if (existing) {
                        return {
                            ...state,
                            cart: state.cart.map(p =>
                                p.id === product.id
                                    ? { ...p, quantity: (p.quantity || 1) + 1 }
                                    : p
                            ),
                        };
                    }
                    return {
                        ...state,
                        cart: [...state.cart, { ...product, quantity: 1 }],
                    };
                });
            },

            removeFromCart: (productId, user, location, deviceInfo) => {

                // const removeProduct = get().cart.find(p => p.id === productId);

                set((state) => ({
                    ...state,
                    cart: state.cart.filter(p => p.id !== productId),
                }));
            },

            addToWishlist: (product, user, location, deviceInfo) => {
                set((state) => {
                    const existing = state.wishlist.find(p => p.id === product.id);
                    if (existing) {
                        return state;
                    }
                    return {
                        ...state,
                        wishlist: [...state.wishlist, product],
                    };
                });
            },

            removeFromWishlist: (productId, user, location, deviceInfo) => {
                set((state) => ({
                    ...state,
                    wishlist: state.wishlist.filter(p => p.id !== productId),
                }));
            },
        }),
        {
            name: 'store-storage',
        }
    )
)
            
                