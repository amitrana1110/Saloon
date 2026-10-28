import test from 'node:test';
import assert from 'node:assert/strict';
import {isSalonQuestion} from '../../src/lib/chat/scope.mjs';

test('salon scope allows beauty, grooming, business information and contextual follow-ups',()=>{
 for(const message of ['Hi','How can I book an appointment?','What helps frizzy hair?','Do you offer beard trims?','Bridal makeup price','Directions to Noida','How long does keratin take?','Opening hours','Can you recommend a facial?'])assert.equal(isSalonQuestion(message),true,message);
 const history=[{role:'user',content:'Tell me about balayage'},{role:'assistant',content:'It adds blended colour.'}];
 for(const message of ['How much?','Is it suitable for me?','Tell me more','What about maintenance?'])assert.equal(isSalonQuestion(message,history),true,message);
});
test('unrelated and mixed requests cannot use salon history or assistant text to bypass scope',()=>{
 const history=[{role:'user',content:'Haircut options'},{role:'assistant',content:'We offer haircuts.'}];
 for(const message of ['Explain React','Write code for a hair salon','What is the capital of France?','Solve 2+2','Translate this essay','Recommend stocks','What is the weather?'])assert.equal(isSalonQuestion(message,history),false,message);
 assert.equal(isSalonQuestion('Tell me more'),false);
 assert.equal(isSalonQuestion('Tell me more',[{role:'assistant',content:'Haircuts'}]),false);
});
