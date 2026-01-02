// PHARMADICES - Autocomplete / Typeahead for search inputs
// Adds suggestion dropdown for medicine names, brands and generics
(function(){
    const MAX_SUGGESTIONS = 8;
    let cache = {
        loaded: false,
        entries: [] // { label, source, id }
    };

    async function loadNames() {
        if (cache.loaded) return cache.entries;
        try {
            const response = await fetch('assets/data/medicines.json');
            const data = await response.json();
            if (data && Array.isArray(data.medicines)) {
                const map = new Map();
                data.medicines.forEach(m => {
                    if (m.name) map.set(m.name.trim(), { label: m.name.trim(), source: 'Name', id: m.id });
                    if (m.brand) map.set(m.brand.trim(), { label: m.brand.trim(), source: 'Brand', id: m.id });
                    if (m.generic) map.set(m.generic.trim(), { label: m.generic.trim(), source: 'Generic', id: m.id });
                });
                cache.entries = Array.from(map.values()).filter(e => e && e.label);
                cache.loaded = true;
                return cache.entries;
            }
        } catch (e) {
            console.error('Autocomplete: failed to load names', e);
        }
        cache.entries = [];
        cache.loaded = true;
        return cache.entries;
    }

    function createSuggestionsContainer(input) {
        const container = document.createElement('div');
        container.className = 'autocomplete-suggestions';
        container.style.position = 'absolute';
        container.style.minWidth = (input.offsetWidth) + 'px';
        container.style.zIndex = 99999;
        container.style.display = 'none';
        container.setAttribute('aria-hidden', 'true');
        // Append to body to avoid clipping by parent overflow
        document.body.appendChild(container);
        return container;
    }

    function injectStyles() {
        if (document.getElementById('autocomplete-styles')) return;
        const s = document.createElement('style');
        s.id = 'autocomplete-styles';
        s.textContent = `
        .autocomplete-suggestions { 
            box-shadow: 0 8px 24px rgba(0,0,0,0.15); 
            background:#fff; 
            border:1px solid #e6e6e6; 
            border-radius:6px; 
            overflow:hidden; 
            max-height:320px; 
            overflow-y:auto; 
        }
        .autocomplete-suggestion { 
            padding:10px 12px; 
            cursor:pointer; 
            font-size:0.95rem; 
            color:#222; 
            display:flex; 
            align-items:center; 
            justify-content:space-between; 
            gap:8px; 
            border-bottom: 1px solid #f5f5f5;
        }
        .autocomplete-suggestion:last-child {
            border-bottom: none;
        }
        .autocomplete-suggestion:hover, .autocomplete-suggestion.active { 
            background:linear-gradient(90deg,#f1f8ff,#ffffff); 
        }
        .autocomplete-sugg-left { 
            display:flex; 
            gap:8px; 
            align-items:center; 
        }
        .sugg-badge { 
            font-size:0.75rem; 
            padding:4px 8px; 
            border-radius:12px; 
            background:#eef6ff; 
            color:#0d47a1; 
            border:1px solid #d7eafc; 
        }
        .recent-header { 
            padding:8px 12px; 
            font-size:0.85rem; 
            color:#555; 
            border-bottom:1px solid #f1f1f1; 
            background:#fafafa; 
        }
        `;
        document.head.appendChild(s);
    }

    function highlightMatch(text, q) {
        if (!q) return text;
        const idx = text.toLowerCase().indexOf(q.toLowerCase());
        if (idx === -1) return text;
        return text.substring(0, idx) + '<strong>' + text.substring(idx, idx + q.length) + '</strong>' + text.substring(idx + q.length);
    }

    function initAutocomplete(input, opts = {}) {
        if (!input) return;
        injectStyles();

        const container = createSuggestionsContainer(input);
        let suggestions = [];
        let selectedIndex = -1;

        async function onInput() {
            const q = input.value.trim();
            if (!q) {
                container.style.display = 'none';
                container.setAttribute('aria-hidden','true');
                return;
            }
            
            const entries = await loadNames();
            if (!entries || entries.length === 0) {
                container.style.display = 'none';
                return;
            }

            const qLower = q.toLowerCase();
            // Score items: startsWith first, then includes
            const starts = [];
            const includes = [];
            for (let entry of entries) {
                const nLower = entry.label.toLowerCase();
                if (nLower.startsWith(qLower)) starts.push(entry);
                else if (nLower.includes(qLower)) includes.push(entry);
            }

            suggestions = starts.concat(includes).slice(0, MAX_SUGGESTIONS);

            if (suggestions.length === 0) {
                container.style.display = 'none';
                return;
            }

            // Build suggestion items
            container.innerHTML = '';
            suggestions.forEach((sugg, i) => {
                const item = document.createElement('div');
                item.className = 'autocomplete-suggestion';
                item.dataset.index = i;
                
                const left = document.createElement('div');
                left.className = 'autocomplete-sugg-left';
                
                const labelHtml = highlightMatch(escapeHtml(sugg.label), q);
                const labelNode = document.createElement('div');
                labelNode.innerHTML = labelHtml;
                
                const badge = document.createElement('div');
                badge.className = 'sugg-badge';
                badge.textContent = sugg.source || '';
                
                left.appendChild(labelNode);
                item.appendChild(left);
                item.appendChild(badge);
                
                item.addEventListener('mousedown', function(e) {
                    // mousedown to prevent input blur before click
                    e.preventDefault();
                    selectSuggestion(i);
                });
                
                container.appendChild(item);
            });

            selectedIndex = -1;
            positionContainer();
            container.style.display = 'block';
            container.setAttribute('aria-hidden','false');
        }

        function positionContainer() {
            // Position the container under the input using viewport coordinates
            const rect = input.getBoundingClientRect();
            const left = rect.left + window.scrollX;
            const top = rect.bottom + window.scrollY + 6; // small gap
            container.style.width = rect.width + 'px';
            container.style.left = left + 'px';
            container.style.top = top + 'px';
        }

        function escapeHtml(unsafe) {
            return unsafe.replace(/[&<>"']/g, function(m) { 
                return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]; 
            });
        }

        function selectSuggestion(index) {
            if (index < 0 || index >= suggestions.length) return;
            const entry = suggestions[index];
            const value = entry.label || '';
            input.value = value;
            hide();
            
            // Trigger optional callback
            if (typeof opts.onSelect === 'function') {
                opts.onSelect(value, entry);
            }
            
            // Optionally auto-submit (useful for homepage)
            if (opts.autoSubmit) {
                // simulate enter
                const ev = new KeyboardEvent('keypress', {key: 'Enter'});
                input.dispatchEvent(ev);
            }
            
            // add to recent searches
            try { 
                addRecent(value); 
            } catch(e) {
                console.warn('Could not save recent search:', e);
            }
        }

        function hide() {
            container.style.display = 'none';
            container.setAttribute('aria-hidden','true');
            selectedIndex = -1;
        }

        function onKeyDown(e) {
            if (container.style.display === 'none') return;
            const items = container.querySelectorAll('.autocomplete-suggestion');
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (selectedIndex < items.length - 1) selectedIndex++;
                updateActive(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (selectedIndex > 0) selectedIndex--;
                updateActive(items);
            } else if (e.key === 'Enter') {
                if (selectedIndex >= 0 && selectedIndex < items.length) {
                    e.preventDefault();
                    selectSuggestion(selectedIndex);
                }
            } else if (e.key === 'Escape') {
                hide();
            }
        }

        function updateActive(items) {
            items.forEach((it, idx) => {
                if (idx === selectedIndex) {
                    it.classList.add('active');
                } else {
                    it.classList.remove('active');
                }
            });
        }

        // Hide when clicking outside
        function onClickOutside(e) {
            if (!container.contains(e.target) && !input.contains(e.target)) {
                hide();
            }
        }

        function addRecent(value) {
            try {
                let recent = JSON.parse(localStorage.getItem('pharmadices_recent') || '[]');
                recent = recent.filter(r => r !== value);
                recent.unshift(value);
                recent = recent.slice(0, 5);
                localStorage.setItem('pharmadices_recent', JSON.stringify(recent));
            } catch(e) {
                console.warn('Could not save to localStorage:', e);
            }
        }

        // Event listeners
        input.addEventListener('input', onInput);
        input.addEventListener('keydown', onKeyDown);
        input.addEventListener('focus', onInput);
        document.addEventListener('click', onClickOutside);
        window.addEventListener('resize', positionContainer);
        window.addEventListener('scroll', positionContainer);

        // Cleanup function
        return function cleanup() {
            input.removeEventListener('input', onInput);
            input.removeEventListener('keydown', onKeyDown);
            input.removeEventListener('focus', onInput);
            document.removeEventListener('click', onClickOutside);
            window.removeEventListener('resize', positionContainer);
            window.removeEventListener('scroll', positionContainer);
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }
        };
    }

    // Export to global scope
    window.PHARMADICES = window.PHARMADICES || {};
    window.PHARMADICES.autocomplete = {
        init: initAutocomplete,
        loadNames: loadNames
    };

})();