import { User, MatchResult } from './types';

export function calculateMatchScore(currentUser: User, targetUser: User): MatchResult {
  let area = 0;
  let instrument = 0;
  let genre = 0;
  let skill = 0;
  let schedule = 0;

  // Area score (max 50)
  if (currentUser.prefecture === targetUser.prefecture) {
    area = 35;
    if (currentUser.city === targetUser.city) {
      area = 50;
    }
  }

  // Instrument score (max 25) - complementary instruments score higher
  const currentInstruments = currentUser.instruments.map((i) => i.instrument);
  const targetInstruments = targetUser.instruments.map((i) => i.instrument);
  const hasOverlap = currentInstruments.some((i) => targetInstruments.includes(i));
  const hasDifferent = currentInstruments.some((i) => !targetInstruments.includes(i));
  if (hasDifferent && !hasOverlap) {
    instrument = 25; // Complementary - best for band formation
  } else if (hasDifferent && hasOverlap) {
    instrument = 15;
  } else {
    instrument = 5; // Same instruments
  }

  // Genre score (max 30)
  const commonGenres = currentUser.genres.filter((g) => targetUser.genres.includes(g));
  genre = Math.min(30, (commonGenres.length / Math.max(currentUser.genres.length, 1)) * 30);

  // Skill score (max 15) - similar skill levels match better
  const skillMap = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
  if (currentUser.instruments.length > 0 && targetUser.instruments.length > 0) {
    const currentSkill = skillMap[currentUser.instruments[0].skillLevel];
    const targetSkill = skillMap[targetUser.instruments[0].skillLevel];
    const diff = Math.abs(currentSkill - targetSkill);
    skill = Math.max(0, 15 - diff * 5);
  }

  // Schedule score (max 35)
  const currentDays = currentUser.schedule.map((s) => s.day);
  const targetDays = targetUser.schedule.map((s) => s.day);
  const commonDays = currentDays.filter((d) => targetDays.includes(d));
  if (commonDays.length > 0) {
    schedule = Math.min(35, (commonDays.length / Math.max(currentDays.length, 1)) * 35);
    // Bonus for overlapping time ranges
    commonDays.forEach((day) => {
      const cs = currentUser.schedule.find((s) => s.day === day);
      const ts = targetUser.schedule.find((s) => s.day === day);
      if (cs && ts) {
        const cStart = parseInt(cs.startTime.replace(':', ''));
        const cEnd = parseInt(cs.endTime.replace(':', ''));
        const tStart = parseInt(ts.startTime.replace(':', ''));
        const tEnd = parseInt(ts.endTime.replace(':', ''));
        if (cStart < tEnd && tStart < cEnd) {
          schedule = Math.min(35, schedule + 5);
        }
      }
    });
  }

  const total = Math.round(area + instrument + genre + skill + schedule);

  return {
    user: targetUser,
    score: Math.min(100, total),
    breakdown: {
      area: Math.round(area),
      instrument: Math.round(instrument),
      genre: Math.round(genre),
      skill: Math.round(skill),
      schedule: Math.round(schedule),
    },
  };
}

export function findMatches(currentUser: User, allUsers: User[]): MatchResult[] {
  return allUsers
    .filter((u) => u.id !== currentUser.id)
    .map((u) => calculateMatchScore(currentUser, u))
    .sort((a, b) => b.score - a.score);
}
