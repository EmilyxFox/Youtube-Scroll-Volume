<script lang="ts">
  import { onMount } from 'svelte';
  import browser from 'webextension-polyfill';

  let range = $state(-1);

  let steps: Record<number, number> = {
    0: 1,
    1: 2,
    2: 3,
    3: 5,
    4: 10,
  };

  onMount(async () => {
    let { stepSize } = (await browser.storage.sync.get('stepSize')) as Record<string, number>;

    range = Object.values(steps).indexOf(stepSize);
  });

  $effect(() => {
    if (range === -1) return;
    console.log(`Step: ${range}, value: ${steps[range]}`);
    browser.storage.sync.set({ stepSize: steps[range] });
  });
</script>

<div class="my-6 flex flex-row items-center justify-center gap-6">
  <h2 class="text-2xl">Step size</h2>
  <div class="w-3/5">
    <input type="range" min="0" max="4" class="range" step="1" bind:value={range} />
    <div class="flex w-full justify-between px-2 text-xs">
      <span>1</span>
      <span>2</span>
      <span>3</span>
      <span>5</span>
      <span>10</span>
    </div>
  </div>
</div>
