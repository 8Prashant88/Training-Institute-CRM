"use client";

import { useRouter } from "next/navigation";

import { Select } from "@/components/ui/Input";

type CounselorFilterOption = {
  id: string;
  fullName: string;
  isActive: boolean;
};

type LeadCounselorFilterSelectProps = {
  basePath: string;
  counselors: CounselorFilterOption[];
  selectedCounselorId?: string;
};

export default function LeadCounselorFilterSelect({
  basePath,
  counselors,
  selectedCounselorId,
}: LeadCounselorFilterSelectProps) {
  const router = useRouter();

  return (
    <div>
      <label
        htmlFor="lead-counselor-filter"
        className="mb-1.5 block text-xs font-medium text-slate-500"
      >
        Counselor
      </label>

      <Select
        id="lead-counselor-filter"
        defaultValue={selectedCounselorId ?? ""}
        className="w-auto bg-white"
        onChange={(event) => {
          const value = event.target.value;

          router.push(
            value ? `${basePath}?counselor=${value}` : basePath,
          );
        }}
      >
        <option value="">All counselors</option>
        <option value="UNASSIGNED">Unassigned</option>

        {counselors.map((counselor) => (
          <option key={counselor.id} value={counselor.id}>
            {counselor.fullName}
            {!counselor.isActive ? " (inactive)" : ""}
          </option>
        ))}
      </Select>
    </div>
  );
}
