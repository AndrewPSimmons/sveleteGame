import { browser } from "$app/environment";
import type { Socket } from "socket.io-client";
import { get, writable, type Writable } from "svelte/store";
import type { ChatMessage, ClientToServerEvents, RoomData, RoomSettings, ServerToClientEvents,  UserData } from "../../types";



const createWritableStore = <T>(key: string, initValue: T): Writable<T> => {
  const store = writable(initValue);
  if (!browser) return store;

  const storedValueStr = sessionStorage.getItem(key);
  if (storedValueStr != null) store.set(JSON.parse(storedValueStr));

  store.subscribe((val: any) => {
    if ([null, undefined].includes(val)) {
      sessionStorage.removeItem(key)
    } else {
      sessionStorage.setItem(key, JSON.stringify(val))
    }
  })

  window.addEventListener('storage', () => {
    const storedValueStr = sessionStorage.getItem(key);
    if (storedValueStr == null) return;

    const localValue: T = JSON.parse(storedValueStr)
    if (localValue !== get(store)) store.set(localValue);
  });

  return store;
}


export const count = writable(0);

export const gameData = writable();

export const roomData = writable<RoomData>({
  roomCode: "",
  members: [],
  roomSettings: {} as RoomSettings
});

export const storeSocket = writable<Socket<ServerToClientEvents, ClientToServerEvents>>();

export const isSideBarOpen = writable<boolean>(true);
export const chatLog = writable<ChatMessage[]>([]);
export const isUnopenedChats = writable<boolean>(false);

export const userData = createWritableStore<UserData>("userData", {username: "", id: "", roomCode: "", isHost: false} as UserData);

export const homeFormData = writable({
  username: "",
  password: "",
  roomCode: ""
})


export const mobileMenuValue = writable<"table"|"chat">("table");