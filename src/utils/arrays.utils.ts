export const countOccurrences = <T>(givenArray: T[], givenValue: T): number =>
  givenArray.reduce(
    (count: number, value: T) => (value === givenValue ? count + 1 : count),
    0
  );
