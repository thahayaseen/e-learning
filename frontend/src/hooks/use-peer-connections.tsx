"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Peer from "simple-peer"
import { chatEnum } from "@/lib/chat-enums"
import toast from "react-hot-toast"
import { useSocket } from "./socketio"
import { format } from "date-fns"

export const usePeerConnections = (streamRef: any, user: any, meetId: any) => {
  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(true)
  const [remoteAudioEnabled, setRemoteAudioEnabled] = useState(true)
  const socket = useSocket()
  const remoteVideosRef = useRef<HTMLVideoElement | null>(null)
  const peersRef = useRef<any>(null)
  const roomIdRef = useRef(meetId)
  const [participants, setParticipants] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const notifyVideoStateChange = useCallback(
    (enabled: boolean) => {
      if (!socket) return

      socket.emit(chatEnum.videoState, {
        username: user?.name || "You",
        enabled: enabled,
      })
    },
    [socket, user?.name],
  )

  const notifyAudioStateChange = useCallback(
    (enabled: boolean) => {
      if (!socket) return

      socket.emit(chatEnum.audioState, {
        username: user?.name || "You",
        enabled: enabled,
      })
    },
    [socket, user?.name],
  )

  // Add function to send message
  const sendMessage = useCallback(
    (messageText: string) => {
      if (!socket || !user) return

      const newMessage = {
        id: Date.now().toString(),
        username: user?.name || "You",
        message: messageText,
        timestamp: format(new Date(), "HH:mm"),
      }

      // Add message to local state
      setMessages((prev) => [...prev, newMessage])

      // Send message to socket
      socket.emit(chatEnum.message, {
        message: messageText,
        username: user?.name || "You",
        roomId: roomIdRef.current,
      })
    },
    [socket, user],
  )

  useEffect(() => {
    if (!socket || !streamRef || !user) return

    roomIdRef.current = meetId
    socket.emit(chatEnum.joinmeet, roomIdRef.current, user.email, user.name)

    socket.on(chatEnum.joined, ({ id, room }) => {
      console.log(`Joined room: ${room?.roomId} with socket ID: ${id}`)

      // Add system message for joining
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          username: "System",
          message: "You joined the meeting",
          timestamp: format(new Date(), "HH:mm"),
        },
      ])
    })

    socket.on(chatEnum.userConnected, ({ email, id, username }) => {
      console.log(`New user connected: ${username} (${id})`)

      // Ad  id, username }) => {
      console.log(`New user connected: ${username} (${id})`)

      // Add system message for new user
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          username: "System",
          message: `${username} joined the meeting`,
          timestamp: format(new Date(), "HH:mm"),
        },
      ])

      if (!peersRef.current) {
        const peer = createPeer(id, true, streamRef)
        peersRef.current = peer
      }
    })

    socket.on(chatEnum.signal, ({ from, signal }) => {
      console.log(`Received signal from ${from}`)

      if (!peersRef.current) {
        peersRef.current = createPeer(from, false, streamRef)
      }

      try {
        peersRef.current.signal(signal)
      } catch (error) {
        console.error("Error handling signal:", error)
      }
    })

    socket.on(chatEnum.error, (message) => {
      setError(message)
    })

    socket.on(chatEnum.videoState, (data) => {
      console.log(`${data.username} turned ${data.enabled ? "ON" : "OFF"} their video`)
      // Update state for remote video
      setRemoteVideoEnabled(data.enabled)

      // Add system message for video state change
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          username: "System",
          message: `${data.username} turned ${data.enabled ? "on" : "off"} their camera`,
          timestamp: format(new Date(), "HH:mm"),
        },
      ])
    })

    socket.on(chatEnum.audioState, (data) => {
      console.log(`${data.username} turned ${data.enabled ? "ON" : "OFF"} their audio`)
      // Update state for remote audio
      setRemoteAudioEnabled(data.enabled)

      // Add system message for audio state change
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          username: "System",
          message: `${data.username} turned ${data.enabled ? "on" : "off"} their microphone`,
          timestamp: format(new Date(), "HH:mm"),
        },
      ])
    })

    socket.on(chatEnum.message, (data) => {
      // Add received message to chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          username: data.username,
          message: data.message,
          timestamp: format(new Date(), "HH:mm"),
        },
      ])
    })

    socket.on("u-disconnect", (user) => {
      console.log("User disconnected:", user)

      // Add system message for disconnection
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          username: "System",
          message: `${user} disconnected`,
          timestamp: format(new Date(), "HH:mm"),
        },
      ])

      toast.success(`${user} disconnected`)
      if (remoteVideosRef.current) {
        remoteVideosRef.current.srcObject = null
      }

      // Clear peer reference when remote user disconnects
      peersRef.current = null
    })

    return () => {
      socket.off(chatEnum.joined)
      socket.off(chatEnum.userConnected)
      socket.off(chatEnum.signal)
      socket.off(chatEnum.error)
      socket.off(chatEnum.videoState)
      socket.off(chatEnum.audioState)
      socket.off(chatEnum.message)
      socket.off("u-disconnect")
    }
  }, [socket, meetId, user, streamRef, sendMessage])

  // Create Peer
  const createPeer = (to: string, initiator: boolean, stream: any) => {
    console.log(`Creating peer with ${to} and the initiator is ${initiator} ${socket?.id}`)
    if (!socket) return null

    const peer = new Peer({
      initiator: initiator,
      trickle: false,
      stream: stream.current,
    })

    peer.on("signal", (signal) => {
      socket.emit(chatEnum.signal, {
        to,
        from: socket.id,
        signal,
        email: user.email,
        username: user.name,
      })
    })

    peer.on("stream", (remoteStream) => {
      console.log("Receiving remote stream")
      if (remoteVideosRef.current) {
        remoteVideosRef.current.srcObject = remoteStream
      }
    })

    peer.on("error", (err) => {
      console.error(`Peer error (${initiator ? "initiator" : "receiver"}):`, err)
    })

    return peer
  }

  // Function to set video ref
  const setVideoRef = (ref: HTMLVideoElement | null) => {
    remoteVideosRef.current = ref
  }

  return {
    peers: peersRef.current,
    participants,
    messages,
    setVideoRef,
    remoteVideosRef,
    notifyVideoStateChange,
    notifyAudioStateChange,
    remoteVideoEnabled,
    remoteAudioEnabled,
    error,
    sendMessage,
  }
}

