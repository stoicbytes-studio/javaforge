import type { LessonConcepts } from '@/types/curriculum';

/** Concept pages for module 11 (JDBC, SQL Integration and Transactions), keyed by lesson id. */
export const jdbcConcepts: Record<string, LessonConcepts> = {
  'j-jdbc': {
    textbook: {
      definition:
        '**JDBC** (Java Database Connectivity) is the Java SE API in the packages `java.sql` and `javax.sql`. It gives Java programs call-level access to tabular data sources, mainly relational databases, through SQL statements. The API is made up mainly of interfaces, such as `Connection`, `PreparedStatement` and `ResultSet`. A vendor-specific **JDBC driver** supplies their implementations. An application gets a **connection** from a **`DataSource`** or the `DriverManager`, and runs statements within that connection. It processes query results through a **`ResultSet`**, a cursor over the returned rows. A **`PreparedStatement`** holds precompiled SQL. Its parameters are bound separately from the statement text.',
      terms: [
        { term: 'JDBC driver', meaning: 'A vendor library that implements the `java.sql` interfaces for one database product. It translates JDBC calls into that database\'s network protocol.' },
        { term: 'Connection', meaning: 'A session with a specific database. Within it, SQL statements are executed and results are returned. It is also the scope of a transaction.' },
        { term: 'DataSource', meaning: 'A factory for connections that is configured outside the code. It is the preferred alternative to `DriverManager`, and it is commonly backed by a connection pool.' },
        { term: 'PreparedStatement', meaning: 'An object that represents a precompiled SQL statement with `?` parameter markers. Typed setter methods set their values before execution.' },
        { term: 'ResultSet', meaning: 'A table of data produced by a query, read through a cursor that starts before the first row and is advanced by `next()`.' },
      ],
      source: 'JDBC 4.3 Specification (JSR 221); Javadoc for java.sql and javax.sql',
    },
    interviewDefinition:
      '**JDBC** is the standard Java API (`java.sql`, `javax.sql`) for relational databases. Application code is written against interfaces, and a vendor **driver** implements them. A `DataSource` hands out `Connection`s. In production, it is a connection pool. A `PreparedStatement` sends fixed SQL with `?` placeholders and binds values separately, which prevents SQL injection. `executeQuery` returns a `ResultSet` cursor, which you read with `next()`. Connections, statements and result sets are scarce resources, so close them with try-with-resources.',
    interviewFollowUps: [
      {
        question: 'Why does PreparedStatement prevent SQL injection?',
        answer: 'The SQL text is fixed before any user value is seen. Values are sent as typed parameters (or escaped correctly by the driver), so they can never become SQL syntax. Placeholders only work for values. So table names, column names and sort directions must come from an allow-list.',
      },
      {
        question: 'Does a PreparedStatement always create a server-side prepared statement?',
        answer: 'No, it depends on the driver. The PostgreSQL driver switches to a named server-side statement after the same statement has run a few times (`prepareThreshold`, default 5). MySQL Connector/J prepares on the client unless `useServerPrepStmts=true`. Injection safety holds either way.',
      },
      {
        question: 'How do you read a nullable INTEGER column?',
        answer: '`rs.getInt` returns 0 for SQL NULL, and you cannot tell that apart from a real 0. Use `rs.getObject("col", Integer.class)`, which returns null. Or call `rs.wasNull()` right after the primitive getter.',
      },
    ],
    mnemonic: {
      device: '"Good Programmers Bind Every Input Carefully"',
      expansion: [
        { key: 'Get', meaning: 'Get a Connection from the DataSource (borrowed from the pool)' },
        { key: 'Prepare', meaning: 'Prepare fixed SQL with ? placeholders' },
        { key: 'Bind', meaning: 'Bind values with typed setters; indexes start at 1' },
        { key: 'Execute', meaning: 'executeQuery for SELECT, executeUpdate for INSERT/UPDATE/DELETE' },
        { key: 'Iterate', meaning: 'Iterate the ResultSet with next() and map each row to a record' },
        { key: 'Close', meaning: 'Close everything in reverse order with try-with-resources' },
      ],
      visual: 'Picture filling in a paper form: you never rewrite the printed questions, you only write answers in the boxes — and you hand the pen back when you are done.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'A form with boxes versus a handwritten note',
        body: 'Concatenated SQL is a handwritten note the clerk reads and obeys in full — if a customer writes "and also give me every file", the clerk does it. A prepared statement is a printed form: the clerk only ever reads the "name" box as a name, no matter what is written in it.',
      },
      {
        kind: 'insight',
        title: 'A ResultSet is a cursor, not a list',
        body: 'Rows are fetched from the database in chunks as you call `next()`, controlled by `setFetchSize`. Some drivers load the whole result into memory by default: the PostgreSQL driver only streams with a cursor when autocommit is off and a fetch size is set. A "simple" export query can therefore exhaust the heap.',
      },
      {
        kind: 'real-world',
        title: 'The login form that let everyone in',
        body: 'A classic injection: `"... WHERE user = \'" + u + "\' AND pw = \'" + p + "\'"` with the password `\' OR \'1\'=\'1`. The WHERE clause becomes always true and the first account — often an administrator — logs in. Injection has been at or near the top of the OWASP Top 10 for two decades, and bind parameters are the primary defence.',
      },
      {
        kind: 'angle',
        title: 'Every ORM is JDBC underneath',
        body: 'Hibernate/JPA, Spring JdbcTemplate, jOOQ and MyBatis all end in `PreparedStatement.executeQuery`. When an ORM is slow or wrong, turning on SQL logging (or a JDBC proxy that logs statements and timings) and reading the actual JDBC calls is usually the fastest way to the cause — N+1 queries included.',
      },
    ],
    diagrams: [
      {
        id: 'j1-injection',
        kind: 'concept',
        title: 'Same input, two very different queries',
        caption: 'With concatenation, the input becomes SQL code and rewrites the WHERE clause. With a placeholder, the SQL text never changes, and the input is only ever compared as a value.',
        explanation: [
          'Both rows receive the same malicious input, x\' OR \'1\'=\'1, typed into a name field. The only difference is how the query is built.',
          'Top row: **Concatenation** pastes the input into the SQL text. This produces **WHERE name = \'x\' OR \'1\'=\'1\'**, so the input has become SQL code.',
          'Because \'1\'=\'1\' is always true, the database returns **Every row**: a data leak, with no error to warn you.',
          'Bottom row: a **Placeholder** keeps the SQL fixed as **WHERE name = ?** and sends the input separately with `setString`.',
          'The database compares the whole input as one value, finds no customer with that odd name and returns **No rows**. Takeaway: placeholders stop data from ever being parsed as code.',
        ],
        cols: 3,
        rows: 2,
        nodes: [
          { id: 'concat', label: 'Concatenation', detail: '"... name = \'" + input + "\'"', col: 0, row: 0, tone: 'danger' },
          { id: 'sql1', label: 'WHERE name = \'x\' OR \'1\'=\'1\'', detail: 'input became SQL code', col: 1, row: 0, tone: 'warning' },
          { id: 'res1', label: 'Every row', detail: 'data leak', col: 2, row: 0, shape: 'pill', tone: 'danger' },
          { id: 'prep', label: 'Placeholder', detail: '"... name = ?" + setString', col: 0, row: 1, tone: 'success' },
          { id: 'sql2', label: 'WHERE name = ?', detail: 'value sent separately', col: 1, row: 1, tone: 'primary' },
          { id: 'res2', label: 'No rows', detail: 'no such name', col: 2, row: 1, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'concat', to: 'sql1', label: "x' OR '1'='1" },
          { from: 'sql1', to: 'res1' },
          { from: 'prep', to: 'sql2', label: "x' OR '1'='1" },
          { from: 'sql2', to: 'res2' },
        ],
      },
      {
        id: 'j1-arch',
        kind: 'architecture',
        title: 'Who implements what',
        caption: 'Your DAO depends only on java.sql interfaces. The pool and the vendor driver can be swapped through configuration without changing a line of DAO code.',
        explanation: [
          'Your **DAO / repository** code calls `getConnection()` on a **DataSource**. Here it is a HikariCP pool, which lends out connections it already holds open.',
          'The pool hands back a **Connection**, borrowed for this unit of work and returned to the pool when it is closed.',
          'On that connection, `prepareStatement` creates a **PreparedStatement** holding SQL plus bound values. Then `executeQuery` returns a **ResultSet**, a cursor over the rows.',
          'All of these sit in the "java.sql / javax.sql interfaces" group. The classes behind them come from the **Vendor driver**, in the "Implemented by the driver JAR" group.',
          'The driver talks to the **Database** over TCP in its wire protocol, in both directions. Takeaway: you can swap the pool or the driver through configuration without changing DAO code.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'dao', label: 'DAO / repository', detail: 'your code', col: 0, row: 0, tone: 'primary' },
          { id: 'ds', label: 'DataSource', detail: 'HikariCP pool', col: 1, row: 0, tone: 'accent' },
          { id: 'con', label: 'Connection', detail: 'borrowed, then returned', col: 2, row: 0, tone: 'accent' },
          { id: 'ps', label: 'PreparedStatement', detail: 'SQL + bound values', col: 3, row: 0, tone: 'accent' },
          { id: 'rs', label: 'ResultSet', detail: 'cursor over rows', col: 3, row: 1, tone: 'accent' },
          { id: 'drv', label: 'Vendor driver', detail: 'pgjdbc, Connector/J...', col: 1, row: 1, span: 2, tone: 'neutral' },
          { id: 'db', label: 'Database', detail: 'wire protocol over TCP', col: 1, row: 2, span: 2, shape: 'cylinder', tone: 'neutral' },
        ],
        edges: [
          { from: 'dao', to: 'ds', label: 'getConnection()' },
          { from: 'ds', to: 'con' },
          { from: 'con', to: 'ps', label: 'prepareStatement' },
          { from: 'ps', to: 'rs', label: 'executeQuery' },
          { from: 'drv', to: 'db', both: true },
        ],
        groups: [
          { label: 'java.sql / javax.sql interfaces', fromCol: 1, toCol: 3, fromRow: 0, toRow: 0, tone: 'accent' },
          { label: 'Implemented by the driver JAR', fromCol: 1, toCol: 2, fromRow: 1, toRow: 1, tone: 'neutral' },
        ],
      },
      {
        id: 'j1-lifecycle',
        kind: 'flow',
        title: 'One query, start to finish',
        caption: 'try-with-resources closes in reverse order: ResultSet, then statement, then connection. Closing a pooled connection returns it to the pool rather than disconnecting.',
        explanation: [
          '**Borrow connection** from the pool with `dataSource.getConnection()`. This is cheap because the physical database connection already exists.',
          '**Prepare + bind**: create the PreparedStatement and set each placeholder, for example `setLong(1, id)`, so values never touch the SQL text.',
          '**executeQuery()** sends the statement to the database and returns a ResultSet positioned before the first row.',
          '**while (rs.next())** moves the cursor row by row and maps each row to a record. It stops when next() returns false because there are no more rows.',
          'try-with-resources then performs **Close rs, ps, con** in reverse order on every path, including when an exception is thrown.',
          'For a pooled connection, `con.close()` sends it **Back to the pool** rather than disconnecting. Takeaway: always close, because one leaked connection per request soon drains the pool.',
        ],
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'borrow', label: 'Borrow connection', detail: 'dataSource.getConnection()', col: 0, row: 0, tone: 'primary' },
          { id: 'prepare', label: 'Prepare + bind', detail: 'setLong(1, id)', col: 1, row: 0, tone: 'primary' },
          { id: 'exec', label: 'executeQuery()', col: 2, row: 0, tone: 'primary' },
          { id: 'loop', label: 'while (rs.next())', detail: 'map row to record', col: 3, row: 0, tone: 'accent' },
          { id: 'close', label: 'Close rs, ps, con', detail: 'reverse order, every path', col: 2, row: 1, tone: 'warning' },
          { id: 'pool', label: 'Back to the pool', col: 0, row: 1, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'borrow', to: 'prepare' },
          { from: 'prepare', to: 'exec' },
          { from: 'exec', to: 'loop' },
          { from: 'loop', to: 'close', label: 'no more rows' },
          { from: 'close', to: 'pool', label: 'con.close()' },
        ],
      },
    ],
    variants: [
      {
        title: 'Statement types',
        items: [
          { name: 'Statement', summary: 'Runs a complete SQL string. Only for fixed SQL with no values, such as DDL in a migration script.', support: 'supported', note: 'Never with user input: concatenation enables SQL injection.', code: 'try (Statement st = con.createStatement()) { st.execute("CREATE INDEX idx_name ON customer(name)"); }' },
          { name: 'PreparedStatement', summary: 'Fixed SQL with ? placeholders and typed setters. Safe, reusable and batchable — the default choice.', support: 'supported', code: 'PreparedStatement ps = con.prepareStatement("SELECT id, name FROM customer WHERE email = ?");\nps.setString(1, email);' },
          { name: 'CallableStatement', summary: 'Calls a stored procedure with IN, OUT and INOUT parameters using the JDBC escape syntax.', support: 'supported', code: 'CallableStatement cs = con.prepareCall("{call close_month(?, ?)}");\ncs.setInt(1, 2024);\ncs.registerOutParameter(2, Types.INTEGER);' },
        ],
      },
      {
        title: 'ResultSet types and concurrency',
        intro: 'Requested with con.prepareStatement(sql, type, concurrency). Drivers may silently downgrade an unsupported combination and report it through getWarnings().',
        items: [
          { name: 'TYPE_FORWARD_ONLY', summary: 'The default: move forward with next() only. Cheapest, and the only type that can stream large results.', support: 'supported' },
          { name: 'TYPE_SCROLL_INSENSITIVE', summary: 'Move freely (previous, absolute, relative) over a snapshot; changes by others are not visible. Usually means the driver buffers all rows.', support: 'supported' },
          { name: 'TYPE_SCROLL_SENSITIVE', summary: 'Scrollable and reflects changes made by others while open.', support: 'partial', note: 'Many drivers, including PostgreSQL\'s, do not support it and fall back to insensitive.' },
          { name: 'CONCUR_READ_ONLY vs CONCUR_UPDATABLE', summary: 'Updatable result sets let you call updateString(...) and updateRow() on the current row. Rarely used; an explicit UPDATE is clearer.', support: 'partial' },
        ],
      },
      {
        title: 'Execute methods',
        items: [
          { name: 'executeQuery()', summary: 'For SELECT; returns a ResultSet.', support: 'supported' },
          { name: 'executeUpdate() / executeLargeUpdate()', summary: 'For INSERT, UPDATE, DELETE and DDL; returns the affected row count (long for the Large variant, Java 8).', support: 'supported' },
          { name: 'executeBatch()', summary: 'Sends every addBatch() row in one round trip; returns one count per row.', support: 'supported' },
          { name: 'execute()', summary: 'For SQL whose kind is unknown in advance; returns true if the first result is a ResultSet.', support: 'supported' },
        ],
      },
      {
        title: 'JDBC driver types',
        intro: 'The JDBC specification classifies drivers into four types by how they reach the database. Almost every modern driver is Type 4.',
        items: [
          { name: 'Type 1: JDBC-ODBC bridge', summary: 'Translates JDBC calls into ODBC calls, so it needs an ODBC driver installed on every client machine.', support: 'not-supported', note: 'The JDK\'s bridge was removed in Java 8.' },
          { name: 'Type 2: native-API driver', summary: 'Java code that calls the database vendor\'s native client library through JNI; fast, but platform-specific and needs native installs.', support: 'partial', note: 'Example: Oracle OCI driver.' },
          { name: 'Type 3: network-protocol driver', summary: 'Pure Java driver that talks to a middleware server, which in turn translates requests for one or more databases.', support: 'partial', note: 'Rare today.' },
          { name: 'Type 4: thin (pure Java) driver', summary: 'Pure Java driver that speaks the database\'s own wire protocol directly over a socket. No native code; just add the JAR.', support: 'supported', note: 'Examples: PostgreSQL pgjdbc, MySQL Connector/J, Oracle thin driver.' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Client-side versus server-side preparation',
        body: 'Preparing on the server lets the database parse and plan once and reuse the plan, but a plan chosen for one parameter value can be bad for another (PostgreSQL decides between custom and generic plans after several executions; see `plan_cache_mode`). Drivers balance this: pgjdbc uses unnamed statements until `prepareThreshold` executions, MySQL Connector/J emulates preparation by default. Statement caching in the pool or driver matters more for throughput than most application-level tuning.',
        sources: [
          { label: 'PostgreSQL JDBC driver documentation (server-prepared statements)', url: 'https://jdbc.postgresql.org/documentation/' },
          { label: 'PostgreSQL documentation: PREPARE', url: 'https://www.postgresql.org/docs/current/sql-prepare.html' },
        ],
      },
      {
        title: 'SQLState tells you what kind of failure it was',
        body: '`SQLException.getSQLState()` returns a five-character code whose first two characters are a class: `23` integrity constraint violation (e.g. `23505` unique violation in PostgreSQL), `40` transaction rollback (`40001` serialization failure, `40P01` deadlock in PostgreSQL), `08` connection exception. JDBC 4.0 maps some classes to subclasses such as `SQLIntegrityConstraintViolationException` and `SQLTransientException`, which helps decide what is retryable.',
        sources: [{ label: 'java.sql package — Java SE 21 API', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.sql/java/sql/package-summary.html' }],
      },
      {
        title: 'Placeholders cannot parameterise identifiers',
        body: 'A bind parameter is a value, so `ORDER BY ?` sorts by a constant string and `SELECT * FROM ?` does not parse. Dynamic identifiers must be mapped from user input to a fixed allow-list in code (`switch (sort) { case "name" -> "name"; ... }`). This is where injection still appears in otherwise careful codebases.',
        sources: [{ label: 'OWASP SQL Injection Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html' }],
      },
    ],
  },
  'j-transactions': {
    textbook: {
      definition:
        'A **transaction** is a sequence of database operations run as a single logical unit of work. It satisfies the **ACID** properties: atomicity, consistency, isolation and durability. In JDBC, a transaction belongs to one `Connection`. When **auto-commit** mode is turned off, statements collect in the current transaction. They stay there until `commit()` makes their effects permanent or `rollback()` discards them. The **isolation level** is set with `setTransactionIsolation`. It specifies which effects of transactions running at the same time are visible. So it also sets which **read phenomena** (dirty, non-repeatable and phantom reads) may occur. Stronger levels allow fewer phenomena, at the cost of less concurrency.',
      terms: [
        { term: 'ACID', meaning: 'Atomicity (all or nothing), consistency (constraints hold), isolation (concurrent transactions do not interfere) and durability (committed data survives failures).' },
        { term: 'Auto-commit', meaning: 'The default JDBC mode in which every SQL statement is committed as its own transaction immediately after it completes.' },
        { term: 'Isolation level', meaning: 'One of four degrees of isolation in the SQL standard, from READ UNCOMMITTED to SERIALIZABLE. Each is defined by the read phenomena it forbids.' },
        { term: 'Read phenomenon', meaning: 'An anomaly (unexpected result) caused by concurrent transactions. Examples are reading uncommitted data, a changed row on re-read, or new rows matching a repeated query.' },
        { term: 'Savepoint', meaning: 'A named point within a transaction. `rollback(savepoint)` can return to it without discarding the earlier work of the transaction.' },
      ],
      source: 'ISO/IEC 9075 (SQL standard); JDBC 4.3 Specification; Javadoc for java.sql.Connection',
    },
    interviewDefinition:
      'A **transaction** is a unit of work that is atomic, consistent, isolated and durable (ACID). In JDBC, it belongs to one `Connection`. You call `setAutoCommit(false)`, run the statements, then call `commit()`. On every failure path, you call `rollback()` instead. The **isolation level** decides which concurrency anomalies (dirty, non-repeatable and phantom reads; lost updates; write skew) other transactions can cause. Stronger levels prevent more, at the cost of locking, aborts and retries. Lost updates are prevented with atomic SQL, pessimistic `SELECT ... FOR UPDATE` or optimistic version checks.',
    interviewFollowUps: [
      {
        question: 'Does REPEATABLE READ prevent phantom reads?',
        answer: 'The SQL standard allows phantoms at REPEATABLE READ, but implementations differ. PostgreSQL implements it as snapshot isolation, so plain reads see no phantoms. MySQL InnoDB uses a consistent snapshot for plain reads, and next-key locks for locking reads. Always check the engine\'s documentation.',
      },
      {
        question: 'What is write skew?',
        answer: 'Two transactions read overlapping data. Each checks an invariant, a rule that must stay true ("at least one doctor on call"). Then each updates a different row. Neither overwrote the other, yet together they break the invariant. Snapshot isolation allows it. SERIALIZABLE (or an explicit lock on the rows checked) prevents it.',
      },
      {
        question: 'Optimistic or pessimistic locking?',
        answer: 'Optimistic (a version column checked in the UPDATE) suits low contention and long think-time. No locks are held, and conflicts are detected at write time. Pessimistic (`SELECT ... FOR UPDATE`) suits short, high-contention updates where retrying would be wasteful. It risks waiting and deadlocks.',
      },
      {
        question: 'What happens if you call setAutoCommit(true) in the middle of a transaction?',
        answer: 'The JDBC specification says the current transaction is committed. That is why code that "restores autocommit" in a finally block must roll back first on the failure path.',
      },
    ],
    mnemonic: {
      device: 'The isolation ladder: each rung evicts one ghost',
      expansion: [
        { key: 'Read Uncommitted', meaning: 'Bottom rung: Dirty, Non-repeatable and Phantom reads can all appear' },
        { key: 'Read Committed', meaning: 'Evicts the Dirty read ghost: you only see committed data' },
        { key: 'Repeatable Read', meaning: 'Evicts the Non-repeatable read ghost: rows you read do not change under you' },
        { key: 'Serializable', meaning: 'Evicts the Phantom ghost too (and write skew): as if transactions ran one at a time' },
      ],
      visual: 'Picture a ladder with three ghosts named D, N and P; every rung you climb pushes the next ghost off — but climbing takes effort (locks, aborts and retries).',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'All or nothing, like a bank transfer',
        body: 'Moving money is "debit here" plus "credit there". If the power fails between the two, a transaction guarantees the debit is undone too. Commit is signing the transfer slip; rollback is tearing it up. Until you sign, nobody else should be able to rely on the half-done state.',
      },
      {
        kind: 'insight',
        title: 'A transaction lives on one connection',
        body: 'If one DAO method borrows connection A and the next borrows connection B, they are in two different transactions, and a rollback on A cannot undo B. Everything in one unit of work must share one Connection — which is exactly what Spring\'s `@Transactional` arranges by binding the connection to the current thread.',
      },
      {
        kind: 'real-world',
        title: 'Double-booked seats',
        body: 'Two users bought the last seat at the same moment: both read "1 seat free", both inserted a booking. Fixes, from simplest to most general: a unique constraint on (event, seat) so the second insert fails; a conditional update `UPDATE seats SET holder = ? WHERE id = ? AND holder IS NULL` and checking that one row changed; or `SELECT ... FOR UPDATE` on the seat row.',
      },
      {
        kind: 'angle',
        title: 'Readers rarely block writers any more',
        body: 'PostgreSQL, Oracle and InnoDB use MVCC (multi-version concurrency control): readers see a consistent snapshot of committed versions instead of taking shared locks. Isolation is therefore mostly about *which snapshot* you see and *whether conflicting writes abort* — not about lock tables, as many textbooks still describe it.',
      },
    ],
    diagrams: [
      {
        id: 'j2-isolation-ladder',
        kind: 'concept',
        title: 'Which anomalies each isolation level prevents (SQL standard)',
        caption: 'Each step up prevents one more anomaly. Real engines often do better than the standard minimum. For example, PostgreSQL\'s REPEATABLE READ also prevents phantoms.',
        explanation: [
          'Read it as a table. The header row names the **Isolation level** column and three anomalies: **Dirty read**, **Non-repeatable read** and **Phantom read**.',
          '**READ UNCOMMITTED** is the bottom rung, where all three are possible. A transaction may even see changes that others have not committed.',
          'Following the "stronger" arrow, **READ COMMITTED** is the PostgreSQL default. It prevents dirty reads, but re-reading a row or re-running a query can still give different results.',
          '**REPEATABLE READ**, the MySQL InnoDB default, also prevents non-repeatable reads. By the standard, phantom rows from new inserts are still possible.',
          '**SERIALIZABLE** prevents all three and behaves as if transactions ran one after another. Engines may abort a transaction with SQLState 40001, so callers must retry.',
          'Takeaway: each step up prevents one more anomaly, at the cost of more locking or aborts. Real engines often do better than this standard minimum.',
        ],
        cols: 4,
        rows: 5,
        nodes: [
          { id: 'h0', label: 'Isolation level', col: 0, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'h1', label: 'Dirty read', col: 1, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'h2', label: 'Non-repeatable read', col: 2, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'h3', label: 'Phantom read', col: 3, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'ru', label: 'READ UNCOMMITTED', col: 0, row: 1, tone: 'danger' },
          { id: 'ru1', label: 'possible', col: 1, row: 1, tone: 'danger' },
          { id: 'ru2', label: 'possible', col: 2, row: 1, tone: 'danger' },
          { id: 'ru3', label: 'possible', col: 3, row: 1, tone: 'danger' },
          { id: 'rc', label: 'READ COMMITTED', detail: 'PostgreSQL default', col: 0, row: 2, tone: 'warning' },
          { id: 'rc1', label: 'prevented', col: 1, row: 2, tone: 'success' },
          { id: 'rc2', label: 'possible', col: 2, row: 2, tone: 'danger' },
          { id: 'rc3', label: 'possible', col: 3, row: 2, tone: 'danger' },
          { id: 'rr', label: 'REPEATABLE READ', detail: 'MySQL InnoDB default', col: 0, row: 3, tone: 'accent' },
          { id: 'rr1', label: 'prevented', col: 1, row: 3, tone: 'success' },
          { id: 'rr2', label: 'prevented', col: 2, row: 3, tone: 'success' },
          { id: 'rr3', label: 'possible', detail: 'by the standard', col: 3, row: 3, tone: 'danger' },
          { id: 'se', label: 'SERIALIZABLE', detail: 'retry on 40001', col: 0, row: 4, tone: 'success' },
          { id: 'se1', label: 'prevented', col: 1, row: 4, tone: 'success' },
          { id: 'se2', label: 'prevented', col: 2, row: 4, tone: 'success' },
          { id: 'se3', label: 'prevented', col: 3, row: 4, tone: 'success' },
        ],
        edges: [
          { from: 'ru', to: 'rc', label: 'stronger' },
          { from: 'rc', to: 'rr', label: 'stronger' },
          { from: 'rr', to: 'se', label: 'stronger' },
        ],
      },
      {
        id: 'j2-lost-update',
        kind: 'flow',
        title: 'A lost update, step by step',
        caption: 'Both transactions read 100 and write back their own result. No error occurs, yet one withdrawal disappears. The final balance should be 70.',
        explanation: [
          'The **balance row** starts at 100. **Transaction 1** wants to withdraw 10 and **Transaction 2** wants to withdraw 20 at the same time.',
          'Both transactions **read 100** before either has written anything, so each computes its new balance from the same value.',
          'Transaction 1 commits **write 100 - 10 = 90**. The dashed arrow shows that this write lands first, but only briefly.',
          'Transaction 2 then commits **write 100 - 20 = 80**, which overwrites 90 without ever having seen it.',
          'The result is **balance = 80** instead of 70. The update of Transaction 1 is lost, and no error occurred. Prevent it with an atomic UPDATE, a row lock or a version check.',
        ],
        cols: 3,
        rows: 5,
        nodes: [
          { id: 't1', label: 'Transaction 1', col: 0, row: 0, shape: 'pill', tone: 'primary' },
          { id: 'db', label: 'balance row', detail: 'starts at 100', col: 1, row: 0, shape: 'cylinder', tone: 'neutral' },
          { id: 't2', label: 'Transaction 2', col: 2, row: 0, shape: 'pill', tone: 'accent' },
          { id: 'r1', label: 'read 100', col: 0, row: 1, tone: 'primary' },
          { id: 'r2', label: 'read 100', col: 2, row: 2, tone: 'accent' },
          { id: 'w1', label: 'write 100 - 10 = 90', detail: 'commit', col: 0, row: 3, tone: 'primary' },
          { id: 'w2', label: 'write 100 - 20 = 80', detail: 'commit', col: 2, row: 4, tone: 'accent' },
          { id: 'final', label: 'balance = 80', detail: 'T1\'s update is lost', col: 1, row: 4, shape: 'cylinder', tone: 'danger' },
        ],
        edges: [
          { from: 't1', to: 'r1' },
          { from: 't2', to: 'r2' },
          { from: 'r1', to: 'w1', label: 'compute' },
          { from: 'r2', to: 'w2', label: 'compute' },
          { from: 'w1', to: 'final', label: 'writes 90 first', dashed: true },
          { from: 'w2', to: 'final', label: 'overwrites 90' },
        ],
      },
      {
        id: 'j2-optimistic',
        kind: 'flow',
        title: 'Optimistic locking with a version column',
        caption: 'No lock is held while the user thinks. The WHERE clause checks the version you read. An update count of 0 means somebody else committed first.',
        explanation: [
          '**SELECT ... version** reads the row together with its version column, here version 7, and holds no lock afterwards.',
          '**Change in memory** while the user edits or the code computes. Other transactions are free to update the row meanwhile.',
          '**UPDATE ... SET version = 8** adds `WHERE id = ? AND version = 7`, so it only matches if nobody has changed the row since your read.',
          'If the update count is 1, the check passed: **1 row: commit**. The version is now 8 for the next writer.',
          'If the count is 0, someone else committed first: **0 rows: conflict**. Reload and retry, or report it. Takeaway: conflicts are detected at write time instead of prevented by locks.',
        ],
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'read', label: 'SELECT ... version', detail: 'got version 7', col: 0, row: 0, tone: 'primary' },
          { id: 'change', label: 'Change in memory', detail: 'no lock held', col: 1, row: 0, tone: 'neutral' },
          { id: 'upd', label: 'UPDATE ... SET version = 8', detail: 'WHERE id = ? AND version = 7', col: 2, row: 0, span: 2, tone: 'accent' },
          { id: 'ok', label: '1 row: commit', col: 3, row: 1, shape: 'pill', tone: 'success' },
          { id: 'conflict', label: '0 rows: conflict', detail: 'reload and retry, or report', col: 1, row: 1, span: 2, shape: 'pill', tone: 'danger' },
        ],
        edges: [
          { from: 'read', to: 'change' },
          { from: 'change', to: 'upd' },
          { from: 'upd', to: 'ok', label: 'count == 1' },
          { from: 'upd', to: 'conflict', label: 'count == 0' },
        ],
      },
    ],
    variants: [
      {
        title: 'Isolation levels (JDBC constants)',
        intro: 'Set with con.setTransactionIsolation(...). The constants are standard; what each level really guarantees depends on the database engine.',
        items: [
          { name: 'TRANSACTION_READ_UNCOMMITTED', summary: 'May see other transactions\' uncommitted changes (dirty reads).', support: 'partial', note: 'PostgreSQL accepts it but behaves as READ COMMITTED.' },
          { name: 'TRANSACTION_READ_COMMITTED', summary: 'Each statement sees data committed before it began; re-reading may return different values.', support: 'supported', note: 'Default in PostgreSQL, Oracle and SQL Server.' },
          { name: 'TRANSACTION_REPEATABLE_READ', summary: 'Rows already read do not change within the transaction; the standard still permits phantoms.', support: 'supported', note: 'Default in MySQL InnoDB; snapshot isolation in PostgreSQL.' },
          { name: 'TRANSACTION_SERIALIZABLE', summary: 'Result equals some serial order of the transactions; conflicting transactions fail and must be retried.', support: 'supported', note: 'Oracle\'s SERIALIZABLE is snapshot isolation, which still allows write skew.' },
        ],
      },
      {
        title: 'Concurrency anomalies',
        items: [
          { name: 'Dirty read', summary: 'Reading data another transaction has not committed and might roll back. Prevented from READ COMMITTED up.' },
          { name: 'Non-repeatable read', summary: 'Reading the same row twice and getting different values because someone committed in between. Prevented from REPEATABLE READ up.' },
          { name: 'Phantom read', summary: 'Re-running a range query and seeing rows appear or vanish. Prevented by SERIALIZABLE (and by snapshot implementations of REPEATABLE READ).' },
          { name: 'Lost update', summary: 'Two read-modify-write cycles interleave and one overwrites the other. Prevented by atomic SQL, locking or version checks; PostgreSQL REPEATABLE READ aborts the second writer.' },
          { name: 'Write skew', summary: 'Two transactions check the same invariant and update different rows, together breaking it. Only true SERIALIZABLE (or explicit locks) prevents it.' },
        ],
      },
      {
        title: 'Locking strategies for read-modify-write',
        items: [
          { name: 'Atomic conditional update', summary: 'Let the database do the arithmetic and the check in one statement; inspect the update count.', support: 'supported', code: 'UPDATE account SET balance = balance - ? WHERE id = ? AND balance >= ?' },
          { name: 'Optimistic locking', summary: 'A version (or timestamp) column checked in the WHERE clause; 0 updated rows means a conflict. JPA: @Version.', support: 'supported', code: 'UPDATE item SET qty = ?, version = version + 1 WHERE id = ? AND version = ?' },
          { name: 'Pessimistic locking', summary: 'Lock the rows when reading so other writers wait until commit. NOWAIT fails immediately; SKIP LOCKED suits job queues.', support: 'supported', code: 'SELECT qty FROM item WHERE id = ? FOR UPDATE' },
          { name: 'Constraints', summary: 'Unique and check constraints enforce invariants no matter how transactions interleave; the losing insert fails with SQLState 23505 (PostgreSQL).', support: 'supported', code: 'ALTER TABLE booking ADD CONSTRAINT one_holder UNIQUE (event_id, seat_no)' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'The standard\'s levels were defined too loosely',
        body: 'The ANSI SQL-92 levels are defined by which "phenomena" they forbid. In 1995 Berenson, Bernstein, Gray and colleagues showed these definitions were ambiguous and missed anomalies such as lost update and write skew, and they described **snapshot isolation**, which sits between REPEATABLE READ and SERIALIZABLE. That is why two databases can both claim "REPEATABLE READ" and behave differently.',
        sources: [
          { label: 'Berenson et al., "A Critique of ANSI SQL Isolation Levels" (SIGMOD 1995)' },
          { label: 'Designing Data-Intensive Applications (Martin Kleppmann), chapter 7: Transactions' },
        ],
      },
      {
        title: 'Serializable needs a retry loop',
        body: 'PostgreSQL implements SERIALIZABLE with Serializable Snapshot Isolation (since 9.1): transactions run without blocking, and the database aborts one of them with SQLState `40001` when it detects a dangerous dependency cycle. Correct application code therefore wraps the whole transaction in a bounded retry loop; retrying only the failed statement is not enough, because everything the transaction read may be stale.',
        sources: [{ label: 'PostgreSQL documentation: Transaction Isolation', url: 'https://www.postgresql.org/docs/current/transaction-iso.html' }],
      },
      {
        title: 'Pool size, transaction length and Little\'s law',
        body: 'Connections in use = request rate x time each transaction holds a connection. Halving transaction time halves the pool you need; holding a connection during a 2-second HTTP call multiplies it. HikariCP\'s guidance is that small pools (on the order of database cores x 2) usually outperform large ones, because the database itself cannot run more work in parallel than it has cores and disks.',
        sources: [
          { label: 'HikariCP wiki: About Pool Sizing', url: 'https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing' },
          { label: 'Connection.setAutoCommit — Java SE 21 API', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.sql/java/sql/Connection.html' },
        ],
      },
    ],
  },
};
