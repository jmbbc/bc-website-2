# Firebase Setup (Auth + Firestore)

Dokumen ini untuk setup dari mula: project, login admin, dan storage Firestore.

## 1. Cipta Firebase Project

1. Buka Firebase Console.
2. Create project baharu.
3. Aktifkan Firestore Database (production mode atau test mode mengikut keperluan).
4. Aktifkan Authentication > Sign-in method > Email/Password.

## 2. Masukkan Konfigurasi Web App

1. Firebase Console > Project settings > Your apps > Web app.
2. Salin config values.
3. Isi file:

- [assets/js/firebase-config.js](assets/js/firebase-config.js)

Field wajib:

- apiKey
- authDomain
- projectId
- appId

## 3. Security Rules Disyorkan

### Firestore Rules

Gunakan rules ini sebagai baseline:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isSignedIn()
        && exists(/databases/$(database)/documents/admin_users/$(request.auth.uid))
        && get(/databases/$(database)/documents/admin_users/$(request.auth.uid)).data.active == true;
    }

    match /bc_site/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /admin_users/{uid} {
      allow read: if isAdmin() || (isSignedIn() && request.auth.uid == uid);
      allow create, update, delete: if isAdmin();
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 4. Setup Login ID Admin Pertama

Ada dua cara:

1. (Disyorkan) Create user di Firebase Auth dan buat dokumen `admin_users/{uid}` secara manual dengan `active: true`.
2. Jika mahu guna UI [admin.html](admin.html) untuk bootstrap pertama, set `allowAdminSelfRegistration: true` dalam [assets/js/firebase-config.js](assets/js/firebase-config.js), daftar akaun pertama, kemudian tukar semula ke `false`.

## 4.1 Kunci Pendaftaran Admin (Production)

Selepas admin pertama siap:

1. Pastikan Firestore Rules di atas sudah `Publish`.
2. Pastikan `allowAdminSelfRegistration: false` dalam [assets/js/firebase-config.js](assets/js/firebase-config.js).
3. Jangan dedahkan mod daftar admin kepada pengguna umum.

## 5. Struktur Data Firestore Yang Digunakan

Collection/doc utama:

- `bc_site/content`

Bentuk data:

```json
{
  "notices": [],
  "pageDataV1": {},
  "announcementNoticeIds": [],
  "updatedAt": "serverTimestamp"
}
```

Role admin:

- `admin_users/{uid}` dengan field minimum:

```json
{
  "email": "admin@domain.com",
  "displayName": "Nama Admin",
  "role": "admin",
  "active": true
}
```

## 6. Aliran Sistem

- Public pages baca data dari cache localStorage yang disegerakkan dari Firestore ketika load.
- Sebarang perubahan dari admin akan trigger sync semula ke Firestore.
- Login admin guna Firebase Auth + semakan `admin_users`.

