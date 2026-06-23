import { ERROR_MESSAGES } from "@/lib/errors";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-nulo-ivory flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full text-center">
        <div className="font-display text-7xl md:text-8xl font-black text-nulo-primary mb-4">
          404
        </div>
        <span className="text-nulo-primary font-semibold tracking-widest text-xs uppercase">
          Page not found
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-nulo-text mt-3 mb-4">
          We couldn't find that page
        </h1>
        <p className="text-nulo-text-muted mb-8 text-base">
          {ERROR_MESSAGES.not_found}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/"
            className="bg-nulo-primary hover:bg-nulo-primary-mid text-white rounded-full px-6 py-3 font-semibold transition-colors shadow-md"
          >
            Back to home
          </a>
          <a
            href="#waitlist"
            className="border border-nulo-primary text-nulo-primary hover:bg-nulo-soft-orange rounded-full px-6 py-3 font-semibold transition-colors"
          >
            Join the waitlist
          </a>
        </div>
      </div>
    </main>
  );
}
