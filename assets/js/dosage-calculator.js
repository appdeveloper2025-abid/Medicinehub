// PHARMADICES - Dosage Calculator
// Calculate appropriate medicine dosages based on patient parameters

document.addEventListener('DOMContentLoaded', function() {
    initDosageCalculator();
});

function initDosageCalculator() {
    addDosageButtons();
    setupDosageCalculator();
    addDosageStyles();
}

function addDosageButtons() {
    setTimeout(() => {
        const medicineCards = document.querySelectorAll('.medicine-card');
        medicineCards.forEach(card => {
            const medicineId = card.dataset.id;
            if (medicineId && !card.querySelector('.dosage-calc-btn')) {
                addDosageButton(card, medicineId);
            }
        });
    }, 1000);
}

function addDosageButton(card, medicineId) {
    const cardFooter = card.querySelector('.medicine-card-footer');
    if (!cardFooter) return;
    
    const dosageBtn = document.createElement('button');
    dosageBtn.className = 'dosage-calc-btn';
    dosageBtn.dataset.id = medicineId;
    dosageBtn.innerHTML = `<i class="fas fa-calculator"></i>`;
    dosageBtn.title = 'Calculate dosage';
    
    dosageBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        openDosageCalculator(medicineId);
    });
    
    cardFooter.appendChild(dosageBtn);
}

function openDosageCalculator(medicineId) {
    const medicine = window.allMedicines?.find(m => m.id == medicineId);
    if (!medicine) return;
    
    const modal = document.createElement('div');
    modal.className = 'dosage-calculator-modal';
    modal.innerHTML = `
        <div class="dosage-calculator-content">
            <div class="dosage-calculator-header">
                <h2><i class="fas fa-calculator"></i> Dosage Calculator - ${medicine.name}</h2>
                <button class="dosage-calculator-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="dosage-calculator-body">
                <div class="medicine-info">
                    <h3>Medicine Information</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Brand:</label>
                            <span>${medicine.brand}</span>
                        </div>
                        <div class="info-item">
                            <label>Generic:</label>
                            <span>${medicine.generic}</span>
                        </div>
                        <div class="info-item">
                            <label>Type:</label>
                            <span>${medicine.type}</span>
                        </div>
                        <div class="info-item">
                            <label>Strength:</label>
                            <span>${medicine.strength || 'Not specified'}</span>
                        </div>
                    </div>
                </div>
                
                <form class="dosage-form">
                    <div class="patient-info">
                        <h3>Patient Information</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="patient-age">Age:</label>
                                <input type="number" id="patient-age" min="0" max="120" placeholder="Years">
                            </div>
                            <div class="form-group">
                                <label for="patient-weight">Weight:</label>
                                <input type="number" id="patient-weight" min="0" step="0.1" placeholder="kg">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="patient-gender">Gender:</label>
                                <select id="patient-gender">
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="patient-category">Category:</label>
                                <select id="patient-category">
                                    <option value="adult">Adult</option>
                                    <option value="child">Child (2-12 years)</option>
                                    <option value="infant">Infant (0-2 years)</option>
                                    <option value="elderly">Elderly (65+ years)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="condition-info">
                        <h3>Condition & Severity</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="condition-severity">Severity:</label>
                                <select id="condition-severity">
                                    <option value="mild">Mild</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="severe">Severe</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="kidney-function">Kidney Function:</label>
                                <select id="kidney-function">
                                    <option value="normal">Normal</option>
                                    <option value="mild-impairment">Mild Impairment</option>
                                    <option value="moderate-impairment">Moderate Impairment</option>
                                    <option value="severe-impairment">Severe Impairment</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="liver-function">Liver Function:</label>
                                <select id="liver-function">
                                    <option value="normal">Normal</option>
                                    <option value="mild-impairment">Mild Impairment</option>
                                    <option value="moderate-impairment">Moderate Impairment</option>
                                    <option value="severe-impairment">Severe Impairment</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="is-pregnant"> Pregnant/Breastfeeding
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="calculation-actions">
                        <button type="submit" class="calculate-btn">
                            <i class="fas fa-calculator"></i> Calculate Dosage
                        </button>
                        <button type="button" class="reset-btn">
                            <i class="fas fa-undo"></i> Reset
                        </button>
                    </div>
                </form>
                
                <div class="dosage-results" id="dosage-results" style="display: none;">
                    <!-- Results will be populated here -->
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setupDosageCalculatorEvents(modal, medicine);
}

function setupDosageCalculatorEvents(modal, medicine) {
    const form = modal.querySelector('.dosage-form');
    const resetBtn = modal.querySelector('.reset-btn');
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateDosage(medicine, form);
    });
    
    // Reset form
    resetBtn.addEventListener('click', function() {
        form.reset();
        document.getElementById('dosage-results').style.display = 'none';
    });
    
    // Close modal
    modal.querySelector('.dosage-calculator-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function calculateDosage(medicine, form) {
    const patientData = {
        age: parseInt(form.querySelector('#patient-age').value) || 0,
        weight: parseFloat(form.querySelector('#patient-weight').value) || 0,
        gender: form.querySelector('#patient-gender').value,
        category: form.querySelector('#patient-category').value,
        severity: form.querySelector('#condition-severity').value,
        kidneyFunction: form.querySelector('#kidney-function').value,
        liverFunction: form.querySelector('#liver-function').value,
        isPregnant: form.querySelector('#is-pregnant').checked
    };
    
    // Validate required fields
    if (!patientData.age || !patientData.weight) {
        showNotification('Please enter age and weight', 'error');
        return;
    }
    
    const dosageResult = performDosageCalculation(medicine, patientData);
    displayDosageResults(dosageResult, medicine, patientData);
}

function performDosageCalculation(medicine, patient) {
    // Base dosage calculations for common medicines
    const dosageRules = {
        'Paracetamol': {
            adult: { min: 10, max: 15, unit: 'mg/kg', maxDaily: 4000, frequency: '4-6 hours' },
            child: { min: 10, max: 15, unit: 'mg/kg', maxDaily: 75, frequency: '4-6 hours' },
            infant: { min: 10, max: 15, unit: 'mg/kg', maxDaily: 60, frequency: '4-6 hours' }
        },
        'Ibuprofen': {
            adult: { min: 5, max: 10, unit: 'mg/kg', maxDaily: 2400, frequency: '6-8 hours' },
            child: { min: 5, max: 10, unit: 'mg/kg', maxDaily: 40, frequency: '6-8 hours' },
            infant: { min: 5, max: 10, unit: 'mg/kg', maxDaily: 30, frequency: '6-8 hours' }
        },
        'Amoxicillin': {
            adult: { min: 20, max: 40, unit: 'mg/kg', maxDaily: 3000, frequency: '8 hours' },
            child: { min: 20, max: 40, unit: 'mg/kg', maxDaily: 90, frequency: '8 hours' },
            infant: { min: 20, max: 40, unit: 'mg/kg', maxDaily: 90, frequency: '8 hours' }
        },
        'Aspirin': {
            adult: { min: 10, max: 15, unit: 'mg/kg', maxDaily: 4000, frequency: '4-6 hours' },
            child: null, // Contraindicated in children
            infant: null
        }
    };
    
    // Get base dosage rule
    let rule = dosageRules[medicine.name] || dosageRules[medicine.generic];
    
    if (!rule) {
        // Generic calculation for unknown medicines
        rule = {
            adult: { min: 5, max: 10, unit: 'mg/kg', maxDaily: 1000, frequency: '8-12 hours' },
            child: { min: 5, max: 10, unit: 'mg/kg', maxDaily: 50, frequency: '8-12 hours' },
            infant: { min: 2, max: 5, unit: 'mg/kg', maxDaily: 25, frequency: '8-12 hours' }
        };
    }
    
    const categoryRule = rule[patient.category];
    
    if (!categoryRule) {
        return {
            error: `${medicine.name} is not recommended for ${patient.category}s. Please consult a healthcare provider.`,
            contraindicated: true
        };
    }
    
    // Calculate base dosage
    let minDose = (categoryRule.min * patient.weight);
    let maxDose = (categoryRule.max * patient.weight);
    let maxDailyDose = patient.category === 'adult' ? categoryRule.maxDaily : (categoryRule.maxDaily * patient.weight);
    
    // Adjust for severity
    const severityMultiplier = {
        'mild': 0.8,
        'moderate': 1.0,
        'severe': 1.2
    };
    
    minDose *= severityMultiplier[patient.severity];
    maxDose *= severityMultiplier[patient.severity];
    
    // Adjust for organ function
    if (patient.kidneyFunction !== 'normal') {
        const kidneyAdjustment = {
            'mild-impairment': 0.9,
            'moderate-impairment': 0.7,
            'severe-impairment': 0.5
        };
        const adjustment = kidneyAdjustment[patient.kidneyFunction];
        minDose *= adjustment;
        maxDose *= adjustment;
        maxDailyDose *= adjustment;
    }
    
    if (patient.liverFunction !== 'normal') {
        const liverAdjustment = {
            'mild-impairment': 0.9,
            'moderate-impairment': 0.7,
            'severe-impairment': 0.5
        };
        const adjustment = liverAdjustment[patient.liverFunction];
        minDose *= adjustment;
        maxDose *= adjustment;
        maxDailyDose *= adjustment;
    }
    
    // Age-specific adjustments
    if (patient.age > 65) {
        minDose *= 0.8;
        maxDose *= 0.8;
        maxDailyDose *= 0.8;
    }
    
    // Pregnancy considerations
    let pregnancyWarning = null;
    if (patient.isPregnant) {
        const pregnancyCategory = medicine.pregnancy || 'Unknown';
        if (pregnancyCategory.includes('D') || pregnancyCategory.includes('X')) {
            return {
                error: `${medicine.name} is contraindicated in pregnancy (Category ${pregnancyCategory}). Please consult your healthcare provider immediately.`,
                contraindicated: true
            };
        } else if (pregnancyCategory.includes('C')) {
            pregnancyWarning = 'Use only if clearly needed. Consult your healthcare provider.';
        }
    }
    
    return {
        minDose: Math.round(minDose * 100) / 100,
        maxDose: Math.round(maxDose * 100) / 100,
        maxDailyDose: Math.round(maxDailyDose * 100) / 100,
        frequency: categoryRule.frequency,
        unit: 'mg',
        pregnancyWarning,
        adjustments: {
            kidney: patient.kidneyFunction !== 'normal',
            liver: patient.liverFunction !== 'normal',
            age: patient.age > 65,
            severity: patient.severity !== 'moderate'
        }
    };
}

function displayDosageResults(result, medicine, patient) {
    const resultsDiv = document.getElementById('dosage-results');
    
    if (result.contraindicated) {
        resultsDiv.innerHTML = `
            <div class="dosage-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Contraindicated</h3>
                <p>${result.error}</p>
            </div>
        `;
    } else {
        resultsDiv.innerHTML = `
            <div class="dosage-success">
                <h3>Calculated Dosage</h3>
                
                <div class="dosage-summary">
                    <div class="dosage-range">
                        <h4>Recommended Dose Range</h4>
                        <div class="dose-values">
                            <span class="dose-min">${result.minDose} ${result.unit}</span>
                            <span class="dose-separator">to</span>
                            <span class="dose-max">${result.maxDose} ${result.unit}</span>
                        </div>
                        <p class="dose-frequency">Every ${result.frequency}</p>
                    </div>
                    
                    <div class="daily-limit">
                        <h4>Maximum Daily Dose</h4>
                        <span class="max-daily">${result.maxDailyDose} ${result.unit}</span>
                    </div>
                </div>
                
                ${Object.values(result.adjustments).some(adj => adj) ? `
                    <div class="adjustments-made">
                        <h4>Adjustments Made</h4>
                        <ul>
                            ${result.adjustments.kidney ? '<li>Dose reduced for kidney impairment</li>' : ''}
                            ${result.adjustments.liver ? '<li>Dose reduced for liver impairment</li>' : ''}
                            ${result.adjustments.age ? '<li>Dose reduced for elderly patient</li>' : ''}
                            ${result.adjustments.severity ? '<li>Dose adjusted for condition severity</li>' : ''}
                        </ul>
                    </div>
                ` : ''}
                
                ${result.pregnancyWarning ? `
                    <div class="pregnancy-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        <strong>Pregnancy Warning:</strong> ${result.pregnancyWarning}
                    </div>
                ` : ''}
                
                <div class="dosage-instructions">
                    <h4>Instructions</h4>
                    <ul>
                        <li>Start with the lower dose and adjust as needed</li>
                        <li>Take with food if stomach upset occurs</li>
                        <li>Do not exceed the maximum daily dose</li>
                        <li>Consult your healthcare provider if symptoms persist</li>
                        <li>This calculation is for reference only - always follow your doctor's prescription</li>
                    </ul>
                </div>
                
                <div class="calculation-details">
                    <h4>Calculation Details</h4>
                    <p><strong>Patient:</strong> ${patient.age} years old, ${patient.weight} kg ${patient.gender || ''}</p>
                    <p><strong>Category:</strong> ${patient.category}</p>
                    <p><strong>Severity:</strong> ${patient.severity}</p>
                    <p><strong>Calculation Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
            </div>
        `;
    }
    
    resultsDiv.style.display = 'block';
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

function setupDosageCalculator() {
    // Additional setup if needed
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
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function addDosageStyles() {
    const styles = `
        .dosage-calc-btn {
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
        
        .dosage-calc-btn:hover {
            background: #e8f5e8;
            color: #2196f3;
            transform: scale(1.1);
        }
        
        .dosage-calculator-modal {
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
        
        .dosage-calculator-content {
            background: white;
            border-radius: 12px;
            max-width: 800px;
            width: 100%;
            max-height: 90vh;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        .dosage-calculator-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #ddd;
            background: #f8f9fa;
        }
        
        .dosage-calculator-header h2 {
            margin: 0;
            color: #2196f3;
            font-size: 1.3rem;
        }
        
        .dosage-calculator-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
        }
        
        .dosage-calculator-body {
            padding: 20px;
            overflow-y: auto;
            max-height: 70vh;
        }
        
        .medicine-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
        }
        
        .info-item label {
            font-weight: 600;
            color: #666;
        }
        
        .info-item span {
            color: #333;
        }
        
        .patient-info, .condition-info {
            margin-bottom: 25px;
        }
        
        .patient-info h3, .condition-info h3 {
            margin-bottom: 15px;
            color: #333;
            border-bottom: 2px solid #2196f3;
            padding-bottom: 5px;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .form-group label {
            font-weight: 600;
            color: #333;
        }
        
        .form-group input,
        .form-group select {
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }
        
        .form-group input:focus,
        .form-group select:focus {
            outline: none;
            border-color: #2196f3;
        }
        
        .form-group input[type="checkbox"] {
            width: auto;
            margin-right: 8px;
        }
        
        .calculation-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin: 30px 0;
        }
        
        .calculate-btn, .reset-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
        }
        
        .calculate-btn {
            background: #2196f3;
            color: white;
        }
        
        .calculate-btn:hover {
            background: #1976d2;
            transform: translateY(-2px);
        }
        
        .reset-btn {
            background: #666;
            color: white;
        }
        
        .reset-btn:hover {
            background: #555;
        }
        
        .dosage-results {
            margin-top: 30px;
            padding: 25px;
            border-radius: 12px;
            border: 2px solid #2196f3;
            background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%);
        }
        
        .dosage-error {
            text-align: center;
            color: #f44336;
        }
        
        .dosage-error i {
            font-size: 3rem;
            margin-bottom: 15px;
        }
        
        .dosage-success h3 {
            color: #2196f3;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .dosage-summary {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 30px;
            margin-bottom: 25px;
        }
        
        .dosage-range {
            text-align: center;
        }
        
        .dose-values {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin: 15px 0;
            font-size: 1.5rem;
            font-weight: bold;
        }
        
        .dose-min, .dose-max {
            background: #2196f3;
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
        }
        
        .dose-separator {
            color: #666;
            font-weight: normal;
        }
        
        .dose-frequency {
            color: #666;
            font-style: italic;
        }
        
        .daily-limit {
            text-align: center;
            padding: 20px;
            background: rgba(255, 193, 7, 0.1);
            border-radius: 8px;
            border: 2px solid #ffc107;
        }
        
        .max-daily {
            display: block;
            font-size: 1.8rem;
            font-weight: bold;
            color: #f57c00;
            margin-top: 10px;
        }
        
        .adjustments-made {
            background: rgba(255, 152, 0, 0.1);
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #ff9800;
        }
        
        .adjustments-made h4 {
            color: #f57c00;
            margin-bottom: 10px;
        }
        
        .adjustments-made ul {
            margin: 0;
            padding-left: 20px;
        }
        
        .pregnancy-warning {
            background: rgba(244, 67, 54, 0.1);
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #f44336;
            color: #d32f2f;
        }
        
        .dosage-instructions {
            background: rgba(76, 175, 80, 0.1);
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #4caf50;
        }
        
        .dosage-instructions h4 {
            color: #388e3c;
            margin-bottom: 10px;
        }
        
        .dosage-instructions ul {
            margin: 0;
            padding-left: 20px;
        }
        
        .calculation-details {
            background: rgba(158, 158, 158, 0.1);
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #9e9e9e;
        }
        
        .calculation-details h4 {
            color: #616161;
            margin-bottom: 10px;
        }
        
        .calculation-details p {
            margin: 5px 0;
            color: #666;
        }
        
        @media (max-width: 768px) {
            .dosage-calculator-content {
                margin: 10px;
                max-width: none;
            }
            
            .form-row {
                grid-template-columns: 1fr;
                gap: 15px;
            }
            
            .dosage-summary {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .dose-values {
                flex-direction: column;
                gap: 10px;
            }
            
            .calculation-actions {
                flex-direction: column;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// Export functions for global access
window.PHARMADICES = window.PHARMADICES || {};
window.PHARMADICES.dosageCalculator = {
    openDosageCalculator,
    calculateDosage
};