/**
 * Output Formatting Module
 */

window.ProofAssistant = window.ProofAssistant || {};

window.ProofAssistant.Formatter = (function() {
    'use strict';

    /**
     * Format proof content
     */
    function formatProof(type, content, parser) {
        if (!parser) return 'Error: Parser required';

        switch(type) {
            case 'latex': return formatAsLaTeX(content, parser);
            case 'markdown': return formatAsMarkdown(content, parser);
            case 'html': return formatAsHTML(content, parser);
            default: return 'Format not supported: ' + type;
        }
    }

    /**
     * Generate LaTeX format
     */
    function formatAsLaTeX(content, parser) {
        if (!content) return '';
        
        let result = "\\[\\begin{array}{rclr}\n    " + convertToLaTeX(content.LHS, parser);
        
        if (content.expressions && content.rules) {
            content.expressions.forEach((expr, i) => {
                const latexExpr = convertToLaTeX(expr, parser);
                const rule = getRuleDisplayName(content.rules[i]);
                
                // Convert symbols in rule text to LaTeX as well
                const latexRuleText = replaceSymbols(rule, parser.getSymbols(), 'latex');
                
                result += " &= & " + latexExpr + " & \\quad \\text{(" + latexRuleText + ")}\\\\\n    ";
            });
        }
        
        result = result.replace(/\\\\\n    $/, '');
        result += "\n\\end{array}\\]";
        return result;
    }

    /**
     * Generate Markdown format
     */
    function formatAsMarkdown(content, parser) {
        if (!content) return '';
        
        let result = "| Expression | Rule |\n|------------|------|\n";
        result += "| " + convertToMarkdown(content.LHS, parser) + " | Given |\n";
        
        if (content.expressions && content.rules) {
            content.expressions.forEach((expr, i) => {
                const mdExpr = convertToMarkdown(expr, parser);
                const rule = getRuleDisplayName(content.rules[i]);
                result += "| " + mdExpr + " | " + rule + " |\n";
            });
        }
        
        return result;
    }

    /**
     * Generate HTML format
     */
    function formatAsHTML(content, parser) {
        if (!content) return '';
        
        let result = '<table><tr><td>' + escapeHTML(content.LHS) + '</td><td></td></tr>';
        
        if (content.expressions && content.rules) {
            content.expressions.forEach((expr, i) => {
                const rule = getRuleDisplayName(content.rules[i]);
                result += '<tr><td></td><td>= ' + escapeHTML(expr) + 
                         '</td><td>(' + escapeHTML(rule) + ')</td></tr>';
            });
        }
        
        result += '</table>';
        return result;
    }

    /**
     * Convert to LaTeX with symbol replacement
     */
    function convertToLaTeX(input, parser) {
        if (!input || !parser) return '';
        
        const str = normalizeInput(input, parser);
        const symbols = parser.getSymbols();
        const result = replaceSymbols(str, symbols, 'latex');
        return addLaTeXSpacing(result);
    }

    /**
     * Convert to Markdown with symbol replacement
     */
    function convertToMarkdown(input, parser) {
        if (!input || !parser) return '';
        
        const str = normalizeInput(input, parser);
        const symbols = parser.getSymbols();
        return replaceSymbols(str, symbols, 'markdown');
    }

    /**
     * Normalize input to string
     */
    function normalizeInput(input, parser) {
        if (typeof input === 'string') return input;
        if (window.ProofAssistant.AST?.isValidNode(input)) {
            const [text] = parser.unparse(input, 'text');
            return text;
        }
        return String(input);
    }

    /**
     * Replace symbols with display format
     */
    function replaceSymbols(str, symbols, format) {
        if (!symbols?.length) return str;
        
        const symbolRegex = symbols
            .map(s => s.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('|');
            
        const re = new RegExp(symbolRegex, "g");
        return str.replace(re, txt => {
            const symbol = symbols.find(s => s.text === txt);
            if (symbol) {
                return symbol[format] || symbol.display || txt;
            }
            return txt;
        });
    }

    /**
     * Add spacing around LaTeX binary operators
     */
    function addLaTeXSpacing(str) {
        const binaryOps = ['\\cup', '\\cap', '\\vee', '\\wedge', '\\rightarrow', '\\leftrightarrow'];
        
        return binaryOps.reduce((result, op) => {
            const regex = new RegExp(`([A-Za-z0-9})])\\s*${op.replace(/\\/g, '\\\\')}\\s*([A-Za-z0-9{(])`, 'g');
            return result.replace(regex, `$1 ${op} $2`);
        }, str);
    }

    /**
     * Get rule display name
     */
    function getRuleDisplayName(rule) {
        return (typeof rule === 'object' && rule.text) ? rule.text : String(rule);
    }

    /**
     * Escape HTML special characters
     */
    function escapeHTML(str) {
        const escapes = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };
        return String(str).replace(/[&<>"']/g, match => escapes[match]);
    }

    // Public API
    return {
        formatProof,
        convertToLaTeX,
        convertToMarkdown,
        escapeHTML,
        getRuleDisplayName
    };
})();