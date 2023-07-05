
/*
default ui structure

ui = {
    tag: 'div',
    id: 0,
    text: 'text content',
    style: {
        color: 'red',
    }

}

basic options: of ui:

tag: string
id: number/string
text / textContent : string
style: object // css styles {key: value}
classes: string/array // class names
listeners: object // {event: function}
innerHTML: string // html code
styleSheets: array // [cssStyleSheet]
data: object // {key: value}
animations: object //   {name: {frames: [], opts: {}}}


derived options added to ui by front:
animationTable: object // {name: Animation}
elem: HTMLElement
parent: ui
children: array // [ui]
killMe: boolean

optional mods for children of ui:
    type : router/ lazy / page 
    router children special options:
        pattern : string/ regularexp to match url pathname
        autiontication: bool/ bool function - should be authenticated to access this page

    lazy children special options:
        batch : number // number of children to render at once
        offset: number // number of children to skip
        next: function // function to call when next batch is needed to rendered

    page(pagination) children special options:
        batch : number // number of children to render at once
        page : number // page number
        next : function // function to call when next page is needed to rendered
        prev : function // function to call when prev page is needed to rendered
        paginate(i): function // function to call when ith page is needed to rendered
    
    

special listeners:
    init: function // called when ui is created
    create: function // called when ui is created , after init
    beforeUpdate: function // called before ui is updated
    afterUpdate: function // called after ui is updated
    beforeRender: function // called before ui is rendered
    afterRender: function // called after ui is rendered
    intersection: function // called when ui is intersected with viewport
    mutation: function // called when ui is mutated
    resize: function // called when ui is resized


special ui component:
    Link(path, content, delay = 0, preJumpFunc = undefined)


cross component data access:
    DataEntry
        -write(key, value)
        -read(key)
        -save(key)
        -load(key)
        -listen(key, callback)
        -setCookie(key, value, expiry)
        -getCookie(key)
        -deleteCookie(key)




lifecycle methods of ui:
update: function
kill: function
push: function
pop: function
getElement: function
selectors: function


*/



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
		this.elements = {};
	}
	static routers = {};

	getType(ui) {
		if (Array.isArray(ui))
			return 'array';
		return typeof (ui);
	}
	createHTMLNode({ tag, id, attributes, attrs, classes, text, textContent, listeners, style, innerHTML, styleSheets, data }) {
		const elem = document.createElement(tag);
		if (id) {
			elem.setAttribute('id', `id_${id}`);
			this.elements[id] = elem;
		}
		if (attributes)
			for (let key in attributes)
				elem.setAttribute(key, attributes[key]);
		if (attrs)
			for (let key in attrs)
				elem.setAttribute(key, attrs[key]);
		if (data) {
			for (let key in data)
				elem.dataset[key] = data[key];
		}
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
		ui.push = (newui) => {
			newui.parent = ui;
			this._renderUpdate(ui, () => {
				let newElem = this.renderBranch(newui);
				ui.elem.appendChild(newElem);
			})
		}
		ui.pop = () => {
			this._renderUpdate(ui, () => {
				if (ui.elem.lastChild)
					ui.elem.removeChild(ui.elem.lastChild);
			})
		}
		ui.getElement = (id) => this.elements[id];
		ui.selectors = (query) => {
			return Object.values(this.elements).filter(el => el.matches(query));

		}


		if (ui.tag) {
			ui.elem = this.createHTMLNode(ui);
			if (ui.listeners && ui.listeners['create'])
				ui.listeners['create'](ui);

			if (ui.animations) {
				ui.animationTable = {};
				for (let key in ui.animations) {
					const { frames, opts } = ui.animations[key];
					let animationOptions = { duration: 1000, ...opts };
					const effect = new KeyframeEffect(ui.elem, frames, animationOptions);
					ui.animationTable[key] = new Animation(effect, document.timeline);
				}
			}
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

	setObervers(ui, elem) {
		if (Array.isArray(ui.observe)) {

			if (ui.observe.includes('intersection')) {

				let callback = (entries) => {
					entries.forEach((entry) => {
						if (ui.listeners && ui.listeners['intersection'])
							ui.listeners['intersection'](entry);
					});
				};
				let intersectionObserver = new IntersectionObserver(callback, {
					threshold: ui.threshold ?? 0,
					root: ui.intersctionRoot ? ui.elem : null,
					rootMargin: ui.rootMargin ?? '0px'
				});
				ui.intersectionObserver = intersectionObserver;
				let rt = elem.shadowRoot ? elem.shadowRoot : elem;
				for (let c of rt.children) {
					ui.intersectionObserver.observe(c);
				}
			}
			if (ui.observe.includes('mutation')) {
				let mutaionObserver = new MutationObserver((entries) => {
					if (ui.listeners && ui.listeners['mutation'])
						ui.listeners['mutation'](entries);
				});

				ui.mutaionObserver = mutaionObserver;
				ui.mutationOptions = ui.mutationOptions ?? { subtree: true, childList: true, attributes: true };
				ui.mutaionObserver.observe(elem.shadowRoot ?? elem, {
					...ui.mutationOptions
				});
			}
			if (ui.observe.includes('resize')) {
				let resizeObserver = new ResizeObserver((entries) => {
					if (ui.listeners && ui.listeners['resize'])
						ui.listeners['resize'](entries[0]);
				});

				ui.resizeObserver = resizeObserver;
				ui.resizeObserver.observe(elem);
			}

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
	_renderUpdate(ui, rendercall) {
		this.afterRenderCalls = [];

		rendercall();

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
			ui.listeners['beforeRender'](ui);
		else
			elem = this.format(ui);

		if (ui.children) {
			let ucl = ui.children;
			if (typeof ucl === 'function')
				ucl = ucl();
			let children = [];
			if (ui.type && ui.type === 'router') {
				Front.routers[ui.id] = ui;
				window.onpopstate = (e) => {
					//console.log(e.state);
					for (let id in Front.routers) {
						let router = Front.routers[id];
						if (router.routerMode && router.routerMode == 'push')
							router.pop();
						else
							router.update();
					}

				}
				let pathname = window.location.pathname;
				children = ucl.filter(c => {
					return c.pattern && pathname.match(c.pattern) && (!(c.authentication) || c.authentication());
				});
				if (children.length) {
					children = ui.routeAll ? children : [children[0]];
				}
			}
			else if (ui.type && ui.type === 'lazy') {
				ui.batch = ui.batch ?? 4;
				ui.offset = ui.offset ?? ui.batch;
				children = ui.children.slice(0, ui.offset);
				ui.next = () => {
					let i = ui.offset;
					while (i < ui.batch + ui.offset && i < ui.children.length) {
						let elemChild = this.renderBranch(ui.children[i++]);
						if (ui.elem.shadowRoot)
							ui.elem.shadowRoot.appendChild(elemChild);
						else
							ui.elem.appendChild(elemChild);
						if (ui.intersectionObserver)
							ui.intersectionObserver.observe(elemChild);
					}
					ui.offset = i;
				}
			}
			else if (ui.type && ui.type === 'page') {
				ui.batch = ui.batch ?? 4;
				ui.page = ui.page ?? 0;
				ui.offset = (ui.page + 1) * ui.batch;
				children = ui.children.slice(ui.offset - ui.batch, ui.offset);
				ui.paginate = (i) => {
					ui.elem.innerHTML = '';
					ui.page = i;
					ui.offset = (ui.page + 1) * ui.batch;
					let cdrn = ui.children.slice(ui.offset - ui.batch, ui.offset);
					for (let c of cdrn)
						ui.elem.appendChild(this.renderBranch(c));
				}
				ui.next = () => {
					ui.paginate(ui.page + 1);
				}
				ui.prev = () => {
					if (ui.page > 0)
						ui.paginate(ui.page - 1);
				}
			}
			else
				children = ucl;


			children = children.map(c => {
				if (c.listeners && c.listeners['afterRender'])
					this.afterRenderCalls.push({ fn: c.listeners['afterRender'], c });
				c.parent = ui;
				return this.renderBranch(c)
			});


			if (elem.shadowRoot)
				for (let c of children)
					elem.shadowRoot.appendChild(c);
			else
				for (let c of children)
					elem.appendChild(c);

		}

		this.setObervers(ui, elem);


		return elem;

	}
}

export function ChangeRoute(path, delay = 0, preJumpFunc = undefined) {
	if (preJumpFunc)
		preJumpFunc()
	let oldPath = window.location.pathname;
	window.history.pushState({ path, oldPath }, path, window.location.origin + path);
	for (let id in Front.routers) {
		let router = Front.routers[id];
		setTimeout(() => {
			if (router.routerMode && router.routerMode == 'push') {
				let pathname = window.location.pathname;
				let children = router.children.filter(c => {
					return c.pattern && pathname.match(c.pattern) && (!(c.authentication) || c.authentication());
				});
				if (path !== oldPath)
					router.push(children[0]);
			}
			else
				router.update();
		}, delay);
	}
}

export function Link(path, content, delay = 0, preJumpFunc = undefined) {
	let link = {
		tag: 'a',
		style: {
			cursor: 'pointer'
		},
		listeners: {
			click: e => {
				ChangeRoute(path,delay,preJumpFunc);
			}
		}
	}
	if (typeof content === 'object') {
		link = { ...link, ...content };
	}
	else if (typeof content === 'string')
		link.text = content;
	return link;
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


	// set a cookie
	setCookie(cname, cvalue, exdays) {
		var d = new Date();
		d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
		var expires = "expires=" + d.toGMTString();
		document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
	}
	// get a cookie
	getCookie(cname) {
		var name = cname + "=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	}

	deleteCookie(name) {
		document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	}

}
export const DataEntry = Object.freeze(new DataEntryClass());

export function CSSImport(file) {
	return new Promise(resolve => {
		fetch(file)
			.then(data => data.text())
			.then(text => {
				let stylesheet = new CSSStyleSheet();
				stylesheet.replaceSync(text);
				resolve(stylesheet);
			});
	});
}