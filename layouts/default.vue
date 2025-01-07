<template>
  <k-page>
    <top-bar />
    <main class="mb-32">
      <slot />
    </main>
    <tab-bar />
  </k-page>
  <pwa-notifications />
</template>

<script setup>
import { kPage } from 'konsta/vue';
</script>
