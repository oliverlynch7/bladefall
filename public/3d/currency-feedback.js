(()=>{'use strict';let node,timer;
function show(amount,title='Coins collected'){
 if(!(amount>0))return;if(!node){node=document.createElement('aside');node.id='goldReward';node.setAttribute('role','status');node.style.cssText='position:fixed;z-index:92;pointer-events:none;width:242px;box-sizing:border-box;padding:10px 13px;border:1px solid #cfac5c;border-radius:11px;background:linear-gradient(135deg,#352e1e,#151e27);color:#f2dfac;font:13px system-ui;box-shadow:0 5px 20px #0008';document.body.append(node);}
 node.replaceChildren();const gain=document.createElement('strong');gain.style.cssText='display:block;font-size:23px;color:#ffe296';gain.textContent='+'+Math.round(amount).toLocaleString()+' gold';const label=document.createElement('span');label.textContent=title;node.append(gain,label);
 const bag=document.getElementById('inventoryDock')?.getBoundingClientRect(),loot=document.getElementById('lootcard')?.getBoundingClientRect();const anchor=loot?.height?Math.min(loot.top,bag?.top||innerHeight):bag?.top||innerHeight-90;
 node.style.left=Math.max(12,bag?.left||16)+'px';node.style.top=Math.max(16,anchor-82)+'px';node.hidden=false;node.animate?.([{transform:'translateY(8px)',opacity:0},{transform:'translateY(0)',opacity:1}],{duration:190});const total=document.getElementById('hudGold');total?.animate?.([{filter:'brightness(2)'},{filter:'brightness(1)'}],{duration:650});clearTimeout(timer);timer=setTimeout(()=>node.hidden=true,3200);
}
window.BFCurrencyFeedback={show};})();
