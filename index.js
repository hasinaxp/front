import Front, { DataEntry } from './front.js';
import { DIV, MAIN } from './frontElements.js'
import styleSheets from './style.css'  assert { type: 'css' };

import Webcam from './webcam.js';

const app = {
    tag: 'div',
    classes: 'app',
    styleSheets: [styleSheets],
    children: [
        MAIN(['content'],
            Webcam(),
        )
    ]

};

let front = new Front();
front.render(app);