<script setup lang="ts">
import { kSheet, kToolbar, kLink, kBlock, kBlockTitle, kList, kListInput } from 'konsta/vue';

const props = defineProps<{
  opened: boolean,
  analysis: Object
}>();

const emit = defineEmits(['close']);
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
  <k-sheet
    class="pb-safe w-full"
    :opened="opened"
    @backdropclick="emit('close')"
  >
    <k-toolbar top>
      <div class="left" />
      <div class="right">
        <k-link toolbar @click="save">Enregistrer</k-link>
      </div>
    </k-toolbar>

    <k-block>
      <k-block-title>Modifier une analyse</k-block-title>
      <k-list strong inset>
        <k-list-input
          label="Date"
          type="date"
          :value="newAnalysis.date"
          @input="newAnalysis.date = $event.target.value"
        >
          <template #media>
            <Icon name="i-tabler-calendar" />
          </template>
        </k-list-input>

        <k-list-input
          label="Volume (mL)"
          type="number"
          :value="newAnalysis.volume"
          @input="newAnalysis.volume = $event.target.value"
        >
          <template #media>
            <Icon name="i-tabler-cube" />
          </template>
        </k-list-input>

        <k-list-input
          label="Concentration"
          type="number"
          :value="newAnalysis.concentration"
          @input="newAnalysis.concentration = $event.target.value"
        >
          <template #media>
            <Icon name="i-tabler-flask" />
          </template>
        </k-list-input>

        <k-list-input
          label="Viscosité"
          type="text"
          :value="newAnalysis.viscosity"
          @input="newAnalysis.viscosity = $event.target.value"
        >
          <template #media>
            <Icon name="i-tabler-droplet" />
          </template>
        </k-list-input>

        <k-list-input
          label="pH"
          type="number"
          :value="newAnalysis.pH"
          @input="newAnalysis.pH = $event.target.value"
        >
          <template #media>
            <Icon name="i-tabler-test-pipe" />
          </template>
        </k-list-input>

        <k-list-input
          label="Cellules rondes (M/mL)"
          type="text"
          :value="newAnalysis.roundCells"
          @input="newAnalysis.roundCells = $event.target.value"
        >
          <template #media>
            <Icon name="i-tabler-droplet-filled-2" />
          </template>
        </k-list-input>

        <k-list-input
          label="Leucocytes (M/mL)"
          type="text"
          :value="newAnalysis.whiteBloodCells"
          @input="newAnalysis.whiteBloodCells = $event.target.value"
        >
          <template #media>
            <Icon name="i-tabler-circle" />
          </template>
        </k-list-input>

        <k-list-input
          label="Moyen contraceptif"
          type="text"
          :value="newAnalysis.device"
          @input="newAnalysis.device = $event.target.value"
        >
          <template #media>
            <Icon name="i-mdi-underwear-outline" />
          </template>
        </k-list-input>
      </k-list>
    </k-block>
  </k-sheet>
</template>
