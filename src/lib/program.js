// Shared "program" model. A program = the split the user chose + the exercises
// they picked for each day (+ any rest days they inserted). It's the single
// source of truth the Plan page and Tracker both read/write, stored per-user.

import { getSplit } from '../data/splits.js'
import { getMuscleGroup } from '../data/exercises.js'

// localStorage suffixes (namespaced per-user by useUserStorage).
export const STORE = {
  program: 'program',       // { splitId, splitName, days: [...] }
  currentDay: 'currentDay', // index of the NEXT day to train
  history: 'history',       // [{ id, date, day, volume, sets, unit, exercises: [...] }]
  settings: 'settings',     // { unit: 'kg' | 'lb' }
}

// Turn a stored exercise reference into a full object with display info.
function makeExercise(name, muscleId) {
  const group = getMuscleGroup(muscleId)
  const ex = group?.exercises.find((e) => e.name === name)
  return {
    name,
    muscleId,
    muscle: group?.name ?? '',
    color: group?.color ?? 'var(--accent)',
    target: ex ? `${ex.sets} × ${ex.reps}` : '',
  }
}

// A rest day — no muscles, no exercises, just recovery.
export function makeRestDay() {
  return { type: 'rest', name: 'Rest Day', focus: [], exercises: [] }
}

// Every exercise available to a day, grouped by its target muscle groups.
export function poolForDay(focusIds) {
  return focusIds
    .map((id) => getMuscleGroup(id))
    .filter(Boolean)
    .map((group) => ({
      muscleId: group.id,
      muscle: group.name,
      color: group.color,
      exercises: group.exercises.map((ex) => makeExercise(ex.name, group.id)),
    }))
}

// The exercises a split day showcases: the first two from each target muscle
// group, capped. Used for read-only previews (split cards, landing pages) —
// buildDefaultProgram applies the same picking rule to build a real program.
export function exercisesForDay(focusIds, limit = 5) {
  const out = []
  focusIds.forEach((id) => {
    const group = getMuscleGroup(id)
    if (group) {
      group.exercises.slice(0, 2).forEach((ex) => out.push({ ...ex, color: group.color }))
    }
  })
  return out.slice(0, limit)
}

// Build a fresh program for a split, pre-selecting a sensible default set of
// exercises per day (the first two from each target muscle group, capped).
export function buildDefaultProgram(splitId) {
  const split = getSplit(splitId)
  if (!split) return null
  return {
    splitId,
    splitName: split.name,
    days: split.days.map((day) => {
      const picks = []
      // Fill the day rather than taking a flat two per group: a Bro Split
      // chest day targets one group and would otherwise generate two
      // exercises, contradicting the split's whole premise. Multi-focus days
      // are unaffected because the slice(0, 7) cap below still applies.
      const perGroup = Math.max(2, Math.ceil(7 / day.focus.length))
      day.focus.forEach((id) => {
        const group = getMuscleGroup(id)
        if (group)
          group.exercises.slice(0, perGroup).forEach((ex) => picks.push(makeExercise(ex.name, id)))
      })
      return { type: 'training', name: day.name, focus: day.focus, exercises: picks.slice(0, 7) }
    }),
  }
}

// Short, friendly label for a day, e.g. "Push", "Chest Day", "Upper A".
export function dayShortName(name) {
  return name.split(/[—(·]/)[0].trim()
}

// Find the most recent logged performance of an exercise across history
// (history is newest-first). Returns { sets, volume, top, date } or null.
export function findLastPerformance(history, exerciseName) {
  for (const entry of history) {
    const found = entry.exercises?.find((e) => e.name === exerciseName)
    if (found) return { ...found, date: entry.date, unit: entry.unit || 'kg' }
  }
  return null
}
