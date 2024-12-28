export function formatDate(date: Date): string {
  // Formats the date to 'YYYY-MM-DD'
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);
  return `${year}-${month}-${day}`;
}

export function getDaysArray(count: number): Date[] {
  const days = [];
  const middle = Math.floor(count / 2);

  for (let i = -middle; i <= middle; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    days.push(date);
  }

  return days;
}
