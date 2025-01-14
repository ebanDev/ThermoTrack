import { useTime } from './useTime';
import { useSessionGroups } from './useSessionGroups';

export function useSession(wearingSessions, wearingGoal, dayStartAt) {
  const { getSessionDay, setToStartOfDay, getStartOfDay } = useTime(dayStartAt);
  const { getTotalTimeWornToday } = useSessionGroups(
    wearingSessions,
    wearingGoal,
    dayStartAt,
    getSessionDay,
    setToStartOfDay
  );

  const isWearing = ref(false);
  const startTime = ref<Date|null>(null);
  const currentTime = ref(new Date());
  let timer: NodeJS.Timer;

  const updateCurrentTime = () => {
    clearInterval(timer);
    timer = setInterval(() => currentTime.value = new Date(), 1000);
  };

  const finishSession = (endTime: Date) => {
    isWearing.value = false;
    clearInterval(timer);
    const session = wearingSessions.value.find(s => !s.end);
    if (session) session.end = endTime;
    startTime.value = null;
  };

  const promptTime = (msg: string) => {
    const time = prompt(msg);
    if (!time) return null;
    const [h, m] = time.split(':').map(Number);
    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
      alert('Heure invalide');
      return null;
    }
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    const startOfDay = getStartOfDay(now);
    if (d < startOfDay) d.setDate(d.getDate() + 1);
    return d;
  };

  function startSession() {
    if (isWearing.value) return;
    isWearing.value = true;
    startTime.value = new Date();
    wearingSessions.value.push({ start: startTime.value, end: null });
    updateCurrentTime();
  }

  function stopSession() {
    if (!isWearing.value) return;
    finishSession(new Date());
  }

  function startSessionAt() {
    const d = promptTime("Entrez l'heure de début (HH:MM)");
    if (!d) return;
    isWearing.value = true;
    startTime.value = d;
    wearingSessions.value.push({ start: d, end: null });
    updateCurrentTime();
  }

  function stopSessionAt() {
    const d = promptTime("Entrez l'heure de fin (HH:MM)");
    if (!d) return;
    finishSession(d);
  }

  const totalTime = computed(() => {
    const total = getTotalTimeWornToday(isWearing.value, startTime.value, currentTime.value);
    const h = Math.floor(total / 3600),
          m = String(Math.floor((total % 3600) / 60)).padStart(2,'0'),
          s = String(Math.floor(total % 60)).padStart(2,'0');
    return `${h}:${m}:${s}`;
  });

  const estEndTime = computed(() => {
    const totalNeeded = wearingGoal.value * 3600;
    const remaining = totalNeeded - getTotalTimeWornToday(isWearing.value, startTime.value, currentTime.value);
    if (remaining > 0) {
      const end = new Date(Date.now() + remaining * 1000);
      return `Fin à ${String(end.getHours()).padStart(2,'0')}:${String(end.getMinutes()).padStart(2,'0')}`;
    } else {
      const surplus = Math.abs(remaining);
      const h = String(Math.floor(surplus / 3600)).padStart(2,'0'),
            m = String(Math.floor((surplus % 3600) / 60)).padStart(2,'0');
      return `+${h}:${m}`;
    }
  });

  const progress = computed(() => {
    const totalNeeded = wearingGoal.value * 3600;
    return (getTotalTimeWornToday(isWearing.value, startTime.value, currentTime.value) / totalNeeded) * 100;
  });

  onMounted(() => {
    const session = wearingSessions.value.find(s => !s.end);
    if (session) {
      isWearing.value = true;
      startTime.value = new Date(session.start);
      updateCurrentTime();
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
