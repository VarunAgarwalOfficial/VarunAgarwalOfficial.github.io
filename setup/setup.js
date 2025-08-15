// Configuration object
let config = {
    courseTitle: 'Foundations of Computer Science',
    toolName: 'Proof Assistant',
    showUniLogo: true,
    borderRadius: '8px',
    ui: {
        showSidebar: true,
        showDashboard: true,
        showCustomEquations: true,
        theme: {
            primaryColor: '#FFC500',
            secondaryColor: '#522E92',
            accentColor: '#FF6F00',
            backgroundColor: '#ffffff',
            textColor: '#333333'
        },
        statusColors: {
            success: { color: '#28a745', background: '#d4edda', border: '#c3e6cb', text: '#155724' },
            error: { color: '#dc3545', background: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
            warning: { color: '#ffc107', background: '#fff3cd', border: '#ffeaa7', text: '#856404' }
        }
    },
    problems: [],
    theories: {
        set_theory: {
            name: "Set Theory",
            description: "set operations and properties",
            color: "#2E7D32",
            backgroundColor: "#E8F5E8",
            icon: "fas fa-circle"
        },
        bool_alg: {
            name: "Boolean Algebra",
            description: "Boolean operations and logical algebra",
            color: "#F57C00",
            backgroundColor: "#FFF3E0",
            icon: "fas fa-square"
        },
        prop_logic: {
            name: "Propositional Logic",
            description: "Propositional calculus and logical reasoning",
            color: "#1976D2",
            backgroundColor: "#E3F2FD",
            icon: "fas fa-triangle"
        }
    }
};

// Current state
let currentTheory = 'set_theory';
let currentHints = [];
let currentProblemCustomLaws = [];
let editingProblemIndex = -1;

// Theory symbols
const symbols = {
    set_theory: ['∪', '∩', '∅', '𝓤', 'ᶜ', '\\', '⊕'],
    bool_alg: ['∨', '∧', '¬', "'", '0', '1'],
    prop_logic: ['∨', '∧', '¬', '→', '↔', '⊥', '⊤']
};

// Theory rules definitions
const theoryRules = {
    set_theory: [
        {name: 'assoc1', text: 'Associativity of ∪', level: 0},
        {name: 'assoc2', text: 'Associativity of ∩', level: 0},
        {name: 'comm1', text: 'Commutativity of ∪', level: 0},
        {name: 'comm2', text: 'Commutativity of ∩', level: 0},
        {name: 'dist1', text: 'Distributivity of ∩ over ∪', level: 0},
        {name: 'dist2', text: 'Distributivity of ∪ over ∩', level: 0},
        {name: 'id1', text: 'Identity of ∪', level: 0},
        {name: 'id2', text: 'Identity of ∩', level: 0},
        {name: 'comp1', text: 'Complement with ∪', level: 0},
        {name: 'comp2', text: 'Complement with ∩', level: 0},
        {name: 'defdiff', text: 'Definition of \\', level: 1},
        {name: 'defsd', text: 'Definition of ⊕', level: 1},
        {name: 'idem1', text: 'Idempotence of ∪', level: 2},
        {name: 'idem2', text: 'Idempotence of ∩', level: 2},
        {name: 'dblc', text: 'Double complement', level: 2},
        {name: 'dem1', text: "De Morgan's, ᶜ over ∪", level: 2},
        {name: 'dem2', text: "De Morgan's, ᶜ over ∩", level: 2},
        {name: 'ann1', text: 'Annihilation of ∪', level: 2},
        {name: 'ann2', text: 'Annihilation of ∩', level: 2},
        {name: 'abs1', text: 'Absorption law 1', level: 2},
        {name: 'abs2', text: 'Absorption law 2', level: 2},
        {name: 'cemp', text: 'Complement of ∅', level: 2},
        {name: 'cuni', text: 'Complement of 𝓤', level: 2}
    ],
    bool_alg: [
        {name: 'assoc_or', text: 'Associativity of ∨', level: 0},
        {name: 'assoc_and', text: 'Associativity of ∧', level: 0},
        {name: 'comm_or', text: 'Commutativity of ∨', level: 0},
        {name: 'comm_and', text: 'Commutativity of ∧', level: 0},
        {name: 'dist_and_or', text: 'Distributivity of ∧ over ∨', level: 0},
        {name: 'dist_or_and', text: 'Distributivity of ∨ over ∧', level: 0},
        {name: 'id_or', text: 'Identity of ∨', level: 0},
        {name: 'id_and', text: 'Identity of ∧', level: 0},
        {name: 'comp_or', text: 'Complement with ∨', level: 0},
        {name: 'comp_and', text: 'Complement with ∧', level: 0},
        {name: 'idem_or', text: 'Idempotence of ∨', level: 2},
        {name: 'idem_and', text: 'Idempotence of ∧', level: 2},
        {name: 'dbl_comp', text: 'Double complement', level: 2},
        {name: 'ann_or', text: 'Annihilation of ∨', level: 2},
        {name: 'ann_and', text: 'Annihilation of ∧', level: 2},
        {name: 'dem_or', text: "De Morgan's, ' over ∨", level: 2},
        {name: 'dem_and', text: "De Morgan's, ' over ∧", level: 2},
        {name: 'comp_zero', text: 'Complement of 0', level: 2},
        {name: 'comp_one', text: 'Complement of 1', level: 2}
    ],
    prop_logic: [
        {name: 'assoc_or', text: 'Associativity of ∨', level: 0},
        {name: 'assoc_and', text: 'Associativity of ∧', level: 0},
        {name: 'comm_or', text: 'Commutativity of ∨', level: 0},
        {name: 'comm_and', text: 'Commutativity of ∧', level: 0},
        {name: 'dist_and_or', text: 'Distributivity of ∧ over ∨', level: 0},
        {name: 'dist_or_and', text: 'Distributivity of ∨ over ∧', level: 0},
        {name: 'id_or', text: 'Identity of ∨', level: 0},
        {name: 'id_and', text: 'Identity of ∧', level: 0},
        {name: 'comp_or', text: 'Complement with ∨', level: 0},
        {name: 'comp_and', text: 'Complement with ∧', level: 0},
        {name: 'impl_def', text: 'Implication definition', level: 1},
        {name: 'bicond_def', text: 'Biconditional definition', level: 1},
        {name: 'idem_or', text: 'Idempotence of ∨', level: 2},
        {name: 'idem_and', text: 'Idempotence of ∧', level: 2},
        {name: 'dbl_neg', text: 'Double negation', level: 2},
        {name: 'ann_or', text: 'Annihilation of ∨', level: 2},
        {name: 'ann_and', text: 'Annihilation of ∧', level: 2},
        {name: 'dem_or', text: "De Morgan's, ¬ over ∨", level: 2},
        {name: 'dem_and', text: "De Morgan's, ¬ over ∧", level: 2},
        {name: 'comp_false', text: 'Complement of ⊥', level: 2},
        {name: 'comp_true', text: 'Complement of ⊤', level: 2},
        {name: 'abs_and_or', text: 'Absorption of ∧ over ∨', level: 2},
        {name: 'abs_or_and', text: 'Absorption of ∨ over ∧', level: 2}
    ]
};

// Theme library with UNSW and WebCMS themes
const themes = {
    // UNSW Themes
    unsw_main: {
        p:'#FFC500', s:'#522E92', a:'#FF6F00', b:'#FFFFFF', t:'#333333',
        name:'UNSW Official', desc:'Classic UNSW branding'
    },
    unsw_yellow: {
        p:'#FFC500', s:'#B8860B', a:'#FF6F00', b:'#FFFFFF', t:'#333333',
        name:'UNSW Yellow', desc:'Yellow-dominant UNSW theme'
    },
    unsw_purple: {
        p:'#522E92', s:'#FFC500', a:'#004080', b:'#F5F5F5', t:'#333333',
        name:'UNSW Purple', desc:'Purple-dominant theme'
    },
    unsw_gold: {
        p:'#FFC500', s:'#333333', a:'#522E92', b:'#FFFFFF', t:'#2d3748',
        name:'UNSW Gold', desc:'Gold-focused design'
    },
   
    // WebCMS Monochromatic Themes
    webcms_blue: {
        p:'#2196F3', s:'#1565C0', a:'#0D47A1', b:'#FFFFFF', t:'#212121',
        name:'WebCMS Blue', desc:'Professional blue WebCMS theme'
    },
    webcms_blue_light: {
        p:'#03A9F4', s:'#0288D1', a:'#01579B', b:'#FFFFFF', t:'#212121',
        name:'WebCMS Blue (Light)', desc:'Light blue WebCMS theme'
    },
    webcms_deep_orange: {
        p:'#FF5722', s:'#E64A19', a:'#BF360C', b:'#FFFFFF', t:'#212121',
        name:'WebCMS Deep Orange', desc:'Vibrant orange WebCMS theme'
    },
    webcms_deep_orange_light: {
        p:'#FF6E40', s:'#FF5722', a:'#DD2C00', b:'#FFFFFF', t:'#212121',
        name:'WebCMS Deep Orange (Light)', desc:'Light orange WebCMS theme'
    },
    webcms_deep_purple: {
        p:'#673AB7', s:'#512DA8', a:'#311B92', b:'#FFFFFF', t:'#212121',
        name:'WebCMS Deep Purple', desc:'Rich purple WebCMS theme'
    },
    webcms_deep_purple_light: {
        p:'#7E57C2', s:'#673AB7', a:'#4527A0', b:'#FFFFFF', t:'#212121',
        name:'WebCMS Deep Purple (Light)', desc:'Light purple WebCMS theme'
    },
    webcms_green: {
        p:'#4CAF50', s:'#388E3C', a:'#1B5E20', b:'#FFFFFF', t:'#212121',
        name:'WebCMS Green', desc:'Natural green WebCMS theme'
    },
    webcms_indigo: {
        p:'#3F51B5', s:'#303F9F', a:'#1A237E', b:'#FFFFFF', t:'#212121',
        name:'WebCMS Indigo', desc:'Deep indigo WebCMS theme'
    },
    webcms_indigo_light: {
        p:'#5C6BC0', s:'#3F51B5', a:'#283593', b:'#FFFFFF', t:'#212121',
        name:'WebCMS Indigo (Light)', desc:'Light indigo WebCMS theme'
    },
    webcms_orange: {
        p:'#FF9800', s:'#F57C00', a:'#E65100', b:'#FFFFFF', t:'#212121',
        name:'WebCMS Orange', desc:'Warm orange WebCMS theme'
    },
    webcms_pink: {
        p:'#E91E63', s:'#C2185B', a:'#880E4F', b:'#FFFFFF', t:'#212121',
        name:'WebCMS Pink', desc:'Modern pink WebCMS theme'
    },
    webcms_pink_light: {
        p:'#F06292', s:'#E91E63', a:'#AD1457', b:'#FFFFFF', t:'#212121',
        name:'WebCMS Pink (Light)', desc:'Light pink WebCMS theme'
    },
    webcms_purple: {
        p:'#9C27B0', s:'#7B1FA2', a:'#4A148C', b:'#FFFFFF', t:'#212121',
        name:'WebCMS Purple', desc:'Classic purple WebCMS theme'
    },
    webcms_purple_light: {
        p:'#AB47BC', s:'#9C27B0', a:'#6A1B9A', b:'#FFFFFF', t:'#212121',
        name:'WebCMS Purple (Light)', desc:'Light purple WebCMS theme'
    },
    webcms_red: {
        p:'#F44336', s:'#D32F2F', a:'#B71C1C', b:'#FFFFFF', t:'#212121',
        name:'WebCMS Red', desc:'Bold red WebCMS theme'
    },
    webcms_red_light: {
        p:'#EF5350', s:'#F44336', a:'#C62828', b:'#FFFFFF', t:'#212121',
        name:'WebCMS Red (Light)', desc:'Light red WebCMS theme'
    },
    webcms_teal: {
        p:'#009688', s:'#00796B', a:'#004D40', b:'#FFFFFF', t:'#212121',
        name:'WebCMS Teal', desc:'Modern teal WebCMS theme'
    },
   
    // Classic themes
    classic_academic: {
        p:'#1E3A8A', s:'#1E40AF', a:'#3B82F6', b:'#F8FAFC', t:'#1E293B',
        name:'Classic Academic', desc:'Traditional academic colours'
    },
    classic_webcms: {
        p:'#0088CC', s:'#004165', a:'#5CB85C', b:'#FFFFFF', t:'#333333',
        name:'Classic WebCMS', desc:'Familiar WebCMS styling'
    },
    minimal_gray: {
        p:'#4a5568', s:'#2d3748', a:'#718096', b:'#ffffff', t:'#2d3748',
        name:'Minimal Gray', desc:'Clean, minimal approach'
    }
};

// Initialize
window.onload = function() {
    updateSymbols();
    updateRules();
    updatePreview();
    updateStats();
    setupColorPickers();
    setupFormListeners();
    populateThemes();
};

// Populate themes
function populateThemes() {
    const container = document.getElementById('theme-container');
    container.innerHTML = '';
    
    Object.keys(themes).forEach((key, index) => {
        const theme = themes[key];
        const themeCard = document.createElement('div');
        themeCard.className = 'theme-card';
        themeCard.style.setProperty('--theme-primary', theme.p);
        themeCard.style.setProperty('--theme-secondary', theme.s);
        if (key === 'unsw_main') themeCard.classList.add('active');
        themeCard.onclick = () => applyTheme(key);
        
        themeCard.innerHTML = `
            <div class="theme-dots">
                <span class="theme-dot" style="background:${theme.p}"></span>
                <span class="theme-dot" style="background:${theme.s}"></span>
                <span class="theme-dot" style="background:${theme.a}"></span>
            </div>
            <div class="theme-name">${theme.name}</div>
            <div class="theme-description">${theme.desc}</div>
        `;
        
        container.appendChild(themeCard);
    });
}

// Tab switching
function showTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tab + '-tab').classList.add('active');
    
    if (tab === 'preview') updatePreview();
}

// Setup form listeners
function setupFormListeners() {
    const elements = {
        'course-title': (val) => config.courseTitle = val,
        'tool-name': (val) => config.toolName = val,
        'show-uni-logo': (checked) => config.showUniLogo = checked,
        'show-sidebar': (checked) => config.ui.showSidebar = checked,
        'show-dashboard': (checked) => config.ui.showDashboard = checked,
        'show-custom': (checked) => config.ui.showCustomEquations = checked
    };

    Object.entries(elements).forEach(([id, handler]) => {
        const element = document.getElementById(id);
        if (element) {
            const eventType = element.type === 'checkbox' ? 'change' : 'input';
            element.addEventListener(eventType, function() {
                const value = element.type === 'checkbox' ? this.checked : this.value;
                handler(value);
                updatePreview();
                updateStats();
            });
        }
    });

    // Border radius slider
    const borderRadiusSlider = document.getElementById('border-radius');
    const borderRadiusValue = document.getElementById('border-radius-value');
    if (borderRadiusSlider) {
        borderRadiusSlider.addEventListener('input', function() {
            const value = this.value + 'px';
            config.borderRadius = value;
            borderRadiusValue.textContent = value;
            updatePreview();
        });
    }
}

// Setup color pickers
function setupColorPickers() {
    const pickers = [
        {id: 'primary', key: 'primaryColor'},
        {id: 'secondary', key: 'secondaryColor'},
        {id: 'accent', key: 'accentColor'},
        {id: 'bg', key: 'backgroundColor'},
        {id: 'text', key: 'textColor'}
    ];

    pickers.forEach(p => {
        const input = document.getElementById(p.id + '-color');
        const hex = document.getElementById(p.id + '-hex');
        
        if (input && hex) {
            input.addEventListener('input', function() {
                hex.textContent = this.value.toUpperCase();
                config.ui.theme[p.key] = this.value.toUpperCase();
                updatePreview();
            });
        }
    });
}

// Apply preset theme
function applyTheme(key) {
    const theme = themes[key];
    if (!theme) return;

    const updates = [
        ['primary-color', 'primary-hex', theme.p],
        ['secondary-color', 'secondary-hex', theme.s],
        ['accent-color', 'accent-hex', theme.a],
        ['bg-color', 'bg-hex', theme.b],
        ['text-color', 'text-hex', theme.t]
    ];

    updates.forEach(([inputId, hexId, value]) => {
        document.getElementById(inputId).value = value;
        document.getElementById(hexId).textContent = value;
    });

    config.ui.theme = {
        primaryColor: theme.p,
        secondaryColor: theme.s,
        accentColor: theme.a,
        backgroundColor: theme.b,
        textColor: theme.t
    };

    // Update active state
    document.querySelectorAll('.theme-card').forEach(card => card.classList.remove('active'));
    event.target.closest('.theme-card').classList.add('active');
    
    updatePreview();
    showStatus(`Applied ${theme.name} theme`, 'success');
}

// Theory selection
function selectTheory(elem) {
    document.querySelectorAll('.theory-option').forEach(opt => opt.classList.remove('selected'));
    elem.classList.add('selected');
    currentTheory = elem.dataset.theory;
    updateSymbols();
    updateRules();
}

// Update symbols
function updateSymbols() {
    const container = document.getElementById('symbols');
    container.innerHTML = '';
    
    symbols[currentTheory].forEach(sym => {
        const btn = document.createElement('button');
        btn.className = 'symbol-btn';
        btn.textContent = sym;
        btn.onclick = () => insertSymbol(sym);
        btn.title = `Insert ${sym}`;
        container.appendChild(btn);
    });
}

// Update rules selector
function updateRules() {
    const container = document.getElementById('rules-selector');
    container.innerHTML = '';
    
    const rules = theoryRules[currentTheory] || [];
    
    // Group rules by level
    const rulesByLevel = {};
    rules.forEach(rule => {
        if (!rulesByLevel[rule.level]) {
            rulesByLevel[rule.level] = [];
        }
        rulesByLevel[rule.level].push(rule);
    });
    
    // Sort levels numerically
    const sortedLevels = Object.keys(rulesByLevel).map(Number).sort((a, b) => a - b);
    
    // Display rules grouped by level
    sortedLevels.forEach((level, index) => {
        // Add level header
        if (index > 0) {
            const separator = document.createElement('div');
            separator.style.cssText = 'height: 1px; background: var(--border); margin: 15px 0;';
            container.appendChild(separator);
        }
        
        const levelHeader = document.createElement('div');
        levelHeader.innerHTML = `<strong>Level ${level} Rules</strong>`;
        levelHeader.style.cssText = 'color: var(--secondary); margin-bottom: 10px; font-size: 0.9rem;';
        container.appendChild(levelHeader);
        
        // Add rules for this level
        rulesByLevel[level].forEach(rule => {
            const ruleDiv = document.createElement('div');
            ruleDiv.className = 'rule-item';
            ruleDiv.innerHTML = `
                <input type="checkbox" id="rule-${rule.name}" value="${rule.name}" checked>
                <div class="rule-info">
                    <label for="rule-${rule.name}" class="rule-name">${rule.text}</label>
                    <span class="rule-level rule-level-${level}">Level ${level}</span>
                </div>
            `;
            container.appendChild(ruleDiv);
        });
    });
}

// Select/Deselect all rules
function selectAllRules() {
    document.querySelectorAll('#rules-selector input[type="checkbox"]').forEach(cb => cb.checked = true);
}

function deselectAllRules() {
    document.querySelectorAll('#rules-selector input[type="checkbox"]').forEach(cb => cb.checked = false);
}

// Insert symbol
function insertSymbol(sym) {
    const active = document.activeElement;
    if (active && ['lhs', 'rhs', 'problem-law-lhs', 'problem-law-rhs'].includes(active.id)) {
        const start = active.selectionStart;
        const end = active.selectionEnd;
        const value = active.value;
        active.value = value.substring(0, start) + sym + value.substring(end);
        active.focus();
        active.setSelectionRange(start + sym.length, start + sym.length);
    }
}

// Add problem-specific custom law
function addProblemCustomLaw() {
    const name = document.getElementById('problem-law-name').value.trim();
    const lhs = document.getElementById('problem-law-lhs').value.trim();
    const rhs = document.getElementById('problem-law-rhs').value.trim();

    if (!name || !lhs || !rhs) {
        showStatus('Please fill all fields for the custom law', 'error');
        return;
    }

    currentProblemCustomLaws.push({ name, lhs, rhs, theory: currentTheory });
    
    document.getElementById('problem-law-name').value = '';
    document.getElementById('problem-law-lhs').value = '';
    document.getElementById('problem-law-rhs').value = '';
    
    updateProblemCustomLawsDisplay();
    updateStats();
    showStatus('Problem-specific custom law added', 'success');
}

// Update problem-specific custom laws display
function updateProblemCustomLawsDisplay() {
    const container = document.getElementById('problem-custom-laws');
    if (currentProblemCustomLaws.length === 0) {
        container.innerHTML = '<div class="small-text" style="color: #666; font-style: italic;">No problem-specific laws defined</div>';
        return;
    }

    container.innerHTML = currentProblemCustomLaws.map((law, i) => 
        `<div class="custom-law-item">
            <span><strong>${law.name}:</strong> ${law.lhs} = ${law.rhs}</span>
            <button class="btn-custom btn-danger-custom" onclick="removeProblemCustomLaw(${i})">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>`
    ).join('');
}

// Remove problem-specific custom law
function removeProblemCustomLaw(index) {
    currentProblemCustomLaws.splice(index, 1);
    updateProblemCustomLawsDisplay();
    updateStats();
    showStatus('Problem-specific custom law removed', 'success');
}

// Add hint
function addHint() {
    const input = document.getElementById('hint-input');
    if (!input.value.trim()) return;
    
    currentHints.push(input.value.trim());
    input.value = '';
    
    const container = document.getElementById('hints');
    container.style.display = 'block';
    container.innerHTML = currentHints.map((h, i) => 
        `<div class="hint-item">
            <span>${h}</span>
            <button class="btn-custom btn-danger-custom" onclick="removeHint(${i})">
                <i class="fas fa-times"></i>
            </button>
        </div>`
    ).join('');
}

// Remove hint
function removeHint(index) {
    currentHints.splice(index, 1);
    if (currentHints.length === 0) {
        document.getElementById('hints').style.display = 'none';
        document.getElementById('hints').innerHTML = '';
    } else {
        document.getElementById('hints').innerHTML = currentHints.map((h, i) => 
            `<div class="hint-item">
                <span>${h}</span>
                <button class="btn-custom btn-danger-custom" onclick="removeHint(${i})">
                    <i class="fas fa-times"></i>
                </button>
            </div>`
        ).join('');
    }
}

// Edit problem
function editProblem(index) {
    const problem = config.problems[index];
    editingProblemIndex = index;
    
    // Populate form with problem data
    document.getElementById('week').value = problem.week;
    document.getElementById('number').value = problem.number;
    document.getElementById('name').value = problem.name;
    document.getElementById('description').value = problem.description || '';
    document.getElementById('lhs').value = problem.LHS;
    document.getElementById('rhs').value = problem.RHS;
    
    // Set theory
    currentTheory = problem.theory;
    document.querySelectorAll('.theory-option').forEach(opt => opt.classList.remove('selected'));
    document.querySelector(`[data-theory="${currentTheory}"]`).classList.add('selected');
    updateSymbols();
    updateRules();
    
    // Load hints
    currentHints = problem.hints ? [...problem.hints] : [];
    if (currentHints.length > 0) {
        const hintsContainer = document.getElementById('hints');
        hintsContainer.style.display = 'block';
        hintsContainer.innerHTML = currentHints.map((h, i) => 
            `<div class="hint-item">
                <span>${h}</span>
                <button class="btn-custom btn-danger-custom" onclick="removeHint(${i})">
                    <i class="fas fa-times"></i>
                </button>
            </div>`
        ).join('');
    } else {
        document.getElementById('hints').style.display = 'none';
    }
    
    // Load enabled rules
    if (problem.enabledRules) {
        document.querySelectorAll('#rules-selector input[type="checkbox"]').forEach(cb => {
            cb.checked = problem.enabledRules.includes(cb.value);
        });
    } else {
        selectAllRules();
    }
    
    // Load custom laws
    currentProblemCustomLaws = problem.customLaws ? [...problem.customLaws] : [];
    updateProblemCustomLawsDisplay();
    
    // Update UI to show edit mode
    document.getElementById('form-title').textContent = 'Edit Problem';
    document.getElementById('problem-action-btn').innerHTML = '<i class="fas fa-save"></i> Update Problem';
    document.getElementById('problem-action-btn').onclick = updateProblem;
    document.getElementById('edit-mode-indicator').style.display = 'flex';
    document.getElementById('editing-problem-id').textContent = `${problem.week}.${problem.number.toString().padStart(2, '0')} - ${problem.name}`;
    
    // Switch to problems tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector('.tab-btn[onclick*="problems"]').classList.add('active');
    document.getElementById('problems-tab').classList.add('active');
    
    // Scroll to form
    document.querySelector('.problem-form').scrollIntoView({ behavior: 'smooth' });
    
    showStatus(`Editing problem ${problem.week}.${problem.number.toString().padStart(2, '0')}`, 'success');
}

// Update problem
function updateProblem() {
    const problem = {
        week: parseInt(document.getElementById('week').value),
        number: parseInt(document.getElementById('number').value),
        theory: currentTheory,
        name: document.getElementById('name').value.trim(),
        description: document.getElementById('description').value.trim(),
        LHS: document.getElementById('lhs').value.trim(),
        RHS: document.getElementById('rhs').value.trim()
    };

    if (!problem.name || !problem.LHS || !problem.RHS) {
        showStatus('Please fill all required fields (name, LHS, RHS)', 'error');
        return;
    }

    // Check for duplicate problem ID (excluding current)
    const problemId = `${problem.week}.${problem.number}`;
    const duplicate = config.problems.some((p, i) => 
        i !== editingProblemIndex && p.week === problem.week && p.number === problem.number
    );
    
    if (duplicate) {
        showStatus(`Problem ${problemId} already exists. Please use a different week/number.`, 'error');
        return;
    }

    if (currentHints.length > 0) {
        problem.hints = [...currentHints];
    }

    // Add enabled rules
    const enabledRules = [];
    document.querySelectorAll('#rules-selector input[type="checkbox"]:checked').forEach(cb => {
        enabledRules.push(cb.value);
    });
    if (enabledRules.length < theoryRules[currentTheory].length) {
        problem.enabledRules = enabledRules;
    }

    // Add custom laws
    if (currentProblemCustomLaws.length > 0) {
        problem.customLaws = [...currentProblemCustomLaws];
    }

    config.problems[editingProblemIndex] = problem;
    updateProblemsList();
    cancelEdit();
    updatePreview();
    updateStats();
    showStatus(`Problem ${problemId} updated successfully!`, 'success');
}

// Cancel edit
function cancelEdit() {
    editingProblemIndex = -1;
    clearProblemForm();
    document.getElementById('form-title').textContent = 'Add New Problem';
    document.getElementById('problem-action-btn').innerHTML = '<i class="fas fa-plus-circle"></i> Add Problem';
    document.getElementById('problem-action-btn').onclick = addProblem;
    document.getElementById('edit-mode-indicator').style.display = 'none';
}

// Add problem
function addProblem() {
    const problem = {
        week: parseInt(document.getElementById('week').value),
        number: parseInt(document.getElementById('number').value),
        theory: currentTheory,
        name: document.getElementById('name').value.trim(),
        description: document.getElementById('description').value.trim(),
        LHS: document.getElementById('lhs').value.trim(),
        RHS: document.getElementById('rhs').value.trim()
    };

    if (!problem.name || !problem.LHS || !problem.RHS) {
        showStatus('Please fill all required fields (name, LHS, RHS)', 'error');
        return;
    }

    // Check for duplicate problem ID
    const problemId = `${problem.week}.${problem.number}`;
    if (config.problems.some(p => p.week === problem.week && p.number === problem.number)) {
        showStatus(`Problem ${problemId} already exists. Please use a different week/number.`, 'error');
        return;
    }

    if (currentHints.length > 0) {
        problem.hints = [...currentHints];
    }

    // Add enabled rules
    const enabledRules = [];
    document.querySelectorAll('#rules-selector input[type="checkbox"]:checked').forEach(cb => {
        enabledRules.push(cb.value);
    });
    if (enabledRules.length < theoryRules[currentTheory].length) {
        problem.enabledRules = enabledRules;
    }

    // Add custom laws (only problem-specific)
    if (currentProblemCustomLaws.length > 0) {
        problem.customLaws = [...currentProblemCustomLaws];
    }

    config.problems.push(problem);
    updateProblemsList();
    clearProblemForm();
    updatePreview();
    updateStats();
    showStatus(`Problem ${problemId} added successfully!`, 'success');
}

// Clear problem form
function clearProblemForm() {
    // Auto-increment problem number
    const nextNumber = parseInt(document.getElementById('number').value) + 1;
    document.getElementById('number').value = nextNumber;
    
    document.getElementById('name').value = '';
    document.getElementById('description').value = '';
    document.getElementById('lhs').value = '';
    document.getElementById('rhs').value = '';
    currentHints = [];
    currentProblemCustomLaws = [];
    document.getElementById('hints').style.display = 'none';
    updateProblemCustomLawsDisplay();
    selectAllRules(); // Reset all rules to selected
}

// Update problems list
function updateProblemsList() {
    const list = document.getElementById('problems-list');
    if (config.problems.length === 0) {
        list.innerHTML = '<div class="small-text" style="text-align: center; padding: 40px; color: #666; font-style: italic;">No problems added yet. Create your first problem above!</div>';
        return;
    }

    // Sort problems by week then number
    const sortedProblems = [...config.problems].sort((a, b) => {
        if (a.week !== b.week) return a.week - b.week;
        return a.number - b.number;
    });

    list.innerHTML = sortedProblems.map((p, i) => {
        const originalIndex = config.problems.indexOf(p);
        const theoryName = config.theories[p.theory]?.name || p.theory;
        return `<div class="problem-item">
            <div class="problem-info">
                <div>
                    <span class="problem-badge">${p.week}.${p.number.toString().padStart(2, '0')}</span>
                    <strong>${p.name}</strong>
                    <span class="problem-theory-badge">${theoryName}</span>
                </div>
                <div style="margin-top: 8px;">
                    <code style="background: var(--light-bg); padding: 4px 8px; border-radius: 4px; font-size: 0.9rem;">${p.LHS} = ${p.RHS}</code>
                </div>
                <div style="margin-top: 8px; font-size: 0.8rem; color: #666;">
                    ${p.hints ? `${p.hints.length} hints • ` : ''}
                    ${p.enabledRules ? `${p.enabledRules.length} enabled rules • ` : ''}
                    ${p.customLaws ? `${p.customLaws.length} custom laws • ` : ''}
                    ${p.description ? p.description : 'No description'}
                </div>
            </div>
            <div>
                <button class="btn-custom btn-info-custom" onclick="editProblem(${originalIndex})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-custom btn-danger-custom" onclick="deleteProblem(${originalIndex})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>`;
    }).join('');
}

// Delete problem
function deleteProblem(index) {
    const problem = config.problems[index];
    const problemId = `${problem.week}.${problem.number.toString().padStart(2, '0')}`;
    
    if (confirm(`Are you sure you want to delete Problem ${problemId}: "${problem.name}"?`)) {
        config.problems.splice(index, 1);
        updateProblemsList();
        updatePreview();
        updateStats();
        showStatus(`Problem ${problemId} deleted`, 'success');
    }
}

// Update statistics
function updateStats() {
    const totalProblems = config.problems.length;
    const totalWeeks = new Set(config.problems.map(p => p.week)).size;
    const totalCustomLaws = config.problems.reduce((sum, p) => sum + (p.customLaws?.length || 0), 0) + currentProblemCustomLaws.length;

    document.getElementById('total-problems').textContent = totalProblems;
    document.getElementById('total-weeks').textContent = totalWeeks;
    document.getElementById('total-custom-laws').textContent = totalCustomLaws;
}

// Update preview
function updatePreview() {
    const preview = document.getElementById('preview');
    
    // Extract problems from config and put them at top level
    const { problems, ...configWithoutProblems } = config;
    
    const finalConfig = {
        configuration: configWithoutProblems,
        problems: problems,
        theories: config.theories
    };
    
    const js = `/**
* Proof Assistant Configuration
* ${new Date().toLocaleString()}
* 
* Course: ${config.courseTitle}
* Total Problems: ${config.problems.length}
* Theories: ${Object.keys(config.theories).length}
*/

window.problemsData = ${JSON.stringify(finalConfig, null, 2)};`;
    
    preview.textContent = js;
}

// Show status
function showStatus(msg, type = 'success') {
    const status = document.getElementById('status');
    status.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${msg}`;
    status.className = 'status ' + type;
    status.style.display = 'block';
    setTimeout(() => status.style.display = 'none', type === 'error' ? 5000 : 3000);
}

// Generate and download problems.js file
function generateFile() {
    updatePreview();
    
    // Extract problems from config and put them at top level
    const { problems, ...configWithoutProblems } = config;
    
    const finalConfig = {
        configuration: configWithoutProblems,
        problems: problems,
        theories: config.theories
    };
    
    const js = `/**
* Proof Assistant Configuration
* ${new Date().toLocaleString()}
* 
* Course: ${config.courseTitle}
* Tool: ${config.toolName}
* Total Problems: ${config.problems.length}
* Theories: ${Object.keys(config.theories).length}
*/

window.problemsData = ${JSON.stringify(finalConfig, null, 2)};`;
    
    downloadFile(js, 'problems.js', 'text/javascript');
    showStatus('problems.js file generated and downloaded!', 'success');
}

// Export as JSON
function exportAsJson() {
    // Extract problems from config and put them at top level
    const { problems, ...configWithoutProblems } = config;
    
    const finalConfig = {
        configuration: configWithoutProblems,
        problems: problems,
        theories: config.theories
    };
    
    const json = JSON.stringify(finalConfig, null, 2);
    downloadFile(json, 'proof-assistant-config.json', 'application/json');
    showStatus('Configuration exported as JSON!', 'success');
}

// Download file helper
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Load file
function loadFile() {
    document.getElementById('file-input').click();
}

// Handle file load
function handleFileLoad(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            let content = e.target.result;
            
            // Handle JavaScript files
            if (content.includes('window.problemsData')) {
                const start = content.indexOf('{');
                const end = content.lastIndexOf('}') + 1;
                content = content.substring(start, end);
            }
            
            const data = JSON.parse(content);
            
            // Handle different data structures
            if (data.configuration) {
                // New structure: problems at top level
                config = { ...data.configuration };
                config.problems = data.problems || [];
                config.theories = data.theories || config.theories;
            } else if (data.problems && Array.isArray(data.problems)) {
                // Legacy structure: everything at top level
                config = data;
            } else {
                // Fallback: assume it's the config object itself
                config = data;
            }
            
            // Ensure problems array exists
            if (!config.problems) config.problems = [];
            
            updateFormFromConfig();
            updateProblemsList();
            updatePreview();
            updateStats();
            showStatus('Configuration loaded successfully!', 'success');
            
        } catch (err) {
            showStatus('Error loading file: ' + err.message, 'error');
        }
    };
    
    reader.readAsText(file);
    // Reset the input
    event.target.value = '';
}

// Update form from loaded config
function updateFormFromConfig() {
    // Basic settings
    if (config.courseTitle) document.getElementById('course-title').value = config.courseTitle;
    if (config.toolName) document.getElementById('tool-name').value = config.toolName;
    if (typeof config.showUniLogo !== 'undefined') document.getElementById('show-uni-logo').checked = config.showUniLogo;
    if (config.borderRadius) {
        const value = parseInt(config.borderRadius);
        document.getElementById('border-radius').value = value;
        document.getElementById('border-radius-value').textContent = config.borderRadius;
    }

    // UI settings
    if (config.ui) {
        if (typeof config.ui.showSidebar !== 'undefined') document.getElementById('show-sidebar').checked = config.ui.showSidebar;
        if (typeof config.ui.showDashboard !== 'undefined') document.getElementById('show-dashboard').checked = config.ui.showDashboard;
        if (typeof config.ui.showCustomEquations !== 'undefined') document.getElementById('show-custom').checked = config.ui.showCustomEquations;

        // Theme colors
        if (config.ui.theme) {
            const theme = config.ui.theme;
            const colorMappings = [
                ['primaryColor', 'primary-color', 'primary-hex'],
                ['secondaryColor', 'secondary-color', 'secondary-hex'],
                ['accentColor', 'accent-color', 'accent-hex'],
                ['backgroundColor', 'bg-color', 'bg-hex'],
                ['textColor', 'text-color', 'text-hex']
            ];

            colorMappings.forEach(([key, inputId, hexId]) => {
                if (theme[key]) {
                    document.getElementById(inputId).value = theme[key];
                    document.getElementById(hexId).textContent = theme[key];
                }
            });
        }
    }

    // Clear current editing state
    cancelEdit();
    currentHints = [];
    currentProblemCustomLaws = [];
    document.getElementById('hints').style.display = 'none';
    updateProblemCustomLawsDisplay();
    
    // Reset theory selection
    currentTheory = 'set_theory';
    document.querySelectorAll('.theory-option').forEach(opt => opt.classList.remove('selected'));
    document.querySelector('[data-theory="set_theory"]').classList.add('selected');
    updateSymbols();
    updateRules();
}