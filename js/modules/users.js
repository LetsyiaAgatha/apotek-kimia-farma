/**
 * Users & Role Management Module
 */
import { state, saveState } from '../state.js';
import { showModal, closeModal, generateSafeId } from '../utils.js';

export const renderUsers = () => {
    const pageTitle = document.getElementById('current-page-title');
    const contentArea = document.getElementById('content-area');
    
    pageTitle.textContent = "Manajemen Hak Akses";
    
    contentArea.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h3>Daftar Karyawan & Role</h3>
                <button class="btn btn-primary" onclick="showAddUserModal()">
                    <i data-lucide="user-plus"></i> Tambah User Baru
                </button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nama Lengkap</th>
                            <th>Username</th>
                            <th>Role / Jabatan</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.users.map(u => `
                            <tr>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <div class="user-avatar" style="width: 32px; height: 32px; font-size: 0.8rem;">${u.avatar}</div>
                                        <strong>${u.name}</strong>
                                    </div>
                                </td>
                                <td>${u.username}</td>
                                <td><span class="status-badge status-primary">${u.role}</span></td>
                                <td><span class="status-badge status-success">${u.status}</span></td>
                                <td>
                                    <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.75rem;" onclick="window.showEditUserModal(${u.id})">Edit</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="card" style="margin-top: 32px; background: #f8fafc; border: 1px dashed var(--border);">
            <div style="display: flex; align-items: start; gap: 16px;">
                <div style="background: white; padding: 12px; border-radius: 50%; color: var(--primary);">
                    <i data-lucide="info" style="width: 24px; height: 24px;"></i>
                </div>
                <div>
                    <h4 style="margin-bottom: 4px;">Informasi Keamanan Kredensial</h4>
                    <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5;">
                        Kamu bisa keluar dari sistem menggunakan tombol <strong>Keluar dari Sistem</strong> di pojok kiri bawah.
                        Gunakan password default berikut untuk pengujian masing-masing peran: <br>
                        - Admin: <code>admin</code> / <code>admin123</code> <br>
                        - Apoteker: <code>apoteker1</code> / <code>apoteker123</code> <br>
                        - Kasir: <code>kasir1</code> / <code>kasir123</code>
                    </p>
                </div>
            </div>
        </div>
    `;

    if (window.lucide) {
        window.lucide.createIcons();
    }
};

export const updateSidebarMenuVisibility = () => {
    const role = state.currentUser ? state.currentUser.role : 'Administrator';
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    
    navItems.forEach(item => {
        const page = item.dataset.page;
        if (role === 'Kasir') {
            if (page === 'pos') {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        } else if (role === 'Apoteker') {
            if (page === 'users') {
                item.style.display = 'none';
            } else {
                item.style.display = '';
            }
        } else {
            item.style.display = '';
        }
    });
};

export const updateSidebarProfile = () => {
    const avatar = document.getElementById('footer-avatar');
    const name = document.getElementById('footer-name');
    const role = document.getElementById('footer-role');
    
    if (avatar && name && role && state.currentUser) {
        avatar.textContent = state.currentUser.avatar;
        name.textContent = state.currentUser.name;
        role.textContent = state.currentUser.role;
    }
    updateSidebarMenuVisibility();
};

export const renderLoginScreen = () => {
    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app');
    
    appContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
    
    loginContainer.innerHTML = `
        <div class="login-card">
            <div class="login-logo-container">
                <img src="img/logo.png" alt="Kimia Farma Logo" class="login-logo">
            </div>
            <div class="login-header">
                <h2>Apotek Kimia Farma</h2>
                <p>Sistem Informasi Operasional & Keuangan</p>
            </div>
            
            <div id="login-alert-container"></div>
            
            <form onsubmit="event.preventDefault(); window.handleLoginSubmit();">
                <div class="form-group">
                    <label class="form-label">Username</label>
                    <div class="input-wrapper">
                        <i data-lucide="user" class="input-icon"></i>
                        <input type="text" id="login-username" class="login-input" placeholder="Masukkan username..." required autofocus autocomplete="username">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <div class="input-wrapper">
                        <i data-lucide="lock" class="input-icon"></i>
                        <input type="password" id="login-password" class="login-input" placeholder="Masukkan password..." required autocomplete="current-password">
                        <button type="button" class="password-toggle" onclick="window.toggleLoginPasswordVisibility()">
                            <i data-lucide="eye" id="password-eye-icon" style="width: 18px; height: 18px;"></i>
                        </button>
                    </div>
                </div>
                
                <button type="submit" class="login-btn">
                    <span>Masuk ke Sistem</span>
                    <i data-lucide="arrow-right" style="width: 18px; height: 18px;"></i>
                </button>
            </form>
            
            <div class="login-footer">
                &copy; 2026 PT Kimia Farma Tbk. All Rights Reserved.
            </div>
        </div>
    `;
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
};

export const toggleLoginPasswordVisibility = () => {
    const passwordInput = document.getElementById('login-password');
    const eyeIcon = document.getElementById('password-eye-icon');
    if (passwordInput && eyeIcon) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.setAttribute('data-lucide', 'eye-off');
        } else {
            passwordInput.type = 'password';
            eyeIcon.setAttribute('data-lucide', 'eye');
        }
        if (window.lucide) window.lucide.createIcons();
    }
};

export const handleLoginSubmit = () => {
    const usernameInput = document.getElementById('login-username').value.trim();
    const passwordInput = document.getElementById('login-password').value;
    const alertContainer = document.getElementById('login-alert-container');
    
    const user = state.users.find(u => u.username.toLowerCase() === usernameInput.toLowerCase() && u.password === passwordInput);
    
    if (!user) {
        alertContainer.innerHTML = `
            <div class="login-alert">
                <i data-lucide="alert-circle" style="width: 16px; height: 16px; flex-shrink: 0;"></i>
                <span>Username atau Password salah!</span>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
    }
    
    if (user.status !== 'Aktif') {
        alertContainer.innerHTML = `
            <div class="login-alert">
                <i data-lucide="alert-circle" style="width: 16px; height: 16px; flex-shrink: 0;"></i>
                <span>Akun Anda dinonaktifkan. Hubungi Admin!</span>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
    }
    
    state.currentUser = {
        id: user.id,
        name: user.name,
        role: user.role,
        avatar: user.avatar
    };
    state.isLoggedIn = true;
    sessionStorage.setItem('activeUser', JSON.stringify(state.currentUser));
    
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    
    updateSidebarProfile();
    
    if (state.currentUser.role === 'Kasir') {
        window.navigate('pos');
    } else {
        window.navigate('dashboard');
    }
    
    alert(`Selamat datang kembali, ${state.currentUser.name}!`);
};

export const logoutUser = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
        sessionStorage.removeItem('activeUser');
        state.currentUser = null;
        state.isLoggedIn = false;
        renderLoginScreen();
    }
};

export const showAddUserModal = () => {
    showModal(`
        <div>
            <h2 style="margin-bottom: 16px;">Tambah Karyawan Baru</h2>
            <form onsubmit="event.preventDefault(); window.submitUser();">
                <div class="form-group" style="margin-bottom: 20px;">
                    <label>Nama Lengkap</label>
                    <input type="text" id="user-name" placeholder="Nama Lengkap" required style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border);">
                </div>
                <div class="grid-2-col" style="margin-bottom: 20px;">
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" id="user-username" placeholder="username" required style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border);">
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="user-password" placeholder="Password" required style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border);">
                    </div>
                </div>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label>Role / Jabatan</label>
                    <select id="user-role" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border);">
                        <option value="Administrator">Administrator</option>
                        <option value="Apoteker">Apoteker</option>
                        <option value="Kasir">Kasir</option>
                    </select>
                </div>
                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button type="submit" class="btn btn-primary" style="flex: 1; justify-content: center;">Simpan User</button>
                    <button type="button" class="btn btn-outline" onclick="closeModal()">Batal</button>
                </div>
            </form>
        </div>
    `);
};

export const submitUser = () => {
    const name = document.getElementById('user-name').value;
    const username = document.getElementById('user-username').value;
    const password = document.getElementById('user-password').value;
    const role = document.getElementById('user-role').value;
    
    state.users.push({
        id: generateSafeId(),
        name,
        username,
        password,
        role,
        status: 'Aktif',
        avatar: name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    });
    
    saveState();
    closeModal();
    renderUsers();
};

export const showEditUserModal = (id) => {
    const user = state.users.find(u => u.id === id);
    if (!user) return;
    
    showModal(`
        <div>
            <h2 style="margin-bottom: 16px;">Edit Karyawan</h2>
            <form onsubmit="event.preventDefault(); window.updateUser(${id});">
                <div class="form-group" style="margin-bottom: 20px;">
                    <label>Nama Lengkap</label>
                    <input type="text" id="edit-user-name" value="${user.name}" required style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border);">
                </div>
                <div class="grid-2-col" style="margin-bottom: 20px;">
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" id="edit-user-username" value="${user.username}" required style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border);">
                    </div>
                    <div class="form-group">
                        <label>Password Baru (Kosongkan jika tidak diganti)</label>
                        <input type="password" id="edit-user-password" placeholder="••••••••" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border);">
                    </div>
                </div>
                <div class="grid-2-col" style="margin-bottom: 20px;">
                    <div class="form-group">
                        <label>Role / Jabatan</label>
                        <select id="edit-user-role" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border);">
                            <option value="Administrator" ${user.role === 'Administrator' ? 'selected' : ''}>Administrator</option>
                            <option value="Apoteker" ${user.role === 'Apoteker' ? 'selected' : ''}>Apoteker</option>
                            <option value="Kasir" ${user.role === 'Kasir' ? 'selected' : ''}>Kasir</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Status Akun</label>
                        <select id="edit-user-status" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border);">
                            <option value="Aktif" ${user.status === 'Aktif' ? 'selected' : ''}>Aktif</option>
                            <option value="Nonaktif" ${user.status === 'Nonaktif' ? 'selected' : ''}>Nonaktif</option>
                        </select>
                    </div>
                </div>
                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button type="submit" class="btn btn-primary" style="flex: 1; justify-content: center;">Simpan Perubahan</button>
                    <button type="button" class="btn btn-outline" onclick="closeModal()">Batal</button>
                </div>
            </form>
        </div>
    `);
};

export const updateUser = (id) => {
    const user = state.users.find(u => u.id === id);
    if (!user) return;
    
    const name = document.getElementById('edit-user-name').value;
    const username = document.getElementById('edit-user-username').value;
    const password = document.getElementById('edit-user-password').value;
    const role = document.getElementById('edit-user-role').value;
    const status = document.getElementById('edit-user-status').value;
    
    user.name = name;
    user.username = username;
    if (password) {
        user.password = password;
    }
    user.role = role;
    user.status = status;
    user.avatar = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    
    saveState();
    closeModal();
    renderUsers();
    
    if (state.currentUser && state.currentUser.id === id) {
        state.currentUser.name = user.name;
        state.currentUser.role = user.role;
        state.currentUser.avatar = user.avatar;
        sessionStorage.setItem('activeUser', JSON.stringify(state.currentUser));
        updateSidebarProfile();
    }
};

// Bind to window
window.renderUsers = renderUsers;
window.updateSidebarProfile = updateSidebarProfile;
window.updateSidebarMenuVisibility = updateSidebarMenuVisibility;
window.showAddUserModal = showAddUserModal;
window.submitUser = submitUser;
window.showEditUserModal = showEditUserModal;
window.updateUser = updateUser;
window.renderLoginScreen = renderLoginScreen;
window.toggleLoginPasswordVisibility = toggleLoginPasswordVisibility;
window.handleLoginSubmit = handleLoginSubmit;
window.logoutUser = logoutUser;
