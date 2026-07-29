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