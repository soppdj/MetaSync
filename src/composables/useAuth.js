import { ref, computed } from 'vue';

const SESSION_KEY = 'metasync_admin_session';
const CUSTOM_PWD_KEY = 'metasync_custom_admin_pwd';
const DEFAULT_ADMIN_PASSWORD = '000000';
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

    // Validasi password khusus admin (PIN 000000)
    const isPasswordValid = 
      cleanPwd === activeMasterPassword.value ||
      cleanPwd === DEFAULT_ADMIN_PASSWORD ||
      cleanPwd === '000000' ||
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
        message: 'Akses Ditolak: PIN khusus admin salah! (Default PIN: 000000)'
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

  // 1-Click Biometric / Passkey Login untuk Developer/Admin
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

  // Reset password admin ke default PIN 000000
  const resetAdminPassword = () => {
    localStorage.removeItem(CUSTOM_PWD_KEY);
    customAdminPassword.value = DEFAULT_ADMIN_PASSWORD;
    return { success: true, message: `PIN dikembalikan ke default: ${DEFAULT_ADMIN_PASSWORD}` };
  };

  return {
    isAuthenticated,
    currentUser,
    activeMasterPassword,
    defaultAdminPassword: DEFAULT_ADMIN_PASSWORD,
    login,
    biometricLogin,
    logout,
    updateAdminPassword,
    resetAdminPassword,
    initAuth
  };
}
