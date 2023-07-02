<script lang="ts">
    // Left of here, trying to get the hand to keep track of the cards that are selected
    // We are copying the store data to allow us to update it without rerenderig the component
    //Fixed it by putting selected cards in a store
	import { onMount } from "svelte";
	import type { CustomWhiteCard, WhiteCard } from "../../../../types";
    import {playerHand, gameData, storeSocket, userData, selectedCards} from "../../stores";
    import Card from "./Card.svelte";

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

    const cardSelected = (card: WhiteCard) => {
        if($gameData.judge?.member.id === $userData.id){
            console.log("You are the judge");
            return
        }
        if($gameData.player?.isSubmitted){
            console.log("Player has already submitted");
            return
        }
        if($selectedCards.includes(card)){
            console.log("Card already selected");
            // Find index of selection and remove every element after it including itself
            const index = $selectedCards.indexOf(card)
            $selectedCards = $selectedCards.slice(0, index)
            return
        }
        if($selectedCards.length === $gameData.blackCard.pick){
            console.log("Too many cards selected");
            return
        }
        console.log("Card selected", card);
        $selectedCards = [...$selectedCards, card]
        console.log("Selected cards", selectedCards);
    }

    const submitClicked = () => {
        if($gameData.blackCard?.pick !== $selectedCards.length){
            console.log("Incorrect number of cards selected");
            return
        }
        //If judge return
        if($gameData.judge?.member.id === $userData.id){
            console.log("You are the judge");
            return
        }
        console.log("Submitting cards", selectedCards);
        $storeSocket.emit("submittingWhiteCards", $selectedCards)
        $selectedCards = []
    }
    const useBlankCardClicked = () => {
        //Get new text from window.prompt
        if($selectedCards.length === 0) return
        const newText = window.prompt("Enter new text for blank card")

        if(!newText) return

        //Make most recent card custom
        const newCard: CustomWhiteCard = {
            ...$selectedCards[$selectedCards.length-1],
            oldText: $selectedCards[$selectedCards.length-1].text,
            text: newText,
            isCustom: true
        }

        //Replace selected card with new card
        const newSelectedCards = $selectedCards.map(card => {
            if(card.id === newCard.id){
                return newCard
            }
            return card
        })
        selectedCards.set(newSelectedCards)
        

        //Update playerHand with new card. Replace old card with new card
        const newPlayerHand = $playerHand.map(card => {
            if(card.id === newCard.id){
                return newCard
            }
            return card
        })
        playerHand.set(newPlayerHand)
    }
</script>

{#if $gameData.player === null}
    <div>
        Loading...
    </div>
{/if}


<div class="flex flex-col h-[50%] w-full align-middle">
    <div class="w-full bg-gray-300 h-[35px] border-t border-b border-solid border-black">
        {$userData.username}'s Hand: 
        {$gameData.state}
        <button on:click={submitClicked} class="">Submit Card</button>
        <button on:click={useBlankCardClicked}>Use Blank Card</button>
    </div>
    <div class="flex flex-row h-full flex-wrap overflow-y-scroll  justify-center">
        {#each $playerHand as item}
                <!-- <Card card={item} selected={selectedCards.includes(item)}/> -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div on:click={()=>cardSelected(item)} class="h-52 w-44 p-1 bg-transparent">
                <Card card={item} selected={[...$selectedCards].includes(item)} selectionNumber={$selectedCards.indexOf(item)+1}/>
            </div>
        {/each} 
    </div>
</div>