'use client'
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "./ui/button"
import { X } from "lucide-react"
import { Message } from "@/model/User"
import axios from "axios"
import { ApiResponse } from "@/types/ApiResponse"
import { toast } from "sonner"

type MessageCardProps = {
    message: Message,
    onMessageDelete: (messageId: Object) => void
}

const MesageCard = ({ message, onMessageDelete }: MessageCardProps) => {
  const handleDeleteConfirm = async () => {
    const response = await axios.delete<ApiResponse>(`/api/delete-message/${message._id}`)
    toast(response.data.message)
    onMessageDelete(message._id)
  }
  return (
    <Card>
        {/* <CardHeader> */}
            {/* <CardTitle>{message.content}</CardTitle> */}
            {/* <CardDescription>{message.createdAt}</CardDescription> */}
        {/* </CardHeader> */}
        <CardContent className="flex items-center justify-between">
            {message.content}
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button className="w-fit cursor-pointer hover:bg-red-500" variant="destructive"><X className="w-5 h-5"/></Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This action will delete the message permanently.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                    <AlertDialogAction className="cursor-pointer hover:bg-neutral-700" onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CardContent>
    </Card>
  )
}

export default MesageCard