import {test} from 'node:test';
import assert from 'node:assert/strict';
import {namePassword} from '../lib/lantern/domain.mjs';
test('Hangul names use Korean keyboard keystrokes',()=>{assert.equal(namePassword('홍길동'),'ghdrlfehd');assert.equal(namePassword('가나다'),'rkskek');assert.equal(namePassword('괜'),'rhos');assert.equal(namePassword('나하늘'),'skgksmf');});
