import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { act, useAppState, useStoreHydrated } from "@/lib/store";
import { performLookup } from "@/lib/actions";
import { findCertificate, normalizeQuery } from "@/lib/domain";
import type { AppState, CertState } from "@/lib/types";
import { SegmentedInput } from "@/components/verify/SegmentedInput";
import {
  BlockedResult,
  FoundResult,
  NotFoundResult,
  RevokedResult,
} from "@/components/verify/ResultPanels";

type Search = { q?: string };

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    ...(typeof s["q"] === "string" || typeof s["q"] === "number" ? { q: String(s["q"]) } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Verify a Career-180 Certificate" },
      {
        name: "description",
        content:
          "Enter a 6-digit certificate ID to check a Career-180 certificate and its evidence.",
      },
      { property: "og:title", content: "Verify a Career-180 Certificate" },
      {
        property: "og:description",
        content:
          "Check whether a Career-180 certificate is authentic and how far its evidence can be trusted.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VerifyPage,
});

const ID_LENGTH = 6;
const ID_ALLOWED = /[0-9]/;

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [active]);
  return now;
}

function VerifyPage() {
  const s = useAppState();
  const hydrationComplete = useStoreHydrated();
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const [value, setValue] = useState(q ?? "");
  const [blockedUntil, setBlockedUntil] = useState(0);
  const now = useNow(blockedUntil > 0);
  const resultRef = useRef<HTMLDivElement>(null);
  const blocked = blockedUntil > now;

  const run = (raw: string) => {
    const query = normalizeQuery(raw);
    if (query.length !== ID_LENGTH) return;
    const out = act((d) => performLookup(d, query, Date.now()));
    if (out.kind === "blocked") {
      setBlockedUntil(out.until);
      void navigate({ search: {}, replace: true });
      return;
    }
    setBlockedUntil(0);
    void navigate({ search: { q: query } });
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  // QR deep link: /?q=123456 performs a logged lookup once the store is loaded.
  const handledQuery = useRef(false);
  useEffect(() => {
    if (!hydrationComplete || !q || handledQuery.current) return;
    handledQuery.current = true;
    setValue(normalizeQuery(q));
    run(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrationComplete, q]);

  const cert = q ? findCertificate(s, q) : null;

  const pickSample = (query: string) => {
    setValue(query);
    run(query);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-12 sm:pt-16">
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
          <ShieldCheck className="h-4 w-4" /> Secure Verification System
        </span>
      </div>
      <h1 className="mt-6 text-center text-5xl font-bold leading-[1.05] sm:text-7xl">
        <span className="block text-foreground">Certificate</span>
        <span className="block text-gradient-brand">Verification</span>
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-center text-muted-foreground">
        Confirm a Career-180 certificate is authentic, then see the evidence behind it.
      </p>

      <section className="panel mt-10 p-5 sm:p-8">
        <label className="mb-3 block text-center text-sm font-medium text-muted-foreground">
          Certificate ID <span className="text-xs">(6 digits)</span>
        </label>
        <SegmentedInput
          length={ID_LENGTH}
          value={value}
          onChange={setValue}
          onComplete={(v) => run(v)}
          allowed={ID_ALLOWED}
          disabled={blocked}
          label="Certificate ID"
        />
        <Button
          variant="brand"
          size="lg"
          className="mt-6 w-full"
          disabled={blocked || value.length !== ID_LENGTH}
          onClick={() => run(value)}
        >
          <ShieldCheck /> Verify certificate
        </Button>
      </section>

      <div ref={resultRef} className="mt-8 scroll-mt-20">
        {blocked ? (
          <BlockedResult secondsLeft={Math.ceil((blockedUntil - now) / 1000)} />
        ) : q ? (
          cert ? (
            cert.state === "Revoked" ? (
              <RevokedResult cert={cert} s={s} />
            ) : (
              <FoundResult key={cert.id} cert={cert} s={s} />
            )
          ) : (
            <NotFoundResult />
          )
        ) : null}
      </div>

      <SampleChips s={s} onPick={pickSample} disabled={blocked} />
    </div>
  );
}

const GROUP_ORDER: { state: CertState | "NotFound"; title: string }[] = [
  { state: "Verified", title: "Verified" },
  { state: "Completed", title: "Completed" },
  { state: "Legacy", title: "Legacy" },
  { state: "Revoked", title: "Revoked" },
  { state: "NotFound", title: "Not found" },
];

function SampleChips({
  s,
  onPick,
  disabled,
}: {
  s: AppState;
  onPick: (q: string) => void;
  disabled: boolean;
}) {
  const groups = useMemo(
    () =>
      GROUP_ORDER.map((g) => {
        if (g.state === "NotFound")
          return {
            ...g,
            chips: s.notFoundSamples.map((q) => ({ q, note: "No match", private: false })),
          };
        const chips = s.certificates
          .filter((c) => c.state === g.state)
          .map((c) => ({
            q: c.id,
            note: c.caseNote,
            private: s.learners.find((l) => l.id === c.learnerId)?.sharing === "private",
          }));
        return { ...g, chips };
      }).filter((g) => g.chips.length > 0),
    [s],
  );

  return (
    <section className="mt-12" aria-label="Try a sample">
      <h2 className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Try a sample
      </h2>
      <div className="mt-5 space-y-4">
        {groups.map((g) => (
          <div key={g.title} className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <p className="w-24 shrink-0 pt-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {g.title}
            </p>
            <div className="flex flex-wrap gap-2">
              {g.chips.map((c) => (
                <button
                  key={c.q}
                  disabled={disabled}
                  onClick={() => onPick(c.q)}
                  title={c.note}
                  className="group inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs transition-colors hover:border-primary/60 hover:bg-accent disabled:opacity-50"
                >
                  <span className="font-mono font-semibold text-foreground">{c.q}</span>
                  <span className="text-muted-foreground group-hover:text-foreground">
                    {c.note}
                  </span>
                  {c.private && (
                    <Lock className="h-3 w-3 text-warning" aria-label="Private results" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
