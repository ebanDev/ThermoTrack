<template>
  <div class="relative inline-block">
    <svg :width="size" :height="size" class="rotate-[-90deg]">
      <circle
        class="fill-transparent stroke-md-light-outline-variant dark:stroke-md-dark-outline"
        :stroke-width="strokeWidth"
        :r="normalizedRadius"
        :cx="radius"
        :cy="radius"
        stroke-color="#000"
      />
      <circle
        class="fill-transparent stroke-md-light-primary dark:stroke-md-dark-primary transition-all duration-300"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference + ' ' + circumference"
        :stroke-dashoffset="strokeDashoffset"
        stroke-linecap="round"
        :r="normalizedRadius"
        :cx="radius"
        :cy="radius"
      />
      <circle
        v-if="progress > 100"
        class="fill-transparent stroke-md-light-on-primary-container transition-all duration-300"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference + ' ' + circumference"
        :stroke-dashoffset="extraStrokeDashoffset"
        stroke-linecap="round"
        :r="normalizedRadius"
        :cx="radius"
        :cy="radius"
      />
    </svg>
    <div 
      v-if="text" 
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center flex flex-col items-center"
    >
      <span class="text-[1.75rem] font-extrabold text-md-light-on-surface dark:text-md-dark-on-surface">
        {{ text }}
      </span>
      <span 
        v-if="subtext"
        class="text-[1.2rem] font-semibold text-md-light-on-surface-variant dark:text-md-dark-on-surface-variant whitespace-nowrap"
      >
        {{ subtext }}
      </span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
    progress: {
        type: Number,
        required: true,
        default: 0,
    },
    text: {
        type: String,
        required: false,
        default: '',
    },
    subtext: {
        type: String,
        required: false,
        default: '',
    },
    size: {
        type: Number,
        default: 100,
    },
    strokeWidth: {
        type: Number,
        default: 10,
    },
});

const radius = computed(() => props.size / 2);
const normalizedRadius = computed(() => radius.value - props.strokeWidth / 2);
const circumference = computed(() => 2 * Math.PI * normalizedRadius.value);
const strokeDashoffset = computed(() => circumference.value - (Math.min(props.progress, 100) / 100) * circumference.value);
const extraStrokeDashoffset = computed(() => circumference.value - ((props.progress - 100) / 100) * circumference.value);
</script>
