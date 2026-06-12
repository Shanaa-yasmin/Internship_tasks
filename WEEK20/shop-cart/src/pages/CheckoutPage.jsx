import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../redux/cartSlice';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Wallet, Smartphone, Lock, ChevronRight } from 'lucide-react';

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
  { id: 'paypal', label: 'PayPal', icon: Wallet },
  { id: 'apple', label: 'Apple Pay', icon: Smartphone },
];

const steps = ['Cart', 'Checkout', 'Confirmation'];

export default function CheckoutPage() {
  const { items, totalPrice, totalQuantity } = useSelector((s) => s.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', address: '', city: '', zip: '' });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const shipping = totalPrice > 100 ? 0 : 9.99;
  const tax = parseFloat((totalPrice * 0.08).toFixed(2));
  const grandTotal = parseFloat((totalPrice + shipping + tax).toFixed(2));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.zip.trim()) e.zip = 'ZIP code is required';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    setTimeout(() => {
      dispatch(clearCart());
      navigate('/order-success', { state: { name: form.name, total: grandTotal, items: totalQuantity } });
    }, 1200);
  };

  const update = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  if (items.length === 0) {
    return (
      <main className="w-full px-4 py-16 text-center">
        <p className="text-lg font-medium text-dark mb-4">No items to checkout.</p>
        <Link to="/" className="btn-primary inline-block">Go Shopping</Link>
      </main>
    );
  }

  return (
    <main className="w-full px-4 sm:px-6 py-6 sm:py-8">
      {/* Progress steps */}
      <div className="flex items-center justify-center gap-0 mb-6">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center">
            <div className={`flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-xs font-bold ${i < 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>{i + 1}</div>
            <span className={`ml-1 text-xs font-medium hidden sm:inline ${i < 2 ? 'text-primary' : 'text-gray-400'}`}>{step}</span>
            {i < steps.length - 1 && <ChevronRight size={14} className="mx-2 text-gray-300" />}
          </div>
        ))}
      </div>

      <h1 className="text-xl sm:text-2xl font-bold text-dark mb-5">Checkout</h1>

      {/* Mobile order summary toggle */}
      <button
        onClick={() => setSummaryOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 lg:hidden"
      >
        <span className="text-sm font-semibold text-dark">Order Summary · {totalQuantity} items</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-primary">${grandTotal.toFixed(2)}</span>
          <ChevronRight size={16} className={`text-gray-400 transition-transform ${summaryOpen ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {/* Mobile order summary (collapsible) */}
      {summaryOpen && (
        <div className="card p-4 mb-4 lg:hidden">
          <div className="space-y-2.5 mb-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-dark truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">Qty {item.quantity}</p>
                </div>
                <span className="text-xs font-semibold text-dark">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500 text-xs">
              <span>Subtotal</span><span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500 text-xs">
              <span>Shipping</span>
              <span className={shipping === 0 ? 'text-secondary' : ''}>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-gray-500 text-xs">
              <span>Tax</span><span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm pt-1">
              <span>Total</span><span className="text-primary">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Form column */}
        <div className="lg:col-span-3 space-y-4">
          {/* Shipping info */}
          <div className="card p-4 sm:p-5">
            <h2 className="font-semibold text-dark mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">1</span>
              Shipping Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'name', label: 'Full Name', placeholder: 'Jane Smith', type: 'text', span: true },
                { key: 'email', label: 'Email', placeholder: 'jane@example.com', type: 'email', span: true },
                { key: 'address', label: 'Street Address', placeholder: '123 Main St', type: 'text', span: true },
                { key: 'city', label: 'City', placeholder: 'New York', type: 'text' },
                { key: 'zip', label: 'ZIP Code', placeholder: '10001', type: 'text' },
              ].map(({ key, label, placeholder, type, span }) => (
                <div key={key} className={span ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => update(key, e.target.value)}
                    placeholder={placeholder}
                    className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors[key] ? 'border-accent focus:ring-accent/30' : 'border-gray-200 focus:ring-primary/30 focus:border-primary'}`}
                  />
                  {errors[key] && <p className="text-xs text-accent mt-1">{errors[key]}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Payment method */}
          <div className="card p-4 sm:p-5">
            <h2 className="font-semibold text-dark mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">2</span>
              Payment Method
            </h2>
            <div className="space-y-2.5">
              {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setPaymentMethod(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${paymentMethod === id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${paymentMethod === id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Icon size={16} />
                  </div>
                  <span className={`text-sm font-medium ${paymentMethod === id ? 'text-primary' : 'text-dark'}`}>{label}</span>
                  <div className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === id ? 'border-primary' : 'border-gray-300'}`}>
                    {paymentMethod === id && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                </button>
              ))}
            </div>

            {paymentMethod === 'card' && (
              <div className="mt-4 space-y-3 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Card Number</label>
                  <input type="text" placeholder="1234 5678 9012 3456" className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" maxLength={19} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Expiry</label>
                    <input type="text" placeholder="MM / YY" className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" maxLength={7} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">CVV</label>
                    <input type="text" placeholder="•••" className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" maxLength={4} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile place order button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full lg:hidden bg-primary text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-70 active:scale-95"
          >
            {submitting ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing…</>
            ) : (
              <><Lock size={15} /> Place Order · ${grandTotal.toFixed(2)}</>
            )}
          </button>
        </div>

        {/* Desktop sidebar summary */}
        <div className="lg:col-span-2 hidden lg:block">
          <div className="card p-5 sticky top-24">
            <h2 className="font-semibold text-dark mb-4">Order Summary</h2>
            <div className="space-y-2.5 mb-4 max-h-48 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-11 h-11 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-dark truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">Qty {item.quantity}</p>
                  </div>
                  <span className="text-xs font-semibold text-dark">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="text-dark font-medium">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-secondary font-medium' : 'text-dark font-medium'}>
                  {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tax</span>
                <span className="text-dark font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100">
                <span>Total</span>
                <span className="text-primary">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full mt-5 bg-primary text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary-dark transition-all hover:shadow-lg hover:shadow-primary/30 disabled:opacity-70 active:scale-95"
            >
              {submitting ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing…</>
              ) : (
                <><Lock size={15} /> Place Order · ${grandTotal.toFixed(2)}</>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
              <Lock size={10} /> SSL encrypted & secure
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
