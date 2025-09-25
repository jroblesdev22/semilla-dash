import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { SignInButton } from '@/components/SignInButton'

export default async function Page() {
  const session = await auth()

  if (!session) {
    return (
      <main className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Google Classroom Dashboard</h1>
        <SignInButton />
      </main>
    )
  }

  // Si el usuario está autenticado, redirigir al dashboard
  return redirect('/dashboard')
}
