import Reveal from "@/components/Reveal";

const steps = [
  {
    n: 1,
    title: "Join a Property Pool",
    body: "Browse available NEST properties and select one that fits your budget",
  },
  {
    n: 2,
    title: "Co-Invest with Others",
    body: "Contribute your share (min ₦500K) alongside verified co-investors",
  },
  {
    n: 3,
    title: "Nulo Manages Everything",
    body: "We handle tenants, maintenance, legal, and rent collection",
  },
  {
    n: 4,
    title: "Earn & Appreciate",
    body: "Receive rental income annually + benefit as the property value grows",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-nulo-soft-orange py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-12">
          <span className="text-nulo-primary font-semibold tracking-widest text-xs uppercase">
            How It Works
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-nulo-text mt-2">
            Four steps to your first property share
          </h2>
        </Reveal>

        <div className="relative">
          {/* Desktop Line */}
          <div className="hidden md:block absolute top-5 left-0 right-0 h-0.5 bg-nulo-primary-mid mx-12" />

          {/* Desktop Grid / Mobile Timeline */}
          <div className="grid md:grid-cols-4 gap-12 md:gap-4 relative">
            {steps.map((s, i) => (
              <Reveal
                key={s.n}
                delay={((i + 1) as 1 | 2 | 3 | 4 | 5 | 6)}
                className="relative flex flex-col items-center text-center md:pt-16"
              >
                {/* Mobile Line */}
                <div className="md:hidden absolute left-4 top-10 bottom-[-3rem] w-0.5 bg-nulo-primary-mid" />

                <div className="w-10 h-10 rounded-full bg-nulo-primary text-white font-bold flex items-center justify-center relative z-10 mb-4 border-4 border-nulo-soft-orange shadow-lg shadow-nulo-primary/20">
                  {s.n}
                </div>
                <h3 className="font-display text-lg font-bold text-nulo-text mb-2">{s.title}</h3>
                <p className="text-nulo-text-muted text-sm">{s.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
