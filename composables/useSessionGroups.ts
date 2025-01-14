import { useTime } from '~/composables/useTime';

export function useSessionGroups(wearingSessions, wearingGoal, dayStartAt, getSessionDay, setToStartOfDay) {
  const { getStartOfDay } = useTime(dayStartAt);

  const groupedSessions = computed(() => {
    const grouped = [];
    const addSession = (date, start, end) => {
      let group = grouped.find(g => g.date === date);
      if (!group) {
        group = { date, sessions: [], isPartialDay: false };
        grouped.push(group);
      }
      group.sessions.push({ start, end });
    };

    wearingSessions.value.forEach(session => {
      const start = new Date(session.start);
      const end = session.end ? new Date(session.end) : null;
      
      if (end) {
        const startDay = getStartOfDay(start);
        const endDay = getStartOfDay(end);
        
        if (startDay.getTime() === endDay.getTime()) {
          // Same day session
          addSession(getSessionDay(start), start, end);
        } else {
          // Cross-day session, split into multiple days
          let currentStart = new Date(start);
          let currentEnd = new Date(end);
          let isFirstDay = true;
          
          while (currentStart < currentEnd) {
            const dayStart = getStartOfDay(currentStart);
            const nextDayStart = new Date(dayStart.getTime() + 86400000);
            const s = new Date(Math.max(currentStart.getTime(), dayStart.getTime()));
            const e = new Date(Math.min(currentEnd.getTime(), nextDayStart.getTime()));
            
            const date = getSessionDay(s);
            let group = grouped.find(g => g.date === date);
            if (!group) {
              group = { date, sessions: [], isPartialDay: !isFirstDay };
              grouped.push(group);
            } else if (!isFirstDay) {
              group.isPartialDay = true;
            }
            group.sessions.push({ start: s, end: e });
            
            currentStart = nextDayStart;
            isFirstDay = false;
          }
        }
      } else {
        // Ongoing session
        const start = new Date(session.start);
        const now = new Date();
        const startDay = getStartOfDay(start);
        const endDay = getStartOfDay(now);
        
        if (startDay.getTime() === endDay.getTime()) {
          // Same day ongoing session
          addSession(getSessionDay(start), start, null);
        } else {
          // Cross-day ongoing session, split into multiple days
          let currentStart = new Date(start);
          let isFirstDay = true;
          
          while (currentStart <= now) {
            const dayStart = getStartOfDay(currentStart);
            const nextDayStart = new Date(dayStart.getTime() + 86400000);
            const s = new Date(Math.max(currentStart.getTime(), dayStart.getTime()));
            const e = new Date(Math.min(now.getTime(), nextDayStart.getTime()));
            
            const date = getSessionDay(s);
            let group = grouped.find(g => g.date === date);
            if (!group) {
              group = { date, sessions: [], isPartialDay: !isFirstDay };
              grouped.push(group);
            } else if (!isFirstDay) {
              group.isPartialDay = true;
            }
            
            if (getStartOfDay(e).getTime() === getStartOfDay(now).getTime()) {
              // Last day of the ongoing session
              group.sessions.push({ start: s, end: null });
            } else {
              group.sessions.push({ start: s, end: e });
            }
            
            currentStart = nextDayStart;
            isFirstDay = false;
          }
        }
      }
    });

    // Compute totals for each group
    grouped.forEach(group => {
      const baseDay = getStartOfDay(new Date(group.sessions[0].start));
      const endOfDay = new Date(baseDay.getTime() + 86400000);
      group.total = group.sessions.reduce((acc, session) => {
        const sessionStart = new Date(session.start);
        const sessionEnd = session.end ? new Date(session.end) : new Date();
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
