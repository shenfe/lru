var LRU = function (config) {
    if (!(this instanceof LRU)) return new LRU(config);
    config = config || {};
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
        if (tailNode.prev) {
            tailKey = tailNode.prev;
            keyNodes[tailKey].next = null;
        } else {
            tailKey = headKey = null;
        }
    };
    this.set = function (key, val) {
        if (have(key)) {
            var node = keyNodes[key];
            node.value = val;
            if (key === headKey) return;
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
            return;
        }
        /* If the key doesn't exist */
        size++;
        var node = {
            // key: key,
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
    };
    this.get = function (key) {};
};