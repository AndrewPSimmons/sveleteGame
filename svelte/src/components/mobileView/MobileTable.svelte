<script lang="ts">
    import {gameData, userData} from "../../stores";
	import MobileCard from "./MobileCard.svelte";
	import SubmittedCards from "./MobileSubmittedCards.svelte";

</script>

<div class="flex flex-row h-fit w-full align-middle p-2">
    <div class=" flex flex-row items-center justify-center">
        {#if $gameData.judge?.member.id === $userData.id}
            <p class="text-xl font-extrabold">You are Judge</p>
        {/if}
        <div id="blackCardContainer" class="h-52 w-44 ">
            <MobileCard card={$gameData.blackCard} />
        </div>
    </div>
    <div class="w-[80%] flex flex-col items-center justify-center">
        <SubmittedCards/>
    </div>
</div>