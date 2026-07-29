

import { useState, type FormEvent } from "react";
import type { Lead } from "@/types/lead";

type InquiryFormProps = {
  onCreateLead: (lead: Lead) => void;
};

export default function InquiryForm({ onCreateLead }: InquiryFormProps) {
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

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 grid gap-4 rounded-xl border border-slate-200 bg-white p-5"
    >
      <h2 className="text-xl font-semibold text-slate-900">Add a new lead</h2>

      <label className="grid gap-1">
        <span className="text-sm font-medium text-slate-700">Full name</span>

        <input
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          placeholder="Enter full name"
        />
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium text-slate-700">Email</span>

        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          placeholder="student@example.com"
        />
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium text-slate-700">Phone</span>

        <input
          type="text"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          placeholder="98XXXXXXXX"
        />
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium text-slate-700">
          Interested course
        </span>

        <input
          type="text"
          value={interestedCourse}
          onChange={(event) => setInterestedCourse(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          placeholder="AI Engineering"
        />
      </label>
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white"
      >
        Add Lead
      </button>
    </form>
  );
}
