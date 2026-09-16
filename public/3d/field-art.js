(function(root){'use strict';
function selected(g,quality){const items=[];if(g.beam)items.push({kind:'beam',value:g.beam});for(const value of g.collapse||[])items.push({kind:'collapse',value});for(const value of g.spikefields||[])items.push({kind:'spikes',value});for(const value of g.trails||[])if(value.dmg>0)items.push({kind:'trail',value});return items.slice(0,quality==='low'?2:6);}
function replaces(g,value,quality){return selected(g,quality).some(e=>e.value===value);}
function render(g,d){let count=0;const t=g.time||0;
function line(a,b,w,c,alpha=.8){d.ribbon(a,b,w,c,alpha);count++;}
for(const {kind,value:v} of selected(g,d.quality)){
 if(kind==='beam'){const pt=(a,r,y=7)=>[v.ex+Math.cos(a)*r,y,v.ez+Math.sin(a)*r],warn=v.warn>0,c=warn?'#e8be68':'#fff0c8';
 for(const sign of [-1,1])line(pt(v.ang,0),pt(v.ang+sign*.13,640),warn?1.1:2,c,warn?.5:.85);
 for(let i=0;i<8;i++)line(pt(v.ang-.13+i*.26/8,640),pt(v.ang-.13+(i+1)*.26/8,640),1.2,c,.65);
 line(pt(v.ang,0,10),pt(v.ang,640,10),warn?1:7,c,warn?.25:.8);
 if(!warn)for(let i=0;i<8;i++){const r=30+((i*78+t*190)%600);line(pt(v.ang-.07,r,9),pt(v.ang+.07,r+12,9),2,c,.5);}
 continue;}
 const y=(v.y||0)+5,r=v.r,c=kind==='spikes'?'#b6d8df':kind==='collapse'?'#ca87f4':v.col||'#ff8a3a';
 const pt=(a,rr,h=0)=>[v.x+Math.cos(a)*rr,y+h,v.z+Math.sin(a)*rr];
 const warn=v.warn>0,alpha=kind==='spikes'?Math.min(1,v.life/.5):.85;
 for(let i=0;i<20;i++)line(pt(i*Math.PI/10,r),pt((i+1)*Math.PI/10,r),1.3,c,alpha);
 if(kind==='spikes'){const rise=Math.min(1,(v.max-v.life)/.32);for(let i=0;i<10;i++){const a=i*2.39996,rr=r*Math.sqrt((i+.5)/10)*.8;line(pt(a,rr-4),pt(a,rr,20*rise),1.8,c,alpha);line(pt(a,rr,20*rise),pt(a,rr+4),1,c,alpha);}}
 else if(kind==='collapse'){for(let i=0;i<5;i++){const a=i*Math.PI*2/5,rr=warn?r*(.25+.5*(1-Math.min(1,v.warn))):r*.2;line(pt(a,r),pt(a+.25,r*.6),2,c,.8);line(pt(a+.25,r*.6),pt(a-.2,rr,warn?1:8),1.5,c,.65);}if(!warn)for(let i=0;i<5;i++)line(pt(i*1.256,r*.3,4),pt(i*1.256+.6,r*.3,18),2,c,.7);}
 else if(warn){const rr=r*Math.max(.05,1-v.warn/(v.warnMax||1));for(let i=0;i<20;i++)line(pt(i*Math.PI/10,rr),pt((i+1)*Math.PI/10,rr),1,c,.6);}
 else for(let i=0;i<10;i++){const a=i*2.39996,rr=r*Math.sqrt((i+.5)/10)*.75;line(pt(a,rr),pt(a+.15,rr,8+Math.sin(t*5+i)*4),2,c,.65);}
}
return count;}
root.BF_FIELD_ART={selected,replaces,render};
})(window);
