/**
 * Output Formatting Module
 * 
 * Handles converting ASTs and proof content to different output formats
 * Supports LaTeX, HTML, Markdown, and display formats
 */

window.ProofAssistant = window.ProofAssistant || {};

window.ProofAssistant.Formatter = (function() {
    'use strict';

    /**
     * Main formatting dispatch function
     * @param {string} type - Output format ('latex', 'markdown', 'html')
     * @param {Object} content - Proof content with LHS, RHS, expressions, rules
     * @returns {string} Formatted output string
     */
    function formatProof(type, content) {
        switch(type) {
            case 'latex':
                return formatAsLaTeX(content);
            case 'markdown':
                return formatAsMarkdown(content);
            case 'html':
                return formatAsHTML(content);
            default:
                return 'Format not supported: ' + type;
        }
    }

    /**
     * Generate LaTeX format for proof display (minimal version)
     * Creates a simple mathematical proof table
     * @param {Object} content - Proof content
     * @returns {string} LaTeX formatted string
     */
    function formatAsLaTeX(content) {
        if (!content) return '';
        
        // Start LaTeX array environment for proof steps
        let result = "\\[\\begin{array}{rclr}\n    " + convertToLaTeX(content.LHS);
        
        // Add each proof step with rule justification
        if (content.expressions && content.rules) {
            for(let i = 0; i < content.expressions.length; i++) {
                const expr = convertToLaTeX(content.expressions[i], false);
                const rule = getRuleDisplayName(content.rules[i]);
                result += " &" + getEqualitySymbol("latex") + "& " + expr + 
                         " &\\quad\\text{(" + rule + ")}\\\\\n    ";
            }
        }
        
        // Remove trailing comma and newline, close array
        result = result.replace(/\\\\\n    $/, '');
        result += "\n\\end{array}\\]";
        
        return result;
    }

    /**
     * Generate Markdown table format for proof display (minimal version)
     * @param {Object} content - Proof content
     * @returns {string} Markdown formatted string
     */
    function formatAsMarkdown(content) {
        if (!content) return '';
        
        // Create markdown table with proof steps
        let result = "| Expression | Rule |\n|------------|------|\n";
        result += "| " + convertToMarkdown(content.LHS) + " | Given |\n";
        
        // Add each step as table row
        if (content.expressions && content.rules) {
            for(let i = 0; i < content.expressions.length; i++) {
                const expr = convertToMarkdown(content.expressions[i]);
                const rule = getRuleDisplayName(content.rules[i]);
                result += "| " + expr + " | " + rule + " |\n";
            }
        }
        
        return result;
    }

    /**
     * Generate HTML table format for proof display
     * @param {Object} content - Proof content
     * @returns {string} HTML formatted string
     */
    function formatAsHTML(content) {
        if (!content) return '';
        
        // Create HTML table with proof steps
        let result = '<table style="white-space:nowrap;">';
        result += '<tr><td>' + escapeHTML(content.LHS) + '</td><td></td></tr>';
        
        // Add each step as table row
        if (content.expressions && content.rules) {
            for(let i = 0; i < content.expressions.length; i++) {
                const expr = escapeHTML(content.expressions[i]);
                const rule = getRuleDisplayName(content.rules[i]);
                result += '<tr><td></td><td>&nbsp;' + getEqualitySymbol("display") + 
                         ' ' + expr + '</td><td>&nbsp;&nbsp;&nbsp;(' + escapeHTML(rule) + ')</td></tr>';
            }
        }
        
        result += '</table>';
        return result;
    }

    /**
     * Get the display name for a rule (converts internal names to proper names)
     * @param {string|Object} rule - Rule name (string) or rule object
     * @returns {string} Proper display name for the rule
     */
    function getRuleDisplayName(rule) {
        // If it's already an object with text property, use that
        if (typeof rule === 'object' && rule.text) {
            return rule.text;
        }
        
        // If it's a string, try to look up the proper name
        if (typeof rule === 'string') {
            // Get current theory to look up rule definitions
            const state = window.ProofAssistant.Main ? window.ProofAssistant.Main.getState() : null;
            if (state && state.theory && window.ProofAssistant.Theories) {
                // Get the current theory module
                let currentTheory = null;
                switch(state.theory.name) {
                    case 'set_theory':
                        currentTheory = window.ProofAssistant.Theories.SetTheory;
                        break;
                    case 'bool_alg':
                        currentTheory = window.ProofAssistant.Theories.BooleanAlgebra;
                        break;
                    case 'prop_logic':
                        currentTheory = window.ProofAssistant.Theories.PropositionalLogic;
                        break;
                }
                
                // Look up the rule definition
                if (currentTheory && currentTheory.rules) {
                    const ruleDefinition = currentTheory.rules.find(r => r.name === rule);
                    if (ruleDefinition && ruleDefinition.text) {
                        return ruleDefinition.text;
                    }
                }
            }
            
            // Fallback: return the rule name as-is
            return rule;
        }
        
        // Fallback for unknown format
        return String(rule);
    }

    /**
     * Convert AST to LaTeX format
     * @param {Object|string} input - AST node or string
     * @param {boolean} inText - Whether output is for text mode (adds $ delimiters)
     * @returns {string} LaTeX formatted string
     */
    function convertToLaTeX(input, inText = false) {
        if (!input) return '';
        
        let str;
        if (typeof input === 'string') {
            str = input;
        } else if (window.ProofAssistant.AST && window.ProofAssistant.AST.isValidNode(input)) {
            // Convert AST to string first
            const [text] = window.ProofAssistant.Parser.unparse(input, 'text');
            str = text;
        } else {
            str = String(input);
        }
        
        // Replace symbols with LaTeX equivalents
        const symbols = window.ProofAssistant.Parser.getSymbols();
        const symbolRegex = buildSymbolRegex(symbols);
        
        if (!symbolRegex) return str;
        
        const re = new RegExp(symbolRegex, "g");
        const result = str.replace(re, txt => {
            const symbol = findSymbol(symbols, "text", txt);
            if (symbol && symbol.latex) {
                return symbol.latex;
            }
            return txt;
        });
        
        return inText ? "$" + result + "$" : result;
    }

    /**
     * Convert AST to Markdown format
     * @param {Object|string} input - AST node or string
     * @returns {string} Markdown formatted string
     */
    function convertToMarkdown(input) {
        if (!input) return '';
        
        let str;
        if (typeof input === 'string') {
            str = input;
        } else if (window.ProofAssistant.AST && window.ProofAssistant.AST.isValidNode(input)) {
            // Convert AST to string first
            const [text] = window.ProofAssistant.Parser.unparse(input, 'text');
            str = text;
        } else {
            str = String(input);
        }
        
        // Replace symbols with Markdown equivalents (keep Unicode symbols)
        const symbols = window.ProofAssistant.Parser.getSymbols();
        const symbolRegex = buildSymbolRegex(symbols);
        
        if (!symbolRegex) return str;
        
        const re = new RegExp(symbolRegex, "g");
        return str.replace(re, txt => {
            const symbol = findSymbol(symbols, "text", txt);
            if (symbol) {
                // Use markdown if available, otherwise use display (Unicode)
                return symbol.markdown || symbol.display || txt;
            }
            return txt;
        });
    }

    /**
     * Format an AST node to a specific output type
     * @param {Object} ast - AST node
     * @param {string} format - Output format ('text', 'latex', 'markdown', 'display')
     * @returns {string} Formatted string
     */
    function formatAST(ast, format) {
        if (!ast || !window.ProofAssistant.AST.isValidNode(ast)) {
            return '';
        }
        
        // Get the basic text representation
        const [text] = window.ProofAssistant.Parser.unparse(ast, 'text');
        
        switch(format) {
            case 'latex':
                return convertToLaTeX(text, false);
            case 'markdown':
                return convertToMarkdown(text);
            case 'display':
                return text; // Already in display format from unparse
            case 'text':
            default:
                return text;
        }
    }

    /**
     * Format a single proof step
     * @param {Object} step - Step object with expression and rule
     * @param {string} format - Output format
     * @returns {string} Formatted step
     */
    function formatProofStep(step, format) {
        if (!step || !step.expression) return '';
        
        const expr = formatAST(step.expression, format);
        const rule = getRuleDisplayName(step.rule);
        
        switch(format) {
            case 'latex':
                return `&= ${expr} &\\quad\\text{(${rule})}\\\\`;
            case 'markdown':
                return `| ${expr} | ${rule} |`;
            case 'html':
                return `<tr><td></td><td>&nbsp;= ${escapeHTML(expr)}</td><td>&nbsp;&nbsp;&nbsp;(${escapeHTML(rule)})</td></tr>`;
            default:
                return `= ${expr} (${rule})`;
        }
    }

    /**
     * Format multiple proof steps
     * @param {Array} steps - Array of proof steps
     * @param {string} format - Output format
     * @param {Object} startExpr - Starting expression AST
     * @param {Object} targetExpr - Target expression AST
     * @returns {string} Formatted proof steps
     */
    function formatProofSteps(steps, format, startExpr, targetExpr) {
        if (!steps || steps.length === 0) return '';
        
        const lines = [];
        
        switch(format) {
            case 'latex':
                lines.push("\\[\\begin{array}{rcl}");
                lines.push(formatAST(startExpr, format));
                steps.forEach(step => {
                    lines.push(formatProofStep(step, format));
                });
                lines.push("\\end{array}\\]");
                break;
                
            case 'markdown':
                lines.push("| Expression | Rule |");
                lines.push("|------------|------|");
                lines.push(`| ${formatAST(startExpr, format)} | Given |`);
                steps.forEach(step => {
                    const expr = formatAST(step.expression, format);
                    const rule = getRuleDisplayName(step.rule);
                    lines.push(`| ${expr} | ${rule} |`);
                });
                break;
                
            case 'html':
                lines.push('<table style="white-space:nowrap;">');
                lines.push(`<tr><td>${formatAST(startExpr, format)}</td><td></td></tr>`);
                steps.forEach(step => {
                    lines.push(formatProofStep(step, format));
                });
                lines.push('</table>');
                break;
                
            default:
                lines.push(formatAST(startExpr, format));
                steps.forEach(step => {
                    lines.push(formatProofStep(step, format));
                });
        }
        
        return lines.join('\n');
    }

    /**
     * Get the equality symbol for a specific format
     */
    function getEqualitySymbol(format) {
        const equality = window.ProofAssistant.Parser.getEquality();
        return equality[format] || '=';
    }

    /**
     * Build regex pattern for symbol matching
     */
    function buildSymbolRegex(symbols) {
        if (!symbols || symbols.length === 0) return '';
        
        let pattern = "";
        for(const symbol of symbols) {
            if (symbol.text) {
                // Escape special regex characters
                const escaped = symbol.text.replace(/[\\\!\@\#\$\%\^\&\*\)\(\+\=\.\<\>\{\}\[\]\:\;\'\"\|\~\`\_\-]/g, '\\$&');
                pattern += escaped + "|";
            }
        }
        // Remove trailing '|'
        return pattern.substring(0, pattern.length - 1);
    }

    /**
     * Find symbol by key-value pair
     */
    function findSymbol(symbols, key, value) {
        return symbols.find(s => s[key] === value);
    }

    /**
     * Escape HTML special characters
     */
    function escapeHTML(str) {
        if (typeof str !== 'string') return '';
        
        const htmlEscapes = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;'
        };
        
        return str.replace(/[&<>"']/g, match => htmlEscapes[match]);
    }

    // Public API
    return {
        // Main formatting functions
        formatProof: formatProof,
        formatAsLaTeX: formatAsLaTeX,
        formatAsMarkdown: formatAsMarkdown,
        formatAsHTML: formatAsHTML,
        
        // Conversion functions
        convertToLaTeX: convertToLaTeX,
        convertToMarkdown: convertToMarkdown,
        
        // AST formatting
        formatAST: formatAST,
        formatProofStep: formatProofStep,
        formatProofSteps: formatProofSteps,
        
        // Utilities
        escapeHTML: escapeHTML,
        getEqualitySymbol: getEqualitySymbol,
        getRuleDisplayName: getRuleDisplayName
    };
})();