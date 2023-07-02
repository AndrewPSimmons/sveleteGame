<script lang="ts">
    import { gameData, isUnopenedChats } from "src/stores";
	import Chat from "../Chat.svelte";
    import Icon from "@iconify/svelte";
	import UserDisplay from "../UserDisplay.svelte";
	import { GameState } from "../../../../types";
	import MobileGame from "./MobileGame.svelte";

    

    let navSelection: string = "chat";
    const updateNavSelection = (selection: typeof navSelection) => {
        console.log("updateNavSelection: ", selection );
        navSelection = selection;
    }
</script>

<div class="h-full flex flex-col items-center justify-between">
    <div class="h-[90%] w-full">
            {#if navSelection === "users"}
                <UserDisplay/>
            {:else if navSelection === "chat"}
                <Chat/>
            {:else if navSelection === "game"}
                <MobileGame/>
            {/if}
    </div>


    <div class="h-[10%] w-full bg-blue-200 flex items-center justify-center">
        <!-- <MobileNavBox navSelection={navSelection} updateFunction={updateNavSelection} /> -->
        <div class="h-full w-full flex items-center justify-between">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div  class={"w-full h-full " + (navSelection === "users"? " selected": "")} on:click={()=>{updateNavSelection("users")}}>
                <Icon icon="ic:baseline-people-alt" width={"100%"}/>
            </div>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div hidden={$gameData.state === GameState.setup} class={"w-full h-full " + (navSelection === "game"? " selected": "")} on:click={()=>{updateNavSelection("game")}}>
                <Icon icon="icon-park-outline:game-console" width={"100%"}/>
            </div>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- <div class={"w-full h-full " + (navSelection === "settings"? " selected": "")}  on:click={()=>{updateNavSelection("settings")}}>
                <Icon icon="material-symbols:settings" width={"100%"}/>
            </div> -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class={"w-full h-full " + (navSelection === "chat"? " selected": "")}  on:click={()=>{updateNavSelection("chat")}}>
                <!-- <Icon icon="material-symbols:chat-bubble-rounded" width={"100%"}/> -->
                <Icon icon={$isUnopenedChats?"material-symbols:mark-chat-unread-rounded":"material-symbols:chat-bubble-rounded"} width={"100%"}/>
            </div>
        </div>
    </div>
</div>

<style>
     .selected {
        @apply bg-green-300;
    }
</style>