import { SignalData } from "simple-peer";
import { ClientInfo, Config } from "../interfaces";
import { Connection } from "./Connection";
import { Socket } from "./Socket";
import { playerList } from "./PlayerList";

export class Client {
  config: Config = { maxDistance: 50, spectatorToPlayer: false };
  pos: [number, number, number] = [0, 0, 0];
  yRot: number = 0;
  isSpectator: boolean = false;
  dimension: number = 0;
  muted: boolean = false;
  deafened: boolean = false;
  id?: string;

  connections = new Map<string, Connection>();

  interval: any;
  constructor(public socket: Socket, public localStream: MediaStream, public context: AudioContext) {
    console.log("Client created");

    this.socket.on("addClient", (data) => {
      console.log("adding client");
      const client = data.data.client;
      this.addConnection(client);
    });

    this.socket.on("sendSignal", (data) => {
      console.log("receiving sendSignal");
      this.addConnection(data.data.from, data.data.signalData);
    });
  }

  destroy() {
    for (let conn of this.connections.values()) {
      conn.peer.destroy();
      conn.audioElement?.htmlAudioElement.remove();
    }
    this.socket.ws.close();
  }

  addConnection(info: ClientInfo, signalData?: SignalData) {
    if (info.isMCClient || this.connections.has(info.id)) return;

    const displayElement = playerList.createDisplayElement(this, info);
    this.connections.set(
      info.id,
      new Connection(
        info.id,
        displayElement,
        info,
        this.socket,
        this.config,
        this.localStream,
        this.context,
        signalData
      )
    );
  }

  setConfig(config: Config) {
    this.config = Object.assign({}, this.config, config);
  }

  mute(client: ClientInfo) {
    if (client.id == this.id) {
      this.muted = true;
      return;
    }

    const connection = this.connections.get(client.id);
    if (!connection) return;
    connection.muted = true;
  }
  unmute(client: ClientInfo) {
    if (client.id == this.id) {
      this.muted = false;
      return;
    }

    const connection = this.connections.get(client.id);
    if (!connection) return;
    connection.muted = false;
  }

  updatePos(pos: [number, number, number]) {
    this.pos = pos;
  }
  updateDimension(dimension: number) {
    this.dimension = dimension;
  }
  updateRotation(y: number) {
    this.yRot = y;

    const l = this.context.listener;
    const or = this.yRotationToVector(this.yRot);
    l.forwardX.value = or[0];
    l.forwardY.value = or[1];
    l.forwardZ.value = or[2];
  }
  // https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/orientationX#example
  yRotationToVector(degrees: number) {
    // convert degrees to radians and offset the angle so 0 points towards the listener
    const radians = (degrees + 90) * (Math.PI / 180);
    // using cosine and sine here ensures the output values are always normalized
    // i.e. they range between -1 and 1
    const x = Math.cos(radians);
    const z = Math.sin(radians);

    // we hard-code the Y component to 0, as Y is the axis of rotation
    return [x, 0, z];
  }
}
