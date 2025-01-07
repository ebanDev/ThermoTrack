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
const historicalScores = computed(() => getHistoricalScores());
const historicalProgress = computed(() => getHistoricalProgress());

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
</script>

<template>
  <main class="flex flex-col pt-8 h-full gap-6">
    <div class="relative w-[200px] h-[200px] mx-auto">
      <progress-circle :progress="progress" :text="totalTime" :subtext="estEndTime" :size="200" :strokeWidth="15" />
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
      <k-button v-if="!isWearing" @click="startSessionAt" class="w-full !text-base">
        <Icon name="i-tabler-rotate-clockwise" class="mr-2 text-base" />
        Démarrer à...
      </k-button>
      <k-button v-else @click="stopSessionAt" class="w-full !text-base">
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
        <k-card v-for="group in groupedSessions" :key="group.date" class="mx-0 my-2">
          <div class="flex gap-2 items-start justify-between">
            <div>
              <h3 class="font-bold text-base mb-2">{{ group.date }}</h3>
              <div class="flex flex-col gap-1">
                <div v-for="session in [...group.sessions].sort((a, b) => a.start.getTime() - b.start.getTime())"
                  :key="session.start" class="cursor-pointer"
                  @click="currentSessionGroup = group; showSessionDialog = true">
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

    <dialogs-edit-sessions v-if="showSessionDialog" :sessionGroup="currentSessionGroup"
      @close="showSessionDialog = false" />
    <dialogs-wearing-score v-if="showScoreDialog" :scores="historicalScores" :progress="historicalProgress"
      @close="showScoreDialog = false" />
  </main>
</template>
