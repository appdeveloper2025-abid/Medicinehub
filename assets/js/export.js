// PHARMADICES - Export Functionality
// Handles exporting medicine data to various formats

document.addEventListener('DOMContentLoaded', function() {
    initExportFunctionality();
});

// Initialize export functionality
function initExportFunctionality() {
    addExportButtons();
    setupExportHandlers();
}

// Add export buttons to medicines page
function addExportButtons() {
    const medicinesSection = document.querySelector('.medicines-section');
    if (medicinesSection && !document.querySelector('.export-controls')) {
        const exportControls = document.createElement('div');
        exportControls.className = 'export-controls';
        exportControls.innerHTML = `
            <h3>Export Options</h3>
            <div class="export-buttons">
                <button class="export-btn csv-export" data-format="csv">
                    <i class="fas fa-file-csv"></i> Export to CSV
                </button>
                <button class="export-btn json-export" data-format="json">
                    <i class="fas fa-file-code"></i> Export to JSON
                </button>
                <button class="export-btn txt-export" data-format="txt">
                    <i class="fas fa-file-alt"></i> Export to Text
                </button>
            </div>
        `;
        
        const container = medicinesSection.querySelector('.container');
        container.appendChild(exportControls);
    }
}

// Setup export event handlers
function setupExportHandlers() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.export-btn')) {
            const format = e.target.closest('.export-btn').dataset.format;
            const medicines = window.filteredMedicines || window.allMedicines || [];
            
            if (medicines.length === 0) {
                showNotification('No medicines to export', 'error');
                return;
            }
            
            exportMedicines(medicines, format);
        }
    });
}

// Export medicines in specified format
function exportMedicines(medicines, format) {
    let content, filename, mimeType;
    
    switch (format) {
        case 'csv':
            content = exportToCSV(medicines);
            filename = 'pharmadices_medicines.csv';
            mimeType = 'text/csv';
            break;
        case 'json':
            content = exportToJSON(medicines);
            filename = 'pharmadices_medicines.json';
            mimeType = 'application/json';
            break;
        case 'txt':
            content = exportToText(medicines);
            filename = 'pharmadices_medicines.txt';
            mimeType = 'text/plain';
            break;
        default:
            showNotification('Invalid export format', 'error');
            return;
    }
    
    downloadFile(content, filename, mimeType);
    showNotification(`Exported ${medicines.length} medicines to ${format.toUpperCase()}`, 'success');
}

// Export to CSV format
function exportToCSV(medicines) {
    const headers = [
        'ID', 'Name', 'Brand', 'Generic', 'Type', 'Drug Class', 'Form',
        'Uses', 'Dosage', 'Side Effects', 'Precautions', 'Interactions',
        'Pregnancy Category', 'Storage', 'Strength'
    ];
    
    let csv = headers.join(',') + '\\n';
    
    medicines.forEach(medicine => {
        const row = [
            medicine.id,
            `"${medicine.name || ''}"`,
            `"${medicine.brand || ''}"`,
            `"${medicine.generic || ''}"`,
            `"${medicine.type || ''}"`,
            `"${medicine.drugClass || ''}"`,
            `"${medicine.form || ''}"`,
            `"${(medicine.uses || '').replace(/"/g, '""')}"`,
            `"${(medicine.dosage || '').replace(/"/g, '""')}"`,
            `"${(medicine.sideEffects || '').replace(/"/g, '""')}"`,
            `"${(medicine.precautions || '').replace(/"/g, '""')}"`,
            `"${(medicine.interactions || '').replace(/"/g, '""')}"`,
            `"${medicine.pregnancy || ''}"`,
            `"${(medicine.storage || '').replace(/"/g, '""')}"`,
            `"${medicine.strength || ''}"`
        ];
        csv += row.join(',') + '\\n';
    });
    
    return csv;
}

// Export to JSON format
function exportToJSON(medicines) {
    const exportData = {
        exportInfo: {
            source: 'PHARMADICES Medicine Database',
            exportDate: new Date().toISOString(),
            totalMedicines: medicines.length,
            developer: 'Students of GPGC Lakki Marwat'
        },
        medicines: medicines
    };
    
    return JSON.stringify(exportData, null, 2);
}

// Export to Text format
function exportToText(medicines) {
    let text = 'PHARMADICES - Medicine Information Database\\n';
    text += '='.repeat(50) + '\\n';
    text += `Export Date: ${new Date().toLocaleDateString()}\\n`;
    text += `Total Medicines: ${medicines.length}\\n`;
    text += `Developed by: Students of GPGC Lakki Marwat\\n`;
    text += '='.repeat(50) + '\\n\\n';
    
    medicines.forEach((medicine, index) => {
        text += `${index + 1}. ${medicine.name}\\n`;
        text += `-`.repeat(30) + '\\n';
        text += `Brand: ${medicine.brand || 'N/A'}\\n`;
        text += `Generic: ${medicine.generic || 'N/A'}\\n`;
        text += `Type: ${medicine.type || 'N/A'}\\n`;
        text += `Drug Class: ${medicine.drugClass || 'N/A'}\\n`;
        text += `Form: ${medicine.form || 'N/A'}\\n`;
        text += `Strength: ${medicine.strength || 'N/A'}\\n`;
        text += `Uses: ${medicine.uses || 'N/A'}\\n`;
        text += `Dosage: ${medicine.dosage || 'N/A'}\\n`;
        text += `Side Effects: ${medicine.sideEffects || 'N/A'}\\n`;
        text += `Precautions: ${medicine.precautions || 'N/A'}\\n`;
        text += `Interactions: ${medicine.interactions || 'N/A'}\\n`;
        text += `Pregnancy: ${medicine.pregnancy || 'N/A'}\\n`;
        text += `Storage: ${medicine.storage || 'N/A'}\\n`;
        text += '\\n';
    });
    
    text += '='.repeat(50) + '\\n';
    text += 'Disclaimer: This information is for educational purposes only.\\n';
    text += 'Always consult a healthcare professional before taking any medication.\\n';
    
    return text;
}

// Download file
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
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

// Add export styles
const exportStyles = `
    .export-controls {
        background: white;
        border-radius: 12px;
        padding: 25px;
        margin: 30px 0;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        border-top: 4px solid #4caf50;
    }
    
    .export-controls h3 {
        margin: 0 0 20px 0;
        color: #333;
        font-size: 1.3rem;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .export-controls h3::before {
        content: '📊';
        font-size: 1.5rem;
    }
    
    .export-buttons {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
    }
    
    .export-btn {
        background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.95rem;
        box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
    }
    
    .export-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
    }
    
    .export-btn:active {
        transform: translateY(0);
    }
    
    .csv-export {
        background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
        box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
    }
    
    .csv-export:hover {
        box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);
    }
    
    .json-export {
        background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
        box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
    }
    
    .json-export:hover {
        box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4);
    }
    
    .txt-export {
        background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
        box-shadow: 0 2px 8px rgba(156, 39, 176, 0.3);
    }
    
    .txt-export:hover {
        box-shadow: 0 4px 15px rgba(156, 39, 176, 0.4);
    }
    
    @media (max-width: 768px) {
        .export-buttons {
            flex-direction: column;
        }
        
        .export-btn {
            justify-content: center;
        }
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = exportStyles;
document.head.appendChild(styleSheet);