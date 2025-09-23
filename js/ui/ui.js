/**
 * UI Module
 * 
 * Handles user interface components and interactions
 */

window.ProofAssistant = window.ProofAssistant || {};

window.ProofAssistant.UI = (function() {
    'use strict';

    let components = {};
    let state = {
        problem: null,
        theory: null,
        config: null,
        initialized: false
    };

    /**
     * Initialize UI system with proper error handling
     */
    function init(config) {
        try {
            
            
            state.config = config || getDefaultConfig();
            
            // Validate required modules are loaded
            if (!validateDependencies()) {
                throw new Error('Required modules not loaded');
            }

            setupLayout();
            initializeComponents();
            loadProblems();
            
            // Set initialized flag BEFORE checking route
            state.initialized = true;
            
            checkInitialRoute();
            
            
            return true;
            
        } catch (error) {
            console.error('UI: Initialization failed:', error);
            showMessage('System initialization failed: ' + error.message, 'error');
            return false;
        }
    }

    /**
     * Validate all required dependencies are loaded
     */
    function validateDependencies() {
        const required = [
            'window.problemsData',
            'window.ProofAssistant.Components.ProofInterface'
        ];
        
        for (const dep of required) {
            const obj = dep.split('.').reduce((o, prop) => o && o[prop], window);
            if (!obj) {
                console.error('Missing required dependency:', dep);
                return false;
            }
        }
        
        
        return true;
    }

    /**
     * Setup layout based on configuration
     */
    function setupLayout() {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (state.config.ui.showSidebar && sidebar) {
            sidebar.style.display = 'block';
            if (mainContent) mainContent.style.flex = '1';
        } else if (sidebar) {
            sidebar.style.display = 'none';
            if (mainContent) {
                mainContent.style.flex = '1';
                mainContent.style.maxWidth = '100%';
            }
        }
        
        
    }

    /**
     * Initialize components with error handling
     */
    function initializeComponents() {
        try {
            // Proof interface - always required
            components.proofInterface = window.ProofAssistant.Components.ProofInterface;
            
            const proofContainer = document.querySelector('#proof-interface-container');
            if (!proofContainer) {
                throw new Error('Proof interface container not found');
            }
            
            const proofSuccess = components.proofInterface.init(proofContainer, {
                onStepValidated: () => {},
                onProofComplete: handleProofComplete,
                onError: msg => showMessage(msg, 'error'),
                onSuccess: msg => showMessage(msg, 'success'),
                onExport: handleExport
            });
            
            if (!proofSuccess) {
                throw new Error('Failed to initialize proof interface');
            }

            // Sidebar - conditional
            if (state.config.ui.showSidebar) {
                const sidebarEl = document.querySelector('.sidebar');
                if (sidebarEl) {
                    components.sidebar = window.ProofAssistant.Components.Sidebar;
                    const sidebarSuccess = components.sidebar.init(sidebarEl, {
                        onProblemSelect: handleProblemSelect
                    });
                    
                    if (!sidebarSuccess) {
                        console.warn('Sidebar initialization failed - continuing without sidebar');
                        state.config.ui.showSidebar = false;
                    }
                }

                // URL Router
                if (window.ProofAssistant.Components.URLRouter) {
                    components.urlRouter = window.ProofAssistant.Components.URLRouter;
                    components.urlRouter.init({
                        onProblemRouted: handleProblemRoute
                    });
                }
            }
            
            
            
        } catch (error) {
            console.error('UI: Component initialization failed:', error);
            throw error;
        }
    }

    /**
     * Load problems data with error handling
     */
    function loadProblems() {
        if (!window.problemsData) {
            throw new Error('Problems data not available');
        }

        if (!window.problemsData.problems || !Array.isArray(window.problemsData.problems)) {
            throw new Error('Invalid problems data structure');
        }

        if (components.sidebar) {
            try {
                components.sidebar.loadProblems(window.problemsData);
                
            } catch (error) {
                console.error('UI: Failed to load problems into sidebar:', error);
                // Continue without sidebar
                state.config.ui.showSidebar = false;
            }
        }
    }

    /**
     * Check initial route with timeout protection
     */
    function checkInitialRoute() {
        // Add timeout to prevent infinite waiting
        const routeTimeout = setTimeout(() => {
            console.warn('UI: Route check timeout - continuing with default state');
            showDefaultState();
        }, 2000);

        try {
            if (components.urlRouter) {
                const problemId = components.urlRouter.getCurrentProblemId();
                if (problemId) {
                    clearTimeout(routeTimeout);
                    handleProblemRoute(problemId);
                    return;
                }
            } else {
                // Fallback URL parsing
                const urlParams = new URLSearchParams(window.location.search);
                const problemId = urlParams.get('problem');
                if (problemId) {
                    clearTimeout(routeTimeout);
                    loadProblemById(problemId);
                    return;
                }
            }
            
            // No problem in URL - show default state
            clearTimeout(routeTimeout);
            showDefaultState();
            
        } catch (error) {
            clearTimeout(routeTimeout);
            console.error('UI: Route check failed:', error);
            showDefaultState();
        }
    }

    /**
     * Show default state (no problem selected)
     */
    function showDefaultState() {
        const elements = {
            'no-problem-selected': 'block',
            'problem-header': 'none',
            'problem-content': 'none'
        };

        Object.entries(elements).forEach(([id, display]) => {
            const el = document.getElementById(id);
            if (el) el.style.display = display;
        });
        
        
    }

    /**
     * Handle problem selection with error handling
     */
    function handleProblemSelect(problem, problemId) {
        if (!state.initialized) {
            console.warn('UI: Ignoring problem select - not initialized');
            return;
        }
        
        try {
            if (loadTheory(problem.theory)) {
                setProblem(problem, problemId);
                
                if (components.urlRouter) {
                    components.urlRouter.updateURL(problemId);
                }
            }
        } catch (error) {
            console.error('UI: Problem selection failed:', error);
            showMessage('Failed to load problem: ' + error.message, 'error');
        }
    }

    /**
     * Handle problem route with error handling
     */
    function handleProblemRoute(problemId) {
        if (!state.initialized) {
            console.warn('UI: Ignoring route - not initialized');
            return;
        }
        
        try {
            if (components.sidebar) {
                components.sidebar.setActiveProblem(problemId);
                components.sidebar.selectProblem(problemId);
            } else {
                loadProblemById(problemId);
            }
        } catch (error) {
            console.error('UI: Problem route failed:', error);
            showMessage('Failed to route to problem: ' + error.message, 'error');
        }
    }

    /**
     * Load problem by ID with validation
     */
    function loadProblemById(problemId) {
        try {
            const [week, number] = problemId.split('.');
            const problem = window.problemsData.problems.find(p => 
                p.week === parseInt(week) && p.number === parseInt(number)
            );

            if (!problem) {
                throw new Error(`Problem ${problemId} not found`);
            }

            if (loadTheory(problem.theory)) {
                setProblem(problem, problemId);
            }
        } catch (error) {
            console.error('UI: Load problem by ID failed:', error);
            showMessage(error.message, 'error');
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
     * Set current problem with validation
     */
    function setProblem(problem, problemId) {
        try {
            if (!problem || !problemId) {
                throw new Error('Invalid problem data');
            }
            
            state.problem = problem;
            
            updateDisplay(problem, problemId);
            
            if (!components.proofInterface) {
                throw new Error('Proof interface not available');
            }
            
            components.proofInterface.loadProblem(problem, state.theory);
            setupHints(problem);
            showProblemContent();
            
            
            
        } catch (error) {
            console.error('UI: Set problem failed:', error);
            showMessage('Failed to set problem: ' + error.message, 'error');
        }
    }

    /**
     * Update display elements safely
     */
    function updateDisplay(problem, problemId) {
        const updates = {
            'current-problem-title': problem.name,
            'current-problem-id': problemId,
            'current-problem-theory': getTheoryName(problem.theory),
            'problem-description': problem.description,
            'problem-lhs': formatExpression(problem.LHS),
            'problem-rhs': formatExpression(problem.RHS)
        };

        Object.entries(updates).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el && value) el.textContent = value;
        });
    }

    /**
     * Setup hints safely
     */
    function setupHints(problem) {
        const section = document.getElementById('hints-section');
        if (!section) return;

        if (problem.hints && problem.hints.length > 0) {
            const content = document.getElementById('hints-content');
            if (content) {
                content.innerHTML = problem.hints.map((hint, i) => 
                    `<div class="hint-item">
                        <span class="hint-number">${i + 1}.</span>
                        ${escapeHTML(hint)}
                    </div>`
                ).join('');
            }
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    }

    /**
     * Show problem content
     */
    function showProblemContent() {
        const elements = {
            'no-problem-selected': 'none',
            'problem-header': 'block',
            'problem-content': 'block'
        };

        Object.entries(elements).forEach(([id, display]) => {
            const el = document.getElementById(id);
            if (el) el.style.display = display;
        });
    }

    /**
     * Show message with type
     */
    function showMessage(text, type = 'info') {
        const messages = {
            error: 'error-message',
            success: 'success-message',
            warning: 'warning-message'
        };

        // Hide all messages
        Object.values(messages).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        // Show requested message
        const messageEl = document.getElementById(messages[type]);
        if (messageEl) {
            messageEl.textContent = text;
            messageEl.style.display = 'block';
            
            if (type === 'success') {
                setTimeout(() => {
                    messageEl.style.display = 'none';
                }, 3000);
            }
        }
    
        
    }

    /**
     * Get default configuration
     */
    function getDefaultConfig() {
        return {
            ui: {
                showSidebar: false,
                showDashboard: false,
                showCustomEquations: false
            }
        };
    }

    // Event handlers
    function handleProofComplete(steps) {
        showMessage('Proof successfully completed!', 'success');
    }

    function handleExport(format, content) {
        try {
            const parser = state.theory.parser;
            if (!parser) {
                showMessage('Parser not available', 'error');
                return;
            }

            const formatted = window.ProofAssistant.Formatter.formatProof(format, content, parser);
            
            if (formatted.startsWith('Format not supported')) {
                showMessage(`Export format "${format}" is not supported`, 'error');
            } else {
                showExportModal(format, formatted);
            }
        } catch (error) {
            showMessage(`Export failed: ${error.message}`, 'error');
        }
    }

    function showExportModal(format, content) {
        const modal = document.getElementById('export-modal');
        if (!modal) {
            copyToClipboard(content);
            return;
        }

        const title = modal.querySelector('.modal-title');
        const area = modal.querySelector('.export-content');
        
        if (title) title.textContent = `Export Proof - ${format.toUpperCase()}`;
        if (area) area.textContent = content;

        if (window.bootstrap?.Modal) {
            new window.bootstrap.Modal(modal).show();
        }
    }

    function copyToClipboard(content) {
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(content)
                .then(() => showMessage('Content copied to clipboard', 'success'))
                .catch(() => showMessage('Failed to copy content', 'error'));
        }
    }

    // Utility functions
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

    function getTheoryName(theoryKey) {
        return window.problemsData?.theories?.[theoryKey]?.name || theoryKey;
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Public API
    return {
        init,
        loadProblem: loadProblemById,
        getCurrentProblem: () => state.problem,
        getCurrentTheory: () => state.theory,
        getConfiguration: () => state.config,
        showError: text => showMessage(text, 'error'),
        showSuccess: text => showMessage(text, 'success'),
        isInitialized: () => state.initialized
    };
})();