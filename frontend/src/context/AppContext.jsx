import { createContext, useState } from "react";

export const AppContext = createContext()
export const AppProvider = ()=>{

    const [user, setUser] = useState(nulll)
    return(
        <AppContext.Provider value={user}>
            {children}
        </AppContext.Provider>
    )
}