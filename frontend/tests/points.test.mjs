import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePoints } from '../src/utils/points.js';
const departments = ['a','b','c'].map(_id => ({ _id, name: _id }));
test('completed team result awards 10 and 5 points', () => {
 const rows = calculatePoints(departments, [{ status: 'Completed', type: 'team', teamA: 'a', teamB: 'b', winner: { _id: 'a' } }]);
 assert.deepEqual(rows.map(r => r.totalPoints), [10,5,0]);
});
test('ranked event awards 10/5/3 and medal counts', () => {
 const rows = calculatePoints(departments, [{ status: 'Completed', winner: 'a', runner: { _id:'b' }, thirdPlace:'c' }]);
 assert.deepEqual(rows.map(r => r.totalPoints), [10,5,3]); assert.equal(rows[2].bronze, 1);
});
test('draws and unfinished matches award no points; ties share rank', () => {
 const rows = calculatePoints(departments, [{ status:'Scheduled', winner:'a' }, { status:'Completed', type:'team', teamA:'a', teamB:'b' }]);
 assert.deepEqual(rows.map(r => r.totalPoints), [0,0,0]); assert.deepEqual(rows.map(r => r.rank), [1,1,1]);
});
test('sport filters and department IDs prevent unrelated aggregation', () => {
 const rows = calculatePoints([{_id:'a',name:'Same'}, {_id:'b',name:'Same'}], [{ status:'Completed', sportName:'Chess', winner:'a' }], 'Cricket');
 assert.equal(rows.length, 2); assert.equal(rows[0].totalPoints, 0);
});
