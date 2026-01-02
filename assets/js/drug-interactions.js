// PHARMADICES - Drug Interaction Checker
// Check for potential interactions between medicines

document.addEventListener('DOMContentLoaded', function() {
    initInteractionChecker();
});

let selectedMedicines = [];

function initInteractionChecker() {
    addInteractionButtons();
    setupInteractionChecker();
    addInteractionStyles();
}

function addInteractionButtons() {
    setTimeout(() => {
        const medicineCards = document.querySelectorAll('.medicine-card');
        medicineCards.forEach(card => {
            const medicineId = card.dataset.id;
            if (medicineId && !card.querySelector('.interaction-btn')) {
                addInteractionButton(card, medicineId);
            }
        });
    }, 1000);
}

function addInteractionButton(card, medicineId) {
    const cardFooter = card.querySelector('.medicine-card-footer');
    if (!cardFooter) return;
    
    const interactionBtn = document.createElement('button');
    interactionBtn.className = 'interaction-btn';
    interactionBtn.dataset.id = medicineId;
    interactionBtn.innerHTML = `<i class="fas fa-exclamation-triangle"></i>`;
    interactionBtn.title = 'Check interactions';
    
    if (isSelectedForInteraction(medicineId)) {
        interactionBtn.classList.add('selected');
        interactionBtn.title = 'Remove from interaction check';
    }
    
    interactionBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleInteractionSelection(medicineId, interactionBtn);
    });
    
    cardFooter.appendChild(interactionBtn);
}

function toggleInteractionSelection(medicineId, button) {
    if (isSelectedForInteraction(medicineId)) {
        removeFromInteractionCheck(medicineId);
        button.classList.remove('selected');
        button.title = 'Check interactions';
    } else {
        if (selectedMedicines.length >= 10) {
            showNotification('Maximum 10 medicines can be checked for interactions', 'error');
            return;
        }
        addToInteractionCheck(medicineId);
        button.classList.add('selected');
        button.title = 'Remove from interaction check';
    }
    updateInteractionPanel();
}

function addToInteractionCheck(medicineId) {
    if (!isSelectedForInteraction(medicineId)) {
        selectedMedicines.push(medicineId);
        showNotification('Added to interaction check', 'success');
    }
}

function removeFromInteractionCheck(medicineId) {
    selectedMedicines = selectedMedicines.filter(id => id !== medicineId);
    showNotification('Removed from interaction check', 'info');
}

function isSelectedForInteraction(medicineId) {
    return selectedMedicines.includes(medicineId);
}

function updateInteractionPanel() {
    let panel = document.getElementById('interaction-panel');
    
    if (selectedMedicines.length === 0) {
        if (panel) panel.remove();
        return;
    }
    
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'interaction-panel';
        panel.className = 'interaction-panel';
        document.body.appendChild(panel);
    }
    
    panel.innerHTML = `
        <div class="interaction-header">
            <h4><i class="fas fa-exclamation-triangle"></i> Interaction Check (${selectedMedicines.length}/10)</h4>
            <div class="interaction-actions">
                <button class="check-interactions-btn" ${selectedMedicines.length < 2 ? 'disabled' : ''}>
                    <i class="fas fa-search"></i> Check Interactions
                </button>
                <button class="clear-interactions-btn">
                    <i class="fas fa-times"></i> Clear All
                </button>
            </div>
        </div>
        <div class="interaction-items">
            ${selectedMedicines.map(id => {
                const medicine = window.allMedicines?.find(m => m.id == id);
                return medicine ? `
                    <div class="interaction-item">
                        <span>${medicine.name}</span>
                        <button class="remove-interaction-btn" data-id="${id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                ` : '';
            }).join('')}
        </div>
    `;
    
    setupInteractionHandlers();
}

function setupInteractionChecker() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.check-interactions-btn')) {
            checkInteractions();
        }
        
        if (e.target.closest('.clear-interactions-btn')) {
            clearInteractionCheck();
        }
        
        if (e.target.closest('.remove-interaction-btn')) {
            const medicineId = e.target.closest('.remove-interaction-btn').dataset.id;
            removeFromInteractionCheck(medicineId);
            updateInteractionButtons();
            updateInteractionPanel();
        }
    });
}

function setupInteractionHandlers() {
    // Event handlers are set up in setupInteractionChecker
}

function checkInteractions() {
    if (selectedMedicines.length < 2) {
        showNotification('Select at least 2 medicines to check interactions', 'error');
        return;
    }
    
    const medicines = selectedMedicines.map(id => 
        window.allMedicines?.find(m => m.id == id)
    ).filter(Boolean);
    
    const interactions = analyzeInteractions(medicines);
    showInteractionResults(medicines, interactions);
}

function analyzeInteractions(medicines) {
    const interactions = [];
    
    // Common drug interaction patterns
    const interactionRules = [
        {
            classes: ['NSAID', 'Anticoagulant'],
            severity: 'High',
            description: 'Increased risk of bleeding when NSAIDs are combined with anticoagulants',
            recommendation: 'Monitor for signs of bleeding. Consider alternative pain management.'
        },
        {
            classes: ['ACE inhibitor', 'Potassium-sparing diuretic'],
            severity: 'Medium',
            description: 'Risk of hyperkalemia when ACE inhibitors are combined with potassium-sparing diuretics',
            recommendation: 'Monitor potassium levels regularly.'
        },
        {
            classes: ['Statin', 'Macrolide antibiotic'],
            severity: 'High',
            description: 'Increased risk of muscle toxicity (rhabdomyolysis)',
            recommendation: 'Consider temporary statin discontinuation during antibiotic course.'
        },
        {
            classes: ['SSRI antidepressant', 'NSAID'],
            severity: 'Medium',
            description: 'Increased risk of gastrointestinal bleeding',
            recommendation: 'Consider gastroprotective therapy if combination necessary.'
        },
        {
            classes: ['Beta-blocker', 'Calcium channel blocker'],
            severity: 'Medium',
            description: 'Risk of excessive bradycardia and hypotension',
            recommendation: 'Monitor heart rate and blood pressure closely.'
        },
        {
            classes: ['Benzodiazepine', 'Opioid analgesic'],
            severity: 'High',
            description: 'Increased risk of respiratory depression and sedation',
            recommendation: 'Avoid combination if possible. If necessary, use lowest effective doses.'
        },
        {
            classes: ['Warfarin', 'Antibiotic'],
            severity: 'High',
            description: 'Antibiotics may enhance warfarin effects, increasing bleeding risk',
            recommendation: 'Monitor INR more frequently during antibiotic therapy.'
        },
        {
            classes: ['Digoxin', 'Loop diuretic'],
            severity: 'Medium',
            description: 'Diuretics may cause electrolyte imbalances affecting digoxin toxicity',
            recommendation: 'Monitor digoxin levels and electrolytes regularly.'
        }
    ];
    
    // Check for specific drug interactions
    const specificInteractions = [
        {
            drugs: ['Warfarin', 'Aspirin'],
            severity: 'High',
            description: 'Significantly increased bleeding risk',
            recommendation: 'Avoid combination unless absolutely necessary. Monitor INR closely.'
        },
        {
            drugs: ['Metformin', 'Contrast dye'],
            severity: 'High',
            description: 'Risk of lactic acidosis',
            recommendation: 'Discontinue metformin before contrast procedures.'
        },
        {
            drugs: ['Simvastatin', 'Amlodipine'],
            severity: 'Medium',
            description: 'Increased simvastatin levels may increase muscle toxicity risk',
            recommendation: 'Limit simvastatin dose to 20mg daily when used with amlodipine.'
        }
    ];
    
    // Check class-based interactions
    for (let i = 0; i < medicines.length; i++) {
        for (let j = i + 1; j < medicines.length; j++) {
            const med1 = medicines[i];
            const med2 = medicines[j];
            
            // Check specific drug interactions
            specificInteractions.forEach(rule => {
                if ((rule.drugs.includes(med1.name) && rule.drugs.includes(med2.name)) ||
                    (rule.drugs.includes(med1.generic) && rule.drugs.includes(med2.generic))) {
                    interactions.push({
                        medicine1: med1,
                        medicine2: med2,
                        severity: rule.severity,
                        description: rule.description,
                        recommendation: rule.recommendation,
                        type: 'specific'
                    });
                }
            });
            
            // Check class-based interactions
            interactionRules.forEach(rule => {
                const med1Classes = (med1.drugClass || '').split(',').map(c => c.trim());
                const med2Classes = (med2.drugClass || '').split(',').map(c => c.trim());
                
                const hasClass1 = med1Classes.some(c => rule.classes.some(rc => c.includes(rc)));
                const hasClass2 = med2Classes.some(c => rule.classes.some(rc => c.includes(rc)));
                
                if (hasClass1 && hasClass2 && 
                    !med1Classes.every(c => med2Classes.includes(c))) {
                    interactions.push({
                        medicine1: med1,
                        medicine2: med2,
                        severity: rule.severity,
                        description: rule.description,
                        recommendation: rule.recommendation,
                        type: 'class'
                    });
                }
            });
        }
    }
    
    // Remove duplicates
    const uniqueInteractions = interactions.filter((interaction, index, self) => 
        index === self.findIndex(i => 
            i.medicine1.id === interaction.medicine1.id && 
            i.medicine2.id === interaction.medicine2.id &&
            i.description === interaction.description
        )
    );
    
    return uniqueInteractions;
}

function showInteractionResults(medicines, interactions) {
    const modal = document.createElement('div');
    modal.className = 'interaction-results-modal';
    modal.innerHTML = `
        <div class="interaction-results-content">
            <div class="interaction-results-header">
                <h2><i class="fas fa-exclamation-triangle"></i> Drug Interaction Analysis</h2>
                <button class="interaction-results-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="interaction-results-body">
                <div class="analyzed-medicines">
                    <h3>Analyzed Medicines (${medicines.length})</h3>
                    <div class="medicine-list">
                        ${medicines.map(med => `
                            <span class="medicine-tag">${med.name} (${med.generic})</span>
                        `).join('')}
                    </div>
                </div>
                
                <div class="interaction-summary">
                    <h3>Interaction Summary</h3>
                    <div class="summary-stats">
                        <div class="stat-item high">
                            <span class="stat-number">${interactions.filter(i => i.severity === 'High').length}</span>
                            <span class="stat-label">High Risk</span>
                        </div>
                        <div class="stat-item medium">
                            <span class="stat-number">${interactions.filter(i => i.severity === 'Medium').length}</span>
                            <span class="stat-label">Medium Risk</span>
                        </div>
                        <div class="stat-item low">
                            <span class="stat-number">${interactions.filter(i => i.severity === 'Low').length}</span>
                            <span class="stat-label">Low Risk</span>
                        </div>
                    </div>
                </div>
                
                <div class="interaction-details">
                    ${interactions.length === 0 ? `
                        <div class="no-interactions">
                            <i class="fas fa-check-circle"></i>
                            <h3>No Known Interactions Found</h3>
                            <p>Based on our database, no significant interactions were found between the selected medicines. However, always consult your healthcare provider before taking multiple medications.</p>
                        </div>
                    ` : `
                        <h3>Detailed Interactions (${interactions.length})</h3>
                        ${interactions.map(interaction => `
                            <div class="interaction-card ${interaction.severity.toLowerCase()}">
                                <div class="interaction-header">
                                    <div class="interaction-medicines">
                                        <span class="med-name">${interaction.medicine1.name}</span>
                                        <i class="fas fa-exchange-alt"></i>
                                        <span class="med-name">${interaction.medicine2.name}</span>
                                    </div>
                                    <span class="severity-badge ${interaction.severity.toLowerCase()}">
                                        ${interaction.severity} Risk
                                    </span>
                                </div>
                                <div class="interaction-body">
                                    <p class="interaction-description">
                                        <strong>Interaction:</strong> ${interaction.description}
                                    </p>
                                    <p class="interaction-recommendation">
                                        <strong>Recommendation:</strong> ${interaction.recommendation}
                                    </p>
                                </div>
                            </div>
                        `).join('')}
                    `}
                </div>
                
                <div class="interaction-disclaimer">
                    <p><strong>Important Disclaimer:</strong> This interaction checker is for educational purposes only and should not replace professional medical advice. Always consult your healthcare provider or pharmacist before starting, stopping, or changing any medications.</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.interaction-results-close').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function clearInteractionCheck() {
    selectedMedicines = [];
    updateInteractionButtons();
    updateInteractionPanel();
    showNotification('Interaction check cleared', 'info');
}

function updateInteractionButtons() {
    document.querySelectorAll('.interaction-btn').forEach(btn => {
        const medicineId = btn.dataset.id;
        if (isSelectedForInteraction(medicineId)) {
            btn.classList.add('selected');
            btn.title = 'Remove from interaction check';
        } else {
            btn.classList.remove('selected');
            btn.title = 'Check interactions';
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
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function addInteractionStyles() {
    const styles = `
        .interaction-btn {
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
        
        .interaction-btn:hover {
            background: #fff3e0;
            color: #ff9800;
            transform: scale(1.1);
        }
        
        .interaction-btn.selected {
            background: #ff9800;
            color: white;
        }
        
        .interaction-panel {
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            padding: 20px;
            max-width: 400px;
            z-index: 1000;
            border-top: 4px solid #ff9800;
        }
        
        .interaction-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .interaction-header h4 {
            margin: 0;
            color: #ff9800;
            font-size: 1rem;
        }
        
        .interaction-actions {
            display: flex;
            gap: 8px;
        }
        
        .check-interactions-btn, .clear-interactions-btn {
            padding: 6px 12px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.8rem;
            transition: all 0.3s ease;
        }
        
        .check-interactions-btn {
            background: #ff9800;
            color: white;
        }
        
        .check-interactions-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        
        .clear-interactions-btn {
            background: #f44336;
            color: white;
        }
        
        .interaction-items {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .interaction-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8f9fa;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.9rem;
        }
        
        .remove-interaction-btn {
            background: none;
            border: none;
            color: #666;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
        }
        
        .remove-interaction-btn:hover {
            background: #e0e0e0;
            color: #f44336;
        }
        
        .interaction-results-modal {
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
        
        .interaction-results-content {
            background: white;
            border-radius: 12px;
            max-width: 800px;
            width: 100%;
            max-height: 90vh;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        .interaction-results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #ddd;
            background: #f8f9fa;
        }
        
        .interaction-results-header h2 {
            margin: 0;
            color: #ff9800;
        }
        
        .interaction-results-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
        }
        
        .interaction-results-body {
            padding: 20px;
            overflow-y: auto;
            max-height: 70vh;
        }
        
        .analyzed-medicines {
            margin-bottom: 25px;
        }
        
        .medicine-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;
        }
        
        .medicine-tag {
            background: #e3f2fd;
            color: #1976d2;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 500;
        }
        
        .interaction-summary {
            margin-bottom: 25px;
        }
        
        .summary-stats {
            display: flex;
            gap: 20px;
            margin-top: 15px;
        }
        
        .stat-item {
            text-align: center;
            padding: 15px;
            border-radius: 8px;
            flex: 1;
        }
        
        .stat-item.high {
            background: #ffebee;
            border: 2px solid #f44336;
        }
        
        .stat-item.medium {
            background: #fff8e1;
            border: 2px solid #ff9800;
        }
        
        .stat-item.low {
            background: #e8f5e8;
            border: 2px solid #4caf50;
        }
        
        .stat-number {
            display: block;
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .stat-item.high .stat-number {
            color: #f44336;
        }
        
        .stat-item.medium .stat-number {
            color: #ff9800;
        }
        
        .stat-item.low .stat-number {
            color: #4caf50;
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: #666;
        }
        
        .no-interactions {
            text-align: center;
            padding: 40px 20px;
            color: #4caf50;
        }
        
        .no-interactions i {
            font-size: 4rem;
            margin-bottom: 20px;
        }
        
        .no-interactions h3 {
            margin-bottom: 15px;
            color: #4caf50;
        }
        
        .interaction-card {
            border-radius: 8px;
            margin-bottom: 15px;
            overflow: hidden;
            border-left: 4px solid;
        }
        
        .interaction-card.high {
            border-left-color: #f44336;
            background: #ffebee;
        }
        
        .interaction-card.medium {
            border-left-color: #ff9800;
            background: #fff8e1;
        }
        
        .interaction-card.low {
            border-left-color: #4caf50;
            background: #e8f5e8;
        }
        
        .interaction-card .interaction-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            margin-bottom: 0;
            background: rgba(255,255,255,0.5);
        }
        
        .interaction-medicines {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .med-name {
            font-weight: 600;
            color: #333;
        }
        
        .severity-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .severity-badge.high {
            background: #f44336;
            color: white;
        }
        
        .severity-badge.medium {
            background: #ff9800;
            color: white;
        }
        
        .severity-badge.low {
            background: #4caf50;
            color: white;
        }
        
        .interaction-body {
            padding: 15px;
        }
        
        .interaction-description,
        .interaction-recommendation {
            margin-bottom: 10px;
            line-height: 1.5;
        }
        
        .interaction-disclaimer {
            margin-top: 30px;
            padding: 20px;
            background: #fff3e0;
            border-radius: 8px;
            border-left: 4px solid #ff9800;
        }
        
        .interaction-disclaimer p {
            margin: 0;
            color: #5d4037;
            line-height: 1.6;
        }
        
        @media (max-width: 768px) {
            .interaction-panel {
                bottom: 10px;
                left: 10px;
                right: 10px;
                max-width: none;
            }
            
            .interaction-results-content {
                margin: 10px;
                max-width: none;
            }
            
            .summary-stats {
                flex-direction: column;
                gap: 10px;
            }
            
            .interaction-medicines {
                flex-direction: column;
                gap: 5px;
                text-align: center;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// Export functions for global access
window.PHARMADICES = window.PHARMADICES || {};
window.PHARMADICES.interactions = {
    selectedMedicines,
    checkInteractions,
    analyzeInteractions
};