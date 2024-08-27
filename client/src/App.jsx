import { Suspense, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./Components/Sidebar/Sidebar";
import LoadingSpinner from "./Components/LoadingSpinner/LoadingSpinner";
import { SocketProvider } from "./context/SocketContext";
import { ThemeProvider } from "./context/ThemeContext";
import Main from "./pages/main/Main";
import Dashboard from "./pages/dashboard/Dashboard";
import { useUser } from "./context/UserContext";
import { SearchPeopleModalProvider } from "./context/SearchPeopleModalContext";
import { InstantConversationModalProvider } from "./context/InstantConversationModalContext";
//
function App() {
  const { isAuthenticatedUser } = useUser();

  return (
    <>
      <ThemeProvider>
        <SocketProvider>
          <SearchPeopleModalProvider>
            <InstantConversationModalProvider>
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
                    <Route
                      path="/"
                      element={
                        isAuthenticatedUser ? (
                          <Navigate to="/dashboard" />
                        ) : (
                          <Main />
                        )
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        isAuthenticatedUser ? (
                          <Dashboard />
                        ) : (
                          <Navigate to="/" />
                        )
                      }
                    />
                  </Routes>
                </Suspense>
              </div>
            </InstantConversationModalProvider>
          </SearchPeopleModalProvider>
        </SocketProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
