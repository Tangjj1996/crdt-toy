import { atom } from "jotai";

export const asyncWebsocket = atom(async () => {
  return await new Promise<WebSocket>((resolve) => {
    const websocket = new WebSocket("ws://localhost:8888/websocket");
    websocket.addEventListener("open", () => {
      resolve(websocket);
    });
  });
});
