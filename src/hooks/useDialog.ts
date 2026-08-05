"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseDialogOptions {
  initialOpen?: boolean;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
  onClose?: () => void;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement
  );
}

export function useDialog({ initialOpen = false, closeOnEscape = true, lockScroll = true, onClose }: UseDialogOptions = {}) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const close = useCallback(() => {
    setIsOpen(false);
    onCloseRef.current?.();
  }, []);

  const open = useCallback(() => {
    returnFocusRef.current = document.activeElement as HTMLElement;
    setIsOpen(true);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, close, open]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEscape) {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusable = getFocusable(dialog);
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey) {
          if (active === first || (active && !dialog.contains(active))) {
            e.preventDefault();
            last.focus();
          }
        } else if (active === last || (active && !dialog.contains(active))) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [close, closeOnEscape]
  );

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    if (lockScroll) document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    const raf = requestAnimationFrame(() => {
      const focusable = dialogRef.current ? getFocusable(dialogRef.current) : [];
      if (focusable.length > 0) focusable[0].focus();
    });
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(raf);
      returnFocusRef.current?.focus?.();
    };
  }, [isOpen, lockScroll, handleKeyDown]);

  return { isOpen, open, close, toggle, setIsOpen, dialogRef };
}
