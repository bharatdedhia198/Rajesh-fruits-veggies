import { useState } from "react";
import { saveOrder, getSavedAddresses, saveAddress } from "../data/store";

const EMPTY_ADDR = { room: "", building: "", landmark: "", area: "", city: "" };

export default function Checkout({ items, total, onClose, onConfirm, currentUser }) {
  const email = currentUser?.email;
  const savedAddr = email ? (getSavedAddresses()[email] || null) : null;

  const [step, setStep] = useState("form");
  const [useNew, setUseNew] = useState(!savedAddr);
  const [addrForm, setAddrForm] = useState(savedAddr || EMPTY_ADDR);
  const [newAddrForm, setNewAddrForm] = useState(EMPTY_ADDR);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [errors, setErrors] = useState({});

  const activeAddr = useNew ? newAddrForm : addrForm;
  const setActiveAddr = useNew
    ? (fn) => setNewAddrForm(f => typeof fn === "function" ? fn(f) : fn)
    : (fn) => setAddrForm(f => typeof fn === "function" ? fn(f) : fn);

  const validate = () => {
    const e = {};
    if (!activeAddr.room.trim()) e.room = "Room / Flat No is required";
    if (!activeAddr.building.trim()) e.building = "Building name is required";
    if (!activeAddr.area.trim()) e.area = "Area is required";
    if (!activeAddr.city.trim()) e.city = "City is required";
    if (!date) e.date = "Please select a delivery date";
    if (!time) e.time = "Please select a time slot";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const ADMIN_PHONE = "919152100325"; // WhatsApp needs country code

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (email) saveAddress(email, activeAddr);
    saveOrder({
      customer: currentUser,
      items: items.map(i => ({ id: i.id, name: i.name, emoji: i.emoji, qty: i.qty, unit: i.unit, price: i.price })),
      subtotal: total,
      delivery: 20,
      grandTotal: total + 20,
      address: activeAddr,
      deliveryDate: date,
      deliveryTime: time,
    });
    // Notify admin via WhatsApp
    const itemList = items.map(i => `${i.emoji}${i.name}`).join(", ");
    const msg = encodeURIComponent(`🛒 New Order!\nCustomer: ${currentUser?.name} (${currentUser?.phone})\nItems: ${itemList}\nTotal: ₹${(total + 20).toFixed(2)}\nDelivery: ${date}, ${time}\nAddress: ${activeAddr.room}, ${activeAddr.building}, ${activeAddr.area}, ${activeAddr.city}`);
    window.open(`https://wa.me/${ADMIN_PHONE}?text=${msg}`, "_blank");
    setStep("confirmed");
  };

  const field = (key) => (
    <input value={activeAddr[key]} onChange={e => setActiveAddr(f => ({ ...f, [key]: e.target.value }))} />
  );

  if (step === "confirmed") {
    return (
      <div className="checkout-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="checkout-panel confirmed-panel">
          <div className="confirmed-icon">🎉</div>
          <h2>Order Placed!</h2>
          <p>Thank you, <strong>{currentUser?.name}</strong>! Your order of <strong>₹{(total + 20).toFixed(2)}</strong> (incl. ₹20 delivery) will be delivered to:</p>
          <div className="confirmed-address">{activeAddr.room}, {activeAddr.building}{activeAddr.landmark ? `, Near ${activeAddr.landmark}` : ""}, {activeAddr.area}, {activeAddr.city}</div>
          <p className="confirmed-phone">📞 {currentUser?.phone}</p>
          <p className="confirmed-phone">📅 {date} &nbsp; 🕐 {time}</p>
          <div className="confirmed-items">
            {items.map(i => <span key={i.id} className="confirmed-item">{i.emoji} {i.name}</span>)}
          </div>
          <button className="hero-cta" style={{ marginTop: "20px", width: "100%" }} onClick={() => { onConfirm(); onClose(); }}>
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="checkout-panel">
        <div className="checkout-header">
          <h2>🧾 Checkout</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="checkout-summary">
          {items.map(i => (
            <div key={i.id} className="checkout-summary-item">
              <span>{i.emoji} {i.name} ({i.unit === "kg" ? (i.qty < 1 ? `${i.qty * 1000}g` : `${i.qty} kg`) : `${i.qty} ${i.unit}`})</span>
              <span>₹{(i.price * i.qty).toFixed(2)}</span>
            </div>
          ))}
          <div className="checkout-summary-total"><span>Delivery Charges</span><span>₹20.00</span></div>
          <div className="checkout-summary-total"><strong>Total</strong><strong>₹{(total + 20).toFixed(2)}</strong></div>
        </div>

        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Full Name</label>
            <input value={currentUser?.name || ""} readOnly className="input-readonly" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input value={currentUser?.phone || ""} readOnly className="input-readonly" />
          </div>

          {/* Address section */}
          {savedAddr && (
            <div className="addr-toggle">
              <button type="button" className={!useNew ? "active" : ""} onClick={() => { setUseNew(false); setErrors({}); }}>
                📍 Saved Address
              </button>
              <button type="button" className={useNew ? "active" : ""} onClick={() => { setUseNew(true); setErrors({}); }}>
                ➕ New Address
              </button>
            </div>
          )}

          <div className="form-group">
            <label>Room / Flat No</label>
            {field("room")}
            {errors.room && <span className="form-error">{errors.room}</span>}
          </div>
          <div className="form-group">
            <label>Building Name</label>
            {field("building")}
            {errors.building && <span className="form-error">{errors.building}</span>}
          </div>
          <div className="form-group">
            <label>Landmark</label>
            <input value={activeAddr.landmark} placeholder="e.g. Near City Mall"
              onChange={e => setActiveAddr(f => ({ ...f, landmark: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Area</label>
            {field("area")}
            {errors.area && <span className="form-error">{errors.area}</span>}
          </div>
          <div className="form-group">
            <label>City</label>
            {field("city")}
            {errors.city && <span className="form-error">{errors.city}</span>}
          </div>

          <div className="form-group">
            <label>Expected Delivery Date</label>
            <input type="date" value={date} min={new Date().toISOString().split("T")[0]}
              onChange={e => setDate(e.target.value)} />
            {errors.date && <span className="form-error">{errors.date}</span>}
          </div>
          <div className="form-group">
            <label>Preferred Delivery Time</label>
            <select value={time} onChange={e => setTime(e.target.value)}>
              <option value="">Select a time slot</option>
              <option>6:00 AM – 9:00 AM</option>
              <option>9:00 AM – 12:00 PM</option>
              <option>12:00 PM – 3:00 PM</option>
              <option>3:00 PM – 6:00 PM</option>
              <option>6:00 PM – 9:00 PM</option>
            </select>
            {errors.time && <span className="form-error">{errors.time}</span>}
          </div>

          <button type="submit" className="checkout-btn" style={{ width: "100%", padding: "14px", borderRadius: "12px", fontSize: "1rem" }}>
            Place Order →
          </button>
        </form>
      </div>
    </div>
  );
}
