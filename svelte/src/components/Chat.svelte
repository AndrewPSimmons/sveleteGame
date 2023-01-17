<script lang="ts">
    import {chatLog, storeSocket, userData, isUnopenedChats, isSideBarOpen} from "../stores";

    let message = "";
    let chatIsFocused = false;
    let chatEl: null | Element = null;
    let sendMessage = () => {
        if(message === "") return;
        console.log("Sending message: ", message);
        $storeSocket.emit("sendingMessage", {
            text: message,
            username: $userData.username,
            memberId: $userData.id,
            timestamp: Date.now()
        });
        message = "";
    }
    let lastFocusTime = 0;
    chatLog.subscribe((value) => {
        if($isSideBarOpen){return}
        if(Date.now() - lastFocusTime > 1000){
            isUnopenedChats.set(true);
        }
    })

    const chatFocused = () => {
        lastFocusTime = Date.now()
        isUnopenedChats.set(false);
    }
</script>

<div class="chat h-full sm:p-2" on:focus={()=>{chatIsFocused = true}} on:blur={()=>{chatIsFocused = false}} bind:this={chatEl}>
    <div class="h-full flex flex-col justify-end bg-red-200 border-2 sm:rounded-xl" on:mouseenter={chatFocused}>
        <div class="overflow-scroll flex flex-col-reverse p-2">
            {#each $chatLog as message}
            <div class="flex ">
                <div >
                    {message.username}&nbsp-&nbsp;
                </div>
                <div class="break-words">
                    {message.text}
                    </div>
            </div>
        {/each}
        </div>
        <div>
            <form on:submit|preventDefault={sendMessage}>
                <input class="w-full sm:rounded-b-md px-2" type="text" bind:value={message} placeholder="Message"/>
            </form>
        </div>
    </div>
</div>