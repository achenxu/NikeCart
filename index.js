const {Builder, By, Key, until} = require('selenium-webdriver');
const chromeDriver = require('selenium-webdriver/chrome');

const atcLink = 'https://secure-store.nike.com/ap/services/jcartService?callback=nike_Cart_handleJCartResponse&action=addItem&lang_locale=en_GB&country=SG&catalogId=7&productId=12182887&price=299&siteId=null&passcode=null&sizeType=US&qty=1&skuAndSize=21302699%3AM+10.5+%2F+W+12&rt=json&view=3&skuId=21302699&displaySize=M+10.5+%2F+W+12&_=1524460950783';

const options = new chromeDriver.Options();
options.addArguments('--log-level=3');
require('console-stamp')(console, {colors: {
                                        stamp: 'yellow',
                                        label: 'white',
                                        metadata: 'green'
                                  }
});

async function main() {
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
  await driver.get('https://www.nike.com/sg/en_gb/')
  await driver.sleep(2500);
  let cartButton = await driver.findElement(By.css('body > div:nth-child(6) > nav > div.gnav-member-bar.is-for--dropdown-nav.js-navContainer > ul.gnav-member-bar--right-side.nsg-font-family--base.js-navList.js-isRootNav > li.gnav-member-bar--cart.js-listItem.js-rootListItem > a > span'));
  await cartButton.click();
  await driver.sleep(3000);
  let element = await driver.findElement(By.css('#ch4_contentContainer'))
  await driver.sleep(1000);
  await element.click();
  await driver.executeScript(`window.open('${atcLink}');`);
  await driver.sleep(3000);
  let tabs = await driver.getAllWindowHandles();
  await driver.switchTo().window(tabs[1]);
  let source = await driver.getPageSource();
  let status = JSON.parse(source.split('(')[1].split(')')[0]).status;
  console.log(status);
  while (status !== 'success') {
    await driver.switchTo().window(tabs[0]);
    await driver.sleep(2500);
    await driver.navigate().refresh();
    try {
      element = await driver.findElement(By.css('#ch4_contentContainer'))
    } catch (err) {
      // Nike redirected to language tunnel, click and go back to cart
      await driver.sleep(2500);
      element = await driver.findElement(By.css('body > div > div > div.lang-tunnel__regions > div.lang-tunnel__regions-list > button.lang-tunnel__region.is--asia-pac.js-regionBtn'));
      await element.click();
      await driver.sleep(1000);
      element = await driver.findElement(By.css('body > div.alignment-wrapper > div > div.lang-tunnel__countries.js-countries > div.lang-tunnel__country-container.js-countryContainer.lang-tunnel--is-visible.lang-tunnel--is-current > ul > li.lang-tunnel__country-item.SG > a'));
      element.click();
      await driver.sleep(2000);
      cartButton = await driver.findElement(By.css('body > div:nth-child(6) > nav > div.gnav-member-bar.is-for--dropdown-nav.js-navContainer > ul.gnav-member-bar--right-side.nsg-font-family--base.js-navList.js-isRootNav > li.gnav-member-bar--cart.js-listItem.js-rootListItem > a > span'));
      await cartButton.click();
      await driver.sleep(3000)
      element = await driver.findElement(By.css('#ch4_contentContainer'))
      await element.click();
    }
    await driver.sleep(1000);
    await element.click();
    await driver.switchTo().window(tabs[1]);
    await driver.get(atcLink);
    await driver.sleep(3000);
    tabs = await driver.getAllWindowHandles();
    await driver.switchTo().window(tabs[1]);
    source = await driver.getPageSource();
    try {
      status = JSON.parse(source.split('(')[1].split(')')[0]).status;
    } catch (err) {
      // Nike ate your cookies
      await driver.switchTo().window(tabs[0]);
      await driver.navigate().refresh();
      await driver.sleep(2000);
      await driver.switchTo().window(tabs[1]);
      await driver.navigate().refresh();
      await driver.sleep(2000);
      source = await driver.getPageSource();
      status = JSON.parse(source.split('(')[1].split(')')[0]).status;
    }
    console.log(status);
  }
  console.log('Added!');
}

main()