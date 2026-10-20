import type { MemoryAid } from '@/types/curriculum';

/** "Make it stick" memory aids for module 10 (Files, NIO and Networking), keyed by lesson id. */
export const ioMemory: Record<string, MemoryAid> = {
  'io-files': {
    oneLiner: 'A `Path` only says where a file is; `Files` does the real work, and you always close what you open.',
    story:
      'Picture a library. A catalogue card tells you the shelf where a book lives, but holding the card does not open the book. To get the book you ask the librarian, who fetches it and tells you exactly what went wrong if it is missing. Some books are written in another alphabet, so you need the right translation key to read them. When you finish, you give the book back. In Java, the card is a `Path`, the librarian is `Files`, the raw pages are bytes, the translation key is a charset like UTF-8, and giving the book back is try-with-resources closing the file.',
    keyPoints: [
      'A `Path` is just an address. Creating one does not open, create or check the file.',
      'Files hold bytes. To read text, the bytes are decoded with a charset, so name it, for example UTF-8.',
      'Close every open file with try-with-resources, and read big files line by line with `Files.lines`.',
    ],
    types: [
      {
        title: 'Stream families in java.io',
        items: [
          { name: 'Byte streams', simple: 'Move raw bytes, like copying pages without reading them. Right for images, ZIP files and any binary data.' },
          { name: 'Character streams', simple: 'Read and write letters, using a charset to translate bytes into text, like a translator reading a foreign book.' },
          { name: 'Buffered streams', simple: 'Fetch a big armful at once instead of one item per trip, so reading line by line is fast.' },
          { name: 'Data streams', simple: 'Write numbers and booleans in a fixed binary layout, so another program can read them back exactly.' },
          { name: 'Object streams', simple: 'Pack whole Java objects into bytes and unpack them later. Old and risky; prefer JSON for new code.' },
        ],
      },
      {
        title: 'Ways to read a text file',
        items: [
          { name: '`Files.readString`', simple: 'Read the whole short letter in one go. Easiest for small files.' },
          { name: '`Files.readAllLines`', simple: 'Get the whole file as a list of lines, like a numbered shopping list. Small files only.' },
          { name: '`Files.lines`', simple: 'Read a huge book one line at a time as a stream, so memory stays small. Close it afterwards.' },
          { name: '`Files.newBufferedReader`', simple: 'A classic loop calling `readLine()` until it returns null. Good when you remember things between lines.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: 'the old `java.io.File` class',
      difference: '`File` methods like `delete()` just return `false` when they fail. `Files` methods throw an `IOException` that says why.',
    },
    tryIt: 'Write `Files.writeString(Path.of("note.txt"), "hi")`, then read it back with `Files.readString`. Next, call `Files.readString` on a file that does not exist and read the exception name.',
    recall: [
      { question: 'Does `Path.of("a.txt")` open or create the file?', answer: 'No. It only describes a location. `Files` methods do the actual work.' },
      { question: 'What turns bytes from a file into characters?', answer: 'A charset, such as UTF-8, used by a `Reader` to decode the bytes.' },
      { question: 'Why use try-with-resources around `Files.lines`?', answer: 'Because the stream keeps the file open until it is closed.' },
    ],
    picture: {
      title: 'The card is not the book',
      caption: 'The catalogue card (Path) only points to the book. The librarian (Files) fetches it, and you give it back when done (close).',
      items: [
        { icon: 'note', label: 'Path', x: 13, y: 22, tone: 'accent' },
        { icon: 'person', label: 'Files', x: 50, y: 22, tone: 'primary' },
        { icon: 'book', label: 'file bytes', x: 87, y: 22, tone: 'neutral' },
        { icon: 'key', label: 'charset UTF-8', x: 50, y: 48, size: 0.8, tone: 'warning' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'where' },
        { from: 1, to: 2, label: 'fetch' },
        { from: 3, to: 2, label: 'decode', dashed: true },
      ],
    },
  },
  'io-http': {
    oneLiner: 'One shared `HttpClient` posts your `HttpRequest` letters, and every reply, even a 404, comes back as a normal response.',
    story:
      'Think of sending letters through a post office. You write a letter with an address on it, hand it to the post office, and wait for a reply. The post office is set up once and serves the whole town, so you do not build a new one for every letter. If the reply says "nobody lives here", that is still a reply. Only a lost letter or a closed road is a real failure. In Java, the post office is `HttpClient`, the letter is an `HttpRequest`, the reply is an `HttpResponse` with a status code like 200 or 404, and a lost letter is an `IOException`. A timeout is how long you are willing to wait.',
    keyPoints: [
      'Create one `HttpClient` and share it. It keeps connections open for reuse and is thread-safe.',
      'A 404 or 500 status is a normal response. Check `statusCode()` yourself; only network failures throw.',
      'Always set timeouts, and only retry automatically requests that are safe to repeat, such as GET.',
    ],
    types: [
      {
        title: 'HTTP methods',
        items: [
          { name: 'GET', simple: 'Ask to read something, like looking at a menu. It changes nothing, so it is safe to repeat.' },
          { name: 'POST', simple: 'Send something new, like posting a letter. Sending it twice may create two copies.' },
          { name: 'PUT', simple: 'Replace the whole thing with your version. Doing it twice gives the same result as once.' },
          { name: 'PATCH', simple: 'Change only some fields, like correcting one line of a form instead of filling in a new one.' },
          { name: 'DELETE', simple: 'Remove something. Deleting the same thing twice leaves it just as gone.' },
        ],
      },
      {
        title: 'Status code classes',
        items: [
          { name: '1xx Informational', simple: 'A "please wait, still working" note. The client handles it for you.' },
          { name: '2xx Success', simple: 'Your order arrived as asked. Read the body.' },
          { name: '3xx Redirection', simple: 'A "we have moved" sign pointing to another address.' },
          { name: '4xx Client error', simple: 'You asked wrongly, like ordering a dish not on the menu. Asking again the same way will not help.' },
          { name: '5xx Server error', simple: 'The kitchen broke down. Waiting and trying again later may work, if repeating is safe.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: '`send` and `sendAsync`',
      difference: '`send` waits for the reply on the current thread. `sendAsync` returns a `CompletableFuture` at once and lets you carry on.',
    },
    tryIt: 'Build an `HttpClient`, send a GET request to a page that does not exist, and print `response.statusCode()`. Notice that no exception was thrown.',
    recall: [
      { question: 'Does a 404 status make `send` throw an exception?', answer: 'No. It is a normal response; you read it with `statusCode()`.' },
      { question: 'Why share one `HttpClient` instead of making one per request?', answer: 'It keeps a pool of open connections, so reusing it avoids repeating setup work for every call.' },
    ],
    picture: {
      title: 'Every reply is a letter',
      caption: 'Your letter (HttpRequest) goes through one post office (HttpClient). Whatever comes back, even "not found", is a reply (HttpResponse).',
      items: [
        { icon: 'envelope', label: 'HttpRequest', x: 12, y: 22, tone: 'accent' },
        { icon: 'mailbox', label: 'HttpClient', x: 52, y: 22, tone: 'primary' },
        { icon: 'server', label: 'web server', x: 87, y: 22, tone: 'neutral' },
        { icon: 'stamp', label: 'status 404', x: 52, y: 48, size: 0.8, tone: 'warning' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'send' },
        { from: 1, to: 2 },
        { from: 2, to: 3, label: 'reply', dashed: true },
      ],
    },
  },
};
