import { SignInButton } from "@/components/SignInButton"
import Image from 'next/image'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Logo y título */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Image
                src="/LOGO-SEMILLERO.png"
                alt="Semillero Digital"
                width={280}
                height={80}
                className="h-16 w-auto"
                priority
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Educativo
              </h1>
              <p className="text-gray-600">
                Accede con tu cuenta de Google para continuar
              </p>
            </div>
          </div>

          {/* Botón de login */}
          <div className="space-y-4">
            <SignInButton />
            
            {/* Texto legal */}
            <p className="text-xs text-gray-500 text-center">
              Al continuar, aceptas nuestros{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Términos de Servicio
              </a>{' '}
              y{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Política de Privacidad
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2024 Semillero Digital. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
