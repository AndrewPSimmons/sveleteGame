<script lang='ts'>
	import { playerHand, selectedCards } from "src/stores";
    import type {WhiteCard, BlackCard, CustomWhiteCard} from "../../../../types";

    export let card: WhiteCard | BlackCard;
    export let selected: boolean = false;
    export let selectionNumber: number = 0;
    export let hideText: boolean = false;
    const isBlackCard = card.hasOwnProperty("pick");

    const useBlankCardClicked = (card: WhiteCard) => {
		//Get new text from window.prompt
		if ($selectedCards.length === 0) return;
		const newText = window.prompt('Enter new text for blank card');

		if (!newText) return;

        //Get index of card
        const indexOfCard = $selectedCards.indexOf(card)
		//Make most recent card custom
		const newCard: CustomWhiteCard = {
			...$selectedCards[$selectedCards.length - indexOfCard],
			oldText: $selectedCards[$selectedCards.length - indexOfCard].text,
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


<div class={`
    flex
    flex-col
    h-full
    w-full
    p-2
    rounded-md shadow-md
    ${selected ? 
        "bg-gray-300":
        isBlackCard? "":"bg-white"
    }  
    
    ${isBlackCard ?
        "text-white bg-black":
        ""
    } 
    
    
    `}>
    {#if !hideText}
        <div class="h-full relative">
            {#if selectionNumber > 0}
                <p class="absolute -top-2 right-0">{selectionNumber}</p>
            <!-- content here -->
            {/if}
            <div class="flex flex-col justify-between h-full text-sm">
                <p class="text-sm">{card.text}</p>
                {#if $selectedCards.includes(card)}
                         <!-- content here -->
                         <div class="flex flex-row w-full justify-around">
                            <button class="bg-slate-400 rounded-md px-2 border-black border-2" on:click|stopPropagation={()=>{undoBlankCard(card)}}>Reset Card</button>
                            <button class="bg-slate-400 rounded-md px-2 border-black border-2" on:click|stopPropagation={()=>{useBlankCardClicked(card)}}>Use Blank Card</button>
                        </div>
                {/if}
            </div>
        </div>
    {:else}
    <div class="flex flex-col justify-center items-center h-[75%]">
        <p class="text-sm font-extrabold">PLAY CAH</p>
    </div>
    {/if}
    <!-- <p>{selectionNumber}</p> -->
    <!-- <p>{card.pack}</p>
    <p>{card.id}</p> -->
</div>

<!-- Make a nice css tailwind style for black and white cards -->
