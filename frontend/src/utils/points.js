const id = value => value?._id || value;
export function placements(match) {
  const winner = id(match.winner);
  const runner = id(match.runner) || (match.type === 'team' && winner ? [id(match.teamA), id(match.teamB)].find(value => value !== winner) : null);
  return [winner, runner, id(match.thirdPlace)];
}
export function calculatePoints(departments, matches, sportNameFilter = null) {
  const rows = new Map(departments.map(d => [d._id, { ...d, dept: d.name, gold: 0, silver: 0, bronze: 0, totalPoints: 0 }]));
  for (const match of matches) {
    if (match.status !== 'Completed' || (sportNameFilter && match.sportName !== sportNameFilter)) continue;
    placements(match).forEach((departmentId, index) => {
      const row = rows.get(departmentId);
      if (row) { row.totalPoints += [10, 5, 3][index]; row[['gold', 'silver', 'bronze'][index]]++; }
    });
  }
  const sorted = [...rows.values()].sort((a, b) => b.totalPoints - a.totalPoints || a.name.localeCompare(b.name));
  return sorted.map((row, index) => ({ ...row, rank: index && row.totalPoints === sorted[index - 1].totalPoints ? sorted.findIndex(r => r.totalPoints === row.totalPoints) + 1 : index + 1 }));
}
