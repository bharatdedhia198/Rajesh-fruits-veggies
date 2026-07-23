import { useState } from "react";

import { registerUser } from "../data/store";

const ADMIN = { name: "Bharat Dedhia", phone: "9152100325", email: "bharatdedhia198@gmail.com" };

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("signup"); // "login" | "signup"
  const [loginWith, setLoginWith] = useState("email"); // "email" | "phone"
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  const [showPassStrength, setShowPassStrength] = useState(false);

  const normalizePhone = (p) => p.replace(/^\+91[\s-]?/, "").replace(/[\s-]/g, "");

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^[6-9]\d{9}$/;

  const getPasswordStrength = (p) => {
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { label: "Weak", color: "#e53935", width: "25%" };
    if (score === 2) return { label: "Fair", color: "#fb8c00", width: "50%" };
    if (score === 3) return { label: "Good", color: "#43a047", width: "75%" };
    return { label: "Strong", color: "#1b5e20", width: "100%" };
  };

  const validate = () => {
    const e = {};
    if (mode === "signup") {
      if (!form.name.trim()) e.name = "Full name is required";
      else if (form.name.trim().length < 3) e.name = "Name must be at least 3 characters";
      if (!emailRegex.test(form.email)) e.email = "Enter a valid email address";
      if (!phoneRegex.test(normalizePhone(form.phone))) e.phone = "Enter a valid 10-digit Indian mobile number";
    }
    if (mode === "login") {
      if (loginWith === "email" && !emailRegex.test(form.email)) e.email = "Enter a valid email address";
      if (loginWith === "phone" && !phoneRegex.test(normalizePhone(form.phone))) e.phone = "Enter a valid 10-digit Indian mobile number";
    }
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    else if (!/[A-Z]/.test(form.password)) e.password = "Must contain at least one uppercase letter";
    else if (!/[0-9]/.test(form.password)) e.password = "Must contain at least one number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const normalizedPhone = normalizePhone(form.phone);
    const isAdmin = form.email === ADMIN.email || normalizedPhone === ADMIN.phone;
    const displayName = form.name || (isAdmin ? ADMIN.name : form.email.split("@")[0]);
    if (mode === "signup" && !isAdmin) {
      registerUser(displayName, form.email, normalizedPhone, form.password);
    }
    onLogin(displayName, isAdmin, { email: form.email, phone: normalizedPhone });
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
            <button className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setErrors({}); }}>
              Sign Up
            </button>
            <button className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setErrors({}); }}>
              Login
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

            {mode === "login" && (
              <div className="auth-field">
                <div className="login-with-toggle">
                  <button type="button" className={loginWith === "email" ? "active" : ""} onClick={() => { setLoginWith("email"); setErrors({}); }}>Email</button>
                  <button type="button" className={loginWith === "phone" ? "active" : ""} onClick={() => { setLoginWith("phone"); setErrors({}); }}>Phone</button>
                </div>
                {loginWith === "email" ? (
                  <>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon">✉️</span>
                      <input type="email" placeholder="rajesh@example.com" value={form.email} onChange={set("email")} />
                    </div>
                    {errors.email && <span className="auth-error">{errors.email}</span>}
                  </>
                ) : (
                  <>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon">📞</span>
                      <input type="tel" placeholder="9876543210 or +91 98765 43210" value={form.phone} onChange={set("phone")} />
                    </div>
                    {errors.phone && <span className="auth-error">{errors.phone}</span>}
                  </>
                )}
              </div>
            )}

            {mode === "signup" && (
              <>
                <div className="auth-field">
                  <label>Email Address</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">✉️</span>
                    <input type="email" placeholder="rajesh@example.com" value={form.email} onChange={set("email")} />
                  </div>
                  {errors.email && <span className="auth-error">{errors.email}</span>}
                </div>
                <div className="auth-field">
                  <label>Phone Number</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">📞</span>
                    <input type="tel" placeholder="9876543210 or +91 98765 43210" value={form.phone} onChange={set("phone")} />
                  </div>
                  {errors.phone && <span className="auth-error">{errors.phone}</span>}
                </div>
              </>
            )}

            <div className="auth-field">
              <label>Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  value={form.password}
                  onChange={set("password")}
                  onFocus={() => setShowPassStrength(true)}
                />
                <button type="button" className="auth-eye" onClick={() => setShowPass(s => !s)}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {mode === "signup" && form.password && showPassStrength && (() => {
                const s = getPasswordStrength(form.password);
                return (
                  <div className="pass-strength">
                    <div className="pass-strength-bar">
                      <div style={{ width: s.width, background: s.color }} />
                    </div>
                    <span style={{ color: s.color }}>{s.label}</span>
                  </div>
                );
              })()}
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
