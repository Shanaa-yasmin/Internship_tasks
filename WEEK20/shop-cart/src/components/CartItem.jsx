import { useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity } from '../redux/cartSlice';
import { Trash2, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartItem({ item }) {
  const dispatch = useDispatch();

  const handleRemove = () => {
    dispatch(removeFromCart(item.id));
    toast(`${item.name} removed`, {
      icon: '🗑️',
      style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
    });
  };

  return (
    <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
      {/* Thumbnail */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
      </div>

      {/* Info + controls stacked */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{item.category}</p>
            <h4 className="font-semibold text-dark text-sm leading-snug">{item.name}</h4>
            <p className="text-xs font-bold text-primary mt-0.5">${item.price.toFixed(2)} each</p>
          </div>
          {/* Remove — always visible on mobile, hover-only on desktop */}
          <button
            onClick={handleRemove}
            className="text-gray-300 hover:text-accent transition-colors flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Remove item"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Qty controls + line total */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors text-gray-500"
              aria-label="Decrease quantity"
            >
              <Minus size={12} />
            </button>
            <span className="w-6 text-center text-sm font-semibold text-dark">{item.quantity}</span>
            <button
              onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors text-gray-500"
              aria-label="Increase quantity"
            >
              <Plus size={12} />
            </button>
          </div>
          <p className="font-bold text-dark text-sm">${(item.price * item.quantity).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
