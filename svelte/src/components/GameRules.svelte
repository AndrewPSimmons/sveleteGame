<script lang="ts">
    import { userData, gameData } from "src/stores";
    import { storeSocket } from "src/stores";
	import type { GameData, GameRules, RoomData, RoomSettings} from "../../../types";
	import BoolInput from "./inputs/BoolInput.svelte";
	import NumberInput from "./inputs/NumberInput.svelte";
    import TextInput from "./inputs/TextInput.svelte";

    let items = {
        maxPlayers: "Max Players",
        maxMembers: "Max Members",
        spectatorChatRule: "Spectator Chat Rule",
        publicLobby: "Public Lobby"
    }
    let localSettings: GameRules = $gameData.gameRules;
    // let selectedSpectatorChatRule: string = localSettings.spectatorChatRule;
    gameData.subscribe((data: GameData) => {
        localSettings = data.gameRules;
    })



    const updateRoomData = (key: keyof RoomSettings, value: any) => {
        $storeSocket.emit("updatingGameRules", ({[key]: value} as GameRules))
    }

    const submitFunction = (e: Event) => {
        showUpdateNotification = true;
        setTimeout(() => {
            showUpdateNotification = false;
        }, 1000);
        $storeSocket.emit("updatingGameRules", localSettings)
    }
    let showUpdateNotification = false;
    //maxPlayers maxMembers spectatorChatRule publicLobby
    //"all" | "gameOnly" | "lobbyOnly" | "none"
</script>

<div class="h-full sm:p-2">
    <div class="gameRules w-full h-full bg-slate-300 rounded-xl" >
        <!-- {JSON.stringify($roomData.roomSettings)} -->
        <h2>Game Rules</h2>
        <form class="w-full h-full py-2 px-4" on:submit|preventDefault={submitFunction}>
            <div class="formRow">
                <div>Hand Count</div>
                <input type="number" bind:value={localSettings.handCount} disabled={!$userData.isHost}>
            </div>
            <div class="formRow">
                <div>Black Card Max Pick</div>
                <input type="number" bind:value={localSettings.blackCardMaxPick} disabled={!$userData.isHost}>
            </div>
            <div class="formRow">
                <div>Winning Score</div>
                <input type="number" bind:value={localSettings.winningScore} disabled={!$userData.isHost}>
            </div>
            <div class="formRow">
                <div>Blank Card Uses</div>
                <input type="number" bind:value={localSettings.blankCardUses} disabled={!$userData.isHost}>
            </div>
            <button type="submit" disabled={!$userData.isHost}>Submit</button>
            <div hidden={!showUpdateNotification} class="updateNotification">Updated</div>
        </form>
    </div>
</div>

<style>

    
    .formItem {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
    .gameRules {
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