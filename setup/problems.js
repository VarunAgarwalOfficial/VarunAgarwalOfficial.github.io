/**
* Proof Assistant Configuration
* 9/23/2025, 5:50:36 PM
* 
* Course: Foundations of Computer Science
* Tool: Proof Assistant
* Total Problems: 10
* Theories: 3
*/

window.problemsData = {
  "configuration": {
    "courseTitle": "Foundations of Computer Science",
    "toolName": "Proof Assistant",
    "showUniLogo": true,
    "borderRadius": "5px",
    "ui": {
      "showSidebar": true,
      "showDashboard": true,
      "showCustomEquations": true,
      "theme": {
        "primaryColor": "#FFC500",
        "secondaryColor": "#522E92",
        "accentColor": "#FF6F00",
        "backgroundColor": "#ffffff",
        "textColor": "#333333"
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
      "name": "Problem 1",
      "description": "",
      "LHS": "(A∩B)∪(A∩C)",
      "RHS": "A∩(B∪C)"
    },
    {
      "week": 2,
      "number": 2,
      "theory": "prop_logic",
      "name": "Prob 2",
      "description": "",
      "LHS": "(p → q) ∧ (p → r)",
      "RHS": "p → (q ∧ r)"
    },
    {
      "week": 2,
      "number": 3,
      "theory": "set_theory",
      "name": "Prob 3",
      "description": "",
      "LHS": "(A \\ B) ∪ (A ∩ B)",
      "RHS": "A"
    },
    {
      "week": 2,
      "number": 4,
      "theory": "prop_logic",
      "name": "Prob 4",
      "description": "",
      "LHS": "¬(p → q)",
      "RHS": "p ∧ ¬q"
    },
    {
      "week": 2,
      "number": 5,
      "theory": "set_theory",
      "name": "Prob 5",
      "description": "",
      "LHS": "A \\ (B ∩ C)",
      "RHS": "(A \\ B) ∪ (A \\ C)"
    },
    {
      "week": 2,
      "number": 6,
      "theory": "set_theory",
      "name": "Prob 6",
      "description": "",
      "LHS": "A⊕B",
      "RHS": "(A∪B)\\(A∩B)"
    },
    {
      "week": 2,
      "number": 7,
      "theory": "set_theory",
      "name": "Prob 7",
      "description": "",
      "LHS": "A ∩ ∅",
      "RHS": "∅"
    },
    {
      "week": 2,
      "number": 8,
      "theory": "set_theory",
      "name": "Prob 8",
      "description": "",
      "LHS": "(A ∪ B) \\ (A ∩ B)",
      "RHS": "(A \\ B) ∪ (B \\ A)"
    },
    {
      "week": 2,
      "number": 9,
      "theory": "prop_logic",
      "name": "Prob 9",
      "description": "",
      "LHS": "(x ∨ y) ∧ (x ∨ y′)",
      "RHS": "x"
    },
    {
      "week": 2,
      "number": 10,
      "theory": "set_theory",
      "name": "Prob 10",
      "description": "",
      "LHS": "A∩(B⊕C)",
      "RHS": "(A∩B)⊕(A∩C)"
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