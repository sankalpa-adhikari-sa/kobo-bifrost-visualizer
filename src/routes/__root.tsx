import * as React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Provider } from "jotai";
export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <React.Fragment>
      <Provider>
        <Toaster />
        <Outlet />
      </Provider>
    </React.Fragment>
  );
}
