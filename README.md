# lru

LRU (Least Recently Used) Cache.

## Installation

```bash
npm install --save llrruu
```

## Usage

### import

```js
const LRU = require('llrruu');
```

### create

The module exported is both a constructor and a factory function. It accepts either a number or an object.

```js
const lru1 = new LRU(10);
const lru2 = LRU(10);
const lru3 = LRU({
    maxSize: 10,
    onEvict: (key, val) => console.log(`${key} is being kicked out, with its value `, val)
});
```

### api

```js
lru.set('a', 1);    // will affect the order
lru.get('a');       // will affect the order
lru.val('a', 1);
lru.val('a');
lru.remove('a');
lru.keys();
lru.size();
lru.clear();
```

## License

MIT
