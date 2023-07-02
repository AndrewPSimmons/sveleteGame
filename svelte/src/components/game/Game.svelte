<script>
    import {gameData} from "../../stores";
    import Hand from "./Hand.svelte";
    import Table from "./Table.svelte";
</script>

<div class="hidden sm:flex h-full w-full">
    <div class="flex flex-col h-full w-full justify-between">
        <Table/>

        <Hand/>
    </div>
</div>


<div class="sm:hidden ">
    Game small
</div>
