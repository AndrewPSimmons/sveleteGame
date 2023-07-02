<script lang="ts">
	import { gameData, userData, storeSocket, roomData } from 'src/stores';
	import MobileCard from './MobileCard.svelte';
	import { GameState, type GameData, type WhiteCard } from '../../../../types';

	let selectedCardArray: WhiteCard[] = [];

    const gameDataLocal: GameData = $gameData;
	const groupClicked = (cardGroup: WhiteCard[]) => {
        // If user is not judge, do nothing
        if ($gameData.judge?.member.id !== $userData.id) {
            return;
        }
		if ($gameData.state != GameState.judgePhase) {
			console.log('Not judge phase');
			return;
		}
		selectedCardArray = cardGroup;
	};

	const submitClicked = () => {
		console.log('Submitting cards', selectedCardArray);
		$storeSocket.emit('selectingWinningCards', selectedCardArray);
	};

</script>

<div class="flex flex-col justify-between h-full w-full ">
	{#if $gameData.state == GameState.postRound}
        <div class="flex flex-col h-full w-full flex-wrap  py-4 justify-center items-center overflow-y-scroll">
                Winner is {$roomData.members.find(m => m.id == $gameData.latestRoundWin?.playerId)?.username}
                {#each $gameData.latestRoundWin?.whiteCards as card}
                    <div class="sumCardContainer flex flex-row h-48 w-40 justify-between ">
                        <MobileCard {card} hideText={$gameData.state == GameState.submitPhase} />
                    </div>
                {/each}
              

        </div>
    {:else}
        <div class="flex flex-row h-full w-full flex-wrap  py-4 justify-center overflow-y-scroll">

            <p>Players Submitted: {$gameData.submittedCards.length}</p>
            {#each $gameData.submittedCards as cardGroup}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- <div
                    class={`submittedCardsss flex flex-row w-fit h-fit justify-around rounded-md p-1 space-x-1 
                            ${selectedCardArray == cardGroup ? 'bg-gray-400' : ''}`}
                    on:click={() => groupClicked(cardGroup)}
                >
                
                    {#each cardGroup as card}
                        <div class="sumCardContainer flex flex-row h-48 w-40 justify-between ">
                            <MobileCard {card} hideText={$gameData.state == GameState.submitPhase} />
                        </div>
                    {/each}
                </div> -->
            {/each}
        </div>
    {/if}

	{#if $gameData.judge?.member.id === $userData.id && $gameData.state === GameState.judgePhase}
		<!-- content here -->
		<!-- <div class="flex flex-row w-full justify-center">
			<button
				class="flex flex-row items-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 my-1 px-4 rounded"
				on:click={submitClicked}>Select Winner</button
			>
		</div> -->
	{/if}
</div>
