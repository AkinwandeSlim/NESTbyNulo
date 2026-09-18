export default function Footer() {
  return (
    <footer className="bg-nulo-text text-white py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 items-center">
        <div>
          <h3 className="font-display font-bold text-xl text-white">
            NEST <span className="text-sm font-body text-white/60">by Nulo Africa</span>
          </h3>
          <p className="text-white/60 text-sm mt-1">Building trust in the rental economy.</p>
        </div>

        <div className="flex justify-center gap-6 text-sm text-white/80">
          <a href="#" className="hover:text-white">Privacy Policy</a>
          <a href="#" className="hover:text-white">Terms</a>
          <a href="#" className="hover:text-white">Contact</a>
        </div>

        <div className="text-center md:text-right text-white/40 text-sm">
          © 2025 Nulo Africa. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
