<script lang="ts">
  import { goto } from "$app/navigation";
  import Icon from "@iconify/svelte";
  import domtoimage from "dom-to-image";
  import {
    Badge,
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Card,
    Dropdown,
    DropdownItem,
    Input,
    Label,
    Modal,
    Textarea,
    Toggle,
  } from "flowbite-svelte";
  import * as OpenCC from "opencc-js";
  import { onMount } from "svelte";

  import ChatSession from "$lib/components/ChatSession.svelte";
  import Tag from "$lib/components/Tag.svelte";
  import TagMultiSelect from "$lib/components/TagMultiSelect.svelte";

  import type { ChatContent, ChatItemData } from "$lib/type";
  import { markdownToHTML } from "$lib/util";

  let chatItem: ChatItemData = {
    id: "",
    source: "custom",
    format: "md",
    title: "",
    description: "",
    content: "",
    addedTime: "",
    viewCount: 0,
    likeCount: 0,
    username: "",
    tags: [],
  };
  let edittingChatContent: ChatContent = [];
  let edittingMetadata: { title: string; description: string; tags: string[] } =
    {
      title: "",
      description: "",
      tags: [],
    };
  const converter = OpenCC.Converter({ from: "cn", to: "tw" });

  // UI elements
  let renderMessage: boolean = true;
  let showEditMetadataModal: boolean = false;
  let showConvertToZhtwModal: boolean = false;
  let showConfirmDeleteModal: boolean = false;

  onMount(async () => {
    const data = await fetch("", { method: "GET" });
    chatItem = (await data.json()) as ChatItemData;
    resetEdittingValues();
  });

  function resetEdittingValues() {
    edittingMetadata.title = chatItem.title;
    edittingMetadata.description = chatItem.description;
    edittingMetadata.tags = chatItem.tags;
    try {
      edittingChatContent = JSON.parse(chatItem.content);
    } catch (e) {
      console.error("Failed to parse chat content.", e);
    }
  }

  async function updateChatItem(data: any) {
    await fetch("", {
      method: "PUT",
      body: JSON.stringify({
        id: chatItem.id,
        data: data,
      }),
    });
  }

  async function deleteChatItem() {
    await fetch("", { method: "DELETE" });
    goto("/browse");
  }

  function cancelEditMetadata() {
    resetEdittingValues();
    showEditMetadataModal = false;
  }

  async function convertToZhtw() {
    edittingChatContent = edittingChatContent.map((chat) => {
      chat.content = converter(chat.content);
      return chat;
    });
    const converted = JSON.stringify(edittingChatContent);
    await updateChatItem({ content: converted });
    chatItem.content = converted;
  }

  function cancelConvertToZhtw() {
    resetEdittingValues();
    showConvertToZhtwModal = false;
  }

  function downloadJson() {
    const blob = new Blob([chatItem.content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.style.display = "none";
    a.download = `${chatItem.title}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function downloadImage() {
    domtoimage
      .toPng(document.getElementById("chat-session") as Node)
      .then((url: string) => {
        const link = document.createElement("a");
        link.download = "my-image-name.jpeg";
        link.href = url;
        link.click();
      });
  }

  function onChatContentEditDone() {
    updateChatItem({ content: JSON.stringify(edittingChatContent) });
  }

  async function onLikeClicked() {
    chatItem.likeCount++;
    await updateChatItem({ likeCount: chatItem.likeCount.toString() });
  }

  async function onMetadataEditDone() {
    await updateChatItem({
      title: edittingMetadata.title,
      description: edittingMetadata.description,
      tags: edittingMetadata.tags,
    });
    chatItem.title = edittingMetadata.title;
    chatItem.description = edittingMetadata.description;
    chatItem.tags = edittingMetadata.tags;
    showEditMetadataModal = false;
  }
</script>

<main>
  <div class="container pt-4 pb-8">
    <Breadcrumb>
      <BreadcrumbItem href="/" home>Home</BreadcrumbItem>
      <BreadcrumbItem>Chat</BreadcrumbItem>
    </Breadcrumb>

    <div class="max-w-full mt-4">
      <div class="relative flex gap-4 items-start">
        <div class="mb-4">
          <h1 class="font-bold text-xl break-words">{chatItem.title}</h1>
          <div class="flex items-center gap-2 mt-2">
            <span class="flex items-center gap-1 text-gray-500"
              ><Icon icon="mdi:eye" />{chatItem.viewCount}</span>
            <button
              on:click="{onLikeClicked}"
              class="gap-1 flex hover:text-primary-700 items-center text-gray-500"
              ><Icon icon="mdi:like" />{chatItem.likeCount}</button>
            <Badge color="dark">{chatItem.source}</Badge>
            <Badge color="dark">{chatItem.format}</Badge>
            {#each chatItem.tags as tag}
              <Tag tag="{tag}" />
            {/each}
          </div>

          <p class="text-gray-500 mt-2">
            By <a href="/" class="underline">{chatItem.username}</a>
          </p>

          <p
            class="_rendered-markdown mt-2 whitespace-pre-wrap text-gray-500 break-words">
            {@html markdownToHTML(chatItem.description)}
          </p>
        </div>

        <Button
          color="alternative"
          class="absolute bottom-full right-2 shadow-md text-gray-500"
          on:click="{() => {
            showEditMetadataModal = true;
          }}">
          <Icon icon="tabler:edit" class="mr-2" />Edit Metadata
        </Button>
      </div>

      <Card class="min-w-0 max-w-full bg-gray-100">
        <div class="flex items-center">
          <Toggle bind:checked="{renderMessage}"
            >Render Message ({chatItem.format})</Toggle>
          <Button color="alternative" class="ml-auto p-1">
            <Icon icon="pepicons-pencil:dots-y" height="{20}" />
          </Button>
          <Dropdown>
            <DropdownItem
              class="flex items-center gap-2"
              on:click="{() => (showConvertToZhtwModal = true)}">
              <Icon icon="icon-park-outline:chinese" />
              Convert to zh-tw...
            </DropdownItem>
            <DropdownItem
              class="flex items-center gap-2"
              on:click="{downloadJson}">
              <Icon icon="material-symbols:sim-card-download-outline" />
              Download JSON
            </DropdownItem>
            <DropdownItem
              class="flex items-center gap-2"
              on:click="{downloadImage}">
              <Icon icon="material-symbols:image-outline" />
              Download Image
            </DropdownItem>
            <DropdownItem
              class="flex items-center gap-2 text-red-600"
              on:click="{() => (showConfirmDeleteModal = true)}">
              <Icon icon="tabler:trash" />
              Delete Chat
            </DropdownItem>
          </Dropdown>
        </div>

        <ChatSession
          id="chat-session"
          bind:data="{edittingChatContent}"
          format="{chatItem.format}"
          renderMessage="{renderMessage}"
          editable
          class="mt-4"
          on:editdone="{onChatContentEditDone}" />
      </Card>
    </div>
  </div>
</main>

<Modal bind:open="{showEditMetadataModal}" outsideclose>
  <form on:submit|preventDefault="{onMetadataEditDone}">
    <Label for="title" class="mt-4">Title</Label>
    <Input
      id="title"
      name="title"
      placeholder="New Chat"
      bind:value="{edittingMetadata.title}" />

    <Label for="description" class="mt-4">Description</Label>
    <Textarea
      id="description"
      name="description"
      placeholder="No description."
      rows="{4}"
      bind:value="{edittingMetadata.description}" />

    <Label for="tags" class="mt-4">Tags</Label>
    <TagMultiSelect bind:tags="{edittingMetadata.tags}" />

    <div class="flex justify-end gap-2 mt-4">
      <Button color="alternative" on:click="{cancelEditMetadata}"
        >Cancel</Button>
      <Button type="submit" on:click="{() => (showEditMetadataModal = false)}"
        >Submit</Button>
    </div>
  </form>
</Modal>

<Modal bind:open="{showConvertToZhtwModal}" outsideclose>
  <h1>Convert the whole chat session to zh-tw. Are you sure?</h1>
  <form on:submit|preventDefault="{convertToZhtw}">
    <div class="flex justify-end gap-2 mt-4">
      <Button color="alternative" on:click="{cancelConvertToZhtw}"
        >Cancel</Button>
      <Button type="submit" on:click="{() => (showConvertToZhtwModal = false)}"
        >OK</Button>
    </div>
  </form>
</Modal>

<Modal bind:open="{showConfirmDeleteModal}" outsideclose>
  <h1>Delete this chat session. Are you sure?</h1>
  <form on:submit|preventDefault="{deleteChatItem}">
    <div class="flex justify-end gap-2 mt-4">
      <Button
        color="alternative"
        on:click="{() => (showConfirmDeleteModal = false)}">Cancel</Button>
      <Button type="submit" on:click="{() => (showConfirmDeleteModal = false)}"
        >OK</Button>
    </div>
  </form>
</Modal>
