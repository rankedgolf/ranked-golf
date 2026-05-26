export function getEventStatus(startDate: string, endDate: string) {
  const today = new Date().toISOString().split("T")[0];

  if (today < startDate) {
    return "upcoming";
  }

  if (today > endDate) {
    return "completed";
  }

  return "active";
}