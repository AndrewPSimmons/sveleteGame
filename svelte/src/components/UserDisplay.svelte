<script>
	import { roomData, gameData } from "../stores";
    import Icon from "@iconify/svelte";

    $: playerCount = $roomData.members.reduce((acc, member) => {
        if (member.isSpectator) {
            return acc;
        }
        return acc + 1;
    }, 0);

    $: spectatorCount = $roomData.members.reduce((acc, member) => {
        if (member.isSpectator) {
            return acc + 1;
        }
        return acc;
    }, 0);

    let selection = "player"
</script>

<div class="h-full p-2">
    <div class="h-full flex flex-col justify-between bg-blue-400 rounded-xl border-2">
        <div class="p-2">
            {#each $roomData.members as member}
            {#if selection == "player" && !member.isSpectator}
                <div class="flex items-center userItem">
                    <p>{member.username} </p>
                    {#if member.isHost}
                        <Icon icon="mingcute:vip-2-fill" color="black" inline={true} />
                    {/if}
                    <div class="kick">Kick</div>
                </div>
            {/if}
            {#if selection == "spectator" && member.isSpectator}
                <div class="flex items-center">
                    <p>{member.username} </p>
                    {#if member.isHost}
                        <Icon icon="mingcute:vip-2-fill" color="black" inline={true} />
                    {/if}
                </div>
            {/if}
        {/each}
        </div>
    
        <div class="flex justify-around w-full h-10 rounded-b-xl">
            <button on:click={()=>{selection = "player"}} class={selection == "player" ? "selected" : ""}>
                <p>Players ({playerCount}) </p>
            </button>
            <button on:click={()=>{selection = "spectator"}} class={selection == "spectator" ? "selected" : ""}>
                <p>Spectators ({spectatorCount}) </p>
            </button>
        </div>
    
    </div>
    
</div>
<style>
    /* Make p tag inline with icon */
    .selected {
        @apply bg-green-300;
    }
    button{
        @apply  w-full;
    }
    p {
        display: inline;
    }
    .kick{
        @apply hidden;
    }
    .userItem:hover .kick{
        @apply block;
    }
</style>