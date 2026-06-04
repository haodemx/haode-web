export const firebaseConfig = {
  apiKey: "AIzaSyDSDQVR_spJjvJxIpLa4k6tqoDoRhTfpPw",
  authDomain: "haode-app.firebaseapp.com",
  projectId: "haode-app",
  storageBucket: "haode-app.firebasestorage.app",
  messagingSenderId: "811262279914",
  appId: "1:811262279914:web:5708f82d50add4a0541793"
};

export const firebaseAdminEmails = [
  "cristi3an@gmail.com"
];

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
}
