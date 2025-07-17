/**
 * Abstract Syntax Tree (AST) Module
 * 
 * Defines the structure and utilities for mathematical expression trees
 */

window.ProofAssistant = window.ProofAssistant || {};

window.ProofAssistant.AST = (function() {
    'use strict';

    /**
     * Create a new AST node
     * @param {string} root - The operator or symbol at this node
     * @param {Array} children - Array of child AST nodes (default: empty array)
     * @returns {Object} AST node object
     */
    function createNode(root, children = []) {
        return {
            root: root,
            children: children
        };
    }

    /**
     * Create a leaf node (variable or constant)
     * @param {string} symbol - The variable or constant symbol
     * @returns {Object} AST leaf node
     */
    function createLeaf(symbol) {
        return createNode(symbol, []);
    }

    /**
     * Create a unary operation node
     * @param {string} operator - The unary operator symbol
     * @param {Object} operand - The operand AST node
     * @returns {Object} AST unary node
     */
    function createUnary(operator, operand) {
        return createNode(operator, [operand]);
    }

    /**
     * Create a binary operation node
     * @param {string} operator - The binary operator symbol
     * @param {Object} left - The left operand AST node
     * @param {Object} right - The right operand AST node
     * @returns {Object} AST binary node
     */
    function createBinary(operator, left, right) {
        return createNode(operator, [left, right]);
    }

    /**
     * Check if two AST nodes are structurally equal
     * @param {Object} t1 - First AST node
     * @param {Object} t2 - Second AST node
     * @returns {boolean} True if trees are structurally identical
     */
    function equals(t1, t2) {
        // Check if root nodes are the same
        if (t1.root !== t2.root) return false;
        
        // Check if they have the same number of children
        if (t1.children.length !== t2.children.length) return false;
        
        // Recursively check all children
        for(let i = 0; i < t1.children.length; i++) {
            if (!equals(t1.children[i], t2.children[i])) return false;
        }
        
        return true;
    }

    /**
     * Create a deep copy of an AST node
     * @param {Object} node - AST node to clone
     * @returns {Object} Deep copy of the AST node
     */
    function clone(node) {
        if (!node) return null;
        
        const clonedChildren = node.children.map(child => clone(child));
        return createNode(node.root, clonedChildren);
    }

    /**
     * Check if a node is a leaf (has no children)
     * @param {Object} node - AST node to check
     * @returns {boolean} True if node is a leaf
     */
    function isLeaf(node) {
        return node.children.length === 0;
    }

    /**
     * Check if a node is a unary operation
     * @param {Object} node - AST node to check
     * @returns {boolean} True if node has exactly one child
     */
    function isUnary(node) {
        return node.children.length === 1;
    }

    /**
     * Check if a node is a binary operation
     * @param {Object} node - AST node to check
     * @returns {boolean} True if node has exactly two children
     */
    function isBinary(node) {
        return node.children.length === 2;
    }

    /**
     * Get the height/depth of an AST
     * @param {Object} node - Root AST node
     * @returns {number} Maximum depth of the tree
     */
    function getHeight(node) {
        if (isLeaf(node)) return 0;
        
        let maxChildHeight = 0;
        for(const child of node.children) {
            maxChildHeight = Math.max(maxChildHeight, getHeight(child));
        }
        
        return 1 + maxChildHeight;
    }

    /**
     * Count the total number of nodes in an AST
     * @param {Object} node - Root AST node
     * @returns {number} Total number of nodes
     */
    function getNodeCount(node) {
        let count = 1; // Count this node
        
        for(const child of node.children) {
            count += getNodeCount(child);
        }
        
        return count;
    }

    /**
     * Get all leaf nodes in an AST
     * @param {Object} node - Root AST node
     * @returns {Array} Array of leaf nodes
     */
    function getLeaves(node) {
        if (isLeaf(node)) {
            return [node];
        }
        
        const leaves = [];
        for(const child of node.children) {
            leaves.push(...getLeaves(child));
        }
        
        return leaves;
    }

    /**
     * Get all variables used in an AST (leaf nodes that are variables)
     * @param {Object} node - Root AST node
     * @returns {Set} Set of variable names
     */
    function getVariables(node) {
        const variables = new Set();
        
        if (isLeaf(node)) {
            // Check if it's a variable (letters)
            if (/^[a-zA-Z]$/.test(node.root)) {
                variables.add(node.root);
            }
        } else {
            for(const child of node.children) {
                const childVars = getVariables(child);
                childVars.forEach(v => variables.add(v));
            }
        }
        
        return variables;
    }

    /**
     * Apply a function to all nodes in the AST (post-order traversal)
     * @param {Object} node - Root AST node
     * @param {Function} fn - Function to apply to each node
     */
    function traverse(node, fn) {
        // Visit children first (post-order)
        for(const child of node.children) {
            traverse(child, fn);
        }
        
        // Then visit this node
        fn(node);
    }

    /**
     * Apply a function to all nodes and collect results (pre-order traversal)
     * @param {Object} node - Root AST node
     * @param {Function} fn - Function to apply to each node
     * @returns {Array} Array of results from applying fn to each node
     */
    function map(node, fn) {
        const results = [];
        
        // Visit this node first (pre-order)
        results.push(fn(node));
        
        // Then visit children
        for(const child of node.children) {
            results.push(...map(child, fn));
        }
        
        return results;
    }

    /**
     * Find all nodes that match a predicate
     * @param {Object} node - Root AST node
     * @param {Function} predicate - Function that returns true for matching nodes
     * @returns {Array} Array of matching nodes
     */
    function findNodes(node, predicate) {
        const matches = [];
        
        if (predicate(node)) {
            matches.push(node);
        }
        
        for(const child of node.children) {
            matches.push(...findNodes(child, predicate));
        }
        
        return matches;
    }

    /**
     * Replace all occurrences of a subtree with another subtree
     * @param {Object} node - Root AST node
     * @param {Object} target - Subtree to replace
     * @param {Object} replacement - Replacement subtree
     * @returns {Object} New AST with replacements made
     */
    function replace(node, target, replacement) {
        // If this node matches the target, replace it
        if (equals(node, target)) {
            return clone(replacement);
        }
        
        // Otherwise, recursively replace in children
        const newChildren = node.children.map(child => 
            replace(child, target, replacement)
        );
        
        return createNode(node.root, newChildren);
    }

    /**
     * Convert AST to a simple string representation (for debugging)
     * @param {Object} node - AST node
     * @returns {string} String representation
     */
    function toString(node) {
        if (isLeaf(node)) {
            return node.root;
        }
        
        if (isUnary(node)) {
            return node.root + "(" + toString(node.children[0]) + ")";
        }
        
        if (isBinary(node)) {
            return "(" + toString(node.children[0]) + " " + node.root + " " + toString(node.children[1]) + ")";
        }
        
        // N-ary operations
        const childStrings = node.children.map(child => toString(child));
        return node.root + "(" + childStrings.join(", ") + ")";
    }

    /**
     * Convert AST to prefix notation (Polish notation)
     * @param {Object} node - AST node
     * @returns {string} Prefix notation string
     */
    function toPrefix(node) {
        if (isLeaf(node)) {
            return node.root;
        }
        
        const childStrings = node.children.map(child => toPrefix(child));
        return node.root + " " + childStrings.join(" ");
    }

    /**
     * Convert AST to postfix notation (Reverse Polish notation)
     * @param {Object} node - AST node
     * @returns {string} Postfix notation string
     */
    function toPostfix(node) {
        if (isLeaf(node)) {
            return node.root;
        }
        
        const childStrings = node.children.map(child => toPostfix(child));
        return childStrings.join(" ") + " " + node.root;
    }

    /**
     * Validate that an object is a proper AST node
     * @param {Object} node - Object to validate
     * @returns {boolean} True if object is a valid AST node
     */
    function isValidNode(node) {
        if (!node || typeof node !== 'object') return false;
        if (typeof node.root !== 'string') return false;
        if (!Array.isArray(node.children)) return false;
        
        // Recursively validate children
        for(const child of node.children) {
            if (!isValidNode(child)) return false;
        }
        
        return true;
    }

    // Public API
    return {
        // Node creation
        createNode: createNode,
        createLeaf: createLeaf,
        createUnary: createUnary,
        createBinary: createBinary,
        
        // Core operations
        equals: equals,
        clone: clone,
        
        // Node type checking
        isLeaf: isLeaf,
        isUnary: isUnary,
        isBinary: isBinary,
        isValidNode: isValidNode,
        
        // Tree analysis
        getHeight: getHeight,
        getNodeCount: getNodeCount,
        getLeaves: getLeaves,
        getVariables: getVariables,
        
        // Tree traversal and manipulation
        traverse: traverse,
        map: map,
        findNodes: findNodes,
        replace: replace,
        
        // String representations
        toString: toString,
        toPrefix: toPrefix,
        toPostfix: toPostfix
    };
})();