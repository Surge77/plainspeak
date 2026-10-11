import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NameTag } from "../src/components/NameTag";
import { PromptPanel } from "../src/components/PromptPanel";
import { ResultActions } from "../src/components/ResultActions";
import { ThemeToggle } from "../src/components/ThemeToggle";
import { TopicSentence } from "../src/components/TopicSentence";
import { makeExpert, makeExplanation, makePrompt } from "./fixtures";

afterEach(() => {
  vi.restoreAllMocks();
  delete document.documentElement.dataset.theme;
});

function renderActions(topic = "Black holes") {
  render(
    <ResultActions
      topic={topic}
      expert={makeExpert()}
      explanation={makeExplanation()}
      isPromptOpen={false}
      onTogglePrompt={() => {}}
    />,
  );
}

describe("ResultActions", () => {
  it("copies the explanation as markdown and confirms it", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    renderActions();

    await user.click(screen.getByRole("button", { name: "Copy" }));

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("# Black holes"));
    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
  });

  it("says so when the clipboard refuses", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"));
    renderActions();

    await user.click(screen.getByRole("button", { name: "Copy" }));

    expect(await screen.findByRole("button", { name: "Couldn't copy" })).toBeInTheDocument();
  });

  it("downloads a markdown file named after the topic", async () => {
    const user = userEvent.setup();
    URL.createObjectURL = vi.fn(() => "blob:explanation");
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    renderActions("SQL Joins & Keys!");

    await user.click(screen.getByRole("button", { name: "Download .md" }));

    const link = click.mock.contexts[0] as HTMLAnchorElement;
    expect(link.download).toBe("sql-joins-keys.md");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:explanation");
  });
});

describe("ThemeToggle", () => {
  it("switches theme and remembers the choice", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: "Switch to dark theme" }));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("plainspeak-theme")).toBe("dark");
    expect(screen.getByRole("button", { name: "Switch to light theme" })).toBeInTheDocument();
  });

  it("still switches when storage is blocked", async () => {
    const user = userEvent.setup();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: "Switch to dark theme" }));

    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});

describe("PromptPanel", () => {
  it("moves between tabs with the arrow keys and keeps one tab in the tab order", async () => {
    const user = userEvent.setup();
    render(<PromptPanel rolePrompt={makePrompt("Role step")} explainPrompt={makePrompt("Explain step")} />);
    const explainTab = screen.getByRole("tab", { name: "Writing the explanation" });
    const roleTab = screen.getByRole("tab", { name: "Finding the expert" });
    expect(explainTab).toHaveAttribute("tabindex", "0");
    expect(roleTab).toHaveAttribute("tabindex", "-1");

    explainTab.focus();
    await user.keyboard("{ArrowLeft}");

    expect(roleTab).toHaveFocus();
    expect(screen.getByText("Role step")).toBeInTheDocument();
    expect(screen.getByRole("tabpanel")).toContainElement(screen.getByRole("list"));
  });
});

describe("NameTag", () => {
  it("marks an invalid expert and announces why", async () => {
    const user = userEvent.setup();
    render(<NameTag expert={makeExpert()} topic="Black holes" onChangeExpert={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Ask a different expert" }));
    await user.type(screen.getByRole("textbox", { name: "Expert" }), "x");
    await user.click(screen.getByRole("button", { name: "Ask them" }));

    expect(screen.getByRole("textbox", { name: "Expert" })).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("The expert needs 2 to 60 characters.");
  });
});

describe("TopicSentence", () => {
  it("explains the problem instead of submitting an invalid topic", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TopicSentence isBusy={false} onSubmit={onSubmit} />);

    await user.type(screen.getByRole("textbox", { name: "Topic" }), "<script>");
    await user.click(screen.getByRole("button", { name: "Explain it" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("The topic can't contain < or >.")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Topic" })).toHaveAttribute("aria-invalid", "true");
  });
});
