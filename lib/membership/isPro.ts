export function isPro(
  membershipTier?: string | null
) {
  return (
    membershipTier === "pro" ||
    membershipTier === "competitive"
  );
}

export function isCompetitive(
  membershipTier?: string | null
) {
  return membershipTier === "competitive";
}