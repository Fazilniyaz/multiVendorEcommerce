import { sendKafkaEvent } from "@/actions/track-user";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity?: number;
  shopId: string;
};

type Store = {
  cart: Product[];
  wishlist: Product[];
  addToCart: (
    product: Product,
    user: any,
    location: any,
    deviceInfo: string,
  ) => void;
  removeFromCart: (
    productId: string,
    user: any,
    location: any,
    deviceInfo: string,
  ) => void;
  addToWishlist: (
    product: Product,
    user: any,
    location: any,
    deviceInfo: string,
  ) => void;
  removeFromWishlist: (
    productId: string,
    user: any,
    location: any,
    deviceInfo: string,
  ) => void;
  isInWishlist: (productId: string) => boolean;
  isInCart: (productId: string) => boolean;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],

      addToCart: (product, user, location, deviceInfo) => {
        console.log(user, location, deviceInfo);
        const existing = get().cart.find((p) => p.id === product.id);
        if (existing) {
          set((state) => ({
            ...state,
            cart: state.cart.map((p) =>
              p.id === product.id
                ? { ...p, quantity: (p.quantity || 1) + 1 }
                : p,
            ),
          }));
          return;
        }

        set((state) => ({
          ...state,
          cart: [...state.cart, { ...product, quantity: 1 }],
        }));

        //send kafka event (outside set() — async calls must not be inside the synchronous state updater)
        if (user && deviceInfo && location) {
            console.log("Sending Kafka event for add_to_cart:")
          sendKafkaEvent({
            userId: user?.user?.id,
            productId: product?.id,
            shopId: product?.shopId,
            action: "add_to_cart",
            device: deviceInfo,
            country: location?.country || "Unknown",
            city: location?.city || "Unknown",
          });

          console.log("Kafka event sent for add_to_cart:", {
            userId: user?.user?.id,
            productId: product?.id,
            shopId: product?.shopId,
            action: "add_to_cart",
            device: deviceInfo,
            country: location?.country || "Unknown",
            city: location?.city || "Unknown",
          });
        }
      },

      removeFromCart: (productId, user, location, deviceInfo) => {
        const removeProduct = get().cart.find((p) => p.id === productId);
        console.log(user, location, deviceInfo);
        set((state) => ({
          ...state,
          cart: state.cart?.filter((p) => p.id !== productId),
        }));

        //send kafka event
        if (user?.user?.id && deviceInfo && location && removeProduct) {
          sendKafkaEvent({
            userId: user?.user?.id,
            productId: removeProduct?.id,
            shopId: removeProduct?.shopId,
            action: "remove_from_cart",
            device: deviceInfo,
            country: location?.country || "Unknown",
            city: location?.city || "Unknown",
          });
        }
      },

      addToWishlist: (product, user, location, deviceInfo) => {
        const existing = get().wishlist.find((p) => p.id === product.id);
        if (existing) {
          return;
        }
        console.log(user, location, deviceInfo);
        set((state) => ({
          ...state,
          wishlist: [...state.wishlist, product],
        }));

        //send kafka event (outside set())
        if (user?.user?.id && deviceInfo && location) {
          sendKafkaEvent({
            userId: user?.user?.id,
            productId: product?.id,
            shopId: product?.shopId,
            action: "add_to_wishlist",
            device: deviceInfo,
            country: location?.country || "Unknown",
            city: location?.city || "Unknown",
          });
        }
      },

      removeFromWishlist: (productId, user, location, deviceInfo) => {

        const removeProduct = get().wishlist.find((p) => p.id === productId);
        console.log(user, location, deviceInfo);
        set((state) => ({
          ...state,
          wishlist: state.wishlist.filter((p) => p.id !== productId),
        }));

         //send kafka event
        if (user?.user?.id && deviceInfo && location && removeProduct) {
          console.log("Sending Kafka event for remove_from_wishlist:")
          sendKafkaEvent({
            userId: user?.user?.id,
            productId: removeProduct?.id,
            shopId: removeProduct?.shopId,
            action: "remove_from_wishlist",
            device: deviceInfo,
            country: location?.country || "Unknown",
            city: location?.city || "Unknown",
          });
        }

      },

      isInWishlist: (productId) => {
        return get().wishlist.some((p) => p.id === productId);
      },

      isInCart: (productId) => {
        return get().cart.some((p) => p.id === productId);
      },
    }),
    {
      name: "store-storage",
    },
  ),
);
