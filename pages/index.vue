<script setup lang="ts">
const userPrefsStore = useUserPrefsStore();
const { wearingSessions, wearingGoal } = storeToRefs(userPrefsStore);

definePageMeta({
  title: 'Accueil',
});

const isWearing = ref(false);
const startTime = ref<Date | null>(null);
const currentTime = ref(new Date());

function getTotalTimeWornToday() {
  const startOfDay = new Date();
  startOfDay.setHours(5, 0, 0, 0);
  let total = 0;

  wearingSessions.value.forEach(session => {
    if (new Date(session.start) >= startOfDay && session.end) {
      const end = new Date(session.end);
      total += (end.getTime() - new Date(session.start).getTime()) / 1000;
    }
  });

  if (isWearing.value && startTime.value) {
    const currentSessionDuration = (currentTime.value.getTime() - startTime.value.getTime()) / 1000;
    total += currentSessionDuration;
  }

  return total;
}

const totalTime = computed(() => {
  const totalSeconds = getTotalTimeWornToday();
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(Math.floor(totalSeconds % 60)).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
});

const estEndTime = computed(() => {
  const totalSeconds = wearingGoal.value * 3600;
  const remaining = totalSeconds - getTotalTimeWornToday();

  if (remaining > 0) {
    const end = new Date(new Date().getTime() + remaining * 1000);
    const hours = String(end.getHours()).padStart(2, '0');
    const minutes = String(end.getMinutes()).padStart(2, '0');
    return `Fin à ${hours}:${minutes}`;
  } else {
    const surplus = Math.abs(remaining);
    const hours = String(Math.floor(surplus / 3600) + 1).padStart(2, '0');
    const minutes = String(Math.floor((surplus % 3600) / 60)).padStart(2, '0');
    return `+${hours}:${minutes}`;
  }
});

const progress = computed(() => {
  const totalSeconds = wearingGoal.value * 3600;
  return Math.min((getTotalTimeWornToday() / totalSeconds) * 100, 100);
});

function startSession() {
  if (isWearing.value) return;
  isWearing.value = true;
  startTime.value = new Date();

  wearingSessions.value.push({
    start: startTime.value,
    end: null,
  });

  clearInterval(timer);
  timer = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
}

function startSessionAt() {
  const time = prompt('Entrez l\'heure de début (HH:MM)');
  if (!time) return;

  const [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    alert('Heure invalide');
    return;
  }

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
  if (start > now) {
    start.setDate(start.getDate() - 1);
  }

  isWearing.value = true;
  startTime.value = start;

  wearingSessions.value.push({
    start: start,
    end: null,
  });

  clearInterval(timer);
  timer = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
}

function stopSession() {
  if (!isWearing.value) return;

  isWearing.value = false;
  clearInterval(timer);
  const endTime = new Date();

  const unfinishedSession = wearingSessions.value.find(session => !session.end);
  if (unfinishedSession) {
    unfinishedSession.end = endTime;
  }

  startTime.value = null;
}

let timer: NodeJS.Timer;

const groupedSessions = computed(() => {
  const grouped: { date: string; sessions: { start: Date, end: Date | null }[] }[] = [];

  wearingSessions.value.forEach(session => {
    const start = new Date(session.start);
    const end = session.end ? new Date(session.end) : null;
    const date = start.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

    let group = grouped.find(g => g.date === date);

    if (!group) {
      group = { date, sessions: [] };
      grouped.push(group);
    }


    group.sessions.push({ start, end });
  });

  grouped.forEach(group => {
    group.total = group.sessions.reduce((acc, session) => {
      if (session.end) {
        const sessionDuration = (session.end.getTime() - session.start.getTime()) / 3600000;
        return acc + (sessionDuration / wearingGoal.value) * 100;
      } else {
        return progress.value
      }
    }, 0);
  });

  return grouped;
});

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
      <button @click="startSessionAt" v-if="!isWearing">
        <Icon name="i-tabler-rotate-clockwise" />
        Démarrer à...
      </button>
      <button @click="stopSession" v-else>
        <Icon name="i-tabler-player-pause" />
        Arrêter
      </button>
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
              <li v-for="session in [...group.sessions].sort((a, b) => b.start.getTime() - a.start.getTime())"
                :key="session.start">
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
                  ((session.end.getTime() - session.start.getTime()) / 3600000).toFixed(1) :
                  ((new Date().getTime() - session.start.getTime()) / 3600000).toFixed(1) }}h)
              </li>
            </ul>

          </div>
          <progress-circle :progress="group.total" :size="50" :strokeWidth="8" />
        </div>
      </div>
    </div>
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

.sessions {
  margin-top: 2rem;
}

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
