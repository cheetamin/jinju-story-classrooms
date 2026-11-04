import {test} from 'node:test';import assert from 'node:assert/strict';
import {sendFeedbackWithTimeout} from '../lib/lantern/feedback-client.mjs';
test('a stalled feedback send is cancelled with a retryable message instead of waiting indefinitely',async()=>{let signal;await assert.rejects(sendFeedbackWithTimeout(s=>{signal=s;return new Promise(()=>{})},5),/다시 보내거나 그냥 나가도/);assert.equal(signal.aborted,true)});
test('successful feedback completes normally and server failures reach the retry UI',async()=>{assert.deepEqual(await sendFeedbackWithTimeout(async()=>({saved:true}),100),{saved:true});await assert.rejects(sendFeedbackWithTimeout(async()=>{throw Error('server error')},100),/server error/)});
