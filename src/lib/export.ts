export function exportToJsonFile(obj: unknown, fileName: string) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
