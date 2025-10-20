class Bindings {
  constructor(manager) {
    this.manager = manager;
    this._context = {};
  }

  // Update bindings with new data
  update(data = {}) {
    // Merge new data with existing context
    // Whatever keys are provided will overwrite existing values
    this._context = {
      ...this._context,
      ...data
    };

    this._updateBindings(this._context);
  }

  // Get current context
  getContext() {
    return this._context;
  }

  // Clear all context
  clear() {
    this._context = {};
    this._updateBindings(this._context);
  }

  // Main binding update system
  _updateBindings(context) {
    // Find all elements with data-wm-bind attribute
    const bindElements = document.querySelectorAll('[data-wm-bind]');

    bindElements.forEach(element => {
      const bindValue = element.getAttribute('data-wm-bind');

      // Split by comma to support multiple actions
      const bindings = this._parseBindings(bindValue);

      // Execute each action
      bindings.forEach(({ action, expression }) => {
        this._executeAction(element, action, expression, context);
      });

      // Remove skeleton loader class first to trigger transition
      element.classList.remove('wm-binding-skeleton');

      // Add bound class after a brief delay to allow for smooth animation (0.25s)
      setTimeout(() => {
        element.classList.add('wm-bound');
      }, 250);
    });
  }

  // Parse binding string into separate actions
  _parseBindings(bindValue) {
    const bindings = [];

    // Split by comma, but be smart about it
    // We need to handle cases where commas might be inside expressions
    const parts = bindValue.split(',').map(p => p.trim());

    parts.forEach(part => {
      let action = '@text'; // Default action
      let expression = part;

      // Check if it starts with an action keyword
      if (part.startsWith('@')) {
        const spaceIndex = part.indexOf(' ');
        if (spaceIndex > -1) {
          action = part.slice(0, spaceIndex);
          expression = part.slice(spaceIndex + 1).trim();
        } else {
          // No space means it's just an action with no expression (like @hide)
          action = part;
          expression = '';
        }
      }

      bindings.push({ action, expression });
    });

    return bindings;
  }

  // Execute a single action on an element
  _executeAction(element, action, expression, context) {
    switch (action) {
      case '@show':
        // Show element if condition is true (or always if no condition)
        const shouldShow = expression ? this._evaluateCondition(expression, context) : true;
        if (shouldShow) {
          element.removeAttribute('hidden');
        } else {
          element.setAttribute('hidden', '');
        }
        break;

      case '@hide':
        // Hide element if condition is true (or always if no condition)
        const shouldHide = expression ? this._evaluateCondition(expression, context) : true;
        if (shouldHide) {
          element.setAttribute('hidden', '');
        } else {
          element.removeAttribute('hidden');
        }
        break;

      case '@attr':
        // Set attribute value
        // Format: @attr attributeName expression
        const attrParts = expression.split(' ');
        const attrName = attrParts[0];
        const attrExpression = attrParts.slice(1).join(' ');
        const attrValue = this._resolvePath(context, attrExpression) || '';

        if (attrValue) {
          element.setAttribute(attrName, attrValue);
        } else {
          element.removeAttribute(attrName);
        }
        break;

      case '@text':
      default:
        // Set text content (default behavior)
        const value = this._resolvePath(context, expression) || '';

        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          element.value = value;
        } else {
          element.textContent = value;
        }
        break;

      // Future actions can be added here:
      // case '@class':
      // case '@style':
    }
  }

  // Resolve nested object path
  _resolvePath(obj, path) {
    if (!obj || !path) return null;

    return path.split('.').reduce((current, key) => {
      return current?.[key];
    }, obj);
  }

  // Safely evaluate simple conditions
  _evaluateCondition(condition, context) {
    try {
      // Replace context references with actual values
      // Support: auth.user.field, auth.account.field, simple comparisons

      // Check for negation operator at the start
      if (condition.trim().startsWith('!')) {
        const expression = condition.trim().slice(1).trim();
        const value = this._resolvePath(context, expression);
        return !value;
      }

      // Parse the condition to extract left side, operator, and right side
      const comparisonMatch = condition.match(/^(.+?)\s*(===|!==|==|!=|>|<|>=|<=)\s*(.+)$/);

      if (comparisonMatch) {
        const [, leftPath, operator, rightValue] = comparisonMatch;

        // Get the left side value
        const leftValue = this._resolvePath(context, leftPath.trim());

        // Parse the right side (could be string, number, boolean)
        let right = rightValue.trim();

        // Remove quotes if it's a string
        if ((right.startsWith("'") && right.endsWith("'")) ||
            (right.startsWith('"') && right.endsWith('"'))) {
          right = right.slice(1, -1);
        } else if (right === 'true') {
          right = true;
        } else if (right === 'false') {
          right = false;
        } else if (right === 'null') {
          right = null;
        } else if (!isNaN(right)) {
          right = Number(right);
        }

        // Evaluate based on operator
        switch (operator) {
          case '===': return leftValue === right;
          case '!==': return leftValue !== right;
          case '==': return leftValue == right;
          case '!=': return leftValue != right;
          case '>': return leftValue > right;
          case '<': return leftValue < right;
          case '>=': return leftValue >= right;
          case '<=': return leftValue <= right;
          default: return false;
        }
      } else {
        // Simple truthy check (e.g., "auth.user.emailVerified" or "auth.account")
        const value = this._resolvePath(context, condition.trim());
        return !!value;
      }
    } catch (error) {
      console.warn('Failed to evaluate condition:', condition, error);
      return false;
    }
  }
}

export default Bindings;
