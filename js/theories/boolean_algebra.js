/**
 * Boolean Algebra Definition - Updated with specified laws only
 */

window.ProofAssistant = window.ProofAssistant || {};
window.ProofAssistant.Theories = window.ProofAssistant.Theories || {};

window.ProofAssistant.Theories.BooleanAlgebra = (function() {
    'use strict';

    // Theory metadata
    const THEORY_INFO = {
        name: 'bool_alg',
        displayName: 'Boolean Algebra',
        description: 'Boolean algebra with ∨, ∧, ¬ operators and constants 0, 1'
    };

    // Symbol definitions
    const SYMBOLS = [
        {"id": "0", "name": "Zero", "display": "0", "text": "0", "latex": "0", "arity": 0},
        {"id": "1", "name": "One", "display": "1", "text": "1", "latex": "1", "arity": 0},
        {"id": "!", "name": "Complement", "display": "'", "text": "'", "latex": "'", "arity": -1},
        {"id": "|", "name": "Boolean OR", "display": "∨", "text": "∨", "latex": "\\lor", "arity": 2},
        {"id": "&", "name": "Boolean AND", "display": "∧", "text": "∧", "latex": "\\land", "arity": 2}
    ];

    // Rule definitions - only the specified laws
    const RULES = [
        // Level 0 - Basic Laws
        {"name": "assoc_or", "text": "Associativity of OR", "LHS": "(x ∨ y) ∨ z", "RHS": "x ∨ (y ∨ z)", "level": 0},
        {"name": "assoc_and", "text": "Associativity of AND", "LHS": "(x ∧ y) ∧ z", "RHS": "x ∧ (y ∧ z)", "level": 0},
        {"name": "comm_or", "text": "Commutativity of OR", "LHS": "x ∨ y", "RHS": "y ∨ x", "level": 0},
        {"name": "comm_and", "text": "Commutativity of AND", "LHS": "x ∧ y", "RHS": "y ∧ x", "level": 0},
        {"name": "dist_and_or", "text": "Distributivity of AND over OR", "LHS": "x ∧ (y ∨ z)", "RHS": "(x ∧ y) ∨ (x ∧ z)", "level": 0},
        {"name": "dist_or_and", "text": "Distributivity of OR over AND", "LHS": "x ∨ (y ∧ z)", "RHS": "(x ∨ y) ∧ (x ∨ z)", "level": 0},
        {"name": "id_or", "text": "Identity of OR", "LHS": "x ∨ 0", "RHS": "x", "level": 0},
        {"name": "id_and", "text": "Identity of AND", "LHS": "x ∧ 1", "RHS": "x", "level": 0},
        {"name": "comp_or", "text": "Complement with OR", "LHS": "x ∨ x'", "RHS": "1", "level": 0},
        {"name": "comp_and", "text": "Complement with AND", "LHS": "x ∧ x'", "RHS": "0", "level": 0},

        // Level 2 - Derived Laws
        {"name": "idem_or", "text": "Idempotence of OR", "LHS": "x ∨ x", "RHS": "x", "level": 2},
        {"name": "idem_and", "text": "Idempotence of AND", "LHS": "x ∧ x", "RHS": "x", "level": 2},
        {"name": "dbl_comp", "text": "Double complement", "LHS": "x''", "RHS": "x", "level": 2},
        {"name": "ann_or", "text": "Annihilation of OR", "LHS": "x ∨ 1", "RHS": "1", "level": 2},
        {"name": "ann_and", "text": "Annihilation of AND", "LHS": "x ∧ 0", "RHS": "0", "level": 2},
        {"name": "dem_or", "text": "De Morgan's, ' over OR", "LHS": "(x ∨ y)'", "RHS": "x' ∧ y'", "level": 2},
        {"name": "dem_and", "text": "De Morgan's, ' over AND", "LHS": "(x ∧ y)'", "RHS": "x' ∨ y'", "level": 2},
        {"name": "comp_zero", "text": "Complement of 0", "LHS": "0'", "RHS": "1", "level": 2},
        {"name": "comp_one", "text": "Complement of 1", "LHS": "1'", "RHS": "0", "level": 2}
    ];

    return window.ProofAssistant.Theory.createTheory({
        info: THEORY_INFO,
        symbols: SYMBOLS,
        equality: {"display": "=", "markdown": "=", "latex": "="},
        rules: RULES
    });
})();