<script lang="ts">
	import { onMount } from "svelte";
    import Icon from "@iconify/svelte"
    import {userData, roomData, gameData, storeSocket, isUnopenedChats, isSideBarOpen} from "../../stores";
    import {socketInit} from "../../lib/realtime"
	import { stringify } from "postcss";
	import { io } from "socket.io-client";
	import Chat from "../../components/Chat.svelte";
	import UserDisplay from "../../components/UserDisplay.svelte";
	import MobileRoom from "../../components/mobileView/MobileRoom.svelte";
	import Game from "../../components/game/Game.svelte";
	import SettingsModal from "src/components/modals/SettingsModal.svelte";
	import { ErrorActions, GameState } from "../../../../types";
	import RoomSettings from "src/components/RoomSettings.svelte";
	import GameRules from "src/components/GameRules.svelte";
	import PackSelection from "src/components/PackSelection.svelte";
	import InviteLink from "src/components/InviteLink.svelte";

    onMount(()=> {
        const socket = socketInit($userData)
        storeSocket.set(socket)
        socket.on("error", data => {
            console.log("recieved error from socket server: ", data.message)
            const actions = data.actions
            console.log("Actions in error: ", actions);
            if(actions.includes(ErrorActions.clearUserData)){
                userData.set({
                    username: "",
                    roomCode: "",
                    id: "",
                    isHost: false
                })
            }
            if(actions.includes(ErrorActions.redirectToJoin)){
                location.href = "/room/join"
            }
            if(actions.includes(ErrorActions.redirectToHome)){
                location.href = "/"
            }
        })
        // socket.on("roomNotFound", (data) => {
        //     console.log("received roomNotFound");
        //     userData.set({
        //         username: "",
        //         roomCode: "",
        //         id: ""
        //     })
        //     location.href = "/"
        // })
        // socket.on("memberNotFound", (data)=> {
        //     console.log("received memberNotFound");
        //     location.href = "/room/join"
        // })
        console.log("Room data right before emit", $userData);
        socket.emit("joiningRoom", $userData)
        if(!$userData.roomCode && !$userData.id && !$userData.username){
            location.href = "/room/join"
        }
        
    })
    
    const settingsClicked = (e: MouseEvent) => {
        isSettingsModalOpen = true
        e.stopPropagation()
    }
    let isSettingsModalOpen = false;
</script>


<div class="h-full sm:flex  items-center justify-between hidden">
    <SettingsModal open={isSettingsModalOpen} onClose={()=>isSettingsModalOpen = false}/>

    <!-- Left side of screen -->
    <div class="w-content h-full bg-pink1 flex  justify-between">
        <div class={"flex-col " +( $isSideBarOpen ? " flex": " hidden")}>

            <div class="h-[5%] bg-gradient-to-r from to-blue-500  from-blue2 leftItem flex justify-between items-center">
                <button class="h-full" on:click={settingsClicked}>
                    <Icon icon="material-symbols:settings" height={"100%"} />
                </button>
                <InviteLink/>
                {$roomData.roomCode}

            </div>
            <div class="h-[60%]  leftItem">
                <Chat/>
            </div>
            <div class="h-[35%]  leftItem">
                <UserDisplay/>
            </div>
        </div>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class={"w-[30px]  from-blue-500 via-blue3 to-pink2 flex flex-col justify-between " + ($isSideBarOpen? "bg-gradient-to-b": "bg-gradient-to-t")} on:click={()=>{isSideBarOpen.set(!$isSideBarOpen)}}>
                <div>
                    <div>
                        <Icon icon='material-symbols:keyboard-double-arrow-left-rounded' width="100%" rotate={$isSideBarOpen?0:2}/>
                    </div>
                    <button class={"w-full " + ($isSideBarOpen? "hidden":"")} on:click={settingsClicked}>
                        <Icon icon="material-symbols:settings" height={"100%"}/>
                    </button>
                    <button class={"w-full " + ($isSideBarOpen? "hidden":"")}>
                        <Icon icon={$isUnopenedChats?"material-symbols:mark-chat-unread-rounded":"material-symbols:chat-bubble-rounded"} height={"100%"}/>
                    </button>
                </div>
                <div>
                    <Icon icon={'material-symbols:keyboard-double-arrow-left-rounded'} width="100%" rotate={$isSideBarOpen?0:2}/>
                </div>
        </div>
    </div>

    <!-- Right side of screen -->
    {#if $gameData.state === GameState.setup}
        <div class="w-full h-full p-2 flex justify-betweem items-center space-x-1">
            <div class="w-[50%] rightItem">
                <PackSelection/>
            </div>
            <div class="w-[50%] rightItem">
                <div class="h-full flex flex-col">
                    <RoomSettings/>
                    <GameRules/>
                </div>
            </div>
        </div>
    {:else}
        <Game/>
    {/if}

</div>

<div class="sm:hidden h-full">
    <MobileRoom/>
</div>

<style>
    .leftItem{
        @apply min-w-[300px] max-w-[28px] w-full m-0;
    }
    .rightItem{
        @apply h-full m-0;
    }
</style>