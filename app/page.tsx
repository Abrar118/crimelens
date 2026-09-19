import Link from "next/link";
import {
  Shield,
  Camera,
  ThumbsUp,
  Sparkles,
  Map,
  EyeOff,
  Siren,
  ArrowRight,
  MapPin,
  BadgeCheck,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const features = [
  {
    icon: Camera,
    title: "Report with evidence",
    description:
      "Attach photos and video of the scene when you file a report, with the exact location.",
  },
  {
    icon: ThumbsUp,
    title: "Community verification",
    description:
      "Verified residents upvote, downvote, and comment with proof, so genuine incidents rise to the top.",
  },
  {
    icon: Sparkles,
    title: "AI scene descriptions",
    description:
      "Uploaded images are described automatically by Gemini, keeping reports searchable and consistent.",
  },
  {
    icon: Map,
    title: "Crime heatmaps",
    description:
      "See where incidents cluster across divisions and districts, and follow trends over time.",
  },
  {
    icon: EyeOff,
    title: "Anonymous reporting",
    description:
      "Share what you witnessed without exposing your identity to other users.",
  },
  {
    icon: Siren,
    title: "Emergency escalation",
    description:
      "High-severity, verified reports route to the admin team for urgent follow-up.",
  },
];

const trustItems = [
  {
    icon: EyeOff,
    title: "Anonymous by default",
    description: "Your identity is never shown to other users.",
  },
  {
    icon: BadgeCheck,
    title: "OTP-verified accounts",
    description: "Every account is verified with a phone code.",
  },
  {
    icon: Camera,
    title: "Evidence-backed",
    description: "Photos, video, and AI scene descriptions attach to each report.",
  },
];

const steps = [
  {
    number: "01",
    title: "Report",
    description:
      "File an incident with its location, what happened, and any photos or video you have.",
  },
  {
    number: "02",
    title: "Verify",
    description:
      "Verified neighbors confirm, challenge, and add proof to the report until the score is trustworthy.",
  },
  {
    number: "03",
    title: "Track",
    description:
      "Follow your reports and watch the district heatmap change as more evidence comes in.",
  },
];

const feedRows = [
  {
    type: "Theft",
    badge: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    title: "Two-wheeler stolen outside a parking lot",
    location: "Mirpur 10, Dhaka",
    time: "2h ago",
    score: "24",
    proofs: 5,
  },
  {
    type: "Assault",
    badge: "border-red-500/20 bg-red-500/10 text-red-300",
    title: "Group confrontation near the bus terminal",
    location: "Uttara, Dhaka",
    time: "5h ago",
    score: "11",
    proofs: 2,
  },
  {
    type: "Traffic",
    badge: "border-sky-500/20 bg-sky-500/10 text-sky-300",
    title: "Car collision behind a stalled truck",
    location: "Dhanmondi, Dhaka",
    time: "8h ago",
    score: "9",
    proofs: 3,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-[#0a0f1e] flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0f1e]/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="text-blue-400" size={22} aria-hidden />
            <span className="text-lg font-bold text-white tracking-tight">CrimeLens</span>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            <a
              href="#features"
              className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors duration-200 motion-reduce:transition-none"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors duration-200 motion-reduce:transition-none"
            >
              How it works
            </a>
            <Link
              href="/login"
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200 motion-reduce:transition-none"
            >
              Sign in
            </Link>
            <ThemeToggle />
            <Link
              href="/signup"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors duration-200 motion-reduce:transition-none"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl"
            aria-hidden
          />
          <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-16 md:pt-24 md:pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300">
                  <Shield size={12} className="text-blue-400" aria-hidden />
                  Community-verified crime intelligence
                </span>
                <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
                  Report crimes.{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent">
                    Verify them together.
                  </span>
                </h1>
                <p className="mt-5 text-lg text-gray-400 leading-relaxed max-w-xl">
                  CrimeLens is a community platform for reporting crimes with evidence.
                  Upvotes, downvotes, and proof-backed comments keep the feed honest, so
                  residents know what is really happening around them.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors duration-200 motion-reduce:transition-none"
                  >
                    Create an account
                    <ArrowRight size={18} aria-hidden />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center px-5 py-3 rounded-lg border border-white/15 text-gray-200 font-medium hover:bg-white/5 hover:border-white/25 transition-colors duration-200 motion-reduce:transition-none"
                  >
                    Sign in
                  </Link>
                </div>
                <p className="mt-6 text-sm text-gray-500">
                  Reports can stay anonymous. Accounts are verified with phone OTP.
                </p>
              </div>

              {/* Feed preview */}
              <div className="relative">
                <div
                  className="pointer-events-none absolute -inset-6 rounded-2xl bg-blue-500/10 blur-2xl"
                  aria-hidden
                />
                <div className="relative rounded-xl border border-white/10 bg-[#0f1629]">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <span className="text-sm font-medium text-white">Recent reports</span>
                    <span className="text-[11px] uppercase tracking-widest text-gray-500">
                      Dhaka
                    </span>
                  </div>
                  <ul>
                    {feedRows.map((row, index) => (
                      <li
                        key={row.title}
                        className={`px-5 py-4 ${
                          index < feedRows.length - 1 ? "border-b border-white/5" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <span
                              className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium ${row.badge}`}
                            >
                              {row.type}
                            </span>
                            <p className="mt-2 text-sm font-medium text-white truncate">
                              {row.title}
                            </p>
                            <p className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
                              <MapPin size={12} aria-hidden />
                              {row.location} · {row.time}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="flex items-center justify-end gap-1 text-sm text-blue-400">
                              <ThumbsUp size={14} aria-hidden />
                              {row.score}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">{row.proofs} proofs</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="mt-3 text-center text-xs text-gray-600">
                  A sample of the report feed.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-y border-white/5 bg-[#0c1120]">
          <div className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {trustItems.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 ring-1 ring-blue-400/20">
                  <Icon className="text-blue-400" size={16} aria-hidden />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{title}</h3>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 md:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
            Why CrimeLens
          </p>
          <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight text-white">
            Built to be trusted
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-white/10 bg-[#0f1629] p-5 transition-colors duration-200 hover:border-blue-400/30 hover:bg-[#111a33] motion-reduce:transition-none"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 ring-1 ring-blue-400/20">
                  <Icon className="text-blue-400" size={18} aria-hidden />
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-t border-white/5 bg-[#0c1120]">
          <div className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 md:py-28">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              The workflow
            </p>
            <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight text-white">
              How it works
            </h2>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className="relative rounded-xl border border-white/10 bg-[#0f1629] p-6"
                >
                  {index < steps.length - 1 && (
                    <span
                      className="absolute top-1/2 -right-6 hidden h-px w-6 bg-gradient-to-r from-white/20 to-transparent md:block"
                      aria-hidden
                    />
                  )}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/10 text-sm font-semibold text-blue-300 tabular-nums">
                    {step.number}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f1629] px-6 py-16 text-center md:py-20">
            <div
              className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl"
              aria-hidden
            />
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Keep your area safer
              </h2>
              <p className="mt-4 text-gray-400 max-w-xl mx-auto">
                Join your neighborhood on CrimeLens. Sign up takes a minute — an email,
                then a phone verification code.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors duration-200 motion-reduce:transition-none"
                >
                  Get started
                  <ArrowRight size={18} aria-hidden />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center px-5 py-3 rounded-lg border border-white/15 text-gray-200 font-medium hover:bg-white/5 hover:border-white/25 transition-colors duration-200 motion-reduce:transition-none"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="text-blue-400" size={20} aria-hidden />
            <span className="text-sm font-semibold text-white">CrimeLens</span>
            <span className="text-sm text-gray-500">— crime reporting and community verification</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200 motion-reduce:transition-none"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200 motion-reduce:transition-none"
            >
              Create account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
