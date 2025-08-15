/**
 * Pattern Matching Module
 */

window.ProofAssistant = window.ProofAssistant || {};

window.ProofAssistant.PatternMatcher = (function() {
    'use strict';

    /**
     * Check if node is pattern variable (lowercase letter)
     */
    function isPatternVariable(node) {
        return node.children.length === 0 && /^[a-z]$/.test(node.root);
    }

    /**
     * Match pattern against concrete AST
     */
    function matchPattern(pattern, concrete, bindings = {}) {
        if (!pattern || !concrete) return false;

        // Pattern variable - can match any subtree
        if (isPatternVariable(pattern)) {
            const varName = pattern.root;
            if (bindings[varName]) {
                return equals(bindings[varName], concrete);
            }
            bindings[varName] = clone(concrete);
            return true;
        }

        // Structure must match
        if (pattern.root !== concrete.root) return false;
        if (pattern.children.length !== concrete.children.length) return false;

        // Recursively match children
        return pattern.children.every((child, i) => 
            matchPattern(child, concrete.children[i], bindings)
        );
    }

    /**
     * Apply pattern rule to transform expression
     */
    function applyPatternRule(fromAST, toAST, lhsPattern, rhsPattern) {
        if (equals(fromAST, toAST)) {
            return 'No rule has been applied';
        }

        // Try forward direction
        if (tryApplyInDirection(fromAST, toAST, lhsPattern, rhsPattern) === 'Success') {
            return 'Success';
        }

        // Try reverse direction
        if (tryApplyInDirection(fromAST, toAST, rhsPattern, lhsPattern) === 'Success') {
            return 'Success';
        }

        const diffCount = countDifferences(fromAST, toAST);
        if (diffCount === 0) return 'No rule has been applied';
        if (diffCount > 1) return 'Too many changes have been made. Please only apply the rule in one place';
        return 'The chosen rule does not apply';
    }

    /**
     * Try applying rule in one direction
     */
    function tryApplyInDirection(fromAST, toAST, lhsPattern, rhsPattern) {
        // Try at root
        const bindings = {};
        if (matchPattern(lhsPattern, fromAST, bindings)) {
            const transformed = instantiatePattern(rhsPattern, bindings);
            if (equals(transformed, toAST)) return 'Success';
        }

        // Try in subexpressions
        if (fromAST.root !== toAST.root || fromAST.children.length !== toAST.children.length) {
            return 'The chosen rule does not apply';
        }

        const diffChildren = fromAST.children.filter((child, i) => 
            !equals(child, toAST.children[i])
        );

        if (diffChildren.length === 0) return 'No rule has been applied';
        if (diffChildren.length > 1) return 'The chosen rule does not apply';

        const diffIndex = fromAST.children.findIndex((child, i) => 
            !equals(child, toAST.children[i])
        );

        return tryApplyInDirection(
            fromAST.children[diffIndex], 
            toAST.children[diffIndex], 
            lhsPattern, 
            rhsPattern
        );
    }

    /**
     * Instantiate pattern with variable bindings
     */
    function instantiatePattern(pattern, bindings) {
        if (!pattern) return null;

        if (isPatternVariable(pattern)) {
            return bindings[pattern.root] ? clone(bindings[pattern.root]) : pattern;
        }

        return {
            root: pattern.root,
            children: pattern.children.map(child => instantiatePattern(child, bindings))
        };
    }

    /**
     * Count differences between ASTs
     */
    function countDifferences(ast1, ast2) {
        if (equals(ast1, ast2)) return 0;
        
        if (ast1.root !== ast2.root || ast1.children.length !== ast2.children.length) {
            return 1;
        }

        return ast1.children.reduce((count, child, i) => 
            count + countDifferences(child, ast2.children[i]), 0
        );
    }

    /**
     * Check if two ASTs are equal
     */
    function equals(t1, t2) {
        if (!t1 || !t2) return false;
        if (t1.root !== t2.root) return false;
        if (t1.children.length !== t2.children.length) return false;
        return t1.children.every((child, i) => equals(child, t2.children[i]));
    }

    /**
     * Clone AST
     */
    function clone(node) {
        if (!node) return null;
        return {
            root: node.root,
            children: node.children.map(clone)
        };
    }

    // Public API
    return {
        isPatternVariable,
        matchPattern,
        instantiatePattern,
        applyPatternRule,
        equals,
        clone
    };
})();