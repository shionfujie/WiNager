import {useContext} from "react";
import {StashEntrySourceContext} from "./contexts"

export function useStashEntrySource() {
    return useContext(StashEntrySourceContext)
}