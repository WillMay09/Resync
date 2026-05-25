const FACTS: string[] = [
  'It takes an average of 23 minutes to refocus after a single interruption.',
  'The prefrontal cortex can only sustain deep focus for about 90 minutes before needing rest.',
  'Your brain uses 20% of your body\'s energy despite being only 2% of your mass.',
  'Deep work creates myelin — the insulation around neural pathways that makes skills permanent.',
  'Multitasking reduces productivity by up to 40% according to cognitive research.',
  'The default mode network activates during rest, enabling creative insight and problem-solving.',
  'Dopamine spikes from notifications hijack your attention circuits for up to 20 minutes.',
  'Flow states increase productivity by up to 500% according to McKinsey research.',
  'Your working memory can hold roughly 4 items at once — context switching dumps all of them.',
  'Consistent deep work practice physically enlarges attention-related brain regions.',
  'The Zeigarnik effect: unfinished tasks occupy mental bandwidth until completed or captured.',
  'Decision fatigue depletes the same mental resources used for focus and self-control.',
  'Blue light from screens suppresses melatonin, disrupting the sleep that consolidates learning.',
  'Neuroplasticity means your capacity for focus can be trained like a muscle.',
  'The anterior cingulate cortex — your brain\'s conflict monitor — fires less in practiced deep workers.',
  'Ultradian rhythms suggest 90-minute work blocks match your brain\'s natural energy cycles.',
  'Attentional residue: part of your mind stays on the previous task for several minutes after switching.',
  'Environmental cues prime behavior — a consistent workspace trains your brain to focus faster.',
  'The reticular activating system filters 99% of sensory input so you can concentrate.',
  'Adenosine buildup during focused work is cleared by sleep, not caffeine.',
  'Your brain processes 11 million bits of sensory information per second but only 50 bits consciously.',
  'Habit formation takes an average of 66 days of consistent practice.',
  'The locus coeruleus releases norepinephrine during focus, sharpening attention and memory encoding.',
  'Studies show that even the presence of a phone on your desk reduces cognitive capacity.',
  'Theta brain waves during deep concentration are the same waves present during REM sleep.',
  'The hippocampus consolidates short-term focus sessions into long-term skill during sleep.',
  'Cognitive load theory: working memory is limited, so eliminating distractions frees capacity for learning.',
  'Endorphins released after sustained focus create a sense of accomplishment and well-being.',
  'The basal ganglia automates repeated behaviors, making focus rituals easier over time.',
  'Research shows that starting is the hardest part — motivation often follows action, not the reverse.',
  'Your prefrontal cortex is most active in the first hours after waking.',
  'Spaced repetition of deep work sessions builds stronger neural connections than marathon sessions.',
];

export { FACTS };

export function getRandomFact(): string {
  return FACTS[Math.floor(Math.random() * FACTS.length)];
}
