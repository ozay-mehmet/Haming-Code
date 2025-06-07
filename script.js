let originalCode8 = ''; // 8-bit için
let corruptedCode8 = ''; // 8-bit için

let originalCode16 = ''; // 16-bit için
let corruptedCode16 = ''; // 16-bit için

let originalCode32 = ''; // 32-bit için
let corruptedCode32 = ''; // 32-bit için

function showSection(sectionIdToShow) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none'; 
    });
    const sectionToShow = document.getElementById(sectionIdToShow);
    if (sectionToShow) {
        sectionToShow.style.display = 'block'; 
    }

    const navButtons = document.querySelectorAll('nav button');
    navButtons.forEach(button => {
        button.classList.remove('active');
    });

    const activeButtonId = 'btn-nav-' + sectionIdToShow.substring('section-'.length);
    const activeButton = document.getElementById(activeButtonId);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

window.onload = () => {
    showSection('section-8bit'); 
    const outputIds = [
        "encodedOutput", "corruptedOutput", "correctedOutput",
        "encodedOutput16", "corruptedOutput16", "correctedOutput16",
        "encodedOutput32", "corruptedOutput32", "correctedOutput32"
    ];
    outputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = ""; 
    });
};

// 8-bit Veri Kodlama 
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

    // Eşlik bitleri (P1, P2, P4, P8)
    code[0] = code[2] ^ code[4] ^ code[6] ^ code[8] ^ code[10]; 
    code[1] = code[2] ^ code[5] ^ code[6] ^ code[9] ^ code[10]; 
    code[3] = code[4] ^ code[5] ^ code[6] ^ code[11];          
    code[7] = code[8] ^ code[9] ^ code[10] ^ code[11];         

    originalCode8 = code.join('');
    corruptedCode8 = originalCode8;

    document.getElementById("encodedOutput").innerText = originalCode8;
    document.getElementById("corruptedOutput").innerText = "";
    document.getElementById("correctedOutput").innerText = "";
}

// 8-bit Veride Hata Oluşturma 
function introduceError() {
    const bitIndex = parseInt(document.getElementById("errorBit").value);
    if (isNaN(bitIndex) || bitIndex < 0 || bitIndex > 11) { // toplam 12 bit
        alert("0-11 arasında bir bit pozisyonu giriniz.");
        return;
    }
    if (!originalCode8) {
        alert("Önce 8-bit veriyi kodlayın.");
        return;
    }

    let bits = originalCode8.split('');
    bits[bitIndex] = bits[bitIndex] === '0' ? '1' : '0';
    corruptedCode8 = bits.join('');

    document.getElementById("corruptedOutput").innerText = corruptedCode8;
    document.getElementById("correctedOutput").innerText = "";
}

// 8-bit Hata Tespit ve Düzeltme 
function detectAndFix() {
    let input = document.getElementById("corruptedOutput").innerText.trim();
    if (!input && originalCode8) {
        input = corruptedCode8; // Eğer boşsa ve corruptedCode8 varsa onu kullan
    } else if (!input && !originalCode8) {
        alert("Önce 8-bit veriyi kodlayın ve isteğe bağlı hata oluşturun.");
        return;
    }
    
    // Hexadecimal kontrolü ve binary'e çevirme
    if (/^[0-9A-Fa-f]+$/.test(input) && !/^[01]+$/.test(input)) { // Eğer hex karakter içeriyorsa
        if (input.length * 4 === 12 || input.length * 4 === 16) { 
             input = hexToBinary(input);
        } else {
            alert("Hexadecimal giriş 3 veya 4 karakter olmalıdır (12 veya 16 bit binary karşılığı).");
            return;
        }
    }


    if (!/^[01]{12}$/.test(input) && !/^[01]{16}$/.test(input)) {
        alert("Lütfen 12 bitlik (8-bit veri için) veya 16 bitlik (özel durum için) ikili kod giriniz.");
        return;
    }

    let bits = input.split('').map(Number);
    let correctedBits = [...bits];
    let errorPosition = 0;
    let message = "";

    if (correctedBits.length === 12) { // 8-bit veri için
        // Eşlik bitlerini hesapla
        let s1 = correctedBits[0] ^ correctedBits[2] ^ correctedBits[4] ^ correctedBits[6] ^ correctedBits[8] ^ correctedBits[10];
        let s2 = correctedBits[1] ^ correctedBits[2] ^ correctedBits[5] ^ correctedBits[6] ^ correctedBits[9] ^ correctedBits[10];
        let s3 = correctedBits[3] ^ correctedBits[4] ^ correctedBits[5] ^ correctedBits[6] ^ correctedBits[11];
        let s4 = correctedBits[7] ^ correctedBits[8] ^ correctedBits[9] ^ correctedBits[10] ^ correctedBits[11];
        errorPosition = s1 * 1 + s2 * 2 + s3 * 4 + s4 * 8;
        
        if (errorPosition > 0 && errorPosition <= 12) {
            message = `Tek bit hatası ${errorPosition}. pozisyonda (1-tabanlı) tespit edildi. Düzeltildi.`;
            correctedBits[errorPosition - 1] ^= 1;
        } else if (errorPosition === 0) {
            message = "Hata yok.";
        } else {
            message = "Hata tespit edildi ancak pozisyonu geçersiz."; 
        }
    } else if (correctedBits.length === 16) { 
        let p_calc = [];
        // 16-bit özel durum için eşlik bitlerinin hesaplanması
        p_calc[0] = correctedBits[2]^correctedBits[4]^correctedBits[6]^correctedBits[8]^correctedBits[10]^correctedBits[12]^correctedBits[14]; // P1
        p_calc[1] = correctedBits[2]^correctedBits[5]^correctedBits[6]^correctedBits[9]^correctedBits[10]^correctedBits[13]^correctedBits[14]; // P2
        p_calc[2] = correctedBits[4]^correctedBits[5]^correctedBits[6]^correctedBits[11]^correctedBits[12]^correctedBits[13]^correctedBits[14]; // P4
        p_calc[3] = correctedBits[8]^correctedBits[9]^correctedBits[10]^correctedBits[11]^correctedBits[12]^correctedBits[13]^correctedBits[14]; // P8

        let syndrome = 0;
        if (p_calc[0] !== correctedBits[0]) syndrome += 1;
        if (p_calc[1] !== correctedBits[1]) syndrome += 2;
        if (p_calc[2] !== correctedBits[3]) syndrome += 4;
        if (p_calc[3] !== correctedBits[7]) syndrome += 8;
        
        let overallParityCalculated = 0;
        for(let i=0; i < 15; i++) { 
            overallParityCalculated ^= correctedBits[i];
        }
        let overallParityReceived = correctedBits[15];

        if (syndrome === 0) {
            if (overallParityCalculated === overallParityReceived) {
                message = "Hata yok (16-bit özel durum).";
            } else {
                message = "Hata genel eşlik bitinde (P16) tespit edildi. Düzeltildi (16-bit özel durum).";
                correctedBits[15] ^= 1;
            }
        } else {
            if (overallParityCalculated !== overallParityReceived) {
                message = `Tek bit hatası ${syndrome}. pozisyonda (1-tabanlı) tespit edildi. Düzeltildi (16-bit özel durum).`;
                if (syndrome - 1 >= 0 && syndrome - 1 < 15) { 
                     correctedBits[syndrome - 1] ^= 1;
                } else {
                    message = `Hesaplanan sendrom (${syndrome}) geçersiz (16-bit özel durum).`;
                }
            } else {
                message = "Çift bit hatası tespit edildi. Düzeltilemiyor (16-bit özel durum).";
            }
        }
        errorPosition = syndrome; 
    }
    document.getElementById("correctedOutput").innerText = correctedBits.join('') + (message ? " (" + message + ")" : "");
}


// Hex'i Binary'ye çevirme
function hexToBinary(hex) {
    return hex.split('').map(h => parseInt(h, 16).toString(2).padStart(4, '0')).join('');
}

// --- 16 Bit SEC-DED Fonksiyonları ---
function encodeData16() {
    const input = document.getElementById("dataInput16").value;
    if (!/^[01]{16}$/.test(input)) {
        alert("Lütfen 16 bitlik ikili veri giriniz.");
        return;
    }

    let code = Array(22).fill(0); 
    const dataBits = input.split('').map(Number);

    const parityIndices = [0, 1, 3, 7, 15];
    
    let dataIdx = 0;
    for (let i = 0; i < 21; i++) {
        if (!parityIndices.includes(i)) {
            if (dataIdx < dataBits.length) {
                code[i] = dataBits[dataIdx++];
            }
        }
    }

    for (let p = 0; p < 5; p++) { 
        let parityPos = Math.pow(2, p) -1;
        let parityVal = 0;
        for (let i = 0; i < 21; i++) { 
            if (i !== parityPos && ((i + 1) & (parityPos + 1))) { 
                parityVal ^= code[i];
            }
        }
        code[parityPos] = parityVal;
    }

    let overallParity = 0;
    for (let i = 0; i < 21; i++) {
        overallParity ^= code[i];
    }
    code[21] = overallParity; 

    originalCode16 = code.join('');
    corruptedCode16 = originalCode16;
    document.getElementById("encodedOutput16").innerText = originalCode16;
    document.getElementById("corruptedOutput16").innerText = "";
    document.getElementById("correctedOutput16").innerText = "";
}

function introduceError16() {
    const bitIndex = parseInt(document.getElementById("errorBit16").value);
    if (isNaN(bitIndex) || bitIndex < 0 || bitIndex > 21) { // toplam 22 bit
        alert("0-21 arasında bir bit pozisyonu giriniz.");
        return;
    }
    if (!originalCode16) {
        alert("Önce 16-bit veriyi kodlayın.");
        return;
    }
    let bits = originalCode16.split('');
    bits[bitIndex] = bits[bitIndex] === '0' ? '1' : '0';
    corruptedCode16 = bits.join('');
    document.getElementById("corruptedOutput16").innerText = corruptedCode16;
    document.getElementById("correctedOutput16").innerText = "";
}

function detectAndFix16() {
    let inputCode = document.getElementById("corruptedOutput16").innerText.trim();
    if (!inputCode && originalCode16) {
        inputCode = corruptedCode16; 
    } else if (!inputCode && !originalCode16) {
        alert("Önce 16-bit veriyi kodlayın ve isteğe bağlı hata oluşturun.");
        return;
    }
    
    if (!/^[01]{22}$/.test(inputCode)) {
        alert("Lütfen 22 bitlik ikili kod giriniz.");
        return;
    }

    let bits = inputCode.split('').map(Number);
    let correctedBits = [...bits];
    let syndrome = 0;

    for (let p = 0; p < 5; p++) {
        let parityPos = Math.pow(2, p) - 1; // 0, 1, 3, 7, 15
        let calculatedPVal = 0;
        for (let i = 0; i < 21; i++) { 
            if (i !== parityPos && ((i + 1) & (parityPos + 1))) {
                calculatedPVal ^= correctedBits[i];
            }
        }
        if (calculatedPVal !== correctedBits[parityPos]) {
            syndrome += (parityPos + 1); 
        }
    }

    let overallParityCalculated = 0;
    for (let i = 0; i < 21; i++) { 
        overallParityCalculated ^= correctedBits[i];
    }
    let overallParityReceived = correctedBits[21];

    let message = "";
    if (syndrome === 0) {
        if (overallParityCalculated === overallParityReceived) {
            message = "Hata yok.";
        } else {
            message = "Hata genel eşlik bitinde (P_overall, bit 22) tespit edildi. Düzeltildi.";
            correctedBits[21] ^= 1; 
        }
    } else { 
        if (overallParityCalculated !== overallParityReceived) {
            message = `Tek bit hatası ${syndrome}. pozisyonda (1-tabanlı) tespit edildi. Düzeltildi.`;
            if (syndrome - 1 >= 0 && syndrome - 1 < 21) { 
                correctedBits[syndrome - 1] ^= 1;
            } else {
                 message = `Hesaplanan sendrom (${syndrome}) geçersiz. Beklenmedik durum.`;
            }
        } else {
            message = "Çift bit hatası tespit edildi. Düzeltilemiyor.";
        }
    }
    document.getElementById("correctedOutput16").innerText = correctedBits.join('') + " (" + message + ")";
}


// --- 32 Bit SEC-DED Fonksiyonları ---
function encodeData32() {
    const input = document.getElementById("dataInput32").value;
    if (!/^[01]{32}$/.test(input)) {
        alert("Lütfen 32 bitlik ikili veri giriniz.");
        return;
    }

    let code = Array(39).fill(0);
    const dataBits = input.split('').map(Number);

    const parityIndices = [0, 1, 3, 7, 15, 31];
    
    let dataIdx = 0;
    for (let i = 0; i < 38; i++) { 
        if (!parityIndices.includes(i)) {
            if (dataIdx < dataBits.length) {
                code[i] = dataBits[dataIdx++];
            }
        }
    }

    for (let p = 0; p < 6; p++) { 
        let parityPos = Math.pow(2, p) - 1;
        let parityVal = 0;
        for (let i = 0; i < 38; i++) { 
            if (i !== parityPos && ((i + 1) & (parityPos + 1))) {
                parityVal ^= code[i];
            }
        }
        code[parityPos] = parityVal;
    }

    let overallParity = 0;
    for (let i = 0; i < 38; i++) {
        overallParity ^= code[i];
    }
    code[38] = overallParity; 

    originalCode32 = code.join('');
    corruptedCode32 = originalCode32;
    document.getElementById("encodedOutput32").innerText = originalCode32;
    document.getElementById("corruptedOutput32").innerText = "";
    document.getElementById("correctedOutput32").innerText = ""; 
}

function introduceError32() {
    const bitIndex = parseInt(document.getElementById("errorBit32").value);
    if (isNaN(bitIndex) || bitIndex < 0 || bitIndex > 38) { 
        alert("0-38 arasında bir bit pozisyonu giriniz.");
        return;
    }
     if (!originalCode32) {
        alert("Önce 32-bit veriyi kodlayın.");
        return;
    }
    let bits = originalCode32.split('');
    bits[bitIndex] = bits[bitIndex] === '0' ? '1' : '0';
    corruptedCode32 = bits.join('');
    document.getElementById("corruptedOutput32").innerText = corruptedCode32;
    document.getElementById("correctedOutput32").innerText = ""; 
}

// 32-bit Hata Tespit ve Düzeltme (SEC-DED)
function detectAndFix32() {
    let inputCode = document.getElementById("corruptedOutput32").innerText.trim();
     if (!inputCode && originalCode32) {
        inputCode = corruptedCode32; 
    } else if (!inputCode && !originalCode32) {
        alert("Önce 32-bit veriyi kodlayın ve isteğe bağlı hata oluşturun.");
        return;
    }

    if (!/^[01]{39}$/.test(inputCode)) {
        alert("Lütfen 39 bitlik ikili kod giriniz.");
        return;
    }
    let bits = inputCode.split('').map(Number);
    let correctedBits = [...bits];
    let syndrome = 0;

    for (let p = 0; p < 6; p++) { 
        let parityPos = Math.pow(2, p) - 1; 
        let calculatedPVal = 0;
        for (let i = 0; i < 38; i++) { 
            if (i !== parityPos && ((i + 1) & (parityPos + 1))) {
                calculatedPVal ^= correctedBits[i];
            }
        }
        if (calculatedPVal !== correctedBits[parityPos]) {
            syndrome += (parityPos + 1); 
        }
    }

    let overallParityCalculated = 0;
    for (let i = 0; i < 38; i++) { 
        overallParityCalculated ^= correctedBits[i];
    }
    let overallParityReceived = correctedBits[38];

    let message = "";
    if (syndrome === 0) {
        if (overallParityCalculated === overallParityReceived) {
            message = "Hata yok.";
        } else {
            message = "Hata genel eşlik bitinde (P_overall, bit 39) tespit edildi. Düzeltildi.";
            correctedBits[38] ^= 1; 
        }
    } else { 
        if (overallParityCalculated !== overallParityReceived) {
            message = `Tek bit hatası ${syndrome}. pozisyonda (1-tabanlı) tespit edildi. Düzeltildi.`;
             if (syndrome - 1 >= 0 && syndrome - 1 < 38) { 
                correctedBits[syndrome - 1] ^= 1;
            } else {
                 message = `Hesaplanan sendrom (${syndrome}) geçersiz. Beklenmedik durum.`;
            }
        } else {
            message = "Çift bit hatası tespit edildi. Düzeltilemiyor.";
        }
    }
    document.getElementById("correctedOutput32").innerText = correctedBits.join('') + " (" + message + ")";
}

function setCorruptedOutput() {
    const manualInputElement = document.getElementById("manualInput"); 
    if (manualInputElement) { 
        const val = manualInputElement.value.trim();
        alert("id si 'manualInput' olan elemanın değeri: " + val);
    } else {
        alert("id si 'manualInput' olan bir eleman bulunamadı.");
    }
}
