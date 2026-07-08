import React, { useState, useEffect, useMemo } from "react";
import { ShoppingCart, User, Search, Plus, Cpu, LogOut } from "lucide-react";
import {
  supabase, signUp, signIn, signOut, fetchProducts,
  uploadProductImage, addProduct, createOrder
} from "./lib/supabase.js";
import { AuthModal, SellModal, CartDrawer, CheckoutModal } from "./components/Modals.jsx";

const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");
const CATS = ["All", "Audio", "Power", "Laptops", "Wearables", "Cameras", "Networking", "Storage", "Accessories"];

export default function App() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cat, setCat] = useState("All");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [sellError, setSellError] = useState("");
  const [sellLoading, setSellLoading] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(null);
  const [address, setAddress] = useState(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    loadProducts();
    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadProducts() {
    setLoadingProducts(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
    setLoadingProducts(false);
  }

  const filtered = useMemo(() => {
    return products.filter(p =>
      (cat === "All" || p.category === cat) &&
      p.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [products, cat, query]);

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => ({ ...products.find(p => p.id === id), qty }))
    .filter(i => i.id);
  const subtotal = cartItems.reduce((s, i) => s + Number(i.price) * i.qty, 0);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const shipping = subtotal > 0 && subtotal < 999 ? 99 : 0;
  const total = subtotal + shipping;

  const addToCart = (id) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const updateQty = (id, delta) => setCart(c => {
    const next = { ...c, [id]: (c[id] || 0) + delta };
    if (next[id] <= 0) delete next[id];
    return next;
  });
  const removeItem = (id) => setCart(c => { const n = { ...c }; delete n[id]; return n; });

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    const form = new FormData(e.target);
    const email = form.get("email");
    const password = form.get("password");
    const name = form.get("name");
    try {
      if (authMode === "signup") {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
      setAuthOpen(false);
    } catch (err) {
      setAuthError(err.message || "Something went wrong");
    }
    setAuthLoading(false);
  }

  async function handleSellSubmit(e) {
    e.preventDefault();
    setSellError("");
    if (!user) { setSellOpen(false); setAuthOpen(true); return; }
    setSellLoading(true);
    const form = new FormData(e.target);
    const file = form.get("image");
    try {
      const imageUrl = await uploadProductImage(file, user.id);
      await addProduct({
        seller_id: user.id,
        seller_name: user.user_metadata?.full_name || user.email,
        name: form.get("name"),
        category: form.get("category"),
        price: Number(form.get("price")),
        mrp: form.get("mrp") ? Number(form.get("mrp")) : null,
        description: form.get("description"),
        image_url: imageUrl,
      });
      setSellOpen(false);
      loadProducts();
    } catch (err) {
      setSellError(err.message || "Could not list product");
    }
    setSellLoading(false);
  }

  const startCheckout = () => {
    if (!user) { setAuthOpen(true); setAuthMode("login"); return; }
    setCartOpen(false);
    setCheckoutStep("address");
  };

  function submitAddress(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    setAddress({
      name: form.get("name"), line1: form.get("line1"),
      city: form.get("city"), pin: form.get("pin"), phone: form.get("phone"),
    });
    setCheckoutStep("payment");
  }

  async function submitPayment(e) {
    e.preventDefault();
    setPaying(true);
    const form = new FormData(e.target);
    const method = form.get("method") || "cod";
    try {
      for (const item of cartItems) {
        await createOrder({
          buyer_id: user.id,
          product_id: item.id,
          product_name: item.name,
          price: item.price,
          quantity: item.qty,
          address_name: address.name,
          address_line1: address.line1,
          address_city: address.city,
          address_pin: address.pin,
          address_phone: address.phone,
          payment_method: method,
        });
      }
      setCheckoutStep("success");
      setCart({});
    } catch (err) {
      alert("Order failed: " + err.message);
    }
    setPaying(false);
  }
return (
    <div className="min-h-screen bg-[#0B0D12] text-[#E7E9EE]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <header className="sticky top-0 z-30 bg-[#0B0D12]/95 backdrop-blur border-b border-[#1E222C]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3.5 flex items-center gap-4">
          <div className="flex items-center gap-2 font-display font-700 text-lg tracking-tight">
            <div className="w-7 h-7 rounded-md bg-[#2954E5] flex items-center justify-center">
              <Cpu size={16} color="#0B0D12" />
            </div>
            <span>circuit<span className="text-[#2954E5]">box</span></span>
          </div>

          <div className="hidden md:flex items-center flex-1 max-w-md ml-4 relative">
            <Search size={15} className="absolute left-3 text-[#5C6478]" />
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full bg-[#151822] border border-[#232838] rounded-full pl-9 pr-4 py-2 text-sm placeholder:text-[#5C6478] focus:outline-none focus:border-[#2954E5]"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => user ? setSellOpen(true) : setAuthOpen(true)}
              className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-full bg-[#2954E5] hover:bg-[#2247C9] text-white transition-colors">
              <Plus size={16} /> <span className="hidden sm:inline">Sell</span>
            </button>
            {user ? (
              <button onClick={() => signOut()} className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-full hover:bg-[#151822]">
                <LogOut size={16} /> <span className="hidden sm:inline">Sign out</span>
              </button>
            ) : (
              <button onClick={() => { setAuthOpen(true); setAuthMode("login"); }}
                className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-full hover:bg-[#151822]">
                <User size={16} /> <span className="hidden sm:inline">Sign in</span>
              </button>
            )}
            <button onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-1.5 text-sm px-3 py-2 rounded-full bg-[#151822] hover:bg-[#1B1F2A]">
              <ShoppingCart size={16} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#FF6B35] text-[#0B0D12] text-[10px] font-mono font-medium min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 md:px-6 pb-3 flex gap-2 overflow-x-auto">
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border ${
                cat === c ? "bg-[#2954E5] border-[#2954E5] text-white" : "border-[#232838] text-[#8B93A7]"
              }`}>
              {c}
            </button>
          ))}
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-display text-xl font-600">{cat === "All" ? "All products" : cat}</h2>
          <span className="text-xs text-[#5C6478] font-mono">{filtered.length} items</span>
        </div>

        {loadingProducts ? (
          <div className="text-center py-16 text-[#5C6478] text-sm">Loading products…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[#5C6478] text-sm">
            No products yet. Be the first to <button onClick={() => user ? setSellOpen(true) : setAuthOpen(true)} className="text-[#2954E5] underline">list one</button>.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filtered.map(p => (
              <div key={p.id} className="bg-[#12151C] border border-[#1E222C] rounded-xl p-3 flex flex-col">
                <img src={p.image_url} alt={p.name} className="w-full aspect-[4/3] object-cover rounded-lg mb-3 bg-[#151822]" />
                <div className="text-xs text-[#5C6478] font-mono mb-1">{p.category}</div>
                <div className="text-sm font-medium leading-snug mb-1.5">{p.name}</div>
                <div className="text-[10px] text-[#5C6478] mb-2">Sold by {p.seller_name}</div>
                <div className="mt-auto flex items-center justify-between pt-1">
                  <div>
                    <div className="font-display font-700 text-base">{inr(p.price)}</div>
                    {p.mrp && <div className="text-[10px] text-[#5C6478] line-through">{inr(p.mrp)}</div>}
                  </div>
                  <button onClick={() => addToCart(p.id)}
                    className="text-xs px-3 py-2 rounded-lg bg-[#1B1F2A] hover:bg-[#2954E5] hover:text-white font-medium">
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-[#1E222C] py-8 text-center text-xs text-[#5C6478] font-mono">
        MARKETPLACE DEMO — payments simulated, listings and orders are real.
      </footer>

      {authOpen && (
        <AuthModal mode={authMode} setMode={setAuthMode} onSubmit={handleAuthSubmit}
          onClose={() => setAuthOpen(false)} error={authError} loading={authLoading} />
      )}

      {sellOpen && (
        <SellModal onSubmit={handleSellSubmit} onClose={() => setSellOpen(false)}
          error={sellError} loading={sellLoading} />
      )}

      {cartOpen && (
        <CartDrawer items={cartItems} subtotal={subtotal} shipping={shipping} total={total}
          onClose={() => setCartOpen(false)} onUpdateQty={updateQty} onRemove={removeItem}
          onCheckout={startCheckout} />
      )}

      {checkoutStep && (
        <CheckoutModal step={checkoutStep} total={total} paying={paying}
          onAddress={submitAddress} onPayment={submitPayment}
          onBackToAddress={() => setCheckoutStep("address")}
          onBackToCart={() => setCheckoutStep(null)}
          onClose={() => setCheckoutStep(null)} />
      )}
    </div>
  );
            }
