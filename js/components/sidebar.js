/**
 * Sidebar Component - Prevents infinite loading
 */

window.ProofAssistant = window.ProofAssistant || {};
window.ProofAssistant.Components = window.ProofAssistant.Components || {};

window.ProofAssistant.Components.Sidebar = (function() {
    'use strict';

    let problemsData = null;
    let onProblemSelect = null;
    let activeProblemId = null;
    let container = null;
    let loadingTimeout = null;

    /**
     * Initialize sidebar with timeout protection
     */
    function init(containerSelector, options = {}) {
        try {
            onProblemSelect = options.onProblemSelect || (() => {});
            
            // Find container
            container = typeof containerSelector === 'string' 
                ? document.querySelector(containerSelector) 
                : containerSelector;
                
            if (!container) {
                console.error('Sidebar: Container not found:', containerSelector);
                return false;
            }

            setupSidebarStructure();
            
            return true;
            
        } catch (error) {
            console.error('Sidebar: Initialization failed:', error);
            return false;
        }
    }

    /**
     * Setup sidebar HTML structure
     */
    function setupSidebarStructure() {
        container.innerHTML = `
            <div class="sidebar-header">
                <h4>Proof Assistant</h4>
            </div>
            <div class="sidebar-content">
                <div id="problems-loading" class="loading-state">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading problems...</p>
                </div>
                <div id="problems-list" style="display: none;">
                    <!-- Problems will be loaded here -->
                </div>
            </div>
        `;
        
        
    }

    /**
     * Load problems with timeout protection
     */
    function loadProblems(data) {
        try {
            
            
            if (!data) {
                throw new Error('No problems data provided');
            }
            
            problemsData = data;
            
            // Set timeout to prevent infinite loading
            if (loadingTimeout) {
                clearTimeout(loadingTimeout);
            }
            
            loadingTimeout = setTimeout(() => {
                console.error('Sidebar: Loading timeout');
                showLoadingError('Loading took too long');
            }, 5000);
            
            // Immediate population (no delay)
            populateProblems();
            
        } catch (error) {
            console.error('Sidebar: Load problems failed:', error);
            showLoadingError(error.message);
        }
    }

    /**
     * Populate sidebar with problems
     */
    function populateProblems() {
        try {
            if (loadingTimeout) {
                clearTimeout(loadingTimeout);
                loadingTimeout = null;
            }
            
            const loadingDiv = document.getElementById('problems-loading');
            const problemsList = document.getElementById('problems-list');
            
            if (!loadingDiv || !problemsList) {
                throw new Error('Required DOM elements not found');
            }
            
            if (!problemsData?.problems || !Array.isArray(problemsData.problems)) {
                throw new Error('Invalid problems data structure');
            }

            // Group problems by week
            const problemsByWeek = {};
            problemsData.problems.forEach(problem => {
                if (!problemsByWeek[problem.week]) {
                    problemsByWeek[problem.week] = [];
                }
                problemsByWeek[problem.week].push(problem);
            });

            // Generate HTML
            let sidebarHTML = '';
            Object.keys(problemsByWeek)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .forEach(week => {
                    sidebarHTML += `<div class="week-group">`;
                    sidebarHTML += `<div class="week-header">Week ${week}</div>`;
                    
                    // Sort problems within week
                    problemsByWeek[week]
                        .sort((a, b) => a.number - b.number)
                        .forEach(problem => {
                            const theoryName = getTheoryName(problem.theory);
                            const problemId = `${problem.week}.${problem.number.toString().padStart(2, '0')}`;
                            
                            sidebarHTML += `
                                <div class="problem-item" data-problem-id="${problemId}">
                                    <div class="problem-id">${problemId}</div>
                                    <div class="problem-title">${escapeHTML(problem.name)}</div>
                                    <div class="problem-theory">${escapeHTML(theoryName)}</div>
                                </div>
                            `;
                        });
                    
                    sidebarHTML += `</div>`;
                });

            // Update DOM
            problemsList.innerHTML = sidebarHTML;
            loadingDiv.style.display = 'none';
            problemsList.style.display = 'block';

            setupClickHandlers();
            
            
            
        } catch (error) {
            console.error('Sidebar: Populate problems failed:', error);
            showLoadingError(error.message);
        }
    }

    /**
     * Setup click handlers for problem items
     */
    function setupClickHandlers() {
        const problemItems = container.querySelectorAll('.problem-item');
        
        problemItems.forEach(item => {
            item.addEventListener('click', function() {
                const problemId = this.dataset.problemId;
                if (problemId) {
                    selectProblem(problemId);
                }
            });
        });
        
        
    }

    /**
     * Select problem with error handling
     */
    function selectProblem(problemId) {
        try {
            
            
            // Update visual selection
            container.querySelectorAll('.problem-item').forEach(item => {
                item.classList.remove('active');
            });
            
            const selectedItem = container.querySelector(`[data-problem-id="${problemId}"]`);
            if (selectedItem) {
                selectedItem.classList.add('active');
                activeProblemId = problemId;
            }

            // Find problem data
            const [week, number] = problemId.split('.');
            const problem = problemsData.problems.find(p => 
                p.week === parseInt(week) && p.number === parseInt(number)
            );
            
            if (!problem) {
                throw new Error(`Problem ${problemId} not found`);
            }
            
            if (onProblemSelect) {
                onProblemSelect(problem, problemId);
            }
            
            
            
        } catch (error) {
            console.error('Sidebar: Select problem failed:', error);
        }
    }

    /**
     * Set active problem (for URL routing)
     */
    function setActiveProblem(problemId) {
        activeProblemId = problemId;
        
        // Update visual selection
        container.querySelectorAll('.problem-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const selectedItem = container.querySelector(`[data-problem-id="${problemId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }
    }

    /**
     * Show loading error with retry option
     */
    function showLoadingError(message = 'Failed to load problems') {
        console.error('Sidebar: Loading error:', message);
        
        const loadingDiv = document.getElementById('problems-loading');
        if (loadingDiv) {
            loadingDiv.innerHTML = `
                <div class="text-center text-danger">
                    <i class="fas fa-exclamation-triangle fa-2x"></i>
                    <p class="mt-2">Error: ${escapeHTML(message)}</p>
                    <button class="btn btn-outline-primary btn-sm" onclick="window.location.reload()">
                        <i class="fas fa-refresh"></i> Retry
                    </button>
                </div>
            `;
        }
    }

    /**
     * Get theory name safely
     */
    function getTheoryName(theoryKey) {
        return problemsData?.theories?.[theoryKey]?.name || theoryKey || 'Unknown';
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Public API
    return {
        init,
        loadProblems,
        selectProblem,
        setActiveProblem,
        getActiveProblemId: () => activeProblemId
    };
})();