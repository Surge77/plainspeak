import { afterEach, describe, expect, it, vi } from "vitest";

import { errorMessage, fetchExpert, NETWORK_ERROR, UNEXPECTED_REPLY } from "../src/api";
import { makeExpert, makePrompt } from "./fixtures";

function respondWith(status: number, body: unknown) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status })));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("errorMessage", () => {
  it("uses the server's message when it sends one", () => {
    expect(errorMessage(429, { detail: "Too many requests to Gemini." })).toBe("Too many requests to Gemini.");
  });

  it("turns a validation error into a readable sentence", () => {
    const payload = { detail: [{ loc: ["body", "topic"], msg: "Value error, must not contain < or >" }] };

    expect(errorMessage(422, payload)).toBe("Topic must not contain < or >.");
  });

  it("keeps a framework validation message readable", () => {
    const payload = { detail: [{ loc: ["body", "topic"], msg: "String should have at most 500 characters" }] };

    expect(errorMessage(422, payload)).toBe("Topic string should have at most 500 characters.");
  });

  it("falls back to a status-based message for unknown payloads", () => {
    expect(errorMessage(500, null)).toBe("The server had a problem (500). Try again.");
  });
});

describe("fetchExpert", () => {
  it("returns the parsed body on success", async () => {
    const body = { expert: makeExpert(), prompt: makePrompt() };
    respondWith(200, body);

    await expect(fetchExpert("Black holes")).resolves.toEqual({ ok: true, data: body });
  });

  it("returns the server's message on an HTTP error", async () => {
    respondWith(502, { detail: "Gemini is unavailable right now. Please try again." });

    await expect(fetchExpert("Black holes")).resolves.toEqual({
      ok: false,
      message: "Gemini is unavailable right now. Please try again.",
    });
  });

  it("treats a successful response without a JSON object as a failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>proxy page</html>", { status: 200 })));

    await expect(fetchExpert("Black holes")).resolves.toEqual({ ok: false, message: UNEXPECTED_REPLY });
  });

  it("explains how to recover when the server cannot be reached", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(fetchExpert("Black holes")).resolves.toEqual({ ok: false, message: NETWORK_ERROR });
  });
});
