"use client"
import { SessionProvider } from "next-auth/react";
function SesstionProvider({children}:{children:React.ReactNode}) {
  return <SessionProvider>{children}</SessionProvider>;
}

export default SesstionProvider