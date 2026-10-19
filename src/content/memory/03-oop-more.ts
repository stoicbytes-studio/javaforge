import type { MemoryAid } from '@/types/curriculum';

/** "Make it stick" memory aids for the further object-oriented programming module, keyed by lesson id. */
export const oopMoreMemory: Record<string, MemoryAid> = {
  'o-access-modifiers': {
    oneLiner: 'Access modifiers decide who may see a member: only this class, this package, subclasses too, or everyone.',
    story:
      'Think of a school. Your diary stays in your own bag: only you read it. The classroom noticeboard is for everyone in that class. The sports kit is shared with your class and also lent to your team-mates from other schools. The front gate notice is for the whole town. In Java, the bag is `private` (only this class), the classroom is package-private, written with no keyword (same package), the sports kit is `protected` (same package plus subclasses elsewhere), and the gate notice is `public` (everyone). Start with the smallest circle and widen only when you must.',
    keyPoints: [
      'From narrow to wide: `private`, package-private (no keyword), `protected`, `public`.',
      'Make fields `private` by default and expose behaviour through methods.',
      '`protected` also opens the member to the whole package, not just subclasses.',
    ],
    confusion: {
      mixedUpWith: 'access modifiers and `static` or `final`',
      difference: 'Access modifiers say who can see a member. `static` and `final` say how it behaves: shared by the class, or set only once.',
    },
    tryIt: 'Make a class with a `private int secret`. From another class, try to read `obj.secret` and read the compile error. Then add a public getter and use that instead.',
    recall: [
      { question: 'What access level do you get with no keyword?', answer: 'Package-private: visible to every class in the same package.' },
      { question: 'Who can see a `protected` member?', answer: 'Every class in the same package, plus subclasses in other packages.' },
      { question: 'Which access level should fields usually have?', answer: '`private`, with methods controlling changes.' },
    ],
    picture: {
      title: 'Bag, classroom, team, town',
      caption: 'Each circle is wider than the last: `private`, package-private, `protected`, `public`.',
      items: [
        { icon: 'lock', label: 'private', x: 12, y: 22, size: 0.8, tone: 'danger' },
        { icon: 'house', label: 'package', x: 37, y: 22, size: 0.8, tone: 'warning' },
        { icon: 'people', label: 'protected', x: 63, y: 22, size: 0.8, tone: 'accent' },
        { icon: 'globe', label: 'public', x: 88, y: 22, size: 0.8, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 3 },
      ],
    },
  },
  'o-nested-classes': {
    oneLiner: 'A nested class lives inside another class; make it `static` unless it truly needs the outer object.',
    story:
      'A department store has departments inside it. The shoe department is part of the store\'s plan, but it does not belong to any one customer: that is like a `static` nested class. A personal shopper is different: each one is assigned to a single customer and always knows who that customer is. That is an inner class, which holds a hidden link to its outer object, `Outer.this`. A helper who appears for one quick job and leaves without a name is an anonymous class. Because a personal shopper keeps their customer close, a forgotten shopper can keep that customer "in the store" (in memory) for too long.',
    keyPoints: [
      'A `static` nested class has no link to an outer object; prefer it by default.',
      'An inner (non-static) class keeps a hidden reference to its outer object.',
      'Anonymous classes and lambdas are written inline for one quick job.',
    ],
    confusion: {
      mixedUpWith: 'lambdas and anonymous classes',
      difference: 'An anonymous class is a real class, and `this` inside it means itself. A lambda is not a class, and `this` means the enclosing object.',
    },
    tryIt: 'Write `class Outer { int x = 5; class Inner { int get() { return x; } } }`. Try to create `Inner` without an `Outer` object, read the error, then make `Inner` static and see what changes.',
    recall: [
      { question: 'What does an inner class have that a static nested class does not?', answer: 'A hidden reference to an instance of the outer class, `Outer.this`.' },
      { question: 'Which kind of nested class should you choose by default?', answer: 'A `static` nested class, unless you need the outer object.' },
    ],
    picture: {
      title: 'Departments and personal shoppers',
      caption: 'The department belongs to the store (`static` nested). The personal shopper is tied to one customer (inner class).',
      items: [
        { icon: 'shop', label: 'Outer class', x: 14, y: 22, tone: 'primary' },
        { icon: 'shelf', label: 'static nested', x: 55, y: 10, size: 0.8, tone: 'success' },
        { icon: 'person', label: 'inner class', x: 55, y: 44, size: 0.8, tone: 'warning' },
        { icon: 'chain', label: 'Outer.this', x: 88, y: 44, size: 0.8, tone: 'accent' },
      ],
      arrows: [
        { from: 0, to: 1, dashed: true },
        { from: 0, to: 2, dashed: true },
        { from: 2, to: 3 },
      ],
    },
  },
  'o-enums': {
    oneLiner: 'An enum is a class with a fixed list of named objects, created once and never more.',
    story:
      'A traffic light can only ever show red, amber or green. Nobody can add a purple light. Each colour also carries a fact, like how long it stays on. In Java, the traffic light is `enum Light { RED, AMBER, GREEN }`. Each colour is one object, made once when the enum is first used, and you cannot make new ones with `new`. Because there is exactly one `RED`, you can compare with `==`. Each colour can have its own field, such as `seconds`, and even its own method body, so the behaviour lives with the constant instead of in a long `switch`.',
    keyPoints: [
      'Enum constants are the only instances; `new` cannot create more.',
      'Enums can have fields, constructors and methods, and can implement interfaces.',
      'A `switch` on an enum can cover every constant; `EnumSet` and `EnumMap` are fast collections for enums.',
    ],
    confusion: {
      mixedUpWith: 'String or int constants',
      difference: 'A `String` constant accepts any text, even typos. An enum type only accepts its listed constants, so the compiler catches mistakes.',
    },
    tryIt: 'Write `enum Light { RED, AMBER, GREEN }`. Loop over `Light.values()` and print each `name()` and `ordinal()`. Then add a `seconds` field with a constructor and print it too.',
    recall: [
      { question: 'Can you create a new enum constant with `new`?', answer: 'No. The listed constants are the only instances.' },
      { question: 'Why is `==` safe for comparing enum values?', answer: 'Each constant exists exactly once, so equal values are the very same object.' },
      { question: 'Can an enum have fields and methods?', answer: 'Yes. It is a class, so it can have fields, a constructor, methods and interfaces.' },
    ],
    picture: {
      title: 'Only three lights, ever',
      caption: 'The traffic light is the enum. Red, amber and green are its only constants, each made exactly once.',
      items: [
        { icon: 'traffic-light', label: 'enum Light', x: 14, y: 30, tone: 'accent' },
        { icon: 'flag', label: 'RED', x: 80, y: 10, size: 0.8, tone: 'danger' },
        { icon: 'flag', label: 'AMBER', x: 80, y: 30, size: 0.8, tone: 'warning' },
        { icon: 'flag', label: 'GREEN', x: 80, y: 50, size: 0.7, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 0, to: 3 },
      ],
    },
  },
};
