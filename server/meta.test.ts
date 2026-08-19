import { describe, expect, it } from "vitest";
import { canAccessResource, decryptToken, encryptToken, normalizeMessagingLimit, normalizeQuality } from "./meta";

describe("Meta integration safeguards", () => {
  it("encrypts and decrypts access tokens without changing the value", () => {
    const token = "EAAG-sensitive-token-example";
    expect(decryptToken(encryptToken(token))).toBe(token);
  });

  it("normalizes Meta quality values and rejects unknown values", () => {
    expect(normalizeQuality("HIGH")).toBe("HIGH");
    expect(normalizeQuality("medium")).toBe("MEDIUM");
    expect(normalizeQuality("degraded")).toBe("UNKNOWN");
  });

  it("does not allow cross-user resource access", () => {
    expect(canAccessResource(7, 7)).toBe(true);
    expect(canAccessResource(7, 8)).toBe(false);
  });

  it("keeps the exact supported display tiers", () => {
    expect(normalizeMessagingLimit(1000)).toBe(1000);
    expect(normalizeMessagingLimit(10000)).toBe(10000);
    expect(normalizeMessagingLimit(100000)).toBe(100000);
    expect(normalizeMessagingLimit(5000)).toBeNull();
  });
});
