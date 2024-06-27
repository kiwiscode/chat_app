import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./Components/Sidebar/Sidebar";
import LoadingSpinner from "./Components/LoadingSpinner/LoadingSpinner";
import { SocketProvider } from "./context/SocketContext";
import { ThemeProvider } from "./context/ThemeContext";
import Main from "./pages/main/Main";
import Dashboard from "./pages/dashboard/Dashboard";

function App() {
  return (
    <>
      <ThemeProvider>
        <SocketProvider>
          <div className="w-100 h-100dvh ov-x-hid ov-y-auto color-schm-l">
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
      </ThemeProvider>
    </>
  );
}

export default App;
