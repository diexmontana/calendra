'use client'
import { eventFormSchema } from "@/schema/events"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Switch } from "../ui/switch"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog"
import { Button } from "../ui/button"
import { useTransition } from "react"
import Link from "next/link"
import { createEvent, deleteEvent, updateEvent } from "@/server/actions/events"
import { useRouter } from "next/navigation"

  // Marks this as a Client Component in Next.js


// Component to handle creating/editing/deleting an event
export default function EventForm({
    event, // Destructure the `event` object from the props
  }: {
    // Define the shape (TypeScript type) of the expected props
    event?: { // Optional `event` object (might be undefined if creating a new event)
      id: string // Unique identifier for the event
      name: string // Name of the event
      description?: string // Optional description of the event
      durationInMinutes: number // Duration of the event in minutes
      isActive: boolean // Indicates whether the event is currently active
    }
  }) {

    
    // useTransition is a React hook that helps manage the state of transitions in async operations
    // It returns two values:
    // 1. `isDeletePending` - This is a boolean that tells us if the deletion is still in progress
    // 2. `startDeleteTransition` - This is a function we can use to start the async operation, like deleting an event

    const [isDeletePending, startDeleteTransition] = useTransition()
    const router = useRouter()


    const form = useForm<z.infer<typeof eventFormSchema>>({
        resolver: zodResolver(eventFormSchema), // Validate with Zod schema
        defaultValues: event
        ? {
            // If `event` is provided (edit mode), spread its existing properties as default values
            ...event,
          }
          : {
            // If `event` is not provided (create mode), use these fallback defaults
            isActive: true,             // New events are active by default
            durationInMinutes: 30,      // Default duration is 30 minutes
            description: '',            // Ensure controlled input: default to empty string
            name: '',                   // Ensure controlled input: default to empty string
          },

    })

    // Handle form submission
    async function onSubmit(values: z.infer<typeof eventFormSchema>) {
        const action =  event == null ? createEvent : updateEvent.bind(null, event.id)
        try {
            await action(values)
            router.push('/events')

        } catch (error: any) {
            // Handle any error that occurs during the action (e.g., network error)
          form.setError("root", {
            message: `Hubo un error al eliminar tu evento ${error.message}`,
          })
        }
    }


    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex gap-6 flex-col"
            >
                {/* Show root error if any */}
                {form.formState.errors.root && (
                <div className="text-destructive text-sm">
                    {form.formState.errors.root.message}
                </div>
                )}

                {/* Event Name Field */}
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nombre del evento</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormDescription>
                        El nombre que los usuarios verán al reservar
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />

                {/* Duration Field */}
                <FormField
                control={form.control}
                name="durationInMinutes"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Duración</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>En minutos</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />

                {/* Optional Description Field */}
                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                        <Textarea className="resize-none h-32" {...field} />
                    </FormControl>
                    <FormDescription>
                        Descripción opcional del evento
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />

                {/* Toggle for Active Status */}
                <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                    <FormItem>
                    <div className="flex items-center gap-2">
                        <FormControl>
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                        </FormControl>
                        <FormLabel>Activo</FormLabel>
                    </div>
                    <FormDescription>
                        Los eventos inactivos no estarán disponibles para reserva
                    </FormDescription>
                    </FormItem>
                )}
                />

                {/* Buttons section: Delete, Cancel, Save */}
                <div className="flex gap-2 justify-end">
                {/* Delete Button (only shows if editing existing event) */}
                {event && (
                    <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                        className="cursor-pointer hover:scale-105 hover:bg-red-700"
                        variant="destructive"
                        disabled={isDeletePending || form.formState.isSubmitting}
                        >
                        Eliminar
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Este evento se eliminará permanentemente.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                        className="bg-red-500 hover:bg-red-700 cursor-pointer"
                            disabled={isDeletePending || form.formState.isSubmitting}
                            onClick={() => {
                                // Start a React transition to keep the UI responsive during this async operation
                                startDeleteTransition(async () => {
                                try {
                                    // Attempt to delete the event by its ID
                                    await deleteEvent(event.id)
                                    router.push('/events')
                                } catch (error: any) {
                                    // If something goes wrong, show an error at the root level of the form
                                    form.setError("root", {
                                    message: `Hubo un error al eliminar tu evento: ${error.message}`,
                                    })
                                }
                                })
                            }}
                            
                            
                        >
                            Eliminar
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
                )}

                {/* Cancel Button - redirects to events list */}
                <Button
                    disabled={isDeletePending || form.formState.isSubmitting}
                    type="button"
                    asChild
                    variant="outline"
                >
                    <Link href="/events">Cancelar</Link>
                </Button>

                {/* Save Button - submits the form */}
                <Button
                className="cursor-pointer hover:scale-105 bg-blue-400 hover:bg-blue-600"
                    disabled={isDeletePending || form.formState.isSubmitting}
                    type="submit"
                >
                    Guardar
                </Button>
                </div>
            </form>
        </Form>
    )
    
}