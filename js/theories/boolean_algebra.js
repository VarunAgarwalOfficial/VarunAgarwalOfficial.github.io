/**
 * Boolean Algebra Module
 * 
 * Complete theory definition for Boolean algebra with  ∨ ,  ∧ , ¬ operations
 * Self-contained with all symbols, rules, and validation logic
 */

window.ProofAssistant = window.ProofAssistant || {};
window.ProofAssistant.Theories = window.ProofAssistant.Theories || {};

window.ProofAssistant.Theories.BooleanAlgebra = (function() {
    'use strict';

    // Theory metadata
    const THEORY_INFO = {
        name: 'bool_alg',
        displayName: 'Boolean Algebra',
        description: 'Boolean algebra with  ∨ ,  ∧ , ¬ operators and constants 0, 1'
    };

    // Result constants for rule validation
    const SUCCESS = 'Success';
    const ERR_EQ = 'No rule has been applied';
    const ERR_TOO_MANY = 'Too many changes have been made. Please only apply the rule in one place';
    const ERR_WRONG_RULE = 'The chosen rule does not apply';

    // Symbol definitions
    const SYMBOLS = [
        {"id" : "0" , "name" : "Zero",            "display" : "0", "text" : "0", "latex" : "0",  "arity":0},
        {"id" : "1" , "name" : "One",             "display" : "1", "text" : "1", "latex" : "1",  "arity":0},
        {"id" : "!" , "name" : "Complement",      "display" : "'", "text" : "'", "latex" : "'",  "arity":-1},
        {"id" : "|" , "name" : "Join",            "display" : "∨", "text" : "∨", "latex" : "\\vee" , "arity":2},
        {"id" : "&" , "name" : "Meet",            "display" : "∧", "text" : "∧", "latex" : "\\wedge" , "arity":2}
    ];

    // Equality symbol
    const EQUALITY = {"display" : "=" , "markdown" : "=" , "latex" : "="};

    // Rule definitions
    const RULE_DEFINITIONS = [
        {"name" : "assoc1" , "text" : "Associativity of ∨" , "LHS" : "(x ∨ y) ∨ z" , "RHS" : "x ∨ (y ∨ z)" , "level":0},
        {"name" : "assoc2" , "text" : "Associativity of  ∧" , "LHS" : "(x ∧ y) ∧ z" , "RHS" : "x ∧ (y ∧ z)" , "level":0},
        {"name" : "comm1" , "text" : "Commutativity of  ∨" , "LHS" : "x ∨ y" , "RHS" : "y ∨ x" , "level":0},
        {"name" : "comm2" , "text" : "Commutativity of  ∧" , "LHS" : "x ∧ y" , "RHS" : "y ∧ x" , "level":0},
        {"name" : "dist1" , "text" : "Distributivity of ∧ over ∨" , "LHS" : "x ∧ (y ∨ z)" , "RHS" : "(x ∧ y) ∨ (x ∧ z)" , "level":0},
        {"name" : "dist2" , "text" : "Distributivity of ∨ over ∧" , "LHS" : "x ∨ (y ∧ z)" , "RHS" : "(x ∨ y) ∧ (x ∨ z)" , "level":0},
        {"name" : "id1" , "text" : "Identity of  ∨" , "LHS" : "x ∨ 0" , "RHS" : "x" , "level":0},
        {"name" : "id2" , "text" : "Identity of  ∧" , "LHS" : "x ∧ 1" , "RHS" : "x" , "level":0},
        {"name" : "comp1" , "text" : "Complement with  ∨" , "LHS" : "x ∨ x'" , "RHS" : "1" , "level":0},
        {"name" : "comp2" , "text" : "Complement with  ∧" , "LHS" : "x ∧ x'" , "RHS" : "0" , "level":0},
        {"name" : "idem1" , "text" : "Idempotence of  ∨" , "LHS" : "x ∨ x" , "RHS" : "x" , "level":2},
        {"name" : "idem2" , "text" : "Idempotence of  ∧" , "LHS" : "x ∧ x" , "RHS" : "x" , "level":2},
        {"name" : "dblc" , "text" : "Double complement" , "LHS" : "x''" , "RHS" : "x" , "level":2},
        {"name" : "ann1" , "text" : "Annihilation of ∨" , "LHS" : "x ∨ 1" , "RHS" : "1" , "level":2},
        {"name" : "ann0" , "text" : "Annihilation of ∧" , "LHS" : "x ∧ 0" , "RHS" : "0" , "level":2},
        {"name" : "dem1" , "text" : "De Morgan's, ' over  ∨" , "LHS" : "(x ∨ y)'" , "RHS" : "x' ∧ y'" , "level":2},
        {"name" : "dem2" , "text" : "De Morgan's, ' over  ∧" , "LHS" : "(x ∧ y)'" , "RHS" : "x' ∨ y'" , "level":2},
        {"name" : "comp0" , "text" : "Complement of 0" , "LHS" : "0'" , "RHS" : "1" , "level":2},
        {"name" : "comp3" , "text" : "Complement of 1" , "LHS" : "1'" , "RHS" : "0" , "level":2}
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
     * Validate annihilation rule: x op annihilator ≡ annihilator
     */
    function validateAnnihilation(ident, op, t1, t2) {
        return (t1.root === op) &&
               (t1.children[1].root === ident) &&
               (t2.root === ident);
    }

    /**
     * Validate De Morgan's rule: complement(x op1 y) ≡ complement(x) op2 complement(y)
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
     * Validate complement of constants rule: complement(constant1) ≡ constant2
     */
    function validateComplementConstant(ident1, ident2, comp, t1, t2) {
        return (t1.root === comp) &&
               (t1.children[0].root === ident1) &&
               (t2.root === ident2);
    }

    // Rule validation functions for Boolean Algebra
    const Rules = {
        /**
         * Associativity of  ∨ : (x ∨ y) ∨ z ≡ x ∨ (y ∨ z)
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
         * Associativity of  ∧ : (x ∧ y) ∧ z ≡ x ∧ (y ∧ z)
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
         * Commutativity of  ∨ : x ∨ y ≡ y ∨ x
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
         * Commutativity of  ∧ : x ∧ y ≡ y ∧ x
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
         * Distributivity of ∧ over  ∨ : x ∧ (y ∨ z) ≡ (x ∧ y) ∨ (x ∧ z)
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
         * Distributivity of ∨ over  ∧ : x ∨ (y ∧ z) ≡ (x ∨ y) ∧ (x ∨ z)
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
         * Identity of  ∨ : x ∨ 0 ≡ x
         */
        id1: function(t1, t2) {
            function validate(t1, t2) {
                return (t1.root === '|') && (t1.children[1].root === '0') &&
                       equals(t1.children[0], t2);
            }
            return applyRule(validate, t1, t2, true);
        },

        /**
         * Identity of  ∧ : x ∧ 1 ≡ x
         */
        id2: function(t1, t2) {
            function validate(t1, t2) {
                return (t1.root === '&') && (t1.children[1].root === '1') &&
                       equals(t1.children[0], t2);
            }
            return applyRule(validate, t1, t2, true);
        },

        /**
         * Complement with  ∨ : x ∨ x' ≡ 1
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
         * Complement with  ∧ : x ∧ x' ≡ 0
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
         * Idempotence of  ∨ : x ∨ x ≡ x
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
         * Idempotence of  ∧ : x ∧ x ≡ x
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
         * Double complement: x'' ≡ x
         */
        dblc: function(t1, t2) {
            function validate(t1, t2) {
                return (t1.root === '!') && (t1.children[0].root === '!') &&
                       equals(t1.children[0].children[0], t2);
            }
            return applyRule(validate, t1, t2, true);
        },

        /**
         * Annihilation of  ∨ : x ∨ 1 ≡ 1
         */
        ann1: function(t1, t2) {
            return applyRule((t1, t2) => validateAnnihilation('1', '|', t1, t2), t1, t2, true);
        },

        /**
         * Annihilation of  ∧ : x ∧ 0 ≡ 0
         */
        ann0: function(t1, t2) {
            return applyRule((t1, t2) => validateAnnihilation('0', '&', t1, t2), t1, t2, true);
        },

        /**
         * De Morgan's law: (x ∨ y)' ≡ x' ∧ y'
         */
        dem1: function(t1, t2) {
            return applyRule((t1, t2) => validateDeMorgan('|', '!', '&', t1, t2), t1, t2, true);
        },

        /**
         * De Morgan's law: (x ∧ y)' ≡ x' ∨ y'
         */
        dem2: function(t1, t2) {
            return applyRule((t1, t2) => validateDeMorgan('&', '!', '|', t1, t2), t1, t2, true);
        },

        /**
         * Complement of 0: 0' ≡ 1
         */
        comp0: function(t1, t2) {
            return applyRule((t1, t2) => validateComplementConstant('0', '1', '!', t1, t2), t1, t2, true);
        },

        /**
         * Complement of 1: 1' ≡ 0
         */
        comp3: function(t1, t2) {
            return applyRule((t1, t2) => validateComplementConstant('1', '0', '!', t1, t2), t1, t2, true);
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