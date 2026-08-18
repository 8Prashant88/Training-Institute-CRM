import Link from "next/link";
import { CheckCircle2, Globe2, ShieldCheck } from "lucide-react";

import { buttonVariants } from "@/components/ui/Button";
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

export default async function HomePage() {
  const featuredCourses =
    await listActiveCourses();

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
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

      <section className="bg-primary-900 px-4 py-14 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-500">
            Practical technology training
          </p>

          <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">
            Build real skills for your technology career
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Explore industry-focused courses and submit an inquiry to
            receive complete information from our team.
          </p>

          <a
            href="#course-inquiry"
            className={buttonVariants({
              variant: "accent",
              size: "lg",
              className: "mt-8",
            })}
          >
            Send an inquiry
          </a>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-700">
            Programs
          </p>
          <h2 className="mt-2 text-2xl font-bold text-primary-900 sm:text-3xl">
            Popular courses
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredCourses.map((course) => (
              <div
  key={course.id}
  className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)]"
>
  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
    Training program
  </p>

  <h3 className="mt-1 text-base font-semibold text-primary-900">
    {course.title}
  </h3>

  <p className="mt-2 text-sm text-slate-600">
    {course.duration}
  </p>
</div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="course-inquiry"
        className="scroll-mt-6 px-4 py-10 sm:px-6 sm:py-14 lg:px-8"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="rounded-2xl bg-primary-900 p-6 text-white sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-accent-500">
              Get course details
            </p>

            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              Speak with our training team
            </h2>

            <p className="mt-4 leading-7 text-slate-300">
              Tell us which course you are interested in and what you would
              like to learn. Our team will review your inquiry and contact
              you.
            </p>

            <div className="mt-8 grid gap-5">
              {trustPoints.map((point) => (
                <div key={point.title} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-accent-500"
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

         <PublicInquiryForm
  courses={featuredCourses}
/>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
          Training Institute CRM
        </div>
      </footer>
    </main>
  );
}
