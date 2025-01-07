<template>
  <k-page>
    <top-bar />
    <main class="mb-32">
      <slot />
    </main>
    <tab-bar />
    <pwa-notifications />
  </k-page>
</template>

<script setup>
import { kPage } from 'konsta/vue';
</script>
