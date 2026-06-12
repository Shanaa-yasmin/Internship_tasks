import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../redux/cartSlice';
import CartItem from '../components/CartItem';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, totalQuantity, totalPrice } = useSelector((s) => s.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const shipping = totalPrice > 100 ? 0 : 9.99;
  const tax = parseFloat((totalPrice * 0.08).toFixed(2));
  const grandTotal = parseFloat((totalPrice + shipping + tax).toFixed(2));

  const handleClear = () => {
    dispatch(clearCart());
    toast('Cart cleared', { icon: '🗑️', style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' } });
  };

  if (items.length === 0) {
    return (
      <main className="w-full px-4 sm:px-6 py-16 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6">
          <ShoppingCart size={40} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-dark mb-2">Your cart is empty</h2>
        <p className="text-gray-400 mb-8 text-sm">Looks like you haven't added anything yet.</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <ShoppingBag size={16} /> Browse Products
        </Link>
      </main>
    );
  }

  return (
    <main className="w-full px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-dark">Your Cart</h1>
          <p className="text-gray-400 text-xs mt-0.5">{totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}</p>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-accent transition-colors px-3 py-2 rounded-lg hover:bg-rose-50"
        >
          <Trash2 size={14} /> <span className="hidden sm:inline">Clear cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
          <div className="mt-2">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
              ← Continue shopping
            </Link>
          </div>
        </div>

        {/* Order summary — stacks below items on mobile */}
        <div className="lg:col-span-1">
          <div className="card p-4 sm:p-5 lg:sticky lg:top-24">
            <h2 className="font-semibold text-dark mb-4">Order Summary</h2>

            {totalPrice > 0 && totalPrice <= 100 && (
              <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700">
                🎁 Add <strong>${(100 - totalPrice).toFixed(2)}</strong> more for free shipping!
              </div>
            )}
            {totalPrice > 100 && (
              <div className="mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-700">
                ✅ You've unlocked <strong>free shipping</strong>!
              </div>
            )}

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal ({totalQuantity} items)</span>
                <span className="text-dark font-medium">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-secondary font-medium' : 'text-dark font-medium'}>
                  {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tax (8%)</span>
                <span className="text-dark font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="h-px bg-gray-100 my-1" />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-primary">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full mt-5 btn-primary flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight size={16} />
            </button>

            <div className="mt-4 flex items-center justify-center gap-3 text-xs text-gray-400">
              <span>🔒 Secure checkout</span>
              <span>•</span>
              <span>Free returns</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
