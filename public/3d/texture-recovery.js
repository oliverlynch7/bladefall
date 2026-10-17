/* Bounded recovery; concurrent users share GLTFParser's source promise. */
export async function recoverTexture(primary,fallback,{wait=ms=>new Promise(r=>setTimeout(r,ms)),onRetry=()=>{},onFailure=()=>{}}={}){
 for(let attempt=0;attempt<3;attempt++){
  try{return await (attempt===2&&fallback?fallback:primary)();}
  catch(error){if(attempt===2){onFailure(error);throw error;}onRetry(error);await wait(120*(attempt+1));}
 }
}
