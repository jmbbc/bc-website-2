(function () {
  var STORAGE_KEYS = {
    notices: "notices",
    pageData: "pageDataV1",
    announcement: "announcementNoticeIds"
  };

  var state = {
    enabled: false,
    initPromise: null,
    payload: null,
    auth: null,
    db: null,
    cloudDocRef: null,
    storagePatched: false,
    syncTimer: null,
    suspendSync: false,
    pendingSyncPromise: null
  };

  function getConfig() {
    return window.BCFirebaseConfig || {};
  }

  function hasConfig(config) {
    return !!(
      config &&
      config.apiKey &&
      config.apiKey.indexOf("YOUR_") !== 0 &&
      config.projectId &&
      config.projectId.indexOf("YOUR_") !== 0 &&
      config.appId &&
      config.appId.indexOf("YOUR_") !== 0
    );
  }

  function safeParse(raw, fallback) {
    if (!raw) {
      return fallback;
    }
    try {
      var parsed = JSON.parse(raw);
      return parsed === null || parsed === undefined ? fallback : parsed;
    } catch (_) {
      return fallback;
    }
  }

  function normalizeAnnouncement(value) {
    if (value === null || value === undefined) {
      return null;
    }
    if (!Array.isArray(value)) {
      return null;
    }
    return value
      .map(function (id) {
        return String(id || "").trim();
      })
      .filter(Boolean);
  }

  function normalizeNotices(value) {
    if (!Array.isArray(value)) {
      return [];
    }
    return value
      .map(function (item) {
        if (!item || typeof item !== "object") {
          return null;
        }
        return Object.assign({}, item, {
          id: String(item.id || "").trim() || crypto.randomUUID()
        });
      })
      .filter(Boolean);
  }

  function normalizePages(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return {};
    }

    var normalized = {};

    Object.keys(value).forEach(function (pageKey) {
      var entry = value[pageKey];

      if (Array.isArray(entry)) {
        normalized[pageKey] = {
          title: pageKey,
          subtitle: "",
          cards: entry.map(function (card) {
            return Object.assign({}, card || {}, {
              id: String((card && card.id) || "").trim() || crypto.randomUUID()
            });
          })
        };
        return;
      }

      if (!entry || typeof entry !== "object") {
        normalized[pageKey] = {
          title: pageKey,
          subtitle: "",
          cards: []
        };
        return;
      }

      normalized[pageKey] = {
        title: entry.title || pageKey,
        subtitle: entry.subtitle || "",
        cards: (Array.isArray(entry.cards) ? entry.cards : []).map(function (card) {
          return Object.assign({}, card || {}, {
            id: String((card && card.id) || "").trim() || crypto.randomUUID()
          });
        })
      };
    });

    return normalized;
  }

  function normalizePayload(raw) {
    var source = raw || {};

    return {
      notices: normalizeNotices(source.notices),
      pageDataV1: normalizePages(source.pageDataV1),
      announcementNoticeIds: normalizeAnnouncement(source.announcementNoticeIds)
    };
  }

  function readLocalPayload() {
    return normalizePayload({
      notices: safeParse(localStorage.getItem(STORAGE_KEYS.notices), []),
      pageDataV1: safeParse(localStorage.getItem(STORAGE_KEYS.pageData), {}),
      announcementNoticeIds: safeParse(localStorage.getItem(STORAGE_KEYS.announcement), null)
    });
  }

  function writeLocalPayload(payload) {
    var normalized = normalizePayload(payload);

    state.suspendSync = true;
    try {
      localStorage.setItem(STORAGE_KEYS.notices, JSON.stringify(normalized.notices));
      localStorage.setItem(STORAGE_KEYS.pageData, JSON.stringify(normalized.pageDataV1));
      if (normalized.announcementNoticeIds === null) {
        localStorage.removeItem(STORAGE_KEYS.announcement);
      } else {
        localStorage.setItem(STORAGE_KEYS.announcement, JSON.stringify(normalized.announcementNoticeIds));
      }
    } finally {
      state.suspendSync = false;
    }

    state.payload = normalized;
    return normalized;
  }

  function hasMeaningfulData(payload) {
    if (!payload) {
      return false;
    }

    var notices = Array.isArray(payload.notices) ? payload.notices.length : 0;
    var pages = payload.pageDataV1 && typeof payload.pageDataV1 === "object"
      ? Object.keys(payload.pageDataV1).length
      : 0;

    return notices > 0 || pages > 0;
  }

  function mergePayload(remote, local) {
    var merged = normalizePayload(remote || {});
    var normalizedLocal = normalizePayload(local || {});

    if (!merged.notices.length && normalizedLocal.notices.length) {
      merged.notices = normalizedLocal.notices;
    }

    if (!Object.keys(merged.pageDataV1).length && Object.keys(normalizedLocal.pageDataV1).length) {
      merged.pageDataV1 = normalizedLocal.pageDataV1;
    }

    if ((merged.announcementNoticeIds === null || !merged.announcementNoticeIds.length) && normalizedLocal.announcementNoticeIds !== null) {
      merged.announcementNoticeIds = normalizedLocal.announcementNoticeIds;
    }

    return merged;
  }

  function isPermissionDeniedError(error) {
    if (!error) {
      return false;
    }

    var code = String(error.code || "").toLowerCase();
    var message = String(error.message || "").toLowerCase();

    return code.indexOf("permission-denied") !== -1 || message.indexOf("insufficient permissions") !== -1;
  }

  function trackedKey(key) {
    return key === STORAGE_KEYS.notices || key === STORAGE_KEYS.pageData || key === STORAGE_KEYS.announcement;
  }

  function installStoragePatch() {
    if (state.storagePatched) {
      return;
    }

    var originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      originalSetItem.apply(this, arguments);
      if (this === window.localStorage && trackedKey(key) && !state.suspendSync) {
        scheduleSyncToCloud();
      }
    };

    state.storagePatched = true;
  }

  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[data-bc-sdk="' + url + '"]');
      if (existing) {
        if (existing.getAttribute("data-loaded") === "true") {
          resolve();
          return;
        }
        existing.addEventListener("load", function () {
          resolve();
        }, { once: true });
        existing.addEventListener("error", function () {
          reject(new Error("Gagal muat skrip Firebase: " + url));
        }, { once: true });
        return;
      }

      var script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.defer = true;
      script.setAttribute("data-bc-sdk", url);
      script.addEventListener("load", function () {
        script.setAttribute("data-loaded", "true");
        resolve();
      }, { once: true });
      script.addEventListener("error", function () {
        reject(new Error("Gagal muat skrip Firebase: " + url));
      }, { once: true });
      document.head.appendChild(script);
    });
  }

  function loadFirebaseSdk() {
    var version = "10.12.5";
    var base = "https://www.gstatic.com/firebasejs/" + version + "/";
    var urls = [
      base + "firebase-app-compat.js",
      base + "firebase-auth-compat.js",
      base + "firebase-firestore-compat.js"
    ];

    return urls.reduce(function (chain, url) {
      return chain.then(function () {
        return loadScript(url);
      });
    }, Promise.resolve());
  }

  function siteCollectionName() {
    var config = getConfig();
    return config.siteCollection || "bc_site";
  }

  function siteDocumentName() {
    var config = getConfig();
    return config.siteDocument || "content";
  }

  function adminCollectionName() {
    var config = getConfig();
    return config.adminCollection || "admin_users";
  }

  function isAdminSelfRegistrationEnabled() {
    var config = getConfig();
    return !!(config && config.allowAdminSelfRegistration === true);
  }

  async function pullFromCloud() {
    if (!state.cloudDocRef) {
      return { exists: false, payload: normalizePayload({}) };
    }

    try {
      var snapshot = await state.cloudDocRef.get();
      if (!snapshot.exists) {
        return { exists: false, payload: normalizePayload({}) };
      }
      return {
        exists: true,
        payload: normalizePayload(snapshot.data() || {})
      };
    } catch (error) {
      console.error("[BC] Firestore read failed", error);
      return { exists: false, payload: normalizePayload({}) };
    }
  }

  async function pushToCloud(payload) {
    if (!state.enabled || !state.cloudDocRef || !window.firebase || !window.firebase.firestore) {
      return;
    }

    var normalized = normalizePayload(payload);

    await state.cloudDocRef.set({
      notices: normalized.notices,
      pageDataV1: normalized.pageDataV1,
      announcementNoticeIds: normalized.announcementNoticeIds,
      updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }

  function scheduleSyncToCloud() {
    if (!state.enabled) {
      return;
    }

    var delay = Number(getConfig().cloudSyncDebounceMs || 600);
    if (state.syncTimer) {
      window.clearTimeout(state.syncTimer);
    }

    state.syncTimer = window.setTimeout(function () {
      state.pendingSyncPromise = bridge.forceSyncToCloud().catch(function (error) {
        console.error("[BC] Cloud sync failed", error);
      });
    }, Math.max(200, delay));
  }

  async function waitForResolvedUser() {
    await init();

    if (!state.auth) {
      return null;
    }

    if (state.auth.currentUser) {
      return state.auth.currentUser;
    }

    return new Promise(function (resolve) {
      var done = false;
      var timeout = window.setTimeout(function () {
        if (done) {
          return;
        }
        done = true;
        unsubscribe();
        resolve(state.auth.currentUser || null);
      }, 4500);

      var unsubscribe = state.auth.onAuthStateChanged(function (user) {
        if (done) {
          return;
        }
        done = true;
        window.clearTimeout(timeout);
        unsubscribe();
        resolve(user || null);
      });
    });
  }

  async function init() {
    if (state.initPromise) {
      return state.initPromise;
    }

    state.initPromise = (async function () {
      installStoragePatch();

      var config = getConfig();
      state.enabled = hasConfig(config);

      var localPayload = readLocalPayload();

      if (!state.enabled) {
        state.payload = localPayload;
        return state.payload;
      }

      await loadFirebaseSdk();

      if (!window.firebase) {
        throw new Error("Firebase SDK tidak tersedia.");
      }

      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(config);
      }

      state.auth = window.firebase.auth();
      state.db = window.firebase.firestore();
      state.cloudDocRef = state.db.collection(siteCollectionName()).doc(siteDocumentName());

      var cloud = await pullFromCloud();
      var merged = mergePayload(cloud.payload, localPayload);

      writeLocalPayload(merged);

      if (!cloud.exists && hasMeaningfulData(localPayload)) {
        try {
          await pushToCloud(localPayload);
        } catch (error) {
          if (!isPermissionDeniedError(error)) {
            throw error;
          }
          // Public users may not have write access; seed can happen later via admin flow.
          console.warn("[BC] Cloud seed skipped (permission denied)");
        }
      }

      return state.payload;
    })().catch(function (error) {
      console.error("[BC] Firebase init failed", error);
      state.enabled = false;
      state.payload = readLocalPayload();
      return state.payload;
    });

    return state.initPromise;
  }

  var bridge = {
    isFirebaseEnabled: function () {
      return !!state.enabled;
    },

    ensureReady: function () {
      return init();
    },

    ready: function () {
      return init();
    },

    getPayload: function () {
      return normalizePayload(readLocalPayload());
    },

    forceSyncFromCloud: async function () {
      await init();
      if (!state.enabled) {
        return bridge.getPayload();
      }
      var cloud = await pullFromCloud();
      var merged = mergePayload(cloud.payload, readLocalPayload());
      return writeLocalPayload(merged);
    },

    forceSyncToCloud: async function () {
      await init();
      if (!state.enabled) {
        return bridge.getPayload();
      }
      var payload = readLocalPayload();
      await pushToCloud(payload);
      return payload;
    },

    signIn: async function (email, password) {
      await init();
      if (!state.enabled || !state.auth) {
        throw new Error("Firebase belum dikonfigurasi.");
      }
      return state.auth.signInWithEmailAndPassword(String(email || "").trim(), String(password || ""));
    },

    signOut: async function () {
      await init();
      if (state.enabled && state.auth) {
        return state.auth.signOut();
      }
      localStorage.removeItem("adminAuthed");
      return null;
    },

    registerAdmin: async function (email, password, displayName) {
      await init();
      if (!state.enabled || !state.auth || !state.db) {
        throw new Error("Firebase belum dikonfigurasi.");
      }

      if (!isAdminSelfRegistrationEnabled()) {
        throw new Error("Pendaftaran admin baharu telah ditutup. Hubungi super admin.");
      }

      var cred = await state.auth.createUserWithEmailAndPassword(String(email || "").trim(), String(password || ""));
      var user = cred.user;

      if (user && displayName && typeof user.updateProfile === "function") {
        await user.updateProfile({ displayName: displayName });
      }

      if (!user) {
        throw new Error("Pengguna tidak ditemui selepas pendaftaran.");
      }

      await state.db.collection(adminCollectionName()).doc(user.uid).set({
        email: user.email || String(email || "").trim(),
        displayName: displayName || "",
        role: "admin",
        active: true,
        createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      return user;
    },

    isAdminSelfRegistrationEnabled: function () {
      return isAdminSelfRegistrationEnabled();
    },

    getCurrentUser: function () {
      if (!state.auth) {
        return null;
      }
      return state.auth.currentUser || null;
    },

    onAuthStateChanged: async function (callback) {
      await init();
      if (!state.enabled || !state.auth) {
        if (typeof callback === "function") {
          callback(null);
        }
        return function () {};
      }
      return state.auth.onAuthStateChanged(callback);
    },

    isCurrentUserAdmin: async function () {
      await init();

      if (!state.enabled || !state.auth || !state.db) {
        return localStorage.getItem("adminAuthed") === "true";
      }

      var user = await waitForResolvedUser();
      if (!user || !user.uid) {
        return false;
      }

      try {
        var snapshot = await state.db.collection(adminCollectionName()).doc(user.uid).get();
        if (!snapshot.exists) {
          return false;
        }
        var data = snapshot.data() || {};
        return data.active !== false;
      } catch (error) {
        console.error("[BC] Admin check failed", error);
        return false;
      }
    },

    requireAdmin: async function (redirectTo) {
      var isAdmin = await bridge.isCurrentUserAdmin();
      if (!isAdmin && redirectTo) {
        window.location.href = redirectTo;
      }
      return isAdmin;
    }
  };

  window.BCDataBridge = bridge;
  window.BCDataReady = init();
  window.BCFirebaseBridge = bridge;
})();
