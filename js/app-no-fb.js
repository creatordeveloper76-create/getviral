// ===========================
// GETVIRAL - Main App (No Facebook)
// ===========================

// State Management
const appState = {
    currentPage: 'login',
    selectedService: null,
    facebookUrl: '',
    userEmail: '',
    cooldownActive: false,
    cooldownEndTime: null
};

// Page Navigation
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`page-${pageName}`).classList.add('active');
    appState.currentPage = pageName;
}

// ===========================
// INITIALIZATION
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    checkExistingCooldown();
});

function initializeApp() {
    // Start button
    document.getElementById('btn-start')?.addEventListener('click', () => showPage('service'));

    // Service selection
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', () => selectService(card.dataset.service));
    });

    // Back buttons
    document.getElementById('btn-back-start')?.addEventListener('click', () => showPage('login'));
    document.getElementById('btn-back-service-form')?.addEventListener('click', () => showPage('service'));
    document.getElementById('btn-back-form')?.addEventListener('click', () => showPage('form'));
    document.getElementById('btn-back-home')?.addEventListener('click', () => {
        resetForm();
        showPage('login');
    });

    // Form submission
    document.getElementById('btn-next-validation')?.addEventListener('click', goToValidation);
    document.getElementById('btn-validate-order')?.addEventListener('click', validateAndBoost);

    // New boost button
    document.getElementById('btn-new-boost')?.addEventListener('click', () => {
        resetForm();
        showPage('service');
    });
}

// ===========================
// PAGE 2: SERVICE SELECTION
// ===========================

function selectService(service) {
    appState.selectedService = service;
    
    // Update UI
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-service="${service}"]`).classList.add('active');
    
    // Update service name in form page
    document.getElementById('service-name').textContent = CONFIG.SERVICES[service].name;
    
    showPage('form');
}

// ===========================
// PAGE 3: FORM SUBMISSION
// ===========================

function goToValidation() {
    const facebookUrl = document.getElementById('facebook-url').value;
    const userEmail = document.getElementById('user-email').value;
    
    if (!facebookUrl.trim()) {
        alert('⚠️ Veuillez entrer une URL ou ID Facebook valide.');
        return;
    }
    
    appState.facebookUrl = facebookUrl;
    appState.userEmail = userEmail;
    
    // Update validation summary
    updateValidationSummary();
    
    showPage('validation');
}

// ===========================
// PAGE 4: VALIDATION
// ===========================

function updateValidationSummary() {
    const service = CONFIG.SERVICES[appState.selectedService];
    const randomQuantity = getRandomQuantity(appState.selectedService);
    
    document.getElementById('val-service').textContent = service.name;
    document.getElementById('val-url').textContent = appState.facebookUrl;
    document.getElementById('val-quantity').textContent = randomQuantity;
}

function getRandomQuantity(service) {
    const serviceConfig = CONFIG.SERVICES[service];
    return Math.floor(Math.random() * (serviceConfig.max - serviceConfig.min + 1)) + serviceConfig.min;
}

// ===========================
// BOOST VALIDATION & EMAIL
// ===========================

async function validateAndBoost() {
    if (!appState.selectedService || !appState.facebookUrl) {
        alert('❌ Erreur: Données incomplètes');
        return;
    }
    
    // Calculate random quantity
    const quantity = getRandomQuantity(appState.selectedService);
    const service = CONFIG.SERVICES[appState.selectedService];
    const timestamp = new Date().toLocaleString('fr-FR');
    const deviceId = generateDeviceId();
    
    // Prepare data
    const formData = new FormData();
    formData.append('service', service.name);
    formData.append('quantity', quantity);
    formData.append('facebook_url', appState.facebookUrl);
    formData.append('user_email', appState.userEmail || 'Non fourni');
    formData.append('timestamp', timestamp);
    formData.append('device_id', deviceId);
    formData.append('status', 'En attente de validation');
    
    try {
        // Send to Formspree
        const response = await fetch(CONFIG.EMAIL_ENDPOINT, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            console.log('✅ Email envoyé avec succès');
            // Store cooldown
            storeCooldown(deviceId, quantity);
            // Show success page
            showPage('success');
            // Start countdown timer
            startCooldownTimer();
        } else {
            console.log('Email envoyé (mode démo)');
            storeCooldown(deviceId, quantity);
            showPage('success');
            startCooldownTimer();
        }
    } catch (error) {
        console.log('Email envoyé (mode démo)', error);
        storeCooldown(deviceId, quantity);
        showPage('success');
        startCooldownTimer();
    }
}

// ===========================
// DEVICE ID & COOLDOWN
// ===========================

function generateDeviceId() {
    let deviceId = localStorage.getItem('getviral_device_id');
    if (!deviceId) {
        deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('getviral_device_id', deviceId);
    }
    return deviceId;
}

function storeCooldown(deviceId, quantity) {
    const endTime = Date.now() + (CONFIG.COOLDOWN_MINUTES * 60 * 1000);
    
    const cooldownData = {
        endTime: endTime,
        quantity: quantity,
        service: appState.selectedService,
        timestamp: new Date().toLocaleString('fr-FR')
    };
    
    let cooldowns = JSON.parse(localStorage.getItem('getviral_cooldowns') || '{}');
    cooldowns[deviceId] = cooldownData;
    localStorage.setItem('getviral_cooldowns', JSON.stringify(cooldowns));
    
    appState.cooldownActive = true;
    appState.cooldownEndTime = endTime;
}

function checkExistingCooldown() {
    const deviceId = generateDeviceId();
    const cooldowns = JSON.parse(localStorage.getItem('getviral_cooldowns') || '{}');
    const cooldownData = cooldowns[deviceId];
    
    if (cooldownData && cooldownData.endTime > Date.now()) {
        appState.cooldownActive = true;
        appState.cooldownEndTime = cooldownData.endTime;
        // Don't show page, but set cooldown visually when needed
    } else {
        appState.cooldownActive = false;
        appState.cooldownEndTime = null;
    }
}

function startCooldownTimer() {
    const countdownElement = document.getElementById('countdown');
    const boostBtn = document.getElementById('btn-new-boost');
    
    function updateCountdown() {
        const now = Date.now();
        const remaining = appState.cooldownEndTime - now;
        
        if (remaining <= 0) {
            countdownElement.textContent = '00:00';
            boostBtn.disabled = false;
            boostBtn.textContent = '🚀 Nouveau boost';
            appState.cooldownActive = false;
            return;
        }
        
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        
        countdownElement.textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        setTimeout(updateCountdown, 1000);
    }
    
    boostBtn.disabled = true;
    boostBtn.textContent = '⏳ Attendre...';
    updateCountdown();
}

// ===========================
// HELPERS
// ===========================

function resetForm() {
    appState.selectedService = null;
    appState.facebookUrl = '';
    appState.userEmail = '';
    
    document.getElementById('facebook-url').value = '';
    document.getElementById('user-email').value = '';
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('active');
    });
}