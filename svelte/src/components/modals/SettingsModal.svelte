<script lang="ts">
    import RoomSettings from "../RoomSettings.svelte";
    import Modal from "./Modal.svelte";
    import {storeSocket} from "../../stores";
    export let open: boolean;
    export let onClose: ()=>void;


    const endGame = () => {
        console.log("Ending game from modal");
        $storeSocket.emit("endingGame")
    }
</script>


<Modal open={open} on:modalClose={onClose}>
    <RoomSettings/>
    <button on:click={()=>{endGame()}}>End Game</button>
    <button on:click={onClose}>Close</button>
</Modal>