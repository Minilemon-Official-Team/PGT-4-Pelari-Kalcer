import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { BadgeCheck, ChevronDown, ChevronRight, Clock, XCircle } from "lucide-react";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type CreatorRequestPopulated,
  submitCreatorRequestContract,
} from "@/contracts/creator-request.contract";
import {
  approveRequest,
  listAllApprovedRequests,
  listAllPendingRequests,
  listAllRejectedRequests,
  listOwnRequests,
  rejectRequest,
  submitRequest,
} from "@/features/creator-request/server";
import { getAuthSession } from "@/lib/auth-actions";

export const Route = createFileRoute("/verification/")({
  beforeLoad: async () => {
    const session = await getAuthSession();
    if (!session?.user) {
      throw redirect({ to: "/login", search: { redirect: "/verification" } });
    }
    return { session };
  },
  loader: async ({ context }) => {
    if (context.session.user.role === "admin") {
      const pendingRequests = await listAllPendingRequests();
      const approvedRequests = await listAllApprovedRequests();
      const rejectedRequests = await listAllRejectedRequests();
      return {
        pendingRequests,
        approvedRequests,
        rejectedRequests,
      };
    }
    const ownRequests = await listOwnRequests();
    return { ownRequests };
  },
  component: VerificationPage,
});

function VerificationPage() {
  const { session } = Route.useRouteContext();
  const { pendingRequests, approvedRequests, rejectedRequests, ownRequests } =
    Route.useLoaderData();
  const role = session?.user?.role ?? "member";
  const [openRow, setOpenRow] = useState<string | null>(null);

  const roleCta = (() => {
    if (role === "creator") {
      return {
        label: "Creator badge active",
        variant: "secondary" as const,
        isAdmin: false,
        stepInstruction: "You are already verified",
        className:
          "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700",
      };
    }
    if (role === "admin") {
      return {
        label: "Review requests",
        variant: "outline" as const,
        isAdmin: true,
        stepInstruction: "Review requests in one place",
        className:
          "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 hover:text-primary",
      };
    }
    return {
      label: "Request creator badge",
      variant: "default" as const,
      isAdmin: false,
      stepInstruction: "Apply or review in one place",
      isMember: true,
    };
  })();

  return (
    <DashboardLayout session={session}>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Creator Verification</h1>
          <p className="text-sm text-muted-foreground">
            Apply for creator access or review pending requests.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Next steps</p>
            <p className="text-base font-medium">{roleCta.stepInstruction}</p>
            {roleCta.isMember && (
              <p className="text-sm text-muted-foreground">
                Share your portfolio links. We'll review your profile and grant the badge.
              </p>
            )}
          </div>
          <Button variant={roleCta.variant} className={roleCta.className} disabled>
            {roleCta.label}
          </Button>
          {roleCta.isMember && <VerificationForm />}
        </div>

        {!roleCta.isAdmin && (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <div>
                <p className="text-sm text-muted-foreground">Recent requests</p>
                <p className="text-base font-medium">Status at a glance</p>
              </div>
              <span className="text-sm text-muted-foreground">{`${ownRequests?.length} requests`}</span>
            </div>
            <div className="divide-y divide-slate-200">
              {ownRequests?.map((request) => {
                const isOpen = openRow === request.id;
                return (
                  <div key={request.id} className="px-6 py-4">
                    <button
                      type="button"
                      className="w-full flex items-center gap-4 text-sm text-left rounded-lg hover:bg-slate-50 px-2 py-2"
                      onClick={() => setOpenRow(isOpen ? null : request.id)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-foreground">{request.name}</p>
                          <p className="text-muted-foreground">
                            Submitted {request.createdAt?.toLocaleDateString("en-GB")}
                          </p>
                        </div>
                      </div>
                      <StatusPill status={request.status} />
                      <p className="hidden sm:block text-muted-foreground w-48 truncate text-right">
                        {request.note}
                      </p>
                    </button>
                    {isOpen && (
                      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm space-y-2">
                        <div>
                          <p className="text-muted-foreground">Reason for Application</p>
                          <p className="font-medium text-foreground">{request.motivation}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Portfolio Link</p>
                          <a
                            href={request.portfolioLink ?? ""}
                            className="text-primary font-medium hover:underline break-all"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {request.portfolioLink}
                          </a>
                        </div>
                        {request.note && (
                          <div className="">
                            <p className="text-muted-foreground">Admin Feedback</p>
                            <p className="font-medium text-foreground">{request.note}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {roleCta.isAdmin && (
          <div className="space-y-6">
            <RequestList requests={pendingRequests} label={"Pending"} />
            <RequestList requests={approvedRequests} label={"Approved"} />
            <RequestList requests={rejectedRequests} label={"Rejected"} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatusPill({ status }: { status: CreatorRequestPopulated["status"] }) {
  const base = "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold";
  if (status === "approved") {
    return (
      <span className={`${base} bg-emerald-50 text-emerald-700 border border-emerald-100`}>
        <BadgeCheck className="h-4 w-4" /> <span className="hidden sm:inline">Approved</span>
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className={`${base} bg-amber-50 text-amber-700 border border-amber-100`}>
        <Clock className="h-4 w-4" /> <span className="hidden sm:inline">Pending</span>
      </span>
    );
  }
  return (
    <span className={`${base} bg-rose-50 text-rose-700 border border-rose-100`}>
      <XCircle className="h-4 w-4" /> <span className="hidden sm:inline">Rejected</span>
    </span>
  );
}

function VerificationForm() {
  const [formState, setFormState] = useState({
    portfolioLink: "",
    motivation: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setStatus("idle");
    setError(null);
    const result = submitCreatorRequestContract.safeParse({
      portfolioLink: formState.portfolioLink,
      motivation: formState.motivation,
    });
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          newErrors[String(issue.path[0])] = issue.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    const requestPayload = {
      portfolioLink: formState.portfolioLink,
      motivation: formState.motivation,
    };
    try {
      setIsLoading(true);
      await submitRequest({ data: requestPayload });
      setStatus("success");
      setFormState({ portfolioLink: "", motivation: "" });
      router.invalidate();
    } catch (error) {
      setStatus("error");
      if (error instanceof Error) {
        setError(error.message || "Request submission failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmitRequest} className="bg-white w-md space-y-6">
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="portfolio-link">Portfolio Link</Label>
          <Input
            id="portfolio-link"
            className="bg-muted/50"
            value={formState.portfolioLink}
            type="url"
            disabled={isLoading}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, portfolioLink: event.target.value }))
            }
          />
          {errors.portfolioLink && (
            <p className="text-sm text-red-400 mt-1">{errors.portfolioLink}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="motivation">Reason for Application</Label>
          <Textarea
            id="motivation"
            className="bg-muted/50"
            value={formState.motivation}
            disabled={isLoading}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, motivation: event.target.value }))
            }
            rows={2}
            required
          />
          {errors.motivation && <p className="text-sm text-red-400 mt-1">{errors.motivation}</p>}
        </div>
      </div>

      {status === "success" && (
        <p className="text-sm text-emerald-700">Request submitted successfully.</p>
      )}
      {status === "error" && error && <p className="text-sm text-rose-700">{error}</p>}

      <div className="flex justify-end gap-3">
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Submitting..." : "Submit Request"}
        </Button>
      </div>
    </form>
  );
}

type requestListProps = {
  requests: CreatorRequestPopulated[] | undefined;
  label: string;
};

function RequestList({ requests, label }: requestListProps) {
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [adminAction, setAdminAction] = useState("");
  const router = useRouter();

  const handleApproval = async (userId: string, requestId: string, note: string) => {
    setStatus("idle");
    setError(null);
    const approvalPayload = {
      userId,
      requestId,
      note,
    };
    try {
      setIsLoading(true);
      await approveRequest({ data: approvalPayload });
      setStatus("success");
      setAdminAction("approved");
      setNote("");
      router.invalidate();
    } catch (error) {
      setStatus("error");
      if (error instanceof Error) setError(error.message || "Request approval failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejection = async (requestId: string, note: string) => {
    setStatus("idle");
    setError(null);
    const rejectionPayload = {
      requestId,
      note,
    };
    try {
      setIsLoading(true);
      await rejectRequest({ data: rejectionPayload });
      setStatus("success");
      setAdminAction("rejected");
      setNote("");
      router.invalidate();
    } catch (error) {
      setStatus("error");
      if (error instanceof Error) setError(error.message || "Request rejection failed");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
        <div>
          <p className="text-sm text-muted-foreground">{label} requests</p>
          <p className="text-base font-medium">Status at a glance</p>
        </div>
        {status === "success" && (
          <p className="text-sm text-emerald-700">Request has been {adminAction} successfully.</p>
        )}
        {status === "error" && error && <p className="text-sm text-rose-700">{error}</p>}
        <span className="text-sm text-muted-foreground">{`${requests?.length} requests`}</span>
      </div>
      <div className="divide-y divide-slate-200">
        {requests?.map((request) => {
          const isOpen = openRow === request.id;
          return (
            <div key={request.id} className="px-6 py-4">
              <button
                type="button"
                className="w-full flex items-center gap-4 text-sm text-left rounded-lg hover:bg-slate-50 px-2 py-2"
                onClick={() => setOpenRow(isOpen ? null : request.id)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="min-w-0 text-left">
                    <p className="font-medium text-foreground truncate">{request.name}</p>
                    <p className="text-muted-foreground">
                      Submitted {request.createdAt?.toLocaleDateString("en-GB")}
                    </p>
                  </div>
                </div>
                <StatusPill status={request.status} />
                <p className="hidden sm:block text-muted-foreground w-48 truncate text-right">
                  {request.note}
                </p>
              </button>
              {isOpen && (
                <div className="flex flex-col gap-4 mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-muted-foreground">Reason for Application</p>
                      <p className="font-medium text-foreground">{request.motivation}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Portfolio Link</p>
                      <a
                        href={request.portfolioLink ?? ""}
                        className="text-primary font-medium hover:underline break-all"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {request.portfolioLink}
                      </a>
                    </div>
                    {request.note && (
                      <div className="">
                        <p className="text-muted-foreground">Admin Feedback</p>
                        <p className="font-medium text-foreground">{request.note}</p>
                      </div>
                    )}
                  </div>
                  {label === "Pending" && (
                    <div className="flex flex-col content-center gap-3">
                      <div className="flex justify-center gap-3">
                        <Button
                          onClick={() =>
                            handleApproval(request.userId ?? "", request.id ?? "", note)
                          }
                          className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200 shadow-sm"
                          disabled={isLoading}
                        >
                          {isLoading ? "Approving..." : "Approve"}
                        </Button>
                        <Button
                          onClick={() => handleRejection(request.id ?? "", note)}
                          className="bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-200 shadow-sm"
                          disabled={isLoading}
                        >
                          {isLoading ? "Rejecting..." : "Reject"}
                        </Button>
                      </div>
                      <div className="w-full">
                        <Label htmlFor={`note-${request.id}`} className="sr-only">
                          Feedback
                        </Label>
                        <Textarea
                          id={`note-${request.id}`}
                          className="bg-muted/50"
                          value={note}
                          placeholder="Add feedback (optional)"
                          disabled={isLoading}
                          onChange={(event) => setNote(event.target.value)}
                          rows={3}
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
