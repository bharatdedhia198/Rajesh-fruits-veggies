import { useState } from "react";
import { getOrdersByEmail, updateOrderStatus } from "../data/store";

const STATUS_LABEL = { open: "🟡 Order Placed", dispatched: "🚚 Order Dispatched", cancelled: "❌ Cancelled" };
const STATUS_CLASS = { open: "status-open", dispatched: "status-dispatched", cancelled: "status-cancelled" };

export default function MyOrders({ currentUser, onClose }) {
  const [orders, setOrders] = useState(() => getOrdersByEmail(currentUser?.email));

  const handleCancel = (orderId) => {
    if (!window.confirm("Cancel this order?")) return;
    updateOrderStatus(orderId, "cancelled");
    setOrders(getOrdersByEmail(currentUser?.email));
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const formatQty = (qty, unit) => unit !== "kg" ? `${qty} ${unit}` : qty < 1 ? `${qty * 1000}g` : `${qty} kg`;

  return (
    <div className="checkout-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="checkout-panel" style={{ maxWidth: "560px" }}>
        <div className="checkout-header">
          <h2>📦 My Orders</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {orders.length === 0 ? (
          <div className="cd-empty" style={{ padding: "60px 20px" }}>You haven't placed any orders yet.</div>
        ) : (
          <div style={{ overflowY: "auto", maxHeight: "75vh", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            {[...orders].reverse().map((order, i) => (
              <div key={order.id} className="cd-order-card" style={{ border: "1px solid #e8f5e9", borderRadius: "14px", padding: "16px" }}>
                <div className="cd-order-top">
                  <span className="cd-order-num">Order #{orders.length - i}</span>
                  <span className="cd-order-date">{formatDate(order.placedAt)}</span>
                  <span className={`cd-status-badge ${STATUS_CLASS[order.status] || "status-open"}`}>
                    {STATUS_LABEL[order.status] || "🟡 Order Placed"}
                  </span>
                </div>
                <div className="cd-order-items" style={{ marginTop: "8px" }}>
                  {order.items?.map((item, j) => (
                    <span key={j} className="cd-order-item">
                      {item.emoji} {item.name} ({formatQty(item.qty, item.unit)})
                    </span>
                  ))}
                </div>
                <div className="cd-order-addr" style={{ marginTop: "6px" }}>
                  📍 {order.address?.room}, {order.address?.building}{order.address?.landmark ? `, Near ${order.address.landmark}` : ""}, {order.address?.area}, {order.address?.city}
                </div>
                <div className="cd-order-delivery">📅 {order.deliveryDate} &nbsp; 🕐 {order.deliveryTime}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                  <strong style={{ color: "#1b5e20" }}>₹{order.grandTotal?.toFixed(2)}</strong>
                  {order.status === "open" && (
                    <button className="cd-cancel-btn" onClick={() => handleCancel(order.id)}>Cancel Order</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
