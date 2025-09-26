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
import { LuTrash2, LuPencil, LuPlus } from "react-icons/lu";


export function ListTeachers() {
    return (
        <>
            <Accordion
                type="single"
                collapsible
                className="px-4 lg:px-6"
                defaultValue="item-1"
            >
                <AccordionItem value="item-1" className="w-full">
                    <AccordionTrigger className="flex w-full items-center justify-between [&>*]:no-underline [&_*]:no-underline [&]:hover:no-underline cursor-pointer">
                        <div className="flex items-center gap-4">
                            <span className="text-left">Juan Ignacio Gomez Perez</span>
                            <div className="flex items-center gap-2 [&_*]:no-underline hover:[&_*]:no-underline">
                                <Badge className="hover:no-underline bg-amber-500">Celula 1</Badge>
                                <Badge className="hover:no-underline bg-green-500">Celula 2</Badge>
                                <Badge className="hover:no-underline bg-amber-500">Celula 3</Badge>
                                <Badge className="hover:no-underline bg-green-500">Celula 4</Badge>
                                <div
                                    className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 w-7 cursor-pointer shrink-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Aquí irá la lógica para abrir el formulario
                                        console.log('Agregar nueva célula');
                                    }}
                                >
                                    <IconPlus className="h-4 w-4" />
                                </div>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                        <div className="relative px-12">
                            <Carousel
                                opts={{
                                    align: "start",
                                }}
                                className="w-full"
                            >
                                <CarouselContent>
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <CarouselItem key={index} className="md:basis-32 lg:basis-64">
                                            <div className="p-1">
                                                <Card>
                                                    <CardContent className="flex flex-col gap-2">
                                                        <span className="text-3xl font-semibold">Celula {index + 1}</span>
                                                        <p>Profesor Apellido</p>
                                                        <p>Estudiante Apellido</p>
                                                        <p>Estudiante Apellido</p>
                                                        <p>Estudiante Apellido</p>
                                                        <p>Estudiante Apellido</p>
                                                        <p>Estudiante Apellido</p>
                                                        <p>Estudiante Apellido</p>
                                                        <p>Estudiante Apellido</p>
                                                        <p>Estudiante Apellido</p>
                                                        <p>Estudiante Apellido</p>
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button variant="destructive" size="icon">
                                                                <LuTrash2 />
                                                            </Button>
                                                            <Button size="icon">
                                                                <LuPencil />
                                                            </Button>
                                                            <Button size="icon">
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
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger className="flex w-full items-center justify-between [&>*]:no-underline [&_*]:no-underline [&]:hover:no-underline cursor-pointer">
                        <div className="flex items-center gap-4">
                            <span className="text-left">Jose Maria Santiago Monte</span>
                            <div className="flex items-center gap-2 [&_*]:no-underline hover:[&_*]:no-underline">
                                <Badge className="hover:no-underline bg-green-500">Celula 5</Badge>
                                <Badge className="hover:no-underline bg-amber-500">Celula 6</Badge>
                                <Badge className="hover:no-underline bg-green-500">Celula 7</Badge>
                                <Badge className="hover:no-underline bg-amber-500">Celula 8</Badge>
                                <div
                                    className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 w-7 cursor-pointer shrink-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Aquí irá la lógica para abrir el formulario
                                        console.log('Agregar nueva célula');
                                    }}
                                >
                                    <IconPlus className="h-4 w-4" />
                                </div>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                        <div className="relative px-12">
                            <Carousel
                                opts={{
                                    align: "start",
                                }}
                                className="w-full"
                            >
                                <CarouselContent>
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <CarouselItem key={index} className="md:basis-32 lg:basis-64">
                                            <div className="p-1">
                                                <Card>
                                                    <CardContent className="flex flex-col gap-2">
                                                        <span className="text-3xl font-semibold">Celula {index + 1}</span>
                                                        <p>Estudiante Apellido</p>
                                                        <p>Estudiante Apellido</p>
                                                        <p>Estudiante Apellido</p>
                                                        <p>Estudiante Apellido</p>
                                                        <p>Estudiante Apellido</p>
                                                        <p>Estudiante Apellido</p>
                                                        <p>Estudiante Apellido</p>
                                                        <p>Estudiante Apellido</p>
                                                        <p>Estudiante Apellido</p>
                                                        <p>Estudiante Apellido</p>
                                                        <div className="flex items-center justify-end gap-2">
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
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </>
    )
}