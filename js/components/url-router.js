/**
 * URL Router Component
 */

window.ProofAssistant = window.ProofAssistant || {};
window.ProofAssistant.Components = window.ProofAssistant.Components || {};

window.ProofAssistant.Components.URLRouter = (function() {
    'use strict';

    let onProblemRouted = null;

    /**
     * Initialize URL router
     */
    function init(options = {}) {
        onProblemRouted = options.onProblemRouted || (() => {});
        
        // URL routing is always enabled - independent of sidebar
        window.addEventListener('popstate', parseURL);
        
        parseURL();
        return true;
    }

    /**
     * Parse current URL for problem ID
     */
    function parseURL() {
        const problemId = getCurrentProblemId();
        if (problemId && onProblemRouted) {
            onProblemRouted(problemId);
        }
    }

    /**
     * Get current problem ID from URL
     */
    function getCurrentProblemId() {
        const urlParams = new URLSearchParams(window.location.search);
        let problemId = urlParams.get('problem');
        
        // If no URL parameter, check hash (but avoid duplicates)
        if (!problemId) {
            const hash = window.location.hash.substring(1);
            if (hash && isProblemIdFormat(hash)) {
                problemId = hash;
            }
        }
        
        // Format and validate
        if (problemId) {
            return formatProblemId(problemId);
        }
        
        return null;
    }

    /**
     * Check if string is valid problem ID format (week.number)
     */
    function isProblemIdFormat(str) {
        return /^\d+\.\d+$/.test(str);
    }

    /**
     * Format problem ID to standard format (week.number with zero-padded number)
     */
    function formatProblemId(problemId) {
        if (!problemId || !isProblemIdFormat(problemId)) return problemId;
        
        const [week, number] = problemId.split('.');
        const weekNum = parseInt(week);
        const numNum = parseInt(number);
        
        if (isNaN(weekNum) || isNaN(numNum)) return problemId;
        
        return `${weekNum}.${numNum.toString().padStart(2, '0')}`;
    }

    /**
     * Update URL with problem ID
     */
    function updateURL(problemId, replaceState = false) {
        const url = new URL(window.location.href);
        
        if (problemId) {
            url.searchParams.set('problem', problemId);
        } else {
            url.searchParams.delete('problem');
        }
        
        // Clear hash to prevent duplicates
        url.hash = '';
        
        const method = replaceState ? 'replaceState' : 'pushState';
        window.history[method]({ problemId }, '', url.toString());
    }

    /**
     * Navigate to problem
     */
    function navigateToProblem(problemId) {
        updateURL(problemId);
        if (onProblemRouted) {
            onProblemRouted(problemId);
        }
    }

    /**
     * Create shareable URL
     */
    function createProblemURL(problemId) {
        const baseURL = window.location.origin + window.location.pathname;
        return `${baseURL}?problem=${problemId}`;
    }

    /**
     * Share current problem
     */
    function shareCurrentProblem() {
        const problemId = getCurrentProblemId();
        if (!problemId) return false;
        
        const shareURL = createProblemURL(problemId);
        
        if (navigator.share) {
            navigator.share({
                title: `Proof Problem ${problemId}`,
                text: `Check out this proof problem: ${problemId}`,
                url: shareURL
            }).catch(() => {});
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(shareURL)
                .then(() => alert('Problem URL copied to clipboard!'))
                .catch(() => prompt('Copy this URL:', shareURL));
        } else {
            prompt('Copy this URL:', shareURL);
        }
        
        return true;
    }

    /**
     * Navigate to custom equations (if enabled)
     */
    function navigateToCustomEquations() {
        const config = window.problemsData?.configuration || 
                      window.ProofAssistant?.Main?.getConfiguration?.() || 
                      {};
        
        if (config?.ui?.showCustomEquations) {
            window.location.href = 'equations.html';
            return true;
        }
        return false;
    }

    // Public API
    return {
        init,
        getCurrentProblemId,
        updateURL,
        navigateToProblem,
        createProblemURL,
        shareCurrentProblem,
        navigateToCustomEquations,
        formatProblemId,
        isProblemIdFormat
    };
})();