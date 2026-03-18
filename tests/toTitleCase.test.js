const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Read index.html
const htmlPath = path.join(__dirname, '../index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

// Extract script content
const scriptMatch = htmlContent.match(/<script type="module">([\s\S]*?)<\/script>/);

if (!scriptMatch) {
    throw new Error('Could not find script block in index.html');
}

const scriptContent = scriptMatch[1];

// Extract toTitleCase function
const functionStartIdx = scriptContent.indexOf('function toTitleCase(str) {');
if (functionStartIdx === -1) {
    throw new Error('Could not find toTitleCase function in the script');
}

let braceCount = 0;
let functionEndIdx = -1;
let started = false;

for (let i = functionStartIdx; i < scriptContent.length; i++) {
    if (scriptContent[i] === '{') {
        braceCount++;
        started = true;
    } else if (scriptContent[i] === '}') {
        braceCount--;
    }

    if (started && braceCount === 0) {
        functionEndIdx = i + 1;
        break;
    }
}

if (functionEndIdx === -1) {
    throw new Error('Could not parse toTitleCase function');
}

const functionCode = scriptContent.substring(functionStartIdx, functionEndIdx);

// Execute in sandbox
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(functionCode, sandbox);
const toTitleCase = sandbox.toTitleCase;

describe('toTitleCase utility function', () => {
    test('handles empty strings and falsy values correctly', () => {
        expect(toTitleCase('')).toBe('');
        expect(toTitleCase(null)).toBe('');
        expect(toTitleCase(undefined)).toBe('');
    });

    test('capitalizes simple names', () => {
        expect(toTitleCase('anna')).toBe('Anna');
        expect(toTitleCase('KOWALSKA')).toBe('Kowalska');
        expect(toTitleCase('jAN nOWAK')).toBe('Jan Nowak');
    });

    test('handles names with multiple spaces', () => {
        expect(toTitleCase('anna kowalska')).toBe('Anna Kowalska');
        expect(toTitleCase('jan     kowalski')).toBe('Jan     Kowalski');
        expect(toTitleCase('  jan  kowalski  ')).toBe('  Jan  Kowalski  ');
    });

    test('handles hyphenated names', () => {
        expect(toTitleCase('anna-kowalska')).toBe('Anna-Kowalska');
        expect(toTitleCase('NOWAK-KOWALSKA')).toBe('Nowak-Kowalska');
        expect(toTitleCase('anna-maria-joanna')).toBe('Anna-Maria-Joanna');
    });

    test('handles names with apostrophes', () => {
        expect(toTitleCase("d'artagnan")).toBe("D'Artagnan");
        expect(toTitleCase("o'connor")).toBe("O'Connor");
    });

    test('handles Polish diacritics', () => {
        expect(toTitleCase('łukasz')).toBe('Łukasz');
        expect(toTitleCase('śledź')).toBe('Śledź');
        expect(toTitleCase('żółć')).toBe('Żółć');
        expect(toTitleCase('michał-łukasz')).toBe('Michał-Łukasz');
        expect(toTitleCase('żaneta łącka')).toBe('Żaneta Łącka');
    });

    test('handles mixed separators', () => {
        expect(toTitleCase("anna-maria o'connor")).toBe("Anna-Maria O'Connor");
        expect(toTitleCase("jean-luc d'artagnan")).toBe("Jean-Luc D'Artagnan");
    });
});
