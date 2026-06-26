/**
 * Procurement (Beli Putus) Module
 */
import { state, saveState } from '../state.js';
import { showModal, closeModal, formatCurrency, formatDate, generateSafeId } from '../utils.js';

export const renderProcurement = () => {
    const pageTitle = document.getElementById('current-page-title');
    const contentArea = document.getElementById('content-area');

    pageTitle.textContent = "Pengadaan Obat (Beli Putus)";

    const role = state.currentUser ? state.currentUser.role : 'Administrator';
    const procurements = state.procurements || [];

    // Calculate stats
    const totalTx = procurements.length;
    const totalExpense = procurements.reduce((sum, p) => {
        const pSum = (p.items || []).reduce((itemSum, item) => itemSum + (item.qty * item.buyPrice), 0);
        return sum + pSum;
    }, 0);
    const totalBeliPutusProducts = state.products.filter(p => p.origin === 'Beli Putus').length;

    contentArea.innerHTML = `
        <!-- Stats Widgets -->
        <div class="grid-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 24px;">
            <!-- CARD 1: Total Transaksi Pengadaan -->
            <div class="card stat-card" style="border: 1px solid #e2e8f0; border-top: 4px solid var(--primary); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 20px; display: flex; align-items: center; gap: 16px; border-radius: 16px; background: #fff;" 
                 onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 20px rgba(0,104,55,0.08)'" 
                 onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.05)'">
                <div class="stat-icon" style="background: rgba(0, 104, 55, 0.08); color: var(--primary); width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; flex-shrink: 0;">
                    <i data-lucide="clipboard-list" style="width: 24px; height: 24px;"></i>
                </div>
                <div class="stat-info" style="display: flex; flex-direction: column;">
                    <span class="stat-label" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">Total Transaksi Pengadaan</span>
                    <span class="stat-value" style="font-size: 1.4rem; font-weight: 700; color: var(--text-main); margin-top: 4px;">${totalTx} Transaksi</span>
                </div>
            </div>

            <!-- CARD 2: Total Pengeluaran Beli Putus -->
            <div class="card stat-card" style="border: 1px solid #e2e8f0; border-top: 4px solid #ef4444; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 20px; display: flex; align-items: center; gap: 16px; border-radius: 16px; background: #fff;" 
                 onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 20px rgba(239,68,68,0.08)'" 
                 onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.05)'">
                <div class="stat-icon" style="background: rgba(239, 68, 68, 0.08); color: #ef4444; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; flex-shrink: 0;">
                    <i data-lucide="trending-down" style="width: 24px; height: 24px;"></i>
                </div>
                <div class="stat-info" style="display: flex; flex-direction: column;">
                    <span class="stat-label" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">Total Pengeluaran Beli Putus</span>
                    <span class="stat-value" style="font-size: 1.4rem; font-weight: 700; color: #ef4444; margin-top: 4px;">${formatCurrency(totalExpense)}</span>
                </div>
            </div>

            <!-- CARD 3: Total Produk Beli Putus -->
            <div class="card stat-card" style="border: 1px solid #e2e8f0; border-top: 4px solid var(--secondary); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 20px; display: flex; align-items: center; gap: 16px; border-radius: 16px; background: #fff;" 
                 onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 20px rgba(247,148,29,0.08)'" 
                 onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.05)'">
                <div class="stat-icon" style="background: rgba(247, 148, 29, 0.08); color: var(--secondary); width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; flex-shrink: 0;">
                    <i data-lucide="package" style="width: 24px; height: 24px;"></i>
                </div>
                <div class="stat-info" style="display: flex; flex-direction: column;">
                    <span class="stat-label" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">Total Produk Beli Putus</span>
                    <span class="stat-value" style="font-size: 1.4rem; font-weight: 700; color: var(--text-main); margin-top: 4px;">${totalBeliPutusProducts} Item</span>
                </div>
            </div>
        </div>

        <div class="card">
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
                <div>
                    <h3 style="margin: 0;">Histori Pengadaan Barang (Beli Putus)</h3>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">Daftar transaksi pembelian barang dari supplier dengan pembayaran di awal</p>
                </div>
                ${role === 'Administrator' ? `
                    <button class="btn btn-primary" onclick="window.showAddProcurementModal()">
                        <i data-lucide="plus"></i> Buat Pengadaan Baru
                    </button>
                ` : ''}
            </div>

            <!-- Table -->
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>No. Pengadaan</th>
                            <th>Tanggal Beli</th>
                            <th>Nama Supplier</th>
                            <th>PIC Supplier</th>
                            <th>WhatsApp</th>
                            <th style="text-align: center;">Total Qty</th>
                            <th style="text-align: right;">Total Nilai</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${procurements.length === 0 ? '<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 32px;">Belum ada histori pengadaan Beli Putus.</td></tr>' :
                            procurements.map(p => {
                                const totalQty = (p.items || []).reduce((sum, item) => sum + item.qty, 0);
                                const totalCost = (p.items || []).reduce((sum, item) => sum + (item.qty * item.buyPrice), 0);
                                return `
                                    <tr>
                                        <td><strong style="color: var(--primary);">${p.procurementNo}</strong></td>
                                        <td>${formatDate(p.purchaseDate)}</td>
                                        <td><strong>${p.supplierName}</strong></td>
                                        <td>${p.picName}</td>
                                        <td>
                                            <a href="https://wa.me/${p.whatsapp.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-outline" style="padding: 4px 8px; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 4px;">
                                                <i data-lucide="message-square" style="width: 12px;"></i> Chat
                                            </a>
                                        </td>
                                        <td style="text-align: center;">${totalQty} Unit</td>
                                        <td style="text-align: right; font-weight: 600;">${formatCurrency(totalCost)}</td>
                                        <td>
                                            <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.75rem;" onclick="window.viewProcurementDetail(${p.id})">
                                                Detail
                                            </button>
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

    if (window.lucide) {
        window.lucide.createIcons();
    }
};

export const viewProcurementDetail = (procId) => {
    const procurements = state.procurements || [];
    const p = procurements.find(item => item.id === procId);
    if (!p) {
        alert("Transaksi tidak ditemukan!");
        return;
    }

    const totalCost = (p.items || []).reduce((sum, item) => sum + (item.qty * item.buyPrice), 0);

    showModal(`
        <div style="max-height: 80vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 12px;">
                <h2 style="margin: 0; color: var(--primary);">Detail Pengadaan #${p.procurementNo}</h2>
                <button class="btn btn-outline" onclick="closeModal()">Tutup</button>
            </div>
            
            <div class="grid-2-col" style="margin-bottom: 24px; gap: 20px;">
                <div>
                    <h4 style="color: var(--text-muted); margin-bottom: 4px;">Informasi Supplier</h4>
                    <p style="margin: 2px 0;"><strong>Supplier:</strong> ${p.supplierName}</p>
                    <p style="margin: 2px 0;"><strong>PIC:</strong> ${p.picName}</p>
                    <p style="margin: 2px 0;"><strong>WhatsApp:</strong> ${p.whatsapp}</p>
                </div>
                <div>
                    <h4 style="color: var(--text-muted); margin-bottom: 4px;">Informasi Transaksi</h4>
                    <p style="margin: 2px 0;"><strong>Tanggal Pembelian:</strong> ${formatDate(p.purchaseDate)}</p>
                    <p style="margin: 2px 0;"><strong>Metode:</strong> Beli Putus (Cash)</p>
                    <p style="margin: 2px 0;"><strong>Total Biaya:</strong> <strong style="color: var(--primary);">${formatCurrency(totalCost)}</strong></p>
                </div>
            </div>

            <h3>Daftar Obat Terbeli</h3>
            <div class="table-container" style="margin-top: 12px;">
                <table>
                    <thead>
                        <tr>
                            <th>Nama Obat</th>
                            <th>Kategori</th>
                            <th style="text-align: center;">Qty</th>
                            <th style="text-align: right;">Harga Beli</th>
                            <th style="text-align: right;">Harga Jual</th>
                            <th style="text-align: right;">Subtotal</th>
                            <th>Tgl. Expired</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(p.items || []).map(item => `
                            <tr>
                                <td><strong>${item.productName}</strong></td>
                                <td><span class="status-badge status-primary">${item.category}</span></td>
                                <td style="text-align: center;">${item.qty} Unit</td>
                                <td style="text-align: right;">${formatCurrency(item.buyPrice)}</td>
                                <td style="text-align: right;">${formatCurrency(item.sellPrice)}</td>
                                <td style="text-align: right; font-weight: 600;">${formatCurrency(item.qty * item.buyPrice)}</td>
                                <td>${formatDate(item.expiryDate)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `, '850px');

    if (window.lucide) {
        window.lucide.createIcons();
    }
};

export const showAddProcurementModal = () => {
    const today = new Date().toISOString().slice(0, 10);
    const code = `PRC-${today.replace(/-/g, '')}-${String((state.procurements || []).length + 1).padStart(4, '0')}`;

    showModal(`
        <div style="max-height: 85vh; overflow-y: auto; width: 100%; max-width: 900px; padding: 12px;">
            <h2 style="margin-bottom: 8px;">Buat Transaksi Pengadaan Obat (Beli Putus)</h2>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 24px;">Harap isi informasi supplier dan daftar obat. Pengadaan ini akan langsung menambah stok gudang.</p>

            <form onsubmit="event.preventDefault(); window.submitProcurement();">
                <div class="grid-2-col" style="margin-bottom: 20px; gap: 16px;">
                    <div class="form-group">
                        <label>No. Pengadaan (Otomatis)</label>
                        <input type="text" id="prc-no" value="${code}" readonly class="form-control" style="background: var(--bg-main); font-weight: 600;">
                    </div>
                    <div class="form-group">
                        <label>Tanggal Pembelian</label>
                        <input type="date" id="prc-date" value="${today}" required class="form-control">
                    </div>
                </div>

                <div class="grid-3-col" style="margin-bottom: 24px; gap: 16px;">
                    <div class="form-group">
                        <label>Nama Supplier</label>
                        <input type="text" id="prc-supplier" placeholder="Contoh: PT Kalbe Farma" required class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Nama PIC Supplier</label>
                        <input type="text" id="prc-pic" placeholder="Contoh: Ibu Rini" required class="form-control">
                    </div>
                    <div class="form-group">
                        <label>WhatsApp Supplier</label>
                        <input type="text" id="prc-phone" placeholder="Contoh: 62812345678" required class="form-control">
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h3>Daftar Obat</h3>
                    <button type="button" class="btn btn-outline" style="padding: 6px 12px; font-size: 0.85rem;" onclick="window.addProcurementItemRow()">
                        <i data-lucide="plus"></i> Tambah Item Obat
                    </button>
                </div>

                <div class="table-container" style="border: 1px solid var(--border); border-radius: 8px; margin-bottom: 24px; max-height: 250px; overflow-y: auto;">
                    <table style="min-width: 800px;">
                        <thead>
                            <tr>
                                <th style="width: 30%;">Nama Obat</th>
                                <th style="width: 15%;">Kategori</th>
                                <th style="width: 10%; text-align: center;">Qty</th>
                                <th style="width: 15%; text-align: right;">Harga Beli</th>
                                <th style="width: 15%; text-align: right;">Harga Jual</th>
                                <th style="width: 15%;">Tgl. Expired</th>
                                <th style="width: 5%;"></th>
                            </tr>
                        </thead>
                        <tbody id="procurement-items-body">
                            <!-- Rows will be injected here -->
                        </tbody>
                    </table>
                </div>

                <div style="display: flex; gap: 12px; justify-content: flex-end; border-top: 1px solid var(--border); padding-top: 16px;">
                    <button type="submit" class="btn btn-primary" style="padding: 10px 24px;">Simpan & Masukkan Gudang</button>
                    <button type="button" class="btn btn-outline" onclick="closeModal()">Batal</button>
                </div>
            </form>
        </div>
    `, '950px');

    // Add first row
    window.addProcurementItemRow();

    if (window.lucide) {
        window.lucide.createIcons();
    }
};

export const addProcurementItemRow = () => {
    const tbody = document.getElementById('procurement-items-body');
    if (!tbody) return;

    const tr = document.createElement('tr');
    tr.className = 'proc-item-row';
    tr.innerHTML = `
        <td>
            <input type="text" placeholder="Ketik nama obat..." class="form-control item-name" required style="padding: 6px 10px;">
        </td>
        <td>
            <select class="form-control item-category" style="padding: 6px 10px;">
                <option value="Analgesik">Analgesik</option>
                <option value="Antibiotik">Antibiotik</option>
                <option value="Obat Batuk">Obat Batuk</option>
                <option value="Vitamin">Vitamin</option>
                <option value="Obat Bebas">Obat Bebas</option>
                <option value="Herbal">Herbal</option>
                <option value="Lainnya" selected>Lainnya</option>
            </select>
        </td>
        <td>
            <input type="number" min="1" value="10" class="form-control item-qty" required style="padding: 6px 4px; text-align: center;">
        </td>
        <td>
            <input type="number" min="0" placeholder="Rp" class="form-control item-buy-price" required style="padding: 6px 10px; text-align: right;">
        </td>
        <td>
            <input type="number" min="0" placeholder="Rp" class="form-control item-sell-price" required style="padding: 6px 10px; text-align: right;">
        </td>
        <td>
            <input type="date" class="form-control item-expiry" required style="padding: 6px 10px;">
        </td>
        <td style="text-align: center;">
            <button type="button" class="icon-btn" style="color: #ef4444; border: none; background: none; cursor: pointer;" onclick="this.closest('tr').remove()">
                <i data-lucide="trash-2" style="width: 16px;"></i>
            </button>
        </td>
    `;
    tbody.appendChild(tr);

    if (window.lucide) {
        window.lucide.createIcons();
    }
};

export const submitProcurement = async () => {
    const procurementNo = document.getElementById('prc-no').value;
    const purchaseDate = document.getElementById('prc-date').value;
    const supplierName = document.getElementById('prc-supplier').value.trim();
    const picName = document.getElementById('prc-pic').value.trim();
    const whatsapp = document.getElementById('prc-phone').value.trim();

    const rows = document.querySelectorAll('.proc-item-row');
    if (rows.length === 0) {
        alert("Silakan tambahkan minimal satu obat!");
        return;
    }

    const items = [];
    for (const row of rows) {
        const productName = row.querySelector('.item-name').value.trim();
        const category = row.querySelector('.item-category').value;
        const qty = parseInt(row.querySelector('.item-qty').value) || 0;
        const buyPrice = parseInt(row.querySelector('.item-buy-price').value) || 0;
        const sellPrice = parseInt(row.querySelector('.item-sell-price').value) || 0;
        const expiryDate = row.querySelector('.item-expiry').value;

        if (!productName || qty <= 0 || buyPrice <= 0 || sellPrice <= 0 || !expiryDate) {
            alert("Harap lengkapi semua baris input obat dengan benar!");
            return;
        }

        items.push({
            id: generateSafeId(),
            productName,
            category,
            qty,
            buyPrice,
            sellPrice,
            expiryDate
        });
    }

    // Process inventory updates
    for (const item of items) {
        // Find existing product by name (case insensitive)
        const existingProduct = state.products.find(p => p.name.toLowerCase() === item.productName.toLowerCase());

        if (existingProduct) {
            existingProduct.stock += item.qty;
            existingProduct.price = item.sellPrice;
            existingProduct.buyPrice = item.buyPrice;
            existingProduct.expiry = item.expiryDate;
            existingProduct.category = item.category;
            existingProduct.status = 'Tersedia'; // Reactivate if it was out of stock
        } else {
            state.products.push({
                id: generateSafeId(),
                name: item.productName,
                category: item.category,
                price: item.sellPrice,
                buyPrice: item.buyPrice,
                stock: item.qty,
                expiry: item.expiryDate,
                image: 'img/pills.png',
                origin: 'Beli Putus',
                supplierId: null,
                status: 'Tersedia'
            });
        }
    }

    // Save procurement record
    const newProc = {
        id: generateSafeId(),
        procurementNo,
        purchaseDate,
        supplierName,
        picName,
        whatsapp,
        items
    };

    if (!state.procurements) state.procurements = [];
    state.procurements.unshift(newProc);

    await saveState();
    closeModal();
    renderProcurement();
    alert("Transaksi Pengadaan Beli Putus berhasil disimpan dan stok gudang telah diperbarui!");
};

// Bind to window
window.renderProcurement = renderProcurement;
window.viewProcurementDetail = viewProcurementDetail;
window.showAddProcurementModal = showAddProcurementModal;
window.addProcurementItemRow = addProcurementItemRow;
window.submitProcurement = submitProcurement;
