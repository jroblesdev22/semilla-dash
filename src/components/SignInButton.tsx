"use client"
import { signIn } from "next-auth/react"

export function SignInButton() {
  return (
    <button 
      onClick={() => signIn("google")}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
    >
      Sign in with Google
    </button>
  )
}