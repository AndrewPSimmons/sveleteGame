<script lang="ts">
    export let value: number;
    const updateFunction = (e: Event) => {
        value = 1
    }
</script>

<input type="number"  bind:value={value} on:change={updateFunction} {...$$props}>