# Daily Development Log

## Day 1 — Git Workflow and Product Planning

### What I completed

- Created the Next.js application.
- Initialized and understood the Git repository.
- Defined the CRM problem, users, scope, and exclusions.
- Created an initial entity list and endpoint inventory.
- Published the repository to GitHub.
- Verified setup using a clean clone.

### What I learned

- Git tracks project history locally.
- GitHub stores a remote copy of the repository.
- `git add` stages selected changes.
- `git commit` creates a project checkpoint.
- `.gitignore` prevents selected files from being tracked.
- User stories describe value from a user's perspective.
- Acceptance criteria define testable completion conditions.

## Day 2 — React Mental Model

### What I completed

- Created reusable React components.
- Added explicit TypeScript prop types.
- Created typed hard-coded lead data.
- Rendered lead cards using `map()`.
- Added stable and unique list keys.
- Added an empty-state UI using conditional rendering.
- Added status filtering with local React state.
- Created a controlled inquiry form.
- Added new leads to local state.
- Added simple validation for empty and whitespace-only submissions.
- Ran TypeScript, ESLint, and production build checks successfully.

### What I learned

- A React component is a function that returns JSX.
- Props pass data from a parent component to a child component.
- State stores values that can change during user interaction.
- Updating state causes React to re-render the affected components.
- Controlled inputs store their values in React state.
- Data flows downward through props.
- Child components can send information upward through callback functions.
- `map()` converts an array of data into React components.
- Stable keys help React identify list items.
- State should be updated immutably instead of being changed directly.
- Data stored only in React state disappears after a browser refresh.

## Day 3 — Next.js App Router

### What I completed

- Created routes for the homepage, login, dashboard, leads, courses, and batches.
- Created a dynamic lead-detail route using `[id]`.
- Read the dynamic route parameter from `params`.
- Connected lead IDs to shared hard-coded lead data.
- Added a shared nested dashboard layout.
- Added dashboard navigation using the Next.js `Link` component.
- Organized the login route using an `(auth)` route group.
- Added a dashboard loading skeleton.
- Added a route-level error boundary with a retry button.
- Added a lead-specific not-found page.
- Added an app-wide custom not-found page.
- Tested direct URL navigation and browser refresh.
- Tested valid and invalid lead URLs.
- Ran TypeScript, ESLint, and production build checks successfully.

### What I learned

- A `page.tsx` file makes a route publicly accessible.
- Folders inside `app` become URL segments.
- A normal component does not create a URL.
- A nested `layout.tsx` automatically wraps child routes.
- The `children` prop represents the currently selected nested page.
- A folder such as `[id]` creates a dynamic route segment.
- Dynamic route values are available through `params`.
- `notFound()` stops normal rendering and activates the nearest `not-found.tsx`.
- The root `not-found.tsx` handles unmatched application URLs.
- `loading.tsx` provides fallback UI while a route is loading.
- `error.tsx` acts as an error boundary and must be a Client Component.
- Route groups organize files without changing public URLs.
- `Link` enables navigation between internal Next.js routes.
- Shared layouts prevent repeated headers and navigation code.

## Day 4 — Server and Client Components

### What I completed

- Converted the homepage back into a Server Component.
- Moved lead state, filtering, events, and form interaction into `LeadManager`.
- Passed typed initial lead data from a Server Component to a Client Component.
- Created a server-only configuration module.
- Read private environment variables only on the server.
- Displayed a safe configuration summary without exposing the secret value.
- Tested importing a server-only module into a Client Component.
- Tested using `useState` inside a Server Component.
- Removed an unnecessary `"use client"` directive from `InquiryForm`.
- Removed duplicate inquiry-form validation.
- Trimmed form values before storing them.
- Improved typed-text, placeholder, and focus styling in form inputs.
- Ran TypeScript, ESLint, and production build checks successfully.

### What I learned

- App Router pages and layouts are Server Components by default.
- Server Components can access private configuration and server-only modules.
- Client Components are required for state, events, forms, and browser APIs.
- `"use client"` defines a boundary, not just one isolated component.
- Components imported below a client boundary become part of the client component tree.
- Server Components can render Client Components.
- Data passed from server to client must be serializable.
- Plain objects, arrays, strings, numbers, and booleans can cross the boundary.
- Secrets, database clients, and server-only modules must not enter Client Components.
- Environment variables without `NEXT_PUBLIC_` should remain server-side.
- A secret is still exposed if a Server Component renders its actual value.
- Interactive code should be placed in the smallest reasonable Client Component.

## Day 5 — Responsive UI with Tailwind

### What I completed

- Audited the CRM at mobile, tablet, laptop, and desktop widths.
- Created responsive mobile navigation and a desktop sidebar.
- Reduced page padding on small screens.
- Added responsive dashboard statistic cards.
- Improved the reusable `DashboardStat` component.
- Created mobile lead cards and a desktop lead table.
- Added wrapping rules for long names, emails, phone numbers, and course titles.
- Fixed horizontal overflow caused by flex items and long email addresses.
- Improved the inquiry form with responsive columns.
- Connected form labels and inputs using `htmlFor` and `id`.
- Added visible hover and keyboard-focus states.
- Improved phone input semantics with `type="tel"` and `inputMode="tel"`.
- Created a responsive loading skeleton.
- Created a reusable empty-state component.
- Created a reusable confirmation dialog.
- Added Escape-key, background-click, cancel, and confirm behavior to the dialog.
- Added a confirmation step before clearing all leads.
- Tested the UI with long content and narrow screens.
- Verified that the interface has no page-level horizontal overflow.
- Ran TypeScript, ESLint, and production build checks successfully.

### What I learned

- Tailwind uses a mobile-first responsive approach.
- Unprefixed classes apply to small screens first.
- Breakpoint classes such as `sm:`, `md:`, `lg:`, and `xl:` progressively enhance layouts.
- `min-w-0` allows flex and grid children to shrink correctly.
- `break-words` wraps long text at suitable word boundaries.
- `break-all` is useful for long values such as email addresses.
- `overflow-x-auto` is safer for wide tables than allowing the entire page to overflow.
- Mobile cards are often easier to read than tables on narrow screens.
- Responsive loading states should resemble the final content layout.
- Labels should be explicitly connected to form fields.
- Keyboard users need clear focus indicators.
- Destructive actions should require confirmation.
- Reusable UI components reduce repeated styling and behavior.
- Accessibility should be considered while building components, not added only at the end.
## Day 6 — Forms, Zod, and Submission States

### What I completed

- Installed Zod for runtime form validation.
- Created a shared `leadFormSchema` for internal lead forms.
- Created a `publicInquirySchema` with an additional message field.
- Inferred TypeScript form types directly from Zod schemas.
- Validated full name, email, phone number, course interest, and message.
- Trimmed text values before accepting submitted data.
- Added minimum and maximum length validation rules.
- Installed and configured an international phone-number input.
- Added country flags and international calling codes.
- Used Nepal as the default country without restricting foreign numbers.
- Stored validated phone numbers in international E.164 format.
- Created a reusable `InternationalPhoneField` component.
- Added field-specific validation errors to the create-lead form.
- Added a validated public inquiry form to the homepage.
- Added a validated edit-lead form to the dynamic lead-detail route.
- Created Server Actions for creating, updating, and submitting inquiries.
- Revalidated submitted information on the server.
- Added pending, success, and failure submission states.
- Disabled form controls while a submission was running.
- Added duplicate-submission protection using a submission lock.
- Added accessible error messages using `aria-invalid`, `aria-describedby`, and live regions.
- Tested missing fields, whitespace-only input, invalid emails, invalid phone numbers, oversized input, simulated server failures, and rapid double-clicks.

### What I learned

- TypeScript types only protect code during development and compilation.
- TypeScript interfaces do not validate data at runtime.
- Zod schemas validate unknown data while the application is running.
- `safeParse()` returns a success or failure result without throwing a normal validation exception.
- `z.infer` creates TypeScript types from schemas and prevents duplicated type definitions.
- Form-input types should be separate from complete stored entity types.
- Fields such as `id` and default `status` should be generated after validation instead of entered by the user.
- `.trim()` prevents whitespace-only values from passing required-field validation.
- Client-side validation provides fast feedback but cannot be trusted as the only validation layer.
- Server-side validation protects the application when browser validation is bypassed.
- A shared schema keeps client and server validation rules consistent.
- Controlled inputs keep form values synchronized with React state.
- Field errors can be represented with `Partial<Record<keyof FormData, string>>`.
- International phone validation should use phone-number metadata instead of one country-specific regular expression.
- E.164 provides a consistent format for storing international phone numbers.
- Runtime helper functions such as `isValidPhoneNumber` must be imported wherever the schema executes.
- Pending states communicate that a submission is processing.
- Disabling a button improves the interface but a synchronous submission lock provides stronger duplicate-submit protection.
- `try`, `catch`, and `finally` help manage success, unexpected failure, and cleanup states.
- Server Actions allow Client Components to call server-side application logic.
- Successful form validation does not automatically mean data is permanently stored.
- React state and temporary Server Actions will be replaced with database persistence later.

## Day 7 — Production Deployment and Reconstruction

### What I completed

- Ran TypeScript, ESLint, and production build checks.
- Built the optimized Next.js production application.
- Ran the production server locally using `npm run start`.
- Tested all public and dashboard routes in production mode.
- Tested direct browser refresh on nested and dynamic routes.
- Tested the custom not-found page with an invalid URL.
- Connected the GitHub repository to Vercel.
- Configured production and preview environment variables.
- Deployed the Training Institute CRM to Vercel.
- Tested public inquiry and internal lead forms after deployment.
- Tested the application on a mobile viewport.
- Tested the responsive dashboard navigation.
- Tested the application using a throttled network connection.
- Verified that the browser console had no critical production errors.
- Added the live deployment link to the README.
- Reconstructed `LeadCard` without relying on copied code.
- Reconstructed `InquiryForm` from its requirements and data flow.
- Verified the reconstructed components using TypeScript, ESLint, and production builds.

### What I learned

- Development mode is optimized for debugging and fast code changes.
- Production mode is optimized for performance, stability, and real users.
- `next build` compiles and optimizes the application.
- `next start` runs the previously generated production build.
- A feature that works in development can still fail during a production build.
- Build-time errors prevent the application from being deployed.
- Runtime errors occur after the application has successfully started.
- Production environment variables must be configured separately from `.env.local`.
- Environment variables added on Vercel require a new deployment to take effect.
- Production and preview deployments can use different environment values.
- Vercel automatically deploys new commits pushed to the connected branch.
- Nested routes must be tested using direct navigation and browser refresh.
- Server Actions continue to execute on the server after deployment.
- Client-side React state is temporary and disappears after refresh.
- A successful deployment does not replace manual route and form testing.
- Slow-network testing helps reveal weak loading states and layout shifts.
- Rebuilding a component from requirements exposes gaps in understanding.
- Component props define the contract between parent and child components.
- Reusable UI components reduce styling duplication and improve consistency.
- Git history provides a safe recovery point during reconstruction exercises.

## Day 8 — Relational Database Design

### What I completed

- Distinguished database schema from stored data.
- Identified the core CRM entities.
- Designed relationships between users, leads, notes, courses, batches, and enrollments.
- Created a Mermaid entity-relationship diagram.
- Defined primary, foreign, and unique keys.
- Documented required and nullable fields.
- Defined default values and business constraints.
- Planned archive and deletion behavior.
- Reviewed duplicate enrollment, missing counselor, deleted course, full batch, and lead deletion scenarios.
- Identified important database indexes.

### What I learned

- A schema defines database structure and rules.
- Foreign keys protect relationships between records.
- Cardinality describes how entities relate.
- Nullability must reflect real workflows.
- Unique constraints protect important business rules.
- Some rules require transactions rather than basic constraints.
- Soft deletion preserves historical CRM data.
- Database design should be tested against failure scenarios before implementation.
## Day 9 — PostgreSQL, Prisma, Migrations, and Seed Data

### What I completed

- Created a Supabase project with a hosted PostgreSQL database.
- Installed Prisma ORM, Prisma Client, the PostgreSQL driver adapter, and supporting packages.
- Initialized Prisma for PostgreSQL.
- Configured separate database connections for application runtime and migrations.
- Used a pooled connection for the deployed application.
- Used a direct/session connection for Prisma migrations.
- Translated the relational database design into Prisma models.
- Created Prisma enums for roles, lead sources, lead statuses, course statuses, batch statuses, and enrollment statuses.
- Defined primary keys, foreign keys, unique constraints, default values, nullable fields, relations, and indexes.
- Generated and validated the Prisma Client.
- Created the initial migration without immediately applying it.
- Inspected the generated SQL before changing the database.
- Added database-level checks for positive batch capacity and valid batch date ranges.
- Applied the initial migration to the Supabase PostgreSQL database.
- Verified that the migration files and database migration history were synchronized.
- Created repeatable seed data for users, courses, batches, leads, notes, and enrollment.
- Ran the seed process twice successfully without creating duplicate records.
- Configured automatic Prisma Client generation using the postinstall script.
- Added safe database-variable placeholders to .env.example.
- Excluded generated Prisma files, secrets, and local AI-tool configuration from Git.
- Added the database environment variables to Vercel.
- Ran Prisma validation, migration status, TypeScript, ESLint, and production build checks.

### What I learned

- PostgreSQL is the actual relational database that stores application records.
- Supabase hosts and manages the PostgreSQL database.
- Prisma does not replace PostgreSQL; it provides a typed application layer for working with it.
- The Prisma schema describes the current desired database structure.
- A migration contains versioned SQL instructions that change the database structure.
- Migration files allow different environments and developers to reproduce the same database schema.
- The _prisma_migrations table records which migrations have already been applied.
- --create-only allows generated migration SQL to be inspected and customized before execution.
- Database constraints protect important rules even when application code contains a bug.
- Prisma Client is generated from the schema and provides type-safe database queries.
- Prisma relation fields help navigate connected records but do not always become physical database columns.
- Foreign-key scalar fields such as courseId and authorId are stored in PostgreSQL.
- Seeding inserts predictable development data after the database structure exists.
- upsert makes a seed script repeatable by updating or creating known records.
- Migrations primarily change structure, while normal application queries create and update data.
- A pooled connection is suitable for temporary serverless application connections.
- A direct or session connection is more appropriate for migrations.
- Environment variables containing database credentials must never be committed.
- Creating database tables does not automatically connect existing forms to the database.
- The current public inquiry and dashboard lead forms still require Prisma create operations before their submissions become permanent.
- React state is temporary, while PostgreSQL records survive refreshes and can be shared across users.


## Day 10 — Prisma Queries, Services, and Database-Backed Workflows

### What I completed

- Created a server-only Prisma Client singleton for application database access.
- Used the PostgreSQL driver adapter with Prisma Client.
- Created service functions for courses, leads, batches, dashboard data, and users.
- Used Prisma `findMany`, `findUnique`, `findFirst`, `create`, `update`, `select`, `include`, relation counts, filtering, and ordering.
- Connected the Courses page to active course records from PostgreSQL.
- Connected the Leads page to real lead records from PostgreSQL.
- Connected the Batches page to real batch and enrollment data.
- Connected dashboard statistics, recent leads, pipeline data, follow-up counts, enrollment counts, and course performance to the database.
- Created a database-backed lead-detail query with interested course, assigned counselor, notes, and note authors.
- Added a lead notes section to the lead-detail page.
- Added the inquiry message field to the Lead model and applied a Prisma migration.
- Replaced the public inquiry course text field with a dropdown containing active database courses.
- Updated the public inquiry form to submit the selected course ID instead of a course name.
- Updated the public inquiry Server Action to create a real Lead record.
- Stored public inquiries with `NEW` status, `WEBSITE` source, and no assigned counselor.
- Stored the submitted public inquiry message in PostgreSQL.
- Added a service for loading active counselors.
- Replaced mock course and counselor values in the internal Add Lead form with database-backed dropdowns.
- Updated manual lead creation to store real course and counselor IDs.
- Removed browser-generated lead IDs and used the Lead record returned by PostgreSQL.
- Added course and counselor options to the Edit Lead form.
- Added an `Unassigned` option for leads that do not yet have a counselor.
- Updated the Edit Lead Server Action to save contact details, course changes, and counselor assignments to PostgreSQL.
- Verified that public inquiries and manually created leads remained available after browser refresh.
- Revalidated the homepage, dashboard, leads, lead-detail, and course pages after database mutations.
- Added safe validation and error responses without exposing raw Prisma or PostgreSQL errors.
- Ran TypeScript, ESLint, and production build checks.

### What I learned

- Prisma Client provides type-safe functions for reading and changing PostgreSQL records.
- `findMany()` retrieves multiple matching records.
- `findUnique()` retrieves one record using a unique field such as an ID.
- `findFirst()` retrieves the first record that matches a set of filters.
- `create()` inserts a new database record.
- `update()` changes an existing database record and can return the updated values.
- `select` returns only the fields required by the application.
- `include` loads related records together with the main record.
- Relation counts can calculate values such as enrollments without loading every related record.
- `orderBy` makes database results predictable before they reach the interface.
- Service functions keep Prisma queries separate from page and component code.
- Database modules should remain server-only so Prisma Client and credentials do not enter the browser bundle.
- Server Components can load database data and pass serializable values to Client Components.
- Client Components should receive plain objects, arrays, strings, numbers, and booleans rather than database clients.
- Server Actions are useful for secure form mutations because submitted values can be validated again on the server.
- Client-side validation improves feedback, while server-side validation protects the database.
- A display name such as a course title or counselor name should not be used as a relational database key.
- Dropdowns can display readable names while submitting real UUID values.
- A nullable foreign key allows a public inquiry to exist before a counselor is assigned.
- An empty counselor selection can be converted into `null` before updating PostgreSQL.
- Public inquiry submission creates a Lead associated with an existing Course; it does not create a new Course.
- `Promise.all()` can load independent database datasets at the same time.
- `revalidatePath()` refreshes cached route data after a successful mutation.
- Returning the database-created record prevents the UI from inventing IDs or assuming that a write succeeded.
- React state can provide immediate interface updates, but PostgreSQL is the permanent source of truth.
- Database records remain available after refresh and can be shared across pages and users.
- Raw database errors should be logged on the server and replaced with safe messages for users.

## Day 11 — CRM Mutations, Soft Archiving, and Enrollment Transactions

### What I completed

- Added persistent lead-status updates using a validated Server Action.
- Prevented the `ENROLLED` status from being selected manually.
- Added optimistic status updates with rollback when a server request fails.
- Added database-backed notes to the lead-detail page.
- Validated note content, lead IDs, and note authors on the server.
- Added duplicate-submission protection to lead-note creation.
- Added soft archiving for leads using the `archivedAt` field.
- Kept archived lead records, notes, and relationships in PostgreSQL.
- Removed archived leads from active lead lists and detail routes.
- Added an archive confirmation dialog and redirected users after a successful archive.
- Added a service and Server Action for creating course batches.
- Validated batch titles, capacities, courses, start dates, and end dates.
- Added a database-backed batch creation form.
- Loaded active courses into the batch form.
- Refreshed batch statistics and batch cards after creation.
- Added a service for loading upcoming and ongoing batches with remaining capacity.
- Created a lead-to-enrollment workflow using a Prisma interactive transaction.
- Created the enrollment record and updated the lead inside the same transaction.
- Updated the lead status to `ENROLLED` after successful enrollment.
- Updated the lead’s course to the course belonging to the finally selected batch.
- Cleared the lead’s next follow-up date after successful enrollment.
- Allowed leads to enroll in a course different from their original course interest.
- Prevented duplicate enrollment using application checks and the database unique constraint.
- Prevented enrollment into missing, completed, cancelled, or full batches.
- Used serializable transaction isolation for enrollment-capacity protection.
- Added retry handling for Prisma transaction conflicts.
- Added an enrollment form to the lead-detail page.
- Displayed batch course, dates, occupancy, status, and remaining seats.
- Tested successful enrollment with a batch from another course.
- Forced a temporary transaction failure and verified that PostgreSQL rolled back the enrollment.
- Tested duplicate enrollment, full batch, unavailable batch, and archived-lead failures.
- Ran Prisma validation, TypeScript, ESLint, and production build checks.

### What I learned

- A mutation changes permanent application data and must be validated on the server.
- Optimistic updates make interfaces feel faster but must restore previous state after failure.
- Browser state is not the source of truth for database mutations.
- Soft archiving preserves historical records while removing them from active workflows.
- An `archivedAt` timestamp records both whether and when a record was archived.
- Active-record queries must consistently filter archived records.
- Server Actions provide a controlled boundary between Client Components and database services.
- Form values such as numbers and dates arrive as strings and must be validated and transformed.
- A browser date input does not remove the need for server-side date validation.
- Business rules such as end date after start date belong on the server.
- A transaction groups multiple database operations into one atomic operation.
- Atomicity means all operations commit together or all operations roll back.
- Creating an enrollment and updating the lead separately could produce inconsistent data.
- Throwing an error inside a transaction causes all earlier transaction writes to be rolled back.
- A lead’s original course interest is not necessarily the course they finally purchase.
- The selected batch determines the final enrolled course.
- A unique constraint provides stronger duplicate protection than interface checks alone.
- Server-side capacity checks are necessary because the browser may display stale seat information.
- Serializable isolation helps protect shared values such as the final available batch seat.
- Concurrent serializable transactions can conflict and may need retry handling.
- Prisma error code `P2034` can represent a transaction conflict or deadlock.
- Prisma error code `P2002` can represent a unique-constraint failure.
- Service-specific error classes make business failures easier to map into safe form messages.
- Database errors should be logged on the server without exposing internal details to users.
- `revalidatePath()` refreshes affected server-rendered data after successful mutations.
- Failure testing is as important as testing the successful workflow.

## Day 12 — Authentication

### What I completed

- Configured Supabase authentication for the Next.js application.
- Created separate browser and server Supabase clients.
- Implemented email and password login with validation.
- Added a Supabase Auth user for CRM access.
- Connected Supabase users to CRM profile records using `authUserId`.
- Protected dashboard routes using server-side authentication checks.
- Displayed the authenticated user's name, email, and role.
- Implemented real logout that clears the Supabase session.
- Added a Next.js Proxy to refresh authentication cookies.
- Tested wrong passwords, missing sessions, protected URLs, inactive users, logout, and cross-tab logout.

### What I learned

- Authentication proves who the user is.
- A session allows the user to remain authenticated across requests.
- Supabase stores session information in cookies for server-side rendering.
- Browser UI checks are not enough to protect private data.
- Protected routes must validate authentication on the server.
- Supabase Auth users and application profile records serve different purposes.
- The Supabase user ID securely connects an authentication identity to a CRM profile.
- Logout must destroy the session rather than only navigate to the login page.
- Proxy refreshes authentication cookies, while the dashboard layout performs authorization checks.
- Passwords, secret keys, and authentication tokens must never be logged or committed.

## Day 13 — Authorization and Roles

### What I completed

- Added role-based authorization for ADMIN and COUNSELOR users.
- Restricted counselors to viewing and updating only their assigned leads.
- Allowed both roles to create leads, with counselor-created leads automatically assigned to themselves.
- Protected lead notes, status updates, enrollment, reassignment, and archiving on the server.
- Allowed counselors to view courses and batches while keeping management actions admin-only.
- Added secure database-backed bulk lead status updates.

### What I learned

- Authentication identifies the user, while authorization controls what they can do.
- Hiding buttons in the UI is not enough; permissions must be checked on the server.
- Resource ownership is important when different users can access the same type of data.
- User IDs, roles, and ownership information should come from trusted server-side data instead of the browser.
- Database-level filtering and server-side permission checks help prevent unauthorized access.

## Day 14 — Search, Filters, and Pagination

### What I completed

- Moved lead search, filtering, sorting, and pagination from the browser to PostgreSQL.
- Added URL-based filters for status, source, course, counselor, sorting, and page number.
- Added database-backed pagination with total counts and status counts.
- Added counselor and unassigned-lead filtering for administrators while preserving counselor ownership restrictions.
- Kept inactive courses and counselors available for historical filtering while using active records for new leads.
- Added safe parsing and cleanup of invalid URL query parameters.
- Added debounced database search and refreshed server data after lead mutations.
- Ran TypeScript and ESLint checks successfully.

### What I learned

- Large datasets should be searched, filtered, sorted, and paginated in the database instead of the browser.
- URL query parameters make filters persistent across refreshes and navigation.
- Query parameters are untrusted input and should be validated before database queries.
- Authorization must remain enforced by the server even when filters come from the URL.
- Database pagination requires total counts and stable ordering.
- Creation forms and historical filters can require different datasets.

## Day 15 — Lead Pipeline and Follow-Up Workflow

### What I completed

- Designed a lead-status transition table defining which status moves are allowed, blocked, or require a note and/or a follow-up date.
- Centralized the transition rules and manually-editable status list in one shared module instead of duplicating them across Server Actions.
- Added a `LeadActivity` model and Prisma migration to record every status change and follow-up date change with who made it, when, and why.
- Rewrote lead status updates as a Prisma transaction that re-checks authorization against the lead's current assignment at write time, not just before the transaction starts.
- Added a status-change dialog that only asks for a note or a follow-up date when the selected move actually requires one.
- Added an independent follow-up scheduling action so a counselor can set or clear a callback date without changing the lead's status.
- Replaced the lead-detail Activity tab, previously built from a database field no service ever populated, with one backed by real `LeadActivity` records.
- Narrowed bulk status updates to the statuses that never require a note or date, so every bulk change still gets a full audit trail.
- Added a database-backed Overdue and Due-today follow-up worklist, scoped to a counselor's own leads and filterable by counselor for admins.
- Added a kanban-style lead board grouped by status, using the same status-change dialog and rules as the lead-detail page.
- Merged the board into the existing Leads page as a Table/Board toggle instead of shipping it as a separate route.
- Removed a dead `lastContactedAt` field that no service had ever written to, along with the fake timeline logic built on top of it.
- Broke, diagnosed, and fixed a running dev server after clearing the Next.js build cache while it was still active.
- Ran Prisma validation, TypeScript, ESLint, and production build checks after each major change.

### What I learned

- A domain state machine is easier to enforce correctly as one shared transition table than as status checks scattered across multiple Server Actions.
- Re-checking authorization inside the same transaction that performs the write closes a race condition that a check-then-write pattern outside the transaction cannot.
- An audit trail belongs in its own table; reusing a free-text notes table for it would mix two different kinds of records with different purposes.
- Restricting what a bulk action is allowed to do can be the safer trade-off when the action has no way to collect input a stricter business rule requires.
- React's documented fix for state that should reset when a prop changes is a fresh `key` that forces a remount, not an effect that calls `setState`.
- A Prisma-generated client has separate entry points for server and browser code; only the browser-safe one should be imported into files that a Client Component might load.
- Clearing a framework's build cache while its dev server is running can take the server down; the running process has to be restarted, not just the cache rebuilt.
- Adding a new view alongside an existing, already-tested one is lower risk than rewriting the existing view to make room for it.

## Day 16 — Courses, Batches, and Enrollment Rules

### What I completed

- Added full course management: admins can create, edit, activate, and deactivate courses; the courses page now shows inactive courses and a per-course batch count for admins, while counselors still see only active ones.
- Made the activate/deactivate action take only a course ID and compute the new status itself from the current database value, instead of trusting a status value sent by the client.
- Added a shared `batch-status-rules.ts` module (mirroring the existing `lead-status-rules.ts`) defining the batch lifecycle: `UPCOMING -> ONGOING -> COMPLETED`, with `CANCELLED` reachable from `UPCOMING` or `ONGOING` but never left.
- Added `updateBatchStatus` to batch-service, which re-reads a batch's current status inside the same transaction that changes it and rejects any move not listed in the transition table.
- Added `updateBatchDetails` to batch-service for editing a batch's title and capacity, run under Serializable isolation, which blocks lowering capacity below the number of currently active enrollments and blocks editing a `COMPLETED` or `CANCELLED` batch at all.
- Added admin-only UI controls on the batches page: inline title/capacity editing and status-transition buttons that only ever show a batch's actually-allowed next statuses, with a confirmation dialog before cancelling.
- Hardened `enrollLead()` with a second, independent check: even if a batch's `status` field is stale (still `UPCOMING` after its `endDate` has passed), the transaction now rejects enrollment once the batch's end-of-day (UTC) has passed.
- Added a start-date rule to batch creation: a new batch's start date can no longer be in the past.
- Wrote a standalone verification script (`scripts/verify-batch-enrollment-rules.ts`) that exercises the real dev database directly — capacity exactly reached, a cancelled batch, a batch with stale-status-but-past dates, a lead enrolled twice (both the application check and the raw database unique-constraint), and two concurrent enrollment attempts for a single remaining seat. All seven checks passed, and the script cleans up every row it creates.
- Ran TypeScript, ESLint, and a production build; smoke-tested the running dev server for runtime errors on public and dashboard routes.

### What I learned

- An application rule and a database rule protect the same fact for different reasons: the application rule (`status !== ACTIVE` check, `enrolledCount >= capacity` check) exists to produce a friendly, specific error message; the database rule (a unique constraint, a transaction that re-reads state before writing) exists as the last line of defense if the application rule is ever missing, buggy, or bypassed. Neither replaces the other.
- A status field and the real-world dates it's supposed to reflect can drift apart — nothing forces an admin to mark a batch `COMPLETED` the moment its `endDate` passes. Code that only trusts the status field is trusting a field a human might have forgotten to update; the enrollment transaction now checks the actual date too.
- A lifecycle with irreversible states (like `CANCELLED` or `COMPLETED` for a batch) is easiest to enforce correctly as one shared table of allowed edges, read by both the server-side write and the client-side buttons that offer choices — the same lesson from Day 15's lead-status rules, applied to a different entity.
- Re-checking a value inside the same transaction that writes it (current status before a status change, current enrolled count before a capacity change) closes a race window that checking it moments earlier, outside the transaction, cannot — a concurrent second request could always land in that gap.
- A toggle action is safer designed as "flip whatever the current value already is" than as "set the value to whatever the client sends," because the second form lets a tampered request set an arbitrary target value instead of only ever the one legitimate next state.
- A date stored as `@db.Date` in PostgreSQL comes back from Prisma as midnight UTC on that day. Comparing it directly against "now" would treat a batch's own final day as already over; the correct comparison is against the end of that day, not its start.
- A file that imports Next's real `server-only` package cannot be imported into a plain Node/tsx script — the package throws unconditionally outside Next's own bundler, and there is no `--conditions` flag that changes that from a bare `require()`. Verifying business rules against a real database from a standalone script means either duplicating the transaction logic, or driving the actual HTTP/Server Action layer — there's no way to `import` a server-only service file directly into a script.
- A destructive-looking verification step (creating and deleting real database rows) is safe to run against a shared dev database if every row it creates is clearly tagged, every code path that creates a row is matched by a cleanup path in a `finally` block, and the script sweeps for its own leftover rows before it starts — protecting against a previous run that crashed before cleanup ran.

## Day 17 — Dashboard Metrics and CSV Export

### What I completed

- Fixed a production deploy failure live since Day 9: `prisma.config.ts` required `DIRECT_URL` just to load, which broke `npm install` (via the `prisma generate` postinstall step) on any environment missing it. Reproduced with a clean clone and no env vars, then fixed. Also found `DATABASE_URL` was never added to Vercel at all.
- Found the dashboard loaded every lead into memory and filtered it in JS across three components — the same anti-pattern Day 14 fixed for the leads table, just relocated. Rewrote `dashboard-service.ts` around `count()`/`groupBy()` aggregation; the only row-level fetch left is the 5-row recent-leads list.
- Added the missing Day 17 metrics: conversion rate, enrollments this month, and leads by source (new `LeadsBySource` component).
- Added CSV export as a Route Handler (`/api/leads/export`), not a Server Action, since it's a file download, not a form submission. Reuses the leads table's own filter/authorization function so the export can never see more than that user's table view already shows.
- Wrote `src/lib/csv.ts` with proper quoting and a formula-injection guard (a field starting with `=`/`+`/`-`/`@` gets a leading apostrophe).
- Wrote `scripts/verify-dashboard-metrics.ts`: CSV escaping checks plus dashboard aggregation checked against a hand-built, known data set (not just "the query ran"). 12/12 passed; re-ran yesterday's script too as a regression check.

### What I learned

- A config file that eagerly validates a variable it doesn't actually need for every command can turn "optional value missing" into "install fails outright."
- Reproducing a deploy bug locally (clean clone, no env vars) is what makes a fix trustworthy instead of a guess.
- `.env` never leaves the machine — a hosting platform needs its own copies of every variable, added directly in its dashboard.
- "Active enrollments" (current headcount) and "enrollments this month" (a historical conversion count) are genuinely different metrics; conflating them makes one of the two wrong.
- A Route Handler is the right tool when the response is a real file with its own headers, not a page render or a Server Action result.
- CSV has its own injection class — formula injection — that doesn't exist anywhere else in this app's data flow.
- A verification check that confirms an exact hand-computed number catches bugs that "the query didn't error" never would.

## Day 18 — Automated Testing

### What I did

- Set up Vitest and wrote a real test suite: unit tests (CSV escaping, lead/batch status transition rules, Zod schemas — no database) and integration tests (`enrollLead`, `dropEnrollment`, `createLead`, `getDashboardData` — real Postgres, not mocked).
- Solved the same `"server-only"` import problem that blocked yesterday's scripts, properly this time: Vitest runs on Vite, and Vite's resolver can be told to prefer the package's `"react-server"` export condition, so tests import the real service files directly instead of duplicating their logic.
- Wrote test data factories (`createTestLead`, `createTestBatch`, etc.) tagged and swept the same way as the verify scripts, so tests are safe against the shared dev database.
- Hit a real connection-pool exhaustion bug from not disconnecting Prisma between test files (557s test run down to 15s once fixed) — a genuine production-relevant lesson, not a test-only one.
- Decided not to keep the suite in the repo for now. Reverted everything — test files, Vitest config, the two new devDependencies — back to yesterday's state.

### What I learned

- The test pyramid isn't abstract: unit tests are pure functions with no I/O (fast, no mocking needed); integration tests hit the real database because some things — like a partial unique index actually preventing a race condition — can't be verified against a fake one.
- Arrange-Act-Assert is just naming the three things every test already does: set up input, call the thing, check the result.
- A test failure taught a real lesson about my own test, not the code: asserting on raw CSV bytes instead of "the value a spreadsheet parses back out" was checking the wrong layer.
- Tests need cleanup discipline as much as application code does — an un-disconnected database connection pool degrades everything that runs after it, silently.
- Writing the tests was worth doing even though the files didn't stay — the value was in seeing exactly where each business rule lives and proving it, not necessarily in maintaining a permanent suite starting today.