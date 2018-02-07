var LRU = function (config) {
    if (!(this instanceof LRU)) return new LRU(config);
    config = config || {};
    if (typeof config === 'number') config = { maxSize: config };
    var maxSize = config.maxSize || 100;
    var onPop = config.onPop || function (key, val) {};
    var keyNodes = {};
    var size = 0;
    var headKey = null;
    var tailKey = null;
    var have = function (key) {
        return keyNodes.hasOwnProperty(key);
    };
    /* Remove the tail */
    var pop = function () {
        if (tailKey === null) return;
        var tailNode = keyNodes[tailKey];
        onPop(tailKey, tailNode.value);
        size--;
        delete keyNodes[tailKey];
        if (tailNode.prev != null) {
            tailKey = tailNode.prev;
            keyNodes[tailKey].next = null;
        } else {
            tailKey = headKey = null;
        }
        free(tailNode);
    };
    var set = function (key, val) {
        if (have(key)) {
            var node = keyNodes[key];
            node.value = val;
            if (key === headKey) return val;
            var prevNode = keyNodes[node.prev];
            if (key === tailKey) {
                tailKey = node.prev;
                prevNode.next = null;
            } else {
                var nextNode = keyNodes[node.next];
                prevNode.next = node.next;
                nextNode.prev = node.prev;
            }
            /* Make it become the head */
            node.prev = null;
            node.next = headKey;
            keyNodes[headKey].prev = key;
            headKey = key;
            return val;
        }
        /* If the key doesn't exist */
        size++;
        var node = {
            value: val,
            prev: null,
            next: null
        };
        keyNodes[key] = node;
        if (size === 1) {
            headKey = tailKey = key;
        } else {
            node.next = headKey;
            keyNodes[headKey].prev = key;
            headKey = key;
        }
        if (size > maxSize) {
            pop();
        }
        return val;
    };
    var free = function (node) {
        node.value = null;
        node.prev = null;
        node.next = null;
    };
    var valueOf = function (key) {
        if (!have(key)) return;
        return keyNodes[key].value;
    };
    var get = function (key) {
        if (!have(key)) return;
        var val = valueOf(key);
        set(key, val);
        return val;
    };
    var remove = function (key) {
        if (!have(key)) return false;
        var node = keyNodes[key];
        size--;
        delete keyNodes[key];
        if (node.next == null) { /* It is the tail */
            if (node.prev == null) { /* It is also the head */
                headKey = tailKey = null;
            } else { /* It is not the head */
                tailKey = node.prev;
                keyNodes[tailKey].next = null;
            }
        } else { /* It is not the tail */
            if (node.prev == null) { /* It is the head */
                headKey = node.next;
                keyNodes[headKey].prev = null;
            } else { /* It is not the head */
                keyNodes[node.prev].next = node.next;
                keyNodes[node.next].prev = node.prev;
            }
        }
        free(node);
    };
    var clear = function () {
        keyNodes = {};
        size = 0;
        headKey = null;
        tailKey = null;
    };
    var keySet = function () {
        var keys = [];
        var p = tailKey;
        while (p != null) {
            keys.push(p);
            p = keyNodes[p].prev;
        }
        return keys;
    };

    this.set = set;
    this.val = valueOf;
    this.get = get;
    this.remove = remove;
    this.clear = clear;
    this.size = function () {
        return size;
    };
    this.keys = keySet;
};

module.exports = LRU;
