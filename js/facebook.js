// ===========================
// GETVIRAL - Facebook SDK Init
// ===========================

window.fbAsyncInit = function() {
    FB.init({
        appId: CONFIG.FACEBOOK_APP_ID,
        xfbml: true,
        version: 'v18.0'
    });
    
    // Check login status on page load
    FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
            // User is logged in
            appState.facebookUser = response.authResponse;
            loadUserProfile();
            checkCooldown();
        }
    });
};

// Load Facebook SDK asynchronously
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0&appId=" + CONFIG.FACEBOOK_APP_ID;
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// ===========================
// Adsterra Ads Loading
// ===========================

function loadNativeBannerAd() {
    try {
        const script = document.createElement('script');
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = CONFIG.ADSTERRA.NATIVE_BANNER;
        document.body.appendChild(script);
    } catch (e) {
        console.log('Native Banner Ad loading...');
    }
}

function loadPopunderAd() {
    try {
        const script = document.createElement('script');
        script.src = CONFIG.ADSTERRA.POPUNDER;
        document.body.appendChild(script);
    } catch (e) {
        console.log('Popunder Ad loading...');
    }
}

// Load ads on page changes
const originalShowPage = window.showPage;
window.showPage = function(pageName) {
    originalShowPage(pageName);
    
    // Load appropriate ads
    setTimeout(() => {
        if (pageName === 'service' || pageName === 'auth' || pageName === 'validation') {
            loadNativeBannerAd();
        }
        if (pageName === 'success') {
            loadPopunderAd();
        }
    }, 100);
};