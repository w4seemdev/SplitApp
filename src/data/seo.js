// Search-facing copy for the split and muscle-group landing pages.
// Single source of truth: the React pages render from here, and
// scripts/prerender.mjs reads the same functions to bake static HTML,
// so the crawled markup and the hydrated app never drift.

import { SPLITS } from './splits.js'
import { MUSCLE_GROUPS, getMuscleGroup } from './exercises.js'

// The deployment's own origin, used for canonical tags, og:url, JSON-LD @ids
// and the sitemap. It MUST be the host actually serving the site: a wrong
// value here hands search engines a canonical pointing at somebody else's
// domain, quietly donating this deployment's ranking signal to them.
//
// Read from both worlds because this module is imported twice: by the Vite
// client bundle (import.meta.env) and directly by scripts/prerender.mjs under
// plain Node (process.env).
const siteUrlFromEnv =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SITE_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.VITE_SITE_URL) ||
  ''

export const SITE_URL = (siteUrlFromEnv || 'http://localhost:5173').replace(/\/+$/, '')

// Weekly volume guidance per muscle group, in the 10–20 set range the
// hypertrophy literature converges on, adjusted for how much indirect work
// each muscle already picks up from compounds.
const VOLUME = {
  chest: { sets: '12–20', note: 'Pressing at two angles (flat and incline) covers the whole pec.' },
  back: { sets: '14–22', note: 'Split it between vertical pulls (pulldowns) and horizontal pulls (rows).' },
  shoulders: { sets: '12–20', note: 'Side delts respond to high reps — most of this should be lateral raises.' },
  biceps: { sets: '8–16', note: 'Rows and pulldowns already hit the biceps, so direct work can stay lower.' },
  triceps: { sets: '8–16', note: 'Pressing covers a lot of this; add overhead work for the long head.' },
  quads: { sets: '12–20', note: 'Squat and press patterns first, then extensions to finish.' },
  hamstrings: { sets: '10–16', note: 'Balance a hip hinge (RDL) with a knee flexion movement (leg curl).' },
  calves: { sets: '10–16', note: 'They tolerate frequency well — spreading over 3 sessions beats one.' },
  core: { sets: '6–12', note: 'Heavy compounds already tax the trunk; treat direct work as a supplement.' },
}

// How many days per week each split gives a muscle group its own slot.
function weeklySessions(muscleId) {
  return SPLITS.map((s) => ({
    split: s,
    days: s.days.filter((d) => d.focus.includes(muscleId)).length,
  })).filter((x) => x.days > 0)
}

// ---------- Muscle group pages ----------

export function muscleSeo(muscleId) {
  const group = getMuscleGroup(muscleId)
  if (!group) return null

  const volume = VOLUME[muscleId] ?? { sets: '10–20', note: '' }
  const compounds = group.exercises.filter((e) => e.type === 'Compound')
  const isolations = group.exercises.filter((e) => e.type === 'Isolation')

  return {
    group,
    volume,
    compounds,
    isolations,
    path: `/exercises/${group.id}`,
    title: `Best ${group.name} Exercises — Sets, Reps & Weekly Volume`,
    heading: `Best ${group.name} Exercises`,
    description:
      `${group.exercises.length} proven ${group.name.toLowerCase()} exercises with recommended sets and reps, ` +
      `plus how many weekly sets to run and which training split fits.`,
    intro:
      `The ${group.name.toLowerCase()} (${group.anatomy.toLowerCase()}) are the ${group.blurb.charAt(0).toLowerCase()}${group.blurb.slice(1, -1)}. ` +
      `Below are ${group.exercises.length} exercises worth building a program around — ` +
      `${compounds.length} compound movement${compounds.length === 1 ? '' : 's'} to load heavy, and ` +
      `${isolations.length} isolation movement${isolations.length === 1 ? '' : 's'} to add volume without burning out.`,
    volumeHeading: `How many ${group.name.toLowerCase()} sets per week?`,
    volumeBody:
      `Aim for ${volume.sets} hard sets per week, spread across two sessions rather than one. ` +
      `Training a muscle twice a week beats once for growth at matched volume, and splitting the work ` +
      `keeps set quality higher than grinding it all out in a single session. ${volume.note}`,
    sessions: weeklySessions(muscleId),
    faq: [
      {
        q: `How often should I train ${group.name.toLowerCase()}?`,
        a: `About twice a week. That frequency lets you accumulate ${volume.sets} quality sets without any one session running so long that the last sets turn into junk volume.`,
      },
      {
        q: `Which ${group.name.toLowerCase()} exercise should I start with?`,
        a: compounds.length
          ? `Start the session with ${compounds[0].name} while you're fresh — it lets you move the most weight, and heavy compound work drives most of the growth. Save isolation work for the end.`
          : `Start with ${group.exercises[0].name}, and treat the rest as accessory volume once the main lifts of the day are done.`,
      },
      {
        q: 'What rep range builds the most muscle?',
        a: `Anywhere from 6 to 20 reps works as long as you finish sets close to failure — roughly 1–3 reps left in reserve. Keep heavier compounds at the low end of that range and isolation work at the high end, where the joints tolerate it better.`,
      },
    ],
  }
}

// ---------- Split pages ----------

export function splitSeo(splitId) {
  const split = SPLITS.find((s) => s.id === splitId)
  if (!split) return null

  // Every muscle group the split touches, in the order it first appears.
  const muscleIds = [...new Set(split.days.flatMap((d) => d.focus))]
  const muscles = muscleIds.map(getMuscleGroup).filter(Boolean)

  return {
    split,
    muscles,
    path: `/splits/${split.id}`,
    title: `${split.name} Split — Full ${split.daysPerWeek}-Day Workout Routine`,
    heading: `The ${split.name} Split`,
    description:
      `A complete ${split.daysPerWeek}-day ${split.name} routine: every training day, which muscles it hits, ` +
      `and the exact exercises with sets and reps. ${split.frequency}.`,
    intro: split.description,
    whoHeading: `Who the ${split.name} split is for`,
    progressHeading: 'How to progress on this split',
    progressBody:
      `Run the rotation in order and repeat it each week. On every exercise, try to beat what you did last ` +
      `session — one more rep at the same weight, or the same reps at a slightly heavier load. When you hit the ` +
      `top of the rep range on every set, add weight and drop back to the bottom of the range. That single rule, ` +
      `applied for months, is what actually drives growth; the split just organizes where the work happens.`,
    faq: [
      {
        q: `How many days a week is the ${split.name} split?`,
        a: `${split.daysPerWeek} days a week across ${split.days.length} different session${split.days.length === 1 ? '' : 's'}. ${split.frequency}.`,
      },
      {
        q: `Is the ${split.name} split good for ${split.level.toLowerCase()} lifters?`,
        a: `It's built for them. ${split.bestFor.join(', ')} — those are the situations where this structure works best. If your schedule or experience doesn't match, a different split will likely serve you better.`,
      },
      {
        q: 'What if I miss a day?',
        a: `Pick up where you left off rather than skipping ahead. The rotation matters more than the calendar — four sessions done in order beats four sessions forced onto specific weekdays.`,
      },
    ],
  }
}

export const ALL_SPLIT_SEO = SPLITS.map((s) => splitSeo(s.id))
export const ALL_MUSCLE_SEO = MUSCLE_GROUPS.map((m) => muscleSeo(m.id))
