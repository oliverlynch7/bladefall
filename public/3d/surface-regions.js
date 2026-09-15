// Claim disjoint rectangles before emitting coplanar scenery. Collision stays unchanged.
export function claimSurface(ledger,o,key='ground'){
  const prior=ledger.get(key)||[];ledger.set(key,prior);
  let pieces=[{a:o.x-o.w/2,b:o.x+o.w/2,c:o.z-o.d/2,d:o.z+o.d/2}];
  for(const old of prior)pieces=pieces.flatMap(p=>{
    const a=Math.max(p.a,old.a),b=Math.min(p.b,old.b),c=Math.max(p.c,old.c),d=Math.min(p.d,old.d);
    if(a>=b||c>=d)return[p];
    return[{a:p.a,b:a,c:p.c,d:p.d},{a:b,b:p.b,c:p.c,d:p.d},{a,b,c:p.c,d:c},{a,b,c:d,d:p.d}].filter(q=>q.b-q.a>.01&&q.d-q.c>.01);
  });
  prior.push(...pieces);
  return pieces.map(p=>({...o,x:(p.a+p.b)/2,z:(p.c+p.d)/2,w:p.b-p.a,d:p.d-p.c}));
}
