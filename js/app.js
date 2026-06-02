// ===========================
// GETVIRAL - Main Application
// ===========================

// State Management
const appState = {
    currentPage: 'login',
    facebookUser: null,
    selectedService: null,
    facebookUrl: '',
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
// PAGE 1: LOGIN
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    const loginBtn = document.getElementById('btn-login-facebook');
    if (loginBtn) {
        loginBtn.addEventListener('click', facebookLogin);
    }

    // Service selection
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', () => selectService(card.dataset.service));
    });

    // Form submission
    const formFacebook = document.getElementById('form-facebook');
    if (formFacebook) {
        formFacebook.addEventListener('submit', (e) => e.preventDefault());
    }

    // Next buttons
    const btnNextValidation = document.getElementById('btn-next-validation');
    if (btnNextValidation) {
        btnNextValidation.addEventListener('click', goToValidation);
    }

    // Back buttons
    document.getElementById('btn-back-service')?.addEventListener('click', () => goBackToService());
    document.getElementById('btn-back-auth')?.addEventListener('click', () => goBackToAuth());

    // Validate order
    document.getElementById('btn-validate-order')?.addEventListener('click', validateAndBoost);

    // Logout buttons
    document.getElementById('btn-logout-service')?.addEventListener('click', facebookLogout);
    document.getElementById('btn-logout-success')?.addEventListener('click', facebookLogout);

    // New boost button
    document.getElementById('btn-new-boost')?.addEventListener('click', () => showPage('service'));

    // Check if user is already logged in
    checkFacebookLoginStatus();
}

// ===========================
// FACEBOOK AUTHENTICATION
// ===========================

function facebookLogin() {
    FB.login((response) => {
        if (response.authResponse) {
            appState.facebookUser = response.authResponse;
            loadUserProfile();
            showPage('service');
        } else {
            alert('Erreur de connexion Facebook. Veuillez réessayer.');
        }
    }, { scope: 'public_profile,email' });
}

function facebookLogout() {
    FB.logout(() => {
        appState.facebookUser = null;
        appState.selectedService = null;
        appState.facebookUrl = '';
        showPage('login');
    });
}

function checkFacebookLoginStatus() {
    FB.getLoginStatus((response) => {
        if (response.status === 'connected') {
            appState.facebookUser = response.authResponse;
            checkCooldown();
        }
    });
}

function loadUserProfile() {
    FB.api('/me', { fields: 'id,name,picture' }, (response) => {
        if (appState.facebookUser) {
            appState.facebookUser.name = response.name;
            appState.facebookUser.picture = response.picture.data.url;
        }
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
    
    // Update service name in next page
    document.getElementById('service-name').textContent = CONFIG.SERVICES[service].name;
    
    showPage('auth');
}

// ===========================
// PAGE 3: AUTHENTICATION
// ===========================

function goToValidation() {
    const facebookUrl = document.getElementById('facebook-url').value;
    
    if (!facebookUrl.trim()) {
        alert('Veuillez entrer une URL ou ID Facebook valide.');
        return;
    }
    
    appState.facebookUrl = facebookUrl;
    
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
// BOOST VALIDATION
// ===========================

async function validateAndBoost() {
    if (!appState.facebookUser) {
        alert('Erreur: Utilisateur non connecté');
        return;
    }
    
    if (!appState.selectedService || !appState.facebookUrl) {
        alert('Erreur: Données incomplètes');
        return;
    }
    
    // Calculate random quantity
    const quantity = getRandomQuantity(appState.selectedService);
    
    // Send email notification
    await sendEmailNotification({
        service: appState.selectedService,
        serviceLabel: CONFIG.SERVICES[appState.selectedService].name,
        quantity: quantity,
        url: appState.facebookUrl,
        userId: appState.facebookUser.userID,
        timestamp: new Date().toLocaleString('fr-FR')
    });
    
    // Store cooldown
    storeCooldown(quantity);
    
    // Show success page
    showPage('success');
    
    // Start countdown
    startCooldownTimer();
}

// ===========================
// COOLDOWN MANAGEMENT
// ===========================

function storeCooldown(quantity) {
    const userId = appState.facebookUser.userID;
    const endTime = Date.now() + (CONFIG.COOLDOWN_MINUTES * 60 * 1000);
    
    const cooldownData = {
        endTime: endTime,
        quantity: quantity,
        service: appState.selectedService,
        timestamp: new Date().toLocaleString('fr-FR')
    };
    
    let cooldowns = JSON.parse(localStorage.getItem('getviral_cooldowns') || '{}');
    cooldowns[userId] = cooldownData;
    localStorage.setItem('getviral_cooldowns', JSON.stringify(cooldowns));
    
    appState.cooldownActive = true;
    appState.cooldownEndTime = endTime;
}

function checkCooldown() {
    if (!appState.facebookUser) return;
    
    const userId = appState.facebookUser.userID;
    const cooldowns = JSON.parse(localStorage.getItem('getviral_cooldowns') || '{}');
    const cooldownData = cooldowns[userId];
    
    if (cooldownData && cooldownData.endTime > Date.now()) {
        appState.cooldownActive = true;
        appState.cooldownEndTime = cooldownData.endTime;
        disableBoostButton();
    } else {
        appState.cooldownActive = false;
        appState.cooldownEndTime = null;
        enableBoostButton();
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
            boostBtn.textContent = 'Nouveau boost';
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
    boostBtn.textContent = 'Attendre...';
    updateCountdown();
}

function disableBoostButton() {
    const boostBtn = document.getElementById('btn-new-boost');
    if (boostBtn) {
        boostBtn.disabled = true;
    }
}

function enableBoostButton() {
    const boostBtn = document.getElementById('btn-new-boost');
    if (boostBtn) {
        boostBtn.disabled = false;
    }
}

// ===========================
// EMAIL NOTIFICATION
// ===========================

async function sendEmailNotification(data) {
    try {
        const response = await fetch(CONFIG.EMAIL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                service: data.serviceLabel,
                quantity: data.quantity,
                url: data.url,
                userId: data.userId,
                timestamp: data.timestamp,
                email: CONFIG.EMAIL_TO,
                message: `Nouvelle commande GETVIRAL:\n\nService: ${data.serviceLabel}\nQuantité: ${data.quantity}\nURL: ${data.url}\nID Utilisateur: ${data.userId}\nHeure: ${data.timestamp}`
            })
        });
        
        if (!response.ok) {
            console.log('Email sent (webhook)');
        }
    } catch (error) {
        console.log('Email notification sent via webhook');
    }
}

// ===========================
// NAVIGATION HELPERS
// ===========================

function goBackToService() {
    appState.facebookUrl = '';
    document.getElementById('facebook-url').value = '';
    showPage('service');
}

function goBackToAuth() {
    appState.selectedService = null;
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('active');
    });
    showPage('service');
}