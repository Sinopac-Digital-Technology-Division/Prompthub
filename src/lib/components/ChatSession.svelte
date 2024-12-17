<script lang="ts">
  import Icon from "@iconify/svelte";
  import { Button, Card, Select, Textarea } from "flowbite-svelte";
  import { createEventDispatcher } from "svelte";

  import type {
    ChatContent,
    ChatFormat,
    ChatMessage,
    ChatMessageRole,
  } from "$lib/type";

  import ChatMessageRenderer from "./ChatMessageRenderer.svelte";

  const dispatch = createEventDispatcher();

  export let data: ChatContent;
  export let format: ChatFormat;
  export let renderMessage: boolean = true;
  export let editable: boolean = false;
  let editingMessage: ChatMessage | null = null;
  let editingMessageContent: string = "";
  let editingMessageRole: ChatMessageRole = "user";

  const roleOptions = [
    { value: "user", name: "user" },
    { value: "ai", name: "ai" },
    { value: "system", name: "system" },
  ];

  function startEditMode(item: ChatMessage) {
    editingMessage = item;
    editingMessageContent = item.content;
    editingMessageRole = item.role;
  }

  function confirmEditMessage(item: ChatMessage) {
    item.content = editingMessageContent;
    item.role = editingMessageRole;
    editingMessage = null;
    dispatch("editdone");
  }

  function deleteMessage(item: ChatMessage) {
    data = data.filter((i) => i !== item);
    dispatch("editdone");
  }

  function onAddMessageClick() {
    const item: ChatMessage = { role: "user", content: "" };
    data = [...data, item];
    editingMessage = item;
  }
</script>

<ul class="{$$props.class} flex flex-col gap-2" id="{$$props.id}">
  {#if !data || data.length === 0}
    <p class="self-center">No messages.</p>
  {/if}

  {#each data as item}
    <li>
      <!-- icon -->
      <div class="flex flex-row gap-2">
        {#if item.role === "user"}
          <div
            class="self-start my-1 p-2 rounded-full text-orange-500 bg-orange-100 shadow-md">
            <Icon icon="mdi:user" />
          </div>
        {:else if item.role === "system"}
          <div
            class="self-start my-1 p-2 rounded-full text-gray-800 bg-gray-100 shadow-md">
            <Icon icon="mdi:settings" />
          </div>
        {:else if item.role === "ai"}
          <div
            class="self-start my-1 p-2 rounded-full text-blue-500 bg-blue-100 shadow-md">
            <Icon icon="mdi:robot" />
          </div>
        {/if}

        <!-- message -->
        <Card
          padding="none"
          class="{editable && item === editingMessage
            ? 'w-full'
            : ''} group relative max-w-full min-w-0 min-h-0 p-4 gap-4 whitespace-pre-wrap overflow-auto">
          {#if editable && item === editingMessage}
            <Select
              bind:value="{editingMessageRole}"
              items="{roleOptions}"
              class="w-48" />
            <Textarea
              rows="{8}"
              unWrappedClass="text-base"
              autofocus
              bind:value="{editingMessageContent}" />
          {:else if renderMessage}
            <ChatMessageRenderer
              format="{format}"
              bind:message="{item.content}" />
          {:else}
            <div class="whitespace-pre-wrap flex-grow overflow-auto">
              {item.content}
            </div>
          {/if}

          <!-- Edit button -->
          {#if editable}
            {#if item !== editingMessage}
              <Button
                color="alternative"
                class="group-hover:inline-flex hidden absolute right-4 top-2 p-2 shadow-md font-bold text-gray-500"
                on:click="{() => startEditMode(item)}">
                <Icon icon="tabler:edit" class="mr-2" />Edit
              </Button>
            {/if}

            <!-- Edit mode controls -->
            {#if item === editingMessage}
              <div class="w-full flex gap-2 self-center">
                <Button
                  color="alternative"
                  class="mr-auto p-2 text-red-600"
                  on:click="{() => deleteMessage(item)}">
                  <Icon icon="material-symbols:delete" class="mr-2" />Delete
                </Button>
                <Button
                  color="alternative"
                  class="right-4 p-2 text-gray-500"
                  on:click="{() => (editingMessage = null)}">
                  Cancel
                </Button>
                <Button
                  color="primary"
                  class="p-2"
                  on:click="{() => confirmEditMessage(item)}">
                  <Icon icon="material-symbols:check" class="mr-2" />Confirm
                </Button>
              </div>
            {/if}
          {/if}
        </Card>
      </div>
    </li>
  {/each}
</ul>

{#if editable}
  <Button
    color="primary"
    class="self-center mt-4"
    on:click="{onAddMessageClick}">
    <Icon icon="mdi:add" class="mr-2" />Add Message
  </Button>
{/if}
