<script lang="ts">
    import { roomData, userData } from "src/stores";
    import { storeSocket } from "src/stores";
	import type { RoomData, RoomSettings} from "../../../types";
	import BoolInput from "./inputs/BoolInput.svelte";
	import NumberInput from "./inputs/NumberInput.svelte";
    import TextInput from "./inputs/TextInput.svelte";

    let items = {
        maxPlayers: "Max Players",
        maxMembers: "Max Members",
        spectatorChatRule: "Spectator Chat Rule",
        publicLobby: "Public Lobby"
    }
    let localSettings: RoomSettings = $roomData.roomSettings;
    let selectedSpectatorChatRule: string = localSettings.spectatorChatRule;
    roomData.subscribe((data: RoomData) => {
        localSettings = data.roomSettings;
    })
    console.log({localSettings}, {});



    const updateRoomData = (key: keyof RoomSettings, value: any) => {
        $storeSocket.emit("updatingRoomSettings", ({[key]: value} as RoomSettings))
    }

    const submitFunction = (e: Event) => {
        showUpdateNotification = true;
        setTimeout(() => {
            showUpdateNotification = false;
        }, 1000);
        $storeSocket.emit("updatingRoomSettings", localSettings)
    }
    let showUpdateNotification = false;
    //maxPlayers maxMembers spectatorChatRule publicLobby
    //"all" | "gameOnly" | "lobbyOnly" | "none"

</script>


<div class="roomSettings w-full h-full bg-slate-300 " >
    <!-- {JSON.stringify($roomData.roomSettings)} -->
    <form class="w-full h-full py-2 px-4" on:submit|preventDefault={submitFunction}>
        <div class="formRow">
            <div>Max Members</div>
            <input type="number" bind:value={localSettings.maxMembers} disabled={!$userData.isHost}>
        </div>
        <div class="formRow">
            <div>Max Players</div>
            <input type="number" bind:value={localSettings.maxPlayers} disabled={!$userData.isHost}>
        </div>
        <div class="formRow">
            <div>Spectator Chat Rule</div>
            <input type="radio" id="all" name="spectatorChatRule" value="all" 
                    checked={localSettings.spectatorChatRule === "all"} 
                    on:change={()=>{updateRoomData("spectatorChatRule", "all")}} disabled={!$userData.isHost}>
            <label for="all">All</label>

            <input type="radio" id="gameOnly" name="spectatorChatRule" value="gameOnly" 
                    checked={localSettings.spectatorChatRule === "gameOnly"} 
                    on:change={()=>{updateRoomData("spectatorChatRule", "gameOnly")}} disabled={!$userData.isHost}>
            <label for="gameOnly">Game Only</label>

            <input type="radio" id="lobbyOnly" name="spectatorChatRule" value="lobbyOnly"
                    checked={localSettings.spectatorChatRule === "lobbyOnly"}
                    on:change={()=>{updateRoomData("spectatorChatRule", "lobbyOnly")}} disabled={!$userData.isHost}>
            <label for="lobbyOnly">Lobby Only</label>

            <input type="radio" id="none" name="spectatorChatRule" value="none"
                    checked={localSettings.spectatorChatRule === "none"}
                    on:change={()=>{updateRoomData("spectatorChatRule", "none")}} disabled={!$userData.isHost}>
            <label for="none">None</label>
        </div>
        <div class="formRow">
            <div>Public Lobby</div>
            <input type="checkbox" bind:checked={localSettings.publicLobby} 
                    on:change={()=>{updateRoomData("publicLobby", localSettings.publicLobby)}} disabled={!$userData.isHost}>
        </div>

        <!-- <TextInput value="Testing" />
        <NumberInput value={1} />
        <BoolInput value={true} /> -->
        <button type="submit" disabled={!$userData.isHost}>Submit</button>
        <div hidden={!showUpdateNotification} class="updateNotification">Updated</div>
    </form>
</div>

<style>

    
    .formItem {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
    .roomSettings {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    button{
        background-color: #1a202c;
        color: #fff;
        border: none;
        border-radius: 0.25rem;
        padding: 0.5rem 1rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        outline: none;
    }
    button:disabled {
        background-color: #2d3748;
        cursor: not-allowed;
    }
    button:hover {
        background-color: #2d3748;
    }
    /* make update ease in and out */
    .updateNotification {
        transition: all 0.5s ease-in-out;
    }
</style>