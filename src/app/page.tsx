import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Code2,
  Globe2,
  Layers,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { listActiveCourses } from "@/services/course-service";
import PublicInquiryForm from "@/components/PublicInquiryForm";

const trustPoints = [
  {
    icon: Globe2,
    title: "International contact support",
    description:
      "Select any country and enter the phone number using its standard international format.",
  },
  {
    icon: CheckCircle2,
    title: "Field-level validation",
    description:
      "The form displays clear errors when information is missing or invalid.",
  },
  {
    icon: ShieldCheck,
    title: "Secure server validation",
    description:
      "Submitted information is validated again on the server before it is accepted.",
  },
];

const courseVisuals = [
  { icon: Code2, tone: "bg-blue-50 text-blue-600" },
  { icon: ShieldCheck, tone: "bg-violet-50 text-violet-600" },
  { icon: TrendingUp, tone: "bg-green-50 text-green-600" },
  { icon: Layers, tone: "bg-amber-50 text-amber-600" },
];

export default async function HomePage() {
  const featuredCourses = await listActiveCourses();

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-900 text-sm font-bold text-white"
            >
              TI
            </span>
            <span className="text-lg font-bold text-primary-900 sm:text-xl">
              Training Institute
            </span>
          </Link>

          <Link href="/dashboard" className={buttonVariants()}>
            Open dashboard
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-primary-900 px-4 py-20 text-white sm:px-6 sm:py-28 lg:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.09)_1px,transparent_0)] bg-[length:32px_32px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_0%,black,transparent)]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 size-[32rem] rounded-full bg-accent-500/20 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 bottom-0 size-[28rem] rounded-full bg-primary-500/25 blur-3xl"
        />

        <div className="relative mx-auto grid w-full max-w-7xl gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent-400">
              <Sparkles aria-hidden="true" className="size-3.5" />
              Practical technology training
            </p>

            <h1 className="mt-6 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Build real skills for your{" "}
              <span className="text-accent-500">technology career</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              Explore industry-focused courses and submit an inquiry to
              receive complete information from our team.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#course-inquiry"
                className={buttonVariants({
                  variant: "accent",
                  size: "lg",
                  className: "focus-visible:ring-offset-primary-900",
                })}
              >
                Send an inquiry
              </a>

              <a
                href="#courses"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg border border-white/20 px-5 text-base font-medium text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-900"
              >
                View programs
              </a>
            </div>
          </div>

          <div className="relative rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-sm sm:p-8">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-3xl font-bold">
                  {featuredCourses.length}
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Active programs
                </p>
              </div>

              <div>
                <p className="text-3xl font-bold">1:1</p>
                <p className="mt-1 text-sm text-slate-300">
                  Counselor guidance
                </p>
              </div>
            </div>

            <ul className="mt-6 grid gap-3 border-t border-white/10 pt-6 text-sm text-slate-200">
              <li className="flex items-center gap-2.5">
                <CheckCircle2
                  aria-hidden="true"
                  className="size-4 shrink-0 text-accent-400"
                />
                Instructor-led, hands-on curriculum
              </li>

              <li className="flex items-center gap-2.5">
                <CheckCircle2
                  aria-hidden="true"
                  className="size-4 shrink-0 text-accent-400"
                />
                Personal follow-up from our team
              </li>

              <li className="flex items-center gap-2.5">
                <CheckCircle2
                  aria-hidden="true"
                  className="size-4 shrink-0 text-accent-400"
                />
                Flexible batch schedules
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section id="courses" className="scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-700">
            Programs
          </p>

          <h2 className="mt-2 text-2xl font-bold text-primary-900 sm:text-3xl">
            Popular courses
          </h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredCourses.map((course, index) => {
              const visual = courseVisuals[index % courseVisuals.length];

              return (
                <a
                  key={course.id}
                  href="#course-inquiry"
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-[var(--shadow-panel)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl",
                      visual.tone,
                    )}
                  >
                    <visual.icon className="size-5" />
                  </span>

                  <h3 className="mt-4 text-base font-semibold text-primary-900">
                    {course.title}
                  </h3>

                  <p className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    <Clock aria-hidden="true" className="size-3.5" />
                    {course.duration}
                  </p>

                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-800 opacity-0 transition group-hover:opacity-100">
                    Inquire about this course
                    <ArrowRight aria-hidden="true" className="size-3.5" />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="course-inquiry"
        className="scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="relative overflow-hidden rounded-2xl bg-primary-900 p-6 text-white sm:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-accent-500/20 blur-3xl"
            />

            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-wider text-accent-500">
                Get course details
              </p>

              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                Speak with our training team
              </h2>

              <p className="mt-4 leading-7 text-slate-300">
                Tell us which course you are interested in and what you
                would like to learn. Our team will review your inquiry and
                contact you.
              </p>

              <div className="mt-8 grid gap-5">
                {trustPoints.map((point) => (
                  <div key={point.title} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-500/15 text-accent-400 ring-1 ring-accent-500/20"
                    >
                      <point.icon className="size-4" />
                    </span>

                    <div>
                      <p className="font-semibold">{point.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        {point.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <PublicInquiryForm courses={featuredCourses} />
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left lg:px-8">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary-900 text-xs font-bold text-white"
            >
              TI
            </span>
            <span className="text-sm font-semibold text-primary-900">
              Training Institute
            </span>
          </div>

          <p className="text-sm text-slate-500">
            Training Institute CRM — Nepal region
          </p>
        </div>
      </footer>
    </main>
  );
}
