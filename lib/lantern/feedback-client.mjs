export async function sendFeedbackWithTimeout(send,milliseconds=15000){
 const controller=new AbortController();let timer;
 try{return await Promise.race([send(controller.signal),new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('연결이 오래 걸리고 있어요. 다시 보내거나 그냥 나가도 괜찮아요.'))},milliseconds)})])}finally{clearTimeout(timer)}
}
