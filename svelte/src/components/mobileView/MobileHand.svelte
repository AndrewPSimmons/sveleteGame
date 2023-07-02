<script lang="ts">
	// Left of here, trying to get the hand to keep track of the cards that are selected
	// We are copying the store data to allow us to update it without rerenderig the component
	//Fixed it by putting selected cards in a store
	import { onMount } from 'svelte';
	import { GameState, type CustomWhiteCard, type WhiteCard } from '../../../../types';
	import { playerHand, gameData, storeSocket, userData, selectedCards } from '../../stores';
	import Card from './MobileCard.svelte';
	import MobileCard from './MobileCard.svelte';

	let selectedCardArray: WhiteCard[] = [];

	// let playerHandLocal: WhiteCard[] = []
	// playerHand.subscribe(value => {
	//     console.log("In subscribe", value, copiedData, playerHandLocal);
	//     if(!copiedData && $playerHand.length > 0){
	//         console.log("In subscire if", value);
	//         playerHandLocal = [...value]
	//         if($gameData.state === GameState.submitPhase && !$gameData.player?.isSubmitted){
	//             copiedData = true
	//         }
	//     }
	// })

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
	const cardSelected = (card: WhiteCard) => {
		if ($gameData.judge?.member.id === $userData.id) {
			console.log('You are the judge');
			return;
		}
		if ($gameData.player?.isSubmitted) {
			console.log('Player has already submitted');
			return;
		}
		if ($selectedCards.includes(card)) {
			console.log('Card already selected');
			// Find index of selection and remove every element after it including itself
			const index = $selectedCards.indexOf(card);
			$selectedCards = $selectedCards.slice(0, index);
			return;
		}
		if ($selectedCards.length === $gameData.blackCard.pick) {
			console.log('Too many cards selected');
			return;
		}
		console.log('Card selected', card);
		$selectedCards = [...$selectedCards, card];
		console.log('Selected cards', selectedCards);
	};

	const winnerChosen = () => {
		console.log('Submitting cards', selectedCardArray);
		$storeSocket.emit('selectingWinningCards', selectedCardArray);
	};
	const submitClicked = () => {
		if ($gameData.blackCard?.pick !== $selectedCards.length) {
			console.log('Incorrect number of cards selected');
			return;
		}
		//If judge return
		if ($gameData.judge?.member.id === $userData.id) {
			console.log('You are the judge');
			return;
		}
		console.log('Submitting cards', selectedCards);
		$storeSocket.emit('submittingWhiteCards', $selectedCards);
		$selectedCards = [];
	};
	const useBlankCardClicked = (card: WhiteCard) => {
		//Get new text from window.prompt
		if ($selectedCards.length === 0) return;
		const newText = window.prompt('Enter new text for blank card');

		if (!newText) return;

		//Make most recent card custom
		const newCard: CustomWhiteCard = {
			...$selectedCards[$selectedCards.length - 1],
			oldText: $selectedCards[$selectedCards.length - 1].text,
			text: newText,
			isCustom: true
		};

		//Replace selected card with new card
		const newSelectedCards = $selectedCards.map((card) => {
			if (card.id === newCard.id) {
				return newCard;
			}
			return card;
		});
		selectedCards.set(newSelectedCards);

		//Update playerHand with new card. Replace old card with new card
		const newPlayerHand = $playerHand.map((card) => {
			if (card.id === newCard.id) {
				return newCard;
			}
			return card;
		});
		playerHand.set(newPlayerHand);
	};

	const undoBlankCard = (item: CustomWhiteCard) => {
		//If oldText is not set on card, return
		if (!item.oldText) return;
		//Find card in player hand and set text to old text, remove isCustom and oldText
		console.log("Undoing blank card", item);
		const oldCard = {
			id: item.id,
			pack: 1,
			text: item.oldText,
			_id: item._id
		}

		const newPlayerHand = $playerHand.map((card) => {
			if (card.id === oldCard.id) {
				return oldCard;
			}
			return card;
		});

		//Replace selected card with new card
		const newSelectedCards = $selectedCards.map((card) => {
			if (card.id === oldCard.id) {
				return oldCard;
			}
			return card;
		});

		selectedCards.set(newSelectedCards);
		playerHand.set(newPlayerHand);
	}
</script>

{#if $gameData.player === null}
	<div>Loading...</div>
{/if}

<div class="flex flex-col h-[80%] w-full align-middle pb-[20%]">
	<div class="w-full bg-gray-300 h-[35px] border-t border-b border-solid border-black items-center flex space-x-8 px-2">
		{#if $gameData.state === GameState.judgePhase  && $gameData.judge?.member.id === $userData.id}
			<button
			class=" bg-blue-500 hover:bg-blue-700 text-white font-bold  rounded h-full w-full"
			on:click={winnerChosen}>Select Winner</button
		>
		{:else}
		<button
		class=" bg-blue-500 hover:bg-blue-700 text-white font-bold  rounded h-full w-full"
		on:click={submitClicked}>Submit Card{$gameData.blackCard?.pick > 1? "s" : ""}</button
	>

		{/if}
	</div>
	<div class="flex flex-row h-full flex-wrap justify-center overflow-scroll">
		{#if $gameData.state === GameState.judgePhase}
			{#each $gameData.submittedCards as cardGroup}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div
					class={`submittedCardsss flex flex-row w-full h-fit justify-around rounded-md p-1 space-x-1 
                        ${selectedCardArray == cardGroup ? 'bg-gray-400' : ''}`}
					on:click={() => groupClicked(cardGroup)}
				>
					{#each cardGroup as card}
						<div class="sumCardContainer flex flex-col h-16 w-full mx-4">
							<MobileCard {card} hideText={$gameData.state == GameState.submitPhase} />
						</div>
					{/each}
				</div>
			{/each}
        {:else if $gameData.state == GameState.submitPhase}
            {#each $playerHand as item}
                <!-- <Card card={item} selected={selectedCards.includes(item)}/> -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div on:click={() => cardSelected(item)} class="h-16 w-full p-1 mx-4 bg-transparent">
                    <Card
                        card={item}
                        selected={[...$selectedCards].includes(item)}
                        selectionNumber={$selectedCards.indexOf(item) + 1}
                    />
                </div>
				<!-- If selectedCards has item show here -->
				{#if $selectedCards.includes(item)}
					 <!-- content here -->
					 <div class="flex flex-row w-full justify-around">
						<button class="bg-slate-400 rounded-md px-2 border-black border-2" on:click|stopPropagation={()=>{undoBlankCard(item)}}>Reset Card</button>
						<button class="bg-slate-400 rounded-md px-2 border-black border-2" on:click|stopPropagation={()=>{useBlankCardClicked(item)}}>Use Blank Card</button>
					</div>
				{/if}
            {/each}  
		{/if}
	</div>
</div>


<style>
	button{
		
	}
</style>