import type { MemoryAid } from '@/types/curriculum';

/** "Make it stick" memory aids for the extra lessons on regular expressions and annotations/reflection, keyed by lesson id. */
export const regexReflectionMemory: Record<string, MemoryAid> = {
  't-regex': {
    oneLiner: 'A regex is a stencil for text: make the `Pattern` once, then slide a `Matcher` over each input.',
    story:
      'Picture a librarian hunting for phone numbers in old letters. First they cut a stencil with holes shaped like "three digits, a dash, four digits". Cutting the stencil takes time, so they do it once and keep it. For each letter, a helper slides a copy of the stencil along the page and stops wherever it fits. In Java, the stencil is a `Pattern` from `Pattern.compile`, each helper with their own place on the page is a `Matcher`, and stopping at each fit is `find()`. A badly cut stencil that fits in many ways can make the helper try every way, which can take a very long time.',
    keyPoints: [
      'Compile a `Pattern` once and reuse it; it is immutable and safe to share between threads.',
      '`matches()` needs the whole input to fit, while `find()` looks for the next part that fits.',
      'Groups in `( )` capture parts of the match, which you read with `group(1)` and so on.',
    ],
    types: [
      {
        title: 'Quantifier kinds',
        items: [
          { name: 'Greedy', simple: 'Grabs as much as it can, then hands back bit by bit, like scooping up the whole sweet jar first.' },
          { name: 'Reluctant (lazy)', simple: 'Takes as little as possible and asks for more, one sweet at a time.' },
          { name: 'Possessive', simple: 'Grabs everything and never gives any back. Fast, but it can miss a match greedy would find.' },
          { name: 'Atomic group', simple: 'A group that is locked once it matches; the engine never goes back to try other options inside it.' },
        ],
      },
      {
        title: 'Matching methods',
        items: [
          { name: '`matches()`', simple: 'The whole text must fit the stencil exactly. Use it to check input such as a postcode.' },
          { name: '`lookingAt()`', simple: 'Only the start of the text must fit; the rest can be anything.' },
          { name: '`find()`', simple: 'Slides the stencil along the text and stops at each place where it fits.' },
          { name: '`results()`', simple: 'Hands you every match as a stream, so you can count or collect them.' },
        ],
      },
      {
        title: 'Kinds of regex constructs',
        items: [
          { name: 'Character classes', simple: 'A box of allowed characters for one spot, like `[a-z]`, or `\\d` for any digit.' },
          { name: 'Quantifiers', simple: 'How many times: `*` any number, `+` at least one, `?` maybe, `{3}` exactly three.' },
          { name: 'Anchors', simple: '`^` and `$` mean start and end, like saying "the whole line, not just part of it".' },
          { name: 'Groups', simple: 'Brackets that bundle parts and remember what they matched, like `(\\d{4})` for a year.' },
          { name: 'Alternation', simple: '`cat|dog` means either one, like choosing from a menu.' },
          { name: 'Look-arounds', simple: 'Peek ahead or behind without using up characters, like checking that a number is followed by "px".' },
          { name: 'Back-references', simple: '`\\1` means "the same text again", for example to find doubled letters.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: '`matches()` and `find()`',
      difference: '`matches()` succeeds only if the entire text fits the pattern, while `find()` succeeds if any part of the text fits.',
    },
    tryIt: 'Compile `Pattern.compile("(\\\\d{3})-(\\\\d{4})")` and make a `Matcher` for "call 555-1234 now". Print `m.matches()`, then reset with `m.reset()`, loop with `while (m.find())` and print `m.group(1)`.',
    recall: [
      { question: 'Why should you compile a `Pattern` once instead of inside a loop?', answer: 'Compiling parses the regex, which costs time. A compiled `Pattern` is immutable and can be reused.' },
      { question: 'Is a `Matcher` safe to share between threads?', answer: 'No. A `Matcher` keeps its own position, so each thread needs its own.' },
    ],
    picture: {
      title: 'Cut the stencil once',
      caption: 'The stencil is the compiled `Pattern`. Each helper sliding it over a page is a `Matcher` that finds the parts that fit.',
      items: [
        { icon: 'blueprint', label: 'Pattern', x: 13, y: 28, tone: 'accent' },
        { icon: 'magnifier', label: 'Matcher', x: 50, y: 28, tone: 'primary' },
        { icon: 'check', label: '555-1234', x: 85, y: 12, size: 0.9, tone: 'success' },
        { icon: 'book', label: 'input text', x: 85, y: 44, size: 0.9, tone: 'neutral' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'reuse' },
        { from: 1, to: 2 },
        { from: 3, to: 1, dashed: true },
      ],
    },
  },

  't-annotations-reflection': {
    oneLiner: 'An annotation is a label that does nothing by itself; tools and frameworks read it, often with reflection.',
    story:
      'Think of luggage at an airport. You stick a "Fragile" tag on your suitcase. The tag cannot protect anything: it only matters because the baggage handler reads it and carries the bag gently. Some tags are only for the check-in desk and are removed before the flight; others stay on the whole trip. In Java, the tag is an annotation like `@Override`, the handler is the compiler or a framework, and how long the tag stays on is `@Retention`. Reflection is the scanner that lets the handler look at the suitcase\'s class, methods and fields at run time.',
    keyPoints: [
      'An annotation is metadata; it changes nothing unless something reads it.',
      '`@Retention(RUNTIME)` keeps it readable by reflection; `SOURCE` drops it after compiling.',
      'Reflection uses `Class`, `Method` and `Field` objects to inspect and call code at run time.',
    ],
    types: [
      {
        title: 'Retention policies',
        items: [
          { name: '`SOURCE`', simple: 'A sticky note for the compiler only. It is peeled off and never reaches the class file.' },
          { name: '`CLASS` (default)', simple: 'Stamped into the class file but invisible at run time. The classic trap for custom annotations.' },
          { name: '`RUNTIME`', simple: 'A sign on the door that frameworks read while the program runs, using reflection.' },
        ],
      },
      {
        title: 'Kinds of annotations',
        items: [
          { name: 'Marker annotation', simple: 'Just a tag with nothing inside, like a "Fragile" sticker: `@Override`.' },
          { name: 'Single-element annotation', simple: 'One value called value, so you write it directly: `@SuppressWarnings("unchecked")`.' },
          { name: 'Normal annotation', simple: 'Several named values, like a form with fields: `@Deprecated(since = "9", forRemoval = true)`.' },
          { name: 'Repeatable annotation', simple: 'May appear several times on one thing, like several delivery-day stickers on one parcel.' },
          { name: 'Meta-annotation', simple: 'A label for labels: `@Retention` and `@Target` describe how another annotation behaves.' },
        ],
      },
      {
        title: 'Ways to call code dynamically',
        items: [
          { name: 'Reflection (`Method.invoke`)', simple: 'Look up a method by name while the program runs and call it. Flexible, but slower and unchecked.' },
          { name: '`MethodHandle`', simple: 'A pre-checked shortcut to a method that the JIT can make almost as fast as a direct call.' },
          { name: 'Generated code', simple: 'A tool writes ordinary Java for you at build time, so the compiler checks it and it runs fastest.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: 'annotations and comments',
      difference: 'A comment is ignored by every tool, while an annotation is typed data the compiler or a framework can read and act on.',
    },
    tryIt: 'Make an annotation `@interface Fragile {}` marked `@Retention(RetentionPolicy.RUNTIME)`, put it on a class `MyBag`, and print `MyBag.class.isAnnotationPresent(Fragile.class)`. Then remove the `@Retention` line and run it again.',
    recall: [
      { question: 'What does an annotation do on its own?', answer: 'Nothing. It is only metadata, and it matters only when the compiler, a processor or a framework reads it.' },
      { question: 'Which retention lets you read an annotation with reflection at run time?', answer: '`RetentionPolicy.RUNTIME`. With the default, `CLASS`, it is in the class file but not visible to reflection.' },
    ],
    picture: {
      title: 'The tag only matters if someone reads it',
      caption: 'The tag is the annotation on a class. The handler is a framework that reads it at run time through reflection.',
      items: [
        { icon: 'box', label: 'MyBag', x: 13, y: 28, tone: 'neutral' },
        { icon: 'tag', label: '@Fragile', x: 13, y: 8, size: 0.6, tone: 'accent' },
        { icon: 'magnifier', label: 'reflection', x: 50, y: 28, tone: 'primary' },
        { icon: 'robot', label: 'framework', x: 87, y: 28, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 2, label: 'scan' },
        { from: 2, to: 3 },
      ],
    },
  },
};
