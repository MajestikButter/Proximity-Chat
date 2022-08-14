import { SocketEvents } from "../interfaces";
import { EventEmitterM } from "./EventEmitterM";

export class Socket extends EventEmitterM<SocketEvents> {
  constructor(public ws: WebSocket) {
    super();

    ws.addEventListener("message", (message) => {
      let data;
      try {
        data = JSON.parse(message.data);
      } catch {
        return;
      }

      this.emit(data.type, data);
    });

    window.onbeforeunload = () => {
      ws.close();
    };
  }

  get isReady() {
    return this.ws.readyState == 1;
  }

  waitTillReady() {
    return new Promise<void>((resolve) => {
      if (this.ws.readyState == 1) return;
      if (this.ws.readyState > 1)
        throw new Error("WebSocket is closed/closing");

      this.ws.addEventListener("open", (ws) => {
        console.log("Connected to server");
        resolve();
      });
    });
  }

  send(type: string, data: any = {}) {
    this.ws.send(
      JSON.stringify({
        type,
        client: {},
        data: data,
      })
    );
  }
}
