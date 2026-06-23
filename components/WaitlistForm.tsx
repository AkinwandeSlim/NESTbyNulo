"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ApiCallError, ERROR_MESSAGES, apiFetch, type ErrorCategory } from "@/lib/errors";

interface FormState {
  full_name: string;
  email: string;
  phone: string;
  city: string;
  investor_type: string;
}

export default function WaitlistForm() {
  const [formData, setFormData] = useState<FormState>({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    investor_type: "",
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [serverError, setServerError] = useState<{ category: ErrorCategory; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ full_name: string; email: string; position: number; referral_code: string } | null>(null);
  const [referredBy, setReferredBy] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setReferredBy(ref);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("nest_waitlist_success");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.position === "number" && typeof parsed.referral_code === "string" && parsed.full_name && parsed.email) {
        setSuccess(parsed);
      }
    } catch {}
  }, []);

  const validate = () => {
    const newErrors: Partial<FormState> = {};
    if (!formData.full_name.trim()) newErrors.full_name = "Full name is required";
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Valid email is required";
    if (!/^(\+234|0)[0-9]{10}$/.test(formData.phone)) newErrors.phone = "Valid Nigerian phone required";
    if (!formData.city) newErrors.city = "Please select a city";
    if (!formData.investor_type) newErrors.investor_type = "Please select an investor type";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof FormState]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await apiFetch("/api/waitlist/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, referred_by: referredBy }),
      });

      const data = await res.json();

      setSuccess({
        full_name: formData.full_name,
        email: formData.email,
        position: data.position,
        referral_code: data.referral_code,
      });
      try {
        window.localStorage.setItem(
          "nest_waitlist_success",
          JSON.stringify({
            full_name: formData.full_name,
            email: formData.email,
            position: data.position,
            referral_code: data.referral_code,
          })
        );
      } catch {}
      const firstName = formData.full_name.trim().split(" ")[0];
      toast.success(`Welcome ${firstName}! You're #${data.position} on the NEST waitlist 🎉`, {
        duration: 5000,
      });
    } catch (err) {
      // Categorize the error and surface the right user-facing message
      let category: ErrorCategory = "unknown";
      let message = ERROR_MESSAGES.unknown;
      let field: string | undefined;

      if (err instanceof ApiCallError) {
        category = err.body.category;
        message = err.body.error;
        field = err.body.field;
      } else if (err instanceof Error) {
        message = err.message || ERROR_MESSAGES.unknown;
      }

      setServerError({ category, message });

      // Highlight the offending field if the API told us which one
      if (field && (field in formData)) {
        setErrors((prev) => ({ ...prev, [field]: message } as Partial<FormState>));
      }

      // Toast = brief heads-up. The persistent banner below holds the full
      // message. Tailor the toast text to the category for faster scanning.
      const toastTitle =
        category === "network" ? "📡 network issue pls wait"
        : category === "validation" ? "✏️ Please review the form"
        : category === "conflict" ? "✉️ Already on the waitlist"
        : category === "server" ? "⚠️ Server hiccup"
        : "Something went wrong";

      toast.error(toastTitle, {
        description: message,
        duration: category === "network" ? 6000 : 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const referralLink = success ? `${typeof window !== "undefined" ? window.location.origin : ""}?ref=${success.referral_code}` : "";
  const firstName = success ? success.full_name.trim().split(" ")[0] : "";
  const initials = success
    ? success.full_name
        .trim()
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  const resetForm = () => {
    try {
      window.localStorage.removeItem("nest_waitlist_success");
    } catch {}
    setSuccess(null);
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      city: "",
      investor_type: "",
    });
    setErrors({});
    setServerError(null);
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-2xl border border-nulo-border p-8 text-center shadow-sm max-w-xl mx-auto"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl"
        >
          ✅
        </motion.div>
        <h3 className="font-display text-2xl font-bold text-nulo-text mb-2">
          You&apos;re on the list, {firstName}!
        </h3>
        <p className="text-nulo-text-muted mb-6">Welcome to the NEST community 🎉</p>

        {/* User info card */}
        <div className="bg-nulo-soft-orange rounded-xl p-4 mb-6 flex items-center gap-3 text-left">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-nulo-primary to-nulo-primary-dark flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-nulo-text truncate">{success.full_name}</p>
            <p className="text-sm text-nulo-text-muted truncate">{success.email}</p>
          </div>
        </div>

        {/* Position display */}
        <div className="mb-6">
          <p className="text-nulo-text-muted mb-1 text-sm">Your position</p>
          <p className="text-5xl font-display font-black text-nulo-primary">#{success.position}</p>
          <p className="text-nulo-text-muted text-sm mt-1">on the NEST waitlist</p>
        </div>

        {/* Referral link */}
        <div className="bg-nulo-soft-orange rounded-xl p-4 mb-6">
          <p className="text-sm text-nulo-text-secondary mb-2 font-semibold">Your referral link</p>
          <p className="text-sm text-nulo-primary font-mono break-all mb-3">{referralLink}</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(referralLink);
              toast.success("Referral link copied! Share it with friends 🎉", { duration: 3000 });
            }}
            className="bg-nulo-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-nulo-primary-mid transition-colors"
          >
            Copy Link
          </button>
        </div>

        <p className="text-sm text-nulo-text-muted mb-6">
          🚀 Refer <strong>5 friends</strong> → Get <strong>priority access</strong> before public launch
        </p>

        <button
          onClick={resetForm}
          className="w-full bg-white border border-nulo-border text-nulo-text py-3 rounded-xl font-semibold hover:bg-nulo-soft-orange transition-colors"
        >
          Submit another entry
        </button>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-nulo-border p-8 max-w-xl mx-auto">
      {referredBy && (
        <div className="bg-nulo-soft-orange border border-orange-200 rounded-xl px-4 py-2 text-sm text-nulo-primary mb-6">
          🎉 You were referred by a NEST member. You&apos;ll both get priority access.
        </div>
      )}

      {serverError && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-base font-bold">
              {serverError.category === "network" ? "📡" : serverError.category === "validation" ? "✏️" : serverError.category === "conflict" ? "✉️" : "⚠️"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800">
                {serverError.category === "network" && "Connection hiccup"}
                {serverError.category === "validation" && "Please check your details"}
                {serverError.category === "conflict" && "You're already on the list"}
                {serverError.category === "server" && "Something went wrong on our end"}
                {serverError.category === "unknown" && "Something unexpected happened"}
                {serverError.category === "rate_limit" && "Slow down a moment"}
                {serverError.category === "authentication" && "Session check needed"}
                {serverError.category === "authorization" && "Action not allowed"}
                {serverError.category === "not_found" && "Not found"}
              </p>
              <p className="text-sm text-red-700 mt-0.5">{serverError.message}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setServerError(null);
                if (typeof window !== "undefined") {
                  document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
              className="shrink-0 text-xs font-semibold text-red-700 hover:text-red-900 underline underline-offset-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-nulo-text-secondary mb-1">Full Name</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className="w-full border border-nulo-border rounded-xl px-4 py-3 text-nulo-text placeholder:text-nulo-text-muted focus:outline-none focus:ring-2 focus:ring-nulo-primary focus:border-transparent transition"
            placeholder="Jane Doe"
          />
          {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-nulo-text-secondary mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-nulo-border rounded-xl px-4 py-3 text-nulo-text placeholder:text-nulo-text-muted focus:outline-none focus:ring-2 focus:ring-nulo-primary focus:border-transparent transition"
            placeholder="jane@example.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-nulo-text-secondary mb-1">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border border-nulo-border rounded-xl px-4 py-3 text-nulo-text placeholder:text-nulo-text-muted focus:outline-none focus:ring-2 focus:ring-nulo-primary focus:border-transparent transition"
            placeholder="08012345678"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-nulo-text-secondary mb-1">City</label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full border border-nulo-border rounded-xl px-4 py-3 text-nulo-text focus:outline-none focus:ring-2 focus:ring-nulo-primary focus:border-transparent transition bg-white"
            >
              <option value="">Select...</option>
              <option value="Lagos">Lagos</option>
              <option value="Abuja">Abuja</option>
              <option value="Port Harcourt">Port Harcourt</option>
              <option value="Other">Other</option>
              <option value="Diaspora">Diaspora</option>
            </select>
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-nulo-text-secondary mb-1">Investor Type</label>
            <select
              name="investor_type"
              value={formData.investor_type}
              onChange={handleChange}
              className="w-full border border-nulo-border rounded-xl px-4 py-3 text-nulo-text focus:outline-none focus:ring-2 focus:ring-nulo-primary focus:border-transparent transition bg-white"
            >
              <option value="">Select...</option>
              <option value="first_time">First-Time Investor</option>
              <option value="existing_landlord">Existing Landlord</option>
              <option value="diaspora">Diaspora Investor</option>
            </select>
            {errors.investor_type && <p className="text-red-500 text-sm mt-1">{errors.investor_type}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-nulo-primary hover:bg-nulo-primary-mid text-white rounded-xl py-4 font-semibold text-lg transition-colors flex items-center justify-center gap-2 ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Reserving your spot...
            </>
          ) : serverError && serverError.category === "network" ? (
            <>📡 Retry — network issue pls wait</>
          ) : serverError ? (
            <>Try again</>
          ) : (
            "Join Waitlist"
          )}
        </button>
      </form>
    </div>
  );
}
