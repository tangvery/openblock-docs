/**
 * @license
 * Copyright 2022 Du Tian Wei
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * manual/fullindex.md 生成脚本
 */
const fs = require('fs');
const path = require('path');
function getTitle(filepath) {
    return path.basename(filepath);
}
function travel(dir, callback) {
    fs.readdirSync(dir).forEach((file) => {
        var pathname = path.join(dir, file)
        if (fs.statSync(pathname).isDirectory()) {
            callback(dir, pathname, 'directory')
            travel(pathname, callback)
        } else {
            callback(dir, pathname, 'file')
        }
    })
}

let pages = {};
let struct = [];
let stack = [];
function scan(rootpath, prefix) {
    travel(rootpath, function (dir, pathname, type) {
        let d = { sub: [] };
        if (type === 'directory') {
            if (stack.length > 0) {
                let cur = stack[stack.length - 1];
                cur.sub.push(d);
            } else {
                struct.push(d);
            }
            stack.push(d)
        } else if (pathname.endsWith('/index.md')) {
            let g = {};
            g.prefix = prefix;
            if (!dir) {
                console.log('no dir', pathname)
            }
            g.dir = dir;
            let dirname = path.basename(dir);
            let spIndex = dirname.indexOf('_');
            let str_order = dirname.substring(0, spIndex);
            let order = parseInt(str_order);
            if (Number.isNaN(order)) {
                order = -1;
            }
            let relPath = prefix + pathname.substring(rootpath.length)
            g.relPath = relPath;
            let name = dirname.substring(spIndex + 1);
            g.name = name;
            g.order = order;
            g.index = pathname;
            g.dirname = dirname;
            pages[dir] = g;
        }
    });
}
scan('manual/', 'manual/');
scan('../openblock/frontpage/block-docs/', 'apiBasePath/');
let folder = Object.keys(pages);
console.log(folder);
folder.sort((a, b) => {
    a = pages[a];
    b = pages[b];
    // console.log('a', a.dir)
    // console.log('b', b.dir)
    if (path.dirname(a.dir) === path.dirname(b.dir)) {
        let s = a.order - b.order;
        // console.log('s', s)
        return s;
    } else {
        let s1 = a.dir.localeCompare(b.dir);
        // console.log('s1', s1)
        return s1;
    }
});
console.log(folder);

let content = []
folder.forEach(f => {
    let g = pages[f];
    console.log(g);
    let deep = g.relPath.split('/').length;
    content.push(('&ensp;&ensp;').repeat(deep) + `[${g.dirname}](${g.relPath})`);
});
let str = content.join('\n\n');
console.log(str);
fs.writeFileSync('fullindex.md', str);
