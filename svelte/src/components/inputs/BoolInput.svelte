<script lang="ts">
    export let value: boolean;
</script>

<input type="checkbox" bind:checked={value}   {...$$props}>