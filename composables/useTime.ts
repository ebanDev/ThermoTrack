
export function useTime(dayStartAt) {
  function setToStartOfDay(date: Date) {
    const [hours, minutes] = dayStartAt.value.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
  }

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

  return {
    setToStartOfDay,
    getStartOfDay,
    getSessionDay,
  };
}
