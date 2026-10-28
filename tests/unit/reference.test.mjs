import test from 'node:test';
import assert from 'node:assert/strict';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {reference} from '../../src/lib/data/reference.mjs';
import {brandNavigation,publicSections} from '../../src/lib/navigation/navigation.mjs';
test('all brand tabs are refreshable public sections and admin sections stay private',()=>{for(const [id] of brandNavigation)assert.ok(publicSections.includes(id));assert.ok(!publicSections.includes('media'));assert.ok(!publicSections.includes('dashboard'));assert.equal(new Set(publicSections).size,publicSections.length);});
test('original gallery and editorial assets exist locally',async()=>{const files=new Set([...reference.gallery.map(x=>x.url),...Object.values(reference.images).flat(),...reference.blogs.map(x=>x.image),...reference.news.map(x=>x.image),reference.videos[0]]);for(const url of files){assert.ok(url.startsWith('/images/original/'));assert.ok((await stat(path.join(process.cwd(),'public',url))).size>0,url);}});
test('branch directory distinguishes local booking and coming-soon locations',()=>{const local=reference.locations.filter(x=>x.localBooking);assert.equal(local.length,1);assert.match(local[0].address,/Sector 104, Noida/);assert.equal(local[0].phone,'9045673033');for(const loc of reference.locations){assert.ok(loc.name&&loc.region&&loc.source.startsWith('https://www.hmsalon.co.uk/'));if(loc.comingSoon)assert.equal(loc.phone,'');}});
