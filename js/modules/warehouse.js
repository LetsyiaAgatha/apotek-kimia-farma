/**
 * Warehouse & Inventory Module
 */
import { state, saveState, uploadPhoto } from '../state.js';
import { formatCurrency, formatDate, showModal, closeModal, generateSafeId } from '../utils.js';

let warehouseFilterTab = 'Semua';

export const setWarehouseFilter = (filter) => {
    warehouseFilterTab = filter;
    renderWarehouse();
};

export const renderWarehouse = () => {
    const pageTitle = document.getElementById('current-page-title');
    const contentArea = document.getElementById('content-area');
    
    pageTitle.textContent = "Gudang & Inventory";

    const userRole = state.currentUser ? state.currentUser.role : 'Kasir';
    if (userRole === 'Kasir') {
        contentArea.innerHTML = `
            <div class="card" style="padding: 32px; text-align: center; color: var(--text-muted);">
                <i data-lucide="shield-alert" style="width: 48px; height: 48px; color: #ef4444; margin-bottom: 16px;"></i>
                <h3>Akses Ditolak</h3>
                <p style="margin-top: 8px;">Maaf, Anda tidak memiliki hak akses untuk membuka halaman Gudang & Inventory.</p>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    if (warehouseFilterTab === 'Histori') {
        contentArea.innerHTML = `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
                    <div class="tabs">
                        <button class="tab-btn" onclick="window.setWarehouseFilter('Semua')">Semua</button>
                        <button class="tab-btn" onclick="window.setWarehouseFilter('Konsinyasi')">Konsinyasi</button>
                        <button class="tab-btn" onclick="window.setWarehouseFilter('Beli Putus')">Beli Putus</button>
                        <button class="tab-btn active" onclick="window.setWarehouseFilter('Histori')">Histori Penyesuaian</button>
                    </div>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Kode Produk</th>
                                <th>Produk</th>
                                <th>User</th>
                                <th>Stok Lama</th>
                                <th>Stok Baru</th>
                                <th>Selisih</th>
                                <th>Alasan</th>
                                <th>Catatan</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${state.stockAdjustments.length === 0 ? `
                                <tr>
                                    <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 24px;">Belum ada riwayat penyesuaian stok.</td>
                                </tr>
                            ` : state.stockAdjustments.map(sa => {
                                const diffText = sa.difference > 0 ? `+${sa.difference}` : sa.difference;
                                const diffColor = sa.difference > 0 ? '#10b981' : (sa.difference < 0 ? '#ef4444' : 'inherit');
                                return `
                                    <tr>
                                        <td>${formatDate(sa.adjustmentDate.split(' ')[0])} <span style="font-size:0.8rem; color:var(--text-muted);">${sa.adjustmentDate.split(' ')[1] || ''}</span></td>
                                        <td style="font-family: monospace; font-weight: 700;">KF-${String(sa.productId).padStart(4, '0')}</td>
                                        <td><strong>${sa.productName}</strong></td>
                                        <td>${sa.user}</td>
                                        <td>${sa.stockOld} Unit</td>
                                        <td>${sa.stockNew} Unit</td>
                                        <td style="color: ${diffColor}; font-weight: 700;">${diffText}</td>
                                        <td>
                                            <span class="status-badge" style="
                                                background: ${sa.reason === 'Stock Opname' ? '#e0f2fe' : (sa.reason === 'Barang Rusak' || sa.reason === 'Barang Hilang' ? '#fee2e2' : '#f1f5f9')};
                                                color: ${sa.reason === 'Stock Opname' ? '#0369a1' : (sa.reason === 'Barang Rusak' || sa.reason === 'Barang Hilang' ? '#991b1b' : '#334155')};
                                            ">${sa.reason}</span>
                                        </td>
                                        <td>${sa.notes}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    let filteredProducts = state.products;
    if (warehouseFilterTab !== 'Semua') {
        filteredProducts = state.products.filter(p => p.origin === warehouseFilterTab);
    }

    contentArea.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
                <div class="tabs">
                    <button class="tab-btn ${warehouseFilterTab === 'Semua' ? 'active' : ''}" onclick="window.setWarehouseFilter('Semua')">Semua</button>
                    <button class="tab-btn ${warehouseFilterTab === 'Konsinyasi' ? 'active' : ''}" onclick="window.setWarehouseFilter('Konsinyasi')">Konsinyasi</button>
                    <button class="tab-btn ${warehouseFilterTab === 'Beli Putus' ? 'active' : ''}" onclick="window.setWarehouseFilter('Beli Putus')">Beli Putus</button>
                    <button class="tab-btn ${warehouseFilterTab === 'Histori' ? 'active' : ''}" onclick="window.setWarehouseFilter('Histori')">Histori Penyesuaian</button>
                </div>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th style="width: 80px;">Kode</th>
                            <th style="width: 64px;">Foto</th>
                            <th>Obat</th>
                            <th>Kategori</th>
                            <th>Stok</th>
                            <th>Harga Beli</th>
                            <th>Harga Jual</th>
                            <th>Expired</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredProducts.map(p => {
                            const isDestroyed = p.status === 'Dimusnahkan' || p.status === 'Diretur';
                            const isProposed = p.status === 'Diajukan Pemusnahan' || p.status === 'Diajukan Retur';
                            const isOut = !isDestroyed && p.stock === 0;
                            const isExpired = !isDestroyed && new Date(p.expiry) < new Date();
                            const isNearExpiry = !isDestroyed && !isExpired && (new Date(p.expiry) - new Date()) / (1000 * 60 * 60 * 24) <= 30;
                            const isLow = !isDestroyed && !isExpired && p.stock > 0 && p.stock < 15;

                            let expiryText = formatDate(p.expiry);
                            if (isExpired) {
                                expiryText += ' ⚠ EXPIRED!';
                            } else if (isNearExpiry) {
                                expiryText += ' ⚠ Segera Expired';
                            }
                            if (isOut || isDestroyed) {
                                expiryText = '-';
                            }

                            let statusBadge = '';
                            if (p.status === 'Dimusnahkan') {
                                statusBadge = `<span class="status-badge" style="background: #334155; color: #f8fafc;">Dimusnahkan</span>`;
                            } else if (p.status === 'Diretur') {
                                statusBadge = `<span class="status-badge" style="background: #0284c7; color: #f8fafc;">Diretur</span>`;
                            } else if (p.status === 'Diajukan Pemusnahan') {
                                statusBadge = `<span class="status-badge" style="background: #fef3c7; color: #d97706;">Diajukan Pemusnahan</span>`;
                            } else if (p.status === 'Diajukan Retur') {
                                statusBadge = `<span class="status-badge" style="background: #e0f2fe; color: #0369a1;">Diajukan Retur</span>`;
                            } else if (isExpired) {
                                statusBadge = `<span class="status-badge status-danger">Expired</span>`;
                            } else if (isOut) {
                                statusBadge = `<span class="status-badge" style="background: #f1f5f9; color: #64748b;">Stok Habis</span>`;
                            } else if (isLow) {
                                statusBadge = `<span class="status-badge status-warning">Stok Rendah</span>`;
                            } else {
                                statusBadge = `<span class="status-badge status-success">Tersedia</span>`;
                            }

                            // Role-based action buttons logic
                            let actionButtons = '';

                            if (userRole === 'Apoteker') {
                                // Apoteker hanya bisa mengajukan jika produk expired atau stok habis, belum diajukan, dan belum dimusnahkan/diretur
                                if ((isExpired || isOut) && !isProposed && !isDestroyed) {
                                    if (p.origin === 'Konsinyasi') {
                                        actionButtons = `
                                            <button class="btn btn-outline" style="padding: 4px 10px; font-size: 0.75rem; white-space: nowrap; color: #0284c7; border-color: rgba(2,132,199,0.2); display: flex; align-items: center; gap: 4px;"
                                                    onclick="window.ajukanRetur(${p.id})">
                                                <i data-lucide="refresh-cw" style="width: 13px; height: 13px;"></i> Ajukan Retur
                                            </button>
                                        `;
                                    } else {
                                        actionButtons = `
                                            <button class="btn btn-outline" style="padding: 4px 10px; font-size: 0.75rem; white-space: nowrap; color: #d97706; border-color: rgba(217,119,6,0.2); display: flex; align-items: center; gap: 4px;"
                                                    onclick="window.ajukanPemusnahan(${p.id})">
                                                <i data-lucide="alert-circle" style="width: 13px; height: 13px;"></i> Ajukan Pemusnahan
                                            </button>
                                        `;
                                    }
                                }
                            } else if (userRole === 'Administrator') {
                                // Administrator bisa mengeksekusi langsung jika expired atau stok habis, atau jika sudah diajukan oleh Apoteker
                                const canExecute = isProposed || (isExpired || isOut);
                                if (canExecute && !isDestroyed) {
                                    if (p.origin === 'Konsinyasi') {
                                        actionButtons = `
                                            <button class="btn btn-primary" style="padding: 4px 10px; font-size: 0.75rem; white-space: nowrap; background: #0284c7; border-color: #0284c7; display: flex; align-items: center; gap: 4px;"
                                                    onclick="window.eksekusiRetur(${p.id})">
                                                <i data-lucide="refresh-cw" style="width: 13px; height: 13px; color: white;"></i> Retur ke Supplier
                                            </button>
                                        `;
                                    } else {
                                        actionButtons = `
                                            <button class="btn btn-primary" style="padding: 4px 10px; font-size: 0.75rem; white-space: nowrap; background: #991b1b; border-color: #991b1b; display: flex; align-items: center; gap: 4px;"
                                                    onclick="window.eksekusiPemusnahan(${p.id})">
                                                <i data-lucide="trash-2" style="width: 13px; height: 13px; color: white;"></i> Dimusnahkan
                                            </button>
                                        `;
                                    }
                                }
                            }

                            return `
                                <tr data-product-id="${p.id}">
                                    <td style="font-weight: 700; font-size: 0.85rem; color: var(--text-muted); font-family: monospace; vertical-align: middle;">
                                        KF-${String(p.id).padStart(4, '0')}
                                    </td>
                                    <td style="width: 64px; padding: 10px;">
                                        <div style="position: relative; width: 48px; height: 48px; flex-shrink: 0;">
                                            <img src="${p.image}" alt="${p.name}"
                                                 style="width: 48px; height: 48px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border); display: block;">
                                            <button onclick="window.showEditPhotoModal(${p.id})" title="Ganti Foto"
                                                    style="position: absolute; bottom: -4px; right: -4px;
                                                           width: 20px; height: 20px; border-radius: 50%;
                                                           background: var(--primary); border: 2px solid white;
                                                           cursor: pointer; display: flex; align-items: center; justify-content: center;
                                                           padding: 0; box-shadow: 0 1px 4px rgba(0,0,0,0.25);">
                                                <i data-lucide="camera" style="width: 10px; height: 10px; color: white;"></i>
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        <strong>${p.name}</strong><br>
                                        <span style="font-size: 0.8rem; color: var(--text-muted);">${p.origin}</span>
                                    </td>
                                    <td>${p.category}</td>
                                    <td>
                                        <span style="font-weight: 600; color: ${isLow ? '#b91c1c' : 'inherit'}">${p.stock} Unit</span>
                                    </td>
                                    <td>${formatCurrency(p.buyPrice || 0)}</td>
                                    <td>${formatCurrency(p.price)}</td>
                                    <td>
                                        <span style="color: ${isExpired ? '#991b1b' : (isNearExpiry ? '#d97706' : 'inherit')}; font-weight: ${(isExpired || isNearExpiry) ? 700 : 400}">
                                            ${expiryText}
                                        </span>
                                    </td>
                                    <td>
                                        ${statusBadge}
                                    </td>
                                    <td>
                                        <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                                            <button class="btn btn-outline" style="padding: 4px 10px; font-size: 0.75rem; white-space: nowrap; display: flex; align-items: center; gap: 4px;"
                                                     onclick="window.showEditPhotoModal(${p.id})">
                                                <i data-lucide="image" style="width: 13px; height: 13px;"></i> Edit Foto
                                            </button>
                                            ${userRole === 'Administrator' && !isDestroyed ? `
                                                <button class="btn btn-outline" style="padding: 4px 10px; font-size: 0.75rem; white-space: nowrap; display: flex; align-items: center; gap: 4px; color: var(--primary); border-color: var(--primary);"
                                                        onclick="window.showAdjustmentModal(${p.id})">
                                                    <i data-lucide="sliders" style="width: 13px; height: 13px;"></i> Penyesuaian
                                                </button>
                                            ` : ''}
                                            ${actionButtons}
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Highlight a specific product row if coming from a notification
    if (window.notifHighlightTarget) {
        const { type, productId } = window.notifHighlightTarget;
        window.notifHighlightTarget = null; // clear after use
        setTimeout(() => {
            const row = document.querySelector(`tr[data-product-id="${productId}"]`);
            if (!row) return;
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            row.style.transition = 'background 0.3s';
            row.style.background = '#fee2e2';
            row.style.outline = '2px solid #ef4444';
            row.style.borderRadius = '6px';
            // Pulse animation: flash 3 times then settle to soft red
            let flashes = 0;
            const flash = setInterval(() => {
                row.style.background = flashes % 2 === 0 ? '#fecaca' : '#fee2e2';
                flashes++;
                if (flashes >= 6) {
                    clearInterval(flash);
                    row.style.background = '#fff0f0';
                    // Remove highlight after 6 seconds
                    setTimeout(() => {
                        row.style.background = '';
                        row.style.outline = '';
                    }, 6000);
                }
            }, 350);
        }, 150);
    }
};

export const showAdjustmentModal = (productId) => {
    if (state.currentUser.role !== 'Administrator') {
        alert("Akses ditolak: Hanya Administrator yang dapat melakukan penyesuaian stok!");
        return;
    }
    const p = state.products.find(x => x.id === productId);
    if (!p) return;

    showModal(`
        <div>
            <h2 style="margin-bottom: 16px; font-weight: 800;">Penyesuaian Stok</h2>
            <form id="adjustment-form" onsubmit="window.submitAdjustment(event, ${p.id})">
                <div class="form-group" style="margin-bottom: 12px;">
                    <label style="font-weight: 600;">Nama Produk</label>
                    <input type="text" value="${p.name}" readonly style="background: var(--border); cursor: not-allowed; width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border);">
                </div>
                <div class="grid-2-col" style="margin-bottom: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div class="form-group">
                        <label style="font-weight: 600;">Stok Sistem</label>
                        <input type="number" id="adj-system-stock" value="${p.stock}" readonly style="background: var(--border); cursor: not-allowed; width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border);">
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 600;">Stok Fisik Aktual</label>
                        <input type="number" id="adj-actual-stock" min="0" max="99999" value="${p.stock}" required style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border);">
                    </div>
                </div>
                <div class="form-group" style="margin-bottom: 12px;">
                    <label style="font-weight: 600;">Selisih Stok</label>
                    <div id="adj-difference-badge" style="padding: 8px 12px; border-radius: 6px; font-weight: 700; text-align: center; background: var(--bg-main); border: 1px solid var(--border);">
                        0
                    </div>
                </div>
                <div class="form-group" style="margin-bottom: 12px;">
                    <label style="font-weight: 600;">Alasan Penyesuaian</label>
                    <select id="adj-reason" required style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border); background: var(--card); color: var(--text);">
                        <option value="Stock Opname">Stock Opname</option>
                        <option value="Barang Rusak">Barang Rusak</option>
                        <option value="Barang Hilang">Barang Hilang</option>
                        <option value="Koreksi Input">Koreksi Input</option>
                        <option value="Lainnya">Lainnya</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 16px;">
                    <label style="font-weight: 600;">Catatan <span style="font-size: 0.75rem; color: var(--text-muted);">(opsional)</span></label>
                    <textarea id="adj-notes" rows="3" placeholder="Masukkan keterangan tambahan jika ada..." style="width: 100%; border: 1px solid var(--border); border-radius: 8px; padding: 8px; font-family: inherit; resize: vertical; background: var(--card); color: var(--text);"></textarea>
                </div>
                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button type="submit" class="btn btn-primary" style="flex: 1; justify-content: center;">Simpan Penyesuaian</button>
                    <button type="button" class="btn btn-outline" onclick="closeModal()">Batal</button>
                </div>
            </form>
        </div>
    `);

    const actualInput = document.getElementById('adj-actual-stock');
    const diffBadge = document.getElementById('adj-difference-badge');

    const updateDiff = () => {
        const actual = parseInt(actualInput.value, 10) || 0;
        const system = p.stock;
        const diff = actual - system;
        
        diffBadge.textContent = diff > 0 ? `+${diff} (Penambahan)` : (diff < 0 ? `${diff} (Pengurangan)` : '0 (Tidak Ada Perubahan)');
        if (diff > 0) {
            diffBadge.style.color = '#10b981';
            diffBadge.style.borderColor = '#10b981';
            diffBadge.style.background = 'rgba(16, 185, 129, 0.05)';
        } else if (diff < 0) {
            diffBadge.style.color = '#ef4444';
            diffBadge.style.borderColor = '#ef4444';
            diffBadge.style.background = 'rgba(239, 68, 68, 0.05)';
        } else {
            diffBadge.style.color = 'inherit';
            diffBadge.style.borderColor = 'var(--border)';
            diffBadge.style.background = 'var(--bg-main)';
        }
    };

    actualInput.addEventListener('input', updateDiff);
    actualInput.addEventListener('keydown', (e) => {
        if (e.key === '-' || e.key === 'e' || e.key === '+') e.preventDefault();
    });
    updateDiff();
};

export const submitAdjustment = async (e, productId) => {
    if (e) e.preventDefault();
    if (state.currentUser.role !== 'Administrator') {
        alert("Akses ditolak: Hanya Administrator yang dapat melakukan penyesuaian stok!");
        return;
    }
    const p = state.products.find(x => x.id === productId);
    if (!p) return;

    const actualStockInput = document.getElementById('adj-actual-stock');
    let actualStock = parseInt(actualStockInput.value, 10);
    if (isNaN(actualStock) || actualStock < 0) {
        alert("Stok fisik tidak valid!");
        return;
    }
    actualStock = Math.min(99999, Math.max(0, actualStock));

    const oldStock = p.stock;
    const diff = actualStock - oldStock;
    const reason = document.getElementById('adj-reason').value;
    const notes = document.getElementById('adj-notes').value.trim();

    // 1. Update product stock
    p.stock = actualStock;
    
    // If stock goes back above low, or status changes, adjust status
    if (p.stock > 0 && (p.status === 'Stok Habis' || p.status === 'Stok Rendah')) {
        const isLow = p.stock < 15;
        p.status = isLow ? 'Stok Rendah' : 'Tersedia';
    } else if (p.stock === 0 && (p.status === 'Tersedia' || p.status === 'Stok Rendah')) {
        p.status = 'Stok Habis';
    }

    // 2. Add to history
    state.stockAdjustments.unshift({
        id: generateSafeId(),
        adjustmentDate: new Date().toLocaleString('sv-SE').slice(0, 16).replace('T', ' '),
        productId: p.id,
        productName: p.name,
        stockOld: oldStock,
        stockNew: actualStock,
        difference: diff,
        reason: reason,
        notes: notes || '-',
        user: state.currentUser.name
    });

    // 3. Save & reload
    closeModal();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Menyimpan...'; }
    
    await saveState();
    renderWarehouse();
    alert(`Stok untuk ${p.name} berhasil disesuaikan.`);
};

// Module-level file holder for edit photo
let _editPhotoFile = null;

export const showEditPhotoModal = (productId) => {
    _editPhotoFile = null;
    const p = state.products.find(x => x.id === productId);
    if (!p) return;

    showModal(`
        <div style="text-align: left;">
            <h2 style="margin-bottom: 6px; font-weight: 800;">Edit Foto Produk</h2>
            <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 20px;">${p.name}</p>
            <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 24px;">
                <div style="flex-shrink: 0;">
                    <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 6px;">Foto Saat Ini</p>
                    <img id="edit-photo-current" src="${p.image}" alt="${p.name}"
                         style="width: 80px; height: 80px; object-fit: cover; border-radius: 10px; border: 1px solid var(--border);">
                </div>
                <div style="flex: 1;">
                    <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 6px;">Foto Baru</p>
                    <label id="edit-photo-drop" style="display: flex; flex-direction: column; align-items: center; justify-content: center;
                                gap: 8px; border: 2px dashed var(--border); border-radius: 10px; padding: 16px;
                                cursor: pointer; background: var(--bg-main); transition: border-color 0.2s; height: 90px;"
                           onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--border)'">
                        <img id="edit-photo-preview" src="" alt="" style="width: 52px; height: 52px; object-fit: cover; border-radius: 8px; display: none;">
                        <i data-lucide="image-plus" id="edit-photo-icon" style="width: 26px; height: 26px; color: var(--text-muted);"></i>
                        <span id="edit-photo-text" style="font-size: 0.76rem; color: var(--text-muted); text-align: center;">Klik untuk upload foto baru</span>
                        <input type="file" id="edit-photo-input" accept="image/*" style="display: none;">
                    </label>
                </div>
            </div>
            <div style="display: flex; gap: 12px;">
                <button class="btn btn-primary" id="edit-photo-save-btn" style="flex: 1; justify-content: center;"
                        onclick="window.submitEditPhoto(${productId})">
                    <i data-lucide="save"></i> Simpan Foto
                </button>
                <button class="btn btn-outline" style="flex: 0.5; justify-content: center;" onclick="closeModal()">Batal</button>
            </div>
        </div>
    `);

    document.getElementById('edit-photo-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        _editPhotoFile = file;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const preview = document.getElementById('edit-photo-preview');
            preview.src = ev.target.result;
            preview.style.display = 'block';
            const icon = document.getElementById('edit-photo-icon');
            if (icon) icon.style.display = 'none';
            const txt = document.getElementById('edit-photo-text');
            if (txt) txt.textContent = file.name.length > 22 ? file.name.slice(0, 20) + '\u2026' : file.name;
        };
        reader.readAsDataURL(file);
    });

    if (window.lucide) window.lucide.createIcons();
};

export const submitEditPhoto = async (productId) => {
    if (!_editPhotoFile) { alert('Belum ada foto baru yang dipilih.'); return; }
    const saveBtn = document.getElementById('edit-photo-save-btn');
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Mengupload...'; }

    const imageUrl = await uploadPhoto(_editPhotoFile);
    _editPhotoFile = null;

    if (!imageUrl) { alert('Upload foto gagal. Pastikan XAMPP berjalan.'); if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Simpan Foto'; } return; }

    const p = state.products.find(x => x.id === productId);
    if (p) {
        p.image = imageUrl;
        await saveState();
        closeModal();
        renderWarehouse();
    }
};

export const ajukanPemusnahan = (productId) => {
    const product = state.products.find(p => p.id === productId);
    if (product) {
        if (state.currentUser.role !== 'Apoteker' && state.currentUser.role !== 'Administrator') {
            alert("Akses ditolak: Hanya Apoteker atau Administrator yang dapat mengajukan pemusnahan!");
            return;
        }

        const isExpired = new Date(product.expiry) < new Date();
        const isOut = product.stock === 0;

        if (!isExpired && !isOut) {
            alert("Peringatan: Pengajuan pemusnahan hanya diperbolehkan untuk obat yang sudah Expired atau Stok Habis!");
            return;
        }

        if (confirm(`Apakah Anda yakin ingin mengajukan pemusnahan untuk obat ${product.name}?`)) {
            product.status = 'Diajukan Pemusnahan';
            saveState();
            renderWarehouse();
            alert(`Pemusnahan untuk ${product.name} telah diajukan.`);
        }
    }
};

export const eksekusiPemusnahan = (productId) => {
    if (state.currentUser.role !== 'Administrator') {
        alert("Akses ditolak: Hanya Administrator yang dapat memusnahkan obat!");
        return;
    }
    const product = state.products.find(p => p.id === productId);
    if (product) {
        const reason = prompt(`Masukkan alasan pemusnahan untuk obat ${product.name}:`);
        if (reason === null) return; // cancel click
        if (reason.trim() === '') {
            alert('Alasan pemusnahan wajib diisi!');
            return;
        }

        // Set status to Dimusnahkan, stock to 0
        const qtyDestroyed = product.stock;
        product.stock = 0;
        product.status = 'Dimusnahkan';

        // Add to destruction history
        state.destructionHistory.unshift({
            id: generateSafeId(),
            destructionDate: new Date().toLocaleString('sv-SE').slice(0, 16).replace('T', ' '),
            productId: product.id,
            productName: product.name,
            qty: qtyDestroyed,
            buyPrice: product.buyPrice || 0,
            expiry: product.expiry,
            reason: reason,
            user: state.currentUser.name
        });

        saveState();
        renderWarehouse();
        alert(`Obat ${product.name} telah dimusnahkan.`);
    }
};

export const ajukanRetur = (productId) => {
    const product = state.products.find(p => p.id === productId);
    if (product) {
        if (state.currentUser.role !== 'Apoteker' && state.currentUser.role !== 'Administrator') {
            alert("Akses ditolak: Hanya Apoteker atau Administrator yang dapat mengajukan retur!");
            return;
        }

        const isExpired = new Date(product.expiry) < new Date();
        const isOut = product.stock === 0;

        if (!isExpired && !isOut) {
            alert("Peringatan: Pengajuan retur hanya diperbolehkan untuk obat yang sudah Expired atau Stok Habis!");
            return;
        }

        if (confirm(`Apakah Anda yakin ingin mengajukan retur ke supplier untuk obat ${product.name}?`)) {
            product.status = 'Diajukan Retur';
            saveState();
            renderWarehouse();
            alert(`Pengajuan retur untuk ${product.name} telah disimpan.`);
        }
    }
};

export const eksekusiRetur = (productId) => {
    if (state.currentUser.role !== 'Administrator') {
        alert("Akses ditolak: Hanya Administrator yang dapat meretur obat!");
        return;
    }
    const product = state.products.find(p => p.id === productId);
    if (product) {
        const reason = prompt(`Masukkan alasan retur ke supplier untuk obat ${product.name}:`);
        if (reason === null) return;
        if (reason.trim() === '') {
            alert('Alasan retur wajib diisi!');
            return;
        }

        const qtyReturned = product.stock;
        product.stock = 0;
        product.status = 'Diretur';

        // Add to destruction/retur history
        state.destructionHistory.unshift({
            id: generateSafeId(),
            destructionDate: new Date().toLocaleString('sv-SE').slice(0, 16).replace('T', ' '),
            productId: product.id,
            productName: product.name,
            qty: qtyReturned,
            buyPrice: product.buyPrice || 0,
            expiry: product.expiry,
            reason: 'Retur: ' + reason,
            user: state.currentUser.name
        });

        saveState();
        renderWarehouse();
        alert(`Obat ${product.name} telah diretur ke supplier.`);
    }
};

// Bind to window
window.renderWarehouse = renderWarehouse;
window.showAdjustmentModal = showAdjustmentModal;
window.submitAdjustment = submitAdjustment;
window.setWarehouseFilter = setWarehouseFilter;
window.showEditPhotoModal = showEditPhotoModal;
window.submitEditPhoto = submitEditPhoto;
window.ajukanPemusnahan = ajukanPemusnahan;
window.eksekusiPemusnahan = eksekusiPemusnahan;
window.ajukanRetur = ajukanRetur;
window.eksekusiRetur = eksekusiRetur;

window.deleteWarehouseProduct = async (id) => {
    const p = state.products.find(x => x.id === id);
    if (!p) return;
    
    let confirmMsg = `Apakah Anda yakin ingin menghapus obat "${p.name}" dari gudang?`;
    if (p.origin === 'Konsinyasi') {
        confirmMsg = `Obat "${p.name}" adalah barang Konsinyasi. Disarankan untuk memproses Retur melalui menu Konsinyasi agar tercatat di laporan. Apakah Anda tetap ingin menghapusnya langsung dari gudang?`;
    }
    
    if (confirm(confirmMsg)) {
        state.products = state.products.filter(x => x.id !== id);
        await saveState();
        renderWarehouse();
    }
};
