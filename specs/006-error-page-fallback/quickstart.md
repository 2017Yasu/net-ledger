# Quickstart: Global Error Page Fallback

## Setup & Testing

### How to Trigger the Error Page

To test the global error handling, you can use one of these methods:

1.  **Throw a Runtime Error in a Page Component**:
    Temporarily add `throw new Error("Test Error")` in any page component (e.g., `src/app/page.tsx`).
    - **Expected Result**: Redirect to `/error?code=500`.

2.  **Manually Navigate to the Error Route**:
    Go to `http://localhost:3000/error?code=403` in your browser.
    - **Expected Result**: Page displays "Forbidden" or "Access Denied" message.

3.  **API Error Isolation Check**:
    Trigger a 500 error in an API endpoint (e.g., `src/app/api/salary/route.ts`).
    - **Expected Result**: The API call returns JSON with a 500 status, and _no_ redirect to `/error` occurs.

## Key Files

- `src/app/error.tsx`: The primary error boundary for all page segments.
- `src/app/global-error.tsx`: Catch-all for root layout errors.
- `src/app/(pages)/error/page.tsx`: The actual error fallback page.
- `src/components/ErrorDisplay.tsx`: The UI component used in both `error.tsx` and the `/error` page.
