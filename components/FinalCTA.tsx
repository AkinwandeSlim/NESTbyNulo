import Reveal from "@/components/reveal";

export default function FinalCTA() {
  return (
    <section className="bg-nulo-soft-orange py-16 md:py-24 px-4 md:px-8 border-t border-nulo-border noise-texture">
      <Reveal className="max-w-4xl mx-auto text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-nulo-text mb-4">
          Ready to own your first piece of Nigeria?
        </h2>
        <p className="text-nulo-text-muted mb-8 max-w-xl mx-auto">
          Join thousands building wealth through property — without the ₦90M price tag.
        </p>
        <a
          href="#waitlist"
          className="inline-block bg-gradient-to-br from-nulo-primary via-nulo-primary-mid to-nulo-primary-dark text-white rounded-full px-8 py-4 font-semibold text-lg shadow-lg hover:shadow-2xl hover:shadow-nulo-primary/30 hover:-translate-y-1 transition-all duration-500 animate-gradient"
          style={{ backgroundSize: "200% 200%" }}
        >
          Claim Your Waitlist Spot
        </a>
      </Reveal>
    </section>
  );
}
