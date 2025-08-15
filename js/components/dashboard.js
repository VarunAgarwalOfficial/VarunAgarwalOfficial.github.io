/**
 * Dashboard Component
 * 
 * Displays problems in a vertical grid layout for easy navigation
 */

window.ProofAssistant = window.ProofAssistant || {};
window.ProofAssistant.Components = window.ProofAssistant.Components || {};

window.ProofAssistant.Components.Dashboard = (function() {
    'use strict';

    let problemsData = null;
    let container = null;
    let options = {};

    /**
     * Initialize the dashboard component
     */
    function init(containerElement, componentOptions = {}) {
        container = typeof containerElement === 'string' 
            ? document.querySelector(containerElement) 
            : containerElement;
        
        if (!container) {
            console.error('Dashboard container not found');
            return false;
        }

        options = {
            onProblemSelect: componentOptions.onProblemSelect || (() => {}),
            layout: componentOptions.layout || 'grid', // 'grid' or 'list'
            showProgress: componentOptions.showProgress || false,
            ...componentOptions
        };

        setupDashboardStructure();
        return true;
    }

    /**
     * Setup the dashboard HTML structure
     */
    function setupDashboardStructure() {
        container.innerHTML = `
            <div id="dashboard-loading" class="text-center py-5">
                <i class="fas fa-spinner fa-spin fa-2x"></i>
                <p class="mt-3">Loading problems...</p>
            </div>

            <div id="dashboard-content" style="display: none;">
                <div id="dashboard-stats" class="dashboard-stats mb-4">
                    <!-- Stats will be populated here -->
                </div>
                
                <div class="dashboard-controls mb-4">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="btn-group" role="group">
                            <button type="button" class="btn btn-outline-secondary active" id="grid-view">
                                <i class="fas fa-th-large"></i> Grid
                            </button>
                            <button type="button" class="btn btn-outline-secondary" id="list-view">
                                <i class="fas fa-list"></i> List
                            </button>
                        </div>
                        <div class="search-controls">
                            <input type="text" 
                                   id="search-input" 
                                   class="form-control" 
                                   placeholder="Search problems..." 
                                   style="width: 250px;">
                        </div>
                    </div>
                </div>
                
                <div id="problems-container">
                    <!-- Problems will be populated here -->
                </div>
            </div>
        `;

        setupEventListeners();
    }

    /**
     * Setup event listeners for dashboard controls
     */
    function setupEventListeners() {
        // View toggle buttons
        const gridViewBtn = container.querySelector('#grid-view');
        const listViewBtn = container.querySelector('#list-view');

        if (gridViewBtn) {
            gridViewBtn.addEventListener('click', () => {
                setViewMode('grid');
                updateViewButtons('grid');
            });
        }

        if (listViewBtn) {
            listViewBtn.addEventListener('click', () => {
                setViewMode('list');
                updateViewButtons('list');
            });
        }

        // Search functionality
        const searchInput = container.querySelector('#search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                if (query.length === 0) {
                    renderProblems(); // Show all problems
                } else {
                    searchProblems(query);
                }
            });

            // Clear search on Escape
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    e.target.value = '';
                    renderProblems(); // Show all problems
                }
            });
        }

        // Set initial view mode
        updateViewButtons(options.layout);

        // Event delegation for problem selection
        setupProblemEventDelegation();
    }

    /**
     * Setup event delegation for problem selection
     */
    function setupProblemEventDelegation() {
        const problemsContainer = container.querySelector('#problems-container');
        if (!problemsContainer) return;

        problemsContainer.addEventListener('click', (e) => {
            // Handle problem card clicks
            const problemCard = e.target.closest('.problem-card');
            if (problemCard) {
                const problemId = problemCard.dataset.problemId;
                if (problemId) {
                    handleProblemSelection(problemId);
                }
                return;
            }

            // Handle list item clicks (but not buttons)
            const listItem = e.target.closest('.list-item');
            if (listItem && !e.target.closest('button')) {
                const problemId = listItem.dataset.problemId;
                if (problemId) {
                    handleProblemSelection(problemId);
                }
                return;
            }

            // Handle "Start Proof" button clicks in list view
            const startProofBtn = e.target.closest('button[data-problem-id]');
            if (startProofBtn) {
                const problemId = startProofBtn.dataset.problemId;
                if (problemId) {
                    handleProblemSelection(problemId);
                }
                return;
            }
        });
    }

    /**
     * Handle problem selection - centralized logic
     */
    function handleProblemSelection(problemId) {
        // Find the problem data
        const [week, number] = problemId.split('.');
        const problem = problemsData.problems.find(p => 
            p.week === parseInt(week) && p.number === parseInt(number)
        );
        
        if (problem && options.onProblemSelect) {
            options.onProblemSelect(problem, problemId);
        }

        // Navigate to problem (default behavior)
        window.location.href = `index.html?problem=${problemId}`;
    }

    /**
     * Load problems data and populate dashboard
     */
    function loadProblems(data) {
        problemsData = data;
        populateDashboard();
    }

    /**
     * Populate the dashboard with problems
     */
    function populateDashboard() {
        const loadingDiv = container.querySelector('#dashboard-loading');
        const contentDiv = container.querySelector('#dashboard-content');
        
        if (!problemsData || !problemsData.problems) {
            showLoadingError();
            return;
        }

        // Hide loading, show content
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (contentDiv) contentDiv.style.display = 'block';

        // Populate stats
        populateStats();

        // Populate problems
        renderProblems();

        console.log('Dashboard populated with', problemsData.problems.length, 'problems');
    }

    /**
     * Populate dashboard statistics
     */
    function populateStats() {
        const statsContainer = container.querySelector('#dashboard-stats');
        if (!statsContainer || !problemsData) return;

        const stats = calculateStats();
        
        statsContainer.innerHTML = `
            <div class="row">
                <div class="col-md-3">
                    <div class="stat-card">
                        <div class="stat-number">${stats.totalProblems}</div>
                        <div class="stat-label">Total Problems</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <div class="stat-number">${stats.weeks}</div>
                        <div class="stat-label">Weeks Covered</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <div class="stat-number">${stats.theories}</div>
                        <div class="stat-label">Theories</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <div class="stat-number">${stats.averagePerWeek}</div>
                        <div class="stat-label">Avg per Week</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Calculate statistics from problems data
     */
    function calculateStats() {
        if (!problemsData || !problemsData.problems) {
            return { totalProblems: 0, weeks: 0, theories: 0, averagePerWeek: 0 };
        }

        const problems = problemsData.problems;
        const weeks = new Set(problems.map(p => p.week));
        const theories = new Set(problems.map(p => p.theory));
        
        return {
            totalProblems: problems.length,
            weeks: weeks.size,
            theories: theories.size,
            averagePerWeek: Math.round(problems.length / weeks.size * 10) / 10
        };
    }

    /**
     * Render problems in the current view mode
     */
    function renderProblems(filteredProblems = null) {
        const problemsContainer = container.querySelector('#problems-container');
        if (!problemsContainer || !problemsData) return;

        const problems = filteredProblems || problemsData.problems;
        const viewMode = options.layout;

        if (viewMode === 'grid') {
            renderGridView(problems, problemsContainer);
        } else {
            renderListView(problems, problemsContainer);
        }
    }

    /**
     * Render problems in grid view
     */
    function renderGridView(problems, container) {
        // Group problems by week
        const problemsByWeek = {};
        problems.forEach(problem => {
            if (!problemsByWeek[problem.week]) {
                problemsByWeek[problem.week] = [];
            }
            problemsByWeek[problem.week].push(problem);
        });

        let html = '';
        Object.keys(problemsByWeek).sort((a, b) => parseInt(a) - parseInt(b)).forEach(week => {
            html += `
                <div class="week-section mb-5">
                    <h4 class="week-title text-sans mb-3">
                        <i class="fas fa-calendar-week"></i> Week ${week}
                        <span class="week-count">(${problemsByWeek[week].length} problems)</span>
                    </h4>
                    <div class="row">
            `;

            // Sort problems within week
            problemsByWeek[week].sort((a, b) => a.number - b.number).forEach(problem => {
                const problemId = `${problem.week}.${problem.number.toString().padStart(2, '0')}`;
                const theoryInfo = getTheoryInfo(problem.theory);
                
                html += `
                    <div class="col-lg-4 col-md-6 mb-3">
                        <div class="problem-card" data-problem-id="${problemId}">
                            <div class="problem-card-header">
                                <div class="problem-id-badge">${problemId}</div>
                                <div class="theory-badge ${problem.theory}">${theoryInfo.name}</div>
                            </div>
                            <div class="problem-card-body">
                                <h6 class="problem-title">${problem.name}</h6>
                                <p class="problem-description">${problem.description || 'No description available'}</p>
                                <div class="problem-equation">
                                    <code class="text-mono">${problem.LHS} = ${problem.RHS}</code>
                                </div>
                            </div>
                            <div class="problem-card-footer">
                                ${problem.hints ? `<small class="text-muted"><i class="fas fa-lightbulb"></i> ${problem.hints.length} hints</small>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    /**
     * Render problems in list view
     */
    function renderListView(problems, container) {
        let html = `
            <div class="problems-list">
                <div class="list-header">
                    <div class="row fw-bold">
                        <div class="col-md-2">ID</div>
                        <div class="col-md-4">Problem</div>
                        <div class="col-md-3">Theory</div>
                        <div class="col-md-3">Actions</div>
                    </div>
                </div>
                <div class="list-body">
        `;

        // Sort problems by week and number
        const sortedProblems = [...problems].sort((a, b) => {
            if (a.week !== b.week) return a.week - b.week;
            return a.number - b.number;
        });

        sortedProblems.forEach(problem => {
            const problemId = `${problem.week}.${problem.number.toString().padStart(2, '0')}`;
            const theoryInfo = getTheoryInfo(problem.theory);
            
            html += `
                <div class="list-item" data-problem-id="${problemId}">
                    <div class="row align-items-center">
                        <div class="col-md-2">
                            <span class="problem-id-badge">${problemId}</span>
                        </div>
                        <div class="col-md-4">
                            <div class="problem-info">
                                <h6 class="mb-1">${problem.name}</h6>
                                <small class="text-muted">${problem.description || 'No description'}</small>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <span class="theory-badge ${problem.theory}">${theoryInfo.name}</span>
                        </div>
                        <div class="col-md-3">
                            <button class="btn btn-primary btn-sm" data-problem-id="${problemId}">
                                <i class="fas fa-play"></i> Start Proof
                            </button>
                            ${problem.hints ? `<small class="d-block mt-1 text-muted"><i class="fas fa-lightbulb"></i> ${problem.hints.length} hints</small>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * Search problems
     */
    function searchProblems(query) {
        if (!problemsData || !problemsData.problems) return;

        const lowerQuery = query.toLowerCase();
        const filteredProblems = problemsData.problems.filter(problem => 
            problem.name.toLowerCase().includes(lowerQuery) ||
            (problem.description && problem.description.toLowerCase().includes(lowerQuery)) ||
            problem.LHS.toLowerCase().includes(lowerQuery) ||
            problem.RHS.toLowerCase().includes(lowerQuery) ||
            problem.theory.toLowerCase().includes(lowerQuery) ||
            getTheoryInfo(problem.theory).name.toLowerCase().includes(lowerQuery)
        );

        renderProblems(filteredProblems);

        // Update search results count
        const resultsCount = filteredProblems.length;
        const searchInput = container.querySelector('#search-input');
        if (searchInput) {
            searchInput.setAttribute('data-results', `${resultsCount} results`);
            if (resultsCount === 0) {
                searchInput.style.borderColor = '#dc3545';
            } else {
                searchInput.style.borderColor = '#28a745';
            }
        }
    }

    /**
     * Set the view mode (grid or list)
     */
    function setViewMode(mode) {
        options.layout = mode;
        renderProblems();
    }

    /**
     * Update view toggle buttons
     */
    function updateViewButtons(activeMode) {
        const gridBtn = container.querySelector('#grid-view');
        const listBtn = container.querySelector('#list-view');

        if (gridBtn && listBtn) {
            gridBtn.classList.toggle('btn-outline-secondary', activeMode !== 'grid');
            gridBtn.classList.toggle('btn-secondary', activeMode === 'grid');
            gridBtn.classList.toggle('active', activeMode === 'grid');
            
            listBtn.classList.toggle('btn-outline-secondary', activeMode !== 'list');
            listBtn.classList.toggle('btn-secondary', activeMode === 'list');
            listBtn.classList.toggle('active', activeMode === 'list');
        }
    }

    /**
     * Get theory information
     */
    function getTheoryInfo(theoryKey) {
        if (problemsData && problemsData.theories && problemsData.theories[theoryKey]) {
            return problemsData.theories[theoryKey];
        }
        
        // Fallback theory names
        const fallbackNames = {
            'set_theory': { name: 'Set Theory' },
            'bool_alg': { name: 'Boolean Algebra' },
            'prop_logic': { name: 'Propositional Logic' }
        };
        
        return fallbackNames[theoryKey] || { name: theoryKey };
    }

    /**
     * Show loading error
     */
    function showLoadingError() {
        const loadingDiv = container.querySelector('#dashboard-loading');
        if (loadingDiv) {
            loadingDiv.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-exclamation-triangle fa-2x text-warning"></i>
                    <p class="mt-3">Failed to load problems</p>
                    <button class="btn btn-primary" onclick="window.location.reload()">
                        <i class="fas fa-refresh"></i> Retry
                    </button>
                </div>
            `;
        }
    }

    // Public API - REMOVED selectProblem function
    return {
        init: init,
        loadProblems: loadProblems,
        searchProblems: searchProblems,
        setViewMode: setViewMode
    };
})();