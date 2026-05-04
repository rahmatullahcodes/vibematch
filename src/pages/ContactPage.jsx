import { useState } from "react";

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <section className="glass-strong rounded-3xl p-5 sm:p-6 md:p-8">
        <h1 className="font-heading text-3xl text-white sm:text-4xl md:text-5xl">Contact Us</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
          For partnerships, support, or product feedback, our team responds quickly.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="glass rounded-3xl p-5 sm:p-6">
          {submitted ? (
            <div className="rounded-2xl border border-aqua/30 bg-aqua/15 px-4 py-4 text-sm text-aqua">
              Thank you. We have received your message and will get back within 24 hours.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Full name"
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
              />
              <input
                type="email"
                placeholder="Email address"
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Subject"
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
              />
              <textarea
                rows={5}
                placeholder="Tell us how we can help..."
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
              />
              <button className="w-full rounded-2xl bg-gradient-to-r from-coral to-ember px-5 py-3 text-sm font-semibold text-white shadow-glow">
                Send Message
              </button>
            </form>
          )}
        </article>

        <aside className="space-y-4">
          <article className="glass rounded-2xl p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Email</p>
            <p className="mt-2 text-sm text-white">hello@sparksocial.app</p>
          </article>
          <article className="glass rounded-2xl p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Support Time</p>
            <p className="mt-2 text-sm text-white">Monday to Saturday / 9 AM to 8 PM</p>
          </article>
          <article className="glass rounded-2xl p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Head Office</p>
            <p className="mt-2 text-sm text-white">Bangalore, India</p>
          </article>
        </aside>
      </section>
    </div>
  );
}

export default ContactPage;
