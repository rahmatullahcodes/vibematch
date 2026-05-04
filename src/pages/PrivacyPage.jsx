const sections = [
  {
    title: "Data We Collect",
    body: "Profile details, preferences, device metadata, and interaction events to improve matching quality.",
  },
  {
    title: "How We Use Data",
    body: "We use your data to personalize recommendations, secure the platform, and provide support.",
  },
  {
    title: "Data Sharing",
    body: "We do not sell personal data. Limited sharing happens only for infrastructure, analytics, and legal compliance.",
  },
  {
    title: "Your Controls",
    body: "You can update profile details, change privacy settings, or request account deletion at any time.",
  },
];

function PrivacyPage() {
  return (
    <div className="space-y-6">
      <section className="glass-strong rounded-3xl p-5 sm:p-6 md:p-8">
        <h1 className="font-heading text-3xl text-white sm:text-4xl md:text-5xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-300">Effective date: April 30, 2026</p>
      </section>

      <section className="space-y-3">
        {sections.map((section) => (
          <article key={section.title} className="glass rounded-2xl p-5">
            <h2 className="font-heading text-2xl text-white">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{section.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export default PrivacyPage;
