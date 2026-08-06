"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Kbd, SearchField } from "@heroui/react";
import { useSearchIndex } from "@/hooks/useSearchIndex";
import { useSelectedWorkLog } from "@/context/SelectedWorkLogContext";
import { fuzzyMatch, splitByMatch } from "@/lib/fuzzyMatch";

// No real store to subscribe to — the platform never changes mid-session —
// so this only exists to give useSyncExternalStore a distinct snapshot for
// server (assume Mac, matching this app's primary audience) vs client.
const noopSubscribe = () => () => {};
const getIsMacSnapshot = () => /mac/i.test(navigator.platform);
const getIsMacServerSnapshot = () => true;

type SearchResult =
  | {
      type: "workLog";
      score: number;
      workLogId: string;
      name: string;
      nameIndices: number[];
    }
  | {
      type: "timeEntry";
      score: number;
      entryId: string;
      workLogId: string;
      workLogName: string;
      description: string;
      startTime: string;
      descriptionIndices: number[];
    };

const MAX_RESULTS = 8;

function formatEntryTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function Highlighted({ text, indices }: { text: string; indices: number[] }) {
  return (
    <>
      {splitByMatch(text, indices).map((run, i) =>
        run.matched ? (
          <span key={i} className="font-semibold text-accent">
            {run.text}
          </span>
        ) : (
          <span key={i}>{run.text}</span>
        )
      )}
    </>
  );
}

// VSCode-style "go to anything": type to fuzzy-match work log titles and
// time entry descriptions across the whole account, arrow/enter to jump to
// a result. Picking a time entry also flags it for
// WorkLogTimeEntryCardLayout to auto-expand and scroll to (see
// SelectedWorkLogContext.focusEntryId).
export function GlobalSearch() {
  const router = useRouter();
  const { workLogs, timeEntries, refresh } = useSearchIndex();
  const { setSelectedWorkLogId, setFocusEntryId } = useSelectedWorkLog();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMac = useSyncExternalStore(noopSubscribe, getIsMacSnapshot, getIsMacServerSnapshot);

  // Global ⌘K / Ctrl+K shortcut, matching the hint shown in the search bar.
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];

    const workLogResults: SearchResult[] = [];
    for (const log of workLogs) {
      const match = fuzzyMatch(query, log.name);
      if (match) {
        workLogResults.push({
          type: "workLog",
          score: match.score,
          workLogId: log.id,
          name: log.name,
          nameIndices: match.indices,
        });
      }
    }

    const entryResults: SearchResult[] = [];
    for (const entry of timeEntries) {
      if (!entry.description || !entry.workLogId) continue;
      const match = fuzzyMatch(query, entry.description);
      if (match) {
        entryResults.push({
          type: "timeEntry",
          score: match.score,
          entryId: entry.id,
          workLogId: entry.workLogId,
          workLogName: entry.workLogName ?? "",
          description: entry.description,
          startTime: entry.startTime,
          descriptionIndices: match.indices,
        });
      }
    }

    return [...workLogResults, ...entryResults].sort((a, b) => a.score - b.score).slice(0, MAX_RESULTS);
  }, [query, workLogs, timeEntries]);

  // Reset the highlighted result whenever the query changes — done during
  // render (rather than an effect) to avoid an extra render pass; see
  // TicketComboBox for the same pattern.
  const [lastQuery, setLastQuery] = useState(query);
  if (lastQuery !== query) {
    setLastQuery(query);
    setActiveIndex(0);
  }

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectResult = (result: SearchResult) => {
    setSelectedWorkLogId(result.workLogId);
    setFocusEntryId(result.type === "timeEntry" ? result.entryId : null);
    router.push("/worklogs");
    setQuery("");
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectResult(results[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <SearchField
        name="search"
        aria-label="Search"
        value={query}
        onChange={(value) => {
          setQuery(value);
          setIsOpen(true);
        }}
      >
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input
            ref={inputRef}
            className="w-[280px]"
            placeholder="Search work logs and entries..."
            onFocus={() => {
              refresh();
              setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
          />
          {query ? (
            <SearchField.ClearButton />
          ) : (
            <Kbd className="mr-1 shrink-0">
              <Kbd.Abbr keyValue={isMac ? "command" : "ctrl"} />K
            </Kbd>
          )}
        </SearchField.Group>
      </SearchField>

      {isOpen && query.trim() && (
        <div
          data-slot="global-search-popover"
          className="absolute left-0 top-full z-50 mt-2 max-h-96 w-[420px] overflow-y-auto rounded-lg border border-border bg-overlay p-1 shadow-lg"
        >
          {results.length === 0 ? (
            <div className="p-3 text-sm text-foreground/60">No matches for &quot;{query}&quot;</div>
          ) : (
            results.map((result, index) => (
              <button
                key={result.type === "workLog" ? `wl-${result.workLogId}` : `te-${result.entryId}`}
                type="button"
                onClick={() => selectResult(result)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left text-sm ${
                  index === activeIndex ? "bg-default" : ""
                }`}
              >
                {result.type === "workLog" ? (
                  <>
                    <span className="text-xs font-medium uppercase tracking-wide text-foreground/50">
                      Work Log
                    </span>
                    <span className="text-foreground">
                      <Highlighted text={result.name} indices={result.nameIndices} />
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-medium uppercase tracking-wide text-foreground/50">
                      {result.workLogName} · {formatEntryTime(result.startTime)}
                    </span>
                    <span className="line-clamp-1 text-foreground">
                      <Highlighted text={result.description} indices={result.descriptionIndices} />
                    </span>
                  </>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
