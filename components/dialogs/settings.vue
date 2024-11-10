<script setup lang="ts">
const emit = defineEmits();
const userPrefsStore = useUserPrefsStore();
const { analysisResults, wearingGoal, wearingSessions } = storeToRefs(userPrefsStore);

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
  <div class="shadowClose" @click="emit('close')"></div>
  <dialog open>
    <h2>Paramètres</h2>
    <div class="setting">
      <label for="wearingGoal">Objectif de port (en heures)</label>
      <input type="number" id="wearingGoal" v-model="wearingGoal" />
    </div>
    <button @click="emit('close')">
      <Icon name="i-tabler-device-floppy" />
      Enregistrer
    </button>

    <hr>

    <button @click="resetData">
      <Icon name="i-tabler-rotate-clockwise" />
      Réinitialiser les données
    </button>

    <button @click="exportData">
      <Icon name="i-tabler-download" />
      Exporter les données
    </button>

    <button @click="importData">
      <Icon name="i-tabler-upload" />
      Importer les données
    </button>
  </dialog>
</template>