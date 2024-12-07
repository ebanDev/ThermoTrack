<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

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
      
      ctx.save();
      
      props.progress.forEach((value, index) => {
        if (value < 100) {
          const x = meta.data[index].x;
          // Calculate the width between points
          const pointSpacing = meta.data[1]?.x - meta.data[0]?.x ?? 20;
          // Center the rectangle by moving half width to the left
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
  scores: number[]
  progress: number[]
}>();

const emit = defineEmits(['close']);

// Remove the separate drawRedZones object since it's now registered globally

const chartData = computed(() => ({
  labels: Array.from({ length: props.scores.length }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (props.scores.length - 1 - i));
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }),
  datasets: [{
    label: 'Score de contraception',
    data: props.scores,
    fill: false,
    borderColor: 'rgba(11, 58, 107, 1)',
    tension: 0.1,
    pointRadius: 0 // Hide individual points
  }, {
    label: 'Pourcentage journalier',
    data: props.progress,
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
  <div class="shadowClose" @click="emit('close')"></div>
  <dialog open>
    <h2>Score de contraception</h2>
    <div class="chart-container">
      <Line :data="chartData" :options="chartOptions" />
    </div>
    <button @click="emit('close')">
      <Icon name="i-tabler-x" />
      Fermer
    </button>
  </dialog>
</template>

<style scoped>

.chart-container {
  height: 300px;
  width: 100%;
  margin: 1rem 0;
}
</style>
