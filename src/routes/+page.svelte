<script>
	import Browser from '$lib/Browser.svelte';
</script>

<section>
	<h1 class="mb-3">NASS <i>Quicker</i>Stats Browser by AgSci LLC</h1>
</section>
<section>
	<Browser />
</section>
<footer>
	<div class="container">
		<p>
			All data courtey of <a href="https://quickstats.nass.usda.gov/">USDA NASS</a>.
		</p>
		<p>
			Replicate this project. Find the code for this project on <a
				href="https://github.com/kbhalerao/nass_quickstats">GitHub</a
			>. You will need your own API key from NASS in the .env file under the key
			PRIVATE_QUICKSTATS_API_KEY
		</p>
	</div>
</footer>
