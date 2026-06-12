import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShoppingCart, Zap } from 'lucide-react';

export default function Navbar() {
  const totalQuantity = useSelector((s) => s.cart.totalQuantity);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold text-dark tracking-tight">
            Shöp<span className="text-primary">.</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors hidden sm:block ${
              location.pathname === '/' ? 'text-primary' : 'text-gray-500 hover:text-dark'
            }`}
          >
            Products
          </Link>

          <Link to="/cart" className="relative group">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
              location.pathname === '/cart'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-dark hover:bg-primary hover:text-white'
            }`}>
              <ShoppingCart size={18} />
              <span className="text-sm font-medium hidden sm:block">Cart</span>
              {totalQuantity > 0 && (
                <span className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold transition-colors ${
                  location.pathname === '/cart' ? 'bg-white text-primary' : 'bg-primary text-white group-hover:bg-white group-hover:text-primary'
                }`}>
                  {totalQuantity > 99 ? '99+' : totalQuantity}
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
