import type { MemoryAid } from '@/types/curriculum';

/** "Make it stick" memory aids for the object-oriented programming module, keyed by lesson id. */
export const oopMemory: Record<string, MemoryAid> = {
  'o-classes-objects': {
    oneLiner: 'A class is the blueprint; each `new` builds a separate object from it, with its own data.',
    story:
      'A builder has one blueprint for a house. From that one sheet of paper, the builder can put up many real houses on a street. Every house has the same rooms, but each has its own paint colour and its own family inside. Painting one house does not change the others. In Java, the blueprint is the class, each real house is an object made with `new`, the paint colour is a field, and the street address you write down is a reference: a variable that points to the object, not the object itself.',
    keyPoints: [
      'A class describes fields (data) and methods (actions); an object is one real instance of it.',
      'Each `new` creates a fresh object on the heap and runs a constructor to set it up.',
      'Keep fields `private` and change them only through methods that check the rules.',
    ],
    confusion: {
      mixedUpWith: 'the variable and the object',
      difference: 'A variable only holds a reference, like an address. Copying the variable gives a second address to the same object, not a new object.',
    },
    tryIt: 'Write a `Dog` class with a `name` field and a constructor. Make two dogs with `new`, change the name of one, and print both names to see they are separate.',
    recall: [
      { question: 'What is the difference between a class and an object?', answer: 'A class is the blueprint. An object is one real thing built from it with `new`.' },
      { question: 'What runs when you write `new BankAccount("Ada")`?', answer: 'Java makes space for a new object, then runs the matching constructor to fill in its fields.' },
      { question: 'If `b = a;` and you change `b`\'s field, what happens to `a`?', answer: 'It changes too, because both variables point to the same object.' },
    ],
    picture: {
      title: 'One blueprint, many houses',
      caption: 'The blueprint is the class. Each house built from it is a separate object with its own data.',
      items: [
        { icon: 'blueprint', label: 'class House', x: 14, y: 30, tone: 'accent' },
        { icon: 'house', label: 'object 1', x: 80, y: 10, size: 0.8, tone: 'success' },
        { icon: 'house', label: 'object 2', x: 80, y: 30, size: 0.8, tone: 'success' },
        { icon: 'house', label: 'object 3', x: 80, y: 50, size: 0.7, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 0, to: 2, label: 'new' },
        { from: 0, to: 3 },
      ],
    },
  },
  'o-inheritance': {
    oneLiner: 'A subclass gets everything its parent class has, and can replace parent methods with its own versions.',
    story:
      'A bike shop sells a basic bicycle: two wheels, a bell and brakes. Then it makes an electric bike. Nobody redesigns the wheels or the bell; the e-bike simply starts from the basic bike and adds a battery. It also changes how "pedal" works, because now a motor helps. In Java, the basic bicycle is the parent class, the e-bike is a subclass written with `extends`, the battery is a new field, and the new way to pedal is an overriding method. If you call `pedal()` on a bike that is really an e-bike, the e-bike version runs.',
    keyPoints: [
      '`class EBike extends Bike` means an e-bike is a bike and inherits its fields and methods.',
      'An override replaces a parent method with the same signature; the real object decides which one runs.',
      'A Java class can extend only one class; `super` reaches the parent\'s constructor or methods.',
    ],
    confusion: {
      mixedUpWith: 'overloading',
      difference: 'Overriding replaces a parent method with the same parameters and is chosen at run time. Overloading adds a method with different parameters and is chosen at compile time.',
    },
    tryIt: 'Make `class Animal { String speak() { return "..."; } }` and `class Dog extends Animal` that overrides `speak()`. Run `Animal a = new Dog(); System.out.println(a.speak());` and see which version prints.',
    recall: [
      { question: 'What keyword makes one class inherit from another?', answer: '`extends`, as in `class Dog extends Animal`.' },
      { question: 'With `Animal a = new Dog();`, whose `speak()` runs?', answer: 'Dog\'s, because the real object is a Dog, even though the variable type is Animal.' },
      { question: 'How many classes can a Java class extend?', answer: 'Only one.' },
    ],
    picture: {
      title: 'The e-bike starts from the bike',
      caption: 'The basic bike is the parent class. The e-bike extends it, keeps the wheels and adds a battery.',
      items: [
        { icon: 'gear', label: 'Bike (parent)', x: 14, y: 22, tone: 'neutral' },
        { icon: 'battery', label: 'EBike (child)', x: 74, y: 22, tone: 'primary' },
        { icon: 'check', label: 'new pedal()', x: 74, y: 49, size: 0.7, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'extends' },
        { from: 1, to: 2, dashed: true },
      ],
    },
  },
  'o-inheritance-types': {
    oneLiner: 'A Java class has one parent class but may take on many interfaces, which avoids the diamond problem.',
    story:
      'Think of a family tree. Each person in this tree has exactly one parent listed, and a grandchild inherits through a chain: grandparent, parent, child. Several children can share one parent. But a person can also earn many badges, like "swimmer" and "first aider", without having extra parents. In Java, the parent line is `extends` (single, multilevel and hierarchical inheritance), and the badges are interfaces added with `implements`. Java forbids two parent classes because both could pass down different state for the same thing; interfaces carry no instance state, so many are allowed.',
    keyPoints: [
      'Single, multilevel and hierarchical inheritance all work with classes.',
      'Multiple inheritance of classes is not allowed; a class may implement many interfaces instead.',
      'If two interfaces give the same default method, the class must override it and choose.',
    ],
    confusion: {
      mixedUpWith: 'multilevel inheritance',
      difference: 'Multilevel is a chain, one parent at each step, which Java allows. Multiple means two direct parent classes at once, which Java forbids.',
    },
    tryIt: 'Write `class A {}`, `class B {}` and try `class C extends A, B {}`. Read the compile error. Then turn A and B into interfaces and write `class C implements A, B {}` instead.',
    recall: [
      { question: 'Why can a Java class not extend two classes?', answer: 'Two parents could pass down conflicting state and methods (the diamond problem), so Java allows only one parent class.' },
      { question: 'How does a class get "many parents" of type?', answer: 'By implementing several interfaces with `implements A, B`.' },
    ],
    picture: {
      title: 'One parent, many badges',
      caption: 'The family line is `extends`: one parent per class. The badges are interfaces: a class can wear many.',
      items: [
        { icon: 'person', label: 'Grandparent', x: 13, y: 12, size: 0.8, tone: 'neutral' },
        { icon: 'person', label: 'Parent', x: 50, y: 12, size: 0.8, tone: 'neutral' },
        { icon: 'person', label: 'Child class', x: 86, y: 12, size: 0.8, tone: 'primary' },
        { icon: 'medal', label: 'Swimmer', x: 58, y: 44, size: 0.8, tone: 'accent' },
        { icon: 'medal', label: 'FirstAider', x: 87, y: 44, size: 0.8, tone: 'accent' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 3, dashed: true },
        { from: 2, to: 4, dashed: true },
      ],
    },
  },
  'o-polymorphism-types': {
    oneLiner: 'One call, many behaviours: overloading is chosen at compile time, overriding is chosen at run time.',
    story:
      'A TV remote has one "power" button. Point it at a TV, a speaker or a light, and each device turns on in its own way. The button does not need to know which device it is talking to. In Java, the button is a method call like `device.powerOn()`, the variable type is "any device", and each device class has its own override. The JVM looks at the real object while the program runs and picks its version. That is runtime polymorphism. Overloading is different: the remote has several buttons with the same name but different shapes, and the compiler picks one before the program runs.',
    keyPoints: [
      'Overloading: same name, different parameters; the compiler picks from the declared argument types.',
      'Overriding: a subclass replaces a method; the JVM picks from the real object at run time.',
      'Static methods, private methods and fields are not overridden; they follow the declared type.',
    ],
    confusion: {
      mixedUpWith: 'overloading and overriding',
      difference: 'Overloading is picked by the compiler from the argument types. Overriding is picked while running from the actual object\'s class.',
    },
    tryIt: 'Add `print(int x)` and `print(Object x)` to a class. Call `print(5)` and `print((Object) 5)` and see which version runs each time. Explain why from the declared types.',
    recall: [
      { question: 'When is an overloaded method chosen?', answer: 'At compile time, from the declared types of the arguments.' },
      { question: 'When is an overridden method chosen?', answer: 'At run time, from the class of the actual object.' },
      { question: 'Can a static method be overridden?', answer: 'No. A same-signature static method in a subclass only hides the parent\'s.' },
    ],
    picture: {
      title: 'One button, many devices',
      caption: 'The same call `powerOn()` reaches different objects, and each one responds in its own way.',
      items: [
        { icon: 'phone', label: 'powerOn()', x: 14, y: 30, tone: 'primary' },
        { icon: 'laptop', label: 'TV', x: 82, y: 10, size: 0.8, tone: 'success' },
        { icon: 'bulb', label: 'Light', x: 82, y: 30, size: 0.8, tone: 'success' },
        { icon: 'server', label: 'Speaker', x: 82, y: 50, size: 0.7, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 0, to: 2, label: 'same call' },
        { from: 0, to: 3 },
      ],
    },
  },
  'o-interfaces': {
    oneLiner: 'An interface is a promise of what a type can do; classes keep the promise in their own way.',
    story:
      'Every wall plug in a country follows one standard shape. A lamp, a phone charger and a kettle all fit, even though they do very different things inside. The wall does not care what is plugged in, only that it has the right shape. In Java, the plug standard is an interface, like `interface Shape { double area(); }`. Each device is a class that says `implements Shape` and writes its own `area()`. Your code depends on the standard, so you can swap one device for another without rewiring the wall. A sealed interface is a standard with a fixed list of approved devices.',
    keyPoints: [
      'An interface lists methods a class must provide; a class can implement many interfaces.',
      'Interfaces can have `default`, `static` and `private` methods, but no instance fields.',
      'A `sealed` interface (Java 17) names exactly which types may implement it.',
    ],
    confusion: {
      mixedUpWith: 'an abstract class',
      difference: 'An abstract class can hold instance fields and constructors, and a class extends only one. An interface has no per-object state, and a class can implement many.',
    },
    tryIt: 'Write `interface Shape { double area(); }` and two classes, `Circle` and `Square`, that implement it. Put both in a `List<Shape>` and print every area in one loop.',
    recall: [
      { question: 'How many interfaces can one class implement?', answer: 'As many as it needs, separated by commas after `implements`.' },
      { question: 'Can an interface have instance fields?', answer: 'No. Its fields are always `public static final` constants.' },
    ],
    picture: {
      title: 'One socket, many plugs',
      caption: 'The socket is the interface. Each plugged-in device is a class that implements it in its own way.',
      items: [
        { icon: 'plug', label: 'interface Shape', x: 50, y: 12, tone: 'accent' },
        { icon: 'bulb', label: 'Circle', x: 14, y: 44, size: 0.8, tone: 'success' },
        { icon: 'phone', label: 'Square', x: 50, y: 44, size: 0.8, tone: 'success' },
        { icon: 'battery', label: 'Triangle', x: 86, y: 44, size: 0.8, tone: 'success' },
      ],
      arrows: [
        { from: 1, to: 0, dashed: true },
        { from: 2, to: 0, dashed: true },
        { from: 3, to: 0, dashed: true },
      ],
    },
  },
  'o-object-contracts': {
    oneLiner: 'If two objects are `equals`, they must have the same `hashCode`, or hash collections lose them.',
    story:
      'A post office sorts letters into numbered pigeonholes using the postcode. To find a letter, a worker first goes to the right pigeonhole, then reads the names on the letters in it. In Java, the pigeonhole number is `hashCode()` and reading the name is `equals()`. A `HashSet` or `HashMap` works the same way. If two equal letters had different postcodes, they would land in different holes and the worker would never find the match. And if you change a letter\'s postcode after it is filed, it is stuck in the wrong hole. `toString()` is the label on the envelope that people read.',
    keyPoints: [
      'Override `equals` and `hashCode` together, using the same fields.',
      'Do not change fields used in `hashCode` while the object is a key in a hash collection.',
      'A record (Java 16) writes `equals`, `hashCode` and `toString` for you from its components.',
    ],
    confusion: {
      mixedUpWith: '`==` and `equals`',
      difference: '`==` on objects asks "is this the very same object?". `equals` asks "do these two objects mean the same value?".',
    },
    tryIt: 'Make `record Point(int x, int y) {}`, add `new Point(1, 2)` to a `HashSet`, then ask `contains(new Point(1, 2))`. Repeat with a plain class without `equals` and `hashCode` and compare.',
    recall: [
      { question: 'What must be true of two objects that are `equals`?', answer: 'They must return the same `hashCode`.' },
      { question: 'What does a `HashSet` check first, `hashCode` or `equals`?', answer: '`hashCode` first to find the bucket, then `equals` to compare inside it.' },
      { question: 'What three methods does a record generate?', answer: '`equals`, `hashCode` and `toString`, based on all its components.' },
    ],
    picture: {
      title: 'Pigeonhole first, then the name',
      caption: 'The postcode picks the pigeonhole (`hashCode`). Then the worker reads the name to find the exact match (`equals`).',
      items: [
        { icon: 'envelope', label: 'object', x: 13, y: 22, tone: 'primary' },
        { icon: 'mailbox', label: 'hashCode bucket', x: 50, y: 22, tone: 'accent' },
        { icon: 'magnifier', label: 'equals check', x: 87, y: 22, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
      ],
    },
  },
  'o-solid': {
    oneLiner: 'SOLID is five rules for classes that are easy to change: small jobs, swappable parts, depend on abstractions.',
    story:
      'Picture a well-run garage. Each mechanic has one job: one fixes tyres, one fixes brakes (Single responsibility). To offer a new service, the owner hires a new specialist instead of rebuilding the garage (Open/closed). Any qualified mechanic can cover a shift without surprises (Liskov substitution). Each mechanic carries only the tools for their own job, not one giant toolbox (Interface segregation). And the manager asks for "a brake mechanic", not for one named person, so anyone qualified can be sent (Dependency inversion). In Java, the mechanics are classes, the job titles are interfaces, and the manager is code that receives its helpers through the constructor.',
    keyPoints: [
      'S: one reason to change. O: add new code instead of editing old code.',
      'L: a subtype must work anywhere its parent type is expected, with no surprises.',
      'I and D: prefer small interfaces, and depend on interfaces that get injected, not concrete classes.',
    ],
    confusion: {
      mixedUpWith: 'dependency injection and dependency inversion',
      difference: 'Dependency inversion is the rule: depend on abstractions. Dependency injection is one technique to follow it: pass the implementation in from outside.',
    },
    tryIt: 'Find a class that does `new EmailSender()` inside itself. Change it to take a `Sender` interface in its constructor, then pass in a fake sender that just prints.',
    recall: [
      { question: 'What does the Single Responsibility Principle say?', answer: 'A class should have one reason to change.' },
      { question: 'How do you add a feature under Open/Closed?', answer: 'Add a new implementation of an interface instead of editing an existing switch or class.' },
      { question: 'What does the D in SOLID stand for?', answer: 'Dependency inversion: depend on abstractions, not on concrete details.' },
    ],
    picture: {
      title: 'Ask for the job, not the person',
      caption: 'The manager depends on a job title (an interface). Any qualified mechanic (an implementation) can be plugged in.',
      items: [
        { icon: 'person', label: 'Manager', x: 13, y: 22, tone: 'primary' },
        { icon: 'id-card', label: 'BrakeFixer', x: 50, y: 22, tone: 'accent' },
        { icon: 'wrench', label: 'Mechanic A', x: 87, y: 10, size: 0.8, tone: 'success' },
        { icon: 'wrench', label: 'Mechanic B', x: 87, y: 36, size: 0.8, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'needs' },
        { from: 2, to: 1, dashed: true },
        { from: 3, to: 1, dashed: true },
      ],
    },
  },
};
