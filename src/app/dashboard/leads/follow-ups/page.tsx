import { redirect } from "next/navigation";

/*
 * Follow-ups is now a view inside the Leads page (?view=followups)
 * instead of its own route, so it shares the Leads page's counselor
 * filter and navigation instead of duplicating both. This route stays
 * only to send old bookmarks and links to the right place.
 */
type FollowUpsRedirectPageProps = {
  searchParams: Promise<{ counselor?: string }>;
};

export default async function FollowUpsRedirectPage({
  searchParams,
}: FollowUpsRedirectPageProps) {
  const { counselor } = await searchParams;

  const params = new URLSearchParams({ view: "followups" });

  if (counselor) {
    params.set("counselor", counselor);
  }

  redirect(`/dashboard/leads?${params.toString()}`);
}
