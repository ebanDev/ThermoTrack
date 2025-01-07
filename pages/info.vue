<script setup>
import { kCard } from 'konsta/vue';

definePageMeta({
    title: 'Informations',
});
</script>

<template>
  <main class="flex flex-col">
    <k-card 
      link
      href="https://thoreme.com"
      target="_blank"
      class="hover:bg-md-light-surface-variant dark:hover:bg-md-dark-surface-variant"
    >
      <div class="flex items-center gap-3">
        <img src="https://thoreme.com/favicon.ico" alt="Logo" class="w-8 h-8" />
        <div>
          <h1 class="font-bold text-base mb-1">Thoreme</h1>
          <p class="text-md-light-on-surface-variant dark:text-md-dark-on-surface-variant">
            Site d'information sur la contraception testiculaire thermique.
          </p>
        </div>
      </div>
    </k-card>

    <k-card>
      <p class="leading-relaxed">
        Cette application a été développée pour aider les personnes pratiquant la contraception testiculaire thermique, 
        elle a été développée par 
        <a href="https://eban.eu.org" class="text-md-light-primary dark:text-md-dark-primary">Eban</a>, 
        elle est open-source et disponible sur 
        <a href="https://github.com/ebanDev/ThermoTrack" class="text-md-light-primary dark:text-md-dark-primary">GitHub</a>.
      </p>
    </k-card>
  </main>
</template>
