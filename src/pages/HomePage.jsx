import { Link } from "react-router-dom";

const trustSignals = [
  "Verified-first community",
  "Behavior-based match ranking",
  "Advanced anti-spam moderation",
  "Privacy-first profile controls",
];

const toplineStats = [
  { value: "12k+", label: "Monthly active daters" },
  { value: "4.8/5", label: "Average user rating" },
  { value: "67%", label: "Meaningful chat conversion" },
  { value: "24h", label: "Average first meetup plan time" },
];

const featureArchitecture = [
  {
    title: "Identity Layer",
    description:
      "Rich profile, intent labels, and story-based personality cues help people evaluate fit before liking.",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Match Layer",
    description:
      "Recommendation engine balances compatibility, location quality, and communication behavior to reduce random swipes.",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Conversation Layer",
    description:
      "Structured prompts and contextual chat suggestions move users from match to actual plans faster.",
    image:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=80",
  },
];

const safetyBlocks = [
  {
    title: "Trust Signals",
    points: ["Profile verification markers", "Community reputation scoring", "Behavior consistency checks"],
  },
  {
    title: "Protection Controls",
    points: ["Instant report and block actions", "Conversation-level moderation", "Sensitive content detection"],
  },
];

const testimonials = [
  {
    name: "Rhea Malhotra",
    role: "Product Manager / Delhi",
    quote:
      "Spark looks premium, but the biggest win is clarity. Matches feel relevant and conversations start with context.",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=220&q=80",
  },
  {
    name: "Ishaan Arora",
    role: "Startup Founder / Bangalore",
    quote:
      "I stopped wasting time on low-quality apps. Spark's interface and recommendation logic feel genuinely modern.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=220&q=80",
  },
  {
    name: "Kiara Sen",
    role: "Marketing Lead / Mumbai",
    quote:
      "The social layer is brilliant. You understand someone better through stories before even sending your first line.",
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=220&q=80",
  },
];

function HomePage() {
  return (
    <div className="space-y-6">
      <section className="glass-strong animate-rise overflow-hidden rounded-3xl p-5 sm:p-6 md:p-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(360px,48%)] xl:items-center">
          <div>
            <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-slate-200">
              Designed for intentional dating in modern cities
            </p>

            <h1 className="mt-4 max-w-3xl font-heading text-3xl leading-tight text-white sm:text-4xl md:text-5xl xl:text-6xl">
              Date with intent. Connect with confidence.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
              Spark Social merges professional-grade UX, compatibility intelligence, and social context into one elegant
              ecosystem for meaningful relationships.
            </p>

            <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
              <Link
                to="/app"
                className="w-full rounded-2xl bg-gradient-to-r from-coral to-ember px-6 py-3 text-center text-sm font-semibold text-white shadow-glow sm:w-auto"
              >
                Launch App
              </Link>
              <Link
                to="/admin/login"
                className="w-full rounded-2xl border border-aqua/45 bg-aqua/15 px-6 py-3 text-center text-sm font-semibold text-aqua transition hover:bg-aqua/25 sm:w-auto"
              >
                Admin Login
              </Link>
              <Link
                to="/app?tab=auth"
                className="w-full rounded-2xl border border-aqua/45 bg-aqua/15 px-6 py-3 text-center text-sm font-semibold text-aqua transition hover:bg-aqua/25 sm:w-auto"
              >
                Login / Sign Up
              </Link>
              <Link
                to="/features"
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/15 sm:w-auto"
              >
                Explore Platform
              </Link>
              <Link
                to="/contact"
                className="w-full rounded-2xl border border-white/20 bg-transparent px-6 py-3 text-center text-sm font-semibold text-slate-100 transition hover:bg-white/10 sm:w-auto"
              >
                Talk to Team
              </Link>
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {trustSignals.map((item) => (
                <div key={item} className="surface-soft flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-200">
                  <span className="h-2 w-2 rounded-full bg-aqua" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="glass relative min-h-[340px] overflow-hidden rounded-3xl border-white/15 sm:min-h-[420px] lg:min-h-[520px]">
            <img
              src="https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1400&q=80"
              alt="Professional dating experience visual"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/45 to-slate-950/10" />

            <div className="absolute left-3 top-3 rounded-xl border border-white/20 bg-slate-950/55 px-3 py-2 backdrop-blur sm:left-4 sm:top-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-300">Live Match Intelligence</p>
              <p className="mt-1 font-heading text-lg text-white sm:text-2xl">92% Compatibility</p>
            </div>

            <div className="absolute right-3 top-3 hidden rounded-xl border border-white/20 bg-slate-950/55 px-3 py-2 text-right backdrop-blur sm:right-4 sm:top-4 sm:block">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-300">City Momentum</p>
              <p className="mt-1 font-heading text-base text-aqua sm:text-xl">+38% Active Tonight</p>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5">
              <div className="rounded-2xl border border-white/20 bg-slate-950/55 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Tonight Highlight</p>
                <p className="mt-1 text-sm font-semibold text-white">Rooftop Mixer / 8:30 PM</p>
                <p className="mt-1 text-xs text-slate-300">
                  Curated social event for high-intent conversations and quality introductions.
                </p>

                <div className="mt-3 grid grid-cols-1 gap-3 text-center sm:grid-cols-2">
                  <div className="surface-soft rounded-xl p-2">
                    <p className="font-heading text-xl text-aqua">1.2k</p>
                    <p className="text-[11px] text-slate-300">Profiles online</p>
                  </div>
                  <div className="surface-soft rounded-xl p-2">
                    <p className="font-heading text-xl text-coral">184</p>
                    <p className="text-[11px] text-slate-300">Fresh daily matches</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {toplineStats.map((item, index) => (
          <article
            key={item.label}
            className="glass animate-rise rounded-2xl p-4"
            style={{ animationDelay: `${80 + index * 45}ms` }}
          >
            <p className="font-heading text-3xl text-coral">{item.value}</p>
            <p className="mt-1 text-xs text-slate-300">{item.label}</p>
          </article>
        ))}
      </section>

      <section className="glass rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Platform Architecture</p>
            <h2 className="mt-2 font-heading text-2xl text-white sm:text-3xl">Built as a full-stack relationship ecosystem</h2>
          </div>
          <Link to="/about" className="text-sm font-semibold text-coral transition hover:text-amber-300">
            Why this approach works
          </Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {featureArchitecture.map((item) => (
            <article key={item.title} className="surface-soft rounded-2xl p-4">
              <div className="mb-3 overflow-hidden rounded-xl border border-white/10">
                <img src={item.image} alt={item.title} className="h-28 w-full object-cover" />
              </div>
              <h3 className="font-heading text-xl text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <article className="glass rounded-3xl p-5 sm:p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Safety and Trust</p>
          <h3 className="mt-2 font-heading text-3xl text-white">Healthy interactions are product-level priorities</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Spark is engineered to reward authenticity and reduce bad actor exposure through layered trust and
            moderation systems.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {safetyBlocks.map((block) => (
              <article key={block.title} className="surface-soft rounded-2xl p-4">
                <h4 className="font-heading text-lg text-white">{block.title}</h4>
                <ul className="mt-3 space-y-2">
                  {block.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-aqua" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </article>

        <article className="glass rounded-3xl p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Performance Snapshot</p>
          <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
            <img
              src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1000&q=80"
              alt="Safety and moderation workspace"
              className="h-28 w-full object-cover"
            />
          </div>
          <div className="mt-4 space-y-3">
            <div className="surface-soft rounded-xl p-3">
              <p className="text-xs text-slate-300">Average report response</p>
              <p className="mt-1 text-sm font-semibold text-white">Under 15 minutes</p>
            </div>
            <div className="surface-soft rounded-xl p-3">
              <p className="text-xs text-slate-300">Fake profile suppression</p>
              <p className="mt-1 text-sm font-semibold text-white">99.1% detection coverage</p>
            </div>
            <div className="surface-soft rounded-xl p-3">
              <p className="text-xs text-slate-300">Conversation quality index</p>
              <p className="mt-1 text-sm font-semibold text-aqua">Excellent / 4.8 score</p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {testimonials.map((item, index) => (
          <article
            key={item.name}
            className="glass animate-rise rounded-3xl p-5"
            style={{ animationDelay: `${130 + index * 60}ms` }}
          >
            <p className="text-sm leading-relaxed text-slate-200">"{item.quote}"</p>
            <div className="mt-4 flex items-center gap-3">
              <img src={item.avatar} alt={item.name} className="h-10 w-10 rounded-full object-cover" />
              <div>
                <p className="text-sm font-semibold text-white">{item.name}</p>
                <p className="text-xs text-slate-300">{item.role}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="glass-strong rounded-3xl bg-gradient-to-r from-coral/25 via-transparent to-aqua/20 p-5 text-center sm:p-6 md:p-7">
        <h3 className="font-heading text-3xl text-white md:text-4xl">
          Ready to move from random swipes to meaningful relationships?
        </h3>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
          Join Spark Social and experience a modern dating product designed for clarity, safety, and high-quality
          connection outcomes.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/app"
            className="rounded-2xl bg-gradient-to-r from-coral to-ember px-6 py-3 text-sm font-semibold text-white shadow-glow"
          >
            Start Free
          </Link>
          <Link
            to="/pricing"
            className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            Compare Plans
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
