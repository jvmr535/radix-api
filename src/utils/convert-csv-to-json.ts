export function convertCSVtoJSON<T>(csv: string): T[] {
  const lines = csv.split('\n');
  const result = [];
  const headers = lines[0].trim().split(',');

  for (let i = 1; i < lines.length; i++) {
    const currentline = lines[i].trim().split(',');

    if (currentline.length === 1 && currentline[0] === '') {
      continue;
    }

    const obj: any = {};

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }
    result.push(obj);
  }
  return result;
}
