"use client"
import { signIn } from "next-auth/react"
import { auth, signOut } from "@/auth"

export default async function Home() {
  const session = await auth()
  console.log(session)
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <button onClick={() => signIn("google")}>Sign in with Google</button>
    </div>
  );
}
