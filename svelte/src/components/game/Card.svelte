<script lang='ts'>
    import type {WhiteCard, BlackCard} from "../../../../types";

    export let card: WhiteCard | BlackCard;
    export let selected: boolean = false;
    export let selectionNumber: number = 0;
    export let hideText: boolean = false;
    const isBlackCard = card.hasOwnProperty("pick");
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
            <p class="text-sm">{card.text}</p>

            
        </div>
    {/if}
    <!-- <p>{selectionNumber}</p> -->
    <!-- <p>{card.pack}</p>
    <p>{card.id}</p> -->
</div>

<!-- Make a nice css tailwind style for black and white cards -->
