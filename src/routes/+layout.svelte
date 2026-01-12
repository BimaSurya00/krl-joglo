<script>
	import "../app.css";
	import favicon from "$lib/assets/favicon.svg";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta
		name="description"
		content="Tracking posisi KRL Commuter Line Yogyakarta - Solo secara real-time. Pantau kereta Jogja-Solo dengan mudah."
	/>
	<meta
		name="keywords"
		content="KRL, Jogja, Solo, Yogyakarta, tracking, kereta, commuter line, jadwal"
	/>
	<meta name="author" content="KRL Joglo" />
	<title>KRL Jogja - Solo | Tracking Kereta</title>
</svelte:head>

{@render children()}
