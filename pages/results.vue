<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js'
import { kCard, kList, kListItem, kButton, kBlock, kBlockTitle } from 'konsta/vue';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement)
const { analysisResults } = storeToRefs(useUserPrefsStore());
const showAddAnalysisDialog = ref(false);
const showEditAnalysisDialog = ref(false);
const currentAnalysis = ref(null);

definePageMeta({
    title: 'Résultats',
});

const dateToLocaleString = (date: string) => new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

const sortedResults = computed(() => analysisResults.value.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
const invertedResults = computed(() => sortedResults.value.slice().reverse());

const concentrations = computed(() => invertedResults.value.map(result => result.concentration));
const roundCells = computed(() => invertedResults.value.map(result => result.roundCells));

const chartData = computed(() => ({
    labels: invertedResults.value.map(result => new Date(result.date).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })),
    datasets: [
        {
            label: 'Concentration',
            data: concentrations.value,
            borderColor: 'rgba(11, 58, 107, 1)',
            backgroundColor: 'rgba(11, 58, 107, 0.2)',
        },
        {
            label: 'Cellules rondes',
            data: roundCells.value,
            borderColor: 'rgba(0, 86, 179, 1)',
            backgroundColor: 'rgba(0, 86, 179, 0.2)',
        },
    ],
}));

const chartOptions = reactive({
    scales: {
        y: {
            beginAtZero: true,
            max: 1
        },
    },
    elements: {
        line: {
            tension: 0.4
        },
    },
});

const swiperRef = ref(null)
const swiper = useSwiper(swiperRef, {
    pagination: {
        clickable: true,
    },
    spaceBetween: 30,
});

const availableTips = computed(() => {
    if (sortedResults.value.length < 1) return [];
    
    return [
        {
            text: "Vous avez atteint le seuil contraceptif ! (Concentration < 1M/mL)",
            condition: sortedResults.value[0].concentration < 1 && sortedResults.value[0].concentration !== 0,
        },
        {
            text: "Vous avez atteint l'azoospermie complète ! (absence de spermatozoïdes)",
            condition: sortedResults.value[0].concentration === 0,
        },
        {
            text: "Vos dernières analyses remontent à plus de 3 mois, il est recommandé de faire un contrôle régulier.",
            condition: new Date().getTime() - new Date(sortedResults.value[0].date).getTime() > 1000 * 60 * 60 * 24 * 30 * 3,
        },
        {
            text: "Augmentation des cellules rondes pouvant être des spermatozoïdes immatures, contrôle recommandé dans 1 mois.",
            condition: sortedResults.value.length > 1 && sortedResults.value[0].roundCells > sortedResults.value[1].roundCells,
        }
    ];
});

const tips = computed(() => availableTips.value.filter(tip => tip.condition).map(tip => tip.text));
</script>

<template>
  <main class="flex flex-col">
    <template v-if="sortedResults.length > 0">
      <k-card>
        <Line :data="chartData" :options="chartOptions" />
      </k-card>

      <swiper-container ref="swiperRef" :init="false" v-if="tips.length > 1">
        <swiper-slide v-for="tip in tips" :key="tip">
          <k-card class="bg-md-light-surface-variant dark:bg-md-dark-surface-variant">
            <div class="flex items-center gap-2">
              <span class="text-xl">💡</span>
              <p>{{ tip }}</p>
            </div>
          </k-card>
        </swiper-slide>
      </swiper-container>

      <k-card 
        v-if="tips.length === 1"
        class="bg-md-light-surface-variant dark:bg-md-dark-surface-variant"
      >
        <div class="flex items-center gap-2">
          <span class="text-xl">💡</span>
          <p>{{ tips[0] }}</p>
        </div>
      </k-card>

      <k-card 
        v-for="result in sortedResults" 
        :key="result.id"
        @click="showEditAnalysisDialog = true; currentAnalysis = result"
        class="my-2"
      >
        <k-block-title :with-block="false" class="!m-0 !p-0 text-base">
          {{ dateToLocaleString(result.date) }}
        </k-block-title>
        <k-block class="!p-0 !pt-2 mt-2 mb-0 space-y-2">
          <div class="flex items-center gap-2">
            <Icon name="i-tabler-flask" />
            <span class="font-bold">Concentration: {{ result.concentration }}</span>
          </div>

          <div class="flex items-center gap-2">
            <Icon name="i-tabler-cube" />
            <span>Volume (mL): {{ result.volume }}</span>
          </div>

          <div class="flex items-center gap-2">
            <Icon name="i-tabler-droplet" />
            <span>Viscosité: {{ result.viscosity }}</span>
          </div>

          <div class="flex items-center gap-2">
            <Icon name="i-tabler-test-pipe" />
            <span>pH: {{ result.pH }}</span>
          </div>

          <div class="flex items-center gap-2">
            <Icon name="i-tabler-droplet-filled-2" />
            <span>Cellules rondes (M/mL): {{ result.roundCells }}</span>
          </div>

          <div class="flex items-center gap-2">
            <Icon name="i-tabler-circle" />
            <span>Leucocytes (M/mL): {{ result.whiteBloodCells }}</span>
          </div>

          <div v-if="result.device" class="flex items-center gap-2">
            <Icon name="i-mdi-underwear-outline" />
            <span>Moyen contraceptif: {{ result.device }}</span>
          </div>
        </k-block>
      </k-card>
    </template>

    <k-card v-else class="text-center py-8 text-md-light-on-surface-variant dark:text-md-dark-on-surface-variant">
      Aucun résultat pour le moment
    </k-card>

    <div class="mx-4 mt-4">
      <k-button @click="showAddAnalysisDialog = true">
        <Icon name="i-tabler-plus" class="mr-2" />
        Ajouter un résultat
      </k-button>
    </div>

    <dialogs-add-analysis 
      :opened="showAddAnalysisDialog" 
      @close="showAddAnalysisDialog = false" 
    />
    <dialogs-edit-analysis 
      :opened="showEditAnalysisDialog" 
      @close="showEditAnalysisDialog = false"
      :analysis="currentAnalysis" 
    />
  </main>
</template>

<style scoped>
button {
    width: 100%;
}

.card .form {
    display: flex;
    flex-direction: column;

    .form-item {
        display: flex;
        align-items: center;
        gap: .3rem;
    }
}

.swiper {
    width: 100%;

    swiper-slide {
        padding-bottom: 40px;

        p {
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 1rem;
        }
    }
}

.no-results {
    text-align: center;
    padding: 2rem;
    color: var(--color-text-secondary);
}
</style>
