<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { kSheet, kToolbar, kLink, kBlock } from 'konsta/vue';

// Register plugin globally
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  {
    id: 'drawRedZones',
    beforeDraw: (chart) => {
      const { ctx } = chart;
      const { top, bottom } = chart.chartArea;
      const meta = chart.getDatasetMeta(1); // Get metadata for progress dataset
      
      // Guard clause: check if we have valid data
      if (!meta?.data || meta.data.length === 0) return;
      
      ctx.save();
      
      props.progress.forEach((value, index) => {
        // Check if the data point exists before accessing its properties
        const point = meta.data[index];
        if (!point?.x) return;
        
        if (value < 100) {
          const x = point.x;
          // Calculate width using a safe default if next point doesn't exist
          const nextPoint = meta.data[1];
          const pointSpacing = nextPoint ? (nextPoint.x - meta.data[0].x) : 20;
          const startX = x - (pointSpacing / 2);
          
          ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
          ctx.fillRect(startX, top, pointSpacing, bottom - top);
        }
      });
      
      ctx.restore();
    }
  }
);

const props = defineProps<{
  opened: boolean,
  scores: number[],
  progress: number[]
}>();

const emit = defineEmits(['close']);

// Remove the separate drawRedZones object since it's now registered globally

const chartData = computed(() => ({
  labels: Array.from({ length: props.scores.length - 1 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (props.scores.length - 1 - i));
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }),
  datasets: [{
    label: 'Score de contraception',
    data: props.scores.slice(0, -1),
    fill: false,
    borderColor: 'rgba(11, 58, 107, 1)',
    tension: 0.1,
    pointRadius: 0 // Hide individual points
  }, {
    label: 'Pourcentage journalier',
    data: props.progress.slice(0, -1),
    fill: false,
    borderColor: 'rgba(0, 86, 179, 1)',
    tension: 0.1
  }]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      min: 0,
      max: 180
    }
  }
};
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
      <h2 class="text-xl font-bold mb-4">Score de contraception</h2>
      <div class="h-[300px] w-full mb-4">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </k-block>
  </k-sheet>
</template>

<style scoped>

.chart-container {
  height: 300px;
  width: 100%;
  margin: 1rem 0;
}
</style>
