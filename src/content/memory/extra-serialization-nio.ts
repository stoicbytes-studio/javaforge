import type { MemoryAid } from '@/types/curriculum';

/** "Make it stick" memory aids for the serialization and NIO lessons, keyed by lesson id. */
export const serializationNioMemory: Record<string, MemoryAid> = {
  'io-serialization': {
    oneLiner: 'Serialization flat-packs an object into bytes; deserialization rebuilds it, so only unpack boxes you trust.',
    story:
      'Imagine moving house. You take a bookcase apart and pack the flat pieces in a box with a label, so a truck can carry it. At the new house someone unpacks the box and builds the bookcase again. You leave out things that should not travel, like the spare key taped underneath. But be careful: the label on a box decides what gets built, so a box from a stranger could build something harmful. In Java, packing is serialization into bytes, unpacking is deserialization, the spare key is a `transient` field, and checking boxes from strangers is an `ObjectInputFilter` allow-list.',
    keyPoints: [
      'Java serialization writes an object\'s non-`transient` fields as bytes and rebuilds it later, without running its constructor.',
      'Never deserialize untrusted bytes with Java serialization. The stream chooses which classes get created.',
      'Prefer data-only formats like JSON, and declare `serialVersionUID` if you must use `Serializable`.',
    ],
    confusion: {
      mixedUpWith: '`transient` and `volatile`',
      difference: '`transient` means "do not save this field when serializing". `volatile` is about threads seeing the latest value, nothing to do with saving.',
    },
    tryIt: 'Make a small `Serializable` class with a `transient String password`. Write it with `ObjectOutputStream`, read it back with `ObjectInputStream`, and print the password field. It will be `null`.',
    recall: [
      { question: 'What happens to a `transient` field when an object is serialized?', answer: 'It is skipped, so after deserialization it has its default value, such as `null` or 0.' },
      { question: 'Why is deserializing data from strangers dangerous?', answer: 'The bytes decide which classes are created and which methods run, which attackers can abuse.' },
    ],
    picture: {
      title: 'Flat-pack and rebuild',
      caption: 'The bookcase (object) is packed into a box (bytes), carried, then rebuilt. A box from a stranger is checked before unpacking (filter).',
      items: [
        { icon: 'shelf', label: 'object', x: 12, y: 22, tone: 'primary' },
        { icon: 'box', label: 'bytes', x: 50, y: 22, tone: 'accent' },
        { icon: 'shelf', label: 'rebuilt', x: 88, y: 22, tone: 'success' },
        { icon: 'warning', label: 'stranger\'s box', x: 50, y: 48, size: 0.8, tone: 'danger' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'pack' },
        { from: 1, to: 2, label: 'unpack' },
        { from: 3, to: 1, dashed: true },
      ],
    },
  },
  'io-nio-sockets': {
    oneLiner: 'Streams carry bytes one way and wait; NIO channels fill and drain buffers, and one selector can watch many connections.',
    story:
      'Think of a garden with many water taps. The old way is one gardener per tap, standing still until water comes. The newer way is to fill a bucket from a pipe, then turn the bucket around and pour it out. One watcher with a whistle walks between all the taps and only stops at the ones that are running. In Java, the old way is blocking streams, the pipe is a channel, the bucket is a `ByteBuffer`, turning the bucket around is `flip()`, and the watcher is a `Selector`. Since Java 21, virtual threads make the old one-gardener-per-tap style cheap again.',
    keyPoints: [
      'A `ByteBuffer` has a position, limit and capacity. Call `flip()` after filling it and before reading it.',
      'A `Selector` lets one thread handle many non-blocking channels, acting only on the ready ones.',
      'TCP is a stream of bytes with no message edges, so add newlines or length prefixes yourself.',
    ],
    confusion: {
      mixedUpWith: '`flip()` and `clear()`',
      difference: '`flip()` gets the buffer ready to read what you just wrote. `clear()` gets it ready to be filled again, without erasing the bytes.',
    },
    tryIt: 'Allocate `ByteBuffer.allocate(8)`, `put` three bytes, print its position and limit, call `flip()`, and print them again. Watch the limit move to 3 and the position to 0.',
    recall: [
      { question: 'What does `flip()` do to a buffer?', answer: 'It sets the limit to the current position and the position to 0, so you can read what was written.' },
      { question: 'Why might one `write` arrive as two `read`s?', answer: 'TCP is a byte stream and can split or join data, so messages need framing.' },
      { question: 'What lets one thread serve many connections in NIO?', answer: 'A `Selector` watching many non-blocking channels.' },
    ],
    picture: {
      title: 'Pipe, bucket, one watcher',
      caption: 'Water flows through a pipe (channel) into a bucket (ByteBuffer). One watcher with a whistle (Selector) serves only the taps that are running.',
      items: [
        { icon: 'pipe', label: 'channel', x: 12, y: 22, tone: 'neutral' },
        { icon: 'bucket', label: 'ByteBuffer', x: 50, y: 22, tone: 'accent' },
        { icon: 'whistle', label: 'Selector', x: 87, y: 22, tone: 'primary' },
        { icon: 'tap', label: 'ready tap', x: 50, y: 48, size: 0.8, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'fill' },
        { from: 2, to: 3, label: 'ready?', dashed: true },
      ],
    },
  },
};
