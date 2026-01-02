// PHARMADICES - Medicine Comparison Feature
// Compare multiple medicines side by side

document.addEventListener('DOMContentLoaded', function() {
    initMedicineComparison();
});

let comparisonList = [];

function initMedicineComparison() {
    addComparisonButtons();
    setupComparisonHandlers();
    addComparisonStyles();
}

function addComparisonButtons() {
    setTimeout(() => {
        const medicineCards = document.querySelectorAll('.medicine-card');
        medicineCards.forEach(card => {
            const medicineId = card.dataset.id;
            if (medicineId && !card.querySelector('.compare-btn')) {
                addCompareButton(card, medicineId);
            }
        });
    }, 1000);
}

function addCompareButton(card, medicineId) {
    const cardFooter = card.querySelector('.medicine-card-footer');
    if (!cardFooter) return;
    
    const compareBtn = document.createElement('button');
    compareBtn.className = 'compare-btn';
    compareBtn.dataset.id = medicineId;
    compareBtn.innerHTML = `<i class="fas fa-balance-scale"></i>`;
    compareBtn.title = 'Add to comparison';
    
    if (isInComparison(medicineId)) {
        compareBtn.classList.add('comparing');
        compareBtn.title = 'Remove from comparison';
    }
    
    compareBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleComparison(medicineId, compareBtn);
    });
    
    cardFooter.appendChild(compareBtn);
}

function toggleComparison(medicineId, button) {
    if (isInComparison(medicineId)) {
        removeFromComparison(medicineId);
        button.classList.remove('comparing');
        button.title = 'Add to comparison';
    } else {
        if (comparisonList.length >= 4) {
            showNotification('Maximum 4 medicines can be compared', 'error');
            return;
        }
        addToComparison(medicineId);
        button.classList.add('comparing');
        button.title = 'Remove from comparison';
    }
    updateComparisonPanel();
}

function addToComparison(medicineId) {
    if (!isInComparison(medicineId)) {
        comparisonList.push(medicineId);
        showNotification('Added to comparison', 'success');
    }
}

function removeFromComparison(medicineId) {
    comparisonList = comparisonList.filter(id => id !== medicineId);
    showNotification('Removed from comparison', 'info');
}

function isInComparison(medicineId) {
    return comparisonList.includes(medicineId);
}

function updateComparisonPanel() {
    let panel = document.getElementById('comparison-panel');
    
    if (comparisonList.length === 0) {
        if (panel) panel.remove();
        return;
    }
    
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'comparison-panel';
        panel.className = 'comparison-panel';
        document.body.appendChild(panel);
    }
    
    panel.innerHTML = `
        <div class="comparison-header">
            <h4><i class="fas fa-balance-scale"></i> Compare Medicines (${comparisonList.length}/4)</h4>
            <div class="comparison-actions">
                <button class="compare-view-btn" ${comparisonList.length < 2 ? 'disabled' : ''}>
                    <i class="fas fa-eye"></i> View Comparison
                </button>
                <button class="clear-comparison-btn">
                    <i class="fas fa-times"></i> Clear All
                </button>
            </div>
        </div>
        <div class="comparison-items">
            ${comparisonList.map(id => {
                const medicine = window.allMedicines?.find(m => m.id == id);
                return medicine ? `
                    <div class="comparison-item">
                        <span>${medicine.name}</span>
                        <button class="remove-item-btn" data-id="${id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                ` : '';
            }).join('')}
        </div>
    `;
    
    setupComparisonHandlers();
}

function setupComparisonHandlers() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.compare-view-btn')) {
            showComparisonModal();
        }
        
        if (e.target.closest('.clear-comparison-btn')) {
            clearComparison();
        }
        
        if (e.target.closest('.remove-item-btn')) {
            const medicineId = e.target.closest('.remove-item-btn').dataset.id;
            removeFromComparison(medicineId);
            updateComparisonButtons();
            updateComparisonPanel();
        }
    });
}

function showComparisonModal() {
    if (comparisonList.length < 2) {
        showNotification('Select at least 2 medicines to compare', 'error');
        return;
    }
    
    const medicines = comparisonList.map(id => 
        window.allMedicines?.find(m => m.id == id)
    ).filter(Boolean);
    
    const modal = document.createElement('div');
    modal.className = 'comparison-modal';
    modal.innerHTML = `
        <div class="comparison-modal-content">
            <div class="comparison-modal-header">
                <h2><i class="fas fa-balance-scale"></i> Medicine Comparison</h2>
                <button class="comparison-modal-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="comparison-modal-body">
                ${generateComparisonTable(medicines)}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.comparison-modal-close').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function generateComparisonTable(medicines) {
    const fields = [
        { key: 'name', label: 'Medicine Name' },
        { key: 'brand', label: 'Brand' },
        { key: 'generic', label: 'Generic' },
        { key: 'type', label: 'Type' },
        { key: 'drugClass', label: 'Drug Class' },
        { key: 'uses', label: 'Uses' },
        { key: 'dosage', label: 'Dosage' },
        { key: 'sideEffects', label: 'Side Effects' },
        { key: 'precautions', label: 'Precautions' },
        { key: 'interactions', label: 'Interactions' },
        { key: 'pregnancy', label: 'Pregnancy' },
        { key: 'storage', label: 'Storage' }
    ];
    
    return `
        <div class="comparison-table-container">
            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>Property</th>
                        ${medicines.map(m => `<th>${m.name}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${fields.map(field => `
                        <tr>
                            <td class="field-label">${field.label}</td>
                            ${medicines.map(m => `
                                <td class="field-value">${m[field.key] || 'N/A'}</td>
                            `).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function clearComparison() {
    comparisonList = [];
    updateComparisonButtons();
    updateComparisonPanel();
    showNotification('Comparison cleared', 'info');
}

function updateComparisonButtons() {
    document.querySelectorAll('.compare-btn').forEach(btn => {
        const medicineId = btn.dataset.id;
        if (isInComparison(medicineId)) {
            btn.classList.add('comparing');
            btn.title = 'Remove from comparison';
        } else {
            btn.classList.remove('comparing');
            btn.title = 'Add to comparison';
        }
    });
}

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

function addComparisonStyles() {
    const styles = `
        .compare-btn {
            width: 40px;
            height: 40px;
            border: none;
            border-radius: 50%;
            background: #f1f3f4;
            color: #666;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 10px;
        }
        
        .compare-btn:hover {
            background: #e3f2fd;
            color: #1976d2;
            transform: scale(1.1);
        }
        
        .compare-btn.comparing {
            background: #1976d2;
            color: white;
        }
        
        .comparison-panel {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            padding: 20px;
            max-width: 400px;
            z-index: 1000;
            border-top: 4px solid #1976d2;
        }
        
        .comparison-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .comparison-header h4 {
            margin: 0;
            color: #1976d2;
            font-size: 1rem;
        }
        
        .comparison-actions {
            display: flex;
            gap: 8px;
        }
        
        .compare-view-btn, .clear-comparison-btn {
            padding: 6px 12px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.8rem;
            transition: all 0.3s ease;
        }
        
        .compare-view-btn {
            background: #1976d2;
            color: white;
        }
        
        .compare-view-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        
        .clear-comparison-btn {
            background: #f44336;
            color: white;
        }
        
        .comparison-items {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .comparison-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8f9fa;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.9rem;
        }
        
        .remove-item-btn {
            background: none;
            border: none;
            color: #666;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
        }
        
        .remove-item-btn:hover {
            background: #e0e0e0;
            color: #f44336;
        }
        
        .comparison-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .comparison-modal-content {
            background: white;
            border-radius: 12px;
            max-width: 90vw;
            max-height: 90vh;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        .comparison-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #ddd;
            background: #f8f9fa;
        }
        
        .comparison-modal-header h2 {
            margin: 0;
            color: #1976d2;
        }
        
        .comparison-modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
        }
        
        .comparison-modal-body {
            padding: 20px;
            overflow: auto;
            max-height: 70vh;
        }
        
        .comparison-table-container {
            overflow-x: auto;
        }
        
        .comparison-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
        }
        
        .comparison-table th,
        .comparison-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
            vertical-align: top;
        }
        
        .comparison-table th {
            background: #1976d2;
            color: white;
            font-weight: 600;
            position: sticky;
            top: 0;
        }
        
        .field-label {
            background: #f8f9fa;
            font-weight: 600;
            color: #333;
            min-width: 120px;
        }
        
        .field-value {
            max-width: 200px;
            word-wrap: break-word;
        }
        
        @media (max-width: 768px) {
            .comparison-panel {
                bottom: 10px;
                right: 10px;
                left: 10px;
                max-width: none;
            }
            
            .comparison-table {
                font-size: 0.8rem;
            }
            
            .comparison-table th,
            .comparison-table td {
                padding: 8px;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}