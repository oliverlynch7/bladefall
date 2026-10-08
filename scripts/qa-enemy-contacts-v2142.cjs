async page=>{
 await page.goto('http://127.0.0.1:4338/3d/animation-preview.html');
 const result=await page.evaluate(async()=>{
  const {upgradedTypes}=await import('./enemy-motion.js?v=2142');
  const {choreographyProfile,choreographyPose}=await import('./enemy-choreography.js?v=2142');
  const variants={prison_pike:['thrust'],prison_guard:['bash'],prison_hound:['rush'],
   prison_vessel:['ember'],prison_bell:['sweep','toll'],
   prison_maw:['rush','maul','crush'],prison_unbound:['cross','mark','toll'],
   colossus:['slam','sweep','vents'],marblecolossus:['hammer','sweep','fall']};
  const bad=[];let checked=0,largestSeam=0;
  for(const type of [...upgradedTypes,'colossus','marblecolossus']){
   for(const move of [null,...(variants[type]||[])]){
    if(!choreographyProfile(type,move)){bad.push(type+': missing '+move);continue;}
    const joins=[['Windup',1,'Attack',0],['Attack',1,'Recover',0]];
    for(const [left,lu,right,ru] of joins){
     const a=choreographyPose(type,left,lu,move),b=choreographyPose(type,right,ru,move);
     for(const key of new Set([...Object.keys(a),...Object.keys(b)]))for(let i=0;i<3;i++){
      const seam=Math.abs((a[key]?.[i]||0)-(b[key]?.[i]||0));
      largestSeam=Math.max(largestSeam,seam);
      if(seam>.001)bad.push(type+':'+move+' '+left+'→'+right+' '+key+' '+seam.toFixed(3));
     }
     checked++;
    }
   }
  }
  return {checked,largestSeam,bad};
 });
 if(result.bad.length)throw Error(JSON.stringify(result));
 return result;
}
