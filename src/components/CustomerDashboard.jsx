import { useState } from "react";
import { getUsers, getOrders, deleteCustomer, updateOrderStatus } from "../data/store";

const STATUS_LABEL = { open: "🟡 Open", dispatched: "🚚 Dispatched", cancelled: "❌ Cancelled" };
const STATUS_CLASS = { open: "status-open", dispatched: "status-dispatched", cancelled: "status-cancelled" };

export default function CustomerDashboard() {
  const [users, setUsers] = useState(getUsers);
  const [orders, setOrders] = useState(getOrders);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");

  const refresh = () => { setOrders(getOrders()); setUsers(getUsers()); };

  const handleDelete = (e, userId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this customer and all their orders? This cannot be undone.")) return;
    deleteCustomer(userId);
    refresh();
    if (selectedUser?.id === userId) setSelectedUser(null);
  };

  const handleDispatch = (orderId) => {
    updateOrderStatus(orderId, "dispatched");
    refresh();
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  );

  const userOrders = (userId) => orders.filter(o => o.customer?.email === users.find(u => u.id === userId)?.email);
  const newOrdersCount = orders.filter(o => o.status === "open").length;
  const totalRevenue = orders.filter(o => o.status !== "cancelled").reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  const formatDate = (iso) => new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const formatQty = (qty, unit) => unit !== "kg" ? `${qty} ${unit}` : qty < 1 ? `${qty * 1000}g` : `${qty} kg`;

  return (
    <div className="cd-wrap">
      {/* New orders notification banner */}
      {newOrdersCount > 0 && (
        <div className="cd-new-orders-banner">
          🔔 You have <strong>{newOrdersCount}</strong> new open order{newOrdersCount !== 1 ? "s" : ""} waiting to be dispatched!
        </div>
      )}

      {/* Stats */}
      <div className="cd-stats">
        <div className="cd-stat"><span className="cd-stat-val">{users.length}</span><span className="cd-stat-label">Total Customers</span></div>
        <div className="cd-stat"><span className="cd-stat-val">{orders.length}</span><span className="cd-stat-label">Total Orders</span></div>
        <div className="cd-stat"><span className="cd-stat-val">₹{totalRevenue.toFixed(0)}</span><span className="cd-stat-label">Total Revenue</span></div>
        <div className="cd-stat"><span className="cd-stat-val">{orders.length ? `₹${(totalRevenue / orders.length).toFixed(0)}` : "—"}</span><span className="cd-stat-label">Avg Order Value</span></div>
      </div>

      <div className="cd-body">
        {/* Customer List */}
        <div className="cd-list">
          <div className="cd-list-header">
            <h3>👥 Customers</h3>
            <div className="search-wrap" style={{ width: "100%" }}>
              <span className="search-icon">🔍</span>
              <input className="search-input" style={{ width: "100%" }} placeholder="Search by name, email, phone..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="cd-empty">No customers yet</div>
          ) : (
            filtered.map(u => {
              const uOrders = userOrders(u.id);
              const uOpen = uOrders.filter(o => o.status === "open").length;
              return (
                <div key={u.id}
                  className={`cd-customer-card ${selectedUser?.id === u.id ? "selected" : ""}`}
                  onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}>
                  <div className="cd-avatar">{u.name.charAt(0).toUpperCase()}</div>
                  <div className="cd-customer-info">
                    <strong>{u.name}</strong>
                    <span>✉️ {u.email}</span>
                    <span>📞 {u.phone}</span>
                    <span className="cd-joined">Joined: {formatDate(u.joinedAt)}</span>
                  </div>
                  <div className="cd-customer-meta">
                    <span className="cd-order-count">{uOrders.length} order{uOrders.length !== 1 ? "s" : ""}</span>
                    {uOpen > 0 && <span className="cd-open-badge">{uOpen} open</span>}
                    <span className="cd-order-total">₹{uOrders.filter(o => o.status !== "cancelled").reduce((s, o) => s + (o.grandTotal || 0), 0).toFixed(0)}</span>
                    <button className="cd-delete-btn" onClick={(e) => handleDelete(e, u.id)}>Delete Customer</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Order History */}
        <div className="cd-orders">
          {!selectedUser ? (
            <div className="cd-empty-orders">
              <div style={{ fontSize: "3rem" }}>👈</div>
              <p>Select a customer to view their order history</p>
            </div>
          ) : (
            <>
              <div className="cd-orders-header">
                <div>
                  <h3>📦 Orders — {selectedUser.name}</h3>
                  <p>{selectedUser.email} · {selectedUser.phone}</p>
                </div>
                <button className="close-btn" style={{ background: "#f0f0f0", color: "#333" }} onClick={() => setSelectedUser(null)}>✕</button>
              </div>

              {userOrders(selectedUser.id).length === 0 ? (
                <div className="cd-empty">No orders placed yet</div>
              ) : (
                userOrders(selectedUser.id).map((order, i) => (
                  <div key={order.id} className="cd-order-card">
                    <div className="cd-order-top">
                      <span className="cd-order-num">Order #{i + 1}</span>
                      <span className="cd-order-date">{formatDate(order.placedAt)}</span>
                      <span className={`cd-status-badge ${STATUS_CLASS[order.status] || "status-open"}`}>
                        {STATUS_LABEL[order.status] || "🟡 Open"}
                      </span>
                      <span className="cd-order-amount">₹{order.grandTotal?.toFixed(2)}</span>
                    </div>
                    <div className="cd-order-items">
                      {order.items?.map((item, j) => (
                        <span key={j} className="cd-order-item">
                          {item.emoji} {item.name} ({formatQty(item.qty, item.unit)}) — ₹{(item.price * item.qty).toFixed(2)}
                        </span>
                      ))}
                    </div>
                    <div className="cd-order-addr">
                      📍 {order.address?.room}, {order.address?.building}{order.address?.landmark ? `, Near ${order.address.landmark}` : ""}, {order.address?.area}, {order.address?.city}
                    </div>
                    <div className="cd-order-delivery">
                      📅 {order.deliveryDate} &nbsp; 🕐 {order.deliveryTime}
                    </div>
                    {order.status === "open" && (
                      <div className="cd-order-actions">
                        <button className="cd-dispatch-btn" onClick={() => handleDispatch(order.id)}>
                          🚚 Dispatch Order
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
