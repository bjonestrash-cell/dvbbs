export function getAllowedEmails(): Set<string> {
  const raw = process.env.ALLOWED_AUTH_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isWhitelisted(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAllowedEmails().has(email.toLowerCase());
}
