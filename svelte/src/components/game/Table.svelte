<script lang="ts">
    import {gameData, userData} from "../../stores";
	import Card from "./Card.svelte";
	import SubmittedCards from "./SubmittedCards.svelte";

</script>

<div class="flex flex-row h-[50%] w-full align-middle ">
    <div class="w-[20%] flex flex-col items-center justify-center">
        {#if $gameData.judge?.member.id === $userData.id}
            <p class="text-xl font-extrabold">You are Judge</p>
        {/if}
        <div id="blackCardContainer" class="h-52 w-44 ">
            <Card card={$gameData.blackCard} />
        </div>
    </div>
    <div class="w-[80%] flex flex-col items-center justify-center">
        <SubmittedCards/>
    </div>
</div>