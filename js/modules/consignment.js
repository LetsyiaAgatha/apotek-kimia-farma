/**
 * Consignment Module
 */
import { state, saveState, uploadPhoto } from '../state.js';
import { formatCurrency, formatDate, showModal, closeModal, generateSafeId } from '../utils.js';

let filterTab = 'Semua';

export const renderConsignment = () => {
    const pageTitle = document.getElementById('current-page-title');
    const contentArea = document.getElementById('content-area');
    
    pageTitle.textContent = "Barang Titipan (Konsinyasi)";
    
    let filteredData = state.consignment;
    if (filterTab !== 'Semua') {
        if (filterTab === 'Aktif') {
            filteredData = state.consignment.filter(c => c.status === 'Aktif' || c.status === 'Diajukan Retur');
        } else {
            filteredData = state.consignment.filter(c => c.status === filterTab);
        }
    }

    const totalItem = filteredData.length;
    const totalSold = filteredData.reduce((sum, c) => sum + c.sold, 0);
    const totalProfit = filteredData.reduce((sum, c) => sum + (c.sold * ((c.sellPrice || c.basePrice) - c.basePrice)), 0);

    contentArea.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <div class="tabs">
                    <button class="tab-btn ${filterTab === 'Semua' ? 'active' : ''}" onclick="window.setConsignmentFilter('Semua')">Semua</button>
                    <button class="tab-btn ${filterTab === 'Aktif' ? 'active' : ''}" onclick="window.setConsignmentFilter('Aktif')">Aktif</button>
                    <button class="tab-btn ${filterTab === 'Lunas' ? 'active' : ''}" onclick="window.setConsignmentFilter('Lunas')">Lunas</button>
                    <button class="tab-btn ${filterTab === 'Diretur' ? 'active' : ''}" onclick="window.setConsignmentFilter('Diretur')">Diretur</button>
                </div>
                <button class="btn btn-primary" onclick="showAddConsignmentModal()">
                    <i data-lucide="package-plus"></i> Inbound Konsinyasi Baru
                </button>
            </div>

            <div class="table-container">
                <table style="min-width: 1000px;">
                    <thead>
                        <tr>
                            <th>No. Referensi / Supplier</th>
                            <th>Item Titipan & Qty</th>
                            <th>Harga Titip / Jual</th>
                            <th>Laba Apotek</th>
                            <th>Terjual di POS</th>
                            <th>Utang Pembayaran</th>
                            <th style="width: 150px;">Status & Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredData.length === 0 ? '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Tidak ada data yang sesuai filter</td></tr>' : filteredData.map(c => {
        const remaining = c.qty - c.sold;
        const debt = c.sold * c.basePrice;
        return `
                            <tr data-consignment-id="${c.id}">
                                <td>
                                    <strong style="color: var(--primary);">#KNS-${c.refId || c.id}</strong><br>
                                    <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-main);">${c.supplier}</span><br>
                                    <span style="font-size: 0.8rem; color: var(--text-muted);">${formatDate(c.dateReceived)}</span>
                                </td>
                                <td>
                                    <strong>${c.items}</strong><br>
                                    <span style="font-size: 0.8rem; color: var(--text-muted);">Qty Awal: ${c.qty} Unit</span>
                                </td>
                                <td>
                                    <span style="font-size: 0.85rem; color: var(--text-muted);">Titip:</span> <strong>${formatCurrency(c.basePrice)}</strong><br>
                                    <span style="font-size: 0.85rem; color: var(--text-muted);">Jual:</span> <strong>${formatCurrency(c.sellPrice || c.basePrice)}</strong>
                                </td>
                                <td>
                                    <span style="font-weight: 600; color: #059669;">${formatCurrency(c.sold * ((c.sellPrice || c.basePrice) - c.basePrice))}</span><br>
                                    <span style="font-size: 0.75rem; color: var(--text-muted);">Margin: ${formatCurrency((c.sellPrice || c.basePrice) - c.basePrice)}/u</span>
                                </td>
                                <td>
                                    <span style="font-weight: 600; color: ${c.sold > 0 ? '#16a34a' : 'var(--text-muted)'};">${c.sold} Unit</span><br>
                                    <span style="font-size: 0.8rem; color: var(--text-muted);">Sisa: ${remaining} Unit</span>
                                </td>
                                <td>
                                    ${c.status === 'Lunas' ?
                `<strong style="color: var(--text-muted);">Rp.0</strong><br>
                                         <span style="font-size: 0.8rem; color: var(--text-muted);">(Lunas / Terselesaikan)</span>`
                :
                `<strong style="color: ${debt > 0 ? '#991b1b' : 'var(--text-muted)'};">${formatCurrency(debt)}</strong><br>
                                         <span style="font-size: 0.8rem; color: var(--text-muted);">(${c.sold} unit × ${formatCurrency(c.basePrice)})</span>`
            }
                                </td>
                                <td>
                                    ${
                                        c.status === 'Diajukan Retur'
                                        ? `<span class="status-badge" style="background: #e0f2fe; color: #0369a1; margin-bottom: 8px; display: inline-block;">Diajukan Retur</span>`
                                        : `<span class="status-badge ${c.status === 'Aktif' ? 'status-warning' : (c.status === 'Lunas' ? 'status-success' : 'status-danger')}" style="margin-bottom: 8px; display: inline-block;">${c.status}</span>`
                                    }<br>
                                    <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                                        <button class="btn btn-outline" style="padding: 4px 6px; font-size: 0.7rem;" onclick="viewConsignment(${c.id})">Detail</button>
                                        <button class="btn btn-outline" style="padding: 4px 6px; font-size: 0.7rem; border-color: var(--primary); color: var(--primary);" onclick="window.showEditConsignmentModal(${c.id})">Edit</button>
                                        <button class="btn" style="background: #25d366; color: white; padding: 4px 6px; font-size: 0.7rem; border: none;" onclick="showContactModal(${c.id})">
                                            <i data-lucide="message-circle" style="width: 12px; height: 12px;"></i> Hubungi
                                        </button>
                                        ${(c.status === 'Aktif' || c.status === 'Diajukan Retur') && debt > 0 ? `<button class="btn" style="background: #16a34a; color: white; padding: 4px 6px; font-size: 0.7rem; border: none;" onclick="payConsignment(${c.id})">Lunas</button>` : ''}
                                        ${(c.status === 'Aktif' || c.status === 'Diajukan Retur') ? `<button class="btn" style="background: #f1f5f9; color: #475569; padding: 4px 6px; font-size: 0.7rem; border: none;" onclick="returnConsignment(${c.id})">Retur</button>` : ''}
                                    </div>
                                </td>
                            </tr>
                        `;
    }).join('')}
                    </tbody>
                </table>
            </div>

            <div class="flex-responsive" style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin-top: 24px;">
                <div style="display: flex; gap: 32px; flex-wrap: wrap;">
                    <div>
                        <span style="display: block; font-size: 0.8rem; color: #047857; font-weight: 600;">Total Item Konsinyasi</span>
                        <strong style="font-size: 1.1rem; color: #064e3b;">${totalItem} produk</strong>
                    </div>
                    <div>
                        <span style="display: block; font-size: 0.8rem; color: #047857; font-weight: 600;">Total Terjual</span>
                        <strong style="font-size: 1.1rem; color: #064e3b;">${totalSold} unit</strong>
                    </div>
                </div>
                <div style="text-align: right;">
                    <span style="display: block; font-size: 0.8rem; color: #047857; font-weight: 600;">Profit Estimasi (Apotek)</span>
                    <strong style="font-size: 1.3rem; color: #059669;">${formatCurrency(totalProfit)}</strong>
                </div>
            </div>
        </div>
    `;

    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Auto open inbound modal if coming from PO receipt
    if (window.targetReceiptPOId) {
        const poId = window.targetReceiptPOId;
        window.targetReceiptPOId = null; // clear
        setTimeout(() => {
            showAddConsignmentModal();
            const selectEl = document.getElementById('consig-po-select');
            if (selectEl) {
                selectEl.value = poId;
                window.handleConsignmentPOSelect(selectEl);
            }
        }, 150);
    }

    // Highlight a specific consignment row if coming from a notification
    if (window.notifHighlightTarget) {
        const { consignmentId } = window.notifHighlightTarget;
        window.notifHighlightTarget = null; // clear after use
        if (consignmentId) {
            setTimeout(() => {
                const row = document.querySelector(`tr[data-consignment-id="${consignmentId}"]`);
                if (!row) return;
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                row.style.transition = 'background 0.3s';
                row.style.outline = '2px solid #ef4444';
                row.style.borderRadius = '6px';
                let flashes = 0;
                const flash = setInterval(() => {
                    row.style.background = flashes % 2 === 0 ? '#fecaca' : '#fee2e2';
                    flashes++;
                    if (flashes >= 6) {
                        clearInterval(flash);
                        row.style.background = '#fff0f0';
                        setTimeout(() => {
                            row.style.background = '';
                            row.style.outline = '';
                        }, 6000);
                    }
                }, 350);
            }, 150);
        }
    }
};

export const setConsignmentFilter = (f) => {
    filterTab = f;
    renderConsignment();
};

export const showAddConsignmentModal = () => {
    const newIdStr = Math.floor(100 + Math.random() * 900);
    
    showModal(`
        <div style="padding: 8px; max-height: 80vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0;">Inbound Konsinyasi Baru</h2>
                <span class="status-badge status-primary">Draft #KNS-${newIdStr}</span>
            </div>
            
            <!-- Tarik dari PO Dropdown -->
            ${(state.purchaseOrders && state.purchaseOrders.some(po => po.status === 'Sent')) ? `
                <div class="form-group" style="margin-bottom: 16px; background: rgba(37,99,235,0.05); padding: 12px; border-radius: 8px; border: 1px dashed rgba(37,99,235,0.2);">
                    <label style="font-weight: 700; margin-bottom: 6px; display: block; color: var(--primary); font-size: 0.85rem;">Tarik Data dari Purchase Order (PO)</label>
                    <select id="consig-po-select" onchange="window.handleConsignmentPOSelect(this)" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-main);">
                        <option value="">-- Pilih PO Aktif (Sent) --</option>
                        ${state.purchaseOrders.filter(po => po.status === 'Sent').map(po => `
                            <option value="${po.id}">${po.poNumber} - ${po.supplierName} (${po.items ? po.items.length : 0} Obat)</option>
                        `).join('')}
                    </select>
                </div>
            ` : ''}

            <form onsubmit="window.submitConsignment(event, ${newIdStr})">
                <div class="form-group" style="margin-bottom: 16px;">
                    <label style="font-weight: 600; margin-bottom: 6px; display: block;">Informasi Supplier</label>
                    <input type="text" id="consig-supplier" placeholder="Nama Supplier (Contoh: PT Kimia Farma Trading)" required style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 12px;">
                    
                    <div class="grid-2-col">
                        <div class="form-group">
                            <label style="font-weight: 600; margin-bottom: 6px; display: block; font-size: 0.85rem;">Nama Penyalur / PIC (UP)</label>
                            <input type="text" id="consig-pic" placeholder="Contoh: Bpk. Heru" required style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px;">
                        </div>
                        <div class="form-group">
                            <label style="font-weight: 600; margin-bottom: 6px; display: block; font-size: 0.85rem;">No. WhatsApp PIC</label>
                            <input type="text" id="consig-phone" placeholder="Contoh: 081234567890" pattern="08[0-9]{8,11}" maxlength="13" title="Nomor WhatsApp harus diawali dengan 08 dan berukuran antara 10 hingga 13 digit angka." required style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px;">
                        </div>
                    </div>
                </div>

                <div id="consignment-products-container">
                    <!-- Rows will be injected here -->
                </div>

                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button type="submit" class="btn btn-primary" style="flex: 1; justify-content: center; padding: 14px;">
                        <i data-lucide="check-circle"></i> Konfirmasi Penerimaan
                    </button>
                    <button type="button" class="btn btn-outline" onclick="closeModal()" style="flex: 0.5; justify-content: center;">Batal</button>
                </div>
            </form>
        </div>
    `, '800px');

    // Setup PIC phone number formatting constraints
    const phoneInput = document.getElementById('consig-phone');
    if (phoneInput) {
        phoneInput.addEventListener('keydown', (e) => {
            if (e.key === '-' || e.key === 'e' || e.key === '+' || e.key === '.') {
                e.preventDefault();
            }
        });
        phoneInput.addEventListener('input', (e) => {
            let clean = e.target.value.replace(/[^0-9]/g, '');
            if (clean.length > 13) {
                clean = clean.slice(0, 13);
            }
            e.target.value = clean;
        });
        phoneInput.addEventListener('blur', (e) => {
            let val = e.target.value.trim();
            if (val.length > 0) {
                // Normalize 628... or 8... to 08...
                if (val.startsWith('628')) {
                    val = '08' + val.slice(3);
                } else if (val.startsWith('8')) {
                    val = '08' + val.slice(1);
                }
                
                // Ensure starts with 08
                if (!val.startsWith('08')) {
                    alert('Nomor WhatsApp PIC harus diawali dengan 08!');
                    val = '08' + val.replace(/^0+/, '');
                    if (!val.startsWith('08')) {
                        val = '08';
                    }
                }
                
                if (val.length > 13) {
                    val = val.slice(0, 13);
                }
                e.target.value = val;
            }
        });
    }
    
    // Automatically add the first product row
    window.addConsignmentProductRow();
};

// Map to hold File objects for each product row (key = row index)
const _consignPhotoFiles = new Map();

window.addConsignmentProductRow = (prefilledName = '', prefilledCategory = '', prefilledQty = '', prefilledBase = '', prefilledSell = '', prefilledExpiry = '') => {
    const container = document.getElementById('consignment-products-container');
    if (!container) return;
    
    const today = new Date().toISOString().split('T')[0];
    const index = container.querySelectorAll('.consignment-product-row').length + 1;
    
    const rowHtml = `
        <div class="consignment-product-row card" style="background: var(--bg-main); border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 16px; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="font-weight: 700; font-size: 0.9rem; color: var(--primary);">Obat #${index}</span>
                ${index > 1 ? `
                <button type="button" class="icon-btn" onclick="window.removeConsignmentProductRow(this)" style="color: #ef4444; padding: 4px; background: none; border: none; cursor: pointer; display: flex; align-items: center;">
                    <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                </button>
                ` : ''}
            </div>
            
            <div class="grid-2-col" style="margin-bottom: 12px;">
                <div class="form-group">
                    <label style="font-weight: 600; display: block;">Nama Produk</label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="text" class="prod-name" placeholder="Contoh: Sanmol Syrup" required value="${prefilledName}" style="flex: 1; min-width: 0;">
                        ${index === 1 ? `
                        <button type="button" onclick="window.addConsignmentProductRow()" class="btn btn-primary" style="padding: 10px; height: 42px; width: 42px; display: flex; align-items: center; justify-content: center; border-radius: 8px; flex-shrink: 0;" title="Tambah Jenis Obat">
                            <i data-lucide="plus" style="width: 18px; height: 18px;"></i>
                        </button>
                        ` : ''}
                    </div>
                </div>
                <div class="form-group">
                    <label style="font-weight: 600;">Kategori</label>
                    <select class="prod-cat" required style="width: 100%;">
                        <option value="Analgesik" ${prefilledCategory === 'Analgesik' ? 'selected' : ''}>Analgesik</option>
                        <option value="Antibiotik" ${prefilledCategory === 'Antibiotik' ? 'selected' : ''}>Antibiotik</option>
                        <option value="Vitamin" ${prefilledCategory === 'Vitamin' ? 'selected' : ''}>Vitamin</option>
                        <option value="Herbal" ${prefilledCategory === 'Herbal' ? 'selected' : ''}>Herbal</option>
                        <option value="Lainnya" ${prefilledCategory === 'Lainnya' || !prefilledCategory ? 'selected' : ''}>Lainnya</option>
                    </select>
                </div>
            </div>

            <div class="grid-3-col" style="margin-bottom: 12px;">
                <div class="form-group">
                    <label style="font-weight: 600;">Jumlah (Qty)</label>
                    <input type="number" class="prod-qty" placeholder="0" min="1" max="99999" required value="${prefilledQty}" style="width: 100%;">
                </div>
                <div class="form-group">
                    <label style="font-weight: 600;">Harga Titip (Net)</label>
                    <input type="text" class="prod-base" placeholder="Rp" required value="${prefilledBase}" style="width: 100%;">
                </div>
                <div class="form-group">
                    <label style="font-weight: 600;">Harga Jual</label>
                    <input type="text" class="prod-sell" placeholder="Rp" required value="${prefilledSell}" style="width: 100%;">
                </div>
            </div>

            <div class="grid-2-col" style="margin-bottom: 12px;">
                <div class="form-group">
                    <label style="font-weight: 600;">Foto Produk <span style="font-size: 0.75rem; color: var(--text-muted);">(opsional)</span></label>
                    <label style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
                                 border: 2px dashed var(--border); border-radius: 10px; padding: 12px; cursor: pointer;
                                 background: var(--bg-main); transition: border-color 0.2s;"
                           onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--border)'">
                        <img class="prod-img-preview" src="" alt="" style="width: 56px; height: 56px; object-fit: cover; border-radius: 8px; display: none;">
                        <i data-lucide="image-plus" style="width: 28px; height: 28px; color: var(--text-muted);"></i>
                        <span class="prod-img-label" style="font-size: 0.78rem; color: var(--text-muted); text-align: center;">Klik untuk upload foto</span>
                        <input type="file" class="prod-img" accept="image/*" style="display: none;">
                    </label>
                </div>
                <div class="form-group">
                    <label style="font-weight: 600;">Tanggal Expired</label>
                    <input type="date" class="prod-expiry" min="${today}" value="${prefilledExpiry || today}" required style="width: 100%;">
                </div>
            </div>
        </div>
    `;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = rowHtml.trim();
    const rowEl = tempDiv.firstChild;
    container.appendChild(rowEl);
    
    // Set up formatting and keyboard locks
    const baseInput = rowEl.querySelector('.prod-base');
    const sellInput = rowEl.querySelector('.prod-sell');
    if (window.setupRupiahInputFormatter) {
        window.setupRupiahInputFormatter(baseInput);
        window.setupRupiahInputFormatter(sellInput);
    }
    
    const qtyInput = rowEl.querySelector('.prod-qty');
    qtyInput.addEventListener('keydown', (e) => {
        if (e.key === '-' || e.key === 'e' || e.key === '+' || e.key === '.') {
            e.preventDefault();
        }
    });
    qtyInput.addEventListener('input', (e) => {
        let clean = e.target.value.replace(/[^0-9]/g, '');
        if (clean !== '') {
            let num = parseInt(clean, 10);
            if (num < 1) {
                clean = '1';
            } else if (num > 99999) {
                clean = '99999';
            }
        }
        e.target.value = clean;
    });
    qtyInput.addEventListener('blur', (e) => {
        if (!e.target.value || parseInt(e.target.value, 10) < 1) {
            e.target.value = '1';
        }
    });
    
    // Store file reference for upload on submit
    const fileInput = rowEl.querySelector('.prod-img');
    const imgPreview = rowEl.querySelector('.prod-img-preview');
    const imgLabel = rowEl.querySelector('.prod-img-label');

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        _consignPhotoFiles.set(rowEl, file);
        const reader = new FileReader();
        reader.onload = (ev) => {
            imgPreview.src = ev.target.result;
            imgPreview.style.display = 'block';
            imgLabel.textContent = file.name.length > 20 ? file.name.slice(0, 18) + '\u2026' : file.name;
            rowEl.querySelector('[data-lucide="image-plus"]')?.remove();
        };
        reader.readAsDataURL(file);
    });
    
    if (window.lucide) window.lucide.createIcons();
};

window.removeConsignmentProductRow = (button) => {
    const row = button.closest('.consignment-product-row');
    if (row) {
        row.remove();
        const container = document.getElementById('consignment-products-container');
        if (container) {
            const rows = container.querySelectorAll('.consignment-product-row');
            rows.forEach((r, idx) => {
                const label = r.querySelector('span[style*="font-weight: 700"]');
                if (label) {
                    label.textContent = `Obat #${idx + 1}`;
                }
            });
        }
    }
};

export const submitConsignment = async (e, passId) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Menyimpan...'; }
    
    const supplier  = document.getElementById('consig-supplier').value;
    const pic       = document.getElementById('consig-pic').value;
    const phoneRaw  = document.getElementById('consig-phone').value.replace(/[^0-9]/g, '');
    const phone     = phoneRaw || "081234567890";
    
    if (!phone.startsWith('08')) { alert('Nomor WhatsApp PIC harus diawali dengan 08!'); if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Konfirmasi Penerimaan'; } return; }
    if (phone.length < 10 || phone.length > 13) { alert('Nomor WhatsApp PIC harus berukuran antara 10 hingga 13 digit!'); if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Konfirmasi Penerimaan'; } return; }
    
    const rows     = document.querySelectorAll('.consignment-product-row');
    const baseId   = passId;
    const todayStr = new Date().toISOString().split('T')[0];
    
    let allValid = true;
    rows.forEach((row, index) => {
        const expiryDate = row.querySelector('.prod-expiry').value;
        if (expiryDate < todayStr) {
            alert(`Tanggal expired untuk Obat #${index + 1} tidak boleh kurang dari hari ini!`);
            allValid = false;
        }
    });
    if (!allValid) { if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Konfirmasi Penerimaan'; } return; }
    
    // Upload semua foto terlebih dahulu
    const uploadedUrls = new Map();
    for (const [rowEl, file] of _consignPhotoFiles) {
        const url = await uploadPhoto(file);
        if (url) uploadedUrls.set(rowEl, url);
    }
    _consignPhotoFiles.clear();
    
    rows.forEach((row, index) => {
        const productName  = row.querySelector('.prod-name').value;
        const category     = row.querySelector('.prod-cat').value;
        let qty            = parseInt(row.querySelector('.prod-qty').value, 10);
        qty                = Math.min(99999, Math.max(1, qty));
        const basePriceRaw = row.querySelector('.prod-base').value.replace(/[^0-9]/g, '');
        let basePrice      = parseInt(basePriceRaw, 10) || 0;
        basePrice          = Math.min(99999999, Math.max(0, basePrice));
        const sellPriceRaw = row.querySelector('.prod-sell').value.replace(/[^0-9]/g, '');
        let sellPrice      = parseInt(sellPriceRaw, 10) || 0;
        sellPrice          = Math.min(99999999, Math.max(0, sellPrice));
        const expiryDate   = row.querySelector('.prod-expiry').value;
        const uploadedImg  = uploadedUrls.get(row) || null;
        const fallbackImg  = productName.toLowerCase().includes('syrup') || productName.toLowerCase().includes('sirup') || productName.toLowerCase().includes('betadine') || productName.toLowerCase().includes('minyak') ? 'img/syrup.png' : 'img/pills.png';
        const itemConsignmentId = baseId * 1000 + index;
        const itemProductId     = generateSafeId() + index;
        
        state.consignment.unshift({
            id: itemConsignmentId, refId: baseId, supplier, items: productName,
            qty, sold: 0, basePrice, sellPrice,
            dateReceived: new Date().toISOString().split('T')[0],
            status: 'Aktif', pic, phone
        });

        const existingProduct = state.products.find(p => p.name.toLowerCase().trim() === productName.toLowerCase().trim());
        if (existingProduct) {
            existingProduct.stock    = Math.min(99999, existingProduct.stock + qty);
            existingProduct.price    = sellPrice;
            existingProduct.expiry   = expiryDate;
            existingProduct.category = category;
            existingProduct.origin   = 'Konsinyasi';
            existingProduct.supplierId = itemConsignmentId;
            existingProduct.status   = 'Tersedia';
            if (uploadedImg) existingProduct.image = uploadedImg;
        } else {
            state.products.unshift({
                id: itemProductId, name: productName, category,
                price: sellPrice, stock: qty, expiry: expiryDate,
                image: uploadedImg || fallbackImg,
                origin: 'Konsinyasi', supplierId: itemConsignmentId,
                status: 'Tersedia'
            });
        }
    });

    // If pulled from a PO, update its status
    if (window.activeInboundPOId) {
        const po = (state.purchaseOrders || []).find(x => x.id === window.activeInboundPOId);
        if (po) {
            po.status = 'Received';
        }
        window.activeInboundPOId = null;
    }

    await saveState();
    closeModal();
    renderConsignment();
};

export const payConsignment = async (id) => {
    const c = state.consignment.find(x => x.id === id);
    if (c) {
        c.status = 'Lunas';
        await saveState();
        showModal(`
            <div style="text-align: center;">
                <div style="width: 64px; height: 64px; background: #ecfdf5; color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                    <i data-lucide="check" style="width: 32px; height: 32px;"></i>
                </div>
                <h2 style="margin-bottom: 8px;">Pembayaran Dilunasi</h2>
                <p style="color: var(--text-muted); margin-bottom: 24px;">Utang pembayaran kepada <strong>${c.supplier}</strong> telah tercatat lunas.</p>
                <button class="btn btn-primary" style="width: 100%; justify-content: center;" onclick="closeModal()">Selesai</button>
            </div>
        `);
        renderConsignment();
    }
};

export const returnConsignment = async (id) => {
    const c = state.consignment.find(x => x.id === id);
    if (c) {
        c.status = 'Diretur';
        const p = state.products.find(prod => prod.origin === 'Konsinyasi' && prod.supplierId === id);
        if (p) {
            const qtyReturned = p.stock;
            p.stock = 0;
            p.status = 'Diretur';
            
            // Add to destruction history if not already there
            const alreadyInHistory = state.destructionHistory.some(h => h.productId === p.id && h.reason.startsWith('Retur:'));
            if (!alreadyInHistory && qtyReturned > 0) {
                state.destructionHistory.unshift({
                    id: generateSafeId(),
                    destructionDate: new Date().toLocaleString('sv-SE').slice(0, 16).replace('T', ' '),
                    productId: p.id,
                    productName: p.name,
                    qty: qtyReturned,
                    buyPrice: p.buyPrice || 0,
                    expiry: p.expiry,
                    reason: 'Retur: Pengembalian seluruh sisa barang titipan via menu Konsinyasi',
                    user: state.currentUser.name
                });
            }
        }
        await saveState();
        showModal(`
            <div style="text-align: center;">
                <div style="width: 64px; height: 64px; background: #fff1f2; color: #e11d48; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                    <i data-lucide="rotate-ccw" style="width: 32px; height: 32px;"></i>
                </div>
                <h2 style="margin-bottom: 8px;">Retur Diaktifkan</h2>
                <p style="color: var(--text-muted); margin-bottom: 24px;">Barang titipan dari <strong>${c.supplier}</strong> telah ditandai untuk dikembalikan.</p>
                <button class="btn btn-primary" style="width: 100%; justify-content: center;" onclick="closeModal()">Selesai</button>
            </div>
        `);
        renderConsignment();
    }
};

export const showContactModal = (id) => {
    const c = state.consignment.find(x => x.id === id);
    if (!c) return;

    const isLowStock = (c.qty - c.sold) < 20;
    const isExpired = c.status === 'Diretur';
    
    let defaultMsg = `Halo ${c.pic} dari ${c.supplier}, saya dari Apotek Kimia Farma ingin menanyakan stok ${c.items}...`;
    
    if (isLowStock) {
        defaultMsg = `Halo ${c.pic}, stok barang titipan kami untuk *${c.items}* sisa sedikit (${c.qty - c.sold} unit). Mohon segera dikirimkan stok tambahan ya. Terima kasih!`;
    } else if (isExpired) {
        defaultMsg = `Halo ${c.pic}, barang titipan *${c.items}* sudah kami tandai untuk retur karena mendekati expired. Mohon segera dilakukan penjemputan barangnya. Terima kasih!`;
    }

    const waPhone = c.phone.startsWith('0') ? '62' + c.phone.slice(1) : c.phone;
    const waLink = `https://wa.me/${waPhone}?text=${encodeURIComponent(defaultMsg)}`;

    showModal(`
        <div style="text-align: center;">
            <div style="width: 64px; height: 64px; background: #dcfce7; color: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                <i data-lucide="message-square" style="width: 32px; height: 32px;"></i>
            </div>
            <h2 style="margin-bottom: 8px;">Hubungi Supplier</h2>
            <div style="background: #f8fafc; padding: 16px; border-radius: 12px; margin-bottom: 24px; text-align: left;">
                <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">Nama Supplier:</p>
                <p style="font-weight: 700; margin-bottom: 12px;">${c.supplier}</p>
                
                <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">PIC / Sales:</p>
                <p style="font-weight: 700; margin-bottom: 12px;">${c.pic}</p>
                
                <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">No. WhatsApp:</p>
                <p style="font-weight: 700;">+${waPhone}</p>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <a href="${waLink}" target="_blank" class="btn btn-primary" style="justify-content: center; background: #25d366; text-decoration: none;">
                    <i data-lucide="send"></i> Kirim WhatsApp Masalah Stok
                </a>
                <button class="btn btn-outline" style="justify-content: center;" onclick="closeModal()">Tutup</button>
            </div>
        </div>
    `);
    if (window.lucide) window.lucide.createIcons();
};

export const viewConsignment = (id) => {
    const c = state.consignment.find(x => x.id === id);
    if (!c) return;

    const totalBill = c.sold * c.basePrice;
    const totalMargin = c.sold * ((c.sellPrice || c.basePrice) - c.basePrice);

    showModal(`
        <div class="official-doc">
            <div class="doc-header">
                <p style="font-weight: 800; font-size: 1.2rem; margin: 0;">APOTEK KIMIA FARMA</p>
                <h1 class="doc-title" style="margin-top: 16px;">NOTA PELUNASAN KONSINYASI</h1>
            </div>

            <div class="doc-meta">
                <div>
                    <p><strong>No. Ref:</strong> #KNS-${c.id}</p>
                    <p><strong>Tanggal Keluar:</strong> ${formatDate(new Date().toISOString())}</p>
                </div>
                <div style="text-align: right;">
                    <p><strong>Supplier:</strong> ${c.supplier}</p>
                    <p><strong>UP:</strong> ${c.pic}</p>
                </div>
            </div>

            <table class="doc-table">
                <thead>
                    <tr>
                        <th style="text-align: left;">Item Obat</th>
                        <th style="text-align: center;">Terjual</th>
                        <th style="text-align: right;">Harga Titip</th>
                        <th style="text-align: right;">Subtotal Tagihan</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${c.items}</td>
                        <td style="text-align: center;">${c.sold} Unit</td>
                        <td style="text-align: right;">${formatCurrency(c.basePrice)}</td>
                        <td style="text-align: right;">${formatCurrency(totalBill)}</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" style="text-align: right; padding: 12px 0; font-weight: 800;">TOTAL DIBAYARKAN</td>
                        <td style="text-align: right; padding: 12px 0; font-weight: 800; font-size: 1.1rem; color: #166534;">${formatCurrency(totalBill)}</td>
                    </tr>
                </tfoot>
            </table>

            <div style="display: flex; justify-content: space-between; align-items: end; margin-top: 40px;">
                <div class="signature-box" style="text-align: left;">
                    ${c.status === 'Lunas' ? '<div class="stamp-lunas">LUNAS / PAID</div>' : '<div style="color: #999; font-style: italic;">Menunggu Pembayaran</div>'}
                    <div class="signature-line" style="text-align: center;">Bagian Keuangan</div>
                </div>
                
                <div class="signature-box">
                    <p>Diterima Oleh,</p>
                    <div class="signature-line">Supplier: ${c.supplier}</div>
                </div>
            </div>

            <div style="margin-top: 32px; font-size: 0.75rem; color: #666; font-style: italic; border-top: 1px solid #eee; padding-top: 12px;">
                *Dokumen ini merupakan salinan sah transaksi penyelesaian barang titipan antara Apotek Kimia Farma dengan pihak supplier rekanan.
            </div>

            <div style="margin-top: 32px; display: flex; gap: 8px;" class="no-print">
                <button class="btn btn-primary" style="flex: 1; justify-content: center;" onclick="window.print()"><i data-lucide="printer"></i> Cetak Nota Resmi</button>
                <button class="btn btn-outline" style="flex: 0.5; justify-content: center;" onclick="closeModal()">Tutup</button>
            </div>
        </div>
    `);
    if (window.lucide) window.lucide.createIcons();
};

export const showEditConsignmentModal = (id) => {
    const c = state.consignment.find(x => x.id === id);
    if (!c) return;
    
    let editPhone = c.phone || "";
    if (editPhone.startsWith('628')) {
        editPhone = '08' + editPhone.slice(3);
    } else if (editPhone.startsWith('8')) {
        editPhone = '08' + editPhone.slice(1);
    }
    
    showModal(`
        <div style="padding: 8px; text-align: left;">
            <h2 style="margin-bottom: 8px; font-weight: 800;">Edit Informasi Supplier</h2>
            <p style="color: var(--text-muted); margin-bottom: 20px; font-size: 0.9rem;">No. Referensi: <strong>#KNS-${c.refId || c.id}</strong></p>
            
            <form onsubmit="window.submitEditConsignment(event, ${id})">
                <div class="form-group" style="margin-bottom: 12px;">
                    <label style="font-weight: 600; margin-bottom: 6px; display: block; font-size: 0.85rem;">Nama Supplier</label>
                    <input type="text" id="edit-consig-supplier" value="${c.supplier || ''}" required style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px;">
                </div>
                
                <div class="grid-2-col" style="margin-bottom: 12px;">
                    <div class="form-group">
                        <label style="font-weight: 600; margin-bottom: 6px; display: block; font-size: 0.85rem;">Nama Penyalur / PIC (UP)</label>
                        <input type="text" id="edit-consig-pic" value="${c.pic || ''}" required style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px;">
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 600; margin-bottom: 6px; display: block; font-size: 0.85rem;">No. WhatsApp PIC</label>
                        <input type="text" id="edit-consig-phone" value="${editPhone}" pattern="08[0-9]{8,11}" maxlength="13" title="Nomor WhatsApp harus diawali dengan 08 dan berukuran antara 10 hingga 13 digit angka." required style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px;">
                    </div>
                </div>
                
                <div style="display: flex; gap: 12px; margin-top: 28px;">
                    <button type="submit" class="btn btn-primary" style="flex: 1; justify-content: center; padding: 14px;">
                        <i data-lucide="save"></i> Simpan Perubahan
                    </button>
                    <button type="button" class="btn btn-outline" onclick="closeModal()" style="flex: 0.5; justify-content: center; padding: 14px;">Batal</button>
                </div>
            </form>
        </div>
    `);
    
    // Bind constraints & formatting to inputs
    const phoneInput = document.getElementById('edit-consig-phone');
    if (phoneInput) {
        phoneInput.addEventListener('keydown', (e) => {
            if (e.key === '-' || e.key === 'e' || e.key === '+' || e.key === '.') {
                e.preventDefault();
            }
        });
        phoneInput.addEventListener('input', (e) => {
            let clean = e.target.value.replace(/[^0-9]/g, '');
            if (clean.length > 13) {
                clean = clean.slice(0, 13);
            }
            e.target.value = clean;
        });
        phoneInput.addEventListener('blur', (e) => {
            let val = e.target.value.trim();
            if (val.length > 0) {
                if (val.startsWith('628')) {
                    val = '08' + val.slice(3);
                } else if (val.startsWith('8')) {
                    val = '08' + val.slice(1);
                }
                if (!val.startsWith('08')) {
                    alert('Nomor WhatsApp PIC harus diawali dengan 08!');
                    val = '08' + val.replace(/^0+/, '');
                    if (!val.startsWith('08')) {
                        val = '08';
                    }
                }
                if (val.length > 13) {
                    val = val.slice(0, 13);
                }
                e.target.value = val;
            }
        });
    }
    
    if (window.lucide) window.lucide.createIcons();
};

export const submitEditConsignment = async (e, id) => {
    e.preventDefault();
    const c = state.consignment.find(x => x.id === id);
    if (!c) return;
    const supplier = document.getElementById('edit-consig-supplier').value.trim();
    const pic      = document.getElementById('edit-consig-pic').value.trim();
    const phoneRaw = document.getElementById('edit-consig-phone').value.replace(/[^0-9]/g, '');
    const phone    = phoneRaw || "081234567890";
    if (!phone.startsWith('08')) { alert('Nomor WhatsApp PIC harus diawali dengan 08!'); return; }
    if (phone.length < 10 || phone.length > 13) { alert('Nomor WhatsApp PIC harus berukuran antara 10 hingga 13 digit!'); return; }
    const oldSupplier = c.supplier;
    c.supplier = supplier; c.pic = pic; c.phone = phone;
    state.consignment.forEach(item => {
        if (item.supplier === oldSupplier) { item.supplier = supplier; item.pic = pic; item.phone = phone; }
    });
    await saveState();
    closeModal();
    renderConsignment();
};

// Bind to window
window.renderConsignment = renderConsignment;
window.setConsignmentFilter = setConsignmentFilter;
window.showAddConsignmentModal = showAddConsignmentModal;
window.submitConsignment = submitConsignment;
window.payConsignment = payConsignment;
window.returnConsignment = returnConsignment;
window.showContactModal = showContactModal;
window.viewConsignment = viewConsignment;
window.showEditConsignmentModal = showEditConsignmentModal;
window.submitEditConsignment = submitEditConsignment;

window.handleConsignmentPOSelect = (selectEl) => {
    const poId = parseInt(selectEl.value, 10);
    if (!poId) {
        window.activeInboundPOId = null;
        return;
    }
    const po = (state.purchaseOrders || []).find(x => x.id === poId);
    if (po) {
        window.activeInboundPOId = po.id;
        document.getElementById('consig-supplier').value = po.supplierName || '';
        document.getElementById('consig-pic').value = po.picName || '';
        document.getElementById('consig-phone').value = po.phoneNumber || '';

        // Clear existing product container rows
        const container = document.getElementById('consignment-products-container');
        if (container) {
            container.innerHTML = '';
            
            // Add rows for each PO item
            po.items.forEach(item => {
                window.addConsignmentProductRow(
                    item.productName,
                    item.category,
                    item.qty,
                    item.basePrice,
                    item.sellPrice
                );
            });
        }
    }
};
