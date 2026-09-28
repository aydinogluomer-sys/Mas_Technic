import { createContext, useContext } from "react";

/** The page's rail code (`C1 / KURUMSAL`), published by `PageShell` so the
 *  inner hero can set it as its ghost numeral once the bands own the rail. */
export const PageRailContext = createContext<{ no: string; label: string } | undefined>(undefined);
export const usePageRail = () => useContext(PageRailContext);
