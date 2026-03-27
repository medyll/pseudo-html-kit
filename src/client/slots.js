/**
 * @fileoverview client/slots.js — Slot resolution for pseudo-kit components.
 *
 * Handles named slots, default slots, and slot data-* forwarding.
 * Each slot is wrapped in a <pk-slot display:contents> element.
 */

'use strict';

/**
 * Creates a slot wrapper element with display:contents.
 * @param {string} componentName - Tag name of the parent component.
 * @param {string} slotName      - Slot name ("default" if unnamed).
 * @param {Object} slotData      - data-* attributes from the slot.
 * @returns {HTMLElement}
 */
export function createSlotWrapper(componentName, slotName, slotData) {
  const wrapper = document.createElement('pk-slot');
  wrapper.setAttribute('data-slot-component', componentName);
  wrapper.setAttribute('data-slot-name', slotName);

  if (Object.keys(slotData).length > 0) {
    wrapper.setAttribute('data-slot-props', JSON.stringify(slotData));
  }

  wrapper.style.display = 'contents';
  return wrapper;
}

/**
 * Extracts data-* attributes from a slot element.
 * @param {Element} slot
 * @returns {Object<string, string>}
 */
export function getSlotData(slot) {
  const data = {};
  for (const attr of slot.attributes) {
    if (attr.name.startsWith('data-')) {
      data[attr.name] = attr.value;
    }
  }
  return data;
}

/**
 * Forwards slot data-* attributes to element children.
 * @param {Node} node     - The child node to enrich.
 * @param {Object<string, string>} slotData - data-* to forward.
 */
export function forwardSlotData(node, slotData) {
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  for (const [key, val] of Object.entries(slotData)) {
    if (!node.hasAttribute(key)) {
      node.setAttribute(key, val);
    }
  }
}

/**
 * Stamps a component's <template> into the target element with slot resolution.
 *
 * @param {Element} el - The component host element.
 * @param {Object} def - Component definition with template.
 */
export function stampTemplate(el, def) {
  const fragment = def.template.cloneNode(true);
  const originalChildren = [...el.childNodes];

  // Separate named children (slot="x") from default children
  const namedChildren = {};
  const defaultChildren = [];

  for (const node of originalChildren) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const slotAttr = node.getAttribute('slot');
      if (slotAttr) {
        if (!namedChildren[slotAttr]) namedChildren[slotAttr] = [];
        namedChildren[slotAttr].push(node);
      } else {
        defaultChildren.push(node);
      }
    } else {
      defaultChildren.push(node); // text nodes go to default slot
    }
  }

  // Process all slots in the template
  const slots = [...fragment.querySelectorAll('slot')];

  for (const slot of slots) {
    const slotName = slot.getAttribute('name') ?? 'default';
    const data = getSlotData(slot);
    const wrapper = createSlotWrapper(def.name, slotName, data);

    const children = slotName === 'default'
      ? defaultChildren
      : (namedChildren[slotName] ?? []);

    for (const node of children) {
      const clone = node.cloneNode(true);
      forwardSlotData(clone, data);
      wrapper.appendChild(clone);
    }

    slot.replaceWith(wrapper);
  }

  el.innerHTML = '';
  el.appendChild(fragment);
}
