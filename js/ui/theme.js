/**
 * Theme System
 * 
 * Applies theme colors from configuration to CSS variables
 * Static configuration - requires page refresh for changes
 */

window.ProofAssistant = window.ProofAssistant || {};
window.ProofAssistant.Theme = (function() {
    'use strict';

    // Default theme fallback
    const DEFAULT_THEME = {
        primaryColor: '#FFCD00',
        secondaryColor: '#003366',
        accentColor: '#B8860B',
        backgroundColor: '#FEFEFE',
        textColor: '#2C2C2C'
    };

    // Default theory colors
    const DEFAULT_THEORY_COLORS = {
        set_theory: { color: '#2E7D32', background: '#E8F5E8' },
        bool_alg: { color: '#F57C00', background: '#FFF3E0' },
        prop_logic: { color: '#1976D2', background: '#E3F2FD' }
    };

    // Default status colors
    const DEFAULT_STATUS_COLORS = {
        success: { color: '#28a745', background: '#d4edda', border: '#c3e6cb', text: '#155724' },
        error: { color: '#dc3545', background: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
        warning: { color: '#ffc107', background: '#fff3cd', border: '#ffeaa7', text: '#856404' }
    };

    // Default configuration fallback
    const DEFAULT_CONFIG = {
        courseTitle: 'Proof Assistant',
        toolName: 'Proof Assistant',
        showUniLogo: false,
        borderRadius: '8px',
        ui: {
            theme: DEFAULT_THEME
        }
    };

    // Current theme state
    let currentTheme = { ...DEFAULT_THEME };
    let currentConfig = { ...DEFAULT_CONFIG };

    /**
     * Apply complete configuration including theme and branding
     */
    function applyConfiguration(config) {
        if (!config) {
            config = DEFAULT_CONFIG;
        }

        // Merge configuration
        currentConfig = mergeDeep(DEFAULT_CONFIG, config);

        // Apply all settings
        if (currentConfig.ui && currentConfig.ui.theme) {
            applyTheme(currentConfig.ui.theme);
        }

        if (currentConfig.theories) {
            applyTheoryColors(currentConfig.theories);
        }

        if (currentConfig.ui && currentConfig.ui.statusColors) {
            applyStatusColors(currentConfig.ui.statusColors);
        }

        applyBranding();
        applyBorderRadius();
    }

    /**
     * Apply theme colors to CSS variables
     */
    function applyTheme(theme) {
        currentTheme = { ...DEFAULT_THEME, ...theme };
        const root = document.documentElement;

        // Apply primary theme colors
        Object.entries(currentTheme).forEach(([key, value]) => {
            if (value) {
                const cssVar = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
                root.style.setProperty(cssVar, value);
            }
        });

        // Generate derived colors
        const derivedColors = {
            '--light-primary': `color-mix(in srgb, ${currentTheme.primaryColor} 20%, white)`,
            '--dark-secondary': `color-mix(in srgb, ${currentTheme.secondaryColor} 80%, black)`,
            '--hover-bg': `color-mix(in srgb, ${currentTheme.primaryColor} 10%, ${currentTheme.backgroundColor})`,
            '--active-bg': `color-mix(in srgb, ${currentTheme.primaryColor} 15%, ${currentTheme.backgroundColor})`,
            '--focus-color': currentTheme.primaryColor,
            '--focus-shadow': `color-mix(in srgb, ${currentTheme.primaryColor} 25%, transparent)`,
            '--info-color': currentTheme.primaryColor,
            '--info-bg': `color-mix(in srgb, ${currentTheme.primaryColor} 20%, white)`,
            '--info-border': currentTheme.primaryColor,
            '--info-text': currentTheme.secondaryColor
        };

        Object.entries(derivedColors).forEach(([prop, value]) => {
            root.style.setProperty(prop, value);
        });
    }

    /**
     * Apply theory colors from configuration
     */
    function applyTheoryColors(theories) {
        const root = document.documentElement;

        Object.entries(theories).forEach(([theoryKey, theory]) => {
            if (theory.color) {
                root.style.setProperty(`--theory-${theoryKey.replace('_', '-')}-color`, theory.color);
                
                const bgColor = theory.backgroundColor || `color-mix(in srgb, ${theory.color} 15%, white)`;
                root.style.setProperty(`--theory-${theoryKey.replace('_', '-')}-bg`, bgColor);
            }
        });
    }

    /**
     * Apply status colors from configuration
     */
    function applyStatusColors(statusColors) {
        const root = document.documentElement;

        Object.entries(statusColors).forEach(([status, colors]) => {
            if (colors && typeof colors === 'object') {
                Object.entries(colors).forEach(([prop, value]) => {
                    if (value) {
                        root.style.setProperty(`--${status}-${prop}`, value);
                    }
                });
            }
        });
    }

    /**
     * Apply branding settings
     */
    function applyBranding() {
        const { courseTitle, toolName, showUniLogo } = currentConfig;

        // Update titles
        if (courseTitle || toolName) {
            updateTextContent('.course-title', courseTitle);
            updateTextContent('.tool-name', toolName);
            
            // Update page title
            if (document.title.includes('Proof Assistant')) {
                document.title = document.title.replace('Proof Assistant', toolName);
            }
            
            // Update headers
            document.querySelectorAll('#no-problem-selected h4, .content-header h4').forEach(header => {
                if (header.textContent.includes('Proof Assistant')) {
                    header.textContent = courseTitle;
                }
            });
        }

        // Handle logo
        if (showUniLogo) {
            setupLogos();
        }

        // Update page-specific branding
        updatePageBranding();
    }

    /**
     * Setup university logos
     */
    function setupLogos() {
        // Setup existing logos
        document.querySelectorAll('.uni-logo').forEach(logo => {
            if (logo.classList.contains('sidebar-logo') || logo.closest('.sidebar-header')) {
                logo.style.display = 'block';
                logo.src = 'logo.png';
                logo.alt = 'University Logo';
                
                logo.addEventListener('error', function() {
                    this.style.display = 'none';
                    const header = this.closest('.sidebar-header');
                    if (header) header.classList.remove('header-with-logo');
                }, { once: true });
                
                logo.addEventListener('load', function() {
                    this.style.display = 'block';
                    const header = this.closest('.sidebar-header');
                    if (header) header.classList.add('header-with-logo');
                }, { once: true });
            }
        });

        // Add logos to headers that don't have them
        const sidebarHeader = document.querySelector('.sidebar-header');
        if (sidebarHeader && !sidebarHeader.querySelector('.uni-logo')) {
            const logo = createLogoElement();
            logo.classList.add('sidebar-logo');
            sidebarHeader.insertBefore(logo, sidebarHeader.firstChild);
            sidebarHeader.classList.add('header-with-logo');
        }
    }

    /**
     * Create logo element
     */
    function createLogoElement() {
        const logo = document.createElement('img');
        logo.className = 'uni-logo';
        logo.src = 'logo.png';
        logo.alt = 'University Logo';
        logo.style.display = 'block';
        
        logo.addEventListener('error', function() {
            this.style.display = 'none';
        }, { once: true });
        
        return logo;
    }

    /**
     * Update page-specific branding elements
     */
    function updatePageBranding() {
        const { courseTitle, toolName } = currentConfig;
        
        // Sidebar
        const sidebarHeader = document.querySelector('.sidebar-header h4');
        if (sidebarHeader) {
            sidebarHeader.textContent = courseTitle && courseTitle.length > 25 ? toolName : (courseTitle || toolName);
        }

        // Dashboard
        updateTextContent('#dashboard-title', courseTitle);
        if (toolName) {
            const subtitle = document.getElementById('dashboard-subtitle');
            if (subtitle) subtitle.textContent = `${toolName} - Select a problem to begin proving`;
        }

        // Equations page
        if (toolName) {
            const equationsTitle = document.getElementById('equations-title');
            if (equationsTitle) equationsTitle.textContent = `${toolName} - Custom Equations`;
            
            const proofTitle = document.getElementById('proof-section-title');
            if (proofTitle) proofTitle.textContent = `${toolName} - Custom Equation Proof`;
        }
        
        updateTextContent('#theory-section-title', 'Select Theory');
        updateTextContent('#equation-section-title', 'Define Your Equation');
    }

    /**
     * Apply border radius configuration
     */
    function applyBorderRadius() {
        const borderRadiusValue = currentConfig.borderRadius;
        if (!borderRadiusValue) return;
        
        const root = document.documentElement;
        const radiusNumber = parseInt(borderRadiusValue);
        
        if (borderRadiusValue === '0px' || borderRadiusValue === '0' || radiusNumber === 0) {
            // Sharp corners
            ['--radius-sm', '--radius-md', '--radius-lg', '--radius-xl'].forEach(prop => {
                root.style.setProperty(prop, '0px');
            });
        } else if (!isNaN(radiusNumber)) {
            // Proportional radius values
            root.style.setProperty('--radius-sm', Math.max(2, radiusNumber - 1) + 'px');
            root.style.setProperty('--radius-md', radiusNumber + 'px');
            root.style.setProperty('--radius-lg', (radiusNumber + 2) + 'px');
            root.style.setProperty('--radius-xl', Math.min(20, radiusNumber * 2) + 'px');
        }
    }

    /**
     * Update text content helper
     */
    function updateTextContent(selector, text) {
        if (!text) return;
        document.querySelectorAll(selector).forEach(element => {
            element.textContent = text;
        });
    }

    /**
     * Deep merge helper
     */
    function mergeDeep(target, source) {
        const result = JSON.parse(JSON.stringify(target));
        
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    result[key] = result[key] || {};
                    result[key] = mergeDeep(result[key], source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }
        
        return result;
    }

    /**
     * Initialize theme system
     */
    function init() {
        // Get configuration from problems data or main app
        let config = null;

        if (window.problemsData && window.problemsData.configuration) {
            config = window.problemsData.configuration;
        } else if (window.ProofAssistant && window.ProofAssistant.Main) {
            try {
                config = window.ProofAssistant.Main.getConfiguration();
            } catch (error) {
                // Silent fallback
            }
        }

        // Apply configuration once
        applyConfiguration(config || DEFAULT_CONFIG);
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 0);
    }

    // Public API
    return {
        init: init,
        applyConfiguration: applyConfiguration,
        applyTheme: applyTheme,
        updateTheme: (updates) => {
            const newTheme = { ...currentTheme, ...updates };
            applyTheme(newTheme);
        },
        resetTheme: () => applyTheme(DEFAULT_THEME)
    };
})();