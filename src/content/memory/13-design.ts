import type { MemoryAid } from '@/types/curriculum';

/** "Make it stick" memory aids for the design principles and patterns module, keyed by lesson id. */
export const designMemory: Record<string, MemoryAid> = {
  'd-solid': {
    oneLiner: 'SOLID code is like a house with standard wall sockets: you can swap the parts without rebuilding the walls.',
    story:
      'A house does not care which toaster you buy. It offers a standard wall socket, and any toaster with the right plug works. If the toaster breaks, you swap it in a minute and no one rewires the kitchen. In Java, the house is your business logic, the socket is an interface the logic owns (for example `CustomerStore`), and the toasters are the classes that plug in: a real database store, a file store, or a fake for tests. Each room in the house has one job, and you add a new room without knocking down old walls.',
    keyPoints: [
      'Single Responsibility: a class should have one reason to change, meaning one group of people who ask for changes.',
      'Open/Closed and Liskov: add behaviour with new classes, and any subtype must keep the promises of its parent.',
      'Interface Segregation and Dependency Inversion: small interfaces, and your logic depends on interfaces it owns, not on concrete details.',
    ],
    confusion: {
      mixedUpWith: 'dependency injection',
      difference: 'Dependency Inversion is a design rule about which way dependencies point. Dependency injection is just one way of handing the real object in from outside, for example through the constructor.',
    },
    tryIt: 'Find a class that calls `new` on a concrete database or HTTP class. Pull out a small interface for what it needs, pass the real class in through the constructor, then write a tiny fake that implements the same interface for a test.',
    recall: [
      { question: 'What does the S in SOLID say?', answer: 'A class should have a single reason to change, meaning it serves one group of people.' },
      { question: 'Why is `Square extends Rectangle` a classic Liskov problem?', answer: 'Setting a square\'s width also changes its height, so code that expects a normal rectangle gets the wrong area.' },
      { question: 'In Dependency Inversion, who owns the interface?', answer: 'The high-level policy code owns it, and the low-level details implement it.' },
    ],
    picture: {
      title: 'Standard sockets, swappable parts',
      caption: 'Your logic (the house) owns the socket (an interface). A real database and a test fake both plug into it, so either can be swapped without rewiring the house.',
      items: [
        { icon: 'house', label: 'Your logic', x: 13, y: 22, tone: 'primary' },
        { icon: 'plug', label: 'Interface', x: 50, y: 22, tone: 'accent' },
        { icon: 'database', label: 'Real database', x: 85, y: 12, size: 0.8, tone: 'success' },
        { icon: 'box', label: 'Test fake', x: 85, y: 44, size: 0.8, tone: 'neutral' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'owns' },
        { from: 2, to: 1 },
        { from: 3, to: 1, dashed: true },
      ],
    },
  },
  'd-patterns': {
    oneLiner: 'A design pattern is a named, tried-and-tested plan for a problem that keeps coming back in code.',
    story:
      'Builders do not invent a new way to make a staircase for every house. They say "a spiral staircase" and everyone on site knows the plan. In Java, a design pattern is that named plan, such as Factory, Adapter or Strategy. The plans come in three families. Some are about how to make things (creational, like a factory that builds objects). Some are about how to join things (structural, like an adapter that lets two pieces fit). Some are about how things talk and share work (behavioural, like a strategy you can swap). The name is the real gift: one word tells the whole team the idea.',
    keyPoints: [
      'A pattern is a named solution to a common design problem, not a piece of library code you import.',
      'The Gang of Four book (1994) groups 23 patterns as creational, structural and behavioural.',
      'Modern Java shrinks many patterns: a Strategy is often just a lambda, and a Singleton is often an `enum`.',
    ],
    confusion: {
      mixedUpWith: 'a framework or library',
      difference: 'A library is code you call. A pattern is an idea you shape your own code around, and it can look different in every program.',
    },
    tryIt: 'Write an interface `Discount` with one method `apply(double price)`. Create two discounts as lambdas, put them in a `Map<String, Discount>`, and pick one by name at runtime. You just wrote the Strategy pattern.',
    recall: [
      { question: 'What are the three families of design patterns?', answer: 'Creational (making objects), structural (joining objects) and behavioural (how objects talk and share work).' },
      { question: 'What does the Strategy pattern often become in modern Java?', answer: 'A lambda passed in through a functional interface.' },
      { question: 'What is the biggest everyday value of patterns?', answer: 'A shared name, so one word explains a whole design idea to the team.' },
    ],
    picture: {
      title: 'Named plans for builders',
      caption: 'One named plan (a pattern) belongs to one of three families: making objects, joining objects, or helping objects talk.',
      items: [
        { icon: 'blueprint', label: 'Named pattern', x: 50, y: 12, size: 0.8, tone: 'accent' },
        { icon: 'factory', label: 'Create', x: 15, y: 44, size: 0.8, tone: 'success' },
        { icon: 'puzzle', label: 'Compose', x: 50, y: 44, size: 0.8, tone: 'success' },
        { icon: 'phone', label: 'Communicate', x: 85, y: 44, size: 0.8, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 0, to: 3 },
      ],
    },
  },
};
