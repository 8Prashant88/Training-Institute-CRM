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