<script lang="ts">
	import { count } from '../stores';
	import Create from './Create.svelte';
	import CreateJoin from '../components/CreateJoin.svelte';
	import Join from './Join.svelte';

	const add = () => count.set($count + 1);
	
	let selection = 'create';
</script>

<div class="flex flex-col justify-center  h-full items-center">
	<h1>Come Play CAH</h1>

	<!-- Shown on desktop -->
	<div class="h-full  flex-col items-center justify-center hidden md:flex w-[50%]">
		<div
			class=" min-h-[400px] min-w-[350px] max-w-full max-h-[200px]  flex shadow-xl border-2 border-blue-600 rounded-md"
		>
			<div
				class="w-[40%] h-full  flex flex-col items-center justify-start  bg-gradient-to-tr to-pink1 from-pink-400"
			>
				<button
					on:click={() => {
						selection = 'create';
					}}
					class={selection === 'create' ? ' buttonSelected' : ''}>Create Room</button
				>
				<button
					on:click={() => {
						selection = 'join';
					}}
					class={'pt-2' + (selection === 'join' ? ' buttonSelected' : '')}>Join Room</button
				>
			</div>
			<div class="w-[60%] h-full">
				<CreateJoin {selection} />
			</div>
		</div>
	</div>
	
	<!-- Shown on phones with join only -->
	<div class="h-full   flex-col items-center justify-center md:hidden flex">
		<div
			class=" min-h-[400px] min-w-[350px] max-w-[650px] max-h-[200px] w-[45%] flex shadow-xl border-2 border-blue-600 rounded-md"
		>
			<div class="w-full h-full">
				<CreateJoin selection="join" />
			</div>
		</div>
	</div>
</div>
<!-- <div>to-[#355cd0]</div> -->
<style>
	h1 {
		@apply text-4xl font-extrabold;
	}
	* {
		@apply text-blue2 stroke-2;
	}
	.buttonSelected {
		@apply text-2xl  bg-gradient-to-r from-blue1 via-blue-500 to-blue3 text-blue-200;
	}
	button {
		@apply text-2xl px-2 py-2 w-full;
	}
	button:hover {
		@apply text-2xl bg-blue1  text-blue-200;
	}

	p {
		@apply px-4;
	}
</style>
