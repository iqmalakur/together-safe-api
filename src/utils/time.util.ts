export const getMinutesSinceMidnight = (date: Date): number => {
  return date.getUTCHours() * 60 + date.getUTCMinutes();
};

export const getUpdatedTimeRange = (
  timeStart: Date,
  timeEnd: Date,
  reportTime: Date,
): { updateStart?: Date; updateEnd?: Date } => {
  const toMinutes = (d: Date) => d.getUTCHours() * 60 + d.getUTCMinutes();

  const start = toMinutes(timeStart);
  const end = toMinutes(timeEnd);
  const report = toMinutes(reportTime);

  const crossesMidnight = end < start;

  const inRange = crossesMidnight
    ? report >= start || report <= end
    : report >= start && report <= end;

  if (inRange) return {};

  const toStart = (start - report + 1440) % 1440;
  const toEnd = (report - end + 1440) % 1440;

  return toStart < toEnd
    ? { updateStart: reportTime }
    : { updateEnd: reportTime };
};
