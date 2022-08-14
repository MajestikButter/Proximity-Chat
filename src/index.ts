import { Modal } from "bootstrap";
import { Client } from "./classes/Client";
import { playerList } from "./classes/PlayerList";
import { Socket } from "./classes/Socket";

let client: Client | undefined;
let localStream: MediaStream;

const errorModal = new Modal(document.getElementById("errorModal") as HTMLElement, {});

const errorModalBody = document.getElementById("errorModalBody") as HTMLDivElement;
errorModalBody.innerText = "1111111";

const connectionForm = document.getElementById("serverConnectionForm") as HTMLFormElement;

const serverConnected = document.getElementById("serverConnected") as HTMLHRElement;

const linkCode = document.getElementById("mcLinkCodeInput") as HTMLInputElement;
const serverAddress = document.getElementById("serverAddressInput") as HTMLInputElement;
const serverPassword = document.getElementById("serverPasswordInput") as HTMLInputElement;

if (navigator.mediaDevices) {
  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((stream) => {
      localStream = stream;
    })
    .catch(() => {
      alert(
        "There has been a problem retrieving the streams - are you running on file:/// or did you disallow access?"
      );
    });
} else {
  alert("getUserMedia is not supported in this browser.");
}

const audioContext = new AudioContext();

connectionForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  playerList.refresh()

  const match = serverAddress.value.match(/^.+:\/\//);
  const ws = new WebSocket((match ? serverAddress.value : "ws://" + serverAddress.value));
  const socket = new Socket(ws);
  await socket.waitTillReady();

  if (client) client.destroy();
  client = new Client(socket, localStream, audioContext);

  ws.addEventListener("close", () => {
    console.log("Connection Closed");
    playerList.refresh()
    if (!client) return;

    client = undefined;
    serverConnected.innerText = `Not Connected to a Server`;
    errorModalBody.innerText = "Connection to server closed";
    errorModal.toggle();
  });

  socket.send("loginRequest", {
    linkCode: linkCode.value,
    password: serverPassword.value,
  });

  socket.once("loginFailed", (message) => {
    errorModalBody.innerText = message.data.reason;
    errorModal.toggle();
    ws.close();
    client = undefined;
  });

  socket.once("loginSuccess", (message) => {
    console.log("Login success");
    serverConnected.innerText = `Connected to ${message.server.name}`;
    if (!client) return;
    client.id = message.data.id;

    playerList.createDisplayElement(client, message.data.client)
    client.setConfig(message.data.config);
    client.socket.send("join", {});
  });

  socket.on("updatePlayer", (data) => {
    if (!client) return;
    const d = data.data;

    if (d.id == client.id) {
      client.updatePos(d.pos);
      client.updateDimension(d.dimension);
      client.updateRotation(d.yRot);
      client.isSpectator = d.isSpectator;
    } else {
      const conn = client.connections.get(d.id);
      if (!conn) return;
      conn.updatePos(d.pos);
      conn.updateDimension(d.dimension);
      conn.isSpectator = d.isSpectator;
      const a = conn.audioElement;
      if (!a) return;
      a.gain.gain.value = conn.updateAudioLocation(client);
    }
  });
});
