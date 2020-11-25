const RENDER_TO_DOM = Symbol('render to dom');
class ElementWrapper {
    constructor(type) {
        this.root = document.createElement(type);
    }

    setAttribute(name, val) {
        if (name.match(/^on([\s\S]+)$/)) {
            this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()), val);
        } else if (name === 'className') {
            this.root.setAttribute('class', val);
        } else {
            this.root.setAttribute(name, val);
        }   
    }

    appendChild(component) {
        let range = document.createRange();
        range.setStart(this.root, this.root.childNodes.length);
        range.setEnd(this.root, this.root.childNodes.length);
        component[RENDER_TO_DOM](range);
    }

    [RENDER_TO_DOM](range) { // 疑问
        range.deleteContents();
        range.insertNode(this.root);
    }
}

class TextWrapper {
    constructor(content) {
        this.root = document.createTextNode(content);
    }

    [RENDER_TO_DOM](range) { // 疑问
        range.deleteContents();
        range.insertNode(this.root);
    }
}

export class Component {
    constructor() {
        this.props = Object.create(null);
        this.children = [];
        this._root = null;
        this._range = null;
    }

    setAttribute(name, val) {
        this.props[name] = val;
    }

    appendChild(component) {
        this.children.push(component);
    }

    [RENDER_TO_DOM](range) { // 疑问
        this._range = range;
        this.render()[RENDER_TO_DOM](range);
    }

    setState(newState) {
        if (this.state === null || typeof this.state !== 'object') {
            this.state = newState;
            this.rerender();
            return;
        }

        const merge = (oldState, newState) => {
            for (let p in newState) {
                if (oldState[p] === null || typeof oldState[p] !== 'object') {
                    oldState[p] = newState[p];
                } else {
                    merge(oldState[p], newState[p]);
                }
            }
        };

        merge(this.state, newState);
        this.rerender();
    }

    rerender() {
        let oldRange = this._range;
        // 先插入
        let range = document.createRange();
        range.setStart(oldRange.startContainer, oldRange.startOffset);
        range.setEnd(oldRange.startContainer, oldRange.startOffset);
        this[RENDER_TO_DOM](range);
        // 后删除，防止dom消失了
        oldRange.setStart(range.endContainer, range.endOffset);
        oldRange.deleteContents();
    }
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

            if (child === null) {
                continue;
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

export function render(component, parentElement) {
    let range = document.createRange();
    range.setStart(parentElement, 0);
    range.setEnd(parentElement, parentElement.childNodes.length); // 要用childNodes ，因为有文本节点，标签节点
    range.deleteContents(); // 清空
    component[RENDER_TO_DOM](range); // 重新塞入内容
}