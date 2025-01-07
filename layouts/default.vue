<template>
  <k-page>
    <top-bar />
    <main class="mb-32">
      <slot />
      <pwa-notifications />
    </main>
    <tab-bar />
  </k-page>
</template>

<script setup>
import { kPage } from 'konsta/vue';
</script>
