import React, { useState, useMemo } from "react";
import {
  ShoppingCart, X, User, Search, ChevronRight, Star, Check,
  CreditCard, MapPin, Package, Plus, Minus, Trash2, Cpu,
  Battery, Camera, HardDrive, Wifi, ArrowLeft, ShieldCheck
} from "lucide-react";

// ---------- Mock catalog ----------
const PRODUCTS = [
  { id: 1, name: "Nomad X1 Wireless Earbuds", cat: "Audio", price: 3499, mrp: 4999, rating: 4.4, reviews: 812,
    specs: [["BATT","28 hrs"],["ANC","Yes"],["CONN","BT 5.3"]], accent: "#2954E5", tag: "BESTSELLER" },
  { id: 2, name: "Vertex Pro 65W GaN Charger", cat: "Power", price: 1699, mrp: 2299, rating: 4.6, reviews: 401,
    specs: [["OUT","65W"],["PORTS","3"],["WT","110g"]], accent: "#FF6B35", tag: null },
  { id: 3, name: "Halcyon 14 Ultrabook", cat: "Laptops", price: 68990, mrp: 79990, rating: 4.5, reviews: 233,
    specs: [["RAM","16GB"],["SSD","512GB"],["BATT","18 hrs"]], accent: "#3DDC97", tag: "NEW" },
  { id: 4, name: "Orbit S Smartwatch", cat: "Wearables", price: 5999, mrp: 7499, rating: 4.2, reviews: 1204,
    specs: [["BATT","10 days"],["GPS","Yes"],["SpO2","Yes"]], accent: "#2954E5", tag: null },
  { id: 5, name: "Lumen 4K Action Camera", cat: "Cameras", price: 12499, mrp: 15999, rating: 4.3, reviews: 156,
    specs: [["RES","4K/60"],["STAB","Gyro"],["WTPRF","10m"]], accent: "#FF6B35", tag: "SALE" },
  { id: 6, name: "Aeris Mesh Wi-Fi 6 (3-pack)", cat: "Networking", price: 8999, mrp: 10999, rating: 4.5, reviews: 340,
    specs: [["SPEED","AX3000"],["COVER","5500 sqft"],["PORTS","2x GbE"]], accent: "#3DDC97", tag: null },
  { id: 7, name: "Fathom 2TB Portable SSD", cat: "Storage", price: 10999, mrp: 13499, rating: 4.7, reviews: 622,
    specs: [["SPEED","1050MB/s"],["INT","USB-C 3.2"],["WT","58g"]], accent: "#2954E5", tag: "BESTSELLER" },
  { id: 8, name: "Cinder Mechanical Keyboard 75%", cat: "Accessories", price: 6499, mrp: 7999, rating: 4.6, reviews: 289,
    specs: [["SW","Hot-swap"],["CONN","BT/USB-C"],["BATT","4000mAh"]], accent: "#FF6B35", tag: null },
];

const CATS = ["All", ...Array.from(new Set(PRODUCTS.map(p => p.cat)))];

const inr = (n) => "₹" + n.toLocaleString("en-IN");

// ---------- Small building blocks ----------
function SpecStrip({ specs }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[10px] tracking-wide text-[#8B93A7]">
      {specs.map(([k, v], i) => (
        <React.Fragment key={k}>
          {i > 0 && <span className="text-[#3A4256]">·</span>}
          <span><span className="text-[#5C6478]">{k}</span> <span className="text-[#E7E9EE]">{v}</span></span>
        </React.Fragment>
      ))}
    </div>
  );
}

function ProductIcon({ cat, accent }) {
  const map = { Audio: Wifi, Power: Battery, Laptops: Cpu, Wearables: Battery, Cameras: Camera, Networking: Wifi, Storage: HardDrive, Accessories: Cpu };
  const Icon = map[cat] || Cpu;
  return (
    <div className="relative w-full aspect-[4/3] rounded-lg flex items-center justify-center overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${accent}22, #12151C)` }}>
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `radial-gradient(${accent}55 1px, transparent 1px)`, backgroundSize: "14px 14px"
      }} />
      <Icon size={44} strokeWidth={1.25} color={accent} />
    </div>
  );
}

function StarRow({ rating, reviews }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-[#8B93A7]">
      <Star size={12} fill="#FFC53D" color="#FFC53D" />
      <span className="text-[#E7E9EE] font-medium">{rating}</span>
      <span>({reviews})</span>
    </div>
  );
}

// ---------- Main App ----------
export default function ElectroStore() {
  const [cat, setCat] = useState("All");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState({}); // id -> qty
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState(null); // null | 'address' | 'payment' | 'success'
  const [address, setAddress] = useState({ name: "", line1: "", city: "", pin: "", phone: "" });
  const [paying, setPaying] = useState(false);
  const [quickView, setQuickView] = useState(null);

  const filtered = useMemo(() => {
    return PRODUCTS.filter(p =>
      (cat === "All" || p.cat === cat) &&
      p.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [cat, query]);

  const cartItems = Object.entries(cart).map(([id, qty]) => ({ ...PRODUCTS.find(p => p.id === Number(id)), qty }));
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
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

  const startCheckout = () => {
    if (!user) { setAuthOpen(true); setAuthMode("login"); return; }
    setCartOpen(false);
    setCheckoutStep("address");
  };

  const submitAddress = (e) => {
    e.preventDefault();
    setCheckoutStep("payment");
  };

  const submitPayment = (e) => {
    e.preventDefault();
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setCheckoutStep("success");
      setCart({});
    }, 1400);
  };

  const submitAuth = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const name = form.get("name") || form.get("email")?.split("@")[0] || "Account";
    setUser({ name, email: form.get("email") });
    setAuthOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#E7E9EE]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {/* Header */}
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
              placeholder="Search gadgets, laptops, audio…"
              className="w-full bg-[#151822] border border-[#232838] rounded-full pl-9 pr-4 py-2 text-sm placeholder:text-[#5C6478] focus:outline-none focus:border-[#2954E5] transition-colors"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => user ? setUser(null) : (setAuthOpen(true), setAuthMode("login"))}
              className="hidden sm:flex items-center gap-1.5 text-sm px-3 py-2 rounded-full hover:bg-[#151822] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2954E5]"
            >
              <User size={16} />
              {user ? user.name : "Sign in"}
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-1.5 text-sm px-3 py-2 rounded-full bg-[#151822] hover:bg-[#1B1F2A] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2954E5]"
            >
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#FF6B35] text-[#0B0D12] text-[10px] font-mono font-medium w-4.5 h-4.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
        {/* category rail */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 pb-3 flex gap-2 overflow-x-auto">
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                cat === c ? "bg-[#2954E5] border-[#2954E5] text-white" : "border-[#232838] text-[#8B93A7] hover:border-[#2954E5] hover:text-[#E7E9EE]"
              }`}>
              {c}
            </button>
          ))}
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pt-10 pb-8 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="font-mono text-xs text-[#2954E5] mb-3 tracking-wider">// NEW ARRIVALS · JULY 2026</div>
          <h1 className="font-display font-700 text-4xl md:text-5xl leading-[1.05] mb-4">
            Specs you can<br />actually trust.
          </h1>
          <p className="text-[#8B93A7] text-sm md:text-base mb-6 max-w-md">
            Every listing shows real numbers, not marketing fluff. Compare batteries, ports, and speeds at a glance — then check out in under a minute.
          </p>
          <div className="flex gap-3">
            <button onClick={() => document.getElementById("catalog").scrollIntoView({ behavior: "smooth" })}
              className="px-5 py-2.5 bg-[#2954E5] hover:bg-[#2247C9] rounded-lg text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2954E5]">
              Browse catalog
            </button>
            <div className="flex items-center gap-1.5 text-xs text-[#8B93A7] font-mono">
              <ShieldCheck size={14} color="#3DDC97" /> 7-day returns
            </div>
          </div>
        </div>
        <div className="relative rounded-2xl bg-[#12151C] border border-[#1E222C] p-6 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: "radial-gradient(#2954E5 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
          <div className="relative">
            <div className="text-xs font-mono text-[#5C6478] mb-1">FEATURED · SKU-0001</div>
            <div className="font-display text-xl font-600 mb-3">{PRODUCTS[0].name}</div>
            <div className="w-full aspect-[16/9] rounded-lg mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${PRODUCTS[0].accent}22, transparent)` }}>
              <Wifi size={56} strokeWidth={1} color={PRODUCTS[0].accent} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
              {PRODUCTS[0].specs.map(([k, v]) => (
                <div key={k} className="font-mono text-xs border border-[#232838] rounded px-2 py-1">
                  <span className="text-[#5C6478]">{k}</span> <span className="text-[#E7E9EE]">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-display text-2xl font-700">{inr(PRODUCTS[0].price)}</span>
                <span className="text-[#5C6478] text-sm line-through ml-2">{inr(PRODUCTS[0].mrp)}</span>
              </div>
              <button onClick={() => addToCart(PRODUCTS[0].id)}
                className="text-sm px-4 py-2 rounded-lg bg-[#E7E9EE] text-[#0B0D12] font-medium hover:bg-white transition-colors">
                Add to cart
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="max-w-6xl mx-auto px-4 md:px-6 pb-16">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-display text-xl font-600">{cat === "All" ? "All products" : cat}</h2>
          <span className="text-xs text-[#5C6478] font-mono">{filtered.length} items</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="group bg-[#12151C] border border-[#1E222C] rounded-xl p-3 hover:border-[#2954E5]/60 transition-colors flex flex-col">
              <button onClick={() => setQuickView(p)} className="text-left">
                <div className="relative mb-3">
                  <ProductIcon cat={p.cat} accent={p.accent} />
                  {p.tag && (
                    <span className="absolute top-2 left-2 text-[9px] font-mono font-medium tracking-wide px-1.5 py-0.5 rounded"
                      style={{ background: p.accent, color: "#0B0D12" }}>{p.tag}</span>
                  )}
                </div>
                <div className="text-xs text-[#5C6478] font-mono mb-1">{p.cat}</div>
                <div className="text-sm font-medium leading-snug mb-1.5 group-hover:text-[#2954E5] transition-colors">{p.name}</div>
                <StarRow rating={p.rating} reviews={p.reviews} />
                <div className="mt-2 mb-2"><SpecStrip specs={p.specs} /></div>
              </button>
              <div className="mt-auto flex items-center justify-between pt-1">
                <div>
                  <div className="font-display font-700 text-base">{inr(p.price)}</div>
                  <div className="text-[10px] text-[#5C6478] line-through">{inr(p.mrp)}</div>
                </div>
                <button onClick={() => addToCart(p.id)}
                  className="text-xs px-3 py-2 rounded-lg bg-[#1B1F2A] hover:bg-[#2954E5] hover:text-white transition-colors font-medium">
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#5C6478] text-sm">No products match "{query}". Try a different search.</div>
        )}
      </section>

      <footer className="border-t border-[#1E222C] py-8 text-center text-xs text-[#5C6478] font-mono">
        DEMO STORE — payments are simulated, no real charges are made.
      </footer>

      {/* Quick view modal */}
      {quickView && (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4" onClick={() => setQuickView(null)}>
          <div className="bg-[#12151C] border border-[#232838] rounded-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="text-xs font-mono text-[#5C6478]">{quickView.cat}</div>
              <button onClick={() => setQuickView(null)} className="text-[#5C6478] hover:text-white"><X size={18} /></button>
            </div>
            <ProductIcon cat={quickView.cat} accent={quickView.accent} />
            <h3 className="font-display text-lg font-600 mt-4 mb-1">{quickView.name}</h3>
            <StarRow rating={quickView.rating} reviews={quickView.reviews} />
            <div className="flex flex-wrap gap-2 my-4">
              {quickView.specs.map(([k, v]) => (
                <div key={k} className="font-mono text-xs border border-[#232838] rounded px-2 py-1">
                  <span className="text-[#5C6478]">{k}</span> <span className="text-[#E7E9EE]">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-display text-2xl font-700">{inr(quickView.price)}</span>
                <span className="text-[#5C6478] text-sm line-through ml-2">{inr(quickView.mrp)}</span>
              </div>
              <button onClick={() => { addToCart(quickView.id); setQuickView(null); }}
                className="px-4 py-2 rounded-lg bg-[#2954E5] hover:bg-[#2247C9] text-sm font-medium transition-colors">
                Add to cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 flex justify-end" onClick={() => setCartOpen(false)}>
          <div className="bg-[#12151C] border-l border-[#232838] w-full max-w-sm h-full p-5 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-display text-lg font-600">Your cart</h3>
              <button onClick={() => setCartOpen(false)} className="text-[#5C6478] hover:text-white"><X size={20} /></button>
            </div>
            {cartItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-[#5C6478] text-sm gap-2">
                <Package size={28} strokeWidth={1.2} />
                Your cart is empty.
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto flex flex-col gap-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 shrink-0"><ProductIcon cat={item.cat} accent={item.accent} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{item.name}</div>
                        <div className="font-mono text-sm text-[#8B93A7] mt-0.5">{inr(item.price)}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded bg-[#1B1F2A] flex items-center justify-center hover:bg-[#232838]"><Minus size={12} /></button>
                          <span className="text-xs font-mono w-4 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded bg-[#1B1F2A] flex items-center justify-center hover:bg-[#232838]"><Plus size={12} /></button>
                          <button onClick={() => removeItem(item.id)} className="ml-auto text-[#5C6478] hover:text-[#FF6B35]"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#232838] pt-4 mt-4 font-mono text-sm">
                  <div className="flex justify-between text-[#8B93A7] mb-1"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
                  <div className="flex justify-between text-[#8B93A7] mb-2"><span>Shipping</span><span>{shipping === 0 ? "Free" : inr(shipping)}</span></div>
                  <div className="flex justify-between font-display text-base font-700 mb-4"><span>Total</span><span>{inr(total)}</span></div>
                  <button onClick={startCheckout} className="w-full py-2.5 bg-[#2954E5] hover:bg-[#2247C9] rounded-lg text-sm font-medium transition-colors">
                    Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Auth modal */}
      {authOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setAuthOpen(f
