import Link from "next/link";

import PublicInquiryForm from "@/components/PublicInquiryForm";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-lg font-bold text-[#001B31] sm:text-xl"
          >
            Training Institute
          </Link>

          <Link
            href="/dashboard"
            className="rounded-lg bg-[#001B31] px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9901C] focus-visible:ring-offset-2"
          >
            Open dashboard
          </Link>
        </div>
      </header>

      <section className="bg-[#001B31] px-4 py-14 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#F9901C]">
            Practical technology training
          </p>

          <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">
            Build real skills for your technology career
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Explore industry-focused courses and submit an
            inquiry to receive complete information from our
            team.
          </p>

          <a
            href="#course-inquiry"
            className="mt-8 inline-flex rounded-lg bg-[#F9901C] px-5 py-3 font-semibold text-[#001B31] transition hover:bg-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#001B31]"
          >
            Send an inquiry
          </a>
        </div>
      </section>

      <section
        id="course-inquiry"
        className="scroll-mt-6 px-4 py-10 sm:px-6 sm:py-14 lg:px-8"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="rounded-2xl bg-[#001B31] p-6 text-white sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#F9901C]">
              Get course details
            </p>

            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              Speak with our training team
            </h2>

            <p className="mt-4 leading-7 text-slate-300">
              Tell us which course you are interested in and
              what you would like to learn. Our team will
              review your inquiry and contact you.
            </p>

            <div className="mt-8 grid gap-5">
              <div>
                <p className="font-semibold">
                  International contact support
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-300">
                  Select any country and enter the phone
                  number using its standard international
                  format.
                </p>
              </div>

              <div>
                <p className="font-semibold">
                  Field-level validation
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-300">
                  The form displays clear errors when
                  information is missing or invalid.
                </p>
              </div>

              <div>
                <p className="font-semibold">
                  Secure server validation
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-300">
                  Submitted information is validated again on
                  the server before it is accepted.
                </p>
              </div>
            </div>
          </div>

          <PublicInquiryForm />
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

