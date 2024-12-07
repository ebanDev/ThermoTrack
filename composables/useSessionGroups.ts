
import { useTime } from '~/composables/useTime';

export function useSessionGroups(wearingSessions, wearingGoal, dayStartAt, getSessionDay, setToStartOfDay) {
  const { getStartOfDay } = useTime(dayStartAt);

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
        if (start.getHours() >= 5) {
          nextDay5AM.setDate(nextDay5AM.getDate() + 1);
        }
        setToStartOfDay(nextDay5AM);
        nextDay5AM.setSeconds(nextDay5AM.getSeconds() + 1);

        if (start.getTime() < nextDay5AM.getTime() && end.getTime() > nextDay5AM.getTime()) {
          // Split the session
          const firstPart = {
            start: start,
            end: nextDay5AM,
          };
          const secondPart = {
            start: nextDay5AM,
            end: end,
          };

          // Add first part to the first day's group
          const firstDate = getSessionDay(start);
          let firstGroup = grouped.find(g => g.date === firstDate);
          if (!firstGroup) {
            firstGroup = { date: firstDate, sessions: [] };
            grouped.push(firstGroup);
          }
          firstGroup.sessions.push(firstPart);

          // Add second part to the second day's group
          const secondDate = getSessionDay(nextDay5AM);
          let secondGroup = grouped.find(g => g.date === secondDate);
          if (!secondGroup) {
            secondGroup = { date: secondDate, sessions: [] };
            grouped.push(secondGroup);
          }
          secondGroup.sessions.push(secondPart);
        } else {
          // Add as a regular session (no split needed)
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

  function getTotalTimeWornToday(isWearing: boolean, startTime: Date | null, currentTime: Date) {
    let total = 0;

    groupedSessions.value.forEach(group => {
      if (group.date === getSessionDay(new Date())) {
        group.sessions.forEach(session => {
          const sessionStart = new Date(session.start);
          if (session.end) {
            const end = new Date(session.end);
            total += (end.getTime() - sessionStart.getTime()) / 1000;
          } else if (isWearing && startTime) {
            const currentSessionDuration = (currentTime.getTime() - startTime.getTime()) / 1000;
            total += currentSessionDuration;
          }
        });
      }
    });

    return total;
  }

  return {
    groupedSessions,
    getTotalTimeWornToday,
  };
}
