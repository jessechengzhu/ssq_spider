const {Crawl} = require('./Crawl')
const cheerio = require('cheerio'),
    fs = require('fs'),
    path = require('path')

let page = 1
let flag = true
const filename = path.resolve(__dirname, '..', 'data.txt')

function writeFile(filename, data) {
    fs.writeFile(filename, data, {flag: "a+"}, function (err) {
        if (err) throw err;
    })
}

function getData(html) {
    try {
        const $ = cheerio.load(html)
        const tr = $('tr')
        if (tr.find('td').length===0) {  // 爬取结束
            flag = false
            return
        }
        tr.each(function (i) {
            if (i > 1) {  // 从第二行开始才是有效数据
                const td = $(this).find('td')
                const date = td.eq(0).text() // 日期
                const id = td.eq(1).text()  // 期号
                if (!id) return // 末行，退出循环
                let str = date + ' ' + id + ' ' // 用于写入文件的每期字符串
                const td2 = td.eq(2)  // 本期所有号码的td
                const em = td2.find('em')
                em.each(function (j) {
                    str = str + em.eq(j).text() + ' '
                })
                str += '\n'  // 加个换行
                writeFile(filename, str)
            }
        })
    } catch (e) {
        console.log(e)
        flag = false
    }
}

const crawl = new Crawl()

let t = setInterval(function () {
    if (flag) {
        console.log('开始爬取第' + page + '页');
        crawl.getHTML( `http://kaijiang.zhcw.com/zhcw/html/ssq/list_${page}.html`, getData)
        page ++
    } else {
        console.log('爬取结束');
        clearInterval(t)
    }
}, 500)
