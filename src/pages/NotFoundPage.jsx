import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="glass-strong rounded-3xl p-6 text-center sm:p-8">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-300">404</p>
      <h1 className="mt-2 font-heading text-4xl text-white sm:text-5xl">Page Not Found</h1>
      <p className="mx-auto mt-3 max-w-lg text-sm text-slate-300">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-coral to-ember px-6 py-3 text-sm font-semibold text-white shadow-glow"
      >
        Back to Home
      </Link>
    </section>
  );
}

export default NotFoundPage;
