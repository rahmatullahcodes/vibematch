const values = [
  {
    title: "Authenticity",
    text: "We prioritize genuine profiles and meaningful intent over vanity metrics.",
  },
  {
    title: "Safety First",
    text: "Trust systems, moderation, and respectful interactions are core to our platform.",
  },
  {
    title: "Design Quality",
    text: "Every flow is crafted to feel clear, premium, and emotionally comfortable.",
  },
];

const milestones = [
  { year: "2024", detail: "Spark concept and first UX prototypes launched." },
  { year: "2025", detail: "Private beta with early adopters across metro cities." },
  { year: "2026", detail: "Full social + dating ecosystem with events and chat intelligence." },
];

function AboutPage() {
  return (
    <div className="space-y-6">
      <section className="glass-strong rounded-3xl p-5 sm:p-6 md:p-8">
        <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-slate-200">
          About Spark Social
        </p>
        <h1 className="mt-4 font-heading text-3xl leading-tight text-white sm:text-4xl md:text-5xl">
          We are building a healthier future for digital dating.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base">
          Spark Social was created to bridge dating and social discovery in one coherent experience. Instead of
          overwhelming users with shallow interactions, we focus on trust, compatibility, and quality conversation.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {values.map((value) => (
          <article key={value.title} className="glass rounded-2xl p-5">
            <h2 className="font-heading text-xl text-white">{value.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{value.text}</p>
          </article>
        ))}
      </section>

      <section className="glass rounded-3xl p-5 sm:p-6">
        <h3 className="font-heading text-2xl text-white">Our Journey</h3>
        <div className="mt-4 space-y-3">
          {milestones.map((item) => (
            <div key={item.year} className="surface-soft rounded-2xl px-4 py-3">
              <p className="text-sm font-semibold text-coral">{item.year}</p>
              <p className="mt-1 text-sm text-slate-300">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
