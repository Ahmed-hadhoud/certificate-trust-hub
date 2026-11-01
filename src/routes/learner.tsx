import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Check,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  Inbox,
  Linkedin,
  Share2,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { act, useAppState, useStoreHydrated } from "@/lib/store";
import {
  decideRequest,
  dismissPolicyBanner,
  markPolicyBannerSeen,
  setSharing,
} from "@/lib/actions";
import { addDays, effectiveStatus, formatDate, latestPolicy, requestExpiry } from "@/lib/domain";
import type { AccessRequest, AppState, Certificate, Learner } from "@/lib/types";
import { CertificatePreview } from "@/components/verify/CertificatePreview";
import { LevelBadge } from "@/components/verify/LevelBadge";
import { NewerVersionNotice, SourceBadge } from "@/components/verify/ResultPanels";
import { StatusBadge } from "@/components/site/StatusBadges";

type Search = { learner?: string };

export const Route = createFileRoute("/learner")({
  validateSearch: (s: Record<string, unknown>): Search =>
    typeof s["learner"] === "string" ? { learner: s["learner"] } : {},
  head: () => ({
    meta: [
      { title: "Learner area · Career-180" },
      {
        name: "description",
        content: "Your certificate, sharing settings and access requests.",
      },
      { property: "og:title", content: "Learner area · Career-180" },
      {
        property: "og:description",
        content: "Track your Career-180 certificate and who can see your results.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LearnerPage,
});

function LearnerPage() {
  const s = useAppState();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/learner" });
  const [certificateOpen, setCertificateOpen] = useState(false);

  const pendingLearnerId = s.accessRequests.find(
    (request) => effectiveStatus(request, s.today) === "pending",
  )?.learnerId;
  // Keep the demo learner stable: approving a request must not jump to someone else.
  const [defaultLearnerId] = useState(
    () => search.learner ?? pendingLearnerId ?? s.learners[0]!.id,
  );
  const learner =
    s.learners.find((entry) => entry.id === (search.learner ?? defaultLearnerId)) ?? s.learners[0]!;
  const cert = s.certificates.find((entry) => entry.learnerId === learner.id);
  const requests = s.accessRequests
    .filter((request) => request.learnerId === learner.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const pendingRequests = requests.filter(
    (request) => effectiveStatus(request, s.today) === "pending",
  );

  useEffect(() => {
    setCertificateOpen(false);
  }, [learner.id]);

  const courseNameForRequest = (request: AccessRequest) => {
    const requestCert = s.certificates.find((entry) => entry.id === request.certId);
    const requestCourse = requestCert
      ? s.courses.find((entry) => entry.id === requestCert.courseId)
      : undefined;
    return requestCourse?.name ?? requestCert?.courseId ?? "Course";
  };

  const approveRequest = (request: AccessRequest) => {
    act((draft) => decideRequest(draft, request.id, true));
    toast.success(`Access approved until ${formatDate(addDays(s.today, 14))}.`);
  };

  const declineRequest = (request: AccessRequest) => {
    act((draft) => decideRequest(draft, request.id, false));
    toast("Access request declined.");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Learner area · demo view
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{learner.name}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            This is the learner side of Career-180: the certificate they earned, who can see their
            results, and every request for access.
          </p>
          <div className="mt-3">
            <SourceBadge company={learner.company} />
          </div>
        </div>
        <div className="grid w-full gap-1.5 sm:w-72">
          <Label>Demo learner login</Label>
          <Select
            value={learner.id}
            onValueChange={(value) => void navigate({ search: { learner: value } })}
          >
            <SelectTrigger aria-label="Choose learner">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {s.learners.map((entry) => (
                <SelectItem key={entry.id} value={entry.id}>
                  {entry.name} · {s.certificates.find((item) => item.learnerId === entry.id)?.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DemoBanner learner={learner} />

      {pendingRequests[0] && (
        <PendingRequestSpotlight
          request={pendingRequests[0]}
          courseName={courseNameForRequest(pendingRequests[0])}
          today={s.today}
          onApprove={() => approveRequest(pendingRequests[0]!)}
          onDecline={() => declineRequest(pendingRequests[0]!)}
        />
      )}

      <PolicyBanner s={s} learner={learner} />

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {cert ? (
            <CertificatesCard cert={cert} s={s} onOpen={() => setCertificateOpen(true)} />
          ) : (
            <section className="panel p-6 text-sm text-muted-foreground">
              No certificate is attached to this learner yet.
            </section>
          )}
          <SharingCard learner={learner} />
        </div>
        <div className="space-y-5">
          <RequestsInbox
            requests={requests}
            today={s.today}
            courseNameForRequest={courseNameForRequest}
            onApprove={approveRequest}
            onDecline={declineRequest}
          />
        </div>
      </div>

      {cert && (
        <CertificateDialog
          cert={cert}
          s={s}
          open={certificateOpen}
          onOpenChange={setCertificateOpen}
        />
      )}
    </div>
  );
}

function DemoBanner({ learner }: { learner: Learner }) {
  return (
    <div className="panel-info mt-6 flex items-start gap-3.5 p-4 sm:p-5">
      <div className="grid h-9 w-9 flex-none place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
        <UserRound className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">You are demoing as a learner</p>
          <Badge variant="info">Learner view</Badge>
        </div>
        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
          You are seeing <span className="font-semibold text-foreground">{learner.name}</span>
          &apos;s own certificate. Open it to view, download or add it to LinkedIn, choose what
          employers can see, and review access requests below.
        </p>
      </div>
    </div>
  );
}

function PendingRequestSpotlight({
  request,
  courseName,
  today,
  onApprove,
  onDecline,
}: {
  request: AccessRequest;
  courseName: string;
  today: string;
  onApprove: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-warning/35 bg-warning/[0.07] p-4 shadow-card sm:flex-row sm:items-start sm:justify-between sm:p-5">
      <div className="flex items-start gap-3.5">
        <div className="grid h-9 w-9 flex-none place-items-center rounded-xl border border-warning/30 bg-warning/10 text-warning">
          <Bell className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">{request.requester} requested access</p>
            <Badge variant="warning">
              <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-warning" />
              Pending approval
            </Badge>
          </div>
          <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
            <span className="font-semibold text-foreground">{request.email}</span> from{" "}
            <span className="font-semibold text-foreground">{request.requester}</span> asked to view
            the results for <span className="font-semibold text-foreground">{courseName}</span>.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <Clock3 className="h-3 w-3" />
            Sent {formatDate(request.createdAt)} · {sentLabel(request.createdAt, today)}
            <span className="opacity-40">·</span>
            <span>Certificate {request.certId}</span>
          </div>
          <p className="mt-2 max-w-xl text-[11px] leading-5 text-warning/70">
            Approving shares the assessment evidence for 14 days. Validity and level stay visible
            either way.
          </p>
        </div>
      </div>
      <div className="flex flex-none gap-2 sm:pl-4">
        <Button size="sm" variant="success" onClick={onApprove}>
          <Check /> Approve
        </Button>
        <Button size="sm" variant="outline" onClick={onDecline}>
          <X /> Decline
        </Button>
      </div>
    </div>
  );
}

function PolicyBanner({ s, learner }: { s: AppState; learner: Learner }) {
  const hydrated = useStoreHydrated();
  const latest = latestPolicy(s.policies);
  const show = latest.version > (learner.policyAck ?? 0);
  useEffect(() => {
    if (hydrated && show) act((d) => markPolicyBannerSeen(d, learner.id));
  }, [hydrated, show, learner.id]);
  if (!show) return null;
  return (
    <div className="panel-info mt-5 flex gap-3 p-4">
      <Bell className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <div className="flex-1 text-sm">
        <p className="font-semibold">
          Our certificate policy changed: v{latest.version} · {latest.name} (from{" "}
          {formatDate(latest.effectiveFrom)})
        </p>
        <p className="mt-1 text-muted-foreground">{latest.summary}</p>
        <p className="mt-2 text-muted-foreground">
          This is for your information only; nothing changes on your certificate. You can review who
          sees your results in the{" "}
          <a href="#sharing" className="text-primary underline-offset-4 hover:underline">
            sharing setting
          </a>
          .
        </p>
      </div>
      <button
        onClick={() => act((d) => dismissPolicyBanner(d, learner.id))}
        aria-label="Dismiss policy notice"
        className="h-fit rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function CertificatesCard({
  s,
  cert,
  onOpen,
}: {
  s: AppState;
  cert: Certificate;
  onOpen: () => void;
}) {
  const course = s.courses.find((entry) => entry.id === cert.courseId)!;
  return (
    <section className="panel p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Your certificates
          </p>
          <h2 className="mt-1 text-xl font-semibold">{course.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Certificate ID <span className="font-mono text-foreground">{cert.id}</span> · v
            {cert.courseVersion} · Issued {formatDate(cert.issuedAt)}
          </p>
        </div>
        <LevelBadge state={cert.state} />
      </div>

      <div className="mt-4 space-y-3">
        <NewerVersionNotice cert={cert} s={s} />
        {cert.state === "Revoked" && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
            This certificate was revoked on {formatDate(cert.revoked?.date ?? "")}. Revocation is
            final.
          </p>
        )}
      </div>

      <div className="mt-5 grid gap-3 rounded-xl border border-border bg-muted/40 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-brand">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">Your certificate is ready to view</p>
            <p className="text-xs text-muted-foreground">
              Preview it, download it or share it on LinkedIn. These actions are mocked in the
              prototype.
            </p>
          </div>
        </div>
        <Button variant="brand" size="sm" onClick={onOpen}>
          <Eye /> View certificate
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <Button asChild variant="ghost" size="sm" className="px-0 text-muted-foreground">
          <Link to="/" search={{ q: cert.id }}>
            See what a verifier sees <ChevronRight />
          </Link>
        </Button>
      </div>
    </section>
  );
}

function SharingCard({ learner }: { learner: Learner }) {
  const isPublic = learner.sharing === "public";
  return (
    <section id="sharing" className="panel scroll-mt-20 p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Share2 className="h-4 w-4 text-primary" />
        <h2 className="font-semibold">Share and settings</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        One privacy setting for all of this learner&apos;s certificates.
      </p>
      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/50 p-4">
        <div>
          <p className="font-medium">{isPublic ? "Results public" : "Results private"}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isPublic
              ? "Any verifier can open the scores and project feedback."
              : "Verifiers see validity and level only, and can request access."}
          </p>
        </div>
        <Switch
          checked={isPublic}
          aria-label="Results public"
          onCheckedChange={(value) => {
            act((d) => setSharing(d, learner.id, value ? "public" : "private"));
            toast.success(value ? "Results are now public." : "Results are now private.");
          }}
        />
      </div>
      <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
        Private hides evidence but keeps validity and level visible. Access requests are listed on
        the right.
      </p>
    </section>
  );
}

function RequestsInbox({
  requests,
  today,
  courseNameForRequest,
  onApprove,
  onDecline,
}: {
  requests: AccessRequest[];
  today: string;
  courseNameForRequest: (request: AccessRequest) => string;
  onApprove: (request: AccessRequest) => void;
  onDecline: (request: AccessRequest) => void;
}) {
  const pending = requests.filter(
    (request) => effectiveStatus(request, today) === "pending",
  ).length;
  return (
    <section className="panel p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-semibold">
          <Inbox className="h-4 w-4 text-primary" /> Access requests
        </h2>
        <Badge variant={pending ? "warning" : "muted"}>{pending} pending</Badge>
      </div>
      {requests.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          No one has asked to see this learner&apos;s results yet.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {requests.map((request) => {
            const status = effectiveStatus(request, today);
            const expiry = requestExpiry(request);
            return (
              <li key={request.id} className="rounded-xl border border-border p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{request.requester}</p>
                    <p className="truncate text-xs text-muted-foreground">{request.email}</p>
                  </div>
                  <StatusBadge status={status} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Results for{" "}
                  <span className="font-medium text-foreground">
                    {courseNameForRequest(request)}
                  </span>
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock3 className="h-3 w-3" />
                  {status === "pending" &&
                    `Sent ${formatDate(request.createdAt)} · ${sentLabel(request.createdAt, today)} · expires ${formatDate(addDays(request.createdAt, 14))}`}
                  {status === "approved" &&
                    `Approved ${formatDate(request.decidedAt ?? request.createdAt)}${expiry ? ` · until ${formatDate(expiry)}` : ""}`}
                  {(status === "declined" || status === "expired") &&
                    `Updated ${formatDate(request.decidedAt ?? request.createdAt)}`}
                </p>
                {status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="success" onClick={() => onApprove(request)}>
                      <Check /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onDecline(request)}>
                      <X /> Decline
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function CertificateDialog({
  cert,
  s,
  open,
  onOpenChange,
}: {
  cert: Certificate;
  s: AppState;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const course = s.courses.find((entry) => entry.id === cert.courseId)!;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Your certificate</DialogTitle>
          <DialogDescription>
            {course.name} · Certificate ID {cert.id}
          </DialogDescription>
        </DialogHeader>
        <CertificatePreview
          learnerName={cert.learnerName}
          courseName={course.name}
          certId={cert.id}
          issuedAt={cert.issuedAt}
          state={cert.state}
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            variant="brand"
            onClick={() => toast("Certificate download is mocked in this prototype.")}
          >
            <Download /> Download certificate
          </Button>
          <Button onClick={() => toast("LinkedIn sharing is mocked in this prototype.")}>
            <Linkedin /> Add to LinkedIn profile
          </Button>
        </div>
        <p className="text-center text-[11px] text-muted-foreground">
          This preview is what the learner can share. Verifiers never see these actions.
        </p>
      </DialogContent>
    </Dialog>
  );
}

function sentLabel(createdAt: string, today: string) {
  const days = daysBetween(createdAt, today);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

function daysBetween(from: string, to: string) {
  const start = Date.parse(`${from.slice(0, 10)}T00:00:00Z`);
  const end = Date.parse(`${to.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.round((end - start) / 86_400_000);
}
