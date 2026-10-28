import test from 'node:test';
import assert from 'node:assert/strict';
import {legacySectionHref,brandNavigation,bookingHref} from '../../src/lib/navigation/navigation.mjs';
test('old public links reach their new website or booking-app destinations',()=>{
 for(const [id] of brandNavigation)assert.equal(legacySectionHref(id),'/'+id);
 assert.equal(legacySectionHref('booking'),bookingHref);
 assert.equal(legacySectionHref('home'),'/salon?section=home');
 assert.equal(legacySectionHref('gallery'),'/salon?section=gallery');
});
test('legacy service links preserve encoded filters while private and unknown destinations are rejected',()=>{
 const result=new URL(legacySectionHref('services',{q:'hair colour & care',category:'Hair'}),'https://salon.example');
 assert.equal(result.pathname,'/salon');assert.equal(result.searchParams.get('q'),'hair colour & care');assert.equal(result.searchParams.get('category'),'Hair');
 assert.equal(new URL(legacySectionHref('services',{q:'x'.repeat(200)}),'https://salon.example').searchParams.get('q').length,100);
 for(const section of ['admin','dashboard','media','https://evil.example','../admin',undefined])assert.equal(legacySectionHref(section),null);
});
