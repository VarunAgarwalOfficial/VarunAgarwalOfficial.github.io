/**
 * Theory Base Class
 */
window.ProofAssistant = window.ProofAssistant || {};

window.ProofAssistant.Theory = (function() {
    'use strict';

    // Standard result constants
    const RESULTS = {
        SUCCESS: 'Success',
        ERR_EQ: 'No rule has been applied',
        ERR_TOO_MANY: 'Too many changes have been made. Please only apply the rule in one place',
        ERR_WRONG_RULE: 'The chosen rule does not apply'
    };

    /**
     * Create a new theory with its own parser instance and custom laws support
     */
    function createTheory(config) {
        const { info, symbols, equality, rules } = config;
        
        // Create a dedicated parser for this theory
        const parser = window.ProofAssistant.ParserFactory.createParser(symbols, equality);

        // Storage for problem-specific custom laws - LOCAL to this theory instance
        const problemCustomLaws = {};
        
        // Compiled rules cache
        let compiledRules = {};
        let rulesCompiled = false;
        let currentProblemId = null;

        /**
         * Compile all rules to patterns using this theory's parser
         */
        function compileRules() {
            compiledRules = {};
            
            console.log('Compiling rules for theory:', info.name);
            // Always compile built-in rules
            rules.forEach(rule => {
                const [lhsAST, lhsError] = parser.parse(rule.LHS);
                const [rhsAST, rhsError] = parser.parse(rule.RHS);
                
                if (!lhsError && !rhsError) {
                    compiledRules[rule.name] = {
                        lhsPattern: lhsAST,
                        rhsPattern: rhsAST,
                        definition: rule,
                        isCustom: false,
                        isProblemSpecific: false,
                        level: rule.level || 99
                    };
                } else {
                    console.error(`Error compiling rule ${rule.name}:`, lhsError || rhsError);
                }
            });
            
            // Only compile custom laws for the CURRENT problem
            if (currentProblemId && problemCustomLaws[currentProblemId]) {
                problemCustomLaws[currentProblemId].forEach(law => {
                    // Make sure the law is for the current theory
                    if (!law.theory || law.theory === info.name) {
                        const [lhsAST, lhsError] = parser.parse(law.lhs || law.LHS);
                        const [rhsAST, rhsError] = parser.parse(law.rhs || law.RHS);
                        
                        if (!lhsError && !rhsError) {
                            // Create unique name for this custom law
                            const ruleName = `custom_${currentProblemId}_${law.name.replace(/\s+/g, '_').toLowerCase()}`;
                            
                            compiledRules[ruleName] = {
                                lhsPattern: lhsAST,
                                rhsPattern: rhsAST,
                                definition: {
                                    name: ruleName,
                                    text: law.name || law.text,
                                    LHS: law.lhs || law.LHS,
                                    RHS: law.rhs || law.RHS,
                                    level: 99 // Custom laws always at level 99
                                },
                                isCustom: true,
                                isProblemSpecific: true,
                                problemId: currentProblemId,
                                level: 99
                            };
                        } else {
                            console.error(`Error compiling custom law ${law.name}:`, lhsError || rhsError);
                        }
                    }
                });
            }
            
            rulesCompiled = true;
        }

        /**
         * Parse an expression string to AST
         */
        function parseExpression(expr) {
            return parser.parse(expr);
        }

        /**
         * Convert AST back to string
         */
        function unparseAST(ast) {
            return parser.unparse(ast);
        }

        /**
         * Validate a proof step using pattern matching
         */
        function validateStep(fromAST, toAST, ruleName) {
            if (!rulesCompiled) {
                compileRules();
            }

            if (!window.ProofAssistant.PatternMatcher) {
                return {
                    success: false,
                    error: 'Pattern matching system not initialized'
                };
            }

            const compiledRule = compiledRules[ruleName];
            if (!compiledRule) {
                return {
                    success: false,
                    error: `Unknown rule: ${ruleName}`
                };
            }

            const result = window.ProofAssistant.PatternMatcher.applyPatternRule(
                fromAST, 
                toAST, 
                compiledRule.lhsPattern, 
                compiledRule.rhsPattern,
                true // bidirectional
            );

            return {
                success: result === RESULTS.SUCCESS,
                error: result !== RESULTS.SUCCESS ? result : null,
                rule: compiledRule.definition,
                isCustom: compiledRule.isCustom,
                isProblemSpecific: compiledRule.isProblemSpecific || false
            };
        }

        /**
         * Get all available rules including custom laws for current problem
         */
        function getAllAvailableRules() {
            if (!rulesCompiled) {
                compileRules();
            }
            
            const allRules = [];
            
            // Add all compiled rules (built-in + current problem's custom)
            Object.keys(compiledRules).forEach(ruleName => {
                const rule = compiledRules[ruleName];
                // Only include problem-specific rules if they match current problem
                if (!rule.isProblemSpecific || rule.problemId === currentProblemId) {
                    allRules.push({
                        name: ruleName,
                        text: rule.definition.text || rule.definition.name,
                        LHS: rule.definition.LHS,
                        RHS: rule.definition.RHS,
                        level: rule.level,
                        isCustom: rule.isCustom,
                        isProblemSpecific: rule.isProblemSpecific
                    });
                }
            });
            
            return allRules;
        }

        /**
         * Get rules organized by category
         */
        function getRulesByCategory() {
            const allRules = getAllAvailableRules();
            const categories = {
                basic: [],
                definitions: [],
                derived: [],
                problemSpecific: []
            };
            
            allRules.forEach(rule => {
                if (rule.isProblemSpecific) {
                    categories.problemSpecific.push(rule);
                } else if (rule.level === 0) {
                    categories.basic.push(rule);
                } else if (rule.level === 1) {
                    categories.definitions.push(rule);
                } else if (rule.level === 2) {
                    categories.derived.push(rule);
                }
            });
            
            return categories;
        }

        /**
         * Load custom laws for a specific problem
         * This REPLACES any existing custom laws
         */
        function loadProblemCustomLaws(problemId, customLaws) {
            // Clear previous problem's custom laws from compiled rules
            if (currentProblemId && currentProblemId !== problemId) {
                // Remove old problem's compiled custom laws
                Object.keys(compiledRules).forEach(ruleName => {
                    if (compiledRules[ruleName].isProblemSpecific && 
                        compiledRules[ruleName].problemId === currentProblemId) {
                        delete compiledRules[ruleName];
                    }
                });
            }
            
            currentProblemId = problemId;
            
            // Store new custom laws for this problem
            if (problemId && customLaws && customLaws.length > 0) {
                problemCustomLaws[problemId] = customLaws;
            } else if (problemId) {
                problemCustomLaws[problemId] = [];
            }
            
            // Force recompilation to include new custom laws
            rulesCompiled = false;
            compileRules();
        }

        /**
         * Clear problem context (when switching problems without custom laws)
         */
        function clearProblemContext() {
            // Remove current problem's compiled custom laws
            if (currentProblemId) {
                Object.keys(compiledRules).forEach(ruleName => {
                    if (compiledRules[ruleName].isProblemSpecific && 
                        compiledRules[ruleName].problemId === currentProblemId) {
                        delete compiledRules[ruleName];
                    }
                });
            }
            
            currentProblemId = null;
            // Don't clear problemCustomLaws storage - keep for potential reuse
            
            // Recompile to ensure only base rules are available
            rulesCompiled = false;
            compileRules();
        }

        /**
         * Initialize the theory
         */
        function init() {
            if (!rulesCompiled) {
                compileRules();
            }
        }

        // Initialize on creation
        init();

        // Return the theory object
        return {
            // Theory information
            info: info,
            symbols: symbols,
            equality: equality,
            rules: rules,
            parser: parser,
            
            // Core functions
            validateStep: validateStep,
            init: init,
            parseExpression: parseExpression,
            unparseAST: unparseAST,
            
            // Custom laws management
            loadProblemCustomLaws: loadProblemCustomLaws,
            clearProblemContext: clearProblemContext,
            
            // Rule retrieval functions
            getCustomRules: () => {
                if (currentProblemId && problemCustomLaws[currentProblemId]) {
                    return [...problemCustomLaws[currentProblemId]];
                }
                return [];
            },
            getAllRules: () => [...rules],
            getAllAvailableRules: getAllAvailableRules,
            getRulesByCategory: getRulesByCategory,
            
            // Utility functions
            getRuleDefinition: (ruleName) => {
                if (compiledRules[ruleName]) {
                    return compiledRules[ruleName].definition;
                }
                return rules.find(r => r.name === ruleName) || null;
            },
            getRuleNames: () => getAllAvailableRules().map(r => r.name),
            getRulesByLevel: (level) => getAllAvailableRules().filter(r => r.level === level).map(r => r.name),
            
            // Core validation constants
            ...RESULTS,
            
            // Debug helpers
            getCurrentProblemId: () => currentProblemId
        };
    }

    // Public API
    return {
        createTheory: createTheory,
        RESULTS: RESULTS
    };
})();