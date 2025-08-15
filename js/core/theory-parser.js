/**
 * Parser Factory Module
 * 
 * Creates parser instances for each theory with their own symbol tables
 * Each parser is independent and doesn't affect others
 */

window.ProofAssistant = window.ProofAssistant || {};

window.ProofAssistant.ParserFactory = (function() {
    'use strict';

    /**
     * Create a new parser instance with its own symbol table
     * @param {Array} symbols - Symbol definitions for this parser
     * @param {Object} equality - Equality symbol definition
     * @returns {Object} Parser instance
     */
    function createParser(symbols = [], equality = {"display": "=", "markdown": "=", "latex": "="}) {
        // Private state for this parser instance
        let symbol_re = "";
        let constants = [];
        let unaryOps = [];
        let binaryOps = [];
        let initialized = false;

        /**
         * Initialize this parser instance
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

            // Categorize symbols by arity
            constants = symbols.filter(sym => Math.abs(sym["arity"]) === 0);
            unaryOps = symbols.filter(sym => Math.abs(sym["arity"]) === 1).reverse();
            binaryOps = symbols.filter(sym => sym["arity"] === 2);
            
            initialized = true;
        }

        /**
         * Check for invalid characters in expression
         */
        function checkChars(str) {
            if (!initialized) init();
            const accepted = new RegExp(symbol_re + "|[A-Za-z()]", "g");
            return sanitize(str).replace(accepted, '');
        }

        /**
         * Sanitize input string
         */
        function sanitize(str) {
            return "(" + str.replace(/\s/g, "") + ")";
        }

        /**
         * Check if parentheses are balanced
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

        /**
         * Convert display symbols to internal ASCII representation
         */
        function toASCII(str) {
            if (!initialized) init();
            const re = new RegExp(symbol_re, "g");
            return sanitize(str).replace(re, txt => getSymbol("text", "id", txt));
        }

        /**
         * Helper function to find symbol by key-value pair
         */
        function getSymbol(key, val, id) {
            const found = symbols.find(s => s[key] === id);
            return found ? found[val] : id;
        }

        /**
         * Get display text for symbol ID
         */
        function getSymbolText(symbol_id) {
            return getSymbol("id", "text", symbol_id);
        }
        
        /**
         * Get arity for symbol ID
         */
        function getSymbolArity(symbol_id) {
            return getSymbol("id", "arity", symbol_id);
        }

        /**
         * Parse expression into AST
         */
        function parse(str) {
            if (!initialized) init();
            
            if(typeof str !== "string") {
                return [null, "Input must be a string"];
            }

            // Check for invalid characters
            const invalidChars = checkChars(str);
            if(invalidChars.length > 0) {
                const error = "Unexpected characters: " + invalidChars.split('').join(',');
                return [null, error];
            }

            // Convert to internal representation
            str = toASCII(str);

            // Check parentheses balance
            const parenCheck = checkParens(str);
            if(parenCheck !== 0) {
                const error = "Unmatched " + (parenCheck > 0 ? '(' : ')') + "'";
                return [null, error];
            }

            // Parse the expression
            const tree = parseExpression(str, 0, str.length);
            
            return [tree, tree === null ? "Unable to parse expression" : ""];
        }

        /**
         * Parse a segment of the expression
         */
        function parseExpression(str, l, r) {
            // Remove outer parentheses if they exist
            while(l < r && str.charAt(l) === '(' && str.charAt(r-1) === ')') {
                let count = 1;
                let i = l + 1;
                while(i < r - 1 && count > 0) {
                    if(str.charAt(i) === '(') count++;
                    else if(str.charAt(i) === ')') count--;
                    i++;
                }
                if(count !== 1) break;
                l++;
                r--;
            }

            // Empty expression
            if(l >= r) return null;

            // Single character - variable or constant
            if(r - l === 1) {
                const char = str.charAt(l);
                if(/[A-Za-z]/.test(char)) {
                    return { root: char, children: [] };
                }
                // Check if it's a constant
                if(constants.find(c => c.id === char)) {
                    return { root: char, children: [] };
                }
                return null;
            }

            // Check for unary operators (prefix and postfix)
            for(const op of unaryOps) {
                // Postfix operator (negative arity)
                if(op.arity < 0 && str.charAt(r-1) === op.id) {
                    const child = parseExpression(str, l, r-1);
                    if(child) {
                        return { root: op.id, children: [child] };
                    }
                }
                // Prefix operator
                else if(op.arity > 0 && str.charAt(l) === op.id) {
                    const child = parseExpression(str, l+1, r);
                    if(child) {
                        return { root: op.id, children: [child] };
                    }
                }
            }

            // Check for binary operators
            let depth = 0;
            let operatorsAtDepthZero = [];

            // First pass: find ALL operators at depth 0
            for(let i = l; i < r; i++) {
                const char = str.charAt(i);
                if(char === '(') depth++;
                else if(char === ')') depth--;
                else if(depth === 0) {
                    const op = binaryOps.find(o => o.id === char);
                    if(op) {
                        operatorsAtDepthZero.push({pos: i, op: op});
                    }
                }
            }

            // If there are multiple operators at depth 0, the expression is ambiguous
            if(operatorsAtDepthZero.length > 1) {
                return null; // Reject expressions like "A ∩ B ∩ C"
            }

            // If there's exactly one operator, try to parse with it
            if(operatorsAtDepthZero.length === 1) {
                const {pos, op} = operatorsAtDepthZero[0];
                const left = parseExpression(str, l, pos);
                const right = parseExpression(str, pos + 1, r);
                if(left && right) {
                    return { root: op.id, children: [left, right] };
                }
            }

            return null;
        }

        /**
         * Convert AST back to string representation
         */
        function unparse(tree, type) {
            if(!tree) return ["", 0];
            
            switch(tree.children.length) {
                case 0: // Leaf node
                    if(/[A-Za-z]/.test(tree.root)) {
                        return [tree.root, 0];
                    }
                    return [getSymbol("id", type, tree.root), 0];

                case 1: // Unary operator
                    const rec = unparse(tree.children[0], type);
                    if(rec[1] === 2) rec[0] = "(" + rec[0] + ")";
                    
                    if(getSymbolArity(tree.root) < 0) {
                        rec[0] = rec[0] + getSymbol("id", type, tree.root);
                    } else {
                        rec[0] = getSymbol("id", type, tree.root) + rec[0];
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

        // Initialize immediately
        init();

        // Return parser instance
        return {
            parse: parse,
            unparse: unparse,
            checkChars: checkChars,
            toASCII: toASCII,
            getSymbol: getSymbol,
            getSymbolText: getSymbolText,
            getSymbolArity: getSymbolArity,
            getSymbols: () => symbols,
            getEquality: () => equality,
            getConstants: () => constants,
            getUnaryOps: () => unaryOps,
            getBinaryOps: () => binaryOps
        };
    }

    // Public API
    return {
        createParser: createParser
    };
})();