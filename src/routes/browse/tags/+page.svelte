<script lang="ts">
  import { Breadcrumb, BreadcrumbItem, Search } from "flowbite-svelte";
  import { onMount } from "svelte";

  import Tag from "$lib/components/Tag.svelte";

  type Tag = { tag: string };

  let allTags: Tag[] = [];
  let searchInputValue: string = "";

  function filterTags(data: Tag[], searchInputValue: string): Tag[] {
    if (!searchInputValue) return data;

    const searchTags = searchInputValue.split(" ");

    return data.filter((item) =>
      searchTags.some((keyword) => keyword && item.tag.includes(keyword))
    );
  }

  onMount(async () => {
    const res = await fetch("/api/tags");
    allTags = await res.json();
  });

  $: filteredTags = filterTags(allTags, searchInputValue);
</script>

<main>
  <div class="container pt-4 pb-8">
    <div class="flex justify-between items-center mb-8">
      <Breadcrumb>
        <BreadcrumbItem href="/" home>Home</BreadcrumbItem>
        <BreadcrumbItem href="/browse/tags">Tags</BreadcrumbItem>
      </Breadcrumb>
    </div>
    <div class="flex flex-col items-center justify-center mt-32">
      <div class="w-2/5 min-w-[24rem]">
        <Search placeholder="Search Tags" bind:value="{searchInputValue}" />
      </div>
      <div class="flex flex-wrap flex-row mt-8 max-w-md justify-center gap-4">
        {#each filteredTags as tagInfo}
          <Tag class="text-base" tag="{tagInfo.tag}" />
        {/each}
      </div>
    </div>
  </div>
</main>
