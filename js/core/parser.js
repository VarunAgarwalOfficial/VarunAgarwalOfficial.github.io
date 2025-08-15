/**
 * Expression Parser
 */

window.ProofAssistant = window.ProofAssistant || {};

window.ProofAssistant.Parser = (function() {
    'use strict';

    let symbols = [];
    let symbolRegex = "";
    let equality = { display: "=", markdown: "=", latex: "=" };
    let constants = [];
    let unaryOps = [];
    let binaryOps = [];

    /**
     * Initialize parser with symbols
     */
    function init() {
        symbolRegex = symbols
            .map(s => s.text.replace(/[\\!@#$%^&*()+=.<>{}[\]:;'"|~`_-]/g, '\\$&'))
            .join('|');

        constants = symbols.filter(s => Math.abs(s.arity) === 0);
        unaryOps = symbols.filter(s => Math.abs(s.arity) === 1).reverse();
        binaryOps = symbols.filter(s => s.arity === 2);
    }

    /**
     * Check for invalid characters
     */
    function checkChars(str) {
        const accepted = new RegExp(symbolRegex + "|[A-Za-z()]", "g");
        return sanitize(str).replace(accepted, '');
    }

    /**
     * Check if string is a valid leaf (variable or constant)
     */
    function isLeaf(str) {
        if (str.length !== 1) return false;
        return /[A-Za-z]/.test(str) || constants.some(c => c.id === str);
    }

    /**
     * Parse expression segment
     */
    function parseExpression(str, i, j) {
        if (i >= j) return null;

        // Single character
        if (i + 1 === j && isLeaf(str.substring(i, j))) {
            return { root: str.substring(i, j), children: [] };
        }

        // Unary operators
        for (const op of unaryOps) {
            if (op.arity === 1 && str.charAt(i) === op.id) {
                const child = parseExpression(str, i + 1, j);
                if (child) return { root: op.id, children: [child] };
            }
            if (op.arity === -1 && str.charAt(j - 1) === op.id) {
                const child = parseExpression(str, i, j - 1);
                if (child) return { root: op.id, children: [child] };
            }
        }
        
        // Remove outer parentheses
        if (str.charAt(i) === '(' && str.charAt(j - 1) === ')') {
            return parseExpressionOrBinary(str, i + 1, j - 1);
        }
        
        return null;
    }

    /**
     * Parse expression or binary operation
     */
    function parseExpressionOrBinary(str, i, j) {
        const expr = parseExpression(str, i, j);
        if (expr) return expr;

        // Binary operators
        for (let k = i + 1; k < j - 1; k++) {
            for (const op of binaryOps) {
                if (str.charAt(k) === op.id) {
                    const left = parseExpression(str, i, k);
                    const right = parseExpression(str, k + 1, j);
                    if (left && right) {
                        return { root: op.id, children: [left, right] };
                    }
                }
            }
        }
        return null;
    }

    /**
     * Main parse function
     */
    function parse(str) {
        const invalidChars = checkChars(str);
        if (invalidChars) {
            return [null, "Unexpected characters: " + Array.from(invalidChars).join(',')];
        }
        
        str = toASCII(str);
        
        const balance = checkParens(str);
        if (balance !== 0) {
            return [null, "Unmatched '" + (balance > 0 ? '(' : ')') + "'"];
        }

        const tree = parseExpression(str, 0, str.length);
        return [tree, tree ? "" : "Unable to parse expression"];
    }

    /**
     * Convert AST back to string
     */
    function unparse(tree, type = "text") {
        if (!tree) return ["", 0];
        
        switch (tree.children.length) {
            case 0: // Leaf
                return /[A-Za-z]/.test(tree.root) ? 
                    [tree.root, 0] : 
                    [getSymbol("id", type, tree.root), 0];

            case 1: // Unary
                const [childText, childPrec] = unparse(tree.children[0], type);
                const text = childPrec === 2 ? `(${childText})` : childText;
                const symbolText = getSymbol("id", type, tree.root);
                
                return getSymbolArity(tree.root) < 0 ? 
                    [text + symbolText, 1] : 
                    [symbolText + text, 1];

            case 2: // Binary
                const [leftText, leftPrec] = unparse(tree.children[0], type);
                const [rightText, rightPrec] = unparse(tree.children[1], type);
                const left = leftPrec === 2 ? `(${leftText})` : leftText;
                const right = rightPrec === 2 ? `(${rightText})` : rightText;
                
                return [left + " " + getSymbol("id", type, tree.root) + " " + right, 2];
        }
        return null;
    }

    /**
     * Convert display symbols to ASCII
     */
    function toASCII(str) {
        const re = new RegExp(symbolRegex, "g");
        return sanitize(str).replace(re, txt => getSymbol("text", "id", txt));
    }

    /**
     * Helper functions
     */
    function getSymbol(key, val, id) {
        const found = symbols.find(s => s[key] === id);
        return found ? found[val] : id;
    }

    function getSymbolArity(id) {
        return getSymbol("id", "arity", id);
    }

    function sanitize(str) {
        return "(" + str.replace(/\s/g, "") + ")";
    }

    function checkParens(str) {
        let count = 0;
        for (let i = 0; i < str.length && count >= 0; i++) {
            if (str.charAt(i) === '(') count++;
            else if (str.charAt(i) === ')') count--;
        }
        return count;
    }

    // Configuration
    function setSymbols(newSymbols) { symbols = newSymbols || []; }
    function setEquality(newEquality) { equality = newEquality || equality; }

    // Public API
    return {
        init,
        parse,
        unparse,
        setSymbols,
        setEquality,
        getSymbols: () => symbols,
        getEquality: () => equality
    };
})();