<script lang="ts">
    import RoomSettings from "../RoomSettings.svelte";
    import Modal from "./Modal.svelte";
    import {storeSocket, userData} from "../../stores";
	import type { Player } from "../../../../gameServer/src/Player";
    export let open: boolean;
    export let onClose: ()=>void;
    export let winner: Player


</script>


<Modal open={open} on:modalClose={onClose}>
    <div>
        <h1>Game Over. Winner is {winner.member.username}</h1>
    </div>
</Modal>