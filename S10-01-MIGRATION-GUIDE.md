<!-- S10-01 Migration Guide: Input Component with HTML5 Constraint Validation
     Implementation target: src/pseudo-assets/components/atoms/input-pk.html
     
     Status: Ready for development (S10-01 in_progress)
-->

<!--
  MIGRATION STRATEGY:
  
  1. REMOVE custom validation JS logic
  2. ADD HTML5 constraint attributes: required, pattern, min, max
  3. ADD Popover API for error hints (native + fallback)
  4. ADD CSS :invalid, :valid, :user-invalid selectors
  5. ADD minimal JS for Popover fallback detection + error span display
  
  BROWSER SUPPORT:
  - Native path: Chrome 118+, Firefox 128+, Safari 17.4+ (Popover API supported)
  - Fallback: error <span> + JS listeners (older browsers)
-->

<template>
  <div class="input">
    <span class="input__prefix" aria-hidden="true">
      <slot name="prefix"></slot>
    </span>
    <input class="input__field" type="text" />
    <span class="input__suffix" aria-hidden="true">
      <slot name="suffix"></slot>
    </span>
    
    <!-- NEW: Popover for validation error message -->
    <div 
      class="input__error-popover" 
      popover="auto" 
      role="alert" 
      aria-live="polite"
      aria-atomic="true">
      <span class="input__error-text"></span>
    </div>
    
    <!-- Fallback error span (displayed when Popover API unavailable) -->
    <span 
      class="input__error-fallback" 
      role="alert" 
      aria-live="polite"
      aria-atomic="true">
    </span>
  </div>
</template>

<style>
  @scope (.input) {
    :scope {
      display: flex;
      flex-direction: column;
      gap: .25rem;
      width: 100%;
    }

    /* CSS Variables for customization */
    :scope {
      --input-border: var(--color-border, #cbd5e0);
      --input-border-invalid: var(--color-danger, #ef4444);
      --input-border-valid: var(--color-success, #10b981);
      --input-bg: var(--color-surface-1, #fff);
      --input-radius: var(--radius-md, .375rem);
      --input-padding: .5rem .75rem;
      --input-font: var(--text-sm, .875rem);
    }

    .input__field {
      flex: 1;
      width: 100%;
      padding: var(--input-padding);
      border: 1.5px solid var(--input-border);
      border-radius: var(--input-radius);
      background-color: var(--input-bg);
      color: var(--color-text, #1a202c);
      font-family: var(--font-sans, system-ui, sans-serif);
      font-size: var(--input-font);
      line-height: 1.5;
      outline: none;
      transition: border-color .15s, box-shadow .15s, background-color .15s;
      min-width: 0;
    }

    .input__field::placeholder {
      color: var(--color-text-muted, #a0aec0);
    }

    /* Focus state */
    .input__field:focus {
      border-color: var(--color-primary, #3b82f6);
      box-shadow: 0 0 0 3px var(--color-primary-ring, rgba(59,130,246,.2));
    }

    /* Disabled state */
    .input__field:disabled {
      opacity: .5;
      cursor: not-allowed;
      background-color: var(--color-surface-2, #edf2f7);
    }

    /* NEW: Invalid state (constraint validation failed) */
    .input__field:invalid {
      border-color: var(--input-border-invalid);
      background-color: rgba(239, 68, 68, .02);
    }
    .input__field:invalid:focus {
      box-shadow: 0 0 0 3px var(--color-danger-ring, rgba(239,68,68,.2));
    }

    /* NEW: User-invalid state (user has interacted and field is invalid) */
    .input__field:user-invalid {
      border-color: var(--input-border-invalid);
    }

    /* NEW: Valid state (constraint passed) */
    .input__field:valid:not(:placeholder-shown) {
      border-color: var(--input-border-valid);
    }

    /* NEW: Popover error message styling */
    .input__error-popover {
      padding: .5rem .75rem;
      background-color: var(--color-surface-1, #fff);
      border: 1.5px solid var(--input-border-invalid);
      border-radius: var(--input-radius);
      box-shadow: 0 2px 8px rgba(0,0,0,.1);
      font-size: var(--text-xs, .75rem);
      color: var(--input-border-invalid);
      max-width: 200px;
      z-index: 1000;
    }

    /* NEW: Fallback error span (hidden by default, shown via JS if Popover unavailable) */
    .input__error-fallback {
      display: none;
      flex: 0 0 100%;
      font-size: var(--text-xs, .75rem);
      color: var(--input-border-invalid);
      padding: .25rem 0;
    }
    :scope[data-validation-error="true"] .input__error-fallback {
      display: block;
    }

    /* Prefix / suffix decoration */
    .input__prefix:not(:empty),
    .input__suffix:not(:empty) {
      display: flex;
      align-items: center;
      padding: .5rem .625rem;
      background-color: var(--color-surface-2, #edf2f7);
      border: 1.5px solid var(--input-border);
      color: var(--color-text-muted, #718096);
      font-size: var(--text-sm, .875rem);
    }
    .input__prefix:not(:empty) {
      border-right: none;
      border-radius: var(--input-radius) 0 0 var(--input-radius);
    }
    .input__suffix:not(:empty) {
      border-left: none;
      border-radius: 0 var(--input-radius) var(--input-radius) 0;
    }
    :scope:has(.input__prefix:not(:empty)) .input__field {
      border-radius: 0 var(--input-radius) var(--input-radius) 0;
    }
    :scope:has(.input__suffix:not(:empty)) .input__field {
      border-radius: var(--input-radius) 0 0 var(--input-radius);
    }

    /* Sizes */
    :scope[size="sm"] { --input-padding: .25rem .625rem; --input-font: var(--text-xs, .75rem); }
    :scope[size="lg"] { --input-padding: .75rem 1rem;    --input-font: var(--text-base, 1rem); }

    /* Row layout */
    :scope {
      flex-direction: row;
      flex-wrap: wrap;
      align-items: stretch;
    }
    .input__error-popover,
    .input__error-fallback { flex: 0 0 100%; }
  }
</style>

<script>
// STEP 1: Forward host attributes to inner <input> for proper semantics
const field = el.querySelector('.input__field');
const errorPopover = el.querySelector('.input__error-popover');
const errorFallback = el.querySelector('.input__error-fallback');
const errorText = el.querySelector('.input__error-text');

if (field) {
  // Forward validation attributes
  const validationAttrs = ['type', 'name', 'placeholder', 'value', 'autocomplete', 'required', 'pattern', 'min', 'max', 'minlength', 'maxlength'];
  validationAttrs.forEach(attr => { 
    if (el.hasAttribute(attr)) field.setAttribute(attr, el.getAttribute(attr)); 
  });
  
  // Forward ID and ARIA attributes
  if (el.hasAttribute('id'))                { field.setAttribute('id', el.getAttribute('id')); el.removeAttribute('id'); }
  if (el.hasAttribute('aria-label'))        { field.setAttribute('aria-label', el.getAttribute('aria-label')); el.removeAttribute('aria-label'); }
  if (el.hasAttribute('aria-labelledby'))   { field.setAttribute('aria-labelledby', el.getAttribute('aria-labelledby')); el.removeAttribute('aria-labelledby'); }
  if (el.hasAttribute('aria-describedby'))  { field.setAttribute('aria-describedby', el.getAttribute('aria-describedby')); el.removeAttribute('aria-describedby'); }
  if (el.hasAttribute('disabled'))          { field.setAttribute('disabled', ''); }
}

// STEP 2: Feature detection — check if Popover API is available
const supportsPopover = 'popover' in HTMLElement.prototype;

// STEP 3: Validate on input + blur (HTML5 constraint validation)
field?.addEventListener('invalid', (e) => {
  e.preventDefault(); // Prevent default browser validation UI
  
  if (supportsPopover && errorPopover) {
    // Use Popover API for error message
    errorText.textContent = field.validationMessage;
    errorPopover.showPopover?.();
    // Link popover to input via popovertarget attribute
    field.setAttribute('popovertarget', errorPopover.id || 'input-error-popover');
  } else {
    // Fallback: display error span
    errorFallback.textContent = field.validationMessage;
    el.setAttribute('data-validation-error', 'true');
  }
});

field?.addEventListener('input', () => {
  // Auto-dismiss error when user starts typing valid input
  if (field.validity.valid) {
    errorPopover?.hidePopover?.();
    el.removeAttribute('data-validation-error');
    errorFallback.textContent = '';
  }
});

field?.addEventListener('blur', () => {
  // Check validity on blur (user-invalid state will apply via :user-invalid CSS)
  field.checkValidity();
});

// STEP 4: Programmatic validation API (for form submissions)
el.checkValidity = function() {
  return field?.checkValidity() || true;
};

el.reportValidity = function() {
  return field?.reportValidity() || true;
};

// STEP 5: Forward validity property
Object.defineProperty(el, 'validity', {
  get() { return field?.validity; }
});
</script>
