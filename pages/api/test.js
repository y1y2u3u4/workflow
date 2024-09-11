var puppeteer = require('puppeteer');

const fs = require('fs')
const path = require('path');

async function saveCookies(cookies) {
    const path = require('path');
    const cookiesPath = path.join(process.cwd(), 'cookies.json');
    fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
}


function checkIfLoggedIn() {
    try {
        if (fs.existsSync('cookies.json')) {
            const cookiesString = fs.readFileSync('cookies.json');
            const cookies = JSON.parse(cookiesString);
            // 可以添加更多的检查逻辑来确定cookies是否有效
            return cookies.length > 0;
        }
    } catch (err) {
        console.error(err);
    }
    return false;
}

async function manualLoginAndSaveSession(url) {

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: {
            width: 1300,
            height: 900
        },
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled'
        ]
    });
    // 新建页面
    var page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        delete navigator.__proto__.webdriver;
        window.navigator.chrome = {
            runtime: {},
        };
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) => (
            parameters.name === 'notifications' ?
                Promise.resolve({ state: Notification.permission }) :
                originalQuery(parameters)
        );
    });
    // 设定浏览器UserAgent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');
    // 跳转淘宝登录页
    await page.setDefaultNavigationTimeout(180000); // 设置超时时间为 60 秒
    // await page.goto('https://www.amap.com');
    await page.goto('https://www.dianping.com/');
    
    // 这一步十分重要，因为大部分大型网站都会对selenium机制进行检测，例如navigator.webdriver，navigator.languages等等。
    // 这一步就是把navigator的一些属性方法等等注入到浏览器中，绕过这些检测机制。
    await page.evaluate(async () => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false })
    })
    await new Promise(resolve => setTimeout(resolve, 30000));

    console.log('登录成功.');
    // 登录成功后，保存登录状态
    // 获取cookies
    const cookies = await page.cookies();

    // 保存cookies到文件
    await saveCookies(cookies);

    await browser.close(); // 关闭浏览器

    return cookies;
}


const action = (async () => {
    if (!checkIfLoggedIn()) {
        console.log('未登录，需要手动登录。');
        await manualLoginAndSaveSession('https://www.dianping.com/').then(cookies => {
            console.log('登录成功，会话已保存。');
        });
    } else {
        console.log('已登录，使用现有会话。');
    }

    // 定义浏览器无头模式、分辨率以及关闭沙盒模式等等。
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: {
            width: 1300,
            height: 900
        },
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled'
        ]
    });
    // 新建页面
    var page = await browser.newPage();
    // 从文件中读取 cookies
    const path = require('path');
    const cookiesPath = path.join(process.cwd(), 'cookies.json');
    const cookiesString = fs.readFileSync(cookiesPath, 'utf8');
    const cookies = JSON.parse(cookiesString);

    // 在页面中设置 cookies
    await page.setCookie(...cookies);
    await page.evaluateOnNewDocument(() => {
        delete navigator.__proto__.webdriver;
        window.navigator.chrome = {
            runtime: {},
        };
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) => (
            parameters.name === 'notifications' ?
                Promise.resolve({ state: Notification.permission }) :
                originalQuery(parameters)
        );
    });
    // 设定浏览器UserAgent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');
    // 跳转淘宝登录页
    await page.goto('https://www.dianping.com/');
    // 这一步十分重要，因为大部分大型网站都会对selenium机制进行检测，例如navigator.webdriver，navigator.languages等等。
    // 这一步就是把navigator的一些属性方法等等注入到浏览器中，绕过这些检测机制。
    await page.evaluate(async () => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false })
    })
    // // 等待登录按钮加载完毕
    // await page.$('.password-login');
    // // 自动输入账号，间隔频率随机数300毫秒内
    // await page.type('input[id=fm-login-id]', '你的账号', { delay: (parseInt(Math.random() * 300)) });
    // // 自动输入密码，间隔频率随机数300毫秒内
    // await page.type('input[id=fm-login-password]', '你的密码)', { delay: (parseInt(Math.random() * 300)) })
    // // 点击登录按钮
    // await page.click('.password-login');

    // console.log('登录成功！')

    // 获取cookies
    // cookies = await page.evaluate(() => document.cookie);
    // console.log(cookies);

    // // 等待页面加载完毕
    // await page.waitForNavigation()

    // // 搜索关键字
    // var keyName = '连衣裙';
    // // 等待输入框加载完毕
    // await page.$('#q');
    // // 输入关键字
    // await page.type('input[id=q]', keyName, { delay: 300 });
    // // 点击搜索按钮
    // await page.click('.btn-search');

    // // 等待5秒后进入采集方法
    // await page.waitFor(5000);

    console.log('采集开始...');
    // gather(page);
})();



// const clickSelector='a[data-click-name="shop_title_click"]'

// var element = document.querySelector(clickSelector);

// element.click();


// const buttonSelector = 'button[data-v-3e50dd5e][type="button"].ivu-btn-primary';
// var buttonElements = document.querySelectorAll(buttonSelector);
// if (buttonElements.length >= 3) {
//     var thirdButtonElement = buttonElements[3]; // 注意：数组的索引是从 0 开始的，所以第三个元素的索引是 2
//     console.log(thirdButtonElement);
//     thirdButtonElement.click();
// } else {
//     console.log('没有足够的匹配元素');
// }





// const xpath = "//button[text()='查询']";
// const xpath = "//a[text()='好评']";
// const xpath = "//a/span[text()='行政区']";
const text='西城区'
const xpath = `//a/span[text()='${text}'] | //a[text()='${text}']`;
const xpathResult = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
const linkElement = xpathResult.singleNodeValue;
console.log('linkElement:', linkElement);
if (linkElement) {
    linkElement.click();
} else {
    console.log('没有找到匹配的链接');
}



// let buttons = document.querySelectorAll('.MuiButton-label-323');
// let lastButton = buttons[buttons.length - 1]; // 获取最后一个按钮
// let text = lastButton.innerText; // 获取按钮的文本内容
// let number = parseInt(text); // 将文本内容转换为数字

// console.log('number:', number);

// let xpath = '/html/body/div/div/main/div/div/div[2]/div[2]/ul/li'; // XPath，选择 ul 下的所有 li 元素
// let result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); // 获取所有匹配的元素
// console.log('Total elements:', result.snapshotLength); // 打印元素的总数

// let xpath = '/html/body/div/div/main/div/div/div[2]/div[2]/ul/li'; // XPath，选择 ul 下的所有 li 元素
// let xpathResult = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
// let linkElement = xpathResult.singleNodeValue;
// console.log('linkElement:', linkElement); // 打印元素的总数

// const cliclValue=0
// let xpath = '/html/body/div/div/main/div/div/div[2]/div[2]/ul/li'; // XPath，选择 ul 下的所有 li 元素
// let result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); // 获取所有匹配的元素
// let element = result.snapshotItem(cliclValue); // 获取元素
// console.log('element:', element);
// element.querySelector('a').click()