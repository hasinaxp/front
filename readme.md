# sp-front
## front
A fast javascript object based front-end framework with zero dependency


##example
in your index.html or any html file add a module type script file (for example main.js)
you can specify element while initializing front or it will use body as default element

main.js
```javascript
import Front from 'front.js'

let front = new Front(); 


let app = {
    tag: 'div',
    children: [
        {
            tag: 'h2',
            text: 'hello world',
            style: {
                color: 'tomato',
            }
        },
        {
            tag: 'p',
            innerHTML: 'Welcome to <em>Front<em>.'
        }
    ]
};

front.render(app);


```



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


