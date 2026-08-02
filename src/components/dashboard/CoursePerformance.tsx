import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import type { Course } from "@/data/courses";
import type { Lead } from "@/types/lead";

export default function CoursePerformance({
  courses,
  leads,
}: {
  courses: Course[];
  leads: Lead[];
}) {
  const rows = courses
    .map((course) => {
      const courseLeads = leads.filter(
        (lead) => lead.interestedCourse === course.name,
      );
      const enrolled = courseLeads.filter(
        (lead) => lead.status === "ENROLLED",
      ).length;

      return {
        course,
        leadCount: courseLeads.length,
        enrolled,
        conversion:
          courseLeads.length > 0
            ? Math.round((enrolled / courseLeads.length) * 100)
            : 0,
      };
    })
    .sort((a, b) => b.leadCount - a.leadCount);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course performance</CardTitle>
        <CardDescription>
          Interest and enrollment conversion by course.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ul className="grid gap-4">
          {rows.map(({ course, leadCount, enrolled, conversion }) => (
            <li key={course.id}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-700">
                  {course.name}
                </span>
                <span className="shrink-0 tabular-nums text-slate-500">
                  {enrolled}/{leadCount} enrolled
                </span>
              </div>

              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-primary-800 transition-[width]"
                  style={{ width: `${conversion}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
