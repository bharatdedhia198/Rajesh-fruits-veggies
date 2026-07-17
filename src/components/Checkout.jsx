import { useState } from "react";

export default function Checkout({ items, total, onClose, onConfirm }) {
  const [step, setStep] = useState("form"); // "form" | "confirmed"
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "Enter a valid 10-digit number";
    if (!form.address.trim()) e.address = "Address is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) setStep("confirmed");
  };

  if (step === "confirmed") {
    return (
      <div className="checkout-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="checkout-panel confirmed-panel">
          <div className="confirmed-icon">🎉</div>
          <h2>Order Placed!</h2>
          <p>Thank you, <strong>{form.name}</strong>! Your order of <strong>₹{total.toFixed(2)}</strong> will be delivered to:</p>
          <div className="confirmed-address">{form.address}</div>
          <p className="confirmed-phone">📞 {form.phone}</p>
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
              <span>{i.emoji} {i.name} × {i.qty}{i.unit === 'kg' ? (i.qty < 1 ? `${i.qty * 1000}g` : ' kg') : ` ${i.unit}`}</span>
              <span>₹{(i.price * i.qty).toFixed(2)}</span>
            </div>
          ))}
          <div className="checkout-summary-total">
            <strong>Total</strong>
            <strong>₹{total.toFixed(2)}</strong>
          </div>
        </div>

        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Full Name</label>
            <input placeholder="Rajesh Thorat" value={form.name}
              onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input placeholder="9876543210" value={form.phone} maxLength={10}
              onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>
          <div className="form-group">
            <label>Delivery Address</label>
            <textarea placeholder="House No, Street, City, Pincode" rows={3} value={form.address}
              onChange={e => setForm(f => ({...f, address: e.target.value}))} />
            {errors.address && <span className="form-error">{errors.address}</span>}
          </div>
          <button type="submit" className="checkout-btn" style={{width:"100%", padding:"14px", borderRadius:"12px", fontSize:"1rem"}}>
            Place Order →
          </button>
        </form>
      </div>
    </div>
  );
}
