import { MessageSquareText } from "lucide-react";

import Avatar from "@/components/ui/Avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  formatDate,
  formatRelativeDate,
} from "@/lib/format";
import type { LeadNoteDetails } from "@/services/lead-service";

type LeadNotesListProps = {
  notes: LeadNoteDetails[];
};

export default function LeadNotesList({
  notes,
}: LeadNotesListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Lead notes</CardTitle>

            <CardDescription>
              Counselor notes recorded for this lead.
            </CardDescription>
          </div>

          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-800">
            <MessageSquareText
              aria-hidden="true"
              className="size-5"
            />
          </span>
        </div>
      </CardHeader>

      <CardContent padded={false}>
        {notes.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm font-medium text-slate-700">
              No notes recorded
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Counselor notes for this lead will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notes.map((note) => (
              <li
                key={note.id}
                className="p-5 sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <Avatar
                    name={note.author.fullName}
                    size="sm"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {note.author.fullName}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {note.author.email}
                        </p>
                      </div>

                      <time
                        dateTime={note.createdAt}
                        title={formatDate(note.createdAt)}
                        className="shrink-0 text-xs text-slate-400"
                        suppressHydrationWarning
                      >
                        {formatRelativeDate(note.createdAt)}
                      </time>
                    </div>

                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                      {note.note}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}