import Reveal from "@/components/reveal";

const pillars = [
  {
    icon: "🔒",
    title: "Escrow-Protected Funds",
    desc: "Your investment is held in regulated escrow — not a founder's account",
  },
  {
    icon: "✅",
    title: "Verified Properties",
    desc: "Every property is inspected, titled, and legally cleared before listing",
  },
  {
    icon: "📊",
    title: "Transparent Reporting",
    desc: "Annual income statements, occupancy data, and property updates",
  },
  {
    icon: "🤖",
    title: "AI Tenant Screening",
    desc: "Nulo's AI evaluates tenant reliability before any lease is signed",
  },
];

export default function TrustLayer() {
  return (
    <section className="bg-nulo-soft-orange py-16 md:py-24 px-4 md:px-8 noise-texture">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-12">
          <span className="text-nulo-primary font-semibold tracking-widest text-xs uppercase">
            Why Trust NEST
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-nulo-text mt-2">
            Built for a market where trust is everything.
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6">
          {pillars.map((p, i) => (
            <Reveal
              key={p.title}
              delay={((i + 1) as 1 | 2 | 3 | 4 | 5 | 6)}
              className="bg-white rounded-2xl p-6 border border-nulo-border shadow-sm flex items-start gap-4 hover:shadow-lg hover:border-nulo-primary/30 transition-all duration-500"
            >
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                {p.icon}
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-nulo-text mb-1">{p.title}</h3>
                <p className="text-nulo-text-muted text-sm">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
