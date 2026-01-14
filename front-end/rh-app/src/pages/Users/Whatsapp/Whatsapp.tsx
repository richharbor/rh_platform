"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { sendWhatsappMsg } from "@/services/Whatsapp/whatsappServices"
import { useState } from "react"
import { toast } from "sonner"

const dummyPhoneNumbers = [
    "+91 63904 20614",
    "+91 80982 18217",

]

const formSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters.",
    }),
    phoneNumbers: z.array(z.string()).refine((value) => value.length > 0, {
        message: "You have to select at least one phone number.",
    }),
    description: z.string().optional(),
})

export default function Whatsapp() {
    const [loading, setLoadint] = useState(false);
    const [sending, setSending] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            phoneNumbers: [],
            description: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setSending(true);
            await sendWhatsappMsg(values)
            toast.success("Whatsapp message sent successfully")

        } catch (error) {
            toast.error("Failed to send whatsapp message")
            console.error(error)

        } finally {
            setSending(false);
        }
    }

    return (
        <div className="flex h-[calc(100vh-4.5rem)] w-full overflow-hidden rounded-lg border-2 max-md:border-none flex-col relative gap-6">
            <div className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                    <div className="p-6 max-w-2xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold tracking-tight">Share Page</h1>
                            <p className="text-muted-foreground">
                                Create a new share page for your WhatsApp campaign.
                            </p>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Campaign Title" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phoneNumbers"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Numbers</FormLabel>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className="w-full justify-between font-normal"
                                                        >
                                                            {field.value?.length > 0
                                                                ? `${field.value.length} selected`
                                                                : "Select phone numbers"}
                                                            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" align="start">
                                                    <DropdownMenuLabel>Available Numbers</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    {dummyPhoneNumbers.map((number) => (
                                                        <DropdownMenuCheckboxItem
                                                            key={number}
                                                            checked={field.value?.includes(number)}
                                                            onSelect={(e) => e.preventDefault()}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                    ? field.onChange([...field.value, number])
                                                                    : field.onChange(
                                                                        field.value?.filter(
                                                                            (value) => value !== number
                                                                        )
                                                                    )
                                                            }}
                                                        >
                                                            {number}
                                                        </DropdownMenuCheckboxItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <textarea
                                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    placeholder="Enter a description for your campaign..."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button className={`transition-all duration-300 ease-in-out ${sending ? "w-[110px]" : "w-[80px]"}`} type="submit" disabled={sending}>{sending ? "Sending..." : "Send"}</Button>
                            </form>
                        </Form>
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}