"use client";

import type { ComponentType, ReactNode } from "react";
import { Tabs, Label } from "@heroui/react";
import type { Key } from "react-aria-components";
import { useBorders } from "@/context/BordersContext";

export interface SideNavItem {
  id: string;
  label: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
}

interface SideNavListBoxProps {
  ariaLabel: string;
  items: SideNavItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Optional header row above the list, as on the work logs sidebar. */
  heading?: ReactNode;
  headingAside?: ReactNode;
  emptyMessage?: string;
  /**
   * Optional action rendered directly beneath the heading, e.g. "Add member".
   * Deliberately above the list rather than below it: the list panel stretches
   * to full height, so a footer ends up far from the rows it acts on whenever
   * the list is short.
   */
  action?: ReactNode;
  /**
   * Optional control pinned below the list, e.g. a context switcher. Distinct
   * from `action`: this one belongs at the bottom, away from the rows, because
   * it changes what the list shows rather than acting on it.
   */
  footer?: ReactNode;
}

/**
 * The app's vertical sidebar list, shared by the dashboard reports and both
 * admin pages.
 *
 * Extracted so those sidebars match by construction rather than by three
 * copies of the same class strings — the admin ones were hand-rolled buttons
 * and drifted visually from the dashboard the moment corner rounding became a
 * setting. The work logs sidebar (ListBoxComponent) still has its own copy:
 * each of its rows carries a dropdown and rename/delete dialogs, so it isn't a
 * plain list.
 *
 * No Tabs.Indicator, following the note in ListBoxComponent: react-aria's
 * FLIP-animated overlay measures itself independently of the tab and renders
 * as a mis-sized blob at the left edge. The selected fill is painted on the tab
 * itself instead, so it is always exactly the tab's own box.
 */
export function SideNavListBox({
  ariaLabel,
  items,
  selectedId,
  onSelect,
  heading,
  headingAside,
  emptyMessage = "Nothing here yet.",
  action,
  footer,
}: SideNavListBoxProps) {
  const { bordersEnabled } = useBorders();

  const handleSelectionChange = (key: Key) => {
    if (key != null) onSelect(String(key));
  };

  return (
    <div className="flex h-full w-full min-h-0 flex-col gap-3">
      {heading && (
        <div className="flex shrink-0 items-center justify-between px-1 pb-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-accent">{heading}</h3>
          {headingAside && (
            <span className="text-xs font-medium text-foreground/60">{headingAside}</span>
          )}
        </div>
      )}

      {action && <div className="shrink-0">{action}</div>}

      <div className="min-h-0 flex-1">
        {items.length === 0 ? (
          <p className="p-4 text-sm text-foreground/60">{emptyMessage}</p>
        ) : (
          <Tabs
            orientation="vertical"
            className="h-full w-full min-h-0"
            selectedKey={selectedId ?? undefined}
            onSelectionChange={handleSelectionChange}
          >
            <Tabs.ListContainer className="h-full w-full min-w-0">
              <Tabs.List
                aria-label={ariaLabel}
                className={`h-full w-full min-w-0 overflow-hidden bg-surface ${
                  bordersEnabled ? "border border-default-200" : ""
                }`}
                data-glass="surface"
              >
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Tabs.Tab
                      key={item.id}
                      id={item.id}
                      className="h-auto w-full min-w-0 justify-start border-l-2 border-transparent px-3 py-2 text-left text-foreground/60 data-[selected=true]:border-accent data-[selected=true]:bg-accent-soft data-[selected=true]:text-foreground"
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-2">
                        {Icon && <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />}
                        <div className="flex min-w-0 flex-1 flex-col">
                          <Label className="truncate font-medium">{item.label}</Label>
                          {item.description && (
                            <span className="truncate text-sm text-gray-500">{item.description}</span>
                          )}
                        </div>
                      </div>
                    </Tabs.Tab>
                  );
                })}
              </Tabs.List>
            </Tabs.ListContainer>

            {/* Panels stay empty and the active section renders in the page —
                Tabs is used purely as a selector here. */}
            {items.map((item) => (
              <Tabs.Panel key={item.id} id={item.id} className="hidden">
                {null}
              </Tabs.Panel>
            ))}
          </Tabs>
        )}
      </div>

      {footer && <div className="shrink-0">{footer}</div>}
    </div>
  );
}

export default SideNavListBox;
