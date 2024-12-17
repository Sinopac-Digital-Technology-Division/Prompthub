<script lang="ts">
  import Icon from "@iconify/svelte";
  import {
    Button,
    Input,
    Label,
    Modal,
    NavBrand,
    NavHamburger,
    NavLi,
    NavUl,
    Navbar,
  } from "flowbite-svelte";

  import { userInfo } from "$lib/store";

  import "../app.postcss";

  let showSetUserModal: boolean = false;

  function setUser(e: SubmitEvent) {
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("username");
    if (name !== null) $userInfo.username = name.toString();
  }
</script>

<Navbar let:hidden let:toggle navClass="px-0 py-2.5 w-full">
  <NavBrand href="/">
    <Icon
      icon="game-icons:spell-book"
      class="mr-2 text-primary-600"
      height="2rem" />
    <span
      class="whitespace-nowrap text-2xl font-semibold text-gray-600 dark:text-white">
      Prompt<span class="text-primary-600">Hub</span>
    </span>
  </NavBrand>

  <NavHamburger on:click="{toggle}" />

  <NavUl
    hidden="{hidden}"
    class="order-1 ml-auto"
    ulClass="flex flex-col p-4 mt-4 md:flex-row md:items-center md:space-x-8 md:mt-0 md:text-sm md:font-medium">
    <NavLi class="text-center">
      <Button href="/new">
        <Icon icon="material-symbols:add" height="1.3rem" class="mr-1" />New
      </Button>
    </NavLi>
    <NavLi class="text-center my-auto" href="/browse">Browse</NavLi>
    <NavLi class="text-center my-auto" href="/browse/tags">Tags</NavLi>
    <NavLi class="text-center" href="/new/howto">Usage</NavLi>
    <NavLi
      class="flex justify-center items-center gap-2 cursor-pointer"
      on:click="{() => (showSetUserModal = true)}">
      <Icon class="rounded-full bg-gray-200" height="{20}" icon="mdi:user" />
      <span>{$userInfo.username}</span>
    </NavLi>
  </NavUl>
</Navbar>

<slot />

<Modal bind:open="{showSetUserModal}" outsideclose>
  <h1>User Profile</h1>
  <form on:submit|preventDefault="{setUser}">
    <Label>Name:</Label>
    <Input name="username" type="text" value="{$userInfo.username}" />
    <div class="flex justify-end gap-2 mt-4">
      <Button color="alternative" on:click="{() => (showSetUserModal = false)}"
        >Cancel</Button>
      <Button type="submit" on:click="{() => (showSetUserModal = false)}"
        >Submit</Button>
    </div>
  </form>
</Modal>
