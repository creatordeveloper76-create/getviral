// ===========================
// GETVIRAL - Configuration
// ===========================

const CONFIG = {
    // Facebook
    FACEBOOK_APP_ID: 'YOUR_FACEBOOK_APP_ID', // À remplacer par votre App ID
    
    // Cooldown
    COOLDOWN_MINUTES: 5,
    
    // Email
    EMAIL_ENDPOINT: 'https://formspree.io/f/YOUR_FORMSPREE_ID', // À remplacer par votre Formspree ID
    EMAIL_TO: 'creatordeveloper76@gmail.com',
    
    // Adsterra Codes (Déjà configurés)
    ADSTERRA: {
        SOCIAL_BAR: '//contributionhobblenewlyweed.com/85/79/68/85798882f7547a50e802e240a6b57936.js',
        NATIVE_BANNER: '//contributionhobblenewlyweed.com/a60b166e2307959d0cea7113e279fd1c/invoke.js',
        SMARTLINK: 'https://contributionhobblenewlyweed.com/ayxw8E87w4?seid=22c7778b%27c27c%995afc25980e',
        POPUNDER: '//contributionhobblenewlyweed.com/2a/20/8b/2a208b5171bb2ae3a8b0c0b8be70d2.js'
    },
    
    // Services
    SERVICES: {
        likes: {
            name: '👍 Likes',
            min: 19,
            max: 21
        },
        followers: {
            name: '👥 Followers',
            min: 50,
            max: 52
        },
        views: {
            name: '👁️ Vues',
            min: 100,
            max: 102
        }
    }
};

// Export pour les autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}