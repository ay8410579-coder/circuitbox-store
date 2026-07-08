import React, { useState } from "react";
import { X, Plus, Minus, Trash2, Package, Upload, MapPin, CreditCard, Check, ArrowLeft } from "lucide-react";

const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");
const inputCls = "bg-[#151822] border border-[#232838] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2954E5] text-[#E7E9EE]";

export function AuthModal({ mode, setMode, onSubmit, onClose, error, loading }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#12151C] border border-[#232838] rounded-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-display text-lg font-600 text-[#E7E9EE]">{mode === "login" ? "Sign in" : "Create account"}</h3>
          <button onClick={onClose} className="text-[#5C6478] hover:text-white"><X size={18} /></button>
        </div>
        {error && <div className="text-xs text-[#FF6B35] mb-3">{error}</div>}
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <input name="name" required placeholder="Full name" className={inputCls} />
          )}
          <input name="email" type="email" required placeholder="Email address" className={inputCls} />
          <input name="password" type="password" required minLength={6} placeholder="Password (min 6 chars)" className={inputCls} />
          <button type="submit" disabled={loading} className="mt-1 py-2.5 bg-[#2954E5] hover:bg-[#2247C9] disabled:opacity-60 rounded-lg text-sm font-medium text-white">
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
        <div className="text-center text-xs text-[#5C6478] mt-4">
          {mode === "login" ? "New here? " : "Already have an account? "}
          <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-[#2954E5] hover:underline">
            {mode === "login" ? "Create account" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SellModal({ onSubmit, onClose, error, loading }) {
  const [preview, setPreview] = useState(null);
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#12151C] border border-[#232838] rounded-2xl max-w-md w-full p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-display text-lg font-600 text-[#E7E9EE]">List your product</h3>
          <button onClick={onClose} className="text-[#5C6478] hover:text-white"><X size={18} /></button>
        </div>
        {error && <div className="text-xs text-[#FF6B35] mb-3">{error}</div>}
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <input name="name" required placeholder="Product name" className={inputCls} />
          <select name="category" required className={inputCls}>
            <option value="">Choose category</option>
            <option>Audio</option><option>Power</option><option>Laptops</option>
            <option>Wearables</option><option>Cameras</option><option>Networking</option>
            <option>Storage</option><option>Accessories</option>
          </select>
          <div className="flex gap-3">
            <input name="price" type="number" required placeholder="Price ₹" className={`flex-1 ${inputCls}`} />
            <input name="mrp" type="number" placeholder="MRP ₹ (optional)" className={`flex-1 ${inputCls}`} />
          </div>
          <textarea name="description" rows={3} placeholder="Description" className={inputCls} />
          <label className="flex items-center gap-2 text-sm text-[#8B93A7] border border-dashed border-[#232838] rounded-lg px-3 py-3 cursor-pointer">
            <Upload size={16} />
            {preview ? "Photo selected" : "Upload product photo"}
            <input name="image" type="file" accept="image/*" required
              onChange={e => setPreview(e.target.files[0]?.name)}
              className="hidden" />
          </label>
          <button type="submit" disabled={loading} className="mt-1 py-2.5 bg-[#2954E5] hover:bg-[#2247C9] disabled:opacity-60 rounded-lg text-sm font-medium text-white">
            {loading ? "Listing…" : "List product"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function CartDrawer({ items, subtotal, shipping, total, onClose, onUpdateQty, onRemove, onCheckout }) {
  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex justify-end" onClick={onClose}>
      <div className="bg-[#12151C] border-l border-[#232838] w-full max-w-sm h-full p-5 flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-display text-lg font-600 text-[#E7E9EE]">Your cart</h3>
          <button onClick={onClose} className="text-[#5C6478] hover:text-white"><X size={20} /></button>
        </div>
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#5C6478] text-sm gap-2">
            <Package size={28} strokeWidth={1.2} />
            Your cart is empty.
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto flex flex-col gap-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-[#151822]" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate text-[#E7E9EE]">{item.name}</div>
                    <div className="font-mono text-sm text-[#8B93A7] mt-0.5">{inr(item.price)}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => onUpdateQty(item.id, -1)} className="w-6 h-6 rounded bg-[#1B1F2A] flex items-center justify-center hover:bg-[#232838] text-[#E7E9EE]"><Minus size={12} /></button>
                      <span className="text-xs font-mono w-4 text-center text-[#E7E9EE]">{item.qty}</span>
                      <button onClick={() => onUpdateQty(item.id, 1)} className="w-6 h-6 rounded bg-[#1B1F2A] flex items-center justify-center hover:bg-[#232838] text-[#E7E9EE]"><Plus size={12} /></button>
                      <button onClick={() => onRemove(item.id)} className="ml-auto text-[#5C6478] hover:text-[#FF6B35]"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-[#232838] pt-4 mt-4 font-mono text-sm">
              <div className="flex justify-between text-[#8B93A7] mb-1"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
              <div className="flex justify-between text-[#8B93A7] mb-2"><span>Shipping</span><span>{shipping === 0 ? "Free" : inr(shipping)}</span></div>
              <div className="flex justify-between font-display text-base font-700 mb-4 text-[#E7E9EE]"><span>Total</span><span>{inr(total)}</span></div>
              <button onClick={onCheckout} className="w-full py-2.5 bg-[#2954E5] hover:bg-[#2247C9] rounded-lg text-sm font-medium text-white">
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export function CheckoutModal({ step, total, onAddress, onPayment, onBackToAddress, onBackToCart, onClose, paying }) {
  if (step === "success") {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div className="bg-[#12151C] border border-[#232838] rounded-2xl max-w-sm w-full p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#3DDC97]/15 flex items-center justify-center mx-auto mb-4">
            <Check size={22} color="#3DDC97" />
          </div>
          <h3 className="font-display text-lg font-600 mb-1 text-[#E7E9EE]">Order placed</h3>
          <p className="text-sm text-[#8B93A7] mb-6">Your order has been saved. Card payments are simulated — no real charge was made.</p>
          <button onClick={onClose} className="w-full py-2.5 bg-[#2954E5] hover:bg-[#2247C9] rounded-lg text-sm font-medium text-white">
            Continue shopping
          </button>
        </div>
      </div>
    );
  }
  if (step === "address") {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div className="bg-[#12151C] border border-[#232838] rounded-2xl max-w-md w-full p-6">
          <div className="flex items-center gap-2 mb-5">
            <MapPin size={16} color="#2954E5" />
            <h3 className="font-display text-lg font-600 text-[#E7E9EE]">Delivery address</h3>
          </div>
          <form onSubmit={onAddress} className="flex flex-col gap-3">
            <input name="name" required placeholder="Full name" className={inputCls} />
            <input name="line1" required placeholder="Address line" className={inputCls} />
            <div className="flex gap-3">
              <input name="city" required placeholder="City" className={`flex-1 ${inputCls}`} />
              <input name="pin" required placeholder="PIN code" className={`w-28 ${inputCls}`} />
            </div>
            <input name="phone" required placeholder="Phone number" className={inputCls} />
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={onBackToCart} className="flex items-center gap-1 px-4 py-2.5 rounded-lg border border-[#232838] text-sm hover:bg-[#151822] text-[#E7E9EE]"><ArrowLeft size={14} /> Back</button>
              <button type="submit" className="flex-1 py-2.5 bg-[#2954E5] hover:bg-[#2247C9] rounded-lg text-sm font-medium text-white">Continue to payment</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  if (step === "payment") {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div className="bg-[#12151C] border border-[#232838] rounded-2xl max-w-md w-full p-6">
          <div className="flex items-center gap-2 mb-5">
            <CreditCard size={16} color="#2954E5" />
            <h3 className="font-display text-lg font-600 text-[#E7E9EE]">Payment method</h3>
          </div>
          <div className="bg-[#151822] rounded-lg p-3 mb-4 font-mono text-xs text-[#8B93A7] flex justify-between">
            <span>Order total</span><span className="text-[#E7E9EE] font-medium">{inr(total)}</span>
          </div>
          <PaymentForm onPayment={onPayment} onBackToAddress={onBackToAddress} paying={paying} total={total} />
        </div>
      </div>
    );
  }
  return null;
}

function PaymentForm({ onPayment, onBackToAddress, paying, total }) {
  const [method, setMethod] = useState("cod");
  return (
    <form onSubmit={onPayment} className="flex flex-col gap-3">
      <input type="hidden" name="method" value={method} />
      <div className="flex flex-col gap-2">
        <label className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer ${method === "cod" ? "border-[#2954E5] bg-[#2954E5]/10" : "border-[#232838]"}`}>
          <input type="radio" checked={method === "cod"} onChange={() => setMethod("cod")} />
          <div>
            <div className="text-sm font-medium text-[#E7E9EE]">💵 Cash on Delivery</div>
            <div className="text-xs text-[#8B93A7]">Pay with cash when your order arrives.</div>
          </div>
        </label>
        <label className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer ${method === "card" ? "border-[#2954E5] bg-[#2954E5]/10" : "border-[#232838]"}`}>
          <input type="radio" checked={method === "card"} onChange={() => setMethod("card")} />
          <div>
            <div className="text-sm font-medium text-[#E7E9EE]">💳 Credit / Debit Card</div>
            <div className="text-xs text-[#8B93A7]">Pay online now (simulated).</div>
          </div>
        </label>
      </div>
      {method === "card" && (
        <>
          <input name="cardNumber" required placeholder="Card number" maxLength={19} className={inputCls} />
          <div className="flex gap-3">
            <input name="expiry" required placeholder="MM/YY" className={`flex-1 ${inputCls}`} />
            <input name="cvv" required placeholder="CVV" maxLength={3} className={`w-24 ${inputCls}`} />
          </div>
        </>
      )}
      <div className="flex gap-3 mt-2">
        <button type="button" onClick={onBackToAddress} className="flex items-center gap-1 px-4 py-2.5 rounded-lg border border-[#232838] text-sm hover:bg-[#151822] text-[#E7E9EE]"><ArrowLeft size={14} /> Back</button>
        <button type="submit" disabled={paying} className="flex-1 py-2.5 bg-[#2954E5] hover:bg-[#2247C9] disabled:opacity-60 rounded-lg text-sm font-medium text-white">
          {paying ? "Placing order…" : method === "cod" ? `Confirm order · ${inr(total)}` : `Pay ${inr(total)}`}
        </button>
      </div>
    </form>
  );
        }

