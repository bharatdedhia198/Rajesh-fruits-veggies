export default function Hero({ onShopNow }) {
  return (
    <div className="hero">
      <div className="hero-content">
        <div className="hero-badge">🌿 100% Fresh & Organic</div>
        <h1 className="hero-title">Farm Fresh Fruits<br />&amp; Vegetables</h1>
        <p className="hero-sub">Handpicked daily. Delivered to your doorstep. No preservatives, just pure goodness.</p>
        <button className="hero-cta" onClick={onShopNow}>Shop Now →</button>
      </div>
      <div className="hero-emojis">
        <span className="he he1">🍎</span>
        <span className="he he2">🥭</span>
        <span className="he he3">🍇</span>
        <span className="he he4">🥕</span>
        <span className="he he5">🍅</span>
        <span className="he he6">🍌</span>
      </div>
    </div>
  );
}
