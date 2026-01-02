// PHARMADICES - Medicine Search Functionality
// Handles medicine search, filtering, and display

document.addEventListener('DOMContentLoaded', function() {
    // Initialize search functionality
    initMedicineSearch();
    
    // Check for URL search parameter
    checkUrlSearchParam();
});

// Global variables
let allMedicines = [];
let filteredMedicines = [];
let currentPage = 1;
const medicinesPerPage = 12;

// Initialize medicine search functionality
function initMedicineSearch() {
    // Load medicines data
    loadMedicinesData();
    
    // Setup search input event listener
    const searchInput = document.getElementById('medicine-search');
    const searchButton = document.getElementById('search-btn');
    const searchType = document.getElementById('search-type');
    const medicineType = document.getElementById('medicine-type');
    const clearFilters = document.getElementById('clear-filters');
    
    if (searchInput) {
        // Initialize autocomplete
        if (window.PHARMADICES && window.PHARMADICES.autocomplete) {
            window.PHARMADICES.autocomplete.init(searchInput, {
                onSelect: function(value, entry) {
                    // When user selects from autocomplete, trigger search
                    performSearch();
                },
                autoSubmit: false
            });
        }
        
        // Real-time search with debouncing
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch();
            }, 300);
        });
        
        // Search button click
        if (searchButton) {
            searchButton.addEventListener('click', performSearch);
        }
        
        // Enter key search
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Filter change events
    if (searchType) {
        searchType.addEventListener('change', performSearch);
    }
    
    if (medicineType) {
        medicineType.addEventListener('change', performSearch);
    }
    
    // Clear filters
    if (clearFilters) {
        clearFilters.addEventListener('click', function() {
            document.getElementById('medicine-search').value = '';
            document.getElementById('search-type').value = 'all';
            document.getElementById('medicine-type').value = 'all';
            performSearch();
        });
    }
    
    // Initialize pagination events
    initPagination();
}

// Load medicines data from JSON file
async function loadMedicinesData() {
    try {
        showLoadingState(true);
        
        // Load the JSON data
        const response = await fetch('assets/data/medicines.json');
        const data = await response.json();
        
        if (data && data.medicines) {
            allMedicines = data.medicines;
            
            // Update total medicines count
            updateMedicinesCount(allMedicines.length);
            
            // Check if there's a search parameter in the URL
            checkUrlSearchParam();
            
            // Display all medicines initially
            filteredMedicines = [...allMedicines];
            displayMedicines(currentPage);
            
            showLoadingState(false);
        } else {
            throw new Error('Invalid data format');
        }
    } catch (error) {
        console.error('Error loading medicines data:', error);
        showLoadingState(false);
        showNoResults(true, 'Failed to load medicines database. Please try again later.');
        
        // For demo purposes, load sample data if JSON file doesn't exist yet
        loadSampleData();
    }
}

// Check for search parameter in URL
function checkUrlSearchParam() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    
    if (searchQuery && document.getElementById('medicine-search')) {
        document.getElementById('medicine-search').value = decodeURIComponent(searchQuery);
        // Trigger search after a short delay to ensure data is loaded
        setTimeout(performSearch, 500);
    }
}

// Perform search based on current filters
function performSearch() {
    const searchQuery = document.getElementById('medicine-search').value.toLowerCase().trim();
    const searchType = document.getElementById('search-type').value;
    const medicineType = document.getElementById('medicine-type').value;
    
    // Filter medicines
    filteredMedicines = allMedicines.filter(medicine => {
        // Text search
        let matchesSearch = false;
        
        if (!searchQuery) {
            matchesSearch = true;
        } else {
            switch(searchType) {
                case 'name':
                    matchesSearch = medicine.name.toLowerCase().includes(searchQuery);
                    break;
                case 'brand':
                    matchesSearch = medicine.brand.toLowerCase().includes(searchQuery);
                    break;
                case 'generic':
                    matchesSearch = medicine.generic.toLowerCase().includes(searchQuery);
                    break;
                case 'uses':
                    matchesSearch = medicine.uses.toLowerCase().includes(searchQuery);
                    break;
                case 'all':
                default:
                    matchesSearch = 
                        medicine.name.toLowerCase().includes(searchQuery) ||
                        medicine.brand.toLowerCase().includes(searchQuery) ||
                        medicine.generic.toLowerCase().includes(searchQuery) ||
                        (medicine.uses && medicine.uses.toLowerCase().includes(searchQuery));
            }
        }
        
        // Medicine type filter
        let matchesType = true;
        if (medicineType !== 'all') {
            matchesType = medicine.type === medicineType;
        }
        
        return matchesSearch && matchesType;
    });
    
    // Reset to first page
    currentPage = 1;
    
    // Update medicines count
    updateMedicinesCount(filteredMedicines.length);
    
    // Display results
    displayMedicines(currentPage);
    
    // Update URL with search query (without reloading)
    updateUrlWithSearchParams(searchQuery);
}

// Update URL with search parameters
function updateUrlWithSearchParams(searchQuery) {
    const url = new URL(window.location);
    
    if (searchQuery) {
        url.searchParams.set('search', searchQuery);
    } else {
        url.searchParams.delete('search');
    }
    
    // Update URL without reloading
    window.history.pushState({}, '', url);
}

// Display medicines for a specific page
function displayMedicines(page) {
    const medicinesGrid = document.getElementById('medicines-grid');
    const pagination = document.getElementById('pagination');
    const noResults = document.getElementById('no-results');
    
    if (!medicinesGrid) return;
    
    // Clear previous results
    medicinesGrid.innerHTML = '';
    
    // Check if there are any results
    if (filteredMedicines.length === 0) {
        showNoResults(true);
        pagination.style.display = 'none';
        return;
    }
    
    showNoResults(false);
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredMedicines.length / medicinesPerPage);
    const startIndex = (page - 1) * medicinesPerPage;
    const endIndex = Math.min(startIndex + medicinesPerPage, filteredMedicines.length);
    const pageMedicines = filteredMedicines.slice(startIndex, endIndex);
    
    // Update showing count
    document.getElementById('showing-count').textContent = `${startIndex + 1}-${endIndex}`;
    
    // Create medicine cards
    pageMedicines.forEach(medicine => {
        const medicineCard = createMedicineCard(medicine);
        medicinesGrid.appendChild(medicineCard);
    });
    
    // Show/hide pagination
    if (totalPages > 1) {
        pagination.style.display = 'flex';
        setupPagination(totalPages, page);
    } else {
        pagination.style.display = 'none';
    }
}

// Create a medicine card element
function createMedicineCard(medicine) {
    const card = document.createElement('div');
    card.className = 'medicine-card';
    card.dataset.id = medicine.id;
    
    // Get medicine type icon
    const typeIcon = getMedicineTypeIcon(medicine.type);
    
    // Format uses text (truncate if too long)
    const usesText = medicine.uses ? window.PHARMADICES.utils.truncateText(medicine.uses, 100) : 'Information available in details';
    
    card.innerHTML = `
        <div class="medicine-card-header">
            <div class="medicine-type ${medicine.type}">
                <i class="fas ${typeIcon}"></i>
                <span>${medicine.type}</span>
            </div>
            <div class="medicine-class">
                <span>${medicine.drugClass || 'Not specified'}</span>
            </div>
        </div>
        
        <div class="medicine-card-body">
            <h3 class="medicine-name">${medicine.name}</h3>
            <div class="medicine-brand">
                <strong>Brand:</strong> ${medicine.brand}
            </div>
            <div class="medicine-generic">
                <strong>Generic:</strong> ${medicine.generic}
            </div>
            <div class="medicine-uses">
                <p>${usesText}</p>
            </div>
        </div>
        
        <div class="medicine-card-footer">
            <button class="view-details-btn" data-id="${medicine.id}">
                <i class="fas fa-info-circle"></i> View Details
            </button>
        </div>
    `;
    
    // Add click event to view details button
    const viewDetailsBtn = card.querySelector('.view-details-btn');
    viewDetailsBtn.addEventListener('click', function() {
        showMedicineDetails(medicine.id);
    });
    
    // Make entire card clickable (except the button)
    card.addEventListener('click', function(e) {
        if (!e.target.closest('.view-details-btn')) {
            showMedicineDetails(medicine.id);
        }
    });
    
    return card;
}

// Show medicine details in modal
function showMedicineDetails(medicineId) {
    const medicine = allMedicines.find(m => m.id == medicineId);
    
    if (!medicine) {
        window.PHARMADICES.utils.showNotification('Medicine details not found.', 'error');
        return;
    }
    
    // Create modal content
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = medicine.name;
    
    // Format medicine details
    const typeIcon = getMedicineTypeIcon(medicine.type);
    
    modalBody.innerHTML = `
        <div class="medicine-detail-header">
            <div class="detail-type ${medicine.type}">
                <i class="fas ${typeIcon}"></i>
                <span>${medicine.type}</span>
            </div>
            <div class="detail-actions">
                <button id="print-btn" class="action-btn">
                    <i class="fas fa-print"></i> Print
                </button>
            </div>
        </div>
        
        <div class="medicine-detail-info">
            <div class="detail-row">
                <div class="detail-col">
                    <h4><i class="fas fa-tag"></i> Brand Name</h4>
                    <p>${medicine.brand}</p>
                </div>
                <div class="detail-col">
                    <h4><i class="fas fa-flask"></i> Generic Name</h4>
                    <p>${medicine.generic}</p>
                </div>
            </div>
            
            <div class="detail-row">
                <div class="detail-col">
                    <h4><i class="fas fa-layer-group"></i> Drug Class</h4>
                    <p>${medicine.drugClass || 'Not specified'}</p>
                </div>
                <div class="detail-col">
                    <h4><i class="fas fa-prescription-bottle"></i> Form</h4>
                    <p>${medicine.form || 'Not specified'}</p>
                </div>
            </div>
            
            <div class="detail-section">
                <h3><i class="fas fa-stethoscope"></i> Uses</h3>
                <p>${medicine.uses || 'Information not available'}</p>
            </div>
            
            <div class="detail-section">
                <h3><i class="fas fa-calculator"></i> Dosage</h3>
                <p>${medicine.dosage || 'Consult your healthcare provider for proper dosage.'}</p>
            </div>
            
            <div class="detail-section">
                <h3><i class="fas fa-exclamation-triangle"></i> Side Effects</h3>
                <p>${medicine.sideEffects || 'Common side effects may include nausea, headache, or dizziness. Report any severe reactions to your doctor.'}</p>
            </div>
            
            <div class="detail-section">
                <h3><i class="fas fa-shield-alt"></i> Precautions</h3>
                <p>${medicine.precautions || 'Inform your doctor about any allergies or medical conditions before taking this medicine.'}</p>
            </div>
            
            <div class="detail-section">
                <h3><i class="fas fa-handshake"></i> Interactions</h3>
                <p>${medicine.interactions || 'May interact with other medications. Inform your doctor about all drugs you are taking.'}</p>
            </div>
            
            <div class="detail-row">
                <div class="detail-col">
                    <h4><i class="fas fa-female"></i> Pregnancy Safety</h4>
                    <p>${medicine.pregnancy || 'Consult your doctor if pregnant or planning pregnancy.'}</p>
                </div>
                <div class="detail-col">
                    <h4><i class="fas fa-snowflake"></i> Storage</h4>
                    <p>${medicine.storage || 'Store at room temperature, away from moisture and heat.'}</p>
                </div>
            </div>
        </div>
        
        <div class="medicine-disclaimer">
            <p><strong>Disclaimer:</strong> This information is for educational purposes only. Always consult a healthcare professional before taking any medication.</p>
        </div>
    `;
    
    // Show modal
    const modal = document.getElementById('medicine-modal');
    modal.style.display = 'block';
    
    // Add print functionality
    const printBtn = document.getElementById('print-btn');
    if (printBtn) {
        printBtn.addEventListener('click', function() {
            window.print();
        });
    }
    
    // Add modal close functionality
    const closeBtn = document.querySelector('.modal-close');
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Get appropriate icon for medicine type
function getMedicineTypeIcon(type) {
    const iconMap = {
        'tablet': 'fa-tablet-alt',
        'capsule': 'fa-capsules',
        'syrup': 'fa-tint',
        'injection': 'fa-syringe',
        'ointment': 'fa-prescription-bottle-alt',
        'drops': 'fa-eye-dropper',
        'cream': 'fa-prescription-bottle-alt',
        'powder': 'fa-vial',
        'inhaler': 'fa-wind'
    };
    
    return iconMap[type] || 'fa-pills';
}

// Initialize pagination
function initPagination() {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                displayMedicines(currentPage);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            const totalPages = Math.ceil(filteredMedicines.length / medicinesPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                displayMedicines(currentPage);
            }
        });
    }
}

// Setup pagination controls
function setupPagination(totalPages, currentPage) {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pageNumbers = document.getElementById('page-numbers');
    
    // Update previous/next buttons
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    
    // Create page number buttons
    pageNumbers.innerHTML = '';
    
    // Always show first page
    addPageNumber(1, currentPage, totalPages);
    
    // Calculate range of pages to show
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Add ellipsis if needed
    if (startPage > 2) {
        pageNumbers.innerHTML += '<span class="page-ellipsis">...</span>';
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
        addPageNumber(i, currentPage, totalPages);
    }
    
    // Add ellipsis if needed
    if (endPage < totalPages - 1) {
        pageNumbers.innerHTML += '<span class="page-ellipsis">...</span>';
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
        addPageNumber(totalPages, currentPage, totalPages);
    }
}

// Add a page number button
function addPageNumber(page, currentPage, totalPages) {
    const pageNumbers = document.getElementById('page-numbers');
    
    const pageBtn = document.createElement('button');
    pageBtn.className = `page-number ${page === currentPage ? 'active' : ''}`;
    pageBtn.textContent = page;
    pageBtn.disabled = page === currentPage;
    
    pageBtn.addEventListener('click', function() {
        currentPage = page;
        displayMedicines(currentPage);
    });
    
    pageNumbers.appendChild(pageBtn);
}

// Update medicines count display
function updateMedicinesCount(count) {
    const totalElement = document.getElementById('total-medicines');
    if (totalElement) {
        totalElement.textContent = count;
    }
}

// Show/hide loading state
function showLoadingState(show) {
    const loadingState = document.getElementById('loading-state');
    if (loadingState) {
        loadingState.style.display = show ? 'flex' : 'none';
    }
}

// Show/hide no results state
function showNoResults(show, customMessage) {
    const noResults = document.getElementById('no-results');
    const medicinesGrid = document.getElementById('medicines-grid');
    
    if (noResults) {
        if (show) {
            noResults.style.display = 'flex';
            if (customMessage && noResults.querySelector('p')) {
                noResults.querySelector('p').textContent = customMessage;
            }
            if (medicinesGrid) {
                medicinesGrid.style.display = 'none';
            }
        } else {
            noResults.style.display = 'none';
            if (medicinesGrid) {
                medicinesGrid.style.display = 'grid';
            }
        }
    }
}

// Load sample data for demo purposes
function loadSampleData() {
    console.log('Loading sample data for demonstration...');
    
    // Sample medicine data
    allMedicines = [
        {
            id: 1,
            name: "Paracetamol",
            brand: "Panadol",
            generic: "Acetaminophen",
            type: "tablet",
            drugClass: "Analgesic, Antipyretic",
            uses: "Used to treat mild to moderate pain and fever.",
            dosage: "500-1000mg every 4-6 hours as needed. Maximum 4000mg per day.",
            sideEffects: "Rare at therapeutic doses. May cause liver damage in overdose.",
            precautions: "Do not exceed recommended dose. Avoid alcohol.",
            interactions: "May interact with warfarin and other blood thinners.",
            pregnancy: "Generally considered safe during pregnancy.",
            storage: "Store at room temperature, away from moisture.",
            form: "Tablet"
        },
        {
            id: 2,
            name: "Amoxicillin",
            brand: "Augmentin",
            generic: "Amoxicillin + Clavulanate",
            type: "tablet",
            drugClass: "Antibiotic, Penicillin",
            uses: "Used to treat bacterial infections such as pneumonia, bronchitis, and sinusitis.",
            dosage: "250-500mg every 8 hours or 875mg every 12 hours.",
            sideEffects: "Diarrhea, nausea, vomiting, rash.",
            precautions: "Complete the full course even if symptoms improve.",
            interactions: "May reduce effectiveness of birth control pills.",
            pregnancy: "Category B - Generally safe during pregnancy.",
            storage: "Store at room temperature.",
            form: "Tablet"
        },
        {
            id: 3,
            name: "Omeprazole",
            brand: "Losec",
            generic: "Omeprazole",
            type: "capsule",
            drugClass: "Proton Pump Inhibitor",
            uses: "Used to treat acid reflux, GERD, and stomach ulcers.",
            dosage: "20-40mg once daily before meals.",
            sideEffects: "Headache, diarrhea, abdominal pain.",
            precautions: "Do not crush or chew capsules.",
            interactions: "May interact with warfarin, diazepam, and phenytoin.",
            pregnancy: "Category C - Consult doctor if pregnant.",
            storage: "Store at room temperature.",
            form: "Delayed-release capsule"
        },
        {
            id: 4,
            name: "Salbutamol",
            brand: "Ventolin",
            generic: "Albuterol",
            type: "inhaler",
            drugClass: "Bronchodilator, Beta-2 agonist",
            uses: "Used to treat and prevent bronchospasm in asthma and COPD.",
            dosage: "1-2 puffs every 4-6 hours as needed.",
            sideEffects: "Tremor, headache, tachycardia, nervousness.",
            precautions: "Not for regular scheduled use. Use only for symptom relief.",
            interactions: "May interact with beta-blockers and diuretics.",
            pregnancy: "Category C - Use if clearly needed.",
            storage: "Store at room temperature. Avoid extreme temperatures.",
            form: "Metered dose inhaler"
        },
        {
            id: 5,
            name: "Atorvastatin",
            brand: "Lipitor",
            generic: "Atorvastatin",
            type: "tablet",
            drugClass: "Statin, Lipid-lowering agent",
            uses: "Used to lower cholesterol and reduce risk of heart disease.",
            dosage: "10-80mg once daily, usually in the evening.",
            sideEffects: "Muscle pain, weakness, liver problems, digestive issues.",
            precautions: "Regular liver function tests required. Avoid grapefruit juice.",
            interactions: "Interacts with many drugs including other cholesterol medications.",
            pregnancy: "Category X - Contraindicated in pregnancy.",
            storage: "Store at room temperature.",
            form: "Tablet"
        },
        {
            id: 6,
            name: "Cetirizine",
            brand: "Zyrtec",
            generic: "Cetirizine",
            type: "tablet",
            drugClass: "Antihistamine",
            uses: "Used to treat allergy symptoms such as runny nose, sneezing, and hives.",
            dosage: "5-10mg once daily.",
            sideEffects: "Drowsiness, dry mouth, fatigue, headache.",
            precautions: "May cause drowsiness. Avoid alcohol.",
            interactions: "May enhance effects of other CNS depressants.",
            pregnancy: "Category B - Generally safe during pregnancy.",
            storage: "Store at room temperature.",
            form: "Tablet"
        }
    ];
    
    // Update total medicines count
    updateMedicinesCount(allMedicines.length);
    
    // Display all medicines
    filteredMedicines = [...allMedicines];
    displayMedicines(currentPage);
    
    showLoadingState(false);
}

// Add CSS for medicine cards and modal
function addMedicineStyles() {
    if (!document.querySelector('#medicine-styles')) {
        const styles = document.createElement('style');
        styles.id = 'medicine-styles';
        styles.textContent = `
            /* Page Header */
            .page-header {
                background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%);
                color: white;
                padding: 60px 0 40px;
            }
            
            .page-title {
                font-size: 2.5rem;
                margin-bottom: 10px;
                text-align: center;
            }
            
            .page-subtitle {
                text-align: center;
                font-size: 1.1rem;
                opacity: 0.9;
                margin-bottom: 30px;
            }
            
            /* Search Section */
            .search-section {
                max-width: 1000px;
                margin: 0 auto;
            }
            
            .search-container {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 30px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.15);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .search-box.large {
                display: flex;
                margin-bottom: 20px;
                border: none;
                border-radius: 50px;
                overflow: hidden;
                box-shadow: 0 12px 35px rgba(26, 115, 232, 0.12);
                background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
                position: relative;
                max-width: 600px;
                margin-left: auto;
                margin-right: auto;
            }
            
            .search-box.large::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border-radius: 50px;
                padding: 2px;
                background: linear-gradient(135deg, #1a73e8, #4285f4, #34a853);
                -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                -webkit-mask-composite: exclude;
                mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                mask-composite: exclude;
            }
            
            .search-box.large i {
                padding: 16px 20px;
                color: #1a73e8;
                background: transparent;
                font-size: 1.1rem;
                z-index: 1;
            }
            
            .search-box.large input {
                flex: 1;
                border: none;
                outline: none;
                font-size: 1rem;
                padding: 16px 18px;
                background: transparent;
                color: #333;
                z-index: 1;
            }
            
            .search-box.large input::placeholder {
                color: #8e9297;
                font-weight: 400;
            }
            
            .search-box.large button {
                background: linear-gradient(135deg, #1a73e8 0%, #4285f4 50%, #34a853 100%);
                color: white;
                border: none;
                padding: 16px 32px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                white-space: nowrap;
                position: relative;
                overflow: hidden;
                z-index: 1;
            }
            
            .search-box.large button::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s;
            }
            
            .search-box.large button:hover {
                transform: translateY(-1px);
                box-shadow: 0 6px 20px rgba(26, 115, 232, 0.25);
            }
            
            .search-box.large button:hover::before {
                left: 100%;
            }
            
            .search-box.large button:active {
                transform: translateY(0);
            }
            
            .search-filters {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                align-items: center;
                background: rgba(248, 249, 250, 0.8);
                padding: 20px;
                border-radius: 15px;
                border: 1px solid rgba(0, 0, 0, 0.05);
            }
            
            .filter-group {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .filter-group label {
                font-weight: 600;
                color: #1a73e8;
                font-size: 0.95rem;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .filter-group select {
                padding: 12px 16px;
                border: 2px solid transparent;
                border-radius: 12px;
                background: white;
                font-size: 0.95rem;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                min-width: 140px;
            }
            
            .filter-group select:focus {
                outline: none;
                border-color: #1a73e8;
                box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
            }
            
            .filter-group select:hover {
                border-color: #e8f0fe;
                background: #f8f9ff;
            }
            
            .clear-btn {
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-left: auto;
                font-weight: 600;
                box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .clear-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
            }
            
            .clear-btn:active {
                transform: translateY(0);
            }
            
            .search-stats {
                text-align: center;
                margin-top: 20px;
                padding: 15px 25px;
                background: rgba(255, 255, 255, 0.15);
                backdrop-filter: blur(10px);
                border-radius: 25px;
                color: rgba(255,255,255,0.95);
                font-size: 1rem;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .search-stats span {
                font-weight: 700;
                color: #fff;
                background: linear-gradient(135deg, #34a853, #4285f4);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                padding: 2px 8px;
                border-radius: 8px;
                background-color: rgba(255, 255, 255, 0.2);
                -webkit-text-fill-color: white;
            }
            
            /* Medicines Section */
            .medicines-section {
                padding: 60px 0;
                background: var(--bg-light);
            }
            
            .medicines-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 25px;
                margin-bottom: 40px;
            }
            
            .medicine-card {
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: var(--shadow);
                transition: var(--transition);
                cursor: pointer;
            }
            
            .medicine-card:hover {
                transform: translateY(-5px);
                box-shadow: var(--shadow-hover);
            }
            
            .medicine-card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                background: #f8f9fa;
                border-bottom: 1px solid var(--border-color);
            }
            
            .medicine-type {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 500;
            }
            
            .medicine-type.tablet { background: #e3f2fd; color: #1565c0; }
            .medicine-type.capsule { background: #f3e5f5; color: #7b1fa2; }
            .medicine-type.syrup { background: #e8f5e8; color: #2e7d32; }
            .medicine-type.injection { background: #ffebee; color: #c62828; }
            .medicine-type.ointment { background: #fff8e1; color: #f57c00; }
            
            .medicine-class span {
                background: #f1f3f4;
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 0.85rem;
                color: var(--text-light);
            }
            
            .medicine-card-body {
                padding: 20px;
            }
            
            .medicine-name {
                font-size: 1.3rem;
                margin-bottom: 10px;
                color: var(--text-dark);
            }
            
            .medicine-brand, .medicine-generic {
                margin-bottom: 8px;
                color: var(--text-light);
                font-size: 0.95rem;
            }
            
            .medicine-uses {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px dashed var(--border-color);
                color: var(--text-light);
                font-size: 0.9rem;
                line-height: 1.5;
            }
            
            .medicine-card-footer {
                padding: 15px 20px;
                border-top: 1px solid var(--border-color);
                background: #f8f9fa;
            }
            
            .view-details-btn {
                width: 100%;
                padding: 12px;
                background: var(--primary-color);
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                transition: var(--transition);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            
            .view-details-btn:hover {
                background: var(--primary-dark);
            }
            
            /* Loading and No Results States */
            .loading-state, .no-results-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 60px 20px;
                text-align: center;
                grid-column: 1 / -1;
            }
            
            .loading-spinner {
                font-size: 3rem;
                color: var(--primary-color);
                margin-bottom: 20px;
            }
            
            .loading-spinner .fa-spin {
                animation: spin 2s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .no-results-state i {
                color: #b0b0b0;
                margin-bottom: 20px;
            }
            
            .no-results-state h3 {
                margin-bottom: 10px;
                color: var(--text-dark);
            }
            
            .no-results-state p {
                color: var(--text-light);
                max-width: 500px;
            }
            
            /* Pagination */
            .pagination {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 15px;
                margin-top: 40px;
            }
            
            .page-btn {
                padding: 10px 20px;
                background: white;
                border: 1px solid var(--border-color);
                border-radius: 6px;
                cursor: pointer;
                transition: var(--transition);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .page-btn:hover:not(:disabled) {
                background: #f1f3f4;
            }
            
            .page-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .page-numbers {
                display: flex;
                gap: 8px;
            }
            
            .page-number {
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid var(--border-color);
                border-radius: 6px;
                background: white;
                cursor: pointer;
                transition: var(--transition);
            }
            
            .page-number:hover:not(:disabled) {
                background: #f1f3f4;
            }
            
            .page-number.active {
                background: var(--primary-color);
                color: white;
                border-color: var(--primary-color);
            }
            
            .page-number:disabled {
                cursor: default;
            }
            
            .page-ellipsis {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                color: var(--text-light);
            }
            
            /* Quick Info Section */
            .quick-info {
                padding: 60px 0;
                background: white;
            }
            
            .info-cards {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 30px;
                margin-top: 40px;
            }
            
            .info-card {
                background: #f8f9fa;
                border-radius: var(--radius);
                padding: 30px;
                border-top: 4px solid var(--secondary-color);
            }
            
            .info-icon {
                font-size: 2.5rem;
                color: var(--secondary-color);
                margin-bottom: 20px;
            }
            
            .info-card h3 {
                margin-bottom: 15px;
                color: var(--text-dark);
            }
            
            .info-card p {
                color: var(--text-light);
                line-height: 1.6;
            }
            
            /* Modal Styles */
            .modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.5);
                z-index: 1000;
                overflow-y: auto;
                padding: 20px;
            }
            
            .modal-content {
                background: white;
                border-radius: 12px;
                max-width: 800px;
                margin: 40px auto;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: modalFadeIn 0.3s ease;
            }
            
            @keyframes modalFadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 25px 30px;
                border-bottom: 1px solid var(--border-color);
            }
            
            .modal-header h2 {
                margin: 0;
                color: var(--text-dark);
                font-size: 1.8rem;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                color: var(--text-light);
                cursor: pointer;
                transition: var(--transition);
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
            }
            
            .modal-close:hover {
                background: #f1f3f4;
                color: var(--text-dark);
            }
            
            .modal-body {
                padding: 30px;
                max-height: 70vh;
                overflow-y: auto;
            }
            
            /* Medicine Detail Styles */
            .medicine-detail-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid var(--border-color);
            }
            
            .detail-type {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: 500;
            }
            
            .detail-actions {
                display: flex;
                gap: 10px;
            }
            
            .action-btn {
                padding: 10px 20px;
                background: var(--primary-color);
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                transition: var(--transition);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .action-btn:hover {
                background: var(--primary-dark);
            }
            
            .medicine-detail-info {
                display: flex;
                flex-direction: column;
                gap: 25px;
            }
            
            .detail-row {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 25px;
            }
            
            .detail-col h4 {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
                color: var(--text-dark);
                font-size: 1.1rem;
            }
            
            .detail-col p {
                color: var(--text-light);
                line-height: 1.6;
                padding-left: 28px;
            }
            
            .detail-section h3 {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 15px;
                color: var(--text-dark);
                font-size: 1.2rem;
            }
            
            .detail-section p {
                color: var(--text-light);
                line-height: 1.7;
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid var(--primary-color);
            }
            
            .medicine-disclaimer {
                margin-top: 40px;
                padding: 20px;
                background: #fff8e1;
                border-radius: 8px;
                border-left: 4px solid #ff9800;
            }
            
            .medicine-disclaimer p {
                color: #5d4037;
                margin: 0;
                line-height: 1.6;
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                .page-title {
                    font-size: 2rem;
                }
                
                .search-box.large {
                    flex-direction: column;
                    border-radius: 20px;
                }
                
                .search-box.large::before {
                    border-radius: 20px;
                }
                
                .search-box.large i {
                    padding: 15px 20px;
                    text-align: center;
                    border-radius: 15px 15px 0 0;
                    background: linear-gradient(135deg, #f8f9ff 0%, #e8f0fe 100%);
                }
                
                .search-box.large input {
                    width: 100%;
                    border-radius: 0;
                    padding: 18px 20px;
                    font-size: 16px;
                }
                
                .search-box.large button {
                    width: 100%;
                    border-radius: 0 0 15px 15px;
                    padding: 18px 20px;
                }
                
                .search-filters {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 20px;
                    padding: 25px 20px;
                }
                
                .filter-group {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 10px;
                }
                
                .filter-group select {
                    width: 100%;
                    min-width: auto;
                    padding: 15px 16px;
                }
                
                .clear-btn {
                    margin-left: 0;
                    justify-content: center;
                    padding: 15px 24px;
                }
                
                .medicines-grid {
                    grid-template-columns: 1fr;
                }
                
                .modal-content {
                    margin: 20px auto;
                }
                
                .modal-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 15px;
                }
                
                .detail-actions {
                    width: 100%;
                }
                
                .action-btn {
                    flex: 1;
                    justify-content: center;
                }
            }
            
            @media (max-width: 480px) {
                .page-header {
                    padding: 40px 0 30px;
                }
                
                .page-title {
                    font-size: 1.8rem;
                }
                
                .medicine-card-body {
                    padding: 15px;
                }
                
                .medicine-name {
                    font-size: 1.2rem;
                }
                
                .modal-body {
                    padding: 20px;
                }
                
                .search-stats {
                    font-size: 0.9rem;
                    margin-top: 10px;
                }
                
                .detail-row {
                    grid-template-columns: 1fr;
                }
                
                .search-box.large input {
                    font-size: 16px; /* Prevent zoom on iOS */
                    padding: 16px 20px;
                }
                
                .search-container {
                    padding: 25px 20px;
                    border-radius: 15px;
                }
                
                .search-stats {
                    margin-top: 15px;
                    padding: 12px 20px;
                    font-size: 0.9rem;
                }
            }
        `;
        document.head.appendChild(styles);
    }
}

// Initialize medicine styles when DOM is loaded
document.addEventListener('DOMContentLoaded', addMedicineStyles);