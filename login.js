require("chromedriver");
const swd = require("selenium-webdriver");
const { pw, id } = require("./credential");


let gCodes;
let gCode;
let gCustomBox;
//build an instance of browser
let bldr = new swd.Builder();

//open tab
let driver = bldr.forBrowser("chrome").build();

let pageWillBeOpenedP = driver.get("https://www.hackerrank.com/auth/login");

pageWillBeOpenedP
    .then(function () {
        let waitPromise = driver.manage().setTimeouts({ implicit: 5000 });
        return waitPromise;
    }).then(function () {
        let idPromise = driver.findElement(swd.By.css("#input-1"));
        let pwPromise = driver.findElement(swd.By.css("#input-2"));

        let bothFindPromise = Promise.all([idPromise, pwPromise]);
        return bothFindPromise;
    }).then(function (bothElement) {
        let idTypedP = bothElement[0].sendKeys(id);
        let pwTypedP = bothElement[1].sendKeys(pw);
        let bothTypedP = Promise.all([idTypedP, pwTypedP]);
        return bothTypedP;
    }).then(function () {
        let loginbtnClickP = navigator(".ui-btn.ui-btn-large.ui-btn-primary.auth-button");
        return loginbtnClickP;
    }).then(function () {
        let ipKitClickedP = navigator("#base-card-1-link");
        return ipKitClickedP;
    }).then(function () {
        let warmUpBtnClickedP = navigator("a[data-attr1='warmup']");
        return warmUpBtnClickedP;
    }).then(function () {
        let allQuesP = driver.findElements(swd.By.css(".js-track-click.challenge-list-item"));
        return allQuesP;
    })
    .then(function (quesList) {
        let quesLink = [];
        for (let i = 0; i < quesList.length; i++) {
            let linkP = quesList[i].getAttribute("href");
            quesLink.push(linkP);
        }
        let allHrefsP = Promise.all(quesLink);
        return allHrefsP;

    }).then(function (allHrefs) {
        let quesSubmitPromise = questionSubmitter(allHrefs[0]);
        for (let i = 0; i < allHrefs.length; i++) {
            quesSubmitPromise = quesSubmitPromise.then(function () {
                let nextSubmit = questionSubmitter(allHrefs[i]);
                return nextSubmit;
            });
        }
        return quesSubmitPromise;
    })
    .then(function () {
        console.log("Question submitted successfully !");
    })
    .catch(function (error) {
        console.log("Page not found!!");
        console.log(error);
    })

function navigator(selector) {
    console.log("Inside navigator function");

    let promise = new Promise(function (resolve, reject) {
        let elementPromise = driver.findElement(swd.By.css(selector));
        elementPromise.then(function (element) {
            let elementClickedP = element.click();
            return elementClickedP;
        })
            .then(function () {
                resolve();
            })
            .catch(function (error) {
                reject(error);
            });
    });
    return promise;
}

function handleLockButton() {
    return new Promise(function (resolve, reject) {
        let findElementPromise = driver.findElement(swd.By.css(".editorial-content-locked .ui-btn.ui-btn-normal.ui-btn-primary"));
        findElementPromise.then(function (element) {
            const actions = driver.actions({ async: true });
            let lockBtnPressed = actions.move({ origin: element }).click().perform();
            return lockBtnPressed;
        })
            .then(function () {
                console.log("Lock btn clicked");
                resolve();
            })
            .catch(function (error) {
                console.log("Lock btn not found !!");
                resolve();
            });
    });
}

function getCode() {
    return new Promise(function (resolve, reject) {
        let codeNamesP = driver.findElements(swd.By.css(".hackdown-content h3"));
        let codesP = driver.findElements(swd.By.css(".hackdown-content .highlight"));
        let codeObjectPromise = Promise.all([codeNamesP, codesP]);
        codeObjectPromise.then(function (codeObject) {
            let codesNames = codeObject[0];
            let codesActualNames = [];
            gCodes = codeObject[1];
            for (let i = 0; i < codesNames.length; i++) {
                let nameP = codesNames[i].getText();
                codesActualNames.push(nameP);
            }
            let namesP = Promise.all(codesActualNames);
            return namesP;
        }).then(function (namesArr) {
            let idx = namesArr.indexOf("C++");
            let codeP = gCodes[idx].getText();
            return codeP;
        }).then(function (code) {
            gCode = code;
            resolve();
        })
            .catch(function (err) {
                reject(err);
            })
    })
}

function pasteCode() {
    return new Promise(function (resolve, reject) {
        let problemClickedP = navigator('a[data-attr2="Problem"]');
        problemClickedP
            .then(function () {
                let customClickedPromise = navigator(".custom-input-checkbox");
                return customClickedPromise;
            })
            .then(function () {
                let customInputP = driver.findElement(swd.By.css(".custominput"));
                return customInputP;
            })
            .then(function (element) {
                gCustomTextBox = element;
                let codeTypedPromise = element.sendKeys(gCode);
                return codeTypedPromise;
            })
            .then(function () {
                let ctrlAPromise = gCustomTextBox.sendKeys(swd.Key.CONTROL + "a");
                return ctrlAPromise;
            })
            .then(function () {
                let ctrXPromise = gCustomTextBox.sendKeys(swd.Key.CONTROL + "x");
                return ctrXPromise;
            })
            .then(function () {
                let inputBoxPromise = driver.findElement(swd.By.css(".inputarea"));
                return inputBoxPromise;
            })
            .then(function (element) {
                gCodeBox = element;
                let inputBoxSelectPromise = element.sendKeys(swd.Key.CONTROL + "a");
                return inputBoxSelectPromise;
            })
            .then(function () {
                let codePastedPromise = gCodeBox.sendKeys(swd.Key.CONTROL + "v");
                return codePastedPromise;
            })
            .then(function () {
                console.log("Code pasted in code box !!!");
                resolve();
            })
            .catch(function (error) {
                reject(error);
            });
    });
}

function questionSubmitter(quesLink) {
    return new Promise(function (resolve, reject) {
        let quesClickedPromise = driver.get(quesLink);
        quesClickedPromise
            .then(function () {
                let editorialClickedPromise = navigator('a[data-attr2="Editorial"]');
                return editorialClickedPromise;
            })
            .then(function () {
                let lockBtnPromise = handleLockButton(".ui-btn.ui-btn-normal.ui-btn-primary");
                return lockBtnPromise;
            })
            .then(function () {
                let getCodePromise = getCode();
                return getCodePromise;
            })
            .then(function () {
                let pasteCodePromise = pasteCode();
                return pasteCodePromise;
            })
            .then(function () {
                let codeSubmitPromise = navigator(".pull-right.btn.btn-primary.hr-monaco-submit");
                return codeSubmitPromise;
            })
            .then(function () {
                resolve();
            })
            .catch(function (error) {
                reject(error);
            });
    });
}