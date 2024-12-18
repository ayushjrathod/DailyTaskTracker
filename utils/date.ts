export function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear().toString().slice(-2);
  return `${day} ${month}. ${year}`;
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
