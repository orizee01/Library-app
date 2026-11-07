export function formatDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Lower case with accents removed, so typing "ngugi" finds "Ngũgĩ".
function plain(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

// True when any of the fields contains what was typed. An empty search matches.
export function matchesSearch(search: string, fields: (string | number | null)[]) {
  const wanted = plain(search.trim());
  return fields.some((field) => field !== null && plain(String(field)).includes(wanted));
}
