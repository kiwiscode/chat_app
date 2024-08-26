import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

const SearchPeopleModalContext = createContext();

const SearchPeopleModalProvider = ({ children }) => {
  const [searchPeopleModalOpened, setSearchPeopleModalOpened] = useState(false);

  useEffect(() => {
    console.log(
      "global context search people modal status:",
      searchPeopleModalOpened
    );
  }, [searchPeopleModalOpened]);

  return (
    <SearchPeopleModalContext.Provider
      value={{ searchPeopleModalOpened, setSearchPeopleModalOpened }}
    >
      {children}
    </SearchPeopleModalContext.Provider>
  );
};

SearchPeopleModalProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { SearchPeopleModalContext, SearchPeopleModalProvider };
