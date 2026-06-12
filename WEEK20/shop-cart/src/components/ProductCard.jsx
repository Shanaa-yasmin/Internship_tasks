import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { ShoppingCart, Star, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

const badgeColors = {
  Bestseller: 'bg-amber-100 text-amber-700',
  New: 'bg-emerald-100 text-emerald-700',
  Sale: 'bg-rose-100 text-rose-600',
  Popular: 'bg-purple-100 text-purple-700',
};

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-5 bg-gray-200 rounded w-1/4" />
          <div className="h-9 bg-gray-200 rounded-xl w-1/3" />
        </div>
      </div>
    </div>
  );
}

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const cartItems = useSelector((s) => s.cart.items) || [];
  const inCart = cartItems.some((i) => i.id === product.id);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    dispatch(addToCart(product));
    toast.success(`${product.name} added to cart!`, {
      icon: '🛍️',
      style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="card overflow-hidden group">
      <div className="relative w-full h-48 overflow-hidden bg-gray-50">
        {!imgLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
        <img
          src={product.image}
          alt={product.name}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {product.badge && (
          <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColors[product.badge] || 'bg-gray-100 text-gray-600'}`}>
            {product.badge}
          </span>
        )}
        {inCart && (
          <div className="absolute top-3 right-3 w-7 h-7 bg-secondary rounded-full flex items-center justify-center shadow-sm">
            <Check size={14} className="text-white" />
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{product.category}</p>
        <h3 className="font-semibold text-dark text-sm leading-tight mb-1.5">{product.name}</h3>
        <div className="flex items-center gap-1 mb-3">
          <Star size={12} className="text-amber-400 fill-amber-400" />
          <span className="text-xs text-gray-500">{product.rating} <span className="text-gray-400">({product.reviews})</span></span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-dark">${product.price.toFixed(2)}</span>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 ${
              added
                ? 'bg-secondary text-white'
                : 'bg-primary text-white hover:bg-primary-dark hover:shadow-md hover:shadow-primary/30'
            }`}
          >
            {added ? <Check size={14} /> : <ShoppingCart size={14} />}
            {added ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
