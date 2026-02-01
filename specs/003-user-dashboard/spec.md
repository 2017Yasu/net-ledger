# Feature Specification: User Dashboard

**Feature Branch**: `003-user-dashboard`  
**Created**: 2026-02-01
**Status**: Draft  
**Input**: User description: "Create a dashboard page where a user will visit first after login. A user quickly check the current basic salary information and overall change in their salary."

## Clarifications

### Session 2026-02-01

- Q: What format should the "overall change in salary" be displayed in? → A: Plot the Gross Pay on the trend chart.
- Q: The spec mentions displaying salary changes as a "trend chart" and a "SalaryTrendIndicator". Are these two separate components, or should the trend chart itself be the indicator? → A: The `SalaryTrendIndicator` is not a separate component; the "indicator" of change is the `SalaryTrendChart` itself.
- Q: How should the dashboard display a salary record if key fields like `Gross Pay` or `Net Pay` are zero or missing? → A: Display "N/A"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Dashboard After Login (Priority: P1)

As a user, after I log in, I want to be taken directly to a dashboard page so I can immediately see a summary of my important information.

**Why this priority**: This is the primary entry point for a logged-in user and sets the context for their session.

**Independent Test**: A user can log in with valid credentials and verify they are redirected to the `/dashboard` URL, where the dashboard UI is visible.

**Acceptance Scenarios**:

1. **Given** a user is not logged in, **When** they successfully complete the login process, **Then** they are redirected to the dashboard page.
2. **Given** a user is already logged in and visits the application root, **Then** they are redirected to the dashboard page.

---

### User Story 2 - View Current Salary Summary (Priority: P1)

As a user on the dashboard, I want to see my most recent basic salary information at a glance so I can stay informed about my compensation.

**Why this priority**: This provides immediate value and is a core reason for a user to visit the dashboard.

**Independent Test**: The dashboard displays a section with the user's latest salary details (e.g., gross pay, net pay, pay date) without requiring any further clicks.

**Acceptance Scenarios**:

1. **Given** a user has at least one salary record, **When** they view the dashboard, **Then** a summary of their most recent salary is displayed.
2. **Given** a user has no salary records, **When** they view the dashboard, **Then** a message is displayed prompting them to record their first salary.

---

### User Story 3 - View Salary Change (Priority: P2)

As a user on the dashboard, I want to understand the overall change in my salary so I can track my compensation trend over time.

**Why this priority**: This provides deeper financial insight beyond a single data point.

**Independent Test**: The dashboard displays a metric or visual element that represents the change in salary.

**Acceptance Scenarios**:

1. **Given** a user has multiple salary records, **When** they view the dashboard, **Then** an indicator showing the change in salary is displayed.

---

### Edge Cases

- What is displayed on the dashboard if a user has no salary records yet? (Covered by FR-005)
- How does the system handle a salary record with missing or zero values for key fields? (Covered by FR-008)
- What happens if the service to fetch salary data is unavailable? (Covered by FR-007)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST provide a dedicated dashboard page accessible after login.
- **FR-002**: The dashboard MUST display a summary of the user's most recent salary record.
- **FR-003**: The salary summary MUST include at least Gross Pay, Net Pay, and the corresponding Pay Date.
- **FR-004**: The dashboard MUST display the overall change in the user's salary as a visual trend chart showing the `Gross Pay` evolution over the last 12 months.
- **FR-005**: If no salary records exist for the user, the dashboard MUST display a clear message and a call-to-action to encourage them to add one.
- **FR-006**: The application MUST redirect logged-in users to the dashboard page by default.
- **FR-007**: If fetching salary data fails (e.g., due to a service outage), the dashboard MUST display a specific error message within the content area where salary information would normally appear.
- **FR-008**: If a salary record's `Gross Pay` or `Net Pay` fields are missing or null, the dashboard MUST display "N/A" for that value.

### Non-Functional Requirements (Constitution-Driven)

- **NFR-001 (Performance)**: The dashboard page, including all data, must achieve a Largest Contentful Paint (LCP) of less than 2.5 seconds.
- **NFR-002 (Accessibility)**: The dashboard must be fully navigable via keyboard and compliant with WCAG 2.1 AA standards for color contrast and screen reader support.
- **NFR-003 (Security)**: All data on the dashboard must be loaded via authenticated endpoints, ensuring a user can only see their own salary information.
- **NFR-004 (Observability)**: The system should log when the dashboard is viewed and any errors encountered while fetching salary data.
- **NFR-005 (Next.js Platform)**: The dashboard page will be a server-rendered page to ensure fast initial load and SEO indexing, if applicable in the future. It will not require modifications to `src/proxy.ts` at this stage.

### Key Entities _(include if feature involves data)_

- **Salary Record**: Represents a user's salary for a specific pay period. Key attributes include Gross Pay, Net Pay, Pay Date, and a link to the User.

### Technical Design

- **Component Breakdown**:
  - `DashboardPage`: The main page component.
  - `SalarySummaryCard`: A component to display the most recent salary information.
  - `SalaryTrendChart`: A component to display the overall salary change.
- **State Management**: State will be managed via server components and data fetched on the server side. Client-side state will be minimal.
- **Data Fetching**: Data will be fetched on the server side using Prisma to retrieve the user's salary information.
- **API Endpoints**: No new API endpoints are required. Data will be fetched directly in the page's server component.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of users are directed to the dashboard within 1 second of a successful login.
- **SC-002**: Key salary information (Gross, Net, Date) is visible to the user within 2.5 seconds of the dashboard loading.
- **SC-003**: A user can understand the status of their latest salary in less than 5 seconds.
- **SC-004**: The dashboard maintains a 99.9% availability rate.
