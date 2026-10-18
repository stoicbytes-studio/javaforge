import type { CodingChallenge } from '@/types/curriculum';

const BANK_MAIN = `
public class Main {
    public static void main(String[] args) {
        java.util.Scanner in = new java.util.Scanner(System.in);
        Account account = new Account(in.nextLong());
        int n = in.nextInt();
        for (int i = 0; i < n; i++) {
            String op = in.next();
            long amount = in.nextLong();
            String result;
            try {
                if (op.equals("deposit")) account.deposit(amount);
                else account.withdraw(amount);
                result = "OK " + account.balance();
            } catch (IllegalArgumentException | IllegalStateException e) {
                result = "ERROR " + e.getMessage();
            }
            System.out.println(result);
        }
    }
}`;

export const oopChallenges: CodingChallenge[] = [
  {
    id: 'ch-bank-commands',
    title: 'Encapsulated account',
    moduleId: 'oop',
    lessonId: 'o-classes-objects',
    difficulty: 'beginner',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['encapsulation', 'invariants', 'exceptions for invalid input'],
    description: `Implement \`Account\` so that its balance can never become invalid.

- Constructor: opening balance; negative → \`IllegalArgumentException("negative opening balance")\`
- \`deposit(amount)\`: amount must be > 0, else \`IllegalArgumentException("amount must be positive")\`
- \`withdraw(amount)\`: amount must be > 0 (same message); if it exceeds the balance throw \`IllegalStateException("insufficient funds")\`
- \`balance()\` returns the current balance

The provided \`main\` reads the opening balance, then n commands like \`deposit 50\`, and prints \`OK <balance>\` or \`ERROR <message>\`.`,
    starterCode: `class Account {
    // TODO: private state

    Account(long opening) {
        // TODO
    }

    void deposit(long amount) {
        // TODO
    }

    void withdraw(long amount) {
        // TODO
    }

    long balance() {
        return 0;
    }
}
${BANK_MAIN}`,
    solution: `class Account {
    private long balance;

    Account(long opening) {
        if (opening < 0) throw new IllegalArgumentException("negative opening balance");
        this.balance = opening;
    }

    void deposit(long amount) {
        requirePositive(amount);
        balance += amount;
    }

    void withdraw(long amount) {
        requirePositive(amount);
        if (amount > balance) throw new IllegalStateException("insufficient funds");
        balance -= amount;
    }

    long balance() {
        return balance;
    }

    private static void requirePositive(long amount) {
        if (amount <= 0) throw new IllegalArgumentException("amount must be positive");
    }
}
${BANK_MAIN}`,
    solutionExplanation:
      'All validation happens before state changes, so a failed operation leaves the balance untouched. IllegalArgumentException signals a bad argument from the caller; IllegalStateException signals that the operation is not allowed in the object\'s current state.',
    complexity: { time: 'O(1) per operation', space: 'O(1)' },
    hints: ['Keep the balance in a private field.', 'Validate first, then mutate.', 'Which exception describes "not allowed right now" rather than "bad argument"?'],
    tests: [
      { id: 't1', name: 'Deposits and withdrawals', stdin: '100\n3\ndeposit 50\nwithdraw 30\nwithdraw 120\n', expectedStdout: 'OK 150\nOK 120\nOK 0' },
      { id: 't2', name: 'Rejected operations keep state', stdin: '10\n3\nwithdraw 11\ndeposit 0\ndeposit 5\n', expectedStdout: 'ERROR insufficient funds\nERROR amount must be positive\nOK 15' },
      { id: 't3', name: 'Negative withdrawal', stdin: '0\n2\nwithdraw -5\ndeposit 1\n', expectedStdout: 'ERROR amount must be positive\nOK 1', hidden: true },
    ],
  },
  {
    id: 'ch-shapes',
    title: 'Polymorphic shapes',
    moduleId: 'oop',
    lessonId: 'o-interfaces',
    difficulty: 'intermediate',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['interfaces', 'polymorphism', 'records', 'formatting'],
    description: `Implement the \`Shape\` interface for \`Circle(r)\`, \`Rect(w, h)\` and \`Triangle(a, b, c)\` (side lengths; use Heron's formula for area).

Input: n, then n lines such as \`circle 1\`, \`rect 2 3\`, \`triangle 3 4 5\`. The provided code prints each shape's name, area and perimeter with two decimals, then the shape with the **largest area** (first one on ties).`,
    starterCode: `import java.util.*;

interface Shape {
    String name();
    double area();
    double perimeter();
}

// TODO: implement Circle, Rect and Triangle (records work well)

public class Main {
    static Shape parse(String[] p) {
        // TODO: build the right shape from the tokens
        throw new UnsupportedOperationException(p[0]);
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = Integer.parseInt(in.nextLine().trim());
        Shape largest = null;
        for (int i = 0; i < n; i++) {
            Shape s = parse(in.nextLine().trim().split("\\\\s+"));
            System.out.println(String.format(Locale.ROOT, "%s area=%.2f perimeter=%.2f", s.name(), s.area(), s.perimeter()));
            if (largest == null || s.area() > largest.area()) largest = s;
        }
        System.out.println("largest: " + largest.name());
    }
}`,
    solution: `import java.util.*;

interface Shape {
    String name();
    double area();
    double perimeter();
}

record Circle(double r) implements Shape {
    public String name() { return "circle"; }
    public double area() { return Math.PI * r * r; }
    public double perimeter() { return 2 * Math.PI * r; }
}

record Rect(double w, double h) implements Shape {
    public String name() { return "rect"; }
    public double area() { return w * h; }
    public double perimeter() { return 2 * (w + h); }
}

record Triangle(double a, double b, double c) implements Shape {
    public String name() { return "triangle"; }
    public double area() {
        double s = perimeter() / 2;
        return Math.sqrt(s * (s - a) * (s - b) * (s - c));
    }
    public double perimeter() { return a + b + c; }
}

public class Main {
    static Shape parse(String[] p) {
        double[] v = new double[p.length - 1];
        for (int i = 1; i < p.length; i++) v[i - 1] = Double.parseDouble(p[i]);
        return switch (p[0]) {
            case "circle" -> new Circle(v[0]);
            case "rect" -> new Rect(v[0], v[1]);
            case "triangle" -> new Triangle(v[0], v[1], v[2]);
            default -> throw new IllegalArgumentException("unknown shape " + p[0]);
        };
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = Integer.parseInt(in.nextLine().trim());
        Shape largest = null;
        for (int i = 0; i < n; i++) {
            Shape s = parse(in.nextLine().trim().split("\\\\s+"));
            System.out.println(String.format(Locale.ROOT, "%s area=%.2f perimeter=%.2f", s.name(), s.area(), s.perimeter()));
            if (largest == null || s.area() > largest.area()) largest = s;
        }
        System.out.println("largest: " + largest.name());
    }
}`,
    solutionExplanation:
      'Each shape owns its own formulas, so main never asks "what type is this?" — it simply calls area() and perimeter() (polymorphism). Records keep the shapes immutable and concise. Heron\'s formula: with s = (a+b+c)/2, area = √(s(s−a)(s−b)(s−c)).',
    complexity: { time: 'O(n)', space: 'O(1) per shape' },
    hints: ['A record can implement an interface.', 'Heron: s is half the perimeter.', 'Use a switch expression on the first token to choose the constructor.'],
    tests: [
      {
        id: 't1',
        name: 'Three shapes',
        stdin: '3\ncircle 1\nrect 2 3\ntriangle 3 4 5\n',
        expectedStdout: 'circle area=3.14 perimeter=6.28\nrect area=6.00 perimeter=10.00\ntriangle area=6.00 perimeter=12.00\nlargest: rect',
      },
      { id: 't2', name: 'Big circle', stdin: '2\nrect 10 10\ncircle 6\n', expectedStdout: 'rect area=100.00 perimeter=40.00\ncircle area=113.10 perimeter=37.70\nlargest: circle' },
      { id: 't3', name: 'Decimal sides', stdin: '1\ntriangle 2.5 2.5 2.5\n', expectedStdout: 'triangle area=2.71 perimeter=7.50\nlargest: triangle', hidden: true },
    ],
  },
  {
    id: 'ch-money-key',
    title: 'Fix the broken Money key',
    moduleId: 'oop',
    lessonId: 'o-object-contracts',
    difficulty: 'intermediate',
    kind: 'debugging',
    dimension: 'debugging',
    concepts: ['equals/hashCode contract', 'HashMap keys', 'overloading vs overriding'],
    description: `A ledger totals transactions per amount-and-currency using \`Money\` as a \`HashMap\` key, but every transaction ends up in its own group. Fix \`Money\` so equal amounts in the same currency are grouped.

Input: n, then n lines \`<cents> <currency>\`. Output: one line per distinct key in first-seen order: \`<cents> <currency> x<count>\`. (Currency codes are case-insensitive: \`usd\` equals \`USD\`; print them upper-case.)`,
    starterCode: `import java.util.*;

class Money {
    final long cents;
    final String currency;

    Money(long cents, String currency) {
        this.cents = cents;
        this.currency = currency;
    }

    public boolean equals(Money other) {
        return other != null && cents == other.cents && currency == other.currency;
    }

    @Override
    public String toString() { return cents + " " + currency; }
}

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        Map<Money, Integer> counts = new LinkedHashMap<>();
        for (int i = 0; i < n; i++) {
            Money m = new Money(in.nextLong(), in.next());
            counts.merge(m, 1, Integer::sum);
        }
        counts.forEach((m, c) -> System.out.println(m + " x" + c));
    }
}`,
    solution: `import java.util.*;

class Money {
    final long cents;
    final String currency;

    Money(long cents, String currency) {
        this.cents = cents;
        this.currency = currency.toUpperCase(Locale.ROOT);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Money other)) return false;
        return cents == other.cents && currency.equals(other.currency);
    }

    @Override
    public int hashCode() {
        return Objects.hash(cents, currency);
    }

    @Override
    public String toString() { return cents + " " + currency; }
}

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        Map<Money, Integer> counts = new LinkedHashMap<>();
        for (int i = 0; i < n; i++) {
            Money m = new Money(in.nextLong(), in.next());
            counts.merge(m, 1, Integer::sum);
        }
        counts.forEach((m, c) -> System.out.println(m + " x" + c));
    }
}`,
    solutionExplanation:
      'Three bugs: (1) equals(Money) overloads instead of overriding equals(Object), so HashMap never calls it; (2) hashCode was not overridden, so equal keys hash to different buckets; (3) strings were compared with ==. Normalising the currency in the constructor (with Locale.ROOT to avoid locale-specific case rules) makes "usd" and "USD" the same key. A record with a compact constructor would also work.',
    complexity: { time: 'O(n) expected', space: 'O(k) for k distinct keys' },
    hints: [
      'Add @Override to equals — what does the compiler say?',
      'Which method does HashMap call first to find a bucket?',
      'How should two String objects with the same characters be compared?',
    ],
    staticChecks: [{ id: 'hash', description: 'Overrides hashCode()', pattern: 'int\\s+hashCode\\s*\\(\\s*\\)', mustMatch: true }],
    tests: [
      { id: 't1', name: 'Duplicates group together', stdin: '4\n500 USD\n500 USD\n250 EUR\n500 USD\n', expectedStdout: '500 USD x3\n250 EUR x1' },
      { id: 't2', name: 'Case-insensitive currency', stdin: '3\n100 usd\n100 USD\n100 Usd\n', expectedStdout: '100 USD x3' },
      { id: 't3', name: 'Same amount, different currency', stdin: '3\n100 USD\n100 GBP\n200 USD\n', expectedStdout: '100 USD x1\n100 GBP x1\n200 USD x1', hidden: true },
    ],
  },
  {
    id: 'boss-library-loans',
    title: 'Boss: library loans',
    moduleId: 'oop',
    difficulty: 'advanced',
    kind: 'boss',
    dimension: 'coding',
    concepts: ['encapsulation', 'polymorphism', 'equals/hashCode', 'collections', 'state rules'],
    description: `Module 3 capstone: model a small library.

Members are \`STUDENT\` (max 2 loans) or \`STAFF\` (max 5 loans). Books are identified by ISBN; each ISBN has a number of copies. Process commands and print one line per command:

- \`member <id> <STUDENT|STAFF>\` → \`member <id> added\`, or \`error duplicate member\`
- \`book <isbn> <copies>\` → \`book <isbn> copies=<total>\` (adds copies if the ISBN exists)
- \`borrow <memberId> <isbn>\` → \`ok <memberId> has <n> loan(s)\`, or one of \`error unknown member\`, \`error unknown book\`, \`error no copies\`, \`error limit reached\`, \`error already borrowed\`
- \`return <memberId> <isbn>\` → \`ok returned\`, or \`error not borrowed\`

Check failures in the order listed. A member may hold only one copy of the same ISBN.`,
    starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = Integer.parseInt(in.nextLine().trim());
        for (int i = 0; i < n; i++) {
            String[] cmd = in.nextLine().trim().split("\\\\s+");
            // TODO: design your classes and handle the command
            System.out.println("TODO");
        }
    }
}`,
    solution: `import java.util.*;

enum MemberType {
    STUDENT(2), STAFF(5);
    final int maxLoans;
    MemberType(int maxLoans) { this.maxLoans = maxLoans; }
}

final class Member {
    private final String id;
    private final MemberType type;
    private final Set<String> loans = new HashSet<>();

    Member(String id, MemberType type) { this.id = id; this.type = type; }

    String id() { return id; }
    int loanCount() { return loans.size(); }
    boolean hasLoan(String isbn) { return loans.contains(isbn); }
    boolean atLimit() { return loans.size() >= type.maxLoans; }
    void addLoan(String isbn) { loans.add(isbn); }
    boolean removeLoan(String isbn) { return loans.remove(isbn); }
}

final class Book {
    private int total;
    private int available;

    void addCopies(int copies) { total += copies; available += copies; }
    int total() { return total; }
    boolean hasAvailable() { return available > 0; }
    void checkOut() { available--; }
    void checkIn() { available++; }
}

final class Library {
    private final Map<String, Member> members = new HashMap<>();
    private final Map<String, Book> books = new HashMap<>();

    String addMember(String id, MemberType type) {
        if (members.containsKey(id)) return "error duplicate member";
        members.put(id, new Member(id, type));
        return "member " + id + " added";
    }

    String addBook(String isbn, int copies) {
        Book book = books.computeIfAbsent(isbn, k -> new Book());
        book.addCopies(copies);
        return "book " + isbn + " copies=" + book.total();
    }

    String borrow(String memberId, String isbn) {
        Member m = members.get(memberId);
        if (m == null) return "error unknown member";
        Book b = books.get(isbn);
        if (b == null) return "error unknown book";
        if (!b.hasAvailable()) return "error no copies";
        if (m.atLimit()) return "error limit reached";
        if (m.hasLoan(isbn)) return "error already borrowed";
        b.checkOut();
        m.addLoan(isbn);
        return "ok " + memberId + " has " + m.loanCount() + " loan(s)";
    }

    String giveBack(String memberId, String isbn) {
        Member m = members.get(memberId);
        if (m == null || !m.removeLoan(isbn)) return "error not borrowed";
        books.get(isbn).checkIn();
        return "ok returned";
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = Integer.parseInt(in.nextLine().trim());
        Library library = new Library();
        for (int i = 0; i < n; i++) {
            String[] c = in.nextLine().trim().split("\\\\s+");
            String out = switch (c[0]) {
                case "member" -> library.addMember(c[1], MemberType.valueOf(c[2]));
                case "book" -> library.addBook(c[1], Integer.parseInt(c[2]));
                case "borrow" -> library.borrow(c[1], c[2]);
                case "return" -> library.giveBack(c[1], c[2]);
                default -> "error unknown command";
            };
            System.out.println(out);
        }
    }
}`,
    solutionExplanation:
      'Each class protects its own rules: Book tracks total vs available copies, Member knows its limit through its MemberType (behaviour attached to the enum constant instead of if/else on strings), and Library orchestrates. All checks run before any mutation, so a rejected borrow never leaves half-updated state. String ISBNs work as map/set keys because String implements equals/hashCode.',
    complexity: { time: 'O(1) expected per command', space: 'O(members + books + loans)' },
    hints: [
      'An enum can carry data: STUDENT(2), STAFF(5).',
      'Separate total copies from available copies.',
      'Validate in the documented order before changing anything.',
    ],
    tests: [
      {
        id: 't1',
        name: 'Basic loans',
        stdin: '6\nmember ann STUDENT\nbook 111 1\nborrow ann 111\nborrow ann 111\nreturn ann 111\nborrow ann 111\n',
        expectedStdout: 'member ann added\nbook 111 copies=1\nok ann has 1 loan(s)\nerror no copies\nok returned\nok ann has 1 loan(s)',
      },
      {
        id: 't2',
        name: 'Limits and errors',
        stdin: '11\nmember s STUDENT\nmember s STAFF\nbook a 2\nbook b 1\nbook c 1\nborrow s a\nborrow s a\nborrow s b\nborrow s c\nborrow x a\nreturn s c\n',
        expectedStdout:
          'member s added\nerror duplicate member\nbook a copies=2\nbook b copies=1\nbook c copies=1\nok s has 1 loan(s)\nerror already borrowed\nok s has 2 loan(s)\nerror limit reached\nerror unknown member\nerror not borrowed',
      },
      {
        id: 't3',
        name: 'Staff limit and adding copies',
        stdin: '9\nmember t STAFF\nbook z 1\nbook z 2\nborrow t z\nborrow t q\nmember u STUDENT\nborrow u z\nborrow u z\nreturn u q\n',
        expectedStdout: 'member t added\nbook z copies=1\nbook z copies=3\nok t has 1 loan(s)\nerror unknown book\nmember u added\nok u has 1 loan(s)\nerror already borrowed\nerror not borrowed',
        hidden: true,
      },
    ],
  },
];
