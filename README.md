# lru

LRU

## Installation

```bash
npm install --save llrruu
```

## Usage

```js
const LRU = require('llrruu');
const lru1 = new LRU(10);
const lru2 = new LRU({
    maxSize: 10,
    onEvict: (key, val) => { /**/ }
});
lru.set('a', 1); // `set` method will affect the order
lru.get('a'); // `get` method will affect the order
lru.val('a');
lru.remove('a');
lru.keys();
lru.size();
lru.clear();
```

## License

MIT
