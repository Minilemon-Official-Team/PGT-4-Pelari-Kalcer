import { createFileRoute, redirect, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  approveRequest,
  listAllRequests,
  rejectRequest,
  submitRequest,
} from "@/features/creatorRequest";
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
    const creatorRequests = await listAllRequests();
    if (!context?.userId) {
      throw redirect({ to: "/login" });
    }
    return {
      userId: context.userId,
      role: context.role,
      creatorRequests,
    };
  },
});

async function RouteComponent() {
  const { userId, role, creatorRequests } = Route.useLoaderData();
  const [portfolioLink, setPortfolioLink] = useState("");
  const [motivation, setMotivation] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasAdminPermission, setHasAdminPermission] = useState(false);

  const router = useRouter();
  const navigate = useNavigate();
  const isMember = role === "member";

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
    const requestPayload = {
      userId,
      portfolioLink,
      motivation,
    };
    try {
      setIsLoading(true);
      await submitRequest({ data: requestPayload });
      setIsLoading(false);
      await navigate({ to: "/" });
    } catch (error) {
      if (error instanceof Error) console.log(error);
    }
  };

  const handleApproval = async (requesterId: string, requestId: string) => {
    const approvalPayload = {
      requesterId,
      requestId,
      reviewerId: userId,
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
      reviewerId: userId,
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
        {isMember && (
          <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8">
            <div>
              <h1 className="text-2xl font-bold text-white mb-6 text-center">Become a Creator</h1>
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
                    type="text"
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
                  <Input
                    id="motivation"
                    type="motivation"
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.motivation && (
                    <p className="text-sm text-red-400 mt-1">{errors.motivation}</p>
                  )}
                </div>

                <Button type="submit" variant="primary" className="w-full">
                  {"Submit"}
                </Button>
              </form>
            </div>
          </div>
        )}
        {hasAdminPermission && (
          <div className="bg-teal-900 relative flex flex-col shadow-md rounded-xl bg-clip-border">
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
                <th
                  className="p-4 border-b border-blue-gray-100 bg-blue-gray-50 text-center"
                  colSpan={2}
                >
                  <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                    Actions
                  </p>
                </th>
              </tr>
              {creatorRequests?.map((cr) => (
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
                    <Button
                      onClick={() => handleApproval(cr.requesterId ?? "", cr.requestId ?? "")}
                      variant="primary"
                      className="bg-green-600 text-white"
                    >
                      {"Approve"}
                    </Button>
                  </td>
                  <td className="p-4 border-blue-gray-50">
                    <Button
                      onClick={() => handleRejection(cr.requestId ?? "")}
                      variant="primary"
                      className="bg-red-600 text-white"
                    >
                      {"Reject"}
                    </Button>
                  </td>
                </tr>
              ))}
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
