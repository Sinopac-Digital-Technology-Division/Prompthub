<script lang="ts">
  import { Badge } from "flowbite-svelte";

  export let tag: string;
</script>

<Badge class="{$$props.class}" href="{`/browse/tags/${tag}`}">{tag}</Badge>
