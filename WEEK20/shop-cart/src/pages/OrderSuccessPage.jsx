import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Package, Home, RotateCcw } from 'lucide-react';

export default function OrderSuccessPage() {
  const { state } = useLocation();
  const orderId = `ORD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  return (
    <main className="w-full px-4 py-10 sm:py-16 text-center">
      <div className="card p-6 sm:p-8">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-secondary/10 flex items-center justify-center w-20 h-20">
              <CheckCircle size={40} className="text-secondary" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-dark mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 text-sm mb-6">
          Thanks{state?.name ? `, ${state.name.split(' ')[0]}` : ''}! Your order has been placed successfully.
        </p>

        <div className="bg-bg rounded-2xl p-4 mb-5 text-left space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Order ID</span>
            <span className="font-mono font-semibold text-primary text-xs bg-primary/10 px-2 py-0.5 rounded-lg">{orderId}</span>
          </div>
          {state?.items && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Items ordered</span>
              <span className="font-medium text-dark">{state.items}</span>
            </div>
          )}
          {state?.total && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total charged</span>
              <span className="font-bold text-dark">${state.total.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Estimated delivery</span>
            <span className="font-medium text-dark">3–5 business days</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl mb-6 text-left">
          <Package size={18} className="text-primary flex-shrink-0" />
          <p className="text-xs text-primary font-medium">A confirmation email has been sent with your tracking details.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/" className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm">
            <Home size={15} /> Back to Shop
          </Link>
          <Link to="/" className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm">
            <RotateCcw size={15} /> Shop Again
          </Link>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-5">
        Order placed on {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </main>
  );
}
