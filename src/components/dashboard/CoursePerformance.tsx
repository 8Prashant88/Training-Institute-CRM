import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import type { Lead } from "@/types/lead";

type DashboardCourse = {
  id: string;
  title: string;
};

type CoursePerformanceProps = {
  courses: DashboardCourse[];
  leads: Lead[];
};

export default function CoursePerformance({
  courses,
  leads,
}: CoursePerformanceProps) {
  const rows = courses
    .map((course) => {
      const courseLeads = leads.filter(
        (lead) =>
          lead.interestedCourse === course.title,
      );

      const enrolled = courseLeads.filter(
        (lead) => lead.status === "ENROLLED",
      ).length;

      const conversion =
        courseLeads.length > 0
          ? Math.round(
              (enrolled / courseLeads.length) * 100,
            )
          : 0;

      return {
        course,
        leadCount: courseLeads.length,
        enrolled,
        conversion,
      };
    })
    .sort((a, b) => b.leadCount - a.leadCount);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course performance</CardTitle>

        <CardDescription>
          Interest and lead conversion by active course.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-slate-500">
            No active courses found.
          </p>
        ) : (
          <ul className="grid gap-4">
            {rows.map(
              ({
                course,
                leadCount,
                enrolled,
                conversion,
              }) => (
                <li key={course.id}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-slate-700">
                      {course.title}
                    </span>

                    <span className="shrink-0 tabular-nums text-slate-500">
                      {enrolled}/{leadCount} enrolled
                    </span>
                  </div>

                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-primary-800 transition-[width]"
                      style={{
                        width: `${conversion}%`,
                      }}
                    />
                  </div>
                </li>
              ),
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}