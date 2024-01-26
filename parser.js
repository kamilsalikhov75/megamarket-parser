import puppeteer from "puppeteer";

import { createFile, writeToFile } from "./file-control.js";

const MAX_PAGE_COUNT = 30;
const START_PAGE = 1;
const URL = "https://megamarket.ru/catalog/";
const category = "stiralnye-mashiny";
const errorPages = [];

async function parsePage(pageNumber) {
  console.log(pageNumber);
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto(`${URL}${category}/page-${pageNumber}`);
    await page.waitForSelector(".catalog-items-list");

    const result = await page.evaluate(() => {
      const elements = document.querySelectorAll(".catalog-item-mobile");

      const products = [];
      for (const product of elements) {
        const link = product.querySelector(".item-title .ddl_product_link");
        const price = Number(
          product
            .querySelector(".item-price span")
            .textContent.replaceAll(" ", "")
            .replace("₽", "")
        );
        const bonus = Number(
          product
            .querySelector(".money-bonus span")
            ?.textContent.replaceAll(" ", "")
        );

        products.push({
          title: link.textContent,
          url: link.getAttribute("href"),
          price,
          bonus,
          bonusPercent: Math.round((bonus * 100) / price),
        });
      }

      return products;
    });

    writeToFile(category, result, pageNumber);
  } catch (error) {
    console.log(`${pageNumber} page error`);
    errorPages.push(pageNumber);
  }

  await browser.close();
}

(async () => {
  createFile(category);

  for (
    let pageNumber = START_PAGE;
    pageNumber <= MAX_PAGE_COUNT;
    pageNumber++
  ) {
    await parsePage(pageNumber);
  }

  if (errorPages.length) {
    for (let errorPage of errorPages) {
      await parsePage(errorPage);
    }
  }
})();
