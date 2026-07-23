import { useState } from "react";
import { getUsers, getOrders, deleteCustomer } from "../data/store";

export default function CustomerDashboard() {
  const [users, setUsers] = useState(getUsers);
  const [orders, setOrders] = useState(getOrders);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");

  const handleDelete = (e, userId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this customer and all their orders? This cannot be undone.")) return;
    deleteCustomer(userId);
    setUsers(getUsers());
    setOrders(getOrders());
    if (selectedUser?.id === userId) setSelectedUser(null);
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  );

  const userOrders = (userId) => orders.filter(o => o.customer?.email === users.find(u => u.id === userId)?.email);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  const formatDate = (iso) => new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const formatQty = (qty, unit) => {
    if (unit !== "kg") return `${qty} ${unit}`;
    return qty < 1 ? `${qty * 1000}g` : `${qty} kg`;
  };

  return (
    <div className="cd-wrap">
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
                    <span className="cd-order-total">₹{uOrders.reduce((s, o) => s + (o.grandTotal || 0), 0).toFixed(0)}</span>
                    <button className="cd-delete-btn" onClick={(e) => handleDelete(e, u.id)} title="Delete customer">🗑️</button>
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
