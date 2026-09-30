/* Uppercase in the reader's language, not in Turkish: `"Services"
   .toLocaleUpperCase("tr-TR")` is "SERVİCES". */
export function upper(text: string, language: string | undefined): string {
  const code = (language ?? "tr").split("-")[0];
  return text.toLocaleUpperCase(code === "tr" ? "tr-TR" : code);
}
