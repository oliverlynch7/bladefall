/* Approved artwork: source selections and crops are recorded in assets/source/ui-icons-2026-09-29. */
window.BFUIIcons=(()=>{
const names=new Set(["destination-storm-coast", "destination-rift-hall", "destination-waystation", "item-rift-shard", "journal", "action-party-teleport", "action-allocate-stats", "action-class-appearance", "voyage-helm", "voyage-hull", "voyage-repair", "voyage-boarders", "voyage-swap-roles", "voyage-ready", "quest-main", "quest-side", "quest-hunt", "journal-clue", "quest-puzzle", "quest-item", "settings-controls", "settings-graphics", "settings-audio-voices", "settings-accessibility", "settings-help", "emote-wave", "emote-point", "emote-cheer", "emote-bow", "emote-dance", "equipment-pirate", "equipment-monk", "equipment-reaper", "destination-briar-town", "destination-frostfell", "destination-sunspire", "destination-emberdeep"]);
const url=name=>names.has(name)?'icons/ui/'+name+'.png':'';
const html=name=>names.has(name)?`<img class="bf-ui-icon" data-icon="${name}" src="${url(name)}" alt="" aria-hidden="true" width="32" height="32">`:'';
const destinations={outskirts:'briar-town',frost:'frostfell',ember:'emberdeep',abyss:'storm-coast',palace:'sunspire'};
const destination=id=>destinations[id]?url('destination-'+destinations[id]):'icons/destinations/'+id+'.png';
const style=document.createElement('style');style.textContent='.bf-ui-icon{display:inline-block;width:32px;height:32px;object-fit:contain;vertical-align:middle;flex-shrink:0;pointer-events:none;margin-right:6px}.bf-ui-icon[hidden]{display:none}.emote-disc .bf-ui-icon{width:44px;height:44px;margin:0}.journal-task .bf-ui-icon,.journal-clue .bf-ui-icon{width:25px;height:25px}#voyagehud .bf-ui-icon{width:27px;height:27px}';document.head.append(style);
return {url,html,destination,names:[...names]};
})();
