const fs = require('fs');

// ajuste os caminhos se necessário
const words = require('./words.json'); // lista exportada das palavras
const clues = require('./clues.json');

const missing = {};

for (const word of words) {
  if (!clues[word]) {
    missing[word] = `Definição de ${word}`;
  }
}

console.log('Total faltando:', Object.keys(missing).length);

fs.writeFileSync(
  './missing-clues.json',
  JSON.stringify(missing, null, 2)
);

console.log('Arquivo missing-clues.json criado 🚀');
