/**
 * Main Application Entry Point
 */

window.ProofAssistant = window.ProofAssistant || {};

window.ProofAssistant.Main = (function() {
    'use strict';

    let initialized = false;
    let ui = null;
    let configuration = null;
    let initializationPromise = null;

    /**
     * Initialize application with proper error handling and timeout
     */
    function init() {
        // Prevent multiple initialization attempts
        if (initializationPromise) {
            return initializationPromise;
        }

        initializationPromise = new Promise((resolve, reject) => {
            try {
                console.log('Main: Starting application initialization...');
                
                // Set timeout to prevent infinite loading
                const initTimeout = setTimeout(() => {
                    reject(new Error('Initialization timeout - application took too long to start'));
                }, 10000); // 10 second timeout

                // Validate dependencies immediately
                if (!validateCoreModules()) {
                    clearTimeout(initTimeout);
                    reject(new Error('Required modules not loaded'));
                    return;
                }

                // Load configuration
                configuration = loadConfiguration();
                console.log('Main: Configuration loaded');

                // Initialize theme system
                if (window.ProofAssistant.Theme) {
                    window.ProofAssistant.Theme.init();
                    console.log('Main: Theme system initialized');
                }

                // Initialize UI system
                ui = window.ProofAssistant.UI;
                const uiSuccess = ui.init(configuration);
                
                if (!uiSuccess) {
                    clearTimeout(initTimeout);
                    reject(new Error('Failed to initialize UI system'));
                    return;
                }

                console.log('Main: UI system initialized');
                
                // Setup global error handlers
                setupErrorHandlers();
                
                // Setup minimal keyboard shortcuts
                setupKeyboardShortcuts();
                
                initialized = true;
                clearTimeout(initTimeout);
                
                console.log('Main: Application initialization complete');
                resolve(true);
                
            } catch (error) {
                console.error('Main: Initialization failed:', error);
                initialized = false;
                reject(error);
            }
        });

        return initializationPromise;
    }

    /**
     * Validate that core modules are loaded
     */
    function validateCoreModules() {
        const required = [
            { path: 'window.problemsData', name: 'Problems Data' },
            { path: 'window.ProofAssistant.AST', name: 'AST Module' },
            { path: 'window.ProofAssistant.Parser', name: 'Parser Module' },
            { path: 'window.ProofAssistant.Formatter', name: 'Formatter Module' },
            { path: 'window.ProofAssistant.UI', name: 'UI Module' },
            { path: 'window.ProofAssistant.Components.ProofInterface', name: 'Proof Interface' }
        ];

        const missing = [];
        
        for (const req of required) {
            const obj = req.path.split('.').reduce((o, prop) => o && o[prop], window);
            if (!obj) {
                missing.push(req.name);
            }
        }
        
        if (missing.length > 0) {
            console.error('Main: Missing required modules:', missing.join(', '));
            showError('Required components not loaded: ' + missing.join(', '));
            return false;
        }
        
        // Validate problems data structure
        if (!window.problemsData.problems || !Array.isArray(window.problemsData.problems)) {
            console.error('Main: Invalid problems data structure');
            showError('Problems data is invalid or missing');
            return false;
        }
        
        console.log('Main: All core modules validated');
        return true;
    }

    /**
     * Load and merge configuration
     */
    function loadConfiguration() {
        const defaultConfig = {
            courseTitle: 'Proof Assistant',
            toolName: 'Proof Assistant',
            showUniLogo: false,
            borderRadius: '8px',
            ui: {
                showSidebar: false,
                showDashboard: false,
                showCustomEquations: false,
                theme: {
                    primaryColor: '#FFCD00',
                    secondaryColor: '#003366',
                    accentColor: '#B8860B',
                    backgroundColor: '#FEFEFE',
                    textColor: '#2C2C2C'
                }
            }
        };

        // Merge with provided configuration
        let config = defaultConfig;
        if (window.problemsData && window.problemsData.configuration) {
            config = mergeDeep(defaultConfig, window.problemsData.configuration);
        }

        return config;
    }

    /**
     * Deep merge configurations
     */
    function mergeDeep(target, source) {
        const result = JSON.parse(JSON.stringify(target));
        
        function merge(dest, src) {
            for (const key in src) {
                if (src.hasOwnProperty(key)) {
                    if (typeof src[key] === 'object' && src[key] !== null && !Array.isArray(src[key])) {
                        dest[key] = dest[key] || {};
                        merge(dest[key], src[key]);
                    } else {
                        dest[key] = src[key];
                    }
                }
            }
        }

        merge(result, source);
        return result;
    }

    /**
     * Setup global error handlers
     */
    function setupErrorHandlers() {
        // Global JavaScript error handler
        window.addEventListener('error', function(event) {
            console.error('Global error:', event.error);
            
            if (!initialized) {
                showError('Application failed to start: ' + (event.error?.message || 'Unknown error'));
            }
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', function(event) {
            console.error('Unhandled promise rejection:', event.reason);
            
            if (!initialized) {
                showError('Application startup failed: ' + (event.reason?.message || 'Unknown error'));
            }
        });
    }

    /**
     * Setup keyboard shortcuts
     */
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', function(event) {
            // Escape: Clear modals or cancel edit mode
            if (event.key === 'Escape') {
                // Close export modal if open
                const exportModal = document.getElementById('export-modal');
                if (exportModal?.classList.contains('show')) {
                    const closeBtn = exportModal.querySelector('.btn-close');
                    if (closeBtn) closeBtn.click();
                }
                
                // Cancel edit mode if active
                const cancelEditBtn = document.getElementById('cancel-edit');
                if (cancelEditBtn?.style.display !== 'none') {
                    cancelEditBtn.click();
                }
            }
        });
    }

    /**
     * Show error message in UI
     */
    function showError(message) {
        console.error('Main:', message);
        
        // Try to show in UI error div
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        } else {
            // Fallback to alert
            alert('Error: ' + message);
        }
    }

    /**
     * Get current initialization status
     */
    function getInitializationStatus() {
        return {
            initialized,
            hasUI: !!ui,
            hasConfiguration: !!configuration
        };
    }

    // Auto-initialize when DOM is ready with proper error handling
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Main: DOM ready, starting initialization...');
        
        // Small delay to ensure all scripts are loaded
        setTimeout(() => {
            init().catch(error => {
                console.error('Main: Auto-initialization failed:', error);
                showError('Failed to start application: ' + error.message);
            });
        }, 50); // Reduced from 100ms to make it faster
    });

    // Public API
    return {
        init,
        getConfiguration: () => configuration,
        getUI: () => ui,
        isInitialized: () => initialized,
        getInitializationStatus
    };
})();