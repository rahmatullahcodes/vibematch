const featureBlocks = [
  {
    title: "Compatibility Engine",
    points: [
      "Interest and communication-style matching",
      "Location-aware recommendations",
      "Behavior-based preference learning",
    ],
  },
  {
    title: "Social Layer",
    points: [
      "Stories for personality expression",
      "Feed for authentic updates",
      "Community prompts and micro-events",
    ],
  },
  {
    title: "Messaging Layer",
    points: [
      "Intent-first chat experience",
      "Quick date planning suggestions",
      "Spam filters and conversation quality checks",
    ],
  },
  {
    title: "Safety Layer",
    points: [
      "Profile verification signals",
      "Respect and abuse reporting controls",
      "Moderation system for healthy interactions",
    ],
  },
];

function FeaturesPage() {
  return (
    <div className="space-y-6">
      <section className="glass-strong rounded-3xl p-5 sm:p-6 md:p-8">
        <h1 className="font-heading text-3xl leading-tight text-white sm:text-4xl md:text-5xl">Platform Features</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base">
          Spark is designed as a complete relationship discovery platform, not just a swipe app.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {featureBlocks.map((block) => (
          <article key={block.title} className="glass rounded-2xl p-5">
            <h2 className="font-heading text-2xl text-white">{block.title}</h2>
            <ul className="mt-3 space-y-2">
              {block.points.map((point) => (
                <li key={point} className="surface-soft rounded-xl px-3 py-2 text-sm text-slate-300">
                  {point}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </div>
  );
}

export default FeaturesPage;
