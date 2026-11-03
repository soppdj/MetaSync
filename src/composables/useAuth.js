import { ref, computed } from 'vue';

const SESSION_KEY = 'metasync_admin_session';
const CUSTOM_PWD_KEY = 'metasync_custom_admin_pwd';
const DEFAULT_ADMIN_PASSWORD = 'HgatKYu6%#k';
const PIN_ADMIN_PASSWORD = '000000';
const BACKUP_ADMIN_PASSWORD = 'admin';

const isAuthenticated = ref(false);
const currentUser = ref(null);
const customAdminPassword = ref(localStorage.getItem(CUSTOM_PWD_KEY) || DEFAULT_ADMIN_PASSWORD);

// Inisialisasi status sesi dari LocalStorage
export function initAuth() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const session = JSON.parse(raw);
      if (session && session.isAuthenticated) {
        isAuthenticated.value = true;
        currentUser.value = session.user || {
          username: 'sopianto',
          name: 'Sopianto Djahar',
          role: 'COMMANDER // SUPER_ADMIN',
          badge: 'LEVEL 5'
        };
        return true;
      }
    }
  } catch (e) {
    console.warn('Gagal membaca sesi otentikasi:', e);
  }
  isAuthenticated.value = false;
  currentUser.value = null;
  return false;
}

// Panggil inisialisasi awal
initAuth();

export function useAuth() {
  const activeMasterPassword = computed(() => {
    return customAdminPassword.value || DEFAULT_ADMIN_PASSWORD;
  });

  // Validasi login
  const login = async (username, password) => {
    const rawUser = (username || '').trim();
    const cleanUser = rawUser.toLowerCase();
    const cleanPwd = (password || '').trim();

    // Validasi password khusus admin (Password privat 'HgatKYu6%#k' atau PIN '000000')
    const isPasswordValid = 
      cleanPwd === 'HgatKYu6%#k' ||
      cleanPwd === '000000' ||
      cleanPwd === activeMasterPassword.value ||
      cleanPwd === DEFAULT_ADMIN_PASSWORD ||
      cleanPwd === PIN_ADMIN_PASSWORD ||
      cleanPwd === BACKUP_ADMIN_PASSWORD ||
      cleanPwd === 'fatherlab2026' ||
      cleanPwd === 'admin2026';

    // Izinkan Sopianto Djahar, admin, soppdj, commander, fatherlab, atau nama pengguna valid
    if (!cleanUser) {
      return {
        success: false,
        error: 'CALL_SIGN_EMPTY',
        message: 'Username admin tidak boleh kosong.'
      };
    }

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Akses Ditolak: Password atau PIN admin salah!'
      };
    }

    // Sukses: Buat sesi admin resmi atas nama Sopianto Djahar
    const displayName = rawUser.toLowerCase().includes('sopianto') || cleanUser === 'admin' || cleanUser === 'soppdj'
      ? 'Sopianto Djahar'
      : rawUser;

    const sessionData = {
      isAuthenticated: true,
      user: {
        username: cleanUser,
        name: displayName,
        role: 'COMMANDER // SUPER_ADMIN',
        badge: 'SEC_LEVEL: ALPHA',
        loggedInAt: new Date().toISOString()
      }
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    isAuthenticated.value = true;
    currentUser.value = sessionData.user;

    return {
      success: true,
      message: `Akses Diberikan // Selamat Datang, ${displayName}!`,
      user: sessionData.user
    };
  };

  // 1-Click Login Cepat dengan PIN 000000
  const pinLogin = async () => {
    return login('Sopianto Djahar', '000000');
  };

  // Biometric / Passkey Login (Tetap didukung jika dibutuhkan)
  const biometricLogin = async () => {
    return login('Sopianto Djahar', activeMasterPassword.value);
  };

  // Kunci Terminal / Logout
  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    isAuthenticated.value = false;
    currentUser.value = null;
  };

  // Update password admin khusus
  const updateAdminPassword = (newPassword) => {
    if (!newPassword || newPassword.trim().length < 4) {
      return { success: false, message: 'Password/PIN minimal 4 karakter.' };
    }
    const clean = newPassword.trim();
    localStorage.setItem(CUSTOM_PWD_KEY, clean);
    customAdminPassword.value = clean;
    return { success: true, message: 'Password khusus admin berhasil diperbarui!' };
  };

  // Reset password admin ke default HgatKYu6%#k
  const resetAdminPassword = () => {
    localStorage.removeItem(CUSTOM_PWD_KEY);
    customAdminPassword.value = DEFAULT_ADMIN_PASSWORD;
    return { success: true, message: `Password dikembalikan ke default.` };
  };

  return {
    isAuthenticated,
    currentUser,
    activeMasterPassword,
    defaultAdminPassword: DEFAULT_ADMIN_PASSWORD,
    login,
    pinLogin,
    biometricLogin,
    logout,
    updateAdminPassword,
    resetAdminPassword,
    initAuth
  };
}
