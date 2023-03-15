const puppeteer = require('puppeteer');

(async function () {
    /* Setup page connection */
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto("https://www.padovaoggi.it/eventi");

    /* Close cookie acceptance button */
    try { await page.click('.iubenda-cs-close-btn');}
    catch (e) {console.log('No cookies window');}

    /* Get the number of pages for iteration */
    const pageNumbers = await page.evaluate(() => {
        const eventPages = document.querySelectorAll('.c-pagination__item > span');
        return eventPages.length;
    })

    /* Gather the dates and title data from the cards iterate through the pages */
    var dataArr = [];

    for (i = 0; i < pageNumbers; i++) {
        var data = await page.evaluate(() => {
            const titles = document.querySelectorAll('.c-card__heading');
            const dates = document.querySelectorAll('li > .u-label-07');
            const array = [];

            for (i = 0; i < titles.length; i++) {
                array.push({
                    title: titles[i].innerText,
                    date: dates[i].innerText
                })
            }

            return array;
        });
        dataArr = dataArr.concat(data);
        //console.log(dataArr.length);
    }

    /* array for Italian months used for comparison */
    const months = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"]

    const sortedData = dataArr.sort(function compareFn(a, b) {
        const date_split_a = a.date.replace('dal ', '').split(' ');
        const date_split_b = b.date.replace('dal ', '').split(' ');

        if (months.indexOf(date_split_a[date_split_a.length - 2]) > months.indexOf(date_split_b[date_split_b.length - 2]))
            return 1;
        else {
            if (months.indexOf(date_split_a[date_split_a.length - 2]) < months.indexOf(date_split_b[date_split_b.length - 2]))
                return -1;
            else {
                if (date_split_a[0] > date_split_b[0]) return 1;
                else {
                    if (date_split_a[0] < date_split_b[0]) return -1;
                    else return 0;
                }
            }
        }
    })

    //console.log(sortedData);
    //console.log(sortedData.length);

    /* Into JSON Object */ 
    // const jsonData = JSON.stringify(sortedData);
    
    /* saving in CSV file*/
    const fs = require("fs");
    let csv = "titolo\tdata\n";

    sortedData.forEach(element => {
        csv += element.title+"\t";
        csv += element.date+"\n";
    });
    
    console.log(csv)
    fs.writeFileSync("eventi.csv", csv, 'utf-8');

})();