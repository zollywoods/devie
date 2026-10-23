import type { CreditEvent, Production } from "./performances";

export type SpineAction = "previous" | "next" | "info" | "back";
export type SpineView = "production" | "info";

export const COMPANY_INFO = [
  "Théâtre Dévié is a dispersed, interdisciplinary theatre company with an incalculable number of members and indeterminate plans.",
  "The ensemble embraces the term “company” in its broadest sense, extending its circle of presence to the paranormal.",
] as const;

export type SpineSegment = {
  text: string;
  href?: string;
  external?: boolean;
  current?: boolean;
  action?: SpineAction;
  eventIndex?: number;
  ariaLabel?: string;
  italic?: boolean;
};

const VERTEBRA = "[||]";
const RIB_WIDTHS = [
  8, 12, 16, 20, 22, 24, 26, 28, 30, 32, 32, 32, 32, 30, 28, 26, 24, 22, 20, 16,
  12, 8,
] as const;
const WRAP = 32;
const MAX_LEFT = Math.max(...RIB_WIDTHS);

type CreditCell = {
  text: string;
  href?: string;
  external?: boolean;
  current?: boolean;
  eventIndex?: number;
  italic?: boolean;
};

type CreditRow = {
  left: CreditCell;
  right: CreditCell;
};

function cell(
  text: string,
  extras: Omit<CreditCell, "text"> = {},
): CreditCell {
  return { text, ...extras };
}

function emptyCell(): CreditCell {
  return { text: "" };
}

function splitTitle(title: string): [string, string] {
  const ofIdx = title.lastIndexOf(" of ");
  if (ofIdx > 0) {
    return [title.slice(0, ofIdx).trim(), title.slice(ofIdx + 1).trim()];
  }

  const mid = Math.ceil(title.length / 2);
  const space = title.lastIndexOf(" ", mid);
  if (space > 0) {
    return [title.slice(0, space), title.slice(space + 1)];
  }

  return [title, ""];
}

function takeLine(text: string, width: number): [string, string] {
  if (!text) {
    return ["", ""];
  }
  if (text.length <= width) {
    return [text, ""];
  }

  const words = text.split(/\s+/);
  let current = "";
  let used = 0;

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= width) {
      current = next;
      used += 1;
    } else {
      break;
    }
  }

  if (used > 0 && current) {
    return [current, words.slice(used).join(" ")];
  }

  return [text.slice(0, width), text.slice(width)];
}

function wrapWords(text: string, max = WRAP): string[] {
  if (text.length <= max) {
    return [text];
  }

  const lines: string[] = [];
  let current = "";

  for (const word of text.split(/\s+/)) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= max) {
      current = next;
    } else {
      if (current) {
        lines.push(current);
      }
      current = word;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function splitWith(withLine: string): CreditRow[] {
  const match = withLine.match(/^(.*?)\s+(on\s+.+)$/i);
  if (match) {
    return [
      { left: cell("with"), right: cell(match[1]) },
      { left: emptyCell(), right: cell(match[2]) },
    ];
  }

  return [{ left: cell("with"), right: cell(withLine) }];
}

function labeledLines(label: string, values: string[]): CreditRow[] {
  return values.flatMap((value, index) => {
    const wrapped = wrapWords(value);
    return wrapped.map((line, lineIndex) => ({
      left: cell(index === 0 && lineIndex === 0 ? label : ""),
      right: cell(line),
    }));
  });
}

function dateLinkRows(production: Production, eventIndex: number): CreditRow[] {
  const dated = production.events
    .map((event, index) => ({ event, index }))
    .filter(({ event }) => event.dateCode);

  if (dated.length < 2) {
    return [];
  }

  const rows: CreditRow[] = [];

  for (let i = 0; i < dated.length; i += 2) {
    const first = dated[i];
    const second = dated[i + 1];
    rows.push({
      left: cell(first.event.dateCode ?? "", {
        eventIndex: first.index,
        current: first.index === eventIndex,
      }),
      right: second
        ? cell(second.event.dateCode ?? "", {
            eventIndex: second.index,
            current: second.index === eventIndex,
          })
        : emptyCell(),
    });
  }

  return rows;
}

function creditRows(
  production: Production,
  event: CreditEvent,
  eventIndex: number,
): CreditRow[] {
  const [titleLeft, titleRight] = splitTitle(production.title);
  const titleExtras = {
    italic: true,
    ...(production.href
      ? {
          href: production.href,
          external: production.href.startsWith("http"),
        }
      : {}),
  };

  const rows: CreditRow[] = [
    {
      left: cell(titleLeft, titleExtras),
      right: cell(titleRight, titleExtras),
    },
  ];

  if (production.kind) {
    wrapWords(production.kind).forEach((line) => {
      rows.push({
        left: cell(line),
        right: emptyCell(),
      });
    });
  }

  rows.push({ left: emptyCell(), right: emptyCell() });
  rows.push(...dateLinkRows(production, eventIndex));

  if (event.date) {
    const dateLabel = event.dateLabel === undefined ? "Performed" : event.dateLabel;
    rows.push({ left: cell(dateLabel), right: cell(event.date) });
  }

  if (event.venue) {
    rows.push(...labeledLines(event.venueLabel ?? "at", wrapWords(event.venue)));
  }

  if (event.writtenAndDirectedBy) {
    rows.push({
      left: cell("Written and directed by"),
      right: cell(event.writtenAndDirectedBy),
    });
  }

  if (event.writtenAndPresentedBy) {
    rows.push({
      left: cell("Written and presented by"),
      right: cell(event.writtenAndPresentedBy),
    });
  }

  if (event.starring?.length) {
    rows.push(...labeledLines("Starring", event.starring));
  }

  if (event.with) {
    rows.push(...splitWith(event.with));
  }

  if (event.performedBy) {
    rows.push({ left: cell("performed by"), right: cell(event.performedBy) });
  }

  if (event.dancedBy?.length) {
    rows.push(...labeledLines("danced by", event.dancedBy));
  }

  if (event.musicBy) {
    rows.push({ left: cell("music by"), right: cell(event.musicBy) });
  }

  if (event.musicComposedBy?.length) {
    rows.push(...labeledLines("music composed by", event.musicComposedBy));
  }

  if (event.costumesByCast) {
    rows.push({ left: cell("Costumes by"), right: cell("the cast") });
  } else if (event.costumes?.length) {
    rows.push({
      left: cell("Costumes by"),
      right: cell(event.costumes[0] ?? ""),
    });
    rows.push(
      ...event.costumes.slice(1).map((name) => ({
        left: emptyCell(),
        right: cell(name),
      })),
    );
  }

  if (event.poster) {
    rows.push({ left: cell("Poster by"), right: cell(event.poster) });
  }

  if (event.posterNote) {
    rows.push(...labeledLines("Poster", wrapWords(event.posterNote)));
  }

  if (event.people) {
    wrapWords(event.people).forEach((line, index) => {
      rows.push({
        left: cell(index === 0 ? (event.peopleLabel ?? "") : ""),
        right: cell(line),
      });
    });
  }

  if (event.artists?.length) {
    rows.push(...labeledLines("", event.artists));
  }

  if (event.curatedBy) {
    rows.push({ left: cell("Curated by"), right: cell(event.curatedBy) });
  }

  if (event.note) {
    wrapWords(event.note).forEach((line) => {
      rows.push({ left: cell(line), right: emptyCell() });
    });
  }

  return rows;
}

function leftRib(entry: CreditCell, width: number): SpineSegment[] {
  if (!entry.text) {
    return [{ text: "-".repeat(width) }];
  }

  const body = entry.text.length >= width ? entry.text.slice(0, width) : `${entry.text} `;
  return [
    { text: "-".repeat(Math.max(0, width - body.length)) },
    {
      text: body,
      href: entry.href,
      external: entry.external,
      current: entry.current,
      eventIndex: entry.eventIndex,
      italic: entry.italic,
    },
  ];
}

function rightRib(entry: CreditCell, width: number): SpineSegment[] {
  if (!entry.text) {
    return [{ text: "-".repeat(width) }];
  }

  const body = entry.text.length >= width ? entry.text.slice(0, width) : ` ${entry.text}`;
  return [
    {
      text: body,
      href: entry.href,
      external: entry.external,
      current: entry.current,
      eventIndex: entry.eventIndex,
      italic: entry.italic,
    },
    { text: "-".repeat(Math.max(0, width - body.length)) },
  ];
}

function centerOnSpine(piece: string) {
  const vertebraCenter = MAX_LEFT + VERTEBRA.length / 2;
  const pad = Math.round(vertebraCenter - piece.length / 2);
  return " ".repeat(Math.max(0, pad)) + piece;
}

function structureLine(piece: string): SpineSegment[] {
  return [{ text: centerOnSpine(piece) }];
}

function diamondLine(
  left: string,
  right: string,
  innerWidth: number,
  inner?: SpineSegment,
): SpineSegment[] {
  const full = left + " ".repeat(innerWidth) + right;
  const centered = centerOnSpine(full);
  const prefix = centered.slice(0, centered.length - full.length);

  if (!inner) {
    return [{ text: centered }];
  }

  const leftover = Math.max(0, innerWidth - inner.text.length);
  const padLeft = Math.floor(leftover / 2);
  const padRight = leftover - padLeft;

  return [
    { text: prefix + left + " ".repeat(padLeft) },
    inner,
    { text: " ".repeat(padRight) + right },
  ];
}

function coccyxControl(
  action: SpineAction,
  label: string,
  ariaLabel: string,
): SpineSegment {
  return { text: label, action, ariaLabel };
}

function renderCoccyx(view: SpineView): SpineSegment[][] {
  const previous = coccyxControl(
    "previous",
    "previous",
    "Previous production",
  );
  const next = coccyxControl("next", "next", "Next production");
  const info = coccyxControl("info", "info", "Company information");
  const back = coccyxControl("back", "back", "Back to productions");

  return [
    structureLine("/" + VERTEBRA + "\\"),
    diamondLine("/", "\\", 8),
    diamondLine("/", "\\", 10, view === "info" ? undefined : previous),
    diamondLine("\\", "/", 10, view === "info" ? back : next),
    diamondLine("\\", "/", 8),
    diamondLine("\\", "/", 6, view === "info" ? undefined : info),
    diamondLine("\\", "/", 4),
    diamondLine("\\", "/", 2),
    structureLine("\\/"),
  ];
}

function packCredits(
  credits: CreditRow[],
  start: number,
): { rows: CreditRow[]; first: number; last: number } | null {
  const rows = RIB_WIDTHS.map(() => ({
    left: emptyCell(),
    right: emptyCell(),
  }));
  let ribIndex = start;

  for (const row of credits) {
    let leftRemain = row.left.text;
    let rightRemain = row.right.text;
    const blank = !leftRemain && !rightRemain;

    do {
      if (ribIndex >= RIB_WIDTHS.length) {
        return null;
      }

      const width = RIB_WIDTHS[ribIndex];
      const [leftLine, leftRest] = takeLine(leftRemain, width);
      const [rightLine, rightRest] = takeLine(rightRemain, width);

      rows[ribIndex] = {
        left: { ...row.left, text: leftLine },
        right: { ...row.right, text: rightLine },
      };
      leftRemain = leftRest;
      rightRemain = rightRest;
      ribIndex += 1;
    } while (!blank && (leftRemain || rightRemain));
  }

  return { rows, first: start, last: ribIndex - 1 };
}

function emptyRibs(): CreditRow[] {
  return RIB_WIDTHS.map(() => ({
    left: emptyCell(),
    right: emptyCell(),
  }));
}

function centerPacked(
  pack: (start: number) => { rows: CreditRow[]; first: number; last: number } | null,
): CreditRow[] {
  const cageMid = (RIB_WIDTHS.length - 1) / 2;
  let best: { rows: CreditRow[]; score: number } | null = null;

  for (let start = 0; start < RIB_WIDTHS.length; start += 1) {
    const packed = pack(start);
    if (!packed) {
      continue;
    }

    const score = Math.abs((packed.first + packed.last) / 2 - cageMid);
    if (!best || score < best.score) {
      best = { rows: packed.rows, score };
    }
  }

  return best?.rows ?? emptyRibs();
}

function layoutCredits(
  production: Production,
  event: CreditEvent,
  eventIndex: number,
): CreditRow[] {
  const credits = creditRows(production, event, eventIndex);
  return centerPacked((start) => packCredits(credits, start));
}

function packInfo(
  start: number,
): { rows: CreditRow[]; first: number; last: number } | null {
  const rows = emptyRibs();
  let ribIndex = start;

  for (const [paragraphIndex, paragraph] of COMPANY_INFO.entries()) {
    if (paragraphIndex > 0) {
      if (ribIndex >= RIB_WIDTHS.length) {
        return null;
      }
      ribIndex += 1;
    }

    let remain: string = paragraph;
    while (remain) {
      if (ribIndex >= RIB_WIDTHS.length) {
        return null;
      }

      const width = RIB_WIDTHS[ribIndex];
      const firstWord = remain.split(/\s+/)[0] ?? "";
      if (firstWord.length > width) {
        return null;
      }

      const [leftLine, leftRest] = takeLine(remain, width);
      if (leftRest) {
        const nextWord = leftRest.split(/\s+/)[0] ?? "";
        if (nextWord.length > width) {
          return null;
        }
      }
      const [rightLine, rightRest] = takeLine(leftRest, width);

      rows[ribIndex] = {
        left: cell(leftLine),
        right: cell(rightLine),
      };
      remain = rightRest;
      ribIndex += 1;
    }
  }

  return { rows, first: start, last: ribIndex - 1 };
}

function layoutInfoCredits(): CreditRow[] {
  return centerPacked(packInfo);
}

export function renderSpineLines(
  production: Production,
  eventIndex = 0,
  view: SpineView = "production",
): SpineSegment[][] {
  const event = production.events[eventIndex] ?? production.events[0];
  const credits =
    view === "info"
      ? layoutInfoCredits()
      : layoutCredits(production, event, eventIndex);

  const head = [
    structureLine("()"),
    structureLine("||"),
    structureLine(VERTEBRA),
    structureLine(VERTEBRA),
  ];

  const ribs = RIB_WIDTHS.map((width, index) => {
    const pad = MAX_LEFT - width;
    const { left, right } = credits[index];
    return [
      { text: " ".repeat(pad) },
      ...leftRib(left, width),
      { text: VERTEBRA },
      ...rightRib(right, width),
    ];
  });

  return [...head, ...ribs, ...renderCoccyx(view)];
}

export function productionCopy(production: Production, eventIndex = 0) {
  const event = production.events[eventIndex] ?? production.events[0];

  return [
    production.title,
    production.kind,
    event.dateCode,
    event.date && event.venue
      ? `${event.dateLabel === undefined ? "Performed" : event.dateLabel} ${event.date} ${event.venueLabel ?? "at"} ${event.venue}`.replace(/\s+/g, " ").trim()
      : [event.date, event.venue].filter(Boolean).join(" · "),
    event.writtenAndDirectedBy &&
      `Written and directed by ${event.writtenAndDirectedBy}`,
    event.writtenAndPresentedBy &&
      `Written and presented by ${event.writtenAndPresentedBy}`,
    event.starring?.length && `Starring ${event.starring.join(", ")}`,
    event.with,
    event.performedBy && `performed by ${event.performedBy}`,
    event.dancedBy?.length && `danced by ${event.dancedBy.join(" and ")}`,
    event.musicBy && `music by ${event.musicBy}`,
    event.musicComposedBy?.length &&
      `music composed by ${event.musicComposedBy.join(", ")}`,
    event.costumesByCast && "Costumes by the cast",
    event.costumes?.length && `Costumes by ${event.costumes.join(" and ")}`,
    event.poster && `Poster by ${event.poster}`,
    event.posterNote && `Poster ${event.posterNote}`,
    event.people &&
      [event.peopleLabel, event.people].filter(Boolean).join(" "),
    event.artists?.length && event.artists.join(", "),
    event.curatedBy && `Curated by ${event.curatedBy}`,
    event.note,
    event.synopsis,
  ]
    .filter(Boolean)
    .join("\n");
}
