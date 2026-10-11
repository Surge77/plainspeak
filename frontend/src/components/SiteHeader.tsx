import type { ExpertPick } from "../types";
import { LogoMark, PencilIcon } from "./icons";
import { ThemeToggle } from "./ThemeToggle";

interface SiteHeaderProps {
  isScrolled: boolean;
  // Set only while the big name tag is off screen; the nav then carries a small copy.
  awayExpert: ExpertPick | null;
  showNewTopic: boolean;
  onNewTopic: () => void;
  onBackToExpert: () => void;
}

export function SiteHeader({ isScrolled, awayExpert, showNewTopic, onNewTopic, onBackToExpert }: SiteHeaderProps) {
  return (
    <header className="site-header" data-scrolled={isScrolled ? "" : undefined}>
      <div className="frame flex h-16 items-center gap-2">
        <span className={awayExpert ? "brand brand-compact" : "brand"}>
          <LogoMark />
          <span className="brand-name">PlainSpeak</span>
        </span>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {awayExpert && (
            <button
              type="button"
              className="mini-tag"
              aria-label={`Back to the ${awayExpert.expert_role}'s explanation`}
              onClick={onBackToExpert}
            >
              <span aria-hidden="true">{awayExpert.emoji}</span>
              <span aria-hidden="true" className="mini-tag-role">
                {awayExpert.expert_role}
              </span>
            </button>
          )}
          {showNewTopic && (
            <button type="button" className="nav-button" onClick={onNewTopic}>
              <PencilIcon />
              New topic
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
