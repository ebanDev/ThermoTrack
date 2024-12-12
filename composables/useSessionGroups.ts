import { useTime } from '~/composables/useTime';

export function useSessionGroups(wearingSessions, wearingGoal, dayStartAt, getSessionDay, setToStartOfDay) {
  const { getStartOfDay } = useTime(dayStartAt);

  const groupedSessions = computed(() => {
    const grouped = [];
    const addSession = (date, start, end) => {
      let group = grouped.find(g => g.date === date);
      if (!group) {
        group = { date, sessions: [] };
        grouped.push(group);
      }
      group.sessions.push({ start, end });
    };

    wearingSessions.value.forEach(session => {
      const start = new Date(session.start);
      const end = session.end ? new Date(session.end) : null;
      if (end) {
        let currentStart = new Date(start), currentEnd = new Date(end);
        if (currentEnd < currentStart) currentEnd = new Date(currentEnd.getTime() + 86400000);
        while (currentStart < currentEnd) {
          const dayStart = getStartOfDay(currentStart);
          const nextDay = new Date(dayStart.getTime() + 86400000);
          const s = new Date(Math.max(currentStart.getTime(), dayStart.getTime()));
          const e = new Date(Math.min(currentEnd.getTime(), nextDay.getTime()));
          addSession(getSessionDay(s), s, e);
          currentStart = nextDay;
        }
      } else {
        addSession(getSessionDay(start), start, null);
      }
    });

    grouped.forEach(group => {
      const baseDay = getStartOfDay(new Date(group.sessions[0].start));
      const endOfDay = new Date(baseDay.getTime());
      endOfDay.setHours(29, 0, 0, 0);
      group.total = group.sessions.reduce((acc, session) => {
        const sessionStart = new Date(session.start);
        const sessionEnd = session.end ? new Date(session.end) : new Date();
        if (sessionEnd < sessionStart) sessionEnd.setTime(sessionEnd.getTime() + 86400000);
        const effectiveStart = new Date(Math.max(sessionStart.getTime(), baseDay.getTime()));
        const effectiveEnd = new Date(Math.min(sessionEnd.getTime(), endOfDay.getTime()));
        const dur = (effectiveEnd - effectiveStart) / 3600000;
        return acc + (dur / wearingGoal.value) * 100;
      }, 0);
    });

    return grouped.sort((a, b) => {
      const [A, B] = [new Date(a.sessions[0].start), new Date(b.sessions[0].start)];
      return B.getTime() - A.getTime();
    });
  });

  function getTotalTimeWornToday(isWearing, startTime, currentTime) {
    let total = 0;
    groupedSessions.value.forEach(group => {
      if (group.date === getSessionDay(new Date())) {
        group.sessions.forEach(s => {
          const start = new Date(s.start);
          const end = s.end ? new Date(s.end) : (isWearing && startTime ? currentTime : null);
          if (end) total += (end - start) / 1000;
        });
      }
    });
    return total;
  }

  return { groupedSessions, getTotalTimeWornToday };
}
