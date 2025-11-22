const convert = require('xml-js');
const fs = require('fs');
const db = require('../models');
const Post = db.Post;
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

function isNumeric(value) {
    return /^-{0,1}\d+$/.test(value);
}

async function convert_pages() {
    try {
        const content = fs.readFileSync('./amsa-wp/Pages.xml', 'utf8');
        const js = JSON.parse(convert.xml2json(content, {compact: false, spaces: 4}));
        const elements = js.elements;

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const type = element.type;
            if (type === 'element') {
                const elements_elements = element.elements;
                for (let j = 0; j < elements_elements.length; j++) {
                    const element_elements = elements_elements[j].elements;
                    for (let e of element_elements) {
                        if (e.name === 'item') {
                            // console.log(e);
                            const title = e.elements.filter(x => x.name === 'title')[0].elements[0].text;
                            let date = e.elements.filter(x => x.name === 'pubDate')[0].elements[0].text;
                            const author = e.elements.filter(x => x.name === 'dc:creator')[0].elements[0].cdata;
                            const status = e.elements.filter(x => x.name === 'wp:status')[0].elements[0].cdata;
                            let content = e.elements.filter(x => x.name === 'content:encoded')[0].elements;
                            const link = e.elements.filter(x => x.name === 'link')[0].elements[0].text;
                            if (content && status === 'publish') {
                                content = content[0].cdata;
                                console.log('Page---------');
                                console.log(title);
                                console.log(author);
                                console.log(status);
                                console.log(content);
                                console.log(link);
                                date = new Date(date);
                                console.log(date);
                                const page = {
                                    title,
                                    content,
                                    author,
                                    link,
                                    date
                                };
                                fs.appendFileSync('./amsa-wp/posts.txt', JSON.stringify(page) + '\n');
                            }
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.log(e);
    }
}

async function convert_posts() {
    try {
        const content = fs.readFileSync('./amsa-wp/Posts.xml', 'utf8');
        const js = JSON.parse(convert.xml2json(content, {compact: false, spaces: 4}));
        const elements = js.elements;

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const type = element.type;
            if (type === 'element') {
                const elements_elements = element.elements;
                for (let j = 0; j < elements_elements.length; j++) {
                    const element_elements = elements_elements[j].elements;
                    for (let e of element_elements) {
                        if (e.name === 'item') {
                            // console.log(e);
                            const title = e.elements.filter(x => x.name === 'title')[0].elements[0].text;
                            let date = e.elements.filter(x => x.name === 'pubDate')[0].elements[0].text;
                            const author = e.elements.filter(x => x.name === 'dc:creator')[0].elements[0].cdata;
                            const status = e.elements.filter(x => x.name === 'wp:status')[0].elements[0].cdata;
                            let content = e.elements.filter(x => x.name === 'content:encoded')[0].elements;
                            const link = e.elements.filter(x => x.name === 'link')[0].elements[0].text;
                            const post_id = e.elements.filter(x => x.name === 'wp:post_id')[0].elements[0].text;
                            if (content && status === 'publish') {
                                content = content[0].cdata;
                                console.log('Page---------');
                                console.log(title);
                                console.log(author);
                                console.log(status);
                                console.log(content);
                                console.log(link);
                                date = new Date(date);
                                console.log(date);
                                console.log(post_id);
                                const page = {
                                    title,
                                    content,
                                    author,
                                    link,
                                    date,
                                    post_id
                                };
                                fs.appendFileSync('./amsa-wp/posts.txt', JSON.stringify(page) + '\n');
                            }
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.log(e);
    }
}

async function insert_posts() {
    try {

        const posts = fs.readFileSync('./amsa-wp/posts.txt', 'utf8').trim().split('\n').map(x => JSON.parse(x));

        for (const post of posts) {

            const new_post = {
                title: post.title,
                picUrl: 'pictures\\post\\1551405825631-AMSA_logo_256.png',
                subTitle: '',
                content: post.content,
                type: 'article',
                category: 'news',
                createdAt: post.date,
                updatedAt: post.date,
                UserId: 1
            };
            await Post.create(new_post);
        }
    } catch (e) {
        console.log(e);
    }
}


async function change_pic_urls() {
    try {
        const posts = await Post.findAll();

        for (let i = 0; i < posts.length; i++) {
            const dom = (new JSDOM(posts[i].content));
            const document = dom.window.document;
            const links = document.querySelectorAll('a');
            const images = document.querySelectorAll('img');
            for (let j = 0; j < links.length; j++) {
                const href = links[j].getAttribute('href');
                if (href && (href.endsWith('png') || href.endsWith('jpg'))) {
                    console.log(href);
                    const lines = href.split('/');
                    // const src = 'https://backend.amsa.mn/pictures/archive/' + ;



                    const src = 'https://backend.amsa.mn/pictures/archive/' + decodeURI(lines[lines.length - 1]);
                    links[j].setAttribute('href', src);
                }
            }

            for (let j = 0; j < images.length; j++) {
                const src = images[j].getAttribute('src');
                if (src && (src.endsWith('png') || src.endsWith('jpg'))) {
                    console.log(src);
                    const lines = src.split('/');

                    let picUrl = decodeURI(lines[lines.length - 1]);

                    if (picUrl.includes('-')) {
                        const comps = picUrl.split('-');
                        const lastComp = comps[comps.length - 1];
                        const numberText = lastComp.substring(0, lastComp.length - 4);
                        const fileType = lastComp.substring(lastComp.length - 4);
                        console.log(numberText);
                        const first = numberText.split('x')[0];
                        const second = numberText.split('x')[1];
                        if (isNumeric(first) && isNumeric(second)) {
                            comps.pop();
                            picUrl = comps.join('-') + fileType;
                        }

                    }
                    const link = 'https://backend.amsa.mn/pictures/archive/' + picUrl;
                    console.log(link);
                    images[j].setAttribute('src', link);
                }
            }
            const content = dom.serialize();
            await posts[i].update({content});
        }


    } catch (e) {
        console.log(e);
    }
}



(async () => {
    // await convert_pages();
    // await convert_posts();
    // await insert_posts();

    await change_pic_urls();

    console.log('Finished');
})();
