// pdf_ai.js - V6.5.2 (Modul Pemprosesan PDF & AI)
// Diekstrak dari app.js untuk Modularization
// Mengandungi: PDF Processing, AI Integration (DeepSeek/Gemini/OpenRouter)

// =========================================================================
// GLOBAL WINDOW VARIABLES (PDF & AI SPECIFIC)
// =========================================================================
window.extractedPdfData = null;
window.extractedProfileData = null;

// =========================================================================
// API CALL FUNCTIONS (DeepSeek, Gemini, OpenRouter)
// =========================================================================

/**
 * Memanggil API DeepSeek
 * @param {string} prompt - Arahan (prompt) untuk AI
 * @param {string} text - Teks yang hendak diproses
 * @returns {Promise<Object>} - Hasil dari API
 */
window.callDeepSeekAPI = async function(prompt, text) {
    console.log("V6.5.2 Calling DeepSeek API...");
    
    try {
        const payload = {
            action: 'callDeepSeek',
            prompt: prompt,
            text: text,
            email: window.currentUser ? window.currentUser.email : ''
        };

        const response = await window.fetchWithRetry(window.SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        }, 3, 1000);

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || result.error || 'DeepSeek API gagal.');
        }
        
        console.log("V6.5.2 DeepSeek API response received");
        return result.data;
        
    } catch (error) {
        console.error("V6.5.2 DeepSeek API Error:", error);
        throw error;
    }
};

/**
 * Memanggil API Gemini
 * @param {string} prompt - Arahan (prompt) untuk AI
 * @param {string} text - Teks yang hendak diproses
 * @returns {Promise<Object>} - Hasil dari API
 */
window.callGeminiAPI = async function(prompt, text) {
    console.log("V6.5.2 Calling Gemini API...");
    
    try {
        const payload = {
            action: 'callGemini',
            prompt: prompt,
            text: text,
            email: window.currentUser ? window.currentUser.email : ''
        };

        const response = await window.fetchWithRetry(window.SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        }, 3, 1000);

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || result.error || 'Gemini API gagal.');
        }
        
        console.log("V6.5.2 Gemini API response received");
        return result.data;
        
    } catch (error) {
        console.error("V6.5.2 Gemini API Error:", error);
        throw error;
    }
};

/**
 * Memanggil API OpenRouter
 * @param {string} prompt - Arahan (prompt) untuk AI
 * @param {string} text - Teks yang hendak diproses
 * @param {string} model - Model AI yang dipilih
 * @returns {Promise<Object>} - Hasil dari API
 */
window.callOpenRouterAPI = async function(prompt, text, model) {
    console.log(`V6.5.2 Calling OpenRouter API with model: ${model}...`);
    
    try {
        const payload = {
            action: 'callOpenRouter',
            prompt: prompt,
            text: text,
            model: model,
            email: window.currentUser ? window.currentUser.email : ''
        };

        const response = await window.fetchWithRetry(window.SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        }, 3, 1000);

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || result.error || 'OpenRouter API gagal.');
        }
        
        console.log("V6.5.2 OpenRouter API response received");
        return result.data;
        
    } catch (error) {
        console.error("V6.5.2 OpenRouter API Error:", error);
        throw error;
    }
};

// =========================================================================
// FUNGSI PEMPROSESAN RESPONS AI
// =========================================================================

/**
 * Memproses respons AI untuk borang (permohonan)
 * @param {Object} aiData - Data mentah dari AI
 * @returns {Object} - Data yang telah dibersihkan dan distrukturkan
 */
window.processBorangResponse = function(aiData) {
    console.log("V6.5.2 Processing Borang AI response...");
    
    const extractedData = {
        companyName: '',
        cidbNumber: '',
        grade: '',
        spkkStartDate: '',
        spkkEndDate: '',
        stbStartDate: '',
        stbEndDate: '',
        directors: [],
        shareholders: [],
        spkkPersons: [],
        chequeSignatories: [],
        phoneNumbers: [],
        alamatPerniagaan: ''
    };

    if (!aiData) {
        console.warn("V6.5.2 processBorangResponse: aiData is null/undefined");
        return extractedData;
    }

    // Map AI response fields to extracted data structure
    if (aiData.companyName || aiData.syarikat) {
        extractedData.companyName = aiData.companyName || aiData.syarikat || '';
    }
    if (aiData.cidbNumber || aiData.cidb) {
        extractedData.cidbNumber = aiData.cidbNumber || aiData.cidb || '';
    }
    if (aiData.grade || aiData.gred) {
        extractedData.grade = aiData.grade || aiData.gred || '';
    }
    if (aiData.spkkStartDate) extractedData.spkkStartDate = aiData.spkkStartDate;
    if (aiData.spkkEndDate) extractedData.spkkEndDate = aiData.spkkEndDate;
    if (aiData.stbStartDate) extractedData.stbStartDate = aiData.stbStartDate;
    if (aiData.stbEndDate) extractedData.stbEndDate = aiData.stbEndDate;
    
    // Process arrays
    if (Array.isArray(aiData.directors) || Array.isArray(aiData.pengarah)) {
        extractedData.directors = aiData.directors || aiData.pengarah || [];
    }
    if (Array.isArray(aiData.shareholders) || Array.isArray(aiData.pemegang_saham)) {
        extractedData.shareholders = aiData.shareholders || aiData.pemegang_saham || [];
    }
    if (Array.isArray(aiData.spkkPersons) || Array.isArray(aiData.penama_spkk)) {
        extractedData.spkkPersons = aiData.spkkPersons || aiData.penama_spkk || [];
    }
    if (Array.isArray(aiData.chequeSignatories) || Array.isArray(aiData.penandatangan_cek)) {
        extractedData.chequeSignatories = aiData.chequeSignatories || aiData.penandatangan_cek || [];
    }
    if (Array.isArray(aiData.phoneNumbers) || Array.isArray(aiData.nombor_telefon)) {
        extractedData.phoneNumbers = aiData.phoneNumbers || aiData.nombor_telefon || [];
    }
    if (aiData.alamatPerniagaan || aiData.alamat) {
        extractedData.alamatPerniagaan = aiData.alamatPerniagaan || aiData.alamat || '';
    }

    // Clean up empty strings in arrays
    extractedData.directors = extractedData.directors.filter(n => n && n.trim() !== '');
    extractedData.shareholders = extractedData.shareholders.filter(n => n && n.trim() !== '');
    extractedData.spkkPersons = extractedData.spkkPersons.filter(n => n && n.trim() !== '');
    extractedData.chequeSignatories = extractedData.chequeSignatories.filter(n => n && n.trim() !== '');
    extractedData.phoneNumbers = extractedData.phoneNumbers.filter(n => n && n.trim() !== '');

    console.log("V6.5.2 Borang AI response processed:", extractedData);
    return extractedData;
};

/**
 * Memproses respons AI untuk profil syarikat
 * @param {Object} aiData - Data mentah dari AI
 * @returns {Object} - Data yang telah dibersihkan dan distrukturkan
 */
window.processProfileResponse = function(aiData) {
    console.log("V6.5.2 Processing Profile AI response...");
    
    const extractedData = {
        applicantName: '',
        jawatan: '',
        icNumber: '',
        phoneNumber: '',
        email: '',
        companyName: '',
        registrationNumber: '',
        grade: '',
        registrationDate: '',
        jenisPendaftaran: '',
        labelAlamatUtama: '',
        alamatUtama: '',
        alamatSuratMenyurat: '',
        noTelefonSyarikat: '',
        noFax: '',
        emailSyarikat: '',
        webAddress: ''
    };

    if (!aiData) {
        console.warn("V6.5.2 processProfileResponse: aiData is null/undefined");
        return extractedData;
    }

    // Map AI response fields to extracted data structure
    if (aiData.applicantName || aiData.nama_pemohon) {
        extractedData.applicantName = aiData.applicantName || aiData.nama_pemohon || '';
    }
    if (aiData.jawatan) extractedData.jawatan = aiData.jawatan || '';
    if (aiData.icNumber || aiData.no_ic) {
        extractedData.icNumber = aiData.icNumber || aiData.no_ic || '';
    }
    if (aiData.phoneNumber || aiData.no_telefon_pemohon) {
        extractedData.phoneNumber = aiData.phoneNumber || aiData.no_telefon_pemohon || '';
    }
    if (aiData.email || aiData.emel_pemohon) {
        extractedData.email = aiData.email || aiData.emel_pemohon || '';
    }
    if (aiData.companyName || aiData.nama_syarikat) {
        extractedData.companyName = aiData.companyName || aiData.nama_syarikat || '';
    }
    if (aiData.registrationNumber || aiData.no_pendaftaran || aiData.cidb) {
        extractedData.registrationNumber = aiData.registrationNumber || aiData.no_pendaftaran || aiData.cidb || '';
    }
    if (aiData.grade || aiData.gred) {
        extractedData.grade = aiData.grade || aiData.gred || '';
    }
    if (aiData.registrationDate || aiData.tarikh_daftar) {
        extractedData.registrationDate = aiData.registrationDate || aiData.tarikh_daftar || '';
    }
    if (aiData.jenisPendaftaran) {
        extractedData.jenisPendaftaran = aiData.jenisPendaftaran || '';
    }
    if (aiData.labelAlamatUtama) {
        extractedData.labelAlamatUtama = aiData.labelAlamatUtama || '';
    }
    if (aiData.alamatUtama || aiData.alamat) {
        extractedData.alamatUtama = aiData.alamatUtama || aiData.alamat || '';
    }
    if (aiData.alamatSuratMenyurat || aiData.alamat_surat) {
        extractedData.alamatSuratMenyurat = aiData.alamatSuratMenyurat || aiData.alamat_surat || '';
    }
    if (aiData.noTelefonSyarikat || aiData.telefon_syarikat) {
        extractedData.noTelefonSyarikat = aiData.noTelefonSyarikat || aiData.telefon_syarikat || '';
    }
    if (aiData.noFax || aiData.fax) {
        extractedData.noFax = aiData.noFax || aiData.fax || '';
    }
    if (aiData.emailSyarikat || aiData.emel_syarikat) {
        extractedData.emailSyarikat = aiData.emailSyarikat || aiData.emel_syarikat || '';
    }
    if (aiData.webAddress || aiData.web || aiData.laman_web) {
        extractedData.webAddress = aiData.webAddress || aiData.web || aiData.laman_web || '';
    }

    console.log("V6.5.2 Profile AI response processed:", extractedData);
    return extractedData;
};

// =========================================================================
// PEMPROSESAN PDF MANUAL (Tanpa AI - Pengekstrakan Teks Sahaja)
// =========================================================================

window.processPdfManual = async function() {
    const pdfFileInput = document.getElementById('pdfFileInput');
    const pdfProcessing = document.getElementById('pdfProcessing');
    const pdfResult = document.getElementById('pdfResult');
    
    if (!pdfFileInput || !pdfFileInput.files.length) {
        if (typeof window.CustomAppModal !== 'undefined') {
            await window.CustomAppModal.alert("Sila pilih fail PDF terlebih dahulu.", "Fail Diperlukan", "warning");
        } else {
            alert("Sila pilih fail PDF terlebih dahulu.");
        }
        return;
    }

    const file = pdfFileInput.files[0];
    
    if (file.size > 10 * 1024 * 1024) {
        if (typeof window.CustomAppModal !== 'undefined') {
            await window.CustomAppModal.alert("Fail terlalu besar. Sila pilih fail kurang daripada 10MB.", "Ralat Saiz", "error");
        } else {
            alert("Fail terlalu besar. Sila pilih fail kurang daripada 10MB.");
        }
        return;
    }

    if (pdfProcessing) {
        pdfProcessing.style.display = 'block';
        pdfProcessing.textContent = 'Memproses PDF... Sila tunggu.';
    }
    if (pdfResult) {
        pdfResult.style.display = 'none';
    }

    try {
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js';
        } else {
            console.error("V6.5.2 PDF.js library not loaded");
            if (typeof window.CustomAppModal !== 'undefined') {
                await window.CustomAppModal.alert("PDF processing library tidak dimuatkan. Sila muat semula halaman.", "Ralat Sistem", "error");
            } else {
                alert("PDF processing library tidak dimuatkan. Sila muat semula halaman.");
            }
            return;
        }

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        let fullText = '';
        
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }

        console.log("V6.5.2 PDF Text extracted (first 5000 chars):", fullText.substring(0, 5000));
        
        window.extractedPdfData = window.extractDataFromPdfSimple(fullText);
        
        window.displayExtractedData(window.extractedPdfData);
        
        if (pdfResult) {
            pdfResult.style.display = 'block';
        }
        
        if (typeof window.storageWrapper !== 'undefined') {
            await window.storageWrapper.set({ 'stb_extracted_pdf_data': window.extractedPdfData });
        }
        
    } catch (error) {
        console.error("V6.5.2 Error processing PDF:", error);
        if (typeof window.playErrorSound === 'function') {
            await window.playErrorSound();
        }
        if (typeof window.CustomAppModal !== 'undefined') {
            await window.CustomAppModal.alert("Ralat memproses PDF: " + error.message, "Ralat Sistem", "error");
        } else {
            alert("Ralat memproses PDF: " + error.message);
        }
    }
};

// =========================================================================
// PEMPROSESAN PDF DENGAN AI
// =========================================================================

window.processPdfWithAI = async function() {
    const pdfFileInput = document.getElementById('pdfFileInput');
    const pdfResult = document.getElementById('pdfResult');
    
    if (!pdfFileInput || !pdfFileInput.files.length) {
        if (typeof window.CustomAppModal !== 'undefined') {
            await window.CustomAppModal.alert("Sila pilih fail PDF terlebih dahulu.", "Fail Diperlukan", "warning");
        } else {
            alert("Sila pilih fail PDF terlebih dahulu.");
        }
        return;
    }

    const file = pdfFileInput.files[0];
    if (file.size > 10 * 1024 * 1024) {
        if (typeof window.CustomAppModal !== 'undefined') {
            await window.CustomAppModal.alert("Fail terlalu besar (Maks 10MB).", "Ralat Saiz", "error");
        } else {
            alert("Fail terlalu besar (Maks 10MB).");
        }
        return;
    }

    let aiInterval = null;

    // --- KOD ANIMASI BARU (Morphing & Outliner) ---
    const updateProgress = (percent, message) => {
        const statusBox = document.getElementById('status-box-main');
        const progressRing = document.getElementById('progress-ring-main');
        const percentageText = document.getElementById('percentage-main');
        const progressMsg = document.getElementById('pdfProgressMsg');

        if (!statusBox || !progressRing || !percentageText) return;

        // 1. Morph bentuk: Bulat -> Petak bila proses mula
        if (statusBox.classList.contains('morph-circle')) {
            statusBox.classList.replace('morph-circle', 'morph-square');
        }

        // 2. Kemaskini teks peratusan & mesej
        percentageText.innerHTML = `${percent}%`;
        if (progressMsg) {
            progressMsg.style.display = 'block';
            progressMsg.innerText = message;
        }

        // 3. Gerakkan outliner SVG (Panjang garisan ialah 440)
        const circumference = 440;
        const offset = circumference - (percent / 100) * circumference;
        progressRing.style.strokeDashoffset = offset;

        if (pdfResult) pdfResult.style.display = 'none';
    };

    try {
        updateProgress(5, "Membaca fail...");
        
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js';
        } else {
            throw new Error("PDF.js library not loaded");
        }

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        let fullText = '';
        const totalPages = pdf.numPages;

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
            
            const progress = 10 + Math.round((pageNum / totalPages) * 30); // 10% ke 40%
            updateProgress(progress, `Mengekstrak halaman ${pageNum}/${totalPages}`);
        }

        console.log("V6.5.2 PDF Extracted. Length:", fullText.length);
        
        updateProgress(45, "Menganalisis dengan AI...");
        
        let aiProgress = 45;
        aiInterval = setInterval(() => {
            if (aiProgress < 95) {
                aiProgress += 1;
                updateProgress(aiProgress, "Menganalisis dengan AI...");
            }
        }, 300); // Bergerak lebih pantas

        window.extractedPdfData = await window.processPdfTextWithAI(fullText);
        
        if (aiInterval) clearInterval(aiInterval);
        
        updateProgress(100, "Selesai!");
        
        // MEMAINKAN BUNYI SUCCESS KETIKA MENCAPAI 100%
        if (typeof window.playSuccessSound === 'function') {
            await window.playSuccessSound(); 
        }
        
        // Tunggu 1 saat untuk bagi pengguna lihat "100% Selesai" sebelum memaparkan kotak hijau
        setTimeout(() => {
            // Kembalikan kotak ke keadaan asal
            const statusBox = document.getElementById('status-box-main');
            const progressRing = document.getElementById('progress-ring-main');
            const percentageText = document.getElementById('percentage-main');
            const progressMsg = document.getElementById('pdfProgressMsg');
            
            if (statusBox) statusBox.classList.replace('morph-square', 'morph-circle');
            if (progressRing) progressRing.style.strokeDashoffset = 440;
            if (percentageText) percentageText.innerHTML = `📄<br><span>Pilih PDF</span>`;
            if (progressMsg) progressMsg.style.display = 'none';

            window.displayExtractedData(window.extractedPdfData);
            if (pdfResult) {
                pdfResult.style.display = 'block';
            }
        }, 1000);
        
        if (typeof window.storageWrapper !== 'undefined') {
            await window.storageWrapper.set({ 'stb_extracted_pdf_data': window.extractedPdfData });
        }
        
    } catch (error) {
        console.error("V6.5.2 AI Error:", error);
        if (aiInterval) clearInterval(aiInterval);
        if (typeof window.playErrorSound === 'function') {
            await window.playErrorSound();
        }

        const progressMsg = document.getElementById('pdfProgressMsg');
        if (progressMsg) {
            progressMsg.innerHTML = `<span style="color:#ef4444; font-weight:bold;">Ralat: ${error.message}</span>`;
        }
        
        if (typeof window.CustomAppModal !== 'undefined') {
            await window.CustomAppModal.alert("Gagal memproses: " + error.message, "Ralat AI", "error");
        } else {
            alert("Gagal memproses: " + error.message);
        }
    }
};

/**
 * Menghantar teks PDF ke backend untuk diproses oleh AI
 * @param {string} pdfText - Teks penuh dari PDF
 * @returns {Promise<Object>} - Data yang diekstrak oleh AI
 */
window.processPdfTextWithAI = async function(pdfText) {
    const maxTextLength = 30000;
    const truncatedText = pdfText.length > maxTextLength
        ? pdfText.substring(0, maxTextLength) + "... [text truncated]"
        : pdfText;

    console.log("V6.5.2 (Web) Menghantar teks borang ke backend untuk AI processing...");
    
    const payload = {
        action: 'processAI',
        type: 'borang',
        text: truncatedText,
        email: window.currentUser ? window.currentUser.email : ''
    };

    const response = await window.fetchWithRetry(window.SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
    }, 3, 1000);

    const result = await response.json();
    
    if (!result.success || !result.data) {
        throw new Error(result.message || result.error || 'Gagal mengekstrak data dari pelayan AI.');
    }
    
    return result.data;
};

// =========================================================================
// PENGENALAN DATA DARI PDF SECARA MANUAL (REGEX-BASED)
// =========================================================================

window.extractDataFromPdfSimple = function(pdfText) {
    const extractedData = {
        companyName: '',
        cidbNumber: '',
        grade: '',
        spkkStartDate: '',
        spkkEndDate: '',
        stbStartDate: '',
        stbEndDate: '',
        directors: [],
        shareholders: [],
        spkkPersons: [],
        chequeSignatories: [],
        phoneNumbers: [],
        alamatPerniagaan: ''
    };

    console.log("V6.5.2 Mula mengekstrak data...");

    const rawText = pdfText.toUpperCase().replace(/\s+/g, ' ');
    const cleanHeaderText = rawText.replace(/TEL\s*:\s*[\d-]+\s*/g, '');

    const companyMatch = cleanHeaderText.match(/([A-Z0-9\s\.\&\-]+?)\s*\(\d{6,}[-\s]?[A-Z0-9]+\)/);
    if (companyMatch && companyMatch[1]) {
        let name = companyMatch[1].trim();
        name = name.replace(/.*(?:ADDR|ALAMAT|LUMPUR|SELANGOR|JOHOR|KUALA)[:\s]*/, '').trim();
        extractedData.companyName = name;
    }

    const cidbMatch = rawText.match(/(\d{6,}-[A-Z]{2,}\d{5,})/);
    if (cidbMatch) extractedData.cidbNumber = cidbMatch[1];
    
    const gradeMatches = rawText.match(/\b(G[1-7])\b/gi);
    if (gradeMatches && gradeMatches.length > 0) {
        extractedData.grade = gradeMatches[0].toUpperCase();
    }

    const spkkMatch = rawText.match(/KERJA KERAJAAN \(SPKK\)\s*(\d{2}\/\d{2}\/\d{4})\s*(\d{2}\/\d{2}\/\d{4})/);
    if (spkkMatch) { 
        extractedData.spkkStartDate = spkkMatch[1]; 
        extractedData.spkkEndDate = spkkMatch[2]; 
    }

    const stbMatch = rawText.match(/TARAF BUMIPUTERA \(STB\)\s*(\d{2}\/\d{2}\/\d{4})\s*(\d{2}\/\d{2}\/\d{4})/);
    if (stbMatch) { 
        extractedData.stbStartDate = stbMatch[1]; 
        extractedData.stbEndDate = stbMatch[2]; 
    }
    
    const phoneRegex = /(?:TEL|H\/P|PHONE)[\s:]*([\d\s\-\(\)\+]+)/gi;
    let phoneMatch;
    const phones = new Set();
    while ((phoneMatch = phoneRegex.exec(rawText)) !== null) {
        let phoneNum = phoneMatch[1].trim();
        phoneNum = phoneNum.replace(/\s+/g, '');
        if (phoneNum.length >= 6) {
            phones.add(phoneNum);
        }
    }
    extractedData.phoneNumbers = Array.from(phones);

    function sanitizeName(rawName) {
        let name = rawName.trim();
        
        const cutOffWords = [
            " PENGARAH", " PENGURUS", " MANAGER", " SECRETARY", " SETIAUSAHA",
            " PEMEGANG", " SAHAM", " SHARES", " EKUITI", " EQUITY",
            " LEMBAGA", " JAWATAN", " POSITION", " APPOINTMENT", " LANTIKAN", 
            " WARGANEGARA", " MALAYSIA", " MELAYU", " LELAKI", " PEREMPUAN",
            " NO.", " BIL", " IC", " KP", " PASSPORT", " MANAGING", " EXECUTIVE"
        ];

        for (let word of cutOffWords) {
            const idx = name.indexOf(word);
            if (idx !== -1) {
                name = name.substring(0, idx).trim();
            }
        }
        
        name = name.replace(/[^A-Z0-9\)\.\@\&\-\/\s]*$/, ''); 
        name = name.replace(/^[\d\.\)\-\s]+/, '');   
        
        return name.trim();
    }

    function extractNamesFromStream(streamText) {
        if (!streamText) return [];

        let cleanStream = streamText.replace(/NO\.?\s+NAME\s+IC\s+NO.*?DATE/g, ''); 
        cleanStream = cleanStream.replace(/NO\.?\s+NAMA\s+NO\.\s+KAD.*?TARIKH/g, '');

        const headerBlocklist = [
            "DIRECTOR", "PENGARAH", "SHAREHOLDER", "PEMEGANG SAHAM",
            "SPKK RESPONSIBLE", "PENAMA SPKK", "CHEQUE SIGNATORIES", "PENANDATANGAN CEK",
            "KEY MANAGEMENT", "PERSONEL PENGURUSAN", "TECHNICAL PERSONNEL", "PERSONEL TEKNIKAL",
            "COMPETENT PERSON", "ORANG KOMPETEN", "JOINT VENTURE", "KONSORTIUM", 
            "INTERNATIONAL REGISTERED", "REGISTRATION NO", "APPLICATION NO",
            "EQUITY", "BUMIPUTERA", "ASING", "BUKAN BUMIPUTERA", "AGENSI BERKAITAN"
        ];

        const regex = /(?:\b|^)(\d{1,2})(?:[\.\)\s]*)\s+([A-Z\s\.\'\@\&\-\(\)\/]+?)(?=\s+(?:\d{6,}|\d{5,}[A-Z]|[A-Z]\d{5,}|MALAYSIA|MELAYU|CINA|INDIA|LELAKI|PEREMPUAN|DIRECTOR|PENGARAH|MANAGING|WARGANEGARA))/g;

        let match;
        const names = [];
        
        while ((match = regex.exec(cleanStream)) !== null) {
            let potentialName = match[2].trim();
            
            let isHeader = false;
            for (let block of headerBlocklist) {
                if (potentialName.includes(block)) { 
                    isHeader = true; 
                    break; 
                }
            }
            if (isHeader) continue;

            if (potentialName.length > 80 || potentialName.length < 3) continue;

            let clean = sanitizeName(potentialName);

            if (clean.length > 3 && /[A-Z]/.test(clean) && !names.includes(clean)) {
                if (!/^[\W\d]+$/.test(clean)) {
                    names.push(clean);
                }
            }
        }
        return names;
    }

    const getIndex = (pattern) => {
        const m = rawText.match(pattern);
        return m ? m.index : -1;
    };

    const idxDir = getIndex(/4\.\s*(?:DIRECTORS|PENGARAH)/);
    const idxShare = getIndex(/5\.\s*(?:SHAREHOLDERS|PEMEGANG)/);

    let idxNext = getIndex(/6\.\s*(?:KEY|PERSONEL)/);
    if (idxNext === -1) idxNext = getIndex(/7\.\s*(?:TECHNICAL|TEKNIKAL)/);

    const idxSpkk = getIndex(/(\d+\.\s+SPKK\s+(?:RESPONSIBLE|PENAMA))/);
    const idxCheque = getIndex(/(\d+\.\s+CHEQUE\s+(?:SIGNATORIES|PENANDATANGAN))/);

    let idxStopCheque = getIndex(/(?:MANDATORY|JOINT VENTURE|INTERNATIONAL|DISCLAIMER|20\.|21\.)/);
    if (idxStopCheque === -1 || idxStopCheque < idxCheque) idxStopCheque = rawText.length;

    const strDirectors = (idxDir !== -1 && idxShare !== -1) ? rawText.substring(idxDir + 15, idxShare) : "";
    const strShareholders = (idxShare !== -1 && idxNext !== -1) ? rawText.substring(idxShare + 15, idxNext) : "";

    let strSpkk = "";
    if (idxSpkk !== -1) {
        const endSpkk = (idxCheque !== -1) ? idxCheque : rawText.length;
        strSpkk = rawText.substring(idxSpkk + 25, endSpkk); 
    }

    let strCheque = "";
    if (idxCheque !== -1) {
        strCheque = rawText.substring(idxCheque + 25, idxStopCheque);
    }

    extractedData.directors = extractNamesFromStream(strDirectors);
    extractedData.shareholders = extractNamesFromStream(strShareholders);
    extractedData.spkkPersons = extractNamesFromStream(strSpkk);
    extractedData.chequeSignatories = extractNamesFromStream(strCheque);

    console.log("V6.5.2 Final Clean Data:", extractedData);
    return extractedData;
};

// =========================================================================
// PAPARAN DATA YANG DIEKSTRAK (MAIN FORM)
// =========================================================================

window.displayExtractedData = function(data) {
    const pdfExtractedData = document.getElementById('pdfExtractedData');
    if (!pdfExtractedData) return;

    let html = '';

    if (data.companyName) {
        html += `<div class="extracted-item">
            <span class="extracted-label">Nama Syarikat:</span>
            <span class="extracted-value">${data.companyName}</span>
        </div>`;
    }

    if (data.cidbNumber) {
        html += `<div class="extracted-item">
            <span class="extracted-label">No. CIDB:</span>
            <span class="extracted-value">${data.cidbNumber}</span>
        </div>`;
    }
    
    if (data.grade) {
        html += `<div class="extracted-item">
            <span class="extracted-label">Gred:</span>
            <span class="extracted-value">${data.grade}</span>
        </div>`;
    }

    if (data.spkkStartDate && data.spkkEndDate) {
        html += `<div class="extracted-item">
            <span class="extracted-label">Tempoh SPKK:</span>
            <span class="extracted-value">${data.spkkStartDate} - ${data.spkkEndDate}</span>
        </div>`;
    }

    if (data.stbStartDate && data.stbEndDate) {
        html += `<div class="extracted-item">
            <span class="extracted-label">Tempoh STB:</span>
            <span class="extracted-value">${data.stbStartDate} - ${data.stbEndDate}</span>
        </div>`;
    }

    if (data.phoneNumbers && data.phoneNumbers.length > 0) {
        html += `<div class="extracted-item">
            <span class="extracted-label">Nombor Telefon (${data.phoneNumbers.length}):</span>
            <span class="extracted-value">${data.phoneNumbers.join(', ')}</span>
        </div>`;
    } else {
        html += `<div class="extracted-item">
            <span class="extracted-label" style="color: #dc2626;">Nombor Telefon:</span>
            <span class="extracted-value" style="color: #dc2626;">Tiada nombor telefon dapat diekstrak</span>
        </div>`;
    }

    if (data.alamatPerniagaan) {
        html += `<div class="extracted-item">
            <span class="extracted-label">Alamat Perniagaan:</span>
            <span class="extracted-value">${data.alamatPerniagaan}</span>
        </div>`;
    }

    if (data.directors.length > 0) {
        html += `<div class="extracted-item">
            <span class="extracted-label">Pengarah (${data.directors.length}):</span>
            <span class="extracted-value">${data.directors.join(', ')}</span>
        </div>`;
    } else {
        html += `<div class="extracted-item">
            <span class="extracted-label" style="color: #dc2626;">Pengarah:</span>
            <span class="extracted-value" style="color: #dc2626;">Tiada nama dapat diekstrak</span>
        </div>`;
    }

    if (data.shareholders.length > 0) {
        html += `<div class="extracted-item">
            <span class="extracted-label">Pemegang Saham (${data.shareholders.length}):</span>
            <span class="extracted-value">${data.shareholders.join(', ')}</span>
        </div>`;
    }

    if (data.spkkPersons.length > 0) {
        html += `<div class="extracted-item">
            <span class="extracted-label">Penama SPKK (${data.spkkPersons.length}):</span>
            <span class="extracted-value">${data.spkkPersons.join(', ')}</span>
        </div>`;
    }

    if (data.chequeSignatories.length > 0) {
        html += `<div class="extracted-item">
            <span class="extracted-label">Penandatangan Cek (${data.chequeSignatories.length}):</span>
            <span class="extracted-value">${data.chequeSignatories.join(', ')}</span>
        </div>`;
    }

    pdfExtractedData.innerHTML = html;
};

// =========================================================================
// FUNGSI APPLY & CLEAR DATA PDF (MAIN FORM)
// =========================================================================

window.applyPdfDataToForm = async function() {
    if (!window.extractedPdfData) {
        if (typeof window.CustomAppModal !== 'undefined') {
            await window.CustomAppModal.alert("Tiada data PDF untuk digunakan.", "Tiada Data", "warning");
        } else {
            alert("Tiada data PDF untuk digunakan.");
        }
        return;
    }

    const setValueAndTrigger = (elementId, value) => {
        const el = document.getElementById(elementId);
        if (el) {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`V6.5.2 Set value for ${elementId}:`, value);
        }
    };

    const setSelectValue = (elementId, valueToFind) => {
        const el = document.getElementById(elementId);
        if (el) {
            for (let i = 0; i < el.options.length; i++) {
                if (el.options[i].value.toUpperCase() === valueToFind.toUpperCase()) {
                    el.selectedIndex = i;
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log(`V6.5.2 Set select for ${elementId}:`, valueToFind);
                    break;
                }
            }
        }
    };

    if (window.extractedPdfData.companyName) {
        setValueAndTrigger('borang_syarikat', window.extractedPdfData.companyName);
        setValueAndTrigger('db_syarikat', window.extractedPdfData.companyName);
    }
    if (window.extractedPdfData.cidbNumber) {
        setValueAndTrigger('borang_cidb', window.extractedPdfData.cidbNumber);
        setValueAndTrigger('db_cidb', window.extractedPdfData.cidbNumber);
    }
    
    if (window.extractedPdfData.grade) {
        setSelectValue('borang_gred', window.extractedPdfData.grade);
        setSelectValue('db_gred', window.extractedPdfData.grade);
    }
    
    if (window.extractedPdfData.spkkStartDate) {
        setValueAndTrigger('spkkDuration', `${window.extractedPdfData.spkkStartDate} - ${window.extractedPdfData.spkkEndDate}`);
    }
    if (window.extractedPdfData.stbStartDate) {
        setValueAndTrigger('stbDuration', `${window.extractedPdfData.stbStartDate} - ${window.extractedPdfData.stbEndDate}`);
    }
    
    if (window.extractedPdfData.phoneNumbers && window.extractedPdfData.phoneNumbers.length > 0) {
        setValueAndTrigger('borang_no_telefon', window.extractedPdfData.phoneNumbers.join(', '));
    }

    if (window.extractedPdfData.alamatPerniagaan) {
        setValueAndTrigger('db_alamat_perniagaan', window.extractedPdfData.alamatPerniagaan);
        
        const negeriSelect = document.getElementById('db_negeri');
        if (negeriSelect && window.extractedPdfData.alamatPerniagaan) {
            const alamatUpper = window.extractedPdfData.alamatPerniagaan.toUpperCase();
            const stateMap = {
                'JOHOR': 'JOHOR', 'KEDAH': 'KEDAH', 'KELANTAN': 'KELANTAN', 'MELAKA': 'MELAKA',
                'NEGERI SEMBILAN': 'NEGERI SEMBILAN', 'PAHANG': 'PAHANG', 'PERAK': 'PERAK',
                'PERLIS': 'PERLIS', 'PULAU PINANG': 'PULAU PINANG', 'PENANG': 'PULAU PINANG',
                'SABAH': 'SABAH', 'SARAWAK': 'SARAWAK', 'SELANGOR': 'SELANGOR', 'TERENGGANU': 'TERENGGANU',
                'KUALA LUMPUR': 'W.P. KUALA LUMPUR', 'LABUAN': 'W.P. LABUAN', 'PUTRAJAYA': 'W.P. PUTRAJAYA'
            };
            
            let foundState = '';
            for (const [key, value] of Object.entries(stateMap)) {
                if (alamatUpper.includes(key)) {
                    foundState = value;
                    break;
                }
            }
            
            if (foundState) {
                setSelectValue('db_negeri', foundState);
            }
        }
    }

    const personnelList = document.getElementById('personnelList');
    if (personnelList) personnelList.innerHTML = '';

    const allNames = new Set();
    [window.extractedPdfData.directors, window.extractedPdfData.shareholders, 
     window.extractedPdfData.spkkPersons, window.extractedPdfData.chequeSignatories]
     .forEach(list => { 
         if(Array.isArray(list)) list.forEach(n => allNames.add(n)); 
     });

    allNames.forEach(name => {
        if (name && name.length > 2) {
            const roles = [];
            if (window.extractedPdfData.directors.includes(name)) roles.push('PENGARAH');
            if (window.extractedPdfData.shareholders.includes(name)) roles.push('P.EKUITI');
            if (window.extractedPdfData.spkkPersons.includes(name)) roles.push('P.SPKK');
            if (window.extractedPdfData.chequeSignatories.includes(name)) roles.push('T.T CEK');

            if (typeof window.addPerson === 'function') {
                window.addPerson({ 
                    name: name, 
                    isCompany: false, 
                    roles: roles, 
                    s_ic: '', 
                    s_sb: '', 
                    s_epf: '' 
                });
            }
        }
    });

    if (allNames.size === 0 && typeof window.addPerson === 'function') window.addPerson();

    if (typeof window.saveFormData === 'function') window.saveFormData();
    if (typeof window.saveDatabaseFormData === 'function') window.saveDatabaseFormData(); 
    
    setTimeout(async () => {
        const dbState = {};
        document.querySelectorAll('#tab-database input, #tab-database select, #tab-database textarea').forEach(el => {
            if (el.id) {
                dbState[el.id] = (el.type === 'checkbox' || el.type === 'radio') ? el.checked : el.value;
            }
        });
        
        if (typeof window.formStates !== 'undefined') {
            window.formStates['db'] = dbState;
        }
        if (typeof window.storageWrapper !== 'undefined') {
            await window.storageWrapper.set({ 'stb_form_states': window.formStates });
        }
        
        console.log("V6.5.2 PDF Data applied and force-saved to storage successfully.");
        
        if (typeof window.CustomAppModal !== 'undefined') {
            await window.CustomAppModal.alert("PDF Data berjaya diekstrak dan disimpan! Semua input termasuk Alamat Perniagaan & Negeri telah diisi.", "Berjaya", "success");
        } else {
            alert("PDF Data berjaya diekstrak dan disimpan!");
        }
    }, 200);
};

window.clearPdfData = function() {
    const pdfFileInput = document.getElementById('pdfFileInput');
    const pdfFileName = document.getElementById('pdfFileName');
    const pdfResult = document.getElementById('pdfResult');
    const pdfExtractedData = document.getElementById('pdfExtractedData');
    const btnProcessManual = document.getElementById('btnProcessManual');
    const btnProcessAI = document.getElementById('btnProcessAI');
    
    if (pdfFileInput) {
        pdfFileInput.value = ''; // Kosongkan fail tanpa buang fungsi AI
    }

    if (pdfFileName) {
        pdfFileName.textContent = 'Tiada fail dipilih';
        pdfFileName.style.fontWeight = 'normal';
        pdfFileName.style.color = '';
    }
    if (pdfResult) {
        pdfResult.style.display = 'none';
    }
    if (pdfExtractedData) {
        pdfExtractedData.innerHTML = '';
    }
    if (btnProcessManual) {
        btnProcessManual.disabled = true;
    }
    if (btnProcessAI) {
        btnProcessAI.disabled = true;
    }
    window.extractedPdfData = null;

    if (typeof window.storageWrapper !== 'undefined') {
        window.storageWrapper.remove(['stb_extracted_pdf_data']);
    }
};

// =========================================================================
// PROFILE PDF AI PROCESSING
// =========================================================================

window.processProfileWithAI = async function() {
    const profilePdfInput = document.getElementById('profilePdfInput');
    const profilePdfResult = document.getElementById('profilePdfResult');
    
    if (!profilePdfInput || !profilePdfInput.files.length) {
        if (typeof window.CustomAppModal !== 'undefined') {
            await window.CustomAppModal.alert("Sila pilih fail PDF terlebih dahulu.", "Fail Diperlukan", "warning");
        } else {
            alert("Sila pilih fail PDF terlebih dahulu.");
        }
        return;
    }

    const file = profilePdfInput.files[0];
    if (file.size > 10 * 1024 * 1024) {
        if (typeof window.CustomAppModal !== 'undefined') {
            await window.CustomAppModal.alert("Fail terlalu besar (Maks 10MB).", "Ralat Saiz", "error");
        } else {
            alert("Fail terlalu besar (Maks 10MB).");
        }
        return;
    }

    let aiInterval = null;

    // --- KOD ANIMASI BARU (Morphing & Outliner) UNTUK PROFILE ---
    const updateProgress = (percent, message) => {
        const statusBox = document.getElementById('status-box-profile');
        const progressRing = document.getElementById('progress-ring-profile');
        const percentageText = document.getElementById('percentage-profile');
        const progressMsg = document.getElementById('profilePdfProgressMsg');

        if (!statusBox || !progressRing || !percentageText) return;

        // 1. Morph bentuk: Bulat -> Petak bila proses mula
        if (statusBox.classList.contains('morph-circle')) {
            statusBox.classList.replace('morph-circle', 'morph-square');
        }

        // 2. Kemaskini teks peratusan & mesej
        percentageText.innerHTML = `${percent}%`;
        if (progressMsg) {
            progressMsg.style.display = 'block';
            progressMsg.innerText = message;
        }

        // 3. Gerakkan outliner SVG (Panjang garisan ialah 440)
        const circumference = 440;
        const offset = circumference - (percent / 100) * circumference;
        progressRing.style.strokeDashoffset = offset;

        if (profilePdfResult) profilePdfResult.style.display = 'none';
    };

    try {
        updateProgress(5, "Membaca fail...");

        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js';
        } else {
            throw new Error("PDF.js library not loaded");
        }

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        let fullText = '';
        const totalPages = pdf.numPages;

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
            
            const progress = 10 + Math.round((pageNum / totalPages) * 30);
            updateProgress(progress, `Mengekstrak halaman ${pageNum}/${totalPages}`);
        }

        console.log("V6.5.2 Profile PDF extracted. Length:", fullText.length);
        
        updateProgress(45, "Menganalisis dengan AI...");
        
        let aiProgress = 45;
        aiInterval = setInterval(() => {
            if (aiProgress < 95) {
                aiProgress += 1;
                updateProgress(aiProgress, "Menganalisis dengan AI...");
            }
        }, 300);

        window.extractedProfileData = await window.processProfileTextWithAI(fullText);
        
        if (aiInterval) clearInterval(aiInterval);
        
        updateProgress(100, "Selesai!");
        
        // MEMAINKAN BUNYI SUCCESS KETIKA MENCAPAI 100%
        if (typeof window.playSuccessSound === 'function') {
            await window.playSuccessSound();
        }
        
        // Tunggu 1 saat untuk paparkan "100% Selesai" sebelum memaparkan borang Profile
        setTimeout(() => {
            // Kembalikan kotak ke keadaan asal (bulat semula)
            const statusBox = document.getElementById('status-box-profile');
            const progressRing = document.getElementById('progress-ring-profile');
            const percentageText = document.getElementById('percentage-profile');
            const progressMsg = document.getElementById('profilePdfProgressMsg');
            
            if (statusBox) statusBox.classList.replace('morph-square', 'morph-circle');
            if (progressRing) progressRing.style.strokeDashoffset = 440;
            if (percentageText) percentageText.innerHTML = `🏢<br><span>Pilih Profil</span>`;
            if (progressMsg) progressMsg.style.display = 'none';

            window.displayProfileExtractedData(window.extractedProfileData);
            if (profilePdfResult) {
                profilePdfResult.style.display = 'block';
            }
        }, 1000);
        
        if (typeof window.storageWrapper !== 'undefined') {
            await window.storageWrapper.set({ 'stb_extracted_profile_data': window.extractedProfileData });
        }
        
    } catch (error) {
        console.error("V6.5.2 Profile AI Error:", error);
        if (aiInterval) clearInterval(aiInterval);
        
        // MEMAINKAN BUNYI ERROR JIKA GAGAL
        if (typeof window.playErrorSound === 'function') {
            await window.playErrorSound();
        }
        
        const progressMsg = document.getElementById('profilePdfProgressMsg');
        if (progressMsg) {
            progressMsg.innerHTML = `<span style="color:#ef4444; font-weight:bold;">Ralat: ${error.message}</span>`;
        }
        
        if (typeof window.CustomAppModal !== 'undefined') {
            await window.CustomAppModal.alert("Gagal memproses profile PDF: " + error.message, "Ralat AI", "error");
        } else {
            alert("Gagal memproses profile PDF: " + error.message);
        }
    }
};

/**
 * Menghantar teks profil PDF ke backend untuk diproses oleh AI
 * @param {string} pdfText - Teks penuh dari PDF profil
 * @returns {Promise<Object>} - Data yang diekstrak oleh AI
 */
window.processProfileTextWithAI = async function(pdfText) {
    const maxTextLength = 30000;
    const truncatedText = pdfText.length > maxTextLength
        ? pdfText.substring(0, maxTextLength) + "... [text truncated]"
        : pdfText;

    console.log("V6.5.2 (Web) Menghantar teks profil ke backend untuk AI processing...");
    
    const payload = {
        action: 'processAI',
        type: 'profile',
        text: truncatedText,
        email: window.currentUser ? window.currentUser.email : ''
    };

    const response = await window.fetchWithRetry(window.SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
    }, 3, 1000);

    const result = await response.json();
    
    if (!result.success || !result.data) {
        throw new Error(result.message || result.error || 'Gagal mengekstrak data dari pelayan AI.');
    }
    
    return result.data;
};

// =========================================================================
// PAPARAN DATA PROFILE YANG DIEKSTRAK
// =========================================================================

window.displayProfileExtractedData = function(data) {
    const profilePdfExtractedData = document.getElementById('profilePdfExtractedData');
    if (!profilePdfExtractedData) return;

    let html = '';

    if (data.applicantName) {
        html += `<div class="extracted-item">
            <span class="extracted-label">Nama Pemohon:</span>
            <span class="extracted-value">${data.applicantName}</span>
        </div>`;
    }

    if (data.jawatan) {
        html += `<div class="extracted-item">
            <span class="extracted-label">Jawatan:</span>
            <span class="extracted-value">${data.jawatan}</span>
        </div>`;
    }

    if (data.icNumber) {
        html += `<div class="extracted-item">
            <span class="extracted-label">No. IC Pemohon:</span>
            <span class="extracted-value">${data.icNumber}</span>
        </div>`;
    }

    if (data.phoneNumber) {
        html += `<div class="extracted-item">
            <span class="extracted-label">No. Telefon Pemohon:</span>
            <span class="extracted-value">${data.phoneNumber}</span>
        </div>`;
    }

    if (data.email) {
        html += `<div class="extracted-item">
            <span class="extracted-label">Emel Pemohon:</span>
            <span class="extracted-value">${data.email}</span>
        </div>`;
    }

    if (data.companyName) {
        html += `<div class="extracted-item">
            <span class="extracted-label">Nama Syarikat:</span>
            <span class="extracted-value">${data.companyName}</span>
        </div>`;
    }

    if (data.registrationNumber) {
        html += `<div class="extracted-item">
            <span class="extracted-label">No. Pendaftaran/CIDB:</span>
            <span class="extracted-value">${data.registrationNumber}</span>
        </div>`;
    }

    if (data.grade) {
        html += `<div class="extracted-item">
            <span class="extracted-label">Gred:</span>
            <span class="extracted-value">${data.grade}</span>
        </div>`;
    }

    if (data.registrationDate) {
        html += `<div class="extracted-item">
            <span class="extracted-label">Tarikh Daftar:</span>
            <span class="extracted-value">${data.registrationDate}</span>
        </div>`;
    }

    if (data.jenisPendaftaran) {
        html += `<div class="extracted-item">
            <span class="extracted-label">Jenis Pendaftaran:</span>
            <span class="extracted-value">${data.jenisPendaftaran}</span>
        </div>`;
    }

    if (data.alamatUtama) {
        const labelText = data.labelAlamatUtama || 'Alamat';
        html += `<div class="extracted-item">
            <span class="extracted-label">${labelText}:</span>
            <span class="extracted-value">${data.alamatUtama}</span>
        </div>`;
    }

    if (data.alamatSuratMenyurat) {
        html += `<div class="extracted-item">
            <span class="extracted-label">Alamat Surat-menyurat:</span>
            <span class="extracted-value">${data.alamatSuratMenyurat}</span>
        </div>`;
    }

    if (data.noTelefonSyarikat) {
        html += `<div class="extracted-item">
            <span class="extracted-label">No. Telefon Syarikat:</span>
            <span class="extracted-value">${data.noTelefonSyarikat}</span>
        </div>`;
    }

    if (data.noFax) {
        html += `<div class="extracted-item">
            <span class="extracted-label">No. Fax:</span>
            <span class="extracted-value">${data.noFax}</span>
        </div>`;
    }

    if (data.emailSyarikat) {
        html += `<div class="extracted-item">
            <span class="extracted-label">Emel Syarikat:</span>
            <span class="extracted-value">${data.emailSyarikat}</span>
        </div>`;
    }

    if (data.webAddress) {
        html += `<div class="extracted-item">
            <span class="extracted-label">Web Address:</span>
            <span class="extracted-value">${data.webAddress}</span>
        </div>`;
    }

    if (html === '') {
        html = '<div class="extracted-item"><span class="extracted-label">Tiada data diekstrak</span></div>';
    }

    profilePdfExtractedData.innerHTML = html;
};

// =========================================================================
// FUNGSI APPLY & CLEAR DATA PROFILE
// =========================================================================

window.applyProfileDataToForm = function() {
    if (!window.extractedProfileData) {
        if (typeof window.CustomAppModal !== 'undefined') {
            window.CustomAppModal.alert("Tiada data profile untuk digunakan.", "Tiada Data", "warning");
        } else {
            alert("Tiada data profile untuk digunakan.");
        }
        return;
    }

    const profileNamaPemohon = document.getElementById('profile_nama_pemohon');
    const profileJawatanPemohon = document.getElementById('profile_jawatan_pemohon');
    const profileIcPemohon = document.getElementById('profile_ic_pemohon');
    const profileTelefonPemohon = document.getElementById('profile_telefon_pemohon');
    const profileEmailPemohon = document.getElementById('profile_email_pemohon');
    const profileSyarikat = document.getElementById('profile_syarikat');
    const profileCidb = document.getElementById('profile_cidb');
    const profileGred = document.getElementById('profile_gred');
    const profileTarikhDaftar = document.getElementById('profile_tarikh_daftar');
    const profileJenisPendaftaran = document.getElementById('profile_jenis_pendaftaran');
    const labelAlamatBerdaftar = document.getElementById('label_alamat_berdaftar');
    const profileAlamatBerdaftar = document.getElementById('profile_alamat_berdaftar');
    const profileAlamatSurat = document.getElementById('profile_alamat_surat');
    const profileNoTelefonSyarikat = document.getElementById('profile_no_telefon_syarikat');
    const profileNoFax = document.getElementById('profile_no_fax');
    const profileEmailSyarikat = document.getElementById('profile_email_syarikat');
    const profileWeb = document.getElementById('profile_web');

    if (window.extractedProfileData.applicantName && profileNamaPemohon) {
        profileNamaPemohon.value = window.extractedProfileData.applicantName;
    }

    if (window.extractedProfileData.jawatan && profileJawatanPemohon) {
        profileJawatanPemohon.value = window.extractedProfileData.jawatan;
    }

    if (window.extractedProfileData.icNumber && profileIcPemohon) {
        profileIcPemohon.value = window.extractedProfileData.icNumber;
    }

    if (window.extractedProfileData.phoneNumber && profileTelefonPemohon) {
        profileTelefonPemohon.value = window.extractedProfileData.phoneNumber;
    }

    if (window.extractedProfileData.email && profileEmailPemohon) {
        profileEmailPemohon.value = window.extractedProfileData.email;
    }

    if (window.extractedProfileData.companyName && profileSyarikat) {
        profileSyarikat.value = window.extractedProfileData.companyName;
    }

    if (window.extractedProfileData.registrationNumber && profileCidb) {
        profileCidb.value = window.extractedProfileData.registrationNumber;
    }

    if (window.extractedProfileData.grade && profileGred) {
        for (let i = 0; i < profileGred.options.length; i++) {
            if (profileGred.options[i].value.toUpperCase() === window.extractedProfileData.grade.toUpperCase()) {
                profileGred.selectedIndex = i;
                break;
            }
        }
    }

    if (window.extractedProfileData.registrationDate && profileTarikhDaftar) {
        let dateVal = window.extractedProfileData.registrationDate;
        if (dateVal.match(/\d{2}\/\d{2}\/\d{4}/)) {
            const parts = dateVal.split('/');
            dateVal = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        profileTarikhDaftar.value = dateVal;
    }

    if (window.extractedProfileData.jenisPendaftaran && profileJenisPendaftaran) {
        profileJenisPendaftaran.value = window.extractedProfileData.jenisPendaftaran;
    }

    if (window.extractedProfileData.labelAlamatUtama && labelAlamatBerdaftar) {
        const labelLower = window.extractedProfileData.labelAlamatUtama.toLowerCase();
        if (labelLower.includes('perniagaan') || labelLower.includes('business')) {
            labelAlamatBerdaftar.textContent = 'Alamat Perniagaan';
        } else if (labelLower.includes('surat-menyurat') || labelLower.includes('correspondence')) {
            labelAlamatBerdaftar.textContent = 'Alamat Surat-menyurat';
        } else {
            labelAlamatBerdaftar.textContent = 'Alamat Berdaftar';
        }
    }

    if (window.extractedProfileData.alamatUtama && profileAlamatBerdaftar) {
        profileAlamatBerdaftar.value = window.extractedProfileData.alamatUtama;
    }

    if (window.extractedProfileData.alamatSuratMenyurat && profileAlamatSurat) {
        profileAlamatSurat.value = window.extractedProfileData.alamatSuratMenyurat;
    }

    if (window.extractedProfileData.noTelefonSyarikat && profileNoTelefonSyarikat) {
        profileNoTelefonSyarikat.value = window.extractedProfileData.noTelefonSyarikat;
    }

    if (window.extractedProfileData.noFax && profileNoFax) {
        profileNoFax.value = window.extractedProfileData.noFax;
    }

    if (window.extractedProfileData.emailSyarikat && profileEmailSyarikat) {
        profileEmailSyarikat.value = window.extractedProfileData.emailSyarikat;
    }

    if (window.extractedProfileData.webAddress && profileWeb) {
        profileWeb.value = window.extractedProfileData.webAddress;
    }

    if (typeof window.CustomAppModal !== 'undefined') {
        window.CustomAppModal.alert("Data profile berjaya diisi ke borang!", "Berjaya", "success");
    } else {
        alert("Data profile berjaya diisi ke borang!");
    }
};

window.clearProfileData = function() {
    const profilePdfInput = document.getElementById('profilePdfInput');
    const profilePdfFileName = document.getElementById('profilePdfFileName');
    const profilePdfResult = document.getElementById('profilePdfResult');
    const profilePdfExtractedData = document.getElementById('profilePdfExtractedData');
    const btnProsesProfileAI = document.getElementById('btnProsesProfileAI');
    
    if (profilePdfInput) {
        profilePdfInput.value = ''; // Kosongkan fail tanpa buang fungsi AI
    }

    if (profilePdfFileName) {
        profilePdfFileName.textContent = 'Tiada fail dipilih';
        profilePdfFileName.style.fontWeight = 'normal';
        profilePdfFileName.style.color = '';
    }
    if (profilePdfResult) {
        profilePdfResult.style.display = 'none';
    }
    if (profilePdfExtractedData) {
        profilePdfExtractedData.innerHTML = '';
    }
    if (btnProsesProfileAI) {
        btnProsesProfileAI.disabled = true;
    }
    window.extractedProfileData = null;

    if (typeof window.storageWrapper !== 'undefined') {
        window.storageWrapper.remove(['stb_extracted_profile_data']);
    }
};

// =========================================================================
// SETUP PDF EVENT LISTENERS (UNTUK MAIN FORM & PROFILE)
// =========================================================================

window.setupPdfEventListeners = function() {
    // --- MAIN FORM PDF UPLOAD ---
    const pdfUploadArea = document.getElementById('pdfUploadArea');
    const pdfFileInput = document.getElementById('pdfFileInput');
    const pdfFileName = document.getElementById('pdfFileName');
    const btnProcessManual = document.getElementById('btnProcessManual');
    const btnProcessAI = document.getElementById('btnProcessAI');
    const btnApplyPdfData = document.getElementById('btnApplyPdfData');
    const btnClearPdfData = document.getElementById('btnClearPdfData');

    if (pdfUploadArea) {
        pdfUploadArea.addEventListener('click', () => {
            pdfFileInput.click();
        });

        pdfUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            pdfUploadArea.classList.add('dragover');
        });

        pdfUploadArea.addEventListener('dragleave', () => {
            pdfUploadArea.classList.remove('dragover');
        });

        pdfUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            pdfUploadArea.classList.remove('dragover');
            
            if (e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                if (file.type === 'application/pdf') {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    pdfFileInput.files = dataTransfer.files;
                    
                    pdfFileInput.dispatchEvent(new Event('change', { bubbles: true }));
                    window.updateFileName(file.name);
                } else {
                    if (typeof window.CustomAppModal !== 'undefined') {
                        window.CustomAppModal.alert("Sila muat naik fail PDF sahaja.", "Format Salah", "warning");
                    } else {
                        alert("Sila muat naik fail PDF sahaja.");
                    }
                }
            }
        });
    }

    if (pdfFileInput) {
        pdfFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                window.updateFileName(e.target.files[0].name);
                
                // --- KOD BARU: Arahkan sistem terus proses AI ---
                window.processPdfWithAI();
                // ----------------------------------------------
                
            } else {
                window.updateFileName('Tiada fail dipilih');
            }
        });
    }

    if (btnProcessManual) {
        btnProcessManual.addEventListener('click', () => {
            window.processPdfManual();
        });
    }

    if (btnProcessAI) {
        btnProcessAI.addEventListener('click', () => {
            window.processPdfWithAI();
        });
    }

    if (btnApplyPdfData) {
        btnApplyPdfData.addEventListener('click', window.applyPdfDataToForm);
    }

    if (btnClearPdfData) {
        btnClearPdfData.addEventListener('click', window.clearPdfData);
    }

    // --- PROFILE PDF UPLOAD ---
    const profilePdfUploadArea = document.getElementById('profilePdfUploadArea');
    const profilePdfInput = document.getElementById('profilePdfInput');
    const btnProsesProfileAI = document.getElementById('btnProsesProfileAI');
    const btnApplyProfileData = document.getElementById('btnApplyProfileData');
    const btnClearProfileData = document.getElementById('btnClearProfileData');

    if (profilePdfUploadArea) {
        profilePdfUploadArea.addEventListener('click', () => {
            profilePdfInput.click();
        });

        profilePdfUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            profilePdfUploadArea.classList.add('dragover');
        });

        profilePdfUploadArea.addEventListener('dragleave', () => {
            profilePdfUploadArea.classList.remove('dragover');
        });

        profilePdfUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            profilePdfUploadArea.classList.remove('dragover');
            
            if (e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                if (file.type === 'application/pdf') {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    profilePdfInput.files = dataTransfer.files;
                    
                    profilePdfInput.dispatchEvent(new Event('change', { bubbles: true }));
                    window.updateProfileFileName(file.name);
                } else {
                    if (typeof window.CustomAppModal !== 'undefined') {
                        window.CustomAppModal.alert("Sila muat naik fail PDF sahaja.", "Format Salah", "warning");
                    } else {
                        alert("Sila muat naik fail PDF sahaja.");
                    }
                }
            }
        });
    }

    if (profilePdfInput) {
        profilePdfInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                window.updateProfileFileName(e.target.files[0].name);
                
                // --- KOD BARU: Arahkan sistem terus proses AI Profile ---
                window.processProfileWithAI();
                // ------------------------------------------------------
                
            } else {
                window.updateProfileFileName('Tiada fail dipilih');
            }
        });
    }

    if (btnProsesProfileAI) {
        btnProsesProfileAI.addEventListener('click', () => {
            window.processProfileWithAI();
        });
    }

    if (btnApplyProfileData) {
        btnApplyProfileData.addEventListener('click', window.applyProfileDataToForm);
    }

    if (btnClearProfileData) {
        btnClearProfileData.addEventListener('click', window.clearProfileData);
    }

    console.log("V6.5.2 PDF Event Listeners setup completed");
};

// =========================================================================
// FUNGSI BANTUAN UNTUK KEMASKINI NAMA FAIL
// =========================================================================

window.updateFileName = function(fileName) {
    const pdfFileName = document.getElementById('pdfFileName');
    const btnProcessManual = document.getElementById('btnProcessManual');
    const btnProcessAI = document.getElementById('btnProcessAI');
    
    if (pdfFileName) {
        pdfFileName.textContent = fileName;
        pdfFileName.style.fontWeight = 'bold';
        pdfFileName.style.color = '#3b82f6';
    }
    if (btnProcessManual) {
        btnProcessManual.disabled = fileName === 'Tiada fail dipilih';
    }
    if (btnProcessAI) {
        btnProcessAI.disabled = fileName === 'Tiada fail dipilih';
    }
};

window.updateProfileFileName = function(fileName) {
    const profilePdfFileName = document.getElementById('profilePdfFileName');
    const btnProsesProfileAI = document.getElementById('btnProsesProfileAI');
    
    if (profilePdfFileName) {
        profilePdfFileName.textContent = fileName;
        profilePdfFileName.style.fontWeight = 'bold';
        profilePdfFileName.style.color = '#3b82f6';
    }
    if (btnProsesProfileAI) {
        btnProsesProfileAI.disabled = fileName === 'Tiada fail dipilih';
    }
};

// =========================================================================
// AUTOMATIK INIT KETIKA SCRIPT LOAD
// =========================================================================
console.log("pdf_ai.js V6.5.2 - Modul PDF & AI Processing dimuatkan.");