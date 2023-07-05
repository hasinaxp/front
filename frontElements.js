export function TAG(tag, ...args) {
	let view = {
		tag
	}
	if (args.length === 0) return view;
	if (args.length === 1) {
		if (Array.isArray(args[0])) return { classes: args[0], ...view }
		else if (typeof args[0] === 'object') return { ...view, ...args[0] }
		else return { ...view, innerHTML: String(args[0]) }
	}
	else {
		if (Array.isArray(args[0])) {
			let classes = args.splice(0, 1);
			return { ...view, classes, children: args }

		}
		return { ...view, children: args }
	}
}

export function DIV(...args) {
	return TAG('div', ...args);
}

export function P(...args) {
	return TAG('p', ...args);
}

export function H1(...args) {
	return TAG('h1', ...args);
}
export function H2(...args) {
	return TAG('h2', ...args);
}
export function H3(...args) {
	return TAG('h3', ...args);
}
export function H4(...args) {
	return TAG('h4', ...args);
}
export function H5(...args) {
	return TAG('h5', ...args);
}
export function EM(...args) {
	return TAG('em', ...args);
}
export function STRONG(...args) {
	return TAG('strong', ...args);
}
export function I(...args) {
	return TAG('i', ...args);
}
export function BLOCKQUOTE(...args) {
	return TAG('blockquote', ...args);
}

export function SECTION(...args) {
	return TAG('section', ...args);
}

export function ARTICLE(...args) {
	return TAG('article', ...args);
}


export function ASIDE(...args) {
	return TAG('aside', ...args);
}

export function MAIN(...args) {
	return TAG('main', ...args);
}

export function HEADER(...args) {
	return TAG('header', ...args);
}
export function FOOTER(...args) {
	return TAG('footer', ...args);
}
export function NAV(...args) {
	return TAG('nav', ...args);
}


export function IMG(classes, src) {
	if (!classes) {
		return { tag: 'img' }
	}
	if (!src) {
		if (Array.isArray(classes)) return { tag: 'img', classes }
		else if (typeof classes === 'object') return { tag: 'img', ...classes }
		else return { tag: 'img', attributes: { src: classes } }
	}
	return {
		tag: 'img',
		attributes: { src },
		classes
	}
}


export function UL(...args) {
	let view = {
		tag: 'ui'
	}
	if (args.length === 0) return view;
	if (args.length === 1) {
		if (Array.isArray(args[0])) return { classes: args[0], ...view }
		else if (typeof args[0] === 'object') return { ...view, ...args[0] }
		else return { ...view, innerHTML: `<li>${String(args[0])}</li>` }
	}
	else {
		if (Array.isArray(args[0])) {
			let classes = args.splice(0, 1);
			return { ...view, classes, children: args.map(arg => { return { tag: 'li', children: [arg] }; }) };
		}
		return { ...view, children: args.map(arg => { return { tag: 'li', children: [arg] }; }) };
	}
}


export function OL(...args) {
	let view = {
		tag: 'ol'
	}
	if (args.length === 0) return view;
	if (args.length === 1) {
		if (Array.isArray(args[0])) return { classes: args[0], ...view }
		else if (typeof args[0] === 'object') return { ...view, ...args[0] }
		else return { ...view, innerHTML: `<li>${String(args[0])}</li>` }
	}
	else {
		if (Array.isArray(args[0])) {
			let classes = args.splice(0, 1);
			return { ...view, classes, children: args.map(arg => { return { tag: 'li', children: [arg] }; }) };
		}
		return { ...view, children: args.map(arg => { return { tag: 'li', children: [arg] }; }) };
	}
}

export function TABLE(args) {
	let otherArgs = arguments[1];
	if (Array.isArray(args) && Array.isArray(args[0])) {
		let view =  {
			tag: 'table',
			children: args.map(arg => {
				return {
					tag: 'tr',
					children: arg.map(v => {return {tag: 'td', children: [v] }; })
				}
			})
		}
		if(otherArgs && Array.isArray(otherArgs))
			view.classes = otherArgs;
		else if(otherArgs && typeof otherArgs === 'object')
			view = {...view, ...otherArgs}
		return view;
	}
	return {tag: 'table'}
}
