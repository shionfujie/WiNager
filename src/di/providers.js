import React from "react";
import { StashEntrySourceContext } from "./contexts";
import StashEntrySource from "../data/source/StashEntrySource";

export function StashEntrySourceProvider({ children }) {
  return (
    <StashEntrySourceContext.Provider value={StashEntrySource()}>
      {children}
    </StashEntrySourceContext.Provider>
  );
}
