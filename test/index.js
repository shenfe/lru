/**
 * Copied and modified from: https://github.com/chriso/lru/blob/master/test/lru-test.js
 */

const assert = require('assert');
const vows = require('vows');
const LRU = require('../');

const suite = vows.describe('LRU');

suite.addBatch({
    'clear() sets the cache to its initial state': function () {
        const lru = new LRU(2);
        const json1 = JSON.stringify(lru);
        lru.set('foo', 'bar');
        lru.clear();
        const json2 = JSON.stringify(lru);
        assert.equal(json2, json1);
    }
});

suite.addBatch({
    'setting keys doesn\'t grow past max size': function () {
        const lru = new LRU(3);
        assert.equal(0, lru.size());
        lru.set('foo1', 'bar1');
        assert.equal(1, lru.size());
        lru.set('foo2', 'bar2');
        assert.equal(2, lru.size());
        lru.set('foo3', 'bar3');
        assert.equal(3, lru.size());
        lru.set('foo4', 'bar4');
        assert.equal(3, lru.size());
    }
});

suite.addBatch({
    'setting keys returns the value': function () {
        const lru = new LRU(2);
        assert.equal('bar1', lru.set('foo1', 'bar1'));
        assert.equal('bar2', lru.set('foo2', 'bar2'));
        assert.equal('bar3', lru.set('foo3', 'bar3'));
        assert.equal('bar2', lru.get('foo2'));
        assert.equal(undefined, lru.get('foo1'));
        assert.equal('bar1', lru.set('foo1', 'bar1'));
    }
});

suite.addBatch({
    'lru invariant is maintained for set()': function () {
        const lru = new LRU(2);
        lru.set('foo1', 'bar1');
        lru.set('foo2', 'bar2');
        lru.set('foo3', 'bar3');
        lru.set('foo4', 'bar4');
        assert.deepEqual(['foo3', 'foo4'], lru.keys());
    }
});

suite.addBatch({
    'ovrewriting a key updates the value': function () {
        const lru = new LRU(2);
        lru.set('foo1', 'bar1');
        assert.equal('bar1', lru.get('foo1'));
        lru.set('foo1', 'bar2');
        assert.equal('bar2', lru.get('foo1'));
    }
});

suite.addBatch({
    'lru invariant is maintained for get()': function () {
        const lru = new LRU(2);
        lru.set('foo1', 'bar1');
        lru.set('foo2', 'bar2');
        lru.get('foo1'); // now foo2 should be deleted instead of foo1
        lru.set('foo3', 'bar3');
        assert.deepEqual(['foo1', 'foo3'], lru.keys());
    },
    'lru invariant is maintained after set(), get() and remove()': function () {
        const lru = new LRU(2);
        lru.set('a', 1);
        lru.set('b', 2);
        assert.deepEqual(lru.get('a'), 1);
        lru.remove('a');
        lru.set('c', 1);
        lru.set('d', 1);
        assert.deepEqual(['c', 'd'], lru.keys());
    }
});

suite.addBatch({
    'lru invariant is maintained in the corner case size == 1': function () {
        const lru = new LRU(1);
        lru.set('foo1', 'bar1');
        lru.set('foo2', 'bar2');
        lru.get('foo2'); // now foo2 should be deleted instead of foo1
        lru.set('foo3', 'bar3');
        assert.deepEqual(['foo3'], lru.keys());
    }
});

suite.addBatch({
    'get() returns item value': function () {
        const lru = new LRU(2);
        assert.equal(lru.set('foo', 'bar'), 'bar');
    }
});

suite.addBatch({
    'val() returns item value without changing the order': function () {
        const lru = new LRU(2);
        lru.set('foo', 'bar');
        lru.set('bar', 'baz');
        assert.equal(lru.val('foo'), 'bar');
        lru.set('baz', 'foo');
        assert.equal(lru.get('foo'), null);
    }
});

suite.addBatch({
    'idempotent changes': {
        'set() and remove() on empty LRU is idempotent': function () {
            const lru = new LRU();
            const json1 = JSON.stringify(lru);
            lru.set('foo1', 'bar1');
            lru.remove('foo1');
            const json2 = JSON.stringify(lru);
            assert.deepEqual(json2, json1);
        },

        '2 set()s and 2 remove()s on empty LRU is idempotent': function () {
            const lru = new LRU();
            const json1 = JSON.stringify(lru);
            lru.set('foo1', 'bar1');
            lru.set('foo2', 'bar2');
            lru.remove('foo1');
            lru.remove('foo2');
            const json2 = JSON.stringify(lru);
            assert.deepEqual(json2, json1);
        },

        '2 set()s and 2 remove()s (in opposite order) on empty LRU is idempotent': function () {
            const lru = new LRU();
            const json1 = JSON.stringify(lru);
            lru.set('foo1', 'bar1');
            lru.set('foo2', 'bar2');
            lru.remove('foo2');
            lru.remove('foo1');
            const json2 = JSON.stringify(lru);
            assert.deepEqual(json2, json1);
        },

        'after setting one key, get() is idempotent': function () {
            const lru = new LRU(2);
            lru.set('a', 'a');
            const json1 = JSON.stringify(lru);
            lru.get('a');
            const json2 = JSON.stringify(lru);
            assert.equal(json2, json1);
        },

        'after setting two keys, get() on last-set key is idempotent': function () {
            const lru = new LRU(2);
            lru.set('a', 'a');
            lru.set('b', 'b');
            const json1 = JSON.stringify(lru);
            lru.get('b');
            const json2 = JSON.stringify(lru);
            assert.equal(json2, json1);
        }
    }
});

suite.addBatch({
    'pop event': {
        '\'pop\' event is fired when popping old keys': function () {
            const events = [];
            const lru = new LRU({
                maxSize: 2,
                onPop: (key, value) => events.push({ key, value })
            });
            lru.set('foo1', 'bar1');
            lru.set('foo2', 'bar2');
            lru.set('foo3', 'bar3');
            lru.set('foo4', 'bar4');
            const expect = [
                { key: 'foo1', value: 'bar1' },
                { key: 'foo2', value: 'bar2' }
            ];
            assert.deepEqual(events, expect);
        }
    }
});

suite.export(module);
