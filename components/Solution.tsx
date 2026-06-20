import Reveal from "@/components/reveal";

const features = [
  {
    icon: "◈",
    title: "Fractional Ownership",
    body: "Own a verified percentage of a real property",
    color: "text-nulo-accent",
  },
  {
    icon: "₦",
    title: "Annual Rental Income",
    body: "Receive your share of rent collected, every year",
    color: "text-nulo-primary",
  },
  {
    icon: "🔒",
    title: "Legal Protection",
    body: "Trust deed, escrow-backed, regulated structure",
    color: "text-nulo-accent",
  },
  {
    icon: "🤖",
    title: "AI-Powered Management",
    body: "Tenant screening, maintenance, transparent reporting",
    color: "text-nulo-primary",
  },
];

export default function Solution() {
  return (
    <section className="bg-white py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-12">
          <span className="text-nulo-primary font-semibold tracking-widest text-xs uppercase">
            The Solution
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-nulo-text mt-2">
            NEST changes the equation.
          </h2>
          <p className="text-nulo-text-muted mt-2">Co-own. Co-earn. Stay in control.</p>
        </Reveal>

        <div className="flex overflow-x-auto gap-4 pb-2 snap-x md:grid md:grid-cols-2 md:pb-0">
          {features.map((f, i) => (
            <Reveal
              key={f.title}
              delay={((i + 1) as 1 | 2 | 3 | 4 | 5 | 6)}
              className="bg-nulo-soft-orange border border-orange-100 rounded-2xl p-5 snap-start min-w-[260px] md:min-w-0 hover:shadow-md hover:border-nulo-primary/30 hover:-translate-y-1 transition-all duration-500"
            >
              <div className={`text-3xl mb-3 ${f.color}`}>{f.icon}</div>
              <h3 className="font-display text-lg font-bold text-nulo-text mb-1">{f.title}</h3>
              <p className="text-nulo-text-muted text-sm">{f.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
