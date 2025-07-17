/**
 * Main Application Entry Point
 * 
 * Initializes the proof assistant with problem loading
 */

window.ProofAssistant = window.ProofAssistant || {};

window.ProofAssistant.Main = (function() {
    'use strict';

    // Application state
    let initialized = false;

    /**
     * Initialize the entire application
     */
    function init() {
        console.log('Starting Proof Assistant...');
        
        try {
            // Initialize UI (which will handle loading problems and theories dynamically)
            window.ProofAssistant.UI.init();
            
            initialized = true;
            console.log('Proof Assistant initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Proof Assistant:', error);
            if (window.ProofAssistant.UI) {
                window.ProofAssistant.UI.showError('Failed to initialize application: ' + error.message);
            }
        }
    }

    /**
     * Get current application state
     */
    function getState() {
        return {
            initialized: initialized
        };
    }
   

    // Auto-initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded, initializing Dynamic Proof Assistant...');
        
        // Small delay to ensure all modules are loaded
        setTimeout(init, 100);
    });

    // Global error handler
    window.addEventListener('error', function(event) {
        console.error('Global error:', event.error);
        if (window.ProofAssistant.UI && initialized) {
            window.ProofAssistant.UI.showError('An unexpected error occurred: ' + event.error.message);
        }
    });

    // Public API
    return {
        init: init,
        getState: getState,
        
        // Debug functions
        testParsing: testParsing,
        testRule: testRule
    };
})();


window.getState = window.ProofAssistant.Main.getState;