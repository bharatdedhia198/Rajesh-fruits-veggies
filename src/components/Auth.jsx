import { useState, useRef, useEffect } from "react";
import { registerUser, getUsers } from "../data/store";

const ADMIN = { name: "Bharat Dedhia", phone: "9152100325", email: "bharatdedhia198@gmail.com", password: "Bharat_2026" };

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("signup");
  const [loginWith, setLoginWith] = useState("email");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showPassStrength, setShowPassStrength] = useState(false);

  // OTP state
  const [otpStep, setOtpStep] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpInput, setOtpInput] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (otpStep) {
      setResendTimer(30);
      timerRef.current = setInterval(() => {
        setResendTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [otpStep]);

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

  const sendOtp = () => {
    if (!validate()) return;

    // For login: verify user exists and password matches
    if (mode === "login") {
      const normalizedPhone = normalizePhone(form.phone);
      const isAdmin = form.email === ADMIN.email || normalizedPhone === ADMIN.phone;
      if (!isAdmin) {
        const users = getUsers();
        const user = loginWith === "email"
          ? users.find(u => u.email === form.email)
          : users.find(u => u.phone === normalizedPhone);
        if (!user) { setErrors({ general: "No account found. Please sign up first." }); return; }
        if (user.password !== form.password) { setErrors({ password: "Incorrect password." }); return; }
      } else {
        if (form.password !== ADMIN.password) { setErrors({ password: "Incorrect password." }); return; }
      }
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(otp);
    setOtpInput(["", "", "", "", "", ""]);
    setOtpError("");
    setOtpStep(true);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otpInput];
    next[idx] = val;
    setOtpInput(next);
    setOtpError("");
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otpInput[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtpInput(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const verifyOtp = () => {
    const entered = otpInput.join("");
    if (entered.length < 6) { setOtpError("Please enter the complete 6-digit OTP."); return; }
    if (entered !== generatedOtp) { setOtpError("Incorrect OTP. Please try again."); return; }

    const normalizedPhone = normalizePhone(form.phone);
    const isAdmin = form.email === ADMIN.email || normalizedPhone === ADMIN.phone;
    const displayName = form.name || (isAdmin ? ADMIN.name : form.email.split("@")[0]);

    if (mode === "signup" && !isAdmin) {
      registerUser(displayName, form.email, normalizedPhone, form.password);
    }
    const users = getUsers();
    const stored = !isAdmin
      ? (loginWith === "email" ? users.find(u => u.email === form.email) : users.find(u => u.phone === normalizedPhone))
      : null;
    const resolvedEmail = stored?.email || form.email;
    const resolvedPhone = stored?.phone || normalizedPhone;
    onLogin(displayName, isAdmin, { email: resolvedEmail, phone: resolvedPhone });
  };

  const resendOtp = () => {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(otp);
    setOtpInput(["", "", "", "", "", ""]);
    setOtpError("");
    setResendTimer(30);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; });
    }, 1000);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const contactDisplay = mode === "login"
    ? (loginWith === "email" ? form.email : `+91 ${normalizePhone(form.phone)}`)
    : `+91 ${normalizePhone(form.phone)}`;

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  // ── OTP Screen ──
  if (otpStep) {
    return (
      <div className="auth-page">
        <div className="auth-left">
          <div className="auth-brand">
            <span className="auth-logo">🌿</span>
            <h1>Rajesh Fruits<br />&amp; Vegetables</h1>
            <p>Fresh from the farm to your door. Order online, get it delivered fresh every day.</p>
          </div>
          <div className="auth-floats">
            <span className="af af1">🍎</span><span className="af af2">🥭</span>
            <span className="af af3">🍇</span><span className="af af4">🥕</span>
            <span className="af af5">🍅</span><span className="af af6">🍌</span>
            <span className="af af7">🥦</span><span className="af af8">🍊</span>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <div className="otp-header">
              <div className="otp-icon">📱</div>
              <h2>Verify OTP</h2>
              <p>A 6-digit OTP has been sent to<br /><strong>{contactDisplay}</strong></p>
            </div>

            {/* Mock OTP display */}
            <div className="otp-mock-box">
              <span>🔐 Your OTP (demo):</span>
              <strong className="otp-mock-code">{generatedOtp}</strong>
            </div>

            <div className="otp-inputs" onPaste={handleOtpPaste}>
              {otpInput.map((val, idx) => (
                <input
                  key={idx}
                  ref={el => otpRefs.current[idx] = el}
                  className={`otp-box ${val ? "filled" : ""}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={val}
                  onChange={e => handleOtpChange(e.target.value, idx)}
                  onKeyDown={e => handleOtpKeyDown(e, idx)}
                />
              ))}
            </div>

            {otpError && <span className="auth-error" style={{ textAlign: "center", display: "block", marginTop: "8px" }}>{otpError}</span>}

            <button className="auth-submit" style={{ marginTop: "20px" }} onClick={verifyOtp}>
              Verify & {mode === "login" ? "Login" : "Create Account"} →
            </button>

            <div className="otp-resend">
              {resendTimer > 0
                ? <span>Resend OTP in <strong>{resendTimer}s</strong></span>
                : <button className="otp-resend-btn" onClick={resendOtp}>Resend OTP</button>
              }
            </div>

            <button className="otp-back-btn" onClick={() => { setOtpStep(false); setOtpError(""); }}>
              ← Change details
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Form ──
  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="auth-logo">🌿</span>
          <h1>Rajesh Fruits<br />&amp; Vegetables</h1>
          <p>Fresh from the farm to your door. Order online, get it delivered fresh every day.</p>
        </div>
        <div className="auth-floats">
          <span className="af af1">🍎</span><span className="af af2">🥭</span>
          <span className="af af3">🍇</span><span className="af af4">🥕</span>
          <span className="af af5">🍅</span><span className="af af6">🍌</span>
          <span className="af af7">🥦</span><span className="af af8">🍊</span>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs">
            <button className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setErrors({}); setOtpStep(false); }}>Sign Up</button>
            <button className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setErrors({}); setOtpStep(false); }}>Login</button>
          </div>

          <div className="auth-welcome">
            <h2>{mode === "login" ? "Welcome back! 👋" : "Create account 🌱"}</h2>
            <p>{mode === "login" ? "Login to continue shopping fresh produce" : "Join us for fresh fruits & vegetables"}</p>
          </div>

          {errors.general && <div className="auth-error-banner">{errors.general}</div>}

          <form onSubmit={(e) => { e.preventDefault(); sendOtp(); }} noValidate>
            {mode === "signup" && (
              <div className="auth-field">
                <label>Full Name</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">👤</span>
                  <input type="text" placeholder="Akshay Kumar" value={form.name} onChange={set("name")} />
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
                      <input type="email" placeholder="akshay@example.com" value={form.email} onChange={set("email")} />
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
                    <input type="email" placeholder="akshay@example.com" value={form.email} onChange={set("email")} />
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
                    <div className="pass-strength-bar"><div style={{ width: s.width, background: s.color }} /></div>
                    <span style={{ color: s.color }}>{s.label}</span>
                  </div>
                );
              })()}
              {errors.password && <span className="auth-error">{errors.password}</span>}
            </div>

            <button type="submit" className="auth-submit">
              {mode === "login" ? "Send OTP & Login →" : "Send OTP & Sign Up →"}
            </button>
          </form>

          <div className="auth-divider"><span>or continue as</span></div>
          <button className="auth-guest" onClick={() => onLogin("Guest")}>🛍️ Browse as Guest</button>
        </div>
      </div>
    </div>
  );
}
