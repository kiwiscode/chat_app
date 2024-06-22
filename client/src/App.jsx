import { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

const Main = lazy(() => import("./pages/main/Main"));
const Coworkers = lazy(() =>
  import("./pages/navigation_options/coworkers/Coworkers")
);
const Friends = lazy(() =>
  import("./pages/navigation_options/friends/Friends")
);
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));

import { io } from "socket.io-client";
import Sidebar from "./Components/Sidebar/Sidebar";
import LoadingSpinner from "./Components/LoadingSpinner/LoadingSpinner";
import IsAuthenticatedUser from "./Components/IsAuthenticated/isAuthenticatedUser";
import { useUser } from "./context/UserContext";

const socket = io("http://localhost:3000");

const API_URL = "http://localhost:3000";

function App() {
  const { user, setUser, authToken, setAuthToken, updateUser, testValue } =
    useUser();
  return (
    <>
      <div
        style={{
          width: "100%",
          height: "100dvh",
          colorScheme: "light",
          overflowY: "auto",
        }}
      >
        {" "}
        <Sidebar />
        <Suspense
          fallback={
            <LoadingSpinner strokeColor={"rgb(29, 155, 240)"}></LoadingSpinner>
          }
        >
          <Routes>
            <Route path="/" element={<Main />} />
            <Route
              path="/dashboard"
              element={
                <IsAuthenticatedUser>
                  <Dashboard />
                </IsAuthenticatedUser>
              }
            />
            <Route
              path="/coworkers"
              element={
                <IsAuthenticatedUser>
                  <Coworkers />
                </IsAuthenticatedUser>
              }
            />
            <Route
              path="/friends"
              element={
                <IsAuthenticatedUser>
                  <Friends />
                </IsAuthenticatedUser>
              }
            />{" "}
          </Routes>
        </Suspense>
      </div>
    </>
  );
}

export default App;
