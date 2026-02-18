import MainLayout from "@/components/Layout/MainLayout";
import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { PATHS } from "./paths";

const Home = lazy(() => import("@/pages/Home"));
const AIChat = lazy(() => import("@/pages/AIChat"));
const SignatureTest = lazy(() => import("@/pages/SignatureTest"));

// Route objects used to render nested routes in router/index.tsx
export const routeConfig: RouteObject[] = [
  {
    path: PATHS.HOME,
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: PATHS.SIGNATURE_TEST, element: <SignatureTest /> },
    ],
  },
];

export default routeConfig;