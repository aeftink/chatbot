function render(tree, ns) {
  if (tree instanceof Node) return tree;
  if (typeof tree === 'string') return tree;
  if (Array.isArray(tree) && tree.length > 0) {
    // Check if tree has multiple children (tree[0] is array) or is an element (tree[0] is string)
    if (Array.isArray(tree[0])) {
      return tree.map((el) => render(el, ns));
    } else if (typeof tree[0] === 'string') {
      // Try to be forgiving with structure. Should support:
      // [type, attributes, children]
      // [type, attributes, children, children...]
      // [type, children, children]
      // [type, children]
      // Also support children = [] or children = Node (e.g. ['div', render(['div'])])
      let type, attributes, children;
      if (tree.length === 3) {
        const [first, second, third] = tree;
        type = first;
        if (Array.isArray(second) || second instanceof Node || typeof second === 'string') {
          children = [second, third];
        } else {
          attributes = second;
          children = third;
        }
      } else if (tree.length < 3) {
        const [first, second] = tree;
        type = first;
        if (Array.isArray(second) || second instanceof Node || typeof second === 'string') {
          children = second;
        } else {
          attributes = second;
        }
      } else if (tree.length > 3) {
        const [first, second, ...third] = tree;
        type = first;
        if (Array.isArray(second) || second instanceof Node || typeof second === 'string') {
          children = [second, ...third];
        } else {
          attributes = second;
          children = third;
        }
      }

      // Create element
      const namespace = type === 'svg' ? 'http://www.w3.org/2000/svg' : ns;
      const element = namespace ? document.createElementNS(namespace, type) : document.createElement(type);

      // Set element attributes
      if (attributes) {
        Object.entries(attributes).map(([key, value]) => {
          if (typeof key === 'string') {
            if (key === 'ref' && typeof value === 'function') {
                value(element);
            } else if (key.startsWith('on') && typeof value === 'function') {
              element.addEventListener(key.slice(2), value);
            } else if (key === 'style' && typeof value === 'object') {
              const str = Object.entries(value).map(([k, v]) => `${k}:${v}`).join(';');
              element.setAttribute(key, str);
            } else {
              element.setAttribute(key, value);
            }
          }
        });
      }

      // Append children if any
      if (children) {
        const nodes = children instanceof Node ? children : render(children, namespace);
        if (Array.isArray(nodes)) {
          element.append(...nodes);
        } else if (typeof nodes === 'object' || typeof nodes === 'string') {
          element.append(nodes);
        }
      }
      return element;
    } else {
      return tree.map((el) => render(el, ns));
    }
  }
}