<script lang="ts">
    import { gameData } from "src/stores";
    import Icon from "@iconify/svelte";
    export let navSelection: string;
    export let updateFunction: (sel:string)=>void;
</script>

<div class="h-full w-full flex items-center justify-between">
    <button  class={"w-full h-full " + (navSelection === "users"? " selected": "")} on:click={()=>{updateFunction("users")}}>
        <Icon icon="ic:baseline-people-alt" width={"100%"}/>
    </button>
    <button hidden={!!gameData} class={"w-full h-full " + (navSelection === "game"? " selected": "")} on:click={()=>{updateFunction("game")}}>
        <Icon icon="icon-park-outline:game-console" width={"100%"}/>
    </button>
    <button class={"w-full h-full " + (navSelection === "settings"? " selected": "")}  on:click={()=>{updateFunction("settings")}}>
        <Icon icon="material-symbols:settings" width={"100%"}/>
    </button>
    <button class={"w-full h-full " + (navSelection === "chat"? " selected": "")}  on:click={()=>{updateFunction("chat")}}>
        <!-- <Icon icon="material-symbols:chat-bubble-rounded" width={"100%"}/> -->
        <Icon icon="material-symbols:mark-chat-unread-rounded" width={"100%"}/>
    </button>
</div>

<style>
    .selected {
        @apply bg-green-300;
    }
</style>