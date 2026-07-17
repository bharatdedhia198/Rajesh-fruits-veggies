import { useState, useEffect, useRef } from "react";
import products from "./data/products";
import ProductCard from "./components/ProductCard";
import Cart from "./components/Cart";
import Hero from "./components/Hero";
import Toast from "./components/Toast";
import Checkout from "./components/Checkout";
import SkeletonCard from "./components/SkeletonCard";
import "./App.css";

export default function App() {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("rjCart")) || []; }
    catch { return []; }
  });
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [cartShake, setCartShake] = useState(false);
  const shopRef = useRef(null);

  // Persist cart
  useEffect(() => { localStorage.setItem("rjCart", JSON.stringify(cart)); }, [cart]);

  // Simulate loading
  useEffect(() => { const t = setTimeout(() => setLoading(false), 1200); return () => clearTimeout(t); }, []);

  // Scroll to top button
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nextQty = (qty) => qty < 0.5 ? 0.5 : qty < 1 ? 1 : qty + 1;
  const prevQty = (qty) => qty <= 0.25 ? null : qty <= 0.5 ? 0.25 : qty <= 1 ? 0.5 : qty - 1;

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      return existing
        ? prev.map((i) => i.id === product.id ? { ...i, qty: nextQty(i.qty) } : i)
        : [...prev, { ...product, qty: 1 }];
    });
    setToasts((t) => [...t, { id: Date.now(), msg: `${product.name} added to cart!` }]);
    setCartShake(true);
    setTimeout(() => setCartShake(false), 600);
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const clearCart = () => setCart([]);
  const updateQty = (id, qty) =>
    qty === null
      ? setCart((prev) => prev.filter((i) => i.id !== id))
      : setCart((prev) => prev.map((i) => i.id === id ? { ...i, qty } : i));

  const filtered = products
    .filter((p) => filter === "all" || p.category === filter)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const cartCount = cart.length;
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div className="app">
      <header>
        <div className="header-left">
          <span className="logo">🌿 Rajesh Fruits &amp; Vegetables</span>
          <p className="tagline">Fresh from the farm to your door</p>
        </div>
        <button className={`cart-btn ${cartShake ? "cart-shake" : ""}`} onClick={() => setShowCart(true)}>
          🛒 Cart {cartCount > 0 && <span className="badge">{cartCount}</span>}
        </button>
      </header>

      <Hero onShopNow={() => shopRef.current?.scrollIntoView({ behavior: "smooth" })} />

      <main ref={shopRef}>
        <div className="shop-toolbar">
          <div className="filters">
            {["all", "fruit", "vegetable"].map((f) => (
              <button key={f} className={filter === f ? "active" : ""} onClick={() => setFilter(f)}>
                {f === "all" ? "🛍️ All" : f === "fruit" ? "🍎 Fruits" : "🥦 Vegetables"}
              </button>
            ))}
          </div>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && <button className="search-clear" onClick={() => setSearch("")}>✕</button>}
          </div>
        </div>

        {loading ? (
          <div className="product-grid">
            {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-emoji">🥲</div>
            <h3>No products found</h3>
            <p>Try a different search or category</p>
            <button className="hero-cta" onClick={() => { setSearch(""); setFilter("all"); }}>Clear Filters</button>
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                onAdd={addToCart}
                inCart={cart.some((c) => c.id === p.id)}
                cartQty={cart.find((c) => c.id === p.id)?.qty}
                animDelay={i * 60}
              />
            ))}
          </div>
        )}
      </main>

      {showCart && (
        <Cart
          items={cart}
          onRemove={removeFromCart}
          onClear={clearCart}
          onQtyInc={(id, qty) => updateQty(id, nextQty(qty))}
          onQtyDec={(id, qty) => updateQty(id, prevQty(qty))}
          onClose={() => setShowCart(false)}
          onCheckout={() => { setShowCart(false); setShowCheckout(true); }}
        />
      )}

      {showCheckout && (
        <Checkout
          items={cart}
          total={cartTotal}
          onClose={() => setShowCheckout(false)}
          onConfirm={clearCart}
        />
      )}

      <div className="toast-container">
        {toasts.map((t) => (
          <Toast key={t.id} message={t.msg} onDone={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} />
        ))}
      </div>

      {showScrollTop && (
        <button className="scroll-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          ↑
        </button>
      )}
    </div>
  );
}
