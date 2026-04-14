(function () {
  // Fill these values from Firebase Console > Project settings > Your apps > SDK setup.
  // Keep this file local/private if possible for deployment workflows.
  window.BCFirebaseConfig = window.BCFirebaseConfig || {
    apiKey: "AIzaSyCy8mFOuTRCYc9k7dcUHAzlc6nU7D4dYkE",
    authDomain: "bc-website2.firebaseapp.com",
    projectId: "bc-website2",
    storageBucket: "bc-website2.firebasestorage.app",
    messagingSenderId: "1079969521768",
    appId: "1:1079969521768:web:85f63342ae6a17318b9bdd",

    // Optional overrides.
    siteCollection: "bc_site",
    siteDocument: "content",
    adminCollection: "admin_users",
    cloudSyncDebounceMs: 600,
    // Set true only during controlled first-admin bootstrap.
    allowAdminSelfRegistration: false
  };
})();
