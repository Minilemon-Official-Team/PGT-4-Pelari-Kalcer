import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import type { RouterContext } from "@/router";

import appCss from "../styles/app.css?url";

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
  const [devtools, setDevtools] = useState<ReactNode | null>(null);

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return;
    }

    void Promise.all([
      import("@tanstack/react-devtools"),
      import("@tanstack/react-router-devtools"),
      import("@tanstack/react-query-devtools"),
    ]).then(([devtoolsModule, routerDevtoolsModule, queryDevtoolsModule]) => {
      setDevtools(
        <devtoolsModule.TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "TanStack Router",
              render: <routerDevtoolsModule.TanStackRouterDevtoolsPanel />,
            },
            {
              name: "TanStack Query",
              render: <queryDevtoolsModule.ReactQueryDevtoolsPanel />,
            },
          ]}
        />,
      );
    });
  }, []);

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Navbar />
        {children}
        {devtools}
        <Scripts />
      </body>
    </html>
  );
}
