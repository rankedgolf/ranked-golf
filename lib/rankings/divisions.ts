export function getDivisionFromIndex(index: number | null | undefined) {
  if (index === null || index === undefined || Number.isNaN(Number(index))) {
    return "Unranked";
  }

  const value = Number(index);

  if (value <= 2.9) return "Legend";
  if (value <= 7.9) return "Elite";
  if (value <= 12.9) return "Contender";
  if (value <= 18.9) return "Grinder";

  return "Weekend Warrior";
}