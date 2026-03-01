import { User } from "@/domain/entities/User";

describe("User Entity", () => {
  it("should create a new User with generated ID", () => {
    const user = User.create({ username: "testuser" });
    expect(user.id).toBeDefined();
    expect(user.username).toBe("testuser");
  });

  it("should reconstitute a User with existing ID", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    const user = User.reconstitute({ username: "testuser" }, id);
    expect(user.id).toBe(id);
    expect(user.username).toBe("testuser");
  });

  it("should return true for equality when IDs match", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    const u1 = User.reconstitute({ username: "u1" }, id);
    const u2 = User.reconstitute({ username: "u2" }, id);
    expect(u1.equals(u2)).toBe(true);
  });

  it("should return false for equality when IDs do not match", () => {
    const u1 = User.create({ username: "u1" });
    const u2 = User.create({ username: "u2" });
    expect(u1.equals(u2)).toBe(false);
  });
});
