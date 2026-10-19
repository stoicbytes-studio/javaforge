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
