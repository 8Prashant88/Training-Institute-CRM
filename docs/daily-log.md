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