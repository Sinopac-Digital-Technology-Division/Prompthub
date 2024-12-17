<script lang="ts">
  import { goto } from "$app/navigation";
  import Icon from "@iconify/svelte";
  import {
    A,
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Card,
    Fileupload,
    Input,
    Label,
    Radio,
    Textarea,
    Toast,
  } from "flowbite-svelte";
  import { slide } from "svelte/transition";

  import ChatSession from "$lib/components/ChatSession.svelte";
  import TagMultiSelect from "$lib/components/TagMultiSelect.svelte";

  import { userInfo } from "$lib/store";
  import type { ChatContent } from "$lib/type";

  let submittedData: {
    title: string;
    description: string;
    tags: string[];
    source: string;
    format: string;
    content: string;
  } = {
    title: "New Chat",
    description: "No description",
    tags: [],
    source: "custom",
    format: "md",
    content: "",
  };

  let submitting: boolean = false;
  let toastStatus: {
    show: boolean;
    color: any;
    icon: string;
    message: string;
    timeout: NodeJS.Timeout | null;
  } = {
    show: false,
    color: "success",
    icon: "material-symbols:warning-rounded",
    message: "",
    timeout: null,
  };
  let sourceOptions = [
    { label: "OpenAI", value: "openai", image: "openai.png" },
    { label: "Azure OpenAI", value: "aoai", image: "azure.png" },
    { label: "Claude", value: "claude", image: "claude.png" },
    { label: "Perplexity", value: "perplexity", image: "perplexity.png" },
    { label: "Custom", value: "custom", image: "custom.png" },
  ];
  let uploadedFiles: FileList | undefined;
  $: updateFileContent(uploadedFiles);
  let customChatContent: ChatContent = [];

  $: sourceValue = submittedData.source; // extract source from submittedData so it won't be effected by changes of other fields in submittedData
  $: {
    // clear fileContent if source changes, because fileContent is not compatible with the new source
    sourceValue;
    resetContent();
  }

  function resetContent() {
    uploadedFiles = undefined;
    submittedData.content = "";
    submittedData.format = "md";
  }

  function autofillFromOpenaiFile(file: File | null) {
    if (file?.name.endsWith(".html")) {
      // find the <title> tag
      const title = submittedData.content.match(/<title>(.*)<\/title>/)?.[1];
      submittedData.title = title || "";
      submittedData.format = "html";
    } else if (file?.name.endsWith(".md")) {
      // find the # {title} on the first line
      const firstNewlineIndex = submittedData.content.indexOf("\n");
      let firstLine =
        firstNewlineIndex !== -1
          ? submittedData.content.substring(0, firstNewlineIndex)
          : submittedData.content;
      let title = firstLine.replace(/^#\s*/, "");
      submittedData.title = title || "";
      submittedData.format = "md";
    }
  }

  async function updateFileContent(files: FileList | undefined) {
    if (!files || !files.item(0)) {
      submittedData.content = "";
      return;
    }
    const file = files.item(0);
    submittedData.content = (await readFile(file)) as string;

    // Autofill title from file if source is openai
    if (submittedData.source === "openai") {
      autofillFromOpenaiFile(file);
    }
  }

  async function readFile(file: File | null) {
    if (!file) return;
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (event) => resolve(event?.target?.result as string);
      fileReader.onerror = (error) => reject(error);
      fileReader.readAsText(file);
    });
  }

  async function submit() {
    if (submittedData.source === "custom") {
      submittedData.content = JSON.stringify(customChatContent);
      await sendSubmitRequest();
    } else {
      await submitByUploadedFiles();
    }
  }

  async function submitByUploadedFiles() {
    if (!uploadedFiles || !uploadedFiles.item(0)) {
      triggerToast("error", "Please upload a file.");
      return;
    }
    for (const file of uploadedFiles) {
      submittedData.content = (await readFile(file)) as string;

      // Autofill title from file if source is openai
      if (submittedData.source === "openai") {
        autofillFromOpenaiFile(file);
      }
      await sendSubmitRequest();
    }
  }

  async function sendSubmitRequest() {
    const res = await fetch("", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...submittedData,
        username: $userInfo.username,
      }),
    });

    const parsedRes: any = await res.json();
    if (res.ok) {
      triggerToast("success", `Added chat item ${parsedRes.id}!`);
      setTimeout(() => goto(`/chatItem/${parsedRes.id}`), 1000);
    } else {
      triggerToast("error", `Failed to add chat item. (${parsedRes.error})`);
    }
  }

  function triggerToast(type: "error" | "success", message: string) {
    if (toastStatus.timeout) clearTimeout(toastStatus.timeout);
    toastStatus = {
      show: true,
      color: type === "error" ? "red" : "green",
      icon:
        type === "error"
          ? "material-symbols:warning-rounded"
          : "material-symbols:check-circle-rounded",
      message,
      timeout: null,
    };
    toastStatus.timeout = setTimeout(() => (toastStatus.show = false), 3000);
  }
</script>

<main>
  <div class="container pt-4 pb-8">
    <div class="flex justify-between items-center">
      <Breadcrumb>
        <BreadcrumbItem href="/" home>Home</BreadcrumbItem>
        <BreadcrumbItem>New chat</BreadcrumbItem>
      </Breadcrumb>
    </div>

    <Card class="max-w-screen-md mx-auto mt-4">
      <form on:submit|preventDefault="{submit}">
        <Label for="source">Source</Label>
        <div class="w-full grid grid-cols-[repeat(3,1fr)] gap-2">
          {#each sourceOptions as option}
            <Radio
              name="source"
              bind:group="{submittedData.source}"
              value="{option.value}"
              custom>
              <div
                class="p-4 gap-2 w-full h-full max-h-full text-center text-gray-500 bg-white rounded-lg border border-gray-200 cursor-pointer peer-checked:bg-primary-600 peer-checked:text-white hover:text-gray-600 hover:bg-gray-100 flex flex-col items-center">
                <img class="w-10" src="{option.image}" alt="{option.label}" />
                {option.label}
              </div>
            </Radio>
          {/each}
        </div>

        <Label for="title" class="mt-4">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="New Chat"
          bind:value="{submittedData.title}" />

        <Label for="description" class="mt-4">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="No description."
          rows="{2}"
          bind:value="{submittedData.description}" />

        <Label for="description" class="mt-4">Tags</Label>
        <TagMultiSelect bind:tags="{submittedData.tags}" />

        {#if submittedData.source === "custom"}
          <Label for="content" class="mt-4">Edit Chat</Label>
          <Card class="min-w-0 max-w-full bg-gray-100">
            <ChatSession
              bind:data="{customChatContent}"
              format="md"
              renderMessage
              editable />
          </Card>
          <textarea
            id="content"
            name="content"
            value="{JSON.stringify(customChatContent)}"
            class="hidden"></textarea>
        {:else}
          <div class="flex justify-between w-full">
            <Label for="content" class="mt-4">Upload Chat</Label>
            <A
              href="/new/howto#{submittedData.source}"
              class="flex items-center gap-2"
              ><Icon icon="gravity-ui:circle-question" />How to upload from {submittedData.source}?</A>
          </div>
          <!-- none custom -->
          {#if submittedData.source === "openai"}
            <Fileupload
              bind:files="{uploadedFiles}"
              accept=".html,.md"
              multiple />
          {:else if submittedData.source === "aoai"}
            <Fileupload bind:files="{uploadedFiles}" accept=".json" multiple />
          {:else if submittedData.source === "claude" || submittedData.source === "perplexity"}
            <Fileupload bind:files="{uploadedFiles}" accept=".md" multiple />
          {/if}
          <Textarea
            id="content"
            name="content"
            placeholder="File content here"
            rows="{4}"
            bind:value="{submittedData.content}"
            class="mt-2" />
        {/if}

        <div class="flex justify-end gap-2 mt-4">
          <Button color="alternative" href="/">Cancel</Button>
          <Button disabled="{submitting}" type="submit">Submit</Button>
        </div>
      </form>
    </Card>
  </div>

  <Toast
    class="fixed -translate-x-1/2 left-1/2 bottom-4 overflow-hidden"
    color="{toastStatus.color}"
    transition="{slide}"
    bind:open="{toastStatus.show}">
    <Icon slot="icon" icon="{toastStatus.icon}" />
    {toastStatus.message}
  </Toast>
</main>
