import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

const Main = lazy(() => import("./pages/main/Main"));

const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));

import Sidebar from "./Components/Sidebar/Sidebar";
import LoadingSpinner from "./Components/LoadingSpinner/LoadingSpinner";
import { SocketProvider } from "./context/SocketContext";

const API_URL = "http://localhost:3000";

function App() {
  return (
    <>
      <SocketProvider>
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
              <LoadingSpinner
                strokeColor={"rgb(29, 155, 240)"}
              ></LoadingSpinner>
            }
          >
            <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </Suspense>
        </div>
      </SocketProvider>
    </>
  );
}

export default App;
