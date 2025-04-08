"use client"

import { useState, useRef } from "react"

import { chatEnum } from "@/app/course/chat/[id]/page"
import toast from "react-hot-toast"
import { Socket } from "socket.io-client"

interface Message {
  id: number
  user: string
  content: string
  timestamp: string
}

export function useChat(meetId: string, userName: string,socket:Socket) {

  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Send chat message
  const sendMessage = () => {
    if (inputMessage.trim() && socket) {
      const now = new Date()
      const time = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })

      const newMessage = {
        id: Date.now(),
        user: userName || "You",
        content: inputMessage,
        timestamp: time,
      }

      // Add message to local state
      setMessages((prev) => [...prev, newMessage])

      // Send message through socket to all participants
      socket.emit(chatEnum.message, {
        meetid: meetId,
        message: inputMessage,
        from: userName || "You",
      })

      // Clear input
      setInputMessage("")
    }
  }

  // Set up socket listeners for chat
  const setupChatListeners = () => {
    if (!socket) return () => {}

    // Listen for chat messages
    socket.on(chatEnum.message, (data: { from: string; message: string }) => {
      const now = new Date()
      const time = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          user: data.from,
          content: data.message,
          timestamp: time,
        },
      ])

      toast.success(`New message from ${data.from}`)
    })

    // Clean up
    return () => {
      socket.off(chatEnum.message)
    }
  }

  return {
    messages,
    inputMessage,
    setInputMessage,
    sendMessage,
    messagesEndRef,
    setupChatListeners,
  }
}

