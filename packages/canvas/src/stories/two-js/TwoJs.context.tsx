import { createContext } from "react";

import {TwoJsContextType} from "./TwoJs.types"

export const TwoJsContext = createContext<TwoJsContextType>(undefined);