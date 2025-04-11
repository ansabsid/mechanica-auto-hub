
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";
import Garages from "@/pages/Garages";
import CustomerDashboard from "@/pages/CustomerDashboard";
import GarageDashboard from "@/pages/GarageDashboard";
import OrdersPage from "@/pages/OrdersPage";
import OrdersListPage from "@/pages/OrdersListPage";
import Checkout from "@/pages/Checkout";
import CategoryPage from "@/components/categories/CategoryPage";

import "./App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/garages",
    element: <Garages />,
  },
  {
    path: "/customer-dashboard",
    element: <CustomerDashboard />,
  },
  {
    path: "/garage-dashboard",
    element: <GarageDashboard />,
  },
  {
    path: "/orders/:orderId",
    element: <OrdersPage />,
  },
  {
    path: "/orders",
    element: <OrdersListPage />,
  },
  {
    path: "/checkout",
    element: <Checkout />,
  },
  {
    path: "/categories",
    element: <CategoryPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
