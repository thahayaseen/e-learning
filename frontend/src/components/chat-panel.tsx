"use client"

import type React from "react"

import { useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

interface Message {
  id: number
  user: string
  content: string
  timestamp: string
}

interface ChatPanelProps {
  messages: Message[]
  inputMessage: string
  setInputMessage: (message: string) => void
  sendMessage: () => void
  messagesEndRef: React.RefObject<HTMLDivElement>
}

export function ChatPanel({ messages, inputMessage, setInputMessage, sendMessage, messagesEndRef }: ChatPanelProps) {
  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  return (
    <Card className="h-full flex flex-col bg-slate-800 shadow-lgg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-3">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg.id} className="mb-3">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold">{msg.user}</span>
                <span className="text-xs text-slate-400">{msg.timestamp}</span>
              </div>
              <p className="mt-1 text-sm">{msg.content}</p>
            </div>
          ))
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400 text-sm">No messages yet</div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="border-t border-slate-700 p-3">
        <form
          className="flex gap-2 w-full"
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage()
          }}
        >
          <Input
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 bg-slate-700 border-slate-600"
          />
          <Button type="submit" size="sm" disabled={!inputMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

