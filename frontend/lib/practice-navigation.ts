export function buildPracticeSessionPath(
  sessionId: string,
  returnTo?: string | null
) {
  if (!returnTo || !isSafeReturnPath(returnTo)) {
    return `/practice/${sessionId}`;
  }

  const params = new URLSearchParams({
    returnTo,
  });

  return `/practice/${sessionId}?${params.toString()}`;
}

export function resolvePracticeReturnPath(
  returnTo: string | null | undefined,
  fallback: string
) {
  if (returnTo && isSafeReturnPath(returnTo)) {
    return returnTo;
  }

  return fallback;
}

function isSafeReturnPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//");
}
