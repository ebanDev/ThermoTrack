<script setup lang="ts">
const userPrefsStore = useUserPrefsStore();
const { wearingSessions, wearingGoal, dayStartAt } = storeToRefs(userPrefsStore);

definePageMeta({
  title: 'Accueil',
});

const isWearing = ref(false);
const startTime = ref<Date | null>(null);
const currentTime = ref(new Date());
const currentSessionGroup = ref({ date: '', sessions: [] });
const showSessionDialog = ref(false);

const setToStartOfDay = (date: Date) => {
  const [hours, minutes] = dayStartAt.value.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
};

function getStartOfDay(date: Date = new Date()) {
  const startOfDay = new Date(date);
  setToStartOfDay(startOfDay);
  
  if (date.getHours() < 5) {
    startOfDay.setDate(startOfDay.getDate() - 1);
  }

  return startOfDay;
}

function getSessionDay(date: Date) {
  const sessionDate = new Date(date);
  if (sessionDate.getHours() < 5) {
    sessionDate.setDate(sessionDate.getDate() - 1);
  }
  return sessionDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function getTotalTimeWornToday() {
  let total = 0;

  groupedSessions.value.forEach(group => {
    if (group.date === getSessionDay(new Date())) {
      group.sessions.forEach(session => {
        const sessionStart = new Date(session.start);
        if (session.end) {
          const end = new Date(session.end);
          total += (end.getTime() - sessionStart.getTime()) / 1000;
        } else if (isWearing.value && startTime.value) {
          const currentSessionDuration = (currentTime.value.getTime() - startTime.value.getTime()) / 1000;
          total += currentSessionDuration;
        }
      });
    }
  });

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
    const hours = String(Math.floor(surplus / 3600)).padStart(2, '0');
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
  
  // If the time is between midnight and 5 AM, or if the entered time is in the future,
  // we need to adjust the date
  if ((hours < 5) || (start > now)) {
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

function stopSessionAt() {
  const time = prompt('Entrez l\'heure de fin (HH:MM)');
  if (!time) return;

  const [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    alert('Heure invalide');
    return;
  }

  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
  
  // If the time is between midnight and 5 AM, or if the entered time is in the future,
  // we need to adjust the date
  if ((hours < 5) || (end > now)) {
    end.setDate(end.getDate() - 1);
  }

  isWearing.value = false;
  clearInterval(timer);

  const unfinishedSession = wearingSessions.value.find(session => !session.end);
  if (unfinishedSession) {
    unfinishedSession.end = end;
  }

  startTime.value = null;
}

let timer: NodeJS.Timer;

const groupedSessions = computed(() => {
  const grouped: { 
    date: string; 
    sessions: { start: Date; end: Date | null }[];
    total?: number;
  }[] = [];

  wearingSessions.value.forEach(session => {
    const start = new Date(session.start);
    const end = session.end ? new Date(session.end) : null;
    
    if (end) {
      // Check if session crosses 5 AM boundary
      const nextDay5AM = new Date(start);
      nextDay5AM.setDate(nextDay5AM.getDate() + 1);
      setToStartOfDay(nextDay5AM);
      nextDay5AM.setSeconds(nextDay5AM.getSeconds() + 1);

      if (start.getTime() < nextDay5AM.getTime() && end.getTime() > nextDay5AM.getTime()) {
        // Split the session
        const firstPart = { 
          start: start, 
          end: nextDay5AM 
        };
        const secondPart = { 
          start: nextDay5AM, 
          end: end 
        };

        // Add first part to first day
        const firstDate = getSessionDay(start);
        let firstGroup = grouped.find(g => g.date === firstDate);
        if (!firstGroup) {
          firstGroup = { date: firstDate, sessions: [] };
          grouped.push(firstGroup);
        }
        firstGroup.sessions.push(firstPart);

        // Add second part to next day
        const secondDate = getSessionDay(nextDay5AM);
        let secondGroup = grouped.find(g => g.date === secondDate);
        if (!secondGroup) {
          secondGroup = { date: secondDate, sessions: [] };
          grouped.push(secondGroup);
        }
        secondGroup.sessions.push(secondPart);
      } else {
        // Regular session (no split needed)
        const date = getSessionDay(start);
        let group = grouped.find(g => g.date === date);
        if (!group) {
          group = { date, sessions: [] };
          grouped.push(group);
        }
        group.sessions.push({ start, end });
      }
    } else {
      // Ongoing session
      const date = getSessionDay(start);
      let group = grouped.find(g => g.date === date);
      if (!group) {
        group = { date, sessions: [] };
        grouped.push(group);
      }
      
      group.sessions.push({ start, end });
    }
  });

  // Calculate totals for each group
  grouped.forEach(group => {
    const startOfDay = getStartOfDay(new Date(group.sessions[0].start));
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(29, 0, 0, 0); // 5 AM next day

    group.total = group.sessions.reduce((acc, session) => {
      if (session.end) {
        const sessionStart = new Date(session.start);
        let sessionEnd = new Date(session.end);
        
        if (sessionEnd < sessionStart) {
          sessionEnd = new Date(sessionEnd.getTime() + 24 * 60 * 60 * 1000);
        }
        
        const effectiveStart = new Date(Math.max(sessionStart.getTime(), startOfDay.getTime()));
        const effectiveEnd = new Date(Math.min(sessionEnd.getTime(), endOfDay.getTime()));
        
        const sessionDuration = (effectiveEnd.getTime() - effectiveStart.getTime()) / 3600000;
        return acc + (sessionDuration / wearingGoal.value) * 100;
      } else {
        const now = new Date();
        const sessionStart = new Date(session.start);
        const effectiveStart = new Date(Math.max(sessionStart.getTime(), startOfDay.getTime()));
        const effectiveEnd = new Date(Math.min(now.getTime(), endOfDay.getTime()));
        
        const sessionDuration = (effectiveEnd.getTime() - effectiveStart.getTime()) / 3600000;
        return acc + (sessionDuration / wearingGoal.value) * 100;
      }
    }, 0);
  });

  return grouped.sort((a, b) => {
    const dateA = new Date(a.sessions[0].start);
    const dateB = new Date(b.sessions[0].start);
    return dateB.getTime() - dateA.getTime();
  });
});

const wearingScore = computed(() => {
  const today = getSessionDay(new Date());
  const filteredSessions = groupedSessions.value.filter(group => group.date !== today);
  
  if (filteredSessions.length === 0) return 100;

  const startOfFirstSession = new Date(filteredSessions[filteredSessions.length - 1]?.sessions[0]?.start);
  const totalDays = Math.ceil((new Date().getTime() - startOfFirstSession.getTime()) / (1000 * 60 * 60 * 24));
  const fullScore = totalDays * 100;
  const totalScore = filteredSessions.reduce((acc, group) => {
    return acc + Math.min(group.total, 100);
  }, 0);

  return (totalScore / fullScore) * 100;
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

    <div class="card active">
      <h3>
        Score de contraception : {{ wearingScore.toFixed(1) }}%
      </h3>
      <p v-if="wearingScore === 100">
        🎉 Vous avez porté votre contraception tous les jours pendant la durée recommandée sur les trois deniers mois.
      </p>
      <p v-else>
        ⚠️ Vous avez manqué l'équivalent de {{ Math.round((100 - wearingScore) * .9) }} jours de port de contraception sur les trois derniers mois.
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
