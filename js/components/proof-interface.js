/**
 * ProofInterface Component
 * 
 * Manages the proof construction interface
 */

window.ProofAssistant = window.ProofAssistant || {};
window.ProofAssistant.Components = window.ProofAssistant.Components || {};

window.ProofAssistant.Components.ProofInterface = (function() {
    'use strict';

    let state = {
        problem: null,
        theory: null,
        steps: [],
        editIndex: -1,
        container: null,
        callbacks: {}
    };

    /**
     * Initialize component
     */
    function init(containerEl, options = {}) {
        state.container = typeof containerEl === 'string' 
            ? document.querySelector(containerEl) 
            : containerEl;
        
        if (!state.container) return false;

        state.callbacks = {
            onStepValidated: options.onStepValidated || (() => {}),
            onProofComplete: options.onProofComplete || (() => {}),
            onError: options.onError || (() => {}),
            onSuccess: options.onSuccess || (() => {}),
            onExport: options.onExport || (() => {})
        };

        createInterface();
        attachEvents();
        return true;
    }

    /**
     * Create interface HTML
     */
    function createInterface() {
        state.container.innerHTML = `
            <table class="proof-table">
                <thead>
                    <tr>
                        <th style="width: 60%;">Expression</th>
                        <th style="width: 40%;">Justification</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="starting-expression-row">
                        <td class="step-expression" id="starting-expression"></td>
                        <td class="step-rule">Given</td>
                    </tr>
                </tbody>
                <tbody id="proof-steps"></tbody>
            </table>

            <div id="current-input" class="input-section">
                <h6 class="text-sans mb-3">Next Step</h6>
                
                <div class="mb-3">
                    <label class="form-label">Symbols:</label>
                    <div id="symbol-buttons"></div>
                    <div class="keyboard-hint">
                        <i class="fas fa-keyboard"></i>
                        Use keyboard shortcuts 1-9 to quickly insert symbols
                    </div>
                </div>

                <div class="mb-3">
                    <label for="formula-input" class="form-label">Expression:</label>
                    <input type="text" id="formula-input" class="form-control text-mono" 
                           placeholder="Enter the next expression..." autocomplete="off">
                </div>

                <div class="mb-3">
                    <label for="rule-select" class="form-label">Applied Rule:</label>
                    <select id="rule-select" class="form-select">
                        <option value="">Select a rule...</option>
                    </select>
                </div>

                <div class="d-flex gap-2">
                    <button id="check-step" class="btn btn-primary">
                        <i class="fas fa-check"></i> Validate Step
                    </button>
                    <button id="cancel-edit" class="btn btn-warning" style="display: none;">
                        <i class="fas fa-times"></i> Cancel Edit
                    </button>
                    <button id="restart-proof" class="btn btn-outline-secondary">
                        <i class="fas fa-redo"></i> Restart Proof
                    </button>
                </div>
            </div>

            <div id="proof-complete" class="mt-4" style="display: none;">
                <div class="alert alert-success">
                    <h6 class="alert-heading">
                        <i class="fas fa-check-circle"></i> Proof Complete
                    </h6>
                    <p class="mb-3">The proof has been successfully completed.</p>
                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-primary export-btn" data-format="latex">
                            <i class="fas fa-file-pdf"></i> Export LaTeX
                        </button>
                        <button class="btn btn-outline-primary export-btn" data-format="markdown">
                            <i class="fas fa-file-text"></i> Export Markdown
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Attach event handlers
     */
    function attachEvents() {
        const elements = {
            '#check-step': validateStep,
            '#cancel-edit': cancelEdit,
            '#restart-proof': restartProof
        };

        Object.entries(elements).forEach(([selector, handler]) => {
            const el = state.container.querySelector(selector);
            if (el) el.addEventListener('click', handler);
        });

        state.container.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', () => exportProof(btn.dataset.format));
        });

        const input = state.container.querySelector('#formula-input');
        if (input) input.addEventListener('keydown', handleKeyboard);
    }

    /**
     * Load problem
     */
    function loadProblem(problem, theory) {
        state.problem = problem;
        state.theory = theory;
        state.steps = [];
        state.editIndex = -1;

        const startExpr = state.container.querySelector('#starting-expression');
        if (startExpr) startExpr.textContent = formatExpression(problem.LHS);

        if (theory.clearProblemContext) theory.clearProblemContext();
        
        if (problem.customLaws && theory.loadProblemCustomLaws) {
            const id = `${problem.week}.${problem.number}`;
            theory.loadProblemCustomLaws(id, problem.customLaws);
        }

        setupSymbols();
        setupRules();
        resetInterface();
    }

    /**
     * Setup symbol buttons
     */
    function setupSymbols() {
        const container = state.container.querySelector('#symbol-buttons');
        if (!container || !state.theory) return;

        container.innerHTML = '';
        
        state.theory.symbols.forEach((symbol, i) => {
            const key = i < 9 ? (i + 1) : '0';
            const btn = document.createElement('button');
            btn.className = 'btn symbol-btn';
            btn.innerHTML = `<small>${key}</small>${symbol.display}`;
            btn.title = `${symbol.name} (${key})`;
            btn.addEventListener('click', () => insertSymbol(symbol.text));
            container.appendChild(btn);
        });
    }

    /**
     * Setup rules dropdown
     */
/**
 * Setup rules dropdown - Modified to use visual separators instead of text labels
 */
function setupRules() {
    const select = state.container.querySelector('#rule-select');
    if (!select || !state.theory) return;

    select.innerHTML = '<option value="">Select a rule...</option>';
    
    const rules = state.theory.getAllAvailableRules ? 
        state.theory.getAllAvailableRules() : state.theory.rules;
        
    // Apply filters if specified
    let filtered = rules;
    if (state.problem?.enabledRules) {
        filtered = rules.filter(r => 
            state.problem.enabledRules.includes(r.name) ||
            state.problem.enabledRules.includes(r.name.split('_')[0])
        );
    } else if (state.problem?.disabledRules) {
        filtered = rules.filter(r => !state.problem.disabledRules.includes(r.name));
    }

    // Group by level
    const groups = {
        0: { label: '', rules: [] },    // Empty separator
        1: { label: '', rules: [] },    // Empty separator  
        2: { label: '', rules: [] },    // Empty separator
        99: { label: '', rules: [] }    // Empty separator
    };

    filtered.forEach(rule => {
        const level = rule.level || 0;
        const group = groups[level] || groups[2];
        group.rules.push(rule);
    });

    let firstGroup = true;
    Object.values(groups).forEach(group => {
        if (group.rules.length === 0) return;
        
        // Add visual separator before each group (except the first)
        if (!firstGroup) {
            const separator = document.createElement('option');
            separator.disabled = true;
            separator.textContent = '_'.repeat(40);
            separator.style.textAlign = 'center';
            separator.style.color = '#ccc';
            select.appendChild(separator);
        }
        firstGroup = false;
        
        group.rules.forEach(rule => {
            const option = document.createElement('option');
            option.value = rule.name;
            option.textContent = rule.text || rule.name;
            if (rule.LHS && rule.RHS) {
                option.textContent += `: ${rule.LHS} = ${rule.RHS}`;
            }
            select.appendChild(option);
        });
    });
}

    /**
     * Validate step
     */
    function validateStep() {
        const input = state.container.querySelector('#formula-input');
        const select = state.container.querySelector('#rule-select');
        
        const formula = input.value.trim().replace(/\s/g, '');
        const ruleName = select.value;

        if (!formula) return state.callbacks.onError('Please enter an expression');
        if (!ruleName) return state.callbacks.onError('Please select a rule');

        const prevExpr = getPreviousExpression();
        if (!prevExpr) return state.callbacks.onError('No previous expression');

        const [fromAST, fromErr] = state.theory.parser.parse(prevExpr);
        if (fromErr) return state.callbacks.onError(`Error in previous: ${fromErr}`);

        const [toAST, toErr] = state.theory.parser.parse(formula);
        if (toErr) return state.callbacks.onError(`Error in expression: ${toErr}`);


        const result = state.theory.validateStep(fromAST, toAST, ruleName);
        
        if (!result.success) {
            return state.callbacks.onError(result.error || 'Validation failed');
        }

        const step = {
            expression: formula,
            rule: result.rule || { name: ruleName }
        };

        if (state.editIndex >= 0) {
            state.steps[state.editIndex] = step;
            if (state.editIndex < state.steps.length - 1) {
                state.steps = state.steps.slice(0, state.editIndex + 1);
                state.callbacks.onSuccess('Step updated. Later steps removed.');
            } else {
                state.callbacks.onSuccess('Step updated.');
            }
            rebuildSteps();
            exitEdit();
        } else {
            state.steps.push(step);
            addStepDisplay(step, state.steps.length - 1);
            input.value = formatExpression(formula);
            select.selectedIndex = 0;
            state.callbacks.onSuccess('Step validated.');
            state.callbacks.onStepValidated(step, state.steps.length);
        }

        checkCompletion();
    }

    /**
     * Check if proof is complete
     */
    function checkCompletion() {
        if (!state.problem || state.steps.length === 0) return;

        const final = state.steps[state.steps.length - 1].expression.replace(/\s/g, '');
        const target = state.problem.RHS.replace(/\s/g, '');
        
        const [finalAST] = window.ProofAssistant.Parser.parse(final);
        const [targetAST] = window.ProofAssistant.Parser.parse(target);
        
        if (finalAST && targetAST && window.ProofAssistant.AST.equals(finalAST, targetAST)) {
            completeProof();
        }
    }

    /**
     * Complete proof
     */
    function completeProof() {
        const complete = state.container.querySelector('#proof-complete');
        const input = state.container.querySelector('#current-input');
        
        if (complete) complete.style.display = 'block';
        if (input) input.style.display = 'none';

        state.callbacks.onSuccess('Proof successfully completed!');
        state.callbacks.onProofComplete(state.steps);
    }

    /**
     * Export proof
     */
    function exportProof(format) {
        const content = {
            title: state.problem.name,
            description: state.problem.description,
            LHS: state.problem.LHS,
            RHS: state.problem.RHS,
            expressions: state.steps.map(s => s.expression),
            rules: state.steps.map(s => s.rule),
            theory: state.theory?.info?.displayName || 'Unknown'
        };

        state.callbacks.onExport(format, content);
    }

    /**
     * Get previous expression
     */
    function getPreviousExpression() {
        if (state.editIndex >= 0) {
            return state.editIndex === 0 ? 
                state.problem.LHS : 
                state.steps[state.editIndex - 1].expression;
        }
        
        return state.steps.length === 0 ? 
            state.problem.LHS : 
            state.steps[state.steps.length - 1].expression;
    }

    /**
     * Add step to display
     */
    function addStepDisplay(step, index) {
        const container = state.container.querySelector('#proof-steps');
        if (!container) return;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="step-expression">= ${escapeHTML(formatExpression(step.expression))}</td>
            <td class="step-rule">
                ${escapeHTML(step.rule.text || step.rule.name || step.rule)}
                <div class="step-buttons">
                    <button class="btn btn-sm copy-step-btn" onclick="ProofAssistant.Components.ProofInterface.copyStep(${index})">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn btn-sm edit-step-btn" onclick="ProofAssistant.Components.ProofInterface.editStep(${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm delete-step-btn" onclick="ProofAssistant.Components.ProofInterface.deleteStep(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        container.appendChild(row);
    }

    /**
     * Rebuild all steps
     */
    function rebuildSteps() {
        const container = state.container.querySelector('#proof-steps');
        if (!container) return;
        
        container.innerHTML = '';
        state.steps.forEach((step, i) => addStepDisplay(step, i));
    }

    /**
     * Handle keyboard shortcuts
     */
    function handleKeyboard(e) {
        // Symbol shortcuts (1-9, 0)
        if (e.keyCode >= 48 && e.keyCode <= 57 && !e.shiftKey && !e.ctrlKey) {
            const index = e.keyCode === 48 ? 9 : e.keyCode - 49;
            if (state.theory && index < state.theory.symbols.length) {
                insertSymbol(state.theory.symbols[index].text);
                e.preventDefault();
            }
        }
        
        // Enter to validate
        if (e.keyCode === 13) {
            validateStep();
            e.preventDefault();
        }
        
        // Escape to cancel edit
        if (e.keyCode === 27 && state.editIndex >= 0) {
            cancelEdit();
            e.preventDefault();
        }
    }

    /**
     * Insert symbol at cursor
     */
    function insertSymbol(text) {
        const input = state.container.querySelector('#formula-input');
        if (!input) return;

        const start = input.selectionStart;
        const end = input.selectionEnd;
        const value = input.value;
        
        input.value = value.substring(0, start) + text + value.substring(end);
        input.focus();
        input.setSelectionRange(start + text.length, start + text.length);
    }

    /**
     * Format expression with spaces
     */
    function formatExpression(expr) {
        if (!expr || !state.theory) return expr;
        
        return state.theory.symbols
            .filter(s => s.arity === 2)
            .reduce((result, symbol) => {
                const regex = new RegExp(`\\s*${escapeRegex(symbol.text)}\\s*`, 'g');
                return result.replace(regex, ` ${symbol.text} `);
            }, expr)
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Utility functions
     */
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function cancelEdit() {
        exitEdit();
        state.callbacks.onSuccess('Edit cancelled');
    }

    function exitEdit() {
        state.editIndex = -1;
        const input = state.container.querySelector('#formula-input');
        const select = state.container.querySelector('#rule-select');
        const checkBtn = state.container.querySelector('#check-step');
        const cancelBtn = state.container.querySelector('#cancel-edit');
        
        if (input) input.value = '';
        if (select) select.selectedIndex = 0;
        if (checkBtn) {
            checkBtn.innerHTML = '<i class="fas fa-check"></i> Validate Step';
            checkBtn.className = 'btn btn-primary';
        }
        if (cancelBtn) cancelBtn.style.display = 'none';
    }

    function restartProof() {
        if (!confirm('Restart proof? All progress will be lost.')) return;
        
        state.steps = [];
        state.editIndex = -1;
        resetInterface();
        state.callbacks.onSuccess('Proof restarted');
    }

    function resetInterface() {
        const complete = state.container.querySelector('#proof-complete');
        const input = state.container.querySelector('#current-input');
        const steps = state.container.querySelector('#proof-steps');
        
        if (complete) complete.style.display = 'none';
        if (input) input.style.display = 'block';
        if (steps) steps.innerHTML = '';
        
        exitEdit();
    }

    // Public API for global access
    window.ProofAssistant.Components.ProofInterface = {
        init: init,
        loadProblem: loadProblem,
        getProofSteps: () => state.steps,
        getCurrentProblem: () => state.problem,
        
        // Global functions for onclick handlers
        copyStep: function(index) {
            if (index < 0 || index >= state.steps.length) return;
            const expr = formatExpression(state.steps[index].expression);
            
            if (navigator.clipboard?.writeText) {
                navigator.clipboard.writeText(expr)
                    .then(() => state.callbacks.onSuccess('Expression copied'))
                    .catch(() => prompt('Copy:', expr));
            } else {
                prompt('Copy:', expr);
            }
        },
        
        editStep: function(index) {
            if (index < 0 || index >= state.steps.length) return;
            
            state.editIndex = index;
            const step = state.steps[index];
            const input = state.container.querySelector('#formula-input');
            const select = state.container.querySelector('#rule-select');
            const checkBtn = state.container.querySelector('#check-step');
            const cancelBtn = state.container.querySelector('#cancel-edit');
            
            if (input) input.value = formatExpression(step.expression);
            if (select) {
                const options = select.querySelectorAll('option');
                const ruleName = step.rule.name || step.rule;
                for (let opt of options) {
                    if (opt.value === ruleName) {
                        opt.selected = true;
                        break;
                    }
                }
            }
            if (checkBtn) {
                checkBtn.innerHTML = '<i class="fas fa-save"></i> Update Step';
                checkBtn.className = 'btn btn-success';
            }
            if (cancelBtn) cancelBtn.style.display = 'inline-block';
            if (input) input.focus();
            
            state.callbacks.onSuccess(`Editing step ${index + 1}`);
        },
        
        deleteStep: function(index) {
            if (!confirm(`Delete step ${index + 1} and all following steps?`)) return;
            
            state.steps = state.steps.slice(0, index);
            rebuildSteps();
            
            const complete = state.container.querySelector('#proof-complete');
            const input = state.container.querySelector('#current-input');
            if (complete) complete.style.display = 'none';
            if (input) input.style.display = 'block';
            
            state.callbacks.onSuccess(`Step ${index + 1} deleted`);
        }
    };

    return window.ProofAssistant.Components.ProofInterface;
})();