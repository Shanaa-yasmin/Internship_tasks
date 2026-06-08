import { useState } from "react";

const STEPS = ["Personal", "Account", "Details"];

const initialForm = {
  name: "",
  email: "",
  password: "",
  address: "",
  phone: "",
  parentName: "",
  parentPhone: "",
};

// Regex patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
// Password: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char

function validate(step, form) {
  const errors = {};
  if (step === 0) {
    if (!form.name.trim()) errors.name = "Name is required.";
  }
  if (step === 1) {
    if (!EMAIL_REGEX.test(form.email))
      errors.email = "Enter a valid email address.";
    if (!PASSWORD_REGEX.test(form.password))
      errors.password =
        "Min 8 chars with uppercase, lowercase, number & special character (@$!%*?&).";
  }
  if (step === 2) {
    if (!form.address.trim()) errors.address = "Address is required.";
    if (!form.phone.trim()) errors.phone = "Phone number is required.";
  }
  return errors;
}

function Field({ label, id, type = "text", value, onChange, error, placeholder }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label
        htmlFor={id}
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: "#888",
          marginBottom: 6,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          boxSizing: "border-box",
          border: error ? "1.5px solid #e05a5a" : "1.5px solid #e0e0e0",
          borderRadius: 8,
          padding: "10px 13px",
          fontSize: 15,
          color: "#222",
          background: "#fff",
          outline: "none",
          fontFamily: "'DM Sans', sans-serif",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => {
          if (!error) e.target.style.borderColor = "#5b8ef4";
        }}
        onBlur={(e) => {
          if (!error) e.target.style.borderColor = "#e0e0e0";
        }}
      />
      {error && (
        <p style={{ margin: "5px 0 0", fontSize: 12, color: "#e05a5a", fontFamily: "'DM Sans', sans-serif" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function RegistrationForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleNext = () => {
    const errs = validate(step, form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  const handleSubmit = () => {
    const errs = validate(step, form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    // Append new submission to existing saved list
    const existing = localStorage.getItem("reg_submissions");
    const submissions = existing ? JSON.parse(existing) : [];
    submissions.push({ ...form, submittedAt: new Date().toISOString() });
    localStorage.setItem("reg_submissions", JSON.stringify(submissions));

    setSubmitted(true);
  };

  const handleReset = () => {
    setForm(initialForm);
    setStep(0);
    setErrors({});
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div style={outerStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: "center", padding: "12px 0 4px" }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "#eef3fe", display: "flex", alignItems: "center",
              justifyContent: "center", margin: "0 auto 18px",
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#5b8ef4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={{ ...headingStyle, marginBottom: 8 }}>All done!</h2>
            <p style={{ color: "#999", fontSize: 14, fontFamily: "'DM Sans', sans-serif", marginBottom: 28 }}>
              Your registration has been saved.
            </p>
            <button onClick={handleReset} style={primaryBtn}>Start over</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');`}</style>
      <div style={outerStyle}>
        <div style={cardStyle}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
              Step {step + 1} of {STEPS.length}
            </p>
            <h2 style={headingStyle}>{stepTitle(step)}</h2>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {STEPS.map((label, i) => (
                <div key={i} style={{ flex: 1 }}>
                  <div style={{
                    height: 3,
                    borderRadius: 99,
                    background: i <= step ? "#5b8ef4" : "#eee",
                    transition: "background 0.3s",
                  }} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {STEPS.map((label, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center" }}>
                  <span style={{
                    fontSize: 11,
                    fontFamily: "'DM Sans', sans-serif",
                    color: i === step ? "#5b8ef4" : "#bbb",
                    fontWeight: i === step ? 600 : 400,
                    letterSpacing: "0.04em",
                  }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step content */}
          <div>
            {step === 0 && (
              <Field label="Full Name" id="name" value={form.name} onChange={set("name")} error={errors.name} placeholder="Jane Smith" />
            )}
            {step === 1 && (
              <>
                <Field label="Email" id="email" type="email" value={form.email} onChange={set("email")} error={errors.email} placeholder="jane@example.com" />
                <Field label="Password" id="password" type="password" value={form.password} onChange={set("password")} error={errors.password} placeholder="Min 8 chars, upper+lower+number+symbol" />
              </>
            )}
            {step === 2 && (
              <>
                <Field label="Address" id="address" value={form.address} onChange={set("address")} error={errors.address} placeholder="123 Main St, City" />
                <Field label="Phone Number" id="phone" type="tel" value={form.phone} onChange={set("phone")} error={errors.phone} placeholder="+1 555 000 0000" />
                <div style={{ borderTop: "1px solid #f0f0f0", margin: "22px 0 20px" }} />
                <p style={{ fontSize: 12, letterSpacing: "0.07em", textTransform: "uppercase", color: "#bbb", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, marginBottom: 16 }}>
                  Parent / Guardian
                </p>
                <Field label="Parent Name" id="parentName" value={form.parentName} onChange={set("parentName")} error={errors.parentName} placeholder="Optional" />
                <Field label="Parent Phone" id="parentPhone" type="tel" value={form.parentPhone} onChange={set("parentPhone")} error={errors.parentPhone} placeholder="Optional" />
              </>
            )}
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <button
              onClick={handleBack}
              disabled={step === 0}
              style={step === 0 ? ghostBtnDisabled : ghostBtn}
            >
              ← Back
            </button>
            {step < STEPS.length - 1
              ? <button onClick={handleNext} style={primaryBtn}>Next →</button>
              : <button onClick={handleSubmit} style={primaryBtn}>Submit</button>
            }
          </div>
        </div>
      </div>
    </>
  );
}

function stepTitle(step) {
  return ["Personal Information", "Account Information", "Additional Details"][step];
}

const outerStyle = {
  minHeight: "100vh",
  background: "#f7f7f7",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px 16px",
};

const cardStyle = {
  background: "#fff",
  borderRadius: 14,
  border: "1.5px solid #ebebeb",
  padding: "36px 32px",
  width: "100%",
  maxWidth: 420,
  boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
};

const headingStyle = {
  fontFamily: "'DM Serif Display', serif",
  fontSize: 24,
  fontWeight: 400,
  color: "#1a1a1a",
  margin: 0,
};

const primaryBtn = {
  background: "#5b8ef4",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 22px",
  fontSize: 14,
  fontWeight: 500,
  fontFamily: "'DM Sans', sans-serif",
  cursor: "pointer",
  letterSpacing: "0.02em",
};

const ghostBtn = {
  background: "none",
  color: "#888",
  border: "1.5px solid #e0e0e0",
  borderRadius: 8,
  padding: "9px 18px",
  fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
  cursor: "pointer",
};

const ghostBtnDisabled = {
  ...ghostBtn,
  opacity: 0.3,
  cursor: "default",
};