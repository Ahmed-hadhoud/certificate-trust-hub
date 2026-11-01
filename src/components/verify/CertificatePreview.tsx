import { Award, BadgeCheck, ShieldCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { formatDate } from "@/lib/domain";
import type { CertState } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  learnerName: string;
  courseName: string;
  certId: string;
  issuedAt?: string;
  state?: CertState;
}

/** Light certificate card rendered in HTML (not an image). */
export function CertificatePreview({
  learnerName,
  courseName,
  certId,
  issuedAt,
  state = "Completed",
}: Props) {
  const verifyUrl = `https://verify.career-180.example/${certId}`;
  const stateStyles =
    state === "Verified"
      ? "border-emerald-700/25 bg-emerald-50 text-emerald-800"
      : state === "Legacy"
        ? "border-amber-700/25 bg-amber-50 text-amber-800"
        : state === "Revoked"
          ? "border-red-700/25 bg-red-50 text-red-800"
          : "border-sky-700/25 bg-sky-50 text-sky-800";
  const stateLabel =
    state === "Verified"
      ? "Completed & Verified"
      : state === "Legacy"
        ? "Legacy completion"
        : state === "Revoked"
          ? "Revoked certificate"
          : "Course completed";

  return (
    <div className="overflow-hidden rounded-2xl border border-[#c9a45c]/45 bg-[#fdfbf5] text-[#15213a] shadow-[0_26px_80px_rgba(0,0,0,0.32)]">
      <div className="h-2 bg-gradient-to-r from-[#102a4c] via-[#2967a8] to-[#c9a45c]" />
      <div className="relative px-5 py-6 sm:px-9 sm:py-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #173b6b 1px, transparent 0), radial-gradient(circle at 22px 22px, #c9a45c 1px, transparent 0)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="pointer-events-none absolute left-3 top-3 h-16 w-16 rounded-tl-xl border-l-2 border-t-2 border-[#c9a45c]/35 sm:left-4 sm:top-4" />
        <div className="pointer-events-none absolute bottom-3 right-3 h-16 w-16 rounded-br-xl border-b-2 border-r-2 border-[#c9a45c]/35 sm:bottom-4 sm:right-4" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#102a4c] to-[#1f548f] shadow-md">
              <span className="font-display text-base font-bold tracking-tight text-[#f7e7bd]">
                C
              </span>
            </span>
            <div>
              <div className="font-display text-[17px] font-bold tracking-[-0.03em] text-[#102a4c]">
                Career-180
              </div>
              <div className="text-[8px] font-semibold uppercase tracking-[0.26em] text-[#8b7547]">
                Verified learning
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-[#d9ccb0] bg-white/70 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-[#7a6a49] sm:inline-flex">
              <ShieldCheck className="h-3 w-3 text-[#1f548f]" />
              Official certificate
            </span>
            <span className="grid h-12 w-12 flex-none place-items-center rounded-full border-2 border-[#c9a45c] bg-[#fff8e7] text-[#9b762d] shadow-sm">
              <Award className="h-6 w-6" />
            </span>
          </div>
        </div>

        <div className="relative mt-7 text-center sm:mt-8">
          <div className="text-[9px] font-bold uppercase tracking-[0.34em] text-[#a27f3d]">
            Certificate of completion
          </div>
          <div className="mt-4 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#7c8799]">
            This is to certify that
          </div>
          <div className="mt-2 font-serif text-[34px] leading-tight tracking-[-0.02em] text-[#102a4c] sm:text-[44px]">
            {learnerName}
          </div>
          <div className="mx-auto mt-3 h-px w-44 bg-gradient-to-r from-transparent via-[#c9a45c] to-transparent" />
          <div className="mt-3 text-[10px] leading-5 text-[#667286] sm:text-[11px]">
            has successfully completed the Career-180 course
          </div>
          <div className="mt-1.5 font-display text-xl font-semibold leading-snug tracking-[-0.02em] text-[#173b6b] sm:text-[23px]">
            {courseName}
          </div>
          <div className="mt-4 flex justify-center">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-[0.13em]",
                stateStyles,
              )}
            >
              <BadgeCheck className="h-3.5 w-3.5" />
              {stateLabel}
            </span>
          </div>
        </div>

        <div className="relative mt-7 grid gap-5 border-t border-[#e2dac7] pt-5 sm:mt-8 sm:grid-cols-[1fr_132px] sm:items-end">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <div className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#9a8b6a]">
                Issue date
              </div>
              <div className="mt-1 text-[12px] font-semibold text-[#263852]">
                {issuedAt ? formatDate(issuedAt) : "—"}
              </div>
            </div>
            <div>
              <div className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#9a8b6a]">
                Certificate ID
              </div>
              <div className="mt-1 font-mono text-[12px] font-bold tracking-[0.08em] text-[#263852]">
                {certId}
              </div>
            </div>
            <div className="col-span-2">
              <div className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#9a8b6a]">
                Issued by
              </div>
              <div className="mt-1 font-serif text-[17px] text-[#173b6b]">Career-180 Learning</div>
              <div className="mt-0.5 text-[8px] text-[#8b95a5]">
                Registered in the Career-180 certificate registry
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1.5 sm:items-end">
            <div className="rounded-xl border border-[#d8d0bf] bg-white p-2 shadow-sm">
              <QRCodeSVG
                value={verifyUrl}
                size={88}
                level="M"
                fgColor="#173b6b"
                bgColor="#ffffff"
              />
            </div>
            <div className="text-center text-[7px] font-bold uppercase tracking-[0.16em] text-[#8b95a5] sm:text-right">
              Scan to verify
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-between gap-1 bg-[#102a4c] px-5 py-2.5 text-[8px] font-medium tracking-[0.06em] text-[#d9e3ef] sm:flex-row sm:px-9">
        <span>Career-180 · Professional certificate</span>
        <span className="text-[#e5ca91]">verify.career-180.example</span>
      </div>
    </div>
  );
}
