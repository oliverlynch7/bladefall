// Always record a two-channel stream. Speaker upmix puts mono in both ears.
export function stereoGraph(context,input,center=false){
 const destination=context.createMediaStreamDestination();destination.channelCount=2;destination.channelCountMode='explicit';destination.channelInterpretation='speakers';
 const source=context.createMediaStreamSource(input),nodes=[source,destination];
 if(center){const mono=context.createGain();mono.channelCount=1;mono.channelCountMode='explicit';mono.channelInterpretation='speakers';source.connect(mono);mono.connect(destination);nodes.push(mono);}else source.connect(destination);
 return {stream:destination.stream,disconnect(){for(const n of nodes)n.disconnect();for(const t of destination.stream.getTracks())t.stop();}};
}
export async function openStereoCapture(center=false){
 const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('Stereo recording is unavailable in this browser. Please use another browser or upload a stereo file.');
 const context=new Audio(),resume=context.resume();let input,graph;
 try{await resume;input=await navigator.mediaDevices.getUserMedia({audio:{channelCount:{ideal:2},echoCancellation:false,noiseSuppression:false,autoGainControl:false},video:false});graph=stereoGraph(context,input,center);const count=input.getAudioTracks()[0]?.getSettings?.().channelCount;
  return {input,stream:graph.stream,label:center?'Stereo file · voice centered in both ears':count===1?'Stereo file · mono microphone copied to both ears':count===2?'Stereo file · microphone left and right preserved':'Stereo file · two output channels',async close(){graph.disconnect();for(const t of input.getTracks())t.stop();await context.close();}};
 }catch(e){graph?.disconnect();for(const t of input?.getTracks()||[])t.stop();await context.close();throw e;}
}
