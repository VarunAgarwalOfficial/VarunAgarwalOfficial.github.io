/**
 * Problems Database
 * Contains all mathematical proof problems organized by week
 */

window.problemsData = {
  "problems": [
    // Week 2: Set Theory Problems
    {
      "week": 2,
      "number": 1,
      "theory": "set_theory",
      "name": "Complex Distributivity with Complements",
      "description": "Prove this complex distributivity involving complements",
      "LHS": "A∩(B∪C)ᶜ",
      "RHS": "(A∩Bᶜ)∩(A∩Cᶜ)",
  
    },
    {
      "week": 2,
      "number": 2,
      "theory": "set_theory",
      "name": "Set Difference and Union",
      "description": "Prove this identity involving set difference and union",
      "LHS": "A \\ (B ∩ C)",
      "RHS": "(A \\ B) ∪ (A \\ C)",
      "hints": [
        "Apply De Morgan's law to the complement of intersection"
      ]
    },
    {
      "week": 2,
      "number": 3,
      "theory": "set_theory",
      "name": "Commutative Test",
      "description": "Test",
      "LHS": "A ∩ B",
      "RHS": "B ∩ A",
  
    },
    {
      "week": 2,
      "number": 4,
      "theory": "set_theory",
      "name": "Complex Complement Expression",
      "description": "Simplify this complex expression with multiple complements",
      "LHS": "(A ∪ B)ᶜ ∩ (A ∩ C)",
      "RHS": "(Aᶜ ∩ Bᶜ) ∩ (A ∩ C)"
    },
    {
      "week": 2,
      "number": 5,
      "theory": "set_theory",
      "name": "Distributivity with Three Sets",
      "description": "Prove distributivity with three sets and complements",
      "LHS": "A ∩ (B ∪ (C ∪ D))",
      "RHS": "((A ∩ B) ∪ (A ∩ C)) ∪ (A ∩ D)",
      "hints": [
        "Apply distributivity step by step to nested unions"
      ]
    },

    // Week 5: Propositional Logic Problems  
    {
      "week": 5,
      "number": 1,
      "theory": "prop_logic",
      "name": "Complex Implication Chain",
      "description": "Prove this complex implication equivalence",
      "LHS": "(p → q) → (r → s)",
      "RHS": "(p ∧ ¬q) ∨ (¬r ∨ s)",
      "hints": [
        "Convert both implications to disjunction form",
      ]
    },
    {
      "week": 5,
      "number": 2,
      "theory": "prop_logic",
      "name": "Biconditional Expansion",
      "description": "Expand and simplify this biconditional expression",
      "LHS": "(p ↔ q) ∧ (r ↔ s)",
      "RHS": "((p → q) ∧ (q → p)) ∧ ((r → s) ∧ (s → r))"
    },
    {
      "week": 5,
      "number": 3,
      "theory": "prop_logic",
      "name": "De Morgan's with Implications",
      "description": "Apply De Morgan's laws to implications",
      "LHS": "¬((p → q) ∨ (r → s))",
      "RHS": "¬(p → q) ∧ ¬(r → s)",
      "hints": [
        "Apply De Morgan's law to the outer negation"
      ]
    },
    {
      "week": 5,
      "number": 4,
      "theory": "prop_logic",
      "name": "Complex Absorption",
      "description": "Prove this complex absorption law",
      "LHS": "(p ∨ q) ∧ (p ∨ ¬q)",
      "RHS": "p",
      "hints": [
        "Use distributivity of ∨ over ∧",
      ]
    },
    {
      "week": 5,
      "number": 5,
      "theory": "prop_logic",
      "name": "Nested Biconditionals",
      "description": "Simplify nested biconditionals",
      "LHS": "p ↔ (q ↔ r)",
      "RHS": "(p ↔ q) ↔ r",
      "hints": [
        "Expand all biconditionals using their definitions",
      ]
    },

    // Week 6: Boolean Algebra Problems
    {
      "week": 6,
      "number": 1,
      "theory": "bool_alg",
      "name": "Complex De Morgan's Application",
      "description": "Apply De Morgan's laws to this complex expression",
      "LHS": "((x ∨ y) ∨ z)'",
      "RHS": "(x' ∧ y') ∧ z'",
    },
    {
      "week": 6,
      "number": 2,
      "theory": "bool_alg",
      "name": "Distributivity with Complements",
      "description": "Prove this distributivity involving complements",
      "LHS": "x ∧ (y' ∨ z)",
      "RHS": "(x ∧ y') ∨ (x ∧ z)"
    },
    {
      "week": 6,
      "number": 3,
      "theory": "bool_alg",
      "name": "Complex Complement Simplification",
      "description": "Simplify this expression with multiple complements",
      "LHS": "((x ∨ y)' ∧ z)'",
      "RHS": "(x ∨ y) ∨ z'",

    },
    {
      "week": 6,
      "number": 4,
      "theory": "bool_alg",
      "name": "Absorption with Complements",
      "description": "Prove this absorption law variant",
      "LHS": "x ∨ (x' ∧ y)",
      "RHS": "x ∨ y",
    },
    {
      "week": 6,
      "number": 5,
      "theory": "bool_alg",
      "name": "Complex Boolean Expression",
      "description": "Simplify this complex Boolean expression",
      "LHS": "((x ∧ y) ∨ (x' ∧ y)) ∨ (x ∧ y')",
      "RHS": "x ∨ y",

    },
    {
      "week": 6,
      "number": 6,
      "theory": "bool_alg",
      "name": "De Morgan's with Distributivity",
      "description": "Combine De Morgan's laws with distributivity",
      "LHS": "(x ∧ y)' ∨ (x ∧ z)",
      "RHS": "(x' ∨ y') ∨ (x ∧ z)"
    }
  ],
  "theories": {
    "set_theory": {
      "name": "Set Theory",
      "description": "Mathematical set operations and properties"
    },
    "bool_alg": {
      "name": "Boolean Algebra", 
      "description": "Boolean operations and logical algebra"
    },
    "prop_logic": {
      "name": "Propositional Logic",
      "description": "Propositional calculus and logical reasoning"
    }
  }
};