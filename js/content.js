function convertMoneyToTime() {
    chrome.storage.sync.get(['hourlySalary'], (data) => {
      const salary = data.hourlySalary !== undefined ? data.hourlySalary : 25;
      const moneyRegex = /([\$£€])\s?(\d+(?:\.\d{2})?)(?!.*\d+h \d+m)/g;
      const processedNodes = new Set();
  
      // Target price elements
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
            return `${Math.floor(hours)}h ${minutes % 60}m`;
          });
          processedNodes.add(element);
        }
      });
  
      // Fallback to TreeWalker
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
            return `${Math.floor(hours)}h ${minutes % 60}m`;
          });
        }
      }
    });
  }
  
  convertMoneyToTime();
  
  const observer = new MutationObserver((mutations) => {
    let shouldRun = false;
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        shouldRun = true;
      }
    });
    if (shouldRun) {
      convertMoneyToTime();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });