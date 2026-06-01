# Implementation Plan: NIST CSF 2.0 Maturity Assessment

## Overview

This plan implements a full-stack Next.js 14+ web application for conducting NIST CSF 2.0 maturity assessments. The implementation proceeds from project scaffolding and database setup through authentication, core CRUD, scoring logic, dashboard visualization, comparison features, and export capabilities. TypeScript is used throughout with Tailwind CSS for styling, Prisma for data access, and NextAuth.js for authentication.

## Tasks

- [x] 1. Project scaffolding and core configuration
  - [x] 1.1 Initialize Next.js 14+ project with TypeScript and Tailwind CSS
    - Run `npx create-next-app@latest` with App Router, TypeScript, Tailwind CSS, and ESLint enabled
    - Install dependencies: `prisma`, `@prisma/client`, `next-auth`, `@auth/prisma-adapter`, `bcryptjs`, `zod`, `recharts`, `jspdf`, `jspdf-autotable`, `exceljs`
    - Install dev dependencies: `@types/bcryptjs`, `vitest`, `@testing-library/react`, `fast-check`
    - Configure `tsconfig.json` path aliases (`@/` → `src/`)
    - _Requirements: 10.1, 10.2, 10.4_

  - [x] 1.2 Set up Prisma with PostgreSQL and define database schema
    - Run `npx prisma init` to create `prisma/schema.prisma`
    - Define all models: `User`, `NistFunction`, `NistCategory`, `NistSubcategory`, `Assessment`, `SubcategoryScore`
    - Add CHECK constraints for score values (1-5) via custom migration SQL
    - Add indexes and unique constraints as specified in design
    - Run `npx prisma migrate dev` to generate and apply initial migration
    - Create `src/lib/prisma.ts` singleton client
    - _Requirements: 9.1, 9.2, 2.1, 2.2, 2.3_

  - [x] 1.3 Create NIST CSF 2.0 seed data and seed script
    - Create `prisma/data/nist-csf-2.0.json` with all 6 functions, 22 categories, and 106 subcategories including descriptions, implementation examples, and informative references
    - Create `prisma/seed.ts` using upsert pattern for idempotent seeding
    - Configure `package.json` prisma seed command
    - Run seed to populate reference data
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

- [x] 2. Authentication system
  - [x] 2.1 Configure NextAuth.js with credentials provider
    - Create `src/lib/auth.ts` with NextAuth configuration using JWT strategy
    - Implement `authorize` callback with bcrypt password verification
    - Configure session and JWT callbacks to include user ID
    - Set custom sign-in page to `/login`
    - _Requirements: 1.2, 1.3, 1.4_

  - [x] 2.2 Implement registration Server Action and page
    - Create `src/actions/auth.ts` with `register` Server Action
    - Implement email validation, password hashing with bcrypt, and User creation
    - Create `src/app/(auth)/register/page.tsx` with registration form
    - Add client-side and server-side validation with Zod
    - _Requirements: 1.1_

  - [x] 2.3 Implement login page and logout functionality
    - Create `src/app/(auth)/login/page.tsx` with login form
    - Integrate with NextAuth `signIn` function
    - Display generic error message on authentication failure (no credential enumeration)
    - Implement logout via `signOut()` with redirect to login page
    - _Requirements: 1.2, 1.3, 1.4, 1.6_

  - [x] 2.4 Implement route protection middleware
    - Create `src/middleware.ts` that checks auth session on protected routes
    - Configure matcher for `/dashboard/*`, `/assessments/*`, `/compare/*`, `/api/export/*`
    - Redirect unauthenticated requests to `/login`
    - _Requirements: 1.5_

  - [ ]* 2.5 Write property tests for authentication
    - **Property 1: Generic authentication error message** — For any invalid credential combination, the system returns an identical generic error message
    - **Property 2: Unauthenticated route protection** — For any protected route, unauthenticated requests redirect to login
    - **Validates: Requirements 1.4, 1.5**

- [x] 3. Checkpoint - Ensure authentication works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Assessment CRUD operations
  - [x] 4.1 Implement assessment Server Actions
    - Create `src/actions/assessment.ts` with `createAssessment`, `getAssessments`, `getAssessmentDetail`, `deleteAssessment` Server Actions
    - Implement `assertOwnership` helper for authorization checks
    - Ensure all actions verify authenticated session and ownership
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 4.2 Implement assessment list page
    - Create `src/app/(protected)/assessments/page.tsx` as Server Component
    - Display assessments ordered by creation date descending
    - Include assessment name, creation date, and delete action
    - Add "New Assessment" button linking to creation page
    - _Requirements: 3.3, 3.5_

  - [x] 4.3 Implement assessment creation page
    - Create `src/app/(protected)/assessments/new/page.tsx`
    - Form with assessment name input and Zod validation
    - On submit, call `createAssessment` and redirect to assessment detail
    - _Requirements: 3.1, 3.2_

  - [ ]* 4.4 Write property tests for assessment ownership
    - **Property 3: Assessment ownership isolation** — For any two distinct users, one cannot access or modify the other's assessments
    - **Property 4: Assessment list ordering** — Assessments are always returned sorted by creation date descending
    - **Validates: Requirements 3.6, 3.3**

- [x] 5. Scoring workflow
  - [x] 5.1 Implement score update Server Action
    - Create `updateScore` Server Action in `src/actions/assessment.ts`
    - Validate input with Zod `scoreSchema` (integers 1-5, optional comment max 2000 chars)
    - Upsert `SubcategoryScore` record with ownership verification
    - Use `revalidatePath` to refresh affected pages
    - _Requirements: 4.5, 9.2, 9.3, 9.4_

  - [x] 5.2 Implement scoring page with function navigation
    - Create `src/app/(protected)/assessments/[id]/page.tsx` as assessment detail
    - Create `src/app/(protected)/assessments/[id]/score/[functionId]/page.tsx` for per-function scoring
    - Implement `FunctionNav` component for navigating between functions
    - Implement `CategoryAccordion` component for expanding/collapsing categories
    - _Requirements: 4.6, 2.4, 10.2_

  - [x] 5.3 Implement subcategory scoring components
    - Create `SubcategoryScoreCard` client component with description, examples, and references display
    - Create `MaturityLevelSelector` component with levels 1-5 and labels (Performed, Managed, Defined, Quantitatively Managed, Optimizing)
    - Create `CommentField` component with character limit
    - Implement optimistic updates on score change with Server Action persistence
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.7_

  - [x] 5.4 Implement progress indicator
    - Create `ProgressIndicator` component showing scored/total subcategories
    - Calculate percentage based on subcategories with non-null currentScore or targetScore
    - Display on assessment detail and scoring pages
    - _Requirements: 10.3_

  - [ ]* 5.5 Write property tests for score validation and persistence
    - **Property 5: Score persistence round-trip** — Persisting a valid score and reading it back returns identical values
    - **Property 9: Score validation bounds** — Score validation accepts integers 1-5 inclusive and rejects all others
    - **Validates: Requirements 3.4, 4.5, 9.2**

- [x] 6. Score calculation service
  - [x] 6.1 Implement scoring calculation functions
    - Create `src/lib/scoring.ts` with `calculateAverage`, `calculateGap`, `calculateCategoryRollup`, `calculateFunctionRollup`, `calculateOverallRollup`, `calculateProgress`, `getGapColor`
    - All functions handle null values correctly (ignore nulls in averages, return null gap if either score is null)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [x] 6.2 Implement score validation schema
    - Create `src/lib/validation.ts` with Zod `scoreSchema`
    - Enforce integer constraint, min 1, max 5, nullable/optional
    - Add comment length validation (max 2000 characters)
    - _Requirements: 9.2_

  - [ ]* 6.3 Write property tests for score calculation
    - **Property 6: Hierarchical score rollup** — Category averages equal arithmetic mean of subcategory scores ignoring nulls; function averages equal mean of category rollups; overall equals mean of function rollups
    - **Property 7: Gap calculation** — Gap equals target minus current when both are non-null, null otherwise
    - **Property 8: Gap color mapping** — Green for 0, yellow for 1, orange for 2, red for ≥3
    - **Property 10: Progress calculation** — Progress equals (scored count / 106) × 100
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.6, 10.3**

- [x] 7. Checkpoint - Ensure scoring and calculation logic works correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Dashboard visualization
  - [x] 8.1 Implement dashboard data fetching and layout
    - Create `src/app/(protected)/assessments/[id]/dashboard/page.tsx`
    - Fetch all `SubcategoryScore` records for the assessment in a single query
    - Compute all rollups using scoring service functions
    - Create dashboard layout with grid for charts and tables
    - _Requirements: 6.1, 5.8, 10.1_

  - [x] 8.2 Implement radar chart and overall score card
    - Create `OverallScoreCard` component displaying current and target numeric scores
    - Create `RadarChart` component using Recharts showing current vs target across 6 functions
    - _Requirements: 6.1, 6.2_

  - [x] 8.3 Implement function summary table and category bar charts
    - Create `FunctionSummaryTable` component with current, target, and gap columns
    - Create `CategoryDetailTable` component for selected function's categories
    - Create `FunctionBarChart` component using Recharts for category-level comparison
    - Apply gap color coding (green/yellow/orange/red) to table cells
    - _Requirements: 6.3, 6.4, 6.5, 6.6, 6.7_

  - [x] 8.4 Implement loading states and navigation
    - Add loading indicators for dashboard data fetching
    - Implement function selection to drill into category/subcategory detail
    - Ensure dashboard updates reflect latest scores without full page reload
    - _Requirements: 6.7, 6.8, 10.2, 10.5_

- [ ] 9. Assessment comparison
  - [x] 9.1 Implement comparison page and data fetching
    - Create `src/app/(protected)/compare/page.tsx`
    - Create `AssessmentSelector` component for choosing 2+ assessments
    - Implement comparison API route `src/app/api/assessments/compare/route.ts`
    - Fetch and compute function-level rollups for each selected assessment
    - _Requirements: 7.1, 7.4_

  - [x] 9.2 Implement comparison visualizations
    - Create `ComparisonBarChart` using Recharts showing function scores side-by-side
    - Create `ComparisonTable` showing score changes between assessments at function level
    - Label each assessment by name and creation date
    - _Requirements: 7.2, 7.3, 7.4_

  - [ ]* 9.3 Write property test for comparison score change
    - **Property 11: Assessment comparison score change** — Score change at function level equals later assessment's score minus earlier assessment's score
    - **Validates: Requirements 7.3**

- [ ] 10. Export capabilities
  - [x] 10.1 Implement PDF export
    - Create `src/lib/export/pdf.ts` with `generatePdfReport` function
    - Include header with assessment name, user name, and export date
    - Generate function summary table, category detail tables, and gap color indicators
    - Create API route `src/app/api/export/pdf/[assessmentId]/route.ts` with auth and ownership checks
    - _Requirements: 8.1, 8.3, 8.4_

  - [x] 10.2 Implement Excel export
    - Create `src/lib/export/excel.ts` with `generateExcelReport` function
    - Create worksheets: Function Summary, Category Summary, Subcategory Detail
    - Include scores, comments, rollups, and metadata in each worksheet
    - Create API route `src/app/api/export/excel/[assessmentId]/route.ts` with auth and ownership checks
    - _Requirements: 8.2, 8.3, 8.4, 8.5_

  - [x] 10.3 Implement export UI components
    - Create `ExportMenu` component with PDF and Excel download buttons
    - Add export menu to assessment dashboard page
    - Handle loading states and error feedback during export generation
    - _Requirements: 8.3_

- [ ] 11. Protected layout and global error handling
  - [x] 11.1 Implement protected layout and navigation
    - Create `src/app/(protected)/layout.tsx` with authenticated layout shell
    - Add navigation sidebar/header with links to Dashboard, Assessments, Compare
    - Include user info display and logout button
    - _Requirements: 10.2, 1.6_

  - [x] 11.2 Implement error boundaries and loading states
    - Create global error boundary component with recovery UI
    - Add loading.tsx files for route segments
    - Implement toast notification system for Server Action feedback
    - Handle failed score saves with retry capability (retain unsaved data in state)
    - _Requirements: 9.3, 10.5_

- [ ] 12. Checkpoint - Full integration verification
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Recommendation engine and data model
  - [x] 15.1 Add ControlRecommendation model and migration
    - Add enums (`ControlCategory`, `PriorityLevel`, `EffortLevel`, `RoadmapPhase`) to Prisma schema
    - Add `ControlRecommendation` model with all fields (`id`, `assessmentId`, `subcategoryId`, `category`, `description`, `priorityScore`, `priorityLevel`, `effortLevel`, `roadmapPhase`, `dependsOnId`, `createdAt`) and relations
    - Update `Assessment` and `NistSubcategory` models with new `recommendations` relations
    - Run `npx prisma migrate dev` to apply migration
    - Install `@dnd-kit/core` and `@dnd-kit/sortable` for roadmap drag-and-drop
    - _Requirements: 11.1, 11.2, 11.3, 12.1, 14.7_

  - [x] 15.2 Implement recommendation templates and engine
    - Create `src/lib/recommendations/templates.ts` with `RecommendationTemplate` interface and `RECOMMENDATION_TEMPLATES` array mapped to subcategory patterns
    - Create `src/lib/recommendations/engine.ts` with `generateRecommendationsForGaps` function
    - Classify recommendations into People/Tools/Process/Partners based on subcategory context
    - Generate descriptions using template placeholders (`{subcategoryName}`, `{functionName}`)
    - _Requirements: 11.1, 11.2, 11.6_

  - [x] 15.3 Implement prioritization algorithm
    - Create `src/lib/recommendations/prioritization.ts`
    - Implement `calculatePriorityScore` with formula: `(gap * 0.5) + (criticality * 0.3) + (risk_reduction / effort * 0.2)`
    - Implement `mapScoreToPriorityLevel` (CRITICAL >= 4.0, HIGH >= 3.0, MEDIUM >= 2.0, LOW < 2.0)
    - Implement `assignRoadmapPhase` based on priority level + effort level matrix
    - Define `FUNCTION_CRITICALITY_WEIGHTS` record (GV=1.0, ID=0.9, PR=0.9, DE=0.8, RS=0.8, RC=0.7)
    - _Requirements: 12.1, 12.4, 12.5, 12.6, 14.2_

  - [x] 15.4 Implement recommendation Server Actions
    - Create `src/actions/recommendations.ts` with `generateRecommendations`, `updateRecommendationPhase`, `getRecommendations` Server Actions
    - Include ownership verification via `assertOwnership` in all actions
    - Use database transaction for delete-and-recreate pattern in `generateRecommendations`
    - _Requirements: 11.1, 11.5, 14.4, 14.7_

  - [ ]* 15.5 Write property tests for recommendations
    - **Property 12: Recommendation coverage** — Recommendations exist if and only if gap > 0 for a subcategory
    - **Property 13: Priority ordering** — Recommendations sorted by priority score descending with gap as tiebreaker
    - **Property 14: Roadmap phase assignment** — Higher priority + lower effort maps to earlier phases
    - **Validates: Requirements 11.1, 11.5, 12.2, 12.3, 14.2, 14.3**

- [ ] 16. Recommendations page
  - [x] 16.1 Implement recommendations list page
    - Create `src/app/(protected)/assessments/[id]/recommendations/page.tsx`
    - Display recommendations grouped by `ControlCategory` (People, Tools, Process, Partners)
    - Show subcategory ID, gap size, priority level, and description for each recommendation
    - Add "Generate Recommendations" button that triggers `generateRecommendations` action
    - _Requirements: 11.4, 11.6, 12.7_

- [ ] 17. Heatmap visualization
  - [x] 17.1 Implement heatmap data computation
    - Create `src/lib/heatmap.ts` with `getHeatmapColor` utility and `computeHeatmapCells` function
    - Compute cells for all functions/categories with current score, target score, and gap
    - _Requirements: 13.1, 13.2, 13.4_

  - [x] 17.2 Implement heatmap page and grid component
    - Create `src/components/heatmap/HeatmapGrid.tsx` as client component with SVG grid rendering
    - Create `src/app/(protected)/assessments/[id]/heatmap/page.tsx`
    - Render SVG grid with rows = Functions + Categories, color-coded by gap severity
    - Implement hover tooltip showing Current_Score, Target_Score, Gap
    - Add legend component showing color scale (green → yellow → orange → red)
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [ ] 18. Roadmap visualization
  - [x] 18.1 Implement roadmap timeline component
    - Create `src/components/roadmap/RoadmapTimeline.tsx` with 4 phase columns (Quick Wins, Short-term, Medium-term, Long-term)
    - Create `src/components/roadmap/DraggableCard.tsx` using `@dnd-kit/sortable`
    - Create `src/components/roadmap/PhaseDropZone.tsx` for drop targets
    - Create `src/components/roadmap/DependencyArrows.tsx` for SVG dependency arrows between cards
    - _Requirements: 14.1, 14.3, 14.6_

  - [x] 18.2 Implement roadmap page with drag-and-drop
    - Create `src/app/(protected)/assessments/[id]/roadmap/page.tsx`
    - Integrate DnD context from `@dnd-kit/core` for phase reassignment
    - Call `updateRecommendationPhase` Server Action on drop
    - Display phase headers with time range labels (0-3mo, 3-6mo, 6-12mo, 12+mo)
    - _Requirements: 14.1, 14.4, 14.6, 14.7_

  - [x] 18.3 Implement roadmap export
    - Create `src/lib/export/roadmap-pdf.ts` with `generateRoadmapPdf` function
    - Create API route `src/app/api/export/roadmap/[assessmentId]/route.ts` with auth and ownership checks
    - Include phase layout, recommendation cards, dependency indicators, and summary stats in export
    - _Requirements: 14.5_

- [ ] 19. Navigation updates
  - [x] 19.1 Update assessment navigation to include new pages
    - Add Recommendations, Heatmap, and Roadmap links to assessment detail navigation
    - Update protected layout navigation if needed
    - _Requirements: 10.2_

- [ ] 20. Checkpoint - Ensure recommendation, heatmap, and roadmap features work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 21. Role-Based Access Control and data model updates
  - [x] 21.1 Update User model and add RBAC enums and migrations
    - Add `UserRole` enum (SUPER_ADMIN, ADMIN, END_USER) to Prisma schema
    - Add `ThemeMode` enum (DAY, NIGHT) to Prisma schema
    - Add `TaskStatus` enum (PENDING, IN_PROGRESS, COMPLETED) to Prisma schema
    - Add `NotificationType` enum (TASK_ASSIGNED, ASSESSMENT_SUBMITTED) to Prisma schema
    - Update `User` model with `role`, `officeId`, `isActive`, `themeMode` fields
    - Add `Office` model with `id`, `name`, `description`, `createdAt`, `updatedAt`, and `users`/`assessments` relations
    - Add `TaskAssignment` model with `id`, `assessmentId`, `assignedToId`, `assignedById`, `deadline`, `instructions`, `status`, timestamps, and relations
    - Add `Notification` model with `id`, `userId`, `type`, `title`, `message`, `isRead`, `referenceId`, `createdAt`, and user relation
    - Update `Assessment` model with `officeId` field and `taskAssignments` relation
    - Run `npx prisma migrate dev` to apply migration
    - _Requirements: 15.1, 16.1, 16.5, 16.6, 18.1, 19.7, 20.5_

  - [x] 21.2 Implement authorization helpers
    - Create `src/lib/authorization.ts` with `assertRole(session, allowedRoles[])` function
    - Implement `assertOfficeAccess(userId, officeId)` function that grants Super_Admin global access and restricts Admin to their assigned office
    - Block deactivated users from accessing any protected resource
    - _Requirements: 15.2, 15.7, 15.8, 15.9, 16.7_

  - [x] 21.3 Update NextAuth.js session to include role and office
    - Update JWT callback to fetch and include `role`, `officeId`, `themeMode`, `isActive` from database
    - Update session callback to expose `role`, `officeId`, `themeMode` on `session.user`
    - Create `src/types/next-auth.d.ts` with extended Session and JWT type declarations
    - Block login for deactivated users (return null from authorize if `isActive === false`)
    - _Requirements: 15.1, 15.8, 20.6_

  - [x] 21.4 Update middleware for role-based route protection
    - Update `src/middleware.ts` matcher to include `/admin/*`, `/super-admin/*`, `/tasks/*`, `/notifications/*`
    - Redirect unauthenticated requests to `/login` for all protected routes
    - _Requirements: 15.8, 1.5_

  - [x] 21.5 Seed initial Super Admin user
    - Update `prisma/seed.ts` to create a default Super_Admin user (email: `admin@system.local`, hashed password)
    - Ensure seed is idempotent (upsert pattern)
    - _Requirements: 15.2_

  - [ ]* 21.6 Write property tests for RBAC
    - **Property 15: Role permission enforcement** — End_Users cannot access Admin/Super_Admin features; Admins cannot access Super_Admin features
    - **Property 16: Office scope isolation** — Admins can only access users and assessments within their assigned office
    - **Validates: Requirements 15.2, 15.7, 15.8, 15.9, 16.7, 17.9**

- [ ] 22. Office management
  - [x] 22.1 Implement office Server Actions
    - Create `src/actions/offices.ts` with `createOffice`, `updateOffice`, `deleteOffice`, `getOffices`, `assignAdminToOffice` Server Actions
    - All actions require Super_Admin role via `assertRole`
    - Include Zod validation for office name (required, max 100 chars) and description (optional, max 500 chars)
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.8_

  - [x] 22.2 Implement Super Admin office management page
    - Create `src/app/(protected)/super-admin/layout.tsx` with Super_Admin role guard
    - Create `src/app/(protected)/super-admin/offices/page.tsx` with office list table
    - Display office name, description, assigned Admin count, End_User count
    - Add create/edit/delete office forms with modal dialogs
    - Add Admin assignment UI (select Admin users to assign to office)
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.8_

- [ ] 23. User management
  - [x] 23.1 Implement user management Server Actions
    - Create `src/actions/users.ts` with `createUser`, `updateUser`, `deactivateUser`, `getOfficeUsers`, `getAllUsers` Server Actions
    - Super_Admin can create/edit/deactivate any user and assign any role
    - Admin can create/edit/deactivate End_Users only within their assigned office
    - End_Users cannot manage any users
    - Hash passwords with bcrypt on user creation
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8, 17.9_

  - [x] 23.2 Implement Super Admin user management page
    - Create `src/app/(protected)/super-admin/users/page.tsx` with all-users table
    - Display name, email, role, office, active status
    - Add create user form (select role, assign to office)
    - Add edit and deactivate actions
    - _Requirements: 17.1, 17.2, 17.3_

  - [x] 23.3 Implement Admin user management page
    - Create `src/app/(protected)/admin/layout.tsx` with Admin role guard
    - Create `src/app/(protected)/admin/users/page.tsx` showing End_Users in Admin's office only
    - Add create End_User form (auto-assigns to Admin's office)
    - Add edit and deactivate actions for End_Users
    - _Requirements: 17.4, 17.5, 17.6, 17.7_

- [ ] 24. Task assignment
  - [x] 24.1 Implement task assignment Server Actions
    - Create `src/actions/tasks.ts` with `createTaskAssignment`, `getMyTasks`, `submitAssessment`, `getOfficeSubmissions` Server Actions
    - `createTaskAssignment` requires Admin role and verifies target End_User is in Admin's office
    - `getMyTasks` returns tasks assigned to the current End_User
    - `submitAssessment` marks task as COMPLETED and links the assessment
    - `getOfficeSubmissions` returns completed assessments for Admin's office
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7_

  - [x] 24.2 Implement Admin task assignment page
    - Create `src/app/(protected)/admin/tasks/page.tsx` with task list and creation form
    - Form includes: select End_User (from office), set deadline (date picker), add instructions (textarea)
    - Display existing tasks with status, assigned user, deadline
    - Show submitted assessments with link to view results
    - _Requirements: 18.1, 18.5, 18.6_

  - [x] 24.3 Implement End User tasks page
    - Create `src/app/(protected)/tasks/page.tsx` showing assigned tasks
    - Display task status, deadline, instructions, and assigned-by name
    - Add "Start Assessment" button that creates an assessment and links it to the task
    - Add "Submit" button that calls `submitAssessment` when assessment is complete
    - _Requirements: 18.2, 18.3, 18.4, 18.5, 18.7_

- [ ] 25. Notifications
  - [x] 25.1 Implement notification Server Actions
    - Create `src/actions/notifications.ts` with `createNotification`, `getNotifications`, `markNotificationRead`, `getUnreadCount` Server Actions
    - `createNotification` is called internally by task assignment and assessment submission flows
    - All read actions verify the notification belongs to the current user
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.6, 19.7_

  - [x] 25.2 Implement notification bell component
    - Create `src/components/notifications/NotificationBell.tsx` as client component
    - Poll `getUnreadCount` every 30 seconds to update badge
    - Display bell icon with unread count badge (red circle)
    - On click, show dropdown with recent notifications (title, message, time)
    - Click on notification marks it as read
    - Add to protected layout header (visible on all pages)
    - _Requirements: 19.4, 19.5, 19.6_

  - [x] 25.3 Implement notifications list page
    - Create `src/app/(protected)/notifications/page.tsx` with full notification history
    - Display all notifications ordered by creation time descending
    - Show read/unread status with visual indicator
    - Allow marking individual notifications as read
    - _Requirements: 19.3, 19.4, 19.6_

  - [x] 25.4 Integrate notifications into task and submission flows
    - Update `createTaskAssignment` to call `createNotification` for the assigned End_User (type: TASK_ASSIGNED)
    - Update `submitAssessment` to call `createNotification` for the assigning Admin (type: ASSESSMENT_SUBMITTED)
    - _Requirements: 19.1, 19.2_

  - [ ]* 25.5 Write property test for notification delivery
    - **Property 17: Notification delivery** — For any task assignment, exactly one notification is created for the End_User; for any assessment submission, exactly one notification is created for the Admin
    - **Validates: Requirements 19.1, 19.2**

- [ ] 26. Day/Night theme system
  - [x] 26.1 Implement theme CSS variables and Tailwind integration
    - Add CSS variables to `src/app/globals.css` for Day theme (cream background `#FFFDF7`, dark text `#1a1a1a`) and Night theme (grey background `#2d2d2d`, light text `#e5e5e5`)
    - Extend `tailwind.config.ts` to map CSS variables to Tailwind color utilities (bg-primary, text-primary, etc.)
    - Apply `data-theme` attribute to `<html>` element for theme switching
    - _Requirements: 20.1, 20.2, 20.4_

  - [x] 26.2 Implement ThemeProvider and toggle component
    - Create `src/components/theme/ThemeProvider.tsx` with React context providing `theme` state and `toggleTheme` function
    - Create `src/components/theme/ThemeToggle.tsx` with sun/moon icon button
    - Create `src/actions/theme.ts` with `updateThemePreference` Server Action
    - Load initial theme from user's `themeMode` database field on session init
    - Persist theme changes to database via Server Action
    - _Requirements: 20.3, 20.4, 20.5, 20.6, 20.7_

  - [x] 26.3 Integrate theme into protected layout
    - Wrap protected layout with `ThemeProvider`, passing `initialTheme` from user's database preference
    - Add `ThemeToggle` component to the header/navigation bar (visible on all pages)
    - Ensure all existing components use theme-aware CSS variables (bg-primary, text-primary, card-bg, border-color)
    - _Requirements: 20.3, 20.4, 20.6, 20.7_

  - [ ]* 26.4 Write property test for theme persistence
    - **Property 18: Theme preference persistence round-trip** — Saving a theme preference and reloading returns the same value
    - **Validates: Requirements 20.5, 20.6**

- [ ] 27. Update navigation for all roles
  - [x] 27.1 Implement role-aware navigation
    - Update protected layout sidebar/header to show different navigation items based on user role:
      - Super_Admin: Offices, Users, Assessments, Compare, Notifications
      - Admin: My Office Users, Tasks, Assessments, Compare, Notifications
      - End_User: My Tasks, Notifications
    - Add notification bell and theme toggle to header for all roles
    - Ensure navigation links are hidden (not just disabled) for unauthorized roles
    - _Requirements: 15.2, 15.3, 15.7, 10.2_

- [x] 28. Checkpoint - Ensure RBAC, offices, tasks, notifications, and theme work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 13. Integration and E2E tests
  - [ ]* 13.1 Write integration tests for authentication flow
    - Test registration creates user with hashed password
    - Test login with valid credentials returns session
    - Test login with invalid credentials returns generic error
    - Test protected routes redirect unauthenticated users
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 13.2 Write integration tests for assessment CRUD
    - Test assessment creation, listing, loading, and deletion
    - Test ownership enforcement across users
    - Test score persistence and retrieval
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 13.3 Write integration tests for export generation
    - Test PDF export produces valid PDF buffer with expected content
    - Test Excel export produces valid workbook with correct worksheets
    - Test export includes metadata (name, user, date)
    - _Requirements: 8.1, 8.2, 8.4, 8.5_

  - [ ]* 13.4 Write E2E test for full scoring workflow
    - Test creating assessment, scoring subcategories, viewing dashboard with calculated rollups
    - Test comparison flow with multiple assessments
    - _Requirements: 4.5, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 7.1, 7.2_

- [ ] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The scoring service uses on-read calculation (not materialized) since max dataset is 106 scores per assessment
- NIST CSF 2.0 seed data must be sourced from the official NIST publication for accuracy
- All Server Actions and API routes must verify authentication and resource ownership

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3", "2.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4"] },
    { "id": 4, "tasks": ["2.5", "4.1", "6.1", "6.2"] },
    { "id": 5, "tasks": ["4.2", "4.3", "4.4", "5.1", "6.3"] },
    { "id": 6, "tasks": ["5.2", "5.3", "5.4", "11.1"] },
    { "id": 7, "tasks": ["5.5", "8.1", "11.2"] },
    { "id": 8, "tasks": ["8.2", "8.3", "8.4"] },
    { "id": 9, "tasks": ["9.1", "10.1", "10.2"] },
    { "id": 10, "tasks": ["9.2", "9.3", "10.3"] },
    { "id": 11, "tasks": ["15.1"] },
    { "id": 12, "tasks": ["15.2", "15.3"] },
    { "id": 13, "tasks": ["15.4", "17.1"] },
    { "id": 14, "tasks": ["15.5", "16.1", "17.2", "18.1"] },
    { "id": 15, "tasks": ["18.2", "18.3", "19.1"] },
    { "id": 16, "tasks": ["21.1"] },
    { "id": 17, "tasks": ["21.2", "21.3", "21.4", "21.5"] },
    { "id": 18, "tasks": ["21.6", "22.1", "26.1"] },
    { "id": 19, "tasks": ["22.2", "23.1", "26.2"] },
    { "id": 20, "tasks": ["23.2", "23.3", "24.1", "26.3"] },
    { "id": 21, "tasks": ["24.2", "24.3", "25.1"] },
    { "id": 22, "tasks": ["25.2", "25.3", "25.4"] },
    { "id": 23, "tasks": ["25.5", "26.4", "27.1"] },
    { "id": 24, "tasks": ["13.1", "13.2", "13.3", "13.4"] }
  ]
}
```
