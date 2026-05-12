// app.js - V6.5.2 (WEB APP VERSION)
// Modularized: Core Business Logic, Data Management, Charts, Forms
// Dependencies: auth.js, ui.js, pdf_ai.js (MUST be loaded before this file)

document.addEventListener('DOMContentLoaded', () => {
  console.log("STB Web App V6.5.2 Loaded - Modularized: Auth, UI, PDF/AI separated");
  
  // =========================================================================
  // GLOBAL WINDOW VARIABLES (Inherited from other modules)
  // These are now accessed via window.* 
  // Example: window.currentUser, window.dbFirestore, window.authFirebase
  // =========================================================================
  
  // Initialize variables that are set by auth.js but used extensively here
  window.excelRawData = [];
  window.allExcelDistricts = [];
  window.selectedExcelDistricts = new Set();
  window.globalBakulData = [];
  
  // State variables
  window.usersList = []; 
  window.cachedData = [];
  window.pelulusActiveItem = null;
  window.isRestoring = false; 
  window.isAppReady = false;
  window.activeListType = '';
  window.hasPrinted = false;
  window.isFetching = false;
  window.driveFolderCreated = false;
  window.createdFolderUrl = '';
  window.userFolderUrl = '';
  window.allRecommenders = [];
  window.allApprovers = [];
  window.isSaving = false;
  window.lastActiveElementId = '';
  window.formStates = {};
  
  // Filter variables
  window.currentDraftFilter = 'ALL';
  window.currentSubmittedStatusFilter = 'ALL';
  window.currentSubmittedJenisFilter = 'ALL';
  window.currentHistoryStatusFilter = 'ALL';
  window.currentHistoryJenisFilter = 'ALL';
  
  // Dashboard state
  window.dashboardData = {
    yearly: {},
    monthly: {},
    daily: {},
    currentPeriod: 'monthly',
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    currentDay: new Date().getDate(),
    stats: {
      total: 0,
      supported: 0,
      notSupported: 0,
      approvalRate: 0,
      monthlyTrend: [],
      reasons: {},
      types: {}
    }
  };
  
  // USER FOLDER SYSTEM VARIABLES
  window.mainFolderUrl = 'https://drive.google.com/drive/folders/1-IszGRdSjoJz2oOjUs_KO7HRz7oE2Hzn';
  window.mainFolderId = '1-IszGRdSjoJz2oOjUs_KO7HRz7oE2Hzn';

  // Chart variables
  window.typeMonthlyChart = null;
  window.typeYearlyChart = null;
  window.approverMonthlyChart = null;
  window.recommenderMonthlyChart = null;
  window.dashboardStatusChart = null;
  window.dashboardTypeChart = null;
  window.dashboardReasonChart = null;
  window.dashboardTrendChart = null;
  window.dashboardKonsultansiChart = null;

  // YouTube navigation
  window.tabSebelumYoutube = null;
  
  // =========================================================================
  // PEMBALUT LOCALSTORAGE (Menggantikan chrome.storage.local)
  // =========================================================================
  window.storageWrapper = {
    get: function(keys) {
      return new Promise((resolve) => {
        let result = {};
        keys.forEach(key => {
          let val = window.localStorage.getItem(key);
          if (val !== null) {
            try {
              result[key] = JSON.parse(val);
            } catch (e) {
              result[key] = val;
            }
          }
        });
        resolve(result);
      });
    },
    set: function(obj) {
      return new Promise((resolve) => {
        for (let key in obj) {
          window.localStorage.setItem(key, JSON.stringify(obj[key]));
        }
        resolve();
      });
    },
    remove: function(keys) {
      return new Promise((resolve) => {
        keys.forEach(key => window.localStorage.removeItem(key));
        resolve();
      });
    }
  };
  
  // =========================================================================
  // DOM ELEMENTS (Cached for performance)
  // =========================================================================
  const loginScreen = document.getElementById('login-screen');
  const appContainer = document.getElementById('app-container');
  const loginPin = document.getElementById('login_pin');
  const btnLogin = document.getElementById('btnLogin');
  const loginError = document.getElementById('loginError');
  const loginLoadingText = document.getElementById('loginLoadingText');
  const userBadge = document.getElementById('userBadge');
  const listStatus = document.getElementById('listStatus');
  const openFullBtn = document.getElementById('openFullBtn');
  const openFullBtnPelulus = document.getElementById('openFullBtnPelulus');
  const dbSyor = document.getElementById('db_syor');
  const dbPautanInput = document.getElementById('db_pautan');
  const btnSyncToDb = document.getElementById('btnSyncToDb');
  const triggerPrintBtn = document.getElementById('triggerPrintBtn');
  const driveSection = document.getElementById('driveSection');
  const driveStatus = document.getElementById('driveStatus');
  const driveFolderInfo = document.getElementById('driveFolderInfo');
  const driveResult = document.getElementById('driveResult');
  const cbCreateDriveFolder = document.getElementById('cbCreateDriveFolder');
  const btnCreateDriveFolder = document.getElementById('btnCreateDriveFolder');
  const btnOpenDriveFolder = document.getElementById('btnOpenDriveFolder');
  const btnOpenMyDriveFolder = document.getElementById('btnOpenMyDriveFolder');
  const filterSection = document.getElementById('filterSection');
  const filterPengesyor = document.getElementById('filterPengesyor');
  const btnClearFilter = document.getElementById('btnClearFilter');
  const anonymousBadge = document.getElementById('anonymousBadge');
  const tabsContainer = document.getElementById('tabs-container');
  
  // Filter elements
  const listFilterMonth = document.getElementById('listFilterMonth');
  const listFilterYear = document.getElementById('listFilterYear');
  const draftFiltersContainer = document.getElementById('draftFiltersContainer');
  const submittedFiltersContainer = document.getElementById('submittedFiltersContainer');
  const historyFiltersContainer = document.getElementById('historyFiltersContainer');
  const pengesyorFilterButtonsContainer = document.getElementById('pengesyorFilterButtonsContainer');
  const pelulusFilterSection = document.getElementById('pelulusFilterSection');
  const pelulusFilterButtonsContainer = document.getElementById('pelulusFilterButtonsContainer');
  
  // Badge elements
  const badgeAll = document.getElementById('badgeAll');
  const badgeBaru = document.getElementById('badgeBaru');
  const badgePembaharuan = document.getElementById('badgePembaharuan');
  const badgeUbahMaklumat = document.getElementById('badgeUbahMaklumat');
  const badgeUbahGred = document.getElementById('badgeUbahGred');
  const badgeSpi = document.getElementById('badgeSpi');
  const badgeSubmittedAll = document.getElementById('badgeSubmittedAll');
  const badgeSubmittedLulus = document.getElementById('badgeSubmittedLulus');
  const badgeSubmittedTolak = document.getElementById('badgeSubmittedTolak');
  const badgeSubmittedPending = document.getElementById('badgeSubmittedPending');
  const badgeSubmittedJenisBaru = document.getElementById('badgeSubmittedJenisBaru');
  const badgeSubmittedJenisPembaharuan = document.getElementById('badgeSubmittedJenisPembaharuan');
  const badgeSubmittedJenisUbahMaklumat = document.getElementById('badgeSubmittedJenisUbahMaklumat');
  const badgeSubmittedJenisUbahGred = document.getElementById('badgeSubmittedJenisUbahGred');
  const badgeHistoryAll = document.getElementById('badgeHistoryAll');
  const badgeHistoryStatusLulus = document.getElementById('badgeHistoryStatusLulus');
  const badgeHistoryStatusTolak = document.getElementById('badgeHistoryStatusTolak');
  const badgeHistoryStatusPending = document.getElementById('badgeHistoryStatusPending');
  const badgeHistoryJenisBaru = document.getElementById('badgeHistoryJenisBaru');
  const badgeHistoryJenisPembaharuan = document.getElementById('badgeHistoryJenisPembaharuan');
  const badgeHistoryJenisUbahMaklumat = document.getElementById('badgeHistoryJenisUbahMaklumat');
  const badgeHistoryJenisUbahGred = document.getElementById('badgeHistoryJenisUbahGred');

  // Dashboard elements
  const dashboardPeriod = document.getElementById('dashboardPeriod');
  const dashboardYear = document.getElementById('dashboardYear');
  const dashboardMonth = document.getElementById('dashboardMonth');
  const dashboardDay = document.getElementById('dashboardDay');
  const detailedTableBody = document.getElementById('detailedTableBody');
  const chartMonthlyTrend = document.getElementById('chartMonthlyTrend');
  const chartStatus = document.getElementById('chartStatus');
  const dashboardUserInfo = document.getElementById('dashboardUserInfo');
  const dashboardUserRole = document.getElementById('dashboardUserRole');
  const dashboardUserSpecificInfo = document.getElementById('dashboardUserSpecificInfo');
  const typeStats = document.getElementById('typeStats');
  const reasonStatsContainer = document.getElementById('reasonStatsContainer');
  const reasonStats = document.getElementById('reasonStats');
  const totalCountElement = document.getElementById('total-count');
  const successCountElement = document.getElementById('success-count');
  const labelSuccessElement = document.getElementById('label-success');
  const rejectCountElement = document.getElementById('reject-count');
  const labelRejectElement = document.getElementById('label-reject');
  const processCountElement = document.getElementById('process-count');
  const labelStatusElement = document.getElementById('label-status');
  const rejectionReasonChartContainer = document.getElementById('chartReasonDistContainer');
  const applicationTypeChartContainer = document.getElementById('chartTypeDistContainer');

  // Admin Dashboard elements
  const tabAdminBtn = document.getElementById('tabAdminBtn');
  const adminTotalCount = document.getElementById('admin-total-count');
  const adminApprovedCount = document.getElementById('admin-approved-count');
  const adminRejectedCount = document.getElementById('admin-rejected-count');
  const adminPendingCount = document.getElementById('admin-pending-count');
  const adminPengesyorTbody = document.getElementById('admin-pengesyor-tbody');
  const adminPelulusTbody = document.getElementById('admin-pelulus-tbody');
  const adminStatsModal = document.getElementById('adminStatsModal');
  const adminStatsClose = document.getElementById('adminStatsClose');
  const btnPrintAdminStats = document.getElementById('btnPrintAdminStats');
  const btnPrintStatsModal = document.getElementById('btnPrintStatsModal');
  const adminStatsPrintContent = document.getElementById('adminStatsPrintContent');
  const adminStatsDate = document.getElementById('adminStatsDate');
  const adminFilterMonth = document.getElementById('adminFilterMonth');
  const adminFilterYear = document.getElementById('adminFilterYear');
  const adminRejectionReasonStats = document.getElementById('adminRejectionReasonStats');
  const btnAdminCsv = document.getElementById('btnAdminCsv');
  const btnAdminFullView = document.getElementById('btnAdminFullView');

  // Pelulus elements
  const pelulusTukarSyor = document.getElementById('pelulus_tukar_syor_lawatan');
  const divPelulusJustifikasi = document.getElementById('div_pelulus_justifikasi');
  const divPelulusDateSpi = document.getElementById('div_pelulus_date_spi');
  const pelulusJustifikasi = document.getElementById('pelulus_justifikasi_lawatan');
  const pelulusDateSpi = document.getElementById('pelulus_date_submit_spi');
  const dbPelulusWhatsapp = document.getElementById('db_pelulus_whatsapp');
  const cbSelesaiLawatan = document.getElementById('cb_selesai_lawatan');
  const containerLawatan = document.getElementById('container_lawatan');
  const dbLawatanTarikh = document.getElementById('db_lawatan_tarikh');
  const dbLawatanSubmitSptb = document.getElementById('db_lawatan_submit_sptb');
  const dbLawatanSyor = document.getElementById('db_lawatan_syor');
  const cbNotifyWhatsapp = document.getElementById('cb_notify_whatsapp');
  const pelulusWhatsappContainer = document.getElementById('pelulus_whatsapp_container');
  const labelNotifyWhatsapp = document.getElementById('label_notify_whatsapp');
  const labelDbSahSyor = document.getElementById('label_db_sah_syor');
  const labelPelulusSahLulus = document.getElementById('label_pelulus_sah_lulus');
  const dbSahSyor = document.getElementById('db_sah_syor');
  const pelulusSahLulus = document.getElementById('pelulus_sah_lulus');

  // =========================================================================
  // FETCH WITH RETRY MECHANISM
  // =========================================================================
  window.fetchWithRetry = async function(url, options = {}, maxRetries = 3, delay = 1000) {
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`V6.5.2 Fetch attempt ${attempt} for ${url.substring(0, 100)}...`);
        
        const response = await fetch(url, options);
        
        if (response.ok) {
          console.log(`V6.5.2 Fetch successful on attempt ${attempt}`);
          return response;
        }
        
        if (response.status === 503) {
          console.warn(`V6.5.2 Service Unavailable (503) on attempt ${attempt}. Retrying...`);
          const backoffDelay = delay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          continue;
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
        
      } catch (error) {
        lastError = error;
        console.warn(`V6.5.2 Fetch attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        const backoffDelay = delay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
    
    throw lastError;
  };

  // =========================================================================
  // DYNAMIC URL ROUTING & UNIQUE ID GENERATOR
  // =========================================================================
  
  window.generateUniqueId = function(rowNumber) {
    if (!rowNumber) return '';
    const num = parseInt(rowNumber);
    if (isNaN(num)) return '';
    return num.toString().padStart(5, '0');
  };

  function getCompanySlug(companyName) {
    if (!companyName) return 'unknown';
    return companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  window.updateBrowserUrl = function(params) {
    const url = new URL(window.location);
    url.searchParams.forEach((value, key) => {
      if (params.hasOwnProperty(key)) return;
      url.searchParams.delete(key);
    });
    
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    }
    
    window.history.pushState({}, '', url);
  };

  function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      user: params.get('user'),
      tab: params.get('tab'),
      id: params.get('id'),
      company: params.get('company')
    };
  }

  // =========================================================================
  // HELPER FUNCTIONS
  // =========================================================================
  
  window.getUserColorHex = function(colorName) {
    if (!colorName) return '#2563eb';
    
    const colorUpper = colorName.toUpperCase();
    if (colorUpper.includes('OREN')) return '#ea580c';
    if (colorUpper.includes('HIJAU')) return '#16a34a';
    if (colorUpper.includes('UNGU')) return '#9333ea';
    if (colorUpper.includes('HITAM')) return '#000000';
    if (colorUpper.includes('PINK')) return '#ec4899';
    if (colorUpper.startsWith('#')) return colorName;
    
    return '#2563eb';
  };

  function formatDateDisplay(isoStr) {
    if(!isoStr) return '';
    if (isoStr.includes('✓')) return isoStr;
    if (isoStr.includes('/')) return isoStr; 

    const d = new Date(isoStr);
    if(isNaN(d)) return isoStr;
    return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
  }

  function formatKWSP(dateStr, status) {
    if (!dateStr && !status) return '';
    if (!dateStr && status) return `(${status})`;
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 2) {
        return `${parts[1]}/${parts[0].slice(-2)} (${status || ''})`;
      }
    }
    return dateStr;
  }

  // =========================================================================
  // SAFE CHART DESTROY HELPER
  // =========================================================================
  function safeDestroyChart(chartInstance, canvasId) {
    if (chartInstance) {
      try {
        chartInstance.destroy();
      } catch (e) {
        console.warn("V6.5.2 Error destroying chart instance:", e);
      }
    }
    
    if (canvasId) {
      const existingChart = Chart.getChart(canvasId);
      if (existingChart) {
        try {
          existingChart.destroy();
        } catch (e) {
          console.warn("V6.5.2 Error destroying existing chart by ID:", e);
        }
      }
    }
    
    return null;
  }

  // =========================================================================
  // FORM PERSISTENCE FUNCTIONS - INSTANT SAVE
  // =========================================================================
  window.saveFormData = function() {
    if (window.isSaving || !window.currentUser) return;
    
    window.isSaving = true;
    console.log('V6.5.2 Instant auto-save: Menyimpan...');
    
    const formData = {
      timestamp: new Date().toISOString(),
      user: window.currentUser.name,
      role: window.currentUser.role,
      tab: window.lastActiveTab
    };
    
    const fields = {};
    document.querySelectorAll('#tab-checker input, #tab-checker select, #tab-checker textarea').forEach(el => {
      if (el.id && !el.id.includes('print_') && !el.id.includes('pelulus_') && !el.id.includes('login')) {
        if (el.type === 'checkbox' || el.type === 'radio') {
          fields[el.id] = el.checked;
        } else {
          fields[el.id] = el.value;
        }
      }
    });
    
    const selectedRadio = document.querySelector('input[name="jenisApp"]:checked');
    if (selectedRadio) {
      fields['jenisApp'] = selectedRadio.value;
    }
    
    const personnel = [];
    document.querySelectorAll('.person-card').forEach(card => {
      const roles = [];
      card.querySelectorAll('.role-cb:checked').forEach(cb => roles.push(cb.value));
      
      personnel.push({
        name: card.querySelector('.p-name')?.value || '',
        isCompany: card.querySelector('.is-company')?.checked || false,
        roles: roles,
        s_ic: card.querySelector('.status-ic')?.value || '',
        s_sb: card.querySelector('.status-sb')?.value || '',
        s_epf: card.querySelector('.status-epf')?.value || ''
      });
    });
    
    fields.personnel = personnel;
    formData.fields = fields;
    
    try {
      window.storageWrapper.set({ 'stb_form_persistence': formData })
        .then(() => {
          console.log('V6.5.2 Instant auto-save: Berjaya');
          window.isSaving = false;
        })
        .catch(error => {
          console.error('V6.5.2 Error saving form data:', error);
          window.isSaving = false;
        });
    } catch (error) {
      console.error('V6.5.2 Error in saveFormData:', error);
      window.isSaving = false;
    }
  };

  window.saveDatabaseFormData = function() {
    if (window.isSaving || !window.currentUser) return;
    
    window.isSaving = true;
    
    const formData = {
      timestamp: new Date().toISOString(),
      user: window.currentUser.name,
      role: window.currentUser.role,
      tab: 'db'
    };
    
    const fields = {};
    document.querySelectorAll('#tab-database input, #tab-database select, #tab-database textarea').forEach(el => {
      if (el.id && !el.id.includes('print_') && !el.id.includes('pelulus_') && !el.id.includes('login')) {
        if (el.type === 'checkbox' || el.type === 'radio') {
          fields[el.id] = el.checked;
        } else {
          fields[el.id] = el.value;
        }
      }
    });
    
    const createDriveFolder = document.getElementById('cbCreateDriveFolder');
    if (createDriveFolder) {
      fields['cbCreateDriveFolder'] = createDriveFolder.checked;
    }
    
    formData.fields = fields;
    
    window.storageWrapper.set({ 'stb_database_persistence': formData })
      .then(() => {
        console.log('V6.5.2 Database form data saved');
        window.isSaving = false;
      })
      .catch(error => {
        console.error('V6.5.2 Error saving database form data:', error);
        window.isSaving = false;
      });
  };

  function loadFormData() {
    try {
      window.storageWrapper.get(['stb_form_persistence'])
        .then(result => {
          if (!result.stb_form_persistence) return;
          
          const formData = result.stb_form_persistence;
          const fields = formData.fields || {};
          
          Object.keys(fields).forEach(key => {
            if (key === 'personnel' || key === 'jenisApp') return;
            
            const el = document.getElementById(key);
            if (el) {
              if (el.type === 'checkbox' || el.type === 'radio') {
                el.checked = fields[key];
              } else if (el.type !== 'file') {
                el.value = fields[key];
              }
            }
          });
          
          if (fields.jenisApp) {
            const radio = document.querySelector(`input[name="jenisApp"][value="${fields.jenisApp}"]`);
            if (radio) {
              radio.checked = true;
              radio.dispatchEvent(new Event('change'));
            }
          }
          
          const personnelListEl = document.getElementById('personnelList');
          if (personnelListEl && fields.personnel && Array.isArray(fields.personnel)) {
            personnelListEl.innerHTML = '';
            fields.personnel.forEach(person => {
              addPerson(person);
            });
          }
          
          setTimeout(() => {
            initializeTickButtons();
          }, 100);
          
          console.log('V6.5.2 Form data restored from persistence');
        })
        .catch(error => {
          console.error('V6.5.2 Error loading form data:', error);
        });
    } catch (error) {
      console.error('V6.5.2 Error in loadFormData:', error);
    }
  }

  function loadDatabaseFormData() {
    window.storageWrapper.get(['stb_database_persistence'])
      .then(result => {
        if (!result.stb_database_persistence) return;
        
        const formData = result.stb_database_persistence;
        const fields = formData.fields || {};
        
        Object.keys(fields).forEach(key => {
          if (key === 'cbCreateDriveFolder') {
            const el = document.getElementById(key);
            if (el) {
              el.checked = fields[key];
              el.dispatchEvent(new Event('change'));
            }
          } else {
            const el = document.getElementById(key);
            if (el) {
              if (el.type === 'checkbox' || el.type === 'radio') {
                el.checked = fields[key];
              } else if (el.type !== 'file') {
                el.value = fields[key];
              }
            }
          }
        });
        
        console.log('V6.5.2 Database form data restored from persistence');
      })
      .catch(error => {
        console.error('V6.5.2 Error loading database form data:', error);
      });
  }

  // =========================================================================
  // TICK BUTTONS FUNCTIONALITY
  // =========================================================================

  window.initializeTickButtons = function() {
    console.log("V6.5.2 Initializing tick buttons for all status inputs...");
    
    document.querySelectorAll('.status-input-container').forEach(container => {
      const input = container.querySelector('.status-input');
      const tickRightBtn = container.querySelector('.tick-btn.tick-right');
      const tickWrongBtn = container.querySelector('.tick-btn.tick-wrong');
      
      if (tickRightBtn) {
        tickRightBtn.addEventListener('click', () => {
          input.value = '✓';
          input.style.backgroundColor = '#dcfce7';
          input.style.color = '#166534';
          
          input.dispatchEvent(new Event('input'));
          input.dispatchEvent(new Event('change'));
          
          window.saveFormData();
        });
      }
      
      if (tickWrongBtn) {
        tickWrongBtn.addEventListener('click', () => {
          input.value = 'X';
          input.style.backgroundColor = '#fee2e2';
          input.style.color = '#991b1b';
          
          input.dispatchEvent(new Event('input'));
          input.dispatchEvent(new Event('change'));
          
          window.saveFormData();
        });
      }
      
      if (input) {
        input.addEventListener('input', window.saveFormData);
      }
    });

    document.querySelectorAll('.person-card').forEach(card => {
      const docTypes = ['ic', 'sb', 'epf'];
      
      docTypes.forEach(type => {
        const input = card.querySelector(`.status-${type}`);
        if (input) {
          if (!input.parentElement.querySelector('.tick-buttons')) {
            const container = document.createElement('div');
            container.className = 'tick-buttons';
            container.innerHTML = `
              <button type="button" class="tick-btn tick-right" title="Set OK">✓</button>
              <button type="button" class="tick-btn tick-wrong" title="Set X">✗</button>
            `;
            input.parentElement.style.position = 'relative';
            input.parentElement.appendChild(container);
            
            const tickRightBtn = container.querySelector('.tick-right');
            const tickWrongBtn = container.querySelector('.tick-wrong');
            
            if (tickRightBtn) {
              tickRightBtn.addEventListener('click', () => {
                input.value = '✓';
                input.style.backgroundColor = '#dcfce7';
                input.style.color = '#166534';
                input.dispatchEvent(new Event('input'));
                window.saveFormData();
              });
            }
            
            if (tickWrongBtn) {
              tickWrongBtn.addEventListener('click', () => {
                input.value = 'X';
                input.style.backgroundColor = '#fee2e2';
                input.style.color = '#991b1b';
                input.dispatchEvent(new Event('input'));
                window.saveFormData();
              });
            }
          }
          
          input.addEventListener('input', window.saveFormData);
        }
      });
    });
    
    console.log("V6.5.2 Tick buttons initialized successfully");
  };

  // =========================================================================
  // FORM STATE MANAGEMENT
  // =========================================================================
  
  window.saveFormState = function(tabName) {
    if (window.isRestoring) return;

    const tabContent = document.getElementById(`tab-${tabName}`);
    if (!tabContent) return;

    const state = {};
    tabContent.querySelectorAll('input, select, textarea').forEach(el => {
      if (el.id && !el.id.startsWith('login')) {
        if (el.type === 'checkbox' || el.type === 'radio') {
          state[el.id] = el.checked;
        } else if (el.type !== 'file') {
          state[el.id] = el.value;
        }
      }
    });

    window.formStates[tabName] = state;
    window.storageWrapper.set({ 'stb_form_states': window.formStates });
  };

  function restoreFormState(tabName) {
    window.isRestoring = true;

    if (window.formStates[tabName]) {
      const state = window.formStates[tabName];
      const tabContent = document.getElementById(`tab-${tabName}`);
      if (tabContent) {
        tabContent.querySelectorAll('input, select, textarea').forEach(el => {
          if (el.id && state[el.id] !== undefined) {
            if (el.type === 'checkbox' || el.type === 'radio') {
              el.checked = state[el.id];
            } else {
              el.value = state[el.id];
            }
            
            if (el.type === 'radio' || el.classList.contains('.role-cb')) {
              el.dispatchEvent(new Event('change'));
            }
          }
        });
      }
    }

    const syorVal = document.getElementById('db_syor')?.value;
    if (syorVal === 'YA' && dbPautanInput) {
      dbPautanInput.style.backgroundColor = '#fffbeb';
      dbPautanInput.style.borderColor = '#f59e0b';
      dbPautanInput.style.borderWidth = '2px';
    }

    window.isRestoring = false;
  }

  function saveActiveElement() {
    if (document.activeElement && document.activeElement.id) {
      window.lastActiveElementId = document.activeElement.id;
      window.storageWrapper.set({ 
        'stb_last_active_element': window.lastActiveElementId,
        'stb_last_active_tab': window.lastActiveTab 
      });
    }
  }

  window.restoreActiveElement = function() {
    if (window.lastActiveElementId) {
      const element = document.getElementById(window.lastActiveElementId);
      if (element) {
        setTimeout(() => {
          element.focus();
          if (element.type === 'text' || element.type === 'textarea') {
            element.setSelectionRange(element.value.length, element.value.length);
          }
        }, 100);
      }
    }
  };

  // =========================================================================
  // UPDATE VALIDATION CHECKBOX DISPLAY
  // =========================================================================
  window.updateValidationCheckboxDisplay = function() {
    const dbSyorStatusVal = document.getElementById('db_syor_status')?.value || '';
    if (labelDbSahSyor) {
      if (dbSyorStatusVal !== '') {
        labelDbSahSyor.style.display = 'block';
      } else {
        labelDbSahSyor.style.display = 'none';
        if (dbSahSyor) dbSahSyor.checked = false;
      }
    }

    const pelulusKeputusanVal = document.getElementById('pelulus_keputusan')?.value || '';
    if (labelPelulusSahLulus) {
      if (pelulusKeputusanVal !== '') {
        labelPelulusSahLulus.style.display = 'block';
      } else {
        labelPelulusSahLulus.style.display = 'none';
        if (pelulusSahLulus) pelulusSahLulus.checked = false;
      }
    }
  };

  // =========================================================================
  // FILTER FUNCTIONS
  // =========================================================================

  function updatePengesyorFilter() {
    if (!pengesyorFilterButtonsContainer) return;
    
    const recommenders = new Set();
    if (window.cachedData && window.cachedData.length > 0) {
      window.cachedData.forEach(item => {
        if (item.pengesyor && item.pengesyor.trim() !== '') {
          recommenders.add(item.pengesyor.trim());
        }
      });
    }
    window.allRecommenders = Array.from(recommenders).sort();
    window.storageWrapper.set({ 'stb_all_recommenders': window.allRecommenders });
    
    let buttonsHtml = '';
    window.allRecommenders.forEach(name => {
      buttonsHtml += `<button class="filter-btn" data-name="${name}" style="padding:4px 12px; background:#f3f4f6; border:none; border-radius:16px; font-size:0.8rem; cursor:pointer; transition:all 0.2s;">${name}</button>`;
    });
    pengesyorFilterButtonsContainer.innerHTML = buttonsHtml;
    
    pengesyorFilterButtonsContainer.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedName = btn.getAttribute('data-name');
        const isActive = btn.style.backgroundColor === 'rgb(37, 99, 235)' || btn.style.backgroundColor === '#2563eb';
        
        pengesyorFilterButtonsContainer.querySelectorAll('button').forEach(b => {
          b.style.backgroundColor = '#f3f4f6';
          b.style.color = '#374151';
          b.style.fontWeight = 'normal';
        });
        
        if (isActive) {
          window.storageWrapper.set({ 'stb_filter_pengesyor': '' });
        } else {
          btn.style.backgroundColor = '#2563eb';
          btn.style.color = 'white';
          btn.style.fontWeight = 'bold';
          window.storageWrapper.set({ 'stb_filter_pengesyor': selectedName });
        }
        
        renderFilteredList(window.activeListType);
      });
    });
    
    window.storageWrapper.get(['stb_filter_pengesyor']).then(storage => {
      if (storage.stb_filter_pengesyor) {
        const activeBtn = Array.from(pengesyorFilterButtonsContainer.querySelectorAll('button')).find(b => b.getAttribute('data-name') === storage.stb_filter_pengesyor);
        if (activeBtn) {
          activeBtn.style.backgroundColor = '#2563eb';
          activeBtn.style.color = 'white';
          activeBtn.style.fontWeight = 'bold';
        }
      }
    });
  }

  function updatePelulusFilter() {
    if (!pelulusFilterButtonsContainer) return;
    
    const approvers = new Set();
    if (window.cachedData && window.cachedData.length > 0) {
      window.cachedData.forEach(item => {
        if (item.pelulus && item.pelulus.trim() !== '') {
          approvers.add(item.pelulus.trim());
        }
      });
    }
    window.allApprovers = Array.from(approvers).sort();
    window.storageWrapper.set({ 'stb_all_approvers': window.allApprovers });
    
    let buttonsHtml = '';
    window.allApprovers.forEach(name => {
      buttonsHtml += `<button class="filter-btn" data-name="${name}" style="padding:4px 12px; background:#f3f4f6; border:none; border-radius:16px; font-size:0.8rem; cursor:pointer; transition:all 0.2s;">${name}</button>`;
    });
    pelulusFilterButtonsContainer.innerHTML = buttonsHtml;
    
    pelulusFilterButtonsContainer.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedName = btn.getAttribute('data-name');
        const isActive = btn.style.backgroundColor === 'rgb(37, 99, 235)' || btn.style.backgroundColor === '#2563eb';
        
        pelulusFilterButtonsContainer.querySelectorAll('button').forEach(b => {
          b.style.backgroundColor = '#f3f4f6';
          b.style.color = '#374151';
          b.style.fontWeight = 'normal';
        });
        
        if (isActive) {
          window.storageWrapper.set({ 'stb_filter_pelulus': '' });
        } else {
          btn.style.backgroundColor = '#2563eb';
          btn.style.color = 'white';
          btn.style.fontWeight = 'bold';
          window.storageWrapper.set({ 'stb_filter_pelulus': selectedName });
        }
        
        renderFilteredList(window.activeListType);
      });
    });
    
    window.storageWrapper.get(['stb_filter_pelulus']).then(storage => {
      if (storage.stb_filter_pelulus) {
        const activeBtn = Array.from(pelulusFilterButtonsContainer.querySelectorAll('button')).find(b => b.getAttribute('data-name') === storage.stb_filter_pelulus);
        if (activeBtn) {
          activeBtn.style.backgroundColor = '#2563eb';
          activeBtn.style.color = 'white';
          activeBtn.style.fontWeight = 'bold';
        }
      }
    });
  }

  function updateDraftFilterButtons() {
    if (!draftFiltersContainer) return;
    
    draftFiltersContainer.querySelectorAll('button').forEach(b => {
        b.style.opacity = '0.4';
        b.style.border = '2px solid transparent';
    });
    
    let activeBtnId = 'filterBtnAll';
    if (window.currentDraftFilter !== 'ALL') {
        if (window.currentDraftFilter === 'BARU') activeBtnId = 'filterBtnBaru';
        else if (window.currentDraftFilter === 'PEMBAHARUAN') activeBtnId = 'filterBtnPembaharuan';
        else if (window.currentDraftFilter === 'UBAH MAKLUMAT') activeBtnId = 'filterBtnUbahMaklumat';
        else if (window.currentDraftFilter === 'UBAH GRED') activeBtnId = 'filterBtnUbahGred';
        else if (window.currentDraftFilter === 'SPI') activeBtnId = 'filterBtnSpi';
    }
    
    const activeBtn = document.getElementById(activeBtnId);
    if (activeBtn) {
        activeBtn.style.opacity = '1';
        activeBtn.style.border = '2px solid #000000';
    }
  }

  function updateSubmittedFilterButtons() {
    if (!submittedFiltersContainer) return;
    
    submittedFiltersContainer.querySelectorAll('button').forEach(b => {
      b.style.opacity = '0.4';
      b.style.border = '2px solid transparent';
    });
    
    if (window.currentSubmittedStatusFilter !== 'ALL') {
      let activeId = 'filterSubmittedAll';
      if (window.currentSubmittedStatusFilter === 'LULUS') activeId = 'filterSubmittedLulus';
      else if (window.currentSubmittedStatusFilter === 'TOLAK') activeId = 'filterSubmittedTolak';
      else if (window.currentSubmittedStatusFilter === 'PENDING') activeId = 'filterSubmittedPending';
      
      const activeBtn = document.getElementById(activeId);
      if (activeBtn) {
        activeBtn.style.opacity = '1';
        activeBtn.style.border = '2px solid #000000';
      }
    } else {
      const allBtn = document.getElementById('filterSubmittedAll');
      if (allBtn) {
        allBtn.style.opacity = '1';
        allBtn.style.border = '2px solid #000000';
      }
    }
    
    if (window.currentSubmittedJenisFilter !== 'ALL') {
      let activeId = 'filterSubmittedAll';
      if (window.currentSubmittedJenisFilter === 'BARU') activeId = 'filterSubmittedJenisBaru';
      else if (window.currentSubmittedJenisFilter === 'PEMBAHARUAN') activeId = 'filterSubmittedJenisPembaharuan';
      else if (window.currentSubmittedJenisFilter === 'UBAH MAKLUMAT') activeId = 'filterSubmittedJenisUbahMaklumat';
      else if (window.currentSubmittedJenisFilter === 'UBAH GRED') activeId = 'filterSubmittedJenisUbahGred';
      
      const activeBtn = document.getElementById(activeId);
      if (activeBtn) {
        activeBtn.style.opacity = '1';
        activeBtn.style.border = '2px solid #000000';
      }
    }
  }

  function updateHistoryFilterButtons() {
    if (!historyFiltersContainer) return;
    
    historyFiltersContainer.querySelectorAll('button').forEach(b => {
      b.style.opacity = '0.4';
      b.style.border = '2px solid transparent';
    });
    
    if (window.currentHistoryStatusFilter !== 'ALL') {
      let activeId = 'filterHistoryStatusAll';
      if (window.currentHistoryStatusFilter === 'LULUS') activeId = 'filterHistoryStatusLulus';
      else if (window.currentHistoryStatusFilter === 'TOLAK') activeId = 'filterHistoryStatusTolak';
      else if (window.currentHistoryStatusFilter === 'PENDING') activeId = 'filterHistoryStatusPending';
      
      const activeBtn = document.getElementById(activeId);
      if (activeBtn) {
        activeBtn.style.opacity = '1';
        activeBtn.style.border = '2px solid #000000';
      }
    } else {
      const allBtn = document.getElementById('filterHistoryStatusAll');
      if (allBtn) {
        allBtn.style.opacity = '1';
        allBtn.style.border = '2px solid #000000';
      }
    }
    
    if (window.currentHistoryJenisFilter !== 'ALL') {
      let activeId = 'filterHistoryJenisBaru';
      if (window.currentHistoryJenisFilter === 'PEMBAHARUAN') activeId = 'filterHistoryJenisPembaharuan';
      else if (window.currentHistoryJenisFilter === 'UBAH MAKLUMAT') activeId = 'filterHistoryJenisUbahMaklumat';
      else if (window.currentHistoryJenisFilter === 'UBAH GRED') activeId = 'filterHistoryJenisUbahGred';
      
      const activeBtn = document.getElementById(activeId);
      if (activeBtn) {
        activeBtn.style.opacity = '1';
        activeBtn.style.border = '2px solid #000000';
      }
    }
  }

  function updateSubmittedBadges(baseSubmittedData) {
    if (!badgeSubmittedAll) return;
    
    const total = baseSubmittedData.length;
    const lulus = baseSubmittedData.filter(item => item.kelulusan && item.kelulusan.includes('LULUS')).length;
    const tolak = baseSubmittedData.filter(item => item.kelulusan && (item.kelulusan.includes('TOLAK') || item.kelulusan.includes('SIASAT'))).length;
    const pending = total - (lulus + tolak);
    
    const jenisBaru = baseSubmittedData.filter(item => item.jenis === 'BARU').length;
    const jenisPembaharuan = baseSubmittedData.filter(item => item.jenis === 'PEMBAHARUAN').length;
    const jenisUbahMaklumat = baseSubmittedData.filter(item => item.jenis === 'UBAH MAKLUMAT').length;
    const jenisUbahGred = baseSubmittedData.filter(item => item.jenis === 'UBAH GRED').length;
    
    if (badgeSubmittedAll) badgeSubmittedAll.textContent = total;
    if (badgeSubmittedLulus) badgeSubmittedLulus.textContent = lulus;
    if (badgeSubmittedTolak) badgeSubmittedTolak.textContent = tolak;
    if (badgeSubmittedPending) badgeSubmittedPending.textContent = pending;
    if (badgeSubmittedJenisBaru) badgeSubmittedJenisBaru.textContent = jenisBaru;
    if (badgeSubmittedJenisPembaharuan) badgeSubmittedJenisPembaharuan.textContent = jenisPembaharuan;
    if (badgeSubmittedJenisUbahMaklumat) badgeSubmittedJenisUbahMaklumat.textContent = jenisUbahMaklumat;
    if (badgeSubmittedJenisUbahGred) badgeSubmittedJenisUbahGred.textContent = jenisUbahGred;
  }

  function updateHistoryBadges(data) {
    if (!badgeHistoryAll) return;
    
    const total = data.length;
    const lulus = data.filter(item => item.kelulusan && item.kelulusan.includes('LULUS')).length;
    const tolak = data.filter(item => item.kelulusan && (item.kelulusan.includes('TOLAK') || item.kelulusan.includes('SIASAT'))).length;
    const pending = total - (lulus + tolak);
    
    const jenisBaru = data.filter(item => item.jenis === 'BARU').length;
    const jenisPembaharuan = data.filter(item => item.jenis === 'PEMBAHARUAN').length;
    const jenisUbahMaklumat = data.filter(item => item.jenis === 'UBAH MAKLUMAT').length;
    const jenisUbahGred = data.filter(item => item.jenis === 'UBAH GRED').length;
    
    if (badgeHistoryAll) badgeHistoryAll.textContent = total;
    if (badgeHistoryStatusLulus) badgeHistoryStatusLulus.textContent = lulus;
    if (badgeHistoryStatusTolak) badgeHistoryStatusTolak.textContent = tolak;
    if (badgeHistoryStatusPending) badgeHistoryStatusPending.textContent = pending;
    if (badgeHistoryJenisBaru) badgeHistoryJenisBaru.textContent = jenisBaru;
    if (badgeHistoryJenisPembaharuan) badgeHistoryJenisPembaharuan.textContent = jenisPembaharuan;
    if (badgeHistoryJenisUbahMaklumat) badgeHistoryJenisUbahMaklumat.textContent = jenisUbahMaklumat;
    if (badgeHistoryJenisUbahGred) badgeHistoryJenisUbahGred.textContent = jenisUbahGred;
  }

  // =========================================================================
  // FETCH AND RENDER LIST
  // =========================================================================

  window.fetchAndRenderList = function(listType) {
    if (!listStatus) return;

    window.activeListType = listType; 

    window.simulateLoadingWithSteps(
      [
        'Menyambung ke pelayan...',
        'Memuat turun data terkini...',
        'Memproses rekod...',
        'Menyusun senarai...',
        'Menyiapkan paparan...'
      ],
      'Muat turun data'
    );

    if (window.cachedData.length > 0) {
      renderFilteredList(listType);
      listStatus.innerText = `Using cached data (${window.cachedData.length} records)`;
      window.hideLoading();
    }

    return window.fetchWithRetry(window.SCRIPT_URL + '?action=getData&t=' + Date.now(), {
      method: 'GET',
      redirect: 'follow'
    }, 3, 1000)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        window.cachedData = data;
        
        window.storageWrapper.set({ 
          'stb_data_cache': data,
          'stb_cache_timestamp': Date.now()
        });
        
        updateDynamicYears(data);
        
        if (window.currentUser && (window.currentUser.role === 'PELULUS' || window.currentUser.role === 'ADMIN' || window.currentUser.role === 'KETUA SEKSYEN' || window.currentUser.role === 'PENGARAH')) {
          updatePengesyorFilter();
        }
        
        renderFilteredList(listType);
        listStatus.innerText = `Kemaskini: ${data.length} rekod`;
        
        setTimeout(() => {
          window.hideLoading();
        }, 500);
        
        return data;
      })
      .catch(err => {
        console.error("V6.5.2 Fetch list error:", err);
        if (window.cachedData.length > 0) {
          if (window.currentUser && (window.currentUser.role === 'PELULUS' || window.currentUser.role === 'ADMIN' || window.currentUser.role === 'KETUA SEKSYEN' || window.currentUser.role === 'PENGARAH')) {
            updatePengesyorFilter();
          }
          
          renderFilteredList(listType);
          listStatus.innerText = `Using cached data (${window.cachedData.length} records) - Offline mode`;
        } else {
          listStatus.innerText = "Gagal memuat data.";
        }
        window.hideLoading();
        throw err;
      });
  };

  function renderFilteredList(type) {
    const listId = type === 'history' ? 'historyList' : 'applicationsList';
    const list = document.getElementById(listId);
    if (!list) return;

    list.innerHTML = '';

    if (!window.currentUser || !window.cachedData) {
      list.innerHTML = '<div style="padding:10px; text-align:center; color:#777;">Tiada data pengguna.</div>';
      return;
    }

    const user = window.currentUser.name.toUpperCase();
    let filtered = [];

    if (type === 'drafts') {
      filtered = window.cachedData.filter(i => (!i.tarikh_syor) && (!i.pengesyor || i.pengesyor.toUpperCase() === user));
    }
    else if (type === 'submitted') {
      if (window.currentUser.role === 'PENGESYOR') {
        filtered = window.cachedData.filter(i => i.tarikh_syor && i.pengesyor && i.pengesyor.toUpperCase() === user);
      } else if (window.currentUser.role === 'KETUA SEKSYEN') {
        filtered = window.cachedData.filter(i => i.tarikh_syor && (!i.tarikh_lulus || i.tarikh_lulus === ''));
      } else {
        filtered = window.cachedData.filter(i => i.tarikh_syor && i.tarikh_lulus);
      }
    }
    else if (type === 'inbox') {
      if (window.currentUser.role === 'KETUA SEKSYEN') {
        filtered = window.cachedData.filter(i => !i.tarikh_syor);
      } else {
        filtered = window.cachedData.filter(i => i.tarikh_syor && (!i.tarikh_lulus || i.tarikh_lulus === ''));
      }
    }
    else if (type === 'history') {
      if (window.currentUser.role === 'PELULUS') {
        filtered = window.cachedData.filter(i => i.tarikh_lulus && i.pelulus && i.pelulus.toUpperCase() === user);
      } else {
        filtered = window.cachedData.filter(i => i.tarikh_lulus);
      }
    }

    filtered = filtered.filter(item => item.syarikat && item.syarikat.trim() !== "");
    
    if (type === 'submitted') {
      updateSubmittedBadges(filtered);
    }
    
    if (type === 'drafts' || type === 'inbox') {
      const countAll = filtered.length;
      const countBaru = filtered.filter(item => item.jenis === 'BARU').length;
      const countPembaharuan = filtered.filter(item => item.jenis === 'PEMBAHARUAN').length;
      const countUbahMaklumat = filtered.filter(item => item.jenis === 'UBAH MAKLUMAT').length;
      const countUbahGred = filtered.filter(item => item.jenis === 'UBAH GRED').length;
      const countSpi = filtered.filter(item => item.date_submit && item.date_submit.trim() !== '').length;
      
      if (badgeAll) badgeAll.textContent = countAll;
      if (badgeBaru) badgeBaru.textContent = countBaru;
      if (badgePembaharuan) badgePembaharuan.textContent = countPembaharuan;
      if (badgeUbahMaklumat) badgeUbahMaklumat.textContent = countUbahMaklumat;
      if (badgeUbahGred) badgeUbahGred.textContent = countUbahGred;
      if (badgeSpi) badgeSpi.textContent = countSpi;
    }

    if (type === 'history') {
      updateHistoryBadges(filtered);
    }

    // Apply month/year filters
    if (type === 'history') {
      const historyMonthFilter = document.getElementById('historyMonthFilter');
      const historyYearFilter = document.getElementById('historyYearFilter');
      if (historyMonthFilter && historyYearFilter) {
        const selectedMonth = parseInt(historyMonthFilter.value);
        const selectedYear = parseInt(historyYearFilter.value);
        
        if (selectedMonth && selectedYear) {
          filtered = filtered.filter(item => {
            let dateToUse = null;
            if (item.start_date) dateToUse = new Date(item.start_date);
            else if (item.tarikh_lulus) dateToUse = new Date(item.tarikh_lulus);
            else if (item.date_submit) dateToUse = new Date(item.date_submit);
            
            if (!dateToUse || isNaN(dateToUse)) return true;
            return dateToUse.getMonth() + 1 === selectedMonth && dateToUse.getFullYear() === selectedYear;
          });
        } else if (selectedYear) {
          filtered = filtered.filter(item => {
            let dateToUse = null;
            if (item.start_date) dateToUse = new Date(item.start_date);
            else if (item.tarikh_lulus) dateToUse = new Date(item.tarikh_lulus);
            else if (item.date_submit) dateToUse = new Date(item.date_submit);
            
            if (!dateToUse || isNaN(dateToUse)) return true;
            return dateToUse.getFullYear() === selectedYear;
          });
        }
      }
    } else if (listFilterMonth && listFilterYear) {
      const selectedMonth = parseInt(listFilterMonth.value);
      const selectedYear = parseInt(listFilterYear.value);
      
      if (selectedMonth && selectedYear) {
        filtered = filtered.filter(item => {
          let dateToUse = null;
          if (item.start_date) dateToUse = new Date(item.start_date);
          else if (item.tarikh_lulus) dateToUse = new Date(item.tarikh_lulus);
          else if (item.date_submit) dateToUse = new Date(item.date_submit);
          
          if (!dateToUse || isNaN(dateToUse)) return true;
          return dateToUse.getMonth() + 1 === selectedMonth && dateToUse.getFullYear() === selectedYear;
        });
      } else if (selectedYear) {
        filtered = filtered.filter(item => {
          let dateToUse = null;
          if (item.start_date) dateToUse = new Date(item.start_date);
          else if (item.tarikh_lulus) dateToUse = new Date(item.tarikh_lulus);
          else if (item.date_submit) dateToUse = new Date(item.date_submit);
          
          if (!dateToUse || isNaN(dateToUse)) return true;
          return dateToUse.getFullYear() === selectedYear;
        });
      }
    }

    // Apply search filter
    let searchVal = '';
    if (type === 'history') {
      const searchHistoryInput = document.getElementById('searchHistoryInput');
      searchVal = searchHistoryInput ? searchHistoryInput.value.trim().toUpperCase() : '';
    } else {
      const searchListInput = document.getElementById('searchListInput');
      searchVal = searchListInput ? searchListInput.value.trim().toUpperCase() : '';
    }
    
    if(searchVal) {
      filtered = filtered.filter(item => {
        const syarikat = item.syarikat ? item.syarikat.toUpperCase() : '';
        const cidb = item.cidb ? String(item.cidb).toUpperCase() : '';
        return syarikat.includes(searchVal) || cidb.includes(searchVal);
      });
    }
    
    // Apply type/status filters
    if ((type === 'drafts' || type === 'inbox') && window.currentDraftFilter !== 'ALL') {
      if (window.currentDraftFilter === 'SPI') {
        filtered = filtered.filter(item => item.date_submit && item.date_submit.trim() !== '');
      } else {
        filtered = filtered.filter(item => item.jenis === window.currentDraftFilter);
      }
    }
    
    if (type === 'submitted') {
      if (window.currentSubmittedStatusFilter !== 'ALL') {
        if (window.currentSubmittedStatusFilter === 'LULUS') {
          filtered = filtered.filter(item => item.kelulusan && item.kelulusan.includes('LULUS'));
        } else if (window.currentSubmittedStatusFilter === 'TOLAK') {
          filtered = filtered.filter(item => item.kelulusan && (item.kelulusan.includes('TOLAK') || item.kelulusan.includes('SIASAT')));
        } else if (window.currentSubmittedStatusFilter === 'PENDING') {
          filtered = filtered.filter(item => !item.kelulusan || item.kelulusan === '');
        }
      }
      if (window.currentSubmittedJenisFilter !== 'ALL') {
        filtered = filtered.filter(item => item.jenis === window.currentSubmittedJenisFilter);
      }
    }
    
    if (type === 'history') {
      if (window.currentHistoryStatusFilter !== 'ALL') {
        if (window.currentHistoryStatusFilter === 'LULUS') {
          filtered = filtered.filter(item => item.kelulusan && item.kelulusan.includes('LULUS'));
        } else if (window.currentHistoryStatusFilter === 'TOLAK') {
          filtered = filtered.filter(item => item.kelulusan && (item.kelulusan.includes('TOLAK') || item.kelulusan.includes('SIASAT')));
        } else if (window.currentHistoryStatusFilter === 'PENDING') {
          filtered = filtered.filter(item => !item.kelulusan || item.kelulusan === '');
        }
      }
      if (window.currentHistoryJenisFilter !== 'ALL') {
        filtered = filtered.filter(item => item.jenis === window.currentHistoryJenisFilter);
      }
    }

    // Apply pengesyor/pelulus filter
    if ((type === 'inbox' || type === 'submitted' || type === 'history') && (window.currentUser.role === 'PELULUS' || window.currentUser.role === 'KETUA SEKSYEN' || window.currentUser.role === 'PENGARAH')) {
      window.storageWrapper.get(['stb_filter_pengesyor', 'stb_filter_pelulus']).then(result => {
        if (type !== 'history' && result.stb_filter_pengesyor) {
          filtered = filtered.filter(item => item.pengesyor && item.pengesyor.toUpperCase() === result.stb_filter_pengesyor.toUpperCase());
        }
        if (type === 'history' && result.stb_filter_pelulus) {
          filtered = filtered.filter(item => item.pelulus && item.pelulus.toUpperCase() === result.stb_filter_pelulus.toUpperCase());
        }
        displayFilteredItems(filtered, type);
      });
    } else {
      displayFilteredItems(filtered, type);
    }
    
    updateDraftFilterButtons();
    updateSubmittedFilterButtons();
    updateHistoryFilterButtons();
  }

  // =========================================================================
  // DELETE OR CLEAR RECORD
  // =========================================================================

  async function deleteOrClearRecord(item, actionType) {
    if (!item || !item.row) {
      await window.CustomAppModal.alert("Rekod tidak sah.", "Ralat", "error");
      return;
    }
    
    let message = '';
    let action = '';
    let modalTitle = 'Pengesahan';
    let btnText = 'Teruskan';
    let isDanger = true;
    let modalType = 'warning';
    
    if (actionType === 'padam_semua') {
      message = `Anda pasti mahu PADAM KESELURUHAN rekod untuk ${item.syarikat}? Tindakan ini TIDAK BOLEH dibatalkan.`;
      action = 'padam_semua';
      modalTitle = "Pengesahan Padam";
      btnText = "Ya, Padam";
      isDanger = true;
      modalType = "error";
    } else if (actionType === 'undo_syor') {
      message = `Anda pasti mahu UNDO syor untuk ${item.syarikat}? Rekod akan kembali ke "Belum Syor".`;
      action = 'undo_syor';
      modalTitle = "Pengesahan Undo";
      btnText = "Ya, Undo";
      isDanger = false;
      modalType = "warning";
    } else if (actionType === 'undo_lulus') {
      message = `Anda pasti mahu UNDO kelulusan untuk ${item.syarikat}? Rekod akan kembali ke Inbox Pelulus.`;
      action = 'undo_lulus';
      modalTitle = "Pengesahan Undo";
      btnText = "Ya, Undo";
      isDanger = false;
      modalType = "warning";
    } else {
      message = `Anda pasti mahu KOSONGKAN SYOR untuk ${item.syarikat}?`;
      action = 'padam_syor';
      modalTitle = "Kosongkan Syor";
      btnText = "Ya, Kosongkan";
      isDanger = true;
      modalType = "warning";
    }
    
    const isConfirmed = await window.CustomAppModal.confirm(message, modalTitle, modalType, btnText, isDanger);
    if (!isConfirmed) return;
    
    window.simulateLoadingWithSteps(
      ['Menghubungi pangkalan data...', 'Memadam rekod...', 'Menyusun semula senarai...'],
      'Memproses Permintaan'
    );
    
    let payload;
    if (action === 'undo_syor') {
      payload = {
        action: 'updateRecord',
        row: item.row,
        syor_status: '',
        tarikh_syor: '',
        email: window.currentUser ? window.currentUser.email : '',
        ...item
      };
      payload.syor_status = '';
      payload.tarikh_syor = '';
      delete payload.kelulusan;
      delete payload.tarikh_lulus;
      
    } else if (action === 'undo_lulus') {
      payload = {
        action: 'updateRecord',
        row: item.row,
        kelulusan: '',
        alasan: '',
        tarikh_lulus: '',
        pelulus: '',
        email: window.currentUser ? window.currentUser.email : '',
        ...item
      };
      payload.kelulusan = '';
      payload.alasan = '';
      payload.tarikh_lulus = '';
      payload.pelulus = '';
      
    } else {
      payload = {
        action: 'deleteRecord',
        row: item.row,
        deleteType: action,
        user: window.currentUser.name,
        email: window.currentUser ? window.currentUser.email : '',
      };
    }
    
    window.fetchWithRetry(window.SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }, 3, 1000)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(result => {
      window.hideLoading();
      
      if (result.status === 'success') {
        window.playSoundEffect('minimal alert.mp3');
        window.CustomAppModal.alert(result.message, "Berjaya", "success");
        
        if (window.cachedData && window.cachedData.length > 0) {
          const index = window.cachedData.findIndex(d => d.row === item.row);
          if (index !== -1) {
            if (action === 'padam_semua') {
              window.cachedData.splice(index, 1);
            } else if (action === 'undo_syor') {
              window.cachedData[index].syor_status = '';
              window.cachedData[index].tarikh_syor = '';
            } else if (action === 'undo_lulus') {
              window.cachedData[index].kelulusan = '';
              window.cachedData[index].alasan = '';
              window.cachedData[index].tarikh_lulus = '';
              window.cachedData[index].pelulus = '';
            } else if (action === 'padam_syor') {
              window.cachedData[index].syor_status = '';
              window.cachedData[index].tarikh_syor = '';
            }
          }
        }
        
        window.fetchAndRenderList(window.activeListType);
      } else {
        window.CustomAppModal.alert(result.message || 'Gagal memproses rekod', "Ralat", "error");
      }
    })
    .catch(err => {
      console.error("V6.5.2 Delete error:", err);
      window.hideLoading();
      window.CustomAppModal.alert("Gagal memproses rekod: " + err.message, "Ralat", "error");
    });
  }

  function displayFilteredItems(filtered, type) {
    const listId = type === 'history' ? 'historyList' : 'applicationsList';
    const list = document.getElementById(listId);
    if (!list) return;

    if(filtered.length === 0) { 
      list.innerHTML = '<div style="padding:10px; text-align:center; color:#777;">Tiada rekod.</div>'; 
      return; 
    }

    filtered.forEach((item, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'app-item-wrapper';
      
      const numberDiv = document.createElement('div');
      numberDiv.className = 'app-item-number';
      numberDiv.textContent = window.generateUniqueId(item.row) || (index + 1).toString();
      wrapper.appendChild(numberDiv);
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'app-item-content';
      
      const div = document.createElement('div');
      div.className = 'app-item';
      
      if (item.lawatan_submit_sptb && item.lawatan_syor) {
        div.style.backgroundColor = '#d1fae5';
        div.style.borderLeft = '4px solid #10b981';
      } else if (item.date_submit && type === 'drafts') {
        div.classList.add('blue-bg');
      }
      
      const btnContainer = document.createElement('div');
      btnContainer.className = 'app-actions-btn';
      btnContainer.style.display = 'flex';
      btnContainer.style.gap = '8px';
      btnContainer.style.flexShrink = '0';

      if (type === 'drafts') {
        const btnEdit = document.createElement('button');
        btnEdit.className = 'btn-sm btn-edit';
        btnEdit.innerText = 'Edit';
        btnEdit.onclick = function() { loadRecordToDbOnly(item); }; 
        btnContainer.appendChild(btnEdit);
        
        const btnDelete = document.createElement('button');
        btnDelete.className = 'btn-sm btn-delete-sm';
        btnDelete.innerText = 'Padam';
        btnDelete.style.backgroundColor = '#ef4444';
        btnDelete.onclick = function() { 
            deleteOrClearRecord(item, 'padam_semua');
        };
        btnContainer.appendChild(btnDelete);
      } else if (type === 'inbox') {
        const btn = document.createElement('button');
        btn.className = 'btn-sm btn-view';
        btn.innerText = 'Proses';
        btn.onclick = function() { loadRecordToPelulus(item); }; 
        btnContainer.appendChild(btn);
      } else if (type === 'submitted') {
        const btnView = document.createElement('button');
        
        if (item.kelulusan) {
          if (item.kelulusan.includes('LULUS')) {
            btnView.className = 'btn-sm btn-view-approved';
          } else if (item.kelulusan.includes('TOLAK') || item.kelulusan.includes('SIASAT')) {
            btnView.className = 'btn-sm btn-view-rejected';
          } else {
            btnView.className = 'btn-sm btn-view-pending';
          }
        } else {
          btnView.className = 'btn-sm btn-view-pending';
        }
        
        btnView.innerText = 'Lihat';
        btnView.onclick = function() { viewRecordOnly(item); }; 
        btnContainer.appendChild(btnView);
        
        if (window.currentUser.role === 'PENGESYOR') {
          const btnUndo = document.createElement('button');
          btnUndo.className = 'btn-sm';
          btnUndo.innerText = 'Undo';
          btnUndo.style.backgroundColor = '#f59e0b';
          btnUndo.style.color = 'white';
          btnUndo.onclick = function() { 
            deleteOrClearRecord(item, 'undo_syor');
          };
          btnContainer.appendChild(btnUndo);
        }
      } else if (type === 'history') {
        const btn = document.createElement('button');
        
        if (item.kelulusan) {
          if (item.kelulusan.includes('LULUS')) {
            btn.className = 'btn-sm btn-view-approved';
          } else if (item.kelulusan.includes('TOLAK') || item.kelulusan.includes('SIASAT')) {
            btn.className = 'btn-sm btn-view-rejected';
          } else {
            btn.className = 'btn-sm btn-view-pending';
          }
        } else {
          btn.className = 'btn-sm btn-view-pending';
        }
        
        btn.innerText = 'Lihat';
        btn.onclick = function() { viewRecordOnly(item); }; 
        btnContainer.appendChild(btn);
        
        if (window.currentUser.role === 'PELULUS') {
          const btnUndo = document.createElement('button');
          btnUndo.className = 'btn-sm';
          btnUndo.innerText = 'Undo';
          btnUndo.style.backgroundColor = '#f59e0b';
          btnUndo.style.color = 'white';
          btnUndo.style.marginLeft = '5px';
          btnUndo.onclick = function() { 
            deleteOrClearRecord(item, 'undo_lulus');
          };
          btnContainer.appendChild(btnUndo);
        }
      }

      let jenisBadge = '';
      let perubahanRowHtml = '';
      
      const jenisUpper = item.jenis ? item.jenis.toUpperCase() : '';
      if (jenisUpper === 'BARU') {
        jenisBadge = `<span class="app-type-badge type-baru">BARU</span>`;
      } else if (jenisUpper === 'PEMBAHARUAN') {
        jenisBadge = `<span class="app-type-badge type-pembaharuan">PEMBAHARUAN</span>`;
      } else if (jenisUpper === 'UBAH MAKLUMAT') {
        jenisBadge = `<span class="app-type-badge type-ubah-maklumat">UBAH MAKLUMAT</span>`;
        if (item.ubah_maklumat) {
          perubahanRowHtml = `<div style="background-color:#fffbeb; border-left:3px solid #f59e0b; padding:4px 8px; margin-top:5px; font-size:0.8rem; font-weight:600; color:#d97706;">📝 Perubahan: ${item.ubah_maklumat}</div>`;
        }
      } else if (jenisUpper === 'UBAH GRED') {
        jenisBadge = `<span class="app-type-badge type-ubah-gred">UBAH GRED</span>`;
        if (item.ubah_gred) {
          perubahanRowHtml = `<div style="background-color:#fffbeb; border-left:3px solid #f59e0b; padding:4px 8px; margin-top:5px; font-size:0.8rem; font-weight:600; color:#d97706;">📝 Perubahan Gred: ${item.ubah_gred}</div>`;
        }
      } else {
        jenisBadge = `<span class="app-type-badge">${item.jenis || 'LAIN-LAIN'}</span>`;
      }

      let extraInfo = '';
      if ((window.currentUser.role === 'PELULUS' || window.currentUser.role === 'ADMIN' || window.currentUser.role === 'KETUA SEKSYEN' || window.currentUser.role === 'PENGARAH') && (type === 'inbox' || type === 'history')) {
        extraInfo = `<div style="font-size:0.75rem; color:#555; margin-top:2px;">Pengesyor: ${item.pengesyor || '-'}</div>`;
      }
      
      if (type === 'history' && item.pelulus) {
        extraInfo += `<div style="font-size:0.75rem; color:#555; margin-top:2px;">Pelulus: ${item.pelulus || '-'}</div>`;
      }

      let dateInfo = '';
      if (item.start_date) {
        const displayDate = formatDateDisplay(item.start_date);
        const dateLabel = 'TARIKH MULA (START DATE)';
        dateInfo = `<div style="font-size:0.75rem; color:#047857; font-weight:600; margin-top:2px;">📅 ${dateLabel}: ${displayDate}</div>`;
      }

      let spiDateInfo = '';
      if (item.date_submit) {
        const spiDate = formatDateDisplay(item.date_submit);
        spiDateInfo = `<div style="font-size:0.75rem; color:#1d4ed8; font-weight:600; margin-top:2px;">📤 Tarikh Hantar SPI: ${spiDate}</div>`;
      }

      let sptbDateInfo = '';
      if (item.lawatan_submit_sptb) {
        const sptbDate = formatDateDisplay(item.lawatan_submit_sptb);
        sptbDateInfo = `<div style="font-size:0.75rem; color:#059669; font-weight:600; margin-top:2px;">📋 Date Submit to SPTB: ${sptbDate}</div>`;
      }

      div.innerHTML = `
        <div class="app-info" style="flex: 1; padding-right: 15px; overflow: hidden;">
          <div class="app-title" style="font-weight:bold; font-size:1.1rem; word-break: break-word; white-space: normal;">${item.syarikat || '-'}</div>
          <div class="app-sub">${item.cidb || '-'} | ${item.gred || '-'} | ${jenisBadge}</div>
          ${dateInfo}
          ${spiDateInfo}
          ${sptbDateInfo}
          ${extraInfo}
          ${perubahanRowHtml}
        </div>
      `;
      
      div.appendChild(btnContainer);
      contentDiv.appendChild(div);
      wrapper.appendChild(contentDiv);
      list.appendChild(wrapper);
    });
  }

  // =========================================================================
  // LOAD RECORD FUNCTIONS
  // =========================================================================

  async function loadRecordToDbOnly(item) {
    const hasUnsaved = checkUnsavedData();
    
    if (hasUnsaved) {
      const confirmLoad = await window.CustomAppModal.confirm(
          "Anda mempunyai data yang belum disimpan. Muatkan rekod ini akan menulis semula borang. Teruskan?",
          "Data Belum Simpan",
          "warning",
          "Ya, Teruskan",
          true
      );
      if (!confirmLoad) return;
      
      await resetFormForEdit();
    } else {
      const finalConfirm = await window.CustomAppModal.confirm(
          "Adakah anda pasti mahu mengedit rekod ini?", 
          "Edit Rekod", 
          "info",
          "Ya, Edit",
          false
      );
      if(!finalConfirm) return;
    }

    document.getElementById('db_row_index').value = item.row || '';
    document.getElementById('db_syarikat').value = item.syarikat || '';
    document.getElementById('db_cidb').value = item.cidb || '';
    document.getElementById('db_gred').value = item.gred || '';
    document.getElementById('db_jenis').value = item.jenis || '';
    document.getElementById('db_negeri').value = item.negeri || '';
    document.getElementById('db_tatatertib').value = item.tatatertib || '';
    document.getElementById('db_syor').value = item.syor_lawatan || '';
    document.getElementById('db_pautan').value = item.pautan || '';
    document.getElementById('db_justifikasi').value = item.justifikasi || '';
    document.getElementById('db_syor_status').value = item.syor_status || '';
    
    const ubahMakInput = document.getElementById('input_ubah_maklumat');
    if(ubahMakInput) ubahMakInput.value = item.ubah_maklumat || '';
    const ubahGredInput = document.getElementById('input_ubah_gred');
    if(ubahGredInput) ubahGredInput.value = item.ubah_gred || '';

    const dbPerubahanInput = document.getElementById('db_perubahan_input');
    const dbPerubahanContainer = document.getElementById('db_perubahan_container');
    const dbPerubahanLabel = document.getElementById('db_perubahan_label');
    if (dbPerubahanInput && dbPerubahanContainer && dbPerubahanLabel) {
      if (item.jenis === 'UBAH MAKLUMAT') {
        dbPerubahanContainer.style.display = 'block';
        dbPerubahanLabel.textContent = 'Nyatakan Perubahan Maklumat:';
        dbPerubahanInput.value = item.ubah_maklumat || '';
      } else if (item.jenis === 'UBAH GRED') {
        dbPerubahanContainer.style.display = 'block';
        dbPerubahanLabel.textContent = 'Nyatakan Perubahan Gred:';
        dbPerubahanInput.value = item.ubah_gred || '';
      } else {
        dbPerubahanContainer.style.display = 'none';
        dbPerubahanInput.value = '';
      }
    }
    
    if (item.alamat_perniagaan) {
      const el = document.getElementById('db_alamat_perniagaan');
      if (el) el.value = item.alamat_perniagaan;
    }

    if (item.jenis_konsultansi) {
      document.querySelectorAll('.konsultansi-checkbox').forEach(cb => { cb.checked = false; });
      document.querySelectorAll('.konsultansi-date').forEach(d => { d.value = ''; d.style.display = 'none'; });
      
      const pattern = /(Emel|WhatsApp|Whatsapp|Call),?\s*(\d{1,2}\/\d{1,2}\/\d{4})/gi;
      let match;
      while ((match = pattern.exec(item.jenis_konsultansi)) !== null) {
        let type = match[1].toLowerCase();
        if (type === 'whatsapp') type = 'whatsapp';
        const date = match[2];
        
        const cb = document.getElementById(`cb_konsultansi_${type}`);
        if (cb) {
          cb.checked = true;
          const dateInput = document.getElementById(`date_konsultansi_${type}`);
          if (dateInput) {
            const parts = date.split('/');
            dateInput.value = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            dateInput.style.display = 'block';
          }
        }
      }
    }

    const tarikhSyorInput = document.getElementById('db_tarikh_syor');
    if (tarikhSyorInput && item.tarikh_syor) {
      tarikhSyorInput.value = new Date(item.tarikh_syor).toISOString().split('T')[0];
    }

    if (item.syor_lawatan === 'YA' && dbPautanInput) {
      dbPautanInput.style.backgroundColor = '#fffbeb';
      dbPautanInput.style.borderColor = '#f59e0b';
      dbPautanInput.style.borderWidth = '2px';
    }

    const startDateInput = document.getElementById('db_start_date');
    if (startDateInput && item.start_date) {
      startDateInput.value = new Date(item.start_date).toISOString().split('T')[0];
    }

    // Lawatan fields
    if (cbSelesaiLawatan) {
      const hasLawatan = item.lawatan_tarikh || item.lawatan_submit_sptb || item.lawatan_syor;
      cbSelesaiLawatan.checked = hasLawatan ? true : false;
      
      if (containerLawatan) {
        containerLawatan.style.display = hasLawatan ? 'block' : 'none';
      }
      
      if (dbLawatanTarikh && item.lawatan_tarikh) {
        dbLawatanTarikh.value = item.lawatan_tarikh;
      }
      if (dbLawatanSubmitSptb && item.lawatan_submit_sptb) {
        dbLawatanSubmitSptb.value = item.lawatan_submit_sptb;
      }
      if (dbLawatanSyor && item.lawatan_syor) {
        dbLawatanSyor.value = item.lawatan_syor;
      }
    }
    
    // SPI Status
    const dbStatusHantarSpi = document.getElementById('db_status_hantar_spi');
    if (dbStatusHantarSpi) {
        dbStatusHantarSpi.value = item.status_hantar_spi || '';
    }
    
    const statusDisp = document.getElementById('db_status_hantar_display');
    if (statusDisp) {
        if(item.status_hantar_spi === 'DALAM QUEUE') {
            statusDisp.textContent = '⏳ DALAM QUEUE';
            statusDisp.style.backgroundColor = '#fef3c7';
            statusDisp.style.borderColor = '#d97706';
            statusDisp.style.color = '#b45309';
            statusDisp.style.display = 'inline-block';
        } else if(item.status_hantar_spi === 'TELAH DIHANTAR') {
            statusDisp.textContent = `✅ TELAH DIHANTAR (${item.tarikh_hantar_spi || ''})`;
            statusDisp.style.backgroundColor = '#dcfce7';
            statusDisp.style.borderColor = '#16a34a';
            statusDisp.style.color = '#15803d';
            statusDisp.style.display = 'inline-block';
        } else {
            statusDisp.style.display = 'none';
        }
    }

    window.updateValidationCheckboxDisplay();

    window.switchTab('db');
    window.saveDatabaseFormData();
    updateOpenDriveButton();
  }

  function loadRecordToPelulus(item) {
    window.pelulusActiveItem = item;
    savePelulusState(); 
    window.renderPelulusView(false); 
    window.switchTab('pelulus-view');
  }

  function viewRecordOnly(item) {
    window.pelulusActiveItem = item;
    savePelulusState();
    
    window.renderPelulusView(true); 
    window.switchTab('pelulus-view');
  }

  window.renderPelulusView = function(readOnly) {
    const c = document.getElementById('pelulus_view_content');
    if (!c) return;

    const i = window.pelulusActiveItem;
    if (!i) return;

    const safe = (val) => val || '-';
    const formatDate = (d) => d ? formatDateDisplay(d) : '-';

    let link = '-';
    if (i.pautan) {
      link = `<a href="${i.pautan}" target="_blank" style="color:#2563eb; font-weight:bold; text-decoration:none;">BUKA DOKUMEN</a>`;
    }

    let statusBadge = `<span class="status-badge bg-blue">${safe(i.syor_status)}</span>`;
    if(i.syor_status === 'SOKONG') statusBadge = `<span class="status-badge bg-green">SOKONG</span>`;
    else if(i.syor_status === 'TIDAK DISOKONG') statusBadge = `<span class="status-badge bg-red">TIDAK SOKONG</span>`;

    const rowStartDate = i.start_date ? `
      <div class="view-row">
        <span class="view-label">TARIKH MULA (START DATE)</span>
        <span class="view-value">${formatDate(i.start_date)}</span>
      </div>` : '';

    const rowPrevDate = i.tarikh_surat_terdahulu ? `
      <div class="view-row">
        <span class="view-label">TARIKH SURAT TERDAHULU</span>
        <span class="view-value">${formatDate(i.tarikh_surat_terdahulu)}</span>
      </div>` : '';

    c.innerHTML = `
      <div class="view-container">
        <div class="view-section">
          <div class="view-section-header">🏢 MAKLUMAT PERMOHONAN</div>
          <div class="view-grid">
            <div class="view-row full-width">
              <span class="view-label">NAMA SYARIKAT</span>
              <span class="view-value" style="font-size:1.1rem; font-weight:bold;">${safe(i.syarikat)}</span>
            </div>
            <div class="view-row">
              <span class="view-label">NO. CIDB</span>
              <span class="view-value">${safe(i.cidb)}</span>
            </div>
            <div class="view-row">
              <span class="view-label">GRED & JENIS</span>
              <span class="view-value">${safe(i.gred)} (${safe(i.jenis)})</span>
            </div>
            ${rowStartDate}
            ${rowPrevDate}
            <div class="view-row">
              <span class="view-label">NEGERI OPERASI</span>
              <span class="view-value">${safe(i.negeri)}</span>
            </div>
            <div class="view-row full-width">
              <span class="view-label">ALAMAT PERNIAGAAN</span>
              <span class="view-value">${safe(i.alamat_perniagaan)}</span>
            </div>
            <div class="view-row full-width">
              <span class="view-label">JENIS KONSULTANSI</span>
              <span class="view-value">${safe(i.jenis_konsultansi)}</span>
            </div>
            <div class="view-row">
              <span class="view-label">PAUTAN DOKUMEN</span>
              <span class="view-value">${link}</span>
            </div>
          </div>
        </div>

        <div class="view-section">
          <div class="view-section-header">🚧 MAKLUMAT LAWATAN & PEMATUHAN</div>
          <div class="view-grid">
            <div class="view-row">
              <span class="view-label">TARIKH LAWATAN</span>
              <span class="view-value">${formatDate(i.lawatan_tarikh)}</span>
            </div>
            <div class="view-row">
              <span class="view-label">DATE SUBMIT TO SPTB</span>
              <span class="view-value">${formatDate(i.lawatan_submit_sptb)}</span>
            </div>
            <div class="view-row">
              <span class="view-label">SYOR LAWATAN</span>
              <span class="view-value">${safe(i.lawatan_syor)}</span>
            </div>
          </div>
        </div>

        <div class="view-section">
          <div class="view-section-header">👤 ULASAN PENGESYOR</div>
          <div class="view-grid">
            <div class="view-row full-width">
              <span class="view-label">NAMA PENGESYOR</span>
              <span class="view-value">${safe(i.pengesyor)}</span>
            </div>
            <div class="view-row">
              <span class="view-label">TARIKH SYOR</span>
              <span class="view-value">${formatDate(i.tarikh_syor)}</span>
            </div>
            <div class="view-row">
              <span class="view-label">KEPUTUSAN SYOR</span>
              <span class="view-value">${statusBadge}</span>
            </div>
            <div class="view-row full-width">
              <span class="view-label">JUSTIFIKASI</span>
              <span class="view-value">${safe(i.justifikasi)}</span>
            </div>
          </div>
        </div>

        ${i.tarikh_lulus ? `
        <div class="view-section" style="border-color:#22c55e;">
          <div class="view-section-header" style="background:#f0fdf4; color:#166534;">✅ KEPUTUSAN PELULUS</div>
          <div class="view-grid">
            <div class="view-row full-width">
              <span class="view-label">KEPUTUSAN AKHIR</span>
              <span class="view-value" style="font-weight:bold; color:#15803d;">${safe(i.kelulusan)}</span>
            </div>
            <div class="view-row full-width">
              <span class="view-label">NAMA PELULUS</span>
              <span class="view-value">${safe(i.pelulus)}</span>
            </div>
            <div class="view-row">
              <span class="view-label">TARIKH LULUS</span>
              <span class="view-value">${formatDate(i.tarikh_lulus)}</span>
            </div>
            <div class="view-row">
              <span class="view-label">ALASAN/CATATAN</span>
              <span class="view-value">${safe(i.alasan)}</span>
            </div>
          </div>
        </div>` : ''}
      </div>
    `;

    const btnToApproval = document.getElementById('btnToApproval');
    const btnViewBack = document.getElementById('btnViewBack');
    const btnOpenFull = document.getElementById('openFullBtnPelulus');

    if(readOnly) {
      if(btnToApproval) btnToApproval.style.display = 'none';
      if(btnViewBack) btnViewBack.style.display = 'inline-block';
    } else {
      if(btnToApproval) btnToApproval.style.display = 'inline-block';
      if(btnViewBack) btnViewBack.style.display = 'none';
    }

    if (btnOpenFull) {
        btnOpenFull.style.display = 'inline-block';
    }
  };

  // =========================================================================
  // PELULUS STATE MANAGEMENT
  // =========================================================================
  function savePelulusState() {
    if (window.isRestoring) return;
    const state = {
      activeItem: window.pelulusActiveItem,
      keputusan: document.getElementById('pelulus_keputusan')?.value || '',
      alasan: document.getElementById('pelulus_alasan')?.value || ''
    };
    window.storageWrapper.set({ 'stb_pelulus_state': state });
  }

  async function loadPelulusState() {
    const stored = await window.storageWrapper.get(['stb_pelulus_state']);
    const state = stored.stb_pelulus_state;
    if(state && state.activeItem) {
      window.pelulusActiveItem = state.activeItem; 
      const elKeputusan = document.getElementById('pelulus_keputusan');
      if(elKeputusan) {
        elKeputusan.value = state.keputusan || '';
        
        const alasanEl = document.getElementById('pelulus_alasan');
        if (alasanEl) alasanEl.value = state.alasan || '';
        
        const evt = new Event('change');
        elKeputusan.dispatchEvent(evt);
      }
    }
    window.updateValidationCheckboxDisplay();
  }

  // =========================================================================
  // CHECK UNSAVED DATA
  // =========================================================================
  function checkUnsavedData() {
    const borangFields = [
      'borang_syarikat', 'borang_cidb', 'borang_gred', 'borang_tarikh_mohon',
      'borang_tatatertib', 'borang_justifikasi', 'spkkDuration', 'stbDuration'
    ];

    const dbFields = ['db_syarikat', 'db_cidb', 'db_gred'];

    let hasData = false;

    borangFields.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.value.trim() !== '') {
        hasData = true;
      }
    });

    dbFields.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.value.trim() !== '') {
        hasData = true;
      }
    });

    const personCards = document.querySelectorAll('.person-card');
    personCards.forEach(card => {
      const name = card.querySelector('.p-name')?.value;
      if (name && name.trim() !== '') {
        hasData = true;
      }
    });

    return hasData;
  }

  async function resetFormForEdit() {
    const fieldsToClear = [
      'borang_syarikat', 'borang_cidb', 'borang_gred', 'borang_tarikh_mohon',
      'borang_tatatertib', 'borang_justifikasi', 'spkkDuration', 'stbDuration', 'ssm_date_input',
      'ssm_status', 'bank_date_input', 'bank_sign_input', 'bank_status_input',
      'doc_carta_status', 'doc_peta_status', 'doc_gambar_status', 'doc_sewa_status',
      'kwsp_date_1', 'kwsp_s1', 'kwsp_date_2', 'kwsp_s2', 'kwsp_date_3', 'kwsp_s3',
      'db_status_hantar_spi',
      'borang_no_telefon',
      'input_ubah_maklumat', 'input_ubah_gred'
    ];

    fieldsToClear.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    document.querySelectorAll('input[name="jenisApp"]').forEach(radio => {
      radio.checked = false;
    });
    
    const statusDisp = document.getElementById('db_status_hantar_display');
    if (statusDisp) statusDisp.style.display = 'none';
    
    const ubahMaklumatInput = document.getElementById('input_ubah_maklumat');
    const ubahGredInput = document.getElementById('input_ubah_gred');
    if (ubahMaklumatInput) ubahMaklumatInput.style.display = 'none';
    if (ubahGredInput) ubahGredInput.style.display = 'none';

    const personnelListEl = document.getElementById('personnelList');
    if (personnelListEl) personnelListEl.innerHTML = '';

    addPerson();

    await window.storageWrapper.remove([
      'stb_form_data', 
      'stb_drive_folder_url', 
      'stb_user_folder_url', 
      'stb_extracted_pdf_data',
      'stb_form_persistence',
      'stb_database_persistence'
    ]);

    console.log("V6.5.2 Borang telah direset untuk edit.");
  }

  // =========================================================================
  // SUBMIT DATA FUNCTION
  // =========================================================================

  function submitData(payload, successMsg, callback) {
    console.log("V6.5.2 submitData dipanggil dengan payload:", payload);
    
    const statusEl = document.getElementById('statusMsg');
    if(statusEl) statusEl.innerText = "Sedang menghantar...";
    
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    
    if (loadingOverlay) {
      loadingOverlay.style.display = 'flex';
      loadingText.textContent = 'Menghantar data...';
      
      const progressBar = document.getElementById('loading-progress-bar');
      const progressPercent = document.getElementById('loading-progress-percent');
      const progressLabel = document.getElementById('loading-progress-label');
      
      if (progressBar) progressBar.style.width = '0%';
      if (progressPercent) progressPercent.textContent = '0%';
      if (progressLabel) progressLabel.textContent = 'Menyediakan data...';
      
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        if (currentProgress < 90) {
          currentProgress += 2;
          if (progressBar) progressBar.style.width = `${currentProgress}%`;
          if (progressPercent) progressPercent.textContent = `${currentProgress}%`;
          
          if (progressLabel) {
            if (currentProgress < 30) {
              progressLabel.textContent = 'Menyediakan data...';
            } else if (currentProgress < 60) {
              progressLabel.textContent = 'Menghantar ke pelayan...';
            } else {
              progressLabel.textContent = 'Memproses di pelayan...';
            }
          }
        }
      }, 100);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      window.fetchWithRetry(window.SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        signal: controller.signal
      }, 3, 1000)
      .then(async response => {
        clearTimeout(timeoutId);
        clearInterval(progressInterval);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        let result;
        try {
          result = JSON.parse(text);
        } catch (e) {
          console.log("V6.5.2 Response is not JSON:", text);
          result = { status: 'success', message: 'Data dihantar (tiada respons JSON)' };
        }
        
        if (progressBar) progressBar.style.width = '100%';
        if (progressPercent) progressPercent.textContent = '100%';
        if (progressLabel) progressLabel.textContent = 'Selesai!';
        
        if(statusEl) { 
          statusEl.innerText = successMsg; 
          statusEl.style.color = "green"; 
          setTimeout(() => statusEl.innerText = "", 3000); 
        }
        
        setTimeout(() => {
          if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
          }
          
          if(callback) callback(result);
        }, 500);
      })
      .catch(err => { 
        clearTimeout(timeoutId);
        clearInterval(progressInterval);
        console.error("V6.5.2 Submit error:", err);
        
        if (progressBar) progressBar.style.width = '100%';
        if (progressPercent) progressPercent.textContent = '100%';
        if (progressLabel) progressLabel.textContent = 'Ralat!';
        if (progressBar) progressBar.style.backgroundColor = '#ef4444';
        
        let errorMsg = "Ralat penghantaran.";
        if (err.name === 'AbortError') {
          errorMsg = "Penghantaran dibatalkan atau timeout. Sila semak sambungan internet.";
        } else if (err.message) {
          errorMsg = err.message;
        }
        
        if(statusEl) statusEl.innerText = errorMsg; 
        
        setTimeout(() => {
          if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
          }
          window.CustomAppModal.alert("GAGAL menghantar data: " + errorMsg, "Ralat", "error");
        }, 1000);
      });
    } else {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      window.fetchWithRetry(window.SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        signal: controller.signal
      }, 3, 1000)
      .then(async response => {
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        let result;
        try {
          result = JSON.parse(text);
        } catch (e) {
          console.log("V6.5.2 Response is not JSON:", text);
          result = { status: 'success', message: 'Data dihantar (tiada respons JSON)' };
        }
        
        if(statusEl) { 
          statusEl.innerText = successMsg; 
          statusEl.style.color = "green"; 
          setTimeout(() => statusEl.innerText = "", 3000); 
        }
        if(callback) callback(result);
      })
      .catch(err => { 
        clearTimeout(timeoutId);
        console.error("V6.5.2 Submit error:", err);
        
        let errorMsg = "Ralat penghantaran.";
        if (err.name === 'AbortError') {
          errorMsg = "Penghantaran dibatalkan atau timeout. Sila semak sambungan internet.";
        } else if (err.message) {
          errorMsg = err.message;
        }
        
        if(statusEl) statusEl.innerText = errorMsg; 
        window.CustomAppModal.alert("GAGAL menghantar data: " + errorMsg, "Ralat", "error");
      });
    }
  }

  // =========================================================================
  // WHATSAPP NOTIFICATION
  // =========================================================================

  function sendWhatsAppNotification(companyName, cidb, jenisPermohonan, syorStatus, tarikhSyor, pelulusPhone) {
    if (!pelulusPhone || pelulusPhone.trim() === '') {
      console.log("V6.5.2 No phone number provided for WhatsApp notification");
      return null;
    }
    
    let cleanPhone = pelulusPhone.replace(/[\s\-\(\)]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '60' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('60')) {
      cleanPhone = '60' + cleanPhone;
    }
    
    if (!/^\d{9,15}$/.test(cleanPhone)) {
      console.log("V6.5.2 Invalid phone number format:", cleanPhone);
      return null;
    }
    
    const message = `*NOTIFIKASI PERMOHONAN STB*
    
Syarikat: ${companyName}
No. CIDB: ${cidb || 'Tiada'}
Jenis Permohonan: ${jenisPermohonan || 'Tiada'}
Status Syor: ${syorStatus || 'Tiada'}
Tarikh Syor: ${tarikhSyor || 'Tiada'}

Sila semak sistem STB untuk tindakan selanjutnya.`;

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    console.log("V6.5.2 WhatsApp notification URL prepared:", whatsappUrl);
    
    return whatsappUrl;
  }

  // =========================================================================
  // POPULATE WHATSAPP DROPDOWN
  // =========================================================================
  function populateWhatsAppDropdown() {
    if (!dbPelulusWhatsapp) return;
    
    const pelulusList = window.usersList.filter(user => user.role === 'PELULUS');
    
    dbPelulusWhatsapp.innerHTML = '<option value="">- Tiada Notifikasi / Pilih Pelulus -</option>';
    
    pelulusList.forEach(pelulus => {
      const phone = pelulus.phone || '';
      const name = pelulus.name || '';
      const option = document.createElement('option');
      option.value = phone;
      option.textContent = `${name} ${phone ? '(' + phone + ')' : ''}`;
      dbPelulusWhatsapp.appendChild(option);
    });
    
    console.log(`V6.5.2 WhatsApp dropdown populated with ${pelulusList.length} pelulus`);
  }

  // =========================================================================
  // DRIVE FOLDER FUNCTIONS
  // =========================================================================

  async function createDriveFolder() {
    const syarikat = document.getElementById('db_syarikat')?.value.trim();
    const jenisPermohonan = document.getElementById('db_jenis')?.value;
    const tarikhMohon = document.getElementById('db_start_date')?.value || document.getElementById('borang_tarikh_mohon')?.value;
    const userName = window.currentUser.name;

    if (!syarikat) {
      await window.CustomAppModal.alert("Sila isi Nama Syarikat terlebih dahulu.", "Maklumat Diperlukan", "warning");
      return;
    }

    if (!jenisPermohonan) {
      await window.CustomAppModal.alert("Sila pilih Jenis Permohonan terlebih dahulu.", "Maklumat Diperlukan", "warning");
      return;
    }

    if (!tarikhMohon) {
      await window.CustomAppModal.alert("Sila isi Tarikh Mohon atau Start Date terlebih dahulu.", "Maklumat Diperlukan", "warning");
      return;
    }

    if (driveStatus) {
      driveStatus.style.display = 'inline-block';
      driveStatus.className = 'drive-status drive-creating';
      driveStatus.innerText = 'Mencipta...';
    }

    if (driveResult) {
      driveResult.innerHTML = '<div style="color: #92400e;">Sedang mencipta folder dalam User Folder...</div>';
    }

    const now = new Date();
    const currentMonth = now.toLocaleString('ms-MY', { month: 'long' });
    const currentYear = now.getFullYear();
    const monthYearFolder = `${currentMonth.toUpperCase()} ${currentYear}`;

    let formattedDate = '';
    try {
      const tarikhDate = new Date(tarikhMohon);
      formattedDate = tarikhDate.toLocaleDateString('ms-MY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '-');
    } catch (e) {
      formattedDate = tarikhMohon;
    }

    const companyFolderName = syarikat.toUpperCase();
    const subfolderName = `${jenisPermohonan.toUpperCase()} - ${formattedDate}`;

    const payload = {
      action: 'createDriveFolder',
      month_year: monthYearFolder,
      company_name: companyFolderName,
      application_type: subfolderName,
      user_name: userName,
      main_folder_id: window.mainFolderId,
      email: window.currentUser ? window.currentUser.email : ''
    };

    try {
      const response = await window.fetchWithRetry(window.SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      }, 3, 1000);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        await window.playSuccessSound();
        
        window.driveFolderCreated = true;
        window.createdFolderUrl = result.folder_url;
        window.userFolderUrl = result.user_folder_url;
        
        await window.storageWrapper.set({ 
          'stb_drive_folder_url': window.createdFolderUrl,
          'stb_user_folder_url': window.userFolderUrl 
        });
        
        const dbPautan = document.getElementById('db_pautan');
        if (dbPautan) {
          dbPautan.value = window.createdFolderUrl;
        }
        
        if (driveStatus) {
          driveStatus.className = 'drive-status drive-success';
          driveStatus.innerText = 'Berjaya';
        }
        
        showDriveFolderLink(window.createdFolderUrl, window.userFolderUrl);
        
        if (cbCreateDriveFolder) {
          cbCreateDriveFolder.checked = true;
        }
        
        updateOpenDriveButton();
        
        await window.CustomAppModal.alert("Folder Drive berjaya dicipta dalam User Folder System!<br>Pautan telah dimasukkan secara automatik.", "Berjaya", "success");
        
      } else {
        throw new Error(result.message || 'Gagal mencipta folder');
      }
      
    } catch (error) {
      console.error("V6.5.2 Error creating drive folder:", error);
      
      await window.playErrorSound();
      
      if (driveStatus) {
        driveStatus.className = 'drive-status drive-error';
        driveStatus.innerText = 'Gagal';
      }
      
      if (driveResult) {
        driveResult.innerHTML = `<div style="color: #991b1b;">Ralat: ${error.message}</div>`;
      }
      
      await window.CustomAppModal.alert(`Gagal mencipta folder: ${error.message}`, "Ralat", "error");
    }
  }

  function showDriveFolderLink(folderUrl, userFolderUrl) {
    if (!driveResult) return;

    const syarikat = document.getElementById('db_syarikat')?.value || '';
    const userName = window.currentUser.name;

    driveResult.innerHTML = `
      <div style="margin-top: 10px; padding: 10px; background: #dcfce7; border-radius: 8px; border: 1px solid #22c55e;">
        <div style="font-weight: bold; color: #166534; margin-bottom: 5px;">✓ Folder berjaya dicipta dalam User Folder System!</div>
        <div style="margin-bottom: 8px;">
          <a href="${folderUrl}" target="_blank" class="drive-link">
            📂 Klik untuk buka folder syarikat
          </a>
        </div>
        <div style="margin-bottom: 5px;">
          <a href="${userFolderUrl}" target="_blank" class="drive-link" style="background: #dbeafe;">
            👤 Klik untuk buka folder user: ${userName}
          </a>
        </div>
        <div style="font-size: 0.8rem; color: #4b5563; margin-top: 5px;">
          Folder: ${syarikat}
        </div>
        <div style="font-size: 0.7rem; color: #6b7280; margin-top: 3px;">
          Pautan telah dimasukkan ke dalam "Pautan Dokumen"
        </div>
      </div>
    `;
  }

  function updateOpenDriveButton() {
    const dbPautan = document.getElementById('db_pautan')?.value;
    const btnOpenDrive = document.getElementById('btnOpenDriveFolder');

    if (btnOpenDrive) {
      if (dbPautan && dbPautan.trim() !== '') {
        btnOpenDrive.disabled = false;
        btnOpenDrive.title = "Buka Folder Drive";
      } else {
        btnOpenDrive.disabled = true;
        btnOpenDrive.title = "Sila cipta folder terlebih dahulu";
      }
    }
  }

  function openDriveFolder() {
    const dbPautan = document.getElementById('db_pautan')?.value;
    
    if (!dbPautan || dbPautan.trim() === '') {
      window.CustomAppModal.alert("Tiada pautan folder Drive. Sila cipta folder terlebih dahulu.", "Tiada Pautan", "warning");
      return;
    }
    
    window.open(dbPautan, '_blank');
  }

  // =========================================================================
  // PRINT FUNCTIONS
  // =========================================================================

  function generatePdfCssString(userColor) {
    const themeColor = userColor || '#2563eb';
    
    return `
      body {
        font-family: 'Arial', 'Segoe UI', sans-serif;
        margin: 0;
        padding: 10px;
        color: #000000;
        background: white;
      }
      
      .print-header-strip {
        height: 6px;
        background-color: ${themeColor};
        margin-bottom: 10px;
      }
      
      .jenis-permohonan-bar {
        border: 1px solid #000;
        padding: 8px 10px;
        margin-bottom: 10px;
        background-color: #f0f9ff;
      }
      
      .jenis-permohonan-row-1 {
        border-bottom: 1px dotted #ccc;
        padding-bottom: 5px;
        margin-bottom: 5px;
      }
      
      .jenis-permohonan-row-2 {
        border-bottom: 1px dotted #ccc;
        padding-bottom: 5px;
        margin-bottom: 5px;
      }
      
      .jenis-permohonan-row-3 {
        display: block;
      }
      
      .checkbox-large {
        transform: scale(1.2);
        margin: 0 5px;
      }
      
      .print-fill-text {
        font-weight: bold;
        text-decoration: underline;
        padding: 0 10px;
      }
      
      .border-box {
        border: 1px solid #000;
        padding: 8px;
        margin: 2px 0;
        background-color: #f8fafc;
      }
      
      .themed-box {
        background-color: ${themeColor};
        color: white;
        padding: 8px;
      }
      
      .grade-bar {
        border: 1px solid #000;
        padding: 8px;
        margin: 5px 0;
        background-color: #fef3c7;
        display: block;
      }
      
      .print-table {
        width: 100%;
        border-collapse: collapse;
        margin: 5px 0;
      }
      
      .print-table th, .print-table td {
        border: 1px solid #000;
        padding: 4px 6px;
        vertical-align: top;
      }
      
      .col-tick {
        text-align: center;
        width: 40px;
      }
      
      .layout-table td {
        border: none;
        padding: 2px;
      }
      
      .info-field {
        display: inline-block;
        margin-right: 15px;
      }
      
      .info-label {
        font-weight: bold;
      }
      
      .print-result {
        font-weight: bold;
        text-align: center;
      }
      
      .verification-box {
        border: none;
        padding: 10px;
        margin-top: 10px;
      }
      
      .ver-title {
        font-weight: bold;
        text-decoration: underline;
        margin-bottom: 5px;
      }
      
      .options-text-center {
        text-align: center;
        font-style: italic;
        border-bottom: 1px dotted #ccc;
        padding-bottom: 5px;
        margin-bottom: 5px;
      }
      
      .pengesyor-grid-new {
        display: block;
        margin-top: 10px;
      }
      
      .pengesyor-dates {
        margin-bottom: 10px;
      }
      
      .pengesyor-sign-box {
        text-align: center;
        margin-top: 15px;
      }
      
      .verification-separator {
        border-bottom: 2px solid #000;
        margin: 10px 0;
      }
      
      .font-large-nobold {
        font-size: 16pt;
        font-weight: normal;
      }
      
      h2 {
        font-size: 14pt;
        margin: 10px 0 5px 0;
        border-bottom: 1px solid #000;
      }
    `;
  }

  function preparePrintView() {
    const val = (id) => { 
      const el = document.getElementById(id); 
      return el ? el.value.toUpperCase() : ''; 
    };

    const selectedType = document.querySelector('input[name="jenisApp"]:checked')?.value;
    ['baru', 'pembaharuan', 'ubah_maklumat', 'ubah_gred'].forEach(type => {
      const cb = document.getElementById(`print_type_${type}`);
      if(cb) cb.checked = false;
    });
    if(selectedType) {
      const targetCb = document.getElementById(`print_type_${selectedType}`);
      if(targetCb) targetCb.checked = true;
    }

    const setTxt = (id, val) => { 
      const el = document.getElementById(id); 
      if(el) el.innerText = val; 
    };

    const combinedNameCidb = `${val('borang_syarikat')} (${val('borang_cidb')})`;
    setTxt('print_companyDetails', combinedNameCidb);

    setTxt('print_spkkDuration', val('spkkDuration'));
    setTxt('print_stbDuration', val('stbDuration'));
    setTxt('print_text_ubah_maklumat', val('input_ubah_maklumat'));
    setTxt('print_text_ubah_gred', val('input_ubah_gred'));
    setTxt('print_grade_display', val('borang_gred'));
    setTxt('print_tatatertib', val('borang_tatatertib'));
    setTxt('print_justifikasi', val('borang_justifikasi') || val('input_justifikasi') || val('db_justifikasi'));
    
    setTxt('print_no_telefon', val('borang_no_telefon'));
    
    setTxt('print_ssm_date', formatDateDisplay(val('ssm_date_input')));
    setTxt('print_bank_date', formatDateDisplay(val('bank_date_input')));
    setTxt('print_ssm_status_display', val('ssm_status'));

    const bankSign = val('bank_sign_input');
    const bankStatus = val('bank_status_input');
    const bankDisplay = bankStatus ? `${bankSign} (${bankStatus})` : bankSign;
    setTxt('print_bank_sign', bankDisplay);

    setTxt('print_doc_carta', val('doc_carta_status'));
    setTxt('print_doc_peta', val('doc_peta_status'));
    setTxt('print_doc_gambar', val('doc_gambar_status'));
    setTxt('print_doc_sewa', val('doc_sewa_status'));

    const kwsp1 = formatKWSP(val('kwsp_date_1'), val('kwsp_s1'));
    const kwsp2 = formatKWSP(val('kwsp_date_2'), val('kwsp_s2'));
    const kwsp3 = formatKWSP(val('kwsp_date_3'), val('kwsp_s3'));
    setTxt('print_kwsp_1', kwsp1);
    setTxt('print_kwsp_2', kwsp2);
    setTxt('print_kwsp_3', kwsp3);

    const tMohon = document.getElementById('borang_tarikh_mohon')?.value || '';
    setTxt('print_tarikh_mohon', tMohon ? formatDateDisplay(tMohon) : '_____________');

    const tbody = document.getElementById('print_personnel_page1');
    if (!tbody) return;

    tbody.innerHTML = '';

    const cards = document.querySelectorAll('.person-card');
    let rowsHtml = '';

    cards.forEach(card => {
      const name = card.querySelector('.p-name')?.value.toUpperCase() || '';
      const roles = [];
      card.querySelectorAll('.role-cb:checked').forEach(cb => roles.push(cb.value));
      const s_ic = card.querySelector('.status-ic')?.value.toUpperCase() || '';
      const s_sb = card.querySelector('.status-sb')?.value.toUpperCase() || '';
      const s_epf = card.querySelector('.status-epf')?.value.toUpperCase() || '';
      
      const tick = (role) => roles.includes(role) ? '✓' : '';
      
      rowsHtml += `<tr>
        <td style="padding:2px;"><div style="font-weight:bold; font-size:12pt; text-transform:uppercase;">${name}</div></td>
        <td class="col-tick">${tick('PENGARAH')}</td>
        <td class="col-tick">${tick('P.EKUITI')}</td>
        <td class="col-tick">${tick('T.T CEK')}</td>
        <td class="col-tick">${tick('P.SPKK')}</td>
        <td class="col-tick">${s_ic}</td>
        <td class="col-tick">${s_sb}</td>
        <td class="col-tick">${s_epf}</td>
      </tr>`;
    });

    for(let i = cards.length; i < 6; i++) {
      rowsHtml += `<tr><td style="height:35px;"></td><td class="col-tick"></td><td class="col-tick"></td><td class="col-tick"></td><td class="col-tick"></td><td class="col-tick"></td><td class="col-tick"></td><td class="col-tick"></td></tr>`;
    }

    tbody.innerHTML = rowsHtml;
  }

  // =========================================================================
  // RESET FORM AFTER SUBMIT
  // =========================================================================
  async function resetFormAfterSubmit() {
    const fieldsToClear = [
      'db_syarikat', 'borang_syarikat', 'borang_cidb', 'db_row_index',
      'db_cidb', 'db_gred', 'db_jenis', 'db_negeri', 'db_tarikh_surat',
      'db_start_date', 'db_tatatertib', 'db_syor', 'db_submit_date',
      'db_pautan', 'db_justifikasi', 'db_syor_status', 'db_tarikh_syor',
      'borang_gred', 'borang_tarikh_mohon', 'borang_tatatertib', 'borang_justifikasi',
      'spkkDuration', 'stbDuration', 'ssm_date_input', 'ssm_status',
      'bank_date_input', 'bank_sign_input', 'bank_status_input',
      'doc_carta_status', 'doc_peta_status', 'doc_gambar_status', 'doc_sewa_status',
      'kwsp_date_1', 'kwsp_s1', 'kwsp_date_2', 'kwsp_s2', 'kwsp_date_3', 'kwsp_s3',
      'input_ubah_maklumat', 'input_ubah_gred',
      'db_lawatan_tarikh', 'db_lawatan_submit_sptb', 'db_lawatan_syor',
      'db_status_hantar_spi',
      'borang_no_telefon',
      'db_alamat_perniagaan', 'db_perubahan_input'
    ];

    fieldsToClear.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    
    const statusDisp = document.getElementById('db_status_hantar_display');
    if (statusDisp) statusDisp.style.display = 'none';
    
    document.querySelectorAll('.konsultansi-checkbox').forEach(cb => { cb.checked = false; });
    document.querySelectorAll('.konsultansi-date').forEach(d => { d.value = ''; d.style.display = 'none'; });
    
    if (cbSelesaiLawatan) cbSelesaiLawatan.checked = false;
    if (containerLawatan) containerLawatan.style.display = 'none';
    
    if (cbNotifyWhatsapp) cbNotifyWhatsapp.checked = false;
    if (pelulusWhatsappContainer) pelulusWhatsappContainer.style.display = 'none';
    if (dbPelulusWhatsapp) dbPelulusWhatsapp.value = '';

    const dbPerubahanContainer = document.getElementById('db_perubahan_container');
    if (dbPerubahanContainer) dbPerubahanContainer.style.display = 'none';

    document.querySelectorAll('input[name="jenisApp"]').forEach(radio => {
      radio.checked = false;
    });

    const ubahMaklumatInput = document.getElementById('input_ubah_maklumat');
    const ubahGredInput = document.getElementById('input_ubah_gred');
    if (ubahMaklumatInput) ubahMaklumatInput.style.display = 'none';
    if (ubahGredInput) ubahGredInput.style.display = 'none';

    const personnelListEl = document.getElementById('personnelList');
    if (personnelListEl) personnelListEl.innerHTML = '';

    addPerson();

    if (dbPautanInput) {
      dbPautanInput.style.backgroundColor = '';
      dbPautanInput.style.borderColor = '';
      dbPautanInput.style.borderWidth = '';
    }

    if (btnSyncToDb) {
      btnSyncToDb.style.display = 'none';
    }

    window.hasPrinted = false;
    window.driveFolderCreated = false;
    window.createdFolderUrl = '';
    window.userFolderUrl = '';

    if (cbCreateDriveFolder) {
      cbCreateDriveFolder.checked = true;
    }

    if (driveResult) driveResult.innerHTML = '';
    if (driveStatus) {
      driveStatus.style.display = 'none';
    }

    window.clearPdfData();

    updateOpenDriveButton();

    window.storageWrapper.set({ 
      'stb_has_printed': false,
      'stb_drive_folder_url': '',
      'stb_user_folder_url': ''
    });

    await window.storageWrapper.remove([
      'stb_form_data', 
      'stb_form_states',
      'stb_form_persistence',
      'stb_database_persistence'
    ]);

    console.log("V6.5.2 Borang telah direset selepas hantar data.");

    window.updateValidationCheckboxDisplay();
  }

  // =========================================================================
  // PERSONNEL FUNCTIONS
  // =========================================================================

  window.addPerson = function(data=null) {
    const personnelList = document.getElementById('personnelList');;
    if (!personnelList) return;

    const div = document.createElement('div');
    div.className = 'person-card';
    div.innerHTML = `
      <button class="delete-btn" type="button">✕</button>
      <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
        <label>Nama Personel</label>
        <label><input type="checkbox" class="is-company"> Syarikat?</label>
      </div>
      <input type="text" class="p-name" placeholder="NAMA PENUH">
      <div style="margin-top:5px;">
        <label>Jawatan:</label>
        <div style="display:flex; gap:8px;">
        <label><input type="checkbox" value="PENGARAH" class="role-cb"> PENGARAH</label>
        <label><input type="checkbox" value="P.EKUITI" class="role-cb"> P.EKUITI</label>
        <label><input type="checkbox" value="P.SPKK" class="role-cb"> P.SPKK</label>
        <label><input type="checkbox" value="T.T CEK" class="role-cb"> T.T CEK</label>
        </div>
      </div>
      <div style="margin-top:5px; border-top:1px dashed #ccc; padding-top:5px;">
        <div class="grid-equal">
          <div>
            <label>IC</label>
            <div class="status-input-container">
              <input type="text" class="status-ic status-input" maxlength="10" placeholder="-">
            </div>
          </div>
          <div>
            <label>SB</label>
            <div class="status-input-container">
              <input type="text" class="status-sb status-input" maxlength="10" placeholder="-">
            </div>
          </div>
        </div>
        <div class="grid-equal" style="margin-top:5px;">
          <div>
            <label>EPF</label>
            <div class="status-input-container">
              <input type="text" class="status-epf status-input" maxlength="10" placeholder="-">
            </div>
          </div>
        </div>
      </div>
    `;
    personnelList.appendChild(div);

    const docTypes = ['ic', 'sb', 'epf'];
    
    docTypes.forEach(type => {
      const input = div.querySelector(`.status-${type}`);
      if (input) {
        const tickContainer = document.createElement('div');
        tickContainer.className = 'tick-buttons';
        tickContainer.innerHTML = `
          <button type="button" class="tick-btn tick-right" title="Set OK">✓</button>
          <button type="button" class="tick-btn tick-wrong" title="Set X">✗</button>
        `;
        input.parentElement.style.position = 'relative';
        input.parentElement.appendChild(tickContainer);
        
        const tickRightBtn = tickContainer.querySelector('.tick-right');
        const tickWrongBtn = tickContainer.querySelector('.tick-wrong');
        
        if (tickRightBtn) {
          tickRightBtn.addEventListener('click', () => {
            input.value = '✓';
            input.style.backgroundColor = '#dcfce7';
            input.style.color = '#166534';
            input.dispatchEvent(new Event('input'));
            window.saveFormData();
          });
        }
        
        if (tickWrongBtn) {
          tickWrongBtn.addEventListener('click', () => {
            input.value = 'X';
            input.style.backgroundColor = '#fee2e2';
            input.style.color = '#991b1b';
            input.dispatchEvent(new Event('input'));
            window.saveFormData();
          });
        }
        
        input.addEventListener('input', window.saveFormData);
      }
    });

    div.querySelectorAll('.status-input').forEach(input => {
      input.addEventListener('input', (e) => { 
        e.target.value = e.target.value.toUpperCase(); 
        window.saveFormData();
      });
    });

    const nameInput = div.querySelector('.p-name');
    if (nameInput) {
      nameInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
        window.saveFormData();
      });
    }

    div.querySelectorAll('.role-cb, .is-company').forEach(cb => {
      cb.addEventListener('change', window.saveFormData);
    });

    if(data) {
      if (nameInput) nameInput.value = data.name || '';
      
      const isCompanyCheckbox = div.querySelector('.is-company');
      if (isCompanyCheckbox) isCompanyCheckbox.checked = data.isCompany || false;
      
      if(data.roles) {
        div.querySelectorAll('.role-cb').forEach(cb => {
          if(data.roles.includes(cb.value)) cb.checked = true;
        });
      }
      
      const statusIc = div.querySelector('.status-ic');
      const statusSb = div.querySelector('.status-sb');
      const statusEpf = div.querySelector('.status-epf');
      
      if (statusIc && data.s_ic) {
        statusIc.value = data.s_ic;
        if (data.s_ic === '✓') {
          statusIc.style.backgroundColor = '#dcfce7';
          statusIc.style.color = '#166534';
        } else if (data.s_ic === 'X') {
          statusIc.style.backgroundColor = '#fee2e2';
          statusIc.style.color = '#991b1b';
        }
      }
      if (statusSb && data.s_sb) {
        statusSb.value = data.s_sb;
        if (data.s_sb === '✓') {
          statusSb.style.backgroundColor = '#dcfce7';
          statusSb.style.color = '#166534';
        } else if (data.s_sb === 'X') {
          statusSb.style.backgroundColor = '#fee2e2';
          statusSb.style.color = '#991b1b';
        }
      }
      if (statusEpf && data.s_epf) {
        statusEpf.value = data.s_epf;
        if (data.s_epf === '✓') {
          statusEpf.style.backgroundColor = '#dcfce7';
          statusEpf.style.color = '#166534';
        } else if (data.s_epf === 'X') {
          statusEpf.style.backgroundColor = '#fee2e2';
          statusEpf.style.color = '#991b1b';
        }
      }
    }

    const deleteBtn = div.querySelector('.delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => { 
        div.remove(); 
        window.saveFormData();
      });
    }
  };

  // =========================================================================
  // YOUTUBE FUNCTIONS
  // =========================================================================

  async function performYoutubeSearch() {
      const youtubeSearchInput = document.getElementById('youtubeSearchInput');
      const query = youtubeSearchInput.value.trim().toLowerCase(); 
      if (!query || !window.currentUser || !window.currentUser.email) return;

      window.simulateLoadingWithSteps(['Mencari di YouTube...', 'Memuatkan video...'], 'Mencari Video');

      try {
          const cacheRef = window.dbFirestore.collection("users").doc(window.currentUser.email).collection("youtube_cache").doc(query);
          
          const cacheDoc = await cacheRef.get();
          if (cacheDoc.exists) {
              const cacheData = cacheDoc.data();
              const isFresh = (Date.now() - cacheData.timestamp) < (2 * 24 * 60 * 60 * 1000);
              
              if (isFresh && cacheData.results) {
                  console.log("Memuatkan hasil carian dari Cache Individu: " + window.currentUser.email);
                  window.hideLoading();
                  displayYoutubeResults(cacheData.results);
                  return; 
              }
          }

          const response = await window.fetchWithRetry(window.SCRIPT_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify({ action: 'searchYoutube', query: query })
          }, 3, 1000);

          const result = await response.json();
          window.hideLoading();

          if (result.success) {
              displayYoutubeResults(result.data);
              
              if (window.dbFirestore && result.data && result.data.length > 0) {
                  try {
                      await cacheRef.set({
                          results: result.data,
                          timestamp: Date.now(),
                          query: query,
                          userEmail: window.currentUser.email
                      });
                      console.log("Carian disimpan ke cache peribadi anda.");
                  } catch (saveErr) {
                      console.warn("Gagal menyimpan cache individu:", saveErr);
                  }
              }
          } else {
              window.CustomAppModal.alert("Gagal cari video: " + result.message, "Ralat", "error");
          }
      } catch (error) {
          window.hideLoading();
          window.CustomAppModal.alert("Ralat sistem: " + error.message, "Ralat", "error");
      }
  }

  function displayYoutubeResults(items) {
      const container = document.getElementById('youtubeResults');
      container.innerHTML = '';

      if (!items || items.length === 0) {
          container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #64748b;">Tiada video dijumpai.</div>';
          return;
      }

      items.forEach(item => {
          if (!item.id || !item.id.videoId) return;

          const card = document.createElement('div');
          card.style.cssText = "background: white; border: 1px solid #cbd5e1; border-radius: 10px; padding: 10px; cursor: pointer; transition: transform 0.2s;";
          card.onmouseover = () => { card.style.transform = 'scale(1.02)'; };
          card.onmouseout = () => { card.style.transform = 'scale(1)'; };
          
          card.innerHTML = `
              <img src="${item.snippet.thumbnails.medium.url}" style="width:100%; border-radius:8px; margin-bottom:10px; aspect-ratio: 16/9; object-fit: cover;">
              <h4 style="margin:0 0 5px 0; font-size:0.9rem; color:#1e40af;">${item.snippet.title}</h4>
              <p style="margin:0; font-size:0.75rem; color:#64748b;">👤 ${item.snippet.channelTitle}</p>
          `;

          card.onclick = () => {
              const pc = document.getElementById('youtubePlayerContainer');
              const mp = document.getElementById('youtubeMainPlayer');
              pc.style.display = 'block';
              
              mp.src = `https://www.youtube.com/embed/${item.id.videoId}?autoplay=1&list=RD${item.id.videoId}`;
              
              window.scrollTo({ top: pc.offsetTop - 50, behavior: 'smooth' });
          };
          
          container.appendChild(card);
      });
  }

  window.loadRecentYoutubeCache = async function() {
      if (!window.dbFirestore || !window.currentUser || !window.currentUser.email) return;
      
      try {
          const cacheSnapshot = await window.dbFirestore.collection("users")
              .doc(window.currentUser.email)
              .collection("youtube_cache")
              .orderBy("timestamp", "desc")
              .limit(1)
              .get();

          if (!cacheSnapshot.empty) {
              const cacheData = cacheSnapshot.docs[0].data();
              const isFresh = (Date.now() - cacheData.timestamp) < (2 * 24 * 60 * 60 * 1000); 
              
              if (isFresh && cacheData.results) {
                  console.log("Memuatkan carian terakhir anda (" + cacheData.query + ")");
                  
                  const searchInput = document.getElementById('youtubeSearchInput');
                  if (searchInput) {
                      searchInput.placeholder = "Carian terakhir anda: " + cacheData.query;
                  }
                  
                  displayYoutubeResults(cacheData.results);
              }
          }
      } catch (error) {
          console.warn("Gagal memuatkan cache individu:", error);
      }
  };

  // =========================================================================
  // QUEUE SPI MODAL
  // =========================================================================

  function populateQueueTable(tbodyId, dataArray) {
      const tbody = document.getElementById(tbodyId);
      if (!tbody) return;
      
      if (!dataArray || dataArray.length === 0) {
          tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:15px; color:#64748b;">✅ Tiada permohonan dalam queue ini</td></tr>`;
          return;
      }
      
      tbody.innerHTML = dataArray.map((item, index) => `
          <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="text-align:center;">${index + 1}</td>
              <td style="font-weight:bold; color: #1e293b;">${item.syarikat}</td>
              <td style="text-align:center; color: #475569;">${item.cidb}</td>
              <td style="text-align:center; font-size: 0.85rem;">${item.pengesyor}</td>
          </tr>
      `).join('');
  }

  // =========================================================================
  // EXCEL TAPISAN FUNCTIONS
  // =========================================================================

  window.renderExcelTable = function() {
      const tbody = document.getElementById('excelTableBody');
      const filtered = window.excelRawData.filter(d => window.selectedExcelDistricts.has(d.district));
      document.getElementById('excelRowCount').innerText = filtered.length;
      
      tbody.innerHTML = filtered.map(item => {
          let rowColorClass = '';
          const tLower = (item.updateType || '').toLowerCase();
          if(tLower.includes('baru')) rowColorClass = 'row-new';
          else if(tLower.includes('pembaharuan') || tLower.includes('renewal')) rowColorClass = 'row-renewal';
          else if(tLower.includes('maklumat') || tLower.includes('info')) rowColorClass = 'row-info';
          else if(tLower.includes('gred') || tLower.includes('grade')) rowColorClass = 'row-grade';

          const normExcelDate = window.normalizeDateToDBFormat(item.dateSubmitted);
          
          let isProcessed = false;
          let inDrafts = false;

          if (window.cachedData) {
              for (let c of window.cachedData) {
                  if (c.cidb === item.cidb && c.start_date === normExcelDate) {
                      if (c.tarikh_syor && c.tarikh_syor.trim() !== '') {
                          isProcessed = true;
                      } else {
                          inDrafts = true;
                      }
                      break;
                  }
              }
          }

          const inBasket = window.globalBakulData.some(b => b.cidb === item.cidb && window.normalizeDateToDBFormat(b.dateSubmitted) === normExcelDate);

          let statusBadge = '';
          let disableCheckbox = false;

          if (isProcessed) {
              statusBadge = `<span style="background: #10b981; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold;">✅ Telah Disyor</span>`;
              disableCheckbox = true;
          } else if (inDrafts) {
              statusBadge = `<span style="background: #3b82f6; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold;">📝 Belum Hantar</span>`;
              disableCheckbox = true;
          } else if (inBasket) {
              statusBadge = `<span style="background: #f59e0b; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold;">🛒 Dalam Bakul</span>`;
              disableCheckbox = true;
          } else {
              statusBadge = `<span style="background: #e2e8f0; color: #475569; padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold;">✨ Baru</span>`;
          }

          const checkboxHtml = disableCheckbox 
              ? `<input type="checkbox" disabled style="transform: scale(1.2); opacity: 0.3;" title="Telah ada dalam sistem/bakul">`
              : `<input type="checkbox" class="excel-row-check" value="${item.id}" style="transform: scale(1.2);">`;

          return `
          <tr class="${rowColorClass}" style="border-bottom: 1px solid #f1f5f9; ${disableCheckbox ? 'opacity: 0.6;' : ''}">
              <td style="text-align:center;">${checkboxHtml}</td>
              <td style="font-weight:bold; color: #1e293b;">${item.company}</td>
              <td style="color: #475569;">${item.cidb}</td>
              <td>${item.district}</td>
              <td style="font-weight:bold; color: #f59e0b;">${item.grade}</td>
              <td><span style="font-weight:600; color:#475569;">${item.dateSubmitted}</span></td>
              <td><span style="background: rgba(255,255,255,0.7); color: #333; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: bold; border: 1px solid #cbd5e1;">${item.updateType}</span></td>
              <td style="text-align:center;">${statusBadge}</td>
          </tr>
          `;
      }).join('');
  };

  // =========================================================================
  // INITIALIZATION
  // =========================================================================

  window.setupUserUI = function() {
    if (!window.currentUser || !appContainer || !userBadge) return;

    if (loginScreen) loginScreen.style.display = 'none';
    appContainer.style.display = 'block';
    
    if (anonymousBadge) anonymousBadge.style.display = 'none';
    
    userBadge.innerText = `👤 ${window.currentUser.name} (${window.currentUser.role})`;
    userBadge.title = "Buka Portal YouTube";
    userBadge.style.cursor = "pointer";
    userBadge.onclick = function() {
        if (window.lastActiveTab !== 'youtube') {
            window.tabSebelumYoutube = window.lastActiveTab; 
        }
        window.switchTab('youtube');
    };
    
    let themeColor = window.getUserColorHex(window.currentUser.color);
    
    document.documentElement.style.setProperty('--theme-color', themeColor);
    
    if (!window.isAppReady) {
      initAppBasedOnRole();
    }
    
    window.resetInactivityTimer();

    console.log("V6.5.2 Memuat turun senarai pelulus untuk notifikasi...");
    window.fetchWithRetry(window.SCRIPT_URL + '?action=getUsers&t=' + Date.now(), { 
        method: 'GET',
        redirect: 'follow'
    }, 3, 1000)
      .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
      })
      .then(users => {
        window.usersList = users;
        window.storageWrapper.set({ 'stb_users_cache': users });
        populateWhatsAppDropdown();
        console.log("V6.5.2 Senarai Pelulus berjaya dikemaskini:", users.length);
      })
      .catch(err => console.error("V6.5.2 Gagal muat turun senarai pengguna:", err));
  };

  async function initAppBasedOnRole() {
    if (!tabsContainer) return;

    tabsContainer.innerHTML = '';

    await loadPelulusState(); 
    if (window.currentUser.role === 'PENGESYOR' || window.currentUser.role === 'ADMIN') {
      await loadPengesyorState();
      loadFormData();
      setupAutoSaveListeners();
      setupDatabaseAutoSaveListeners();
      loadDatabaseFormData();
    }

    const searchState = await window.storageWrapper.get(['stb_search_state', 'stb_search_history_state']);
    const searchListInput = document.getElementById('searchListInput');
    const searchHistoryInput = document.getElementById('searchHistoryInput');
    
    if(searchState.stb_search_state && searchListInput) {
      try {
        searchListInput.value = searchState.stb_search_state;
      } catch (e) {
        console.log("V6.5.2 Error setting search input:", e);
      }
    }
    if(searchState.stb_search_history_state && searchHistoryInput) {
      try {
        searchHistoryInput.value = searchState.stb_search_history_state;
      } catch (e) {
        console.log("V6.5.2 Error setting history search input:", e);
      }
    }

    const storage = await window.storageWrapper.get(['stb_last_active_tab', 'stb_filter_pengesyor']);
    let activeTab = storage.stb_last_active_tab;
    
    const urlParams = getUrlParams();
    if (urlParams.tab) {
      activeTab = urlParams.tab;
      console.log("V6.5.2 Using tab from URL:", activeTab);
    }

    if (!activeTab) {
      if (window.currentUser.role === 'PENGESYOR') {
        activeTab = 'dashboard';
      } else if (window.currentUser.role === 'PELULUS') {
        activeTab = 'dashboard';
      } else if (window.currentUser.role === 'ADMIN') {
        activeTab = 'dashboard';
      } else if (window.currentUser.role === 'PENGARAH') {
        activeTab = 'admin-dashboard';
      } else if (window.currentUser.role === 'KETUA SEKSYEN') {
        activeTab = 'admin-dashboard';
      }
    }

    if (window.currentUser.role === 'PENGESYOR') {
      tabsContainer.innerHTML = `
        <button class="tab-btn" data-target="dashboard"><span class="tab-icon">📊</span><span class="tab-text">Dashboard</span></button>
        <button class="tab-btn" data-target="tab-tapisan"><span class="tab-icon">📄</span><span class="tab-text">Tapisan Excel</span></button>
        <button class="tab-btn" data-target="tab-bakul"><span class="tab-icon">🛒</span><span class="tab-text">Bakul Permohonan</span></button>
        <button class="tab-btn" data-target="stb"><span class="tab-icon">✓</span><span class="tab-text">Borang Semakan</span></button>
        <button class="tab-btn" data-target="db"><span class="tab-icon">📂</span><span class="tab-text">Input Database</span></button>
        <button class="tab-btn" data-target="drafts"><span class="tab-icon">📋</span><span class="tab-text">Belum Hantar</span></button>
        <button class="tab-btn" data-target="submitted"><span class="tab-icon">✅</span><span class="tab-text">Telah Disyor</span></button>
      `;
      
      const nameField = document.getElementById('db_pengesyor');
      if(nameField) {
        nameField.value = window.currentUser.name;
        nameField.readOnly = true;
      }
      
      if(!activeTab || !['dashboard','tab-tapisan','tab-bakul','stb','db','drafts','submitted', 'profile', 'youtube'].includes(activeTab)) {
        activeTab = 'dashboard';
      }

      window.switchTab(activeTab);

    } else if (window.currentUser.role === 'PELULUS') {
      tabsContainer.innerHTML = `
        <button class="tab-btn" data-target="dashboard"><span class="tab-icon">📊</span><span class="tab-text">Dashboard</span></button>
        <button class="tab-btn" data-target="inbox"><span class="tab-icon">📥</span><span class="tab-text">1. Inbox</span></button>
        <button class="tab-btn" data-target="pelulus-view"><span class="tab-icon">🔍</span><span class="tab-text">2. Semakan</span></button>
        <button class="tab-btn" data-target="pelulus-action"><span class="tab-icon">⚖️</span><span class="tab-text">3. Keputusan</span></button>
        <button class="tab-btn" data-target="history"><span class="tab-icon">📜</span><span class="tab-text">4. Sejarah</span></button>
      `;
      
      const pelulusNamaField = document.getElementById('pelulus_nama');
      if (pelulusNamaField) pelulusNamaField.value = window.currentUser.name;
      
      if(!activeTab || !['dashboard','inbox','pelulus-view','pelulus-action','history', 'youtube'].includes(activeTab)) {
        activeTab = 'dashboard';
      }
      
      if (window.pelulusActiveItem) {
        if (!activeTab || (activeTab !== 'pelulus-action' && activeTab !== 'pelulus-view')) {
          activeTab = 'pelulus-view';
        }
      } else {
        if(activeTab === 'pelulus-view' || activeTab === 'pelulus-action') {
          activeTab = 'dashboard';
        }
      }
      
      window.switchTab(activeTab);
      
    } else if (window.currentUser.role === 'ADMIN') {
      tabsContainer.innerHTML = `
        <button class="tab-btn" data-target="admin-dashboard"><span class="tab-icon">👑</span><span class="tab-text">Admin Dashboard</span></button>
      `;
      
      const nameField = document.getElementById('db_pengesyor');
      if(nameField) {
        nameField.value = window.currentUser.name;
        nameField.readOnly = true;
      }
      
      const pelulusNamaField = document.getElementById('pelulus_nama');
      if (pelulusNamaField) pelulusNamaField.value = window.currentUser.name;
      
      if(!activeTab || !['admin-dashboard', 'profile'].includes(activeTab)) {
        activeTab = 'admin-dashboard';
      }
      
      window.switchTab(activeTab);
      
    } else if (window.currentUser.role === 'PENGARAH' || window.currentUser.role === 'KETUA SEKSYEN') {
      tabsContainer.innerHTML = `
        <button class="tab-btn" data-target="admin-dashboard"><span class="tab-icon">👑</span><span class="tab-text">Admin Dashboard</span></button>
        <button class="tab-btn" data-target="inbox"><span class="tab-icon">📥</span><span class="tab-text">Belum Syor</span></button>
        <button class="tab-btn" data-target="submitted"><span class="tab-icon">✅</span><span class="tab-text">Telah Syor</span></button>
        <button class="tab-btn" data-target="history"><span class="tab-icon">📜</span><span class="tab-text">Sejarah</span></button>
      `;
      
      const nameField = document.getElementById('db_pengesyor');
      if(nameField) {
        nameField.value = window.currentUser.name;
        nameField.readOnly = true;
      }
      
      const pelulusNamaField = document.getElementById('pelulus_nama');
      if (pelulusNamaField) pelulusNamaField.value = window.currentUser.name;
      
      if(!activeTab || !['admin-dashboard','inbox','submitted','history'].includes(activeTab)) {
        activeTab = 'admin-dashboard';
      }
      
      window.switchTab(activeTab);
      
    } else if (window.CustomAppModal) {
      window.CustomAppModal.alert("Role pengguna tidak dikenali.", "Ralat", "error");
    } else {
      alert("Role pengguna tidak dikenali.");
    }

    if (tabsContainer) {
        let existingSlider = document.getElementById('tabSlider');
        if (!existingSlider) {
            const slider = document.createElement('div');
            slider.className = 'tab-slider';
            slider.id = 'tabSlider';
            tabsContainer.appendChild(slider);
        }
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        window.closeMobileMenu();
        window.switchTab(this.getAttribute('data-target')); 
      });
    });

    window.isAppReady = true; 
  }

  // =========================================================================
  // EXTENDED SWITCH TAB HANDLER
  // =========================================================================
  window.handleSwitchTabExtended = function(tabName) {
    if (window.currentUser.role === 'PENGESYOR' || window.currentUser.role === 'ADMIN' || window.currentUser.role === 'PENGARAH' || window.currentUser.role === 'KETUA SEKSYEN') {
      if (tabName === 'stb' && (window.currentUser.role === 'PENGESYOR' || window.currentUser.role === 'ADMIN')) {
        const tabChecker = document.getElementById('tab-checker');
        if (tabChecker) {
          tabChecker.style.display = 'block';
          tabChecker.classList.add('active');
        }
        
        setTimeout(() => {
          restoreFormState('stb');
          window.initializeTickButtons();
          window.restoreActiveElement();
        }, 200);
      }
      else if (tabName === 'db' && (window.currentUser.role === 'PENGESYOR' || window.currentUser.role === 'ADMIN')) {
        const tabDatabase = document.getElementById('tab-database');
        if (tabDatabase) {
          tabDatabase.style.display = 'block';
          tabDatabase.classList.add('active');
        }
        
        setTimeout(() => {
          restoreFormState('db');
          window.initializeTickButtons();
          window.restoreActiveElement();
        }, 200);
        
        if (driveSection) {
          driveSection.style.display = 'block';
          
          if (driveFolderInfo) {
            driveFolderInfo.style.display = 'block';
          }
          
          updateOpenDriveButton();
          
          if (window.driveFolderCreated && window.createdFolderUrl) {
            showDriveFolderLink(window.createdFolderUrl);
          }
        }
      }
      else if (tabName === 'drafts' && (window.currentUser.role === 'PENGESYOR' || window.currentUser.role === 'ADMIN')) {
        const tabList = document.getElementById('tab-list');
        if (tabList) {
          tabList.style.display = 'block';
          tabList.classList.add('active');
        }
        
        if (draftFiltersContainer) {
          draftFiltersContainer.style.display = 'flex';
        }
        
        window.fetchAndRenderList('drafts');
      }
      else if (tabName === 'submitted') {
        const tabList = document.getElementById('tab-list');
        if (tabList) {
          tabList.style.display = 'block';
          tabList.classList.add('active');
        }
        
        if (submittedFiltersContainer) {
          submittedFiltersContainer.style.display = 'flex';
        }
        
        if (window.currentUser.role === 'KETUA SEKSYEN') {
          if (filterSection) {
            filterSection.style.display = 'flex';
            updatePengesyorFilter();
          }
        }
        
        window.fetchAndRenderList('submitted');
      }
      else if (tabName === 'inbox') {
        const tabList = document.getElementById('tab-list');
        if (tabList) {
          tabList.style.display = 'block';
          tabList.classList.add('active');
        }
        
        if (filterSection) {
          filterSection.style.display = 'flex';
          updatePengesyorFilter();
        }
        
        window.fetchAndRenderList('inbox');
      }
      else if (tabName === 'history') {
        const tabHistory = document.getElementById('tab-history');
        if (tabHistory) {
          tabHistory.style.display = 'block';
          tabHistory.classList.add('active');
        }
        
        if (historyFiltersContainer) {
          historyFiltersContainer.style.display = 'flex';
        }
        if (pelulusFilterSection) {
          pelulusFilterSection.style.display = 'flex';
          updatePelulusFilter();
        }
        
        window.fetchAndRenderList('history');
      }
    } 
    else if (window.currentUser.role === 'PELULUS') {
      if (tabName === 'inbox') {
        const tabList = document.getElementById('tab-list');
        if (tabList) {
          tabList.style.display = 'block';
          tabList.classList.add('active');
        }
        
        if (filterSection) {
          filterSection.style.display = 'flex';
          updatePengesyorFilter();
        }
        
        window.fetchAndRenderList('inbox');
      }
      else if (tabName === 'pelulus-action') {
        if(!window.pelulusActiveItem) { 
          window.switchTab('inbox'); 
          return; 
        } 
        const tabPelulusAction = document.getElementById('tab-pelulus-action');
        if (tabPelulusAction) {
          tabPelulusAction.style.display = 'block';
          tabPelulusAction.classList.add('active');
        }
        
        const actionSummary = document.getElementById('pelulus_action_summary');
        if (actionSummary) actionSummary.innerText = window.pelulusActiveItem.syarikat; 
        
        setTimeout(() => {
          restoreFormState('pelulus-action');
          window.restoreActiveElement();
        }, 200);
      }
      else if (tabName === 'history') {
        const tabHistory = document.getElementById('tab-history');
        if (tabHistory) {
          tabHistory.style.display = 'block';
          tabHistory.classList.add('active');
        }
        
        if (historyFiltersContainer) {
          historyFiltersContainer.style.display = 'flex';
        }
        
        window.fetchAndRenderList('history');
      }
    }
  };

  // =========================================================================
  // AUTO-SAVE LISTENERS
  // =========================================================================
  function setupAutoSaveListeners() {
    const checkerTab = document.getElementById('tab-checker');
    if (checkerTab) {
      checkerTab.querySelectorAll('input, select, textarea').forEach(el => {
        if (el.id && !el.id.includes('print_') && !el.id.includes('pelulus_') && !el.id.includes('login')) {
          el.addEventListener('input', window.saveFormData);
          el.addEventListener('change', window.saveFormData);
        }
      });
    }

    document.querySelectorAll('input[name="jenisApp"]').forEach(radio => {
      radio.addEventListener('change', window.saveFormData);
    });

    document.querySelectorAll('.tick-btn').forEach(btn => {
      btn.addEventListener('click', window.saveFormData);
    });

    console.log('V6.5.2 Auto-save listeners initialized for checker tab');
  }

  function setupDatabaseAutoSaveListeners() {
    const databaseTab = document.getElementById('tab-database');
    if (databaseTab) {
      databaseTab.querySelectorAll('input, select, textarea').forEach(el => {
        if (el.id && !el.id.includes('print_') && !el.id.includes('pelulus_') && !el.id.includes('login')) {
          el.addEventListener('input', window.saveDatabaseFormData);
          el.addEventListener('change', window.saveDatabaseFormData);
        }
      });
    }

    const createDriveFolder = document.getElementById('cbCreateDriveFolder');
    if (createDriveFolder) {
      createDriveFolder.addEventListener('change', window.saveDatabaseFormData);
    }

    console.log('V6.5.2 Auto-save listeners initialized for database tab');
  }

  function savePengesyorState() {
    if (window.isRestoring || (window.currentUser && window.currentUser.role !== 'PENGESYOR' && window.currentUser.role !== 'ADMIN')) return;

    const formData = {};
    document.querySelectorAll('input, select, textarea').forEach(el => {
      if(el.id && !el.id.startsWith('pelulus_') && el.id !== 'searchListInput' && el.id !== 'searchHistoryInput' && !el.id.startsWith('login')) {
        if (el.type === 'text' || el.type === 'textarea') {
          if (el.id.includes('pautan') || el.id.includes('link')) {
            formData[el.id] = el.value;
          } else {
            formData[el.id] = el.value.toUpperCase();
          }
        } else {
          formData[el.id] = el.type === 'checkbox' ? el.checked : el.value;
        }
      }
    });

    const selectedRadio = document.querySelector('input[name="jenisApp"]:checked');
    if(selectedRadio) formData['jenisApp'] = selectedRadio.value;

    const personnel = [];
    document.querySelectorAll('.person-card').forEach(card => {
      const roles = [];
      card.querySelectorAll('.role-cb:checked').forEach(cb => roles.push(cb.value));
      personnel.push({
        name: card.querySelector('.p-name')?.value.toUpperCase() || '',
        isCompany: card.querySelector('.is-company')?.checked || false,
        roles: roles,
        s_ic: card.querySelector('.status-ic')?.value.toUpperCase() || '',
        s_sb: card.querySelector('.status-sb')?.value.toUpperCase() || '',
        s_epf: card.querySelector('.status-epf')?.value.toUpperCase() || ''
      });
    });
    formData.personnel = personnel;
    window.storageWrapper.set({ 'stb_form_data': formData });
  }

  async function loadPengesyorState() {
    window.isRestoring = true; 
    const stored = await window.storageWrapper.get(['stb_form_data']);
    const data = stored.stb_form_data;

    const personnelListEl = document.getElementById('personnelList');
    if (personnelListEl) personnelListEl.innerHTML = ''; 

    if(data) {
      for(const key in data) {
        if(key === 'personnel') continue;
        const el = document.getElementById(key);
        if(el) {
          if(el.type === 'checkbox') el.checked = data[key];
          else el.value = data[key];
        }
      }
      
      if(data.jenisApp) {
        const radio = document.querySelector(`input[name="jenisApp"][value="${data.jenisApp}"]`);
        if(radio) {
          radio.checked = true;
          radio.dispatchEvent(new Event('change'));
        }
      }

      if(data.personnel && data.personnel.length > 0) {
        data.personnel.forEach(p => window.addPerson(p));
      } else {
        window.addPerson();
      }
    } else {
      window.addPerson(); 
    }

    const syorVal = document.getElementById('db_syor')?.value;
    if (syorVal === 'YA' && dbPautanInput) {
      dbPautanInput.style.backgroundColor = '#fffbeb';
      dbPautanInput.style.borderColor = '#f59e0b';
      dbPautanInput.style.borderWidth = '2px';
    }

    updateOpenDriveButton();

    window.isRestoring = false;

    window.updateValidationCheckboxDisplay();
  }

  // =========================================================================
  // EVENT LISTENERS SETUP
  // =========================================================================

  function setupAllEventListeners() {
    // Focus tracking
    document.addEventListener('focusin', saveActiveElement);

    // User badge (no logout function here anymore)
    if (userBadge) {
      userBadge.title = "Profil Pengguna";
      userBadge.style.cursor = "default";
    }

    // db_syor change
    if(dbSyor) {
      dbSyor.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'YA' && dbPautanInput) {
          dbPautanInput.style.backgroundColor = '#fffbeb';
          dbPautanInput.style.borderColor = '#f59e0b';
          dbPautanInput.style.borderWidth = '2px';
        } else if (dbPautanInput) {
          dbPautanInput.style.backgroundColor = '';
          dbPautanInput.style.borderColor = '';
          dbPautanInput.style.borderWidth = '';
        }
        
        if(window.currentUser && (window.currentUser.role === 'PENGESYOR' || window.currentUser.role === 'ADMIN') && !window.isRestoring) {
          window.saveDatabaseFormData();
        }
      });
    }

    // Create Drive Folder checkbox
    if (cbCreateDriveFolder) {
      cbCreateDriveFolder.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        if (driveFolderInfo) {
          driveFolderInfo.style.display = isChecked ? 'block' : 'none';
        }
        if (btnCreateDriveFolder) {
          btnCreateDriveFolder.style.display = isChecked ? 'inline-block' : 'none';
        }
        
        if(window.currentUser && (window.currentUser.role === 'PENGESYOR' || window.currentUser.role === 'ADMIN') && !window.isRestoring) {
          window.saveDatabaseFormData();
        }
      });
    }

    // Create Drive Folder button
    if (btnCreateDriveFolder) {
      btnCreateDriveFolder.addEventListener('click', createDriveFolder);
    }

    // Open Drive Folder button
    if (btnOpenDriveFolder) {
      btnOpenDriveFolder.addEventListener('click', openDriveFolder);
    }

    // Open My Drive Folder button
    if (btnOpenMyDriveFolder) {
      btnOpenMyDriveFolder.addEventListener('click', () => {
        if (window.userFolderUrl) {
          window.open(window.userFolderUrl, '_blank');
        } else {
          window.CustomAppModal.alert("Folder user anda belum dicipta. Sila cipta folder untuk syarikat ini terlebih dahulu.", "Tiada Folder", "warning");
        }
      });
    }

    // Clear Filter button
    if (btnClearFilter) {
      btnClearFilter.addEventListener('click', () => {
        document.querySelectorAll('#pengesyorFilterButtonsContainer button').forEach(btn => {
          btn.style.backgroundColor = '#f3f4f6';
          btn.style.color = '#374151';
          btn.style.fontWeight = 'normal';
        });
        window.storageWrapper.set({ 'stb_filter_pengesyor': '' });
        renderFilteredList(window.activeListType);
      });
    }

    // List filters
    if (listFilterMonth) {
      listFilterMonth.addEventListener('change', () => {
        if (window.activeListType) {
          renderFilteredList(window.activeListType);
        }
      });
    }
    
    if (listFilterYear) {
      listFilterYear.addEventListener('change', () => {
        if (window.activeListType) {
          renderFilteredList(window.activeListType);
        }
      });
    }
    
    const historyMonthFilter = document.getElementById('historyMonthFilter');
    if (historyMonthFilter) {
      historyMonthFilter.addEventListener('change', () => {
        if (window.activeListType) renderFilteredList(window.activeListType);
      });
    }

    const historyYearFilter = document.getElementById('historyYearFilter');
    if (historyYearFilter) {
      historyYearFilter.addEventListener('change', () => {
        if (window.activeListType) renderFilteredList(window.activeListType);
      });
    }

    const btnRefreshHistory = document.getElementById('btnRefreshHistory');
    if (btnRefreshHistory) {
      btnRefreshHistory.addEventListener('click', () => {
        window.fetchAndRenderList('history');
      });
    }
    
    // Draft filters
    if (draftFiltersContainer && !draftFiltersContainer.hasAttribute('data-listener')) {
        draftFiltersContainer.setAttribute('data-listener', 'true');
        draftFiltersContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn || !btn.id.startsWith('filterBtn')) return;
            
            let filterVal = '';
            if (btn.id === 'filterBtnBaru') filterVal = 'BARU';
            else if (btn.id === 'filterBtnPembaharuan') filterVal = 'PEMBAHARUAN';
            else if (btn.id === 'filterBtnUbahMaklumat') filterVal = 'UBAH MAKLUMAT';
            else if (btn.id === 'filterBtnUbahGred') filterVal = 'UBAH GRED';
            else if (btn.id === 'filterBtnSpi') filterVal = 'SPI';
            else if (btn.id === 'filterBtnAll') filterVal = 'ALL';
            
            if (filterVal) {
                if (filterVal === 'ALL') {
                    window.currentDraftFilter = 'ALL';
                } else {
                    window.currentDraftFilter = (window.currentDraftFilter === filterVal) ? 'ALL' : filterVal;
                }
                
                updateDraftFilterButtons();
                
                if (window.activeListType) {
                    renderFilteredList(window.activeListType);
                }
                
                window.storageWrapper.set({ 'stb_current_draft_filter': window.currentDraftFilter });
            }
        });
    }
    
    // Submitted filters
    if (submittedFiltersContainer && !submittedFiltersContainer.hasAttribute('data-listener')) {
      submittedFiltersContainer.setAttribute('data-listener', 'true');
      submittedFiltersContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn || !btn.id.startsWith('filterSubmitted')) return;
        
        const isStatusBtn = ['filterSubmittedAll', 'filterSubmittedLulus', 'filterSubmittedTolak', 'filterSubmittedPending'].includes(btn.id);
        const isJenisBtn = ['filterSubmittedJenisBaru', 'filterSubmittedJenisPembaharuan', 'filterSubmittedJenisUbahMaklumat', 'filterSubmittedJenisUbahGred'].includes(btn.id);
        
        if (isStatusBtn) {
          if (btn.id === 'filterSubmittedAll') {
            window.currentSubmittedStatusFilter = 'ALL';
          } else if (btn.id === 'filterSubmittedLulus') {
            window.currentSubmittedStatusFilter = (window.currentSubmittedStatusFilter === 'LULUS') ? 'ALL' : 'LULUS';
          } else if (btn.id === 'filterSubmittedTolak') {
            window.currentSubmittedStatusFilter = (window.currentSubmittedStatusFilter === 'TOLAK') ? 'ALL' : 'TOLAK';
          } else if (btn.id === 'filterSubmittedPending') {
            window.currentSubmittedStatusFilter = (window.currentSubmittedStatusFilter === 'PENDING') ? 'ALL' : 'PENDING';
          }
        } else if (isJenisBtn) {
          if (btn.id === 'filterSubmittedJenisBaru') {
            window.currentSubmittedJenisFilter = (window.currentSubmittedJenisFilter === 'BARU') ? 'ALL' : 'BARU';
          } else if (btn.id === 'filterSubmittedJenisPembaharuan') {
            window.currentSubmittedJenisFilter = (window.currentSubmittedJenisFilter === 'PEMBAHARUAN') ? 'ALL' : 'PEMBAHARUAN';
          } else if (btn.id === 'filterSubmittedJenisUbahMaklumat') {
            window.currentSubmittedJenisFilter = (window.currentSubmittedJenisFilter === 'UBAH MAKLUMAT') ? 'ALL' : 'UBAH MAKLUMAT';
          } else if (btn.id === 'filterSubmittedJenisUbahGred') {
            window.currentSubmittedJenisFilter = (window.currentSubmittedJenisFilter === 'UBAH GRED') ? 'ALL' : 'UBAH GRED';
          }
        }
        
        updateSubmittedFilterButtons();
        
        if (window.activeListType === 'submitted') {
          renderFilteredList('submitted');
        }
        
        window.storageWrapper.set({ 
          'stb_current_submitted_status_filter': window.currentSubmittedStatusFilter,
          'stb_current_submitted_jenis_filter': window.currentSubmittedJenisFilter
        });
      });
    }
    
    // History filters
    if (historyFiltersContainer && !historyFiltersContainer.hasAttribute('data-listener')) {
      historyFiltersContainer.setAttribute('data-listener', 'true');
      historyFiltersContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn || !btn.id.startsWith('filterHistory')) return;
        
        const isStatusBtn = ['filterHistoryAll', 'filterHistoryStatusAll', 'filterHistoryStatusLulus', 'filterHistoryStatusTolak', 'filterHistoryStatusPending'].includes(btn.id);
        const isJenisBtn = ['filterHistoryJenisBaru', 'filterHistoryJenisPembaharuan', 'filterHistoryJenisUbahMaklumat', 'filterHistoryJenisUbahGred'].includes(btn.id);
        
        if (isStatusBtn) {
          if (btn.id === 'filterHistoryStatusAll' || btn.id === 'filterHistoryAll') {
            window.currentHistoryStatusFilter = 'ALL';
          } else if (btn.id === 'filterHistoryStatusLulus') {
            window.currentHistoryStatusFilter = (window.currentHistoryStatusFilter === 'LULUS') ? 'ALL' : 'LULUS';
          } else if (btn.id === 'filterHistoryStatusTolak') {
            window.currentHistoryStatusFilter = (window.currentHistoryStatusFilter === 'TOLAK') ? 'ALL' : 'TOLAK';
          } else if (btn.id === 'filterHistoryStatusPending') {
            window.currentHistoryStatusFilter = (window.currentHistoryStatusFilter === 'PENDING') ? 'ALL' : 'PENDING';
          }
        } else if (isJenisBtn) {
          if (btn.id === 'filterHistoryJenisBaru') {
            window.currentHistoryJenisFilter = (window.currentHistoryJenisFilter === 'BARU') ? 'ALL' : 'BARU';
          } else if (btn.id === 'filterHistoryJenisPembaharuan') {
            window.currentHistoryJenisFilter = (window.currentHistoryJenisFilter === 'PEMBAHARUAN') ? 'ALL' : 'PEMBAHARUAN';
          } else if (btn.id === 'filterHistoryJenisUbahMaklumat') {
            window.currentHistoryJenisFilter = (window.currentHistoryJenisFilter === 'UBAH MAKLUMAT') ? 'ALL' : 'UBAH MAKLUMAT';
          } else if (btn.id === 'filterHistoryJenisUbahGred') {
            window.currentHistoryJenisFilter = (window.currentHistoryJenisFilter === 'UBAH GRED') ? 'ALL' : 'UBAH GRED';
          }
        }
        
        updateHistoryFilterButtons();
        
        if (window.activeListType === 'history') {
          renderFilteredList('history');
        }
        
        window.storageWrapper.set({ 
          'stb_current_history_status_filter': window.currentHistoryStatusFilter,
          'stb_current_history_jenis_filter': window.currentHistoryJenisFilter
        });
      });
    }

    // db_jenis change
    const dbJenisSelect = document.getElementById('db_jenis');
    if (dbJenisSelect) {
      dbJenisSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        const dbPerubahanContainer = document.getElementById('db_perubahan_container');
        const dbPerubahanLabel = document.getElementById('db_perubahan_label');
        const dbPerubahanInput = document.getElementById('db_perubahan_input');
        
        if (!dbPerubahanContainer || !dbPerubahanLabel || !dbPerubahanInput) return;

        if (val === 'UBAH MAKLUMAT') {
          dbPerubahanContainer.style.display = 'block';
          dbPerubahanLabel.textContent = 'Nyatakan Perubahan Maklumat:';
          const ubahMaklumatValue = document.getElementById('input_ubah_maklumat')?.value || '';
          dbPerubahanInput.value = ubahMaklumatValue;
        } else if (val === 'UBAH GRED') {
          dbPerubahanContainer.style.display = 'block';
          dbPerubahanLabel.textContent = 'Nyatakan Perubahan Gred:';
          const ubahGredValue = document.getElementById('input_ubah_gred')?.value || '';
          dbPerubahanInput.value = ubahGredValue;
        } else {
          dbPerubahanContainer.style.display = 'none';
          dbPerubahanInput.value = '';
        }
        
        window.saveDatabaseFormData();
      });
    }

    // Radio inputs
    document.querySelectorAll('input[name="jenisApp"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const val = e.target.value;
        const ubahMaklumatInput = document.getElementById('input_ubah_maklumat');
        const ubahGredInput = document.getElementById('input_ubah_gred');
        if (ubahMaklumatInput) ubahMaklumatInput.style.display = (val === 'ubah_maklumat') ? 'block' : 'none';
        if (ubahGredInput) ubahGredInput.style.display = (val === 'ubah_gred') ? 'block' : 'none';
        window.saveFormData();
      });
    });

    // Pelulus tukar syor
    if (pelulusTukarSyor) {
      pelulusTukarSyor.addEventListener('change', (e) => {
        const val = e.target.value;
        
        if (divPelulusJustifikasi) {
          divPelulusJustifikasi.style.display = (val === 'YA' || val === 'PEMUTIHAN') ? 'block' : 'none';
        }
        
        if (divPelulusDateSpi) {
          divPelulusDateSpi.style.display = (val === 'YA') ? 'block' : 'none';
        }
      });
    }

    // Lawatan checkbox
    if (cbSelesaiLawatan) {
      cbSelesaiLawatan.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        if (containerLawatan) {
          containerLawatan.style.display = isChecked ? 'block' : 'none';
        }
        
        if (!isChecked) {
          if (dbLawatanTarikh) dbLawatanTarikh.value = '';
          if (dbLawatanSubmitSptb) dbLawatanSubmitSptb.value = '';
          if (dbLawatanSyor) dbLawatanSyor.value = '';
        }
      });
    }

    // WhatsApp notification checkbox
    if (cbNotifyWhatsapp) {
      cbNotifyWhatsapp.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        if (pelulusWhatsappContainer) {
          pelulusWhatsappContainer.style.display = isChecked ? 'block' : 'none';
        }
        if (!isChecked && dbPelulusWhatsapp) {
          dbPelulusWhatsapp.value = '';
        }
      });
    }

    // Sah Syor checkbox
    if (dbSahSyor) {
      dbSahSyor.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        
        if (labelNotifyWhatsapp) {
          labelNotifyWhatsapp.style.display = isChecked ? 'block' : 'none';
        }
        
        if (!isChecked) {
          if (cbNotifyWhatsapp) {
            cbNotifyWhatsapp.checked = false;
          }
          if (pelulusWhatsappContainer) {
            pelulusWhatsappContainer.style.display = 'none';
          }
          if (dbPelulusWhatsapp) {
            dbPelulusWhatsapp.value = '';
          }
        }
      });
    }

    // Search inputs
    let searchTimeoutList;
    const searchInput = document.getElementById('searchListInput');
    if(searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeoutList);
        searchTimeoutList = setTimeout(() => {
            const val = e.target.value;
            window.storageWrapper.set({ 'stb_search_state': val }); 
            if(window.activeListType) renderFilteredList(window.activeListType);
        }, 350);
      });
    }

    let searchTimeoutHistory;
    const searchHistoryInput = document.getElementById('searchHistoryInput');
    if(searchHistoryInput) {
      searchHistoryInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeoutHistory);
        searchTimeoutHistory = setTimeout(() => {
            const val = e.target.value;
            window.storageWrapper.set({ 'stb_search_history_state': val }); 
            if(window.activeListType) renderFilteredList(window.activeListType);
        }, 350);
      });
    }

    // Buttons
    if(triggerPrintBtn) {
      triggerPrintBtn.addEventListener('click', async () => {
        preparePrintView();
        
        const dbPautanValue = document.getElementById('db_pautan')?.value || '';
        const isDriveAlreadyCreated = window.driveFolderCreated === true || (dbPautanValue && dbPautanValue.trim() !== '');
        
        if (isDriveAlreadyCreated) {
          window.print();
          window.hasPrinted = true;
          window.storageWrapper.set({ 'stb_has_printed': true });
          if (btnSyncToDb) {
            btnSyncToDb.style.display = 'inline-block';
          }
          await window.CustomAppModal.alert("Cetakan biasa. Folder Drive telah pun dicipta sebelum ini.", "Info Cetakan", "info");
          return;
        }
        
        const userConfirmed = await window.CustomAppModal.confirm(
            "Adakah anda pasti ingin mencetak dan menyimpan borang ini ke Google Drive?",
            "Cetak & Simpan",
            "info",
            "Ya, Teruskan",
            false
        );
        
        if (!userConfirmed) {
          window.print();
          window.hasPrinted = true;
          window.storageWrapper.set({ 'stb_has_printed': true });
          if (btnSyncToDb) {
            btnSyncToDb.style.display = 'inline-block';
          }
          await window.CustomAppModal.alert("Borang telah dicetak. Butang 'Simpan & Ke Input Database' kini tersedia.", "Info", "success");
          return;
        }
        
        const companyName = document.getElementById('borang_syarikat')?.value.trim();
        if (!companyName) {
          await window.CustomAppModal.alert("Sila isi Nama Syarikat terlebih dahulu sebelum mencetak dan menyimpan ke Drive.", "Maklumat Tidak Lengkap", "warning");
          return;
        }
        
        const applicationTypeRadio = document.querySelector('input[name="jenisApp"]:checked');
        let applicationType = '';
        if (applicationTypeRadio) {
          if (applicationTypeRadio.value === 'baru') applicationType = 'BARU';
          else if (applicationTypeRadio.value === 'pembaharuan') applicationType = 'PEMBAHARUAN';
          else if (applicationTypeRadio.value === 'ubah_maklumat') applicationType = 'UBAH MAKLUMAT';
          else if (applicationTypeRadio.value === 'ubah_gred') applicationType = 'UBAH GRED';
        }
        
        if (!applicationType) {
          await window.CustomAppModal.alert("Sila pilih Jenis Permohonan terlebih dahulu.", "Maklumat Tidak Lengkap", "warning");
          return;
        }
        
        const tarikhMohon = document.getElementById('borang_tarikh_mohon')?.value;
        if (!tarikhMohon) {
          await window.CustomAppModal.alert("Sila isi Tarikh Mohon terlebih dahulu.", "Maklumat Tidak Lengkap", "warning");
          return;
        }
        
        const userName = window.currentUser.name;
        const now = new Date();
        const currentMonth = now.toLocaleString('ms-MY', { month: 'long' });
        const currentYear = now.getFullYear();
        const monthYearFolder = `${currentMonth.toUpperCase()} ${currentYear}`;
        
        let formattedDate = '';
        try {
          const tarikhDate = new Date(tarikhMohon);
          formattedDate = tarikhDate.toLocaleDateString('ms-MY', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
        } catch (e) {
          formattedDate = tarikhMohon;
        }
        
        const ubahMaklumatVal = document.getElementById('input_ubah_maklumat')?.value || '';
        const ubahGredVal = document.getElementById('input_ubah_gred')?.value || '';
        let specificType = '';
        if (applicationType === 'UBAH MAKLUMAT' && ubahMaklumatVal) specificType = ` (${ubahMaklumatVal})`;
        if (applicationType === 'UBAH GRED' && ubahGredVal) specificType = ` (${ubahGredVal})`;
        
        const subfolderName = `${applicationType}${specificType} - ${formattedDate}`;
        
        const printLayoutElement = document.getElementById('printLayout');
        if (!printLayoutElement) {
          await window.CustomAppModal.alert("Ralat: Elemen cetakan tidak ditemui.", "Ralat Sistem", "error");
          return;
        }
        
        const userColorHex = window.getUserColorHex(window.currentUser.color);
        const pdfCss = generatePdfCssString(userColorHex);
        const printHTML = `<style>${pdfCss}</style>${printLayoutElement.outerHTML}`;
        
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
          loadingOverlay.style.display = 'flex';
          const loadingTextEl = document.getElementById('loading-text');
          if (loadingTextEl) loadingTextEl.textContent = 'Menyimpan ke Drive';
          
          const progressBar = document.getElementById('loading-progress-bar');
          const progressPercent = document.getElementById('loading-progress-percent');
          const progressLabel = document.getElementById('loading-progress-label');
          
          if (progressBar) { progressBar.style.display = 'block'; progressBar.style.width = '0%'; }
          if (progressPercent) progressPercent.textContent = '0%';
          if (progressLabel) progressLabel.textContent = 'Menyediakan dokumen PDF...';
          
          let currentProgress = 0;
          if (window.loadingProgressInterval) clearInterval(window.loadingProgressInterval);
          
          window.loadingProgressInterval = setInterval(() => {
            if (currentProgress < 90) {
              currentProgress += Math.floor(Math.random() * 5) + 1;
              if (currentProgress > 90) currentProgress = 90;
              if (progressBar) progressBar.style.width = `${currentProgress}%`;
              if (progressPercent) progressPercent.textContent = `${currentProgress}%`;
              if (progressLabel) progressLabel.textContent = currentProgress < 30 ? 'Menyediakan dokumen PDF...' : currentProgress < 60 ? 'Mencipta folder di Google Drive...' : 'Menyimpan fail...';
            }
          }, 200);
        }
        
        if (printLayoutElement) printLayoutElement.style.display = 'none';
        
        const payload = {
          action: 'cetak_dan_simpan_pdf',
          company_name: companyName,
          application_type: subfolderName,
          month_year: monthYearFolder,
          user_name: userName,
          user_color: userColorHex,
          main_folder_id: window.mainFolderId,
          htmlContent: printHTML,
          email: window.currentUser ? window.currentUser.email : ''
        };
        
        try {
          const response = await window.fetchWithRetry(window.SCRIPT_URL, {
            method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload)
          }, 3, 1000);
          
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const result = await response.json();
          
          if (window.loadingProgressInterval) clearInterval(window.loadingProgressInterval);
          const progressBar = document.getElementById('loading-progress-bar');
          const progressPercent = document.getElementById('loading-progress-percent');
          const progressLabel = document.getElementById('loading-progress-label');
          
          if (progressBar) progressBar.style.width = '100%';
          if (progressPercent) progressPercent.textContent = '100%';
          if (progressLabel) progressLabel.textContent = 'Selesai!';
          
          if (result.success) {
            await window.playSuccessSound();
            const folderUrl = result.folder_url;
            const dbPautanField = document.getElementById('db_pautan');
            if (dbPautanField) dbPautanField.value = folderUrl;
            
            window.driveFolderCreated = true;
            window.createdFolderUrl = folderUrl;
            window.userFolderUrl = result.user_folder_url || '';
            
            if (cbCreateDriveFolder) cbCreateDriveFolder.checked = false;
            
            await window.storageWrapper.set({ 'stb_drive_folder_url': folderUrl, 'stb_user_folder_url': window.userFolderUrl });
            updateOpenDriveButton();
            
            setTimeout(async () => {
              if (loadingOverlay) loadingOverlay.style.display = 'none';
              if (printLayoutElement) printLayoutElement.style.display = '';
              
              window.print();
              window.hasPrinted = true;
              window.storageWrapper.set({ 'stb_has_printed': true });
              if (btnSyncToDb) btnSyncToDb.style.display = 'inline-block';
              if (driveResult && folderUrl) showDriveFolderLink(folderUrl, window.userFolderUrl);
              
              await window.CustomAppModal.alert("Borang telah dicetak dan fail PDF berjaya disimpan di Drive!<br><br>Pautan folder telah dimasukkan secara automatik ke Input Database.", "Berjaya Disimpan", "success");
            }, 500);
            
          } else {
            throw new Error(result.message || 'Gagal menyimpan ke Drive');
          }
        } catch (error) {
          console.error("V6.5.2 Print & Drive save error:", error);
          await window.playErrorSound();
          if (window.loadingProgressInterval) clearInterval(window.loadingProgressInterval);
          if (loadingOverlay) loadingOverlay.style.display = 'none';
          if (printLayoutElement) printLayoutElement.style.display = '';
          
          await window.CustomAppModal.alert(`Gagal menyimpan ke Drive: ${error.message}<br><br>Cetakan akan diteruskan tanpa simpanan Drive.`, "Ralat Drive", "error");
          
          window.print();
          window.hasPrinted = true;
          window.storageWrapper.set({ 'stb_has_printed': true });
          if (btnSyncToDb) btnSyncToDb.style.display = 'inline-block';
        }
      });
    }

    // Sync to DB button
    if(btnSyncToDb) {
      btnSyncToDb.addEventListener('click', () => {
        const syarikat = document.getElementById('borang_syarikat')?.value || '';
        const cidb = document.getElementById('borang_cidb')?.value || '';
        const tMohon = document.getElementById('borang_tarikh_mohon')?.value || '';
        const tatatertib = document.getElementById('borang_tatatertib')?.value || '';
        const gred = document.getElementById('borang_gred')?.value || '';
        const justifikasi = document.getElementById('borang_justifikasi')?.value || '';
        
        const dbSyarikat = document.getElementById('db_syarikat');
        const dbCidb = document.getElementById('db_cidb');
        const dbStartDate = document.getElementById('db_start_date');
        const dbTatatertib = document.getElementById('db_tatatertib');
        const dbGred = document.getElementById('db_gred');
        const dbJustifikasi = document.getElementById('db_justifikasi');
        
        if (dbSyarikat) dbSyarikat.value = syarikat;
        if (dbCidb) dbCidb.value = cidb;
        if (dbStartDate) dbStartDate.value = tMohon; 
        if (dbTatatertib) dbTatatertib.value = tatatertib;
        if (dbGred) dbGred.value = gred;
        if (dbJustifikasi) dbJustifikasi.value = justifikasi;

        const selectedType = document.querySelector('input[name="jenisApp"]:checked')?.value;
        if(selectedType) {
          const dropdown = document.getElementById('db_jenis');
          let dbVal = "";

          if(selectedType === 'baru') dbVal = "BARU";
          if(selectedType === 'pembaharuan') dbVal = "PEMBAHARUAN";
          if(selectedType === 'ubah_maklumat') dbVal = "UBAH MAKLUMAT";
          if(selectedType === 'ubah_gred') dbVal = "UBAH GRED";
          if(dbVal && dropdown) dropdown.value = dbVal;
          
          const dbPerubahanInput = document.getElementById('db_perubahan_input');
          if (dbPerubahanInput) {
            if (selectedType === 'ubah_maklumat') {
              const ubahMaklumatValue = document.getElementById('input_ubah_maklumat')?.value || '';
              dbPerubahanInput.value = ubahMaklumatValue;
            } else if (selectedType === 'ubah_gred') {
              const ubahGredValue = document.getElementById('input_ubah_gred')?.value || '';
              dbPerubahanInput.value = ubahGredValue;
            }
          }
        }

        window.saveDatabaseFormData();
        window.switchTab('db');
      });
    }

    // Back buttons
    const btnBackToForm = document.getElementById('btnBackToForm');
    if(btnBackToForm) {
      btnBackToForm.addEventListener('click', () => {
        window.switchTab('stb');
      });
    }

    const btnViewBack = document.getElementById('btnViewBack');
    if(btnViewBack) {
      btnViewBack.addEventListener('click', () => {
        if (window.currentUser.role === 'PENGESYOR') {
          window.switchTab('submitted');
        } else if (window.currentUser.role === 'ADMIN' || window.currentUser.role === 'KETUA SEKSYEN' || window.currentUser.role === 'PENGARAH') {
          window.switchTab('inbox');
        } else {
          if (window.pelulusActiveItem && window.pelulusActiveItem.tarikh_lulus) {
            window.switchTab('history');
          } else {
            window.switchTab('inbox');
          }
        }
      });
    }

    // Navigation buttons
    const btnToForm = document.getElementById('btnToForm');
    if(btnToForm) btnToForm.addEventListener('click', () => window.switchTab('stb'));

    const btnToApproval = document.getElementById('btnToApproval');
    if(btnToApproval) btnToApproval.addEventListener('click', () => window.switchTab('pelulus-action'));

    const btnPelulusBack = document.getElementById('btnPelulusBack');
    if(btnPelulusBack) btnPelulusBack.addEventListener('click', () => window.switchTab('pelulus-view'));

    // Refresh list button
    const btnRefreshList = document.getElementById('btnRefreshList');
    if(btnRefreshList) btnRefreshList.addEventListener('click', () => {
      if (window.currentUser.role === 'PENGESYOR') {
        window.fetchAndRenderList('drafts');
      } else {
        window.fetchAndRenderList('inbox');
      }
    });

    // Full view buttons
    if(openFullBtn) {
      openFullBtn.addEventListener('click', () => { 
        window.saveFormData();
        if (window.lastActiveTab) {
          window.saveFormState(window.lastActiveTab);
        }
        
        const fullViewUrl = 'index.html?view=full';
        window.open(fullViewUrl, '_blank'); 
      });
    }
    if(openFullBtnPelulus) {
      openFullBtnPelulus.addEventListener('click', () => { 
        savePelulusState();
        
        const fullViewUrl = 'index.html?view=full';
        window.open(fullViewUrl, '_blank'); 
      });
    }
    
    if(btnAdminFullView) {
      btnAdminFullView.addEventListener('click', () => {
        const fullViewUrl = 'index.html?view=full';
        window.open(fullViewUrl, '_blank');
      });
    }
    
    // Logout button
    const btnLogoutTop = document.getElementById('btnLogoutTop');
    if (btnLogoutTop) {
      btnLogoutTop.addEventListener('click', async () => {
        const isConfirmed = await window.CustomAppModal.confirm(
            "Adakah anda pasti mahu log keluar dari sistem?", 
            "Log Keluar", 
            "warning", 
            "Ya, Log Keluar", 
            true
        );

        if(isConfirmed) {
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
        }
      });
    }

    // Reset buttons
    const btnResetTab1 = document.getElementById('btnResetTab1');
    if(btnResetTab1) btnResetTab1.addEventListener('click', async () => {
      const isReset = await window.CustomAppModal.confirm("Anda pasti mahu set semula (reset) semua maklumat dalam borang ini?", "Reset Borang", "warning", "Ya, Reset", true);
      if(isReset) await resetForm();
    });
    
    const btnResetTab2 = document.getElementById('btnResetTab2');
    if(btnResetTab2) btnResetTab2.addEventListener('click', async () => {
      const isReset = await window.CustomAppModal.confirm("Anda pasti mahu set semula (reset) semua maklumat dalam borang ini?", "Reset Borang", "warning", "Ya, Reset", true);
      if(isReset) await resetForm();
    });

    async function resetForm() {
      await window.storageWrapper.remove([
        'stb_form_data', 
        'stb_form_states', 
        'stb_has_printed', 
        'stb_drive_folder_url', 
        'stb_user_folder_url', 
        'stb_extracted_pdf_data',
        'stb_form_persistence',
        'stb_database_persistence'
      ]);

      document.querySelectorAll('input, select').forEach(el => {
        if (el.id !== 'db_pengesyor' && el.id !== 'pelulus_nama' && !el.id.startsWith('login')) {
          if(el.type === 'checkbox' || el.type === 'radio') el.checked = false;
          else el.value = '';
        }
      });

      if (dbPautanInput) {
        dbPautanInput.style.backgroundColor = '';
        dbPautanInput.style.borderColor = '';
        dbPautanInput.style.borderWidth = '';
      }

      if (btnSyncToDb) {
        btnSyncToDb.style.display = 'none';
      }

      window.hasPrinted = false;
      window.driveFolderCreated = false;
      window.createdFolderUrl = '';
      window.userFolderUrl = '';
      
      window.extractedPdfData = null;

      const ubahMaklumatInput = document.getElementById('input_ubah_maklumat');
      const ubahGredInput = document.getElementById('input_ubah_gred');
      if (ubahMaklumatInput) ubahMaklumatInput.style.display = 'none';
      if (ubahGredInput) ubahGredInput.style.display = 'none';

      const personnelListEl = document.getElementById('personnelList');
      if (personnelListEl) personnelListEl.innerHTML = '';

      if (driveResult) driveResult.innerHTML = '';
      if (driveStatus) {
        driveStatus.style.display = 'none';
      }

      window.clearPdfData();

      updateOpenDriveButton();

      window.addPerson();
      window.CustomAppModal.alert("Borang telah diset semula.", "Selesai", "success");

      window.updateValidationCheckboxDisplay();
    }

    // Send to sheet button
    const btnSendDb = document.getElementById('btnSendToSheet');
    if (btnSendDb) {
      btnSendDb.addEventListener('click', async () => {
        
        const isConfirmedAct = await window.CustomAppModal.confirm(
            "Adakah anda pasti mahu menghantar dan menyimpan data permohonan ini?", 
            "Hantar Data", 
            "info", 
            "Hantar & Simpan", 
            false
        );
        if(!isConfirmedAct) return;
        
        let targetRow = document.getElementById('db_row_index')?.value || '';
        let isGapFill = false;

        if (!targetRow && window.cachedData && window.cachedData.length > 0) {
          const gapItem = window.cachedData.find(item => (!item.syarikat || item.syarikat.toString().trim() === ""));
          if (gapItem && gapItem.row) {
            targetRow = gapItem.row;
            isGapFill = true;
          }
        }

        const isConfirmed = dbSahSyor ? dbSahSyor.checked : false;
        
        const isLawatanSelesai = cbSelesaiLawatan ? cbSelesaiLawatan.checked : false;
        const lawatanTarikh = isLawatanSelesai && dbLawatanTarikh ? dbLawatanTarikh.value : '';
        const lawatanSubmitSptb = isLawatanSelesai && dbLawatanSubmitSptb ? dbLawatanSubmitSptb.value : '';
        const lawatanSyor = isLawatanSelesai && dbLawatanSyor ? dbLawatanSyor.value : '';
        
        const dbSyorValue = document.getElementById('db_syor')?.value || '';
        const dbSubmitDateValue = document.getElementById('db_submit_date')?.value || '';
        const dbSyorStatusValue = document.getElementById('db_syor_status')?.value || '';
        
        const dbStatusHantarSpi = document.getElementById('db_status_hantar_spi')?.value || '';
        
        let confirmHantarEmel = false;
        
        if (dbSyorValue === 'YA' && dbSubmitDateValue && dbSubmitDateValue.trim() !== '') {
          const hasSyorAndConfirmed = (dbSyorStatusValue.trim() !== '') && isConfirmed;
          const isTelahDihantar = (dbStatusHantarSpi === 'TELAH DIHANTAR' || dbStatusHantarSpi === 'DALAM QUEUE');
          
          if (!hasSyorAndConfirmed && !isTelahDihantar) {
            confirmHantarEmel = await window.CustomAppModal.confirm(
                "Adakah anda ingin hantar emel syarikat ini ke SPI?",
                "Hantar Emel SPI",
                "info",
                "Ya, Hantar",
                false
            );
          }
        }
        
        let jenisKonsultansiParts = [];
        const konsultansiTypes = ['emel', 'whatsapp', 'call'];
        const namaLabel = { 'emel': 'Emel', 'whatsapp': 'WhatsApp', 'call': 'Call' };
        konsultansiTypes.forEach(type => {
          const cb = document.getElementById(`cb_konsultansi_${type}`);
          const dateInput = document.getElementById(`date_konsultansi_${type}`);
          if (cb && cb.checked && dateInput && dateInput.value) {
            const formattedDate = formatDateDisplay(dateInput.value);
            jenisKonsultansiParts.push(`${namaLabel[type]}, ${formattedDate}`);
          }
        });
        const jenisKonsultansiString = jenisKonsultansiParts.join(' - ');
        
        const dbJenisValue = document.getElementById('db_jenis')?.value || '';
        let ubahMaklumatVal = '';
        let ubahGredVal = '';
        const dbPerubahanInputVal = document.getElementById('db_perubahan_input')?.value || '';
        
        if (dbJenisValue === 'UBAH MAKLUMAT') {
          ubahMaklumatVal = dbPerubahanInputVal;
        } else if (dbJenisValue === 'UBAH GRED') {
          ubahGredVal = dbPerubahanInputVal;
        }
        
        const payload = {
          row: targetRow,
          syarikat: document.getElementById('db_syarikat')?.value || '',
          cidb: document.getElementById('db_cidb')?.value || '',
          gred: document.getElementById('db_gred')?.value || '',
          jenis: dbJenisValue,
          negeri: document.getElementById('db_negeri')?.value || '',
          tarikh_surat_terdahulu: document.getElementById('db_tarikh_surat')?.value || '',
          start_date: document.getElementById('db_start_date')?.value || '',
          tatatertib: document.getElementById('db_tatatertib')?.value || '',
          syor_lawatan: dbSyorValue,
          date_submit: dbSubmitDateValue,
          pautan: document.getElementById('db_pautan')?.value || '',
          justifikasi: document.getElementById('db_justifikasi')?.value || '',
          pengesyor: document.getElementById('db_pengesyor')?.value || '',
          createFolder: document.getElementById('cbCreateDriveFolder')?.checked || false,
          lawatan_tarikh: lawatanTarikh,
          lawatan_submit_sptb: lawatanSubmitSptb,
          lawatan_syor: lawatanSyor,
          alamat_perniagaan: document.getElementById('db_alamat_perniagaan')?.value || '',
          jenis_konsultansi: jenisKonsultansiString,
          hantar_emel_spi: confirmHantarEmel,
          ubah_maklumat: ubahMaklumatVal,
          ubah_gred: ubahGredVal,
          email: window.currentUser ? window.currentUser.email : ''
        };
        
        if (isConfirmed) {
          payload.syor_status = document.getElementById('db_syor_status')?.value || 'SOKONG';
          payload.tarikh_syor = new Date().toISOString().split('T')[0];
        } else {
          payload.syor_status = '';
          payload.tarikh_syor = '';
        }
        
        const loadingOverlayLocal = document.getElementById('loading-overlay');
        if (loadingOverlayLocal) {
          loadingOverlayLocal.style.display = 'flex';
          const loadingTextEl = document.getElementById('loading-text');
          if (loadingTextEl) loadingTextEl.textContent = 'Menghantar data...';
        }

        submitData(payload, "Rekod berjaya disimpan!", async (result) => {
          const message = isConfirmed ? 
            "Data BERJAYA dihantar ke pangkalan data dan telah dipindahkan ke 'Telah Syor'." : 
            "Data BERJAYA disimpan sebagai DRAFT (Belum Syor).";
          
          await window.playSuccessSound();
          
          const isNotifyWhatsapp = cbNotifyWhatsapp ? cbNotifyWhatsapp.checked : false;
          const selectedPelulus = dbPelulusWhatsapp ? dbPelulusWhatsapp.value : '';
          
          let whatsappUrl = null;
          if (isConfirmed && isNotifyWhatsapp && selectedPelulus.trim() !== '') {
              whatsappUrl = sendWhatsAppNotification(payload.syarikat, payload.cidb, payload.jenis, payload.syor_status, payload.tarikh_syor, selectedPelulus);
          }
          
          if (whatsappUrl) {
              const isWaConfirmed = await window.CustomAppModal.confirm(
                  message + "<br><br>Adakah anda ingin buka dan hantar notifikasi WhatsApp sekarang?",
                  "Hantar WhatsApp",
                  "success",
                  "Ya, Hantar",
                  false
              );
              if (isWaConfirmed) {
                  window.open(whatsappUrl, '_blank');
              }
          } else {
              await window.CustomAppModal.alert(message, "Selesai", "success");
          }
          
          await resetFormAfterSubmit();
          
          window.fetchAndRenderList('drafts');
          
          if (loadingOverlayLocal) {
            loadingOverlayLocal.style.display = 'none';
          }
        });
      });
    }

    // Pelulus submit button
    const btnPelulusSubmit = document.getElementById('btnPelulusSubmit');
    if (btnPelulusSubmit) {
      btnPelulusSubmit.addEventListener('click', async () => {
        if (pelulusSahLulus && !pelulusSahLulus.checked) {
          await window.CustomAppModal.alert("Sila tandakan kotak pengesahan!", "Pengesahan Diperlukan", "warning");
          return;
        }
        
        if(!window.pelulusActiveItem) return;
        
        const tukarSyor = pelulusTukarSyor?.value || '';
        const justifikasiPelulus = pelulusJustifikasi?.value || '';
        const dateSpiPelulus = pelulusDateSpi?.value || '';
        const keputusan = document.getElementById('pelulus_keputusan')?.value || '';
        
        if (tukarSyor === 'YA' && dateSpiPelulus === '') {
          await window.CustomAppModal.alert("Sila masukkan Date Submit to SPI jika Syor Lawatan ditukar kepada YA.", "Maklumat Diperlukan", "warning");
          return;
        }
        
        const isConfirmed = await window.CustomAppModal.confirm(
            "Adakah anda pasti dengan keputusan ini?",
            "Sahkan Keputusan",
            "info",
            "Ya, Sahkan",
            false
        );
        if(!isConfirmed) return;

        let confirmSpiPemutihan = false;
        if (tukarSyor === 'PEMUTIHAN' || window.pelulusActiveItem.syor_lawatan === 'PEMUTIHAN') {
          if (keputusan) {
            confirmSpiPemutihan = await window.CustomAppModal.confirm(
                "Adakah anda pasti ingin hantar permohonan ini ke SPI?",
                "Pengesahan Hantar SPI",
                "warning",
                "Ya, Hantar",
                false
            );
          }
        }

        const payload = {
          row: window.pelulusActiveItem.row || '',
          kelulusan: keputusan,
          alasan: document.getElementById('pelulus_alasan')?.value || '',
          tarikh_lulus: new Date().toISOString().split('T')[0],
          pelulus: window.currentUser.name || '',
          syor_lawatan_baru: tukarSyor,
          justifikasi_baru: justifikasiPelulus,
          date_submit_baru: dateSpiPelulus,
          hantar_emel_spi_pemutihan: confirmSpiPemutihan,
          email: window.currentUser ? window.currentUser.email : ''
        };
        
        submitData(payload, "Keputusan berjaya dihantar!", async (result) => {
          await window.playSuccessSound();
          
          await window.CustomAppModal.alert("Keputusan pelulus BERJAYA direkodkan.", "Selesai", "success");
          
          if (result.status === 'success') {
            await window.playSuccessSound();
          }
          
          if (window.cachedData && window.cachedData.length > 0) {
            const index = window.cachedData.findIndex(d => d.row === window.pelulusActiveItem.row);
            if (index !== -1) {
              window.cachedData[index].kelulusan = payload.kelulusan;
              window.cachedData[index].alasan = payload.alasan;
              window.cachedData[index].tarikh_lulus = payload.tarikh_lulus;
              window.cachedData[index].pelulus = payload.pelulus;
            }
          }
          
          await window.storageWrapper.remove([
            'stb_pelulus_state', 
            'stb_drive_folder_url', 
            'stb_user_folder_url'
          ]);
          
          window.switchTab('inbox');
        });
      });
    }

    // Add person button
    const addPersonBtn = document.getElementById('addPersonBtn');
    if(addPersonBtn) {
      addPersonBtn.addEventListener('click', () => { 
        window.addPerson(); 
        window.saveFormData();
      });
    }

    // Konsultansi checkboxes
    document.querySelectorAll('.konsultansi-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const dateInput = document.getElementById(e.target.id.replace('cb_', 'date_'));
        if (dateInput) {
          if (e.target.checked) {
            dateInput.style.display = 'block';
            if (!dateInput.value) {
              const today = new Date();
              const year = today.getFullYear();
              const month = String(today.getMonth() + 1).padStart(2, '0');
              const day = String(today.getDate()).padStart(2, '0');
              dateInput.value = `${year}-${month}-${day}`;
            }
          } else {
            dateInput.style.display = 'none';
            dateInput.value = '';
          }
        }
        window.saveDatabaseFormData();
      });
    });

    // Toggle Alamat button
    const btnToggleAlamat = document.getElementById('btnToggleAlamat');
    if (btnToggleAlamat) {
      btnToggleAlamat.addEventListener('click', () => {
        const dbAlamatPerniagaan = document.getElementById('db_alamat_perniagaan');
        if (dbAlamatPerniagaan) {
          if (dbAlamatPerniagaan.style.display === 'none') {
            dbAlamatPerniagaan.style.display = 'block';
            btnToggleAlamat.textContent = 'Sembunyi Alamat';
          } else {
            dbAlamatPerniagaan.style.display = 'none';
            btnToggleAlamat.textContent = 'Tunjuk Alamat';
          }
        }
      });
    }

    // Admin buttons
    if (btnPrintAdminStats) {
      btnPrintAdminStats.addEventListener('click', () => {
        showAdminStatsModal();
      });
    }
    
    if (adminStatsClose) {
      adminStatsClose.addEventListener('click', () => {
        adminStatsModal.classList.remove('active');
      });
    }
    
    if (btnPrintStatsModal) {
      btnPrintStatsModal.addEventListener('click', () => {
        window.print();
      });
    }
    
    if (btnAdminCsv) {
      btnAdminCsv.addEventListener('click', downloadAdminStatsCSV);
    }
    
    if (adminFilterMonth) {
      adminFilterMonth.addEventListener('change', () => {
        loadAdminDashboard();
      });
    }
    
    if (adminFilterYear) {
      adminFilterYear.addEventListener('change', () => {
        loadAdminDashboard();
      });
    }
    
    if (adminStatsModal) {
      adminStatsModal.addEventListener('click', (e) => {
        if (e.target === adminStatsModal) {
          adminStatsModal.classList.remove('active');
        }
      });
    }

    // db_syor_status change
    const dbSyorStatus = document.getElementById('db_syor_status');
    if (dbSyorStatus) {
      dbSyorStatus.addEventListener('change', (e) => {
        const val = e.target.value;
        if (labelDbSahSyor) {
          if (val !== '') {
            labelDbSahSyor.style.display = 'block';
          } else {
            labelDbSahSyor.style.display = 'none';
            if (dbSahSyor) dbSahSyor.checked = false;
          }
        }
      });
    }

    // Pelulus keputusan change
    const pelKeputusan = document.getElementById('pelulus_keputusan');
    if(pelKeputusan) {
      pelKeputusan.addEventListener('change', (e) => {
        const val = e.target.value;
        const divAlasan = document.getElementById('div_alasan');
        const alasanSelect = document.getElementById('pelulus_alasan');
        
        if(divAlasan) {
          divAlasan.style.display = (val.includes('TOLAK') || val === 'SIASAT') ? 'block' : 'none';
        }
        
        if(alasanSelect && (val.includes('LULUS') || val === '')) {
          alasanSelect.value = '';
          savePelulusState();
        }

        if (labelPelulusSahLulus) {
          if (val !== '') {
            labelPelulusSahLulus.style.display = 'block';
          } else {
            labelPelulusSahLulus.style.display = 'none';
            if (pelulusSahLulus) pelulusSahLulus.checked = false;
          }
        }
      });
    }

    // Pelulus state save
    ['pelulus_keputusan', 'pelulus_alasan'].forEach(id => {
      const el = document.getElementById(id);
      if(el) {
        el.addEventListener('input', savePelulusState);
        el.addEventListener('change', savePelulusState);
      }
    });

    // Go to profile button
    const btnPergiCiptaProfile = document.getElementById('btnPergiCiptaProfile');
    if (btnPergiCiptaProfile) {
      btnPergiCiptaProfile.addEventListener('click', () => {
        console.log("V6.5.2 btnPergiCiptaProfile clicked - Navigating to Profile tab and copying Drive link");
        
        const dbPautanValue = document.getElementById('db_pautan')?.value || '';
        
        window.switchTab('profile');
        
        if (dbPautanValue && dbPautanValue.trim() !== '') {
          const profilePautanDriveField = document.getElementById('profile_pautan_drive');
          if (profilePautanDriveField) {
            profilePautanDriveField.value = dbPautanValue;
            console.log("V6.5.2 Drive link copied to profile form:", dbPautanValue);
            
            const successMsg = document.createElement('div');
            successMsg.textContent = '✓ Pautan Drive telah disalin ke borang Profile';
            successMsg.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#10b981; color:white; padding:8px 16px; border-radius:8px; z-index:10000; font-size:0.9rem;';
            document.body.appendChild(successMsg);
            setTimeout(() => successMsg.remove(), 2000);
          }
        } else {
          console.log("V6.5.2 No Drive link found in Input Database tab");
          const warningMsg = document.createElement('div');
          warningMsg.textContent = '⚠ Tiada pautan Drive di Input Database untuk disalin';
          warningMsg.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#f59e0b; color:white; padding:8px 16px; border-radius:8px; z-index:10000; font-size:0.9rem;';
          document.body.appendChild(warningMsg);
          setTimeout(() => warningMsg.remove(), 2000);
        }
      });
    }

    // Download dashboard CSV button
    const btnDownloadDashboardCsv = document.getElementById('btnDashboardCsv');
    if (btnDownloadDashboardCsv) {
      btnDownloadDashboardCsv.addEventListener('click', downloadDashboardCSV);
    }

    // Back to DB from Profile button
    const btnKembaliDbDariProfile = document.getElementById('btnKembaliDbDariProfile');
    if (btnKembaliDbDariProfile) {
        btnKembaliDbDariProfile.addEventListener('click', () => {
            window.switchTab('db');
        });
    }

    // YouTube close button
    const btnTutupYoutube = document.getElementById('btnTutupYoutube');
    if (btnTutupYoutube) {
        btnTutupYoutube.addEventListener('click', () => {
            let tabUtama = window.tabSebelumYoutube;
            if (!tabUtama) {
                tabUtama = ['ADMIN', 'PENGARAH', 'KETUA SEKSYEN'].includes(window.currentUser.role) ? 'admin-dashboard' : 'dashboard';
            }
            window.switchTab(tabUtama);
        });
    }

    // YouTube search
    const btnSearchYoutube = document.getElementById('btnSearchYoutube');
    const youtubeSearchInput = document.getElementById('youtubeSearchInput');
    if (btnSearchYoutube) btnSearchYoutube.addEventListener('click', performYoutubeSearch);
    if (youtubeSearchInput) {
        youtubeSearchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performYoutubeSearch(); });
    }

    // Queue SPI Modal
    const btnQueueSPI = document.getElementById('btnQueueSPI');
    const queueSpiModal = document.getElementById('queueSpiModal');
    const queueSpiClose = document.getElementById('queueSpiClose');
    
    if (btnQueueSPI) {
        btnQueueSPI.addEventListener('click', async () => {
            
            window.simulateLoadingWithSteps(
                ['Menyambung ke pelayan...', 'Menyemak Queue Siasatan Biasa...', 'Menyemak Queue Pemutihan...', 'Menyediakan paparan...'],
                'Mendapatkan senarai queue SPI'
            );
            
            try {
                const userEmail = window.currentUser ? encodeURIComponent(window.currentUser.email) : '';
                const response = await window.fetchWithRetry(window.SCRIPT_URL + `?action=getQueueData&email=${userEmail}&t=` + Date.now(), { method: 'GET' }, 3, 1000);
                const result = await response.json();
                
                const progressBar = document.getElementById('loading-progress-bar');
                const progressPercent = document.getElementById('loading-progress-percent');
                const progressLabel = document.getElementById('loading-progress-label');
                
                if (progressBar) progressBar.style.width = '100%';
                if (progressPercent) progressPercent.textContent = '100%';
                if (progressLabel) progressLabel.textContent = 'Selesai!';
                
                setTimeout(async () => {
                    window.hideLoading();
                    
                    if (result.status === 'success') {
                        populateQueueTable('tbodyQueueSiasat', result.siasat);
                        populateQueueTable('tbodyQueuePemutihan', result.pemutihan);
                        
                        queueSpiModal.classList.add('show');
                        queueSpiModal.style.display = 'flex';
                        
                        await window.playSuccessSound();
                        
                    } else {
                        window.CustomAppModal.alert('Gagal mendapatkan senarai queue.', 'Ralat', 'error');
                    }
                }, 500);
                
            } catch (error) {
                window.hideLoading();
                window.CustomAppModal.alert('Gagal mendapatkan senarai queue: ' + error.message, 'Ralat', 'error');
            }
        });
    }
    
    if (queueSpiClose) {
        queueSpiClose.addEventListener('click', () => {
            queueSpiModal.classList.remove('show');
            setTimeout(() => queueSpiModal.style.display = 'none', 300);
        });
    }

    const btnTutupQueueSPI = document.getElementById('btnTutupQueueSPI');
    if (btnTutupQueueSPI) {
        btnTutupQueueSPI.addEventListener('click', () => {
            queueSpiModal.classList.remove('show');
            setTimeout(() => queueSpiModal.style.display = 'none', 300);
        });
    }

    // Bakul event delegation
    const bakulTableBody = document.getElementById('bakulTableBody');
    if (bakulTableBody && !bakulTableBody.hasAttribute('data-listener-bakul')) {
        bakulTableBody.setAttribute('data-listener-bakul', 'true');
        bakulTableBody.addEventListener('click', async (e) => {
            const prosesBtn = e.target.closest('.btn-proses-bakul');
            const padamBtn = e.target.closest('.btn-padam-bakul');

            if (padamBtn) {
                const docId = padamBtn.getAttribute('data-id');
                
                const isPadam = await window.CustomAppModal.confirm(
                    "Adakah anda pasti mahu memadam permohonan ini dari bakul? Ia akan dipadam selamanya.", 
                    "Padam Dari Bakul", 
                    "warning", 
                    "Ya, Padam", 
                    true
                );
                
                if(isPadam) {
                    try {
                        await window.dbFirestore.collection("applications").doc(docId).delete();
                        window.playSoundEffect('positive_chime.mp3');
                    } catch(err) {
                        console.error("Gagal padam:", err);
                        window.CustomAppModal.alert("Gagal memadam permohonan dari bakul Firebase.", "Ralat", "error");
                    }
                }
            } else if (prosesBtn) {
                window.playSoundEffect('ui_click.mp3');
                const docId = prosesBtn.getAttribute('data-id');
                const company = prosesBtn.getAttribute('data-company');
                const cidb = prosesBtn.getAttribute('data-cidb');
                const grade = prosesBtn.getAttribute('data-grade');
                const type = prosesBtn.getAttribute('data-type');
                const dateSubmitted = prosesBtn.getAttribute('data-date');

                const hasUnsaved = checkUnsavedData();
                if (hasUnsaved) {
                    const isConfirmedOverwrite = await window.CustomAppModal.confirm(
                        "Borang semakan anda sekarang mempunyai data. Anda pasti mahu overwrite (timpa) borang ini?",
                        "Data Belum Disimpan",
                        "warning",
                        "Ya, Timpa",
                        true
                    );
                    if (!isConfirmedOverwrite) {
                        return;
                    }
                    await resetFormForEdit();
                }

                document.getElementById('borang_syarikat').value = company;
                document.getElementById('borang_cidb').value = cidb;
                const gredSelect = document.getElementById('borang_gred');
                if(gredSelect) {
                    for(let i=0; i<gredSelect.options.length; i++) {
                        if(gredSelect.options[i].value === grade.toUpperCase()) gredSelect.selectedIndex = i;
                    }
                }
                
                const tLower = type.toLowerCase();
                let radioVal = 'baru';
                if(tLower.includes('pembaharuan') || tLower.includes('renewal')) radioVal = 'pembaharuan';
                else if(tLower.includes('maklumat') || tLower.includes('info')) radioVal = 'ubah_maklumat';
                else if(tLower.includes('gred') || tLower.includes('grade')) radioVal = 'ubah_gred';
                
                const radios = document.getElementsByName('jenisApp');
                for(let r of radios) {
                    r.checked = (r.value === radioVal);
                }

                if(radioVal === 'ubah_maklumat') {
                    document.getElementById('input_ubah_maklumat').style.display = 'block';
                    let specInfo = type;
                    if (type.includes('(')) specInfo = type.split('(')[1].replace(')', '').trim();
                    document.getElementById('input_ubah_maklumat').value = specInfo;
                }
                if(radioVal === 'ubah_gred') {
                    document.getElementById('input_ubah_gred').style.display = 'block';
                    let specInfo = type;
                    if (type.includes('(')) specInfo = type.split('(')[1].replace(')', '').trim();
                    document.getElementById('input_ubah_gred').value = specInfo;
                }

                if (dateSubmitted && dateSubmitted !== '-') {
                    const parts = dateSubmitted.split('/');
                    if (parts.length === 3) {
                        const formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                        const bTarikh = document.getElementById('borang_tarikh_mohon');
                        const dbTarikh = document.getElementById('db_start_date');
                        if(bTarikh) bTarikh.value = formattedDate;
                        if(dbTarikh) dbTarikh.value = formattedDate;
                    }
                }

                document.getElementById('db_syarikat').value = company;
                document.getElementById('db_cidb').value = cidb;
                const dbGredSelect = document.getElementById('db_gred');
                if(dbGredSelect) {
                    for(let i=0; i<dbGredSelect.options.length; i++) {
                        if(dbGredSelect.options[i].value === grade.toUpperCase()) dbGredSelect.selectedIndex = i;
                    }
                }

                try {
                    await window.dbFirestore.collection("applications").doc(docId).update({
                        status: 'Processed',
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } catch(err) {
                    console.error("Gagal update status bakul:", err);
                }

                window.saveFormData();
                window.saveDatabaseFormData();

                window.switchTab('stb');
                
                await window.CustomAppModal.alert("Maklumat Syarikat dari Bakul telah diisi secara automatik ke dalam Borang Semakan!", "Berjaya Dipindahkan", "success");
            }
        });
    }

    // Excel file input
    document.addEventListener('change', (e) => {
        if (e.target.id === 'excelFileInput') {
            
            if (window.currentUser && window.currentUser.role === 'PENGESYOR' && !window.firebaseUserRules) {
                window.CustomAppModal.alert("⏳ Sistem sedang mendapatkan peraturan tapisan peribadi anda. Sila tunggu 2-3 saat dan klik 'Pilih Fail Excel' sekali lagi.", "Tunggu Sebentar", "warning");
                e.target.value = ''; 
                return;
            }

            const file = e.target.files[0];
            if (!file) return;
            
            const nameLabel = document.getElementById('excelFileName');
            if (nameLabel) nameLabel.innerText = file.name;
            
            window.simulateLoadingWithSteps(['Membaca fail Excel...', 'Menapis data berdasarkan ketetapan anda...'], 'Sila Tunggu');
            
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const data = new Uint8Array(evt.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
                    processExcelForTapisan(jsonData);
                } catch (error) {
                    window.CustomAppModal.alert("Ralat membaca fail Excel. Pastikan ia format .xlsx yang betul.", "Ralat Format", "error");
                } finally {
                    window.hideLoading();
                    e.target.value = ''; 
                }
            };
            reader.readAsArrayBuffer(file);
        }
        
        if (e.target.id === 'selectAllExcelRows') {
            document.querySelectorAll('.excel-row-check:not(:disabled)').forEach(cb => cb.checked = e.target.checked);
        }
    });

    function processExcelForTapisan(rawData) {
        if (rawData.length < 2) return;
        const headers = rawData[0].map(h => String(h).toLowerCase().trim());
        
        const keys = {
            company: headers.findIndex(h => h.includes('syarikat') || h.includes('company') || h.includes('nama')),
            grade: headers.findIndex(h => h.includes('gred') || h.includes('grade')),
            cidb: headers.findIndex(h => h.includes('cidb') || h.includes('reg') || h.includes('pendaftar')),
            district: headers.findIndex(h => h.includes('daerah') || h.includes('district') || h.includes('negeri') || h.includes('disctrict')),
            date: headers.findIndex(h => h.includes('tarikh') || h.includes('date') || h.includes('submitted')),
            updateType: headers.findIndex(h => h.includes('update type') || h === 'update type' || h.includes('jenis perubahan'))
        };

        if (keys.company === -1 || keys.grade === -1 || keys.cidb === -1) {
            window.CustomAppModal.alert("Format Excel tidak sah. Mesti ada kolum Syarikat, Gred, dan Reg. No/CIDB.", "Ralat Format", "error");
            return;
        }

        const gradeRegex = /^G[4-7]/i;
        const numberMap = {'0':'K', '1':'S', '2':'D', '3':'T', '4':'E', '5':'L', '6':'E', '7':'T', '8':'L', '9':'S'};

        window.excelRawData = rawData.slice(1).filter(row => {
            const g = String(row[keys.grade] || '').trim();
            if (!gradeRegex.test(g)) return false; 
            
            if (window.currentUser && window.currentUser.role === 'PENGESYOR') {
                if (!window.firebaseUserRules || !window.firebaseUserRules.cidbEndsWith || window.firebaseUserRules.cidbEndsWith.length === 0) {
                    return false; 
                }

                const cidbStr = String(row[keys.cidb] || '').trim();
                const lastDigit = cidbStr.slice(-1);
                
                if (!window.firebaseUserRules.cidbEndsWith.includes(lastDigit)) return false;
                
                if (window.firebaseUserRules.alphaSplit && window.firebaseUserRules.alphaSplit[lastDigit]) {
                    const [start, end] = window.firebaseUserRules.alphaSplit[lastDigit].split('-');
                    let first = String(row[keys.company] || '').trim().toUpperCase().charAt(0);
                    if (/[0-9]/.test(first)) first = numberMap[first] || first;
                    if (first < start || first > end) return false;
                }
            }
            
            return true; 
            
        }).map((row, idx) => {
            let dateStr = '-';
            let rawSortDate = new Date(1970, 0, 1);
            if (row[keys.date]) {
                if (typeof row[keys.date] === 'number') {
                    rawSortDate = new Date(Math.round((row[keys.date] - 25569) * 86400 * 1000));
                    dateStr = rawSortDate.toLocaleDateString('en-GB');
                } else {
                    dateStr = String(row[keys.date]);
                    const parts = dateStr.split('/');
                    if(parts.length === 3) rawSortDate = new Date(parts[2], parts[1]-1, parts[0]);
                }
            }
            return {
                id: idx,
                company: String(row[keys.company] || '-').trim().toUpperCase(),
                cidb: String(row[keys.cidb] || '-').trim(),
                district: keys.district !== -1 ? String(row[keys.district] || '-').trim().toUpperCase() : '-',
                grade: String(row[keys.grade] || '-').trim().toUpperCase(),
                dateSubmitted: dateStr,
                rawSortDate: rawSortDate,
                updateType: keys.updateType !== -1 && row[keys.updateType] ? String(row[keys.updateType]).trim() : '-'
            };
        });

        window.allExcelDistricts = [...new Set(window.excelRawData.map(d => d.district))].filter(d => d && d !== '-').sort();
        window.selectedExcelDistricts = new Set(window.allExcelDistricts);
        
        renderExcelDistrictButtons();
        window.renderExcelTable();
        
        document.getElementById('districtFilterContainer').style.display = 'block';
        document.getElementById('excelResultsContainer').style.display = 'block';
    }

    function renderExcelDistrictButtons() {
        const container = document.getElementById('districtGrid');
        if(!container) return;
        container.innerHTML = '';
        
        window.allExcelDistricts.forEach(d => {
            const isActive = window.selectedExcelDistricts.has(d);
            const btn = document.createElement('button');
            
            btn.style.padding = '10px 20px'; 
            btn.style.borderRadius = '8px';
            btn.style.fontWeight = 'bold';
            btn.style.fontSize = '0.95rem';
            btn.style.border = 'none';
            btn.style.cursor = 'pointer';
            btn.style.transition = 'all 0.2s ease';
            
            if(isActive) {
                btn.style.backgroundColor = 'var(--theme-color)';
                btn.style.color = 'white';
                btn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            } else {
                btn.style.backgroundColor = '#e2e8f0';
                btn.style.color = '#475569';
                btn.style.boxShadow = 'none';
            }
            
            btn.innerText = d;
            
            btn.onmouseover = () => {
                if (!isActive) btn.style.backgroundColor = '#cbd5e1';
            };
            btn.onmouseout = () => {
                if (!isActive) btn.style.backgroundColor = '#e2e8f0';
            };

            btn.onclick = () => {
                if (window.selectedExcelDistricts.has(d)) window.selectedExcelDistricts.delete(d);
                else window.selectedExcelDistricts.add(d);
                renderExcelDistrictButtons();
                window.renderExcelTable();
            };
            container.appendChild(btn);
        });
    }

    const btnSelectAllDistricts = document.getElementById('btnSelectAllDistricts');
    if(btnSelectAllDistricts){
      btnSelectAllDistricts.addEventListener('click', () => {
          if (window.selectedExcelDistricts.size === window.allExcelDistricts.length) {
              window.selectedExcelDistricts.clear();
              btnSelectAllDistricts.innerText = "Pilih Semua";
          } else {
              window.selectedExcelDistricts = new Set(window.allExcelDistricts);
              btnSelectAllDistricts.innerText = "✓ Kosongkan";
          }
          renderExcelDistrictButtons();
          window.renderExcelTable();
      });
    }

    // Save to basket button
    const btnSaveToBasket = document.getElementById('btnSaveToBasket');
    const typeModalBakul = document.getElementById('type-modal-bakul');
    const btnCancelBakulModal = document.getElementById('btnCancelBakulModal');
    const btnConfirmBakulModal = document.getElementById('btnConfirmBakulModal');

    if (btnSaveToBasket) {
        btnSaveToBasket.addEventListener('click', async () => {
            if (!window.currentUserFirebaseCode) {
                await window.CustomAppModal.alert("Akaun anda tiada kod tapisan dikesan. Anda tidak boleh menyimpan ke bakul.", "Akses Ditolak", "error");
                return;
            }
            const checked = document.querySelectorAll('.excel-row-check:checked');
            if (checked.length === 0) {
                await window.CustomAppModal.alert("Sila tick kotak permohonan yang ingin disimpan terlebih dahulu.", "Pilih Permohonan", "warning");
                return;
            }
            
            document.getElementById('modal-bakul-count').innerText = checked.length;
            if (typeModalBakul) typeModalBakul.style.display = 'flex';
        });
    }

    if (btnCancelBakulModal) {
        btnCancelBakulModal.addEventListener('click', () => {
            if (typeModalBakul) typeModalBakul.style.display = 'none';
        });
    }

    if (btnConfirmBakulModal) {
        btnConfirmBakulModal.addEventListener('click', async () => {
            const checked = document.querySelectorAll('.excel-row-check:checked');
            const selectedType = document.getElementById('modal-bakul-type-select').value;
            
            btnConfirmBakulModal.innerText = "Menyimpan...";
            btnConfirmBakulModal.disabled = true;

            const idMap = new Map(window.excelRawData.map(i => [i.id, i]));
            const batch = [];
            
            checked.forEach(cb => {
                const item = idMap.get(parseInt(cb.value));
                if(item) {
                    let typeToSave = selectedType;
                    if (item.updateType && item.updateType !== '-') {
                        typeToSave = `${selectedType} (${item.updateType})`;
                    }
                    
                    batch.push(window.dbFirestore.collection("applications").add({
                        company: item.company,
                        cidb: item.cidb,
                        grade: item.grade,
                        district: item.district,
                        type: typeToSave,
                        dateSubmitted: item.dateSubmitted,
                        sortableDate: firebase.firestore.Timestamp.fromDate(item.rawSortDate),
                        status: 'Pending',
                        processedBy: window.currentUserFirebaseCode,
                        processorName: window.currentUser.name,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        addedToBasketAt: firebase.firestore.FieldValue.serverTimestamp(),
                    }));
                }
            });

            try {
                await Promise.all(batch);
                window.playSoundEffect('positive_chime.mp3');
                
                checked.forEach(cb => cb.checked = false);
                const checkAllBox = document.getElementById('selectAllExcelRows');
                if(checkAllBox) checkAllBox.checked = false;
                
                if (typeModalBakul) typeModalBakul.style.display = 'none';
                window.switchTab('tab-bakul');
                
                await window.CustomAppModal.alert(`${batch.length} permohonan telah berjaya dimasukkan ke Bakul!`, "Berjaya Disimpan", "success");
                
            } catch(e) {
                console.error("Gagal simpan ke bakul:", e);
                window.playSoundEffect('error_buzz.mp3');
                await window.CustomAppModal.alert("Ralat sistem. Gagal menyimpan ke bakul Firebase.", "Ralat", "error");
            } finally {
                btnConfirmBakulModal.innerText = "Simpan";
                btnConfirmBakulModal.disabled = false;
            }
        });
    }

    // Quick check modal
    const btnSemakCepat = document.getElementById('btnSemakCepat');
    const quickCheckModal = document.getElementById('quickCheckModal');
    const quickCheckClose = document.getElementById('quickCheckClose');
    const btnSelesaiQuickCheck = document.getElementById('btnSelesaiQuickCheck');
    const quickCheckContent = document.getElementById('quickCheckContent');

    if (btnSemakCepat) {
        btnSemakCepat.addEventListener('click', () => {
            window.playSoundEffect('ui_click.mp3');
            openQuickCheckModal();
        });
    }

    const closeQCModal = () => {
        if (quickCheckModal) quickCheckModal.style.display = 'none';
        window.playSoundEffect('ui_click.mp3');
    };
    
    if (quickCheckClose) quickCheckClose.addEventListener('click', closeQCModal);
    if (btnSelesaiQuickCheck) btnSelesaiQuickCheck.addEventListener('click', closeQCModal);

    function openQuickCheckModal() {
        if (!quickCheckContent) return;
        quickCheckContent.innerHTML = ''; 

        const cards = document.querySelectorAll('.person-card');

        if (cards.length === 0) {
            quickCheckContent.innerHTML = '<div style="text-align:center; color:#64748b; padding: 20px; font-weight: bold;">Tiada personel ditambah. Sila klik "Tambah Personel" di bawah.</div>';
        } else {
            cards.forEach((card, index) => {
                const nameInputOriginal = card.querySelector('.p-name');
                const name = nameInputOriginal?.value || '';
                const icInput = card.querySelector('.status-ic');
                const sbInput = card.querySelector('.status-sb');
                const epfInput = card.querySelector('.status-epf');

                if (!icInput || !sbInput || !epfInput) return; 
                
                const div = document.createElement('div');
                div.style.cssText = "background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 15px; margin-bottom: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); position: relative;";
                
                div.innerHTML = `
                    <button class="qc-btn-delete" data-index="${index}" style="position: absolute; top: 12px; right: 12px; background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; border-radius: 6px; padding: 5px 10px; font-size: 0.8rem; font-weight: bold; cursor: pointer; transition: all 0.2s;">🗑️ Buang</button>
                    
                    <div style="margin-bottom: 12px; border-bottom: 2px dashed #e2e8f0; padding-bottom: 12px; padding-right: 80px;">
                        <label style="font-size: 0.75rem; color: #64748b; font-weight: bold; margin-bottom: 5px; display: block;">NAMA PERSONEL:</label>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 1.2rem;">👤</span>
                            <input type="text" class="qc-input-name" value="${name}" placeholder="MASUKKAN NAMA" style="width: 100%; border: 1px solid #94a3b8; border-radius: 6px; padding: 8px 10px; font-weight: bold; font-size: 0.95rem; text-transform: uppercase; outline: none; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);">
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
                        ${createQuickCheckFieldUI('IC', icInput.value, index, 'ic')}
                        ${createQuickCheckFieldUI('SB', sbInput.value, index, 'sb')}
                        ${createQuickCheckFieldUI('EPF', epfInput.value, index, 'epf')}
                    </div>
                `;
                quickCheckContent.appendChild(div);

                const qcNameInput = div.querySelector('.qc-input-name');
                qcNameInput.addEventListener('input', (e) => {
                    e.target.value = e.target.value.toUpperCase();
                    if (nameInputOriginal) {
                        nameInputOriginal.value = e.target.value;
                        nameInputOriginal.dispatchEvent(new Event('input', { bubbles: true }));
                        window.saveFormData();
                    }
                });

                const delBtn = div.querySelector('.qc-btn-delete');
                delBtn.addEventListener('click', () => {
                    if (confirm("Adakah anda pasti mahu membuang personel ini?")) {
                        card.remove();
                        window.saveFormData();
                        openQuickCheckModal();
                    }
                });
                
                ['ic', 'sb', 'epf'].forEach(type => {
                    const btnRight = div.querySelector(`.qc-btn-right-${type}-${index}`);
                    const btnWrong = div.querySelector(`.qc-btn-wrong-${type}-${index}`);
                    const displayInput = div.querySelector(`.qc-input-${type}-${index}`);
                    const originalInput = card.querySelector(`.status-${type}`);
                    
                    displayInput.addEventListener('input', (e) => {
                        const val = e.target.value.toUpperCase();
                        e.target.value = val;
                        originalInput.value = val;
                        
                        if (val === '✓') {
                            displayInput.style.backgroundColor = '#dcfce7'; displayInput.style.color = '#166534';
                            originalInput.style.backgroundColor = '#dcfce7'; originalInput.style.color = '#166534';
                        } else if (val === 'X' || val === '✗') {
                            displayInput.style.backgroundColor = '#fee2e2'; displayInput.style.color = '#991b1b';
                            originalInput.style.backgroundColor = '#fee2e2'; originalInput.style.color = '#991b1b';
                        } else {
                            displayInput.style.backgroundColor = '#eff6ff'; displayInput.style.color = '#1e40af';
                            originalInput.style.backgroundColor = '#eff6ff'; originalInput.style.color = '#1e40af';
                        }
                        
                        originalInput.dispatchEvent(new Event('input', { bubbles: true }));
                        window.saveFormData();
                    });

                    const updateStatus = (statusVal, bgColor, textColor) => {
                        displayInput.value = statusVal;
                        displayInput.style.backgroundColor = bgColor;
                        displayInput.style.color = textColor;
                        
                        originalInput.value = statusVal;
                        originalInput.style.backgroundColor = bgColor;
                        originalInput.style.color = textColor;
                        originalInput.dispatchEvent(new Event('input', { bubbles: true }));
                        window.saveFormData();
                    };

                    if (btnRight) {
                        btnRight.addEventListener('click', () => updateStatus('✓', '#dcfce7', '#166534'));
                    }
                    if (btnWrong) {
                        btnWrong.addEventListener('click', () => updateStatus('X', '#fee2e2', '#991b1b'));
                    }
                });
            });
        }

        const addBtnContainer = document.createElement('div');
        addBtnContainer.style.textAlign = 'center';
        addBtnContainer.style.marginTop = '20px';
        addBtnContainer.innerHTML = `<button class="btn btn-blue" style="padding: 12px 25px; font-size: 0.95rem; border-radius: 30px; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);">+ Tambah Personel Baru</button>`;
        
        addBtnContainer.querySelector('button').addEventListener('click', () => {
            window.addPerson();
            window.saveFormData();
            openQuickCheckModal();
            
            setTimeout(() => {
                if (quickCheckContent) {
                    quickCheckContent.scrollTop = quickCheckContent.scrollHeight;
                }
            }, 100);
        });

        quickCheckContent.appendChild(addBtnContainer);
        quickCheckModal.style.display = 'flex';
    }

    function createQuickCheckFieldUI(label, value, index, type) {
        let bg = '#eff6ff';
        let color = '#1e40af';
        if (value === '✓') { bg = '#dcfce7'; color = '#166534'; }
        else if (value === 'X' || value === '✗') { bg = '#fee2e2'; color = '#991b1b'; }
        
        return `
            <div style="background: white; border: 1px solid #e5e7eb; padding: 10px; border-radius: 8px;">
                <label style="font-size: 0.8rem; font-weight: bold; color: #64748b; margin-bottom: 5px; display: block;">${label}</label>
                <div style="position: relative; display: flex; height: 38px;">
                    <input type="text" class="qc-input-${type}-${index}" value="${value}" placeholder="Catatan..." style="width: 100%; padding: 0 70px 0 10px; font-weight: bold; font-size: 0.9rem; text-align: left; border: 1px solid #cbd5e1; border-radius: 6px; background-color: ${bg}; color: ${color}; outline: none; text-transform: uppercase;">
                    <div style="position: absolute; right: 3px; top: 3px; display: flex; gap: 4px; height: calc(100% - 6px);">
                        <button type="button" class="qc-btn-right-${type}-${index}" title="Lengkap" style="width: 30px; border: none; border-radius: 4px; background: linear-gradient(135deg, #10b981, #059669); color: white; cursor: pointer; font-weight: bold; font-size: 1.1rem;">✓</button>
                        <button type="button" class="qc-btn-wrong-${type}-${index}" title="Tidak Lengkap" style="width: 30px; border: none; border-radius: 4px; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; cursor: pointer; font-weight: bold; font-size: 1.1rem;">✗</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Visibility change
    document.addEventListener('visibilitychange', async () => {
        if (document.visibilityState === 'visible') {
            if (window.currentUser) {
                await window.checkDayChangeLogout();
            }
        } else if (document.visibilityState === 'hidden' && window.currentUser && !window.isRestoring) {
            console.log('V6.5.2 Web App visibility hidden - melakukan auto-save terakhir');
            window.saveFormData();
            window.saveDatabaseFormData();
        }
    });

    window.addEventListener('pagehide', () => {
        if (window.currentUser && !window.isRestoring) {
            console.log('V6.5.2 Web App pagehide - melakukan auto-save terakhir');
            window.saveFormData();
            window.saveDatabaseFormData();
        }
    });

    window.addEventListener('blur', () => {
        if (window.currentUser && !window.isRestoring) {
            console.log('V6.5.2 Web App blur - melakukan auto-save terakhir');
            window.saveFormData();
            window.saveDatabaseFormData();
        }
    });
  }

  // =========================================================================
  // INITIALIZATION SEQUENCE
  // =========================================================================

  async function initSystem() {
    window.simulateLoading('Menyediakan sistem...', 'Memuatkan tetapan...');

    // Initialize Firebase first
    window.initializeFirebase();

    try {
      const storage = await window.storageWrapper.get([
        'stb_session', 
        'stb_login_date',
        'stb_last_active_tab',
        'stb_last_active_element',
        'stb_form_states',
        'stb_pelulus_state',
        'stb_search_state',
        'stb_search_history_state',
        'stb_has_printed',
        'stb_users_cache',
        'stb_data_cache',
        'stb_cache_timestamp',
        'stb_drive_folder_url',
        'stb_user_folder_url',
        'stb_filter_pengesyor',
        'stb_all_recommenders',
        'stb_all_approvers',
        'stb_form_data',
        'stb_extracted_pdf_data',
        'stb_extracted_profile_data',
        'stb_dashboard_data',
        'stb_form_persistence',
        'stb_database_persistence',
        'stb_current_draft_filter',
        'stb_current_submitted_status_filter',
        'stb_current_submitted_jenis_filter',
        'stb_current_history_status_filter',
        'stb_current_history_jenis_filter',
        'stb_music_playing',
        'stb_bgm_volume',
        'stb_sfx_volume'
      ]);
      
      if (storage.stb_session) {
        const todayStr = new Date().toDateString();
        if (storage.stb_login_date && storage.stb_login_date !== todayStr) {
          console.log("V6.5.2 Sesi dibatalkan kerana pertukaran hari.");
          await window.storageWrapper.remove(['stb_session', 'stb_login_date']);
          window.currentUser = null;
        } else {
          window.currentUser = storage.stb_session;

          if (window.currentUser && window.currentUser.email) {
              window.authFirebase.signInAnonymously().then(() => {
                  if (window.currentUser.role === 'PENGESYOR') {
                      window.currentUserFirebaseCode = window.currentUser.firebaseCode || null; 
                      if (window.currentUserFirebaseCode) {
                          window.dbFirestore.collection("users").doc(window.currentUserFirebaseCode).get().then(doc => {
                              if (doc.exists) {
                                  window.firebaseUserRules = doc.data();
                                  window.subscribeToBakulFirebase();
                              }
                          });
                      }
                  }
              });
          }
          window.setupUserUI(); 
        }
      }
      
      if (storage.stb_last_active_tab) {
        window.lastActiveTab = storage.stb_last_active_tab;
      }
      
      if (storage.stb_last_active_element) {
        window.lastActiveElementId = storage.stb_last_active_element;
      }
      
      if (storage.stb_form_states) {
        window.formStates = storage.stb_form_states;
      }
      
      if (storage.stb_has_printed) {
        window.hasPrinted = storage.stb_has_printed;
        if (btnSyncToDb && window.hasPrinted) {
          btnSyncToDb.style.display = 'inline-block';
        }
      }
      
      if (storage.stb_drive_folder_url) {
        window.createdFolderUrl = storage.stb_drive_folder_url;
        window.driveFolderCreated = true;
      }
      
      if (storage.stb_user_folder_url) {
        window.userFolderUrl = storage.stb_user_folder_url;
      }
      
      if (storage.stb_all_recommenders) {
        window.allRecommenders = storage.stb_all_recommenders;
      }
      
      if (storage.stb_all_approvers) {
        window.allApprovers = storage.stb_all_approvers;
      }
      
      if (storage.stb_users_cache) {
        window.usersList = storage.stb_users_cache;
        console.log("V6.5.2 Loaded users from cache:", window.usersList.length);
        populateWhatsAppDropdown();
      }
      
      if (storage.stb_data_cache) {
        window.cachedData = storage.stb_data_cache;
        console.log("V6.5.2 Loaded data from cache:", window.cachedData.length);
        updateDynamicYears(window.cachedData);
      }
      
      if (storage.stb_extracted_pdf_data) {
        window.extractedPdfData = storage.stb_extracted_pdf_data;
        window.displayExtractedData(window.extractedPdfData);
        const pdfResult = document.getElementById('pdfResult');
        if (pdfResult) {
          pdfResult.style.display = 'block';
        }
      }
      
      if (storage.stb_extracted_profile_data) {
        window.extractedProfileData = storage.stb_extracted_profile_data;
        window.displayProfileExtractedData(window.extractedProfileData);
        const profilePdfResult = document.getElementById('profilePdfResult');
        if (profilePdfResult) {
          profilePdfResult.style.display = 'block';
        }
      }
      
      if (storage.stb_dashboard_data) {
        window.dashboardData = storage.stb_dashboard_data;
      }
      
      if (storage.stb_current_draft_filter) {
        window.currentDraftFilter = storage.stb_current_draft_filter;
      }
      
      if (storage.stb_current_submitted_status_filter) {
        window.currentSubmittedStatusFilter = storage.stb_current_submitted_status_filter;
      }
      if (storage.stb_current_submitted_jenis_filter) {
        window.currentSubmittedJenisFilter = storage.stb_current_submitted_jenis_filter;
      }
      if (storage.stb_current_history_status_filter) {
        window.currentHistoryStatusFilter = storage.stb_current_history_status_filter;
      }
      if (storage.stb_current_history_jenis_filter) {
        window.currentHistoryJenisFilter = storage.stb_current_history_jenis_filter;
      }
              
      if (storage.stb_sfx_volume !== undefined) {
        window.sfxVolume = storage.stb_sfx_volume;
      }
      
      // Restore search inputs
      const searchListInput = document.getElementById('searchListInput');
      const searchHistoryInput = document.getElementById('searchHistoryInput');
      if (storage.stb_search_state && searchListInput) {
        searchListInput.value = storage.stb_search_state;
      }
      if (storage.stb_search_history_state && searchHistoryInput) {
        searchHistoryInput.value = storage.stb_search_history_state;
      }
      
    } catch (e) { 
      console.error("V6.5.2 Storage Error:", e); 
    }

    // Setup UI
    window.setupUIListeners();
    window.setupPdfEventListeners();
    
    // Setup inactivity listeners
    window.setupInactivityListeners();
    
    // Setup all event listeners
    setupAllEventListeners();
    
    window.hideLoading();
    
    // Show login screen if no active session
    if (!window.currentUser) {
      console.log("V6.5.2 No active session, showing login screen with Google Sign-In");
      if (loginScreen) {
        loginScreen.style.display = 'flex';
      }
      if (appContainer) {
        appContainer.style.display = 'none';
      }
      window.initializeGoogleSignIn();
    }
  }

  // =========================================================================
  // DYNAMIC YEAR FUNCTION
  // =========================================================================
  function updateDynamicYears(data) {
    if (!data || data.length === 0) return;
    
    const years = new Set();
    data.forEach(item => {
      if (item.start_date) {
        const year = new Date(item.start_date).getFullYear();
        if (!isNaN(year)) years.add(year);
      }
      if (item.tarikh_syor) {
        const year = new Date(item.tarikh_syor).getFullYear();
        if (!isNaN(year)) years.add(year);
      }
      if (item.tarikh_lulus) {
        const year = new Date(item.tarikh_lulus).getFullYear();
        if (!isNaN(year)) years.add(year);
      }
      if (item.date_submit) {
        const year = new Date(item.date_submit).getFullYear();
        if (!isNaN(year)) years.add(year);
      }
    });
    
    const sortedYears = Array.from(years).sort((a, b) => b - a);
    
    const yearSelectors = [
      { element: dashboardYear, addAll: false },
      { element: adminFilterYear, addAll: true },
      { element: listFilterYear, addAll: true },
      { element: document.getElementById('historyYearFilter'), addAll: true }
    ];
    
    yearSelectors.forEach(({ element, addAll }) => {
      if (element) {
        const currentVal = element.value;
        element.innerHTML = '';
        if (addAll) {
          const allOption = document.createElement('option');
          allOption.value = '';
          allOption.textContent = 'Semua Tahun';
          element.appendChild(allOption);
        }
        sortedYears.forEach(year => {
          const option = document.createElement('option');
          option.value = year;
          option.textContent = year;
          element.appendChild(option);
        });
        if (currentVal && element.querySelector(`option[value="${currentVal}"]`)) {
          element.value = currentVal;
        } else if (sortedYears.length > 0) {
          element.value = addAll ? '' : sortedYears[0];
        }
      }
    });
    
    console.log("V6.5.2 Dynamic years updated:", sortedYears);
  }

  // =========================================================================
  // START THE APP
  // =========================================================================
  initSystem();

}); // END DOMContentLoaded

console.log("STB System V6.5.2 - Modularized Web App JS loaded successfully");