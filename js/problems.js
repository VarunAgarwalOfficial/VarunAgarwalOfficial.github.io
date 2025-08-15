/**
* Proof Assistant Configuration
* 13/08/2025, 10:43:03 am
* 
* Course: COMP9020 - Foundations of Computer Science
* Tool: Proof Assistant
* Total Problems: 17
* Theories: 3
*/

window.problemsData = {
  "configuration": {
    "courseTitle": "COMP9020 - Foundations of Computer Science",
    "toolName": "Proof Assistant",
    "showUniLogo": true,
    "borderRadius": "0px",
    "ui": {
      "showSidebar": true,
      "showDashboard": true,
      "showCustomEquations": true,
      "theme": {
        "primaryColor": "#FF6E40",
        "secondaryColor": "#FF5722",
        "accentColor": "#DD2C00",
        "backgroundColor": "#FFFFFF",
        "textColor": "#212121"
      },
      "statusColors": {
        "success": {
          "color": "#28a745",
          "background": "#d4edda",
          "border": "#c3e6cb",
          "text": "#155724"
        },
        "error": {
          "color": "#dc3545",
          "background": "#f8d7da",
          "border": "#f5c6cb",
          "text": "#721c24"
        },
        "warning": {
          "color": "#ffc107",
          "background": "#fff3cd",
          "border": "#ffeaa7",
          "text": "#856404"
        }
      }
    },
    "theories": {
      "set_theory": {
        "name": "Set Theory",
        "description": "set operations and properties",
        "color": "#2E7D32",
        "backgroundColor": "#E8F5E8",
        "icon": "fas fa-circle"
      },
      "bool_alg": {
        "name": "Boolean Algebra",
        "description": "Boolean operations and logical algebra",
        "color": "#F57C00",
        "backgroundColor": "#FFF3E0",
        "icon": "fas fa-square"
      },
      "prop_logic": {
        "name": "Propositional Logic",
        "description": "Propositional calculus and logical reasoning",
        "color": "#1976D2",
        "backgroundColor": "#E3F2FD",
        "icon": "fas fa-triangle"
      }
    }
  },
  "problems": [
    {
      "week": 2,
      "number": 1,
      "theory": "set_theory",
      "name": "Idempotence of Union",
      "description": "Prove this equality using set theory laws",
      "LHS": "A",
      "RHS": "A∪A",
      "hints": [
        "Use the idempotence law for union"
      ]
    },
    {
      "week": 2,
      "number": 2,
      "theory": "set_theory",
      "name": "Set Difference Practice",
      "description": "Prove this equality using set theory laws",
      "LHS": "(A \\ B) ∪ B",
      "RHS": "A ∪ B",
      "hints": [
        "Start by applying the definition of set difference"
      ]
    },
    {
      "week": 2,
      "number": 3,
      "theory": "set_theory",
      "name": "Identity with Empty Set",
      "description": "Prove this equality using set theory laws",
      "LHS": "B ∪ (A ∩ ∅)",
      "RHS": "B"
    },
    {
      "week": 2,
      "number": 4,
      "theory": "set_theory",
      "name": "Absorption Law",
      "description": "Prove this equality using set theory laws",
      "LHS": "(A ∪ B) ∩ A",
      "RHS": "A",
      "hints": [
        "This is a classic absorption law pattern"
      ]
    },
    {
      "week": 2,
      "number": 5,
      "theory": "set_theory",
      "name": "Formatif W2.P1: Complement of Empty Set",
      "description": "Prove this equality using set theory laws",
      "LHS": "∅ᶜ",
      "RHS": "𝓤"
    },
    {
      "week": 2,
      "number": 6,
      "theory": "set_theory",
      "name": "Formatif W2.P2: Annihilation Law",
      "description": "Prove this equality using set theory laws",
      "LHS": "A ∩ ∅",
      "RHS": "∅"
    },
    {
      "week": 2,
      "number": 7,
      "theory": "set_theory",
      "name": "Formatif W2.C1: Symmetric Difference",
      "description": "Prove this equality using set theory laws",
      "LHS": "(A ∪ B) \\ (A ∩ B)",
      "RHS": "(A \\ B) ∪ (B \\ A)"
    },
    {
      "week": 3,
      "number": 3,
      "theory": "set_theory",
      "name": "Showcase: Hints",
      "description": "Prove this equality using set theory laws",
      "LHS": "Aᶜᶜ",
      "RHS": "A",
      "hints": [
        "Think about how can you use Anhilation and Absorbtion Laws"
      ],
      "enabledRules": [
        "assoc1",
        "assoc2",
        "comm1",
        "comm2",
        "dist1",
        "dist2",
        "id1",
        "id2",
        "comp1",
        "comp2",
        "defdiff",
        "defsd",
        "idem1",
        "idem2",
        "dem1",
        "dem2",
        "ann1",
        "ann2",
        "abs1",
        "abs2",
        "cemp",
        "cuni"
      ]
    },
    {
      "week": 3,
      "number": 1,
      "theory": "set_theory",
      "name": "Showcase: Enabling Laws",
      "description": "We can now enable and disable specific laws for each question.",
      "LHS": "A ⊕ B",
      "RHS": "(A \\ B) ∪ (A \\ B)",
      "enabledRules": [
        "defsd"
      ]
    },
    {
      "week": 3,
      "number": 2,
      "theory": "set_theory",
      "name": "Showcase: Custom Laws",
      "description": "We can now add custom laws.",
      "LHS": "(A ∪ B) ∩ A",
      "RHS": "A",
      "enabledRules": [
        "assoc1",
        "assoc2",
        "comm1",
        "comm2",
        "dist1",
        "defdiff",
        "defsd",
        "idem1",
        "idem2"
      ],
      "customLaws": [
        {
          "name": "Absorption",
          "text": "Absorption of ∩ over ∪",
          "lhs": "(A ∪ B) ∩ A",
          "rhs": "A",
          "theory": "set_theory"
        }
      ]
    },
    {
      "week": 5,
      "number": 1,
      "theory": "prop_logic",
      "name": "Implication Definition",
      "description": "Prove this equality using propositional logic laws",
      "LHS": "p → q",
      "RHS": "¬p ∨ q",
      "hints": [
        "Use the definition of implication"
      ]
    },
    {
      "week": 5,
      "number": 2,
      "theory": "prop_logic",
      "name": "W9.P2: Complex Tautology",
      "description": "Prove this equality using propositional logic laws",
      "LHS": "(((p∨q) ∧ (p→r)) ∧ (q→r)) → r",
      "RHS": "⊤"
    },
    {
      "week": 5,
      "number": 3,
      "theory": "prop_logic",
      "name": "Absorption in Logic",
      "description": "Prove this equality using propositional logic laws",
      "LHS": "(p ∨ q) ∧ p",
      "RHS": "p"
    },
    {
      "week": 7,
      "number": 1,
      "theory": "bool_alg",
      "name": "W9.P4: Complex Boolean Simplification",
      "description": "Prove this equality using Boolean algebra laws",
      "LHS": "(x' ∧ y)' ∧ (x ∨ y)",
      "RHS": "x"
    },
    {
      "week": 7,
      "number": 2,
      "theory": "bool_alg",
      "name": "Distributivity with Complements",
      "description": "Prove this equality using Boolean algebra laws",
      "LHS": "x ∧ (x' ∨ y)",
      "RHS": "x ∧ y",
      "hints": [
        "Use distributivity first"
      ]
    },
    {
      "week": 7,
      "number": 3,
      "theory": "bool_alg",
      "name": "Boolean Absorption",
      "description": "Prove this equality using Boolean algebra laws",
      "LHS": "x ∨ (x ∧ y)",
      "RHS": "x"
    },
    {
      "week": 8,
      "number": 4,
      "theory": "bool_alg",
      "name": "Consensus Theorem",
      "description": "Prove this equality using Boolean algebra laws",
      "LHS": "(x ∨ y) ∧ (x ∨ y')",
      "RHS": "x",
      "hints": [
        "Use distributivity to factor out x"
      ]
    }
  ],
  "theories": {
    "set_theory": {
      "name": "Set Theory",
      "description": "set operations and properties",
      "color": "#2E7D32",
      "backgroundColor": "#E8F5E8",
      "icon": "fas fa-circle"
    },
    "bool_alg": {
      "name": "Boolean Algebra",
      "description": "Boolean operations and logical algebra",
      "color": "#F57C00",
      "backgroundColor": "#FFF3E0",
      "icon": "fas fa-square"
    },
    "prop_logic": {
      "name": "Propositional Logic",
      "description": "Propositional calculus and logical reasoning",
      "color": "#1976D2",
      "backgroundColor": "#E3F2FD",
      "icon": "fas fa-triangle"
    }
  }
};