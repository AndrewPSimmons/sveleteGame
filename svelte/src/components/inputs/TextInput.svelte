<script lang="ts">
    export let value: string;
    const updateFunction = (e: Event) => {
        value = (e.target as HTMLInputElement).value;
    }
</script>

<input type="text" on:change={updateFunction} {...$$props}>