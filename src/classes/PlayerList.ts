import { ClientInfo } from "../interfaces";
import { Client } from "./Client";

export class PlayerList {
  html = document.getElementById("playerList") as HTMLDivElement;

  elements = new Map<string, HTMLDivElement>();

  refresh() {
    while (this.html.firstChild) this.html.removeChild(this.html.firstChild);
    for (let e of this.elements.values()) {
      this.html.appendChild(e);
    }
  }

  createDisplayElement(client: Client, info: ClientInfo) {
    const playerEntry = document.createElement("div");
    playerEntry.className = "list-group-item d-flex justify-content-between";

    const status = info.isLinked ? "Connected" : info.isMCClient ? "Minecraft-Only" : "Web-Only";
    const nameText = document.createElement("h5");
    nameText.className = "mb-1";
    nameText.innerText = `${info.name} [${status}]`;
    playerEntry.appendChild(nameText);

    const muteDiv = document.createElement("div");
    muteDiv.className = "form-check form-switch";

    const muteCheckbox = document.createElement("input");
    muteCheckbox.type = "checkbox";
    muteCheckbox.className = "form-check-input";
    muteCheckbox.addEventListener("change", (ev) => {
      if (muteCheckbox.checked) client.mute(info);
      else client.unmute(info);
    });
    muteDiv.appendChild(muteCheckbox);

    const muteLabel = document.createElement("label");
    muteLabel.className = "form-check-label";
    muteLabel.innerText = "Mute";
    muteDiv.appendChild(muteLabel);

    playerEntry.appendChild(muteDiv);

    this.elements.set(info.id, playerEntry);
    this.refresh();

    return playerEntry;
  }
}
export const playerList = new PlayerList();
