import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "../src/api";
import { App } from "../src/App";
import { makeExpert, makeExplanation, makePrompt } from "./fixtures";

vi.mock("../src/api");

const fetchExpert = vi.mocked(api.fetchExpert);
const fetchExplanation = vi.mocked(api.fetchExplanation);

beforeEach(() => {
  vi.resetAllMocks();
  fetchExpert.mockResolvedValue({ ok: true, data: { expert: makeExpert(), prompt: makePrompt() } });
  fetchExplanation.mockResolvedValue({
    ok: true,
    data: { explanation: makeExplanation(), prompt: makePrompt("Task: Explain black holes") },
  });
});

async function explain(topic = "Black holes") {
  const user = userEvent.setup();
  render(<App />);
  await user.type(screen.getByRole("textbox", { name: "Topic" }), topic);
  await user.click(screen.getByRole("button", { name: "Explain it" }));
  return user;
}

describe("App", () => {
  it("finds an expert, then shows their explanation", async () => {
    await explain();

    expect(await screen.findByText("Astrophysicist")).toBeInTheDocument();
    expect(await screen.findByText(makeExplanation().definition)).toBeInTheDocument();
    expect(screen.getByText("Event horizon")).toBeInTheDocument();
  });

  it("sends the chosen level, language and length with the found expert", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole("textbox", { name: "Topic" }), "Recursion");
    await user.selectOptions(screen.getByRole("combobox", { name: "Who it is for" }), "kid");
    await user.selectOptions(screen.getByRole("combobox", { name: "Language" }), "Marathi");
    await user.selectOptions(screen.getByRole("combobox", { name: "Length" }), "deep");
    await user.click(screen.getByRole("button", { name: "Explain it" }));

    await screen.findByText(makeExplanation().summary);
    expect(fetchExpert).toHaveBeenCalledWith("Recursion");
    expect(fetchExplanation).toHaveBeenCalledWith({
      topic: "Recursion",
      expert_role: "Astrophysicist",
      level: "kid",
      language: "Marathi",
      length: "deep",
    });
  });

  it("explains what to do when the topic is not something it can explain", async () => {
    fetchExpert.mockResolvedValue({
      ok: true,
      data: { expert: makeExpert({ is_valid_topic: false }), prompt: makePrompt() },
    });

    await explain("asdfgh");

    expect(await screen.findByText(/doesn't look like a topic/)).toBeInTheDocument();
    expect(fetchExplanation).not.toHaveBeenCalled();
  });

  it("shows the server's message and retries without finding the expert again", async () => {
    fetchExplanation.mockResolvedValueOnce({ ok: false, message: "Gemini is unavailable right now." });

    const user = await explain();
    const errorHeading = await screen.findByRole("heading", { name: "Something went wrong" });
    expect(within(errorHeading.parentElement!).getByText("Gemini is unavailable right now.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText(makeExplanation().definition)).toBeInTheDocument();
    expect(fetchExpert).toHaveBeenCalledTimes(1);
    expect(fetchExplanation).toHaveBeenCalledTimes(2);
  });

  it("re-explains with a different expert the user types in", async () => {
    const user = await explain();
    await screen.findByText(makeExplanation().definition);

    await user.click(screen.getByRole("button", { name: "Ask a different expert" }));
    await user.type(screen.getByRole("textbox", { name: "Expert" }), "Science Teacher");
    await user.click(screen.getByRole("button", { name: "Ask them" }));

    expect(await screen.findByText("Science Teacher")).toBeInTheDocument();
    expect(fetchExplanation).toHaveBeenLastCalledWith(expect.objectContaining({ expert_role: "Science Teacher" }));
  });

  it("shows each prompt with the technique behind every part", async () => {
    const user = await explain();
    await screen.findByText(makeExplanation().definition);

    await user.click(screen.getByRole("button", { name: "See the prompt" }));

    expect(screen.getByText("Task: Explain black holes")).toBeInTheDocument();
    expect(screen.getAllByText("Role prompt").length).toBeGreaterThan(0);
    await user.click(screen.getByRole("tab", { name: "Finding the expert" }));
    expect(screen.getByText("Role: You are an experienced Astrophysicist.")).toBeInTheDocument();
  });

  it("announces the finished explanation and moves focus to it", async () => {
    await explain();
    await screen.findByText(makeExplanation().definition);

    expect(screen.getByRole("status")).toHaveTextContent("Explanation ready.");
    expect(screen.getByRole("heading", { name: "Black holes, explained by an Astrophysicist" })).toHaveFocus();
  });

  it("moves focus to the error so keyboard users are not lost", async () => {
    fetchExplanation.mockResolvedValueOnce({ ok: false, message: "Gemini is unavailable right now." });

    await explain();

    expect(await screen.findByRole("heading", { name: "Something went wrong" })).toHaveFocus();
  });

  it("fills and submits a suggested topic", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "photosynthesis" }));

    expect(fetchExpert).toHaveBeenCalledWith("photosynthesis");
  });
});
