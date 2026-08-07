<script lang="ts">
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Rei.0x00</title>
	<link rel="icon" href="/Re.svg" />
</svelte:head>
{@render children()}
