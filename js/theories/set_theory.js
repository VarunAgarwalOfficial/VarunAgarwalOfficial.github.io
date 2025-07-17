/**
 * Set Theory Module
 * 
 * Complete theory definition for set theory with ∪ , ∩, ∅, 𝓤, complement operations
 * Self-contained with all symbols, rules, and validation logic
 */

window.ProofAssistant = window.ProofAssistant || {};
window.ProofAssistant.Theories = window.ProofAssistant.Theories || {};

window.ProofAssistant.Theories.SetTheory = (function() {
    'use strict';

    // Theory metadata
    const THEORY_INFO = {
        name: 'set_theory',
        displayName: 'Set Theory',
        description: 'Set theory with union, intersection, complement, and difference operations'
    };

    // Result constants for rule validation
    const SUCCESS = 'Success';
    const ERR_EQ = 'No rule has been applied';
    const ERR_TOO_MANY = 'Too many changes have been made. Please only apply the rule in one place';
    const ERR_WRONG_RULE = 'The chosen rule does not apply';

    // Symbol definitions
    const SYMBOLS = [
        {"id" : "0" , "name" : "Empty set",            "display" : "∅", "text" : "∅" , "markdown" : "∅" , "latex" : "\\emptyset",  "arity":0},
        {"id" : "1" , "name" : "Universal set",        "display" : "𝓤", "text" : "𝓤" , "markdown" : "𝓤" , "latex" : "\\mathcal{U}" , "arity":0},
        {"id" : "!" , "name" : "Complement",           "display" : "∁", "text" : "ᶜ" , "markdown" : "ᶜ", "latex" : "^{c}",        "arity":-1},
        {"id" : "|" , "name" : "Union",                "display" : "∪", "text" : "∪" , "markdown" : "∪", "latex" : "\\cup",       "arity":2},
        {"id" : "&" , "name" : "Intersection",         "display" : "∩", "text" : "∩" , "markdown" : "∩", "latex" : "\\cap",       "arity":2},
        {"id" : "-" , "name" : "Set difference",       "display" : "\\" , "text" : "\\" , "markdown" : "\\" , "latex" : "\\setminus",  "arity":2},
        {"id" : "+" , "name" : "Symmetric difference", "display" : "⊕", "text" : "⊕" , "markdown" : "⊕", "latex" : "\\oplus",     "arity":2}
    ];

    // Equality symbol
    const EQUALITY = {"display" : "=" , "markdown" : "=" , "latex" : "="};

    // Rule definitions
    const RULE_DEFINITIONS = [
        {"name" : "assoc1" , "text" : "Associativity of ∪" , "LHS" : "(A ∪ B) ∪ C" , "RHS" : "A ∪ (B ∪ C)" , "level":0},
        {"name" : "assoc2" , "text" : "Associativity of ∩" , "LHS" : "(A ∩ B) ∩ C" , "RHS" : "A ∩ (B ∩ C)" , "level":0},
        {"name" : "comm1" , "text" : "Commutativity of ∪" , "LHS" : "A ∪ B" , "RHS" : "B ∪ A" , "level":0},
        {"name" : "comm2" , "text" : "Commutativity of ∩" , "LHS" : "A ∩ B" , "RHS" : "B ∩ A" , "level":0},
        {"name" : "dist1" , "text" : "Distributivity of ∩ over ∪" , "LHS" : "A ∩ (B ∪ C)" , "RHS" : "(A ∩ B) ∪ (A ∩ C)" , "level":0},
        {"name" : "dist2" , "text" : "Distributivity of ∪  over ∩" , "LHS" : "A ∪ (B ∩ C)" , "RHS" : "(A ∪ B) ∩ (A ∪ C)" , "level":0},
        {"name" : "id1" , "text" : "Identity of ∪" , "LHS" : "A ∪ ∅" , "RHS" : "A" , "level":0},
        {"name" : "id2" , "text" : "Identity of ∩" , "LHS" : "A ∩ 𝓤" , "RHS" : "A" , "level":0},
        {"name" : "comp1" , "text" : "Complement with ∪" , "LHS" : "A ∪ Aᶜ" , "RHS" : "𝓤" , "level":0},
        {"name" : "comp2" , "text" : "Complement with ∩" , "LHS" : "A ∩ Aᶜ" , "RHS" : "∅" , "level":0},
        {"name" : "defdiff" , "text" : "Definition of \\" , "LHS" : "A \\ B" , "RHS" : "A ∩ Bᶜ" , "level":1},
        {"name" : "defsd" , "text" : "Definition of ⊕" , "LHS" : "A ⊕ B" , "RHS" : "(A ∩ Bᶜ) ∪ (Aᶜ ∩ B)" , "level":1},
        {"name" : "idem1" , "text" : "Idempotence of ∪" , "LHS" : "A ∪ A" , "RHS" : "A" , "level":2},
        {"name" : "idem2" , "text" : "Idempotence of ∩" , "LHS" : "A ∩ A" , "RHS" : "A" , "level":2},
        {"name" : "dblc" , "text" : "Double complement" , "LHS" : "Aᶜᶜ" , "RHS" : "A" , "level":2}
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
     * Validate set difference definition: A\B ≡ A ∩ Bᶜ
     */
    function validateSetDifference(t1, t2) {
        return (t1.root === '-') &&
               (t2.root === '&') &&
               (t2.children[1].root === '!') &&
               equals(t1.children[0], t2.children[0]) &&
               equals(t1.children[1], t2.children[1].children[0]);
    }

    /**
     * Validate symmetric difference definition: A⊕B ≡ (A ∩ Bᶜ) ∪ (Aᶜ ∩ B)
     */
    function validateSymmetricDifference(t1, t2) {
        return (t1.root === '+') &&
               (t2.root === '|') &&
               (t2.children[0].root === '&') &&
               (t2.children[1].root === '&') &&
               (t2.children[0].children[1].root === '!') &&
               (t2.children[1].children[0].root === '!') &&
               equals(t1.children[0], t2.children[0].children[0]) &&
               equals(t1.children[0], t2.children[1].children[0].children[0]) &&
               equals(t1.children[1], t2.children[0].children[1].children[0]) &&
               equals(t1.children[1], t2.children[1].children[1]);
    }

    // Rule validation functions for Set Theory
    const Rules = {
        /**
         * Associativity of ∪ : (A ∪ B) ∪ C ≡ A ∪ (B ∪ C)
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
         * Associativity of ∩: (A ∩ B) ∩ C ≡ A ∩ (B ∩ C)
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
         * Commutativity of ∪ : A ∪ B ≡ B ∪ A
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
         * Commutativity of ∩: A ∩ B ≡ B ∩ A
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
         * Distributivity of ∩ over ∪ : A ∩ (B ∪ C) ≡ (A ∩ B) ∪ (A ∩ C)
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
         * Distributivity of ∪  over ∩: A ∪ (B ∩ C) ≡ (A ∪ B) ∩ (A ∪ C)
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
         * Identity of ∪ : A ∪ ∅ ≡ A
         */
        id1: function(t1, t2) {
            function validate(t1, t2) {
                return (t1.root === '|') && (t1.children[1].root === '0') &&
                       equals(t1.children[0], t2);
            }
            return applyRule(validate, t1, t2, true);
        },

        /**
         * Identity of ∩: A ∩ 𝓤 ≡ A
         */
        id2: function(t1, t2) {
            function validate(t1, t2) {
                return (t1.root === '&') && (t1.children[1].root === '1') &&
                       equals(t1.children[0], t2);
            }
            return applyRule(validate, t1, t2, true);
        },

        /**
         * Complement with ∪ : A ∪ Aᶜ ≡ 𝓤
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
         * Complement with ∩: A ∩ Aᶜ ≡ ∅
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
         * Definition of set difference: A\B ≡ A ∩ Bᶜ
         */
        defdiff: function(t1, t2) {
            return applyRule(validateSetDifference, t1, t2, true);
        },

        /**
         * Definition of symmetric difference: A⊕B ≡ (A ∩ Bᶜ) ∪ (Aᶜ ∩ B)
         */
        defsd: function(t1, t2) {
            return applyRule(validateSymmetricDifference, t1, t2, true);
        },

        /**
         * Idempotence of ∪ : A ∪ A ≡ A
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
         * Idempotence of ∩: A ∩ A ≡ A
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
         * Double complement: Aᶜᶜ ≡ A
         */
        dblc: function(t1, t2) {
            function validate(t1, t2) {
                return (t1.root === '!') && (t1.children[0].root === '!') &&
                       equals(t1.children[0].children[0], t2);
            }
            return applyRule(validate, t1, t2, true);
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