import { useState } from "react";

export default function ProductCard({ product, onAdd, inCart, cartQty, animDelay }) {
  const [imgError, setImgError] = useState(false);

  const formatQty = (qty, unit) => {
    if (unit !== 'kg') return `${qty} ${unit}`;
    return qty < 1 ? `${qty * 1000}g` : `${qty} kg`;
  };

  return (
    <div className="product-card" style={{ animationDelay: `${animDelay}ms` }}>
      {inCart && <div className="card-qty-badge">{formatQty(cartQty, product.unit)}</div>}
      <div className="product-img-wrap" style={{ background: product.bg }}>
        {imgError ? (
          <span className="product-emoji">{product.emoji}</span>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            className="product-img"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <div className="product-footer">
        <span className="price">₹{product.price} / {product.unit}</span>
        <button className={inCart ? "in-cart" : ""} onClick={() => onAdd(product)}>
          {inCart ? "✓ Added" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
