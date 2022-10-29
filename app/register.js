
function Input(name, type='text', err ='invalid value') {
	let view = {
		tag: 'fieldset',
		data: {err},
		children: [
			{ tag: 'label', text: name, attributes: { for: `id_${name}` } },
			{
				tag: 'input',
				id: name,
				attributes: { placeholder: name, type, },
				listeners: {
					change : e => {
						view.value = e.target.value;
					}
				}
			}
		]
	};
	if(type === 'password') {
		view.children.push({
			tag: 'button',
			text:'show',
			listeners: {
				click: e=> {
					e.preventDefault();
					e.target.textContent = e.target.textContent === 'show'? 'hide': 'show' 
					view.children[1].elem.type = view.children[1].elem.type === 'text'? 'password': 'text';
				}
			}
		})
	}
	return view;
}


export default function Register() {
	let inpName = Input('name');
	let inpEmail = Input('email', 'email', 'worng email');
	let inpPassword = Input('password', 'password');
	let inpSubmit = Input('', 'submit');
	let view = {
		tag: 'div',
		children: [
			{ tag: 'h1', text: 'Register' },
			{
				tag: 'form',
				children: [
					inpName,
					inpEmail,
					inpPassword,
					inpSubmit,
					{
						tag: 'button', text: 'delete last entry', listeners:{ click: e=>{e.preventDefault(); view.pop()}}
					}
				],
				listeners: {
					submit: e => {
						e.preventDefault();
						let data = {
							name : inpName.value,
							email : inpEmail.value,
							password : inpPassword.value,
						}
						if(data.name && data.email && data.password)
						{
							let dataview = {tag: 'div', text: `name: ${data.name}, email: ${data.email}`};
							view.push(dataview);
						}
					}
				}
			}
		]
	};
	return view;
}

