<script lang="ts">
  import Icon from "@iconify/svelte";
  import { Dropdown, DropdownItem } from "flowbite-svelte";
  import { createEventDispatcher } from "svelte";

  import { debounce } from "$lib/util";

  const dispatch = createEventDispatcher();

  let inputVal: string = "";
  let suggestions: { tag: string }[] = [];

  async function onInputChange() {
    if (inputVal === "") {
      suggestions = [];
      return;
    }
    const searchRes = await fetch(
      "/api/tags?" + new URLSearchParams({ q: inputVal })
    );
    suggestions = await searchRes.json();
  }
  const debounceOnInputChange = debounce(onInputChange, 300);

  $: debounceOnInputChange(inputVal);

  async function submitTag(tag: string) {
    if (!tag) return;
    dispatch("submit", tag.trim());
    inputVal = "";
  }
</script>

<form
  class="relative border rounded-md w-fit"
  on:submit|preventDefault="{() => submitTag(inputVal)}">
  <div class="flex items-center">
    <input
      type="text"
      class="border-0 shadow-none focus:ring-0 py-1 pr-0 flex-grow rounded-md w-32 text-sm"
      placeholder="Add tag..."
      bind:value="{inputVal}" />
    <button
      tabindex="-1"
      class="hover:bg-gray-100 hover:text-primary-500 rounded-md p-1"
      type="submit"><Icon icon="material-symbols:add" width="{20}" /></button>
  </div>
  <Dropdown open="{suggestions.length > 0}" class="w-full">
    {#each suggestions as suggestion}
      <DropdownItem on:click="{() => submitTag(suggestion.tag)}"
        >{suggestion.tag}</DropdownItem>
    {/each}
  </Dropdown>
</form>
