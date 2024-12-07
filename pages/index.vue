<script setup lang="ts">
import { useSession } from '~/composables/useSession';
import { useTime } from '~/composables/useTime';
import { useSessionGroups } from '~/composables/useSessionGroups';

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
  <main class="container">
    <div class="countdown-container">
      <progress-circle :progress="progress" :text="totalTime" :subtext="estEndTime" :size="200" :strokeWidth="15" />
    </div>

    <div class="controls">
      <button @click="startSession" v-if="!isWearing">
        <Icon name="i-tabler-play" />
        Démarrer
      </button>
      <button @click="stopSession" v-else>
        <Icon name="i-tabler-player-pause" />
        Arrêter
      </button>
      <button @click="startSessionAt" v-if="!isWearing">
        <Icon name="i-tabler-rotate-clockwise" />
        Démarrer à...
      </button>
      <button @click="stopSessionAt" v-else>
        <Icon name="i-tabler-rotate" />
        Arrêter à...
      </button>
    </div>

    <div class="card active" @click="showScoreDialog = true">
      <h3>
        Score de contraception : {{ Math.floor(currentWearingScore * 10)/10 }}%
      </h3>
      <p v-if="currentWearingScore === 100">
        🎉 Vous avez porté votre contraception tous les jours pendant la durée recommandée sur les trois deniers mois.
      </p>
      <p v-else>
        ⚠️ Vous avez manqué l'équivalent de {{ Math.floor((100 - currentWearingScore) * .9 * 10) / 10 }} jours de port de
        contraception sur les trois derniers mois.
      </p>
    </div>

    <div class="sessions">
      <h2 class="sessions-title">Historique</h2>
      <div class="sessions-list">
        <div v-for="group in groupedSessions" :key="group.date" class="card sessionCard">
          <div class="left">
            <h3>
              {{ group.date }}
            </h3>
            <ul>
              <li v-for="session in [...group.sessions].sort((a, b) => a.start.getTime() - b.start.getTime())"
                :key="session.start" @click="currentSessionGroup = group; showSessionDialog = true">
                {{ new Date(session.start).toLocaleTimeString('fr-FR', {
                  hour: '2-digit', minute: '2-digit', hour12:
                    false
                })
                }} -
                {{ session.end ? new Date(session.end).toLocaleTimeString('fr-FR', {
                  hour: '2-digit', minute: '2-digit',
                  hour12: false
                }) : 'En cours' }}
                ({{ session.end ?
                  (((session.end.getTime() < session.start.getTime() ? session.end.getTime() + 86400000 :
                    session.end.getTime()) - session.start.getTime()) / 3600000).toFixed(1) : ((new Date().getTime() -
                      session.start.getTime()) / 3600000).toFixed(1) }}h) </li>
              <li>
                <b>
                  Total: {{ (wearingGoal * (group.total / 100)).toFixed(1) }}h
                </b>
              </li>
            </ul>
          </div>
          <progress-circle :progress="group.total" :size="50" :strokeWidth="8" />
        </div>
      </div>
    </div>
    <dialogs-edit-sessions v-if="showSessionDialog" :sessionGroup="currentSessionGroup"
      @close="showSessionDialog = false" />
    <dialogs-wearing-score 
      v-if="showScoreDialog" 
      :scores="historicalScores"
      :progress="historicalProgress"
      @close="showScoreDialog = false" 
    />
  </main>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  padding-top: 2rem;
  height: 100%;
  gap: 1.5rem;
}

.countdown-container {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
}

.countdown-time {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
}

.controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  width: 100%;

  button {
    width: 100%;
  }
}

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: .75rem;
  margin-top: .75rem;
}

.sessionCard {
  display: flex;
  gap: 1rem;
  flex-direction: row;

  .left {
    display: flex;
    flex-direction: column;
    gap: .5rem;
    width: 100%;

    ul {
      padding: 0;
      list-style: none;
      margin: 0;
    }
  }
}
</style>
