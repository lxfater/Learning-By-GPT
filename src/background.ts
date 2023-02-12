import Browser from 'webextension-polyfill'








Browser.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener(async (msg) => {
      console.debug('received msg', msg)
    })
})