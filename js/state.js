/**
 * Central State Management — Backend Mode
 * Data disimpan ke MySQL via PHP API, bukan localStorage
 */

// ─────────────────────────────────────────────
// State aktif di memori (diisi dari DB saat load)
// ─────────────────────────────────────────────
// Ambil session user jika ada
const savedUser = sessionStorage.getItem('activeUser');

export const state = {
    products:          [],
    consignment:       [],
    transactions:      [],
    users:             [],
    cart:              [],
    currentUser:       savedUser ? JSON.parse(savedUser) : null,
    isLoggedIn:        !!savedUser,
    seenNotifications: [],
    purchaseOrders:    [],
    destructionHistory:[],
    procurements:      [],
    stockAdjustments:  [],
};

// ─────────────────────────────────────────────
// loadState() — Ambil semua data dari PHP API
// ─────────────────────────────────────────────
export const loadState = async () => {
    try {
        const res  = await fetch('api/state.php');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();

        state.products          = data.products          ?? [];
        state.consignment       = data.consignment       ?? [];
        state.transactions      = data.transactions      ?? [];
        state.users             = data.users             ?? [];
        state.purchaseOrders    = data.purchaseOrders    ?? [];
        state.destructionHistory = data.destructionHistory ?? [];
        state.procurements       = data.procurements       ?? [];
        state.stockAdjustments   = data.stockAdjustments   ?? [];
        state.cart              = [];
        const activeSession     = sessionStorage.getItem('activeUser');
        state.currentUser       = activeSession ? JSON.parse(activeSession) : null;
        state.isLoggedIn        = !!state.currentUser;
        state.seenNotifications = data.seenNotifications ?? [];
    } catch (err) {
        console.error('[State] Gagal load dari API, gunakan data kosong.', err);
    }
};

// ─────────────────────────────────────────────
// saveState() — Kirim seluruh state ke PHP API
// ─────────────────────────────────────────────
export const saveState = async () => {
    try {
        await fetch('api/state.php', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                products:          state.products,
                consignment:       state.consignment,
                transactions:      state.transactions,
                users:             state.users,
                purchaseOrders:    state.purchaseOrders,
                seenNotifications: state.seenNotifications,
                destructionHistory:state.destructionHistory,
                procurements:      state.procurements,
                stockAdjustments:  state.stockAdjustments,
            }),
        });
    } catch (err) {
        console.error('[State] Gagal simpan ke API.', err);
    }
    if (window.updateNotificationBadge) window.updateNotificationBadge();
};

// ─────────────────────────────────────────────
// uploadPhoto() — Upload file foto ke server
// Mengembalikan URL string (di /apotek/uploads/xxx.jpg)
// atau null jika gagal
// ─────────────────────────────────────────────
export const uploadPhoto = async (file) => {
    if (!file) return null;
    try {
        const formData = new FormData();
        formData.append('photo', file);
        const res  = await fetch('api/upload.php', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) return data.url;
        console.error('[Upload] Server error:', data.error);
        return null;
    } catch (err) {
        console.error('[Upload] Gagal upload foto:', err);
        return null;
    }
};

export const setStateFilter = (filter) => {
    state.consignmentFilterTab = filter;
};

// Export ke window (legacy support agar modul lama tetap bisa akses)
window.state     = state;
window.saveState = saveState;
