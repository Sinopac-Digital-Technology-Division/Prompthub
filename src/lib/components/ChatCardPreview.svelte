<script lang="ts">
  import Icon from "@iconify/svelte";
  import { Badge, Card, Skeleton } from "flowbite-svelte";

  import { isPinned } from "$lib/store";
  import type { ChatPreview } from "$lib/type";

  export let chatId: string;
  let chatPreview: ChatPreview;
  let isLoading: boolean = true;

  $: getChatPreview(chatId);

  async function getChatPreview(chatId: string) {
    isLoading = true;
    const res = await fetch(`/chatItem/${chatId}?preview=1`, { method: "GET" });
    chatPreview = await res.json();
    isLoading = false;
  }

  function handlePin() {
    if ($isPinned[chatId]) {
      delete $isPinned[chatId];
    } else {
      $isPinned[chatId] = true;
    }
    $isPinned = $isPinned;
  }
</script>

{#if isLoading}
  <Card>
    <Skeleton />
  </Card>
{:else}
  <Card href="/chatItem/{chatPreview.id}" class="max-w-full">
    <div class="flex gap-2">
      <h5
        class="text-xl font-bold text-gray-900 dark:text-white overflow-hidden flex-1 line-clamp-3">
        {chatPreview.title}
      </h5>
      <div class="self-start">
        <button class="w-15" on:click|preventDefault="{handlePin}">
          {#if $isPinned?.[chatPreview.id]}
            <Icon icon="gravity-ui:bookmark-fill" class="text-primary-500" />
          {:else}
            <Icon icon="gravity-ui:bookmark-fill" />
          {/if}
        </button>
      </div>
    </div>

    <div>{chatPreview.username}</div>

    <div class="flex items-center gap-2">
      <!-- views and likes -->
      <span class="flex items-center gap-1 text-gray-500"
        ><Icon icon="mdi:eye" />{chatPreview.viewCount}</span>
      <span class="flex items-center gap-1 text-gray-500"
        ><Icon icon="mdi:like" />{chatPreview.likeCount}</span>

      <!-- tags preview -->
      <div class="flex gap-1">
        {#if chatPreview.tags}
          {#each chatPreview.tags as tag}
            <Badge>{tag}</Badge>
          {/each}
        {/if}
      </div>
    </div>

    <p
      class="flex-grow whitespace-pre-line line-clamp-4 mt-2 mb-3 font-normal text-gray-500 dark:text-gray-400">
      {chatPreview.description}
    </p>
  </Card>
{/if}
