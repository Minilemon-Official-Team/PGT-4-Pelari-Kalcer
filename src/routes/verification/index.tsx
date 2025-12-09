import { createFileRoute, redirect } from "@tanstack/react-router";
import { BadgeCheck, ChevronDown, ChevronRight, Clock, XCircle } from "lucide-react";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth-actions";

type RequestRow = {
  id: string;
  name: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  note?: string;
  motivation: string;
  portfolio: string;
};

const mockRequests: RequestRow[] = [
  {
    id: "1",
    name: "charlie_photo",
    submittedAt: "2024-10-05",
    status: "approved",
    note: "Portfolio verified",
    motivation: "Covering community races weekly",
    portfolio: "https://runcam.dev/charlie",
  },
  {
    id: "2",
    name: "diana_lens",
    submittedAt: "2024-11-12",
    status: "pending",
    note: "Reviewing sample set",
    motivation: "Share Bali triathlons",
    portfolio: "https://photos.example.com/diana",
  },
  {
    id: "3",
    name: "alex_runner",
    submittedAt: "2024-09-28",
    status: "rejected",
    note: "Insufficient links",
    motivation: "Want to tag friends",
    portfolio: "https://drive.example.com/alex",
  },
];

export const Route = createFileRoute("/verification/")({
  beforeLoad: async () => {
    const session = await getAuthSession();
    if (!session?.user) {
      throw redirect({ to: "/login", search: { redirect: "/verification" } });
    }
    return { session };
  },
  component: VerificationPage,
});

function VerificationPage() {
  const { session } = Route.useRouteContext();
  const role = (session?.user as { role?: string } | undefined)?.role ?? "member";
  const [openRow, setOpenRow] = useState<string | null>(null);

  const roleCta = (() => {
    if (role === "creator") {
      return {
        label: "Creator badge active",
        variant: "secondary" as const,
        className: "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
      };
    }
    if (role === "admin") {
      return {
        label: "Review requests",
        variant: "secondary" as const,
        className:
          "bg-(--accent)/10 text-(--accent-strong) border border-(--accent)/30 hover:bg-(--accent)/20",
      };
    }
    return { label: "Request creator badge", variant: "primary" as const };
  })();

  return (
    <DashboardLayout session={session}>
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-(--text-muted)">Verification</p>
          <h1 className="text-2xl font-semibold">Creator badge</h1>
          <p className="text-(--text-muted)">
            Show runners you are a trusted uploader and keep requests moving.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-1">
            <p className="text-sm text-(--text-muted)">Next steps</p>
            <p className="text-base font-medium">Apply or review in one place</p>
            <p className="text-sm text-(--text-muted)">
              Share your links, then we will confirm and badge your profile.
            </p>
          </div>
          <Button variant={roleCta.variant} className={roleCta.className}>
            {roleCta.label}
          </Button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div>
              <p className="text-sm text-(--text-muted)">Recent requests</p>
              <p className="text-base font-medium">Status at a glance</p>
            </div>
            <span className="text-sm text-(--text-muted)">Mock data until backend sync</span>
          </div>
          <div className="divide-y divide-slate-200">
            {mockRequests.map((request) => {
              const isOpen = openRow === request.id;
              return (
                <div key={request.id} className="px-5 py-4">
                  <button
                    type="button"
                    className="w-full flex items-center gap-4 text-sm text-left rounded-lg hover:bg-slate-50 px-2 py-2"
                    onClick={() => setOpenRow(isOpen ? null : request.id)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-(--text-muted)" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-(--text-muted)" />
                      )}
                      <div>
                        <p className="font-medium text-(--text-primary)">{request.name}</p>
                        <p className="text-(--text-muted)">Submitted {request.submittedAt}</p>
                      </div>
                    </div>
                    <StatusPill status={request.status} />
                    <p className="text-(--text-muted) w-48 truncate text-right">{request.note}</p>
                  </button>
                  {isOpen && (
                    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm space-y-2">
                      <div>
                        <p className="text-(--text-muted)">Motivation</p>
                        <p className="font-medium text-(--text-primary)">{request.motivation}</p>
                      </div>
                      <div>
                        <p className="text-(--text-muted)">Portfolio</p>
                        <a
                          href={request.portfolio}
                          className="text-(--accent-strong) font-medium hover:underline break-all"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {request.portfolio}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatusPill({ status }: { status: RequestRow["status"] }) {
  const base = "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold";
  if (status === "approved") {
    return (
      <span className={`${base} bg-emerald-50 text-emerald-700 border border-emerald-100`}>
        <BadgeCheck className="h-4 w-4" /> Approved
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className={`${base} bg-amber-50 text-amber-700 border border-amber-100`}>
        <Clock className="h-4 w-4" /> Pending
      </span>
    );
  }
  return (
    <span className={`${base} bg-rose-50 text-rose-700 border border-rose-100`}>
      <XCircle className="h-4 w-4" /> Rejected
    </span>
  );
}
