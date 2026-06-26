/**
 * Application Router & Page Controller
 */
import { state } from './state.js';
import { renderDashboard, initDashboardChart } from './modules/dashboard.js';
import { renderPOS } from './modules/pos.js';
import { renderWarehouse } from './modules/warehouse.js';
import { renderConsignment } from './modules/consignment.js';
import { renderReports } from './modules/reports.js';
import { renderUsers, updateSidebarProfile } from './modules/users.js';
import { renderNotifications } from './modules/notifications.js';
import { renderPurchaseOrder } from './modules/purchase_order.js';
import { renderProcurement } from './modules/procurement.js';

const contentArea = document.getElementById('content-area');

export const updateActiveLink = (pageId) => {
    document.querySelectorAll('.nav-item').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageId) {
            link.classList.add('active');
        }
    });
};

export const renderPage = (pageId) => {
    if (!state.isLoggedIn) {
        if (window.renderLoginScreen) {
            window.renderLoginScreen();
        }
        return;
    }

    // Route Guard based on role
    const role = state.currentUser ? state.currentUser.role : 'Administrator';
    if (role === 'Kasir' && pageId !== 'pos') {
        pageId = 'pos';
        window.location.hash = 'pos';
    } else if (role === 'Apoteker' && pageId === 'users') {
        pageId = 'dashboard';
        window.location.hash = 'dashboard';
    }

    contentArea.innerHTML = '<div class="loader">Memuat...</div>';
    
    setTimeout(() => {
        try {
            switch (pageId) {
                case 'procurement':
                    renderProcurement();
                    break;
                case 'dashboard':
                    renderDashboard();
                    // Kasih delay sedikit lebih lama agar DOM benar-benar siap
                    setTimeout(() => {
                        try {
                            window.initDashboardChart();
                        } catch (e) {
                            console.error("Chart Init Error:", e);
                        }
                    }, 300);
                    break;
                case 'pos':
                    renderPOS();
                    break;
                case 'warehouse':
                    renderWarehouse();
                    break;
                case 'consignment':
                    renderConsignment();
                    break;
                case 'purchase_order':
                    renderPurchaseOrder();
                    break;
                case 'reports':
                    renderReports();
                    break;
                case 'notifications':
                    renderNotifications();
                    break;
                case 'users':
                    renderUsers();
                    break;
                default:
                    renderDashboard();
            }
            if (window.lucide) {
                window.lucide.createIcons();
            }
        } catch (error) {
            console.error("Render Error:", error);
            contentArea.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <h3 style="color: #991b1b;">Waduh, terjadi kendala tampilan.</h3>
                    <p style="margin: 16px 0; color: var(--text-muted);">Error: ${error.message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">Refresh Halaman</button>
                    <button class="btn btn-outline" style="margin-left: 10px;" onclick="localStorage.clear(); location.href=location.pathname;">Reset Data Sistem</button>
                </div>
            `;
        }
    }, 300);
    updateSidebarProfile();
};

export const navigate = (pageId) => {
    if (!state.isLoggedIn) {
        if (window.renderLoginScreen) {
            window.renderLoginScreen();
        }
        return;
    }
    window.location.hash = pageId;
    updateActiveLink(pageId);
    renderPage(pageId);
};

// Bind to window
window.navigate = navigate;
window.renderPage = renderPage;
