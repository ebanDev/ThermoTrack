<script setup lang="ts">
const props = defineProps({
  analysis: {
    type: Object,
    required: true,
  },
});

console.log(props.analysis);

const emit = defineEmits();
const { analysisResults } = storeToRefs(useUserPrefsStore());

const newAnalysis = ref({ ...props.analysis });

function save() {
  const index = analysisResults.value.findIndex(a => a.id === newAnalysis.value.id);
  if (index !== -1) {
    analysisResults.value[index] = newAnalysis.value;
  }
  emit('close');
}
</script>

<template>
  <div class="shadowClose" @click="emit('close')"></div>
  <dialog open>
    <h2>Modifier une analyse</h2>
    <div class="form">
        <label for="date">
          <Icon name="i-tabler-calendar" />
          Date
        </label>
        <input type="date" id="date" v-model="newAnalysis.date" />

        <label for="volume">
          <Icon name="i-tabler-cube" />
          Volume (mL)
        </label>
        <input type="number" id="volume" v-model="newAnalysis.volume" />

        <label for="concentration">
          <Icon name="i-tabler-flask" />
          Concentration
        </label>
        <input type="number" id="concentration" v-model="newAnalysis.concentration" />

        <label for="viscosity">
          <Icon name="i-tabler-droplet" />
          Viscosité
        </label>
        <input type="text" id="viscosity" v-model="newAnalysis.viscosity" />

        <label for="ph">
          <Icon name="i-tabler-test-pipe" />
          pH
        </label>
        <input type="number" id="ph" v-model="newAnalysis.pH" />

        <label for="roundCells">
          <Icon name="i-tabler-droplet-filled-2" />
          Cellules rondes (M/mL)
        </label>
        <input type="text" id="roundCells" v-model="newAnalysis.roundCells" />

        <label for="whiteBloodCells">
          <Icon name="i-tabler-circle" />
          Leucocytes (M/mL)
        </label>
        <input type="text" id="whiteBloodCells" v-model="newAnalysis.whiteBloodCells" />

        <label for="device">
          <Icon name="i-mdi-underwear-outline" />
          Moyen contraceptif
        </label>
        <input type="text" id="device" v-model="newAnalysis.device" />
    </div>

    <button @click="save">
      <Icon name="i-tabler-device-floppy" />
      Enregistrer
    </button>
  </dialog>
</template>