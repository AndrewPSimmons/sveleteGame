<script lang="ts">

    import {chatLog, storeSocket, userData, isUnopenedChats, isSideBarOpen, gameData, roomData} from "../stores";
    import {onMount} from "svelte";
	import type { PackData } from "../../../types";
    import {api_domain, httpPrefix} from "../../../globalConsts" ;
    let officialPacks : PackData[] = []
    onMount(() => {
        const asyncFunction = async () => {
            const url = `${httpPrefix}${api_domain}/packs/official`
            console.log("url", url);
            const response = await fetch(url,{
                method: 'GET',
            })
            const data = await response.json()

            const unsortedPacks = data.packs
            //Sort Data by pack white card count from highest to lowest
            const sortedPacks = unsortedPacks.sort((a: PackData, b: PackData) => {
                return b.white_card_count - a.white_card_count
            })

            officialPacks = sortedPacks
        }
        asyncFunction()
    })

    const checkBoxUpdate = (e:Event) => {
        const target = e.target as HTMLInputElement
        const pack_id = Number(target.id.split("-")[1])
        const isChecked = target.checked
        console.log("pack_id", pack_id);
        console.log("isChecked", isChecked);
        console.log("In Check update");
        if(isChecked){
            console.log("adding");
            console.log($storeSocket);
            $storeSocket.emit("addingPack", pack_id)
        }else{
            $storeSocket.emit("removingPack", pack_id)
        }
    }

    const lineClicked = (id: number) => {
        const checkBox = document.getElementById(`checkbox-${id}`) as HTMLInputElement
        checkBox.checked = !checkBox.checked
        checkBoxUpdate({target: checkBox} as unknown as Event)
    }
    const startGame = () => {
        //Filters for starting game
        /* 
            Need at least 1 pack
        */
        console.log("Game Data", $gameData);
        console.log($roomData);
        //If we don't have at least 3 players, don't start game
        if($roomData.members.filter(member=>!member.isSpectator).length < 3){
            alert("You need at least 3 players to start a game")
            return
        }
        if($gameData.packIds.length === 0){
            alert("You need at least 1 pack to start a game")
            return
        }
        console.log("Starting game")
    
        $storeSocket.emit("startingGame")
    }
</script>




<div class="h-full sm:p-2">
    <div class="roomSettings w-full h-full bg-slate-300 rounded-md" >
        <!-- {JSON.stringify($roomData.roomSettings)} -->
        <h2>{$userData.isHost? "Pack Selection": "Packs"}</h2>
        <div class="overflow-auto">
            {#each officialPacks as packData}
                {#if $userData.isHost}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <p class="text-xs" on:click={()=>{lineClicked(packData.pack_id)}}>
                        {packData.name} -- 
                        {packData.white_card_count}
                        <input type="checkbox" name="isSelected" id={"checkbox-"+packData.pack_id} on:change={e=>checkBoxUpdate(e)} on:click|stopPropagation
                            checked={$gameData.packIds.includes(packData.pack_id)}>
                    </p>
                {:else}
                    {#if $gameData.packIds.includes(packData.pack_id)}
                        <p class="text-xs">
                            {packData.name} -- 
                            {packData.white_card_count}
                        </p>
                    {/if}
                   
                {/if}
                    
            {/each}
            
        </div>
        {#if $userData.isHost}
            <button on:click|preventDefault={startGame}>Start Game</button>

        {/if}
    </div>
</div>

<style>

    
    .formItem {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
    .roomSettings {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    button{
        background-color: #1a202c;
        color: #fff;
        border: none;
        border-radius: 0.25rem;
        padding: 0.5rem 1rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        outline: none;
    }
    button:disabled {
        background-color: #2d3748;
        cursor: not-allowed;
    }
    button:hover {
        background-color: #2d3748;
    }
    /* make update ease in and out */
    .updateNotification {
        transition: all 0.5s ease-in-out;
    }
</style>