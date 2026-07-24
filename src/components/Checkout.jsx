import { useState } from "react";
import { saveOrder, getSavedAddresses, addOrUpdateAddress } from "../data/store";

const EMPTY_ADDR = { room: "", building: "", landmark: "", area: "", city: "", pincode: "" };
const formatAddrLine = (a) => `${a.room}, ${a.building}${a.landmark ? `, Near ${a.landmark}` : ""}, ${a.area}, ${a.city}`;
const formatQty = (qty, unit) => unit !== "kg" ? `${qty} ${unit}` : qty < 1 ? `${qty * 1000}g` : `${qty} kg`;

function AddrFields({ form, setForm, errors }) {
  return (
    <>
      <div className="form-group">
        <label>Room / Flat No</label>
        <input placeholder="e.g. 304" value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} />
        {errors?.room && <span className="form-error">{errors.room}</span>}
      </div>
      <div className="form-group">
        <label>Building Name</label>
        <input placeholder="e.g. Sunshine Apartments" value={form.building} onChange={e => setForm(f => ({ ...f, building: e.target.value }))} />
        {errors?.building && <span className="form-error">{errors.building}</span>}
      </div>
      <div className="form-group">
        <label>Landmark <span style={{ color: "#aaa", fontWeight: 400 }}>(optional)</span></label>
        <input placeholder="e.g. Near City Mall" value={form.landmark} onChange={e => setForm(f => ({ ...f, landmark: e.target.value }))} />
      </div>
      <div className="form-group">
        <label>Area</label>
        <input placeholder="e.g. Andheri West" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} />
        {errors?.area && <span className="form-error">{errors.area}</span>}
      </div>
      <div className="form-group">
        <label>City</label>
        <input placeholder="e.g. Mumbai" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
        {errors?.city && <span className="form-error">{errors.city}</span>}
      </div>
      <div className="form-group">
        <label>Pincode</label>
        <input placeholder="e.g. 400053" value={form.pincode} maxLength={6}
          onChange={e => { if (/^\d{0,6}$/.test(e.target.value)) setForm(f => ({ ...f, pincode: e.target.value })); }} />
        {errors?.pincode && <span className="form-error">{errors.pincode}</span>}
      </div>
    </>
  );
}

export default function Checkout({ items, total, onClose, onConfirm, currentUser }) {
  const email = currentUser?.email;
  const phone = currentUser?.phone;

  const [savedAddresses, setSavedAddresses] = useState(() => getSavedAddresses(email, phone));
  const [selectedIdx, setSelectedIdx] = useState(savedAddresses.length > 0 ? 0 : "new");
  const [editIdx, setEditIdx] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_ADDR);
  const [newForm, setNewForm] = useState(EMPTY_ADDR);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [errors, setErrors] = useState({});
  const [addrErrors, setAddrErrors] = useState({});
  const [step, setStep] = useState("form");

  const activeAddr = selectedIdx === "new"
    ? newForm
    : (editIdx !== null ? editForm : (savedAddresses[selectedIdx] || EMPTY_ADDR));

  const validate = () => {
    const e = {};
    const a = activeAddr;
    if (!a?.room?.trim()) e.room = "Room / Flat No is required";
    if (!a?.building?.trim()) e.building = "Building name is required";
    if (!a?.area?.trim()) e.area = "Area is required";
    if (!a?.city?.trim()) e.city = "City is required";
    if (!a?.pincode?.trim()) e.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(a.pincode)) e.pincode = "Enter a valid 6-digit pincode";
    if (!date) e.date = "Please select a delivery date";
    if (!time) e.time = "Please select a time slot";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveNew = () => {
    const e = {};
    if (!newForm.room.trim()) e.room = "Required";
    if (!newForm.building.trim()) e.building = "Required";
    if (!newForm.area.trim()) e.area = "Required";
    if (!newForm.city.trim()) e.city = "Required";
    if (!newForm.pincode.trim()) e.pincode = "Required";
    else if (!/^\d{6}$/.test(newForm.pincode)) e.pincode = "6-digit pincode required";
    if (Object.keys(e).length) { setAddrErrors(e); return; }
    addOrUpdateAddress(email, phone, { ...newForm });
    const updated = getSavedAddresses(email, phone);
    setSavedAddresses(updated);
    setSelectedIdx(updated.length - 1);
    setNewForm(EMPTY_ADDR);
    setAddrErrors({});
  };

  const handleSaveEdit = (idx) => {
    const e = {};
    if (!editForm.room.trim()) e.room = "Required";
    if (!editForm.building.trim()) e.building = "Required";
    if (!editForm.area.trim()) e.area = "Required";
    if (!editForm.city.trim()) e.city = "Required";
    if (!editForm.pincode.trim()) e.pincode = "Required";
    else if (!/^\d{6}$/.test(editForm.pincode)) e.pincode = "6-digit pincode required";
    if (Object.keys(e).length) { setAddrErrors(e); return; }
    addOrUpdateAddress(email, phone, { ...editForm }, idx);
    const updated = getSavedAddresses(email, phone);
    setSavedAddresses(updated);
    setEditIdx(null);
    setAddrErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const finalAddr = activeAddr;
    saveOrder({
      customer: currentUser,
      items: items.map(i => ({ id: i.id, name: i.name, emoji: i.emoji, qty: i.qty, unit: i.unit, price: i.price })),
      subtotal: total, delivery: 20, grandTotal: total + 20,
      address: finalAddr, deliveryDate: date, deliveryTime: time,
    });

    // WhatsApp — text only, no emojis
    const ADMIN_PHONE = "919152100325";
    const itemList = items.map(i => `  - ${i.name} | ${formatQty(i.qty, i.unit)} | Rs.${(i.price * i.qty).toFixed(2)}`).join("\n");
    const landmark = finalAddr.landmark ? `, Near ${finalAddr.landmark}` : "";
    const msg = [
      "*New Order Received!*",
      `Customer: ${currentUser?.name}`,
      `Phone: ${currentUser?.phone}`,
      "",
      "*Items:*",
      itemList,
      "",
      `Subtotal: Rs.${total.toFixed(2)}`,
      `Delivery: Rs.20.00`,
      `*Total: Rs.${(total + 20).toFixed(2)}*`,
      "",
      "*Delivery Address:*",
      `${finalAddr.room}, ${finalAddr.building}${landmark}, ${finalAddr.area}, ${finalAddr.city} - ${finalAddr.pincode}`,
      "",
      `Date: ${date}`,
      `Time: ${time}`,
    ].join("\n");
    window.open(`https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
    setStep("confirmed");
  };

  const startEdit = (e, idx) => {
    e.stopPropagation();
    setEditIdx(idx);
    setEditForm({ ...savedAddresses[idx] });
    setSelectedIdx(idx);
    setErrors({});
  };

  if (step === "confirmed") {
    return (
      <div className="checkout-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="checkout-panel confirmed-panel">
          <div className="confirmed-icon">🎉</div>
          <h2>Order Placed!</h2>
          <p>Thank you, <strong>{currentUser?.name}</strong>! Your order of <strong>Rs.{(total + 20).toFixed(2)}</strong> (incl. Rs.20 delivery) will be delivered to:</p>
          <div className="confirmed-address">{formatAddrLine(activeAddr)}</div>
          <p className="confirmed-phone">Phone: {currentUser?.phone}</p>
          <p className="confirmed-phone">Date: {date} &nbsp; Time: {time}</p>
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
              <span>{i.emoji} {i.name} ({formatQty(i.qty, i.unit)})</span>
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

          <div className="addr-section-label">📍 Delivery Address</div>

          {/* Saved address cards */}
          {savedAddresses.map((addr, idx) => (
            <div key={idx} className={`addr-card ${selectedIdx === idx && editIdx === null ? "addr-card-selected" : ""}`}>
              <div className="addr-card-top" onClick={() => { setSelectedIdx(idx); setEditIdx(null); setErrors({}); }}>
                <div className="addr-card-radio">
                  <div className={`addr-radio-dot ${selectedIdx === idx && editIdx === null ? "active" : ""}`} />
                </div>
                <div className="addr-card-text">
                  <strong>Address {idx + 1} — {addr.room}, {addr.building}</strong>
                  <span>{addr.landmark ? `Near ${addr.landmark}, ` : ""}{addr.area}, {addr.city}</span>
                </div>
                <button type="button" className="addr-edit-btn" onClick={(e) => startEdit(e, idx)}>Edit</button>
              </div>

              {editIdx === idx && (
                <div className="addr-edit-form" onClick={e => e.stopPropagation()}>
                  <AddrFields form={editForm} setForm={setEditForm} errors={addrErrors} />
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button type="button" className="addr-save-btn" onClick={() => handleSaveEdit(idx)}>Save Address</button>
                    <button type="button" className="addr-cancel-edit-btn" onClick={() => { setEditIdx(null); setAddrErrors({}); }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className={`addr-card ${selectedIdx === "new" ? "addr-card-selected" : ""}`}
            onClick={() => { setSelectedIdx("new"); setEditIdx(null); setAddrErrors({}); }}>
            <div className="addr-card-top">
              <div className="addr-card-radio">
                <div className={`addr-radio-dot ${selectedIdx === "new" ? "active" : ""}`} />
              </div>
              <div className="addr-card-text">
                <strong>+ Add {savedAddresses.length > 0 ? `Address ${savedAddresses.length + 1}` : "New Address"}</strong>
              </div>
            </div>
            {selectedIdx === "new" && (
              <div className="addr-edit-form" onClick={e => e.stopPropagation()}>
                <AddrFields form={newForm} setForm={setNewForm} errors={addrErrors} />
                <button type="button" className="addr-save-btn" onClick={handleSaveNew}>Save Address</button>
              </div>
            )}
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
