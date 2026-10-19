import type { MemoryAid } from '@/types/curriculum';

/** "Make it stick" memory aids for the JIT compiler lesson, keyed by lesson id. */
export const jitMemory: Record<string, MemoryAid> = {
  'r-jit-compiler': {
    oneLiner: 'The JVM first interprets bytecode, then compiles the hot parts into fast machine code while the program runs.',
    story:
      'Picture a new barista at a coffee shop. At first they read every order slip slowly, step by step. After making the same latte a hundred times, they build a quick routine for it, and later a polished one based on notes like "this customer always wants oat milk". If someone suddenly asks for cow milk, the barista drops the shortcut, reads the slip again, and builds a new routine later. In Java, the slip is bytecode, reading it step by step is the interpreter, the busy order is hot code, the quick and polished routines are the C1 and C2 compilers making machine code, the oat milk note is a profile-based guess, and dropping the shortcut is deoptimisation.',
    keyPoints: [
      'The interpreter counts method calls and loops to find hot code worth compiling.',
      'C1 compiles quickly and gathers profiles; C2 uses them to inline methods and make guarded guesses.',
      'If a guess turns out wrong, the JVM deoptimises safely and may recompile later.',
    ],
    confusion: {
      mixedUpWith: '`javac`',
      difference: '`javac` turns source into bytecode before the program runs. The JIT turns hot bytecode into machine code while it runs.',
    },
    tryIt: 'Run a small loop-heavy program with `-XX:+PrintCompilation` and watch methods appear as they are compiled, with tier numbers and "made not entrant" lines.',
    recall: [
      { question: 'How does the JVM decide which code to compile?', answer: 'It counts method calls and loop iterations, and compiles code that becomes hot.' },
      { question: 'What happens when a C2 guess becomes wrong?', answer: 'The JVM deoptimises back to the interpreter, keeps the same behaviour, and can recompile later.' },
      { question: 'Why do Java programs often get faster after a while?', answer: 'Warm-up: hot code is compiled and optimised using profiles gathered while it ran.' },
    ],
    picture: {
      title: 'The barista learns the regulars',
      caption: 'The barista reads slips (interprets bytecode), turns busy orders into a fast routine (JIT-compiled code), and goes back to the slip when a guess fails (deoptimisation).',
      items: [
        { icon: 'note', label: 'Bytecode', x: 10, y: 12, size: 0.8, tone: 'accent' },
        { icon: 'person', label: 'Interpreter', x: 47, y: 12, size: 0.8, tone: 'primary' },
        { icon: 'rocket', label: 'Machine code', x: 87, y: 12, size: 0.8, tone: 'success' },
        { icon: 'warning', label: 'Guess fails', x: 87, y: 44, size: 0.8, tone: 'warning' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'read' },
        { from: 1, to: 2, label: 'hot' },
        { from: 2, to: 3 },
        { from: 3, to: 1, label: 'deopt', dashed: true },
      ],
    },
  },
};
