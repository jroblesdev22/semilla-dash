import Image from "next/image"
import { SignOutButton } from "./SignOutButton"

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        {/* Logo de semillero optimizado con Next.js Image */}
        <div className="relative h-16 w-16 flex-shrink-0 flex items-center justify-center">
          <Image
            src="/LOGO-SEMILLERO.png"
            alt="Logo Semillero"
            width={64}
            height={64}
            className="object-contain rounded-lg"
            priority
          />
        </div>
        <h1 className="text-base font-medium">Dashboard - Estudiantes</h1>
        <div className="ml-auto flex items-center gap-2">
          <SignOutButton />
        </div>
      </div>
    </header>
  )
}
