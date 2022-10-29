import Front from '../front.js'
import { CSSImport, Link } from '../front.js';
import Webcam from '../webcam.js'
import Register from './register.js'

import texts from '../fakeContents.js';

let c1 = {
	tag: 'div',
	text: 'component home',
	pattern: '/'
}
let c2 = {
	tag: 'div',
	text: 'component contact',
	pattern: 'contact'
}
let c3 = {
	tag: 'div',
	text: 'component about',
	pattern: 'about'
}
let app =  {
	tag:  'div',
	classes: ['app', 'app-container'],
	children: [
		{tag: 'div', children: [Link('/', 'home'),Link('/contact', 'contact'),Link('/about', 'about')]},
		{
			tag: 'div',
			type: 'router',
			children: [ c2, c3, c1]
		}

	]
};

const front =  new Front();
front.render(app);
app.update();
console.log(app);

let elem = document.createElement('div');
elem.classList.add('circle');
document.body.appendChild(elem);

elem.addEventListener('click',() => {

	let anim = document.querySelector('.circle').animate([
		{top: '0px', left: '0px'},
		{top: '400px', left: '400px'},
	],{
		duration: 1000,
		iterations: Infinity
	})
	console.log(anim);
})