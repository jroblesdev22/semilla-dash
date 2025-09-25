import { auth } from "@/auth"
import { CoursesList } from "@/components/CoursesList"
import { SignInButton } from "@/components/SignInButton"

export default async function Home() {
  const session = await auth()

  return (
    <div className="font-sans min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Google Classroom Dashboard</h1>
        
        {session ? (
          <CoursesList />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <p className="text-lg mb-6">Inicia sesión para ver tus cursos de Google Classroom</p>
            <SignInButton />
          </div>
        )}
      </div>
    </div>
  );
}
