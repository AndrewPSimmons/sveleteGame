<script>
	const routes = [
		{ name: 'Home', path: '/' },
		{ name: 'About', path: '/about' },
		{ name: 'Contact', path: '/contact' },
		{ name: 'Game', path: '/game' }
	];
</script>

<div class="w-full bg-red-200">
	{#each routes as route}
		<a href={route.path}>{route.name}</a>
	{/each}
</div>

<style>
    a {
        @apply text-blue-500 px-4;
    }
</style>
