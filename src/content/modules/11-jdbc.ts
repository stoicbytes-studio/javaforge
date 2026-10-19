import type { CurriculumModule } from '@/types/curriculum';

export const jdbcModule: CurriculumModule = {
  id: 'jdbc',
  order: 11,
  title: 'JDBC, SQL Integration and Transactions',
  shortTitle: 'JDBC',
  summary: 'Connections and DataSources, prepared statements and SQL injection, mapping rows, transactions, isolation levels, optimistic locking and connection pooling.',
  level: 'advanced',
  prerequisites: ['exceptions', 'collections'],
  lessons: [
    {
      id: 'j-jdbc',
      moduleId: 'jdbc',
      title: 'JDBC and prepared statements',
      summary: 'Getting connections, running parameterised SQL safely, mapping rows to objects, batching and reading generated keys.',
      estimatedMinutes: 40,
      difficulty: 'intermediate',
      prerequisites: ['e-resources'],
      versionNotes: [
        { feature: 'JDBC 4.0 automatic driver loading (no Class.forName)', since: 6 },
        { feature: 'try-with-resources for Connection, Statement and ResultSet', since: 7 },
        { feature: 'Records as lightweight row types', since: 16 },
      ],
      objectives: [
        'Explain the roles of DriverManager, DataSource, Connection, PreparedStatement and ResultSet.',
        'Write a query and an insert with PreparedStatement and try-with-resources.',
        'Explain why string concatenation enables SQL injection and how bind parameters prevent it.',
        'Map result rows to records, batch inserts and read generated keys.',
      ],
      plainEnglish: `**JDBC** (Java Database Connectivity) is the standard Java API for talking to relational databases. Your code only uses interfaces from \`java.sql\` and \`javax.sql\`; a **driver** JAR supplied by the database vendor (PostgreSQL, MySQL, Oracle, H2...) implements them.

The basic flow is always the same:

1. get a **Connection** (from a \`DataSource\` in real applications),
2. prepare a **PreparedStatement** with \`?\` placeholders,
3. bind values to the placeholders,
4. execute it and walk through the **ResultSet** row by row,
5. close everything — try-with-resources does this for you.

The single most important rule: **never build SQL by gluing user input into a string**. Use placeholders and let the driver send the values separately.`,
      technical: `### Getting a connection
- \`DriverManager.getConnection(url, user, password)\` opens a brand-new physical connection every time. Since JDBC 4.0 (Java 6) drivers on the classpath register themselves through \`ServiceLoader\`, so \`Class.forName("org.postgresql.Driver")\` is no longer needed. Fine for scripts and tests.
- \`javax.sql.DataSource\` is a factory for connections configured outside your code. Production DataSources are **connection pools** (HikariCP is the default in Spring Boot): \`getConnection()\` borrows an already-open connection and \`close()\` returns it to the pool. Code depends on the \`DataSource\` interface, so the pool, URL and credentials can change without touching DAO code.

### Statement types
- \`Statement\`: runs a fixed SQL string. Never use it with user input.
- \`PreparedStatement\`: SQL with \`?\` placeholders, parsed once; values are bound with typed setters (\`setString\`, \`setLong\`, \`setObject\`, \`setNull\`...). **Parameter indexes start at 1.**
- \`CallableStatement\`: stored procedures.

Execute with \`executeQuery()\` (returns a ResultSet), \`executeUpdate()\` (returns the affected row count for INSERT/UPDATE/DELETE) or \`execute()\`.

### Why PreparedStatement prevents SQL injection
With concatenation, the user's text becomes part of the SQL **code**: \`x' OR '1'='1\` closes the string literal and adds a condition. With a placeholder the SQL text is fixed (\`... WHERE name = ?\`) and the value is sent as **data** (with most drivers through the database's extended protocol, or escaped correctly by the driver). It can never change the structure of the statement. Placeholders work only for values — not for table names, column names or keywords like \`ASC\`/\`DESC\`. For those, choose from an allow-list in code.

### ResultSet
A cursor positioned **before** the first row: call \`next()\` until it returns false. Read columns by label (\`rs.getLong("id")\`) or 1-based index. Primitive getters return 0/false for SQL NULL — check \`rs.wasNull()\` or use \`rs.getObject("col", Long.class)\`. Map each row into an immutable record in one small method (a row mapper).

### Resources
Connection, Statement and ResultSet are all \`AutoCloseable\`. Open them in try-with-resources so they close in reverse order on every path. Closing a Statement also closes its ResultSet, but closing explicitly keeps the intent clear. A forgotten close on a pooled connection is a **connection leak**: the pool eventually runs dry and every request waits.

### Batching and generated keys
- \`ps.addBatch()\` per row, then \`ps.executeBatch()\` sends many rows in one round trip — often 10-100x faster than a loop of single inserts. Combine with a transaction for large loads (some drivers need a flag, e.g. MySQL \`rewriteBatchedStatements=true\`, to really send multi-row inserts).
- \`prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)\` then \`getGeneratedKeys()\` returns database-generated ids (identity/serial columns).

### Errors
Almost every JDBC method throws the checked \`SQLException\`. \`getSQLState()\` gives a portable five-character code (e.g. \`23505\` for unique violation in PostgreSQL), \`getErrorCode()\` a vendor code. Translate to domain exceptions at the DAO boundary instead of leaking SQLException everywhere.`,
      whyItExists: `Without a standard API every database would need its own Java library and every application would be locked to one vendor. JDBC fixes the interfaces, lets vendors plug in drivers, and is the foundation under every higher-level tool (Spring JdbcTemplate, jOOQ, MyBatis, JPA/Hibernate). Knowing it explains what those tools do for you — and how to debug them.`,
      whenToUse: [
        'Use PreparedStatement for every statement that contains a value, even ones that do not come from users.',
        'Use a pooled DataSource in any long-running application.',
        'Use plain JDBC (or a thin helper like JdbcTemplate) for reporting queries, bulk loads and performance-critical SQL.',
        'Use batching for inserting or updating many rows.',
      ],
      whenNotToUse: [
        'Do not open a DriverManager connection per request in a server — use a pool.',
        'Do not use Statement with concatenated input, ever.',
        'Do not hand-write hundreds of CRUD DAOs if a mapper or ORM fits the domain; use JDBC where control matters.',
      ],
      examples: [
        {
          id: 'jdbc-injection-demo',
          title: 'SQL injection: concatenation vs placeholders',
          runnable: true,
          code: `import java.util.List;

public class Main {
    // Vulnerable: user input becomes part of the SQL text
    static String concatenated(String name) {
        return "SELECT id, email FROM users WHERE name = '" + name + "'";
    }

    // What a PreparedStatement does: SQL text and values travel separately
    record Prepared(String sql, List<Object> params) {}

    static Prepared prepared(String name) {
        return new Prepared("SELECT id, email FROM users WHERE name = ?", List.of(name));
    }

    public static void main(String[] args) {
        String normal = "alice";
        String attack = "x' OR '1'='1";

        System.out.println(concatenated(normal));
        System.out.println(concatenated(attack));

        Prepared p = prepared(attack);
        System.out.println(p.sql());
        System.out.println("param 1 = [" + p.params().get(0) + "]");
    }
}`,
          expectedOutput: `SELECT id, email FROM users WHERE name = 'alice'
SELECT id, email FROM users WHERE name = 'x' OR '1'='1'
SELECT id, email FROM users WHERE name = ?
param 1 = [x' OR '1'='1]`,
          explanation: 'The second query now matches every row because OR \'1\'=\'1\' is always true. With a placeholder, the attack text is just an odd name that matches nobody.',
        },
        {
          id: 'jdbc-user-dao',
          title: 'A DAO with DataSource, PreparedStatement, row mapping, generated keys and batching',
          runnable: false,
          code: `import javax.sql.DataSource;
import java.sql.*;
import java.util.List;
import java.util.Optional;

record User(long id, String email, String name) {}

public class UserDao {
    private final DataSource dataSource;

    public UserDao(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public Optional<User> findByEmail(String email) throws SQLException {
        String sql = "SELECT id, email, name FROM users WHERE email = ?";
        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(mapRow(rs)) : Optional.empty();
            }
        }
    }

    public long insert(String email, String name) throws SQLException {
        String sql = "INSERT INTO users (email, name) VALUES (?, ?)";
        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, email);
            ps.setString(2, name);
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (!keys.next()) throw new SQLException("no generated key returned");
                return keys.getLong(1);
            }
        }
    }

    public int[] insertAll(List<User> users) throws SQLException {
        String sql = "INSERT INTO users (email, name) VALUES (?, ?)";
        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            for (User u : users) {
                ps.setString(1, u.email());
                ps.setString(2, u.name());
                ps.addBatch();
            }
            return ps.executeBatch();
        }
    }

    private static User mapRow(ResultSet rs) throws SQLException {
        return new User(rs.getLong("id"), rs.getString("email"), rs.getString("name"));
    }
}`,
          explanation: 'Not runnable here: it needs a database and a JDBC driver. The DAO depends only on the DataSource interface, so tests can pass an H2 or Testcontainers DataSource and production a HikariCP pool.',
        },
        {
          id: 'jdbc-drivermanager',
          title: 'DriverManager for a one-off script',
          runnable: false,
          code: `import java.sql.*;

public class Main {
    public static void main(String[] args) throws SQLException {
        String url = "jdbc:postgresql://localhost:5432/shop";
        try (Connection con = DriverManager.getConnection(url, "app", System.getenv("DB_PASSWORD"));
             PreparedStatement ps = con.prepareStatement("SELECT count(*) FROM users WHERE created_at > now() - ?::interval")) {
            ps.setString(1, "7 days");
            try (ResultSet rs = ps.executeQuery()) {
                rs.next();
                System.out.println("new users this week: " + rs.getLong(1));
            }
        }
    }
}`,
          explanation: 'The PostgreSQL driver JAR must be on the classpath; it registers itself automatically. Credentials come from the environment, never from source code.',
        },
      ],
      walkthrough: {
        exampleId: 'jdbc-user-dao',
        steps: [
          { lines: [8, 13], text: 'The DAO receives a DataSource through its constructor. It never knows whether connections come from a pool, H2 or a test container.' },
          { lines: [15, 18], text: 'The SQL text is a constant with a ? placeholder. Connection and PreparedStatement are opened in one try-with-resources header and close in reverse order.' },
          { lines: [19, 22], text: 'setString(1, ...) binds the first placeholder (indexes are 1-based). The ResultSet starts before the first row; next() moves to it and returns false when there is none.' },
          { lines: [26, 38], text: 'RETURN_GENERATED_KEYS asks the driver to return the id the database generated. getGeneratedKeys() is another ResultSet, so it is closed too.' },
          { lines: [40, 51], text: 'addBatch() queues one row of parameters; executeBatch() sends them all in one round trip and returns the update count per row.' },
          { lines: [53, 55], text: 'Row mapping lives in one method that turns the current row into an immutable record, reading columns by label.' },
        ],
      },
      realWorld: {
        title: 'A search box that dumped the customer table',
        scenario: `An internal admin tool built its customer search as \`"SELECT * FROM customers WHERE last_name LIKE '%" + term + "%'"\`. A penetration tester typed \`' UNION SELECT card_number, expiry, null, null FROM payment_cards --\` and the result grid displayed stored card data. The tool had been "internal only", but a reverse proxy had exposed it.

The fix replaced the query with \`WHERE last_name LIKE ?\` and \`ps.setString(1, "%" + term + "%")\` — the wildcard is part of the value, not the SQL. The team added a static-analysis rule (SpotBugs/Find Security Bugs flags SQL built from non-constant strings) and moved the database user to least privilege so the app account could no longer read the cards table at all.`,
      },
      commonMistakes: [
        {
          mistake: 'Building SQL with string concatenation or String.format.',
          why: 'Input becomes SQL code: quotes, comments and UNIONs change the query. Escaping by hand always misses a case.',
          fix: 'Use PreparedStatement placeholders for every value; use an allow-list for identifiers such as sort columns.',
          code: `// Wrong
st.executeQuery("SELECT * FROM users WHERE email = '" + email + "'");
// Right
PreparedStatement ps = con.prepareStatement("SELECT * FROM users WHERE email = ?");
ps.setString(1, email);`,
        },
        {
          mistake: 'Not closing connections on the error path.',
          why: 'With a pool, an unclosed connection is never returned; after maximumPoolSize leaks every request blocks and times out.',
          fix: 'Open Connection, PreparedStatement and ResultSet in try-with-resources.',
        },
        {
          mistake: 'Using parameter index 0 or reading a column before calling next().',
          why: 'Parameters and column indexes are 1-based, and a new ResultSet is positioned before the first row. Both throw SQLException.',
          fix: 'Start at 1 and always guard reads with if (rs.next()) or while (rs.next()).',
        },
        {
          mistake: 'Reading a nullable numeric column with getInt/getLong and trusting the 0.',
          why: 'SQL NULL is returned as 0 by primitive getters, which is indistinguishable from a real zero.',
          fix: 'Use rs.getObject("col", Integer.class) or check rs.wasNull() right after the getter.',
        },
      ],
      checks: [
        {
          id: 'jd1-c1',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'Why does a PreparedStatement with `?` placeholders prevent SQL injection?',
          options: [
            { id: 'a', text: 'It removes all quote characters from the input' },
            { id: 'b', text: 'The SQL text is fixed before values are bound, and values are sent as data that can never change the statement structure' },
            { id: 'c', text: 'It encrypts the query before sending it' },
            { id: 'd', text: 'It only allows SELECT statements' },
          ],
          correctOptionId: 'b',
          explanation: 'The statement is parsed with placeholders; bound values are treated purely as values. Quotes in the value are just characters in a string.',
        },
        {
          id: 'jd1-c2',
          kind: 'predict-output',
          dimension: 'debugging',
          prompt: 'A login query is built by concatenation. What SQL is produced for this username?',
          code: `public class Main {
    public static void main(String[] args) {
        String user = "admin'--";
        String sql = "SELECT * FROM users WHERE name = '" + user + "' AND password = 'x'";
        System.out.println(sql);
    }
}`,
          options: [
            { id: 'a', text: "SELECT * FROM users WHERE name = 'admin''--' AND password = 'x'" },
            { id: 'b', text: "SELECT * FROM users WHERE name = 'admin'--' AND password = 'x'" },
            { id: 'c', text: "SELECT * FROM users WHERE name = 'admin' AND password = 'x'" },
            { id: 'd', text: "SELECT * FROM users WHERE name = ? AND password = ?" },
          ],
          correctOptionId: 'b',
          explanation: 'Concatenation copies the input verbatim. In SQL, -- starts a comment, so the database sees name = \'admin\' and ignores the password check entirely.',
        },
        {
          id: 'jd1-c3',
          kind: 'mcq',
          dimension: 'debugging',
          prompt: 'This code throws `SQLException` at runtime. Why?',
          code: `PreparedStatement ps = con.prepareStatement("SELECT id FROM users WHERE email = ?");
ps.setString(0, email);
ResultSet rs = ps.executeQuery();
long id = rs.getLong("id");`,
          options: [
            { id: 'a', text: 'Only parameter index 0 is wrong' },
            { id: 'b', text: 'Only reading before next() is wrong' },
            { id: 'c', text: 'Both: parameter indexes start at 1, and the ResultSet must be moved to a row with next() before reading' },
            { id: 'd', text: 'getLong cannot read columns by name' },
          ],
          correctOptionId: 'c',
          explanation: 'setString(0, ...) fails first. Even after fixing it, the cursor starts before the first row. The code also leaks resources — use try-with-resources.',
        },
        {
          id: 'jd1-c4',
          kind: 'multi-select',
          dimension: 'coding',
          prompt: 'Which parts of a SQL statement can be supplied with a `?` bind parameter? Select all that apply.',
          options: [
            { id: 'a', text: 'A value compared in a WHERE clause' },
            { id: 'b', text: 'A value in INSERT ... VALUES' },
            { id: 'c', text: 'The table name' },
            { id: 'd', text: 'The column name in ORDER BY' },
            { id: 'e', text: 'Each element of an IN (...) list, with one ? per element' },
          ],
          correctOptionIds: ['a', 'b', 'e'],
          explanation: 'Placeholders stand for values only. Identifiers and keywords must come from a fixed allow-list in code, e.g. a Map from user-facing sort keys to column names.',
        },
        {
          id: 'jd1-c5',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'A service uses a pool of 10 connections. After a burst of failing queries every request hangs and then fails with a "connection is not available, request timed out" error. What is the most likely cause?',
          options: [
            { id: 'a', text: 'The database is out of disk space' },
            { id: 'b', text: 'Connections are not closed when a query throws, so they never return to the pool' },
            { id: 'c', text: 'PreparedStatement caching is disabled' },
            { id: 'd', text: 'The JVM heap is too small' },
          ],
          correctOptionId: 'b',
          explanation: 'Each leaked connection permanently reduces the pool. HikariCP\'s leakDetectionThreshold logs the stack trace of the code that borrowed a connection and kept it too long.',
        },
        {
          id: 'jd1-c6',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'Why do production applications obtain connections from a `DataSource` instead of `DriverManager`?',
          options: [
            { id: 'a', text: 'DriverManager is deprecated and removed in Java 21' },
            { id: 'b', text: 'A DataSource can be a connection pool and keeps URL and credentials in configuration; opening a physical connection per request is slow' },
            { id: 'c', text: 'DataSource connections do not need to be closed' },
            { id: 'd', text: 'Only DataSource supports PreparedStatement' },
          ],
          correctOptionId: 'b',
          explanation: 'DriverManager still exists and works. Opening a TCP connection, authenticating and setting up a session takes milliseconds; a pool reuses connections. Pooled connections must still be closed — close() returns them to the pool.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Write a parameterised query and insert with correct resource handling from memory.',
        'Explain SQL injection with an example and why placeholders prevent it.',
        'Map rows to records, handle NULLs, batch inserts and read generated keys.',
      ],
      relatedLessonIds: ['e-resources', 'e-design', 'j-transactions'],
      revision: [
        { id: 'r1', question: 'What are the five core JDBC types used in a typical query?', answer: 'DataSource (or DriverManager) to get a Connection, PreparedStatement to run parameterised SQL, ResultSet to read rows, and SQLException for errors.' },
        { id: 'r2', question: 'What does closing a pooled connection do?', answer: 'It returns the connection to the pool instead of closing the physical connection.' },
        { id: 'r3', question: 'How do you safely let users choose a sort column?', answer: 'Map allowed user-facing keys to fixed column names in code (an allow-list) and reject anything else; placeholders cannot bind identifiers.' },
        { id: 'r4', question: 'How do you get the id generated by an INSERT?', answer: 'Prepare the statement with Statement.RETURN_GENERATED_KEYS, execute it and read ps.getGeneratedKeys().' },
      ],
    },
    {
      id: 'j-transactions',
      moduleId: 'jdbc',
      title: 'Transactions, isolation and connection pools',
      summary: 'Autocommit, commit and rollback, isolation levels and their anomalies, optimistic locking, HikariCP and the N+1 query problem.',
      estimatedMinutes: 45,
      difficulty: 'advanced',
      prerequisites: ['j-jdbc'],
      objectives: [
        'Group statements into a transaction with commit and rollback on every path.',
        'Describe dirty reads, non-repeatable reads, phantom reads and lost updates and which isolation levels prevent them.',
        'Implement optimistic locking with a version column.',
        'Configure a connection pool sensibly and recognise the N+1 query problem.',
      ],
      plainEnglish: `A **transaction** is a group of database changes that succeed or fail together. Moving money means "subtract here" *and* "add there" — if the second step fails, the first must be undone.

By default a JDBC connection is in **autocommit** mode: every statement is its own transaction. To group statements, switch autocommit off, run them, then **commit** — or **rollback** if anything went wrong.

When many transactions run at the same time they can see each other's half-finished work or overwrite each other's changes. **Isolation levels** decide how much of that is allowed; stronger isolation means fewer surprises but more waiting or retries.`,
      technical: `### ACID and the JDBC API
- \`con.setAutoCommit(false)\` starts transactional mode; \`con.commit()\` makes changes durable and visible; \`con.rollback()\` discards them. \`setSavepoint()\` allows partial rollback.
- Always restore autocommit (or rely on the pool resetting it — HikariCP resets connection state on return) and roll back on **every** failure path, including RuntimeExceptions.
- A transaction belongs to a **connection**: every DAO call in one unit of work must use the same Connection. Frameworks (Spring's \`@Transactional\`) bind it to the current thread for you.

### Anomalies
- **Dirty read**: reading another transaction's uncommitted change, which may later be rolled back.
- **Non-repeatable read**: reading the same row twice in one transaction and getting different values because another transaction committed in between.
- **Phantom read**: re-running a range query and seeing new or vanished rows.
- **Lost update**: two transactions read a value, both compute a new value and write it back; the second write silently overwrites the first.

### Isolation levels (SQL standard)
- \`READ_UNCOMMITTED\`: allows dirty reads (PostgreSQL treats it as READ COMMITTED).
- \`READ_COMMITTED\`: no dirty reads; non-repeatable and phantom reads possible. PostgreSQL, Oracle and SQL Server default.
- \`REPEATABLE_READ\`: no non-repeatable reads; the standard still allows phantoms. MySQL InnoDB default. PostgreSQL implements it as snapshot isolation, which also prevents phantoms and aborts conflicting updates with a serialization error.
- \`SERIALIZABLE\`: behaves as if transactions ran one at a time; conflicting transactions fail and must be **retried**.

Set it with \`con.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED)\`. Check your database's documentation: actual behaviour differs between engines.

### Preventing lost updates
1. Do the arithmetic in SQL: \`UPDATE accounts SET balance = balance - ? WHERE id = ? AND balance >= ?\` — one atomic statement.
2. **Pessimistic locking**: \`SELECT ... FOR UPDATE\` locks the row until commit. Simple, but holds locks and risks deadlocks.
3. **Optimistic locking**: a \`version\` column. Read the row with its version; update with \`... SET ..., version = version + 1 WHERE id = ? AND version = ?\`. An update count of **0** means someone else changed the row — reload and retry, or report a conflict. JPA's \`@Version\` does exactly this.

### Connection pooling
Opening a connection costs a TCP handshake, TLS and authentication. A pool (HikariCP) keeps connections open and lends them out.
- \`maximumPoolSize\`: more is not better — the database has limited cores and disks. HikariCP's guidance starts from roughly \`cores * 2 + effective spindles\` on the database server; many services run well with 10-20. Remember that **instances x pool size** must fit the database's \`max_connections\`.
- \`connectionTimeout\` (default 30 s): how long a caller waits for a free connection. A short value fails fast instead of piling up threads.
- \`maxLifetime\`: retire connections before the database or a firewall drops them.
- \`leakDetectionThreshold\`: logs where a connection was borrowed and not returned.
- Keep transactions **short**: never hold a connection while calling a remote HTTP service.

### The N+1 query problem
Loading a list with 1 query and then 1 more query per element (e.g. each order's customer) makes N+1 round trips. With 500 orders and 1 ms latency that is half a second of pure waiting. Fix it with a JOIN, an \`IN (...)\` query for all ids at once, or batch fetching in an ORM. It is the most common performance bug with JPA lazy loading.`,
      whyItExists: `Databases are shared by many concurrent users, and failures happen halfway through multi-step changes. Transactions give all-or-nothing changes; isolation levels let you trade correctness guarantees against concurrency; pools make the expensive connection setup a one-time cost.`,
      whenToUse: [
        'Use an explicit transaction whenever several statements must succeed or fail together.',
        'Use atomic SQL updates or optimistic locking for read-modify-write of shared rows.',
        'Use SERIALIZABLE (with a retry loop) for complex invariants that span rows.',
        'Use a connection pool in every server application.',
      ],
      whenNotToUse: [
        'Do not hold a transaction open across user think-time or remote calls.',
        'Do not raise isolation to SERIALIZABLE everywhere "to be safe" without handling serialization failures.',
        'Do not size the pool to the number of request threads (e.g. 200); size it to what the database can serve.',
      ],
      examples: [
        {
          id: 'tx-transfer',
          title: 'A money transfer in one transaction',
          runnable: false,
          code: `import javax.sql.DataSource;
import java.sql.*;

public class TransferService {
    private final DataSource dataSource;

    public TransferService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void transfer(long fromId, long toId, long cents) throws SQLException {
        try (Connection con = dataSource.getConnection()) {
            con.setAutoCommit(false);
            con.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED);
            try {
                debit(con, fromId, cents);
                credit(con, toId, cents);
                con.commit();
            } catch (SQLException | RuntimeException e) {
                con.rollback();
                throw e;
            } finally {
                con.setAutoCommit(true);
            }
        }
    }

    private void debit(Connection con, long id, long cents) throws SQLException {
        String sql = "UPDATE accounts SET balance = balance - ? WHERE id = ? AND balance >= ?";
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, cents);
            ps.setLong(2, id);
            ps.setLong(3, cents);
            if (ps.executeUpdate() != 1) throw new SQLException("insufficient funds or no account " + id);
        }
    }

    private void credit(Connection con, long id, long cents) throws SQLException {
        String sql = "UPDATE accounts SET balance = balance + ? WHERE id = ?";
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, cents);
            ps.setLong(2, id);
            if (ps.executeUpdate() != 1) throw new SQLException("no account " + id);
        }
    }
}`,
          explanation: 'Needs a database, so it is not runnable here. In Spring the same logic is a @Transactional method and the framework does the commit/rollback dance.',
        },
        {
          id: 'tx-lost-update',
          title: 'Simulating a lost update and fixing it with a version column',
          runnable: true,
          code: `import java.util.HashMap;
import java.util.Map;

public class Main {
    // In-memory "accounts" table: id -> {balance, version}
    static final Map<Integer, long[]> TABLE = new HashMap<>();

    static long[] select(int id) {                        // SELECT balance, version ...
        long[] row = TABLE.get(id);
        return new long[] {row[0], row[1]};               // a copy, like reading a ResultSet
    }

    static int updateBlind(int id, long balance) {        // UPDATE ... SET balance = ?
        TABLE.get(id)[0] = balance;
        return 1;
    }

    static int updateIfVersion(int id, long balance, long expectedVersion) {
        long[] row = TABLE.get(id);                       // UPDATE ... SET balance = ?, version = version + 1
        if (row[1] != expectedVersion) return 0;          //   WHERE id = ? AND version = ?
        row[0] = balance;
        row[1]++;
        return 1;
    }

    public static void main(String[] args) {
        TABLE.put(1, new long[] {100, 0});
        long[] a = select(1);                             // transaction A reads 100
        long[] b = select(1);                             // transaction B reads 100
        updateBlind(1, a[0] + 50);                        // A deposits 50
        updateBlind(1, b[0] - 30);                        // B withdraws 30, overwriting A
        System.out.println("blind updates: balance = " + TABLE.get(1)[0] + " (expected 120)");

        TABLE.put(1, new long[] {100, 0});
        a = select(1);
        b = select(1);
        System.out.println("A updated rows: " + updateIfVersion(1, a[0] + 50, a[1]));
        int rows = updateIfVersion(1, b[0] - 30, b[1]);
        System.out.println("B updated rows: " + rows + " -> conflict, retry");
        if (rows == 0) {
            b = select(1);                                // re-read the fresh row
            System.out.println("B retry rows: " + updateIfVersion(1, b[0] - 30, b[1]));
        }
        long[] row = TABLE.get(1);
        System.out.println("versioned updates: balance = " + row[0] + ", version = " + row[1]);
    }
}`,
          expectedOutput: `blind updates: balance = 70 (expected 120)
A updated rows: 1
B updated rows: 0 -> conflict, retry
B retry rows: 1
versioned updates: balance = 120, version = 2`,
          explanation: 'The interleaving is written out sequentially so the output is deterministic; in production the two transactions run on different threads or servers.',
        },
        {
          id: 'tx-n-plus-one',
          title: 'Counting queries: N+1 vs one IN query',
          runnable: true,
          code: `import java.util.*;
import java.util.stream.Collectors;

public class Main {
    static int queries = 0;
    static final Map<Integer, String> CUSTOMERS = Map.of(1, "Ada", 2, "Linus", 3, "Grace");
    static final List<int[]> ORDERS = List.of(new int[] {100, 1}, new int[] {101, 2}, new int[] {102, 1}, new int[] {103, 3});

    static List<int[]> findOrders() {                     // SELECT id, customer_id FROM orders
        queries++;
        return ORDERS;
    }

    static String findCustomer(int id) {                  // SELECT name FROM customers WHERE id = ?
        queries++;
        return CUSTOMERS.get(id);
    }

    static Map<Integer, String> findCustomers(Set<Integer> ids) {  // ... WHERE id IN (?, ?, ?)
        queries++;
        Map<Integer, String> result = new TreeMap<>();
        for (int id : ids) result.put(id, CUSTOMERS.get(id));
        return result;
    }

    public static void main(String[] args) {
        for (int[] order : findOrders()) System.out.print(findCustomer(order[1]) + " ");
        System.out.println("-> N+1 queries: " + queries);

        queries = 0;
        List<int[]> orders = findOrders();
        Set<Integer> ids = orders.stream().map(o -> o[1]).collect(Collectors.toCollection(TreeSet::new));
        Map<Integer, String> names = findCustomers(ids);
        for (int[] order : orders) System.out.print(names.get(order[1]) + " ");
        System.out.println("-> batched queries: " + queries);
    }
}`,
          expectedOutput: `Ada Linus Ada Grace -> N+1 queries: 5
Ada Linus Ada Grace -> batched queries: 2`,
          explanation: 'With 4 orders the difference is 5 vs 2 round trips; with 5,000 orders it is 5,001 vs 2. A JOIN would make it a single query.',
        },
        {
          id: 'tx-hikari',
          title: 'Configuring a HikariCP pool',
          runnable: false,
          code: `import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

public final class Database {
    private Database() {}

    public static HikariDataSource createPool() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:postgresql://db:5432/shop");
        config.setUsername("app");
        config.setPassword(System.getenv("DB_PASSWORD"));
        config.setMaximumPoolSize(10);          // what the database can serve, not the thread count
        config.setConnectionTimeout(2_000);     // fail fast when the pool is exhausted (ms)
        config.setMaxLifetime(1_800_000);       // retire connections before the network drops them
        config.setLeakDetectionThreshold(10_000);
        return new HikariDataSource(config);    // close() it on application shutdown
    }
}`,
          explanation: 'Requires the HikariCP and PostgreSQL driver JARs. Spring Boot creates this pool for you from spring.datasource.* and spring.datasource.hikari.* properties.',
        },
      ],
      walkthrough: {
        exampleId: 'tx-transfer',
        steps: [
          { lines: [11, 14], text: 'One connection is borrowed for the whole unit of work. Autocommit is switched off so the two updates form one transaction; the isolation level is set explicitly.' },
          { lines: [15, 18], text: 'Both updates run on the same connection. Only commit() makes them durable and visible to other transactions.' },
          { lines: [19, 21], text: 'Any failure — a SQLException from the driver or a RuntimeException from our own code — rolls back both updates and is rethrown so the caller knows.' },
          { lines: [22, 25], text: 'Autocommit is restored before the connection goes back to the pool, so the next borrower is not surprised.' },
          { lines: [28, 36], text: 'The debit does the arithmetic inside one UPDATE with a guard (balance >= ?). There is no read-modify-write in Java, so no lost update, and an update count other than 1 means the rule was violated.' },
        ],
      },
      realWorld: {
        title: 'Double-booked seats and a pool of 200',
        scenario: `A ticketing service read a seat's status, checked "available" in Java and then wrote "sold". Under load two buyers occasionally got the same seat — a classic lost update under READ COMMITTED. The team added a \`version\` column and changed the write to \`UPDATE seats SET status = 'SOLD', buyer = ?, version = version + 1 WHERE id = ? AND version = ?\`; when the update count was 0 the second buyer saw "seat just taken".

During the same incident review they found the pool configured with \`maximumPoolSize=200\` "to match Tomcat's threads". With 6 instances that was 1,200 connections against a database with 16 cores, and throughput was worse than with 20. Reducing the pool to 15 per instance and setting \`connectionTimeout=3000\` cut p99 latency in half: requests queued briefly in the pool instead of thrashing the database.`,
      },
      commonMistakes: [
        {
          mistake: 'Calling commit() but forgetting rollback() in the catch block.',
          why: 'The connection returns to the pool with an open transaction and its locks; some pools roll back on return, others leave it for the next borrower.',
          fix: 'Use the commit/rollback/finally pattern on every path, or let a framework (@Transactional) manage it.',
        },
        {
          mistake: 'Reading a value, changing it in Java and writing it back without protection.',
          why: 'Concurrent transactions interleave and one write overwrites the other (lost update).',
          fix: 'Do the arithmetic in SQL, lock with SELECT ... FOR UPDATE, or use a version column and check the update count.',
        },
        {
          mistake: 'Using separate connections for statements that should be in one transaction.',
          why: 'A transaction is per connection; work on another connection commits independently.',
          fix: 'Pass the same Connection through the unit of work, or use a framework that binds it to the thread.',
        },
        {
          mistake: 'Calling a slow external API while holding a transaction open.',
          why: 'Row locks and a pooled connection are held for the whole call; under load the pool starves.',
          fix: 'Call remote services before or after the transaction; keep transactions to database work only.',
        },
      ],
      checks: [
        {
          id: 'jd2-c1',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'A fresh JDBC connection executes two UPDATE statements and the second one fails. What happened to the first?',
          options: [
            { id: 'a', text: 'It was rolled back automatically' },
            { id: 'b', text: 'It was already committed, because connections start in autocommit mode' },
            { id: 'c', text: 'It is pending until close() is called' },
            { id: 'd', text: 'It depends on the isolation level' },
          ],
          correctOptionId: 'b',
          explanation: 'Autocommit is true by default: each statement is its own transaction. Call setAutoCommit(false) to group statements.',
        },
        {
          id: 'jd2-c2',
          kind: 'multi-select',
          dimension: 'conceptual',
          prompt: 'Under READ COMMITTED isolation, which anomalies can still occur? Select all that apply.',
          options: [
            { id: 'a', text: 'Dirty reads' },
            { id: 'b', text: 'Non-repeatable reads' },
            { id: 'c', text: 'Phantom reads' },
            { id: 'd', text: 'Lost updates when the application reads, computes in Java and writes back' },
          ],
          correctOptionIds: ['b', 'c', 'd'],
          explanation: 'READ COMMITTED only guarantees you never see uncommitted data. Repeated reads may differ, ranges may gain rows, and read-modify-write in application code can lose updates.',
        },
        {
          id: 'jd2-c3',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'Two "transactions" both read the stock before either writes. What is printed?',
          code: `public class Main {
    static int stock = 10;

    public static void main(String[] args) {
        int readByA = stock;
        int readByB = stock;
        stock = readByA - 3;
        stock = readByB - 2;
        System.out.println("stock = " + stock);
    }
}`,
          options: [
            { id: 'a', text: 'stock = 5' },
            { id: 'b', text: 'stock = 7' },
            { id: 'c', text: 'stock = 8' },
            { id: 'd', text: 'stock = 10' },
          ],
          correctOptionId: 'c',
          explanation: 'B computed from the stale value 10 and overwrote A\'s write: 3 units vanished from the books. This is a lost update; UPDATE ... SET stock = stock - ? avoids it.',
        },
        {
          id: 'jd2-c4',
          kind: 'mcq',
          dimension: 'coding',
          prompt: 'With optimistic locking, `UPDATE products SET price = ?, version = version + 1 WHERE id = ? AND version = ?` returns an update count of 0. What should the code do?',
          options: [
            { id: 'a', text: 'Ignore it; the update will be applied at commit' },
            { id: 'b', text: 'Treat it as a concurrent modification: reload the row and retry, or report a conflict to the user' },
            { id: 'c', text: 'Run the same UPDATE without the version condition' },
            { id: 'd', text: 'Increase the isolation level and run it again unchanged' },
          ],
          correctOptionId: 'b',
          explanation: 'Zero rows means the version no longer matches: someone else committed a change. Blindly overwriting would reintroduce the lost update. JPA throws OptimisticLockException in this situation.',
        },
        {
          id: 'jd2-c5',
          kind: 'mcq',
          dimension: 'debugging',
          prompt: 'A page listing 200 orders with their customer names takes 1.5 s; the SQL log shows one `SELECT ... FROM orders` followed by 200 `SELECT ... FROM customers WHERE id = ?`. What is the problem and fix?',
          options: [
            { id: 'a', text: 'Missing index on orders; add one' },
            { id: 'b', text: 'The N+1 query problem; load customers with a JOIN or one IN (...) query' },
            { id: 'c', text: 'The pool is too small; increase it to 200' },
            { id: 'd', text: 'Isolation level too high; lower it' },
          ],
          correctOptionId: 'b',
          explanation: 'Each query is fast but 201 round trips add up. With JPA, use a fetch join, an entity graph or batch fetching.',
        },
        {
          id: 'jd2-c6',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'Five instances of a service each run a HikariCP pool. The database allows 100 connections. Which setting is most sensible to start with?',
          options: [
            { id: 'a', text: 'maximumPoolSize=200 per instance to match Tomcat threads' },
            { id: 'b', text: 'maximumPoolSize around 10-15 per instance, leaving headroom for admin and migration connections, then measure' },
            { id: 'c', text: 'maximumPoolSize=1 so transactions never conflict' },
            { id: 'd', text: 'No pool; open a connection per request' },
          ],
          correctOptionId: 'b',
          explanation: 'Total connections are instances x pool size and must stay below the database limit. A small pool that keeps the database busy beats a huge one that makes it thrash.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Write a JDBC transaction with commit, rollback and autocommit restore from memory.',
        'Define each anomaly and name the weakest isolation level that prevents it in the SQL standard.',
        'Implement optimistic locking and explain what an update count of 0 means.',
        'Size a connection pool and spot N+1 queries in a SQL log.',
      ],
      relatedLessonIds: ['j-jdbc', 'e-resources', 'c-hashmap'],
      revision: [
        { id: 'r1', question: 'What is the default autocommit mode of a JDBC connection?', answer: 'true: every statement is committed immediately as its own transaction.' },
        { id: 'r2', question: 'Define a lost update.', answer: 'Two transactions read the same value, both compute a new value, and the later write overwrites the earlier one so its change is lost.' },
        { id: 'r3', question: 'How does a version column implement optimistic locking?', answer: 'Updates include WHERE version = <read version> and increment the version; 0 updated rows means another transaction changed the row first, so reload and retry or report a conflict.' },
        { id: 'r4', question: 'What is the N+1 problem?', answer: 'Loading N parent rows with one query and then issuing one more query per row for related data; fix with a JOIN, IN query or batch fetching.' },
      ],
    },
  ],
};
