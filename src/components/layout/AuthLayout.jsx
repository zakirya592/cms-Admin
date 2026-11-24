import { motion } from "framer-motion";

export function AuthLayout({ children }) {
  return (
    <div className="relative grid min-h-screen lg:grid-cols-[1.1fr_0.9fr] overflow-hidden">
      {/* Left side: Atmospheric Dark Glass Hero */}
      <section className="relative hidden overflow-hidden bg-[#13151a] text-stone-100 lg:flex lg:flex-col lg:justify-between p-12">
        {/* Ambient Dark Mesh Lighting */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-amber-500/15 blur-[90px]" />
          <div className="absolute top-[40%] right-[-10%] h-[420px] w-[420px] rounded-full bg-orange-600/12 blur-[100px]" />
          <div className="absolute -bottom-24 left-[15%] h-80 w-80 rounded-full bg-amber-400/15 blur-[80px]" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(115deg, transparent 0 42%, rgb(245 196 81 / 20%) 42% 43%, transparent 43%), radial-gradient(circle at 20% 80%, rgb(245 196 81 / 18%), transparent 36%)",
            }}
          />
        </div>

        {/* Top Kicker */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-[11px] font-medium tracking-[0.25em] text-amber-200 backdrop-blur-md">
            NORTHLINE CONSTRUCTION
          </div>
        </div>

        {/* Content & Glass Stat Cards */}
        <div className="relative z-10 max-w-lg">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-serif text-5xl xl:text-6xl leading-[0.98] tracking-tight"
          >
            Every site, <br />
            <span className="italic text-amber-200/90">one desk.</span>
          </motion.h1>
          <p className="mt-5 text-sm xl:text-base leading-relaxed text-stone-300/90">
            Jobs, crews, iron, and invoices for the Puget Sound office. Built for the people who already know which pour is late.
          </p>

          {/* Dark Frosted Glass Stat Grid */}
          <div className="mt-10 grid grid-cols-3 gap-3.5">
            <div className="glass-dark rounded-2xl p-4 transition-transform hover:-translate-y-0.5">
              <p className="font-serif text-3xl text-amber-300">6</p>
              <p className="mt-1 text-xs text-stone-400 leading-tight">Jobs on the books</p>
            </div>
            <div className="glass-dark rounded-2xl p-4 transition-transform hover:-translate-y-0.5">
              <p className="font-serif text-3xl text-amber-300">10</p>
              <p className="mt-1 text-xs text-stone-400 leading-tight">Named leads</p>
            </div>
            <div className="glass-dark rounded-2xl p-4 transition-transform hover:-translate-y-0.5">
              <p className="font-serif text-3xl text-amber-300">1</p>
              <p className="mt-1 text-xs text-stone-400 leading-tight">Invoice past due</p>
            </div>
          </div>
        </div>
      </section>

      {/* Right side: Luminous Light Glass Form Pane */}
      <section className="relative flex items-center justify-center px-6 py-16">
        {/* Floating Ambient Glows */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="animate-ambient-float-1 absolute -top-16 -right-16 h-80 w-80 rounded-full bg-amber-300/25 blur-[90px]" />
          <div className="animate-ambient-float-2 absolute bottom-[-10%] -left-12 h-96 w-96 rounded-full bg-orange-300/20 blur-[100px]" />
          <div className="absolute top-[45%] right-[20%] h-64 w-64 rounded-full bg-sky-200/20 blur-[80px]" />
        </div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-stone-900 to-stone-800 text-xs font-semibold text-amber-200 border border-amber-300/30">
              CMS
            </span>
            <p className="text-[11px] font-medium tracking-[0.22em] text-amber-900 uppercase">NORTHLINE</p>
          </div>
          {children}
        </motion.div>
      </section>
    </div>
  );
}
