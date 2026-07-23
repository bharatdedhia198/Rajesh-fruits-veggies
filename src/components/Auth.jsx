import { useState } from "react";

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (mode === "signup" && !form.name.trim()) e.name = "Name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email is required";
    if (mode === "signup" && !/^\d{10}$/.test(form.phone)) e.phone = "Enter a valid 10-digit number";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onLogin(form.name || form.email.split("@")[0]);
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="auth-logo">🌿</span>
          <h1>Rajesh Fruits<br />&amp; Vegetables</h1>
          <p>Fresh from the farm to your door. Order online, get it delivered fresh every day.</p>
        </div>
        <div className="auth-floats">
          <span className="af af1">🍎</span>
          <span className="af af2">🥭</span>
          <span className="af af3">🍇</span>
          <span className="af af4">🥕</span>
          <span className="af af5">🍅</span>
          <span className="af af6">🍌</span>
          <span className="af af7">🥦</span>
          <span className="af af8">🍊</span>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs">
            <button className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setErrors({}); }}>
              Login
            </button>
            <button className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setErrors({}); }}>
              Sign Up
            </button>
          </div>

          <div className="auth-welcome">
            <h2>{mode === "login" ? "Welcome back! 👋" : "Create account 🌱"}</h2>
            <p>{mode === "login" ? "Login to continue shopping fresh produce" : "Join us for fresh fruits & vegetables"}</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {mode === "signup" && (
              <div className="auth-field">
                <label>Full Name</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">👤</span>
                  <input type="text" placeholder="Rajesh Thorat" value={form.name} onChange={set("name")} />
                </div>
                {errors.name && <span className="auth-error">{errors.name}</span>}
              </div>
            )}

            <div className="auth-field">
              <label>Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉️</span>
                <input type="email" placeholder="rajesh@example.com" value={form.email} onChange={set("email")} />
              </div>
              {errors.email && <span className="auth-error">{errors.email}</span>}
            </div>

            {mode === "signup" && (
              <div className="auth-field">
                <label>Phone Number</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">📞</span>
                  <input type="tel" placeholder="9876543210" maxLength={10} value={form.phone} onChange={set("phone")} />
                </div>
                {errors.phone && <span className="auth-error">{errors.phone}</span>}
              </div>
            )}

            <div className="auth-field">
              <label>Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input type={showPass ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={set("password")} />
                <button type="button" className="auth-eye" onClick={() => setShowPass(s => !s)}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && <span className="auth-error">{errors.password}</span>}
            </div>

            {mode === "login" && (
              <div className="auth-forgot">
                <span>Forgot password?</span>
              </div>
            )}

            <button type="submit" className="auth-submit">
              {mode === "login" ? "Login →" : "Create Account →"}
            </button>
          </form>

          <div className="auth-divider"><span>or continue as</span></div>

          <button className="auth-guest" onClick={() => onLogin("Guest")}>
            🛍️ Browse as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
