/**
 * Dashboard Module
 */
import { state } from '../state.js';
import { formatCurrency, formatDate } from '../utils.js';

export function renderDashboard() {
    const pageTitle = document.getElementById('current-page-title');
    const contentArea = document.getElementById('content-area');
    
    pageTitle.textContent = "Dashboard Overview";
    
    // Total Penjualan
    const totalSales = state.transactions.reduce((sum, t) => sum + (t.total || 0), 0);

    // Total Pembelian (dari pengadaan Beli Putus)
    const totalPurchases = (state.procurements || []).reduce((sum, p) => {
        const pSum = (p.items || []).reduce((itemSum, item) => itemSum + (item.qty * item.buyPrice), 0);
        return sum + pSum;
    }, 0);

    // Nilai Inventory (Tersedia / belum expired)
    const today = new Date();
    today.setHours(0,0,0,0);
    const inventoryValue = state.products.reduce((sum, p) => {
        const expDate = new Date(p.expiry);
        expDate.setHours(0,0,0,0);
        const isExpired = p.stock > 0 && expDate < today;
        const isDestroyed = p.status === 'Dimusnahkan';
        
        if (!isExpired && !isDestroyed && p.stock > 0) {
            return sum + (p.stock * (p.buyPrice || p.price || 0));
        }
        return sum;
    }, 0);

    // Kerugian Expired (Obat yang expired tapi belum dimusnahkan + realized loss dari pemusnahan Beli Putus)
    const pendingExpiredLoss = state.products.reduce((sum, p) => {
        if (p.origin === 'Konsinyasi') return sum; // Barang konsinyasi diretur, bukan kerugian apotek
        const expDate = new Date(p.expiry);
        expDate.setHours(0,0,0,0);
        const isExpired = p.stock > 0 && expDate < today;
        const isDestroyed = p.status === 'Dimusnahkan' || p.status === 'Diretur';

        if (isExpired && !isDestroyed) {
            return sum + (p.stock * (p.buyPrice || 0));
        }
        return sum;
    }, 0);

    const realizedDestroyedLoss = (state.destructionHistory || [])
        .filter(h => h.reason && !h.reason.startsWith('Retur:'))
        .reduce((sum, h) => sum + ((h.qty || 0) * (h.buyPrice || 0)), 0);

    const expiredLoss = pendingExpiredLoss + realizedDestroyedLoss;

    // Estimasi Laba (Laba Bersih)
    const estimatedProfit = state.transactions.reduce((sum, t) => {
        const tProfit = (t.items || []).reduce((itemSum, item) => {
            return itemSum + ((item.price - (item.buyPrice || 0)) * item.qty);
        }, 0);
        return sum + tProfit;
    }, 0);

    contentArea.innerHTML = `
        <div class="grid-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 24px;">
            <!-- CARD 1: Total Penjualan -->
            <div class="card stat-card" style="border: 1px solid #e2e8f0; border-top: 4px solid var(--primary); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 20px; display: flex; align-items: center; gap: 16px; border-radius: 16px; background: #fff;" 
                 onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 20px rgba(0,104,55,0.08)'" 
                 onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.05)'">
                <div class="stat-icon" style="background: rgba(0, 104, 55, 0.08); color: var(--primary); width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; flex-shrink: 0;">
                    <i data-lucide="trending-up" style="width: 24px; height: 24px;"></i>
                </div>
                <div class="stat-info" style="display: flex; flex-direction: column;">
                    <span class="stat-label" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">Total Penjualan</span>
                    <span class="stat-value" style="font-size: 1.4rem; font-weight: 700; color: var(--text-main); margin-top: 4px;">${formatCurrency(totalSales)}</span>
                </div>
            </div>

            <!-- CARD 2: Total Pembelian -->
            <div class="card stat-card" style="border: 1px solid #e2e8f0; border-top: 4px solid #ef4444; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 20px; display: flex; align-items: center; gap: 16px; border-radius: 16px; background: #fff;" 
                 onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 20px rgba(239,68,68,0.08)'" 
                 onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.05)'">
                <div class="stat-icon" style="background: rgba(239, 68, 68, 0.08); color: #ef4444; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; flex-shrink: 0;">
                    <i data-lucide="shopping-bag" style="width: 24px; height: 24px;"></i>
                </div>
                <div class="stat-info" style="display: flex; flex-direction: column;">
                    <span class="stat-label" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">Total Pembelian</span>
                    <span class="stat-value" style="font-size: 1.4rem; font-weight: 700; color: var(--text-main); margin-top: 4px;">${formatCurrency(totalPurchases)}</span>
                </div>
            </div>

            <!-- CARD 3: Nilai Inventory -->
            <div class="card stat-card" style="border: 1px solid #e2e8f0; border-top: 4px solid #3b82f6; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 20px; display: flex; align-items: center; gap: 16px; border-radius: 16px; background: #fff;" 
                 onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 20px rgba(59,130,246,0.08)'" 
                 onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.05)'">
                <div class="stat-icon" style="background: rgba(59, 130, 246, 0.08); color: #3b82f6; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; flex-shrink: 0;">
                    <i data-lucide="package" style="width: 24px; height: 24px;"></i>
                </div>
                <div class="stat-info" style="display: flex; flex-direction: column;">
                    <span class="stat-label" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">Nilai Inventory</span>
                    <span class="stat-value" style="font-size: 1.4rem; font-weight: 700; color: var(--text-main); margin-top: 4px;">${formatCurrency(inventoryValue)}</span>
                </div>
            </div>

            <!-- CARD 4: Kerugian Expired -->
            <div class="card stat-card" style="border: 1px solid #e2e8f0; border-top: 4px solid #f97316; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 20px; display: flex; align-items: center; gap: 16px; border-radius: 16px; background: #fff;" 
                 onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 20px rgba(249,115,22,0.08)'" 
                 onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.05)'">
                <div class="stat-icon" style="background: rgba(249, 115, 22, 0.08); color: #f97316; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; flex-shrink: 0;">
                    <i data-lucide="alert-triangle" style="width: 24px; height: 24px;"></i>
                </div>
                <div class="stat-info" style="display: flex; flex-direction: column;">
                    <span class="stat-label" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">Kerugian Expired</span>
                    <span class="stat-value" style="font-size: 1.4rem; font-weight: 700; color: #ea580c; margin-top: 4px;">${formatCurrency(expiredLoss)}</span>
                </div>
            </div>

            <!-- CARD 5: Estimasi Laba -->
            <div class="card stat-card" style="border: 1px solid #e2e8f0; border-top: 4px solid #10b981; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 20px; display: flex; align-items: center; gap: 16px; border-radius: 16px; background: #fff;" 
                 onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 20px rgba(16,185,129,0.08)'" 
                 onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.05)'">
                <div class="stat-icon" style="background: rgba(16, 185, 129, 0.08); color: #10b981; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; flex-shrink: 0;">
                    <i data-lucide="dollar-sign" style="width: 24px; height: 24px;"></i>
                </div>
                <div class="stat-info" style="display: flex; flex-direction: column;">
                    <span class="stat-label" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">Estimasi Laba</span>
                    <span class="stat-value" style="font-size: 1.4rem; font-weight: 700; color: #059669; margin-top: 4px;">${formatCurrency(estimatedProfit)}</span>
                </div>
            </div>
        </div>

        <div class="card" style="margin-top: 24px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; padding: 24px; background: #fff;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
                    <i data-lucide="activity" style="color: var(--primary); width: 20px; height: 20px;"></i>
                    Tren Penjualan & Laba 7 Hari Terakhir
                </h3>
                <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; gap: 16px; font-weight: 500;">
                    <span style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #006837; border-radius: 50%;"></span> Penjualan</span>
                    <span style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #10b981; border-radius: 50%;"></span> Estimasi Laba</span>
                </div>
            </div>
            <div style="height: 320px; position: relative;">
                <canvas id="salesChart"></canvas>
            </div>
        </div>

        <div class="card" style="margin-top: 24px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; padding: 24px; background: #fff;">
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                <i data-lucide="alert-circle" style="color: #ef4444; width: 20px; height: 20px;"></i>
                Peringatan Stok & Expired
            </h3>
            <div class="table-container" style="border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                            <th style="padding: 14px 18px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; color: var(--text-muted);">Nama Obat</th>
                            <th style="padding: 14px 18px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; color: var(--text-muted);">Kategori</th>
                            <th style="padding: 14px 18px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; color: var(--text-muted);">Stok</th>
                            <th style="padding: 14px 18px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; color: var(--text-muted);">Expired</th>
                            <th style="padding: 14px 18px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; color: var(--text-muted); text-align: right;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(function() {
                            const items = state.products.filter(p => p.status !== 'Dimusnahkan' && (p.stock < 15 || (new Date(p.expiry) - new Date()) / (1000 * 60 * 60 * 24) <= 30));
                            if (items.length === 0) {
                                return `
                                    <tr>
                                        <td colspan="5" style="text-align: center; padding: 32px; color: var(--text-muted); font-size: 0.9rem;">
                                            <i data-lucide="check-circle" style="color: #10b981; width: 32px; height: 32px; display: block; margin: 0 auto 8px;"></i>
                                            Semua stok aman dan tidak ada obat yang mendekati kedaluwarsa.
                                        </td>
                                    </tr>
                                `;
                            }
                            return items.map(p => {
                                const isLow = p.stock < 15;
                                const isExp = (new Date(p.expiry) - new Date()) / (1000 * 60 * 60 * 24) <= 30;
                                
                                let stockBadge = `<span style="font-weight: 500;">${p.stock} Unit</span>`;
                                if (isLow) {
                                    stockBadge = `<span class="status-badge" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; font-weight: 600; padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;"><i data-lucide="package" style="width: 12px; height: 12px;"></i> ${p.stock} Unit (Kritis)</span>`;
                                }

                                let expBadge = `<span>${formatDate(p.expiry)}</span>`;
                                if (isExp) {
                                    expBadge = `<span class="status-badge" style="background: rgba(249, 115, 22, 0.1); color: #ea580c; font-weight: 600; padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;"><i data-lucide="calendar" style="width: 12px; height: 12px;"></i> ${formatDate(p.expiry)} (Segera Expired)</span>`;
                                }

                                return `
                                     <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                                         <td style="padding: 14px 18px; vertical-align: middle;"><strong style="color: var(--text-main); font-size: 0.9rem;">${p.name}</strong></td>
                                         <td style="padding: 14px 18px; vertical-align: middle; color: var(--text-muted); font-size: 0.875rem;">${p.category}</td>
                                         <td style="padding: 14px 18px; vertical-align: middle;">${stockBadge}</td>
                                         <td style="padding: 14px 18px; vertical-align: middle;">${expBadge}</td>
                                         <td style="padding: 14px 18px; vertical-align: middle; text-align: right;">
                                             <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.75rem; border-radius: 8px; border: 1px solid var(--border); display: inline-flex; align-items: center; gap: 4px;" onclick="navigate('warehouse')">
                                                 Kelola <i data-lucide="chevron-right" style="width: 14px; height: 14px;"></i>
                                             </button>
                                         </td>
                                     </tr>
                                `;
                            }).join('');
                        })()}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

export function initDashboardChart() {
    const ctx = document.getElementById('salesChart');
    if (!ctx || typeof Chart === 'undefined') {
        console.warn("Chart container not found or Chart.js not loaded.");
        return;
    }

    // Ambil data 7 hari terakhir secara dinamis
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
    });

    const salesData = last7Days.map(dateStr => {
        return state.transactions.reduce((sum, t) => {
            if (t.timestamp && t.timestamp.startsWith(dateStr)) {
                return sum + t.total;
            }
            return sum;
        }, 0);
    });

    const profitData = last7Days.map(dateStr => {
        return state.transactions.reduce((sum, t) => {
            if (t.timestamp && t.timestamp.startsWith(dateStr)) {
                const tProfit = (t.items || []).reduce((itemSum, item) => {
                    return itemSum + ((item.price - (item.buyPrice || 0)) * item.qty);
                }, 0);
                return sum + tProfit;
            }
            return sum;
        }, 0);
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['H-6', 'H-5', 'H-4', 'H-3', 'H-2', 'H-1', 'Hari Ini'],
            datasets: [
                {
                    label: 'Penjualan',
                    data: salesData,
                    borderColor: '#006837',
                    backgroundColor: 'rgba(0, 104, 55, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Estimasi Laba',
                    data: profitData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return 'Rp.' + value.toLocaleString('id-ID');
                        }
                    },
                    grid: { color: '#f1f5f9' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

// Bind to window
window.renderDashboard = renderDashboard;
window.initDashboardChart = initDashboardChart;
