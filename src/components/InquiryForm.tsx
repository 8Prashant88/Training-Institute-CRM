import { useState, type FormEvent } from "react";
import type { Lead } from "@/types/lead";

type InquiryFormProps = {
  onCreateLead: (lead: Lead) => void;
};

const inputClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 placeholder:text-slate-400 transition focus:border-[#001B31] focus:outline-none focus:ring-2 focus:ring-[#F9901C]/40";

export default function InquiryForm({
  onCreateLead,
}: InquiryFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [interestedCourse, setInterestedCourse] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !interestedCourse.trim()
    ) {
      setError("Please complete all fields.");
      return;
    }

    setError("");

    const newLead: Lead = {
      id: crypto.randomUUID(),
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      interestedCourse: interestedCourse.trim(),
      status: "NEW",
    };

    onCreateLead(newLead);

    setFullName("");
    setEmail("");
    setPhone("");
    setInterestedCourse("");
  }

  const hasError = Boolean(error);

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-[#F9901C]">
          New inquiry
        </p>

        <h2 className="mt-2 text-xl font-semibold text-[#001B31]">
          Add a new lead
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          Record a prospective student&apos;s contact details and course
          interest.
        </p>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <label
            htmlFor="fullName"
            className="text-sm font-medium text-slate-700"
          >
            Full name
          </label>

          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className={inputClassName}
            placeholder="Enter full name"
            aria-invalid={hasError}
            aria-describedby={hasError ? "inquiry-form-error" : undefined}
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-slate-700"
          >
            Email address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName}
            placeholder="student@example.com"
            aria-invalid={hasError}
            aria-describedby={hasError ? "inquiry-form-error" : undefined}
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="phone"
            className="text-sm font-medium text-slate-700"
          >
            Phone number
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={inputClassName}
            placeholder="98XXXXXXXX"
            aria-invalid={hasError}
            aria-describedby={hasError ? "inquiry-form-error" : undefined}
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="interestedCourse"
            className="text-sm font-medium text-slate-700"
          >
            Interested course
          </label>

          <input
            id="interestedCourse"
            name="interestedCourse"
            type="text"
            value={interestedCourse}
            onChange={(event) =>
              setInterestedCourse(event.target.value)
            }
            className={inputClassName}
            placeholder="AI Engineering"
            aria-invalid={hasError}
            aria-describedby={hasError ? "inquiry-form-error" : undefined}
          />
        </div>
      </div>

      {error && (
        <p
          id="inquiry-form-error"
          role="alert"
          className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="w-full rounded-lg bg-[#001B31] px-5 py-3 font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9901C] focus-visible:ring-offset-2 sm:w-auto"
        >
          Add lead
        </button>
      </div>
    </form>
  );
}

