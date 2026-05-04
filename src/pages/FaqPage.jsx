const faqs = [
  {
    question: "How is Spark different from typical dating apps?",
    answer:
      "Spark combines dating and social discovery. You can match, share stories, and build context before starting chats.",
  },
  {
    question: "Is profile verification required?",
    answer:
      "Verification is optional but strongly recommended. Verified profiles receive better trust scores and visibility.",
  },
  {
    question: "Can I use Spark for free?",
    answer:
      "Yes. Spark has a free plan with core functionality. Premium plans unlock unlimited likes and advanced controls.",
  },
  {
    question: "How does moderation work?",
    answer:
      "We use report flows, automated checks, and manual moderation to maintain respectful and safe interactions.",
  },
];

function FaqPage() {
  return (
    <div className="space-y-6">
      <section className="glass-strong rounded-3xl p-5 sm:p-6 md:p-8">
        <h1 className="font-heading text-3xl text-white sm:text-4xl md:text-5xl">Frequently Asked Questions</h1>
        <p className="mt-3 text-sm text-slate-300 md:text-base">Everything you need to know before joining Spark.</p>
      </section>

      <section className="space-y-3">
        {faqs.map((item) => (
          <article key={item.question} className="glass rounded-2xl p-5">
            <h2 className="font-heading text-xl text-white">{item.question}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.answer}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export default FaqPage;
