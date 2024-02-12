/* global chrome, commands */

chrome.commands.onCommand.addListener((command) => {
  switch (command) {
    case 'suspend_tab':
      commands.suspendTabCommand();
      break;
  }
});


const INACTIVE_LIMIT = 1 * 1000; // 1 sec

let d = {
  tab: null,
  time: null
}

async function checkInactiveTabs() {
  keeptab = await getKeepTab();
  if (keeptab) {
    d.tab = keeptab;
    checkInactiveTab(d.tab)
  }
  
}

function getKeepTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({}, (tabs) => {
      let keepTab = null;
      for (let tab of tabs) {
        if (isKeepTab(tab)) {
          keepTab = tab;
          break;
        }
      }
      resolve(keepTab);
    });
  });
}

chrome.tabs.onActivated.addListener(async activeInfo => {
  if (!d.tab){
    return;
  }
    if (String(d.tab.id) === String(activeInfo.tabId)) {
      unsuspend(d.tab);
    }
});

chrome.windows.onFocusChanged.addListener(function(windowId) {
  console.log(d)
  if (!d.tab) {
    return;
  }

  console.log(windowId, d.tab.windowId, d.tab.windowId === windowId)
  

  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    suspend(d.tab);
  }
  if (windowId === d.tab.windowId) {
    unsuspend(d.tab);
  }
});

function isKeepTab(tab) {
  return tab.url.includes('keep.google.com') && !tab.url.includes("chrome-extension")
}

function checkInactiveTab(tab) {
  if (tab.active === true) {
    d.time = Date.now();
  } else {
    let now = Date.now();
    let time = d.time;
    let inactiveLimit = INACTIVE_LIMIT;

    if (now - time > inactiveLimit) {
      console.log(`Tab ${tab.url} is inactive for ${now - time} ms.`);
      suspend(tab)
    }
  
  }
}

function suspend(tab) {
  const suspendUrl = `chrome-extension://${chrome.runtime.id}/tab.html`;
  chrome.tabs.update(tab.id, { url: `${suspendUrl}#url=${tab.url}` });
}

function unsuspend(tab) {
  const url = "https://keep.google.com/"
  chrome.tabs.update(tab.id, { url });
}

// Check inactive tabs every minute
setInterval(checkInactiveTabs, INACTIVE_LIMIT );
