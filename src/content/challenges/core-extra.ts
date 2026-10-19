import type { CodingChallenge } from '@/types/curriculum';

/**
 * Extra stdin-driven practice for core lessons that had no coding challenge yet:
 * type conversion, inheritance, polymorphism, enums, immutability, BigDecimal,
 * java.time, regex, queues/stacks and sorting.
 */
export const coreExtraChallenges: CodingChallenge[] = [
  {
    id: 'ch-checked-parse',
    title: 'Checked number parsing',
    moduleId: 'fundamentals',
    lessonId: 'f-type-conversion',
    difficulty: 'beginner',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['Long.parseLong', 'narrowing casts', 'Math.addExact', 'overflow detection'],
    description: `Read n, then n lines that are supposed to contain whole numbers. Trim each line, then print:

- \`invalid: <text>\` if it is not an optional \`+\`/\`-\` followed by digits (e.g. \`12.5\`, \`abc\`)
- \`overflow: <text>\` if it is a valid integer but does not fit in a \`long\`
- \`int <v>\` if the value fits in an \`int\`
- \`long <v> (int cast gives <c>)\` if it only fits in a \`long\`, where \`c\` is what \`(int) v\` silently produces

Finally print \`total <sum>\` of every value that fits in a long, or \`total overflow\` if that sum overflows a \`long\` at any point.`,
    starterCode: `import java.io.*;

public class Main {
    static long total = 0;
    static boolean totalOverflow = false;

    static String classify(String raw) {
        String s = raw.trim();
        // TODO 1: if s is not an optional sign followed by digits, return "invalid: " + s
        //         (hint: s.matches("[+-]?[0-9]+"))
        // TODO 2: parse it as a long. Long.parseLong throws NumberFormatException when the
        //         digits are fine but the value does not fit -> return "overflow: " + s
        // TODO 3: add it to total with Math.addExact; on ArithmeticException set totalOverflow
        // TODO 4: return "int <v>" if it fits in an int,
        //         otherwise "long <v> (int cast gives <(int) v>)"
        try {
            int v = Integer.parseInt(s);
            total += v;
            return "int " + v;
        } catch (NumberFormatException e) {
            return "invalid: " + s;
        }
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < n; i++) System.out.println(classify(in.readLine()));
        System.out.println("total " + (totalOverflow ? "overflow" : String.valueOf(total)));
    }
}`,
    solution: `import java.io.*;

public class Main {
    static long total = 0;
    static boolean totalOverflow = false;

    static String classify(String raw) {
        String s = raw.trim();
        if (!s.matches("[+-]?[0-9]+")) return "invalid: " + s;
        long v;
        try {
            v = Long.parseLong(s);
        } catch (NumberFormatException e) {
            return "overflow: " + s;
        }
        if (!totalOverflow) {
            try {
                total = Math.addExact(total, v);
            } catch (ArithmeticException e) {
                totalOverflow = true;
            }
        }
        if (v >= Integer.MIN_VALUE && v <= Integer.MAX_VALUE) return "int " + v;
        return "long " + v + " (int cast gives " + (int) v + ")";
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < n; i++) System.out.println(classify(in.readLine()));
        System.out.println("total " + (totalOverflow ? "overflow" : String.valueOf(total)));
    }
}`,
    solutionExplanation:
      'A regex check separates "not a number" from "too big": Long.parseLong throws the same NumberFormatException for both, so it cannot tell them apart on its own. Once the text is known to be digits, a NumberFormatException can only mean overflow. Comparing against Integer.MIN_VALUE/MAX_VALUE decides whether the value fits in an int; the (int) cast keeps only the low 32 bits, which is why 3000000000 becomes -1294967296. Plain + on longs wraps around silently; Math.addExact throws ArithmeticException instead, which turns a wrong answer into a detectable error.',
    complexity: { time: 'O(total input length)', space: 'O(1)' },
    hints: [
      'Integer.parseInt("3000000000") throws even though the text is a perfectly good number. Which type can hold it?',
      'Long.parseLong throws NumberFormatException for both "abc" and a 20-digit number. Check the shape of the text first (String.matches) so you know which case you are in.',
      'A long fits in an int when Integer.MIN_VALUE <= v <= Integer.MAX_VALUE. A narrowing cast never throws: it just drops the high bits.',
      'total += v wraps around silently on overflow. Math.addExact(total, v) throws ArithmeticException instead.',
    ],
    tests: [
      {
        id: 't1',
        name: 'int, long and invalid',
        stdin: '4\n42\n-7\n3000000000\nabc\n',
        expectedStdout: 'int 42\nint -7\nlong 3000000000 (int cast gives -1294967296)\ninvalid: abc\ntotal 3000000035',
      },
      {
        id: 't2',
        name: 'Too big for long, decimal, overflowing total',
        stdin: '4\n9223372036854775807\n1\n99999999999999999999\n12.5\n',
        expectedStdout:
          'long 9223372036854775807 (int cast gives -1)\nint 1\noverflow: 99999999999999999999\ninvalid: 12.5\ntotal overflow',
      },
      {
        id: 't3',
        name: 'Boundaries, sign and spaces',
        stdin: '4\n-2147483648\n2147483648\n+15\n  8  \n',
        expectedStdout: 'int -2147483648\nlong 2147483648 (int cast gives -2147483648)\nint 15\nint 8\ntotal 23',
        hidden: true,
      },
    ],
  },
  {
    id: 'ch-vehicle-hierarchy',
    title: 'Vehicle hierarchy with super calls',
    moduleId: 'oop',
    lessonId: 'o-inheritance-types',
    difficulty: 'beginner',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['extends', 'super(...) constructor calls', 'super.method()', 'default method conflicts'],
    description: `Finish a small class hierarchy. \`Vehicle\` stores a name and a wheel count and describes itself as \`<name>: <wheels> wheels\`.

- \`Car\` always has 4 wheels and adds \`, seats 5\` to the parent's description.
- \`Truck\` (already done, use it as a model) takes its wheel count from the input and adds \`, cargo\`.
- \`ElectricCar\` is a \`Car\` that implements both \`Electric\` and \`Insured\`. Both interfaces have a \`default String info()\`, so \`ElectricCar\` must override it and return \`electric+insured\` by calling **both** interface defaults. It adds \` [<info>]\` to the car description.
- \`Bike\` has 2 wheels, implements only \`Insured\` and adds \` [<info>]\`.

Input: n, then n lines: \`car <name>\`, \`truck <name> <wheels>\`, \`ecar <name>\` or \`bike <name>\`. Print each vehicle's \`describe()\`.`,
    starterCode: `import java.util.*;

interface Electric {
    default String info() { return "electric"; }
}

interface Insured {
    default String info() { return "insured"; }
}

abstract class Vehicle {
    private final String name;
    private final int wheels;

    protected Vehicle(String name, int wheels) {
        this.name = name;
        this.wheels = wheels;
    }

    String describe() {
        return name + ": " + wheels + " wheels";
    }
}

class Car extends Vehicle {
    Car(String name) {
        super(name, 0); // TODO: a car always has 4 wheels
    }

    @Override
    String describe() {
        return super.describe(); // TODO: append ", seats 5"
    }
}

// Worked example: pass constructor arguments up with super(...), extend super.describe().
class Truck extends Vehicle {
    Truck(String name, int wheels) {
        super(name, wheels);
    }

    @Override
    String describe() {
        return super.describe() + ", cargo";
    }
}

class ElectricCar extends Car implements Electric, Insured {
    ElectricCar(String name) {
        super(name);
    }

    // Both interfaces supply a default info(), so this class MUST override it.
    @Override
    public String info() {
        return Electric.super.info(); // TODO: return "electric+insured" using both X.super.info() calls
    }

    @Override
    String describe() {
        return super.describe(); // TODO: append " [" + info() + "]"
    }
}

class Bike extends Vehicle implements Insured {
    Bike(String name) {
        super(name, 2);
    }

    @Override
    String describe() {
        return super.describe(); // TODO: append " [" + info() + "]" (info() comes from Insured)
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        for (int i = 0; i < n; i++) {
            String kind = in.next();
            Vehicle v = switch (kind) {
                case "car" -> new Car(in.next());
                case "truck" -> new Truck(in.next(), in.nextInt());
                case "ecar" -> new ElectricCar(in.next());
                case "bike" -> new Bike(in.next());
                default -> throw new IllegalArgumentException(kind);
            };
            System.out.println(v.describe());
        }
    }
}`,
    solutionExplanation:
      'Each constructor passes its fixed or given values up with super(name, wheels): the parent has no no-argument constructor, so the call is mandatory and must be the first statement. Overriding describe() and calling super.describe() reuses the parent text instead of duplicating it, so the format lives in one place. When a class inherits two default methods with the same signature, Java refuses to pick one; the class must override the method, and inside it Electric.super.info() and Insured.super.info() call each specific default. Bike inherits a single default, so no override is needed.',
    solution: `import java.util.*;

interface Electric {
    default String info() { return "electric"; }
}

interface Insured {
    default String info() { return "insured"; }
}

abstract class Vehicle {
    private final String name;
    private final int wheels;

    protected Vehicle(String name, int wheels) {
        this.name = name;
        this.wheels = wheels;
    }

    String describe() {
        return name + ": " + wheels + " wheels";
    }
}

class Car extends Vehicle {
    Car(String name) {
        super(name, 4);
    }

    @Override
    String describe() {
        return super.describe() + ", seats 5";
    }
}

class Truck extends Vehicle {
    Truck(String name, int wheels) {
        super(name, wheels);
    }

    @Override
    String describe() {
        return super.describe() + ", cargo";
    }
}

class ElectricCar extends Car implements Electric, Insured {
    ElectricCar(String name) {
        super(name);
    }

    // Both interfaces supply a default info(): the class must resolve the conflict.
    @Override
    public String info() {
        return Electric.super.info() + "+" + Insured.super.info();
    }

    @Override
    String describe() {
        return super.describe() + " [" + info() + "]";
    }
}

class Bike extends Vehicle implements Insured {
    Bike(String name) {
        super(name, 2);
    }

    @Override
    String describe() {
        return super.describe() + " [" + info() + "]";
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        for (int i = 0; i < n; i++) {
            String kind = in.next();
            Vehicle v = switch (kind) {
                case "car" -> new Car(in.next());
                case "truck" -> new Truck(in.next(), in.nextInt());
                case "ecar" -> new ElectricCar(in.next());
                case "bike" -> new Bike(in.next());
                default -> throw new IllegalArgumentException(kind);
            };
            System.out.println(v.describe());
        }
    }
}`,
    complexity: { time: 'O(n)', space: 'O(1)' },
    hints: [
      'Look at Truck: the constructor forwards values with super(...), and describe() starts from super.describe().',
      'A Car does not get its wheel count from the input, so pass the constant 4 to super.',
      'Interface.super.method() calls one specific interface default. You need it twice in ElectricCar.info().',
      'ElectricCar.describe() can call super.describe() too: that already includes ", seats 5" from Car.',
    ],
    tests: [
      {
        id: 't1',
        name: 'One of each',
        stdin: '4\ncar Civic\ntruck Volvo 18\necar Model3\nbike Brompton\n',
        expectedStdout: 'Civic: 4 wheels, seats 5\nVolvo: 18 wheels, cargo\nModel3: 4 wheels, seats 5 [electric+insured]\nBrompton: 2 wheels [insured]',
      },
      {
        id: 't2',
        name: 'Electric car and car',
        stdin: '2\necar Leaf\ncar Golf\n',
        expectedStdout: 'Leaf: 4 wheels, seats 5 [electric+insured]\nGolf: 4 wheels, seats 5',
      },
      {
        id: 't3',
        name: 'Truck, bike, electric',
        stdin: '3\ntruck Mini 6\nbike Bmx\necar Ioniq\n',
        expectedStdout: 'Mini: 6 wheels, cargo\nBmx: 2 wheels [insured]\nIoniq: 4 wheels, seats 5 [electric+insured]',
        hidden: true,
      },
    ],
  },
  {
    id: 'ch-payroll-dispatch',
    title: 'Polymorphic payroll',
    moduleId: 'oop',
    lessonId: 'o-polymorphism-types',
    difficulty: 'intermediate',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['abstract methods', 'dynamic dispatch', 'overriding with super', 'no instanceof chains'],
    description: `Compute monthly pay for three kinds of employee. All amounts are whole units; integer division rounds down.

- \`salaried <name> <annual>\`: annual / 12
- \`hourly <name> <rate> <hours>\`: rate * hours, plus **half** the rate again for every hour above 160 (time and a half)
- \`commission <name> <annual> <sales> <percent>\`: the salaried pay plus sales * percent / 100. It **is a** salaried employee, so extend \`Salaried\`.

Input: n, then n employees. For each print \`<name> <role> <pay>\` (roles: \`salaried\`, \`hourly\`, \`commission\`), then \`total <sum>\` and \`highest <name>\` (the first employee with the highest pay).

The reporting loop must work only with \`Employee\` references: no \`instanceof\` or \`getClass()\`.`,
    starterCode: `import java.util.*;

abstract class Employee {
    private final String name;

    protected Employee(String name) {
        this.name = name;
    }

    String name() {
        return name;
    }

    abstract String role();

    abstract long monthlyPay();
}

class Salaried extends Employee {
    private final long annual;

    Salaried(String name, long annual) {
        super(name);
        this.annual = annual;
    }

    @Override
    String role() {
        return "salaried";
    }

    @Override
    long monthlyPay() {
        return annual / 12;
    }
}

class Hourly extends Employee {
    private final long rate;
    private final long hours;

    Hourly(String name, long rate, long hours) {
        super(name);
        this.rate = rate;
        this.hours = hours;
    }

    @Override
    String role() {
        return "hourly";
    }

    @Override
    long monthlyPay() {
        // TODO: rate * hours, plus half the rate again for every hour above 160
        return 0;
    }
}

class Commissioned extends Salaried {
    private final long sales;
    private final long percent;

    Commissioned(String name, long annual, long sales, long percent) {
        super(name, annual);
        this.sales = sales;
        this.percent = percent;
    }

    // TODO: override role() to return "commission"
    // TODO: override monthlyPay(): the salaried part (call super.monthlyPay())
    //       plus sales * percent / 100
}

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        List<Employee> staff = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            String type = in.next();
            String name = in.next();
            staff.add(switch (type) {
                case "salaried" -> new Salaried(name, in.nextLong());
                case "hourly" -> new Hourly(name, in.nextLong(), in.nextLong());
                case "commission" -> new Commissioned(name, in.nextLong(), in.nextLong(), in.nextLong());
                default -> throw new IllegalArgumentException(type);
            });
        }

        // From here on the code only knows "Employee": dynamic dispatch picks the right method.
        long total = 0;
        Employee best = null;
        for (Employee e : staff) {
            long pay = e.monthlyPay();
            System.out.println(e.name() + " " + e.role() + " " + pay);
            total += pay;
            if (best == null || pay > best.monthlyPay()) best = e;
        }
        System.out.println("total " + total);
        System.out.println("highest " + best.name());
    }
}`,
    solution: `import java.util.*;

abstract class Employee {
    private final String name;

    protected Employee(String name) {
        this.name = name;
    }

    String name() {
        return name;
    }

    abstract String role();

    abstract long monthlyPay();
}

class Salaried extends Employee {
    private final long annual;

    Salaried(String name, long annual) {
        super(name);
        this.annual = annual;
    }

    @Override
    String role() {
        return "salaried";
    }

    @Override
    long monthlyPay() {
        return annual / 12;
    }
}

class Hourly extends Employee {
    private final long rate;
    private final long hours;

    Hourly(String name, long rate, long hours) {
        super(name);
        this.rate = rate;
        this.hours = hours;
    }

    @Override
    String role() {
        return "hourly";
    }

    @Override
    long monthlyPay() {
        long overtime = Math.max(0, hours - 160);
        return rate * hours + rate * overtime / 2;
    }
}

class Commissioned extends Salaried {
    private final long sales;
    private final long percent;

    Commissioned(String name, long annual, long sales, long percent) {
        super(name, annual);
        this.sales = sales;
        this.percent = percent;
    }

    @Override
    String role() {
        return "commission";
    }

    @Override
    long monthlyPay() {
        return super.monthlyPay() + sales * percent / 100;
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        List<Employee> staff = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            String type = in.next();
            String name = in.next();
            staff.add(switch (type) {
                case "salaried" -> new Salaried(name, in.nextLong());
                case "hourly" -> new Hourly(name, in.nextLong(), in.nextLong());
                case "commission" -> new Commissioned(name, in.nextLong(), in.nextLong(), in.nextLong());
                default -> throw new IllegalArgumentException(type);
            });
        }

        // From here on the code only knows "Employee": dynamic dispatch picks the right method.
        long total = 0;
        Employee best = null;
        for (Employee e : staff) {
            long pay = e.monthlyPay();
            System.out.println(e.name() + " " + e.role() + " " + pay);
            total += pay;
            if (best == null || pay > best.monthlyPay()) best = e;
        }
        System.out.println("total " + total);
        System.out.println("highest " + best.name());
    }
}`,
    solutionExplanation:
      'The loop calls e.monthlyPay() and e.role() on the static type Employee; at run time the JVM picks the override of the actual object (dynamic dispatch), so adding a new employee type means adding a class, not editing the loop. Commissioned extends Salaried and calls super.monthlyPay() for the salaried part, so the annual / 12 rule is written once. Overtime is rate * hours for every hour plus rate / 2 for each hour over 160, which together give time and a half; computing rate * overtime / 2 before dividing keeps odd rates exact up to the final rounding.',
    complexity: { time: 'O(n)', space: 'O(n)' },
    hints: [
      'Salaried is already complete. Hourly and Commissioned follow the same shape: override role() and monthlyPay().',
      'For hourly pay, the overtime hours are Math.max(0, hours - 160). Each of them earns an extra rate / 2 on top of rate * hours.',
      'Inside Commissioned.monthlyPay(), super.monthlyPay() runs Salaried\'s version, so you only add the commission.',
      'If you are tempted to write if (e instanceof Hourly) in main, move that logic into the class instead.',
    ],
    tests: [
      {
        id: 't1',
        name: 'One of each',
        stdin: '3\nsalaried Ann 60000\nhourly Bob 20 170\ncommission Cy 36000 10000 5\n',
        expectedStdout: 'Ann salaried 5000\nBob hourly 3500\nCy commission 3500\ntotal 12000\nhighest Ann',
      },
      {
        id: 't2',
        name: 'Overtime and big commission',
        stdin: '3\nhourly Dee 15 150\nhourly Eve 30 180\ncommission Fay 24000 50000 3\n',
        expectedStdout: 'Dee hourly 2250\nEve hourly 5700\nFay commission 3500\ntotal 11450\nhighest Eve',
      },
      {
        id: 't3',
        name: 'Rounding down',
        stdin: '3\nsalaried Gil 50000\nhourly Hal 25 161\ncommission Ivy 0 1000 7\n',
        expectedStdout: 'Gil salaried 4166\nHal hourly 4037\nIvy commission 70\ntotal 8273\nhighest Gil',
        hidden: true,
      },
    ],
    staticChecks: [
      { id: 's1', description: 'Use dynamic dispatch instead of type checks', pattern: '\\binstanceof\\b|getClass\\(\\)', mustMatch: false },
      { id: 's2', description: 'Commissioned extends Salaried', pattern: 'class\\s+Commissioned\\s+extends\\s+Salaried', mustMatch: true },
    ],
  },
  {
    id: 'ch-order-state-enum',
    title: 'Order state machine with an enum',
    moduleId: 'oop',
    lessonId: 'o-enums',
    difficulty: 'beginner',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['enum methods', 'switch on enums', 'Enum.valueOf', 'EnumSet'],
    description: `An order moves through the states \`NEW\`, \`PAID\`, \`SHIPPED\`, \`DELIVERED\` and \`CANCELLED\`. Allowed transitions:

- \`NEW\` + \`pay\` → \`PAID\`
- \`NEW\` + \`cancel\` → \`CANCELLED\`
- \`PAID\` + \`ship\` → \`SHIPPED\`
- \`PAID\` + \`cancel\` → \`CANCELLED\`
- \`SHIPPED\` + \`deliver\` → \`DELIVERED\`

\`DELIVERED\` and \`CANCELLED\` are terminal. Implement \`OrderState.on(Event)\` (return the next state or \`null\`) and \`isTerminal()\`. The provided \`main\` reads n events (case-insensitive) starting from \`NEW\` and prints \`<event> -> <STATE>\`, \`<event> rejected in <STATE>\` or \`unknown event <word>\`, then the final state and the states visited (an \`EnumSet\`, which prints in declaration order).`,
    starterCode: `import java.util.*;

enum Event { PAY, SHIP, DELIVER, CANCEL }

enum OrderState {
    NEW, PAID, SHIPPED, DELIVERED, CANCELLED;

    /** Returns the next state, or null when the event is not allowed in this state. */
    OrderState on(Event e) {
        // TODO: switch on \`this\`, then on \`e\`:
        //   NEW:     PAY -> PAID, CANCEL -> CANCELLED
        //   PAID:    SHIP -> SHIPPED, CANCEL -> CANCELLED
        //   SHIPPED: DELIVER -> DELIVERED
        //   anything else -> null (rejected)
        return null;
    }

    boolean isTerminal() {
        return false; // TODO: DELIVERED and CANCELLED are terminal
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        OrderState state = OrderState.NEW;
        Set<OrderState> visited = EnumSet.of(state);
        for (int i = 0; i < n; i++) {
            String word = in.next();
            Event event;
            try {
                event = Event.valueOf(word.toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException ex) {
                System.out.println("unknown event " + word);
                continue;
            }
            String label = event.name().toLowerCase(Locale.ROOT);
            OrderState next = state.on(event);
            if (next == null) {
                System.out.println(label + " rejected in " + state);
            } else {
                state = next;
                visited.add(state);
                System.out.println(label + " -> " + state);
            }
        }
        System.out.println("final " + state + " terminal=" + state.isTerminal());
        System.out.println("visited " + visited);
    }
}`,
    solution: `import java.util.*;

enum Event { PAY, SHIP, DELIVER, CANCEL }

enum OrderState {
    NEW, PAID, SHIPPED, DELIVERED, CANCELLED;

    /** Returns the next state, or null when the event is not allowed in this state. */
    OrderState on(Event e) {
        return switch (this) {
            case NEW -> switch (e) {
                case PAY -> PAID;
                case CANCEL -> CANCELLED;
                default -> null;
            };
            case PAID -> switch (e) {
                case SHIP -> SHIPPED;
                case CANCEL -> CANCELLED;
                default -> null;
            };
            case SHIPPED -> e == Event.DELIVER ? DELIVERED : null;
            case DELIVERED, CANCELLED -> null;
        };
    }

    boolean isTerminal() {
        return this == DELIVERED || this == CANCELLED;
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        OrderState state = OrderState.NEW;
        Set<OrderState> visited = EnumSet.of(state);
        for (int i = 0; i < n; i++) {
            String word = in.next();
            Event event;
            try {
                event = Event.valueOf(word.toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException ex) {
                System.out.println("unknown event " + word);
                continue;
            }
            String label = event.name().toLowerCase(Locale.ROOT);
            OrderState next = state.on(event);
            if (next == null) {
                System.out.println(label + " rejected in " + state);
            } else {
                state = next;
                visited.add(state);
                System.out.println(label + " -> " + state);
            }
        }
        System.out.println("final " + state + " terminal=" + state.isTerminal());
        System.out.println("visited " + visited);
    }
}`,
    solutionExplanation:
      'Putting the transition table inside the enum keeps the rules next to the states they describe, and the outer switch over this is exhaustive: if someone adds a new state, the switch expression stops compiling until it is handled. Event.valueOf turns text into a constant and throws IllegalArgumentException for unknown names, which main reports instead of crashing. EnumSet is a bit-vector set that iterates in declaration order, so the visited list is deterministic and cheap.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    hints: [
      'Inside an enum method, `this` is the current constant, so switch (this) { case NEW -> ... } works.',
      'A switch expression can return another switch expression: case NEW -> switch (e) { case PAY -> PAID; ... default -> null; };',
      'Terminal means no event is accepted any more: which two constants are those?',
    ],
    tests: [
      {
        id: 't1',
        name: 'Happy path',
        stdin: '4\npay ship deliver cancel\n',
        expectedStdout:
          'pay -> PAID\nship -> SHIPPED\ndeliver -> DELIVERED\ncancel rejected in DELIVERED\nfinal DELIVERED terminal=true\nvisited [NEW, PAID, SHIPPED, DELIVERED]',
      },
      {
        id: 't2',
        name: 'Rejected, unknown and cancelled',
        stdin: '4\nship PAY refund cancel\n',
        expectedStdout:
          'ship rejected in NEW\npay -> PAID\nunknown event refund\ncancel -> CANCELLED\nfinal CANCELLED terminal=true\nvisited [NEW, PAID, CANCELLED]',
      },
      {
        id: 't3',
        name: 'Stuck in PAID',
        stdin: '2\npay deliver\n',
        expectedStdout: 'pay -> PAID\ndeliver rejected in PAID\nfinal PAID terminal=false\nvisited [NEW, PAID]',
        hidden: true,
      },
    ],
  },
  {
    id: 'ch-immutable-team',
    title: 'Immutable team with defensive copies',
    moduleId: 'oop',
    lessonId: 'o-immutability',
    difficulty: 'intermediate',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['final class', 'defensive copies', 'List.copyOf', 'array clone', 'wither methods'],
    description: `Make \`Team\` truly immutable. It holds a name, a list of member names and an \`int[]\` of ratings (one per member).

The test driver builds a team from its **own** list and array, then tries to change the team behind its back:

- \`source-add <name>\` / \`source-rate <i> <v>\`: change the list/array that was passed to the constructor
- \`view-add <name>\`: add to the list returned by \`members()\`; prints \`view-add rejected\` if that throws \`UnsupportedOperationException\`, otherwise \`view-add accepted\`
- \`view-rate <i> <v>\`: write into the array returned by \`ratings()\`
- \`with <name> <rating>\`: prints \`with <new team>\`, built by \`team.with(...)\`, a **new** team with one more member
- \`print\`: prints the team as \`<name> [members] [ratings]\`

None of these may change the original team. Input: team name, k, k pairs \`<member> <rating>\`, then n and n commands.`,
    starterCode: `import java.util.*;

final class Team {
    private final String name;
    private final List<String> members;
    private final int[] ratings;

    Team(String name, List<String> members, int[] ratings) {
        if (members.size() != ratings.length) throw new IllegalArgumentException("one rating per member");
        this.name = name;
        this.members = members; // TODO: copy the list (List.copyOf) so the caller cannot change it later
        this.ratings = ratings; // TODO: copy the array (clone)
    }

    String name() {
        return name;
    }

    List<String> members() {
        return members; // TODO: make sure callers cannot add to the team's list through this
    }

    int[] ratings() {
        return ratings; // TODO: return a copy
    }

    Team with(String member, int rating) {
        // TODO: build a NEW list and a NEW (longer) array, then return new Team(...).
        //       \`this\` must not change.
        return this;
    }

    @Override
    public String toString() {
        return name + " " + members + " " + Arrays.toString(ratings);
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        String name = in.next();
        int k = in.nextInt();
        List<String> source = new ArrayList<>();
        int[] sourceRatings = new int[k];
        for (int i = 0; i < k; i++) {
            source.add(in.next());
            sourceRatings[i] = in.nextInt();
        }
        Team team = new Team(name, source, sourceRatings);

        int n = in.nextInt();
        for (int c = 0; c < n; c++) {
            String cmd = in.next();
            switch (cmd) {
                case "source-add" -> source.add(in.next());
                case "source-rate" -> {
                    int i = in.nextInt();
                    sourceRatings[i] = in.nextInt();
                }
                case "view-add" -> {
                    String who = in.next();
                    try {
                        team.members().add(who);
                        System.out.println("view-add accepted");
                    } catch (UnsupportedOperationException e) {
                        System.out.println("view-add rejected");
                    }
                }
                case "view-rate" -> {
                    int i = in.nextInt();
                    team.ratings()[i] = in.nextInt();
                }
                case "with" -> System.out.println("with " + team.with(in.next(), in.nextInt()));
                case "print" -> System.out.println(team);
                default -> throw new IllegalArgumentException(cmd);
            }
        }
    }
}`,
    solution: `import java.util.*;

final class Team {
    private final String name;
    private final List<String> members;
    private final int[] ratings;

    Team(String name, List<String> members, int[] ratings) {
        if (members.size() != ratings.length) throw new IllegalArgumentException("one rating per member");
        this.name = name;
        this.members = List.copyOf(members); // copy in: later changes to the caller's list cannot leak in
        this.ratings = ratings.clone();      // arrays are always mutable, so copy them too
    }

    String name() {
        return name;
    }

    List<String> members() {
        return members; // already unmodifiable, safe to share
    }

    int[] ratings() {
        return ratings.clone(); // copy out: callers get their own array
    }

    Team with(String member, int rating) {
        List<String> m = new ArrayList<>(members);
        m.add(member);
        int[] r = Arrays.copyOf(ratings, ratings.length + 1);
        r[ratings.length] = rating;
        return new Team(name, m, r);
    }

    @Override
    public String toString() {
        return name + " " + members + " " + Arrays.toString(ratings);
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        String name = in.next();
        int k = in.nextInt();
        List<String> source = new ArrayList<>();
        int[] sourceRatings = new int[k];
        for (int i = 0; i < k; i++) {
            source.add(in.next());
            sourceRatings[i] = in.nextInt();
        }
        Team team = new Team(name, source, sourceRatings);

        int n = in.nextInt();
        for (int c = 0; c < n; c++) {
            String cmd = in.next();
            switch (cmd) {
                case "source-add" -> source.add(in.next());
                case "source-rate" -> {
                    int i = in.nextInt();
                    sourceRatings[i] = in.nextInt();
                }
                case "view-add" -> {
                    String who = in.next();
                    try {
                        team.members().add(who);
                        System.out.println("view-add accepted");
                    } catch (UnsupportedOperationException e) {
                        System.out.println("view-add rejected");
                    }
                }
                case "view-rate" -> {
                    int i = in.nextInt();
                    team.ratings()[i] = in.nextInt();
                }
                case "with" -> System.out.println("with " + team.with(in.next(), in.nextInt()));
                case "print" -> System.out.println(team);
                default -> throw new IllegalArgumentException(cmd);
            }
        }
    }
}`,
    solutionExplanation:
      'final fields only stop reassignment; the objects they point to can still change. Copying on the way in (List.copyOf, clone) means the caller\'s list and array are no longer connected to the team. Copying on the way out (or returning an unmodifiable list) means callers cannot reach the internal state either. List.copyOf returns an unmodifiable list, so members() can return it directly and add() throws UnsupportedOperationException; arrays have no read-only view, so ratings() must return a fresh clone every time. with() builds new state and calls the constructor instead of modifying this, which is how immutable types such as String and LocalDate "change". A record with a compact constructor could do the copying too, but records use the array\'s identity in equals, which is why a class is used here.',
    complexity: { time: 'O(k) per copy', space: 'O(k)', notes: 'Copies are the price of safety; share the unmodifiable list instead of copying it again.' },
    hints: [
      'Run the first test with the starter: why does "eve" show up in the team when only the source list was changed?',
      'Copy in the constructor: List.copyOf(members) and ratings.clone().',
      'List.copyOf already returns an unmodifiable list, so members() can return it as is. An array has no read-only view, so return a clone.',
      'with() should start from new ArrayList<>(members) and Arrays.copyOf(ratings, ratings.length + 1), then call new Team(...).',
    ],
    tests: [
      {
        id: 't1',
        name: 'Changing the source does not leak',
        stdin: 'Core 2 ann 5 bob 4\n4\nsource-add eve\nsource-rate 0 1\nview-add zed\nprint\n',
        expectedStdout: 'view-add rejected\nCore [ann, bob] [5, 4]',
      },
      {
        id: 't2',
        name: 'with() returns a new team',
        stdin: 'Core 1 ann 5\n4\nwith bob 3\nview-rate 0 9\nprint\nwith cy 2\n',
        expectedStdout: 'with Core [ann, bob] [5, 3]\nCore [ann] [5]\nwith Core [ann, cy] [5, 2]',
      },
      {
        id: 't3',
        name: 'Everything at once',
        stdin: 'Ops 2 kim 3 lee 4\n5\nview-rate 1 0\nsource-rate 1 0\nwith max 5\nview-add zed\nprint\n',
        expectedStdout: 'with Ops [kim, lee, max] [3, 4, 5]\nview-add rejected\nOps [kim, lee] [3, 4]',
        hidden: true,
      },
    ],
  },
  {
    id: 'ch-bill-split',
    title: 'Split a bill with BigDecimal',
    moduleId: 'types',
    lessonId: 't-numbers-math',
    difficulty: 'intermediate',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['BigDecimal', 'RoundingMode.HALF_EVEN', 'setScale', 'cent-exact splitting'],
    description: `Read t bills. Each line is \`<amount> <taxPercent> <people>\`, e.g. \`100.00 8.25 3\`.

- tax = amount * taxPercent / 100, rounded to 2 decimals with **banker's rounding** (\`HALF_EVEN\`)
- total = amount + tax, with 2 decimals
- split total into \`people\` shares that add up to the total **exactly**: everyone pays the total divided by people rounded down to the cent, and the first \`remainder\` people pay one extra cent

Print \`tax <tax> total <total> shares <s1> <s2> ...\` with every amount shown with 2 decimals. Do not use \`double\` anywhere.`,
    starterCode: `import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

public class Main {
    static final BigDecimal HUNDRED = new BigDecimal("100");

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int t = in.nextInt();
        for (int c = 0; c < t; c++) {
            BigDecimal amount = new BigDecimal(in.next()); // from the String: exact
            BigDecimal ratePercent = new BigDecimal(in.next());
            int people = in.nextInt();

            // TODO 1: tax = amount * ratePercent / 100, rounded to 2 decimals with RoundingMode.HALF_EVEN
            BigDecimal tax = BigDecimal.ZERO;
            // TODO 2: total = amount + tax, with exactly 2 decimals
            BigDecimal total = amount.add(tax);

            StringBuilder line = new StringBuilder();
            line.append("tax ").append(tax.toPlainString())
                .append(" total ").append(total.toPlainString())
                .append(" shares");
            // TODO 3: the shares must add up to the total exactly. Work in whole cents:
            //         everyone pays total/people (rounded down) and the first (cents % people)
            //         people pay one extra cent.
            BigDecimal share = total.divide(BigDecimal.valueOf(people), 2, RoundingMode.HALF_EVEN);
            for (int p = 0; p < people; p++) {
                line.append(' ').append(share.toPlainString());
            }
            System.out.println(line);
        }
    }
}`,
    solution: `import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

public class Main {
    static final BigDecimal HUNDRED = new BigDecimal("100");

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int t = in.nextInt();
        for (int c = 0; c < t; c++) {
            BigDecimal amount = new BigDecimal(in.next()); // from the String: exact
            BigDecimal ratePercent = new BigDecimal(in.next());
            int people = in.nextInt();

            BigDecimal tax = amount.multiply(ratePercent).divide(HUNDRED).setScale(2, RoundingMode.HALF_EVEN);
            BigDecimal total = amount.add(tax).setScale(2, RoundingMode.HALF_EVEN);

            // Split in whole cents; the first \`extra\` people pay one cent more.
            long cents = total.movePointRight(2).longValueExact();
            long base = cents / people;
            long extra = cents % people;

            StringBuilder line = new StringBuilder();
            line.append("tax ").append(tax.toPlainString())
                .append(" total ").append(total.toPlainString())
                .append(" shares");
            for (int p = 0; p < people; p++) {
                long share = base + (p < extra ? 1 : 0);
                line.append(' ').append(BigDecimal.valueOf(share, 2).toPlainString());
            }
            System.out.println(line);
        }
    }
}`,
    solutionExplanation:
      'Constructing BigDecimal from the input String keeps the exact decimal value (new BigDecimal(0.1) would capture the binary approximation). Multiplying by the rate and dividing by 100 is exact, and setScale(2, HALF_EVEN) rounds once at the end. HALF_EVEN rounds a tie to the even neighbour (0.005 -> 0.00, 0.015 -> 0.02, 0.025 -> 0.02), so over many transactions ties go up and down equally often; HALF_UP would always round them up and bias totals. Rounding each share separately cannot guarantee the shares add up to the total (108.25 / 3 = 36.08 three times is 108.24), so the split is done in whole cents with / and %, handing the leftover cents to the first people.',
    complexity: { time: 'O(people) per bill', space: 'O(people)' },
    hints: [
      'amount.multiply(ratePercent).divide(HUNDRED) is exact here; round once with setScale(2, RoundingMode.HALF_EVEN).',
      'A plain amount like 10.00 + a tax of 0 still needs setScale(2) so it prints as 10.00.',
      'Run test 1 with the starter: 36.08 * 3 is 108.24, not 108.25. Where did the cent go?',
      'total.movePointRight(2).longValueExact() gives the total in cents; BigDecimal.valueOf(cents, 2) turns cents back into an amount.',
    ],
    tests: [
      {
        id: 't1',
        name: 'Uneven split',
        stdin: '2\n100.00 8.25 3\n10.00 0 4\n',
        expectedStdout: 'tax 8.25 total 108.25 shares 36.09 36.08 36.08\ntax 0.00 total 10.00 shares 2.50 2.50 2.50 2.50',
      },
      {
        id: 't2',
        name: 'Ties round to even',
        stdin: '3\n0.50 1 1\n1.50 1 1\n2.50 1 2\n',
        expectedStdout: 'tax 0.00 total 0.50 shares 0.50\ntax 0.02 total 1.52 shares 1.52\ntax 0.02 total 2.52 shares 1.26 1.26',
      },
      {
        id: 't3',
        name: 'Small amounts and several leftover cents',
        stdin: '2\n0.10 7.5 3\n19.99 6.5 4\n',
        expectedStdout: 'tax 0.01 total 0.11 shares 0.04 0.04 0.03\ntax 1.30 total 21.29 shares 5.33 5.32 5.32 5.32',
        hidden: true,
      },
    ],
    staticChecks: [
      { id: 's1', description: 'No double arithmetic for money', pattern: '\\bdouble\\b|\\bfloat\\b', mustMatch: false },
      { id: 's2', description: "Use banker's rounding", pattern: 'HALF_EVEN', mustMatch: true },
    ],
  },
  {
    id: 'ch-business-days',
    title: 'Due dates and meeting times',
    moduleId: 'types',
    lessonId: 't-date-time',
    difficulty: 'intermediate',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['LocalDate', 'DayOfWeek', 'ZonedDateTime', 'DST gaps and overlaps'],
    description: `The first line is \`holidays\` followed by zero or more ISO dates. Then t commands:

- \`due <date> <n>\`: the date n **business days** after \`date\` (the start day does not count; Saturdays, Sundays and holidays are skipped). Print \`due <date> <DAY_OF_WEEK>\`.
- \`meet <localDateTime> <fromZone> <toZone>\`: a meeting at that wall-clock time in \`fromZone\`; print the same instant as wall-clock time and offset in \`toZone\`: \`meet <localDateTime> <offset>\`. Use \`LocalDateTime.toString()\` and \`ZoneOffset.toString()\` (UTC prints as \`Z\`).

Wall-clock times that do not exist (spring-forward gap) or occur twice (fall-back overlap) are resolved the way \`LocalDateTime.atZone\` does it.`,
    starterCode: `import java.io.*;
import java.time.*;
import java.util.*;

public class Main {
    static LocalDate addBusinessDays(LocalDate start, int n, Set<LocalDate> holidays) {
        // TODO: step forward one day at a time (the start day itself does not count).
        //       Count a day only if it is not SATURDAY/SUNDAY (d.getDayOfWeek())
        //       and not in holidays. Stop when n days have been counted.
        return start.plusDays(n);
    }

    static String convert(LocalDateTime local, ZoneId from, ZoneId to) {
        ZonedDateTime there = local.atZone(from);
        // TODO: move \`there\` to the target zone while keeping the same instant
        return there.toLocalDateTime() + " " + there.getOffset();
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        String[] first = in.readLine().trim().split("\\\\s+");
        Set<LocalDate> holidays = new HashSet<>();
        for (int i = 1; i < first.length; i++) holidays.add(LocalDate.parse(first[i]));

        int t = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < t; i++) {
            String[] p = in.readLine().trim().split("\\\\s+");
            if (p[0].equals("due")) {
                LocalDate due = addBusinessDays(LocalDate.parse(p[1]), Integer.parseInt(p[2]), holidays);
                System.out.println("due " + due + " " + due.getDayOfWeek());
            } else {
                String result = convert(LocalDateTime.parse(p[1]), ZoneId.of(p[2]), ZoneId.of(p[3]));
                System.out.println("meet " + result);
            }
        }
    }
}`,
    solution: `import java.io.*;
import java.time.*;
import java.util.*;

public class Main {
    static LocalDate addBusinessDays(LocalDate start, int n, Set<LocalDate> holidays) {
        LocalDate d = start;
        int added = 0;
        while (added < n) {
            d = d.plusDays(1);
            DayOfWeek dow = d.getDayOfWeek();
            boolean weekend = dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY;
            if (!weekend && !holidays.contains(d)) added++;
        }
        return d;
    }

    static String convert(LocalDateTime local, ZoneId from, ZoneId to) {
        // atZone resolves gaps (shift forward) and overlaps (earlier offset) for us.
        ZonedDateTime there = local.atZone(from).withZoneSameInstant(to);
        return there.toLocalDateTime() + " " + there.getOffset();
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        String[] first = in.readLine().trim().split("\\\\s+");
        Set<LocalDate> holidays = new HashSet<>();
        for (int i = 1; i < first.length; i++) holidays.add(LocalDate.parse(first[i]));

        int t = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < t; i++) {
            String[] p = in.readLine().trim().split("\\\\s+");
            if (p[0].equals("due")) {
                LocalDate due = addBusinessDays(LocalDate.parse(p[1]), Integer.parseInt(p[2]), holidays);
                System.out.println("due " + due + " " + due.getDayOfWeek());
            } else {
                String result = convert(LocalDateTime.parse(p[1]), ZoneId.of(p[2]), ZoneId.of(p[3]));
                System.out.println("meet " + result);
            }
        }
    }
}`,
    solutionExplanation:
      'LocalDate has no time or zone, which is exactly right for business-day arithmetic: step one day at a time and count only weekdays that are not holidays (a HashSet<LocalDate> works because LocalDate has value equality). For meetings, atZone attaches the source zone to the wall-clock time, and withZoneSameInstant moves to the target zone without changing the instant; withZoneSameLocal would keep 09:00 and silently change the instant. In a spring-forward gap (02:30 on 2024-03-10 in New York does not exist) atZone shifts the time forward by the gap length to 03:30 EDT; in a fall-back overlap (01:30 on 2024-11-03 happens twice) it picks the earlier offset, -04:00.',
    complexity: { time: 'O(n + holidays) per due date', space: 'O(holidays)' },
    hints: [
      'Use a loop: d = d.plusDays(1), then check d.getDayOfWeek() and holidays.contains(d) before counting it.',
      'The start day never counts, even if it is a working day.',
      'local.atZone(from) gives a ZonedDateTime in the source zone. Which method moves it to another zone while keeping the same instant?',
      'Do not compute offsets by hand: New York is -05:00 in winter and -04:00 in summer, and the switch dates differ from Europe.',
    ],
    tests: [
      {
        id: 't1',
        name: 'Holidays and a cross-Atlantic meeting',
        stdin:
          'holidays 2024-12-25 2024-12-26 2025-01-01\n3\ndue 2024-12-20 3\ndue 2024-12-31 1\nmeet 2024-03-10T09:00 America/New_York Europe/London\n',
        expectedStdout: 'due 2024-12-27 FRIDAY\ndue 2025-01-02 THURSDAY\nmeet 2024-03-10T13:00 Z',
      },
      {
        id: 't2',
        name: 'No holidays, DST gap, half-hour offset',
        stdin:
          'holidays\n3\ndue 2024-05-31 5\nmeet 2024-03-10T02:30 America/New_York UTC\nmeet 2024-07-01T09:00 Europe/Berlin Asia/Kolkata\n',
        expectedStdout: 'due 2024-06-07 FRIDAY\nmeet 2024-03-10T07:30 Z\nmeet 2024-07-01T12:30 +05:30',
      },
      {
        id: 't3',
        name: 'Overlap and the date line',
        stdin:
          'holidays 2024-11-11\n3\ndue 2024-11-08 1\nmeet 2024-11-03T01:30 America/New_York UTC\nmeet 2024-11-03T12:00 Australia/Sydney America/Los_Angeles\n',
        expectedStdout: 'due 2024-11-12 TUESDAY\nmeet 2024-11-03T05:30 Z\nmeet 2024-11-02T18:00 -07:00',
        hidden: true,
      },
    ],
  },
  {
    id: 'ch-log-regex',
    title: 'Parse log lines with named groups',
    moduleId: 'types',
    lessonId: 't-regex',
    difficulty: 'intermediate',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['Pattern/Matcher', 'named groups', 'matches vs find', 'escaping metacharacters'],
    description: `Read n log lines. A well-formed line looks exactly like

\`2024-05-01 12:00:02 [ERROR] (auth) User 42 login failed in 120ms\`

that is \`<yyyy-MM-dd> <HH:mm:ss> [<LEVEL>] (<module>) <message>\`, where LEVEL is one of \`DEBUG\`, \`INFO\`, \`WARN\`, \`ERROR\` (upper case), module is one or more lower-case letters and message is non-empty. A message may **end** with \`in <digits>ms\` (the word \`in\` on its own, not the end of e.g. \`login\`).

Print the count per level (always all four, in the order above), then \`malformed <count>\` followed by \`: <line numbers>\` (1-based, comma-separated) when there are any, then \`slowest <module> <ms>ms\` for the largest duration (first one on ties) or \`slowest none\`.

The counting code is provided; write the two patterns.`,
    starterCode: `import java.io.*;
import java.util.*;
import java.util.regex.*;

public class Main {
    // TODO: one pattern for the whole line, with named groups date, time, level, module and message.
    //   Format: yyyy-MM-dd HH:mm:ss [LEVEL] (module) message
    //   Remember: [ ] ( ) are special in regex and need escaping, and in a Java string
    //   every regex backslash is written twice ("\\\\d" for \\d).
    static final Pattern LINE = Pattern.compile("TODO");
    // TODO: matches " in <digits>ms" at the very END of the message, with a named group ms.
    static final Pattern DURATION = Pattern.compile("TODO");

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());

        Map<String, Integer> counts = new LinkedHashMap<>();
        for (String level : List.of("DEBUG", "INFO", "WARN", "ERROR")) counts.put(level, 0);
        List<Integer> malformed = new ArrayList<>();
        String slowestModule = null;
        long slowestMs = -1;

        for (int i = 1; i <= n; i++) {
            String line = in.readLine();
            Matcher m = LINE.matcher(line);
            if (!m.matches()) {
                malformed.add(i);
                continue;
            }
            counts.merge(m.group("level"), 1, Integer::sum);
            Matcher d = DURATION.matcher(m.group("message"));
            if (d.find()) {
                long ms = Long.parseLong(d.group("ms"));
                if (ms > slowestMs) {
                    slowestMs = ms;
                    slowestModule = m.group("module");
                }
            }
        }

        counts.forEach((level, count) -> System.out.println(level + " " + count));
        StringBuilder bad = new StringBuilder("malformed " + malformed.size());
        for (int j = 0; j < malformed.size(); j++) bad.append(j == 0 ? ": " : ", ").append(malformed.get(j));
        System.out.println(bad);
        System.out.println(slowestModule == null ? "slowest none" : "slowest " + slowestModule + " " + slowestMs + "ms");
    }
}`,
    solution: `import java.io.*;
import java.util.*;
import java.util.regex.*;

public class Main {
    static final Pattern LINE = Pattern.compile(
        "(?<date>\\\\d{4}-\\\\d{2}-\\\\d{2}) (?<time>\\\\d{2}:\\\\d{2}:\\\\d{2}) "
            + "\\\\[(?<level>DEBUG|INFO|WARN|ERROR)\\\\] \\\\((?<module>[a-z]+)\\\\) (?<message>.+)");
    static final Pattern DURATION = Pattern.compile("\\\\bin (?<ms>\\\\d{1,9})ms$");

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());

        Map<String, Integer> counts = new LinkedHashMap<>();
        for (String level : List.of("DEBUG", "INFO", "WARN", "ERROR")) counts.put(level, 0);
        List<Integer> malformed = new ArrayList<>();
        String slowestModule = null;
        long slowestMs = -1;

        for (int i = 1; i <= n; i++) {
            String line = in.readLine();
            Matcher m = LINE.matcher(line);
            if (!m.matches()) {
                malformed.add(i);
                continue;
            }
            counts.merge(m.group("level"), 1, Integer::sum);
            Matcher d = DURATION.matcher(m.group("message"));
            if (d.find()) {
                long ms = Long.parseLong(d.group("ms"));
                if (ms > slowestMs) {
                    slowestMs = ms;
                    slowestModule = m.group("module");
                }
            }
        }

        counts.forEach((level, count) -> System.out.println(level + " " + count));
        StringBuilder bad = new StringBuilder("malformed " + malformed.size());
        for (int j = 0; j < malformed.size(); j++) bad.append(j == 0 ? ": " : ", ").append(malformed.get(j));
        System.out.println(bad);
        System.out.println(slowestModule == null ? "slowest none" : "slowest " + slowestModule + " " + slowestMs + "ms");
    }
}`,
    solutionExplanation:
      'Named groups ((?<level>...)) make the extraction code read like the format and survive changes to the pattern, unlike group(3). matches() requires the whole line to fit, so a missing bracket or a one-digit hour is rejected; find() would happily match a fragment. [ ] ( ) are metacharacters and are escaped, and in Java source every regex backslash is doubled. The alternation DEBUG|INFO|WARN|ERROR rejects TRACE and lower-case levels. The duration pattern is anchored with $ so "in 50ms then retried" does not count, and \\b before "in" stops "login 5ms" from matching. Compiling both patterns once into static final fields avoids recompiling on every line.',
    complexity: { time: 'O(total input length)', space: 'O(malformed lines)' },
    hints: [
      'Build the pattern piece by piece: (?<date>\\d{4}-\\d{2}-\\d{2}) then a space, then the time, and so on.',
      'To match a literal [ or ( you need \\[ in the regex, which is "\\\\[" inside a Java string.',
      'Restrict the level with an alternation group: (?<level>DEBUG|INFO|WARN|ERROR).',
      'The duration must be at the end of the message: end your pattern with $. A word boundary \\b keeps "login" from counting as "in".',
    ],
    tests: [
      {
        id: 't1',
        name: 'Mixed lines',
        stdin:
          '5\n2024-05-01 12:00:01 [INFO] (web) GET /home in 35ms\n2024-05-01 12:00:02 [ERROR] (auth) User 42 login failed in 120ms\n2024-05-01 12:00:03 INFO (web) missing brackets\n2024-05-01 12:00:04 [WARN] (db) Pool at 90%\n2024-05-01 12:00:05 [INFO] (web) GET /about in 80ms\n',
        expectedStdout: 'DEBUG 0\nINFO 2\nWARN 1\nERROR 1\nmalformed 1: 3\nslowest auth 120ms',
      },
      {
        id: 't2',
        name: 'Strict level and time format',
        stdin:
          '4\n2024-05-01 09:15:00 [TRACE] (web) too chatty\n2024-05-01 09:15:01 [debug] (web) lower case level\n2024-05-01 09:15:02 [DEBUG] (cache) warmed in 7ms\n2024-05-01 9:15:03 [INFO] (web) hour must have two digits\n',
        expectedStdout: 'DEBUG 1\nINFO 0\nWARN 0\nERROR 0\nmalformed 3: 1, 2, 4\nslowest cache 7ms',
      },
      {
        id: 't3',
        name: 'Duration only at the end, ties',
        stdin:
          '4\n2024-06-01 00:00:00 [INFO] (api) call in 50ms then retried\n2024-06-01 00:00:01 [WARN] (api) retry in 40ms\n2024-06-01 00:00:02 [ERROR] (jobs) batch in 40ms\n2024-06-01 00:00:03 [INFO] (auth) slow login 99ms\n',
        expectedStdout: 'DEBUG 0\nINFO 2\nWARN 1\nERROR 1\nmalformed 0\nslowest api 40ms',
        hidden: true,
      },
      {
        id: 't4',
        name: 'No durations',
        stdin: '2\nhello\n2024-06-01 00:00:00 [INFO] (api) ok\n',
        expectedStdout: 'DEBUG 0\nINFO 1\nWARN 0\nERROR 0\nmalformed 1: 1\nslowest none',
        hidden: true,
      },
    ],
  },
  {
    id: 'ch-task-scheduler',
    title: 'Task scheduler with undo',
    moduleId: 'collections',
    lessonId: 'c-queues-stacks',
    difficulty: 'intermediate',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['PriorityQueue', 'Comparator tie-breaking', 'ArrayDeque as a stack', 'poll/peek'],
    description: `Simulate a task scheduler. Input: n, then n commands:

- \`add <name> <priority>\`: queue a task (higher priority runs first; equal priorities run in the order they were added)
- \`next\`: remove and run the next task: print \`run <name>\`, or \`idle\` if the queue is empty
- \`peek\`: print \`next <name>\` without removing it, or \`idle\`
- \`undo\`: cancel the most recently **added** task that is still waiting and print \`undo <name>\`; tasks that already ran or were already undone are skipped. Print \`nothing to undo\` if there is none.

Finally print \`pending <count>\`.`,
    starterCode: `import java.util.*;

record Task(String name, int priority, long seq) {}

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        // TODO: use a PriorityQueue with a Comparator: highest priority first,
        //       then lower seq first (so equal priorities come out in the order they were added).
        Queue<Task> queue = new ArrayDeque<>();
        Deque<Task> history = new ArrayDeque<>(); // used as a stack: push / pop
        long seq = 0;

        for (int i = 0; i < n; i++) {
            String cmd = in.next();
            switch (cmd) {
                case "add" -> {
                    Task t = new Task(in.next(), in.nextInt(), seq++);
                    queue.offer(t);
                    history.push(t);
                }
                case "next" -> {
                    Task t = queue.poll();
                    System.out.println(t == null ? "idle" : "run " + t.name());
                }
                case "peek" -> {
                    Task t = queue.peek();
                    System.out.println(t == null ? "idle" : "next " + t.name());
                }
                case "undo" -> {
                    // TODO: pop tasks off \`history\` until one can still be removed from the queue
                    //       (queue.remove(t) returns false if it already ran or was undone).
                    //       Print "undo <name>", or "nothing to undo" when the history runs out.
                    System.out.println("nothing to undo");
                }
                default -> throw new IllegalArgumentException(cmd);
            }
        }
        System.out.println("pending " + queue.size());
    }
}`,
    solution: `import java.util.*;

record Task(String name, int priority, long seq) {}

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        // Highest priority first; equal priorities in the order they were added (FIFO).
        Queue<Task> queue = new PriorityQueue<>(
            Comparator.comparingInt(Task::priority).reversed().thenComparingLong(Task::seq));
        Deque<Task> history = new ArrayDeque<>(); // used as a stack: push / pop
        long seq = 0;

        for (int i = 0; i < n; i++) {
            String cmd = in.next();
            switch (cmd) {
                case "add" -> {
                    Task t = new Task(in.next(), in.nextInt(), seq++);
                    queue.offer(t);
                    history.push(t);
                }
                case "next" -> {
                    Task t = queue.poll();
                    System.out.println(t == null ? "idle" : "run " + t.name());
                }
                case "peek" -> {
                    Task t = queue.peek();
                    System.out.println(t == null ? "idle" : "next " + t.name());
                }
                case "undo" -> {
                    String undone = null;
                    while (undone == null && !history.isEmpty()) {
                        Task t = history.pop();
                        if (queue.remove(t)) undone = t.name(); // false if it already ran
                    }
                    System.out.println(undone == null ? "nothing to undo" : "undo " + undone);
                }
                default -> throw new IllegalArgumentException(cmd);
            }
        }
        System.out.println("pending " + queue.size());
    }
}`,
    solutionExplanation:
      'A PriorityQueue is a binary heap: offer and poll are O(log n) and peek is O(1). Heaps are not stable, so equal priorities would come out in an unspecified order; adding a sequence number as the second comparator key makes the order FIFO and deterministic. The undo history is LIFO, so an ArrayDeque used with push/pop is the stack (java.util.Stack is a legacy synchronised Vector). Because a task in the history may already have run, undo pops until queue.remove(t) returns true; remove is O(n) on a heap, which is fine for occasional undo.',
    complexity: { time: 'O(log n) per add/next, O(n) per undo', space: 'O(n)' },
    hints: [
      'ArrayDeque is FIFO only: it ignores priority. Which Queue implementation orders its elements by a Comparator?',
      'Comparator.comparingInt(Task::priority).reversed() puts high priorities first. Add .thenComparingLong(Task::seq) for the tie-break.',
      'history already records every add with push. On undo, pop from it and try queue.remove(t): it returns false when the task is no longer queued.',
    ],
    tests: [
      {
        id: 't1',
        name: 'Priority with FIFO ties',
        stdin: '8\nadd write 2\nadd test 5\nadd deploy 5\npeek\nnext\nnext\nnext\nnext\n',
        expectedStdout: 'next test\nrun test\nrun deploy\nrun write\nidle\npending 0',
      },
      {
        id: 't2',
        name: 'Undo skips tasks that already ran',
        stdin: '7\nadd a 1\nadd b 3\nnext\nundo\nundo\nadd c 2\npeek\n',
        expectedStdout: 'run b\nundo a\nnothing to undo\nnext c\npending 1',
      },
      {
        id: 't3',
        name: 'Negative priorities and ties',
        stdin: '6\nadd x 0\nadd y -1\nadd z 0\nundo\nnext\nnext\n',
        expectedStdout: 'undo z\nrun x\nrun y\npending 0',
        hidden: true,
      },
    ],
  },
  {
    id: 'ch-leaderboard',
    title: 'Leaderboard with a multi-key Comparator',
    moduleId: 'collections',
    lessonId: 'c-sorted',
    difficulty: 'intermediate',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['Comparator chains', 'reversed', 'CASE_INSENSITIVE_ORDER', 'TreeMap.subMap', 'competition ranking'],
    description: `Read n players \`<name> <score> <seconds> <country>\`, then a line \`range <lo> <hi>\`.

1. Rank the players: score **descending**, then seconds **ascending**, then name ignoring case, then name exactly (so \`Zed\` comes before \`zed\`). Players with the same score **and** seconds share a rank and the next rank skips (1, 1, 3). Print \`<rank>. <name> <score> <seconds>s\`.
2. Print \`best per country:\` and, for each country in alphabetical order, \`<country> <best player>\`.
3. Print \`scores in [lo, hi]: <count>\`, the number of players whose score is between lo and hi inclusive.`,
    starterCode: `import java.util.*;

record Player(String name, int score, int seconds, String country) {}

public class Main {
    // TODO: score descending, then seconds ascending, then name ignoring case
    //       (String.CASE_INSENSITIVE_ORDER), then name exactly as a final tie-breaker.
    static final Comparator<Player> RANKING = Comparator.comparingInt(Player::score);

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        List<Player> players = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            players.add(new Player(in.next(), in.nextInt(), in.nextInt(), in.next()));
        }
        in.next(); // "range"
        int lo = in.nextInt();
        int hi = in.nextInt();

        players.sort(RANKING);
        for (int i = 0; i < players.size(); i++) {
            Player p = players.get(i);
            // TODO: players with the same score AND seconds as the previous player share its rank
            int rank = i + 1;
            System.out.println(rank + ". " + p.name() + " " + p.score() + " " + p.seconds() + "s");
        }

        // TODO: countries must print in alphabetical order -> which Map keeps keys sorted?
        Map<String, Player> bestByCountry = new HashMap<>();
        for (Player p : players) bestByCountry.putIfAbsent(p.country(), p);
        System.out.println("best per country:");
        bestByCountry.forEach((country, p) -> System.out.println(country + " " + p.name()));

        // TODO: count players whose score is in [lo, hi] (both inclusive).
        //       Try a TreeMap<score, count> and subMap(lo, true, hi, true).
        int inRange = 0;
        System.out.println("scores in [" + lo + ", " + hi + "]: " + inRange);
    }
}`,
    solution: `import java.util.*;

record Player(String name, int score, int seconds, String country) {}

public class Main {
    static final Comparator<Player> RANKING = Comparator.comparingInt(Player::score).reversed()
        .thenComparingInt(Player::seconds)
        .thenComparing(Player::name, String.CASE_INSENSITIVE_ORDER)
        .thenComparing(Player::name);

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        List<Player> players = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            players.add(new Player(in.next(), in.nextInt(), in.nextInt(), in.next()));
        }
        in.next(); // "range"
        int lo = in.nextInt();
        int hi = in.nextInt();

        players.sort(RANKING);
        int rank = 0;
        for (int i = 0; i < players.size(); i++) {
            Player p = players.get(i);
            Player prev = i == 0 ? null : players.get(i - 1);
            boolean tied = prev != null && prev.score() == p.score() && prev.seconds() == p.seconds();
            if (!tied) rank = i + 1;
            System.out.println(rank + ". " + p.name() + " " + p.score() + " " + p.seconds() + "s");
        }

        Map<String, Player> bestByCountry = new TreeMap<>();
        for (Player p : players) bestByCountry.putIfAbsent(p.country(), p);
        System.out.println("best per country:");
        bestByCountry.forEach((country, p) -> System.out.println(country + " " + p.name()));

        NavigableMap<Integer, Integer> byScore = new TreeMap<>();
        for (Player p : players) byScore.merge(p.score(), 1, Integer::sum);
        int inRange = 0;
        for (int count : byScore.subMap(lo, true, hi, true).values()) inRange += count;
        System.out.println("scores in [" + lo + ", " + hi + "]: " + inRange);
    }
}`,
    solutionExplanation:
      'Comparator.comparingInt(...).reversed().thenComparingInt(...).thenComparing(...) composes the keys in priority order; reversed() applies to everything built so far, so it is called right after the first key. String.CASE_INSENSITIVE_ORDER alone would treat "Zed" and "zed" as equal and leave their order to the input, so a final natural-order key makes the ranking total and deterministic. Competition ranking keeps the previous rank while the ranking keys tie and otherwise jumps to position + 1. Iterating the sorted list with putIfAbsent keeps each country\'s best player, and a TreeMap prints the countries sorted. A TreeMap from score to count answers range questions with subMap(lo, true, hi, true) in O(log n + k).',
    complexity: { time: 'O(n log n)', space: 'O(n)' },
    hints: [
      'Build the comparator one key at a time and check the output after each: comparingInt(Player::score).reversed() first.',
      'thenComparing(Player::name, String.CASE_INSENSITIVE_ORDER) uses a key extractor plus a comparator for that key.',
      'For the rank, compare each player with the previous one in the sorted list: same score and seconds means same rank, otherwise rank = index + 1.',
      'HashMap has no order. TreeMap keeps keys sorted, and its subMap(lo, true, hi, true) view gives you a range.',
    ],
    tests: [
      {
        id: 't1',
        name: 'Ties share a rank',
        stdin: '5\nalice 90 300 NO\nbob 95 320 SE\ncarol 90 280 NO\ndave 90 300 DK\nEve 95 320 SE\nrange 90 94\n',
        expectedStdout:
          '1. bob 95 320s\n1. Eve 95 320s\n3. carol 90 280s\n4. alice 90 300s\n4. dave 90 300s\nbest per country:\nDK dave\nNO carol\nSE bob\nscores in [90, 94]: 3',
      },
      {
        id: 't2',
        name: 'Case-insensitive names',
        stdin: '3\nadam 50 60 US\nBea 50 60 UK\nada 50 60 US\nrange 51 60\n',
        expectedStdout: '1. ada 50 60s\n1. adam 50 60s\n1. Bea 50 60s\nbest per country:\nUK Bea\nUS ada\nscores in [51, 60]: 0',
      },
      {
        id: 't3',
        name: 'Exact-name tie-break',
        stdin: '4\nzed 70 100 FR\nZed 70 100 FR\namy 70 90 FR\nkai 80 200 JP\nrange 70 80\n',
        expectedStdout: '1. kai 80 200s\n2. amy 70 90s\n3. Zed 70 100s\n3. zed 70 100s\nbest per country:\nFR amy\nJP kai\nscores in [70, 80]: 4',
        hidden: true,
      },
    ],
  },
];
