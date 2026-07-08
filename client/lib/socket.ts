import { io } from "socket.io-client";
import { API_URL } from "@/lib/api";

export function createSocket() {
  return io(API_URL, {
    autoConnect: false,
    transports: ["websocket", "polling"],
  });
}