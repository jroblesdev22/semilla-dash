import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconPlus } from "@tabler/icons-react"
import { LuTrash2, LuPencil, LuPlus, LuRefreshCw } from "react-icons/lu"
import { useTeachers } from "@/hooks/use-teachers"
import { useCells } from "@/hooks/use-cells"
import { Teacher } from "@/types/teacher"
import { AssignCellModal } from "@/components/assign-cell-modal"
import { CreateCellRequest, AssignUserToCellRequest } from "@/types/cell"


export function ListTeachers() {
    const { teachers, loading, error, syncTeachers, syncing, refetch: refetchTeachers } = useTeachers()
    const { createCell, assignUserToCell, creating, assigning } = useCells()

    const handleSync = async () => {
        try {
            const result = await syncTeachers()
            alert(`✅ ${result.message}\n\nNuevos profesores: ${result.newTeachers}\nTotal procesados: ${result.totalTeachers}`)
        } catch (error) {
            alert(`❌ Error al sincronizar: ${error instanceof Error ? error.message : 'Error desconocido'}`)
        }
    }

    const handleAssignToCell = async (assignData: AssignUserToCellRequest) => {
        try {
            const result = await assignUserToCell(assignData)
            alert(`✅ ${result.message}`)
            // Refetch teachers to update the UI
            refetchTeachers()
        } catch (error) {
            alert(`❌ Error al asignar a célula: ${error instanceof Error ? error.message : 'Error desconocido'}`)
            throw error // Re-throw to prevent modal from closing
        }
    }

    const handleCreateAndAssignCell = async (cellData: CreateCellRequest) => {
        try {
            const result = await createCell(cellData)
            alert(`✅ ${result.message}`)
            // Refetch teachers to update the UI
            refetchTeachers()
        } catch (error) {
            alert(`❌ Error al crear y asignar célula: ${error instanceof Error ? error.message : 'Error desconocido'}`)
            throw error // Re-throw to prevent modal from closing
        }
    }

    if (loading) {
        return (
            <div className="px-4 lg:px-6 py-8 text-center">
                <p>Cargando profesores...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="px-4 lg:px-6 py-8 text-center text-red-500">
                <p>Error: {error}</p>
            </div>
        )
    }

    if (teachers.length === 0) {
        return (
            <div className="px-4 lg:px-6 py-8 text-center">
                <p>No se encontraron profesores</p>
                <div className="px-4 lg:px-6 mb-4 flex justify-end">
                <Button
                    onClick={handleSync}
                    disabled={syncing}
                    variant="outline"
                    className="gap-2"
                >
                    <LuRefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Sincronizando...' : 'Sincronizar Profesores'}
                </Button>
            </div>
            </div>
        )
    }

    return (
        <>
            <div className="px-4 lg:px-6 mb-4 flex justify-end">
                <Button
                    onClick={handleSync}
                    disabled={syncing}
                    variant="outline"
                    className="gap-2"
                >
                    <LuRefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Sincronizando...' : 'Sincronizar Profesores'}
                </Button>
            </div>
            <Accordion
                type="single"
                collapsible
                className="px-4 lg:px-6"
                defaultValue={teachers.length > 0 ? `teacher-${teachers[0].id}` : undefined}
            >
                {teachers.map((teacher, index) => (
                    <AccordionItem key={teacher.id} value={`teacher-${teacher.id}`} className="w-full">
                        <AccordionTrigger className="flex w-full items-center justify-between [&>*]:no-underline [&_*]:no-underline [&]:hover:no-underline cursor-pointer">
                            <div className="flex items-center gap-4">
                                <span className="text-left">{teacher.name}</span>
                                <div className="flex items-center gap-2 [&_*]:no-underline hover:[&_*]:no-underline">
                                    {teacher.cells.map((cell) => (
                                        <Badge
                                            key={cell.id}
                                            className="hover:no-underline"
                                            style={{ backgroundColor: cell.course.color_hex }}
                                        >
                                            {cell.name}
                                        </Badge>
                                    ))}
                                    <AssignCellModal
                                        userId={teacher.id}
                                        userName={teacher.name}
                                        onAssignToCell={handleAssignToCell}
                                        onCreateAndAssignCell={handleCreateAndAssignCell}
                                        processing={creating || assigning}
                                    >
                                        <div
                                            className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground px-2 h-7 cursor-pointer shrink-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                        >
                                            <IconPlus className="h-4 w-4" />
                                            <span className="text-xs">Agregar Celula</span>
                                        </div>
                                    </AssignCellModal>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4 text-balance">
                            <div className="relative px-12">
                                {teacher.cells.length > 0 ? (
                                    <Carousel
                                        opts={{
                                            align: "start",
                                        }}
                                        className="w-full"
                                    >
                                        <CarouselContent>
                                            {teacher.cells.map((cell) => (
                                                <CarouselItem key={cell.id} className="md:basis-32 lg:basis-64">
                                                    <div className="p-1">
                                                        <Card>
                                                            <CardContent className="flex flex-col gap-2">
                                                                <span className="text-3xl font-semibold">{cell.name}</span>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Curso: {cell.course.name}
                                                                </p>
                                                                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                                                                    {cell.members.map((member) => (
                                                                        <p key={member.id} className={member.role === 'teacher' ? 'font-semibold' : ''}>
                                                                            {member.name} {member.role === 'teacher' && '(Profesor)'}
                                                                        </p>
                                                                    ))}
                                                                </div>
                                                                <div className="flex items-center justify-end gap-2 mt-2">
                                                                    <Button variant="destructive" size="icon">
                                                                        <LuTrash2 />
                                                                    </Button>
                                                                    <Button variant="outline" size="icon">
                                                                        <LuPencil />
                                                                    </Button>
                                                                    <Button variant="outline" size="icon">
                                                                        <LuPlus />
                                                                    </Button>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        <CarouselPrevious className="left-0" />
                                        <CarouselNext className="right-0" />
                                    </Carousel>
                                ) : (
                                    <div className="text-center py-8">
                                        <p>Este profesor no tiene células asignadas</p>
                                    </div>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </>
    )
}