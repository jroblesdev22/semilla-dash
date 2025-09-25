"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useStudents } from "@/hooks/use-students"
import { CourseSelector } from "@/components/course-selector"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function Page() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>()
  const { students, courses, loading, error, refetch } = useStudents(selectedCourseId)

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6 space-y-6">
                <ChartAreaInteractive />
                <CourseSelector 
                  selectedCourseId={selectedCourseId}
                  onCourseChange={setSelectedCourseId}
                />
              </div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    Cargando datos de estudiantes de Google Classroom...
                  </p>
                </div>
              ) : error ? (
                <div className="px-4 lg:px-6">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>Error al cargar los datos: {error}</span>
                      <Button variant="outline" size="sm" onClick={refetch}>
                        Reintentar
                      </Button>
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <DataTable data={students} onRefresh={refetch} />
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
