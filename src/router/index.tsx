import React from "react";
import { Outlet, Route, Routes } from "react-router-dom";

import { AuthProvider } from "../hooks/useAuth";

import NotFoundPage from "../pages/NotFound";

import Navbar from "../components/Navbar";
import RequireAuth from "../components/Router/RequireAuth";

import routes from "./routes";

function Layout() {
  return (
    <>
      <Navbar />

      <Outlet />
    </>
  );
}

const Router: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />} errorElement={<div>404</div>}>
          {routes.map((route) => (
            <Route
              {...route}
              key={route.path}
              element={
                route.auth ? (
                  <RequireAuth roleLevel={Number(route.roleLevel)}>
                    {route.element}
                  </RequireAuth>
                ) : (
                  route.element
                )
              }
            />
          ))}

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default Router;
