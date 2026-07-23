import { useState } from "react";
import { saveOrder } from "../data/store";

export default function Checkout({ items, total, onClose, onConfirm, currentUser }) {
  const [step, setStep] = useState("form"); // "form" | "confirmed"
  const [form, setForm] = useState({ name: currentUser?.name || "", phone: currentUser?.phone || "", room: "", building: "", landmark: "", area: "", city: "", date: "", time: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "Enter a valid 10-digit number";
    if (!form.room.trim()) e.room = "Room / Flat No is required";
    if (!form.building.trim()) e.building = "Building name is required";
    if (!form.area.trim()) e.area = "Area is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.date) e.date = "Please select a delivery date";
    if (!form.time) e.time = "Please select a time slot";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    saveOrder({
      customer: currentUser,
      items: items.map(i => ({ id: i.id, name: i.name, emoji: i.emoji, qty: i.qty, unit: i.unit, price: i.price })),
      subtotal: total,
      delivery: 20,
      grandTotal: total + 20,
      address: { room: form.room, building: form.building, landmark: form.landmark, area: form.area, city: form.city },
      phone: form.phone,
      deliveryDate: form.date,
      deliveryTime: form.time,
    });
    setStep("confirmed");
  };

  if (step === "confirmed") {
    return (
      <div className="checkout-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="checkout-panel confirmed-panel">
          <div className="confirmed-icon">🎉</div>
          <h2>Order Placed!</h2>
          <p>Thank you, <strong>{form.name}</strong>! Your order of <strong>₹{(total + 20).toFixed(2)}</strong> (incl. ₹20 delivery) will be delivered to:</p>
          <div className="confirmed-address">{form.room}, {form.building}{form.landmark ? `, Near ${form.landmark}` : ''}, {form.area}, {form.city}</div>
          <p className="confirmed-phone">📞 {form.phone}</p>
          <p className="confirmed-phone">📅 {form.date} &nbsp; 🕐 {form.time}</p>
          <div className="confirmed-items">
            {items.map(i => (
              <span key={i.id} className="confirmed-item">{i.emoji} {i.name}</span>
            ))}
          </div>
          <button className="hero-cta" style={{marginTop: "20px", width: "100%"}} onClick={() => { onConfirm(); onClose(); }}>
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
              <span>{i.emoji} {i.name} ({i.unit === 'kg' ? (i.qty < 1 ? `${i.qty * 1000}g` : `${i.qty} kg`) : `${i.qty} ${i.unit}`})</span>
              <span>₹{(i.price * i.qty).toFixed(2)}</span>
            </div>
          ))}
          <div className="checkout-summary-total">
            <span>Delivery Charges</span>
            <span>₹20.00</span>
          </div>
          <div className="checkout-summary-total">
            <strong>Total</strong>
            <strong>₹{(total + 20).toFixed(2)}</strong>
          </div>
        </div>

        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Full Name</label>
            <input value={form.name} readOnly className="input-readonly" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input value={form.phone} readOnly className="input-readonly" />
          </div>
          <div className="form-group">
            <label>Room / Flat No</label>
            <input placeholder="e.g. 304" value={form.room}
              onChange={e => setForm(f => ({...f, room: e.target.value}))} />
            {errors.room && <span className="form-error">{errors.room}</span>}
          </div>
          <div className="form-group">
            <label>Building Name</label>
            <input placeholder="e.g. Sunshine Apartments" value={form.building}
              onChange={e => setForm(f => ({...f, building: e.target.value}))} />
            {errors.building && <span className="form-error">{errors.building}</span>}
          </div>
          <div className="form-group">
            <label>Landmark</label>
            <input placeholder="e.g. Near City Mall" value={form.landmark}
              onChange={e => setForm(f => ({...f, landmark: e.target.value}))} />
          </div>
          <div className="form-group">
            <label>Area</label>
            <input placeholder="e.g. Andheri West" value={form.area}
              onChange={e => setForm(f => ({...f, area: e.target.value}))} />
            {errors.area && <span className="form-error">{errors.area}</span>}
          </div>
          <div className="form-group">
            <label>City</label>
            <input placeholder="e.g. Mumbai" value={form.city}
              onChange={e => setForm(f => ({...f, city: e.target.value}))} />
            {errors.city && <span className="form-error">{errors.city}</span>}
          </div>
          <div className="form-group">
            <label>Expected Delivery Date</label>
            <input type="date" value={form.date} min={new Date().toISOString().split('T')[0]}
              onChange={e => setForm(f => ({...f, date: e.target.value}))} />
            {errors.date && <span className="form-error">{errors.date}</span>}
          </div>
          <div className="form-group">
            <label>Preferred Delivery Time</label>
            <select value={form.time} onChange={e => setForm(f => ({...f, time: e.target.value}))}>
              <option value="">Select a time slot</option>
              <option>6:00 AM – 9:00 AM</option>
              <option>9:00 AM – 12:00 PM</option>
              <option>12:00 PM – 3:00 PM</option>
              <option>3:00 PM – 6:00 PM</option>
              <option>6:00 PM – 9:00 PM</option>
            </select>
            {errors.time && <span className="form-error">{errors.time}</span>}
          </div>
          <button type="submit" className="checkout-btn" style={{width:"100%", padding:"14px", borderRadius:"12px", fontSize:"1rem"}}>
            Place Order →
          </button>
        </form>
      </div>
    </div>
  );
}
