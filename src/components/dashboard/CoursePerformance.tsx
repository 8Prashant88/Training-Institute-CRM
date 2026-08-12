import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

export type CoursePerformanceRow = {
  courseId: string;
  courseTitle: string;
  leadCount: number;
  enrolledCount: number;
  conversionRate: number;
};

type CoursePerformanceProps = {
  rows: CoursePerformanceRow[];
};

export default function CoursePerformance({
  rows,
}: CoursePerformanceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course performance</CardTitle>

        <CardDescription>
          Interest and lead conversion by course.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-slate-500">
            No leads with an interested course yet.
          </p>
        ) : (
          <ul className="grid gap-4">
            {rows.map(
              ({ courseId, courseTitle, leadCount, enrolledCount, conversionRate }) => (
                <li key={courseId}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate font-medium text-slate-700">
                      {courseTitle}
                    </span>

                    <span className="shrink-0 tabular-nums text-slate-500">
                      {enrolledCount}/{leadCount} enrolled
                    </span>
                  </div>

                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-primary-800 transition-[width]"
                      style={{
                        width: `${conversionRate}%`,
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
