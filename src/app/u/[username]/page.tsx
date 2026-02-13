'use client'

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useParams } from "next/navigation"
import {
  Item,
  ItemContent,
  ItemDescription,
} from "@/components/ui/item"
import { useState } from "react"
import axios, { AxiosError } from "axios"
import { toast } from "sonner"
import { ApiResponse } from "@/types/ApiResponse"

const MessagePage = () => {
  const {username} = useParams()

  const [msg1, setMsg1] = useState('AI Generated message 1')
  const [msg2, setMsg2] = useState('AI Generated message 2')
  const [msg3, setMsg3] = useState('AI Generated message 3')
  const [isValue, setIsValue] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const handleCLick = async(desc: string) => {
    setIsValue(desc)
  }

  const handleGenerateMessages = async() => {
    setIsGenerating(true)
    setMsg1('')
    setMsg2('')
    setMsg3('')
    const response = await fetch('/api/suggest-messages', {
      method: 'POST'
    })
    console.log(response)
    if(!response.body) {
      return;
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = ''
    while(true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, {stream: true});
      accumulatedText += chunk;

      const parts = accumulatedText.split('||');

      setMsg1(parts[0] || '')
      setMsg2(parts[1] || '')
      setMsg3(parts[2] || '')
    }
    setIsGenerating(false)
  }

  const handleSendMessage = async() => {
    setIsSending(true);
    
    try {
      const response = await axios.post('/api/send-message', {username, content: isValue});
      console.log(response);
      toast.success('Sent successfully', {description: `Your message has been sent to ${username}`})
      setIsValue('')
    } catch(error) {
      const axiosError = error as AxiosError<ApiResponse>
      console.error('Message cannot be sent this time', error)
      toast.error('Sending Failed', {description: axiosError.response?.data.message})
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-36">
      <div className="flex justify-center">
        <Field className="md:w-3/5 mt-20">
        <FieldLabel htmlFor="input-button-group" className="text-gray-300">Writing feedback to {username}</FieldLabel>
        <ButtonGroup>
          <Input 
            id="input-button-group" 
            placeholder="Write your message here..." 
            className="shadow-none focus-visible:ring-1 focus:caret-neutral-200 text-neutral-200 selection:bg-neutral-500"
            value={isValue === '' ? '' : isValue}
            onChange={(e) => (
              setIsValue(e.target.value)
            )}
          />
          <Button 
            variant="outline" 
            className="cursor-pointer" 
            onClick={handleSendMessage}
            disabled={(isValue === '') || isSending}
          >
            Send</Button>
        </ButtonGroup>

      </Field>
      </div>
      <div className="flex flex-col space-y-10 items-center">
        <Button 
          onClick={handleGenerateMessages} 
          className="cursor-pointer w-fit justify-center"
          disabled={isGenerating}
        >
          Generate with AI
        </Button>
        <div className="p-4 rounded-xl outline-1 md:w-1/2 flex justify-center outline-neutral-400">
          <div className="flex w-full max-w-md flex-col gap-6">
            <Item variant="outline" className="cursor-pointer" onClick={() => (handleCLick(msg1))}>
              <ItemContent>
                <ItemDescription className="text-neutral-300">{msg1}</ItemDescription>
              </ItemContent>
            </Item>

            <Item variant="outline" className="cursor-pointer" onClick={() => (handleCLick(msg2))}>
              <ItemContent>
                <ItemDescription className="text-neutral-300">{msg2}</ItemDescription>
              </ItemContent>
            </Item>

            <Item variant="outline" className="cursor-pointer" onClick={() => (handleCLick(msg3))}>
              <ItemContent>
                <ItemDescription className="text-neutral-300">{msg3}</ItemDescription>
              </ItemContent>
            </Item>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessagePage