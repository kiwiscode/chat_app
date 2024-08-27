import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

const InstantConversationModalContext = createContext();

const InstantConversationModalProvider = ({ children }) => {
  const [searchYourCoworkersModalOpened, setSearchYourCoworkersModalOpened] =
    useState(false);
  const [searchYourFriendsModalOpened, setSearchYourFriendsModalOpened] =
    useState(false);

  useEffect(() => {
    console.log(
      "show your coworkers modal for instant conversation:",
      searchYourCoworkersModalOpened
    );
    console.log(
      "show your friends modal for instant conversation:",
      searchYourFriendsModalOpened
    );
  }, [searchYourCoworkersModalOpened, searchYourFriendsModalOpened]);

  return (
    <InstantConversationModalContext.Provider
      value={{
        searchYourCoworkersModalOpened,
        searchYourFriendsModalOpened,
        setSearchYourCoworkersModalOpened,
        setSearchYourFriendsModalOpened,
      }}
    >
      {children}
    </InstantConversationModalContext.Provider>
  );
};

InstantConversationModalProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { InstantConversationModalContext, InstantConversationModalProvider };
