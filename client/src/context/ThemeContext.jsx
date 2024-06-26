import { createContext, useState, useEffect } from "react";

const themes = {
  dark: {
    backgroundColor: "black",
  },
  light: {
    backgroundColor: "white",
  },
  cyberpunk: {
    backgroundColor: "#FFF248",
  },
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState("light-theme");

  useEffect(() => {
    const storedTheme = localStorage.getItem("themeName");
    if (storedTheme) {
      setThemeName(storedTheme);
    }
  }, []);

  const toggleTheme = (theme) => {
    if (theme === "light-theme") {
      console.log("Function is working first condition !");

      localStorage.setItem("themeName", "light-theme");
      setThemeName("light-theme");
    } else if (theme === "dark-theme") {
      console.log("Function is working second condition !");

      localStorage.setItem("themeName", "dark-theme");
      setThemeName("dark-theme");
    } else if (theme === "cyber-punk-theme") {
      console.log("Function is working third condition !");

      localStorage.setItem("themeName", "light-theme");
      setThemeName("cyber-punk-theme");
    }
  };

  const theme =
    themeName === "light-theme"
      ? themes.light
      : themeName === "dark-theme"
      ? themes.dark
      : themeName === "cyber-punk-theme"
      ? themes.cyberpunk
      : {};

  useEffect(() => {
    const storedTheme = localStorage.getItem("themeName");
    if (storedTheme) {
      setThemeName(storedTheme);
    } else {
      localStorage.setItem("themeName", themeName);
    }
  }, []);

  return (
    <ThemeContext.Provider value={[{ theme, themeName }, toggleTheme]}>
      {children}
    </ThemeContext.Provider>
  );
};
