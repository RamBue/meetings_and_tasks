import { Server } from "socket.io";

let io;

export function initSocket(httpServer, allowedOrigins) {
  io = new Server(httpServer, {
    cors: { origin: allowedOrigins },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
}

// Informiert alle verbundenen Clients, dass sich Daten geändert haben.
// Pendenzen werden über ihr Fälligkeitsdatum den Meetings zugeordnet, deshalb
// wird bewusst an alle gesendet statt nur an ein einzelnes Meeting.
export function notifyChange(entity, action, id) {
  if (!io) return;
  io.emit("data:changed", { entity, action, id: String(id) });
}
