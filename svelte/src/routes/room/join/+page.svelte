<script lang="ts">
	import CreateJoin from "../../../components/CreateJoin.svelte";
    import { page } from "$app/stores";
    
    export let data: {roomCode: string};
</script>

<div>
    <CreateJoin selection="join" roomCode={data.roomCode}/>
</div>