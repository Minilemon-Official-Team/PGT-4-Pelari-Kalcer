import { createFileRoute, redirect, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitCreatorRequestContract } from "@/contracts/creator-request.contract";
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
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/creator-request")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    const role = session?.user?.role;
    return {
      userId,
      role,
    };
  },
  loader: async ({ context }) => {
    if (!context?.userId) {
      throw redirect({ to: "/login" });
    }
    const ownRequests = await listOwnRequests();
    const isMember = context.role === "member";
    const isCreator = context.role === "creator";

    if (context.role === "admin") {
      const pendingRequests = await listAllPendingRequests();
      const approvedRequests = await listAllApprovedRequests();
      const rejectedRequests = await listAllRejectedRequests();
      return {
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        isMember,
        isCreator,
      };
    }

    return {
      ownRequests,
      isMember,
      isCreator,
    };
  },
});

function RouteComponent() {
  const { isMember, isCreator, pendingRequests, approvedRequests, rejectedRequests, ownRequests } =
    Route.useLoaderData();
  const [portfolioLink, setPortfolioLink] = useState("");
  const [motivation, setMotivation] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errMesage, setErrMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasAdminPermission, setHasAdminPermission] = useState(false);

  const router = useRouter();
  const navigate = useNavigate();

  useEffect(() => {
    authClient.admin
      .hasPermission({ permission: { creatorRequest: ["list"] } })
      .then(({ data }) => {
        setHasAdminPermission(data?.success ?? false);
      });
  }, []);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = submitCreatorRequestContract.safeParse({ portfolioLink, motivation });
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
      portfolioLink,
      motivation,
    };
    try {
      setIsLoading(true);
      await submitRequest({ data: requestPayload });
      setIsLoading(false);
      await navigate({ to: "/creator-request" });
    } catch (error) {
      if (error instanceof Error)
        setErrMessage("Request submission has failed. Pending request has already exist.");
    }
  };

  const handleApproval = async (requesterId: string, requestId: string) => {
    const approvalPayload = {
      requesterId,
      requestId,
    };
    try {
      setIsLoading(true);
      await approveRequest({ data: approvalPayload });
      setIsLoading(false);
      router.invalidate();
    } catch (error) {
      if (error instanceof Error) console.log(error);
    }
  };

  const handleRejection = async (requestId: string) => {
    const rejectionPayload = {
      requestId,
    };
    try {
      setIsLoading(true);
      await rejectRequest({ data: rejectionPayload });
      setIsLoading(false);
      router.invalidate();
    } catch (error) {
      if (error instanceof Error) console.log(error);
    }
  };

  return (
    <div>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
        {(isMember || isCreator) && (
          <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8 mb-3">
              {isCreator && (
                <div>
                  <h1 className="text-2xl font-bold text-white text-center">
                    You are already verified!
                  </h1>
                </div>
              )}
              {isMember && (
                <div>
                  <h1 className="text-2xl font-bold text-white mb-6 text-center">
                    Become a Creator
                  </h1>
                  <form onSubmit={handleSubmitRequest} className="space-y-4">
                    <div>
                      <label
                        htmlFor="portfolioLink"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Portfolio Link
                      </label>
                      <Input
                        id="portfolioLink"
                        type="url"
                        value={portfolioLink}
                        onChange={(e) => setPortfolioLink(e.target.value)}
                        disabled={isLoading}
                      />
                      {errors.portfolioLink && (
                        <p className="text-sm text-red-400 mt-1">{errors.portfolioLink}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="motivation"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Motivation
                      </label>
                      <textarea
                        id="motivation"
                        className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white shadow-sm transition focus:border-cyan-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
                        value={motivation}
                        onChange={(e) => setMotivation(e.target.value)}
                        disabled={isLoading}
                        rows={4}
                        required
                      />
                      {errors.motivation && (
                        <p className="text-sm text-red-400 mt-1">{errors.motivation}</p>
                      )}
                    </div>
                    <div className="errMessage">
                      {errMesage && <p className="text-sm text-red-400 mt-1">{errMesage}</p>}
                    </div>
                    <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
                      {"Submit"}
                    </Button>
                  </form>
                </div>
              )}
            </div>
            <div className="bg-teal-900 relative flex flex-col shadow-md rounded-xl bg-clip-border">
              <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">Your Requests</h1>
              <table className="w-full text-left table-auto min-w-max text-white border-gray-300">
                <tr>
                  <th className="p-4 border-b border-blue-gray-100 bg-blue-gray-50">
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      Request ID
                    </p>
                  </th>
                  <th className="p-4 border-b border-blue-gray-100 bg-blue-gray-50">
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      Username
                    </p>
                  </th>
                  <th className="p-4 border-b border-blue-gray-100 bg-blue-gray-50">
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      Portfolio URL
                    </p>
                  </th>
                  <th className="p-4 border-b border-blue-gray-100 bg-blue-gray-50">
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      Motivation
                    </p>
                  </th>
                  <th className="p-4 border-b border-blue-gray-100 bg-blue-gray-50 text-center">
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      Status
                    </p>
                  </th>
                </tr>
                {ownRequests?.map((or) => (
                  <tr key={or.requestId}>
                    <td className="p-4 border-blue-gray-50">
                      <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {or.requestId}
                      </p>
                    </td>
                    <td className="p-4 border-blue-gray-50">
                      <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {or.requesterUsername}
                      </p>
                    </td>
                    <td className="p-4 border-blue-gray-50">
                      <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {or.portfolioLink}
                      </p>
                    </td>
                    <td className="p-4 border-blue-gray-50">
                      <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {or.motivation}
                      </p>
                    </td>
                    <td className="p-4 border-blue-gray-50">
                      <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {or.status.toUpperCase()}
                      </p>
                    </td>
                  </tr>
                ))}
              </table>
            </div>
          </div>
        )}
        {hasAdminPermission && (
          <div>
            <div className="bg-teal-900 relative flex flex-col shadow-md rounded-xl bg-clip-border mb-6">
              <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
                Pending Requests
              </h1>
              <table className="w-full text-left table-auto min-w-max text-white border-gray-300">
                <tr>
                  <th className="p-4 border-b border-blue-gray-100 bg-blue-gray-50">
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      User
                    </p>
                  </th>
                  <th className="p-4 border-b border-blue-gray-100 bg-blue-gray-50">
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      Portfolio Link
                    </p>
                  </th>
                  <th className="p-4 border-b border-blue-gray-100 bg-blue-gray-50">
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      Motivation
                    </p>
                  </th>
                  <th
                    className="p-4 border-b border-blue-gray-100 bg-blue-gray-50 text-center"
                    colSpan={2}
                  >
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      Actions
                    </p>
                  </th>
                </tr>
                {pendingRequests?.map((cr) => (
                  <tr key={cr.requestId}>
                    <td className="p-4 border-blue-gray-50">
                      <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {cr.requesterUsername}
                      </p>
                    </td>
                    <td className="p-4 border-blue-gray-50">
                      <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {cr.portfolioLink}
                      </p>
                    </td>
                    <td className="p-4 border-blue-gray-50">
                      <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {cr.motivation}
                      </p>
                    </td>
                    <td className="p-4 border-blue-gray-50">
                      <Button
                        onClick={() => handleApproval(cr.requesterId ?? "", cr.requestId ?? "")}
                        variant="primary"
                        className="bg-green-600 text-white"
                        disabled={isLoading}
                      >
                        {"Approve"}
                      </Button>
                    </td>
                    <td className="p-4 border-blue-gray-50">
                      <Button
                        onClick={() => handleRejection(cr.requestId ?? "")}
                        variant="primary"
                        className="bg-red-600 text-white"
                        disabled={isLoading}
                      >
                        {"Reject"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </table>
            </div>
            <div className="bg-teal-900 relative flex flex-col shadow-md rounded-xl bg-clip-border mb-6">
              <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
                Approved Requests
              </h1>
              <table className="w-full text-left table-auto min-w-max text-white border-gray-300">
                <tr>
                  <th className="p-4 border-b border-blue-gray-100 bg-blue-gray-50">
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      User
                    </p>
                  </th>
                  <th className="p-4 border-b border-blue-gray-100 bg-blue-gray-50">
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      Portfolio Link
                    </p>
                  </th>
                  <th className="p-4 border-b border-blue-gray-100 bg-blue-gray-50">
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      Motivation
                    </p>
                  </th>
                </tr>
                {approvedRequests?.map((cr) => (
                  <tr key={cr.requestId}>
                    <td className="p-4 border-blue-gray-50">
                      <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {cr.requesterUsername}
                      </p>
                    </td>
                    <td className="p-4 border-blue-gray-50">
                      <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {cr.portfolioLink}
                      </p>
                    </td>
                    <td className="p-4 border-blue-gray-50">
                      <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {cr.motivation}
                      </p>
                    </td>
                  </tr>
                ))}
              </table>
            </div>
            <div className="bg-teal-900 relative flex flex-col shadow-md rounded-xl bg-clip-border mb-6">
              <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
                Rejected Requests
              </h1>
              <table className="w-full text-left table-auto min-w-max text-white border-gray-300">
                <tr>
                  <th className="p-4 border-b border-blue-gray-100 bg-blue-gray-50">
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      User
                    </p>
                  </th>
                  <th className="p-4 border-b border-blue-gray-100 bg-blue-gray-50">
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      Portfolio Link
                    </p>
                  </th>
                  <th className="p-4 border-b border-blue-gray-100 bg-blue-gray-50">
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      Motivation
                    </p>
                  </th>
                </tr>
                {rejectedRequests?.map((cr) => (
                  <tr key={cr.requestId}>
                    <td className="p-4 border-blue-gray-50">
                      <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {cr.requesterUsername}
                      </p>
                    </td>
                    <td className="p-4 border-blue-gray-50">
                      <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {cr.portfolioLink}
                      </p>
                    </td>
                    <td className="p-4 border-blue-gray-50">
                      <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {cr.motivation}
                      </p>
                    </td>
                  </tr>
                ))}
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
