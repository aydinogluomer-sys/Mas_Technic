/* "A, B ve C" / "A, B and C" — a prose list in the reader's language. */
export function joinList(parts: readonly string[], language: string | undefined): string {
  if (parts.length < 2) return parts.join("");
  const and = (language ?? "tr").startsWith("en") ? "and" : "ve";
  return `${parts.slice(0, -1).join(", ")} ${and} ${parts[parts.length - 1]}`;
}

const MONTHS: Record<string, string> = {
  Ocak: "January", Şubat: "February", Mart: "March", Nisan: "April", Mayıs: "May", Haziran: "June",
  Temmuz: "July", Ağustos: "August", Eylül: "September", Ekim: "October", Kasım: "November", Aralık: "December",
};

/* The corpus stores display dates in Turkish ("15 Ocak 2024"); on an English
   route the month name is swapped and the day and year stay as written. */
export function localDate(date: string, language: string | undefined): string {
  if (!(language ?? "tr").startsWith("en")) return date;
  return date.replace(/\p{L}+/u, (month) => MONTHS[month] ?? month);
}
