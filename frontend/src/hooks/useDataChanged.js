import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../config/api";

// Ruft onChange auf, sobald das Backend per Socket.io eine Datenänderung meldet.
// Mehrere Events kurz hintereinander werden zu einem Aufruf zusammengefasst.
export function useDataChanged(onChange) {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const socket = io(API_BASE_URL);
    let timer;

    socket.on("data:changed", () => {
      clearTimeout(timer);
      timer = setTimeout(() => onChangeRef.current(), 150);
    });

    return () => {
      clearTimeout(timer);
      socket.disconnect();
    };
  }, []);
}
