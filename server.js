const http = require('http');
const fs = require('fs');
var path = require('path')
const port = 5000;

const mimeLookup = {
    '.css' : 'text/css',
    '.js' : 'text/javascript',
    '.html' : 'text/html',
    '.json' : 'application/json',
    '.jpg' : 'image/jpeg',
    '.png' : 'image/png',
};

const server = http.createServer((req, res) => {
    const fpath = `${__dirname}/${req.url}`;
    if(fs.existsSync(fpath))
    {
        let file;
        if(req.url === '/')
            file = fs.readFileSync(`${__dirname}/index.html`);
        else {
            file = fs.readFileSync(fpath);
            let ext = path.extname(fpath);
            res.setHeader("Content-Type", mimeLookup[ext]);
        }
        res.write(file);
        res.end();
    }
    else {
        let file = fs.readFileSync(`${__dirname}/index.html`);
        res.write(file);
        res.end();
    }
});

server.listen(port, console.log(`listening at port ${port}`));

