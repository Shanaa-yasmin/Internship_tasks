import { createSlice } from '@reduxjs/toolkit';

const emptyCart = { items: [], totalQuantity: 0, totalPrice: 0 };

const normalizeCart = (cart) => ({
  items: Array.isArray(cart?.items) ? cart.items : [],
  totalQuantity: Number.isFinite(cart?.totalQuantity) ? cart.totalQuantity : 0,
  totalPrice: Number.isFinite(cart?.totalPrice) ? cart.totalPrice : 0,
});

const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem('cart');
    return saved ? normalizeCart(JSON.parse(saved)) : emptyCart;
  } catch {
    return emptyCart;
  }
};

const recalculate = (items) => ({
  totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
  totalPrice: parseFloat(items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)),
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: loadCartFromStorage(),
  reducers: {
    addToCart(state, action) {
      const product = action.payload;
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...product, quantity: 1 });
      }
      const totals = recalculate(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalPrice = totals.totalPrice;
      localStorage.setItem('cart', JSON.stringify(state));
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((i) => i.id !== action.payload);
      const totals = recalculate(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalPrice = totals.totalPrice;
      localStorage.setItem('cart', JSON.stringify(state));
    },
    updateQuantity(state, action) {
      const { id, quantity } = action.payload;
      if (quantity < 1) {
        state.items = state.items.filter((i) => i.id !== id);
      } else {
        const item = state.items.find((i) => i.id === id);
        if (item) item.quantity = quantity;
      }
      const totals = recalculate(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalPrice = totals.totalPrice;
      localStorage.setItem('cart', JSON.stringify(state));
    },
    clearCart(state) {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
      localStorage.removeItem('cart');
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
