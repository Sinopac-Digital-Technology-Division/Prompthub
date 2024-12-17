<script lang="ts">
  import { page } from "$app/stores";
  import Icon from "@iconify/svelte";
  import { Badge, Breadcrumb, BreadcrumbItem } from "flowbite-svelte";
  import { onMount } from "svelte";

  import ChatCardPreview from "$lib/components/ChatCardPreview.svelte";

  let chatIds: string[] = [];
  let isLoading = true;
  let tag: string = "";
  $: {
    const path = $page.url.pathname.split("/");
    tag = path[path.length - 1];
  }

  onMount(async () => {
    isLoading = true;
    const res = await fetch("");
    chatIds = await res.json();
    isLoading = false;
  });
</script>

<main>
  <div class="container pt-4 pb-8">
    <div class="w-full flex gap-4">
      <Breadcrumb class="mr-auto">
        <BreadcrumbItem href="/" home>Home</BreadcrumbItem>
      </Breadcrumb>
    </div>

    <div class="flex">
      <Icon icon="gravity-ui:tag" class="self-center text-gray-700" />
      <h2 class="text-xl font-bold p-2">
        Prompts with tag <Badge class="text-xl"
          >{decodeURIComponent(tag)}</Badge>
      </h2>
    </div>

    {#if chatIds.length === 0}
      <div class="text-center py-8 text-gray-500">No chats found</div>
    {:else}
      <div
        class="pt-4 pb-8 grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-2">
        {#each chatIds as chatId}
          <ChatCardPreview chatId="{chatId}" />
        {/each}
      </div>
    {/if}
  </div>
</main>
