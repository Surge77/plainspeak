import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "../src/api";
import { App } from "../src/App";
import { makeExpert, makeExplanation, makePrompt } from "./fixtures";

vi.mock("../src/api");

type ObserverCallback = (entries: Array<{ isIntersecting: boolean; target: Element }>) => void;
const observers: Array<{ callback: ObserverCallback; target: Element | null }> = [];

class FakeIntersectionObserver {
  private entry: { callback: ObserverCallback; target: Element | null };
  constructor(callback: ObserverCallback) {
    this.entry = { callback, target: null };
    observers.push(this.entry);
  }
  observe(target: Element) {
    this.entry.target = target;
  }
  disconnect() {}
}

function reportVisibility(selector: string, isIntersecting: boolean) {
  act(() => {
    for (const observer of observers) {
      if (observer.target?.matches(selector)) observer.callback([{ isIntersecting, target: observer.target }]);
    }
  });
}

beforeEach(() => {
  observers.length = 0;
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
  Element.prototype.scrollIntoView = vi.fn();
  vi.mocked(api.fetchExpert).mockResolvedValue({ ok: true, data: { expert: makeExpert(), prompt: makePrompt() } });
  vi.mocked(api.fetchExplanation).mockResolvedValue({
    ok: true,
    data: { explanation: makeExplanation(), prompt: makePrompt() },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

async function explainBlackHoles() {
  const user = userEvent.setup();
  render(<App />);
  await user.type(screen.getByRole("textbox", { name: "Topic" }), "Black holes");
  await user.click(screen.getByRole("button", { name: "Explain it" }));
  await screen.findByText(makeExplanation().definition);
  return user;
}

describe("SiteHeader", () => {
  it("offers no new-topic button before anything has been explained", () => {
    render(<App />);

    expect(screen.queryByRole("button", { name: "New topic" })).not.toBeInTheDocument();
  });

  it("takes the reader back to the topic blank without clearing the explanation", async () => {
    const user = await explainBlackHoles();

    await user.click(screen.getByRole("button", { name: "New topic" }));

    expect(screen.getByRole("textbox", { name: "Topic" })).toHaveFocus();
    expect(screen.getByText(makeExplanation().definition)).toBeInTheDocument();
  });

  it("shows who is explaining once the big name tag scrolls away, and jumps back to it", async () => {
    const user = await explainBlackHoles();
    expect(screen.queryByRole("button", { name: /Back to the Astrophysicist/ })).not.toBeInTheDocument();

    reportVisibility("[data-name-tag]", false);
    const chip = screen.getByRole("button", { name: "Back to the Astrophysicist's explanation" });
    await user.click(chip);

    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it("marks the header once the page has scrolled", async () => {
    render(<App />);
    const header = screen.getByRole("banner");
    expect(header).not.toHaveAttribute("data-scrolled");

    reportVisibility("[data-scroll-sentinel]", false);

    expect(header).toHaveAttribute("data-scrolled");
  });
});
