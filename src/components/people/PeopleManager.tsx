"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";

import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Table,
  TableContainer,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui/Table";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import type { Person } from "@/types/people";
import CreatePersonDialog from "@/components/people/CreatePersonDialog";
import PersonRowActions from "@/components/people/PersonRowActions";

type FilterKey = "all" | "admins" | "counselors" | "inactive";

const filters: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "admins", label: "Administrators" },
  { key: "counselors", label: "Counselors" },
  { key: "inactive", label: "Inactive" },
];

type PeopleManagerProps = {
  people: Person[];
  currentUserId: string;
};

export default function PeopleManager({
  people,
  currentUserId,
}: PeopleManagerProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const filteredPeople = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return people.filter((person) => {
      if (activeFilter === "admins" && person.role !== "ADMIN") {
        return false;
      }

      if (activeFilter === "counselors" && person.role !== "COUNSELOR") {
        return false;
      }

      if (activeFilter === "inactive" && person.isActive) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return (
        person.fullName.toLowerCase().includes(normalizedQuery) ||
        person.email.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [people, activeFilter, query]);

  function handleSuccess(message: string) {
    toast({ variant: "success", title: "Success", description: message });
    router.refresh();
  }

  function handleError(message: string) {
    toast({
      variant: "error",
      title: "Something went wrong",
      description: message,
    });
  }

  return (
    <section className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={cn(
                "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition",
                activeFilter === filter.key
                  ? "bg-primary-900 text-white"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />

            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or email…"
              aria-label="Search people"
              className="w-56 pl-9 sm:w-64"
            />
          </div>

          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus aria-hidden="true" className="size-4" />
            Add person
          </Button>
        </div>
      </div>

      {filteredPeople.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-primary-900">
            No people found
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {people.length === 0
              ? "Add your first administrator or counselor to get started."
              : "Try a different search term or filter."}
          </p>
        </div>
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Role</TH>
                <TH>Status</TH>
                <TH>Login access</TH>
                <TH>Assigned leads</TH>
                <TH>Added</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>

            <TBody>
              {filteredPeople.map((person) => (
                <TR key={person.id} className="hover:bg-slate-50/60">
                  <TD>
                    <div className="flex items-center gap-3">
                      <Avatar name={person.fullName} size="sm" />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {person.fullName}
                          {person.id === currentUserId && (
                            <span className="ml-1.5 text-xs font-normal text-slate-400">
                              (you)
                            </span>
                          )}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {person.email}
                        </p>
                      </div>
                    </div>
                  </TD>

                  <TD>
                    <Badge tone={person.role === "ADMIN" ? "violet" : "blue"}>
                      {person.role === "ADMIN"
                        ? "Administrator"
                        : "Counselor"}
                    </Badge>
                  </TD>

                  <TD>
                    <Badge
                      tone={person.isActive ? "green" : "slate"}
                      dot
                    >
                      {person.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TD>

                  <TD>
                    {person.hasLoginAccess ? (
                      <span className="text-sm text-slate-600">Enabled</span>
                    ) : (
                      <Badge tone="amber">No login yet</Badge>
                    )}
                  </TD>

                  <TD className="tabular-nums">
                    {person.role === "COUNSELOR"
                      ? person.assignedLeadCount
                      : "—"}
                  </TD>

                  <TD className="whitespace-nowrap text-slate-500">
                    {formatDate(person.createdAt)}
                  </TD>

                  <TD className="text-right">
                    <PersonRowActions
                      person={person}
                      isSelf={person.id === currentUserId}
                      onSuccess={handleSuccess}
                      onError={handleError}
                    />
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableContainer>
      )}

      <CreatePersonDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleSuccess}
      />
    </section>
  );
}
