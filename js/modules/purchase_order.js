/**
 * Purchase Order (PO) & Pengadaan Barang Module
 */
import { state, saveState } from '../state.js';
import { showModal, closeModal, formatCurrency, formatDate, generateSafeId } from '../utils.js';

let poFilterTab = 'All';

export const renderPurchaseOrder = () => {
    const pageTitle = document.getElementById('current-page-title');
    const contentArea = document.getElementById('content-area');

    pageTitle.textContent = "Pengadaan Barang (PO)";

    const pos = state.purchaseOrders || [];
    const filteredPOs = pos.filter(po => {
        if (poFilterTab === 'All') return true;
        if (poFilterTab === 'Draft') return po.status === 'Draft';
        if (poFilterTab === 'Sent') return po.status === 'Sent';
        if (poFilterTab === 'Received') return po.status === 'Received';
        return true;
    });

    const draftCount = pos.filter(po => po.status === 'Draft').length;
    const sentCount = pos.filter(po => po.status === 'Sent').length;
    const receivedCount = pos.filter(po => po.status === 'Received').length;

    contentArea.innerHTML = `
        <!-- Stats Widgets -->
        <div class="grid-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 24px;">
            <!-- CARD 1: Total Pengadaan -->
            <div class="card stat-card" style="border: 1px solid #e2e8f0; border-top: 4px solid var(--primary); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 20px; display: flex; align-items: center; gap: 16px; border-radius: 16px; background: #fff;" 
                 onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 20px rgba(0,104,55,0.08)'" 
                 onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.05)'">
                <div class="stat-icon" style="background: rgba(0, 104, 55, 0.08); color: var(--primary); width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; flex-shrink: 0;">
                    <i data-lucide="file-text" style="width: 24px; height: 24px;"></i>
                </div>
                <div class="stat-info" style="display: flex; flex-direction: column;">
                    <span class="stat-label" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">Total Pengadaan (PO)</span>
                    <span class="stat-value" style="font-size: 1.4rem; font-weight: 700; color: var(--text-main); margin-top: 4px;">${pos.length}</span>
                </div>
            </div>

            <!-- CARD 2: PO Draft -->
            <div class="card stat-card" style="border: 1px solid #e2e8f0; border-top: 4px solid #64748b; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 20px; display: flex; align-items: center; gap: 16px; border-radius: 16px; background: #fff;" 
                 onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 20px rgba(100,116,139,0.08)'" 
                 onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.05)'">
                <div class="stat-icon" style="background: rgba(100, 116, 139, 0.08); color: #64748b; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; flex-shrink: 0;">
                    <i data-lucide="edit" style="width: 24px; height: 24px;"></i>
                </div>
                <div class="stat-info" style="display: flex; flex-direction: column;">
                    <span class="stat-label" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">PO Draft</span>
                    <span class="stat-value" style="font-size: 1.4rem; font-weight: 700; color: #64748b; margin-top: 4px;">${draftCount}</span>
                </div>
            </div>

            <!-- CARD 3: PO Dikirim -->
            <div class="card stat-card" style="border: 1px solid #e2e8f0; border-top: 4px solid #f97316; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 20px; display: flex; align-items: center; gap: 16px; border-radius: 16px; background: #fff;" 
                 onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 20px rgba(249,115,22,0.08)'" 
                 onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.05)'">
                <div class="stat-icon" style="background: rgba(249, 115, 22, 0.08); color: #f97316; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; flex-shrink: 0;">
                    <i data-lucide="send" style="width: 24px; height: 24px;"></i>
                </div>
                <div class="stat-info" style="display: flex; flex-direction: column;">
                    <span class="stat-label" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">PO Dikirim (Sent)</span>
                    <span class="stat-value" style="font-size: 1.4rem; font-weight: 700; color: #ea580c; margin-top: 4px;">${sentCount}</span>
                </div>
            </div>

            <!-- CARD 4: PO Diterima -->
            <div class="card stat-card" style="border: 1px solid #e2e8f0; border-top: 4px solid #16a34a; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 20px; display: flex; align-items: center; gap: 16px; border-radius: 16px; background: #fff;" 
                 onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 20px rgba(22,163,74,0.08)'" 
                 onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.05)'">
                <div class="stat-icon" style="background: rgba(22, 163, 74, 0.08); color: #16a34a; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; flex-shrink: 0;">
                    <i data-lucide="check-circle" style="width: 24px; height: 24px;"></i>
                </div>
                <div class="stat-info" style="display: flex; flex-direction: column;">
                    <span class="stat-label" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">PO Diterima (Received)</span>
                    <span class="stat-value" style="font-size: 1.4rem; font-weight: 700; color: #16a34a; margin-top: 4px;">${receivedCount}</span>
                </div>
            </div>
        </div>

        <div class="card">
            <!-- Header & Filter Tabs -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
                <div style="display: flex; gap: 8px;" class="tab-filters">
                    <button class="tab-btn ${poFilterTab === 'All' ? 'active' : ''}" onclick="window.setPOFilter('All')">Semua PO</button>
                    <button class="tab-btn ${poFilterTab === 'Draft' ? 'active' : ''}" onclick="window.setPOFilter('Draft')">Draft</button>
                    <button class="tab-btn ${poFilterTab === 'Sent' ? 'active' : ''}" onclick="window.setPOFilter('Sent')">Dikirim</button>
                    <button class="tab-btn ${poFilterTab === 'Received' ? 'active' : ''}" onclick="window.setPOFilter('Received')">Diterima</button>
                </div>
                
                <button class="btn btn-primary" onclick="window.showAddPOModal()">
                    <i data-lucide="plus"></i> Buat PO Baru
                </button>
            </div>

            <!-- Table -->
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>No. PO</th>
                            <th>Supplier</th>
                            <th>PIC / Narahubung</th>
                            <th>Tanggal Buat</th>
                            <th>Jumlah Item</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredPOs.length === 0 ? `
                            <tr>
                                <td colspan="7" style="text-align: center; padding: 32px; color: var(--text-muted);">
                                    Belum ada data Purchase Order (PO) untuk kategori ini.
                                </td>
                            </tr>
                        ` : filteredPOs.map(po => {
                            let badgeClass = 'status-warning';
                            let badgeText = 'Draft';
                            if (po.status === 'Sent') {
                                badgeClass = 'status-primary';
                                badgeText = 'Dikirim';
                            } else if (po.status === 'Received') {
                                badgeClass = 'status-success';
                                badgeText = 'Diterima';
                            }

                            return `
                                <tr data-po-id="${po.id}">
                                    <td><strong>${po.poNumber}</strong></td>
                                    <td>${po.supplierName}</td>
                                    <td>
                                        <div style="display: flex; flex-direction: column;">
                                            <span>${po.picName}</span>
                                            <span style="font-size: 0.75rem; color: var(--text-muted);">${po.phoneNumber}</span>
                                        </div>
                                    </td>
                                    <td>${formatDate(po.dateCreated)}</td>
                                    <td>${po.items ? po.items.length : 0} Jenis Obat</td>
                                    <td><span class="status-badge ${badgeClass}">${badgeText}</span></td>
                                    <td>
                                        <div style="display: flex; gap: 8px;">
                                            <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.75rem;" onclick="window.viewPODetail(${po.id})">
                                                <i data-lucide="eye" style="width: 14px; height: 14px;"></i> Detail
                                            </button>
                                            
                                            ${po.status !== 'Received' ? `
                                                <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.75rem; color: #2563eb; border-color: rgba(37,99,235,0.2);" onclick="window.sendPOWhatsApp(${po.id})">
                                                    <i data-lucide="send" style="width: 14px; height: 14px;"></i> WA PO
                                                </button>
                                            ` : ''}

                                            ${po.status === 'Sent' ? `
                                                <button class="btn btn-success" style="padding: 4px 8px; font-size: 0.75rem;" onclick="window.processPOReceipt(${po.id})">
                                                    <i data-lucide="download" style="width: 14px; height: 14px;"></i> Terima
                                                </button>
                                            ` : ''}

                                            <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.75rem; color: #ef4444; border-color: rgba(239,68,68,0.2);" onclick="window.deletePO(${po.id})">
                                                <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i> Hapus
                                            </button>
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
};

window.setPOFilter = (filter) => {
    poFilterTab = filter;
    renderPurchaseOrder();
};

// --- Show Add PO Modal ---
window.showAddPOModal = (prefillData = null) => {
    // Generate PO Number automatically: PO-KF-YYYYMMDD-[4 digit counter]
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}${mm}${dd}`;
    
    // Count current POs on this day
    const dayCount = (state.purchaseOrders || []).filter(po => po.poNumber.includes(formattedDate)).length + 1;
    const poNumber = `PO-KF-${formattedDate}-${String(dayCount).padStart(4, '0')}`;

    // Get unique list of existing suppliers from consignment table
    const existingSuppliersMap = new Map();
    (state.consignment || []).forEach(c => {
        if (c.supplier && !existingSuppliersMap.has(c.supplier)) {
            existingSuppliersMap.set(c.supplier, {
                supplier: c.supplier,
                pic: c.pic || '',
                phone: c.phone || ''
            });
        }
    });
    const existingSuppliers = Array.from(existingSuppliersMap.values());

    showModal(`
        <div style="padding: 8px; max-height: 80vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0;">Buat Purchase Order (PO)</h2>
                <span class="status-badge status-primary" id="po-num-display">${poNumber}</span>
            </div>
            
            <form onsubmit="window.submitPO(event, '${poNumber}')">
                <div class="form-group" style="margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 16px;">
                    <label style="font-weight: 700; margin-bottom: 8px; display: block; color: var(--primary);">Informasi Supplier</label>
                    
                    <div style="margin-bottom: 12px;">
                        <label style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 4px;">Pilih Supplier</label>
                        <select id="po-supplier-select" onchange="window.handlePOSupplierSelectChange(this)" required style="width: 100%; padding: 12px; border-radius: 8px;">
                            <option value="">-- Pilih Supplier --</option>
                            <option value="__NEW__" ${prefillData ? 'selected' : ''}>[ + ] Supplier Baru (Ketik Manual)</option>
                            ${existingSuppliers.map(s => `
                                <option value="${s.supplier}" data-pic="${s.pic}" data-phone="${s.phone}">${s.supplier}</option>
                            `).join('')}
                        </select>
                    </div>

                    <div id="po-supplier-manual-fields" style="display: block;">
                        <div class="form-group" style="margin-bottom: 12px;">
                            <label style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 4px;">Nama Supplier</label>
                            <input type="text" id="po-supplier-name" placeholder="Contoh: PT Sido Muncul" required style="width: 100%; padding: 12px; border-radius: 8px;">
                        </div>
                    </div>

                    <div class="grid-2-col">
                        <div class="form-group">
                            <label style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 4px;">Nama PIC / UP</label>
                            <input type="text" id="po-supplier-pic" placeholder="Contoh: Ibu Maya" required style="width: 100%; padding: 12px; border-radius: 8px;">
                        </div>
                        <div class="form-group">
                            <label style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 4px;">No. WhatsApp PIC</label>
                            <input type="text" id="po-supplier-phone" placeholder="Contoh: 081234567890" pattern="08[0-9]{8,11}" maxlength="13" required style="width: 100%; padding: 12px; border-radius: 8px;">
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <label style="font-weight: 700; color: var(--primary);">Daftar Pemesanan Obat</label>
                        <button type="button" class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem;" onclick="window.addPOProductRow()">
                            <i data-lucide="plus"></i> Tambah Baris Obat
                        </button>
                    </div>
                    
                    <div id="po-products-container">
                        <!-- Dynamic Rows Injected Here -->
                    </div>
                </div>

                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button type="submit" class="btn btn-primary" style="flex: 1; justify-content: center; padding: 14px;" onclick="window.poSubmitAction = 'Sent'">
                        <i data-lucide="send"></i> Simpan & Kirim WhatsApp
                    </button>
                    <button type="submit" class="btn btn-outline" style="flex: 1; justify-content: center; padding: 14px;" onclick="window.poSubmitAction = 'Draft'">
                        <i data-lucide="file-text"></i> Simpan Sebagai Draft
                    </button>
                    <button type="button" class="btn btn-outline" onclick="closeModal()" style="flex: 0.5; justify-content: center; color: #ef4444; border-color: rgba(239,68,68,0.2);">Batal</button>
                </div>
            </form>
        </div>
    `, '750px');

    // Setup input restraints for WA Phone
    const phoneInput = document.getElementById('po-supplier-phone');
    if (phoneInput) {
        phoneInput.addEventListener('keydown', (e) => {
            if (e.key === '-' || e.key === 'e' || e.key === '+' || e.key === '.') {
                e.preventDefault();
            }
        });
        phoneInput.addEventListener('input', (e) => {
            let clean = e.target.value.replace(/[^0-9]/g, '');
            if (clean.length > 13) clean = clean.slice(0, 13);
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
                    if (!val.startsWith('08')) val = '08';
                }
                if (val.length > 13) val = val.slice(0, 13);
                e.target.value = val;
            }
        });
    }

    // Handle Prefill (e.g., from Notification button)
    if (prefillData) {
        const selectEl = document.getElementById('po-supplier-select');
        const manualFields = document.getElementById('po-supplier-manual-fields');
        const nameInput = document.getElementById('po-supplier-name');
        const picInput = document.getElementById('po-supplier-pic');
        const phoneInput = document.getElementById('po-supplier-phone');

        // Check if supplier is already in select list
        let matchedOption = false;
        if (selectEl) {
            for (let i = 0; i < selectEl.options.length; i++) {
                if (selectEl.options[i].value === prefillData.supplierName) {
                    selectEl.selectedIndex = i;
                    matchedOption = true;
                    break;
                }
            }
        }

        if (matchedOption) {
            manualFields.style.display = 'none';
            nameInput.removeAttribute('required');
            nameInput.value = prefillData.supplierName;
            picInput.value = prefillData.picName || '';
            phoneInput.value = prefillData.phoneNumber || '';
        } else {
            if (selectEl) selectEl.value = '__NEW__';
            manualFields.style.display = 'block';
            nameInput.setAttribute('required', 'required');
            nameInput.value = prefillData.supplierName;
            picInput.value = prefillData.picName || '';
            phoneInput.value = prefillData.phoneNumber || '';
        }

        // Add prefilled product row
        window.addPOProductRow(prefillData.productName, prefillData.category, 50, prefillData.basePrice, prefillData.sellPrice);
    } else {
        // Add one empty product row to start with
        window.addPOProductRow();
    }
};

window.handlePOSupplierSelectChange = (selectEl) => {
    const manualFields = document.getElementById('po-supplier-manual-fields');
    const nameInput = document.getElementById('po-supplier-name');
    const picInput = document.getElementById('po-supplier-pic');
    const phoneInput = document.getElementById('po-supplier-phone');

    if (selectEl.value === '__NEW__') {
        manualFields.style.display = 'block';
        nameInput.setAttribute('required', 'required');
        nameInput.value = '';
        picInput.value = '';
        phoneInput.value = '';
    } else if (selectEl.value === '') {
        manualFields.style.display = 'none';
        nameInput.removeAttribute('required');
        nameInput.value = '';
        picInput.value = '';
        phoneInput.value = '';
    } else {
        manualFields.style.display = 'none';
        nameInput.removeAttribute('required');
        nameInput.value = selectEl.value;
        
        const opt = selectEl.options[selectEl.selectedIndex];
        picInput.value = opt.getAttribute('data-pic') || '';
        phoneInput.value = opt.getAttribute('data-phone') || '';
    }
};

window.addPOProductRow = (productName = '', category = '', qty = 100, basePrice = 0, sellPrice = 0) => {
    const container = document.getElementById('po-products-container');
    if (!container) return;

    const index = container.querySelectorAll('.po-product-row').length + 1;

    const row = document.createElement('div');
    row.className = 'po-product-row card';
    row.style.background = 'var(--bg-main)';
    row.style.border = '1px solid var(--border)';
    row.style.borderRadius = '8px';
    row.style.padding = '16px';
    row.style.marginBottom = '12px';
    row.style.position = 'relative';

    row.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span style="font-weight: 700; font-size: 0.85rem; color: var(--primary);">Baris Pemesanan #${index}</span>
            ${index > 1 ? `
                <button type="button" class="icon-btn" onclick="window.removePOProductRow(this)" style="color: #ef4444; background: none; border: none; cursor: pointer;">
                    <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                </button>
            ` : ''}
        </div>
        <div class="grid-2-col" style="margin-bottom: 12px;">
            <div class="form-group">
                <label style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 4px;">Nama Obat</label>
                <input type="text" class="po-prod-name" placeholder="Contoh: Paracetamol 500mg" required value="${productName}" style="width: 100%;">
            </div>
            <div class="form-group">
                <label style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 4px;">Kategori</label>
                <select class="po-prod-cat" required style="width: 100%;">
                    <option value="Analgesik" ${category === 'Analgesik' ? 'selected' : ''}>Analgesik</option>
                    <option value="Antibiotik" ${category === 'Antibiotik' ? 'selected' : ''}>Antibiotik</option>
                    <option value="Vitamin" ${category === 'Vitamin' ? 'selected' : ''}>Vitamin</option>
                    <option value="Herbal" ${category === 'Herbal' ? 'selected' : ''}>Herbal</option>
                    <option value="Lainnya" ${category === 'Lainnya' || !category ? 'selected' : ''}>Lainnya</option>
                </select>
            </div>
        </div>
        <div class="grid-3-col">
            <div class="form-group">
                <label style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 4px;">Jumlah (Qty)</label>
                <input type="number" class="po-prod-qty" placeholder="0" min="1" max="9999" required value="${qty}" style="width: 100%;">
            </div>
            <div class="form-group">
                <label style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 4px;">Estimasi Harga Titip</label>
                <input type="text" class="po-prod-base rupiah-input" placeholder="Rp 0" required value="${basePrice > 0 ? basePrice : ''}" style="width: 100%;">
            </div>
            <div class="form-group">
                <label style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 4px;">Estimasi Harga Jual</label>
                <input type="text" class="po-prod-sell rupiah-input" placeholder="Rp 0" required value="${sellPrice > 0 ? sellPrice : ''}" style="width: 100%;">
            </div>
        </div>
    `;

    container.appendChild(row);

    // Setup input formatters
    row.querySelectorAll('.rupiah-input').forEach(input => {
        setupRupiahInputFormatter(input);
    });

    if (window.lucide) window.lucide.createIcons();
};

window.removePOProductRow = (btn) => {
    const row = btn.closest('.po-product-row');
    if (row) {
        row.remove();
        
        // Renumber rows
        const container = document.getElementById('po-products-container');
        container.querySelectorAll('.po-product-row').forEach((r, idx) => {
            const label = r.querySelector('span');
            if (label) label.textContent = `Baris Pemesanan #${idx + 1}`;
        });
    }
};

// --- Submit PO Form ---
window.submitPO = async (event, poNumber) => {
    event.preventDefault();

    const supplierName = document.getElementById('po-supplier-name').value.trim();
    const picName = document.getElementById('po-supplier-pic').value.trim();
    const phoneNumber = document.getElementById('po-supplier-phone').value.trim();

    const container = document.getElementById('po-products-container');
    const productRows = container.querySelectorAll('.po-product-row');
    
    if (productRows.length === 0) {
        alert("Harap tambahkan minimal satu obat!");
        return;
    }

    const items = [];
    productRows.forEach(row => {
        const name = row.querySelector('.po-prod-name').value.trim();
        const cat = row.querySelector('.po-prod-cat').value;
        const qty = parseInt(row.querySelector('.po-prod-qty').value, 10);
        
        const cleanBase = row.querySelector('.po-prod-base').value.replace(/[^0-9]/g, '');
        const cleanSell = row.querySelector('.po-prod-sell').value.replace(/[^0-9]/g, '');
        
        const basePrice = parseInt(cleanBase, 10) || 0;
        const sellPrice = parseInt(cleanSell, 10) || 0;

        items.push({
            productName: name,
            category: cat,
            qty: qty,
            basePrice: basePrice,
            sellPrice: sellPrice
        });
    });

    const newPO = {
        id: generateSafeId(),
        poNumber: poNumber,
        supplierName: supplierName,
        picName: picName,
        phoneNumber: phoneNumber,
        dateCreated: new Date().toISOString().split('T')[0],
        status: window.poSubmitAction || 'Draft',
        items: items
    };

    if (!state.purchaseOrders) state.purchaseOrders = [];
    state.purchaseOrders.unshift(newPO);

    // Save to server
    await saveState();

    closeModal();
    renderPurchaseOrder();

    // Trigger WhatsApp if "Sent" selected
    if (newPO.status === 'Sent') {
        window.sendPOWhatsApp(newPO.id);
    }
};

// --- Send WhatsApp ---
window.sendPOWhatsApp = (poId) => {
    const po = (state.purchaseOrders || []).find(x => x.id === poId);
    if (!po) return;

    // Build formal WhatsApp text
    let listText = '';
    po.items.forEach((item, idx) => {
        listText += `${idx + 1}. *${item.productName}* (${item.category})\n`;
        listText += `   - Jumlah: ${item.qty} unit\n`;
        listText += `   - Estimasi Harga Titip: ${formatCurrency(item.basePrice)}\n\n`;
    });

    const message = `Yth. *${po.supplierName}*
Up. *${po.picName}*

Dengan hormat,
Kami dari *Apotek Kimia Farma* ingin mengajukan pemesanan barang Konsinyasi (Purchase Order) dengan rincian berikut:

📄 *Nomor PO:* ${po.poNumber}
📅 *Tanggal:* ${formatDate(po.dateCreated)}

*Rincian Barang:*
${listText}
Mohon dapat segera dikonfirmasi pesanan di atas dan diproses pengirimannya. Terima kasih banyak.

Hormat kami,
*Apotek Kimia Farma*`;

    // Normalize phone number (start with 62)
    let phone = po.phoneNumber;
    if (phone.startsWith('08')) {
        phone = '628' + phone.slice(2);
    }

    // Open WhatsApp
    const waUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');

    // Update status to Sent if it was Draft
    if (po.status === 'Draft') {
        po.status = 'Sent';
        saveState().then(() => renderPurchaseOrder());
    }
};

// --- View PO Details Modal ---
window.viewPODetail = (poId) => {
    const po = (state.purchaseOrders || []).find(x => x.id === poId);
    if (!po) return;

    let badgeClass = 'status-warning';
    let badgeText = 'Draft';
    if (po.status === 'Sent') {
        badgeClass = 'status-primary';
        badgeText = 'Dikirim';
    } else if (po.status === 'Received') {
        badgeClass = 'status-success';
        badgeText = 'Diterima';
    }

    showModal(`
        <div style="padding: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 12px;">
                <h2 style="margin: 0;">Detail Purchase Order (PO)</h2>
                <span class="status-badge ${badgeClass}">${badgeText}</span>
            </div>

            <div class="grid-2-col" style="margin-bottom: 20px; gap: 24px;">
                <div>
                    <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 4px;">Informasi PO</span>
                    <strong>Nomor PO:</strong> ${po.poNumber}<br>
                    <strong>Tanggal Dibuat:</strong> ${formatDate(po.dateCreated)}
                </div>
                <div>
                    <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 4px;">Supplier</span>
                    <strong>Nama Supplier:</strong> ${po.supplierName}<br>
                    <strong>PIC / Narahubung:</strong> ${po.picName} (${po.phoneNumber})
                </div>
            </div>

            <h4 style="margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 8px; color: var(--primary);">Daftar Pemesanan Obat</h4>
            <div class="table-container" style="margin-bottom: 20px; border: 1px solid var(--border); border-radius: 8px;">
                <table style="width: 100%;">
                    <thead>
                        <tr style="background: var(--bg-main);">
                            <th>Nama Obat</th>
                            <th>Kategori</th>
                            <th style="text-align: right;">Jumlah (Qty)</th>
                            <th style="text-align: right;">Harga Titip</th>
                            <th style="text-align: right;">Harga Jual</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${po.items.map(item => `
                            <tr>
                                <td><strong>${item.productName}</strong></td>
                                <td>${item.category}</td>
                                <td style="text-align: right;">${item.qty} unit</td>
                                <td style="text-align: right;">${formatCurrency(item.basePrice)}</td>
                                <td style="text-align: right;">${formatCurrency(item.sellPrice)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                ${po.status !== 'Received' ? `
                    <button class="btn btn-primary" onclick="closeModal(); window.sendPOWhatsApp(${po.id});">
                        <i data-lucide="send"></i> Kirim WhatsApp
                    </button>
                ` : ''}
                
                ${po.status === 'Sent' ? `
                    <button class="btn btn-success" onclick="closeModal(); window.processPOReceipt(${po.id});">
                        <i data-lucide="download"></i> Terima Inbound
                    </button>
                ` : ''}
                
                <button class="btn btn-outline" onclick="closeModal()">Tutup</button>
            </div>
        </div>
    `, '800px');
};

// --- Delete PO ---
window.deletePO = async (poId) => {
    if (!confirm("Apakah Anda yakin ingin menghapus Purchase Order ini?")) return;

    state.purchaseOrders = (state.purchaseOrders || []).filter(x => x.id !== poId);
    await saveState();
    renderPurchaseOrder();
};

// --- Hook to go to Consignment & prefill from PO ---
window.processPOReceipt = (poId) => {
    // We will navigate to consignment page and immediately open showAddConsignmentModal prefilled with this PO data!
    window.targetReceiptPOId = poId;
    window.navigate('consignment');
};

// --- Integrasi dari Notifikasi (Memicu Form PO dari Stok Kritis) ---
window.createPORestockFromNotif = (productId) => {
    const prod = state.products.find(p => p.id === productId);
    if (!prod) return;

    // Find the original consignment supplier data if it was a consignment item
    let supplierName = 'PT Sido Muncul'; // default backup
    let picName = 'Bpk. Heru';
    let phoneNumber = '081234567890';

    if (prod.origin === 'Konsinyasi' && prod.supplierId) {
        const c = state.consignment.find(x => x.id === prod.supplierId);
        if (c) {
            supplierName = c.supplier;
            picName = c.pic || '';
            phoneNumber = c.phone || '';
        }
    }

    const prefill = {
        supplierName: supplierName,
        picName: picName,
        phoneNumber: phoneNumber,
        productName: prod.name,
        category: prod.category,
        basePrice: prod.price ? Math.round(prod.price * 0.75) : 0, // estimate base price
        sellPrice: prod.price || 0
    };

    // Go to PO page and open Modal
    window.navigate('purchase_order');
    setTimeout(() => {
        window.showAddPOModal(prefill);
    }, 400);
};
