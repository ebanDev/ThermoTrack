<template>
  <div class="relative inline-block">
    <!-- Hour numbers -->
    <div v-for="i in 12" 
         :key="i"
         class="absolute text-xs text-md-light-outline-variant dark:text-md-dark-outline"
         :style="getHourPosition(i)">
      {{ getDisplayHour(i) }}
    </div>
    
    <svg :width="size" :height="size">
      <!-- Background circle -->
      <circle
        class="fill-transparent stroke-md-light-outline-variant dark:stroke-md-dark-outline"
        :stroke-width="strokeWidth"
        :r="normalizedRadius"
        :cx="radius"
        :cy="radius"
      />
      <!-- Preview of remaining time needed -->
      <path
        v-if="remainingTime > 0"
        :d="previewPath"
        class="fill-transparent stroke-md-light-primary/30 dark:stroke-md-dark-primary/30 transition-all duration-300"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
      />
      <!-- Worn time segments -->
      <path
        v-for="(segment, i) in timeSegments"
        :key="i"
        :d="segment.path"
        class="transition-all duration-300"
        :class="segment.overtime ? 
          'fill-transparent stroke-md-light-on-primary-container dark:stroke-md-dark-primary-container' : 
          'fill-transparent stroke-md-light-primary dark:stroke-md-dark-primary'"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
      />
      <!-- Current time indicator -->
      <circle
        :cx="currentTimePosition.x"
        :cy="currentTimePosition.y"
        r="2"
        class="fill-md-light-on-surface dark:fill-md-dark-on-surface"
      />
    </svg>
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center flex flex-col items-center">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTime } from '~/composables/useTime';
import { useSessionGroups } from '~/composables/useSessionGroups';

interface Session {
  start: Date;
  end: Date | null;
}

const props = defineProps({
  sessions: {
    type: Array as PropType<Session[]>,
    required: true
  },
  size: {
    type: Number,
    default: 100
  },
  strokeWidth: {
    type: Number,
    default: 10
  },
  dayStart: {
    type: String,
    required: true
  },
  wearingGoal: {
    type: Number,
    required: true
  }
});

const dayStartRef = ref(props.dayStart);
const { getSessionDay, setToStartOfDay } = useTime(dayStartRef);
const sessionsRef = ref(props.sessions);
const wearingGoalRef = ref(props.wearingGoal);

const { groupedSessions } = useSessionGroups(
  sessionsRef,
  wearingGoalRef,
  dayStartRef,
  getSessionDay,
  setToStartOfDay
);

const radius = computed(() => props.size / 2);
const normalizedRadius = computed(() => radius.value - props.strokeWidth / 2);
const circumference = computed(() => 2 * Math.PI * normalizedRadius.value);

const timeSegments = computed(() => {
  const segments = [];
  const todayGroup = groupedSessions.value.find(group => group.date === getSessionDay(new Date()));
  
  if (!todayGroup) return [];

  let totalWornTime = 0;

  todayGroup.sessions.forEach((session) => {
    const start = new Date(session.start);
    const end = session.end ? new Date(session.end) : new Date();
    const sessionDuration = end.getTime() - start.getTime();
    
    const [startHour, startMin] = props.dayStart.split(':').map(Number);
    
    // Calculate start seconds since day start
    const startSeconds = (start.getHours() * 3600 + start.getMinutes() * 60 + start.getSeconds()) - 
                        (startHour * 3600 + startMin * 60);
    const endSeconds = (end.getHours() * 3600 + end.getMinutes() * 60 + end.getSeconds()) - 
                      (startHour * 3600 + startMin * 60);
    
    // Convert to angles
    const startAngle = (((startSeconds + 24 * 3600) % (24 * 3600)) / (24 * 3600)) * 360;
    const endAngle = (((endSeconds + 24 * 3600) % (24 * 3600)) / (24 * 3600)) * 360;

    // Check if this session crosses the overtime threshold
    const timeToOvertime = props.wearingGoal * 3600000 - totalWornTime;
    
    if (timeToOvertime > 0 && timeToOvertime < sessionDuration) {
      // Split the session at the overtime point
      const overtimePoint = new Date(start.getTime() + timeToOvertime);
      const overtimeSeconds = (overtimePoint.getHours() * 3600 + overtimePoint.getMinutes() * 60 + overtimePoint.getSeconds()) - 
                            (startHour * 3600 + startMin * 60);
      const overtimeAngle = (((overtimeSeconds + 24 * 3600) % (24 * 3600)) / (24 * 3600)) * 360;

      // Add regular segment
      segments.push({
        path: describeArc(radius.value, radius.value, normalizedRadius.value, startAngle, overtimeAngle),
        overtime: false
      });

      // Add overtime segment
      segments.push({
        path: describeArc(radius.value, radius.value, normalizedRadius.value, overtimeAngle, endAngle),
        overtime: true
      });
    } else {
      // Add single segment
      segments.push({
        path: describeArc(radius.value, radius.value, normalizedRadius.value, startAngle, endAngle),
        overtime: totalWornTime >= props.wearingGoal * 3600000
      });
    }

    totalWornTime += sessionDuration;
  });

  return segments;
});

const remainingTime = computed(() => {
  const todayGroup = groupedSessions.value.find(group => group.date === getSessionDay(new Date()));
  if (!todayGroup) return props.wearingGoal * 3600000;
  
  const totalWornTime = todayGroup.sessions.reduce((acc, session) => {
    const start = new Date(session.start);
    const end = session.end ? new Date(session.end) : new Date();
    return acc + (end.getTime() - start.getTime());
  }, 0);
  
  return Math.max(0, (props.wearingGoal * 3600000) - totalWornTime);
});

const currentTime = ref(new Date());
let timer: NodeJS.Timer;

onMounted(() => {
  updateTimer();
});

onUnmounted(() => {
  clearInterval(timer);
});

function updateTimer() {
  currentTime.value = new Date();
  timer = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
}

const previewStrokeDashoffset = computed(() => {
  const now = currentTime.value;
  const [startHour, startMin] = props.dayStart.split(':').map(Number);
  
  // Calculate current angle in seconds (from day start)
  const currentSeconds = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) - 
                        (startHour * 3600 + startMin * 60);
  
  // Normalize to positive values and convert to fraction of day
  const currentAngle = ((currentSeconds + 24 * 3600) % (24 * 3600)) / (24 * 3600);
  
  // Calculate how much of the circle we need to fill (in seconds)
  const remainingTimeInSeconds = remainingTime.value / 1000;
  const previewLength = remainingTimeInSeconds / (24 * 3600);
  
  // Start the preview from current time
  const progress = previewLength;
  return circumference.value * (1 - progress);
});

const previewPath = computed(() => {
  if (remainingTime.value <= 0) return '';
  
  const now = currentTime.value;
  const [startHour, startMin] = props.dayStart.split(':').map(Number);
  
  // Calculate start angle (current time)
  const currentSeconds = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) - 
                        (startHour * 3600 + startMin * 60);
  const startAngle = (((currentSeconds + 24 * 3600) % (24 * 3600)) / (24 * 3600)) * 360;
  
  // Calculate end angle (current time + remaining time needed)
  const remainingSeconds = remainingTime.value / 1000;
  const endAngle = ((((currentSeconds + remainingSeconds) + 24 * 3600) % (24 * 3600)) / (24 * 3600)) * 360;
  
  return describeArc(radius.value, radius.value, normalizedRadius.value, startAngle, endAngle);
});

const currentTimePosition = computed(() => {
  const now = currentTime.value;
  const [startHour, startMin] = props.dayStart.split(':').map(Number);
  
  // Calculate current angle in seconds (from day start)
  const currentSeconds = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) - 
                        (startHour * 3600 + startMin * 60);
  
  // Convert to angle (0-360)
  const currentAngle = (((currentSeconds + 24 * 3600) % (24 * 3600)) / (24 * 3600)) * 360;
  
  // Get position on the circle
  return polarToCartesian(radius.value, radius.value, normalizedRadius.value, currentAngle);
});

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  // Add -90 degree offset to start from top (12 o'clock position)
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  
  const deltaAngle = (endAngle - startAngle + 360) % 360;
  const largeArcFlag = deltaAngle <= 180 ? "0" : "1";

  const path = [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
  return path;
}

function getHourPosition(index: number) {
  const [startHour, startMin] = props.dayStart.split(':').map(Number);
  // Convert index to angle (0 = dayStart, clockwise)
  // Multiply index by 2 to get every 2 hours
  const hour = (index * 2);
  const angle = (((hour / 24) * 360) - 90) * (Math.PI / 180);
  
  // Increased offset from 12 to 20 for more padding
  const offset = 20;
  const x = radius.value + (normalizedRadius.value + offset) * Math.cos(angle);
  const y = radius.value + (normalizedRadius.value + offset) * Math.sin(angle);

  return {
    transform: `translate(-50%, -50%)`,
    left: `${x}px`,
    top: `${y}px`
  };
}

function getDisplayHour(index: number) {
  const [startHour] = props.dayStart.split(':').map(Number);
  // Calculate hour based on index and start hour
  const hour = (startHour + (index * 2)) % 24;
  return hour;
}

// Watch for props changes
watch(() => props.sessions, (newSessions) => {
  sessionsRef.value = newSessions;
});

watch(() => props.dayStart, (newDayStart) => {
  dayStartRef.value = newDayStart;
});

watch(() => props.wearingGoal, (newGoal) => {
  wearingGoalRef.value = newGoal;
});
</script>
