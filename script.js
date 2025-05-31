let originalCode = '';
let corruptedCode = '';

// 
function encodeData() {
    const input = document.getElementById("dataInput").value;
    if (!/^[01]{8}$/.test(input)) {
        alert("Lütfen 8 bitlik ikili veri giriniz.");
        return;
    }

    let code = [];
    code.length = 12;

    const dataBits = input.split('').map(Number);
    const dataMap = [2, 4, 5, 6, 8, 9, 10, 11];

    for (let i = 0; i < 8; i++) {
        code[dataMap[i]] = dataBits[i];
    }

    // parity bitleri
    code[0] = code[2] ^ code[4] ^ code[6] ^ code[8] ^ code[10];
    code[1] = code[2] ^ code[5] ^ code[6] ^ code[9] ^ code[10];
    code[3] = code[4] ^ code[5] ^ code[6] ^ code[11];
    code[7] = code[8] ^ code[9] ^ code[10] ^ code[11];

    originalCode = code.join('');
    corruptedCode = originalCode;

    document.getElementById("encodedOutput").innerText = originalCode;
}

// hata alma
function introduceError() {
    const bitIndex = parseInt(document.getElementById("errorBit").value);
    if (isNaN(bitIndex) || bitIndex < 0 || bitIndex > 11) {
        alert("0-11 arasında bir bit pozisyonu giriniz.");
        return;
    }

    let bits = corruptedCode.split('');
    bits[bitIndex] = bits[bitIndex] === '0' ? '1' : '0';
    corruptedCode = bits.join('');

    document.getElementById("corruptedOutput").innerText = corruptedCode;
}

// hexi binary formata çevirme
function hexToBinary(hex) {
    return hex.split('').map(h => {
        return parseInt(h, 16).toString(2).padStart(4, '0');
    }).join('');
}

// 32 bitlik veriyi çözümleme 
function encodeData32() {
    const input = document.getElementById("dataInput32").value;
    if (!/^[01]{32}$/.test(input)) {
        alert("Lütfen 32 bitlik ikili veri giriniz.");
        return;
    }

    let code = Array(39).fill(0); // 32 veri biti + 6 parity bit + 1 genel parity 
    const dataBits = input.split('').map(Number);

    // Parity bitlerinin pozisyonları: 0,1,3,7,15,31 (1,2,4,8,16,32)
    let dataIndex = 0;
    for (let i = 0; i < 39; i++) {
        if (![0,1,3,7,15,31,38].includes(i)) {
            code[i] = dataBits[dataIndex++];
        }
    }

    // Parity bitlerinin hesaplanması
    for (let p = 0; p < 6; p++) {
        let parityPos = Math.pow(2, p) - 1;
        let parity = 0;
        for (let i = 0; i < 39; i++) {
            if (i !== parityPos && ((i + 1) & (parityPos + 1))) {
                parity ^= code[i];
            }
        }
        code[parityPos] = parity;
    }

    // Genel parity biti 
    code[38] = code.slice(0, 38).reduce((a, b) => a ^ b, 0);

    originalCode = code.join('');
    corruptedCode = originalCode;
    document.getElementById("encodedOutput32").innerText = originalCode;
}

// 32 bitlik veride hata alma
function introduceError32() {
    const bitIndex = parseInt(document.getElementById("errorBit32").value);
    if (isNaN(bitIndex) || bitIndex < 0 || bitIndex > 38) {
        alert("0-38 arasında bir bit pozisyonu giriniz.");
        return;
    }
    let bits = corruptedCode.split('');
    bits[bitIndex] = bits[bitIndex] === '0' ? '1' : '0';
    corruptedCode = bits.join('');
    document.getElementById("corruptedOutput32").innerText = corruptedCode;
}

// 32 bitlik verinin hatasının kontrol edilmesi ve düzeltilmesi
function detectAndFix32() {
    let input = document.getElementById("corruptedOutput32").innerText.trim();
    if (!/^[01]{39}$/.test(input)) {
        alert("Lütfen 39 bitlik ikili kod giriniz.");
        return;
    }
    let bits = input.split('').map(Number);

    let errorPosition = 0;
    for (let p = 0; p < 6; p++) {
        let parityPos = Math.pow(2, p) - 1;
        let parity = 0;
        for (let i = 0; i < 39; i++) {
            if (i !== parityPos && ((i + 1) & (parityPos + 1))) {
                parity ^= bits[i];
            }
        }
        if (parity !== bits[parityPos]) {
            errorPosition += (parityPos + 1);
        }
    }

    if (errorPosition > 0 && errorPosition <= 39) {
        bits[errorPosition - 1] = bits[errorPosition - 1] ^ 1;
    }

    document.getElementById("correctedOutput32").innerText = bits.join('');
}

function detectAndFix() {
    let input = document.getElementById("corruptedOutput").innerText.trim();

    // Eğer input hexadecimal ise (örn: C32A gibi harf içeriyorsa)
    if (/^[0-9A-Fa-f]+$/.test(input) && input.length === 4) {
        input = hexToBinary(input); // 16 bitlik binary string'e çevir
    }

    // Sadece 12 veya 16 bitlik binary string için kontrol mekanizması
    if (!/^[01]{12,16}$/.test(input)) {
        alert("Lütfen 12 veya 16 bitlik ikili ya da 4 haneli hexadecimal kod giriniz.");
        return;
    }

    let bits = input.split('').map(Number);
    
    let errorPosition = 0;
    if (bits.length === 12) {
        let p1 = bits[0] ^ bits[2] ^ bits[4] ^ bits[6] ^ bits[8] ^ bits[10];
        let p2 = bits[1] ^ bits[2] ^ bits[5] ^ bits[6] ^ bits[9] ^ bits[10];
        let p4 = bits[3] ^ bits[4] ^ bits[5] ^ bits[6] ^ bits[11];
        let p8 = bits[7] ^ bits[8] ^ bits[9] ^ bits[10] ^ bits[11];
        errorPosition = p1 * 1 + p2 * 2 + p4 * 4 + p8 * 8;
    } else if (bits.length === 16) {
        let p1 = bits[0] ^ bits[2] ^ bits[4] ^ bits[6] ^ bits[8] ^ bits[10] ^ bits[12] ^ bits[14];
        let p2 = bits[1] ^ bits[2] ^ bits[5] ^ bits[6] ^ bits[9] ^ bits[10] ^ bits[13] ^ bits[14];
        let p4 = bits[3] ^ bits[4] ^ bits[5] ^ bits[6] ^ bits[11] ^ bits[12] ^ bits[13] ^ bits[14];
        let p8 = bits[7] ^ bits[8] ^ bits[9] ^ bits[10] ^ bits[11] ^ bits[12] ^ bits[13] ^ bits[14];
        let p16 = bits[15]; // ek parity biti
        errorPosition = p1 * 1 + p2 * 2 + p4 * 4 + p8 * 8;
    }

    if (errorPosition > 0 && errorPosition <= bits.length) {
        bits[errorPosition - 1] = bits[errorPosition - 1] ^ 1;
    }

    document.getElementById("correctedOutput").innerText = bits.join('');
}

function setCorruptedOutput() {
    const val = document.getElementById("manualInput").value.trim();
    document.getElementById("corruptedOutput").innerText = val;
    corruptedCode = val;
}