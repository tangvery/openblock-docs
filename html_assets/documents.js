/**
 * @license
 * Copyright 2022 Du Tian Wei
 * SPDX-License-Identifier: Apache-2.0
 */
 (function () {
    window.markdownDocument = {
        headings: [],
        mates: ""
    };

    let apiBasePath = '../openblock/frontpage/block-docs/';
    if (window.location.host === 'openblock.gitee.io') {
        apiBasePath = window.location.protocol + '//openblock.gitee.io/frontpage/block-docs/';
    }
    let T404;
    function loadText(url, callback) {
        $.ajax({
            type: 'GET',
            url: url,
            dataType: 'text',
            success: function (data) {
                callback(null, data)
            },
            error: function (e) {
                callback(e, null)
            }
        });
    }
    loadText('404.html', (e, data) => {
        T404 = data;
    });
    function rendererHTML(basepath, data, addToIndex) {

        var reader = new commonmark.Parser({ smart: true });
        var writer = new commonmark.HtmlRenderer({ safe1: true });

        // +++ copy from commonmark.js 
        var reUnsafeProtocol = /^javascript:|vbscript:|file:|data:/i;
        var reSafeDataProtocol = /^data:image\/(?:png|gif|jpeg|webp)/i;

        var potentiallyUnsafe = function (url) {
            return reUnsafeProtocol.test(url) && !reSafeDataProtocol.test(url);
        };
        // ---

        //++ 为了修改渲染结果，对 writer进行 hack
        writer.image = (function (node, entering) {
            if (entering) {
                if (this.disableTags === 0) {
                    if (this.options.safe && potentiallyUnsafe(node.destination)) {
                        this.lit('<img src="" alt="');
                    } else {
                        // 修改图片加载路径
                        if (!(node.destination.startsWith('/') || node.destination.startsWith('http:') || node.destination.startsWith('https:'))) {
                            let newDest = basepath + (node.destination.startsWith('./') ? node.destination.substring(1) : node.destination);
                            node.destination = newDest;
                        }
                        this.lit('<img src="' + this.esc(node.destination) + '" alt="');
                    }
                }
                this.disableTags += 1;
            } else {
                this.disableTags -= 1;
                if (this.disableTags === 0) {
                    if (node.title) {
                        this.lit('" title="' + this.esc(node.title));
                    }
                    this.lit('" />');
                }
            }
        }).bind(writer);
        writer.link = (function (node, entering) {
            var attrs = this.attrs(node);
            if (entering) {
                if (!(this.options.safe && potentiallyUnsafe(node.destination))) {
                    // 修改api文档路径
                    if (node.destination.startsWith('apiBasePath/')) {
                        node.destination = '#' + apiBasePath + node.destination.substring('apiBasePath/'.length);
                    } else if (node.destination.startsWith('./')) {
                        node.destination = basepath + node.destination.substring(2);
                    }
                    if (node.destination.endsWith('.md')) {
                        // 将 md 文件处理为加载内容，而不是跳转
                        attrs.push(['onclick', "loadDoc('" + node.destination + "');"]);
                        node.destination = "";
                    } else {
                        // 将其他目标类型的链接在新窗口中打开
                        attrs.push(['target', '_blank']);
                        attrs.push(["href", this.esc(node.destination)]);
                    }
                }
                if (node.title) {
                    attrs.push(["title", this.esc(node.title)]);
                }
                this.tag("a", attrs);
            } else {
                this.tag("/a");
            }
        }).bind(writer);
        if (addToIndex) {
            writer.heading = (function (node, entering) {
                var tagname = "h" + node.level,
                    attrs = this.attrs(node);
                if (entering) {
                    this.cr();
                    let id = 'heading-' + node._firstChild.literal;
                    markdownDocument.headings.push({ id, title: node._firstChild.literal, level: node.level });
                    attrs.push(['id', id]);
                    this.tag(tagname, attrs);
                } else {
                    this.tag("/" + tagname);
                    this.cr();
                }
            }).bind(writer);
        }
        //---

        var parsed = reader.parse(data); // parsed is a 'Node' tree

        // var walker = parsed.walker();
        // var event;

        // while ((event = walker.next())) {
        //     if (event.entering) {
        //         console.log(event.node.type);
        //     }
        // }
        var result = writer.render(parsed);
        return result;
    }
    function reloadDoc() {
        let docpath = window.location.hash;
        if (docpath.length > 1) {
            docpath = docpath.substring(1);
        } else {
            docpath = 'manual/1_start.md';
        }
        let basepath = docpath.substring(0, docpath.lastIndexOf('/') + 1);
        if (!docpath.endsWith('/index.md')) {
            loadText(basepath + 'index.md', (err, data) => {
                if (data) {
                    let result = rendererHTML(basepath, data, false);
                    window.markdownDocument.mates = result;
                } else {
                    window.markdownDocument.mates = "";
                }
            });
        } else {
            window.markdownDocument.mates = "";
        }
        loadText(docpath, (err, data) => {
            let content = document.getElementById("doc-content");
            window.markdownDocument.headings.splice(0);
            if (err || !data) {
                content.innerHTML = T404;
                return;
            }
            let result = rendererHTML(basepath, data, true);
            content.innerHTML = result;
        });
    }

    function rollTo(target) {
        let d = document.getElementById(target);
        d.scrollIntoView();
    }

    reloadDoc();
    function loadDoc(path) {
        window.location.hash = path;
        reloadDoc();
    }

    function clearMarkdownDocument() {
        window.markdownDocument.headings.splice(0);
        window.markdownDocument.mates = "";
    }
    clearMarkdownDocument();

    window.reloadDoc = reloadDoc;
    window.loadDoc = loadDoc;
    window.rollTo = rollTo;
    window.onhashchange = reloadDoc;
})();