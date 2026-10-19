import type { MemoryAid } from '@/types/curriculum';

/** "Make it stick" memory aids for the functional programming module, keyed by lesson id. */
export const functionalMemory: Record<string, MemoryAid> = {
  'fn-lambdas': {
    oneLiner: 'A lambda is a short, nameless piece of behaviour that fills the one empty slot of a functional interface.',
    story:
      'A shop puts up a job sign: "Wanted: someone to do ONE task: look at a product and say yes or no." The sign does not care who you are, only that you do that one task. You hand over a sticky note that says "yes if the price is under 10". In Java, the job sign is a functional interface, an interface with exactly one abstract method, like `Predicate<T>`. The sticky note is the lambda `p -> p.price() < 10`. The note has no name of its own; the sign tells Java what kind of job it is.',
    keyPoints: [
      'A functional interface has exactly one abstract method, such as `Predicate`, `Function`, `Supplier` or `Consumer`.',
      'A lambda can use local variables only if they are effectively final, meaning never reassigned.',
      'A method reference like `String::length` is a shorter way to write a lambda that calls one method.',
    ],
    confusion: {
      mixedUpWith: 'an anonymous inner class',
      difference: 'An anonymous class is a real class with its own `this`. Inside a lambda, `this` means the surrounding object, and the code is shorter.',
    },
    tryIt: 'Write `Predicate<String> isLong = s -> s.length() > 5;` and print `isLong.test("hi")` and `isLong.test("elephant")`. Then rewrite `s -> s.toUpperCase()` as a method reference.',
    recall: [
      { question: 'What is a functional interface?', answer: 'An interface with exactly one abstract method.' },
      { question: 'Which local variables can a lambda use?', answer: 'Only effectively final ones, which are never reassigned after they get a value.' },
      { question: 'What lambda does `String::length` stand for?', answer: '`s -> s.length()`.' },
    ],
    picture: {
      title: 'A note for a one-task job',
      caption: 'The job sign is the functional interface. The sticky note is the lambda that fills it. The answer is yes or no, like a Predicate.',
      items: [
        { icon: 'note', label: 'lambda', x: 13, y: 22, tone: 'accent' },
        { icon: 'signpost', label: 'Predicate', x: 50, y: 22, tone: 'primary' },
        { icon: 'check', label: 'yes / no', x: 87, y: 22, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'fills' },
        { from: 1, to: 2, label: 'test' },
      ],
    },
  },
  'fn-streams': {
    oneLiner: 'A stream is a lazy conveyor belt: middle steps only describe the work, and the final step makes it run.',
    story:
      'Think of a packing factory with a conveyor belt. Boxes come from a pile, pass a checker who throws out broken ones, then a machine that adds a label, and finally reach a truck. The belt does not move until the truck driver at the end says "load me". In Java, the pile is the source, such as a list. The checker is `filter`, the labelling machine is `map`, and the truck is a terminal operation like `toList()` or `count()`. Items travel one by one, and the stream can run only once.',
    keyPoints: [
      'Intermediate operations like `filter` and `map` are lazy; nothing runs until a terminal operation.',
      'A terminal operation like `collect`, `count` or `findFirst` runs the pipeline once.',
      'A stream does not store data or change its source, and it cannot be reused.',
    ],
    confusion: {
      mixedUpWith: 'a collection such as `List`',
      difference: 'A list stores elements and you can loop over it many times. A stream stores nothing and is used up after one terminal operation.',
    },
    tryIt: 'Run `List.of(1, 2, 3, 4).stream().filter(n -> n % 2 == 0).map(n -> n * 10).toList()` and print it. Then replace `.toList()` with `.peek(System.out::println)` and see that nothing prints.',
    recall: [
      { question: 'When does a stream pipeline actually do its work?', answer: 'When a terminal operation such as `toList()` or `count()` is called.' },
      { question: 'Can you use the same stream twice?', answer: 'No. Once a terminal operation has run, the stream is used up.' },
      { question: 'Does `filter` change the original list?', answer: 'No. A stream never modifies its source.' },
    ],
    picture: {
      title: 'A belt that moves when the truck asks',
      caption: 'The pile is the source, the filter and gear are intermediate steps, and the truck is the terminal operation that pulls everything along.',
      items: [
        { icon: 'boxes', label: 'source', x: 11, y: 20, size: 0.9, tone: 'neutral' },
        { icon: 'filter', label: 'filter', x: 37, y: 20, size: 0.9, tone: 'primary' },
        { icon: 'gear', label: 'map', x: 63, y: 20, size: 0.9, tone: 'primary' },
        { icon: 'truck', label: 'toList()', x: 89, y: 20, size: 0.9, tone: 'accent' },
        { icon: 'conveyor', label: 'one at a time', x: 50, y: 47, size: 0.8, tone: 'neutral' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 3 },
      ],
    },
  },
  'fn-optional-modern': {
    oneLiner: '`Optional` is a box a method returns that may hold one value or be empty, so callers must check.',
    story:
      'You ask the lost-and-found desk for your umbrella. The clerk always hands you a box. Sometimes your umbrella is inside, sometimes the box is empty. Because you always get a box, you cannot forget that it might be empty: you open it and decide what to do. In Java, the desk is a method like `findUser(id)`, the box is `Optional<User>`, and deciding is `map`, `orElse` or `orElseThrow`. Before `Optional`, the desk might hand you nothing at all, which is `null`, and you could trip over it later.',
    keyPoints: [
      'Use `Optional` mainly as a method return type, not for fields or parameters.',
      'Transform with `map` and `filter`, then unwrap with `orElse`, `orElseGet` or `orElseThrow`.',
      'Calling `get()` without checking just swaps one error for another.',
    ],
    confusion: {
      mixedUpWith: '`orElse` versus `orElseGet`',
      difference: '`orElse(x)` always works out `x` first, even when a value is present. `orElseGet(() -> x)` only runs when the box is empty.',
    },
    tryIt: 'Write `Optional<String> name = Optional.ofNullable(null);` and print `name.map(String::toUpperCase).orElse("guest")`. Change `null` to `"sam"` and run it again.',
    recall: [
      { question: 'Where should `Optional` usually be used?', answer: 'As the return type of a method that might have no result.' },
      { question: 'Which method creates an `Optional` from a value that might be `null`?', answer: 'Use `Optional.ofNullable(value)`.' },
    ],
    picture: {
      title: 'The lost-and-found box',
      caption: 'The method always returns a box (Optional). It may hold your item or be empty, and you choose what to do in each case.',
      items: [
        { icon: 'person', label: 'findUser(id)', x: 13, y: 28, tone: 'primary' },
        { icon: 'gift', label: 'Optional', x: 50, y: 28, tone: 'accent' },
        { icon: 'check', label: 'has a value', x: 86, y: 11, size: 0.8, tone: 'success' },
        { icon: 'box', label: 'empty: orElse', x: 84, y: 46, size: 0.8, tone: 'warning' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 1, to: 3, dashed: true },
      ],
    },
  },
};
