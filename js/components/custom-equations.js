/**
 * Custom Equations
 *
 * Playground for creating and testing custom equations
 */

window.ProofAssistant = window.ProofAssistant || {};
window.ProofAssistant.Components = window.ProofAssistant.Components || {};

window.ProofAssistant.Components.CustomEquations = (function() {
    'use strict';

    let container = null;
    let currentTheory = null;
    let currentEquation = null;
    let proofInterface = null;
    let callbacks = {};

    /**
     * Initialize the custom equations component
     */
    function init(containerElement, options = {}) {
        container = typeof containerElement === 'string' 
            ? document.querySelector(containerElement) 
            : containerElement;
        
        if (!container) {
            console.error('CustomEquations container not found');
            return false;
        }

        callbacks = {
            onError: options.onError || showError,
            onSuccess: options.onSuccess || showSuccess,
            onEquationCreated: options.onEquationCreated || (() => {}),
            onProofComplete: options.onProofComplete || (() => {})
        };

        setupEquationsStructure();
        setupEventListeners();
        
        return true;
    }

    /**
     * Setup the custom equations HTML structure
     */
    function setupEquationsStructure() {
        container.innerHTML = `
            <!-- Messages -->
            <div id="error-message" class="alert alert-danger" style="display: none;"></div>
            <div id="success-message" class="alert alert-success" style="display: none;"></div>

            <!-- Theory Selection -->
            <div class="equation-workspace">
                <h5 class="text-sans mb-3">Select Theory</h5>
                <div class="theory-selector">
                    <select id="theory-select" class="form-select">
                        <option value="">Choose a theory...</option>
                        <option value="set_theory">Set Theory</option>
                        <option value="bool_alg">Boolean Algebra</option>
                        <option value="prop_logic">Propositional Logic</option>
                    </select>
                </div>
            </div>

            <!-- Custom Equation Setup -->
            <div id="equation-setup" class="equation-workspace" style="display: none;">
                <h5 class="text-sans mb-3">Define Your Equation</h5>
                
                <!-- Symbol buttons -->
                <div class="mb-3">
                    <label class="form-label">Symbols:</label>
                    <div id="symbol-buttons"></div>
                    <div class="keyboard-hint">
                        <i class="fas fa-keyboard"></i>
                        Use keyboard shortcuts 1-9 to quickly insert symbols
                    </div>
                </div>

                <!-- LHS and RHS inputs -->
                <div class="row">
                    <div class="col-md-5">
                        <label for="lhs-input" class="form-label">Left Hand Side (LHS):</label>
                        <input type="text" 
                               id="lhs-input" 
                               class="form-control text-mono" 
                               placeholder="Enter left side of equation..."
                               autocomplete="off">
                    </div>
                    <div class="col-md-2 text-center d-flex align-items-end">
                        <div class="w-100">
                            <div class="form-label">&nbsp;</div>
                            <div class="h4 mb-3">=</div>
                        </div>
                    </div>
                    <div class="col-md-5">
                        <label for="rhs-input" class="form-label">Right Hand Side (RHS):</label>
                        <input type="text" 
                               id="rhs-input" 
                               class="form-control text-mono" 
                               placeholder="Enter right side of equation..."
                               autocomplete="off">
                    </div>
                </div>

                <div class="mt-3">
                    <button id="setup-equation" class="btn btn-success">
                        <i class="fas fa-play"></i> Start Proof
                    </button>
                    <button id="clear-equation" class="btn btn-outline-secondary">
                        <i class="fas fa-trash"></i> Clear
                    </button>
                    <button id="validate-equation" class="btn btn-outline-primary">
                        <i class="fas fa-check"></i> Validate Syntax
                    </button>
                </div>

                <!-- Preview of equation -->
                <div id="equation-preview" class="mt-3" style="display: none;">
                    <h6 class="text-sans mb-2">Equation Preview:</h6>
                    <div class="goal-formula">
                        <span id="preview-lhs" class="text-mono"></span>
                        <span class="mx-3">=</span>
                        <span id="preview-rhs" class="text-mono"></span>
                    </div>
                </div>
            </div>

            <!-- Proof Interface -->
            <div id="proof-interface" style="display: none;">
                <div class="problem-statement">
                    <div class="problem-description" id="proof-description">
                        <strong>Custom Equation Proof</strong><br>
                        <span id="dynamic-description">Prove the following equation</span>
                    </div>
                    <div class="text-center">
                        <div class="goal-formula">
                            <span id="proof-lhs" class="text-mono"></span>
                            <span class="mx-3">=</span>
                            <span id="proof-rhs" class="text-mono"></span>
                        </div>
                    </div>
                    <div class="mt-3">
                        <button id="reset-proof" class="btn btn-outline-warning">
                            <i class="fas fa-arrow-left"></i> Change Equation
                        </button>
                        <button id="save-equation" class="btn btn-outline-info">
                            <i class="fas fa-save"></i> Save Equation
                        </button>
                    </div>
                </div>

                <div id="custom-proof-container"></div>
            </div>
        `;
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        const theorySelect = container.querySelector('#theory-select');
        if (theorySelect) {
            theorySelect.addEventListener('change', handleTheoryChange);
        }

        const setupBtn = container.querySelector('#setup-equation');
        const clearBtn = container.querySelector('#clear-equation');
        const validateBtn = container.querySelector('#validate-equation');
        const resetBtn = container.querySelector('#reset-proof');
        const saveBtn = container.querySelector('#save-equation');

        if (setupBtn) setupBtn.addEventListener('click', handleSetupEquation);
        if (clearBtn) clearBtn.addEventListener('click', handleClearEquation);
        if (validateBtn) validateBtn.addEventListener('click', handleValidateEquation);
        if (resetBtn) resetBtn.addEventListener('click', handleResetToEquationSetup);
        if (saveBtn) saveBtn.addEventListener('click', handleSaveEquation);

        const lhsInput = container.querySelector('#lhs-input');
        const rhsInput = container.querySelector('#rhs-input');
        if (lhsInput) lhsInput.addEventListener('input', updateEquationPreview);
        if (rhsInput) rhsInput.addEventListener('input', updateEquationPreview);

        setupKeyboardShortcuts();
    }

    /**
     * Setup keyboard shortcuts
     */
    function setupKeyboardShortcuts() {
        const inputs = ['lhs-input', 'rhs-input'];

        inputs.forEach(inputId => {
            const input = container.querySelector(`#${inputId}`);
            if (input) {
                input.addEventListener('keydown', handleKeyboardShortcuts);
            }
        });
    }

    /**
     * Handle keyboard shortcuts for symbol insertion
     */
    function handleKeyboardShortcuts(event) {
        let symbolIndex = -1;
        if (event.keyCode >= 49 && event.keyCode <= 57) { // Keys 1-9
            symbolIndex = event.keyCode - 49;
        } else if (event.keyCode === 48) { // Key 0
            symbolIndex = 9;
        }
        
        if (symbolIndex !== -1 && currentTheory && symbolIndex < currentTheory.symbols.length && 
            !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
            insertSymbol(currentTheory.symbols[symbolIndex].text, event.target);
            event.preventDefault();
        }
        
        if (event.keyCode === 13) {
            const inputId = event.target.id;
            if (inputId === 'lhs-input' || inputId === 'rhs-input') {
                handleSetupEquation();
            }
            event.preventDefault();
        }
    }

    /**
     * Handle theory selection change
     */
    function handleTheoryChange() {
        const theorySelect = container.querySelector('#theory-select');
        const theoryName = theorySelect.value;
        const equationSetup = container.querySelector('#equation-setup');

        if (!theoryName) {
            if (equationSetup) equationSetup.style.display = 'none';
            currentTheory = null;
            return;
        }

        if (loadTheory(theoryName)) {
            if (equationSetup) equationSetup.style.display = 'block';
            setupSymbolButtons();
            clearMessages();
            callbacks.onSuccess(`Loaded ${currentTheory.info.displayName} theory.`);
        }
    }

    /**
     * Load theory 
     */
    function loadTheory(theoryName) {
        try {
            // Validate theory name
            if (!theoryName || typeof theoryName !== 'string') {
                throw new Error('Invalid theory name');
            }
            
            const theories = {
                'set_theory': window.ProofAssistant.Theories.SetTheory,
                'bool_alg': window.ProofAssistant.Theories.BooleanAlgebra,
                'prop_logic': window.ProofAssistant.Theories.PropositionalLogic
            };

            const theory = theories[theoryName];
            if (!theory) {
                throw new Error(`Theory '${theoryName}' not available`);
            }

            // Validate theory structure - each theory should have its own parser
            if (!theory.symbols || !theory.equality || !theory.parser) {
                throw new Error(`Theory '${theoryName}' has invalid structure`);
            }

            // Store the theory (it already has its own isolated parser)
            state.theory = theory;
            
            return true;
            
        } catch (error) {
            console.error('UI: Theory loading failed:', error);
            showMessage(`Failed to load theory: ${error.message}`, 'error');
            return false;
        }
    }

    /**
     * Setup symbol insertion buttons
     */
    function setupSymbolButtons() {
        const symbolContainer = container.querySelector('#symbol-buttons');
        if (!symbolContainer || !currentTheory) return;

        symbolContainer.innerHTML = '';
        
        currentTheory.symbols.forEach((symbol, index) => {
            const button = document.createElement('button');
            button.className = 'btn symbol-btn';
            
            // Show shortcut number above symbol
            const shortcutKey = index < 9 ? (index + 1).toString() : '0';
            button.innerHTML = `<small class="d-block" style="font-size: 0.7rem; line-height: 1;">${shortcutKey}</small>${symbol.display}`;
            button.title = `${symbol.name} (${shortcutKey})`;
            
            button.addEventListener('mousedown', (e) => e.preventDefault());
            button.addEventListener('click', () => {
                const activeInput = document.activeElement;
                if (activeInput && activeInput.tagName === 'INPUT') {
                    insertSymbol(symbol.text, activeInput);
                } else {
                    const lhsInput = container.querySelector('#lhs-input');
                    if (lhsInput) {
                        insertSymbol(symbol.text, lhsInput);
                        lhsInput.focus();
                    }
                }
            });
            symbolContainer.appendChild(button);
        });
    }

    /**
     * Insert symbol into an input field
     */
    function insertSymbol(symbolText, inputElement) {
        if (!inputElement) return;

        const start = inputElement.selectionStart;
        const end = inputElement.selectionEnd;
        const value = inputElement.value;
        
        inputElement.value = value.substring(0, start) + symbolText + value.substring(end);
        inputElement.focus();
        inputElement.selectionStart = inputElement.selectionEnd = start + symbolText.length;

        if (inputElement.id === 'lhs-input' || inputElement.id === 'rhs-input') {
            updateEquationPreview();
        }
    }

    /**
     * Update equation preview
     */
    function updateEquationPreview() {
        const lhsInput = container.querySelector('#lhs-input');
        const rhsInput = container.querySelector('#rhs-input');
        const previewDiv = container.querySelector('#equation-preview');
        const previewLhs = container.querySelector('#preview-lhs');
        const previewRhs = container.querySelector('#preview-rhs');

        if (!lhsInput || !rhsInput || !previewDiv || !previewLhs || !previewRhs) return;

        const lhs = lhsInput.value.trim();
        const rhs = rhsInput.value.trim();

        if (lhs && rhs) {
            previewLhs.textContent = addDisplaySpaces(lhs);
            previewRhs.textContent = addDisplaySpaces(rhs);
            previewDiv.style.display = 'block';
        } else {
            previewDiv.style.display = 'none';
        }
    }

    /**
     * Handle validate equation button click
     */
    function handleValidateEquation() {
        const lhsInput = container.querySelector('#lhs-input');
        const rhsInput = container.querySelector('#rhs-input');

        if (!lhsInput || !rhsInput) return;

        const lhs = lhsInput.value.trim();
        const rhs = rhsInput.value.trim();

        if (!lhs || !rhs) {
            callbacks.onError('Please enter both left and right hand sides of the equation.');
            return;
        }

        if (!currentTheory) {
            callbacks.onError('Please select a theory first.');
            return;
        }

        clearMessages();

        const [lhsAST, lhsError] = state.theory.Parser.parse(removeSpaces(lhs));
        if (lhsError) {
            callbacks.onError(`Error parsing LHS: ${lhsError}`);
            lhsInput.focus();
            return;
        }

        const [rhsAST, rhsError] = state.theory.parser.parse(removeSpaces(rhs));
        if (rhsError) {
            callbacks.onError(`Error parsing RHS: ${rhsError}`);
            rhsInput.focus();
            return;
        }

        callbacks.onSuccess('Both sides of the equation are syntactically valid!');
    }

    /**
     * Handle setup equation button click
     */
    function handleSetupEquation() {
        const lhsInput = container.querySelector('#lhs-input');
        const rhsInput = container.querySelector('#rhs-input');

        if (!lhsInput || !rhsInput) return;

        const lhs = lhsInput.value.trim();
        const rhs = rhsInput.value.trim();

        if (!lhs || !rhs) {
            callbacks.onError('Please enter both left and right hand sides of the equation.');
            return;
        }

        if (!currentTheory) {
            callbacks.onError('Please select a theory first.');
            return;
        }

        clearMessages();

        const [lhsAST, lhsError] = state.theory.parser.parse(removeSpaces(lhs));
        if (lhsError) {
            callbacks.onError(`Error parsing LHS: ${lhsError}`);
            lhsInput.focus();
            return;
        }

        const [rhsAST, rhsError] = state.theory.parser.parse(removeSpaces(rhs));
        if (rhsError) {
            callbacks.onError(`Error parsing RHS: ${rhsError}`);
            rhsInput.focus();
            return;
        }

        // Create simple equation with description
        currentEquation = {
            name: 'Custom Equation',
            description: `Prove that ${addDisplaySpaces(lhs)} = ${addDisplaySpaces(rhs)}`,
            LHS: removeSpaces(lhs),
            RHS: removeSpaces(rhs),
            lhsAST: lhsAST,
            rhsAST: rhsAST,
            theory: currentTheory.info.name
        };

        showProofInterface();
        callbacks.onSuccess('Equation set up successfully!');
        callbacks.onEquationCreated(currentEquation);
    }

    /**
     * Show the proof interface
     */
    function showProofInterface() {
        const equationSetup = container.querySelector('#equation-setup');
        const proofInterface = container.querySelector('#proof-interface');
        const dynamicDescription = container.querySelector('#dynamic-description');
        const proofLhs = container.querySelector('#proof-lhs');
        const proofRhs = container.querySelector('#proof-rhs');

        if (equationSetup) equationSetup.style.display = 'none';
        if (proofInterface) proofInterface.style.display = 'block';
        
        if (dynamicDescription && currentEquation) {
            dynamicDescription.textContent = currentEquation.description;
        }

        if (proofLhs && currentEquation) {
            proofLhs.textContent = addDisplaySpaces(currentEquation.LHS);
        }

        if (proofRhs && currentEquation) {
            proofRhs.textContent = addDisplaySpaces(currentEquation.RHS);
        }

        initializeProofInterface();
    }

    /**
     * Initialize the proof interface component
     */
    function initializeProofInterface() {
        const proofContainer = container.querySelector('#custom-proof-container');
        if (!proofContainer) return;

        proofInterface = window.ProofAssistant.Components.ProofInterface;
        const success = proofInterface.init(proofContainer, {
            onStepValidated: () => {},
            onProofComplete: handleProofComplete,
            onError: callbacks.onError,
            onSuccess: callbacks.onSuccess,
            onExport: handleExport
        });

        if (success && currentEquation && currentTheory) {
            proofInterface.loadProblem(currentEquation, currentTheory);
        }
    }

    /**
     * Handle proof completion
     */
    function handleProofComplete(steps) {
        callbacks.onProofComplete(currentEquation, steps);
    }

    /**
     * Handle export - uses proper formatting like index.html
     */
    function handleExport(format, content) {
        try {
            const formatted = window.ProofAssistant.Formatter.formatProof(format, content, state.theory.parser);
            
            if (!formatted || formatted.startsWith('Format not supported')) {
                callbacks.onError(`Export format "${format}" is not supported`);
                return;
            }
            
            showExportModal(format, formatted);
            
        } catch (error) {
            callbacks.onError(`Failed to export as ${format}: ${error.message}`);
        }
    }

    /**
     * Show export modal - same as index.html
     */
    function showExportModal(format, content) {
        let modal = document.getElementById('export-modal');
        
        if (!modal) {
            console.warn('Export modal not found, copying to clipboard instead');
            copyToClipboard(content, format);
            return;
        }

        const modalTitle = modal.querySelector('.modal-title');
        const contentArea = modal.querySelector('.export-content');
        
        if (modalTitle) {
            modalTitle.textContent = `Export Proof - ${format.toUpperCase()}`;
        }
        
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
     * Copy content to clipboard as fallback
     */
    function copyToClipboard(content, format) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(content).then(() => {
                callbacks.onSuccess(`${format.toUpperCase()} content copied to clipboard.`);
            }).catch(() => {
                callbacks.onError(`Failed to copy ${format} content.`);
            });
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = content;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                document.execCommand('copy');
                callbacks.onSuccess(`${format.toUpperCase()} content copied to clipboard.`);
            } catch (error) {
                callbacks.onError(`Failed to copy ${format} content.`);
            }
            
            document.body.removeChild(textarea);
        }
    }

    /**
     * Handle clear equation button click
     */
    function handleClearEquation() {
        const lhsInput = container.querySelector('#lhs-input');
        const rhsInput = container.querySelector('#rhs-input');
        const previewDiv = container.querySelector('#equation-preview');

        if (lhsInput) lhsInput.value = '';
        if (rhsInput) rhsInput.value = '';
        if (previewDiv) previewDiv.style.display = 'none';

        clearMessages();
    }

    /**
     * Handle reset to equation setup
     */
    function handleResetToEquationSetup() {
        const equationSetup = container.querySelector('#equation-setup');
        const proofInterface = container.querySelector('#proof-interface');

        if (equationSetup) equationSetup.style.display = 'block';
        if (proofInterface) proofInterface.style.display = 'none';

        currentEquation = null;
        clearMessages();
    }

    /**
     * Handle save equation - simplified
     */
    function handleSaveEquation() {
        if (!currentEquation) {
            callbacks.onError('No equation to save');
            return;
        }

        const equationData = {
            theory: currentEquation.theory,
            LHS: currentEquation.LHS,
            RHS: currentEquation.RHS,
            description: currentEquation.description,
            timestamp: new Date().toISOString()
        };

        const jsonData = JSON.stringify(equationData, null, 2);
        
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `equation-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        callbacks.onSuccess('Equation saved successfully!');
    }

    // Helper functions
    function addDisplaySpaces(expression) {
        if (!expression || !currentTheory) return expression;
        
        const binaryOperators = currentTheory.symbols
            .filter(symbol => symbol.arity === 2)
            .map(symbol => symbol.text);
        
        if (binaryOperators.length === 0) return expression;
        
        let result = expression;
        binaryOperators.forEach(operator => {
            const escapedOp = operator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\s*${escapedOp}\\s*`, 'g');
            result = result.replace(regex, ` ${operator} `);
        });
        
        return result.replace(/\s+/g, ' ').trim();
    }

    function removeSpaces(str) {
        return str.replace(/\s/g, '');
    }

    // Message functions
    function showError(message) {
        const errorDiv = container.querySelector('#error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
        hideOtherMessages('error');
    }

    function showSuccess(message) {
        const messageDiv = container.querySelector('#success-message');
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.style.display = 'block';
            
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
        }
        hideOtherMessages('success');
    }

    function hideOtherMessages(except) {
        const messages = {
            'error': '#error-message',
            'success': '#success-message'
        };

        Object.keys(messages).forEach(type => {
            if (type !== except) {
                const div = container.querySelector(messages[type]);
                if (div) div.style.display = 'none';
            }
        });
    }

    function clearMessages() {
        const messageSelectors = ['#error-message', '#success-message'];
        
        messageSelectors.forEach(selector => {
            const div = container.querySelector(selector);
            if (div) div.style.display = 'none';
        });
    }

    // Public API
    return {
        init: init,
        loadTheory: loadTheory,
        getCurrentTheory: () => currentTheory,
        getCurrentEquation: () => currentEquation,
        insertSymbol: insertSymbol,
        showError: showError,
        showSuccess: showSuccess,
        clearMessages: clearMessages
    };
})();