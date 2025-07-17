/**
 * Propositional Logic Module
 * 
 * Complete theory definition for propositional logic with ∨, ∧ , ¬, →, ↔ operations
 * Self-contained with all symbols, rules, and validation logic
 */

window.ProofAssistant = window.ProofAssistant || {};
window.ProofAssistant.Theories = window.ProofAssistant.Theories || {};

window.ProofAssistant.Theories.PropositionalLogic = (function() {
    'use strict';

    // Theory metadata
    const THEORY_INFO = {
        name: 'prop_logic',
        displayName: 'Propositional Logic',
        description: 'Propositional logic with ∨, ∧ , ¬, →, ↔ operators and constants ⊥, ⊤'
    };

    // Result constants for rule validation
    const SUCCESS = 'Success';
    const ERR_EQ = 'No rule has been applied';
    const ERR_TOO_MANY = 'Too many changes have been made. Please only apply the rule in one place';
    const ERR_WRONG_RULE = 'The chosen rule does not apply';

    // Symbol definitions
    const SYMBOLS = [
        {"id" : "0" , "name" : "False",           "display" : "⊥", "text" : "⊥", "latex" : "\\bot",  "arity":0},
        {"id" : "1" , "name" : "True",            "display" : "⊤", "text" : "⊤", "latex" : "\\top",  "arity":0},
        {"id" : "!" , "name" : "Negation",        "display" : "¬", "text" : "¬", "latex" : "\\neg",  "arity":1},
        {"id" : "|" , "name" : "Disjunction",     "display" : "∨", "text" : "∨", "latex" : "\\vee",  "arity":2},
        {"id" : "&" , "name" : "Conjunction",     "display" : "∧", "text" : "∧", "latex" : "\\wedge" , "arity":2},
        {"id" : ">" , "name" : "Implication",     "display" : "→", "text" : "→", "latex" : "\\rightarrow" , "arity":2},
        {"id" : "~" , "name" : "Biconditional",   "display" : "↔", "text" : "↔", "latex" : "\\leftrightarrow" , "arity":2}
    ];

    // Equality symbol
    const EQUALITY = {"display" : "≡" , "markdown" : "≡" , "latex" : "\\equiv"};

    // Rule definitions
    const RULE_DEFINITIONS = [
        {"name" : "assoc1" , "text" : "Associativity of ∨" , "LHS" : "(p ∨ q) ∨ r" , "RHS" : "p ∨ (q ∨ r)" , "level":0},
        {"name" : "assoc2" , "text" : "Associativity of ∧" , "LHS" : "(p ∧ q) ∧ r" , "RHS" : "p ∧ (q ∧ r)" , "level":0},
        {"name" : "comm1" , "text" : "Commutativity of ∨" , "LHS" : "p ∨ q" , "RHS" : "q ∨ p" , "level":0},
        {"name" : "comm2" , "text" : "Commutativity of ∧" , "LHS" : "p ∧ q" , "RHS" : "q ∧ p" , "level":0},
        {"name" : "dist1" , "text" : "Distributivity of ∧ over ∨" , "LHS" : "p ∧ (q ∨ r)" , "RHS" : "(p ∧ q) ∨ (p ∧ r)" , "level":0},
        {"name" : "dist2" , "text" : "Distributivity of ∨ over ∧" , "LHS" : "p ∨ (q ∧ r)" , "RHS" : "(p ∨ q) ∧ (p ∨ r)" , "level":0},
        {"name" : "id1" , "text" : "Identity of ∨" , "LHS" : "p ∨ ⊥" , "RHS" : "p" , "level":0},
        {"name" : "id2" , "text" : "Identity of ∧" , "LHS" : "p ∧ ⊤" , "RHS" : "p" , "level":0},
        {"name" : "comp1" , "text" : "Complement with ∨" , "LHS" : "p ∨ ¬p" , "RHS" : "⊤" , "level":0},
        {"name" : "comp2" , "text" : "Complement with ∧" , "LHS" : "p ∧ ¬p" , "RHS" : "⊥" , "level":0},
        {"name" : "defimpl" , "text" : "Definition of →" , "LHS" : "p → q" , "RHS" : "¬p ∨ q" , "level":1},
        {"name" : "defbiimpl" , "text" : "Definition of ↔" , "LHS" : "p ↔ q" , "RHS" : "(p→q) ∧ (q→p)" , "level":1},
        {"name" : "idem1" , "text" : "Idempotence of ∨" , "LHS" : "p ∨ p" , "RHS" : "p" , "level":2},
        {"name" : "idem2" , "text" : "Idempotence of ∧" , "LHS" : "p ∧ p" , "RHS" : "p" , "level":2},
        {"name" : "dblc" , "text" : "Double negation" , "LHS" : "¬¬p" , "RHS" : "p" , "level":2},
        {"name" : "ann1" , "text" : "Annihilation of ∨" , "LHS" : "p ∨ ⊤" , "RHS" : "⊤" , "level":2},
        {"name" : "ann0" , "text" : "Annihilation of ∧" , "LHS" : "p ∧ ⊥" , "RHS" : "⊥" , "level":2},
        {"name" : "dem1" , "text" : "De Morgan's, ¬ over ∨" , "LHS" : "¬(p ∨ q)" , "RHS" : "¬p ∧ ¬q" , "level":2},
        {"name" : "dem2" , "text" : "De Morgan's, ¬ over ∧" , "LHS" : "¬(p ∧ q)" , "RHS" : "¬p ∨ ¬q" , "level":2},
        {"name" : "comp0" , "text" : "Complement of ⊥" , "LHS" : "¬⊥" , "RHS" : "⊤" , "level":2},
        {"name" : "comp3" , "text" : "Complement of ⊤" , "LHS" : "¬⊤" , "RHS" : "⊥" , "level":2},
        {"name" : "absorb1" , "text" : "Absorption of ∧  over ∨" , "LHS" : "(p ∨ q) ∧ p" , "RHS" : "p" , "level":2},
        {"name" : "absorb2" , "text" : "Absorption of ∨ over ∧" , "LHS" : "(p ∧ q) ∨ p" , "RHS" : "p" , "level":2}
    ];

    /**
     * Compare two AST trees for equality
     */
    function equals(t1, t2) {
        if (t1.root !== t2.root) return false;
        if (t1.children.length !== t2.children.length) return false;
        for(let i = 0; i < t1.children.length; i++) {
            if (!equals(t1.children[i], t2.children[i])) return false;
        }
        return true;
    }

    /**
     * Apply rule with error checking (finds single subexpression where rule applies)
     */
    function applyRule(ruleFunc, t1, t2, symmetric) {
        if(equals(t1, t2)) return ERR_EQ;
        if(ruleFunc(t1, t2) || (symmetric && ruleFunc(t2, t1))) return SUCCESS;
        if(t1.root !== t2.root || t1.children.length !== t2.children.length) return ERR_WRONG_RULE;

        let diff_child = -1;
        for(let i = 0; i < t1.children.length; i++) {
            if(!equals(t1.children[i], t2.children[i])) {
                if(diff_child !== -1) return ERR_WRONG_RULE;
                diff_child = i;
            }
        }
        return applyRule(ruleFunc, t1.children[diff_child], t2.children[diff_child], symmetric);
    }

    /**
     * Validate implication definition: p→q ≡ ¬p ∨ q
     */
    function validateImplicationDef(t1, t2) {
        return (t1.root === '>') &&
               (t2.root === '|') &&
               (t2.children[0].root === '!') &&
               equals(t1.children[0], t2.children[0].children[0]) &&
               equals(t1.children[1], t2.children[1]);
    }

    /**
     * Validate biconditional definition: p↔q ≡ (p→q) ∧ (q→p)
     */
    function validateBiconditionalDef(t1, t2) {
        return (t1.root === '~') &&
               (t2.root === '&') &&
               (t2.children[0].root === '>') &&
               (t2.children[1].root === '>') &&
               equals(t1.children[0], t2.children[0].children[0]) &&
               equals(t1.children[0], t2.children[1].children[1]) &&
               equals(t1.children[1], t2.children[0].children[1]) &&
               equals(t1.children[1], t2.children[1].children[0]);
    }

    /**
     * Validate absorption rule: (p op1 q) op2 p ≡ p
     */
    function validateAbsorption(op1, op2, t1, t2) {
        return (t1.root === op2) &&
               (t1.children[0].root === op1) &&
               equals(t1.children[1], t2) &&
               equals(t1.children[1], t1.children[0].children[0]);
    }

    /**
     * Validate annihilation rule: p op annihilator ≡ annihilator
     */
    function validateAnnihilation(ident, op, t1, t2) {
        return (t1.root === op) &&
               (t1.children[1].root === ident) &&
               (t2.root === ident);
    }

    /**
     * Validate De Morgan's rule: ¬(p op1 q) ≡ ¬p op2 ¬q
     */
    function validateDeMorgan(op1, comp, op2, t1, t2) {
        return (t1.root === comp) &&
               (t1.children[0].root === op1) &&
               (t2.root === op2) &&
               (t2.children[0].root === comp) &&
               (t2.children[1].root === comp) &&
               equals(t1.children[0].children[0], t2.children[0].children[0]) &&
               equals(t1.children[0].children[1], t2.children[1].children[0]);
    }

    /**
     * Validate complement of constants rule: ¬constant1 ≡ constant2
     */
    function validateComplementConstant(ident1, ident2, comp, t1, t2) {
        return (t1.root === comp) &&
               (t1.children[0].root === ident1) &&
               (t2.root === ident2);
    }

    // Rule validation functions for Propositional Logic
    const Rules = {
        /**
         * Associativity of ∨: (p ∨ q) ∨ r ≡ p ∨ (q ∨ r)
         */
        assoc1: function(t1, t2) {
            function validate(t1, t2) {
                return (t1.root === '|') && (t2.root === '|') &&
                       (t1.children[0].root === '|') && (t2.children[1].root === '|') &&
                       equals(t1.children[0].children[0], t2.children[0]) &&
                       equals(t1.children[0].children[1], t2.children[1].children[0]) &&
                       equals(t1.children[1], t2.children[1].children[1]);
            }
            return applyRule(validate, t1, t2, true);
        },

        /**
         * Associativity of ∧ : (p ∧ q) ∧ r ≡ p ∧ (q ∧ r)
         */
        assoc2: function(t1, t2) {
            function validate(t1, t2) {
                return (t1.root === '&') && (t2.root === '&') &&
                       (t1.children[0].root === '&') && (t2.children[1].root === '&') &&
                       equals(t1.children[0].children[0], t2.children[0]) &&
                       equals(t1.children[0].children[1], t2.children[1].children[0]) &&
                       equals(t1.children[1], t2.children[1].children[1]);
            }
            return applyRule(validate, t1, t2, true);
        },

        /**
         * Commutativity of ∨: p ∨ q ≡ q ∨ p
         */
        comm1: function(t1, t2) {
            function validate(t1, t2) {
                return (t1.root === '|') && (t2.root === '|') &&
                       equals(t1.children[0], t2.children[1]) &&
                       equals(t1.children[1], t2.children[0]);
            }
            return applyRule(validate, t1, t2, false);
        },

        /**
         * Commutativity of ∧ : p ∧ q ≡ q ∧ p
         */
        comm2: function(t1, t2) {
            function validate(t1, t2) {
                return (t1.root === '&') && (t2.root === '&') &&
                       equals(t1.children[0], t2.children[1]) &&
                       equals(t1.children[1], t2.children[0]);
            }
            return applyRule(validate, t1, t2, false);
        },

        /**
         * Distributivity of ∧  over ∨: p ∧ (q ∨ r) ≡ (p ∧ q) ∨ (p ∧ r)
         */
        dist1: function(t1, t2) {
            function validate(t1, t2) {
                return (t1.root === '&') && (t2.root === '|') &&
                       (t1.children[1].root === '|') && (t2.children[0].root === '&') &&
                       (t2.children[1].root === '&') &&
                       equals(t1.children[0], t2.children[0].children[0]) &&
                       equals(t1.children[0], t2.children[1].children[0]) &&
                       equals(t1.children[1].children[0], t2.children[0].children[1]) &&
                       equals(t1.children[1].children[1], t2.children[1].children[1]);
            }
            return applyRule(validate, t1, t2, true);
        },

        /**
         * Distributivity of ∨ over ∧ : p ∨ (q ∧ r) ≡ (p ∨ q) ∧ (p ∨ r)
         */
        dist2: function(t1, t2) {
            function validate(t1, t2) {
                return (t1.root === '|') && (t2.root === '&') &&
                       (t1.children[1].root === '&') && (t2.children[0].root === '|') &&
                       (t2.children[1].root === '|') &&
                       equals(t1.children[0], t2.children[0].children[0]) &&
                       equals(t1.children[0], t2.children[1].children[0]) &&
                       equals(t1.children[1].children[0], t2.children[0].children[1]) &&
                       equals(t1.children[1].children[1], t2.children[1].children[1]);
            }
            return applyRule(validate, t1, t2, true);
        },

        /**
         * Identity of ∨: p ∨ ⊥ ≡ p
         */
        id1: function(t1, t2) {
            function validate(t1, t2) {
                return (t1.root === '|') && (t1.children[1].root === '0') &&
                       equals(t1.children[0], t2);
            }
            return applyRule(validate, t1, t2, true);
        },

        /**
         * Identity of ∧ : p ∧ ⊤ ≡ p
         */
        id2: function(t1, t2) {
            function validate(t1, t2) {
                return (t1.root === '&') && (t1.children[1].root === '1') &&
                       equals(t1.children[0], t2);
            }
            return applyRule(validate, t1, t2, true);
        },

        /**
         * Complement with ∨: p ∨ ¬p ≡ ⊤
         */
        comp1: function(t1, t2) {
            function validate(t1, t2) {
                return (t1.root === '|') && (t2.root === '1') &&
                       (t1.children[1].root === '!') &&
                       equals(t1.children[0], t1.children[1].children[0]);
            }
            return applyRule(validate, t1, t2, true);
        },

        /**
         * Complement with ∧ : p ∧ ¬p ≡ ⊥
         */
        comp2: function(t1, t2) {
            function validate(t1, t2) {
                return (t1.root === '&') && (t2.root === '0') &&
                       (t1.children[1].root === '!') &&
                       equals(t1.children[0], t1.children[1].children[0]);
            }
            return applyRule(validate, t1, t2, true);
        },

        /**
         * Definition of implication: p→q ≡ ¬p ∨ q
         */
        defimpl: function(t1, t2) {
            return applyRule(validateImplicationDef, t1, t2, true);
        },

        /**
         * Definition of biconditional: p↔q ≡ (p→q) ∧ (q→p)
         */
        defbiimpl: function(t1, t2) {
            return applyRule(validateBiconditionalDef, t1, t2, true);
        },

        /**
         * Idempotence of ∨: p ∨ p ≡ p
         */
        idem1: function(t1, t2) {
            function validate(t1, t2) {
                return (t1.root === '|') &&
                       equals(t1.children[0], t1.children[1]) &&
                       equals(t1.children[0], t2);
            }
            return applyRule(validate, t1, t2, true);
        },

        /**
         * Idempotence of ∧ : p ∧ p ≡ p
         */
        idem2: function(t1, t2) {
            function validate(t1, t2) {
                return (t1.root === '&') &&
                       equals(t1.children[0], t1.children[1]) &&
                       equals(t1.children[0], t2);
            }
            return applyRule(validate, t1, t2, true);
        },

        /**
         * Double negation: ¬¬p ≡ p
         */
        dblc: function(t1, t2) {
            function validate(t1, t2) {
                return (t1.root === '!') && (t1.children[0].root === '!') &&
                       equals(t1.children[0].children[0], t2);
            }
            return applyRule(validate, t1, t2, true);
        },

        /**
         * Annihilation of ∨: p ∨ ⊤ ≡ ⊤
         */
        ann1: function(t1, t2) {
            return applyRule((t1, t2) => validateAnnihilation('1', '|', t1, t2), t1, t2, true);
        },

        /**
         * Annihilation of ∧ : p ∧ ⊥ ≡ ⊥
         */
        ann0: function(t1, t2) {
            return applyRule((t1, t2) => validateAnnihilation('0', '&', t1, t2), t1, t2, true);
        },

        /**
         * De Morgan's law: ¬(p ∨ q) ≡ ¬p ∧ ¬q
         */
        dem1: function(t1, t2) {
            return applyRule((t1, t2) => validateDeMorgan('|', '!', '&', t1, t2), t1, t2, true);
        },

        /**
         * De Morgan's law: ¬(p ∧ q) ≡ ¬p ∨ ¬q
         */
        dem2: function(t1, t2) {
            return applyRule((t1, t2) => validateDeMorgan('&', '!', '|', t1, t2), t1, t2, true);
        },

        /**
         * Complement of ⊥: ¬⊥ ≡ ⊤
         */
        comp0: function(t1, t2) {
            return applyRule((t1, t2) => validateComplementConstant('0', '1', '!', t1, t2), t1, t2, true);
        },

        /**
         * Complement of ⊤: ¬⊤ ≡ ⊥
         */
        comp3: function(t1, t2) {
            return applyRule((t1, t2) => validateComplementConstant('1', '0', '!', t1, t2), t1, t2, true);
        },

        /**
         * Absorption of ∧  over ∨: (p ∨ q) ∧ p ≡ p
         */
        absorb1: function(t1, t2) {
            return applyRule((t1, t2) => validateAbsorption('|', '&', t1, t2), t1, t2, true);
        },

        /**
         * Absorption of ∨ over ∧ : (p ∧ q) ∨ p ≡ p
         */
        absorb2: function(t1, t2) {
            return applyRule((t1, t2) => validateAbsorption('&', '|', t1, t2), t1, t2, true);
        }
    };

    /**
     * Get rule by name
     */
    function getRule(ruleName) {
        return Rules[ruleName] || null;
    }

    /**
     * Get rule definition by name
     */
    function getRuleDefinition(ruleName) {
        return RULE_DEFINITIONS.find(rule => rule.name === ruleName) || null;
    }

    /**
     * Get all rule names
     */
    function getRuleNames() {
        return Object.keys(Rules);
    }

    /**
     * Get rules by level
     */
    function getRulesByLevel(level) {
        return RULE_DEFINITIONS
            .filter(rule => rule.level === level)
            .map(rule => rule.name);
    }

    /**
     * Validate a proof step using a specific rule
     */
    function validateStep(fromAST, toAST, ruleName) {
        const rule = getRule(ruleName);
        if (!rule) {
            return {
                success: false,
                error: `Unknown rule: ${ruleName}`
            };
        }

        try {
            const result = rule(fromAST, toAST);
            return {
                success: result === SUCCESS,
                error: result !== SUCCESS ? result : null,
                rule: getRuleDefinition(ruleName)
            };
        } catch (error) {
            return {
                success: false,
                error: `Rule validation error: ${error.message}`
            };
        }
    }

    // Public API
    return {
        // Theory information
        info: THEORY_INFO,
        symbols: SYMBOLS,
        equality: EQUALITY,
        rules: RULE_DEFINITIONS,
        
        // Rule functions
        ruleFunctions: Rules,
        
        // Utility functions
        getRule: getRule,
        getRuleDefinition: getRuleDefinition,
        getRuleNames: getRuleNames,
        getRulesByLevel: getRulesByLevel,
        validateStep: validateStep,
        
        // Core validation constants
        SUCCESS: SUCCESS,
        ERR_EQ: ERR_EQ,
        ERR_TOO_MANY: ERR_TOO_MANY,
        ERR_WRONG_RULE: ERR_WRONG_RULE
    };
})();