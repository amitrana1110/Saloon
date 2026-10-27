import test from 'node:test';
import assert from 'node:assert/strict';
import {services,answerQuestion,whatsappMessage,money} from './salon.mjs';
test('starting prices require a final quote',()=>{assert.match(answerQuestion('What is the haircut price?'),/starting prices/);});
test('booking answers do not promise a confirmed slot',()=>{assert.match(answerQuestion('Book tomorrow'),/staff must confirm/);});
test('unknown questions hand off to staff',()=>{assert.match(answerQuestion('Is there wheelchair access?'),/don’t have verified information/);});
test('branch directions use Noida, Uttar Pradesh',()=>{assert.match(answerQuestion('Where is the salon?'),/Noida, Uttar Pradesh/);});
test('request message includes service, preferred date and confirmation request',()=>{const text=whatsappMessage({service:'Haircut',date:'2026-11-01',time:'11:00 AM',name:'Test',phone:'1234567890'});assert.match(text,/Sector 104, Noida/);assert.match(text,/Preferred date: 2026-11-01/);assert.match(text,/Please confirm availability/);});
test('service identifiers are unique and quotes handle unpriced consultations',()=>{assert.equal(new Set(services.map(s=>s.id)).size,services.length);assert.equal(money(null),'On consultation');});
