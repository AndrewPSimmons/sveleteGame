<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';
	export let open = false;

	const dispatch = createEventDispatcher();
	const close = () => {
		console.log("CLosing modal");
		dispatch('modalClose')
		open = false
	};

	let modal: HTMLElement;

	const handle_keydown = (e: any) => {
		if(!open) return;
		if (e.key === 'Escape') {
			close();
			return;
		}

		if (e.key === 'Tab') {
			// trap focus
			const nodes = modal.querySelectorAll('*');
			const tabbable = Array.from(nodes).filter((n) => (n as HTMLElement).tabIndex >= 0);

            if(document.activeElement === null) return;
			let index = tabbable.indexOf(document.activeElement);
			if (index === -1 && e.shiftKey) index = 0;

			index += tabbable.length + (e.shiftKey ? -1 : 1);
			index %= tabbable.length;

			(tabbable[index] as HTMLElement).focus();
			e.preventDefault();
		}
	};

	const previously_focused = typeof document !== 'undefined' && document.activeElement;
    
	if (previously_focused) {
		onDestroy(() => {
			(previously_focused as HTMLElement).focus();
		});
	}

</script>
<svelte:window on:keydown={handle_keydown}/>

{#if open}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="modal-background" on:click={close}></div>

	<div class="modal flex flex-col" role="dialog" aria-modal="true" bind:this={modal}>
		<slot name="header"></slot>
		<slot></slot>

		<!-- svelte-ignore a11y-autofocus -->
		<!-- <button  on:click={close}>close modal</button> -->
	</div>
{/if}

<style>
	.modal-background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0,0,0,0.3);
	}

	.modal {
		position: absolute;
		left: 50%;
		top: 50%;
		width: calc(100vw - 4em);
		max-width: 32em;
		max-height: calc(100vh - 4em);
		overflow: auto;
		transform: translate(-50%,-50%);
		
		border-radius: 0.2em;
		background: white;
		@apply p-4 h-full;
	}

	button {
		display: block;
		position: relative;
		height: 0;
	}
</style>