import { useTime } from "./useTime";

export const useWearingScore = (
  groupedSessions: Ref<{ date: string; sessions: Session[]; total: number }[]>,
  getSessionDay: (date: Date) => string,
  getStartOfDay: (date: Date) => Date,
) => {
  
  const calculateScoreForDate = (targetDate: Date) => {
    const today = getSessionDay(targetDate);

    const filteredSessions = groupedSessions.value
      .filter(group => group.date !== today);

    if (filteredSessions.length === 0) return 100;

    const startDate = getStartOfDay(new Date(targetDate));
    const startOfFirstSession = new Date(filteredSessions[filteredSessions.length - 1]?.sessions[0]?.start);
    const totalDays = Math.max(1, Math.ceil((startDate.getTime() - startOfFirstSession.getTime()) / (1000 * 60 * 60 * 24)) - 1);
    const fullScore = totalDays * 100;
    const totalScore = filteredSessions.reduce((acc, group) => {
      return acc + Math.min(group.total, 100);
    }, 0);

    return Math.min(((totalScore - 100) / fullScore) * 100, 100);
  };

  const currentWearingScore = computed(() => {
    return calculateScoreForDate(new Date());
  });

  const getHistoricalScores = () => {
    const scores: number[] = [];
    const today = new Date();
    const sessionCount = Math.min(90, groupedSessions.value.length);
    
    for (let i = 0; i < sessionCount; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      scores.unshift(calculateScoreForDate(date));
    }
    
    return scores;
  };

  const getHistoricalProgress = () => {
    const progress: number[] = [];
    const today = new Date();
    const sessionCount = Math.min(90, groupedSessions.value.length);
    
    for (let i = 0; i < sessionCount; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = getSessionDay(date);
      const dayData = groupedSessions.value.find(group => group.date === dateStr);
      console.log(dayData);
      progress.unshift(dayData ? dayData.total : 0);
    }
    
    return progress;
  };

  return {
    currentWearingScore,
    getHistoricalScores,
    getHistoricalProgress
  };
};
