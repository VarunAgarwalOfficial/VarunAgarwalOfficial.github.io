/**
 * User Interface Module
 * 
 * Handles problem loading, sidebar navigation, and proof interface
 * Uses problems.js as the single source of truth for problem data
 */

window.ProofAssistant = window.ProofAssistant || {};

window.ProofAssistant.UI = (function() {
    'use strict';

    // UI state
    let problemsData = null;
    let currentProblem = null;
    let currentTheory = null;
    let proofSteps = [];
    let editingStepIndex = -1;

    /**
     * Initialize the UI
     */
    function init() {
        console.log('Initializing UI...');
        loadProblemsData();
        setupEventListeners();
    }

    /**
     * Load problems data from problems.js
     */
    function loadProblemsData() {
        if (window.problemsData) {
            problemsData = window.problemsData;
            console.log('Loaded problems from problems.js');
            populateSidebar();
        } else {
            console.error('problems.js not loaded or window.problemsData not found');
            showLoadingError();
        }
    }

    /**
     * Show loading error
     */
    function showLoadingError() {
        const loadingDiv = document.getElementById('problems-loading');
        if (loadingDiv) {
            loadingDiv.innerHTML = '<p class="text-danger">Error: problems.js not loaded</p>';
        }
    }

    /**
     * Populate the sidebar with problems organized by week
     */
    function populateSidebar() {
        const loadingDiv = document.getElementById('problems-loading');
        const problemsList = document.getElementById('problems-list');
        
        if (!problemsData || !problemsData.problems) {
            showLoadingError();
            return;
        }

        // Group problems by week
        const problemsByWeek = {};
        problemsData.problems.forEach(problem => {
            if (!problemsByWeek[problem.week]) {
                problemsByWeek[problem.week] = [];
            }
            problemsByWeek[problem.week].push(problem);
        });

        // Generate sidebar HTML
        let sidebarHTML = '';
        Object.keys(problemsByWeek).sort((a, b) => parseInt(a) - parseInt(b)).forEach(week => {
            sidebarHTML += `<div class="week-group">`;
            sidebarHTML += `<div class="week-header">Week ${week}</div>`;
            
            // Sort problems within week by number
            problemsByWeek[week].sort((a, b) => a.number - b.number).forEach(problem => {
                const theoryName = problemsData.theories && problemsData.theories[problem.theory] 
                    ? problemsData.theories[problem.theory].name 
                    : problem.theory;
                
                // Generate problem ID
                const problemId = `${problem.week}.${problem.number.toString().padStart(2, '0')}`;
                
                sidebarHTML += `
                    <div class="problem-item" onclick="selectProblem('${problemId}')" data-problem-id="${problemId}">
                        <div class="problem-id">${problemId}</div>
                        <div class="problem-title">${problem.name}</div>
                        <div class="problem-theory">${theoryName}</div>
                    </div>
                `;
            });
            
            sidebarHTML += `</div>`;
        });

        problemsList.innerHTML = sidebarHTML;
        loadingDiv.style.display = 'none';
        problemsList.style.display = 'block';

        console.log('Sidebar populated successfully with', problemsData.problems.length, 'problems');
    }

    /**
     * Select and load a problem
     */
    function selectProblem(problemId) {
        // Find the problem by generated ID
        const [week, number] = problemId.split('.');
        const problem = problemsData.problems.find(p => 
            p.week === parseInt(week) && p.number === parseInt(number)
        );
        
        if (!problem) {
            showError('Problem not found: ' + problemId);
            return;
        }

        // Update sidebar selection
        document.querySelectorAll('.problem-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-problem-id="${problemId}"]`)?.classList.add('active');

        // Load the appropriate theory
        if (switchTheory(problem.theory)) {
            setProblem(problem, problemId);
            showProblemContent();
        }
    }

    /**
     * Switch to the appropriate theory for the problem
     */
    function switchTheory(theoryName) {
        try {
            let theory = null;
            switch(theoryName) {
                case 'set_theory':
                    theory = window.ProofAssistant.Theories.SetTheory;
                    break;
                case 'bool_alg':
                    theory = window.ProofAssistant.Theories.BooleanAlgebra;
                    break;
                case 'prop_logic':
                    theory = window.ProofAssistant.Theories.PropositionalLogic;
                    break;
                default:
                    throw new Error(`Unknown theory: ${theoryName}`);
            }

            if (!theory) {
                throw new Error(`Theory ${theoryName} not available`);
            }

            // Configure parser with theory symbols
            window.ProofAssistant.Parser.setSymbols(theory.symbols);
            window.ProofAssistant.Parser.setEquality(theory.equality);
            window.ProofAssistant.Parser.init();

            // Store current theory
            currentTheory = theory;
            
            // Update UI with theory
            setupSymbolButtons();
            populateRuleSelect();
            
            console.log(`Switched to theory: ${theoryName}`);
            return true;
        } catch (error) {
            console.error('Failed to switch theory:', error);
            showError('Failed to load theory: ' + error.message);
            return false;
        }
    }

    /**
     * Show problem content area
     */
    function showProblemContent() {
        document.getElementById('no-problem-selected').style.display = 'none';
        document.getElementById('problem-header').style.display = 'block';
        document.getElementById('problem-content').style.display = 'block';
    }

    /**
     * Set the current problem
     */
    function setProblem(problem, problemId) {
        currentProblem = problem;
        proofSteps = [];
        editingStepIndex = -1;
        
        // Update problem display
        updateProblemDisplay(problem, problemId);
        
        // Handle hints
        setupHints(problem);
        
        // Reset UI state
        resetUIState();
    }

    /**
     * Update problem display elements
     */
    function updateProblemDisplay(problem, problemId) {
        const elements = {
            'current-problem-title': problem.name,
            'current-problem-id': problemId,
            'current-problem-theory': getTheoryDisplayName(problem.theory),
            'problem-description': problem.description,
            'problem-lhs': problem.LHS,
            'problem-rhs': problem.RHS,
            'starting-expression': problem.LHS
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    /**
     * Get theory display name
     */
    function getTheoryDisplayName(theoryName) {
        const theoryInfo = problemsData.theories[theoryName];
        return theoryInfo ? theoryInfo.name : theoryName;
    }

    /**
     * Setup hints display
     */
    function setupHints(problem) {
        const hintsSection = document.getElementById('hints-section');
        if (!hintsSection) return;

        if (problem.hints && problem.hints.length > 0) {
            const hintsContent = document.getElementById('hints-content');
            if (hintsContent) {
                hintsContent.innerHTML = '';
                problem.hints.forEach((hint, index) => {
                    const hintDiv = document.createElement('div');
                    hintDiv.className = 'hint-item';
                    hintDiv.innerHTML = `
                        <span class="hint-number">${index + 1}.</span>
                        ${escapeHTML(hint)}
                    `;
                    hintsContent.appendChild(hintDiv);
                });
            }
            hintsSection.style.display = 'block';
        } else {
            hintsSection.style.display = 'none';
        }
    }

    /**
     * Reset UI state
     */
    function resetUIState() {
        // Hide completion message
        const completeDiv = document.getElementById('proof-complete');
        if (completeDiv) completeDiv.style.display = 'none';

        // Show input area
        const currentInput = document.getElementById('current-input');
        if (currentInput) currentInput.style.display = 'block';

        // Clear proof steps
        const stepsContainer = document.getElementById('proof-steps');
        if (stepsContainer) stepsContainer.innerHTML = '';

        // Clear inputs
        clearInputs();
        updateInputCardForMode();
        clearMessages();
    }

    /**
     * Clear input fields
     */
    function clearInputs() {
        const formulaInput = document.getElementById('formula-input');
        const ruleSelect = document.getElementById('rule-select');
        if (formulaInput) formulaInput.value = '';
        if (ruleSelect) ruleSelect.selectedIndex = 0;
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Main buttons
        setupButton('check-step', handleCheckStep);
        setupButton('restart', handleRestart);
        setupButton('cancel-edit', handleCancelEdit);

        // Export buttons
        document.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', handleExport);
        });

        // Keyboard shortcuts
        const formulaInput = document.getElementById('formula-input');
        if (formulaInput) {
            formulaInput.addEventListener('keydown', handleKeyboardShortcuts);
        }

        // Modal handlers
        setupModalHandlers();
    }

    /**
     * Setup a button with event listener
     */
    function setupButton(id, handler) {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', handler);
        }
    }

    /**
     * Setup modal event handlers
     */
    function setupModalHandlers() {
        const modal = document.getElementById('export-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeExportModal();
            });
        }

        document.querySelectorAll('[data-bs-dismiss="modal"]').forEach(btn => {
            btn.addEventListener('click', closeExportModal);
        });
    }

    /**
     * Setup symbol insertion buttons
     */
    function setupSymbolButtons() {
        const symbolContainer = document.getElementById('symbol-buttons');
        if (!symbolContainer || !currentTheory) return;

        symbolContainer.innerHTML = '';
        
        currentTheory.symbols.forEach((symbol, index) => {
            const button = document.createElement('button');
            button.className = 'btn symbol-btn';
            button.textContent = symbol.display;
            button.title = `${symbol.name} (${index})`;
            button.addEventListener('mousedown', (e) => e.preventDefault());
            button.addEventListener('click', () => insertSymbol(symbol.text));
            symbolContainer.appendChild(button);
        });
    }

    /**
     * Populate the rule selection dropdown
     */
    function populateRuleSelect() {
        const ruleSelect = document.getElementById('rule-select');
        if (!ruleSelect || !currentTheory) return;

        ruleSelect.innerHTML = '<option value="">Select a rule...</option>';
        
        // Group rules by level
        const rulesByLevel = {};
        currentTheory.rules.forEach(rule => {
            if (!rulesByLevel[rule.level]) {
                rulesByLevel[rule.level] = [];
            }
            rulesByLevel[rule.level].push(rule);
        });

        const levelNames = {
            0: 'Basic Laws',
            1: 'Definitions',
            2: 'Advanced Laws'
        };

        Object.keys(rulesByLevel).sort().forEach((level, index) => {
            if (index > 0) {
                addRuleSelectSeparator(ruleSelect);
            }

            addRuleSelectHeader(ruleSelect, levelNames[level] || `Level ${level}`);
            
            rulesByLevel[level].forEach(rule => {
                addRuleSelectOption(ruleSelect, rule);
            });
        });
    }

    /**
     * Add separator to rule select
     */
    function addRuleSelectSeparator(select) {
        const separator = document.createElement('option');
        separator.disabled = true;
        separator.textContent = '─────────────────────';
        select.appendChild(separator);
    }

    /**
     * Add header to rule select
     */
    function addRuleSelectHeader(select, title) {
        const header = document.createElement('option');
        header.disabled = true;
        header.textContent = title;
        header.className = 'rule-level-header';
        select.appendChild(header);
    }

    /**
     * Add rule option to select
     */
    function addRuleSelectOption(select, rule) {
        const option = document.createElement('option');
        option.value = rule.name;
        option.textContent = `  ${rule.text}: ${rule.LHS} = ${rule.RHS}`;
        option.className = 'rule-option';
        select.appendChild(option);
    }

    /**
     * Handle keyboard shortcuts
     */
    function handleKeyboardShortcuts(event) {
        // Number keys 0-9 for symbol shortcuts
        if (event.keyCode >= 48 && event.keyCode <= 57 && 
            !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
            
            const symbolIndex = event.keyCode - 48;
            if (currentTheory && symbolIndex < currentTheory.symbols.length) {
                insertSymbol(currentTheory.symbols[symbolIndex].text);
                event.preventDefault();
            }
        }
        
        // Enter key to check step
        if (event.keyCode === 13) {
            handleCheckStep();
            event.preventDefault();
        }

        // Escape key to cancel edit
        if (event.keyCode === 27 && editingStepIndex !== -1) {
            handleCancelEdit();
            event.preventDefault();
        }
    }

    /**
     * Insert symbol into formula input
     */
    function insertSymbol(symbolText) {
        const input = document.getElementById('formula-input');
        if (!input) return;

        const start = input.selectionStart;
        const end = input.selectionEnd;
        const value = input.value;
        
        input.value = value.substring(0, start) + symbolText + value.substring(end);
        input.focus();
        input.selectionStart = input.selectionEnd = start + symbolText.length;
    }

    /**
     * Handle check step button click
     */
    function handleCheckStep() {
        const formulaInput = document.getElementById('formula-input');
        const ruleSelect = document.getElementById('rule-select');
        
        if (!formulaInput || !ruleSelect) {
            showError('UI elements not found');
            return;
        }

        const formula = formulaInput.value.trim();
        const ruleName = ruleSelect.value;

        clearMessages();

        if (!formula) {
            showError('Please enter an expression');
            formulaInput.focus();
            return;
        }

        if (!ruleName) {
            showError('Please select a rule');
            ruleSelect.focus();
            return;
        }

        const prevExpression = getPreviousExpression();
        if (!prevExpression) {
            showError('No previous expression found');
            return;
        }

        if (editingStepIndex !== -1) {
            handleEditStep(prevExpression, formula, ruleName);
        } else {
            handleNewStep(prevExpression, formula, ruleName);
        }
    }

    /**
     * Handle editing an existing step
     */
    function handleEditStep(prevExpression, formula, ruleName) {
        const result = validateStep(prevExpression, formula, ruleName);
        
        if (result.success) {
            // Update the step
            proofSteps[editingStepIndex] = {
                expression: formula,
                rule: result.rule || { name: ruleName },
                timestamp: new Date()
            };

            // Remove steps after the edited one
            if (editingStepIndex < proofSteps.length - 1) {
                proofSteps = proofSteps.slice(0, editingStepIndex + 1);
                showSuccess('Step updated. Later steps have been removed.');
            } else {
                showSuccess('Step updated successfully.');
            }

            rebuildProofDisplay();
            exitEditMode();
            checkProofCompletion();
        } else {
            showError(result.error || 'Validation failed');
        }
    }

    /**
     * Handle adding a new step
     */
    function handleNewStep(prevExpression, formula, ruleName) {
        const result = validateStep(prevExpression, formula, ruleName);
        
        if (result.success) {
            const step = {
                expression: formula,
                rule: result.rule || { name: ruleName },
                timestamp: new Date()
            };
            
            proofSteps.push(step);
            addProofStepToDisplay(step, proofSteps.length - 1);
            
            clearInputs();
            showSuccess('Step validated successfully.');
            checkProofCompletion();
        } else {
            showError(result.error || 'Validation failed');
        }
    }

    /**
     * Validate a proof step
     */
    function validateStep(fromExpr, toExpr, ruleName) {
        const [fromAST, fromError] = window.ProofAssistant.Parser.parse(fromExpr);
        if (fromError) {
            return { success: false, error: `Error parsing previous expression: ${fromError}` };
        }

        const [toAST, toError] = window.ProofAssistant.Parser.parse(toExpr);
        if (toError) {
            return { success: false, error: `Error parsing expression: ${toError}` };
        }

        if (!currentTheory || !currentTheory.validateStep) {
            return { success: false, error: 'No theory loaded or validation function missing' };
        }

        return currentTheory.validateStep(fromAST, toAST, ruleName);
    }

    /**
     * Get the previous expression in the proof
     */
    function getPreviousExpression() {
        if (editingStepIndex !== -1) {
            if (editingStepIndex === 0) {
                return currentProblem ? currentProblem.LHS : null;
            } else {
                return proofSteps[editingStepIndex - 1].expression;
            }
        } else {
            if (proofSteps.length === 0) {
                return currentProblem ? currentProblem.LHS : null;
            }
            return proofSteps[proofSteps.length - 1].expression;
        }
    }

    /**
     * Check if proof is complete
     */
    function checkProofCompletion() {
        if (currentProblem && proofSteps.length > 0 && 
            proofSteps[proofSteps.length - 1].expression === currentProblem.RHS) {
            handleProofComplete();
        }
    }

    /**
     * Handle proof completion
     */
    function handleProofComplete() {
        const completeDiv = document.getElementById('proof-complete');
        if (completeDiv) {
            completeDiv.style.display = 'block';
        }

        const currentInput = document.getElementById('current-input');
        if (currentInput) {
            currentInput.style.display = 'none';
        }

        showSuccess('Proof successfully completed and validated!');
    }

    /**
     * Add a proof step to the display
     */
    function addProofStepToDisplay(step, stepIndex) {
        const stepsContainer = document.getElementById('proof-steps');
        if (!stepsContainer) return;

        const ruleDisplayName = getRuleDisplayName(step.rule);

        const stepRow = document.createElement('tr');
        stepRow.className = 'proof-step-row';
        stepRow.innerHTML = `
            <td class="step-expression">= ${escapeHTML(step.expression)}</td>
            <td class="step-rule">
                ${escapeHTML(ruleDisplayName)}
                <button class="btn btn-sm edit-step-btn ms-2" 
                        onclick="editStep(${stepIndex})" 
                        title="Edit this step">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm delete-step-btn ms-1" 
                        onclick="deleteStep(${stepIndex})" 
                        title="Delete this step">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        stepsContainer.appendChild(stepRow);
    }

    /**
     * Rebuild the entire proof display
     */
    function rebuildProofDisplay() {
        const stepsContainer = document.getElementById('proof-steps');
        if (!stepsContainer) return;

        stepsContainer.innerHTML = '';
        proofSteps.forEach((step, index) => {
            addProofStepToDisplay(step, index);
        });
    }

    /**
     * Enter edit mode for a specific step
     */
    function enterEditMode(stepIndex) {
        editingStepIndex = stepIndex;
        
        const step = proofSteps[stepIndex];
        document.getElementById('formula-input').value = step.expression;
        
        const ruleSelect = document.getElementById('rule-select');
        const ruleName = step.rule.name || step.rule;
        selectRuleByName(ruleSelect, ruleName);

        updateInputCardForMode();
        document.getElementById('formula-input').focus();
        showSuccess(`Editing step ${stepIndex + 1}. Press Escape to cancel.`);
    }

    /**
     * Select rule by name in dropdown
     */
    function selectRuleByName(ruleSelect, ruleName) {
        for (let i = 0; i < ruleSelect.options.length; i++) {
            if (ruleSelect.options[i].value === ruleName) {
                ruleSelect.selectedIndex = i;
                break;
            }
        }
    }

    /**
     * Exit edit mode
     */
    function exitEditMode() {
        editingStepIndex = -1;
        clearInputs();
        updateInputCardForMode();
    }

    /**
     * Update input card based on current mode
     */
    function updateInputCardForMode() {
        const checkBtn = document.getElementById('check-step');
        const cancelBtn = document.getElementById('cancel-edit');

        if (editingStepIndex !== -1) {
            if (checkBtn) {
                checkBtn.innerHTML = '<i class="fas fa-save"></i> Update Step';
                checkBtn.className = 'btn btn-success';
            }
            if (cancelBtn) cancelBtn.style.display = 'inline-block';
        } else {
            if (checkBtn) {
                checkBtn.innerHTML = '<i class="fas fa-check"></i> Validate Step';
                checkBtn.className = 'btn btn-primary';
            }
            if (cancelBtn) cancelBtn.style.display = 'none';
        }
    }

    /**
     * Delete a proof step
     */
    function deleteStep(stepIndex) {
        if (!confirm(`Are you sure you want to delete step ${stepIndex + 1}? All steps after it will also be deleted.`)) {
            return;
        }

        proofSteps = proofSteps.slice(0, stepIndex);
        rebuildProofDisplay();
        
        const completeDiv = document.getElementById('proof-complete');
        if (completeDiv) {
            completeDiv.style.display = 'none';
        }

        const currentInput = document.getElementById('current-input');
        if (currentInput) {
            currentInput.style.display = 'block';
        }

        showSuccess(`Step ${stepIndex + 1} and subsequent steps deleted.`);
    }

    /**
     * Handle cancel edit
     */
    function handleCancelEdit() {
        exitEditMode();
        showSuccess('Edit cancelled');
    }

    /**
     * Handle restart button click
     */
    function handleRestart() {
        if (!confirm('Are you sure you want to restart the proof? All progress will be lost.')) {
            return;
        }

        proofSteps = [];
        editingStepIndex = -1;
        resetUIState();
        showSuccess('Proof restarted');
    }

    /**
     * Handle export button clicks
     */
    function handleExport(event) {
        const format = event.target.dataset.format;
        if (!format) {
            showError('No export format specified');
            return;
        }

        if (!currentProblem) {
            showError('No problem loaded to export');
            return;
        }

        if (proofSteps.length === 0) {
            showError('No proof steps to export');
            return;
        }

        try {
            const proofContent = generateProofContent();
            const formatted = window.ProofAssistant.Formatter.formatProof(format, proofContent);
            
            if (!formatted || formatted.startsWith('Format not supported')) {
                showError(`Export format "${format}" is not supported`);
                return;
            }
            
            showExportModal(format, formatted);
            
        } catch (error) {
            console.error('Export error:', error);
            showError(`Failed to export as ${format}: ${error.message}`);
        }
    }

    /**
     * Generate proof content for export
     */
    function generateProofContent() {
        if (!currentProblem) return null;

        return {
            title: currentProblem.name || 'Proof',
            description: currentProblem.description || '',
            LHS: currentProblem.LHS,
            RHS: currentProblem.RHS,
            expressions: proofSteps.map(step => step.expression),
            rules: proofSteps.map(step => step.rule.name || step.rule),
            theory: currentTheory ? currentTheory.info.displayName : 'Unknown'
        };
    }

    /**
     * Show export modal with formatted content
     */
    function showExportModal(format, content) {
        const modal = document.getElementById('export-modal');
        if (!modal) {
            copyToClipboard(content, format);
            return;
        }

        const modalTitle = modal.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.textContent = `Export Proof - ${format.toUpperCase()}`;
        }

        const contentArea = modal.querySelector('.export-content');
        if (contentArea) {
            contentArea.textContent = content;
        }

        if (window.bootstrap && window.bootstrap.Modal) {
            const bsModal = new window.bootstrap.Modal(modal);
            bsModal.show();
        } else {
            modal.style.display = 'block';
            modal.classList.add('show');
        }
    }

    /**
     * Close export modal
     */
    function closeExportModal() {
        const modal = document.getElementById('export-modal');
        if (!modal) return;

        if (window.bootstrap && window.bootstrap.Modal) {
            const bsModal = window.bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        } else {
            modal.style.display = 'none';
            modal.classList.remove('show');
        }
    }

    /**
     * Copy content to clipboard
     */
    function copyToClipboard(content, format) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(content).then(() => {
                showSuccess(`${format.toUpperCase()} content copied to clipboard.`);
            }).catch(() => {
                showFallbackCopy(content, format);
            });
        } else {
            showFallbackCopy(content, format);
        }
    }

    /**
     * Show fallback copy dialog
     */
    function showFallbackCopy(content, format) {
        const textarea = document.createElement('textarea');
        textarea.value = content;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            showSuccess(`${format.toUpperCase()} content copied to clipboard.`);
        } catch (error) {
            alert(`Copy the ${format.toUpperCase()} content:\n\n${content}`);
        }
        
        document.body.removeChild(textarea);
    }

    /**
     * Get the display name for a rule
     */
    function getRuleDisplayName(rule) {
        if (typeof rule === 'object' && rule.text) {
            return rule.text;
        }
        
        if (typeof rule === 'string') {
            if (currentTheory && currentTheory.rules) {
                const ruleDefinition = currentTheory.rules.find(r => r.name === rule);
                if (ruleDefinition && ruleDefinition.text) {
                    return ruleDefinition.text;
                }
            }
            return rule;
        }
        
        return String(rule);
    }

    /**
     * Show error message
     */
    function showError(message) {
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
        console.error('UI Error:', message);
    }

    /**
     * Show success message
     */
    function showSuccess(message) {
        const messageDiv = document.getElementById('success-message');
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.style.display = 'block';
            
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
        }
    }

    /**
     * Clear all messages
     */
    function clearMessages() {
        const errorDiv = document.getElementById('error-message');
        const successDiv = document.getElementById('success-message');
        
        if (errorDiv) errorDiv.style.display = 'none';
        if (successDiv) successDiv.style.display = 'none';
    }

    /**
     * Escape HTML for safe display
     */
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Make selectProblem globally available
    window.selectProblem = selectProblem;

    // Global functions for step editing (called from HTML)
    window.editStep = enterEditMode;
    window.deleteStep = deleteStep;

    // Public API
    return {
        init: init,
        selectProblem: selectProblem,
        insertSymbol: insertSymbol,
        showError: showError,
        showSuccess: showSuccess,
        clearMessages: clearMessages,
        copyToClipboard: copyToClipboard,
        closeExportModal: closeExportModal,
        getRuleDisplayName: getRuleDisplayName,
        enterEditMode: enterEditMode,
        deleteStep: deleteStep
    };
})();