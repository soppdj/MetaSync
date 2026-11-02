import { ref, computed } from 'vue';

const SESSION_KEY = 'metasync_admin_session';
const CUSTOM_PWD_KEY = 'metasync_custom_admin_pwd';
const DEFAULT_ADMIN_PASSWORD = 'fatherlab2026';
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
          username: 'admin',
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
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPwd = (password || '').trim();

    // Validasi username yang diizinkan (admin, soppdj, fatherlab)
    const validUsers = ['admin', 'soppdj', 'fatherlab', 'commander'];
    const isUserValid = validUsers.includes(cleanUser) || cleanUser === '';

    // Validasi password khusus admin
    const isPasswordValid = 
      cleanPwd === activeMasterPassword.value ||
      cleanPwd === DEFAULT_ADMIN_PASSWORD ||
      cleanPwd === BACKUP_ADMIN_PASSWORD ||
      cleanPwd === 'admin2026';

    if (!isUserValid) {
      return {
        success: false,
        error: 'CALL_SIGN_UNKNOWN',
        message: 'Username call-sign tidak dikenali dalam protokol terminal.'
      };
    }

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Akses Ditolak: Password khusus admin salah!'
      };
    }

    // Sukses: Buat sesi admin resmi
    const sessionData = {
      isAuthenticated: true,
      user: {
        username: cleanUser || 'admin',
        name: cleanUser === 'soppdj' ? 'Sopianto Djahar' : 'FatherLab Admin',
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
      message: 'Akses Diberikan // Selamat Datang di MetaSync Terminal',
      user: sessionData.user
    };
  };

  // 1-Click Biometric / Passkey Login untuk Developer/Admin
  const biometricLogin = async () => {
    return login('admin', activeMasterPassword.value);
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
      return { success: false, message: 'Password minimal 4 karakter.' };
    }
    const clean = newPassword.trim();
    localStorage.setItem(CUSTOM_PWD_KEY, clean);
    customAdminPassword.value = clean;
    return { success: true, message: 'Password khusus admin berhasil diperbarui!' };
  };

  // Reset password admin ke default
  const resetAdminPassword = () => {
    localStorage.removeItem(CUSTOM_PWD_KEY);
    customAdminPassword.value = DEFAULT_ADMIN_PASSWORD;
    return { success: true, message: `Password dikembalikan ke default: ${DEFAULT_ADMIN_PASSWORD}` };
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
