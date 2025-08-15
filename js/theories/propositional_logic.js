/**
 * Propositional Logic
 */

window.ProofAssistant = window.ProofAssistant || {};
window.ProofAssistant.Theories = window.ProofAssistant.Theories || {};

window.ProofAssistant.Theories.PropositionalLogic = window.ProofAssistant.Theory.createTheory({
    info: {
        name: 'prop_logic',
        displayName: 'Propositional Logic',
        description: 'Propositional logic is the branch of logic that studies how truth values of whole statements (propositions) combine and relate using logical connectives like AND, OR, and NOT.'
    },
    symbols: [
        {"id": "0", "name": "False", "display": "⊥", "text": "⊥", "markdown": "⊥", "latex": "\\bot", "arity": 0},
        {"id": "1", "name": "True", "display": "⊤", "text": "⊤", "markdown": "⊤", "latex": "\\top", "arity": 0},
        {"id": "!", "name": "Negation", "display": "¬", "text": "¬", "markdown": "¬", "latex": "\\neg", "arity": 1},
        {"id": "|", "name": "Disjunction", "display": "∨", "text": "∨", "markdown": "∨", "latex": "\\lor", "arity": 2},
        {"id": "&", "name": "Conjunction", "display": "∧", "text": "∧", "markdown": "∧", "latex": "\\land", "arity": 2},
        {"id": ">", "name": "Implication", "display": "→", "text": "→", "markdown": "→", "latex": "\\rightarrow", "arity": 2},
        {"id": "~", "name": "Biconditional", "display": "↔", "text": "↔", "markdown": "↔", "latex": "\\leftrightarrow", "arity": 2}
    ],
    equality: {"display": "≡", "markdown": "≡", "latex": "\\equiv"},
    rules: [
        // Level 0 - Basic Laws
        {"name": "assoc_or", "text": "Associativity of OR", "LHS": "(p ∨ q) ∨ r", "RHS": "p ∨ (q ∨ r)", "level": 0},
        {"name": "assoc_and", "text": "Associativity of AND", "LHS": "(p ∧ q) ∧ r", "RHS": "p ∧ (q ∧ r)", "level": 0},
        {"name": "comm_or", "text": "Commutatitivity of OR", "LHS": "p ∨ q", "RHS": "q ∨ p", "level": 0},
        {"name": "comm_and", "text": "Commutatitivity of AND", "LHS": "p ∧ q", "RHS": "q ∧ p", "level": 0},
        {"name": "dist_and_or", "text": "Distributivity of AND over OR", "LHS": "p ∧ (q ∨ r)", "RHS": "(p ∧ q) ∨ (p ∧ r)", "level": 0},
        {"name": "dist_or_and", "text": "Distributivity of OR over AND", "LHS": "p ∨ (q ∧ r)", "RHS": "(p ∨ q) ∧ (p ∨ r)", "level": 0},
        {"name": "id_or", "text": "Identity of OR", "LHS": "p ∨ ⊥", "RHS": "p", "level": 0},
        {"name": "id_and", "text": "Identity of AND", "LHS": "p ∧ ⊤", "RHS": "p", "level": 0},
        {"name": "comp_or", "text": "Complement with OR", "LHS": "p ∨ ¬p", "RHS": "⊤", "level": 0},
        {"name": "comp_and", "text": "Complement with AND", "LHS": "p ∧ ¬p", "RHS": "⊥", "level": 0},
        
        // Level 1 - Definitions
        {"name": "impl_def", "text": "Definition of Implication", "LHS": "p → q", "RHS": "¬p ∨ q", "level": 1},
        {"name": "bicond_def", "text": "Definition of Bi-implication", "LHS": "p ↔ q", "RHS": "(p → q) ∧ (q → p)", "level": 1},
        
        // Level 2 - Derived Laws
        {"name": "idem_or", "text": "Idempotence of OR", "LHS": "p ∨ p", "RHS": "p", "level": 2},
        {"name": "idem_and", "text": "Idempotence of AND", "LHS": "p ∧ p", "RHS": "p", "level": 2},
        {"name": "dbl_neg", "text": "Double negation", "LHS": "¬¬p", "RHS": "p", "level": 2},
        {"name": "ann_or", "text": "Annihilation of OR", "LHS": "p ∨ ⊤", "RHS": "⊤", "level": 2},
        {"name": "ann_and", "text": "Annihilation of AND", "LHS": "p ∧ ⊥", "RHS": "⊥", "level": 2},
        {"name": "dem_or", "text": "De Morgan's, ¬ over OR", "LHS": "¬(p ∨ q)", "RHS": "¬p ∧ ¬q", "level": 2},
        {"name": "dem_and", "text": "De Morgan's, ¬ over AND", "LHS": "¬(p ∧ q)", "RHS": "¬p ∨ ¬q", "level": 2},
        {"name": "comp_false", "text": "Complement of ⊥", "LHS": "¬⊥", "RHS": "⊤", "level": 2},
        {"name": "comp_true", "text": "Complement of ⊤", "LHS": "¬⊤", "RHS": "⊥", "level": 2},
        {"name": "abs_and_or", "text": "Absorption of AND over OR", "LHS": "p ∧ (p ∨ q)", "RHS": "p", "level": 2},
        {"name": "abs_or_and", "text": "Absorption of OR over AND", "LHS": "p ∨ (p ∧ q)", "RHS": "p", "level": 2}
    ]
});