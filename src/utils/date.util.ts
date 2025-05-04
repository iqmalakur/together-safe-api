const zeroPadding = (numText: string | number, length: number = 2) => {
  return `${numText}`.padStart(length, '0');
};

export const getDateString = (date: Date) => {
  const year: string = zeroPadding(date.getFullYear(), 4);
  const month: string = zeroPadding(date.getMonth() + 1, 2);
  const day: string = zeroPadding(date.getDate(), 2);

  return `${year}-${month}-${day}`;
};

const months = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const getFormattedDate = (date: Date, simpleDate: boolean = false) => {
  const year = zeroPadding(date.getFullYear(), 4);
  const day = zeroPadding(date.getDate(), 2);
  const fullMonth = months[date.getMonth()];
  const month = simpleDate ? fullMonth.slice(0, 3) : fullMonth;

  return `${day} ${month} ${year}`;
};

export const getTimeString = (date: Date, timeFix: boolean = false) => {
  if (timeFix) {
    date.setHours(date.getHours() - 7);
  }

  const hours: string = zeroPadding(date.getHours());
  const minutes: string = zeroPadding(date.getMinutes());

  return `${hours}:${minutes}`;
};

export const getLogDateFormat = (date: Date) => {
  const seconds: string = zeroPadding(date.getSeconds());
  const miliseconds: string = zeroPadding(date.getMilliseconds(), 3);
  return `${getTimeString(date)}:${seconds}.${miliseconds}`;
};

export const isValidTime = (time: string): boolean => {
  const timeValidation = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  return timeValidation.test(time);
};

export const getDate = (dateString: string): Date => {
  if (isValidTime(dateString)) {
    return new Date(`1970-01-01T${dateString}:00.000Z`);
  }

  return new Date(dateString);
};
