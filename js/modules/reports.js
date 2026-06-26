/**
 * Reports Module
 */
import { state } from '../state.js';
import { formatCurrency, showModal, formatDate } from '../utils.js';

let activeTab = 'pos'; // 'pos', 'supplier', 'financial', or 'destruction'
let activeFinancialSubTab = 'pemasukan';

let currentPeriod = 'all'; // 'all', 'month-this', 'month-last', 'year-this', 'custom'
let customStartDate = '';
let customEndDate = '';

// Helper to filter dates based on period
function isInPeriod(dateStr) {
    if (!dateStr) return false;
    if (currentPeriod === 'all') return true;

    // Extract date portion (YYYY-MM-DD)
    const normalizedDateStr = dateStr.slice(0, 10);
    const recordDate = new Date(normalizedDateStr);
    if (isNaN(recordDate.getTime())) return false;
    recordDate.setHours(0, 0, 0, 0);

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    
    const startOfThisYear = new Date(now.getFullYear(), 0, 1);
    const endOfThisYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    if (currentPeriod === 'month-this') {
        return recordDate >= startOfThisMonth && recordDate <= endOfThisMonth;
    }
    
    if (currentPeriod === 'month-last') {
        return recordDate >= startOfLastMonth && recordDate <= endOfLastMonth;
    }

    if (currentPeriod === 'year-this') {
        return recordDate >= startOfThisYear && recordDate <= endOfThisYear;
    }

    if (currentPeriod === 'custom') {
        if (!customStartDate || !customEndDate) return true; // Don't filter if incomplete
        const start = new Date(customStartDate);
        start.setHours(0,0,0,0);
        const end = new Date(customEndDate);
        end.setHours(23,59,59,999);
        return recordDate >= start && recordDate <= end;
    }

    return true;
}

// Helper to get selected period text for print/UI
export function getReportPeriodText() {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const now = new Date();
    
    if (currentPeriod === 'all') return 'Semua Waktu';
    if (currentPeriod === 'month-this') return `Bulan Ini (${months[now.getMonth()]} ${now.getFullYear()})`;
    if (currentPeriod === 'month-last') {
        const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return `Bulan Lalu (${months[prevMonth.getMonth()]} ${prevMonth.getFullYear()})`;
    }
    if (currentPeriod === 'year-this') return `Tahun Ini (${now.getFullYear()})`;
    if (currentPeriod === 'custom') {
        if (!customStartDate || !customEndDate) return 'Rentang Kustom';
        return `${formatDate(customStartDate)} s/d ${formatDate(customEndDate)}`;
    }
    return 'Semua Waktu';
}
window.getReportPeriodText = getReportPeriodText;

export function setReportPeriod(period) {
    currentPeriod = period;
    renderReports();
}
window.setReportPeriod = setReportPeriod;

export function setCustomDates() {
    customStartDate = document.getElementById('custom-start-date').value;
    customEndDate = document.getElementById('custom-end-date').value;
    renderReports();
}
window.setCustomDates = setCustomDates;

export function setFinancialSubTab(subTab) {
    activeFinancialSubTab = subTab;
    renderReports();
}
window.setFinancialSubTab = setFinancialSubTab;

export const renderReports = () => {
    const pageTitle = document.getElementById('current-page-title');
    const contentArea = document.getElementById('content-area');

    pageTitle.textContent = "Laporan Operasional & Keuangan";

    // If currentUser is Kasir and activeTab is not pos, switch to pos
    if (state.currentUser.role === 'Kasir' && activeTab !== 'pos') {
        activeTab = 'pos';
    }

    const role = state.currentUser ? state.currentUser.role : 'Administrator';

    contentArea.innerHTML = `
        <!-- Filter Periode (no-print) -->
        <div class="card no-print" style="margin-bottom: 24px; padding: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <i data-lucide="calendar" style="color: var(--primary); width: 20px; height: 20px;"></i>
                    <span style="font-weight: 600; font-size: 0.95rem; color: var(--text-main);">Filter Periode Laporan:</span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                    <select id="report-period-select" onchange="window.setReportPeriod(this.value)" class="form-control" style="padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border); font-size: 0.85rem; font-weight: 500; cursor: pointer; min-width: 150px;">
                        <option value="all" ${currentPeriod === 'all' ? 'selected' : ''}>Semua Waktu</option>
                        <option value="month-this" ${currentPeriod === 'month-this' ? 'selected' : ''}>Bulan Ini</option>
                        <option value="month-last" ${currentPeriod === 'month-last' ? 'selected' : ''}>Bulan Lalu</option>
                        <option value="year-this" ${currentPeriod === 'year-this' ? 'selected' : ''}>Tahun Ini</option>
                        <option value="custom" ${currentPeriod === 'custom' ? 'selected' : ''}>Rentang Kustom...</option>
                    </select>
                    
                    <div id="custom-date-inputs" style="display: ${currentPeriod === 'custom' ? 'flex' : 'none'}; align-items: center; gap: 8px;">
                        <input type="date" id="custom-start-date" value="${customStartDate}" onchange="window.setCustomDates()" style="padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border); font-size: 0.85rem;">
                        <span style="color: var(--text-muted); font-size: 0.85rem;">s/d</span>
                        <input type="date" id="custom-end-date" value="${customEndDate}" onchange="window.setCustomDates()" style="padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border); font-size: 0.85rem;">
                    </div>
                </div>
            </div>
        </div>

        <div class="no-print" style="margin-bottom: 24px;">
            <div class="tabs">
                <button class="tab-btn ${activeTab === 'pos' ? 'active' : ''}" onclick="window.setReportTab('pos')">
                    <i data-lucide="shopping-cart"></i> Penjualan Kasir (POS)
                </button>
                ${(role === 'Administrator' || role === 'Apoteker') ? `
                <button class="tab-btn ${activeTab === 'supplier' ? 'active' : ''}" onclick="window.setReportTab('supplier')">
                    <i data-lucide="truck"></i> Transaksi Supplier
                </button>
                ` : ''}
                ${(role === 'Administrator' || role === 'Apoteker') ? `
                <button class="tab-btn ${activeTab === 'financial' ? 'active' : ''}" onclick="window.setReportTab('financial')">
                    <i data-lucide="line-chart"></i> Laporan Keuangan
                </button>
                ` : ''}
                ${(role === 'Administrator' || role === 'Apoteker') ? `
                <button class="tab-btn ${activeTab === 'destruction' ? 'active' : ''}" onclick="window.setReportTab('destruction')">
                    <i data-lucide="trash-2"></i> Histori Pemusnahan
                </button>
                ` : ''}
            </div>
        </div>

        <div id="report-content">
            ${activeTab === 'pos' ? renderPOSReport() : 
              (activeTab === 'supplier' ? renderSupplierReport() : 
              (activeTab === 'financial' ? renderFinancialReport() : 
              (activeTab === 'destruction' ? renderDestructionReport() : '')))}
        </div>
    `;

    if (window.lucide) {
        window.lucide.createIcons();
    }
};

export function setReportTab(tab) {
    activeTab = tab;
    renderReports();
}

function renderPOSReport() {
    const filteredTransactions = state.transactions.filter(t => isInPeriod(t.timestamp));
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = filteredTransactions.length;

    return `
        <div class="grid-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 24px;">
            <!-- CARD 1: Total Omzet -->
            <div class="card stat-card" style="border: 1px solid #e2e8f0; border-top: 4px solid var(--primary); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 20px; display: flex; align-items: center; gap: 16px; border-radius: 16px; background: #fff;" 
                 onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 20px rgba(0,104,55,0.08)'" 
                 onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.05)'">
                <div class="stat-icon" style="background: rgba(0, 104, 55, 0.08); color: var(--primary); width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; flex-shrink: 0;">
                    <i data-lucide="trending-up" style="width: 24px; height: 24px;"></i>
                </div>
                <div class="stat-info" style="display: flex; flex-direction: column;">
                    <span class="stat-label" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">Total Omzet Penjualan</span>
                    <span class="stat-value" style="font-size: 1.4rem; font-weight: 700; color: var(--text-main); margin-top: 4px;">${formatCurrency(totalRevenue)}</span>
                </div>
            </div>

            <!-- CARD 2: Jumlah Transaksi -->
            <div class="card stat-card" style="border: 1px solid #e2e8f0; border-top: 4px solid var(--secondary); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 20px; display: flex; align-items: center; gap: 16px; border-radius: 16px; background: #fff;" 
                 onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 20px rgba(247,148,29,0.08)'" 
                 onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.05)'">
                <div class="stat-icon" style="background: rgba(247, 148, 29, 0.08); color: var(--secondary); width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; flex-shrink: 0;">
                    <i data-lucide="file-text" style="width: 24px; height: 24px;"></i>
                </div>
                <div class="stat-info" style="display: flex; flex-direction: column;">
                    <span class="stat-label" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">Jumlah Transaksi</span>
                    <span class="stat-value" style="font-size: 1.4rem; font-weight: 700; color: var(--text-main); margin-top: 4px;">${totalTransactions} Nota</span>
                </div>
            </div>
        </div>

        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3>Histori Penjualan POS</h3>
                <button class="btn btn-outline" style="font-size: 0.8rem;" onclick="window.print()"><i data-lucide="printer"></i> Cetak Laporan</button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID Nota</th>
                            <th>Waktu Transaksi</th>
                            <th>Total Bayar</th>
                            <th>Kasir</th>
                            <th>Status</th>
                            <th class="no-print">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredTransactions.length === 0 ? '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 32px;">Belum ada histori penjualan untuk periode ini.</td></tr>' :
                            filteredTransactions.map(t => `
                                <tr>
                                    <td><strong style="color: var(--primary);">#TR-${t.id.toString().slice(-6)}</strong></td>
                                    <td>${t.timestamp}</td>
                                    <td><strong>${formatCurrency(t.total)}</strong></td>
                                    <td>${state.currentUser.name}</td>
                                    <td><span class="status-badge status-success">Terbayar</span></td>
                                    <td class="no-print">
                                        <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.75rem;" onclick="viewTransactionDetail(${t.id})">Detail</button>
                                    </td>
                                </tr>
                            `).join('')
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderSupplierReport() {
    const filteredConsignment = state.consignment.filter(c => isInPeriod(c.dateReceived));
    const totalDebt = filteredConsignment.filter(c => c.status === 'Aktif').reduce((sum, c) => sum + (c.sold * c.basePrice), 0);
    const totalPaid = filteredConsignment.filter(c => c.status === 'Lunas').reduce((sum, c) => sum + (c.sold * c.basePrice), 0);
    const totalMargin = filteredConsignment.reduce((sum, c) => sum + (c.sold * ((c.sellPrice || c.basePrice) - c.basePrice)), 0);

    return `
        <div class="grid-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 24px;">
            <!-- CARD 1: Terbayar ke Supplier -->
            <div class="card stat-card" style="border: 1px solid #e2e8f0; border-top: 4px solid #16a34a; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 20px; display: flex; align-items: center; gap: 16px; border-radius: 16px; background: #fff;" 
                 onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 20px rgba(22,163,74,0.08)'" 
                 onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.05)'">
                <div class="stat-icon" style="background: rgba(22, 163, 74, 0.08); color: #16a34a; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; flex-shrink: 0;">
                    <i data-lucide="check-circle" style="width: 24px; height: 24px;"></i>
                </div>
                <div class="stat-info" style="display: flex; flex-direction: column;">
                    <span class="stat-label" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">Total Terbayar ke Supplier</span>
                    <span class="stat-value" style="font-size: 1.4rem; font-weight: 700; color: #16a34a; margin-top: 4px;">${formatCurrency(totalPaid)}</span>
                </div>
            </div>

            <!-- CARD 2: Utang Supplier -->
            <div class="card stat-card" style="border: 1px solid #e2e8f0; border-top: 4px solid #dc2626; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 20px; display: flex; align-items: center; gap: 16px; border-radius: 16px; background: #fff;" 
                 onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 20px rgba(220,38,38,0.08)'" 
                 onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.05)'">
                <div class="stat-icon" style="background: rgba(220, 38, 38, 0.08); color: #dc2626; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; flex-shrink: 0;">
                    <i data-lucide="alert-circle" style="width: 24px; height: 24px;"></i>
                </div>
                <div class="stat-info" style="display: flex; flex-direction: column;">
                    <span class="stat-label" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">Utang Supplier (Pending)</span>
                    <span class="stat-value" style="font-size: 1.4rem; font-weight: 700; color: #dc2626; margin-top: 4px;">${formatCurrency(totalDebt)}</span>
                </div>
            </div>

            <!-- CARD 3: Laba Bersih Konsinyasi -->
            <div class="card stat-card" style="border: 1px solid #e2e8f0; border-top: 4px solid var(--primary); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 20px; display: flex; align-items: center; gap: 16px; border-radius: 16px; background: #fff;" 
                 onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 20px rgba(0,104,55,0.08)'" 
                 onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.05)'">
                <div class="stat-icon" style="background: rgba(0, 104, 55, 0.08); color: var(--primary); width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; flex-shrink: 0;">
                    <i data-lucide="trending-up" style="width: 24px; height: 24px;"></i>
                </div>
                <div class="stat-info" style="display: flex; flex-direction: column;">
                    <span class="stat-label" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">Laba Bersih Konsinyasi</span>
                    <span class="stat-value" style="font-size: 1.4rem; font-weight: 700; color: var(--text-main); margin-top: 4px;">${formatCurrency(totalMargin)}</span>
                </div>
            </div>
        </div>

        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3>Rekap Transaksi Supplier (Konsinyasi)</h3>
                <div style="font-size: 0.85rem; color: var(--text-muted);">Menampilkan histori stok masuk & penyelesaian utang</div>
            </div>
            <div class="table-container">
                <table style="min-width: 900px;">
                    <thead>
                        <tr>
                            <th>Ref. Konsinyasi</th>
                            <th>Nama Supplier</th>
                            <th>Item & Qty</th>
                            <th>Total Nilai Tagihan</th>
                            <th>Tgl. Terima</th>
                            <th>Status Akuntansi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredConsignment.length === 0 ? '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 32px;">Belum ada data barang titipan untuk periode ini.</td></tr>' :
                            filteredConsignment.map(c => {
                                const totalBill = c.sold * c.basePrice;
                                return `
                                    <tr>
                                        <td><strong>#KNS-${c.id}</strong></td>
                                        <td><strong>${c.supplier}</strong></td>
                                        <td>${c.items} (${c.qty}u)</td>
                                        <td><strong>${formatCurrency(totalBill)}</strong></td>
                                        <td>${formatDate(c.dateReceived)}</td>
                                        <td>
                                            <span class="status-badge ${c.status === 'Lunas' ? 'status-success' : (c.status === 'Aktif' ? 'status-warning' : 'status-danger')}">
                                                ${c.status === 'Lunas' ? 'Sudah Dibayar' : (c.status === 'Aktif' ? 'Utang Berjalan' : 'Diretur')}
                                            </span>
                                        </td>
                                    </tr>
                                `;
                            }).join('')
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderFinancialReport() {
    const role = state.currentUser ? state.currentUser.role : 'Administrator';

    const filteredTransactions = state.transactions.filter(t => isInPeriod(t.timestamp));
    const filteredProcurements = (state.procurements || []).filter(p => isInPeriod(p.purchaseDate));

    // 1. Calculate Revenue & COGS
    const totalSales = filteredTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
    const totalPurchases = filteredProcurements.reduce((sum, p) => {
        const pSum = (p.items || []).reduce((itemSum, item) => itemSum + (item.qty * item.buyPrice), 0);
        return sum + pSum;
    }, 0);

    const today = new Date();
    today.setHours(0,0,0,0);

    const pendingExpiredLoss = state.products.reduce((sum, p) => {
        if (p.origin === 'Konsinyasi') return sum; // Barang konsinyasi diretur, bukan kerugian apotek
        const expDate = new Date(p.expiry);
        expDate.setHours(0,0,0,0);
        const isExpired = p.stock > 0 && expDate < today;
        const isDestroyed = p.status === 'Dimusnahkan' || p.status === 'Diretur';
        if (isExpired && !isDestroyed && isInPeriod(p.expiry)) {
            return sum + (p.stock * (p.buyPrice || 0));
        }
        return sum;
    }, 0);

    const realizedDestroyedLoss = (state.destructionHistory || [])
        .filter(h => h.reason && !h.reason.startsWith('Retur:') && isInPeriod(h.destructionDate))
        .reduce((sum, h) => sum + ((h.qty || 0) * (h.buyPrice || 0)), 0);

    const expiredLoss = pendingExpiredLoss + realizedDestroyedLoss;

    const estimatedProfit = filteredTransactions.reduce((sum, t) => {
        const tProfit = (t.items || []).reduce((itemSum, item) => {
            return itemSum + ((item.price - (item.buyPrice || 0)) * item.qty);
        }, 0);
        return sum + tProfit;
    }, 0);

    // 2. Prepare Ledger/Financial Sub-Tabs
    let subTableHtml = '';
    if (activeFinancialSubTab === 'pemasukan') {
        subTableHtml = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h4 style="margin: 0; color: var(--primary);">Laporan Pemasukan (Penjualan POS)</h4>
                <button class="btn btn-outline" style="font-size: 0.75rem; padding: 6px 12px;" onclick="window.print()"><i data-lucide="printer" style="width: 14px;"></i> Cetak Laporan</button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>Nomor Transaksi</th>
                            <th>Produk</th>
                            <th>Qty</th>
                            <th style="text-align: right;">Nilai Penjualan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredTransactions.length === 0 ? '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 32px;">Belum ada data pemasukan untuk periode ini.</td></tr>' :
                            filteredTransactions.flatMap(t => 
                                (t.items || []).map(item => `
                                    <tr>
                                        <td>${t.timestamp}</td>
                                        <td><strong style="color: var(--primary);">#TR-${t.id.toString().slice(-6)}</strong></td>
                                        <td><strong>${item.name}</strong></td>
                                        <td>${item.qty} Unit</td>
                                        <td style="text-align: right; font-weight: 600; color: #16a34a;">${formatCurrency(item.price * item.qty)}</td>
                                    </tr>
                                `)
                            ).join('')
                        }
                    </tbody>
                </table>
            </div>
        `;
    } else if (activeFinancialSubTab === 'pengeluaran') {
        subTableHtml = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h4 style="margin: 0; color: var(--primary);">Laporan Pengeluaran (Pembelian Beli Putus)</h4>
                <button class="btn btn-outline" style="font-size: 0.75rem; padding: 6px 12px;" onclick="window.print()"><i data-lucide="printer" style="width: 14px;"></i> Cetak Laporan</button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>Nomor Pengadaan</th>
                            <th>Supplier</th>
                            <th>Produk</th>
                            <th>Qty</th>
                            <th style="text-align: right;">Harga Beli</th>
                            <th style="text-align: right;">Nilai Pembelian</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(filteredProcurements.length === 0) ? '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 32px;">Belum ada data pengeluaran untuk periode ini.</td></tr>' :
                            filteredProcurements.flatMap(p => 
                                (p.items || []).map(item => `
                                    <tr>
                                        <td>${formatDate(p.purchaseDate)}</td>
                                        <td><strong style="color: var(--primary);">${p.procurementNo}</strong></td>
                                        <td><strong>${p.supplierName}</strong></td>
                                        <td>${item.productName}</td>
                                        <td>${item.qty} Unit</td>
                                        <td style="text-align: right;">${formatCurrency(item.buyPrice)}</td>
                                        <td style="text-align: right; font-weight: 600; color: #dc2626;">${formatCurrency(item.qty * item.buyPrice)}</td>
                                    </tr>
                                `)
                            ).join('')
                        }
                    </tbody>
                </table>
            </div>
        `;
    } else if (activeFinancialSubTab === 'expired') {
        const expiredLossItems = [];
        
        // Active expired products (not destroyed or returned yet)
        state.products.forEach(p => {
            const expDate = new Date(p.expiry);
            expDate.setHours(0,0,0,0);
            const isExpired = p.stock > 0 && expDate < today;
            const isDestroyed = p.status === 'Dimusnahkan' || p.status === 'Diretur';
            if (isExpired && !isDestroyed && isInPeriod(p.expiry)) {
                const isConsignment = p.origin === 'Konsinyasi';
                expiredLossItems.push({
                    expiry: p.expiry,
                    name: p.name,
                    qty: p.stock,
                    buyPrice: p.buyPrice || 0,
                    loss: isConsignment ? 0 : p.stock * (p.buyPrice || 0),
                    status: isConsignment ? 'Belum Diretur' : 'Belum Dimusnahkan'
                });
            }
        });

        // Destroyed or Returned products (from destructionHistory)
        (state.destructionHistory || []).forEach(h => {
            if (isInPeriod(h.destructionDate)) {
                const isRetur = h.reason && h.reason.startsWith('Retur:');
                expiredLossItems.push({
                    expiry: h.expiry || '-',
                    name: h.productName,
                    qty: h.qty,
                    buyPrice: h.buyPrice || 0,
                    loss: isRetur ? 0 : h.qty * (h.buyPrice || 0),
                    status: isRetur ? 'Diretur' : 'Dimusnahkan'
                });
            }
        });

        subTableHtml = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h4 style="margin: 0; color: var(--primary);">Laporan Kerugian Expired</h4>
                <button class="btn btn-outline" style="font-size: 0.75rem; padding: 6px 12px;" onclick="window.print()"><i data-lucide="printer" style="width: 14px;"></i> Cetak Laporan</button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Tanggal Expired</th>
                            <th>Produk</th>
                            <th>Qty Tersisa</th>
                            <th style="text-align: right;">Harga Beli</th>
                            <th style="text-align: right;">Nilai Kerugian</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${expiredLossItems.length === 0 ? '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 32px;">Belum ada data kerugian expired.</td></tr>' :
                            expiredLossItems.map(item => `
                                <tr>
                                    <td><span style="color: #dc2626; font-weight: 600;">${item.expiry !== '-' ? formatDate(item.expiry) : '-'}</span></td>
                                    <td><strong>${item.name}</strong></td>
                                    <td>${item.qty} Unit</td>
                                    <td style="text-align: right;">${formatCurrency(item.buyPrice)}</td>
                                    <td style="text-align: right; font-weight: 600; color: #dc2626;">${formatCurrency(item.loss)}</td>
                                    <td>
                                        <span class="status-badge ${item.status === 'Dimusnahkan' ? 'status-danger' : 'status-warning'}">
                                            ${item.status}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')
                        }
                    </tbody>
                </table>
            </div>
        `;
    }

    let kpiCardsHtml = '';
    if (role === 'Administrator') {
        kpiCardsHtml = `
            <div class="grid-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 24px;">
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
                        <span class="stat-value" style="font-size: 1.4rem; font-weight: 700; color: #ef4444; margin-top: 4px;">${formatCurrency(totalPurchases)}</span>
                    </div>
                </div>

                <!-- CARD 3: Kerugian Expired -->
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

                <!-- CARD 4: Estimasi Laba -->
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
        `;
    } else {
        kpiCardsHtml = `
            <div class="grid-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 24px;">
                <!-- CARD 1: Kerugian Expired -->
                <div class="card stat-card" style="border: 1px solid #e2e8f0; border-top: 4px solid #f97316; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 20px; display: flex; align-items: center; gap: 16px; border-radius: 16px; background: #fff; max-width: 300px;" 
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
            </div>
        `;
    }

    return `
        ${kpiCardsHtml}

        <div class="card">
            <div class="no-print" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 16px; flex-wrap: wrap; gap: 12px;">
                <div style="display: flex; gap: 8px;">
                    ${role === 'Administrator' ? `
                    <button class="btn ${activeFinancialSubTab === 'pemasukan' ? 'btn-primary' : 'btn-outline'}" style="padding: 6px 12px; font-size: 0.8rem;" onclick="window.setFinancialSubTab('pemasukan')">
                        Pemasukan POS
                    </button>
                    <button class="btn ${activeFinancialSubTab === 'pengeluaran' ? 'btn-primary' : 'btn-outline'}" style="padding: 6px 12px; font-size: 0.8rem;" onclick="window.setFinancialSubTab('pengeluaran')">
                        Pengeluaran (Beli Putus)
                    </button>
                    ` : ''}
                    <button class="btn ${activeFinancialSubTab === 'expired' ? 'btn-primary' : 'btn-outline'}" style="padding: 6px 12px; font-size: 0.8rem;" onclick="window.setFinancialSubTab('expired')">
                        Kerugian Expired
                    </button>
                </div>
            </div>
            <div>
                ${subTableHtml}
            </div>
        </div>
    `;
}

export const viewTransactionDetail = (id) => {
    const t = state.transactions.find(x => x.id === id);
    if (!t) return;

    showModal(`
        <div class="official-doc">
            <div class="doc-header">
                <p style="font-weight: 800; font-size: 1.2rem; margin: 0;">APOTEK KIMIA FARMA</p>
                <p style="font-size: 0.8rem; color: #666; margin: 4px 0;">Jl. Kesehatan No. 123, Jakarta Baru</p>
                <p style="font-size: 0.8rem; color: #666; margin: 0;">Telp: (021) 555-0123</p>
                <h1 class="doc-title" style="margin-top: 20px;">NOTA PENJUALAN</h1>
            </div>

            <div class="doc-meta">
                <div>
                    <p><strong>No. Nota:</strong> #TR-${t.id.toString().slice(-6)}</p>
                    <p><strong>Tanggal:</strong> ${t.timestamp}</p>
                </div>
                <div style="text-align: right;">
                    <p><strong>Pelanggan:</strong> Umum</p>
                    <p><strong>Kasir:</strong> ${state.currentUser.name}</p>
                </div>
            </div>

            <table class="doc-table">
                <thead>
                    <tr>
                        <th style="text-align: left;">Deskripsi Barang</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Harga Satuan</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${t.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td style="text-align: center;">${item.qty}</td>
                            <td style="text-align: right;">${formatCurrency(item.price)}</td>
                            <td style="text-align: right;">${formatCurrency(item.price * item.qty)}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" style="text-align: right; padding: 12px 0; font-weight: 800;">TOTAL PEMBAYARAN</td>
                        <td style="text-align: right; padding: 12px 0; font-weight: 800; font-size: 1.1rem;">${formatCurrency(t.total)}</td>
                    </tr>
                </tfoot>
            </table>

            <div style="text-align: center; margin: 20px 0; padding: 12px; border: 1px solid #000; border-radius: 4px; font-weight: 700;">
                TERIMA KASIH ATAS KUNJUNGANNYA
            </div>

            <div class="doc-footer">
                <div class="signature-box">
                    <p>Penerima,</p>
                    <div class="signature-line">( ............................ )</div>
                </div>
                <div class="signature-box">
                    <p>Hormat Kami,</p>
                    <div class="signature-line">${state.currentUser.name}</div>
                </div>
            </div>
            
            <div style="margin-top: 32px; display: flex; gap: 8px;" class="no-print">
                <button class="btn btn-primary" style="flex: 1; justify-content: center;" onclick="window.print()"><i data-lucide="printer"></i> Cetak Nota</button>
                <button class="btn btn-outline" style="flex: 0.5; justify-content: center;" onclick="closeModal()">Tutup</button>
            </div>
        </div>
    `);
    if (window.lucide) window.lucide.createIcons();
};

// Bind to window
window.renderReports = renderReports;
window.setReportTab = setReportTab;
window.viewTransactionDetail = viewTransactionDetail;
window.renderDestructionReport = renderDestructionReport;
window.renderFinancialReport = renderFinancialReport;

function renderDestructionReport() {
    const filteredHistory = (state.destructionHistory || []).filter(h => isInPeriod(h.destructionDate));
    const totalQty = filteredHistory.reduce((sum, h) => sum + (h.qty || 0), 0);
    const totalItems = filteredHistory.length;

    return `
        <div class="grid-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 24px;">
            <!-- CARD 1: Total Qty Dimusnahkan -->
            <div class="card stat-card" style="border: 1px solid #e2e8f0; border-top: 4px solid #991b1b; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 20px; display: flex; align-items: center; gap: 16px; border-radius: 16px; background: #fff;" 
                 onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 20px rgba(153,27,27,0.08)'" 
                 onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.05)'">
                <div class="stat-icon" style="background: rgba(153, 27, 27, 0.08); color: #991b1b; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; flex-shrink: 0;">
                    <i data-lucide="trash-2" style="width: 24px; height: 24px;"></i>
                </div>
                <div class="stat-info" style="display: flex; flex-direction: column;">
                    <span class="stat-label" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">Total Qty Dimusnahkan & Diretur</span>
                    <span class="stat-value" style="font-size: 1.4rem; font-weight: 700; color: #991b1b; margin-top: 4px;">${totalQty} Unit</span>
                </div>
            </div>

            <!-- CARD 2: Jumlah Pemusnahan -->
            <div class="card stat-card" style="border: 1px solid #e2e8f0; border-top: 4px solid var(--text-muted); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 20px; display: flex; align-items: center; gap: 16px; border-radius: 16px; background: #fff;" 
                 onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 20px rgba(100,116,139,0.08)'" 
                 onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.05)'">
                <div class="stat-icon" style="background: rgba(100, 116, 139, 0.08); color: var(--text-muted); width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; flex-shrink: 0;">
                    <i data-lucide="archive" style="width: 24px; height: 24px;"></i>
                </div>
                <div class="stat-info" style="display: flex; flex-direction: column;">
                    <span class="stat-label" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">Jumlah Pemusnahan & Retur</span>
                    <span class="stat-value" style="font-size: 1.4rem; font-weight: 700; color: var(--text-main); margin-top: 4px;">${totalItems} Record</span>
                </div>
            </div>
        </div>

        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3>Histori Pemusnahan & Retur Obat</h3>
                <button class="btn btn-outline" style="font-size: 0.8rem;" onclick="window.print()"><i data-lucide="printer"></i> Cetak Laporan</button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Waktu Eksekusi</th>
                            <th>Nama Obat</th>
                            <th>Jumlah (Qty)</th>
                            <th>Keterangan / Alasan</th>
                            <th>Petugas</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredHistory.length === 0 ? '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 32px;">Belum ada histori pemusnahan/retur obat untuk periode ini.</td></tr>' :
                            filteredHistory.map(h => `
                                <tr>
                                    <td>${h.destructionDate}</td>
                                    <td><strong>${h.productName}</strong></td>
                                    <td><strong style="color: ${h.reason.startsWith('Retur:') ? '#0284c7' : '#991b1b'};">${h.qty} Unit</strong></td>
                                    <td><span style="font-style: italic; color: var(--text-muted);">${h.reason}</span></td>
                                    <td>${h.user}</td>
                                    <td>
                                        ${h.reason.startsWith('Retur:') 
                                            ? `<span class="status-badge" style="background: #e0f2fe; color: #0369a1;">Diretur</span>`
                                            : `<span class="status-badge" style="background: #334155; color: #f8fafc;">Dimusnahkan</span>`
                                        }
                                    </td>
                                </tr>
                            `).join('')
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
}
