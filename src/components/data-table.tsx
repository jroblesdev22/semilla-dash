"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconPlus,
  IconTrendingUp,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
// import { toast } from "sonner" // Removed - not used
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export const schema = z.object({
  id: z.string(),
  classroomUserId: z.string(),
  name: z.string(),
  email: z.string(),
  courseId: z.string(),
  courseName: z.string(),
  teacherId: z.string().optional(),
  teacherName: z.string().optional(),
  teacherEmail: z.string().optional(),
  asignada: z.number(),
  entregada: z.number(),
  entregadaConRetraso: z.number(),
  sinEntregar: z.number(),
  devueltaCalificada: z.number(),
})


const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    accessorKey: "name",
    header: "Nombre del Alumno",
    cell: ({ row }) => {
      return <StudentDetailsViewer item={row.original} />
    },
    enableHiding: false,
  },
  {
    accessorKey: "asignada",
    header: () => <div className="text-center">Asignada</div>,
    cell: ({ row }) => (
      <div className="text-center">
        <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
          {row.original.asignada}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "entregada",
    header: () => <div className="text-center">Entregada</div>,
    cell: ({ row }) => (
      <div className="text-center">
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          {row.original.entregada}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "entregadaConRetraso",
    header: () => <div className="text-center">Entregada con Retraso</div>,
    cell: ({ row }) => (
      <div className="text-center">
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
          {row.original.entregadaConRetraso}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "sinEntregar",
    header: () => <div className="text-center">Sin Entregar</div>,
    cell: ({ row }) => (
      <div className="text-center">
        <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
          {row.original.sinEntregar}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "devueltaCalificada",
    header: () => <div className="text-center">Calificada</div>,
    cell: ({ row }) => (
      <div className="text-center">
        <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
          {row.original.devueltaCalificada}
        </Badge>
      </div>
    ),
  },
]

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({
  data: initialData,
  onRefresh,
  courses,
  selectedCourseId,
  onCourseChange,
  professors,
  selectedProfessor,
  onProfessorChange,
  celulas,
  selectedCelula,
  onCelulaChange,
}: {
  data: z.infer<typeof schema>[]
  onRefresh?: () => void
  courses?: Array<{id: string; name: string}>
  selectedCourseId?: string
  onCourseChange?: (courseId: string | undefined) => void
  professors?: Array<{id: string; name: string}>
  selectedProfessor?: string
  onProfessorChange?: (professorId: string | undefined) => void
  celulas?: Array<{id: string; name: string}>
  selectedCelula?: string
  onCelulaChange?: (celulaId: string | undefined) => void
}) {
  const [data, setData] = React.useState(() => initialData)
  
  // Sincronizar con los datos iniciales cuando cambien
  React.useEffect(() => {
    setData(initialData)
  }, [initialData])
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="outline">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="outline">Estudiantes</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="outline">Estudiantes</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtro por Cursos */}
          {courses && courses.length > 0 && (
            <Select value={selectedCourseId || "ALL"} onValueChange={(value) => onCourseChange?.(value === "ALL" ? undefined : value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los cursos</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    <span className="truncate">{course.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {/* Filtro por Profesor */}
          {professors && professors.length > 0 && (
            <Select value={selectedProfessor || "ALL"} onValueChange={(value) => onProfessorChange?.(value === "ALL" ? undefined : value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por profesor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los profesores</SelectItem>
                {professors.map((professor) => (
                  <SelectItem key={professor.id} value={professor.id}>
                    <span className="truncate">{professor.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {/* Filtro por Célula */}
          {celulas && celulas.length > 0 && (
            <Select value={selectedCelula || "ALL"} onValueChange={(value) => onCelulaChange?.(value === "ALL" ? undefined : value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por célula" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas las células</SelectItem>
                {celulas.map((celula) => (
                  <SelectItem key={celula.id} value={celula.id}>
                    <span className="truncate">{celula.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <IconPlus />
            <span className="hidden lg:inline">Refrescar Datos</span>
            <span className="lg:hidden">Refrescar</span>
          </Button>
        </div>
      </div>
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                filas por pagina
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Pagina {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  )
}

// Removed unused chartData

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig

function StudentDetailsViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile()

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.name}</DrawerTitle>
          <DrawerDescription>
            Detalles del estudiante y estadísticas de tareas
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {/* Mostrar información básica primero */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="font-medium">Nombre</Label>
                <div className="text-muted-foreground">{item.name}</div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-medium">Email</Label>
                <div className="text-muted-foreground text-xs break-all">{item.email}</div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-medium">Curso</Label>
                <div className="text-muted-foreground">{item.courseName}</div>
              </div>
            </div>
          </div>
          
          {!isMobile && (
            <>
              <Separator />
              <ChartContainer config={chartConfig}>
                <BarChart
                  accessibilityLayer
                  data={[
                    { category: "Asignada", value: item.asignada },
                    { category: "Entregada", value: item.entregada },
                    { category: "Retrasada", value: item.entregadaConRetraso },
                    { category: "Sin Entregar", value: item.sinEntregar },
                    { category: "Calificada", value: item.devueltaCalificada },
                  ]}
                  margin={{
                    left: 20,
                    right: 10,
                    top: 10,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="category"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip
                    cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                    content={<ChartTooltipContent />}
                  />
                  <Bar
                    dataKey="value"
                    fill="var(--color-desktop)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
              <Separator />
              <div className="grid gap-2">
                <div className="flex gap-2 leading-none font-medium">
                  Rendimiento académico del estudiante{" "}
                  <IconTrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Estadísticas basadas en las tareas y entregas del estudiante en {item.courseName}.
                </div>
              </div>
              <Separator />
            </>
          )}
          
          {/* Estadísticas de tareas */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Label className="font-medium text-base">Estadísticas de Tareas</Label>
              <IconTrendingUp className="size-4" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="font-medium">Asignada</Label>
                <Badge className="w-fit bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
                  {item.asignada}
                </Badge>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-medium">Entregada</Label>
                <Badge className="w-fit bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  {item.entregada}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="font-medium">Entregada con Retraso</Label>
                <Badge className="w-fit bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                  {item.entregadaConRetraso}
                </Badge>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-medium">Sin Entregar</Label>
                <Badge className="w-fit bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                  {item.sinEntregar}
                </Badge>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-medium">Devuelta (Calificada)</Label>
                <Badge className="w-fit bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                  {item.devueltaCalificada}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <DrawerFooter>
          <Button>Enviar Recordatorio</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cerrar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
