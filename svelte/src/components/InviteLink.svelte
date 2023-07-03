<script lang="ts">

    import { roomData } from "src/stores";
	import { api_domain, clientDomain, socket_domain } from "../../../globalConsts";

    let showBubble = false;
    const copyFunction = () => {
        showBubble = true;
        // const copyText = document.getElementById("inviteLink") as HTMLInputElement;
        // copyText.select();
        // copyText.setSelectionRange(0, 99999); /* For mobile devices */
        // document.execCommand("copy");
        //if dev mode is on, use localhost

        if(process.env.NODE_ENV === "development"){
            navigator.clipboard.writeText(`${"localhost:5174"}/room/join?roomCode=` + $roomData.roomCode);
        }else{
            navigator.clipboard.writeText(`${clientDomain}/room/join?roomCode=` + $roomData.roomCode);
        }
        
        setTimeout(() => {
            showBubble = false;
        }, 1500);
    }
</script>

<!-- Show a bubble that says "copied" when the copyFunction runs -->

    <button class="tooltip group" on:click={copyFunction}>
        Invite Link
        <p class={"tooltiptext  " + (showBubble ? "visible": "hidden") + " group-hover:visible"}>{showBubble ? "Copied": "Copy"}</p>
    </button>

<style>
    /* Tooltip container */
    .tooltip {
      position: relative;
      display: inline-block;
      /* border-bottom: 1px dotted black; If you want dots under the hoverable text */
    }
    
    /* Tooltip text */
    .tooltip .tooltiptext {
      width: 120px;
      background-color: black;
      color: #fff;
      text-align: center;
      padding: 5px 0;
      border-radius: 6px;
     
      /* Position the tooltip text - see examples below! */
      position: absolute;
      z-index: 1;
    }
    
    /* Show the tooltip text when you mouse over the tooltip container */
    /* .tooltip:hover .tooltiptext {
    } */
    </style>