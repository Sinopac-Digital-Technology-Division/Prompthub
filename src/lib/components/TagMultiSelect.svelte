<script lang="ts">
  import Icon from "@iconify/svelte";
  import { Badge } from "flowbite-svelte";

  import TagInput from "./TagInput.svelte";

  export let tags: string[] = [];

  function onNewTag(e: CustomEvent) {
    if (!tags.includes(e.detail)) tags = [...tags, e.detail];
  }

  function removeTag(tag: string) {
    tags = tags.filter((t) => t !== tag);
  }
</script>

<div class="flex items-center flex-wrap gap-2">
  {#each tags as tag}
    <Badge class="pr-1 gap-2">
      {tag}
      <button on:click="{() => removeTag(tag)}"
        ><Icon icon="mdi:close" /></button>
    </Badge>
  {/each}
  <TagInput on:submit="{onNewTag}" />
</div>
