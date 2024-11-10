<template>
    <div class="progress-circle">
        <svg :width="size" :height="size">
            <circle
                class="progress-ring__background"
                :stroke-width="strokeWidth"
                :r="normalizedRadius"
                :cx="radius"
                :cy="radius"
            />
            <circle
                class="progress-ring__circle"
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
                class="progress-ring__circle--extra"
                :stroke-width="strokeWidth"
                :stroke-dasharray="circumference + ' ' + circumference"
                :stroke-dashoffset="extraStrokeDashoffset"
                stroke-linecap="round"
                :r="normalizedRadius"
                :cx="radius"
                :cy="radius"
            />
        </svg>
        <div v-if="text" class="progress-text">{{ text }} <span>{{ subtext }}</span></div>
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

<style scoped>
.progress-circle {
    position: relative;
    display: inline-block;
}
svg {
    transform: rotate(-90deg);
}
.progress-ring__background {
    fill: transparent;
    stroke: var(--border-color);
}
.progress-ring__circle {
    fill: transparent;
    stroke: var(--cta-color);
    transition: stroke-dashoffset var(--transition) linear;
}
.progress-ring__circle--extra {
    fill: transparent;
    stroke: var(--cta-hover-color);
    transition: stroke-dashoffset var(--transition) linear;
}
.progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1.75rem;
    font-weight: bolder;
    color: var(--text-color);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;

    span {
        font-size: 1.2rem;
        font-weight: 600;
        text-wrap: nowrap;
    }
}
</style>