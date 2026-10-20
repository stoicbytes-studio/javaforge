import type { MemoryAid } from '@/types/curriculum';

/** "Make it stick" memory aids for the performance module, keyed by lesson id. */
export const performanceMemory: Record<string, MemoryAid> = {
  'perf-diagnostics': {
    oneLiner: 'Diagnose a slow Java app like a mechanic: name the symptom, record evidence, then use the tool that proves the cause.',
    story:
      'A good car mechanic does not start swapping parts. First they ask what is wrong: does it overheat, stall, or shake? Then they plug in a recorder that logs the engine while you drive. Only then do they open the right part. A Java app works the same way. The symptom is measured as latency percentiles, such as p99, the time that 99 out of 100 requests beat. The recorder is Java Flight Recorder (JFR), which runs with very low cost. The special tools are `jcmd` for thread dumps and heap reports, and a profiler for flame graphs that show where CPU time goes.',
    keyPoints: [
      'Start from a measured symptom: hot CPU, stuck threads, a growing heap, or long pauses.',
      'Java Flight Recorder records CPU, allocations, locks, garbage collection and I/O cheaply, even in production.',
      '`jcmd` gives thread dumps, heap histograms and heap dumps from a running JVM.',
    ],
    types: [
      {
        title: 'Diagnostic tools',
        items: [
          { name: 'Java Flight Recorder (JFR)', simple: 'A flight recorder for your app: it quietly logs CPU, memory, locks and GC while the app runs.' },
          { name: 'jcmd', simple: 'One remote control for a running JVM: ask it for thread dumps, heap info or a recording.' },
          { name: 'Thread dump', simple: 'An X-ray: a quick snapshot of what every thread is doing at one moment.' },
          { name: 'Heap dump', simple: 'An MRI: a huge, detailed picture of every object in memory. Slow, and the app pauses.' },
          { name: 'async-profiler', simple: 'A camera that snaps where the CPU is busy many times a second and draws a flame graph.' },
          { name: 'GC logs', simple: 'A diary of every garbage-collection pause: when, how long, and how much was freed.' },
        ],
      },
      {
        title: 'Thread states in a dump',
        items: [
          { name: 'RUNNABLE', simple: 'Working, or ready to work; also shown while waiting inside a network read.' },
          { name: 'BLOCKED', simple: 'Waiting outside a locked door (`synchronized`) for another thread to leave.' },
          { name: 'WAITING', simple: 'Waiting with no time limit until someone else signals, like waiting for a phone call.' },
          { name: 'TIMED_WAITING', simple: 'Waiting with an alarm clock set, like `Thread.sleep` or a timed poll.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: 'guessing and tuning flags',
      difference: 'Changing JVM flags or code before you have evidence is guessing. Diagnosis means collecting proof of the cause first, then fixing that cause.',
    },
    tryIt: 'Start any small Java program that runs for a while. In another terminal, run `jcmd` to list JVMs, then `jcmd <pid> Thread.print` and read what each thread is doing.',
    recall: [
      { question: 'Which tool gives you a thread dump of a running JVM?', answer: '`jcmd <pid> Thread.print`.' },
      { question: 'What is Java Flight Recorder for?', answer: 'Recording what the JVM does, such as CPU samples, allocations, locks and GC, with very low overhead.' },
      { question: 'Why measure p99 latency and not just the average?', answer: 'The average hides the slow requests; p99 shows how slow the worst one percent of users have it.' },
    ],
    picture: {
      title: 'The mechanic\'s method',
      caption: 'Name the symptom, record evidence with Flight Recorder, then read it to prove the real cause.',
      items: [
        { icon: 'warning', label: 'Symptom', x: 13, y: 22, tone: 'warning' },
        { icon: 'camera', label: 'JFR record', x: 50, y: 22, tone: 'accent' },
        { icon: 'magnifier', label: 'Proven cause', x: 87, y: 22, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
      ],
    },
  },
  'perf-jmh': {
    oneLiner: 'JMH times small pieces of Java fairly, with warm-ups, separate runs and an honest error margin.',
    story:
      'A fair race does not time a runner who just woke up. The runner warms up first, runs several laps, and the judge reports the average with how much the laps varied. Each race also starts on a fresh track so one runner cannot affect the next. JMH, the Java Microbenchmark Harness, does this for code. The warm-up lets the JIT compiler finish optimising. Forks are fresh JVMs, like fresh tracks. The laps are measurement iterations, and the score comes with an error margin. The `Blackhole` is the judge who checks that your runner really ran, so the JVM cannot skip unused work.',
    keyPoints: [
      'Warm-up iterations let the JIT compiler optimise the code before any timing counts.',
      'Return results or feed them to a `Blackhole`, so the JVM cannot remove the work as dead code.',
      'Read inputs from non-final `@State` fields, and always look at the error margin before comparing scores.',
    ],
    types: [
      {
        title: 'Benchmark modes',
        items: [
          { name: 'Throughput', simple: 'How many operations per second, like counting how many cars pass a gate each minute. Higher is better.' },
          { name: 'AverageTime', simple: 'How long one operation takes on average, like the average lap time. Lower is better.' },
          { name: 'SampleTime', simple: 'Times individual calls and shows the slow ones too (p99), not just the average.' },
          { name: 'SingleShotTime', simple: 'Times one cold run with no warm-up, like starting a car on a frosty morning.' },
        ],
      },
      {
        title: 'State scopes',
        items: [
          { name: 'Scope.Thread', simple: 'Each thread gets its own copy of the data, like everyone having their own notebook.' },
          { name: 'Scope.Benchmark', simple: 'All threads share one copy, like a single whiteboard everyone writes on, to test contention.' },
          { name: 'Scope.Group', simple: 'One copy per team of threads, such as a producer and consumer working together.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: 'timing with `System.nanoTime()` in a loop',
      difference: 'A hand-written timing loop measures cold code and can be fooled by JIT tricks. JMH warms up, forks fresh JVMs and reports an error margin.',
    },
    tryIt: 'Write a JMH benchmark with two `@Benchmark` methods that join strings: one with `+` in a loop and one with `StringBuilder`. Return the result from each, run it, and compare the scores and their error margins.',
    recall: [
      { question: 'Why does JMH run warm-up iterations?', answer: 'So the JIT compiler can finish optimising, and only steady, compiled code gets measured.' },
      { question: 'What is a `Blackhole` for?', answer: 'It consumes results so the JVM cannot remove the benchmarked work as dead code.' },
      { question: 'Why does JMH fork separate JVMs?', answer: 'So each benchmark runs in a fresh JVM and earlier runs cannot change its results.' },
    ],
    picture: {
      title: 'A fair race for code',
      caption: 'The runner warms up (JIT warm-up), runs timed laps (iterations), and the result comes with an error margin.',
      items: [
        { icon: 'person', label: 'Warm-up', x: 13, y: 22, tone: 'warning' },
        { icon: 'stopwatch', label: 'Timed laps', x: 50, y: 22, tone: 'accent' },
        { icon: 'medal', label: 'Score +/- err', x: 87, y: 22, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'steady' },
        { from: 1, to: 2 },
      ],
    },
  },
  'perf-optimisation': {
    oneLiner: 'Make code faster by removing the most expensive work first: trips, then steps, then objects, then tricks.',
    story:
      'Doing errands, the biggest waste is driving back to the shop ten times for ten items. Make one trip with a list. Next, plan a shorter route through the shop. Then carry fewer bags. Only at the end do you worry about walking a bit faster. Java code is the same. The trips are calls to the network or disk, such as one database query per row (the N+1 problem). The route is your algorithm and data structure. The bags are objects you create, like boxed numbers. The walking tricks are micro-tuning, which the JIT compiler often does for you. After each change, you measure again.',
    keyPoints: [
      'Always start from a profile and fix the one hotspot it shows, not the code you suspect.',
      'Remove costs in order: network and disk round trips, then algorithms, then allocations, then micro-tricks.',
      'Measure again after each change, and undo changes that do not improve the number.',
    ],
    types: [
      {
        title: 'Levels of optimisation',
        items: [
          { name: 'I/O and remote calls', simple: 'Make fewer trips: one shopping trip with a list beats a trip for every ingredient.' },
          { name: 'Algorithmic', simple: 'A smarter method, like looking up a word in an index instead of reading the whole book.' },
          { name: 'Data structure', simple: 'The right container for the job, like a labelled key rack instead of a drawer full of keys.' },
          { name: 'Memory and allocation', simple: 'Create fewer throwaway objects, so the garbage collector, the cleaner, visits less often.' },
          { name: 'Caching', simple: 'Keep frequently used answers close by, like a sticky note, but throw out old ones.' },
          { name: 'Micro-level', simple: 'Polishing tiny details last; the JIT compiler usually does this for you already.' },
        ],
      },
      {
        title: 'Choosing a collection by access pattern',
        items: [
          { name: 'ArrayList', simple: 'A numbered row of boxes: fast to read by position and to add at the end.' },
          { name: 'ArrayDeque', simple: 'A queue you can add to or take from at either end, quickly.' },
          { name: 'HashMap / HashSet', simple: 'A coat check: find anything by its ticket almost instantly.' },
          { name: 'TreeMap / TreeSet', simple: 'A dictionary kept in alphabetical order, good for "everything between A and F".' },
          { name: 'Primitive arrays', simple: 'Plain numbers packed tightly side by side, with no wrapper objects: the fastest for big numeric data.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: 'micro-optimising everything',
      difference: 'Rewriting small expressions everywhere rarely helps and adds complexity. One fewer database round trip often saves more than thousands of tiny tweaks.',
    },
    tryIt: 'Find a loop that builds a `String` with `+=`. Replace it with a `StringBuilder`, then time both versions with 100,000 iterations and keep the change only if it is clearly faster.',
    recall: [
      { question: 'What usually costs the most in a slow request?', answer: 'Network and disk round trips, such as one database query per row.' },
      { question: 'What is the N+1 query problem?', answer: 'Running one query for a list and then one extra query for each item in it.' },
      { question: 'What should you do with a change that does not improve the measurement?', answer: 'Revert it, because it only adds complexity.' },
    ],
    picture: {
      title: 'Smart errands',
      caption: 'Cut trips first (network and disk), then shorten the route (algorithm), then carry less (fewer objects), and measure again each time.',
      items: [
        { icon: 'truck', label: 'Fewer trips', x: 13, y: 20, tone: 'success' },
        { icon: 'map', label: 'Fewer steps', x: 50, y: 20, tone: 'success' },
        { icon: 'boxes', label: 'Fewer objects', x: 87, y: 20, tone: 'success' },
        { icon: 'stopwatch', label: 'Measure', x: 50, y: 50, size: 0.7, tone: 'accent' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 3, dashed: true },
      ],
    },
  },
};
