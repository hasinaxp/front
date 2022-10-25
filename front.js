export default class Front {
	/**
	 * @param {HTMLElement} elem root element where front works
	 */
	constructor(elem) {
		this.root = elem ?? document.body;
		this.currentElement = null;
		this.nodes = [];
		this.idgen = 0;
		this.afterRenderCalls = [];
	}

	getType(ui) {
		if (Array.isArray(ui))
			return 'array';
		return typeof (ui);
	}
	createHTMLNode({ tag, id, attributes, attrs, classes, text, textContent, listeners, style, innerHTML, styleSheets }) {
		const elem = document.createElement(tag);
		if (id)
			elem.setAttribute('id', `id_${id}`);
		if (attributes)
			for (let key in attributes)
				elem.setAttribute(key, attributes[key]);
		if (attrs)
			for (let key in attrs)
				elem.setAttribute(key, attrs[key]);
		if (classes)
			if (this.getType(classes) === 'string') elem.classList.add(classes);
			else if (this.getType(classes) === 'array') for (let c of classes) elem.classList.add(c);
		if (style)
			for (let k in style)
				elem.style[k] = style[k];
		if (listeners) {
			for (let ev in listeners) {
				elem.addEventListener(ev, listeners[ev]);
			}
		}
		const stylesheetSupportedTags = ['div', 'header', 'footer', 'nav', 'main', 'aside', 'artical', 'section', 'p', 'span', 'h1', 'h2', 'h3', 'h4'];
		if (styleSheets && (stylesheetSupportedTags.includes(tag))) {
			let sroot = elem.attachShadow({ mode: 'open' });
			sroot.adoptedStyleSheets = styleSheets;
		}

		elem.textContent = text ? text : textContent ? textContent : '';
		if (innerHTML) {
			elem.innerHTML = innerHTML
		}

		return elem;
	}
	format(ui) {
		if (['string', 'number', 'boolean'].includes(this.getType(ui)))
			return this.createHTMLNode({ tag: 'span', text: String(ui) });

		if (!ui.id) {
			ui.id = this.idgen++;
			if (ui.listeners && ui.listeners['init'])
				ui.listeners['init'](ui);
		}
		else if (Number.isNaN(ui.id)) {
			if (ui.listeners && ui.listeners['init'])
				ui.listeners['init'](ui);
		}

		ui.update = () => {
			this.update(ui);
		}
		ui.kill = () => {
			ui.elem.remove();
			ui.killMe = true;

		}

		if (ui.tag) {
			ui.elem = this.createHTMLNode(ui);
			if (ui.listeners && ui.listeners['create'])
				ui.listeners['create'](ui);
		}
		return ui.elem;
	}

	/**
	 * render ui as the innercontent of root
	 */
	render(ui) {
		this.afterRenderCalls = [];

		let elem = this.renderBranch(ui);
		if (this.currentElement)
			this.root.replaceChild(this.currentElement, elem);
		else
			this.root.appendChild(elem);
		this.currentElement = elem;

		if (ui.listeners && ui.listeners['afterRender'])
			ui.listeners['afterRender'](ui);

		for (let ent of this.afterRenderCalls) {
			ent.fn(ent.c);
		}
	}

	update(ui) {
		this.afterRenderCalls = [];

		if (!ui.elem) return;
		if (ui.listeners && ui.listeners['beforeUpdate'])
			ui.listeners['beforeUpdate'](ui.elem, ui);
		let oldElem = ui.elem;

		let elem = this.renderBranch(ui);
		oldElem.replaceWith(elem);
		if (ui.listeners && ui.listeners['afterUpdate'])
			ui.listeners['afterUpdate'](ui.elem, ui);

		if (ui.listeners && ui.listeners['afterRender'])
			ui.listeners['afterRender'](ui);

		for (let ent of this.afterRenderCalls) {
			ent.fn(ent.ui);
		}

	}

	renderBranch(ui) {
		if (this.getType(ui) === 'function')
			ui = ui();
		let elem;
		if (ui.listeners && ui.listeners['beforeRender'])
			elem = ui.listeners['beforeRender'](ui);
		else
			elem = this.format(ui);

		if (ui.children) {
			let ucl = ui.children;
			if (typeof ucl === 'function')
				ucl = ucl();
			let children = [];
			if (ui.type && ui.type === 'router') {
				let pathname = window.location.pathname;
				children = ucl.filter(c => {
					return c.pattern && pathname.match(c.pattern) && (!(c.authentication) || c.authentication());
				});
				if (children.length)
					children = [children[0]];
			}
			else
				children = ucl;

			children = children.map(c => {
				if (c.listeners && c.listeners['afterRender'])
					this.afterRenderCalls.push({ fn: c.listeners['afterRender'], c });
				return this.renderBranch(c)
			});

			if (elem.shadowRoot)
				for (let c of children)
					elem.shadowRoot.appendChild(c);
			else
				for (let c of children)
					elem.appendChild(c);

		}


		return elem;

	}
}




class DataEntryClass {

	constructor() {
		this.data = {};
		this.listeners = {};
	}
	write(slotname, data) {
		this.data[slotname] = data;
		if (Object.keys(this.listeners).includes(slotname))
			for (let listener of this.listeners[slotname])
				listener(data);
	}
	read(slotname) {
		return this.data[slotname];
	}
	save(slotname) {
		localStorage.setItem(slotname, JSON.stringify(this.data[slotname]));
		return this.data[slotname];
	}
	load(slotname) {
		this.data[slotname] = localStorage.getItem(slotname);
		return this.data[slotname];
	}

	//read when the data is saved
	listen(slotname, listener) {
		if (!Object.keys(this.listeners).includes(slotname)) {
			this.listeners[slotname] = [listener];
		}
		else {
			this.listeners[slotname].push(listener);
		}
	}

}
export const DataEntry = Object.freeze(new DataEntryClass());