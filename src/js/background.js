/* global chrome, commands */

chrome.commands.onCommand.addListener((command) => {
  switch (command) {
    case 'suspend_tab':
      commands.suspendTabCommand();
      break;
  }
});


let tabTimes = {};
const INACTIVE_LIMIT = 60 * 1000; // 1 sec

function checkInactiveTabs() {
    let inactiveLimit = INACTIVE_LIMIT; // 1 minutes
    let now = Date.now();

    chrome.tabs.query({ }, (tabs) => {
      for (let tab of tabs) {

        if (tab.url.includes('keep.google.com') && !tab.url.includes("chrome-extension")) {
          checkInactiveTab(tab)
        }
      }
    }
    );
}


function checkInactiveTab(tab) {
  if (tab.active === true) {
    tabTimes[tab.id] = Date.now();
  } else {
    let now = Date.now();
    let time = tabTimes[tab.id];
    let inactiveLimit = INACTIVE_LIMIT;

    if (now - time > inactiveLimit) {
      console.log(`Tab ${tab.url} is inactive for ${now - time} ms.`);
      suspend.suspend(tab)
    }
  
  }
}

// Check inactive tabs every minute
setInterval(checkInactiveTabs, INACTIVE_LIMIT );
