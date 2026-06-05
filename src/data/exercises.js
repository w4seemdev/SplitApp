// Exercise database, organized by muscle group.
// Each muscle group has an id, display name, the anatomy it covers,
// and a list of exercises. Built from evidence-based training research.

export const MUSCLE_GROUPS = [
  {
    id: 'chest',
    name: 'Chest',
    anatomy: 'Pectoralis major & minor',
    blurb: 'Big fan-shaped muscles that press and push the arms across the body.',
    color: '#ff4d2e',
    exercises: [
      { name: 'Barbell Bench Press', type: 'Compound', equipment: 'Barbell', sets: '3–4', reps: '6–10' },
      { name: 'Incline Dumbbell Press', type: 'Compound', equipment: 'Dumbbell', sets: '3–4', reps: '8–12' },
      { name: 'Chest Dips', type: 'Compound', equipment: 'Bodyweight', sets: '3', reps: '8–12' },
      { name: 'Cable Fly', type: 'Isolation', equipment: 'Cable', sets: '3', reps: '12–15' },
      { name: 'Push-Up', type: 'Compound', equipment: 'Bodyweight', sets: '3', reps: '10–20' },
      { name: 'Machine Chest Press', type: 'Compound', equipment: 'Machine', sets: '3', reps: '10–12' },
    ],
  },
  {
    id: 'back',
    name: 'Back',
    anatomy: 'Lats, traps, rhomboids, erectors',
    blurb: 'The wing-shaped lats and upper-back muscles that build the V-taper and pull.',
    color: '#2e8bff',
    exercises: [
      { name: 'Pull-Up', type: 'Compound', equipment: 'Bodyweight', sets: '3–4', reps: '6–12' },
      { name: 'Barbell Row', type: 'Compound', equipment: 'Barbell', sets: '3–4', reps: '6–10' },
      { name: 'Lat Pulldown', type: 'Compound', equipment: 'Cable', sets: '3', reps: '10–12' },
      { name: 'Seated Cable Row', type: 'Compound', equipment: 'Cable', sets: '3', reps: '10–12' },
      { name: 'Deadlift', type: 'Compound', equipment: 'Barbell', sets: '3', reps: '4–6' },
      { name: 'Single-Arm Dumbbell Row', type: 'Compound', equipment: 'Dumbbell', sets: '3', reps: '8–12' },
    ],
  },
  {
    id: 'shoulders',
    name: 'Shoulders',
    anatomy: 'Front, side & rear deltoids',
    blurb: 'Three-headed deltoids that move the arm in nearly every direction.',
    color: '#ffb02e',
    exercises: [
      { name: 'Overhead Press', type: 'Compound', equipment: 'Barbell', sets: '3–4', reps: '6–10' },
      { name: 'Dumbbell Shoulder Press', type: 'Compound', equipment: 'Dumbbell', sets: '3', reps: '8–12' },
      { name: 'Lateral Raise', type: 'Isolation', equipment: 'Dumbbell', sets: '3–4', reps: '12–20' },
      { name: 'Face Pull', type: 'Isolation', equipment: 'Cable', sets: '3', reps: '15–20' },
      { name: 'Reverse Pec Deck', type: 'Isolation', equipment: 'Machine', sets: '3', reps: '12–15' },
      { name: 'Front Raise', type: 'Isolation', equipment: 'Dumbbell', sets: '3', reps: '12–15' },
    ],
  },
  {
    id: 'biceps',
    name: 'Biceps',
    anatomy: 'Biceps brachii, brachialis',
    blurb: 'Front-of-arm muscles that flex the elbow and supinate the forearm.',
    color: '#9b5cff',
    exercises: [
      { name: 'Barbell Curl', type: 'Isolation', equipment: 'Barbell', sets: '3', reps: '8–12' },
      { name: 'Dumbbell Hammer Curl', type: 'Isolation', equipment: 'Dumbbell', sets: '3', reps: '10–12' },
      { name: 'Incline Dumbbell Curl', type: 'Isolation', equipment: 'Dumbbell', sets: '3', reps: '10–12' },
      { name: 'Cable Curl', type: 'Isolation', equipment: 'Cable', sets: '3', reps: '12–15' },
      { name: 'Preacher Curl', type: 'Isolation', equipment: 'Machine', sets: '3', reps: '10–12' },
    ],
  },
  {
    id: 'triceps',
    name: 'Triceps',
    anatomy: 'Triceps brachii (3 heads)',
    blurb: 'Two-thirds of your upper-arm mass — they extend the elbow.',
    color: '#22c1a6',
    exercises: [
      { name: 'Close-Grip Bench Press', type: 'Compound', equipment: 'Barbell', sets: '3', reps: '8–10' },
      { name: 'Triceps Pushdown', type: 'Isolation', equipment: 'Cable', sets: '3', reps: '10–15' },
      { name: 'Overhead Cable Extension', type: 'Isolation', equipment: 'Cable', sets: '3', reps: '10–15' },
      { name: 'Skull Crusher', type: 'Isolation', equipment: 'Barbell', sets: '3', reps: '8–12' },
      { name: 'Bench Dips', type: 'Compound', equipment: 'Bodyweight', sets: '3', reps: '10–15' },
    ],
  },
  {
    id: 'quads',
    name: 'Quads',
    anatomy: 'Quadriceps femoris',
    blurb: 'Front-thigh muscles that extend the knee — your biggest leg movers.',
    color: '#ff4d8d',
    exercises: [
      { name: 'Back Squat', type: 'Compound', equipment: 'Barbell', sets: '3–4', reps: '5–10' },
      { name: 'Leg Press', type: 'Compound', equipment: 'Machine', sets: '3', reps: '10–15' },
      { name: 'Walking Lunge', type: 'Compound', equipment: 'Dumbbell', sets: '3', reps: '10–12' },
      { name: 'Leg Extension', type: 'Isolation', equipment: 'Machine', sets: '3', reps: '12–15' },
      { name: 'Bulgarian Split Squat', type: 'Compound', equipment: 'Dumbbell', sets: '3', reps: '8–12' },
    ],
  },
  {
    id: 'hamstrings',
    name: 'Hamstrings & Glutes',
    anatomy: 'Hamstrings, gluteus maximus',
    blurb: 'Back-thigh and hip muscles that extend the hip and bend the knee.',
    color: '#f2545b',
    exercises: [
      { name: 'Romanian Deadlift', type: 'Compound', equipment: 'Barbell', sets: '3–4', reps: '8–12' },
      { name: 'Hip Thrust', type: 'Compound', equipment: 'Barbell', sets: '3', reps: '8–12' },
      { name: 'Lying Leg Curl', type: 'Isolation', equipment: 'Machine', sets: '3', reps: '10–15' },
      { name: 'Seated Leg Curl', type: 'Isolation', equipment: 'Machine', sets: '3', reps: '12–15' },
      { name: 'Glute Bridge', type: 'Isolation', equipment: 'Bodyweight', sets: '3', reps: '12–20' },
    ],
  },
  {
    id: 'calves',
    name: 'Calves',
    anatomy: 'Gastrocnemius, soleus',
    blurb: 'Lower-leg muscles that point the foot and stabilize the ankle.',
    color: '#4dd0a7',
    exercises: [
      { name: 'Standing Calf Raise', type: 'Isolation', equipment: 'Machine', sets: '4', reps: '12–15' },
      { name: 'Seated Calf Raise', type: 'Isolation', equipment: 'Machine', sets: '4', reps: '15–20' },
      { name: 'Leg Press Calf Raise', type: 'Isolation', equipment: 'Machine', sets: '3', reps: '15–20' },
    ],
  },
  {
    id: 'core',
    name: 'Core',
    anatomy: 'Rectus abdominis, obliques',
    blurb: 'Trunk muscles that transfer force and stabilize every heavy lift.',
    color: '#ffd23f',
    exercises: [
      { name: 'Hanging Leg Raise', type: 'Isolation', equipment: 'Bodyweight', sets: '3', reps: '10–15' },
      { name: 'Cable Crunch', type: 'Isolation', equipment: 'Cable', sets: '3', reps: '12–20' },
      { name: 'Plank', type: 'Isolation', equipment: 'Bodyweight', sets: '3', reps: '30–60s' },
      { name: 'Pallof Press', type: 'Isolation', equipment: 'Cable', sets: '3', reps: '10–12' },
      { name: 'Russian Twist', type: 'Isolation', equipment: 'Bodyweight', sets: '3', reps: '15–20' },
    ],
  },
]

// Quick lookup helper: find a muscle group object by its id.
export const getMuscleGroup = (id) => MUSCLE_GROUPS.find((m) => m.id === id)

// Flattened list of every exercise tagged with its muscle group — handy for search.
export const ALL_EXERCISES = MUSCLE_GROUPS.flatMap((group) =>
  group.exercises.map((ex) => ({
    ...ex,
    muscle: group.name,
    muscleId: group.id,
    color: group.color,
  }))
)
