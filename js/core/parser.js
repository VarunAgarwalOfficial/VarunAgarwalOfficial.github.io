/**
 * Mathematical Expression Parser
 * 
 * Handles parsing of mathematical expressions into Abstract Syntax Trees (AST)
 * Supports Boolean algebra, propositional logic, and set theory notation
 */

window.ProofAssistant = window.ProofAssistant || {};

window.ProofAssistant.Parser = (function() {
    'use strict';

    // Private state - configuration from current theory
    let symbols = [];
    let symbol_re = "";
    let equality = {"display": "=", "markdown": "=", "latex": "="};
    let constants = [];
    let unaryOps = [];
    let binaryOps = [];

    /**
     * Initialize the parser with symbols from the current theory
     */
    function init() {
        // Build regex pattern for matching all symbols
        symbol_re = "";
        for(let i = 0; i < symbols.length; i++){
            // Escape special regex characters in symbol text
            const escapedText = symbols[i]["text"].replace(/[\\\!\@\#\$\%\^\&\*\)\(\+\=\.\<\>\{\}\[\]\:\;\'\"\|\~\`\_\-]/, x=>"\\"+x);
            symbol_re += escapedText + "|";
        }
        // Remove trailing '|'
        symbol_re = symbol_re.substring(0, symbol_re.length-1);

        // Categorize symbols by arity (number of arguments)
        constants = symbols.filter(sym => Math.abs(sym["arity"]) === 0);
        unaryOps = symbols.filter(sym => Math.abs(sym["arity"]) === 1).reverse();
        binaryOps = symbols.filter(sym => sym["arity"] === 2);
    }

    /**
     * Check for invalid characters in expression
     */
    function checkChars(str) {
        const accepted = new RegExp(symbol_re + "|[A-Za-z()]", "g");
        return sanitize(str).replace(accepted, '');
    }

    /**
     * Check if a single character is a valid leaf node (variable or constant)
     */
    function isLeaf(str) {
        if(str.length !== 1) return false;
        
        // Accept variables (A-Z, a-z) and constants
        let regexp = "[A-Za-z]";        
        for (const constant of constants) {
            regexp += "|" + constant["id"];
        }
        
        return new RegExp(regexp).test(str);
    }

    /**
     * Parse expression (handles unary operators and parentheses)
     */
    function parseExpression(str, i, j) {
        // Empty string
        if(i >= j) return null;
 
        // Single character - check if it's a leaf
        if(i + 1 === j) {
            if(isLeaf(str.substring(i, j))) {
                return {root: str.substring(i, j), children: []};
            }
            return null;
        }

        // Check for unary operators
        for(const unaryOp of unaryOps) {
            // Prefix unary operator (like ¬)
            if(unaryOp["arity"] === 1 && str.charAt(i) === unaryOp["id"]) {
                const child = parseExpression(str, i + 1, j);
                if(child === null) return null;
                return {root: unaryOp["id"], children: [child]};
            }
            // Postfix unary operator (like ')
            if(unaryOp["arity"] === -1 && str.charAt(j - 1) === unaryOp["id"]) {
                const child = parseExpression(str, i, j - 1);
                if(child === null) return null;
                return {root: unaryOp["id"], children: [child]};
            }
        }
        
        // Check for parentheses - remove outer parentheses and try again
        if(str.charAt(i) === '(' && str.charAt(j - 1) === ')') {
            return parseExpressionOrBinary(str, i + 1, j - 1);
        }
        
        return null;
    }

    /**
     * Parse expression or binary operation
     */
    function parseExpressionOrBinary(str, i, j) {
        // First try to parse as expression
        const child = parseExpression(str, i, j);
        if(child !== null) return child;

        // Try to find binary operators
        for(let k = i + 1; k < j - 1; k++) {
            for(const binaryOp of binaryOps) {
                if(str.charAt(k) === binaryOp["id"]) {
                    // Try to parse left and right sides
                    const LHS = parseExpression(str, i, k);
                    if(LHS !== null) {
                        const RHS = parseExpression(str, k + 1, j);
                        if(RHS !== null) {
                            return {root: binaryOp["id"], children: [LHS, RHS]};
                        }
                    }
                }
            }
        }
        return null;
    }

    /**
     * Main parsing function - converts string expression to AST
     */
    function parse(str) {
        // Check for invalid characters first
        const invalidChars = checkChars(str);
        if(invalidChars !== "") {
            const error = "Unexpected characters: (" + Array.from(invalidChars).join(',') + ")";
            return [null, error];
        }
        
        // Convert display symbols to internal ASCII representation
        str = toASCII(str);
        
        // Check parentheses balance
        const balance = checkParens(str);
        if(balance !== 0) {
            const error = "Unmatched '" + (balance > 0 ? '(' : ')') + "'";
            return [null, error];
        }

        // Parse the expression into AST
        const tree = parseExpression(str, 0, str.length);
        
        return [tree, tree === null ? "Unable to parse expression" : ""];
    }

    /**
     * Convert AST back to string representation
     */
    function unparse(tree, type) {
        if(!tree) return ["", 0];
        
        switch(tree.children.length) {
            case 0: // Leaf node (variable or constant)
                if(/[A-Za-z]/.test(tree.root)) {
                    return [tree.root, 0]; // Variable
                }
                return [getSymbol("id", type, tree.root), 0]; // Constant

            case 1: // Unary operator
                const rec = unparse(tree.children[0], type);
                // Add parentheses if child has lower precedence
                if(rec[1] === 2) rec[0] = "(" + rec[0] + ")";
                
                // Apply unary operator (prefix or postfix)
                if(getSymbolArity(tree.root) < 0) {
                    rec[0] = rec[0] + getSymbol("id", type, tree.root);  // Postfix
                } else {
                    rec[0] = getSymbol("id", type, tree.root) + rec[0];  // Prefix
                }
                return [rec[0], 1];

            case 2: // Binary operator
                const lrec = unparse(tree.children[0], type);
                if(lrec[1] === 2) lrec[0] = "(" + lrec[0] + ")";
                const rrec = unparse(tree.children[1], type);
                if(rrec[1] === 2) rrec[0] = "(" + rrec[0] + ")";
                
                return [lrec[0] + " " + getSymbol("id", type, tree.root) + " " + rrec[0], 2];
        }
        return null;
    }

    /**
     * Convert display symbols to internal ASCII representation
     */
    function toASCII(str) {
        const re = new RegExp(symbol_re, "g");
        return sanitize(str).replace(re, txt => getSymbol("text", "id", txt));
    }

    /**
     * Helper function to find symbol by key-value pair
     */
    function getSymbol(key, val, id) {
        const found = symbols.find(s => s[key] === id);
        return found ? found[val] : id; // Fallback to input if not found
    }

    /**
     * Get display text for symbol ID
     */
    function getSymbolText(symbol_id) {
        return getSymbol("id", "text", symbol_id);
    }
    
    /**
     * Get arity (number of arguments) for symbol ID
     */
    function getSymbolArity(symbol_id) {
        return getSymbol("id", "arity", symbol_id);
    }

    /**
     * Sanitize input string by removing whitespace and adding outer parentheses
     */
    function sanitize(str) {
        return "(" + str.replace(/\s/g, "") + ")";
    }

    /**
     * Check if parentheses are balanced in expression
     */
    function checkParens(str) {
        let count = 0;
        let i = 0;
        while(count >= 0 && i < str.length) {
            if(str.charAt(i) === '(') {
                count += 1;
            } else if(str.charAt(i) === ')') {
                count -= 1;
            }
            i += 1;
        }
        return count;
    }

    // Configuration functions
    function setSymbols(newSymbols) {
        symbols = newSymbols || [];
    }

    function setEquality(newEquality) {
        equality = newEquality || {"display": "=", "markdown": "=", "latex": "="};
    }

    // Getters
    function getSymbols() { return symbols; }
    function getEquality() { return equality; }
    function getConstants() { return constants; }
    function getUnaryOps() { return unaryOps; }
    function getBinaryOps() { return binaryOps; }

    // Public API
    return {
        // Core functions
        init: init,
        parse: parse,
        unparse: unparse,
        
        // Utility functions
        checkChars: checkChars,
        toASCII: toASCII,
        getSymbol: getSymbol,
        getSymbolText: getSymbolText,
        getSymbolArity: getSymbolArity,
        
        // Configuration
        setSymbols: setSymbols,
        setEquality: setEquality,
        
        // Getters
        getSymbols: getSymbols,
        getEquality: getEquality,
        getConstants: getConstants,
        getUnaryOps: getUnaryOps,
        getBinaryOps: getBinaryOps
    };
})();