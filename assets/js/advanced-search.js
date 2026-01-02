// PHARMADICES - Advanced Search Functionality
// Handles advanced search filters and sorting

document.addEventListener('DOMContentLoaded', function() {
    initAdvancedSearch();
});

// Initialize advanced search
function initAdvancedSearch() {
    addAdvancedSearchPanel();
    setupAdvancedSearchHandlers();
}

// Add advanced search panel
function addAdvancedSearchPanel() {
    const searchSection = document.querySelector('.search-section');
    if (searchSection && !document.querySelector('.advanced-search-panel')) {
        const advancedPanel = document.createElement('div');
        advancedPanel.className = 'advanced-search-panel';
        advancedPanel.innerHTML = `
            <div class="advanced-search-toggle">
                <button id="toggle-advanced" class="toggle-btn">
                    <i class="fas fa-sliders-h"></i> Advanced Search
                    <i class="fas fa-chevron-down toggle-icon"></i>
                </button>
            </div>
            
            <div class="advanced-search-content" style="display: none;">
                <div class="advanced-filters">
                    <div class="filter-row">
                        <div class="filter-group">
                            <label><i class="fas fa-pills"></i> Drug Class:</label>
                            <select id="drug-class-filter">
                                <option value="">All Classes</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label><i class="fas fa-female"></i> Pregnancy Category:</label>
                            <select id="pregnancy-filter">
                                <option value="">All Categories</option>
                                <option value="Category A">Category A (Safe)</option>
                                <option value="Category B">Category B (Probably Safe)</option>
                                <option value="Category C">Category C (Risk Unknown)</option>
                                <option value="Category D">Category D (Positive Evidence of Risk)</option>
                                <option value="Category X">Category X (Contraindicated)</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label><i class="fas fa-sort"></i> Sort By:</label>
                            <select id="sort-by">
                                <option value="name">Name (A-Z)</option>
                                <option value="name-desc">Name (Z-A)</option>
                                <option value="brand">Brand (A-Z)</option>
                                <option value="brand-desc">Brand (Z-A)</option>
                                <option value="type">Type</option>
                                <option value="drug-class">Drug Class</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="filter-row">
                        <div class="filter-group">
                            <label><i class="fas fa-search"></i> Contains Text:</label>
                            <input type="text" id="contains-text" placeholder="Search in all fields...">
                        </div>
                        
                        <div class="filter-group">
                            <label><i class="fas fa-exclamation-triangle"></i> Has Side Effects:</label>
                            <select id="side-effects-filter">
                                <option value="">Any</option>
                                <option value="yes">Yes</option>
                                <option value="no">No/Unknown</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label><i class="fas fa-handshake"></i> Has Interactions:</label>
                            <select id="interactions-filter">
                                <option value="">Any</option>
                                <option value="yes">Yes</option>
                                <option value="no">No/Unknown</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="filter-actions">
                        <button id="apply-advanced-filters" class="apply-btn">
                            <i class="fas fa-filter"></i> Apply Filters
                        </button>
                        <button id="reset-advanced-filters" class="reset-btn">
                            <i class="fas fa-undo"></i> Reset All
                        </button>
                        <button id="save-search" class="save-btn">
                            <i class="fas fa-bookmark"></i> Save Search
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        searchSection.appendChild(advancedPanel);
        populateDrugClassFilter();
    }
}

// Setup advanced search event handlers
function setupAdvancedSearchHandlers() {
    // Toggle advanced search panel
    document.addEventListener('click', function(e) {
        if (e.target.closest('#toggle-advanced')) {
            toggleAdvancedPanel();
        }
        
        if (e.target.closest('#apply-advanced-filters')) {
            applyAdvancedFilters();
        }
        
        if (e.target.closest('#reset-advanced-filters')) {
            resetAdvancedFilters();
        }
        
        if (e.target.closest('#save-search')) {
            saveCurrentSearch();
        }
    });
    
    // Real-time filtering on contains text
    document.addEventListener('input', function(e) {
        if (e.target.id === 'contains-text') {
            clearTimeout(window.advancedSearchTimeout);
            window.advancedSearchTimeout = setTimeout(() => {
                applyAdvancedFilters();
            }, 500);
        }
    });
}

// Toggle advanced search panel
function toggleAdvancedPanel() {
    const content = document.querySelector('.advanced-search-content');
    const icon = document.querySelector('.toggle-icon');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    } else {
        content.style.display = 'none';
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    }
}

// Populate drug class filter
function populateDrugClassFilter() {
    const medicines = window.allMedicines || [];
    const drugClasses = [...new Set(medicines.map(m => m.drugClass).filter(Boolean))].sort();
    
    const select = document.getElementById('drug-class-filter');
    if (select) {
        drugClasses.forEach(drugClass => {
            const option = document.createElement('option');
            option.value = drugClass;
            option.textContent = drugClass;
            select.appendChild(option);
        });
    }
}

// Apply advanced filters
function applyAdvancedFilters() {
    const medicines = window.allMedicines || [];
    const drugClass = document.getElementById('drug-class-filter')?.value || '';
    const pregnancy = document.getElementById('pregnancy-filter')?.value || '';
    const sortBy = document.getElementById('sort-by')?.value || 'name';
    const containsText = document.getElementById('contains-text')?.value.toLowerCase() || '';
    const sideEffects = document.getElementById('side-effects-filter')?.value || '';
    const interactions = document.getElementById('interactions-filter')?.value || '';
    
    // Apply filters
    let filtered = medicines.filter(medicine => {
        // Drug class filter
        if (drugClass && medicine.drugClass !== drugClass) return false;
        
        // Pregnancy category filter
        if (pregnancy && medicine.pregnancy !== pregnancy) return false;
        
        // Contains text filter
        if (containsText) {
            const searchText = [
                medicine.name, medicine.brand, medicine.generic,
                medicine.uses, medicine.sideEffects, medicine.precautions,
                medicine.interactions, medicine.dosage
            ].join(' ').toLowerCase();
            
            if (!searchText.includes(containsText)) return false;
        }
        
        // Side effects filter
        if (sideEffects === 'yes' && (!medicine.sideEffects || medicine.sideEffects.trim() === '')) return false;
        if (sideEffects === 'no' && medicine.sideEffects && medicine.sideEffects.trim() !== '') return false;
        
        // Interactions filter
        if (interactions === 'yes' && (!medicine.interactions || medicine.interactions.trim() === '')) return false;
        if (interactions === 'no' && medicine.interactions && medicine.interactions.trim() !== '') return false;
        
        return true;
    });
    
    // Apply sorting
    filtered = sortMedicines(filtered, sortBy);
    
    // Update global filtered medicines
    window.filteredMedicines = filtered;
    
    // Update display
    if (window.displayMedicines) {
        window.currentPage = 1;
        window.displayMedicines(1);
    }
    
    // Update medicines count
    if (window.updateMedicinesCount) {
        window.updateMedicinesCount(filtered.length);
    }
    
    showNotification(`Found ${filtered.length} medicines matching your criteria`, 'info');
}

// Sort medicines
function sortMedicines(medicines, sortBy) {
    return medicines.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'brand':
                return (a.brand || '').localeCompare(b.brand || '');
            case 'brand-desc':
                return (b.brand || '').localeCompare(a.brand || '');
            case 'type':
                return (a.type || '').localeCompare(b.type || '');
            case 'drug-class':
                return (a.drugClass || '').localeCompare(b.drugClass || '');
            default:
                return 0;
        }
    });
}

// Reset advanced filters
function resetAdvancedFilters() {
    document.getElementById('drug-class-filter').value = '';
    document.getElementById('pregnancy-filter').value = '';
    document.getElementById('sort-by').value = 'name';
    document.getElementById('contains-text').value = '';
    document.getElementById('side-effects-filter').value = '';
    document.getElementById('interactions-filter').value = '';
    
    // Reset to all medicines
    window.filteredMedicines = window.allMedicines || [];
    
    if (window.displayMedicines) {
        window.currentPage = 1;
        window.displayMedicines(1);
    }
    
    if (window.updateMedicinesCount) {
        window.updateMedicinesCount(window.allMedicines?.length || 0);
    }
    
    showNotification('Filters reset', 'info');
}

// Save current search
function saveCurrentSearch() {
    const searchData = {
        drugClass: document.getElementById('drug-class-filter')?.value || '',
        pregnancy: document.getElementById('pregnancy-filter')?.value || '',
        sortBy: document.getElementById('sort-by')?.value || 'name',
        containsText: document.getElementById('contains-text')?.value || '',
        sideEffects: document.getElementById('side-effects-filter')?.value || '',
        interactions: document.getElementById('interactions-filter')?.value || '',
        timestamp: new Date().toISOString(),
        resultsCount: window.filteredMedicines?.length || 0
    };
    
    const savedSearches = JSON.parse(localStorage.getItem('pharmadices_saved_searches') || '[]');
    savedSearches.unshift(searchData);
    
    // Keep only last 10 searches
    if (savedSearches.length > 10) {
        savedSearches.splice(10);
    }
    
    localStorage.setItem('pharmadices_saved_searches', JSON.stringify(savedSearches));
    showNotification('Search saved successfully', 'success');
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

// Add advanced search styles
const advancedSearchStyles = `
    .advanced-search-panel {
        margin-top: 20px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        overflow: hidden;
    }
    
    .advanced-search-toggle {
        padding: 0;
    }
    
    .toggle-btn {
        width: 100%;
        background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
        color: white;
        border: none;
        padding: 15px 25px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }
    
    .toggle-btn:hover {
        background: linear-gradient(135deg, #5f3dc4 0%, #9775fa 100%);
    }
    
    .toggle-icon {
        transition: transform 0.3s ease;
    }
    
    .advanced-search-content {
        padding: 25px;
        background: rgba(248, 249, 250, 0.9);
    }
    
    .advanced-filters {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    
    .filter-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
    }
    
    .filter-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .filter-group label {
        font-weight: 600;
        color: #6c5ce7;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .filter-group select,
    .filter-group input {
        padding: 12px 16px;
        border: 2px solid transparent;
        border-radius: 10px;
        background: white;
        font-size: 0.95rem;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .filter-group select:focus,
    .filter-group input:focus {
        outline: none;
        border-color: #6c5ce7;
        box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
    }
    
    .filter-actions {
        display: flex;
        gap: 15px;
        justify-content: center;
        flex-wrap: wrap;
        margin-top: 10px;
    }
    
    .apply-btn, .reset-btn, .save-btn {
        padding: 12px 24px;
        border: none;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.95rem;
    }
    
    .apply-btn {
        background: linear-gradient(135deg, #00b894 0%, #00cec9 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(0, 184, 148, 0.3);
    }
    
    .apply-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 184, 148, 0.4);
    }
    
    .reset-btn {
        background: linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(253, 121, 168, 0.3);
    }
    
    .reset-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(253, 121, 168, 0.4);
    }
    
    .save-btn {
        background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(116, 185, 255, 0.3);
    }
    
    .save-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(116, 185, 255, 0.4);
    }
    
    @media (max-width: 768px) {
        .filter-row {
            grid-template-columns: 1fr;
        }
        
        .filter-actions {
            flex-direction: column;
        }
        
        .apply-btn, .reset-btn, .save-btn {
            justify-content: center;
        }
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = advancedSearchStyles;
document.head.appendChild(styleSheet);