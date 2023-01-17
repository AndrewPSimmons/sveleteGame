<script lang="ts">
    import RoomSettings from "../RoomSettings.svelte";
import Modal from "./Modal.svelte";
    export let open: boolean;
    export let onClose: ()=>void;
</script>


<Modal open={open} on:modalClose={onClose}>
    <RoomSettings/>
</Modal>