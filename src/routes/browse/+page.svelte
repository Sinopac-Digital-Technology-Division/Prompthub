<script lang="ts">
  import Icon from "@iconify/svelte";
  import {
    A,
    Breadcrumb,
    BreadcrumbItem,
    Search,
    Select,
  } from "flowbite-svelte";
  import { onDestroy, onMount } from "svelte";

  import ChatCardPreview from "$lib/components/ChatCardPreview.svelte";

  import { browsePagePref, isPinned } from "$lib/store";
  import { debounce } from "$lib/util";

  let pinnedChatIds: string[] = [];
  let chatIds: string[] = [];

  let searchInputValue: string = "";
  let searchInputValueDebounced: string = "";
  let mounted = false;
  let loadedPage = 0;
  const sortbyOptions = [
    { name: "newest", value: "newest" },
    { name: "most viewed", value: "views" },
    { name: "most liked", value: "likes" },
    { name: "oldest", value: "oldest" },
    { name: "title", value: "title" },
  ];

  let chatPreviewEndDom: HTMLDivElement;
  let loadMoreObserver: IntersectionObserver;

  onMount(() => {
    mounted = true;
  });

  onDestroy(() => {
    loadMoreObserver?.unobserve(chatPreviewEndDom);
  });

  function loadMore() {
    loadedPage++;
    getChatIds(
      searchInputValueDebounced,
      $browsePagePref.sortby,
      loadedPage
    ).then((res) => {
      if (!res || res.length === 0) return;
      chatIds = [...chatIds, ...res];
    });
  }

  $: if (chatPreviewEndDom) {
    loadMoreObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1 }
    );

    loadMoreObserver.observe(chatPreviewEndDom);
  }

  async function getChatIds(
    searchInputValue: string,
    sortby: string,
    page: number = 1
  ) {
    // prepare query params
    let queryParams: {
      q?: string;
      p?: string;
      sortby?: string;
      ascending?: string;
    } = {};
    if (searchInputValue !== "") queryParams.q = encodeURI(searchInputValue);
    queryParams.p = page.toString();
    switch (sortby) {
      case "newest":
        queryParams.sortby = "time";
        queryParams.ascending = "0";
        break;
      case "oldest":
        queryParams.sortby = "time";
        queryParams.ascending = "1";
        break;
      case "views":
        queryParams.sortby = "views";
        queryParams.ascending = "0";
        break;
      case "likes":
        queryParams.sortby = "likes";
        queryParams.ascending = "0";
        break;
      case "title":
      default:
        queryParams.sortby = "title";
        queryParams.ascending = "1";
        break;
    }

    const res = await fetch("/api/search?" + new URLSearchParams(queryParams));
    const data = await res.json();

    return (data ?? []) as string[];
  }

  const updateSearchInputValue = debounce(
    (val: string) => (searchInputValueDebounced = val),
    500
  );
  $: updateSearchInputValue(searchInputValue);

  // Update due to search and sort
  $: if (mounted) {
    getChatIds(searchInputValueDebounced, $browsePagePref.sortby, 1).then(
      (res) => {
        chatIds = res;
        loadedPage = 1;
      }
    );
  }

  // get pinned previews
  async function updatePinnedPreviews(isPinned: { [id: string]: true }) {
    const promises = Object.keys(isPinned).map(async (id) => {
      const data = await fetch(`/api/search?` + new URLSearchParams({ id }));
      return await data.json();
    });
    pinnedChatIds = await Promise.all(promises);
  }

  $: updatePinnedPreviews($isPinned);
</script>

<main>
  <div class="container pt-4 pb-8">
    <div class="w-full flex gap-4">
      <Breadcrumb class="mr-auto">
        <BreadcrumbItem href="/" home>Home</BreadcrumbItem>
      </Breadcrumb>

      <Select
        items="{sortbyOptions}"
        bind:value="{$browsePagePref.sortby}"
        class="w-40" />
      <div class="w-60">
        <Search bind:value="{searchInputValue}" />
      </div>
    </div>

    <!-- Pinned Chat Previews-->
    {#if Object.keys($isPinned).length !== 0}
      <div class="flex p-2">
        <Icon
          class="self-center text-gray-700"
          icon="gravity-ui:bookmark-fill" />
        <h2 class="ml-2 text-xl font-bold self-baseline">Pinned</h2>
        <A class="ml-4 text-sm self-baseline" href="/browse/pinned">
          view all pinned
          <Icon icon="material-symbols:arrow-forward-ios-rounded" />
        </A>
      </div>
      <div
        class="pt-4 pb-8 grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-2">
        {#each Object.keys($isPinned) as chatId}
          <ChatCardPreview chatId="{chatId}" />
        {/each}
      </div>
    {/if}

    <!-- All Chat Previews-->
    {#if chatIds.length === 0}
      <div class="text-center py-8 text-gray-500">No chats found</div>
    {:else}
      <div class="flex">
        <Icon
          icon="gravity-ui:layout-cells"
          class="self-center text-gray-700" />
        <h2 class="text-xl font-bold p-2">All</h2>
      </div>
      <div
        class="pt-4 pb-8 grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-2">
        {#each chatIds as chatId}
          <ChatCardPreview chatId="{chatId}" />
        {/each}
        <div id="chat-preview-end" bind:this="{chatPreviewEndDom}"></div>
      </div>
    {/if}
  </div>
</main>
