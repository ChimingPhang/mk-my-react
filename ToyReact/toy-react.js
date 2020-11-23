export class Component {
    constructor() {
        this.props = Object.create(null);
        this.children = [];
        this._root = null;
    }

    setAttribute(name, val) {
        this.props[name] = val;
    }

    appendChild(component) {
        this.children.push(component);
    }

    get root() {
        if (!this._root) {
            this._root = this.render().root;
        }

        return this._root;
    }
}

class ElementWrapper {
    constructor(type) {
        this.root = document.createElement(type);
    }

    setAttribute(name, val) {
        this.root.setAttribute(name, val);
    }

    appendChild(component) {
        this.root.appendChild(component.root);
    }
}

class TextWrapper {
    constructor(content) {
        this.root = document.createTextNode(content);
    }
}

export function render(component, selector) {
    selector.appendChild(component.root);
}
 
export function createElement(type, attributes, ...children) {
    let e;
    if (typeof type === 'string') {
        e = new ElementWrapper(type);
    } else {
        e = new type;
    }
    
    for (let p in attributes) {
        e.setAttribute(p, attributes[p]);
    }
    const insertChildren = (children) => {
        for (let child of children) {
            if (typeof child === 'string') {
                child = new TextWrapper(child);
            }
    
            if (typeof child === 'object' && child instanceof Array) {
                insertChildren(child);
            } else {
                e.appendChild(child);
            }
            
        }
    };
    
    insertChildren(children);
    return e;
}