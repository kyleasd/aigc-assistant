import { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import routeConfig from "./routes";

function renderRoutes(routes: any[]) {
  return routes.map((r) => {
    if (r.children && r.children.length) {
      return (
        <Route key={r.path || Math.random()} path={r.path} element={r.element}>
          {renderRoutes(r.children)}
        </Route>
      );
    }
    if (r.index) return <Route key={Math.random()} index element={r.element} />;
    return (
      <Route key={r.path || Math.random()} path={r.path} element={r.element} />
    );
  });
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>{renderRoutes(routeConfig)}</Routes>
      </Suspense>
    </BrowserRouter>
  );
}
