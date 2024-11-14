<script setup lang="ts">
const route = useRoute()
const showSettings = ref(false);

const { wearingSessions, dayStartAt, wearingGoal } = storeToRefs(useUserPrefsStore());

const setToStartOfDay = (date: Date) => {
  const [hours, minutes] = dayStartAt.value.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
};

function getSessionDay(date: Date) {
  const sessionDate = new Date(date);
  if (sessionDate.getHours() < 5) {
    sessionDate.setDate(sessionDate.getDate() - 1);
  }
  return sessionDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function getStartOfDay(date: Date = new Date()) {
  const startOfDay = new Date(date);
  setToStartOfDay(startOfDay);
  
  if (date.getHours() < 5) {
    startOfDay.setDate(startOfDay.getDate() - 1);
  }

  return startOfDay;
}

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

const streak = computed(() => {
  // Calculate streak based on how many session group has total > than wearingGoal

  let count = 0;
  let currentStreak = 0;

  for (let i = 0; i < groupedSessions.value.length; i++) {
    if (groupedSessions.value[i].total >= 100) {
      currentStreak++;
    } else {
      if (currentStreak > count) {
        count = currentStreak;
      }
      currentStreak = 0;
    }
  }

  return { count: currentStreak };
});
</script>

<template>
  <header>
    <h1>
      <Icon name="i-tabler-left-fill" v-if="route.meta.showBackButton" @click="$router.back()"/>
      {{ route.meta.title }}</h1>
    <div class="left">
      <span class="streak">
      <Icon name="i-tabler-flame" />
      {{ streak.count }}
    </span>
      <button @click="showSettings = true">
        <Icon name="i-tabler-settings"/>
      </button>
    </div>
  </header>
  <dialogs-settings v-if="showSettings" @close="showSettings = false"/>
</template>

<style scoped>
.streak {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 1.3rem;
  font-weight: bold;
  background: var(--tabbar-active-color);
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--tabbar-color);
  z-index: 999;
  position: sticky;
  top: 0;
  width: 100%;
  gap: 1rem;

  h1 {
    font-size: 1.5rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .left {
    display: flex;
    align-items: center;
    gap: 1rem;

    button {
      padding: 0.5rem;
      border-radius: 2rem;
    }
  }
}
</style>
