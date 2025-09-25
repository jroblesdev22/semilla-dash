"use client"
import { signOut } from "next-auth/react"

export function SignOutButton() {
  return (
    <button 
      onClick={() => signOut()}
      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
    >
      Cerrar Sesión
    </button>
  )
}