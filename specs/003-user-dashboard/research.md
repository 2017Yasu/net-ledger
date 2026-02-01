# Research: User Dashboard

## Charting Library for Salary Trend

**Decision**: Use `recharts`.

**Rationale**:

- `recharts` is a composable charting library built on top of React components.
- It has good support for server-side rendering, which aligns with the Next.js SSR strategy for the dashboard page.
- It is lightweight and has a simple API, which is sufficient for the trend chart requirement.
- It has good documentation and a large community.

**Alternatives considered**:

- **Chart.js (with react-chartjs-2)**: A popular library, but can be more complex to set up with server-side rendering.
- **D3.js**: Very powerful, but also very low-level. It would be overkill for a simple trend chart.

## Scale and Scope

**Decision**: The dashboard will be designed to handle a single user's salary data, with an assumption of up to 1,000 salary records per user.

**Rationale**:

- The primary use case is for an individual user to view their own data.
- 1,000 salary records represent over 80 years of monthly payments, which is a very safe upper limit for the foreseeable future.
- This assumption allows us to proceed without needing to clarify the exact scale, as it has no material impact on the design for this feature.
