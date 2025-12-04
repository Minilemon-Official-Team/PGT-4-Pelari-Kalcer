import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitRequest } from "@/features/creatorRequest";
import { getUserId } from "@/lib/auth-actions";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/creator-request")({
  component: RouteComponent,
  beforeLoad: async () => {
    const userId = await getUserId()
    return {
      userId
    }
  },
  loader: async ({ context }) => {
    if (!context?.userId) {
      throw redirect({ to: "/login"})
    }
    return {
      userId: context.userId
    }
  }
});

async function RouteComponent() {
  const {userId} = Route.useLoaderData()
  const navigate = useNavigate();
  const [portfolioLink, setPortfolioLink] = useState("");
  const [motivation, setMotivation] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitRequest = async (e:React.FormEvent) => {
    e.preventDefault()
    const requestPayload = {
        userId,
        portfolioLink,
        motivation
    }
    try {
      setIsLoading(true)
      await submitRequest({data: requestPayload})
      setIsLoading(false)
      await navigate({ to: "/" });
    } catch (error) {
      console.log(error)
    }
  };

  return (
    <div>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8">
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
                type="text"
                value={portfolioLink}
                onChange={(e) => setPortfolioLink(e.target.value)}
                disabled={isLoading}
              />
              {errors.portfolioLink && (
                <p className="text-sm text-red-400 mt-1">
                  {errors.portfolioLink}
                </p>
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
            <h2 className="text-md font-bold text-white mb-6 text-center">
              Pending Requests
            </h2>
            <table className="text-white">
              <tr>
                  <th>User</th>
                  <th>Portfolio Link</th>
                  <th>Actions</th>
              </tr>
              <tr>
                  <td>Anom</td>
                  <td>19</td>
                  <td>Male</td>
              </tr>
              <tr>
                  <td>Megha</td>
                  <td>19</td>
                  <td>Female</td>
              </tr>
              <tr>
                  <td>Subham</td>
                  <td>25</td>
                  <td>Male</td>
              </tr>
            </table>

            <Button type="submit" variant="primary" className="w-full">
              {"Submit"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
