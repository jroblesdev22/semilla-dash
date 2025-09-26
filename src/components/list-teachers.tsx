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
import type { Student } from "@/types/cell"
import { AssignCellModal } from "@/components/assign-cell-modal"
import { DeleteCellModal } from "@/components/delete-cell-modal"
import { EditCellModal } from "@/components/edit-cell-modal"
import { AddStudentsModal } from "@/components/add-students-modal"
import { CreateCellRequest, AssignUserToCellRequest, UpdateCellRequest } from "@/types/cell"


export function ListTeachers() {
    const { teachers, loading, error, syncTeachers, syncing, refetch: refetchTeachers } = useTeachers()
    const { createCell, assignUserToCell, updateCell, deleteCell, getStudentsByCourse, creating, assigning, updating, deleting } = useCells()

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

    const handleUpdateCell = async (cellId: string, updateData: UpdateCellRequest) => {
        try {
            const result = await updateCell(cellId, updateData)
            alert(`✅ ${result.message}`)
            // Refetch teachers to update the UI
            refetchTeachers()
        } catch (error) {
            alert(`❌ Error al actualizar célula: ${error instanceof Error ? error.message : 'Error desconocido'}`)
            throw error
        }
    }

    const handleDeleteCell = async (cellId: string) => {
        try {
            const result = await deleteCell(cellId)
            alert(`✅ ${result.message}`)
            // Refetch teachers to update the UI
            refetchTeachers()
        } catch (error) {
            alert(`❌ Error al eliminar célula: ${error instanceof Error ? error.message : 'Error desconocido'}`)
            throw error
        }
    }

    const handleAddStudents = async (students: Student[], cellId: string) => {
        try {
            // Add each student to the cell using Google Classroom data
            const promises = students.map(student =>
                assignUserToCell({
                    classroomUserId: student.classroomUserId || student.id,
                    name: student.name,
                    email: student.email || null,
                    cell_id: cellId
                })
            )

            await Promise.all(promises)
            alert(`✅ ${students.length} estudiante${students.length > 1 ? 's' : ''} agregado${students.length > 1 ? 's' : ''} a la célula exitosamente`)
            // Refetch teachers to update the UI
            refetchTeachers()
        } catch (error) {
            alert(`❌ Error al agregar estudiantes: ${error instanceof Error ? error.message : 'Error desconocido'}`)
            throw error
        }
    }

    if (loading) {
        return (
            <div className="px-4 lg:px-6 py-12">
                <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mx-auto mb-4">
                        <LuRefreshCw className="h-6 w-6 text-muted-foreground animate-spin" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Cargando profesores</h3>
                    <p className="text-muted-foreground">
                        Obteniendo datos de Google Classroom...
                    </p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="px-4 lg:px-6 py-12">
                <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                        <LuRefreshCw className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-red-600">Error al cargar profesores</h3>
                    <p className="text-muted-foreground mb-6">
                        {error}
                    </p>
                    <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        className="gap-2"
                    >
                        <LuRefreshCw className="h-4 w-4" />
                        Reintentar
                    </Button>
                </div>
            </div>
        )
    }

    if (teachers.length === 0) {
        return (
            <div className="px-4 lg:px-6 py-12">
                <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mx-auto mb-4">
                        <LuRefreshCw className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No hay profesores</h3>
                    <p className="text-muted-foreground mb-6">
                        Sincroniza con Google Classroom para cargar los profesores
                    </p>
                    <Button
                        onClick={handleSync}
                        disabled={syncing}
                        variant="default"
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
            {/* Header Section */}
            <div className="px-4 lg:px-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Gestión de Profesores</h2>
                        <p className="text-muted-foreground">
                            Administra profesores y sus células de estudio
                        </p>
                    </div>
                    <Button
                        onClick={handleSync}
                        disabled={syncing}
                        variant="outline"
                        className="gap-2 w-fit"
                    >
                        <LuRefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Sincronizando...' : 'Sincronizar Profesores'}
                    </Button>
                </div>
            </div>
            {/* Teachers List with Accordion */}
            <Accordion
                type="single"
                collapsible
                className="px-4 lg:px-6 space-y-4"
                defaultValue={teachers.length > 0 ? `teacher-${teachers[0].id}` : undefined}
            >
                {teachers.map((teacher) => (
                    <AccordionItem 
                        key={teacher.id} 
                        value={`teacher-${teacher.id}`} 
                        className="border rounded-lg bg-card overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
                                <AccordionTrigger className="hover:no-underline p-0 flex-1">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-medium">
                                            {teacher.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-lg font-semibold">{teacher.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {teacher.cells.length} {teacher.cells.length === 1 ? 'célula' : 'células'}
                                            </p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        {teacher.cells.slice(0, 3).map((cell) => (
                                            <Badge
                                                key={cell.id}
                                                variant="secondary"
                                                className="text-white"
                                                style={{ backgroundColor: cell.course.color_hex }}
                                            >
                                                {cell.name}
                                            </Badge>
                                        ))}
                                        {teacher.cells.length > 3 && (
                                            <Badge variant="outline">
                                                +{teacher.cells.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                    <AssignCellModal
                                        userId={teacher.id}
                                        userName={teacher.name}
                                        onAssignToCell={handleAssignToCell}
                                        onCreateAndAssignCell={handleCreateAndAssignCell}
                                        processing={creating || assigning}
                                    >
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="gap-2"
                                        >
                                            <IconPlus className="h-4 w-4" />
                                            Agregar Célula
                                        </Button>
                                    </AssignCellModal>
                                </div>
                            </div>
                        </div>
                        <AccordionContent className="px-6 pb-6">
                            {teacher.cells.length > 0 ? (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-medium text-muted-foreground">
                                            Células asignadas ({teacher.cells.length})
                                        </h4>
                                    </div>
                                    
                                    {teacher.cells.length === 1 ? (
                                        // Single cell - no carousel needed
                                        <div className="grid grid-cols-1 gap-4">
                                            {teacher.cells.map((cell) => (
                                                <Card key={cell.id} className="relative">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div>
                                                                <h5 className="font-semibold text-lg">{cell.name}</h5>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Curso: {cell.course.name}
                                                                </p>
                                                            </div>
                                                            <div 
                                                                className="w-4 h-4 rounded-full"
                                                                style={{ backgroundColor: cell.course.color_hex }}
                                                            />
                                                        </div>
                                                        
                                                        {/* Members */}
                                                        <div className="mb-4">
                                                            <p className="text-xs text-muted-foreground mb-2">
                                                                Miembros ({cell.members.length})
                                                            </p>
                                                            <div className="max-h-32 overflow-y-auto space-y-1">
                                                                {cell.members.map((member) => (
                                                                    <div key={member.id} className="text-sm flex items-center justify-between">
                                                                        <span className={member.role === 'teacher' ? 'font-medium' : ''}>
                                                                            {member.name}
                                                                        </span>
                                                                        {member.role === 'teacher' && (
                                                                            <Badge variant="secondary" className="text-xs">Profesor</Badge>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Actions */}
                                                        <div className="flex items-center gap-2">
                                                            <AddStudentsModal
                                                                cell={cell}
                                                                onAddStudents={(students) => handleAddStudents(students, cell.id)}
                                                                getStudentsByCourse={getStudentsByCourse}
                                                                processing={assigning}
                                                            >
                                                                <Button variant="outline" size="sm" className="flex-1">
                                                                    <LuPlus className="h-3 w-3 mr-1" />
                                                                    Agregar Estudiantes
                                                                </Button>
                                                            </AddStudentsModal>
                                                            
                                                            <div className="flex gap-1">
                                                                <EditCellModal
                                                                    cell={cell}
                                                                    onUpdateCell={handleUpdateCell}
                                                                    updating={updating}
                                                                >
                                                                    <Button variant="ghost" size="sm">
                                                                        <LuPencil className="h-3 w-3" />
                                                                    </Button>
                                                                </EditCellModal>
                                                                <DeleteCellModal
                                                                    cell={cell}
                                                                    onDeleteCell={handleDeleteCell}
                                                                    deleting={deleting}
                                                                >
                                                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                                                        <LuTrash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </DeleteCellModal>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        // Multiple cells - use carousel
                                        <div className="relative">
                                            <Carousel
                                                opts={{
                                                    align: "start",
                                                    loop: false,
                                                }}
                                                className="w-full"
                                            >
                                                <CarouselContent className="-ml-4">
                                                    {teacher.cells.map((cell) => (
                                                        <CarouselItem key={cell.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                                            <Card className="relative h-full">
                                                                <CardContent className="p-4">
                                                                    <div className="flex items-start justify-between mb-3">
                                                                        <div>
                                                                            <h5 className="font-semibold text-lg">{cell.name}</h5>
                                                                            <p className="text-sm text-muted-foreground">
                                                                                Curso: {cell.course.name}
                                                                            </p>
                                                                        </div>
                                                                        <div 
                                                                            className="w-4 h-4 rounded-full"
                                                                            style={{ backgroundColor: cell.course.color_hex }}
                                                                        />
                                                                    </div>
                                                                    
                                                                    {/* Members */}
                                                                    <div className="mb-4">
                                                                        <p className="text-xs text-muted-foreground mb-2">
                                                                            Miembros ({cell.members.length})
                                                                        </p>
                                                                        <div className="max-h-24 overflow-y-auto space-y-1">
                                                                            {cell.members.map((member) => (
                                                                                <div key={member.id} className="text-sm flex items-center justify-between">
                                                                                    <span className={member.role === 'teacher' ? 'font-medium text-xs' : 'text-xs'}>
                                                                                        {member.name}
                                                                                    </span>
                                                                                    {member.role === 'teacher' && (
                                                                                        <Badge variant="secondary" className="text-xs">Prof</Badge>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {/* Actions */}
                                                                    <div className="flex flex-col gap-2">
                                                                        <AddStudentsModal
                                                                            cell={cell}
                                                                            onAddStudents={(students) => handleAddStudents(students, cell.id)}
                                                                            getStudentsByCourse={getStudentsByCourse}
                                                                            processing={assigning}
                                                                        >
                                                                            <Button variant="outline" size="sm" className="w-full">
                                                                                <LuPlus className="h-3 w-3 mr-1" />
                                                                                Estudiantes
                                                                            </Button>
                                                                        </AddStudentsModal>
                                                                        
                                                                        <div className="flex gap-1">
                                                                            <EditCellModal
                                                                                cell={cell}
                                                                                onUpdateCell={handleUpdateCell}
                                                                                updating={updating}
                                                                            >
                                                                                <Button variant="ghost" size="sm" className="flex-1">
                                                                                    <LuPencil className="h-3 w-3" />
                                                                                </Button>
                                                                            </EditCellModal>
                                                                            <DeleteCellModal
                                                                                cell={cell}
                                                                                onDeleteCell={handleDeleteCell}
                                                                                deleting={deleting}
                                                                            >
                                                                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive flex-1">
                                                                                    <LuTrash2 className="h-3 w-3" />
                                                                                </Button>
                                                                            </DeleteCellModal>
                                                                        </div>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        </CarouselItem>
                                                    ))}
                                                </CarouselContent>
                                                <CarouselPrevious className="left-0" />
                                                <CarouselNext className="right-0" />
                                            </Carousel>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>Este profesor no tiene células asignadas</p>
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </>
    )
}