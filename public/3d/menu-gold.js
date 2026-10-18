/* Spending screens opt in explicitly; never infer a wallet from button text. */
(function(root){'use strict';
let current=null;
function amount(value){return (Number.isFinite(value)?Math.max(0,Math.floor(value)):0).toLocaleString();}
function refresh(){
 if(!current)return;if(!current.host.isConnected){current=null;return;}
 const text=amount(current.read(current.kind));
 if(current.output.textContent!==text){current.output.textContent=text;current.output.setAttribute('aria-label',current.label+': '+text+' gold');}
}
function mount(container,read){
 current=null;const host=container?.querySelector('.card[data-menu-wallet]');if(!host)return;
 let wallet=[...host.children].find(el=>el.hasAttribute('data-menu-gold'));
 const kind=host.dataset.menuWallet==='dungeon'?'dungeon':'campaign',label=kind==='dungeon'?'Dungeon gold':'Your gold';
 if(!wallet){
  wallet=document.createElement('div');wallet.className='menu-wallet';wallet.setAttribute('data-menu-gold','');
  const coin=document.createElement('span');coin.className='ico ico-coin';coin.setAttribute('aria-hidden','true');
  const title=document.createElement('span');title.className='menu-wallet-label';title.textContent=label;
  const output=document.createElement('output');output.setAttribute('aria-live','polite');output.setAttribute('aria-atomic','true');
  wallet.append(coin,title,output);
  const heading=host.querySelector('h2,h1'),anchor=heading?.closest('header')||heading;
  if(anchor&&anchor.parentElement===host)anchor.after(wallet);else host.prepend(wallet);
 }
 current={host,kind,label,read,output:wallet.querySelector('output')};refresh();
}
root.BFMenuGold={mount,refresh,amount};
if(typeof module!=='undefined')module.exports={mount,refresh,amount};
})(typeof window!=='undefined'?window:globalThis);
