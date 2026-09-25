/**
 * @vitest-environment happy-dom
 */
import { act, createElement, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { focusInitial, listFocusable, trapDialogTab, useDialogA11y } from "./dialogA11y";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function Harness({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useDialogA11y<HTMLDivElement>(open, () => {
    setOpen(false);
    onClose();
  });
  return createElement(
    "div",
    null,
    createElement(
      "button",
      { type: "button", id: "open-dialog", onClick: () => setOpen(true) },
      "Open",
    ),
    open
      ? createElement(
          "div",
          { ref, role: "dialog", "aria-modal": "true", tabIndex: -1 },
          createElement("button", { type: "button" }, "First"),
          createElement("button", { type: "button" }, "Last"),
        )
      : null,
  );
}

describe("dialog focus", () => {
  let root: Root | undefined;
  let host: HTMLDivElement | undefined;

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    host?.remove();
    root = undefined;
    host = undefined;
  });

  it("focuses the first control and skips disabled ones", () => {
    const dialog = document.createElement("div");
    dialog.tabIndex = -1;
    const skip = document.createElement("button");
    skip.disabled = true;
    skip.textContent = "Skip";
    const first = document.createElement("button");
    first.textContent = "First";
    dialog.append(skip, first);
    document.body.append(dialog);
    focusInitial(dialog);
    expect(document.activeElement).toBe(first);
    expect(listFocusable(dialog)).toEqual([first]);
    dialog.remove();
  });

  it("wraps Tab inside the dialog", () => {
    const dialog = document.createElement("div");
    const first = document.createElement("button");
    const last = document.createElement("button");
    first.textContent = "First";
    last.textContent = "Last";
    dialog.append(first, last);
    document.body.append(dialog);
    last.focus();
    const forward = new KeyboardEvent("keydown", { key: "Tab", cancelable: true });
    trapDialogTab(dialog, forward);
    expect(forward.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(first);
    const backward = new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, cancelable: true });
    trapDialogTab(dialog, backward);
    expect(backward.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(last);
    dialog.remove();
  });

  it("moves focus in, traps Tab, closes on Escape, and restores the opener", async () => {
    let closed = 0;
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    await act(async () => {
      root?.render(createElement(Harness, { onClose: () => { closed += 1; } }));
    });
    const opener = host.querySelector<HTMLButtonElement>("#open-dialog");
    expect(opener).toBeTruthy();
    opener?.focus();
    await act(async () => {
      opener?.click();
    });
    const dialog = host.querySelector("[role='dialog']");
    expect(dialog).toBeTruthy();
    expect(document.activeElement?.textContent).toBe("First");

    const buttons = dialog?.querySelectorAll("button");
    const last = buttons?.[1] as HTMLButtonElement;
    last.focus();
    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", cancelable: true }));
    });
    expect(document.activeElement?.textContent).toBe("First");

    await act(async () => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, cancelable: true }),
      );
    });
    expect(document.activeElement?.textContent).toBe("Last");

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", cancelable: true }));
    });
    expect(closed).toBe(1);
    expect(host.querySelector("[role='dialog']")).toBeNull();
    expect(document.activeElement).toBe(opener);
  });
});
