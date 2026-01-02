// PHARMADICES - Quick Actions Functionality
// Handles random medicine, quick stats, and other utility features

document.addEventListener('DOMContentLoaded', function() {
    initQuickActions();
});

// Initialize quick actions
function initQuickActions() {
    setupRandomMedicine();
    addQuickActionsStyles();
    setupKeyboardShortcuts();
}

// Setup random medicine functionality
function setupRandomMedicine() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('#random-medicine-btn')) {
            showRandomMedicine();
        }
    });
}

// Show random medicine
function showRandomMedicine() {
    const medicines = window.allMedicines || [];
    if (medicines.length === 0) {
        showNotification('No medicines available', 'error');
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * medicines.length);
    const randomMedicine = medicines[randomIndex];
    
    // Show medicine details
    if (window.showMedicineDetails) {
        window.showMedicineDetails(randomMedicine.id);
    } else {
        showNotification(`Random medicine: ${randomMedicine.name}`, 'info');
    }
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K for search focus
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('medicine-search');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
        // Ctrl/Cmd + R for random medicine
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            showRandomMedicine();
        }
        
        // Ctrl/Cmd + P for print
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            const printBtn = document.querySelector('.print-list-btn');
            if (printBtn) {
                printBtn.click();
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            const modal = document.getElementById('medicine-modal');
            if (modal && modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        }
    });
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation' : 'info'}-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Add quick actions styles
function addQuickActionsStyles() {
    const quickActionsStyles = `
        .quick-actions-toolbar {
            margin-top: 20px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .toolbar-section h4 {
            margin: 0 0 15px 0;
            color: white;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .action-buttons {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            justify-content: center;
        }
        
        .action-btn {
            background: rgba(255, 255, 255, 0.15);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 10px 18px;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.9rem;
            backdrop-filter: blur(5px);
        }
        
        .action-btn:hover {
            background: rgba(255, 255, 255, 0.25);
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
        }
        
        .action-btn:active {
            transform: translateY(0);
        }
        
        .action-btn i {
            font-size: 1rem;
        }
        
        /* Keyboard shortcuts hint */
        .shortcuts-hint {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 0.8rem;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .shortcuts-hint.show {
            opacity: 1;
        }
        
        @media (max-width: 768px) {
            .action-buttons {
                flex-direction: column;
            }
            
            .action-btn {
                justify-content: center;
                padding: 12px 20px;
            }
            
            .quick-actions-toolbar {
                padding: 15px;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = quickActionsStyles;
    document.head.appendChild(styleSheet);
}

// Show keyboard shortcuts hint
function showKeyboardShortcuts() {
    const hint = document.createElement('div');
    hint.className = 'shortcuts-hint';
    hint.innerHTML = `
        <strong>Keyboard Shortcuts:</strong><br>
        Ctrl+K: Focus Search | Ctrl+R: Random Medicine | Ctrl+P: Print | Esc: Close Modal
    `;
    
    document.body.appendChild(hint);
    
    setTimeout(() => {
        hint.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        hint.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(hint);
        }, 300);
    }, 5000);
}

// Show shortcuts hint on first visit
setTimeout(() => {
    if (!localStorage.getItem('pharmadices_shortcuts_shown')) {
        showKeyboardShortcuts();
        localStorage.setItem('pharmadices_shortcuts_shown', 'true');
    }
}, 3000);