import { getDate } from './date.util';
import { getUpdatedTimeRange } from './time.util';

describe('getUpdatedTimeRange', () => {
  it('should handle normal update cases', () => {
    expect(
      getUpdatedTimeRange(getDate('20:00'), getDate('20:00'), getDate('19:00')),
    ).toEqual({ updateStart: getDate('19:00') });

    expect(
      getUpdatedTimeRange(getDate('20:00'), getDate('21:00'), getDate('19:00')),
    ).toEqual({ updateStart: getDate('19:00') });

    expect(
      getUpdatedTimeRange(getDate('20:00'), getDate('20:00'), getDate('21:00')),
    ).toEqual({ updateEnd: getDate('21:00') });

    expect(
      getUpdatedTimeRange(getDate('19:00'), getDate('20:00'), getDate('21:00')),
    ).toEqual({ updateEnd: getDate('21:00') });
  });

  it('should handle cross-midnight cases correctly', () => {
    expect(
      getUpdatedTimeRange(getDate('23:00'), getDate('01:00'), getDate('22:00')),
    ).toEqual({ updateStart: getDate('22:00') });

    expect(
      getUpdatedTimeRange(getDate('23:00'), getDate('01:00'), getDate('02:00')),
    ).toEqual({ updateEnd: getDate('02:00') });

    expect(
      getUpdatedTimeRange(getDate('22:00'), getDate('23:00'), getDate('01:00')),
    ).toEqual({ updateEnd: getDate('01:00') });

    expect(
      getUpdatedTimeRange(getDate('01:00'), getDate('02:00'), getDate('03:00')),
    ).toEqual({ updateEnd: getDate('03:00') });

    expect(
      getUpdatedTimeRange(getDate('01:00'), getDate('02:00'), getDate('22:00')),
    ).toEqual({ updateStart: getDate('22:00') });

    expect(
      getUpdatedTimeRange(getDate('01:00'), getDate('02:00'), getDate('00:00')),
    ).toEqual({ updateStart: getDate('00:00') });

    expect(
      getUpdatedTimeRange(getDate('22:00'), getDate('23:00'), getDate('00:00')),
    ).toEqual({ updateEnd: getDate('00:00') });
  });

  it('should not update if reportTime is within the range', () => {
    expect(
      getUpdatedTimeRange(getDate('20:00'), getDate('22:00'), getDate('21:00')),
    ).toEqual({});

    expect(
      getUpdatedTimeRange(getDate('23:00'), getDate('01:00'), getDate('00:30')),
    ).toEqual({});

    expect(
      getUpdatedTimeRange(getDate('23:00'), getDate('01:00'), getDate('23:00')),
    ).toEqual({});

    expect(
      getUpdatedTimeRange(getDate('23:00'), getDate('01:00'), getDate('01:00')),
    ).toEqual({});
  });

  it('should not update if reportTime equals start or end time', () => {
    expect(
      getUpdatedTimeRange(getDate('13:21'), getDate('13:21'), getDate('13:21')),
    ).toEqual({});

    expect(
      getUpdatedTimeRange(getDate('18:00'), getDate('20:00'), getDate('18:00')),
    ).toEqual({});

    expect(
      getUpdatedTimeRange(getDate('18:00'), getDate('20:00'), getDate('20:00')),
    ).toEqual({});
  });

  it('should handle extreme edge time cases', () => {
    expect(
      getUpdatedTimeRange(getDate('00:00'), getDate('01:00'), getDate('23:59')),
    ).toEqual({ updateStart: getDate('23:59') });

    expect(
      getUpdatedTimeRange(getDate('23:00'), getDate('00:00'), getDate('00:00')),
    ).toEqual({});

    expect(
      getUpdatedTimeRange(getDate('00:00'), getDate('00:00'), getDate('23:59')),
    ).toEqual({ updateStart: getDate('23:59') });

    expect(
      getUpdatedTimeRange(getDate('00:00'), getDate('00:00'), getDate('00:01')),
    ).toEqual({ updateEnd: getDate('00:01') });
  });
});
