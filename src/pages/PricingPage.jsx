const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Best for trying the core Spark experience.",
    features: ["Basic swipes", "Limited messages", "Community stories"],
  },
  {
    name: "Plus",
    price: "$9/mo",
    description: "For active users who want better control and visibility.",
    features: ["Unlimited likes", "Priority matching", "Advanced filters"],
    featured: true,
  },
  {
    name: "Premium",
    price: "$19/mo",
    description: "For power users looking for maximum reach and insights.",
    features: ["Read receipts", "Profile boost slots", "Premium event access"],
  },
];

function PricingPage() {
  return (
    <div className="space-y-6">
      <section className="glass-strong rounded-3xl p-5 sm:p-6 md:p-8">
        <h1 className="font-heading text-3xl text-white sm:text-4xl md:text-5xl">Transparent Pricing</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
          Start free and upgrade only when you need deeper discovery and faster connections.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`rounded-3xl p-5 ${
              plan.featured
                ? "glass-strong border border-coral/40 bg-gradient-to-br from-coral/20 to-amber-400/8"
                : "glass"
            }`}
          >
            <p className="text-sm font-semibold text-coral">{plan.name}</p>
            <h2 className="mt-2 font-heading text-4xl text-white">{plan.price}</h2>
            <p className="mt-2 text-sm text-slate-300">{plan.description}</p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((item) => (
                <li key={item} className="surface-soft rounded-xl px-3 py-2 text-sm text-slate-300">
                  {item}
                </li>
              ))}
            </ul>
            <button className="mt-5 w-full rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900">
              Choose {plan.name}
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}

export default PricingPage;
