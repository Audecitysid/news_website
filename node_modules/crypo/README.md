# Crypo

Crypo is a library that offers a wide range of data encryption and decryption methods.

## Installation

```sh
$ npm install crypo
```

## Supported methods
- A128
- MEGAN35
- GILA7
- TRIPO5
- AER256
- ARMON64

## Usage example
```javascript
const crypo = require('crypo');

crypo.encode('A128', 'Hello world!'); // DIH3+Iw6S41m+mQ3L2gsSbCC
crypo.decode('A128', 'DIH3+Iw6S41m+mQ3L2gsSbCC'); // Hello world!
```
