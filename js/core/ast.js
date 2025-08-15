/**
 * Abstract Syntax Tree (AST) Module
 */

window.ProofAssistant = window.ProofAssistant || {};

window.ProofAssistant.AST = (function() {
    'use strict';

    /**
     * Create AST node
     */
    function createNode(root, children = []) {
        return { root, children };
    }

    /**
     * Create leaf node
     */
    function createLeaf(symbol) {
        return createNode(symbol, []);
    }

    /**
     * Create unary operation node
     */
    function createUnary(operator, operand) {
        return createNode(operator, [operand]);
    }

    /**
     * Create binary operation node
     */
    function createBinary(operator, left, right) {
        return createNode(operator, [left, right]);
    }

    /**
     * Check if two AST nodes are equal
     */
    function equals(t1, t2) {
        if (!t1 || !t2) return false;
        if (t1.root !== t2.root) return false;
        if (t1.children.length !== t2.children.length) return false;
        
        for (let i = 0; i < t1.children.length; i++) {
            if (!equals(t1.children[i], t2.children[i])) return false;
        }
        return true;
    }

    /**
     * Deep clone AST node
     */
    function clone(node) {
        if (!node) return null;
        return createNode(node.root, node.children.map(clone));
    }

    /**
     * Check node types
     */
    function isLeaf(node) {
        return node.children.length === 0;
    }

    function isUnary(node) {
        return node.children.length === 1;
    }

    function isBinary(node) {
        return node.children.length === 2;
    }

    /**
     * Get tree height
     */
    function getHeight(node) {
        if (isLeaf(node)) return 0;
        return 1 + Math.max(...node.children.map(getHeight));
    }

    /**
     * Count nodes
     */
    function getNodeCount(node) {
        return 1 + node.children.reduce((sum, child) => sum + getNodeCount(child), 0);
    }

    /**
     * Get variables (single letters)
     */
    function getVariables(node) {
        const variables = new Set();
        
        if (isLeaf(node) && /^[a-zA-Z]$/.test(node.root)) {
            variables.add(node.root);
        }
        
        node.children.forEach(child => {
            getVariables(child).forEach(v => variables.add(v));
        });
        
        return variables;
    }

    /**
     * Replace subtree
     */
    function replace(node, target, replacement) {
        if (equals(node, target)) {
            return clone(replacement);
        }
        
        return createNode(
            node.root, 
            node.children.map(child => replace(child, target, replacement))
        );
    }

    /**
     * Convert to string representation
     */
    function toString(node) {
        if (isLeaf(node)) return node.root;
        if (isUnary(node)) return node.root + "(" + toString(node.children[0]) + ")";
        if (isBinary(node)) {
            return "(" + toString(node.children[0]) + " " + node.root + " " + toString(node.children[1]) + ")";
        }
        
        // N-ary operations
        const childStrings = node.children.map(toString);
        return node.root + "(" + childStrings.join(", ") + ")";
    }

    /**
     * Validate AST node
     */
    function isValidNode(node) {
        if (!node || typeof node !== 'object') return false;
        if (typeof node.root !== 'string') return false;
        if (!Array.isArray(node.children)) return false;
        return node.children.every(isValidNode);
    }

    // Public API
    return {
        createNode,
        createLeaf,
        createUnary,
        createBinary,
        equals,
        clone,
        isLeaf,
        isUnary,
        isBinary,
        isValidNode,
        getHeight,
        getNodeCount,
        getVariables,
        replace,
        toString
    };
})();