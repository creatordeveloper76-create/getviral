// ===========================
// GETVIRAL - Configuration
// ===========================

const CONFIG = {
    // Formspree Email Integration
    EMAIL_ENDPOINT: 'https://formspree.io/f/mzdwnoag',
    EMAIL_TO: 'creatordeveloper76@gmail.com',
    
    // Cooldown (minutes)
    COOLDOWN_MINUTES: 5,
    
    // Adsterra Codes (Configurés)
    ADSTERRA: {
        SOCIAL_BAR: '//contributionhobblenewlyweed.com/85/79/68/85798882f7547a50e802e240a6b57936.js',
        NATIVE_BANNER: '//contributionhobblenewlyweed.com/a60b166e2307959d0cea7113e279fd1c/invoke.js',
        SMARTLINK: 'https://contributionhobblenewlyweed.com/ayxw8E87w4?seid=22c7778b%27c27c%995afc25980e',
        POPUNDER: '//contributionhobblenewlyweed.com/2a/20/8b/2a208b5171bb2ae3a8b0c0b8be70d2.js'
    },
    
    // Services avec quantités aléatoires
    SERVICES: {
        likes: {
            name: '👍 Likes',
            quantities: [19, 20, 21],
            icon: '👍',
            link: 'https://www.facebook.com/'
        },
        followers: {
            name: '👥 Followers',
            quantities: [50, 51, 52],
            icon: '👥',
            link: 'https://www.facebook.com/'
        },
        views: {
            name: '👁️ Vues',
            quantities: [100, 101, 102],
            icon: '👁️',
            link: 'https://www.facebook.com/'
        }
    }
};

// Export pour les autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}