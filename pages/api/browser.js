import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { downloadAndUploadvideo, getSignedUrl } from "@/lib/s3";

// 下载 Puppeteer 并返回可执行路径
async function downloadPuppeteer() {
    const browserFetcher = puppeteer.createBrowserFetcher({
        path: PUPPETEER_PATH
    });
    const revisionInfo = await browserFetcher.download('901912'); // 使用特定的 revision，例如最新的
    return revisionInfo.executablePath;
}

// 定义 Puppeteer 的下载路径
const PUPPETEER_PATH = path.resolve(process.cwd(), '.local-chromium');

// 检查 Puppeteer 是否已下载
function getPuppeteerPath() {
    const executablePath = path.join(PUPPETEER_PATH, 'chrome-linux', 'chrome');
    if (fs.existsSync(executablePath)) {
        return executablePath;
    }
    return null;
}


export default async function handler(req, res) {
    let latestCookies;
    // let puppeteerPath = getPuppeteerPath();
    // if (!puppeteerPath) {
    //     console.log('Puppeteer not found. Downloading...');
    //     puppeteerPath = await downloadPuppeteer();
    //     console.log('Puppeteer downloaded to:', puppeteerPath);
    // }

    async function getCookiesAndWriteToResponse(page) {
        if (!page) {
            console.log('Page is not defined, skipping cookie retrieval');
            return;
        }
        latestCookies = await page.cookies(); // 获取 cookies
        
        console.log('cookies success', latestCookies);
    }

    // const proxyHost = "www.16yun.cn";
    // const proxyPort = "5445";
    // const proxyUser = "16QMSOML";
    // const proxyPass = "280651";

    // const proxySettings = {
    //     // proxy: `http://${proxyUser}:${proxyPass}@${proxyHost}:${proxyPort}`,
    //     headers: {
    //         'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    //     }
    // };

    // const browser = await puppeteer.launch({
    //     headless: false,
    //     defaultViewport: {
    //         width: 1300,
    //         height: 900
    //     },
    //     args: [
    //         '--no-sandbox',
    //         '--disable-setuid-sandbox',
    //         '--disable-blink-features=AutomationControlled'
    //     ]
    // });

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        // executablePath: puppeteerPath,
        headless: false, // 启用有表头模式
        defaultViewport: {
            width: 1300,
            height: 900
        }
    });


    const page = await browser.newPage();
    const path = require('path');
    const cookiesPath = path.join(process.cwd(), 'public', 'cookies.json');
    const cookiesString = fs.readFileSync(cookiesPath, 'utf8');
    const cookies = JSON.parse(cookiesString);

    // 在页面中设置 cookies
    await page.setCookie(...cookies);
    //防止被识别为自动化
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
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');
    
    await page.setViewport({ width: 1280, height: 720 });
    const screenshotDir = path.resolve(__dirname, 'screenshots');
    const gifFilePath = path.resolve(__dirname, 'screencast.gif');

    // 创建截图目录
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir);
    }


    let frameCount = 0;
    let currentClient = null;

    browser.on('targetchanged', async (target) => {
        if (currentClient) {
            await currentClient.send('Page.stopScreencast');
        }
        if (target.type() === 'page') {
            const page = await target.page();
            currentClient = await target.createCDPSession();
            await currentClient.send('Page.startScreencast', { format: 'jpeg', everyNthFrame: 10 });
            currentClient.on('Page.screencastFrame', ({ data, sessionId }) => {
                const buffer = Buffer.from(data, 'base64');
                fs.writeFileSync(path.resolve(screenshotDir, `frame_${frameCount++}.jpeg`), buffer);
                currentClient.send('Page.screencastFrameAck', { sessionId });
            });
        }
    });

    // 创建一个对象来存储监控结果
    const monitorResults = {
        clicks: [],
        navigations: [],
        inputs: [],
        scrolls: [], // 新增滚动信息
        keydowns: [],
    };


    const exposeFunctionsOnce = async (page) => {
        if (!page.exposedBindings) {
            page.exposedBindings = {};
        }

        if (!page.exposedBindings.onKeydown) {
            await page.exposeFunction('onKeydown', (e) => {
                console.log('Keydown event:', e);
                monitorResults.keydowns.push({ ...e, time: new Date() });
            });
            page.exposedBindings.onKeydown = true;
        }

        if (!page.exposedBindings.onScroll) {
            await page.exposeFunction('onScroll', (e) => {
                console.log('Scroll event:', e);
                monitorResults.scrolls.push({ ...e, time: new Date() });
            });
            page.exposedBindings.onScroll = true;
        }

        if (!page.exposedBindings.onPageClick) {
            await page.exposeFunction('onPageClick', (e) => {
                console.log('Click event:', e);
                monitorResults.clicks.push({ ...e, time: new Date() });
            });
            page.exposedBindings.onPageClick = true;
        }

        if (!page.exposedBindings.onInput) {
            await page.exposeFunction('onInput', (e) => {
                console.log('Input event:', e);
                monitorResults.inputs.push({ ...e, time: new Date() });
            });
            page.exposedBindings.onInput = true;
        }
    };


    const applyListeners = async (page) => {
        await exposeFunctionsOnce(page);

        await page.evaluate(() => {
            if (!window['_eventListenersInitialized']) {
                document.addEventListener('click', (e) => {
                    const element = e.target;
                    const elementInfo = {
                        tagName: element.tagName,
                        id: element.id,
                        className: element.className,
                        name: element.name,
                        innerText: element.innerText,
                        placeholder: element.placeholder
                    };
                    window.onPageClick({ element: elementInfo, value: e.target.value });
                });

                document.addEventListener('input', (e) => {
                    const element = e.target;
                    let labelText = '';

                    // 检查元素是否存在label属性或关联的label元素
                    if (element.labels && element.labels.length > 0) {
                        labelText = element.labels[0].innerText;
                    } else {
                        // 如果没有labels属性，尝试查找与此元素关联的label元素
                        const id = element.id;
                        if (id) {
                            const label = document.querySelector(`label[for='${id}']`);
                            if (label) {
                                labelText = label.innerText;
                            }
                        } else {
                            // 如果没有id属性，尝试查找最近的label元素
                            let parent = element.parentElement;
                            while (parent) {
                                const label = parent.querySelector('label');
                                if (label) {
                                    labelText = label.innerText;
                                    break;
                                }
                                parent = parent.parentElement;
                            }
                        }
                    }

                    const elementInfo = {
                        tagName: element.tagName,
                        id: element.id,
                        className: element.className,
                        name: element.name,
                        innerText: element.innerText,
                        placeholder: element.placeholder,
                        value: element.value,
                        label: labelText,
                    };

                    // 触发自定义事件或调用函数
                    window.onInput({ element: elementInfo, value: e.target.value });
                });

                document.addEventListener('keydown', (e) => {
                    window.onKeydown({ key: e.key, code: e.code });
                });

                let lastScrollTop = 0;
                const threshold = 100;
                document.addEventListener('scroll', () => {
                    const scrollTop = document.documentElement.scrollTop;
                    if (Math.abs(scrollTop - lastScrollTop) > threshold) {
                        const direction = scrollTop > lastScrollTop ? 'down' : 'up';
                        const distance = Math.abs(scrollTop - lastScrollTop);
                        lastScrollTop = scrollTop;
                        window.onScroll({ action: 'scroll', direction: direction, distance: distance });
                    }
                });

                window['_eventListenersInitialized'] = true;
            }
        });
    };

    await applyListeners(page);


    page.on('framenavigated', async () => {
        const url = page.url();
        console.log('新 URL');
        console.log('Navigation event', url);
        monitorResults.navigations.push({ url: url, time: new Date() });
        await applyListeners(page);
    });

    const handleNewPage = async (newPage) => {
        console.log('New page created 监控');
        await newPage.bringToFront();
        await newPage.waitForNavigation({ waitUntil: 'domcontentloaded' });
        await applyListeners(newPage);
        newPage.on('framenavigated', async () => {
            await applyListeners(newPage);
        });
    };

    browser.on('targetcreated', async (target) => {
        if (target.type() === 'page') {
            console.log('新页面');
            const newPage = await target.page();
            await newPage.setViewport({ width: 1280, height: 720 });
            console.log('New page created', newPage);
            await handleNewPage(newPage);
        }
    });

    await page.goto('https://www.baidu.com');
    res.writeHead(200, {
        'Content-Type': 'application/json',
    });
    
    await page.evaluate(async () => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false })
    })

    // 获取浏览器实例的 WebSocket 端点
    const wsEndpoint = browser.wsEndpoint();

    // 将 wsEndpoint 返回给客户端，但不结束响应
    res.write(JSON.stringify({ wsEndpoint }));
    // let timerId = setInterval(() => getCookiesAndWriteToResponse(page), 30 * 1000);


    browser.on('disconnected', async () => {
        // clearInterval(timerId);
        try {
            if (!page.isClosed()) {
                // 停止屏幕广播
                await client.send('Page.stopScreencast');
            }
            // if (browser.client) {
            //     await browser.client.send('Page.stopScreencast');
            // }
            // 返回结构化的 JSON
            res.write(`\n${JSON.stringify({ cookies: latestCookies })}`);
            console.log('cookies_done', latestCookies);
            res.write(`\n${JSON.stringify({ monitorResults })}\n`);
            console.log('monitorResults_done');
            // res.flush();
            // 使用 FFmpeg 将 JPEG 帧合成为 GIF 文件
            // 检查 GIF 文件是否存在，如果存在则删除
            if (fs.existsSync(gifFilePath)) {
                fs.unlinkSync(gifFilePath);
            }
            exec(`ffmpeg -f image2 -framerate 2 -i ${screenshotDir}/frame_%d.jpeg ${gifFilePath}`, async (err) => {
                if (err) {
                    console.error('Error creating GIF:', err);
                } else {
                    const gifBuffer = fs.readFileSync(gifFilePath);

                    const s3Key = `check.gif`;
                    console.log('ffmpeg_done');
                    const data = await downloadAndUploadvideo(gifBuffer, s3Key);
                    console.log('Upload success', data);
                    const gifUrl = await getSignedUrl(data.Bucket, data.Key);
                    console.log('GIF URL:', gifUrl);
                    // res.write(`\n${JSON.stringify({ monitorResults })}\n`);
                    res.write(`${JSON.stringify({ gifUrl })}\n`);

                    res.end();
                }
            });
            
        } catch (error) {
            console.error('Error in disconnected event handler:', error);
        }
    });
}



