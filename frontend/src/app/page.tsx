import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 text-center">
      <h1 className="text-5xl font-extrabold text-indigo-600 mb-4 tracking-tight">
        TalentPerformer
      </h1>
      <p className="text-lg text-gray-500 max-w-xl mb-10">
        Empower your team with data-driven performance management, real-time
        insights, and seamless collaboration — all in one place.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/register"
          className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white bg-indigo-600 rounded-lg shadow hover:bg-indigo-700 transition-colors"
        >
          Get Started
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-indigo-600 bg-white border border-indigo-600 rounded-lg shadow hover:bg-indigo-50 transition-colors"
        >
          Dashboard
        </Link>
      </div>
    </section>
  );
}
