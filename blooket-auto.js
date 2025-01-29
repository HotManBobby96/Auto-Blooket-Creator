const { log } = require('console');
const puppeteer = require('puppeteer'); 
const fs = require('fs');
const readline = require('readline');

const email = "autoblooket@gmail.com"; // email and password to log in to websites
const password = "Autoblooketpassword123!";

const awnserFilePath = "C:\\Users\\PCHS_BPA\\Desktop\\Auto-Blooket-Creator\\awnsers.txt";
const questionFilePath = "C:\\Users\\PCHS_BPA\\Desktop\\Auto-Blooket-Creator\\questions.txt";

let currentLine = 1; // Start with the first line
const numberOfQuestions = 10;

async function logIn(email, password, page) {
    await page.goto('https://id.blooket.com/login');  

    await page.type('input[name="username"]', email); 
    await page.type('input[name="password"]', password);

    await page.click('button[type="submit"]');

    await page.waitForNavigation();
    console.log('Logged in');
}

async function goToCreate(page) {
    await page.goto('https://dashboard.blooket.com/create');
    console.log('Navigated to create page');
}

async function StartBlooketPage(page) {
    await goToCreate(page);
    await page.waitForNavigation();
    console.log('Started Blooket page');
}

async function addQuestions(page, question, correctAnswer, allAnswers, currentLine) {
    // Shuffle and pick three incorrect answers
    let incorrectAnswers = allAnswers.filter(ans => ans !== correctAnswer);
    incorrectAnswers = incorrectAnswers.sort(() => 0.5 - Math.random()).slice(0, 3);

    await page.waitForSelector('#app > div > div > div._profileBody_nbamd_406 > div > div._questionSection_1byfb_186 > div._questionSectionTop_1byfb_192 > div._button_552gk_1 > div._front_552gk_33');
    const buttonClick = await page.$("#app > div > div > div._profileBody_nbamd_406 > div > div._questionSection_1byfb_186 > div._questionSectionTop_1byfb_192 > div._button_552gk_1 > div._front_552gk_33");
    await buttonClick.click();

    await page.type('textarea[placeholder="Question Text"]', question); 

    // Enter correct answer
    await page.type('textarea[placeholder="Answer 1"]', correctAnswer);
    await page.waitForSelector('#app > div > div > div._wrapper_1tul9_1 > div > div > div._questionRegularBody_1tul9_213 > div._answersHolder_1tul9_620 > div:nth-child(1) > div > div._answerLeftContainer_1tul9_654 > div._correctButton_1tul9_664 > i');
    const correctClick = await page.$("#app > div > div > div._wrapper_1tul9_1 > div > div > div._questionRegularBody_1tul9_213 > div._answersHolder_1tul9_620 > div:nth-child(1) > div > div._answerLeftContainer_1tul9_654 > div._correctButton_1tul9_664 > i");
    await correctClick.click();

    // Enter incorrect answers
    await page.type('textarea[placeholder="Answer 2"]', incorrectAnswers[0] || 'Random Wrong 1');
    await page.type('textarea[placeholder="Answer 3 (Optional)"]', incorrectAnswers[1] || 'Random Wrong 2');
    await page.type('textarea[placeholder="Answer 4 (Optional)"]', incorrectAnswers[2] || 'Random Wrong 3');

    // Save the question
    await page.waitForSelector('#app > div > div > div._wrapper_1tul9_1 > div > div > div._header_1tul9_37 > div:nth-child(2) > div._saveButton_1tul9_174 > i');
    const saveClick = await page.$("#app > div > div > div._wrapper_1tul9_1 > div > div > div._header_1tul9_37 > div:nth-child(2) > div._saveButton_1tul9_174 > i");
    await saveClick.click();

    console.log(`Added question ${currentLine}`);
}


async function saveSet(page) {
    await page.waitForSelector('#app > div > div > div._profileBody_nbamd_406 > div > div._leftColumn_1byfb_10 > div._headerContainer_1byfb_16 > div._button_552gk_1._saveButton_1byfb_89 > div._front_552gk_33 > div');
    const saveSetClick = await page.$("#app > div > div > div._profileBody_nbamd_406 > div > div._leftColumn_1byfb_10 > div._headerContainer_1byfb_16 > div._button_552gk_1._saveButton_1byfb_89 > div._front_552gk_33 > div");

    await saveSetClick.click();
    console.log('Saved the question set');
}

async function getQuestions(filePath, lineNumber) {
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    return lines[lineNumber - 1] || ''; // Return the specific line or empty string if out of range
}

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function getAnswers(filePath) {
    return fs.readFileSync(filePath, 'utf8').split('\n').map(line => line.trim()).filter(line => line);
}


(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await logIn(email, password, page);
    await StartBlooketPage(page);

    const allAnswers = await getAnswers(awnserFilePath);

    for (let i = 0; i < numberOfQuestions; i++) {
        const question = await getQuestions(questionFilePath, currentLine);
        const correctAnswer = allAnswers[currentLine - 1] || 'Default Answer';

        if (question) {
            await addQuestions(page, question, correctAnswer, allAnswers, currentLine);
            await sleep(500);
            currentLine++;
        } else {
            console.log('No more questions to add');
            break;
        }
    }

    await saveSet(page);
    await browser.close();
})();

