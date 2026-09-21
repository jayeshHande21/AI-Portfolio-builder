/** Shared remote image helper for sample theme assets. */
export function unsplash(id: string, w = 1200): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
}
