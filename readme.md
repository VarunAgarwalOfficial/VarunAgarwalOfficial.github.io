# Proof Assistant

Interactive tool for constructing step-by-step mathematical proofs in set theory, boolean algebra, and propositional logic.

## Quick Start

1. Open `index.html` in a browser
2. Select a problem or add `?problem=2.1` to URL
3. Apply rules step-by-step to complete proofs
4. Use `setup/setup.html` to create new problems

## Features

- **Step-by-step validation** - Real-time feedback on proof steps
- **Multiple theories** - Set theory, boolean algebra, propositional logic  
- **Custom laws** - Add problem-specific rules
- **Setup tool** - Visual editor generates `problems.js`
- **Export** - LaTeX and Markdown output
- **Mobile friendly** - Responsive design

## File Structure

```
├── index.html              # Main application
├── setup/setup.html        # Problem editor
├── js/
│   ├── core/               # Parser and validation
│   ├── theories/           # Mathematical theories
│   ├── components/         # UI components
│   └── problems.js         # Problem definitions
└── css/                    # Stylesheets
```

## Creating Problems

Use the setup tool to:
1. Configure course and theories
2. Add problems with expressions
3. Set custom laws and hints  
4. Export to `problems.js`

## Problem Format

```javascript
{
  "week": 2,
  "number": 1, 
  "theory": "set_theory",
  "name": "Problem Title",
  "LHS": "A",
  "RHS": "A ∪ A",
  "customLaws": [
    {
      "name": "Custom Rule",
      "lhs": "(A ∪ B) ∩ A", 
      "rhs": "A"
    }
  ]
}
```