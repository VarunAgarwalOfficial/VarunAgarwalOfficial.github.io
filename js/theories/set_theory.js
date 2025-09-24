/**
 * Set Theory
 */

window.ProofAssistant = window.ProofAssistant || {};
window.ProofAssistant.Theories = window.ProofAssistant.Theories || {};

window.ProofAssistant.Theories.SetTheory = window.ProofAssistant.Theory.createTheory({
    info: {
        name: 'set_theory',
        displayName: 'Set Theory',
        description: 'Set theory is the mathematical study of collections of objects, called sets, and the relationships between them'
    },
    symbols: [
        {"id": "0", "name": "Empty set", "display": "∅", "text": "∅", "markdown": "∅", "latex": "\\emptyset", "arity": 0},
        {"id": "1", "name": "Universal set", "display": "𝓤", "text": "𝓤", "markdown": "𝓤", "latex": "\\mathcal{U}", "arity": 0},
        {"id": "!", "name": "Complement", "display": "∁", "text": "ᶜ", "markdown": "ᶜ", "latex": "^{c}", "arity": -1},
        {"id": "|", "name": "Union", "display": "∪", "text": "∪", "markdown": "∪", "latex": "\\cup", "arity": 2},
        {"id": "&", "name": "Intersection", "display": "∩", "text": "∩", "markdown": "∩", "latex": "\\cap", "arity": 2},
        {"id": "-", "name": "Set difference", "display": "\\", "text": "\\", "markdown": "\\", "latex": "\\setminus", "arity": 2},
        {"id": "+", "name": "Symmetric difference", "display": "⊕", "text": "⊕", "markdown": "⊕", "latex": "\\oplus", "arity": 2}
    ],
    equality: {"display": "=", "markdown": "=", "latex": "="},
    rules: [
        // Level 0 - Basic Laws
        {"name": "assoc1", "text": "Associativity of Union", "LHS": "(x ∪ y) ∪ z", "RHS": "x ∪ (y ∪ z)", "level": 0},
        {"name": "assoc2", "text": "Associativity of Intersection", "LHS": "(x ∩ y) ∩ z", "RHS": "x ∩ (y ∩ z)", "level": 0},
        {"name": "comm1", "text": "Commutatitivity of Union", "LHS": "x ∪ y", "RHS": "y ∪ x", "level": 0},
        {"name": "comm2", "text": "Commutatitivity of Intersection", "LHS": "x ∩ y", "RHS": "y ∩ x", "level": 0},
        {"name": "dist1", "text": "Distributivity of Intersection over Union", "LHS": "x ∩ (y ∪ z)", "RHS": "(x ∩ y) ∪ (x ∩ z)", "level": 0},
        {"name": "dist2", "text": "Distributivity of Union over Intersection", "LHS": "x ∪ (y ∩ z)", "RHS": "(x ∪ y) ∩ (x ∪ z)", "level": 0},
        {"name": "id1", "text": "Identity of Union", "LHS": "x ∪ ∅", "RHS": "x", "level": 0},
        {"name": "id2", "text": "Identity of Intersection", "LHS": "x ∩ 𝓤", "RHS": "x", "level": 0},
        {"name": "comp1", "text": "Complement with Union", "LHS": "x ∪ xᶜ", "RHS": "𝓤", "level": 0},
        {"name": "comp2", "text": "Complement with Intersection", "LHS": "x ∩ xᶜ", "RHS": "∅", "level": 0},

        // Level 1 - Definitions
        {"name": "defdiff", "text": "Definition of Set Difference", "LHS": "x \\ y", "RHS": "x ∩ yᶜ", "level": 1},
        {"name": "defsd", "text": "Definition of Symmetric Difference", "LHS": "x ⊕ y", "RHS": "(x \\ y) ∪ (y \\ x)", "level": 1},

        // Level 2 - Derived Laws
        {"name": "idem1", "text": "Idempotence of Union", "LHS": "x ∪ x", "RHS": "x", "level": 2},
        {"name": "idem2", "text": "Idempotence of Intersection", "LHS": "x ∩ x", "RHS": "x", "level": 2},
        {"name": "dblc", "text": "Double complement", "LHS": "xᶜᶜ", "RHS": "x", "level": 2},
        {"name": "dem1", "text": "De Morgan's, ᶜ over ∪", "LHS": "(x ∪ y)ᶜ", "RHS": "xᶜ ∩ yᶜ", "level": 2},
        {"name": "dem2", "text": "De Morgan's, ᶜ over ∩", "LHS": "(x ∩ y)ᶜ", "RHS": "xᶜ ∪ yᶜ", "level": 2},
        {"name": "ann1", "text": "Annihilation of ∪", "LHS": "x ∪ 𝓤", "RHS": "𝓤", "level": 2},
        {"name": "ann2", "text": "Annihilation of ∩", "LHS": "x ∩ ∅", "RHS": "∅", "level": 2},
        {"name": "abs1", "text": "Absorption law 1", "LHS": "x ∪ (x ∩ y)", "RHS": "x", "level": 2},
        {"name": "abs2", "text": "Absorption law 2", "LHS": "x ∩ (x ∪ y)", "RHS": "x", "level": 2},
        {"name": "cemp", "text": "Complement of ∅", "LHS": "∅ᶜ", "RHS": "𝓤", "level": 2},
        {"name": "cuni", "text": "Complement of 𝓤", "LHS": "𝓤ᶜ", "RHS": "∅", "level": 2}
    ]
});