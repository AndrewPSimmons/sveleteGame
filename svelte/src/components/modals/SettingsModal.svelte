<script lang="ts">
    import RoomSettings from "../RoomSettings.svelte";
    import Modal from "./Modal.svelte";
    import {storeSocket, userData} from "../../stores";
    export let open: boolean;
    export let onClose: ()=>void;


    const endGame = () => {
        //IF not host, don't allow
        if(!$userData.isHost){
            return
        }
        console.log("Ending game from modal");
        $storeSocket.emit("endingGame")
    }
</script>


<Modal open={open} on:modalClose={onClose}>
    <RoomSettings/>
    <button on:click={()=>{endGame()}}>End Game</button>
    <button on:click={onClose}>Close</button>
</Modal>