import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

const InstantConversationModalContext = createContext();

const InstantConversationModalProvider = ({ children }) => {
  const [searchYourCoworkersModalOpened, setSearchYourCoworkersModalOpened] =
    useState(false);
  const [searchYourFriendsModalOpened, setSearchYourFriendsModalOpened] =
    useState(false);

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
