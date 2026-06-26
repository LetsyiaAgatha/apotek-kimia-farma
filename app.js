/**
 * Main Application Entry Point (Orchestrator)
 * Backend Mode — data di-load dari PHP API (MySQL)
 */

// Import Core
import { loadState, state } from './js/state.js?v=1.1.2';
import './js/utils.js?v=1.1.2';
import { navigate, updateActiveLink, renderPage } from './js/router.js?v=1.1.2';

// Import Modules (to register them)
import './js/modules/notifications.js?v=1.1.2';
import { updateNotificationBadge } from './js/modules/notifications.js?v=1.1.2';
import './js/modules/dashboard.js?v=1.1.2';
import './js/modules/pos.js?v=1.1.2';
import './js/modules/warehouse.js?v=1.1.2';
import './js/modules/consignment.js?v=1.1.2';
import './js/modules/reports.js?v=1.1.2';
import './js/modules/users.js?v=1.1.2';
import { updateSidebarProfile } from './js/modules/users.js?v=1.1.2';
import './js/modules/purchase_order.js?v=1.1.2';
import './js/modules/procurement.js?v=1.1.2';

// Global Search functionality
window.handleGlobalSearch = (e) => {
    const query = e.target.value.toLowerCase();
    const rows  = document.querySelectorAll('.table-container tbody tr');
    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(query) ? '' : 'none';
    });
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(query) ? '' : 'none';
    });
};

// Handle browser navigation (back/forward)
window.addEventListener('hashchange', () => {
    if (!state.isLoggedIn) {
        if (window.renderLoginScreen) {
            window.renderLoginScreen();
        }
        return;
    }
    const pageId = window.location.hash.slice(1) || 'dashboard';
    updateActiveLink(pageId);
    renderPage(pageId);
});

// ─────────────────────────────────────────────
// Boot the application (async — tunggu data dari DB)
// ─────────────────────────────────────────────
const initApp = async () => {
    const initialPage = window.location.hash.slice(1) || 'dashboard';

    // Tampilkan loading spinner sambil menunggu data dari API
    const contentArea = document.getElementById('content-area');
    if (contentArea) {
        contentArea.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center;
                        height:60vh; gap:16px; color:var(--text-muted);">
                <div style="width:40px; height:40px; border:4px solid var(--border);
                            border-top-color:var(--primary); border-radius:50%;
                            animation: spin 0.8s linear infinite;"></div>
                <p style="font-size:0.95rem;">Memuat data dari database...</p>
            </div>
            <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
        `;
    }

    // Load state dari database
    await loadState();
    console.log('[App] Data berhasil dimuat dari database.');

    // Sidebar setup
    const mobileToggle  = document.getElementById('mobile-toggle');
    const sidebarClose  = document.getElementById('sidebar-close');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebar       = document.querySelector('.sidebar');
    const appContainer  = document.querySelector('.app-container');

    const openSidebarMobile  = () => {
        sidebar?.classList.add('open');
        sidebarOverlay?.classList.remove('hidden');
    };
    const closeSidebarMobile = () => {
        sidebar?.classList.remove('open');
        sidebarOverlay?.classList.add('hidden');
    };
    const toggleSidebar = () => {
        if (window.innerWidth <= 1024) {
            sidebar?.classList.contains('open') ? closeSidebarMobile() : openSidebarMobile();
        } else {
            appContainer?.classList.toggle('sidebar-collapsed');
        }
    };

    mobileToggle?.addEventListener('click', toggleSidebar);
    sidebarClose?.addEventListener('click', closeSidebarMobile);
    sidebarOverlay?.addEventListener('click', closeSidebarMobile);

    document.querySelectorAll('.sidebar-nav .nav-item').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 1024) closeSidebarMobile();
        });
    });

    // Render halaman setelah data siap jika sudah login
    if (state.isLoggedIn) {
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        navigate(initialPage);
        updateSidebarProfile();
        updateNotificationBadge();
    } else {
        if (window.renderLoginScreen) {
            window.renderLoginScreen();
        }
    }
};

// Dynamic Print Metadata Handler
window.addEventListener('beforeprint', () => {
    const printUserEl = document.getElementById('print-user');
    const printDateEl = document.getElementById('print-date');
    const printPeriodEl = document.getElementById('print-period');
    
    if (printUserEl && window.state && window.state.currentUser) {
        printUserEl.textContent = window.state.currentUser.name + ' (' + window.state.currentUser.role + ')';
    }
    if (printDateEl) {
        printDateEl.textContent = new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
    }
    if (printPeriodEl && window.getReportPeriodText) {
        printPeriodEl.textContent = window.getReportPeriodText();
    }
});

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
