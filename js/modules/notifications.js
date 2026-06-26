/**
 * Notifications Module
 *
 * LOGIC:
 * - Badge count   = total notifications whose underlying condition is STILL TRUE in state
 *                   (purely data-driven — auto-drops when user fixes the problem)
 * - seenNotifications = IDs of notifications the user has CLICKED but not yet resolved
 * - A notification disappears from badge only when the underlying data is fixed
 * - Clicking marks it as "seen" (👁 Sudah dilihat) but keeps it in the list & badge
 */
import { state, saveState } from '../state.js';
import { formatDate } from '../utils.js';

// ─── Notification builder ─────────────────────────────────────────────────────

/**
 * Build the current list of active notifications from real state data.
 * Each item gets a stable ID derived from the problem type + record ID.
 */
export const getNotifications = () => {
    const notifs = [];

    state.products.forEach(p => {
        if (p.status === 'Dimusnahkan') return;

        if (p.stock < 15) {
            let isReturnedConsignment = false;
            if (p.origin === 'Konsinyasi' && p.supplierId) {
                const c = state.consignment.find(x => x.id === p.supplierId);
                if (c && c.status === 'Diretur') {
                    isReturnedConsignment = true;
                }
            }
            if (!isReturnedConsignment) {
                notifs.push({
                    id: `stock_${p.id}`,
                    type: 'warning',
                    icon: 'alert-triangle',
                    label: 'Stok Kritis',
                    text: `<strong>${p.name}</strong> — sisa ${p.stock} unit. Segera restock!`,
                    page: 'warehouse',
                    productId: p.id
                });
            }
        }

        const daysToExpiry = (new Date(p.expiry) - new Date()) / (1000 * 60 * 60 * 24);
        if (p.stock > 0 && daysToExpiry <= 30 && daysToExpiry > 0) {
            notifs.push({
                id: `expiry_${p.id}`,
                type: 'danger',
                icon: 'alert-circle',
                label: 'Mendekati Expired',
                text: `<strong>${p.name}</strong> — kedaluwarsa ${formatDate(p.expiry)}. ${p.origin === 'Konsinyasi' ? 'Segera retur ke supplier.' : 'Cek stok fisik!'}`,
                page: p.origin === 'Konsinyasi' ? 'consignment' : 'warehouse',
                productId: p.id,
                consignmentId: p.origin === 'Konsinyasi'
                    ? (state.consignment.find(c => c.items === p.name)?.id ?? null)
                    : null
            });
        }
    });

    state.consignment.filter(c => c.status === 'Diretur').forEach(c => {
        notifs.push({
            id: `retur_${c.id}`,
            type: 'info',
            icon: 'package',
            label: 'Barang Diretur',
            text: `<strong>${c.items}</strong> (${c.supplier}) — menunggu pengambilan supplier.`,
            page: 'consignment',
            consignmentId: c.id
        });
    });

    return notifs;
};

// ─── Badge ────────────────────────────────────────────────────────────────────

/**
 * Badge = ALL active (unresolved) notifications.
 * Does NOT subtract seen ones — badge only drops when data is actually fixed.
 */
export const updateNotificationBadge = () => {
    const all = getNotifications();
    const seen = state.seenNotifications || [];
    const unseenCount = all.filter(n => !seen.includes(n.id)).length;
    const totalCount = all.length;

    const badge = document.getElementById('notif-badge');
    const sidebarBadge = document.getElementById('sidebar-notif-badge');

    [badge, sidebarBadge].forEach(el => {
        if (!el) return;
        el.innerText = totalCount;
        el.style.display = totalCount > 0 ? 'inline-block' : 'none';
        // Orange when all are seen-but-unresolved, red when there are unseen ones
        el.style.background = unseenCount > 0 ? '#ef4444' : '#f97316';
    });

    if (badge) {
        const bellIcon = badge.parentElement.querySelector('svg');
        if (bellIcon) {
            bellIcon.style.color = totalCount > 0 ? 'var(--secondary)' : 'var(--text-muted)';
        }
    }
};

// ─── Mark as seen + navigate ──────────────────────────────────────────────────

/**
 * Mark a notification as seen (👁), set the row-highlight target,
 * close the modal, then navigate to the relevant page.
 *
 * The notification stays in the badge and list until the underlying
 * data condition is actually fixed.
 */
window.dismissNotification = (notifId, page) => {
    if (!state.seenNotifications) state.seenNotifications = [];
    if (!state.seenNotifications.includes(notifId)) {
        state.seenNotifications.push(notifId);
        saveState();
    }

    // Parse ID → set highlight target so destination page can scroll & flash the row
    const parts = notifId.split('_');
    const notifType = parts[0];
    const recordId = parseInt(parts[1]);

    if (notifType === 'stock' || notifType === 'expiry') {
        // For expiry on consignment items, we also need the consignment ID
        const notif = getNotifications().find(n => n.id === notifId);
        window.notifHighlightTarget = {
            productId: recordId,
            consignmentId: notif?.consignmentId ?? null,
            type: notifType
        };
    } else if (notifType === 'retur') {
        window.notifHighlightTarget = { consignmentId: recordId, type: notifType };
    }

    window.closeModal();
    if (window.navigate) window.navigate(page);
};

// ─── Modal popup (bell icon) ──────────────────────────────────────────────────

export const showNotifications = () => {
    const all = getNotifications();
    const seen = state.seenNotifications || [];

    const unseen = all.filter(n => !seen.includes(n.id));
    const seenList = all.filter(n => seen.includes(n.id));

    const pageLabels = {
        warehouse: 'Lihat di Gudang →',
        consignment: 'Lihat di Konsinyasi →',
        pos: 'Buka POS →',
    };

    const typeStyles = {
        warning: { color: '#d97706', bg: '#fffbeb', border: '#fef3c7' },
        danger:  { color: '#e11d48', bg: '#fff1f2', border: '#fecdd3' },
        info:    { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    };

    const renderItem = (n, isSeen) => {
        const s = typeStyles[n.type] || typeStyles.info;
        return `
            <div style="display: flex; align-items: flex-start; gap: 14px; padding: 14px 16px;
                        background: ${isSeen ? 'var(--bg-main)' : s.bg};
                        border: 1px solid ${isSeen ? 'var(--border)' : s.border};
                        border-left: 4px solid ${isSeen ? '#94a3b8' : s.color};
                        border-radius: 10px; cursor: pointer;
                        opacity: ${isSeen ? '0.7' : '1'};
                        transition: opacity 0.2s;"
                 onclick="dismissNotification('${n.id}', '${n.page}')"
                 onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='${isSeen ? '0.7' : '1'}'">
                <div style="color: ${isSeen ? '#94a3b8' : s.color}; flex-shrink: 0; margin-top: 2px;">
                    <i data-lucide="${isSeen ? 'eye' : n.icon}" style="width: 20px; height: 20px;"></i>
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
                        <span style="font-size: 0.72rem; font-weight: 700; color: ${isSeen ? '#94a3b8' : s.color};
                                     text-transform: uppercase; letter-spacing: 0.04em;">${n.label}</span>
                        ${isSeen ? `<span style="font-size: 0.68rem; background: #f1f5f9; color: #64748b;
                                               padding: 1px 6px; border-radius: 10px; font-weight: 500;">👁 Sudah dilihat</span>` : ''}
                    </div>
                    <p style="margin: 0 0 6px; font-size: 0.88rem; line-height: 1.45;">${n.text}</p>
                    <div style="display: flex; gap: 8px; align-items: center; margin-top: 6px;">
                        <span style="font-size: 0.78rem; color: ${isSeen ? '#94a3b8' : s.color}; font-weight: 600;">
                            ${isSeen ? '↻ Lihat lagi: ' : ''}${pageLabels[n.page] || 'Lihat Detail →'}
                        </span>
                        ${(n.id.startsWith('stock_') && state.products.find(p => p.id === n.productId)?.origin === 'Konsinyasi') ? `
                            <button class="btn btn-primary" style="padding: 4px 8px; font-size: 0.7rem; border-radius: 6px; line-height: 1; display: inline-flex; align-items: center; gap: 4px;"
                                    onclick="event.stopPropagation(); window.closeModal(); window.createPORestockFromNotif(${n.productId})">
                                <i data-lucide="shopping-bag" style="width: 12px; height: 12px;"></i> Buat PO Restock
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div style="color: var(--text-muted); flex-shrink: 0; align-self: center;">
                    <i data-lucide="chevron-right" style="width: 16px; height: 16px;"></i>
                </div>
            </div>
        `;
    };

    let content = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h2 style="margin: 0; font-size: 1.1rem;">🔔 Pusat Pemberitahuan</h2>
            <button class="icon-btn" onclick="closeModal()"><i data-lucide="x"></i></button>
        </div>
    `;

    if (all.length === 0) {
        content += `
            <div style="text-align: center; padding: 48px 20px; color: var(--text-muted);">
                <i data-lucide="check-circle" style="width: 48px; height: 48px; color: #16a34a; opacity: 0.5; margin-bottom: 16px;"></i>
                <br>Semua masalah sudah teratasi. Stok dan tanggal kadaluwarsa aman! 🎉
            </div>
        `;
    } else {
        if (unseen.length > 0) {
            content += `
                <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px;">
                    Klik notifikasi untuk melihat detail & menuju halaman terkait.
                </p>
                <div style="display: flex; flex-direction: column; gap: 8px; max-height: 380px; overflow-y: auto; padding-right: 4px; margin-bottom: ${seenList.length > 0 ? '16px' : '0'};">
                    ${unseen.map(n => renderItem(n, false)).join('')}
                </div>
            `;
        }

        if (seenList.length > 0) {
            content += `
                <p style="font-size: 0.78rem; color: #94a3b8; font-weight: 600; text-transform: uppercase;
                           letter-spacing: 0.05em; margin-bottom: 8px;">
                    Sudah dilihat — masalah belum terselesaikan
                </p>
                <div style="display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto; padding-right: 4px;">
                    ${seenList.map(n => renderItem(n, true)).join('')}
                </div>
            `;
        }
    }

    window.showModal(content);
};

// ─── Full-page notification view ──────────────────────────────────────────────

export const renderNotifications = () => {
    const pageTitle = document.getElementById('current-page-title');
    const contentArea = document.getElementById('content-area');

    const all = getNotifications();
    const seen = state.seenNotifications || [];
    const unseen = all.filter(n => !seen.includes(n.id));
    const seenList = all.filter(n => seen.includes(n.id));

    const typeStyles = {
        warning: { color: '#d97706', bg: '#fffbeb', border: '#fef3c7' },
        danger:  { color: '#e11d48', bg: '#fff1f2', border: '#fecdd3' },
        info:    { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    };

    pageTitle.textContent = 'Pusat Notifikasi & Peringatan';

    const pageLabels = {
        warehouse: 'Pergi ke Gudang',
        consignment: 'Pergi ke Konsinyasi',
        pos: 'Buka POS',
    };

    const renderCard = (n, isSeen) => {
        const s = typeStyles[n.type] || typeStyles.info;
        return `
            <div style="display: flex; align-items: flex-start; gap: 16px; padding: 16px;
                        background: ${isSeen ? 'var(--bg-main)' : s.bg};
                        border: 1px solid ${isSeen ? 'var(--border)' : s.border};
                        border-left: 4px solid ${isSeen ? '#94a3b8' : s.color};
                        border-radius: 12px; opacity: ${isSeen ? '0.8' : '1'};">
                <div style="color: ${isSeen ? '#94a3b8' : s.color}; flex-shrink: 0; margin-top: 3px;">
                    <i data-lucide="${isSeen ? 'eye' : n.icon}" style="width: 24px; height: 24px;"></i>
                </div>
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap;">
                        <span style="font-size: 0.72rem; font-weight: 700; color: ${isSeen ? '#94a3b8' : s.color};
                                     text-transform: uppercase; letter-spacing: 0.04em;">${n.label}</span>
                        ${isSeen ? `<span style="font-size: 0.7rem; background: #f1f5f9; color: #64748b;
                                               padding: 2px 8px; border-radius: 10px;">👁 Sudah dilihat · belum diselesaikan</span>` : ''}
                    </div>
                    <p style="margin: 0 0 10px; font-size: 0.9rem; line-height: 1.5;">${n.text}</p>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <button class="btn btn-outline" style="padding: 6px 14px; font-size: 0.8rem;"
                                onclick="dismissNotification('${n.id}', '${n.page}')">
                            → ${pageLabels[n.page] || 'Lihat Detail'}
                        </button>
                        ${(n.id.startsWith('stock_') && state.products.find(p => p.id === n.productId)?.origin === 'Konsinyasi') ? `
                            <button class="btn btn-primary" style="padding: 6px 14px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;"
                                    onclick="window.createPORestockFromNotif(${n.productId})">
                                <i data-lucide="shopping-bag" style="width: 14px; height: 14px;"></i> Buat PO Restock
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    };

    contentArea.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h3 style="margin: 0;">
                    Notifikasi Aktif
                    <span style="background: #ef4444; color: white; font-size: 0.75rem;
                                 padding: 2px 8px; border-radius: 20px; margin-left: 8px;">${all.length}</span>
                </h3>
                ${seen.length > 0 ? `
                    <button class="btn btn-outline" style="font-size: 0.8rem; padding: 6px 14px;"
                            onclick="resetSeenNotifications()">Reset Status Dilihat</button>
                ` : ''}
            </div>
            <p style="font-size: 0.83rem; color: var(--text-muted); margin-bottom: 20px;">
                Notifikasi di bawah akan hilang otomatis setelah permasalahannya benar-benar diselesaikan
                (contoh: stok ditambah, barang diretur diproses).
            </p>

            ${all.length === 0 ? `
                <div style="text-align: center; padding: 48px 0; color: var(--text-muted);">
                    <i data-lucide="bell-off" style="width: 48px; height: 48px; opacity: 0.3; margin-bottom: 16px;"></i>
                    <p>Semua permasalahan sudah ditangani. Tidak ada notifikasi aktif! 🎉</p>
                </div>
            ` : `
                ${unseen.length > 0 ? `
                    <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: ${seenList.length > 0 ? '28px' : '0'};">
                        ${unseen.map(n => renderCard(n, false)).join('')}
                    </div>
                ` : ''}

                ${seenList.length > 0 ? `
                    <p style="font-size: 0.78rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;
                               letter-spacing: 0.05em; margin-bottom: 12px;">
                        Sudah dilihat — masalah belum diselesaikan
                    </p>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${seenList.map(n => renderCard(n, true)).join('')}
                    </div>
                ` : ''}
            `}
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();
};

/** Reset seen status so all active notifications appear as "unseen" again (for demo). */
window.resetSeenNotifications = () => {
    state.seenNotifications = [];
    saveState();
    renderNotifications();
};

// Bind to window
window.updateNotificationBadge = updateNotificationBadge;
window.showNotifications = showNotifications;
window.renderNotifications = renderNotifications;
