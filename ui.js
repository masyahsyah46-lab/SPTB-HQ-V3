// ui.js - V6.5.2 (Modul Antara Muka, Audio, Animasi & Navigasi)
// Diekstrak dari app.js untuk Modularization
// Mengandungi: Custom Modal, Audio System, Loading, Digital Clock, Mobile Menu, Tab Navigation

// =========================================================================
// GLOBAL WINDOW VARIABLES (UI-SPECIFIC)
// =========================================================================
window.sfxVolume = 0.7; // Default SFX volume: 70%
window.loadingProgressInterval = null;
window.isDashboardFirstLoad = true;
window.lastActiveTab = 'stb';

// =========================================================================
// ENJIN CUSTOM ANIMATED MODAL (PENGGANTI ALERT & CONFIRM CHROME)
// =========================================================================
window.CustomAppModal = {
    show: function(options) {
        return new Promise((resolve) => {
            const overlay = document.getElementById('customModalOverlay');
            const iconBox = document.getElementById('customModalIconBox');
            const iconEl = document.getElementById('customModalIcon');
            const titleEl = document.getElementById('customModalTitle');
            const messageEl = document.getElementById('customModalMessage');
            const actionsEl = document.getElementById('customModalActions');

            if (!overlay || !iconBox || !iconEl || !titleEl || !messageEl || !actionsEl) {
                console.error("V6.5.2 Modal elements not found in DOM");
                resolve(false);
                return;
            }

            // Set Ikon & Warna
            iconBox.className = 'custom-modal-icon-container';
            const type = options.type || 'info';
            if (type === 'success') { iconBox.classList.add('icon-success'); iconEl.innerHTML = '✨'; }
            else if (type === 'error') { iconBox.classList.add('icon-error'); iconEl.innerHTML = '❌'; }
            else if (type === 'warning') { iconBox.classList.add('icon-warning'); iconEl.innerHTML = '⚠️'; }
            else { iconBox.classList.add('icon-info'); iconEl.innerHTML = 'ℹ️'; }

            titleEl.innerText = options.title || 'Makluman';
            messageEl.innerHTML = options.message || '';
            actionsEl.innerHTML = ''; // Clear butang lama

            const close = (result) => {
                overlay.classList.remove('show');
                setTimeout(() => {
                    overlay.style.display = 'none';
                    resolve(result); // Kembalikan true (Pasti) atau false (Batal)
                }, 300);
            };

            // Jika ia adalah Modal CONFIRM
            if (options.isConfirm) {
                const cancelBtn = document.createElement('button');
                cancelBtn.className = 'custom-modal-btn custom-modal-btn-cancel';
                cancelBtn.innerText = options.cancelText || 'Batal';
                cancelBtn.onclick = () => { 
                    if (typeof window.playSoundEffect === 'function') window.playSoundEffect('ui_click.mp3'); 
                    close(false); 
                };

                const confirmBtn = document.createElement('button');
                confirmBtn.className = `custom-modal-btn ${options.isDanger ? 'custom-modal-btn-danger' : 'custom-modal-btn-confirm'}`;
                confirmBtn.innerText = options.confirmText || 'Teruskan';
                confirmBtn.onclick = () => { 
                    if (typeof window.playSoundEffect === 'function') window.playSoundEffect('ui_click.mp3'); 
                    close(true); 
                };

                actionsEl.appendChild(cancelBtn);
                actionsEl.appendChild(confirmBtn);
            } 
            // Jika ia adalah Modal ALERT biasa
            else {
                const okBtn = document.createElement('button');
                okBtn.className = 'custom-modal-btn custom-modal-btn-confirm';
                okBtn.innerText = 'OK';
                okBtn.onclick = () => { 
                    if (typeof window.playSoundEffect === 'function') window.playSoundEffect('ui_click.mp3'); 
                    close(true); 
                };
                actionsEl.appendChild(okBtn);
            }

            // Paparkan Modal dengan animasi
            overlay.style.display = 'flex';
            void overlay.offsetWidth; // Trigger reflow
            overlay.classList.add('show');
        });
    },
    alert: function(message, title = 'Makluman', type = 'info') {
        if (typeof window.playSoundEffect === 'function') {
            window.playSoundEffect(type === 'error' ? 'error_buzz.mp3' : 'minimal alert.mp3');
        }
        return this.show({ message, title, type, isConfirm: false });
    },
    confirm: function(message, title = 'Pengesahan Tindakan', type = 'warning', confirmText = 'Teruskan', isDanger = false) {
        if (typeof window.playSoundEffect === 'function') {
            window.playSoundEffect('minimal alert.mp3');
        }
        return this.show({ message, title, type, isConfirm: true, confirmText, isDanger });
    }
};

// =========================================================================
// V6.5.2 AUDIO & VOLUME CONTROL SYSTEM (SFX ONLY)
// =========================================================================

window.playSoundEffect = async function(soundFile) {
    try {
        let fileName = soundFile;
        if (fileName === 'ui_click.mp3') fileName = 'audio/ui click.mp3';
        else if (fileName === 'positive_chime.mp3') fileName = 'audio/positive chime.mp3';
        else if (fileName === 'error_buzz.mp3') fileName = 'audio/error buzz.mp3';
        else if (!fileName.includes('/')) fileName = 'audio/' + fileName;

        const sfx = new Audio(fileName);
        sfx.volume = window.sfxVolume;
        await sfx.play();
        console.log(`V6.5.2 (Web) Sound effect played: ${fileName}`);
    } catch (error) {
        console.error(`V6.5.2 (Web) Failed to play sound effect (${soundFile}):`, error);
    }
};

window.updateSfxVolume = async function(newVolume) {
    try {
        window.sfxVolume = newVolume;
        
        const sfxVolumeValue = document.getElementById('sfxVolumeValue');
        if (sfxVolumeValue) {
            sfxVolumeValue.textContent = Math.round(window.sfxVolume * 100) + '%';
        }
        
        // Simpan tetapan volume SFX ke dalam local storage
        if (typeof window.storageWrapper !== 'undefined') {
            await window.storageWrapper.set({ 'stb_sfx_volume': window.sfxVolume });
        }
        
        console.log(`V6.5.2 (Web) SFX volume updated to ${Math.round(window.sfxVolume * 100)}%`);
    } catch (error) {
        console.error("V6.5.2 (Web) Failed to update SFX volume:", error);
    }
};

window.setupAudioControls = function() {
    const sfxVolumeSlider = document.getElementById('sfxVolumeSlider');
    const sfxVolumeValue = document.getElementById('sfxVolumeValue');
    
    // HANYA KEKALKAN KAWALAN SFX SAHAJA
    if (sfxVolumeSlider) {
        sfxVolumeSlider.addEventListener('change', async (e) => {
            const newVolume = parseFloat(e.target.value);
            await window.updateSfxVolume(newVolume);
        });
        sfxVolumeSlider.value = window.sfxVolume;
        if (sfxVolumeValue) {
            sfxVolumeValue.textContent = Math.round(window.sfxVolume * 100) + '%';
        }
    }
    
    console.log("V6.5.2 Audio controls (SFX Only) setup completed");
};

window.setupGlobalButtonClickSound = function() {
    document.addEventListener('click', async (e) => {
        const target = e.target.closest('button, .btn, [role="button"], .tab-btn, .tick-btn, .filter-btn');
        
        if (target) {
            // Mainkan bunyi tanpa perlu check btnToggleMusic lagi
            await window.playSoundEffect('ui_click.mp3');
        }
    }, true);
    console.log("V6.5.2 Global button click sound setup completed");
};

window.playSuccessSound = async function() {
    await window.playSoundEffect('positive_chime.mp3');
};

window.playErrorSound = async function() {
    await window.playSoundEffect('error_buzz.mp3');
};

// =========================================================================
// MOBILE MENU LOGIC
// =========================================================================
window.closeMobileMenu = function() {
    const tabsContainer = document.getElementById('tabs-container');
    const menuOverlay = document.getElementById('menuOverlay');
    
    if (tabsContainer) {
        tabsContainer.classList.remove('show-menu');
    }
    if (menuOverlay) {
        menuOverlay.classList.remove('show');
        menuOverlay.style.display = 'none';
    }
};

window.openMobileMenu = function() {
    const tabsContainer = document.getElementById('tabs-container');
    const menuOverlay = document.getElementById('menuOverlay');
    
    if (tabsContainer) {
        tabsContainer.classList.add('show-menu');
    }
    if (menuOverlay) {
        menuOverlay.classList.add('show');
        menuOverlay.style.display = 'block';
    }
};

window.toggleMobileMenu = function() {
    const tabsContainer = document.getElementById('tabs-container');
    if (tabsContainer && tabsContainer.classList.contains('show-menu')) {
        window.closeMobileMenu();
    } else {
        window.openMobileMenu();
    }
};

window.setupMobileMenu = function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const menuOverlay = document.getElementById('menuOverlay');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', window.toggleMobileMenu);
    }

    if (menuOverlay) {
        menuOverlay.addEventListener('click', window.closeMobileMenu);
    }

    // Pastikan menu ditutup apabila saiz skrin berubah ke desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            window.closeMobileMenu();
        }
    });
};

// =========================================================================
// LOADING OVERLAY FUNCTIONS
// =========================================================================
window.simulateLoading = function(message = 'Memuatkan data...', submessage = '') {
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    const loadingSubtext = document.getElementById('loading-subtext');
    
    if (loadingOverlay && loadingText) {
        loadingText.textContent = message;
        if (loadingSubtext && submessage) {
            loadingSubtext.textContent = submessage;
        }
        loadingOverlay.style.display = 'flex';
        
        const progressBar = document.querySelector('.loading-progress-bar');
        const progressText = document.querySelector('.loading-progress-text');
        if (progressBar) progressBar.style.display = 'none';
        if (progressText) progressText.style.display = 'none';
    }
};

window.simulateLoadingWithSteps = function(steps, overallMessage = 'Memuatkan data...') {
    const overlay = document.getElementById('loading-overlay');
    const text = document.getElementById('loading-text');
    
    if (!overlay || !text) return;
    
    text.textContent = overallMessage;
    overlay.style.display = 'flex';
    
    const progressBar = document.getElementById('loading-progress-bar');
    const progressPercent = document.getElementById('loading-progress-percent');
    const progressLabel = document.getElementById('loading-progress-label');
    
    if (progressBar) progressBar.style.width = '0%';
    if (progressPercent) progressPercent.textContent = '0%';
    if (progressLabel && steps.length > 0) progressLabel.textContent = steps[0];
    
    if (window.loadingProgressInterval) clearInterval(window.loadingProgressInterval);
    
    let currentStep = 0;
    const totalSteps = steps.length;
    
    window.loadingProgressInterval = setInterval(() => {
        currentStep++;
        let progress = Math.min((currentStep / totalSteps) * 100, 100);
        
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (progressPercent) progressPercent.textContent = `${Math.round(progress)}%`;
        
        if (progressLabel) {
            progressLabel.textContent = (currentStep < totalSteps) ? steps[currentStep] : "Selesai!";
        }
        
        if (currentStep >= totalSteps) {
            clearInterval(window.loadingProgressInterval);
            setTimeout(() => { if(overlay) overlay.style.display = 'none'; }, 600);
        }
    }, 300);
};

window.hideLoading = function() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
    if (window.loadingProgressInterval) {
        clearInterval(window.loadingProgressInterval);
        window.loadingProgressInterval = null;
    }
};

// =========================================================================
// FUNGSI JAM DIGITAL (WAKTU & HARI & TARIKH MALAYSIA)
// =========================================================================
window.startDigitalClock = function() {
    const clockEl = document.getElementById('digitalClock');
    if (!clockEl) return;

    const hariDalamBM = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
    const bulanDalamBM = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];

    setInterval(() => {
        const now = new Date();
        
        // Dapatkan Hari & Tarikh
        const hari = hariDalamBM[now.getDay()];
        const tarikh = now.getDate();
        const bulan = bulanDalamBM[now.getMonth()];
        const tahun = now.getFullYear();
        
        // Dapatkan Masa
        let jam = now.getHours();
        let minit = now.getMinutes();
        let saat = now.getSeconds();
        
        // Tentukan AM / PM
        const ampm = jam >= 12 ? 'PM' : 'AM';
        
        // Tukar Format 24-jam ke 12-jam
        jam = jam % 12;
        jam = jam ? jam : 12; // Jika jam 0, jadikan ia 12
        
        // Tambah '0' di depan jika nombor kurang dari 10
        minit = minit < 10 ? '0' + minit : minit;
        saat = saat < 10 ? '0' + saat : saat;
        
        // Paparkan ke skrin (Hari, Tarikh Bulan Tahun | Masa AM/PM)
        clockEl.innerHTML = `🗓️ ${hari}, ${tarikh} ${bulan} ${tahun} <span style="color:#cbd5e1; margin: 0 6px;">|</span> ⏱️ ${jam}:${minit}:${saat} ${ampm}`;
    }, 1000); // Bergerak setiap 1 saat
};

// =========================================================================
// FUNGSI WARNA FORM DINAMIK (KOSONG vs DIISI)
// =========================================================================
window.applyDynamicFormColors = function() {
    // Tab utama yang mengandungi borang
    const formContainers = ['tab-checker', 'tab-database', 'tab-profile', 'tab-pelulus-action'];
    
    formContainers.forEach(tabId => {
        const tab = document.getElementById(tabId);
        if (!tab) return;
        
        // Pilih semua elemen input, select dan textarea (Kecuali butang radio, file, checkbox & hidden)
        const fields = tab.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]):not([type="file"]):not([type="hidden"]):not([hidden]), select, textarea');
        
        fields.forEach(field => {
            // Abaikan field tertentu yang kita tak nak ubah warnanya (contoh: readonly, field status ✔/✗)
            if (field.readOnly || field.disabled || field.classList.contains('status-input') || field.id === 'db_pautan') {
                field.classList.remove('form-empty', 'form-filled');
                return;
            }
            
            // Jika ruangan mempunyai teks/nilai
            if (field.value && field.value.trim() !== '') {
                if (!field.classList.contains('form-filled')) {
                    field.classList.remove('form-empty');
                    field.classList.add('form-filled');
                }
            } 
            // Jika ruangan kosong
            else {
                if (!field.classList.contains('form-empty')) {
                    field.classList.remove('form-filled');
                    field.classList.add('form-empty');
                }
            }
        });
    });
};

window.setupDynamicFormColorListeners = function() {
    // 1. Pantau setiap kali pengguna menaip / pilih sesuatu (Real-time)
    document.addEventListener('input', (e) => {
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) {
            window.applyDynamicFormColors();
        }
    });
    
    document.addEventListener('change', (e) => {
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) {
            window.applyDynamicFormColors();
        }
    });

    // 2. Semak secara automatik setiap 1 saat (Berguna bila borang diisi automatik oleh AI/Database)
    setInterval(window.applyDynamicFormColors, 1000);
    
    // Panggil sekali sewaktu sistem mula dibuka
    setTimeout(window.applyDynamicFormColors, 500);
};

// =========================================================================
// FUNGSI UPDATE TAB SLIDER (ANIMASI)
// =========================================================================
window.updateTabSlider = function() {
    const tabsContainer = document.getElementById('tabs-container');
    const slider = document.getElementById('tabSlider');
    const activeBtn = tabsContainer ? tabsContainer.querySelector('.tab-btn.active') : null;

    if (slider && activeBtn) {
        // Ambil saiz dan kedudukan butang yang aktif
        slider.style.width = activeBtn.offsetWidth + 'px';
        slider.style.height = activeBtn.offsetHeight + 'px';
        slider.style.left = activeBtn.offsetLeft + 'px';
        slider.style.top = activeBtn.offsetTop + 'px';
        slider.style.opacity = '1'; // Pastikan slider kelihatan
    } else if (slider) {
        // JIKA TIADA TAB AKTIF (Contohnya apabila berada di Portal YouTube)
        // Sembunyikan slider sepenuhnya
        slider.style.opacity = '0';
        slider.style.width = '0px';
        slider.style.height = '0px';
    }
};

// =========================================================================
// FUNGSI SWITCH TAB (NAVIGASI UTAMA)
// =========================================================================
window.switchTab = function(tabName) {
    window.closeMobileMenu();
    
    // Simpan state form tab sebelumnya
    if (window.lastActiveTab && typeof window.saveFormState === 'function') {
        window.saveFormState(window.lastActiveTab);
    }

    // Sembunyikan semua tab content
    document.querySelectorAll('.tab-content').forEach(el => {
        el.style.display = 'none';
    });

    // Kemaskini kelas active pada butang tab
    document.querySelectorAll('.tab-btn').forEach(btn => { 
        btn.classList.remove('active');
        if(btn.getAttribute('data-target') === tabName) {
            btn.classList.add('active');
        }
    });

    // --- KOD BARU: Panggil fungsi animasi selepas tab ditukar ---
    // Mula bergerak serta merta
    setTimeout(window.updateTabSlider, 10);
    // Bergerak sekali lagi di pertengahan animasi supaya nampak lebih lancar
    setTimeout(window.updateTabSlider, 150); 
    // Bergerak apabila butang sudah siap mengembang sepenuhnya (tambah sedikit masa)
    setTimeout(window.updateTabSlider, 350);
    // Langkah berjaga-jaga terakhir jika browser lambat memproses data (lag)
    setTimeout(window.updateTabSlider, 600);
    // ---------------------------------------------------------------
    
    window.lastActiveTab = tabName;
    
    if (typeof window.storageWrapper !== 'undefined') {
        window.storageWrapper.set({ 'stb_last_active_tab': tabName });
    }
    
    // Update browser URL
    if (window.currentUser && typeof window.updateBrowserUrl === 'function') {
        const urlParams = {
            user: (window.currentUser.name || '').toLowerCase().replace(/\s+/g, '-'),
            tab: tabName
        };
        window.updateBrowserUrl(urlParams);
    }

    // Ensure search box is always visible except for specific tabs like dashboard, stb, db, pelulus-view, pelulus-action
    const searchBoxEl = document.querySelector('.search-box');
    if (searchBoxEl) {
        const tabsWithSearch = ['drafts', 'submitted', 'inbox', 'history'];
        if (tabsWithSearch.includes(tabName)) {
            searchBoxEl.style.display = 'flex';
        } else {
            searchBoxEl.style.display = 'none';
        }
    }

    // Toggle visibility of specific search inputs based on tab
    const searchListInputContainer = document.getElementById('searchListInput')?.parentElement;
    const searchHistoryInputContainer = document.getElementById('searchHistoryInput')?.parentElement;
    
    if (searchListInputContainer) {
        searchListInputContainer.style.display = (tabName === 'history') ? 'none' : 'flex';
    }
    if (searchHistoryInputContainer) {
        searchHistoryInputContainer.style.display = (tabName === 'history') ? 'flex' : 'none';
    }

    // Sembunyikan semua filter containers
    const submittedFiltersContainer = document.getElementById('submittedFiltersContainer');
    const draftFiltersContainer = document.getElementById('draftFiltersContainer');
    const historyFiltersContainer = document.getElementById('historyFiltersContainer');
    const filterSection = document.getElementById('filterSection');
    const pelulusFilterSection = document.getElementById('pelulusFilterSection');
    
    if (submittedFiltersContainer) submittedFiltersContainer.style.display = 'none';
    if (draftFiltersContainer) draftFiltersContainer.style.display = 'none';
    if (historyFiltersContainer) historyFiltersContainer.style.display = 'none';
    if (filterSection) filterSection.style.display = 'none';
    if (pelulusFilterSection) pelulusFilterSection.style.display = 'none';

    // Handle tab-specific logic
    if (tabName === 'pelulus-view') {
        if (!window.pelulusActiveItem) { 
            window.switchTab(window.currentUser && window.currentUser.role === 'PENGESYOR' ? 'submitted' : 'inbox'); 
            return; 
        }
        const tabPelulusView = document.getElementById('tab-pelulus-view');
        if (tabPelulusView) {
            tabPelulusView.style.display = 'block';
            tabPelulusView.classList.add('active');
        }
        
        let isReadOnly = true;
        if (window.currentUser && window.currentUser.role === 'PELULUS' && !window.pelulusActiveItem.tarikh_lulus) {
            isReadOnly = false; 
        }
        if (typeof window.renderPelulusView === 'function') {
            window.renderPelulusView(isReadOnly);
        }
        
        setTimeout(() => {
            if (typeof window.restoreActiveElement === 'function') {
                window.restoreActiveElement();
            }
        }, 200);
        return;
    }

    // Untuk tab-tab lain, panggil fungsi yang berkaitan jika wujud
    if (tabName === 'dashboard') {
        const tabDashboard = document.getElementById('tab-dashboard');
        if (tabDashboard) {
            tabDashboard.style.display = 'block';
            tabDashboard.classList.add('active');
        }
        
        setTimeout(() => {
            if (typeof window.initializeTickButtons === 'function') {
                window.initializeTickButtons();
            }
            
            if (!window.cachedData || window.cachedData.length === 0) {
                console.log("V6.5.2 Dashboard: Cache kosong, memuat turun data...");
                const listType = (window.currentUser && window.currentUser.role === 'PENGESYOR') ? 'drafts' : 'inbox';
                
                if (typeof window.fetchAndRenderList === 'function') {
                    window.fetchAndRenderList(listType).then(() => {
                        window.isDashboardFirstLoad = true; 
                        if (typeof window.initializeDashboard === 'function') {
                            window.initializeDashboard();
                        }
                    }).catch(err => {
                        if (typeof window.showDashboardNoData === 'function') {
                            window.showDashboardNoData();
                        }
                    });
                }
            } else {
                if (typeof window.initializeDashboard === 'function') {
                    window.initializeDashboard();
                }
            }
            
            if (typeof window.restoreActiveElement === 'function') {
                window.restoreActiveElement();
            }
        }, 200);
    }
    else if (tabName === 'admin-dashboard') {
        const tabAdminDashboard = document.getElementById('tab-admin-dashboard');
        if (tabAdminDashboard) {
            tabAdminDashboard.style.display = 'block';
            tabAdminDashboard.classList.add('active');
        }
        
        setTimeout(() => {
            if (typeof window.loadAdminDashboard === 'function') {
                window.loadAdminDashboard();
            }
            if (typeof window.restoreActiveElement === 'function') {
                window.restoreActiveElement();
            }
        }, 200);
    }
    else if (tabName === 'profile') {
        const tabProfile = document.getElementById('tab-profile');
        if (tabProfile) {
            tabProfile.style.display = 'block';
            tabProfile.classList.add('active');
        }
        
        setTimeout(() => {
            if (typeof window.restoreActiveElement === 'function') {
                window.restoreActiveElement();
            }
        }, 200);
    }
    else if (tabName === 'youtube') {
        const tabYoutube = document.getElementById('tab-youtube');
        if (tabYoutube) {
            tabYoutube.style.display = 'block';
            tabYoutube.classList.add('active');
            
            const youtubeContainer = document.getElementById('youtubeResults');
            if (youtubeContainer && youtubeContainer.children.length === 0) {
                if (typeof window.loadRecentYoutubeCache === 'function') {
                    window.loadRecentYoutubeCache();
                }
            }
        }
    }
    else if (tabName === 'tab-tapisan' && window.currentUser && window.currentUser.role === 'PENGESYOR') {
        const tabTapisan = document.getElementById('tab-tapisan');
        if (tabTapisan) {
            tabTapisan.style.display = 'block';
            tabTapisan.classList.add('active');
        }
    }
    else if (tabName === 'tab-bakul' && window.currentUser && window.currentUser.role === 'PENGESYOR') {
        const tabBakul = document.getElementById('tab-bakul');
        if (tabBakul) {
            tabBakul.style.display = 'block';
            tabBakul.classList.add('active');
        }
    }
    // --- PENGHANTARAN KE FUNGSI LUAR UNTUK TAB LAIN ---
    else if (typeof window.handleSwitchTabExtended === 'function') {
        window.handleSwitchTabExtended(tabName);
    }
    // Fallback: Paparkan tab content secara langsung jika wujud
    else {
        const tabContent = document.getElementById(`tab-${tabName}`);
        if (tabContent) {
            tabContent.style.display = 'block';
            tabContent.classList.add('active');
        }
    }

    // Update validation checkbox display
    if (typeof window.updateValidationCheckboxDisplay === 'function') {
        window.updateValidationCheckboxDisplay();
    }
};

// =========================================================================
// SETUP UI LISTENERS (Dipanggil semasa init)
// =========================================================================
window.setupUIListeners = function() {
    // Setup mobile menu
    window.setupMobileMenu();
    
    // Setup audio controls
    window.setupAudioControls();
    
    // Setup global button click sound
    window.setupGlobalButtonClickSound();
    
    // Setup dynamic form colors
    window.setupDynamicFormColorListeners();
    
    // Mulakan jam digital
    window.startDigitalClock();
    
    // Kemaskini slider apabila skrin berubah saiz
    window.addEventListener('resize', window.updateTabSlider);
    
    // Tutup menu pada saiz desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            window.closeMobileMenu();
        }
    });
    
    console.log("V6.5.2 UI Listeners setup completed");
};

// =========================================================================
// AUTOMATIK INIT KETIKA SCRIPT LOAD
// =========================================================================
console.log("ui.js V6.5.2 - Modul UI, Audio & Navigasi dimuatkan.");