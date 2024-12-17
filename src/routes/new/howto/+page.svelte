<script lang="ts">
  import Icon from "@iconify/svelte";
  import { Breadcrumb, BreadcrumbItem, Hr } from "flowbite-svelte";

  import ChatMessageRenderer from "$lib/components/ChatMessageRenderer.svelte";

  export let data;
</script>

<div class="container pt-4 pb-8">
  <div class="flex justify-between items-center mb-8">
    <Breadcrumb>
      <BreadcrumbItem href="/" home>Home</BreadcrumbItem>
      <BreadcrumbItem href="/new">New chat</BreadcrumbItem>
      <BreadcrumbItem>How to upload chat</BreadcrumbItem>
    </Breadcrumb>
  </div>

  <div class="flex flex-col gap-4 max-w-[75ch]">
    <ChatMessageRenderer
      id="openai"
      format="md"
      message="{`
# OpenAI
If your chat comes from [OpenAI](https://chatgpt.com), install the [Chatgpt Exporter](https://github.com/pionxzh/chatgpt-exporter) extension and **Export to markdown or html**.`}" />
    <Hr />

    <ChatMessageRenderer
      id="aoai"
      format="md"
      message="{`
# Azure OpenAI
If your chat comes from Azure OpenAI playground, **drag and drop the "ShareAOAI" link below to your browser's bookmark.**

When you are on the Azure Chat playground page, click it when you want to export your chat.`}" />

    <div class="flex">
      <a
        href="{data.shareAoaiScript}"
        title="shareAOAI"
        class="flex items-center gap-1 px-2 rounded-md font-bold font-mono bg-primary-100 text-primary-600">
        <Icon icon="material-symbols:link" />
        ShareAOAI
      </a>
    </div>
    <Hr />

    <ChatMessageRenderer
      id="claude"
      format="md"
      message="{`
# Claude
If your chat comes from [Claude](https://claude.ai/), install the [Claude Exporter](https://chromewebstore.google.com/detail/claude-exporter-extract-c/elhmfakncmnghlnabnolalcjkdpfjnin?hl=en) extension and **Export to mardown**.`}" />
    <Hr />

    <ChatMessageRenderer
      id="perplexity"
      format="md"
      message="{`
# Perplexity
If your chat comes from [Perplexity](https://www.perplexity.ai/), install the [Save my Chatbot](https://chromewebstore.google.com/detail/save-my-chatbot-ai-conver/agklnagmfeooogcppjccdnoallkhgkod) extension. While on the Perplexity page, click the extension icon to **download as markdown**.`}" />
  </div>
</div>
