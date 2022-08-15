import SimplePeer, { SignalData } from "simple-peer";
import { AudioElement, ClientInfo, Config } from "../interfaces";
import { Client } from "./Client";
import { playerList } from "./PlayerList";
import { Socket } from "./Socket";

export class Connection {
  pos: [number, number, number] = [0, 0, 0];
  gamemode: number = 0;
  dimension: number = 0;
  isSpectator: boolean = false;
  talking: boolean = false;
  audible: boolean = false;
  muted: boolean = false;

  audioElement?: AudioElement;
  peer: SimplePeer.Instance;

  constructor(
    public id: string,
    public displayElement: HTMLDivElement,
    public client: ClientInfo,
    public socket: Socket,
    public config: Config,
    stream: MediaStream,
    context: AudioContext,
    signal?: SignalData
  ) {
    this.peer = new SimplePeer({
      initiator: !signal,
      trickle: false,
      stream,
      config: {
        iceServers: this.config.iceServers,
      },
    });

    if (!signal) {
      this.peer.on("signal", (data) => {
        console.log("sending sendSignal");
        this.socket.send("sendSignal", { signalData: data, to: client.id });
      });

      this.socket.on("receiveSignal", (data) => {
        console.log("receiving receiveSignal");
        if (data.data.from.id != client.id) return;
        this.peer.signal(data.data.signalData);
      });
    } else {
      this.peer.on("signal", (data) => {
        console.log("sending receiveSignal");
        this.socket.send("receiveSignal", { signalData: data, to: client.id });
      });
      this.peer.signal(signal);
    }

    this.peer.on("stream", (stream) => {
      console.log("stream recieved");
      const a = document.getElementById("audioContainer") as HTMLDivElement;
      this.audioElement = this.createAudioElement(stream, context);
      a.appendChild(this.audioElement!.htmlAudioElement);
    });

    this.peer.on("close", () => {
      playerList.remove(client);
    });
  }

  createAudioElement(stream: MediaStream, context: AudioContext) {
    const dummy = document.createElement("audio");
    dummy.srcObject = stream;
    dummy.play()
    dummy.muted = true;

    const source = context.createMediaStreamSource(stream);

    const gain = context.createGain();

    const pan = context.createPanner();
    pan.panningModel = "HRTF";
    pan.distanceModel = "linear";
    pan.refDistance = 2.5;
    pan.maxDistance = this.config.maxDistance;
    pan.rolloffFactor = 1;
    pan.coneInnerAngle = 360;
    pan.coneOuterAngle = 0;
    pan.coneOuterGain = 0;

    const htmlAudioElement = document.createElement("audio");
    htmlAudioElement.autoplay = true;

    const dest = context.createMediaStreamDestination();
    source.connect(gain);
    gain.connect(pan);
    pan.connect(dest);

    htmlAudioElement.srcObject = dest.stream;

    return {
      dummyAudio: dummy,
      htmlAudioElement,
      audioContext: context,
      mediaStreamAudioSource: source,
      gain,
      pan,
      destination: dest,
    } as AudioElement;
  }

  updatePos(pos: [number, number, number]) {
    this.pos = pos;
  }
  updateDimension(dimension: number) {
    this.dimension = dimension;
  }

  updateAudioLocation(client: Client): number {
    const config = client.config;
    const audioElement = this.audioElement;

    if (!audioElement || client.deafened) {
      return 0;
    }

    // Mute if in different dimensions
    if (client.dimension != this.dimension) {
      return 0;
    }

    // Mute if client isn't spectator and players can't hear spectators
    // Disabled as I do not know of a working way to check for spectator without operator
    // if (!config.spectatorToPlayer && this.isSpectator && !client.isSpectator) {
    //   return 0;
    // }

    const { pan } = audioElement;
    let maxdistance = config.maxDistance;

    const o = this.pos;
    const m = client.pos;
    let panPos = [o[0] - m[0], o[1] - m[1], o[2] - m[2]];

    // Mute players if distance between two players is too big
    if (Math.hypot(...panPos) > maxdistance) {
      return 0;
    }

    pan.positionX.value = panPos[0];
    pan.positionY.value = panPos[1];
    pan.positionZ.value = panPos[2];
    return 1;
  }
}
