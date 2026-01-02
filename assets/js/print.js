// PHARMADICES - Print Functionality
// Handles printing medicine information

document.addEventListener('DOMContentLoaded', function() {
    initPrintFunctionality();
});

// Initialize print functionality
function initPrintFunctionality() {
    // Add print styles
    addPrintStyles();
    
    // Setup print buttons
    setupPrintButtons();
}

// Setup print buttons
function setupPrintButtons() {
    // Print medicine details
    document.addEventListener('click', function(e) {
        if (e.target.closest('.print-medicine-btn')) {
            const medicineId = e.target.closest('.print-medicine-btn').dataset.id;
            printMedicineDetails(medicineId);
        }
        
        if (e.target.closest('.print-list-btn')) {
            printMedicinesList();
        }
    });
}

// Print medicine details
function printMedicineDetails(medicineId) {
    // Get medicine data (assuming it's available globally)
    const medicine = window.allMedicines?.find(m => m.id == medicineId);
    if (!medicine) {
        showNotification('Medicine data not found', 'error');
        return;
    }
    
    const printContent = generateMedicinePrintContent(medicine);
    openPrintWindow(printContent, `${medicine.name} - Medicine Information`);
}

// Generate print content for medicine
function generateMedicinePrintContent(medicine) {
    const typeIcon = getMedicineTypeIcon(medicine.type);
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${medicine.name} - Medicine Information</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                .header { text-align: center; border-bottom: 2px solid #1a73e8; padding-bottom: 20px; margin-bottom: 30px; }
                .logo { font-size: 24px; font-weight: bold; color: #1a73e8; margin-bottom: 10px; }
                .medicine-name { font-size: 28px; font-weight: bold; margin: 20px 0; }
                .medicine-type { display: inline-block; padding: 5px 15px; background: #e3f2fd; color: #1565c0; border-radius: 20px; font-size: 14px; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
                .info-item { margin-bottom: 15px; }
                .info-label { font-weight: bold; color: #333; margin-bottom: 5px; }
                .info-value { color: #666; }
                .section { margin: 30px 0; }
                .section-title { font-size: 18px; font-weight: bold; color: #1a73e8; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; }
                .disclaimer { background: #fff8e1; padding: 15px; border-left: 4px solid #ff9800; margin-top: 30px; }
                .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">🏥 PHARMADICES</div>
                <div>Medicine Information Database</div>
            </div>
            
            <div class="medicine-name">${medicine.name}</div>
            <div class="medicine-type">${medicine.type}</div>
            
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Brand Name:</div>
                    <div class="info-value">${medicine.brand}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Generic Name:</div>
                    <div class="info-value">${medicine.generic}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Drug Class:</div>
                    <div class="info-value">${medicine.drugClass || 'Not specified'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Form:</div>
                    <div class="info-value">${medicine.form || 'Not specified'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Strength:</div>
                    <div class="info-value">${medicine.strength || 'Not specified'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Pregnancy Category:</div>
                    <div class="info-value">${medicine.pregnancy || 'Consult doctor'}</div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Uses</div>
                <div>${medicine.uses || 'Information not available'}</div>
            </div>
            
            <div class="section">
                <div class="section-title">Dosage</div>
                <div>${medicine.dosage || 'Consult your healthcare provider for proper dosage.'}</div>
            </div>
            
            <div class="section">
                <div class="section-title">Side Effects</div>
                <div>${medicine.sideEffects || 'Common side effects may include nausea, headache, or dizziness. Report any severe reactions to your doctor.'}</div>
            </div>
            
            <div class="section">
                <div class="section-title">Precautions</div>
                <div>${medicine.precautions || 'Inform your doctor about any allergies or medical conditions before taking this medicine.'}</div>
            </div>
            
            <div class="section">
                <div class="section-title">Drug Interactions</div>
                <div>${medicine.interactions || 'May interact with other medications. Inform your doctor about all drugs you are taking.'}</div>
            </div>
            
            <div class="section">
                <div class="section-title">Storage</div>
                <div>${medicine.storage || 'Store at room temperature, away from moisture and heat.'}</div>
            </div>
            
            <div class="disclaimer">
                <strong>Disclaimer:</strong> This information is for educational purposes only. Always consult a healthcare professional before taking any medication. Do not self-medicate.
            </div>
            
            <div class="footer">
                <div>Printed from PHARMADICES Medicine Database</div>
                <div>Developed by Students of GPGC Lakki Marwat</div>
                <div>Print Date: ${new Date().toLocaleDateString()}</div>
            </div>
        </body>
        </html>
    `;
}

// Print medicines list
function printMedicinesList() {
    const medicines = window.filteredMedicines || window.allMedicines || [];
    if (medicines.length === 0) {
        showNotification('No medicines to print', 'error');
        return;
    }
    
    const printContent = generateMedicinesListPrintContent(medicines);
    openPrintWindow(printContent, 'Medicines List');
}

// Generate print content for medicines list
function generateMedicinesListPrintContent(medicines) {
    const medicinesRows = medicines.map((medicine, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${medicine.name}</td>
            <td>${medicine.brand}</td>
            <td>${medicine.generic}</td>
            <td>${medicine.type}</td>
            <td>${medicine.drugClass || 'N/A'}</td>
            <td>${medicine.uses ? medicine.uses.substring(0, 100) + '...' : 'N/A'}</td>
        </tr>
    `).join('');
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Medicines List - PHARMADICES</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { font-size: 24px; font-weight: bold; color: #1a73e8; margin-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                th { background-color: #f2f2f2; font-weight: bold; }
                tr:nth-child(even) { background-color: #f9f9f9; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
                @media print { body { margin: 0; } th, td { font-size: 10px; padding: 6px; } }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">🏥 PHARMADICES</div>
                <div>Medicine Information Database</div>
                <div style="margin-top: 10px; font-size: 16px;">Medicines List (${medicines.length} medicines)</div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Medicine Name</th>
                        <th>Brand</th>
                        <th>Generic</th>
                        <th>Type</th>
                        <th>Drug Class</th>
                        <th>Uses</th>
                    </tr>
                </thead>
                <tbody>
                    ${medicinesRows}
                </tbody>
            </table>
            
            <div class="footer">
                <div>Printed from PHARMADICES Medicine Database</div>
                <div>Developed by Students of GPGC Lakki Marwat</div>
                <div>Print Date: ${new Date().toLocaleDateString()}</div>
            </div>
        </body>
        </html>
    `;
}

// Open print window
function openPrintWindow(content, title) {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(content);
    printWindow.document.close();
    
    printWindow.onload = function() {
        printWindow.focus();
        printWindow.print();
    };
}

// Get medicine type icon (helper function)
function getMedicineTypeIcon(type) {
    const iconMap = {
        'tablet': 'fa-tablet-alt',
        'capsule': 'fa-capsules',
        'syrup': 'fa-tint',
        'injection': 'fa-syringe',
        'ointment': 'fa-prescription-bottle-alt',
        'drops': 'fa-eye-dropper',
        'inhaler': 'fa-wind'
    };
    return iconMap[type] || 'fa-pills';
}

// Show notification (reuse from favorites.js)
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

// Add print styles
function addPrintStyles() {
    const printStyles = `
        .print-medicine-btn, .print-list-btn {
            background: #4caf50;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 10px 0;
        }
        
        .print-medicine-btn:hover, .print-list-btn:hover {
            background: #45a049;
            transform: translateY(-2px);
        }
        
        .print-controls {
            display: flex;
            gap: 10px;
            margin: 20px 0;
            justify-content: center;
        }
        
        @media print {
            .no-print, .navbar, .footer, .print-controls, .print-medicine-btn, .print-list-btn {
                display: none !important;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = printStyles;
    document.head.appendChild(styleSheet);
}