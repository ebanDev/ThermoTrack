import { useTime } from './useTime';
import { useSessionGroups } from './useSessionGroups';

export function useSession(wearingSessions, wearingGoal, dayStartAt) {
  const { getSessionDay, setToStartOfDay } = useTime(dayStartAt);
  const { getTotalTimeWornToday } = useSessionGroups(
    wearingSessions,
    wearingGoal,
    dayStartAt,
    getSessionDay,
    setToStartOfDay
  );

  // Reactive variables
  const isWearing = ref(false);
  const startTime = ref<Date | null>(null);
  const currentTime = ref(new Date());

  // Session management functions
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

  // Computed properties
  const totalTime = computed(() => {
    const totalSeconds = getTotalTimeWornToday(isWearing.value, startTime.value, currentTime.value);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(Math.floor(totalSeconds % 60)).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  });

  const estEndTime = computed(() => {
    const totalSeconds = wearingGoal.value * 3600;
    const remaining = totalSeconds - getTotalTimeWornToday(isWearing.value, startTime.value, currentTime.value);

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
    return (getTotalTimeWornToday(isWearing.value, startTime.value, currentTime.value) / totalSeconds) * 100;
  });

  // Lifecycle hooks or timers
  let timer: NodeJS.Timer;

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

  return {
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
  };
}
