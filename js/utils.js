/**
 * Utility functions for formatting and common UI tasks
 */

export const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return 'Rp.0';
    const formatted = new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0
    }).format(Math.abs(amount));
    const sign = amount < 0 ? '-' : '';
    return `${sign}Rp.${formatted}`;
};

export const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
};

export const showModal = (content, customWidth = '') => {
    const container = document.getElementById('modal-container');
    const contentArea = container.querySelector('.modal-content');
    if (customWidth) {
        contentArea.style.width = customWidth;
        contentArea.style.maxWidth = '95%';
    } else {
        contentArea.style.width = '';
        contentArea.style.maxWidth = '';
    }
    contentArea.innerHTML = content;
    container.classList.remove('hidden');
    document.body.classList.add('modal-open');
    
    // Auto-create icons if window.lucide exists
    if (window.lucide) window.lucide.createIcons();
};

export const closeModal = () => {
    const container = document.getElementById('modal-container');
    container.classList.add('hidden');
    document.body.classList.remove('modal-open');
    const contentArea = container.querySelector('.modal-content');
    contentArea.style.width = '';
    contentArea.style.maxWidth = '';
};

// Bind to window for HTML strings to access
window.showModal = showModal;
window.closeModal = closeModal;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;

export const setupRupiahInputFormatter = (input) => {
    if (!input) return;
    
    const formatValue = (val) => {
        let clean = val.replace(/[^0-9]/g, '');
        if (clean.length > 8) {
            clean = clean.substring(0, 8);
        }
        if (!clean) return '';
        return new Intl.NumberFormat('id-ID', {
            style: 'decimal',
            minimumFractionDigits: 0
        }).format(parseInt(clean, 10));
    };

    // Format initial value if any
    if (input.value) {
        input.value = formatValue(input.value);
    }

    input.addEventListener('input', (e) => {
        const cursorPosition = e.target.selectionStart;
        const oldLength = e.target.value.length;
        
        e.target.value = formatValue(e.target.value);
        
        // Adjust cursor position after formatting
        const newLength = e.target.value.length;
        const diff = newLength - oldLength;
        e.target.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
    });
};
window.setupRupiahInputFormatter = setupRupiahInputFormatter;

export const generateSafeId = () => {
    // Generate random 9-digit number between 100,000,000 and 999,999,999
    // Fits perfectly in INT UNSIGNED (max 4,294,967,295)
    return Math.floor(100000000 + Math.random() * 900000000);
};
window.generateSafeId = generateSafeId;

// Close modal on clicking outside the modal content (overlay backdrop click)
if (typeof document !== 'undefined') {
    const initModalCloseListener = () => {
        const container = document.getElementById('modal-container');
        if (container) {
            container.addEventListener('click', (e) => {
                if (e.target === container) {
                    closeModal();
                }
            });
        }
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initModalCloseListener);
    } else {
        initModalCloseListener();
    }
}

