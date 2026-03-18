const inputs = {
    numer_sprawy: { value: '' },
    adresat: { value: '' },
    adres_cz1: { value: '' },
    adres_cz2: { value: '' },
    kod_pocztowy: { value: '' },
    poczta: { value: '' },
    uwagi_potwierdzenia: { value: '' },
    dotyczy_potwierdzenia: { value: '' }
};

const ITERATIONS = 1000000;

function clear1() {
    Object.values(inputs).forEach(input => input.value = '');
}

function clear2() {
    for (const key in inputs) {
        inputs[key].value = '';
    }
}

// Warm up
for (let i = 0; i < 10000; i++) clear1();
for (let i = 0; i < 10000; i++) clear2();

console.time('Object.values');
for (let i = 0; i < ITERATIONS; i++) {
    clear1();
}
console.timeEnd('Object.values');

console.time('for...in');
for (let i = 0; i < ITERATIONS; i++) {
    clear2();
}
console.timeEnd('for...in');
