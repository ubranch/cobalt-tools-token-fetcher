const { connect } = require("puppeteer-real-browser")
const jwt = require('jsonwebtoken');

class TokenFetcher {
    constructor(config = {}) {
        this.config = {
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--start-maximized',
                '--disable-blink-features=AutomationControlled',
                '--lang=en',
                '--force-webrtc-ip-handling-policy=default_public_interface_only',
                '--disable-features=WebRTC'
            ],
            headless: false,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
            customConfig: {},
            fingerprint: true,
            turnstile: true,
            connectOption: {},
            disableXvfb: false,
            ignoreAllFlags: false,
            plugins: [
                require('puppeteer-extra-plugin-stealth')(),
                require('puppeteer-extra-plugin-click-and-wait')()
            ],
            ...config
        }

        this.cookies = [
            {
                name: "__cf_logged_in",
                value: "1",
                domain: ".cloudflare.com",
                path: "/",
                expires: 1737563987,
                sameSite: "None",
                secure: true
            },
            {
                name: "CF_VERIFIED_DEVICE_b502391b7d4ac1a183a1579b8455fd37808326fc78d563889d252a8335b9d738",
                value: "1734885660",
                domain: ".cloudflare.com",
                path: "/",
                expires: 1769445587,
                sameSite: "None",
                secure: true
            },
            {
                name: "__cf_bm",
                value: "4d9YkXMqbFuTRweEoyf4vzRJr6svq9UavPjDVjhmXkY-1734888169-1.0.1.1-2AaPh9r.FA6IFpmffwind61iXc195UKr55MV4Ro.s.kT.yA_sssni7q_EE02js2JsJU6gkPTqHkWGTHTkMxpvg",
                domain: ".dash.cloudflare.com",
                path: "/",
                expires: 1734889895,
                sameSite: "None",
                httpOnly: true,
                secure: true
            },
            {
                name: "__cfruid",
                value: "9a589b44bdb54e28459f8c81fa1ce9556d2c6218-1734886209",
                domain: ".dash.cloudflare.com",
                path: "/",
                sameSite: "None",
                httpOnly: true,
                secure: true
            },
            {
                name: "__stripe_mid",
                value: "677f9ca4-9ca5-48a1-9eea-e71e6ccc394ffa23f2",
                domain: ".dash.cloudflare.com",
                path: "/",
                expires: 1766423328,
                sameSite: "Strict",
                secure: true
            },
            {
                name: "__stripe_sid",
                value: "a0417695-fdd5-4b1b-8b29-6c578794faac707b33",
                domain: ".dash.cloudflare.com",
                path: "/",
                expires: 1734889128,
                sameSite: "Strict",
                secure: true
            },
            {
                name: "_cfuvid",
                value: "z4RzcOwxRQSBl3sp_fW_b4dx2zNkPIsAEbrR4mTltHo-1734885640543-0.0.1.1-604800000",
                domain: ".dash.cloudflare.com",
                path: "/",
                sameSite: "None",
                httpOnly: true,
                secure: true
            },
            {
                name: "OptanonConsent",
                value: "isGpcEnabled=0&datestamp=Sun+Dec+22+2024+22%3A08%3A06+GMT%2B0500+(Uzbekistan+Standard+Time)&version=202411.1.0&browserGpcFlag=0&isIABGlobal=false&hosts=&consentId=a0b6d39e-8f79-4763-a417-e656a7349d0c&interactionCount=1&isAnonUser=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0003%3A1%2CC0002%3A1%2CC0004%3A1&AwaitingReconsent=false",
                domain: ".dash.cloudflare.com",
                path: "/",
                expires: 1766423286,
                sameSite: "Lax"
            },
            {
                name: "vses2",
                value: "da8e63c38a-mkqs4vmviim3h4ll5c9tkpmlt903nmgd",
                domain: ".dash.cloudflare.com",
                path: "/",
                expires: 1737477587,
                sameSite: "Lax",
                httpOnly: true,
                secure: true
            },
            {
                name: "__cf_bm",
                value: "l0BWSpp.ZjKXw0UWJQKRFfkX4VR7lEzosy8IBKMc5J8-1734887381-1.0.1.1-icvOkt.9gCYIaPrPq2UWQNLCQXZdizGUFy2rIeRSnLf7VaTXeXehy.q9Zqq_1oEzkD10dHKeiYuG6aEp.w2Jdg",
                domain: ".developers.cloudflare.com",
                path: "/",
                expires: 1734889107,
                sameSite: "None",
                httpOnly: true,
                secure: true
            },
            {
                name: "__cf_effload",
                value: "1",
                domain: "dash.cloudflare.com",
                path: "/"
            },
            {
                name: "__cflb",
                value: "0H28upHR6WxXGRqfrsmVntTd5vuFAcimErNgfsqR4XF",
                domain: "dash.cloudflare.com",
                path: "/",
                expires: 1734894570,
                sameSite: "Lax",
                httpOnly: true
            },
            {
                name: "CF_checkout",
                value: "{}",
                domain: "dash.cloudflare.com",
                path: "/",
                expires: 1737479095,
                sameSite: "Strict",
                secure: true
            },
            {
                name: "cf-locale",
                value: "en-US",
                domain: "dash.cloudflare.com",
                path: "/",
                expires: 1766424134
            },
            {
                name: "dark-mode",
                value: "off",
                domain: "dash.cloudflare.com",
                path: "/",
                expires: 1766423288
            },
            {
                name: "edgesessions_enabled",
                value: "rollout",
                domain: "dash.cloudflare.com",
                path: "/",
                expires: 1766421588,
                sameSite: "None",
                httpOnly: true,
                secure: true
            }
        ]
    }

    async init() {
        const { page, browser } = await connect(this.config)
        this.page = page
        this.browser = browser
        return this
    }

    async fetchToken() {
        try {
            await this.page.goto('https://cobalt.tools/', {
                waitUntil: "networkidle0",
                timeout: 30000
            });

            // Wait for and click save tab
            await this.page.waitForSelector("#sidebar-tab-save", { timeout: 10000 });
            await this.page.click("#sidebar-tab-save");

            // Input YouTube URL
            await this.page.waitForSelector("#link-area", { timeout: 10000 });
            await this.page.type("#link-area", `https://www.youtube.com/watch?v=${this.generateRandomVideoId()}`);

            // Click download button
            await this.page.waitForSelector("#download-button", { timeout: 10000 });
            await this.page.click("#download-button");

            // Wait for token response
            const response = await this.waitForToken(60000);
            return response;
        } catch (error) {
            throw new Error(`Token fetch failed: ${error.message}`);
        }
    }

    generateRandomVideoId() {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
        return Array.from({ length: 11 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }

    async waitForToken(timeout = 60000) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.page.off("response", responseHandler);
                reject(new Error('Token fetch timeout'));
            }, timeout);

            const responseHandler = async response => {
                if (response.url() === "https://api.cobalt.tools/session" &&
                    response.request().method() === "POST") {
                    try {
                        const data = await response.json();
                        if (data?.token) {
                            clearTimeout(timeoutId);
                            this.page.off("response", responseHandler);

                            // Decode the JWT token
                            const decodedToken = jwt.decode(data.token);

                            resolve({
                                status: "success",
                                token: data.token,
                                timestamp: new Date().toISOString(),
                                expiresAt: new Date(decodedToken.exp * 1000).toISOString() // Convert to ISO string
                            });
                        }
                    } catch (error) {
                        reject(new Error(`Token parse failed: ${error.message}`));
                    }
                }
            };

            this.page.on("response", responseHandler);
        });
    }

    async cleanup() {
        await this.browser?.close();
    }
}

// Singleton instance
let tokenFetcherInstance = null;

async function getTokenFetcher() {
    if (!tokenFetcherInstance) {
        tokenFetcherInstance = await new TokenFetcher().init();
    }
    return tokenFetcherInstance;
}

async function fetchToken() {
    let fetcher = null;

    try {
        fetcher = await getTokenFetcher();
        const result = await fetcher.fetchToken();

        // Close the browser after successful token fetch
        await cleanup();
        tokenFetcherInstance = null;

        return result;
    } catch (error) {
        // Ensure cleanup happens even on error
        if (fetcher) {
            await cleanup();
            tokenFetcherInstance = null;
        }

        if (error.message.includes('timeout') || error.message.includes('browser')) {
            tokenFetcherInstance = null;
        }
        throw error;
    }
}

async function cleanup() {
    if (tokenFetcherInstance) {
        try {
            await tokenFetcherInstance.cleanup();
        } catch (error) {
            console.error('Error during cleanup:', error);
        } finally {
            tokenFetcherInstance = null;
        }
    }
}

module.exports = {
    fetchToken,
    cleanup
};
