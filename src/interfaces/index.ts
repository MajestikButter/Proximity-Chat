import { SignalData } from "simple-peer";

export interface Message<data extends any = any> {
  server: { name: string };
  data: data;
}
export interface Config {
  maxDistance: number;
  spectatorToPlayer: boolean;
  iceServers: RTCIceServer[]
}
export interface ClientInfo {
  name: string;
  id: string;
  isMCClient: boolean;
  isLinked: boolean;
}
export interface AudioElement {
  /**
   * Required due to a chromium bug regarding remote audio streams and the audio api
   */
  dummyAudio: HTMLAudioElement;
  htmlAudioElement: HTMLAudioElement;
  audioContext: AudioContext;
  mediaStreamAudioSource: MediaStreamAudioSourceNode;
  gain: GainNode;
  pan: PannerNode;
  destination: AudioNode;
}
export interface SocketEvents {
  [k: string]: Message;

  addClient: Message<{ client: ClientInfo }>;

  sendSignal: Message<{
    client: ClientInfo;
    from: ClientInfo;
    signalData: SignalData;
  }>;

  receiveSignal: Message<{
    client: ClientInfo;
    from: ClientInfo;
    signalData: SignalData;
  }>;

  loginFailed: Message<{ reason: string }>;

  loginSuccess: Message<{
    id: string;
    name: string;
    config: Config;
    client: ClientInfo;
  }>;

  clients: Message<{ clients: ClientInfo[] }>;

  join: Message<{}>;

  updatePlayer: Message<{
    dimension: number;
    pos: [number, number, number];
    yRot: number;
    isSpectator: boolean;
    id: string;
  }>;
}
