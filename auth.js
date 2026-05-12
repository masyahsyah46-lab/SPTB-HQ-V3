// auth.js - V6.5.2 (Modul Pengesahan & Firebase)
// Diekstrak dari app.js untuk Modularization
// Mengandungi: Firebase Config, Google Identity Services, Authentication Logic

// =========================================================================
// GLOBAL WINDOW VARIABLES (Supaya boleh diakses oleh fail lain)
// =========================================================================
window.currentUser = null;
window.dbFirestore = null;
window.authFirebase = null;
window.currentUserFirebaseCode = null;
window.firebaseUserRules = null;
window.bakulUnsubscribe = null;

// =========================================================================
// FIREBASE CONFIG (UNTUK TAPISAN & BAKUL SAHAJA)
// =========================================================================
window.firebaseConfig = {
    apiKey: "AIzaSyCiRTUSrEm7mxZ4Hzfb2iT3QevF9tZm6xA",
    authDomain: "tapisan-stb-g4-g7.firebaseapp.com",
    projectId: "tapisan-stb-g4-g7",
    storageBucket: "tapisan-stb-g4-g7.firebasestorage.app",
    messagingSenderId: "471944484216",
    appId: "1:471944484216:web:444b36f32ef52143c4a48d"
};

// =========================================================================
// INISIALISASI FIREBASE
// =========================================================================
window.initializeFirebase = function() {
    // Safety Check: Pastikan Firebase telah dimuat turun sebelum di-init
    if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) {
            firebase.initializeApp(window.firebaseConfig);
        }
        window.dbFirestore = firebase.firestore();
        window.authFirebase = firebase.auth();
        console.log("V6.5.2 Firebase berjaya diinisialisasikan.");
    } else {
        console.error("Sistem Gagal Memuatkan Firebase. Sila semak fail index.html (CSP).");
    }
};

// =========================================================================
// GOOGLE IDENTITY SERVICES (GIS) FUNCTIONS
// =========================================================================

// Google Client ID
window.GOOGLE_CLIENT_ID = '758579492428-rnfev1nkkf2e6qduhujgtfbhudl2j9td.apps.googleusercontent.com';

// URL APPSCRIPT (Untuk rujukan fungsi verifyEmailWithBackend)
window.SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzvNw5GgjWUXuTRp3Yv7BzkjNH0b8oAujq06bzdGX0CyxmV9sj-zAxdrBEr7yL--1eE/exec';

// Fungsi untuk decode JWT token dari Google
window.decodeJwtResponse = function(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("V6.5.2 Error decoding JWT:", error);
        return null;
    }
};

// Fungsi pengendali respons credential Google
window.handleCredentialResponse = async function(response) {
    console.log("V6.5.2 Google credential response received");
    
    // 1. Sembunyi butang Google & ralat (jika ada)
    const googleButton = document.getElementById('googleButton');
    if (googleButton) {
        googleButton.style.display = 'none';
    }
    
    const loginError = document.getElementById('loginError');
    if (loginError) {
        loginError.style.display = 'none';
        loginError.textContent = '';
    }
    
    // 2. MULA PAPARKAN LOADING PROGRESS BAR (0-100%)
    if (typeof window.simulateLoadingWithSteps === 'function') {
        window.simulateLoadingWithSteps(
            [
                'Mengesahkan token Google...',
                'Mengekstrak maklumat e-mel...',
                'Menyemak pangkalan data...',
                'Mengesahkan peranan pengguna...',
                'Menyediakan sistem...',
                'Log masuk berjaya!'
            ],
            'Proses Log Masuk'
        );
    }
    
    try {
        // Decode JWT token untuk dapatkan email
        const decodedToken = window.decodeJwtResponse(response.credential);
        
        if (!decodedToken || !decodedToken.email) {
            throw new Error('Token Google tidak sah atau tiada e-mel.');
        }
        
        const userEmail = decodedToken.email;
        console.log("V6.5.2 Email extracted from Google token:", userEmail);
        
        // Hantar email ke backend GAS untuk pengesahan
        const result = await window.verifyEmailWithBackend(userEmail);
        
        if (result.authenticated && result.user) {
            console.log("V6.5.2 GIS Authentication successful for:", result.user.email);
            
            window.currentUser = result.user;
            window.currentUser.role = result.user.role ? result.user.role.toUpperCase().trim() : "";
            
            // KOD BARU: Simpan emel dalam objek currentUser
            window.currentUser.email = userEmail.toLowerCase();

            // Log masuk ke Firebase untuk SEMUA role supaya Firebase membenarkan akses (Rules)
            window.authFirebase.signInAnonymously().then(() => {
                console.log("Berjaya log masuk ke Firebase untuk fungsi YouTube/Cache.");
                
                // KOD LAMA: Sambungkan ke Firebase Bakul HANYA jika peranan adalah PENGESYOR
                if (window.currentUser.role === 'PENGESYOR') {
                    window.currentUserFirebaseCode = result.user.firebaseCode || null; 
                    if (window.currentUserFirebaseCode) {
                        console.log("Menyambung ke Firebase Bakul dengan kod:", window.currentUserFirebaseCode);
                        window.dbFirestore.collection("users").doc(window.currentUserFirebaseCode).get().then(doc => {
                            if (doc.exists) {
                                window.firebaseUserRules = doc.data();
                                console.log("Peraturan Tapisan Firebase dimuatkan.");
                                window.subscribeToBakulFirebase();
                            }
                        });
                    }
                }
            }).catch(err => console.error("Ralat Firebase Auth:", err));

            // Simpan sesi dan tarikh hari ini ke storage
            const todayStr = new Date().toDateString();
            if (typeof window.storageWrapper !== 'undefined') {
                await window.storageWrapper.set({ 
                    'stb_session': window.currentUser,
                    'stb_login_date': todayStr
                });
            }

            // --- KOD PENYELAMAT: Tukar paparan di belakang tabir loading ---
            const loginScreen = document.getElementById('login-screen');
            const appContainer = document.getElementById('app-container');
            const userBadge = document.getElementById('userBadge');
            
            if (loginScreen) loginScreen.style.display = 'none';
            if (appContainer) appContainer.style.display = 'block';
            
            // Update maklumat profil pengguna
            if (userBadge) {
                userBadge.innerText = `👤 ${window.currentUser.name} (${window.currentUser.role})`;
                userBadge.title = "Buka Portal YouTube";
                userBadge.style.cursor = "pointer";
                userBadge.onclick = function() {
                    if (typeof window.switchTab === 'function' && window.lastActiveTab !== 'youtube') {
                        window.tabSebelumYoutube = window.lastActiveTab; 
                        window.switchTab('youtube');
                    }
                };
            }

            // Biarkan bar peratusan berjalan sehingga tamat untuk "User Experience" yang premium
            setTimeout(() => {
                if (typeof window.hideLoading === 'function') {
                    window.hideLoading(); 
                }
                // Jalankan fungsi initialize app selepas loading hilang
                if (typeof window.setupUserUI === 'function') {
                    window.setupUserUI(); 
                }
            }, 1500); 
            
        } else {
            // Jika emel salah/tidak berdaftar, barulah panggil error
            if (typeof window.hideLoading === 'function') {
                window.hideLoading();
            }
            const errorMsg = result.message || 'Akses Ditolak: E-mel tidak didaftarkan dalam sistem.';
            window.handleAuthError(errorMsg);
        }
       
    } catch (error) {
        console.error("V6.5.2 GIS Authentication error:", error);
        if (typeof window.hideLoading === 'function') {
            window.hideLoading(); // Tutup progress bar
        }
        const errorMsg = `Ralat Pengesahan: ${error.message}. Sila cuba lagi.`;
        window.handleAuthError(errorMsg);
    }
};

// Fungsi untuk menghantar email ke backend
window.verifyEmailWithBackend = async function(email) {
    console.log("V6.5.2 Verifying email with backend:", email);
    
    try {
        const response = await window.fetchWithRetry(window.SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'checkAuth',
                email: email
            })
        }, 3, 1500);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log("V6.5.2 Backend verification response:", result);
        
        return result;
        
    } catch (error) {
        console.error("V6.5.2 Backend verification error:", error);
        throw error;
    }
};

// Fungsi untuk papar ralat autentikasi
window.handleAuthError = function(errorMsg) {
    const loginLoadingText = document.getElementById('loginLoadingText');
    const loginError = document.getElementById('loginError');
    const loginPin = document.getElementById('login_pin');
    const btnLogin = document.getElementById('btnLogin');
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    
    if (loginLoadingText) {
        loginLoadingText.style.display = 'none';
    }
    
    if (loginError) {
        loginError.style.display = 'block';
        loginError.textContent = errorMsg;
        loginError.style.color = '#dc2626';
        loginError.style.fontWeight = 'bold';
        loginError.style.padding = '12px';
        loginError.style.backgroundColor = '#fee2e2';
        loginError.style.borderRadius = '8px';
        loginError.style.border = '1px solid #ef4444';
    }
    
    // Tunjuk semula butang Google supaya user boleh cuba lagi
    const googleButton = document.getElementById('googleButton');
    if (googleButton) {
        googleButton.style.display = 'flex';
    }
    
    // Sembunyikan input PIN kerana tidak digunakan
    if (loginPin) loginPin.style.display = 'none';
    if (btnLogin) btnLogin.style.display = 'none';
    
    // Kekal di skrin login
    if (loginScreen) loginScreen.style.display = 'flex';
    if (appContainer) appContainer.style.display = 'none';
};

// Fungsi untuk initialize Google Sign-In
window.initializeGoogleSignIn = function() {
    const googleButton = document.getElementById('googleButton');
    if (!googleButton) {
        console.warn("V6.5.2 Google button container not found");
        return;
    }
    
    // Pastikan Google API sudah dimuatkan
    if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) {
        console.warn("V6.5.2 Google Identity Services API not loaded yet");
        // Cuba lagi selepas 500ms
        setTimeout(window.initializeGoogleSignIn, 500);
        return;
    }
    
    console.log("V6.5.2 Initializing Google Identity Services...");
    
    try {
        // Initialize Google Sign-In
        google.accounts.id.initialize({
            client_id: window.GOOGLE_CLIENT_ID,
            callback: window.handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
        });
        
        // Render butang Google Sign-In (Gaya Moden)
        google.accounts.id.renderButton(
            googleButton,
            { 
                theme: 'filled_blue', // Tukar dari outline ke filled_blue
                size: 'large',
                type: 'standard',
                shape: 'pill',       // Tukar dari rectangular ke pill (bujur)
                width: '320',        // Lebar yang lebih selesa
                logo_alignment: 'left'
            }
        );
        
        // Tunjukkan googleButton
        googleButton.style.display = 'flex';
        googleButton.style.justifyContent = 'center';
        googleButton.style.alignItems = 'center';
        googleButton.style.padding = '10px';
        
        console.log("V6.5.2 Google Sign-In button rendered successfully");
        
    } catch (error) {
        console.error("V6.5.2 Error initializing Google Sign-In:", error);
        
        // Fallback: tunjuk mesej error di login screen
        const loginError = document.getElementById('loginError');
        if (loginError) {
            loginError.style.display = 'block';
            loginError.textContent = 'Ralat memuatkan Google Sign-In. Sila muat semula halaman.';
            loginError.style.color = '#dc2626';
        }
    }
};

// =========================================================================
// LOGIK LOGOUT & SESI TAMAT TEMPOH
// =========================================================================

// Pembolehubah inactivity timer
window.inactivityTimer = null;
window.TIMEOUT_DURATION = 3600000; // 1 jam = 3600000 milisaat

window.logoutUserOnTimeout = async function() {
    if (!window.currentUser) return; 
    
    // PENGGUNAAN MODAL BARU
    if (typeof window.CustomAppModal !== 'undefined') {
        await window.CustomAppModal.alert(
            "Sesi anda telah tamat tempoh kerana tiada aktiviti selama 1 jam. Anda telah dilog keluar secara automatik demi keselamatan.", 
            "Sesi Tamat", 
            "warning"
        );
    } else {
        alert("Sesi anda telah tamat tempoh kerana tiada aktiviti selama 1 jam. Anda telah dilog keluar secara automatik demi keselamatan.");
    }
    
    if (typeof window.storageWrapper !== 'undefined') {
        await window.storageWrapper.remove([
            'stb_session', 'stb_form_data', 'stb_pelulus_state', 'stb_last_active_tab',
            'stb_last_active_element', 'stb_form_states', 'stb_search_state', 'stb_search_history_state',
            'stb_has_printed', 'stb_drive_folder_url', 'stb_user_folder_url', 'stb_filter_pengesyor',
            'stb_dashboard_data', 'stb_form_persistence', 'stb_database_persistence',
            'stb_current_submitted_status_filter', 'stb_current_submitted_jenis_filter',
            'stb_current_history_status_filter', 'stb_current_history_jenis_filter',
            'stb_current_draft_filter', 'stb_music_playing', 'stb_bgm_volume', 'stb_sfx_volume'
        ]);
    }
    location.reload();
};

window.resetInactivityTimer = function() {
    if (window.inactivityTimer) clearTimeout(window.inactivityTimer);
    if (window.currentUser) { 
        window.inactivityTimer = setTimeout(window.logoutUserOnTimeout, window.TIMEOUT_DURATION);
    }
};

// KOD BARU: Fungsi semak jika hari dah bertukar
window.checkDayChangeLogout = async function() {
    if (!window.currentUser) return false;
    
    if (typeof window.storageWrapper === 'undefined') return false;
    
    const storage = await window.storageWrapper.get(['stb_login_date']);
    const loginDate = storage.stb_login_date;
    const todayStr = new Date().toDateString();
    
    if (loginDate && loginDate !== todayStr) {
        // PENGGUNAAN MODAL BARU
        if (typeof window.CustomAppModal !== 'undefined') {
            await window.CustomAppModal.alert(
                "Sesi anda telah tamat tempoh kerana pertukaran hari. Sila log masuk semula demi keselamatan.", 
                "Sesi Tamat", 
                "warning"
            );
        } else {
            alert("Sesi anda telah tamat tempoh kerana pertukaran hari. Sila log masuk semula demi keselamatan.");
        }
        
        await window.storageWrapper.remove([
            'stb_session', 'stb_login_date', 'stb_form_data', 'stb_pelulus_state', 'stb_last_active_tab',
            'stb_last_active_element', 'stb_form_states', 'stb_search_state', 'stb_search_history_state',
            'stb_has_printed', 'stb_drive_folder_url', 'stb_user_folder_url', 'stb_filter_pengesyor',
            'stb_dashboard_data', 'stb_form_persistence', 'stb_database_persistence',
            'stb_current_submitted_status_filter', 'stb_current_submitted_jenis_filter',
            'stb_current_history_status_filter', 'stb_current_history_jenis_filter',
            'stb_current_draft_filter', 'stb_music_playing', 'stb_bgm_volume', 'stb_sfx_volume'
        ]);
        location.reload();
        return true;
    }
    return false;
};

// =========================================================================
// FUNGSI BAKUL & FIREBASE LISTENER
// =========================================================================
window.subscribeToBakulFirebase = function() {
    if (window.bakulUnsubscribe) window.bakulUnsubscribe();
    
    window.bakulUnsubscribe = window.dbFirestore.collection("applications")
        .where("processedBy", "==", window.currentUserFirebaseCode)
        .where("status", "==", "Pending")
        .onSnapshot((snap) => {
            const bakulData = [];
            snap.forEach(doc => {
                bakulData.push({ id: doc.id, ...doc.data() });
            });
            
            // KEMASKINI: Auto-cleanup Firebase Bakul dengan syarat ketat (CIDB + Tarikh)
            const validBakulData = [];
            bakulData.forEach(d => {
                const normBDate = window.normalizeDateToDBFormat ? window.normalizeDateToDBFormat(d.dateSubmitted) : d.dateSubmitted;
                let shouldDelete = false;

                if (window.cachedData) {
                    for (let c of window.cachedData) {
                        // Jika CIDB dan Tarikh Mohon adalah sama
                        if (c.cidb === d.cidb && c.start_date === normBDate) {
                            // Kita boleh anggap ia telah diproses jika ia berada di sistem (Drafts/Submitted)
                            shouldDelete = true;
                            break;
                        }
                    }
                }

                if (shouldDelete) {
                    window.dbFirestore.collection("applications").doc(d.id).delete().catch(err => console.log(err));
                } else {
                    validBakulData.push(d);
                }
            });

            if (typeof window.globalBakulData !== 'undefined') {
                window.globalBakulData = validBakulData;
            }

            // Susun terbaharu di atas
            validBakulData.sort((a, b) => {
                const timeA = a.addedToBasketAt ? a.addedToBasketAt.seconds : 0;
                const timeB = b.addedToBasketAt ? b.addedToBasketAt.seconds : 0;
                return timeB - timeA;
            });

            const badge = document.getElementById('bakulCountBadge');
            if (badge) badge.innerText = validBakulData.length;
            
            const tbody = document.getElementById('bakulTableBody');
            if (!tbody) return;

            if(validBakulData.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 30px; color:#94a3b8; font-style: italic;">Bakul Kosong. Sila tapis dan tambah dari Tapisan Excel.</td></tr>`;
            } else {
                tbody.innerHTML = validBakulData.map(d => {
                    let rowColorClass = '';
                    const tLower = (d.type || '').toLowerCase();
                    if(tLower.includes('baru')) rowColorClass = 'row-new';
                    else if(tLower.includes('pembaharuan') || tLower.includes('renewal')) rowColorClass = 'row-renewal';
                    else if(tLower.includes('maklumat') || tLower.includes('info')) rowColorClass = 'row-info';
                    else if(tLower.includes('gred') || tLower.includes('grade')) rowColorClass = 'row-grade';

                    return `
                    <tr class="${rowColorClass}" style="border-bottom: 1px solid #f1f5f9;">
                        <td style="font-weight:bold; color: #1e3a8a; font-size: 1.05rem;">${d.company}</td>
                        <td>
                            <span style="font-weight:bold; color: #f59e0b;">${d.grade}</span> <br>
                            <span style="font-size:0.85rem; color:#64748b; font-family: monospace;">${d.cidb}</span>
                        </td>
                        <td>${d.district}</td>
                        <td><span style="background: rgba(255,255,255,0.7); padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; border: 1px solid #cbd5e1; color:#333; font-weight:bold;">${d.type}</span></td>
                        <td><span style="font-weight:600; color:#475569;">${d.dateSubmitted || '-'}</span></td>
                        <td>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn btn-blue btn-proses-bakul" style="padding: 6px 12px; font-size: 0.85rem; border-radius: 6px; flex: 1;" 
                                    data-id="${d.id}" 
                                    data-company="${(d.company || '').replace(/"/g, '&quot;')}" 
                                    data-cidb="${d.cidb || ''}" 
                                    data-grade="${d.grade || ''}" 
                                    data-type="${(d.type || '').replace(/"/g, '&quot;')}"
                                    data-date="${d.dateSubmitted || ''}">Proses</button>
                                <button class="btn btn-delete btn-padam-bakul" style="padding: 6px 12px; font-size: 0.85rem; border-radius: 6px; background: #ef4444;" data-id="${d.id}">Padam</button>
                            </div>
                        </td>
                    </tr>
                    `;
                }).join('');
            }

            // Update lencana di Tapisan Excel
            const tabTapisan = document.getElementById('tab-tapisan');
            if (tabTapisan && tabTapisan.classList.contains('active')) {
                if (typeof window.renderExcelTable === 'function') window.renderExcelTable();
            }
        });
};

// Fungsi bantuan: Menyamakan format tarikh Excel (DD/MM/YYYY) ke Database (YYYY-MM-DD)
window.normalizeDateToDBFormat = function(dateStr) {
    if (!dateStr) return '';
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
    }
    return dateStr;
};

// =========================================================================
// SETUP EVENT LISTENERS UNTUK INACTIVITY
// =========================================================================
window.setupInactivityListeners = function() {
    ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(evt => {
        document.addEventListener(evt, window.resetInactivityTimer, true);
    });
};

// =========================================================================
// AUTOMATIK INIT KETIKA SCRIPT LOAD
// =========================================================================
console.log("auth.js V6.5.2 - Modul Pengesahan & Firebase dimuatkan.");