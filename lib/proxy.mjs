const wallet=/^0x[0-9a-fA-F]{40}$/;
export function upstream(params){
 const kind=params.get('kind'); let path; const q=new URLSearchParams();
 const allowed=kind==='leaderboard'?['kind','timePeriod','orderBy','category']:['kind','user'];
 for(const key of params.keys())if(!allowed.includes(key)||params.getAll(key).length!==1)throw Error('Invalid query parameter');
 const choose=(name,values,fallback)=>{const v=params.get(name)||fallback;if(!values.includes(v))throw Error(`Invalid ${name}`);q.set(name,v)};
 if(kind==='leaderboard'){path='/v1/leaderboard';choose('timePeriod',['DAY','WEEK','MONTH','ALL'],'MONTH');choose('orderBy',['PNL','VOL'],'PNL');choose('category',['OVERALL','POLITICS','SPORTS','CRYPTO','CULTURE','ECONOMICS','TECH','FINANCE'],'OVERALL');q.set('limit','50');}
 else if(['positions','activity','closed'].includes(kind)){const user=params.get('user');if(!wallet.test(user||''))throw Error('Enter a valid public wallet address');q.set('user',user.toLowerCase());q.set('limit','100');path=kind==='closed'?'/closed-positions':`/${kind}`;if(kind==='positions'){q.set('sizeThreshold','0');q.set('sortBy','CURRENT');q.set('sortDirection','DESC')}if(kind==='activity'){q.set('sortBy','TIMESTAMP');q.set('sortDirection','DESC')}}
 else throw Error('Unknown data request');
 return `https://data-api.polymarket.com${path}?${q}`;
}
const cache=new Map();
export async function getData(params,fetcher=fetch){const url=upstream(params);const hit=cache.get(url);if(hit&&Date.now()-hit.at<45000)return hit.value;
 const response=await fetcher(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(10000),redirect:'error'});
 if(!response.ok)throw Error(`Polymarket is unavailable (${response.status}). Try again shortly.`);
 const raw=await readBounded(response);let rows;try{rows=JSON.parse(raw)}catch{throw Error('Polymarket returned an unreadable response')}
 rows=validateRows(params.get('kind'),rows);
 const value={rows,fetchedAt:new Date().toISOString(),source:url};cache.set(url,{at:Date.now(),value});if(cache.size>200)cache.delete(cache.keys().next().value);return value;
}

export async function readBounded(response,limit=2000000){
 const length=response.headers.get('content-length');
 if(length!==null&&Number(length)>limit){await response.body?.cancel();throw Error('Upstream response exceeds limit')}
 if(!response.body)throw Error('Polymarket returned an unreadable response');
 const reader=response.body.getReader(),decoder=new TextDecoder();let bytes=0,raw='';
 try{while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>limit){await reader.cancel();throw Error('Upstream response exceeds limit')}raw+=decoder.decode(value,{stream:true})}return raw+decoder.decode()}
 finally{reader.releaseLock()}
}
export function validateRows(kind,rows){
 const bad=()=>{throw Error('Polymarket response format changed')};
 if(!Array.isArray(rows)||rows.length>(kind==='leaderboard'?50:100))bad();
 const text=(value,optional=false)=>{if(optional&&(value===undefined||value===null))return '';if(typeof value!=='string'||value.length>10000)bad();return value};
 const number=value=>{if((typeof value!=='number'&&typeof value!=='string')||(typeof value==='string'&&value.trim()==='')||!Number.isFinite(Number(value)))bad();return Number(value)};
 return rows.map(r=>{if(!r||typeof r!=='object'||Array.isArray(r))bad();
  if(kind==='leaderboard'){if(typeof r.proxyWallet!=='string'||!wallet.test(r.proxyWallet))bad();const rank=number(r.rank);if(!Number.isInteger(rank)||rank<1)bad();return{rank:String(rank),proxyWallet:r.proxyWallet.toLowerCase(),userName:text(r.userName,true),vol:number(r.vol),pnl:number(r.pnl)}}
  if(kind==='positions')return{title:text(r.title),outcome:text(r.outcome),currentValue:number(r.currentValue),cashPnl:number(r.cashPnl)};
  if(kind==='closed')return{title:text(r.title),outcome:text(r.outcome),realizedPnl:number(r.realizedPnl),avgPrice:number(r.avgPrice)};
  if(kind==='activity'){const timestamp=number(r.timestamp);if(!Number.isSafeInteger(timestamp)||timestamp<0)bad();const type=text(r.type);if(!type)bad();return{timestamp,type,usdcSize:number(r.usdcSize),title:text(r.title,true),side:text(r.side,true),outcome:text(r.outcome,true),transactionHash:text(r.transactionHash),asset:text(r.asset,true),conditionId:text(r.conditionId,true),size:number(r.size),price:number(r.price)}}
  bad();
 });
}
