# Data Model: JWT Authentication with Refresh Token

## Entity: `RefreshToken`

Represents a refresh token issued to a user for maintaining authenticated sessions. Stored in the database to enable server-side revocation and lifecycle management.

### Attributes:

- `id` (String - UUID): Primary key, unique identifier for the refresh token record.
- `token` (String - Hashed): The actual refresh token string, stored as a cryptographically secure hash. MUST NOT be stored in plain text.
- `userId` (String - Foreign Key): References the `User` entity to link the refresh token to a specific user.
- `expiresAt` (DateTime): The timestamp when this refresh token becomes invalid.
- `isRevoked` (Boolean): Flag indicating whether the token has been explicitly revoked by the user (e.g., logout from all devices) or by administrative action. Defaults to `false`.
- `createdAt` (DateTime): Timestamp when the refresh token record was created.
- `updatedAt` (DateTime): Timestamp when the refresh token record was last updated.

### Relationships:

- `User` (1:N) `RefreshToken`: A single user can have multiple active refresh tokens (e.g., for different devices or sessions).

### Validation Rules:

- `token`: Required, unique, non-empty. The hashed value must be stored.
- `userId`: Required, must correspond to an existing user in the system.
- `expiresAt`: Required, must be a future date/time upon creation.
- `isRevoked`: Default value is `false`. Can be updated to `true` upon logout or revocation.

### State Transitions:

- **Active**: `isRevoked = false`, `expiresAt` is in the future.
- **Expired**: `expiresAt` is in the past.
- **Revoked**: `isRevoked = true`.

## Entity: `User` (Implicitly existing)

While not part of this feature's direct creation, the `User` entity is a prerequisite and is assumed to have:

- `id` (String - UUID): Primary key, unique identifier for the user.
- Other standard user attributes (e.g., `email`, `passwordHash`, `name`).

### Relationships:

- `RefreshToken` (N:1) `User`: Each refresh token belongs to one user.
