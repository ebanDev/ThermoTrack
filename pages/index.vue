<script setup lang="ts">
import { useSession } from '~/composables/useSession';
import { useTime } from '~/composables/useTime';
import { useSessionGroups } from '~/composables/useSessionGroups';
import { kButton, kCard } from 'konsta/vue';

const userPrefsStore = useUserPrefsStore();
const { wearingSessions, wearingGoal, dayStartAt } = storeToRefs(userPrefsStore);

const { getSessionDay, setToStartOfDay, getStartOfDay } = useTime(dayStartAt);

const { groupedSessions } = useSessionGroups(wearingSessions, wearingGoal, dayStartAt, getSessionDay, setToStartOfDay);

const {
  isWearing,
  startTime,
  currentTime,
  startSession,
  stopSession,
  startSessionAt,
  stopSessionAt,
  totalTime,
  estEndTime,
  progress,
} = useSession(wearingSessions, wearingGoal, dayStartAt);

const { currentWearingScore, getHistoricalScores, getHistoricalProgress } = useWearingScore(groupedSessions, getSessionDay, getStartOfDay);

let timer: NodeJS.Timeout;

const showScoreDialog = ref(false);
const showSessionDialog = ref(false);
const showStartAtDialog = ref(false);
const showStopAtDialog = ref(false);
const currentSessionGroup = ref(null);
const historicalScores = computed(() => getHistoricalScores());
const historicalProgress = computed(() => getHistoricalProgress());

const handleStartAt = (date: Date) => {
  startSessionAt(date);
};

const handleStopAt = (date: Date) => {
  stopSessionAt(date);
};

onMounted(() => {
  const unfinishedSession = wearingSessions.value.find(session => !session.end);
  if (unfinishedSession) {
    isWearing.value = true;
    startTime.value = new Date(unfinishedSession.start);
    clearInterval(timer);
    timer = setInterval(() => {
      currentTime.value = new Date();
    }, 1000);
  }
});

definePageMeta({
  title: 'Accueil',
});

const touchStart = ref(null);

const handleTouchStart = (e) => {
  touchStart.value = e.touches[0].clientX;
};

const handleTouchMove = (e) => {
  if (!touchStart.value) return;
  
  const touchEnd = e.touches[0].clientX;
  const diff = touchStart.value - touchEnd;
  
  if (Math.abs(diff) > 50) {
    userPrefsStore.preferredVisualization = diff > 0 ? 'time' : 'progress';
    touchStart.value = null;
  }
};

const handleTouchEnd = () => {
  touchStart.value = null;
};

const todaySessions = computed(() => {
  const today = getSessionDay(new Date());
  const todayGroup = groupedSessions.value.find(group => group.date === today);
  return todayGroup?.sessions || [];
});
</script>

<template>
  <main class="flex flex-col pt-8 h-full gap-6">
    <div 
      class="relative w-[200px] h-[200px] mx-auto"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <transition name="slide" mode="out-in">
        <progress-circle
          v-if="userPrefsStore.preferredVisualization === 'progress'"
          :key="'progress'"
          :size="200"
          :stroke-width="13"
          :progress="progress"
          :text="totalTime"
          :subtext="estEndTime"
        />
        <time-circle
          v-else
          :key="'time'"
          :size="200"
          :sessions="todaySessions"
          :day-start="userPrefsStore.dayStartAt"
          :wearing-goal="userPrefsStore.wearingGoal"
          :stroke-width="13"
        >
          <span class="text-[1.75rem] font-extrabold text-md-light-on-surface dark:text-md-dark-on-surface">
            {{ totalTime }}
          </span>
          <span class="text-[1.2rem] font-semibold text-md-light-on-surface-variant dark:text-md-dark-on-surface-variant whitespace-nowrap">
            {{ estEndTime }}
          </span>
        </time-circle>
      </transition>
    </div>

    <div class="flex gap-4 justify-center w-full px-4">
      <k-button v-if="!isWearing" @click="startSession" class="w-full text-base">
        <Icon name="i-tabler-play" class="mr-2" />
        Démarrer
      </k-button>
      <k-button v-else @click="stopSession" class="w-full !text-base">
        <Icon name="i-tabler-player-pause" class="mr-2 text-base" />
        Arrêter
      </k-button>
      <k-button v-if="!isWearing" @click="showStartAtDialog = true" class="w-full !text-base">
        <Icon name="i-tabler-rotate-clockwise" class="mr-2 text-base" />
        Démarrer à...
      </k-button>
      <k-button v-else @click="showStopAtDialog = true" class="w-full !text-base">
        <Icon name="i-tabler-rotate" class="mr-2 text-base" />
        Arrêter à...
      </k-button>
    </div>

    <k-card class="mx-4 !my-0" @click="showScoreDialog = true">
      <h3 class="text-lg font-bold mb-2">
        Score de contraception : {{ Math.floor(currentWearingScore * 10) / 10 }}%
      </h3>
      <p v-if="currentWearingScore === 100">
        🎉 Vous avez porté votre contraception tous les jours pendant la durée recommandée sur les trois deniers mois.
      </p>
      <p v-else>
        ⚠️ Vous avez manqué l'équivalent de {{ Math.floor((100 - currentWearingScore) * .9 * 10) / 10 }} jours de port
        de
        contraception sur les trois derniers mois.
      </p>
    </k-card>

    <div class="px-4">
      <h2 class="text-xl font-bold mb-3">Historique</h2>
      <div class="flex flex-col">
        <k-card v-for="group in groupedSessions" :key="group.date" class="mx-0 my-2" @click="currentSessionGroup = group; showSessionDialog = true">
          <div class="flex gap-2 items-start justify-between">
            <div>
              <h3 class="font-bold text-base mb-2">{{ group.date }}</h3>
              <div class="flex flex-col gap-1">
                <div v-for="session in [...group.sessions].sort((a, b) => a.start.getTime() - b.start.getTime())"
                  :key="session.start" class="cursor-pointer">
                  {{ new Date(session.start).toLocaleTimeString('fr-FR', {
                    hour: '2-digit', minute: '2-digit', hour12: false
                  }) }} -
                  {{ session.end ? new Date(session.end).toLocaleTimeString('fr-FR', {
                    hour: '2-digit', minute: '2-digit', hour12: false
                  }) : 'En cours' }}
                  ({{ session.end ? (((session.end.getTime() < session.start.getTime() ? session.end.getTime() +
                    86400000 : session.end.getTime()) - session.start.getTime()) / 3600000).toFixed(1) : ((new
                      Date().getTime() - session.start.getTime()) / 3600000).toFixed(1) }}h) </div>
                    <div class="font-bold">
                      Total: {{ (wearingGoal * (group.total / 100)).toFixed(1) }}h
                    </div>
              </div>
            </div>
            <progress-circle :progress="group.total" :size="50" :strokeWidth="8" />
          </div>
        </k-card>
      </div>
    </div>

    <dialogs-edit-sessions :opened="showSessionDialog" :sessionGroup="currentSessionGroup"
      @close="showSessionDialog = false" />
    <dialogs-wearing-score :opened="showScoreDialog" :scores="historicalScores" :progress="historicalProgress"
      @close="showScoreDialog = false" />
    <dialogs-start-session-at 
      :opened="showStartAtDialog"
      :day-start-at="dayStartAt"
      @close="showStartAtDialog = false"
      @confirm="handleStartAt"
    />
    <dialogs-stop-session-at
      :opened="showStopAtDialog"
      :day-start-at="dayStartAt"
      @close="showStopAtDialog = false"
      @confirm="handleStopAt"
    />
  </main>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}
</style>
