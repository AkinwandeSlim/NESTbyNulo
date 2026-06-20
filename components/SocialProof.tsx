import Reveal from "@/components/reveal";

const testimonials = [
  { name: "Amara O.", role: "Software Engineer", city: "Lagos", quote: "I never thought I could own property in Abuja on my salary. NEST makes this real." },
  { name: "Chukwuemeka B.", role: "Marketing Manager", city: "Abuja", quote: "The transparency is what got me. I can see exactly what I own and what I earn." },
  { name: "Tolu A.", role: "Diaspora, UK", quote: "Sending money home for years. Finally a structured way to actually own something." },
  { name: "Funke I.", role: "Doctor", city: "Port Harcourt", quote: "Diversified my savings into real estate without needing millions upfront. Brilliant." },
  { name: "Ibrahim S.", role: "Entrepreneur", city: "Kano", quote: "The escrow structure gave me confidence. I trust my money is safe while earning." },
  { name: "Ngozi E.", role: "Banker", city: "Lagos", quote: "Finally a platform that treats everyday Nigerians like serious investors. Love it." },
  { name: "Daniel A.", role: "Diaspora, USA", quote: "Owning property back home without flying back or dealing with agents? Game changer." },
  { name: "Aisha M.", role: "Teacher", city: "Abuja", quote: "I started with ₦500k and now I co-own a real property. This is the future." },
];

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <div className="flex-shrink-0 w-[340px] md:w-[400px] bg-white rounded-2xl p-6 shadow-lg shadow-nulo-primary-dark/20 border border-nulo-soft-orange hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex gap-1 mb-3 text-nulo-accent text-sm">★★★★★</div>
      <p className="text-nulo-text text-[15px] mb-6 leading-relaxed font-medium">
        &quot;{t.quote}&quot;
      </p>
      <div className="flex items-center gap-3 pt-4 border-t border-nulo-soft-orange">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-nulo-primary to-nulo-primary-dark flex items-center justify-center font-bold text-white text-sm shadow-md shadow-nulo-primary/30">
          {t.name.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-sm text-nulo-text">{t.name}</p>
          <p className="text-nulo-text-muted text-xs">{t.role} · {t.city}</p>
        </div>
      </div>
    </div>
  );
}

export default function SocialProof() {
  return (
    <section className="bg-nulo-ivory py-20 md:py-28 overflow-hidden">
      <Reveal className="max-w-6xl mx-auto px-4 md:px-8 text-center mb-14">
        <span className="inline-block px-4 py-1.5 mb-5 text-xs font-semibold tracking-widest uppercase text-nulo-primary bg-nulo-soft-orange rounded-full border border-orange-200">
          Trusted Across Nigeria
        </span>
        <h2 className="font-display font-bold text-3xl md:text-5xl text-nulo-text mb-4 leading-tight">
          Real Nigerians. Real ownership.
        </h2>
        <p className="text-nulo-text-muted text-base md:text-lg max-w-2xl mx-auto">
          From Lagos to London, Nigerians are building generational wealth through fractional real estate.
        </p>
      </Reveal>

      {/* Marquee Row 1 - left to right */}
      <div className="relative mb-6">
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-nulo-ivory to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-nulo-ivory to-transparent z-10 pointer-events-none" />
        <div className="flex gap-6 animate-marquee-left will-change-transform">
          {[...testimonials, ...testimonials].map((t, i) => (
            <TestimonialCard key={`row1-${i}`} t={t} />
          ))}
        </div>
      </div>

      {/* Marquee Row 2 - right to left */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-nulo-ivory to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-nulo-ivory to-transparent z-10 pointer-events-none" />
        <div className="flex gap-6 animate-marquee-right will-change-transform">
          {[...testimonials.slice().reverse(), ...testimonials.slice().reverse()].map((t, i) => (
            <TestimonialCard key={`row2-${i}`} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
