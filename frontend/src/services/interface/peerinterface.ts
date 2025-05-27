import { Socket } from "socket.io-client"

export interface User {
  id: string
  name: string
  email: string
  isLocal: boolean
}

export interface SignalData {
  signal: any
  to: string
  from: string
  initiator: boolean
}

export interface UserConnectedData {
  id: string
  username: string
  email: string
}

export interface UserDisconnectedData {
  id: string
  username: string
}

export interface PeerMap {
  [key: string]: SimplePeer.Instance
}

export interface VideoRefMap {
  [key: string]: HTMLVideoElement | null
}

export interface UsePeerConnectionsProps {
  meetId: string
  user: any
  streamRef: React.MutableRefObject<MediaStream | null>
}

export interface UsePeerConnectionsReturn {
  peers: PeerMap
  participants: User[]
  remoteVideosRef: React.MutableRefObject<VideoRefMap>
  connectionQuality: "good" | "fair" | "poor" | "disconnected"
  messages: Array<{
    id: number
    user: string
    content: string
    timestamp: string
  }>
  sendMessage: (message: string) => void
  getUserById: (userId: string) => User
  createPeer: (remoteId: string, isInitiator: boolean) => SimplePeer.Instance | null
}