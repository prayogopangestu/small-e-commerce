import { create } from 'zustand';
import { getCart, addToCart as addToCartApi, updateCartItem, removeFromCart as removeFromCartApi } from '../services/cartService';

const useCart = create((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getCart();
      set({ cart: response.data.cart, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addToCart: async (item) => {
    set({ isLoading: true, error: null });
    try {
      const response = await addToCartApi(item);
      set({ cart: response.data.cart, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateCartItem: async (itemId, quantity) => {
    set({ isLoading: true, error: null });
    try {
      const response = await updateCartItem(itemId, quantity);
      set({ cart: response.data.cart, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  removeFromCart: async (itemId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await removeFromCartApi(itemId);
      set({ cart: response.data.cart, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearCart: () => {
    set({ cart: null });
  },

  getCartTotal: () => {
    const { cart } = get();
    if (!cart) return 0;
    return cart.subtotal || 0;
  },

  getCartItemsCount: () => {
    const { cart } = get();
    if (!cart) return 0;
    return cart.totalItems || 0;
  },
}));

export default useCart;
