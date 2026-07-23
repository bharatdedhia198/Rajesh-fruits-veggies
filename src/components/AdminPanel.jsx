import { useState } from "react";

const EMPTY = { name: "", description: "", price: "", unit: "kg", category: "fruit", image: "", emoji: "🛒", bg: "#f0f7f0" };
const UNITS = ["kg", "piece", "dozen", "bunch", "head"];
const CATEGORIES = ["fruit", "vegetable"];
const EMOJIS = ["🍎","🍌","🥭","🍇","🍉","🍊","🍅","🥕","🥦","🥬","🥔","🧅","🍋","🍑","🍓","🫐","🥝","🌽","🧄","🫑"];

function ProductForm({ initial, onSave, onCancel, title }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(initial.image || "");

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      setForm(f => ({ ...f, image: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = "Enter a valid price";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (validate()) onSave({ ...form, price: Number(form.price) });
  };

  return (
    <div className="admin-form-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="admin-form-panel">
        <div className="admin-form-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onCancel}>✕</button>
        </div>

        <div className="admin-form-body">
          <div className="admin-emoji-picker">
            <label>Emoji</label>
            <div className="emoji-grid">
              {EMOJIS.map(em => (
                <button key={em} type="button"
                  className={`emoji-opt ${form.emoji === em ? "selected" : ""}`}
                  onClick={() => setForm(f => ({ ...f, emoji: em }))}>
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-form-row">
            <div className="form-group">
              <label>Product Name</label>
              <input value={form.name} onChange={set("name")} placeholder="e.g. Apple" />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={set("category")}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <input value={form.description} onChange={set("description")} placeholder="e.g. Fresh red apples" />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          <div className="admin-form-row">
            <div className="form-group">
              <label>Price (₹)</label>
              <input type="number" value={form.price} onChange={set("price")} placeholder="e.g. 165" min="1" />
              {errors.price && <span className="form-error">{errors.price}</span>}
            </div>
            <div className="form-group">
              <label>Unit</label>
              <select value={form.unit} onChange={set("unit")}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Product Image</label>
            <div className="image-upload-wrap">
              <label className="image-upload-btn">
                📁 Choose from Device
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                />
              </label>
              <span className="image-upload-or">or</span>
              <input
                className="image-url-input"
                placeholder="Paste image path e.g. /images/apple.jfif"
                value={form.image.startsWith("data:") ? "" : form.image}
                onChange={(e) => { setPreview(e.target.value); set("image")(e); }}
              />
            </div>
          </div>

          {preview && (
            <div className="admin-img-preview">
              <img src={preview} alt="preview" onError={(e) => e.target.style.display = "none"} />
            </div>
          )}
        </div>

        <div className="admin-form-footer">
          <button className="clear-btn" onClick={onCancel}>Cancel</button>
          <button className="checkout-btn" style={{ flex: 2 }} onClick={handleSave}>Save Product</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPanel({ products, onUpdate }) {
  const [editItem, setEditItem] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);

  const handleEdit = (item) => setEditItem(item);

  const handleSaveEdit = (updated) => {
    onUpdate(products.map(p => p.id === updated.id ? updated : p));
    setEditItem(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this product?"))
      onUpdate(products.filter(p => p.id !== id));
  };

  const handleAdd = (newItem) => {
    const id = Date.now();
    onUpdate([...products, { ...newItem, id }]);
    setShowAdd(false);
  };

  const handleDragStart = (i) => setDragIdx(i);
  const handleDragOver = (e, i) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    const reordered = [...products];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(i, 0, moved);
    onUpdate(reordered);
    setDragIdx(i);
  };
  const handleDragEnd = () => setDragIdx(null);

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h2>🛠️ Admin Panel</h2>
          <p>Drag to reorder · Edit or delete products · Add new items</p>
        </div>
        <button className="admin-add-btn" onClick={() => setShowAdd(true)}>+ Add Product</button>
      </div>

      <div className="admin-grid">
        {products.map((p, i) => (
          <div
            key={p.id}
            className={`admin-card ${dragIdx === i ? "dragging" : ""}`}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDragEnd={handleDragEnd}
          >
            <div className="admin-card-drag">⠿</div>
            <div className="admin-card-img">
              {p.image ? (
                <img src={p.image} alt={p.name} onError={(e) => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }} />
              ) : null}
              <div className="admin-card-emoji" style={{ display: p.image ? "none" : "flex" }}>{p.emoji}</div>
            </div>
            <div className="admin-card-info">
              <strong>{p.name}</strong>
              <span>{p.description}</span>
              <span className="admin-card-meta">₹{p.price} / {p.unit} · {p.category}</span>
            </div>
            <div className="admin-card-actions">
              <button className="admin-edit-btn" onClick={() => handleEdit(p)}>✏️ Edit</button>
              <button className="admin-delete-btn" onClick={() => handleDelete(p.id)}>🗑️ Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editItem && (
        <ProductForm
          title="Edit Product"
          initial={editItem}
          onSave={handleSaveEdit}
          onCancel={() => setEditItem(null)}
        />
      )}

      {showAdd && (
        <ProductForm
          title="Add New Product"
          initial={EMPTY}
          onSave={handleAdd}
          onCancel={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
