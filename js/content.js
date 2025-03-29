function convertMoneyToTime() {
  chrome.storage.sync.get(['hourlySalary'], (data) => {
    const salary = data.hourlySalary !== undefined ? data.hourlySalary : 25;
    const moneyRegex = /([\$£€])\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?!.*\d+h \d+m)/g;
    const processedNodes = new Set();

    const priceElements = document.querySelectorAll(
      '.a-price .a-offscreen, .a-color-price, span[data-a-size="xl"]'
    );
    priceElements.forEach((element) => {
      const text = element.textContent;
      const match = text.match(moneyRegex);
      if (match && !/\d+h \d+m/.test(text)) {
        element.textContent = text.replace(moneyRegex, (match, currency, amount) => {
          const dollars = parseFloat(amount.replace(/,/g, ''));
          let hours = dollars / salary;

          if (hours >= 40) {
            const weeks = hours / 40;
            const totalWorkDays = weeks * 5;
            const months = Math.floor(totalWorkDays / 20);
            const remainingDays = Math.floor(totalWorkDays % 20);
            const years = Math.floor(months / 12);
            const remainingMonths = months % 12;
            const remainingHours = Math.round((hours % 40) * 10) / 10;

            let timeString = '';
            if (years > 0) timeString += `${years}y `;
            if (remainingMonths > 0 || years > 0) timeString += `${remainingMonths}m `;
            if (remainingDays > 0 || months > 0 || years > 0) timeString += `${remainingDays}d `;
            timeString += `${remainingHours}h`;
            return `${timeString.trim()}`; // Just the time, no match
          } else {
            const minutes = Math.round(hours * 60) % 60;
            return `${Math.floor(hours)}h ${minutes}m`; // Just the time
          }
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
          const dollars = parseFloat(amount.replace(/,/g, ''));
          let hours = dollars / salary;

          if (hours >= 40) {
            const weeks = hours / 40;
            const totalWorkDays = weeks * 5;
            const months = Math.floor(totalWorkDays / 20);
            const remainingDays = Math.floor(totalWorkDays % 20);
            const years = Math.floor(months / 12);
            const remainingMonths = months % 12;
            const remainingHours = Math.round((hours % 40) * 10) / 10;

            let timeString = '';
            if (years > 0) timeString += `${years}y `;
            if (remainingMonths > 0 || years > 0) timeString += `${remainingMonths}m `;
            if (remainingDays > 0 || months > 0 || years > 0) timeString += `${remainingDays}d `;
            timeString += `${remainingHours}h`;
            return `${timeString.trim()}`;
          } else {
            const minutes = Math.round(hours * 60) % 60;
            return `${Math.floor(hours)}h ${minutes}m`;
          }
        });
      }
    }
  });
}

setTimeout(() => {
  chrome.storage.sync.get(['enabled'], (data) => {
    if (data.enabled !== false) {
      convertMoneyToTime();
    }
  });
}, 2000);

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