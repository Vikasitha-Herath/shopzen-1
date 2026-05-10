import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

export default function Cart() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const { settings } = useTheme();
  const navigate = useNavigate();
  const sym = settings?.currencySymbol || 'Rs.';
  const delivery = settings?.standardDelivery || 600;
  const freeThreshold = settings?.freeDeliveryThreshold || 5000;
  const deliveryCost = subtotal >= freeThreshold ? 0 : delivery;

  if (items.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center" style={{ background: 'var(--body-bg)' }}>
      <div className="text-7xl mb-4 float">🛒</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>Your cart is empty</h1>
      <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
      <Link to="/shop" className="btn-primary">Browse Products</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" style={{ background: 'var(--body-bg)' }}>
      <h1 className="text-3xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'var(--font-display)' }}>Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item._id} className="rounded-2xl border border-gray-100 p-4 flex gap-4" style={{ background: 'var(--card-bg)' }}>
              <Link to={`/product/${item.slug}`} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                <img src={item.thumbnail || item.images?.[0] || 'https://via.placeholder.com/100'} alt={item.name} className="w-full h-full object-cover"/>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/product/${item.slug}`} className="font-semibold text-gray-800 hover:opacity-75 transition-opacity text-sm sm:text-base line-clamp-2" style={{ fontFamily: 'var(--font-body)' }}>{item.name}</Link>
                  <button onClick={() => removeItem(item._id)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 p-1">✕</button>
                </div>
                <p className="text-sm text-gray-400 mt-0.5">{item.category?.name}</p>
                <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="qty-btn border-0 w-8 h-8 text-lg">−</button>
                    <span className="px-3 text-sm font-semibold text-gray-800">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="qty-btn border-0 w-8 h-8 text-lg">+</button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{sym} {((item.salePrice || item.price) * item.quantity).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{sym} {(item.salePrice || item.price)?.toLocaleString()} each</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button onClick={clearCart} className="text-sm text-gray-400 hover:text-red-500 transition-colors">Clear cart</button>
        </div>

        <div className="rounded-2xl border border-gray-100 p-6 h-fit sticky top-24" style={{ background: 'var(--card-bg)' }}>
          <h2 className="font-bold text-xl text-gray-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>Order Summary</h2>
          <div className="space-y-3 text-sm">
            {items.map(item => (
              <div key={item._id} className="flex justify-between text-gray-600">
                <span className="truncate pr-2">{item.name} ×{item.quantity}</span>
                <span className="flex-shrink-0 font-medium">{sym} {((item.salePrice || item.price) * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold">{sym} {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Delivery</span>
              <span className={deliveryCost === 0 ? 'text-green-600 font-semibold' : ''}>
                {deliveryCost === 0 ? 'FREE 🎉' : `${sym} ${deliveryCost.toLocaleString()}`}
              </span>
            </div>
            {deliveryCost > 0 && (
              <p className="text-xs text-gray-400">Add {sym} {(freeThreshold - subtotal).toLocaleString()} more for free delivery</p>
            )}
            <div className="flex justify-between font-bold text-base text-gray-900 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>{sym} {(subtotal + deliveryCost).toLocaleString()}</span>
            </div>
          </div>
          <button onClick={() => navigate('/checkout')} className="btn-primary w-full mt-5 py-3.5 text-base">Proceed to Checkout →</button>
          <Link to="/shop" className="block text-center text-sm text-gray-500 hover:opacity-75 mt-3 transition-opacity">← Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
