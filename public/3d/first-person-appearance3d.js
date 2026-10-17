/* Hide renderables, never bones/parents: attached weapons keep their normal pose. */
export function weaponOnly(root){
 const hidden=[];
 root.traverse(node=>{
  if(!node.visible||!(node.isMesh||node.isSprite||node.isPoints||node.isLine))return;
  for(let p=node;p&&p!==root;p=p.parent){
   if(p.userData?._weap||(p.isBone&&/^weapon[lr]$/i.test(p.name.replace(/[^a-z]/gi,''))))return;
  }
  hidden.push(node);node.visible=false;
 });
 return ()=>{for(const node of hidden)node.visible=true;};
}
