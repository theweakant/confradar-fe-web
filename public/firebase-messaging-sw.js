importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDIMwpdgauDUHd3gxXPXL38904mmK6SRUM",
    authDomain: "confradar-762ce.firebaseapp.com",
    databaseURL: "https://confradar-762ce-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "confradar-762ce",
    storageBucket: "confradar-762ce.firebasestorage.app",
    messagingSenderId: "530552883525",
    appId: "1:530552883525:web:cc709e860cd498b637d62c",
    measurementId: "G-SK24Z55T6L"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification?.title || 'Background Message';
    const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/favicon.ico'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
