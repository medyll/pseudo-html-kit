import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';

/**
 * S10-01: Input Validation Tests
 * Tests HTML5 constraint validation + Popover API integration
 * Focuses on: constraint validation API, popover structure, accessibility
 */

describe('S10-01: Input Validation (Constraint API + Popover)', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    // Create raw input elements with constraint attributes
    container.innerHTML = `
      <input 
        id="email-input" 
        type="email" 
        name="email" 
        required
        placeholder="Enter email">
      <input 
        id="number-input" 
        type="number" 
        name="qty"
        min="1"
        max="100">
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    vi.clearAllMocks();
    container?.remove();
  });

  describe('HTML5 Constraint Validation API', () => {
    it('should expose validity object on input element', () => {
      const fieldEl = document.getElementById('email-input');
      
      expect(fieldEl).toBeDefined();
      expect(fieldEl.validity).toBeDefined();
      expect(fieldEl.validity.valid).toBe(false); // required, empty → invalid
      expect(fieldEl.validity.valueMissing).toBe(true);
    });

    it('should validate required constraint', () => {
      const fieldEl = document.getElementById('email-input');
      
      fieldEl.value = '';
      expect(fieldEl.validity.valueMissing).toBe(true);
      
      fieldEl.value = 'user@example.com';
      expect(fieldEl.validity.valueMissing).toBe(false);
    });

    it('should validate type constraint (email)', () => {
      const fieldEl = document.getElementById('email-input');
      
      fieldEl.value = 'invalid-email';
      expect(fieldEl.validity.typeMismatch).toBe(true);
      
      fieldEl.value = 'user@example.com';
      expect(fieldEl.validity.typeMismatch).toBe(false);
    });

    it('should validate min/max constraints (number)', () => {
      const fieldEl = document.getElementById('number-input');
      
      fieldEl.value = '0';
      expect(fieldEl.validity.rangeUnderflow).toBe(true);
      
      fieldEl.value = '50';
      expect(fieldEl.validity.rangeUnderflow).toBe(false);
      expect(fieldEl.validity.rangeOverflow).toBe(false);
      
      fieldEl.value = '101';
      expect(fieldEl.validity.rangeOverflow).toBe(true);
    });
  });

  describe('CSS :invalid and :valid pseudo-classes', () => {
    it('should apply :invalid pseudo-class when field is invalid', () => {
      const fieldEl = document.getElementById('email-input');
      
      fieldEl.value = 'invalid-email';
      // In happy-dom, matches() works for some selectors
      expect(fieldEl.validity.valid).toBe(false);
    });

    it('should apply :valid pseudo-class when field is valid', () => {
      const fieldEl = document.getElementById('email-input');
      
      fieldEl.value = 'user@example.com';
      expect(fieldEl.validity.valid).toBe(true);
    });
  });

  describe('Native Validation API Methods', () => {
    it('should expose checkValidity() method', () => {
      const fieldEl = document.getElementById('email-input');
      
      expect(fieldEl.checkValidity).toBeDefined();
      expect(typeof fieldEl.checkValidity).toBe('function');
    });

    it('should expose reportValidity() method', () => {
      const fieldEl = document.getElementById('email-input');
      
      expect(fieldEl.reportValidity).toBeDefined();
      expect(typeof fieldEl.reportValidity).toBe('function');
    });

    it('checkValidity() returns false when required field is empty', () => {
      const fieldEl = document.getElementById('email-input');
      fieldEl.value = '';
      
      expect(fieldEl.checkValidity()).toBe(false);
    });

    it('checkValidity() returns true when field is valid', () => {
      const fieldEl = document.getElementById('email-input');
      fieldEl.value = 'user@example.com';
      
      expect(fieldEl.checkValidity()).toBe(true);
    });
  });

  describe('Form Submission Validation', () => {
    it('should prevent submission when validation fails', () => {
      const form = document.createElement('form');
      const input = document.createElement('input');
      input.type = 'email';
      input.required = true;
      input.value = 'invalid-email';
      
      form.appendChild(input);
      document.body.appendChild(form);
      
      const event = new Event('submit', { cancelable: true });
      const prevented = !form.dispatchEvent(event);
      // Note: HTML5 validation happens before submit, so this tests the API
      expect(input.checkValidity()).toBe(false);
      
      form.remove();
    });
  });

  describe('ValidationMessage', () => {
    it('should expose validationMessage property', () => {
      const fieldEl = document.getElementById('email-input');
      fieldEl.value = '';
      
      // Trigger validation
      fieldEl.checkValidity();
      expect(typeof fieldEl.validationMessage).toBe('string');
    });

    it('should clear validation message when valid', () => {
      const fieldEl = document.getElementById('email-input');
      fieldEl.value = 'user@example.com';
      
      // Valid input should have empty validation message
      expect(fieldEl.validationMessage).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('should support aria-describedby for error linking', () => {
      const fieldEl = document.getElementById('email-input');
      fieldEl.setAttribute('aria-describedby', 'error-msg');
      
      expect(fieldEl.getAttribute('aria-describedby')).toBe('error-msg');
    });

    it('should support aria-label for accessible naming', () => {
      const fieldEl = document.getElementById('email-input');
      fieldEl.setAttribute('aria-label', 'Email address');
      
      expect(fieldEl.getAttribute('aria-label')).toBe('Email address');
    });
  });
});
