function convertMoneyToTime() {
  chrome.storage.sync.get(['hourlySalary'], (data) => {
    const salary = data.hourlySalary !== undefined ? data.hourlySalary : 25;
    const moneyRegex = /([\$£€])\s?(\d+(?:\.\d{2})?)(?!.*\d+h \d+m)/g;
    const processedNodes = new Set();

    const priceElements = document.querySelectorAll(
      '.a-price .a-offscreen, .a-color-price, span[data-a-size="xl"]'
    );
    priceElements.forEach((element) => {
      const text = element.textContent;
      const match = text.match(moneyRegex);
      if (match && !/\d+h \d+m/.test(text)) {
        const singlePrice = match[0];
        element.textContent = singlePrice.replace(moneyRegex, (match, currency, amount) => {
          const dollars = parseFloat(amount);
          const hours = dollars / salary;
          const minutes = Math.round(hours * 60);
          return `${match} (${Math.floor(hours)}h ${minutes % 60}m)`;
        });
        processedNodes.add(element);
      }
    });

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (processedNodes.has(node.parentElement)) continue;
      const text = node.textContent;
      if (moneyRegex.test(text) && !/\d+h \d+m/.test(text)) {
        node.textContent = text.replace(moneyRegex, (match, currency, amount) => {
          const dollars = parseFloat(amount);
          const hours = dollars / salary;
          const minutes = Math.round(hours * 60);
          return `${match} (${Math.floor(hours)}h ${minutes % 60}m)`;
        });
      }
    }
  });
}

// Initial run with toggle check
setTimeout(() => {
  chrome.storage.sync.get(['enabled'], (data) => {
    if (data.enabled !== false) { // Default to true if undefined
      convertMoneyToTime();
    }
  });
}, 2000);

// Observer with toggle check
const observer = new MutationObserver((mutations) => {
  let shouldRun = false;
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      shouldRun = true;
    }
  });
  if (shouldRun) {
    chrome.storage.sync.get(['enabled'], (data) => {
      if (data.enabled !== false) {
        convertMoneyToTime();
      }
    });
  }
});
observer.observe(document.body, { childList: true, subtree: true });