/**
 * POS (Point of Sale) Module
 */
import { state, saveState } from '../state.js';
import { formatCurrency, showModal, closeModal, generateSafeId } from '../utils.js';

export const renderPOS = () => {
    const pageTitle = document.getElementById('current-page-title');
    const contentArea = document.getElementById('content-area');
    
    pageTitle.textContent = "Point of Sale";
    
    // Simpan posisi scroll sebelum update innerHTML agar tidak kembali ke atas
    const prevProductsContainer = document.getElementById('pos-products-container');
    const prevCartList = document.getElementById('cart-list');
    const prevProductsScroll = prevProductsContainer ? prevProductsContainer.scrollTop : 0;
    const prevCartScroll = prevCartList ? prevCartList.scrollTop : 0;
    const prevWindowScroll = window.scrollY || document.documentElement.scrollTop;
    
    const activeProducts = state.products.filter(p => {
        const today = new Date();
        today.setHours(0,0,0,0);
        const expDate = new Date(p.expiry);
        expDate.setHours(0,0,0,0);
        const isExpired = p.stock > 0 && expDate < today;
        const isDestroyed = p.status === 'Dimusnahkan' || p.status === 'Diretur';
        const isProposed = p.status === 'Diajukan Pemusnahan' || p.status === 'Diajukan Retur';
        return !isExpired && !isDestroyed && !isProposed;
    });
    
    contentArea.innerHTML = `
        <div class="pos-container-grid">
            <div id="pos-products-container" class="card" style="overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>Pilih Produk</h3>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">${activeProducts.length} Produk Tersedia</div>
                </div>
                <div class="product-grid">
                    ${activeProducts.map(p => {
                        const cartItem = state.cart.find(item => item.id === p.id);
                        const qtyInCart = cartItem ? cartItem.qty : 0;
                        return `
                            <div class="product-card ${qtyInCart > 0 ? 'selected' : ''}">
                                <img src="${p.image}" class="product-img" alt="${p.name}">
                                <div class="product-info" style="display: flex; flex-direction: column; flex-grow: 1;">
                                    <span class="product-cat" style="display: flex; justify-content: space-between;">
                                        <span>${p.category}</span>
                                        <span style="font-weight: 700; color: var(--primary);">KF-${String(p.id).padStart(4, '0')}</span>
                                    </span>
                                    <span class="product-name" style="margin-bottom: 8px;">${p.name}</span>
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; margin-bottom: 12px;">
                                        <span class="product-price">${formatCurrency(p.price)}</span>
                                        <span style="font-size: 0.75rem; color: ${p.stock < 15 ? '#b91c1c' : 'var(--text-muted)'}; font-weight: ${p.stock < 15 ? '600' : '400'}">
                                            Stok: ${p.stock}
                                        </span>
                                    </div>
                                    <div>
                                        ${qtyInCart === 0 ? `
                                            <button class="btn btn-outline" onclick="addToCart(${p.id})" style="width: 100%; justify-content: center; padding: 6px 12px; font-size: 0.85rem; border-radius: 8px; border: 1px solid var(--primary); color: var(--primary); background: transparent; cursor: pointer;">
                                                Tambah
                                            </button>
                                        ` : `
                                            <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-main); border: 1px solid var(--border); border-radius: 8px; padding: 4px 8px;">
                                                <button class="icon-btn" onclick="decreaseQty(${p.id})" style="padding: 4px; color: var(--text-muted); border: none; background: none; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                                                    <i data-lucide="minus" style="width: 14px; height: 14px;"></i>
                                                </button>
                                                <span style="font-size: 0.85rem; font-weight: 600;">${qtyInCart}</span>
                                                <button class="icon-btn" onclick="addToCart(${p.id})" style="padding: 4px; color: var(--primary); border: none; background: none; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                                                    <i data-lucide="plus" style="width: 14px; height: 14px;"></i>
                                                </button>
                                            </div>
                                        `}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <div class="card" style="display: flex; flex-direction: column;">
                <h3>Keranjang</h3>
                <div style="flex: 1; overflow-y: auto; margin: 16px 0;" id="cart-list">
                    ${state.cart.length === 0 ? '<p style="text-align: center; color: var(--text-muted); margin-top: 20px;">Keranjang kosong</p>' :
            state.cart.map(item => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; margin-bottom: 12px; border-bottom: 1px solid var(--border);">
                                <div style="max-width: 60%; flex-grow: 1;">
                                    <span style="display: block; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</span>
                                    <span style="font-size: 0.8rem; color: var(--text-muted);">${formatCurrency(item.price)} x ${item.qty}</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 12px; flex-shrink: 0;">
                                    <span style="font-weight: 600; font-size: 0.95rem;">${formatCurrency(item.price * item.qty)}</span>
                                    <button class="icon-btn" onclick="removeFromCart(${item.id})" style="color: #ef4444; padding: 6px; display: flex; align-items: center; justify-content: center; border: none; background: none; cursor: pointer;">
                                        <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')
        }
                </div>
                
                <div style="border-top: 2px solid var(--border); padding-top: 16px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Subtotal</span>
                        <span>${formatCurrency(state.cart.reduce((sum, i) => sum + (i.price * i.qty), 0))}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 16px; font-weight: 700; font-size: 1.25rem; color: var(--primary);">
                        <span>Total</span>
                        <span>${formatCurrency(state.cart.reduce((sum, i) => sum + (i.price * i.qty), 0))}</span>
                    </div>
                    <button class="btn btn-primary" style="width: 100%; justify-content: center; padding: 14px;" onclick="checkout()" ${state.cart.length === 0 ? 'disabled' : ''}>
                        <i data-lucide="shopping-cart"></i> Bayar Sekarang
                    </button>
                </div>
            </div>
        </div>
    `;

    // Kembalikan posisi scroll setelah update innerHTML
    const newProductsContainer = document.getElementById('pos-products-container');
    const newCartList = document.getElementById('cart-list');
    if (newProductsContainer) newProductsContainer.scrollTop = prevProductsScroll;
    if (newCartList) newCartList.scrollTop = prevCartScroll;
    window.scrollTo(0, prevWindowScroll);

    if (window.lucide) {
        window.lucide.createIcons();
    }
};

export const addToCart = (productId) => {
    const product = state.products.find(p => p.id === productId);
    const today = new Date();
    today.setHours(0,0,0,0);
    const expDate = new Date(product.expiry);
    expDate.setHours(0,0,0,0);
    const isExpired = product.stock > 0 && expDate < today;
    if (isExpired || 
        product.status === 'Dimusnahkan' || 
        product.status === 'Diajukan Pemusnahan' || 
        product.status === 'Diretur' || 
        product.status === 'Diajukan Retur') {
        alert("Produk tidak tersedia untuk dijual!");
        return;
    }
    if (product.stock <= 0) {
        alert("Stok habis!");
        return;
    }

    const cartItem = state.cart.find(item => item.id === productId);
    if (cartItem) {
        if (cartItem.qty < product.stock) {
            cartItem.qty++;
        } else {
            alert("Batas stok tercapai!");
        }
    } else {
        state.cart.push({ ...product, qty: 1 });
    }
    saveState();
    renderPOS();
};

export const removeFromCart = (productId) => {
    state.cart = state.cart.filter(item => item.id !== productId);
    saveState();
    renderPOS();
};

export const increaseQty = (productId) => {
    const cartItem = state.cart.find(item => item.id === productId);
    const product = state.products.find(p => p.id === productId);
    if (cartItem && product) {
        if (cartItem.qty < product.stock) {
            cartItem.qty++;
            saveState();
            renderPOS();
        } else {
            alert("Batas stok tercapai!");
        }
    }
};

export const decreaseQty = (productId) => {
    const cartItem = state.cart.find(item => item.id === productId);
    if (cartItem) {
        if (cartItem.qty > 1) {
            cartItem.qty--;
        } else {
            state.cart = state.cart.filter(item => item.id !== productId);
        }
        saveState();
        renderPOS();
    }
};

export const checkout = () => {
    const total = state.cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

    // Update stock and consignment sold count
    state.cart.forEach(cartItem => {
        const product = state.products.find(p => p.id === cartItem.id);
        if (product) product.stock -= cartItem.qty;

        // Sync terintegrasi ke Konsinyasi (Jika barangnya titipan)
        if (product && product.origin === 'Konsinyasi' && product.supplierId) {
            const consignmentItem = state.consignment.find(c => c.id === product.supplierId);
            if (consignmentItem) {
                consignmentItem.sold += cartItem.qty;
            }
        }
    });

    // Add to transaction history with explicit buyPrice tracking
    const txItems = state.cart.map(cartItem => {
        const product = state.products.find(p => p.id === cartItem.id);
        let buyPrice = 0;
        if (product) {
            if (product.origin === 'Konsinyasi' && product.supplierId) {
                const cItem = state.consignment.find(c => c.id === product.supplierId);
                buyPrice = cItem ? cItem.basePrice : (product.buyPrice || 0);
            } else {
                buyPrice = product.buyPrice || 0;
            }
        } else {
            buyPrice = cartItem.buyPrice || cartItem.basePrice || 0;
        }

        return {
            id: cartItem.id,
            name: cartItem.name,
            category: cartItem.category,
            price: cartItem.price,
            buyPrice: buyPrice,
            qty: cartItem.qty,
            origin: cartItem.origin,
            supplierId: cartItem.supplierId
        };
    });

    // Add to transaction history
    state.transactions.unshift({
        id: generateSafeId(),
        timestamp: new Date().toLocaleString('sv-SE').slice(0, 16).replace('T', ' '),
        total: total,
        items: txItems
    });

    state.cart = [];
    saveState();

    // Show success modal
    showModal(`
        <div style="text-align: center;">
            <div style="width: 64px; height: 64px; background: #ecfdf5; color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                <i data-lucide="check" style="width: 32px; height: 32px;"></i>
            </div>
            <h2 style="margin-bottom: 8px;">Pembayaran Berhasil!</h2>
            <p style="color: var(--text-muted); margin-bottom: 24px;">Transaksi telah dicatat dan stok telah diperbarui.</p>
            <button class="btn btn-primary" style="width: 100%; justify-content: center;" onclick="closeModal(); navigate('reports');">Lihat Laporan</button>
        </div>
    `);

    renderPOS();
};

// Bind to window
window.renderPOS = renderPOS;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.increaseQty = increaseQty;
window.decreaseQty = decreaseQty;
window.checkout = checkout;
