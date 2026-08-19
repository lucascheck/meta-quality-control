import { describe, expect, it, vi } from "vitest";
import { canAccessResource, decryptToken, encryptToken, listPhoneNumbers, normalizeDeliveryStatus, normalizeMessagingLimit, normalizePhoneNumber, normalizeQuality, parseDestinations } from "./meta";

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

  it("parses multiple recipients and normalizes delivery states", () => {
    expect(parseDestinations("5511999999999, 5511888888888\\n5511777777777")).toEqual(["5511999999999", "5511888888888", "5511777777777"]);
    expect(normalizeDeliveryStatus("delivered")).toBe("DELIVERED");
    expect(normalizeDeliveryStatus("unknown-state")).toBe("UNKNOWN");
  });

  it("does not request the unsupported messaging_limit field", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: [] }) });
    vi.stubGlobal("fetch", fetchMock);
    await listPhoneNumbers({ accessToken: "token", wabaId: "waba" });
    const requestedUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(requestedUrl).toContain("quality_rating");
    expect(requestedUrl).not.toContain("messaging_limit");
    vi.unstubAllGlobals();
  });

  it("maps a phone number without messaging_limit without failing", () => {
    expect(normalizePhoneNumber({ id: "phone-1", verified_name: "Operação", quality_rating: "HIGH" })).toMatchObject({ metaId: "phone-1", verifiedName: "Operação", qualityRating: "HIGH", messagingLimit: null });
  });

  it("keeps the exact supported display tiers", () => {
    expect(normalizeMessagingLimit(1000)).toBe(1000);
    expect(normalizeMessagingLimit(10000)).toBe(10000);
    expect(normalizeMessagingLimit(100000)).toBe(100000);
    expect(normalizeMessagingLimit(5000)).toBeNull();
  });
});
