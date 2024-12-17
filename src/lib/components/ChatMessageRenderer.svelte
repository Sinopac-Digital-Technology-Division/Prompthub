<script lang="ts">
  import hljs from "highlight.js";
  import { onMount } from "svelte";

  import type { ChatFormat } from "$lib/type";
  import { escapeHtml, markdownToHTML } from "$lib/util";

  export let format: ChatFormat;
  export let message: string;

  onMount(() => {
    hljs.highlightAll();
  });
</script>

{#if format === "html"}
  {@html message}
{:else if format === "md"}
  <div class="_rendered-markdown flex flex-col gap-2" id="{$$props.id}">
    {@html markdownToHTML(message)}
  </div>
{:else}
  {escapeHtml(message)}
{/if}

<style>
  @import "./main.css";
  @import "./highlight.css";
</style>
