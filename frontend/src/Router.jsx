import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";

export default function Router() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      {/* 登录状态控制 */}
      <Route
        path="/"
        element={token ? <Navigate to="/home" /> : <Navigate to="/login" />}
      />
      <Route
        path="/login"
        element={token ? <Navigate to="/home" /> : <Login />}
      />
      <Route
        path="/register"
        element={token ? <Navigate to="/home" /> : <Register />}
      />
      {/* 登录后页面 */}
      <Route
        path="/home"
        element={token ? <Home /> : <Navigate to="/login" />}
      />
      <Route
        path="/gallery"
        element={token ? <Gallery /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}
