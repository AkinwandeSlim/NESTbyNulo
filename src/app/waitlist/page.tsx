import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Join Waitlist — NEST by Nulo Africa' };

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back to NEST */}
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to NEST
          </Button>
        </Link>

        {/* Waitlist Content */}
        <div className="text-center mb-12">
          <span className="text-orange-600 font-semibold tracking-widest text-xs uppercase">
            Join The Waitlist
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 max-w-2xl mx-auto">
            Your first share of Nigerian real estate is one step away.
          </h1>
          <p className="text-gray-600 mt-4 max-w-xl mx-auto">
            Join thousands of Nigerians building wealth through property — without the ₦90M price tag.
          </p>
        </div>

        {/* Waitlist Form */}
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <form
            action="https://formsubmit.co/akinwande@nuloafrica.com"
            method="POST"
            className="space-y-5"
          >
            <input type="hidden" name="_subject" value="New NEST Waitlist Submission" />
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_template" value="table" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="full_name"
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                placeholder="jane@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                placeholder="08012345678"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <select
                  name="city"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition bg-white"
                >
                  <option value="">Select...</option>
                  <option value="Lagos">Lagos</option>
                  <option value="Abuja">Abuja</option>
                  <option value="Port Harcourt">Port Harcourt</option>
                  <option value="Other">Other</option>
                  <option value="Diaspora">Diaspora</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Investor Type</label>
                <select
                  name="investor_type"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition bg-white"
                >
                  <option value="">Select...</option>
                  <option value="first_time">First-Time Investor</option>
                  <option value="existing_landlord">Existing Landlord</option>
                  <option value="diaspora">Diaspora Investor</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl py-4 font-semibold text-lg transition-colors"
            >
              Join Waitlist
            </button>

            <p className="text-xs text-gray-500 text-center">
              By joining, you agree to receive updates about NEST by Nulo Africa.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
