import test from 'node:test';
import assert from 'node:assert/strict';
import {reference} from '../../src/lib/data/reference.mjs';
import {groupLocations,regionLabel} from '../../src/lib/data/locations.mjs';
test('regional grouping preserves every branch exactly once and keeps upcoming locations separate',()=>{
 const groups=groupLocations(reference.locations),rows=groups.flatMap(g=>g.locations);
 assert.equal(rows.length,reference.locations.length);assert.equal(new Set(rows).size,reference.locations.length);
 for(const group of groups)assert.ok(group.locations.every(location=>location.region===group.id));
 assert.equal(groups.at(-1).id,'Coming soon');assert.equal(groups.find(g=>g.id==='Delhi').locations.length,17);assert.equal(groups.find(g=>g.id==='Punjab').locations.length,11);
});
test('choosing a region returns only its branches and a named region search avoids partial city-name matches',()=>{
 assert.deepEqual(groupLocations(reference.locations,{region:'Delhi'}).map(g=>g.id),['Delhi']);
 const punjab=groupLocations(reference.locations,{query:'Punjab'});assert.deepEqual(punjab.map(g=>g.id),['Punjab']);assert.equal(punjab[0].locations.length,11);
});
test('area searches work across regions and empty matches do not produce empty groups',()=>{
 const groups=groupLocations(reference.locations,{query:'Noida 104'});
 assert.equal(groups.length,1);assert.equal(groups[0].id,'Noida');assert.equal(groups[0].locations.length,1);assert.equal(groups[0].locations[0].localBooking,true);
 assert.deepEqual(groupLocations(reference.locations,{query:'No-such-salon-98765'}),[]);
});
test('region display labels remain readable without changing the underlying directory identifiers',()=>{
 assert.equal(regionLabel('Madhya pradesh'),'Madhya Pradesh');assert.equal(regionLabel('J&K'),'Jammu & Kashmir');
 assert.equal(groupLocations(reference.locations,{query:'Jammu & Kashmir'})[0].id,'J&K');
});
