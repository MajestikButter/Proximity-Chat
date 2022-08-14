import { Message } from "../interfaces";

export class EventEmitterM<
  events extends { [event: string]: any } = { [event: string]: any }
> {
  #eventListeners: {
    [k in keyof events]?: [
      (data: events[k]) => void | Promise<void>,
      boolean
    ][];
  } = {};

  on<type extends keyof events>(
    type: type,
    callback: (data: events[type]) => void | Promise<void>
  ) {
    if (!this.#eventListeners[type]) this.#eventListeners[type] = [];
    this.#eventListeners[type]?.push([callback, false]);
  }

  once<type extends keyof events>(
    type: type,
    callback: (data: events[type]) => void | Promise<void>
  ) {
    if (!this.#eventListeners[type]) this.#eventListeners[type] = [];
    this.#eventListeners[type]?.push([callback, true]);
  }

  emit<type extends keyof events>(type: type, data: events[type]) {
    if (!this.#eventListeners[type]) return;
    for (let i = 0; i < this.#eventListeners[type]!.length; i++) {
      const listener = this.#eventListeners[type]![i];
      listener[0](data);
      if (listener[1]) this.#eventListeners[type]!.splice(i, 1);
    }
  }
}
