const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const feedUrl = 'https://news.google.com/rss/search?q=%22Nuzo%20Onoh%22&hl=en-GB&gl=GB&ceid=GB%3Aen';
const decode = value => value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&#(x[0-9a-f]+|\d+);/gi,(_,n)=>String.fromCodePoint(n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n))).replace(/&quot;/g,'"').replace(/&apos;|&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const tag = (xml,name) => decode(xml.match(new RegExp('<'+name+'(?:\\s[^>]*)?>([\\s\\S]*?)</'+name+'>','i'))?.[1] || '').trim();
async function run() {
 const response = await fetch(feedUrl,{signal:AbortSignal.timeout(20000)});
 if(!response.ok) throw new Error('RSS returned '+response.status);
 const xml=await response.text();
 const seen=new Set();
 const items=[...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(match=>{
  const item=match[1],source=tag(item,'source');let title=tag(item,'title');
  if(source && title.endsWith(' - '+source))title=title.slice(0,-source.length-3);
  const url=tag(item,'link'),published=Date.parse(tag(item,'pubDate'));
  return {title,source,url,published};
 }).filter(item=>{
   const key=item.title.toLowerCase().replace(/[^a-z0-9]/g,'');
   if(!item.title || !Number.isFinite(item.published) || item.published>Date.now()+86400000 || seen.has(key))return false;
   try {if(new URL(item.url).protocol!=='https:')return false;}catch{return false;}
   seen.add(key);return true;
 }).sort((a,b)=>b.published-a.published).slice(0,12).map(item=>({...item,published:new Date(item.published).toISOString(),image:'./assets/the-turning-of-sally-mae.png',imageAlt:'The Turning of Sally-Mae book cover'}));
 if(!items.length)throw new Error('No valid articles; existing news retained.');
 const file=path.join(root,'data','portfolio.json');const data=JSON.parse(fs.readFileSync(file,'utf8'));data.news=items;data.newsFeed={source:'Google News',url:feedUrl,updatedAt:new Date().toISOString()};fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');console.log('Updated '+items.length+' news links.');
}
run().catch(error=>{console.error(error.message);process.exitCode=1;});

