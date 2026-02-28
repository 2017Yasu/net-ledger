# Quickstart: Post-Login Dashboard Redirection

This document outlines the steps to quickly set up and verify the "Post-Login Dashboard Redirection" feature.

## Prerequisites

- The `net-ledger` application must be running.
- A user account must exist in the system (you can register a new one via `/register`).

## Verification Steps

1.  **Access the Login Page**: Open your browser and navigate to the `/login` page of the running application.
2.  **Enter Valid Credentials**: Input the username and password for an existing user account.
3.  **Submit Login Form**: Click the "Login" button or press Enter.
4.  **Verify Redirection**: Observe that upon successful login, the browser automatically redirects you to the `/dashboard` page.
5.  **Attempt to Access Login/Register Pages (as authenticated user)**: While logged in, try to navigate directly to `/login` or `/register` in the browser's address bar.
6.  **Verify Further Redirection**: Confirm that attempting to access these pages as an authenticated user results in an automatic redirection back to the `/dashboard` page.

## Expected Outcome

- Successful login always leads to the `/dashboard` page.
- Authenticated users cannot access `/login` or `/register` and are instead sent to `/dashboard`.
