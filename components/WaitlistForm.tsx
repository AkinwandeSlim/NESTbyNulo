"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ position: number; referral_code: string } | null>(null);
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
      if (parsed && typeof parsed.position === "number" && typeof parsed.referral_code === "string") {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/waitlist/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, referred_by: referredBy }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setServerError("This email is already on the waitlist.");
        return;
      }
      if (!res.ok) {
        throw new Error(data.error || "Failed to join waitlist");
      }

      setSuccess({ position: data.position, referral_code: data.referral_code });
      try {
        window.localStorage.setItem(
          "nest_waitlist_success",
          JSON.stringify({ position: data.position, referral_code: data.referral_code })
        );
      } catch {}
      toast.success("You're on the list! Check your email for your waitlist position and referral link.", {
        duration: 5000,
      });
    } catch (err) {
      const errorMessage = serverError || "Failed to join waitlist. Please try again.";
      setServerError(errorMessage);
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const referralLink = success ? `${typeof window !== "undefined" ? window.location.origin : ""}?ref=${success.referral_code}` : "";

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-nulo-border p-8 text-center shadow-sm max-w-xl mx-auto">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
        <h3 className="font-display text-2xl font-bold text-nulo-text mb-2">You&apos;re on the list!</h3>
        <p className="text-nulo-text-muted mb-1">You are</p>
        <p className="text-5xl font-display font-black text-nulo-primary mb-1">#{success.position}</p>
        <p className="text-nulo-text-muted mb-6">on the NEST waitlist</p>

        <div className="bg-nulo-soft-orange rounded-xl p-4 mb-6">
          <p className="text-sm text-nulo-text-secondary mb-2 font-semibold">Your referral link</p>
          <p className="text-sm text-nulo-primary font-mono break-all mb-3">{referralLink}</p>
          <button
            onClick={() => navigator.clipboard.writeText(referralLink)}
            className="bg-nulo-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-nulo-primary-mid transition-colors"
          >
            Copy Link
          </button>
        </div>

        <p className="text-sm text-nulo-text-muted">
          🚀 Refer <strong>5 friends</strong> → Get <strong>priority access</strong> before public launch
        </p>
      </div>
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
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
          {serverError}
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
              Joining...
            </>
          ) : (
            "Join Waitlist"
          )}
        </button>
      </form>
    </div>
  );
}
