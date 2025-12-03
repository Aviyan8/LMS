export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isAfter(date1, date2) {
  return date1 > date2;
}

export function getCurrentDate() {
  return new Date();
}

