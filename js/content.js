function parseMoneyAmount(text) {
  const moneyRegex = /([\$£€])\s?(\d+(?:,\d{3})*(?:\.\d+)?(?:[KkMm])?)(?!.*\d+h \d+m)/g;
  const match = text.match(moneyRegex);
  if (!match || match.length === 0) return null;

  const originalPrice = match[0];
  const amount = originalPrice.replace(/[\$£€]\s?/, '');
  let dollars;

  if (/[Kk]$/.test(amount)) {
    dollars = parseFloat(amount.replace(/[Kk]/, '')) * 1000;
  } else if (/[Mm]$/.test(amount)) {
    dollars = parseFloat(amount.replace(/[Mm]/, '')) * 1000000;
  } else {
    dollars = parseFloat(amount.replace(/,/g, ''));
  }

  return { originalPrice, dollars };
}

function convertMoneyToTime() {
  chrome.storage.sync.get(['hourlySalary'], (data) => {
    const salary = data.hourlySalary !== undefined ? data.hourlySalary : 25;
    const processedNodes = new Set();

    const priceElements = document.querySelectorAll(
      '.a-price .a-offscreen, .a-color-price, span[data-a-size="xl"]'
    );
    priceElements.forEach((element) => {
      const text = element.textContent;
      const parsed = parseMoneyAmount(text);
      if (parsed && !/\d+h \d+m/.test(text)) {
        const { originalPrice, dollars } = parsed;
        let hours = dollars / salary;
        let timeString = '';

        if (hours >= 40) {
          const weeks = hours / 40;
          const totalWorkDays = weeks * 5;
          const months = Math.floor(totalWorkDays / 20);
          const remainingDays = Math.floor(totalWorkDays % 20);
          const years = Math.floor(months / 12);
          const remainingMonths = months % 12;
          const remainingHours = Math.round((hours % 8) * 10) / 10;

          if (years > 0) timeString += `${years}y `;
          if (remainingMonths > 0 || years > 0) timeString += `${remainingMonths}m `;
          if (remainingDays > 0 || months > 0 || years > 0) timeString += `${remainingDays}d `;
          timeString += `${remainingHours}h`;
        } else {
          const minutes = Math.round(hours * 60) % 60;
          timeString = `${Math.floor(hours)}h ${minutes}m`;
        }

        element.textContent = `${timeString.trim()}`;
        processedNodes.add(element);
      }
    });

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (processedNodes.has(node.parentElement)) continue;
      const text = node.textContent;
      const parsed = parseMoneyAmount(text);
      if (parsed && !/\d+h \d+m/.test(text)) {
        const { originalPrice, dollars } = parsed;
        let hours = dollars / salary;
        let timeString = '';

        if (hours >= 40) {
          const weeks = hours / 40;
          const totalWorkDays = weeks * 5;
          const months = Math.floor(totalWorkDays / 20);
          const remainingDays = Math.floor(totalWorkDays % 20);
          const years = Math.floor(months / 12);
          const remainingMonths = months % 12;
          const remainingHours = Math.round((hours % 8) * 10) / 10;

          if (years > 0) timeString += `${years}y `;
          if (remainingMonths > 0 || years > 0) timeString += `${remainingMonths}m `;
          if (remainingDays > 0 || months > 0 || years > 0) timeString += `${remainingDays}d `;
          timeString += `${remainingHours}h`;
        } else {
          const minutes = Math.round(hours * 60) % 60;
          timeString = `${Math.floor(hours)}h ${minutes}m`;
        }

        node.textContent = `${timeString.trim()}`;
        processedNodes.add(node.parentElement);
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