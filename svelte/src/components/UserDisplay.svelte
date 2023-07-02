<script lang="ts">
	import { GameState } from '../../../types';
	import { roomData, gameData, userData, storeSocket } from '../stores';
	import Icon from '@iconify/svelte';

	const kickMember = (id: string) => {
		console.log('Kick member: ', id);
		$storeSocket.emit('kickingMember', id);
	};
	$: playerCount = $roomData.members.reduce((acc, member) => {
		if (member.isSpectator) {
			return acc;
		}
		return acc + 1;
	}, 0);

	$: spectatorCount = $roomData.members.reduce((acc, member) => {
		if (member.isSpectator) {
			return acc + 1;
		}
		return acc;
	}, 0);

	let selection = 'player';

	const becomePlayer = () => {
		console.log('Become player');
		$storeSocket.emit('becomingPlayer');
	};
	const becomeSpectator = () => {
		console.log('Become spectator');
		$storeSocket.emit('becomingSpectator');
	};
</script>

<div class="h-full p-2">
	<div class="h-full flex flex-col justify-between bg-blue-400 rounded-xl border-2">
		<div class="p-2">
			{#each $roomData.members as member}
            <!-- Left side -->
				{#if selection == 'player' && !member.isSpectator }
					{#if $gameData.state != GameState.setup}
                    <!-- This next if block is for when game is live it only shows players -->
                    <!-- This allows us to access game data stuff safely inside here -->
                        {#if !member.isSpectator && !$gameData.playerQueueToJoin.map(player=>player.member.id).includes(member.id)}
                            <div class="flex items-center userItem justify-between">
                                <div class="flex items-center">
                                    <p>{member.username}</p>
                                    {#if member.isHost}
                                        <Icon icon="mingcute:vip-2-fill" color="black" inline={true} />
                                    {/if}
                                    <p class="px-2"> - </p>
                                    <p>{$gameData.wins.reduce((prev,curr)=>{
                                        if(curr.playerId == member.id){
                                            return 1 + prev
                                        }
                                        return prev
                                    }, 0
                                    )} </p>
                                    
                                </div>
                                {#if $userData.isHost && member.id != $userData.id}
                                    <button class={'kick'} on:click={() => kickMember(member.id)}>Kick</button>
                                {/if}
                            </div>
                        {/if}
						
						{#if $gameData.playerQueueToJoin.map(player=>player.member.id).includes(member.id)}
							 <!-- content here -->
							<div>{member.username} - Joining</div>
						{/if}
                    {:else}
                        <div class="flex items-center userItem justify-between">
                            <div class="flex items-center">
                                <p>{member.username}</p>
                                <!-- Reduce wins and put it in p tag -->
                               
                                {#if member.isHost}
                                    <Icon icon="mingcute:vip-2-fill" color="black" inline={true} />
                                {/if}
                            </div>
                            {#if $userData.isHost && member.id != $userData.id}
                                <button class={'kick'} on:click={() => kickMember(member.id)}>Kick</button>
                            {/if}
                        </div>
                    {/if}
				{/if}
            <!-- Right side -->
				{#if selection == 'spectator' && member.isSpectator}
					<div class="flex items-center">
						<p>{member.username}</p>
						{#if member.isHost}
							<Icon icon="mingcute:vip-2-fill" color="black" inline={true} />
						{/if}
					</div>
				{/if}
			{/each}
		</div>

		<div>
			<!-- Svelte if block for if selection = player and if the user is not a player show the show div -->
			{#if selection == 'player' && $roomData.members.find((member) => member.id == $userData.id)?.isSpectator}
				<!-- content here -->
				<button class="text-center" on:click={becomePlayer}>Join</button>
			{/if}
			{#if selection == 'spectator' && !$roomData.members.find((member) => member.id == $userData.id)?.isSpectator}
				<!-- content here -->
				<button class="text-center bg-pink3" on:click={becomeSpectator}>Join</button>
			{/if}
			<div class="flex justify-around w-full h-10 rounded-b-xl">
				<button
					on:click={() => {
						selection = 'player';
					}}
					class={selection == 'player' ? 'selected' : ''}
				>
					<p>Players ({playerCount})</p>
				</button>
				<button
					on:click={() => {
						selection = 'spectator';
					}}
					class={selection == 'spectator' ? 'selected' : ''}
				>
					<p>Spectators ({spectatorCount})</p>
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	/* Make p tag inline with icon */
	.selected {
		@apply bg-green-300;
	}
	button {
		@apply w-full;
	}
	p {
		display: inline;
	}
	.kick {
		@apply hidden;
	}
	.userItem:hover .kick {
		@apply block;
	}
</style>
