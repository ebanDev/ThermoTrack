export const useWearingScore = (
  groupedSessions: Ref<{ date: string; sessions: Session[]; total: number }[]>,
  getSessionDay: (date: Date) => string,
  getStartOfDay: (date: Date) => Date
) => {
  const calculateScoreForDate = (d: Date) => {
    const today = getSessionDay(d);
    const filtered = groupedSessions.value.filter(g => g.date !== today);
    if (!filtered.length) return 100;

    const startDate = getStartOfDay(d);
    const firstSessionStart = new Date(filtered[filtered.length - 1].sessions[0].start);
    const totalDays = Math.max(1, Math.ceil((startDate.getTime() - firstSessionStart.getTime()) / 86400000) - 1);
    const totalScore = filtered.reduce((acc, g) => acc + Math.min(g.total, 100), 0);
    return Math.min(((totalScore - 100) / (totalDays * 100)) * 100, 100);
  };

  const currentWearingScore = computed(() => calculateScoreForDate(new Date()));

  const getHistoricalScores = () => {
    const scores = [], c = Math.min(90, groupedSessions.value.length), t = new Date();
    for (let i = 0; i < c; i++) {
      const d = new Date(t);
      d.setDate(t.getDate() - i);
      scores.unshift(calculateScoreForDate(d));
    }
    return scores;
  };

  const getHistoricalProgress = () => {
    const progress = [], c = Math.min(90, groupedSessions.value.length), t = new Date();
    for (let i = 0; i < c; i++) {
      const d = new Date(t);
      d.setDate(t.getDate() - i);
      const g = groupedSessions.value.find(x => x.date === getSessionDay(d));
      progress.unshift(g ? g.total : 0);
    }
    return progress;
  };

  return { currentWearingScore, getHistoricalScores, getHistoricalProgress };
};
