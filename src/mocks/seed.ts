import type { Practice, PracticeCategory } from '../types/practice';

/**
 * Deterministic seed generator. We create 120 practices so FlashList's
 * recycling is exercised for real, not theoretically.
 *
 * Generation is deterministic (no Math.random) so tests and reloads see a
 * stable dataset.
 */
const CATEGORIES: PracticeCategory[] = [
  'movement',
  'breath',
  'reflection',
  'rest',
];

const TITLES: Record<PracticeCategory, string[]> = {
  movement: ['Morning Stretch', 'Walk', 'Yoga Flow', 'Mobility Drills'],
  breath: ['Box Breathing', 'Coherent Breathing', 'Wim Hof Round', 'Sigh Reset'],
  reflection: ['Gratitude Journal', 'Daily Review', 'Intention Setting', 'Free Write'],
  rest: ['Body Scan', 'Power Nap', 'Legs Up The Wall', 'Quiet Sitting'],
};

const DESCRIPTIONS = [
  'A short, focused practice to ground your attention and reset for the day ahead.',
  'Build consistency with a gentle routine you can return to anywhere, anytime.',
  'Release tension and bring awareness back to the body with steady, simple movement.',
  'Settle the nervous system and create a small pocket of calm in a busy schedule.',
  'A deliberate pause to notice how you feel and choose how you want to continue.',
];

export function createSeedPractices(count = 120): Practice[] {
  const practices: Practice[] = [];
  for (let i = 0; i < count; i++) {
    const category = CATEGORIES[i % CATEGORIES.length]!;
    const titleVariants = TITLES[category];
    const title = `${titleVariants[i % titleVariants.length]} #${i + 1}`;
    const description = DESCRIPTIONS[i % DESCRIPTIONS.length]!;
    const duration = [5, 10, 15, 20, 30][i % 5]!;

    // Pre-complete a handful so the Summary screen has data on first load.
    const preCompleted = i % 7 === 0;

    practices.push({
      id: `practice-${i + 1}`,
      title,
      description,
      duration_minutes: duration,
      category,
      completed_today: preCompleted,
      rating: preCompleted ? (((i % 5) + 1) as Practice['rating']) : null,
    });
  }
  return practices;
}
