export function useTime(dayStartAt) {
  const setToStartOfDay = d => {
    const [hours, minutes] = typeof dayStartAt.value === 'string' 
      ? dayStartAt.value.split(':').map(Number)
      : [Math.floor(dayStartAt.value / 100), dayStartAt.value % 100];
    d.setHours(hours, minutes, 0, 0);
  };

  const getStartOfDay = (d = new Date()) => {
    const s = new Date(d);
    setToStartOfDay(s);
    if (s > d) s.setDate(s.getDate() - 1);
    return s;
  };

  const getSessionDay = d => {
    const sd = getStartOfDay(d);
    return sd.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };


  return { setToStartOfDay, getStartOfDay, getSessionDay };
}
