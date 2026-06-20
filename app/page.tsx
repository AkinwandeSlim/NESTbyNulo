import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import HowItWorks from "@/components/HowItWorks";
import Returns from "@/components/Returns";
import TrustLayer from "@/components/TrustLayer";
import SocialProof from "@/components/SocialProof";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import WaitlistForm from "@/components/WaitlistForm";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <Returns />
      <TrustLayer />
      <SocialProof />
      <FAQ />
      <FinalCTA />

      <section id="waitlist" className="bg-nulo-soft-orange py-16 md:py-24 px-4 md:px-8 noise-texture">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-12">
            <span className="text-nulo-primary font-semibold tracking-widest text-xs uppercase">
              Join The Waitlist
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-nulo-text mt-2 max-w-2xl mx-auto">
              Your first share of Nigerian real estate is one step away.
            </h2>
            <p className="text-nulo-text-muted mt-4 max-w-xl mx-auto">
              Join thousands of Nigerians building wealth through property — without the ₦90M price tag.
            </p>
          </Reveal>
          <Reveal variant="scale">
            <WaitlistForm />
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
