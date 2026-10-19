import type { MemoryAid } from '@/types/curriculum';

/** "Make it stick" memory aids for the extra lessons on numbers and java.time, keyed by lesson id. */
export const numbersTimeMemory: Record<string, MemoryAid> = {
  't-numbers-math': {
    oneLiner: '`double` is a fast but rounded measure, `BigDecimal` counts exactly, and `int` rolls over when it gets too big.',
    story:
      'Picture a market stall. To weigh apples, the seller uses a kitchen scale: quick and close enough, but add 0.1 kg and 0.2 kg and it shows 0.30000000000000004 kg. For the money, the cashier counts every cent exactly, slowly and carefully. And the old cash counter on the till only has so many digits: after its biggest number it rolls back to the smallest and keeps going without a word. In Java, the scale is `double`, the careful cashier is `BigDecimal`, and the rolling counter is `int` overflow. `Math.addExact` is a counter that rings an alarm instead of rolling over.',
    keyPoints: [
      '`double` stores binary fractions, so many decimals like `0.1` are only approximate.',
      'Use `BigDecimal` made from a `String` for money, with an explicit `RoundingMode`.',
      '`int` and `long` overflow silently; `Math.addExact` throws an exception instead.',
    ],
    confusion: {
      mixedUpWith: '`equals` and `compareTo` on `BigDecimal`',
      difference: '`equals` also compares the scale, so `2.0` and `2.00` are different, while `compareTo` only compares the value and says they are equal.',
    },
    tryIt: 'Print `0.1 + 0.2`, then `new BigDecimal("0.1").add(new BigDecimal("0.2"))`. Then print `Integer.MAX_VALUE + 1` and `Math.addExact(Integer.MAX_VALUE, 1)` and compare what happens.',
    recall: [
      { question: 'Why is `double` a bad choice for money?', answer: 'It stores binary fractions, so values like `0.1` are approximated and small errors build up.' },
      { question: 'What does `Integer.MAX_VALUE + 1` give?', answer: '`Integer.MIN_VALUE`. The value wraps around silently with no error.' },
      { question: 'Why build a `BigDecimal` from a `String` instead of a `double`?', answer: 'The `double` is already approximate, so `new BigDecimal(0.1)` keeps that tiny error. The `String` gives the exact value.' },
    ],
    picture: {
      title: 'Scale, cashier and rolling counter',
      caption: 'The quick scale is `double` (close, not exact). The careful cashier is `BigDecimal`. The till counter that rolls over is `int` overflow.',
      items: [
        { icon: 'scale', label: 'double ~0.3', x: 13, y: 12, size: 0.9, tone: 'warning' },
        { icon: 'coin', label: 'BigDecimal 0.3', x: 72, y: 12, size: 0.9, tone: 'success' },
        { icon: 'calculator', label: 'int MAX + 1', x: 13, y: 44, size: 0.9, tone: 'neutral' },
        { icon: 'warning', label: 'wraps to MIN', x: 72, y: 44, size: 0.9, tone: 'danger' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'exact' },
        { from: 2, to: 3, label: 'overflow' },
      ],
    },
  },

  't-date-time': {
    oneLiner: 'An `Instant` is one moment for the whole world; zones only change how that moment looks on local clocks.',
    story:
      'Think of an airport. A plane takes off at one single moment, the same moment for everyone on Earth. But the clock on the wall in London and the clock on the wall in Tokyo show different times for it. A birthday on a calendar is different again: it is just a date, with no time or place. In Java, the take-off moment is an `Instant`, each wall clock is a `ZonedDateTime` with its `ZoneId`, and the birthday is a `LocalDate`. Store the moment in UTC, and turn it into a local clock time only when you show it to a person.',
    keyPoints: [
      '`Instant` is an exact point on the UTC timeline, good for storing and comparing events.',
      '`LocalDate` and `LocalDateTime` have no time zone; `ZonedDateTime` adds one.',
      'All `java.time` objects are immutable: `plusDays` returns a new object.',
    ],
    confusion: {
      mixedUpWith: '`Duration` and `Period`',
      difference: '`Duration` measures exact time in seconds and nanoseconds, while `Period` counts calendar days, months and years, which can vary in length.',
    },
    tryIt: 'Print `Instant.now()`, then `Instant.now().atZone(ZoneId.of("Asia/Tokyo"))` and the same for `"Europe/London"`. Notice it is the same moment shown on two different clocks.',
    recall: [
      { question: 'Which class should you use to store when an event happened?', answer: '`Instant`, a point on the UTC timeline that means the same moment everywhere.' },
      { question: 'Does `LocalDateTime` know which time zone it is in?', answer: 'No. It is only a date and wall-clock time, with no zone or offset.' },
      { question: 'What does `date.plusDays(1)` do to `date`?', answer: 'Nothing. It returns a new object, because `java.time` values are immutable.' },
    ],
    picture: {
      title: 'One take-off, many wall clocks',
      caption: 'The take-off moment is an `Instant`. Each city clock is a `ZonedDateTime`. The birthday on the calendar is a `LocalDate` with no zone.',
      items: [
        { icon: 'globe', label: 'Instant (UTC)', x: 15, y: 28, tone: 'accent' },
        { icon: 'clock', label: 'London', x: 72, y: 10, size: 0.8, tone: 'success' },
        { icon: 'clock', label: 'Tokyo', x: 72, y: 30, size: 0.8, tone: 'success' },
        { icon: 'calendar', label: 'LocalDate', x: 72, y: 50, size: 0.7, tone: 'neutral' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 0, to: 2, label: 'atZone' },
      ],
    },
  },
};
