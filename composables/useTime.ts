export function useTime(dayStartAt) {
  const setToStartOfDay = d => {
    const [h, m] = dayStartAt.value.split(':').map(Number);
    d.setHours(h, m, 0, 0);
  };

  const getStartOfDay = (d = new Date()) => {
    const s = new Date(d);
    setToStartOfDay(s);
    if (d.getHours() < 5) s.setDate(s.getDate() - 1);
    return s;
  };

  const getSessionDay = d => {
    const sd = new Date(d);
    if (sd.getHours() < 5) sd.setDate(sd.getDate() - 1);
    return sd.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return { setToStartOfDay, getStartOfDay, getSessionDay };
}
