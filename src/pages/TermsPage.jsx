const terms = [
  {
    title: "Eligibility",
    body: "You must be legally eligible to use dating services in your jurisdiction and provide accurate profile details.",
  },
  {
    title: "Acceptable Behavior",
    body: "Harassment, hate speech, impersonation, and abusive behavior are strictly prohibited.",
  },
  {
    title: "Content Responsibility",
    body: "You are responsible for any content shared through your profile, messages, and stories.",
  },
  {
    title: "Account Action",
    body: "We may suspend accounts violating safety policies, legal obligations, or community guidelines.",
  },
];

function TermsPage() {
  return (
    <div className="space-y-6">
      <section className="glass-strong rounded-3xl p-5 sm:p-6 md:p-8">
        <h1 className="font-heading text-3xl text-white sm:text-4xl md:text-5xl">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-300">Effective date: April 30, 2026</p>
      </section>

      <section className="space-y-3">
        {terms.map((item) => (
          <article key={item.title} className="glass rounded-2xl p-5">
            <h2 className="font-heading text-2xl text-white">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export default TermsPage;
