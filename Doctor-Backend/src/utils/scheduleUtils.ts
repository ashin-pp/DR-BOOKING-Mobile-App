export const generateSlots = (date: string, startTime: string, endTime: string, totalTokens: number) => {
  const start = new Date(`${date}T${startTime}:00`);
  const end = new Date(`${date}T${endTime}:00`);
  
  if (end <= start) {
    throw new Error('End time must be after start time');
  }

  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const slotDurationMinutes = Math.floor(diffMins / totalTokens);

  if (slotDurationMinutes < 5) {
    throw new Error('Total tokens too high for this time period (slots < 5 mins)');
  }

  const slots = [];
  let currentTime = new Date(start.getTime());

  for (let i = 0; i < totalTokens; i++) {
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    slots.push({ time: `${hours}:${minutes}`, isBooked: false });
    
    currentTime = new Date(currentTime.getTime() + slotDurationMinutes * 60000);
  }

  return { slotDurationMinutes, slots };
};
