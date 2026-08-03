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