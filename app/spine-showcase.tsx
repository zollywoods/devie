"use client";

import Image from "next/image";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { Production } from "./performances";
import {
  COMPANY_INFO,
  productionCopy,
  renderSpineLines,
  type SpineAction,
  type SpineSegment,
} from "./spine";

function SpineSegmentView({
  segment,
  onAction,
  onSelectEvent,
}: {
  segment: SpineSegment;
  onAction: (action: SpineAction) => void;
  onSelectEvent: (index: number) => void;
}) {
  const interactive =
    "pointer-events-auto inline cursor-pointer appearance-none border-0 bg-transparent p-0 font-mono text-inherit leading-[inherit] hover:underline";
  const emphasis = segment.italic ? " italic" : "";

  if (segment.action) {
    return (
      <button
        type="button"
        onClick={() => onAction(segment.action!)}
        aria-label={segment.ariaLabel ?? segment.action}
        className={interactive + emphasis}
      >
        {segment.text}
      </button>
    );
  }

  if (segment.eventIndex !== undefined && !segment.current) {
    return (
      <button
        type="button"
        onClick={() => onSelectEvent(segment.eventIndex!)}
        className={interactive + emphasis}
      >
        {segment.text}
      </button>
    );
  }

  if (segment.href) {
    return (
      <a
        href={segment.href}
        target={segment.external ? "_blank" : undefined}
        rel={segment.external ? "noopener noreferrer" : undefined}
        className={interactive + emphasis + " underline"}
      >
        {segment.text}
      </a>
    );
  }

  if (segment.current) {
    return <span className={`underline${emphasis}`}>{segment.text}</span>;
  }

  if (segment.italic) {
    return <span className="italic">{segment.text}</span>;
  }

  return <span>{segment.text}</span>;
}

function FitStage({ children }: { children: React.ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function fit() {
      const frameEl = frameRef.current;
      const innerEl = innerRef.current;
      if (!frameEl || !innerEl) {
        return;
      }

      const compact = window.matchMedia("(max-width: 767px)").matches;
      const frameBox = frameEl.getBoundingClientRect();
      const styles = getComputedStyle(frameEl);
      const padX =
        parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
      const padY =
        parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
      const availW = Math.max(0, frameBox.width - padX);
      const availH = Math.max(0, frameBox.height - padY);
      const naturalW = innerEl.offsetWidth;
      const naturalH = innerEl.offsetHeight;
      if (!naturalW || !naturalH || !availW || !availH) {
        return;
      }

      const fitted = Math.min(availW / naturalW, availH / naturalH);
      setScale(compact ? fitted : Math.min(1, fitted));
      setReady(true);
    }

    const frameEl = frameRef.current;
    const innerEl = innerRef.current;
    if (!frameEl || !innerEl) {
      return;
    }

    const observer = new ResizeObserver(fit);
    observer.observe(frameEl);
    observer.observe(innerEl);
    window.addEventListener("resize", fit);
    fit();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  return (
    <div
      ref={frameRef}
      className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center overflow-hidden p-2 md:p-4"
    >
      <div
        ref={innerRef}
        className="relative z-10 flex flex-col items-center"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          visibility: ready ? "visible" : "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function VertebraScrollbar({
  scrollerRef,
}: {
  scrollerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [progress, setProgress] = useState(0);
  const [thumbRatio, setThumbRatio] = useState(0.2);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    const el = scroller;

    function measure() {
      const max = el.scrollHeight - el.clientHeight;
      setThumbRatio(el.scrollHeight <= 0 ? 1 : el.clientHeight / el.scrollHeight);
      setProgress(max <= 0 ? 0 : el.scrollTop / max);
    }

    function onScroll() {
      if (dragging.current) {
        return;
      }
      measure();
    }

    measure();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [scrollerRef]);

  function seek(clientY: number, smooth: boolean) {
    const track = trackRef.current;
    const scroller = scrollerRef.current;
    if (!track || !scroller) {
      return;
    }

    const rect = track.getBoundingClientRect();
    const ratio = Math.min(
      1,
      Math.max(0, (clientY - rect.top) / rect.height),
    );
    const max = scroller.scrollHeight - scroller.clientHeight;
    setProgress(ratio);
    scroller.scrollTo({ top: ratio * max, behavior: smooth ? "smooth" : "auto" });
  }

  useEffect(() => {
    function onMove(event: PointerEvent) {
      if (!dragging.current) {
        return;
      }
      seek(event.clientY, false);
    }

    function onUp() {
      dragging.current = false;
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const thumbSize = Math.min(1, Math.max(thumbRatio, 0.12));
  const thumbTop = progress * (1 - thumbSize);

  return (
    <div
      ref={trackRef}
      role="scrollbar"
      aria-label="Page scroll"
      aria-orientation="vertical"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="pointer-events-none absolute left-1/2 z-20 w-[1.1ch] -translate-x-1/2 cursor-ns-resize [@media(pointer:fine)]:pointer-events-auto"
      style={{ top: "1.2em", bottom: "8.4em" }}
      onPointerDown={(event) => {
        dragging.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        seek(event.clientY, false);
      }}
    >
      <div
        className="absolute left-1/2 bg-black dark:bg-white"
        style={{
          top: `${thumbTop * 100}%`,
          height: `${thumbSize * 100}%`,
          width: "max(1px, calc(0.38ch - 2px))",
          transform: "translateX(-50%)",
        }}
      />
    </div>
  );
}

export function SpineShowcase({
  productions,
}: {
  productions: Production[];
}) {
  const [active, setActive] = useState(0);
  const [eventIndex, setEventIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pendingTarget = useRef<number | null>(null);
  const pendingTimer = useRef<number | undefined>(undefined);

  const goTo = useCallback(
    (index: number) => {
      const scroller = scrollerRef.current;
      const section = sectionRefs.current[index];
      if (index < 0 || index >= productions.length || !scroller || !section) {
        return;
      }
      pendingTarget.current = index;
      window.clearTimeout(pendingTimer.current);
      pendingTimer.current = window.setTimeout(() => {
        pendingTarget.current = null;
      }, 1500);
      setShowInfo(false);
      setActive(index);
      scroller.scrollTo({ top: section.offsetTop, behavior: "smooth" });
    },
    [productions.length],
  );

  useEffect(() => {
    function onWheel(event: WheelEvent) {
      const scroller = scrollerRef.current;
      if (!scroller || scroller.contains(event.target as Node)) {
        return;
      }
      scroller.scrollBy({ top: event.deltaY });
    }

    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    const el = scroller;

    function onScroll() {
      const height = el.clientHeight;
      if (!height) {
        return;
      }
      const index = Math.min(
        productions.length - 1,
        Math.max(0, Math.round(el.scrollTop / height)),
      );

      const target = pendingTarget.current;
      if (target !== null) {
        if (Math.abs(el.scrollTop - target * height) > 2) {
          return;
        }
        pendingTarget.current = null;
      }
      setActive(index);
    }

    function onUserScroll() {
      pendingTarget.current = null;
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("touchstart", onUserScroll, { passive: true });
    el.addEventListener("wheel", onUserScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("touchstart", onUserScroll);
      el.removeEventListener("wheel", onUserScroll);
    };
  }, [productions.length]);

  useEffect(() => {
    setEventIndex(0);
  }, [active]);

  useEffect(() => {
    if (!showInfo) {
      return;
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowInfo(false);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showInfo]);

  const production = productions[active] ?? productions[0];

  if (!production) {
    return null;
  }

  const safeEventIndex = Math.min(
    eventIndex,
    Math.max(0, production.events.length - 1),
  );
  const lines = renderSpineLines(
    production,
    safeEventIndex,
    showInfo ? "info" : "production",
  );

  function onAction(action: SpineAction) {
    if (action === "info") {
      setShowInfo(true);
      return;
    }
    if (action === "back") {
      setShowInfo(false);
      return;
    }
    goTo(action === "next" ? active + 1 : active - 1);
  }

  return (
    <div className="relative">
      {showInfo ? (
        <button
          type="button"
          aria-label="Back to productions"
          className="pointer-events-auto fixed inset-0 z-10 cursor-default"
          onClick={() => setShowInfo(false)}
        />
      ) : null}
      <FitStage>
          <Image
            src="/devie-logo.jpg"
            alt="Théâtre Dévié"
            width={2172}
            height={724}
            priority
            sizes="(min-width: 768px) 15rem, (min-width: 640px) 13rem, 11rem"
            className="mt-2 -mb-px h-auto w-44 sm:w-52 md:w-60 dark:invert"
          />
          <div className="relative w-max font-mono text-[clamp(10px,min(1.15vw,1.85vh),12px)] leading-[1.16]">
          <div
            ref={scrollerRef}
            className="pointer-events-auto absolute inset-0 z-0 snap-y snap-mandatory overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {productions.map((item, index) => (
              <section
                key={item.id}
                id={item.id}
                ref={(element) => {
                  sectionRefs.current[index] = element;
                }}
                data-index={index}
                className="h-full snap-start snap-always"
                aria-label={item.title}
              >
                <article className="sr-only">
                  <h2>{item.title}</h2>
                  <p>{productionCopy(item, index === active ? safeEventIndex : 0)}</p>
                </article>
              </section>
            ))}
          </div>
          <pre className="relative z-10 overflow-hidden">
            {lines.map((line, lineIndex) => (
              <Fragment key={lineIndex}>
                {line.map((segment, segmentIndex) => (
                  <SpineSegmentView
                    key={`${lineIndex}-${segmentIndex}`}
                    segment={segment}
                    onAction={onAction}
                    onSelectEvent={setEventIndex}
                  />
                ))}
                {lineIndex < lines.length - 1 ? "\n" : null}
              </Fragment>
            ))}
          </pre>
          {showInfo ? (
            <p className="sr-only" role="status">
              {COMPANY_INFO.join(" ")}
            </p>
          ) : null}
          <VertebraScrollbar scrollerRef={scrollerRef} />
          </div>
      </FitStage>
    </div>
  );
}
