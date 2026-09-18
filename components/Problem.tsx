import Reveal from "@/components/Reveal";

const problems = [
  {
    icon: "🏦",
    title: "Renting builds nothing",
    body: "Every year, millions pay rent that grows someone else's wealth — not their own.",
  },
  {
    icon: "💸",
    title: "Buying is out of reach",
    body: "Lagos properties start at ₦50M. Abuja at ₦80M. That's not accessible for most.",
  },
  {
    icon: "🤝",
    title: "Real estate is full of trust gaps",
    body: "Agents, developers, and landlords — finding someone reliable is harder than finding the money.",
  },
];

export default function Problem() {
  return (
    <section className="bg-nulo-soft-orange py-16 md:py-24 px-4 md:px-8 noise-texture">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-12">
          <span className="text-nulo-primary font-semibold tracking-widest text-xs uppercase">
            The Problem
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-nulo-text mt-2">
            Why most Nigerians never own property
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((p, i) => (
            <Reveal
              key={p.title}
              delay={((i + 1) as 1 | 2 | 3 | 4 | 5 | 6)}
              className="bg-white rounded-2xl shadow-sm border border-nulo-border p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-500"
            >
              <div className="w-12 h-12 bg-nulo-soft-orange rounded-xl flex items-center justify-center text-2xl mb-4">
                {p.icon}
              </div>
              <h3 className="font-display text-xl font-bold text-nulo-text mb-2">{p.title}</h3>
              <p className="text-nulo-text-muted">{p.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
