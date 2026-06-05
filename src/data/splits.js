// Training split definitions, built from evidence-based hypertrophy research.
// Each split lists its days; each day targets one or more muscle groups (by id,
// matching the ids in exercises.js). The tracker and split pages read from this.

export const SPLITS = [
  {
    id: 'full-body',
    name: 'Full Body',
    level: 'Beginner',
    daysPerWeek: 3,
    frequency: 'Each muscle ~3×/week',
    tagline: 'Hit everything, every session.',
    description:
      'The best starting point. With only 3 sessions you train every major muscle each time, ' +
      'so frequency stays high and recovery is easy to manage. Ideal for beginners or busy weeks.',
    bestFor: ['Beginners', 'Training 2–3 days/week', 'Returning after a break'],
    days: [
      { name: 'Day A — Full Body', focus: ['quads', 'chest', 'back', 'shoulders', 'core'] },
      { name: 'Day B — Full Body', focus: ['hamstrings', 'back', 'chest', 'triceps', 'calves'] },
      { name: 'Day C — Full Body', focus: ['quads', 'shoulders', 'back', 'biceps', 'core'] },
    ],
  },
  {
    id: 'upper-lower',
    name: 'Upper / Lower',
    level: 'Intermediate',
    daysPerWeek: 4,
    frequency: 'Each muscle 2×/week',
    tagline: 'The best all-around balance.',
    description:
      'Splits training into upper-body and lower-body days. Run 4 days a week and every muscle ' +
      'gets trained twice — the frequency research shows is ideal — with volume spread evenly.',
    bestFor: ['Intermediate lifters', 'Training 4 days/week', 'Balanced strength + size'],
    days: [
      { name: 'Upper A', focus: ['chest', 'back', 'shoulders', 'biceps', 'triceps'] },
      { name: 'Lower A', focus: ['quads', 'hamstrings', 'calves', 'core'] },
      { name: 'Upper B', focus: ['back', 'chest', 'shoulders', 'triceps', 'biceps'] },
      { name: 'Lower B', focus: ['hamstrings', 'quads', 'calves', 'core'] },
    ],
  },
  {
    id: 'ppl',
    name: 'Push / Pull / Legs',
    level: 'Intermediate–Advanced',
    daysPerWeek: 6,
    frequency: 'Each muscle 2×/week',
    tagline: 'The most popular split for a reason.',
    description:
      'Organizes training by movement pattern: pushing muscles, pulling muscles, then legs. ' +
      'Run twice through the week (6 days) to train every muscle twice with high per-session volume.',
    bestFor: ['Intermediate–advanced', 'Training 5–6 days/week', 'Maximizing volume'],
    days: [
      { name: 'Push (Chest · Shoulders · Triceps)', focus: ['chest', 'shoulders', 'triceps'] },
      { name: 'Pull (Back · Biceps)', focus: ['back', 'biceps'] },
      { name: 'Legs (Quads · Hams · Calves)', focus: ['quads', 'hamstrings', 'calves'] },
      { name: 'Push (Chest · Shoulders · Triceps)', focus: ['chest', 'shoulders', 'triceps'] },
      { name: 'Pull (Back · Biceps)', focus: ['back', 'biceps'] },
      { name: 'Legs (Quads · Hams · Calves)', focus: ['quads', 'hamstrings', 'calves', 'core'] },
    ],
  },
  {
    id: 'bro-split',
    name: 'Bro Split',
    level: 'Advanced',
    daysPerWeek: 5,
    frequency: 'Each muscle 1×/week',
    tagline: 'One muscle, all the volume.',
    description:
      'Each session is dedicated to a single area, allowing lots of exercises and angles per muscle. ' +
      'Trains each muscle once a week, so it suits advanced lifters who want focused, high-volume days.',
    bestFor: ['Advanced lifters', 'Training 5 days/week', 'Focused muscle detail work'],
    days: [
      { name: 'Chest Day', focus: ['chest'] },
      { name: 'Back Day', focus: ['back'] },
      { name: 'Shoulder Day', focus: ['shoulders'] },
      { name: 'Leg Day', focus: ['quads', 'hamstrings', 'calves'] },
      { name: 'Arms Day', focus: ['biceps', 'triceps', 'core'] },
    ],
  },
]

export const getSplit = (id) => SPLITS.find((s) => s.id === id)
