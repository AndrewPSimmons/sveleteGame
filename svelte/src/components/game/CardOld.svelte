<script lang='ts'>
    import type {WhiteCard, BlackCard, CustomWhiteCard} from "../../../../types";
    import {playerHand} from "../../stores";

    export let card: WhiteCard | BlackCard;
    export let selected: boolean = false;
    export let selectionNumber: number = 0;
    export let hideText: boolean = false;

    let customText = "";
    let isCustom = false;
    let oldCard = card;
    const isBlackCard = card.hasOwnProperty("pick");

    const useBlankCardSelected = () => {
        isCustom = !isCustom;
    }

    const makeCardCustom = () => {
        if(!customText) return;
        isCustom = true;
        //Make new card

        const newCard: CustomWhiteCard = {
            ...card,
            oldText: card.text,
            text: customText,
            isCustom: true
        }

        console.log(newCard);

        playerHand.update(hand => {
            const index = hand.findIndex(c => c.id === card.id);
            hand[index] = newCard;
            return hand;
        })
        console.log($playerHand);

        isCustom = false;
    }
</script>


<div class={`
    flex
    flex-col
    h-full
    w-full
    p-2
    rounded-md
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
        <div class="flex flex-col justify-between h-full">
            {#if isCustom && selected}
                <textarea class="mb-2" name="customText" id="customText" cols="30" rows="10" on:click|stopPropagation bind:value={customText}></textarea>
            {:else}
                <p class="text-sm">{card.text}</p>
            {/if}

            
            

            {#if selected}

                {#if isCustom}
                    <!-- content here -->
                {/if}

                    <!-- content here -->
                <div class="w-full flex flex-row justify-between m-t-5">
                    <button class="border-black border-solid border rounded-md w-full" on:click|stopPropagation={useBlankCardSelected}>
                        {isCustom? "Cancle" : "Use Blank Card"}
                    </button>
                    {#if isCustom}
                        <!-- content here -->
                        <button class="border-black border-solid border rounded-md w-full" on:click|stopPropagation={makeCardCustom}>
                            Confirm
                        </button>
                    {/if}
                </div>
            {/if}
        </div>
    {/if}
    <!-- <p>{selectionNumber}</p> -->
    <!-- <p>{card.pack}</p>
    <p>{card.id}</p> -->
</div>

<!-- Make a nice css tailwind style for black and white cards -->