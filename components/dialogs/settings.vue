<script setup lang="ts">
import { kSheet, kToolbar, kLink, kBlock, kBlockTitle, kList, kListInput, kListItem } from 'konsta/vue';

defineProps<{
  opened: boolean
}>();

const emit = defineEmits(['close']);
const userPrefsStore = useUserPrefsStore();
const { analysisResults, wearingGoal, dayStartAt, wearingSessions } = storeToRefs(userPrefsStore);

function exportData() {
  const data = {
    analysisResults: analysisResults.value,
    wearingGoal: wearingGoal.value,
    wearingSessions: wearingSessions.value,
  }
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'thermotrack-export.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = JSON.parse(e.target.result as string);
      analysisResults.value = data.analysisResults;
      wearingGoal.value = data.wearingGoal;
      wearingSessions.value = data.wearingSessions;

      reloadNuxtApp({force: true});
      emit('close');
    }
    reader.readAsText(file);
  }
  input.click();
}

function resetData() {
  if (confirm('Êtes-vous sûr de vouloir réinitialiser les données ?')) {
    userPrefsStore.resetPreferences();
  }

  reloadNuxtApp({force: true});
  emit('close');
}
</script>

<template>
  <k-sheet
    class="pb-safe w-full"
    :opened="opened"
    @backdropclick="emit('close')"
  >
    <k-toolbar top>
      <div class="left" />
      <div class="right">
        <k-link toolbar @click="emit('close')">Fermer</k-link>
      </div>
    </k-toolbar>

    <k-block>
      <k-block-title>État de l'application</k-block-title>
      <k-list strong inset>
        <k-list-item :title="$pwa?.offlineReady ? 'Prêt pour le mode hors ligne' : 'Installation en cours...'">
          <template #media>
            <Icon :name="$pwa?.offlineReady ? 'i-tabler-wifi-off' : 'i-tabler-loader-2'" />
          </template>
        </k-list-item>
      </k-list>

      <k-block-title>Paramètres de port</k-block-title>
      <k-list strong inset>
        <k-list-input
          label="Objectif de port (en heures)"
          type="number"
          :value="wearingGoal"
          @input="wearingGoal = $event.target.value"
        />
        <k-list-input
          label="Début de la journée"
          type="time"
          :value="dayStartAt"
          @input="dayStartAt = $event.target.value"
        />
      </k-list>

      <k-block-title>Gestion des données</k-block-title>
      <k-list strong inset>
        <k-list-item
          link
          @click="resetData"
          title="Réinitialiser les données"
        >
          <template #media>
            <Icon name="i-tabler-rotate-clockwise" />
          </template>
        </k-list-item>
        <k-list-item
          link
          @click="exportData"
          title="Exporter les données"
        >
          <template #media>
            <Icon name="i-tabler-download" />
          </template>
        </k-list-item>
        <k-list-item
          link
          @click="importData"
          title="Importer les données"
        >
          <template #media>
            <Icon name="i-tabler-upload" />
          </template>
        </k-list-item>
      </k-list>
    </k-block>
  </k-sheet>
</template>
