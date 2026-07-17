import { useRef, useState } from "react";

function CartItem({ item, onRemove, onQtyInc, onQtyDec, formatQty }) {
  const startX = useRef(null);
  const [swipeX, setSwipeX] = useState(0);
  const [removing, setRemoving] = useState(false);

  const onTouchStart = (e) => { startX.current = e.touches[0].clientX; };
  const onTouchMove = (e) => {
    const dx = e.touches[0].clientX - startX.current;
    if (dx < 0) setSwipeX(Math.max(dx, -80));
  };
  const onTouchEnd = () => {
    if (swipeX < -60) { setRemoving(true); setTimeout(() => onRemove(item.id), 300); }
    else setSwipeX(0);
  };

  return (
    <div
      className={`cart-item ${removing ? "cart-item-removing" : ""}`}
      style={{ transform: `translateX(${swipeX}px)` }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <span className="cart-item-emoji">{item.emoji}</span>
      <div className="cart-item-info">
        <div className="item-name">{item.name}</div>
        <div className="item-price">₹{(item.price * item.qty).toFixed(2)}</div>
      </div>
      <div className="cart-item-controls">
        <button className="qty-btn" onClick={() => onQtyDec(item.id, item.qty)}>−</button>
        <span className="qty-label">{formatQty(item.qty, item.unit)}</span>
        <button className="qty-btn" onClick={() => onQtyInc(item.id, item.qty)}>+</button>
      </div>
      <button className="remove-btn" onClick={() => onRemove(item.id)}>✕</button>
    </div>
  );
}

export default function Cart({ items, onRemove, onClear, onQtyInc, onQtyDec, onClose, onCheckout }) {
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const formatQty = (qty, unit) => {
    if (unit !== 'kg') return `${qty} ${unit}`;
    return qty < 1 ? `${qty * 1000}g` : `${qty} kg`;
  };

  return (
    <div className="cart-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cart">
        <div className="cart-header">
          <h2>🛒 Your Cart</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {items.length === 0 ? (
          <p className="empty-cart">Your cart is empty</p>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onRemove={onRemove}
                  onQtyInc={onQtyInc}
                  onQtyDec={onQtyDec}
                  formatQty={formatQty}
                />
              ))}
            </div>
            <div className="cart-footer">
              <div className="cart-total-row">
                <span className="cart-total-label">Total ({items.length} item{items.length > 1 ? "s" : ""})</span>
                <span className="cart-total-amount">₹{total.toFixed(2)}</span>
              </div>
              <div className="cart-actions">
                <button className="clear-btn" onClick={onClear}>Clear All</button>
                <button className="checkout-btn" onClick={onCheckout}>Checkout →</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
