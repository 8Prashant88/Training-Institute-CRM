const courses = [
  {
    id: "course-001",
    name: "AI Engineering",
    duration: "12 weeks",
    active: true,
  },
  {
    id: "course-002",
    name: "Data Science",
    duration: "12 weeks",
    active: true,
  },
  {
    id: "course-003",
    name: "Cybersecurity",
    duration: "16 weeks",
    active: false,
  },
];

export default function CoursesPage() {
    
  return (
    <section className="rounded-xl bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
        Course management
      </p>

      <h1 className="mt-3 text-3xl font-bold text-slate-900">
        Courses
      </h1>

      <p className="mt-2 text-slate-600">
        View the training programs offered by the institute.
      </p>

      <div className="mt-8 grid gap-4">
        {courses.map((course) => (
          <article
            key={course.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 p-5"
          >
            <div>
              <h2 className="font-semibold text-slate-900">
                {course.name}
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Duration: {course.duration}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                course.active
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {course.active ? "Active" : "Inactive"}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}