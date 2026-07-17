export const getLocalDateString = (d?: Date) => {
  const date = d || new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isTimeInPast = (timeStr: string, dateStr: string) => {
  const now = new Date();
  const localToday = getLocalDateString(now);
  
  // If the date is in the future, time is not in the past
  if (dateStr > localToday) return false;
  // If the date is in the past, time is in the past
  if (dateStr < localToday) return true;

  // It's today. Compare times.
  // timeStr is in "HH:MM" format (24-hour)
  const [hours, minutes] = timeStr.split(':').map(Number);
  const slotTime = new Date();
  slotTime.setHours(hours, minutes, 0, 0);

  return slotTime < now;
};
