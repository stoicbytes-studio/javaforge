import type { MemoryAid } from '@/types/curriculum';

/** "Make it stick" memory aids for module 11 (JDBC and transactions), keyed by lesson id. */
export const jdbcMemory: Record<string, MemoryAid> = {
  'j-jdbc': {
    oneLiner: 'JDBC is one standard plug for every database: a driver adapts it, and `?` placeholders keep user values safe.',
    story:
      'Think of a bank that only accepts its own printed forms. The wording on the form is fixed; you just write your values in the empty boxes. If someone writes "and give me everyone\'s money" in the name box, the bank simply treats it as a strange name. Each bank branch speaks its own language, so a translator stands at the counter. In Java, the printed form is a `PreparedStatement`, the empty boxes are `?` placeholders, the translator is the database driver, and the counter you borrow and give back is a pooled `Connection`. The list of answers you read one row at a time is a `ResultSet`.',
    keyPoints: [
      'Your code uses JDBC interfaces; a vendor driver, like the PostgreSQL driver, implements them for that database.',
      'Use `PreparedStatement` with `?` placeholders. Values are sent separately, so they can never become SQL code.',
      'Get connections from a pooled `DataSource` and close connections, statements and result sets with try-with-resources.',
    ],
    types: [
      {
        title: 'Statement types',
        items: [
          { name: '`Statement`', simple: 'Sends a finished SQL sentence as it is. Fine for fixed SQL, dangerous with anything a user typed.' },
          { name: '`PreparedStatement`', simple: 'A form with blanks (`?`) that you fill in separately. Safe from SQL injection; use it by default.' },
          { name: '`CallableStatement`', simple: 'Calls a stored procedure saved inside the database, like pressing a preset button.' },
        ],
      },
      {
        title: 'Execute methods',
        items: [
          { name: '`executeQuery()`', simple: 'For SELECT: asks a question and gets back rows to read.' },
          { name: '`executeUpdate()`', simple: 'For INSERT, UPDATE or DELETE: makes a change and tells you how many rows changed.' },
          { name: '`executeBatch()`', simple: 'Sends many rows in one trip, like posting a whole bundle of letters at once.' },
          { name: '`execute()`', simple: 'For SQL when you do not know in advance whether it returns rows or a count.' },
        ],
      },
      {
        title: 'JDBC driver types',
        items: [
          { name: 'Type 1: ODBC bridge', simple: 'Talks through a second translator, ODBC. Removed from Java 8, so only history now.' },
          { name: 'Type 2: native-API', simple: 'Uses the database maker\'s own native program installed on the computer.' },
          { name: 'Type 3: network-protocol', simple: 'Talks to a middleman server that passes requests on to the database.' },
          { name: 'Type 4: thin driver', simple: 'Pure Java that speaks the database\'s own language directly. Just add one JAR; what almost everyone uses.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: '`Statement` with string concatenation',
      difference: 'Gluing user input into SQL text lets that input change the query itself. A `PreparedStatement` keeps the SQL fixed and binds values separately.',
    },
    tryIt: 'Write a query `SELECT * FROM users WHERE name = ?`, bind the name `x\' OR \'1\'=\'1` with `setString`, and run it. It finds no rows, because the input is treated as a plain value.',
    recall: [
      { question: 'Why does a `?` placeholder stop SQL injection?', answer: 'The SQL text is fixed first and the value is sent separately, so it can never be read as SQL.' },
      { question: 'What does `rs.getInt` return for a SQL NULL?', answer: '0, so use `getObject(col, Integer.class)` or `wasNull()` to tell NULL from a real 0.' },
    ],
    picture: {
      title: 'A printed form with blanks',
      caption: 'You fill only the blanks on a fixed form (PreparedStatement). A translator (driver) passes it to the bank (database).',
      items: [
        { icon: 'person', label: 'your code', x: 12, y: 22, tone: 'primary' },
        { icon: 'note', label: 'form with ?', x: 50, y: 22, tone: 'accent' },
        { icon: 'database', label: 'database', x: 88, y: 22, tone: 'neutral' },
        { icon: 'plug', label: 'driver', x: 88, y: 48, size: 0.8, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'fill' },
        { from: 1, to: 2, label: 'send' },
      ],
    },
  },
  'j-transactions': {
    oneLiner: 'A transaction is all or nothing: `commit()` keeps every change, `rollback()` undoes every change.',
    story:
      'Think of a shop checkout. The cashier scans every item in your basket, but nothing is sold until you pay. If your card is declined halfway, the cashier cancels the whole sale and every item goes back on the shelf. Other shoppers never see a half-finished sale. In Java, the basket of scanned items is a group of SQL statements on one `Connection` with `setAutoCommit(false)`. Paying is `commit()`, cancelling the sale is `rollback()`, and how much other shoppers can see of your sale before you pay is the isolation level.',
    keyPoints: [
      'Turn off auto-commit, run all the statements on the same `Connection`, then call `commit()`.',
      'On any failure call `rollback()`, so a half-finished change never stays in the database.',
      'The isolation level decides which effects of other running transactions you can see. Stronger levels block or fail more.',
    ],
    types: [
      {
        title: 'Isolation levels',
        items: [
          { name: 'READ UNCOMMITTED', simple: 'You can peek at other people\'s unfinished drafts. Fast, but you may read things that are later thrown away.' },
          { name: 'READ COMMITTED', simple: 'You only see finished, saved work, but it can change if you look twice.' },
          { name: 'REPEATABLE READ', simple: 'A row you have read stays the same for you until you finish, like a photo of it.' },
          { name: 'SERIALIZABLE', simple: 'As if everyone took turns one at a time. Safest, but some transactions fail and must try again.' },
        ],
      },
      {
        title: 'Concurrency anomalies',
        items: [
          { name: 'Dirty read', simple: 'You read a change someone has not saved yet, and then they cancel it.' },
          { name: 'Non-repeatable read', simple: 'You read the same row twice and get two different values, because someone saved in between.' },
          { name: 'Phantom read', simple: 'You run the same search twice and new rows appear, like extra guests arriving at a counted party.' },
          { name: 'Lost update', simple: 'Two people edit the same number and the second save silently wipes out the first.' },
          { name: 'Write skew', simple: 'Two people each check a rule, both see it is fine, and together they break it, like two doctors both going off call.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: 'auto-commit mode',
      difference: 'With auto-commit on, every single statement is its own transaction and is saved at once. You cannot undo the earlier steps.',
    },
    tryIt: 'Turn off auto-commit, run an UPDATE that takes money from one account, then throw an exception before the second UPDATE. Call `rollback()` and check that the first balance is unchanged.',
    recall: [
      { question: 'What does `rollback()` do?', answer: 'It undoes every change made in the current transaction since the last commit.' },
      { question: 'What does the A in ACID stand for, in plain words?', answer: 'Atomic: all the changes happen together, or none of them do.' },
      { question: 'Where does a JDBC transaction live?', answer: 'On one `Connection`, so every statement in it must use that same connection.' },
    ],
    picture: {
      title: 'Pay for all, or put it all back',
      caption: 'The basket (transaction) is either paid for in full (commit) or every item goes back on the shelf (rollback).',
      items: [
        { icon: 'boxes', label: 'basket', x: 13, y: 30, tone: 'primary' },
        { icon: 'coin', label: 'commit', x: 85, y: 12, size: 0.8, tone: 'success' },
        { icon: 'shelf', label: 'rollback', x: 85, y: 44, size: 0.8, tone: 'danger' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'pay' },
        { from: 0, to: 2, label: 'cancel', dashed: true },
      ],
    },
  },
};
