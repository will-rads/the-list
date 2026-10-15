import assert from 'node:assert/strict';
import {chromium} from '../../web/node_modules/playwright/index.mjs';
const browser=await chromium.launch({headless:true,channel:'chrome'});
try{
 const page=await browser.newPage();const errors=[];const writes=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))writes.push(r.url());});
 await page.goto('http://127.0.0.1:5180/');await page.evaluate(()=>document.fonts.ready);
 const choose=async(role,screen)=>{await page.locator('#role').selectOption(role);await page.locator('#screen').selectOption(screen);};
 const fit=async(label)=>{const size=await page.evaluate(()=>({root:document.documentElement.scrollWidth,w:innerWidth,h:innerHeight,rootH:document.documentElement.scrollHeight,content:document.querySelector('#content').scrollWidth,cw:document.querySelector('#content').clientWidth}));assert(size.root<=size.w+1&&size.rootH<=size.h+1&&size.content<=size.cw+1,`${label}: overflow ${JSON.stringify(size)}`);};
 let screens=0;
 for(const [width,height] of [[1100,1000],[390,844],[320,568]]){
  await page.setViewportSize({width,height});
  for(const role of ['member','venue','public','founder']){
   await page.locator('#role').selectOption(role);
   const options=await page.locator('#screen option').evaluateAll(els=>els.map(e=>e.value));
   for(const s of options){await page.locator('#screen').selectOption(s);await fit(`${width} ${role}/${s}`);assert((await page.locator('#content').innerText()).trim().length>0,`${role}/${s}: empty screen`);screens++;}
  }
 }
 await page.setViewportSize({width:390,height:844});
 await choose('member','explore');await page.getByLabel('Search events').fill('nothing matches');await page.getByText('No matches',{exact:true}).waitFor();await page.getByRole('button',{name:'Clear filters',exact:true}).click();
 await page.getByRole('button',{name:/Sat 10 Oct.*Sunset Pool Day/}).click();await page.getByRole('button',{name:'Apply for a spot',exact:true}).click();await page.getByText('Your request is with the venue.').waitFor();
 await choose('venue','requests');await page.getByRole('button',{name:'Pick Sara',exact:true}).click();
 await choose('member','invites');await page.getByRole('button',{name:/Sunset Pool Day.*Picked/}).click();await page.getByRole('button',{name:'Confirm my spot',exact:true}).click();await page.getByText('TL-072',{exact:false}).waitFor();
 await choose('venue','door');await page.getByRole('button',{name:'Check in',exact:true}).click();await page.getByText('Inside',{exact:true}).last().waitFor();
 await choose('member','story');await page.getByLabel('Story screenshot').setInputFiles({name:'sample.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jXioAAAAASUVORK5CYII=','base64')});await page.getByRole('button',{name:'Submit proof',exact:true}).click();
 await choose('founder','stories');await page.getByText('Sara Khoury · Sunset Pool Day').first().waitFor();await page.getByRole('button',{name:'Verify Story',exact:true}).click();await choose('member','story');await page.getByRole('button',{name:'Story verified',exact:true}).waitFor();
 await choose('venue','create');await page.getByLabel('Event name',{exact:true}).fill('Friday Social');await page.getByLabel('What’s included',{exact:true}).fill('Dinner, music and a reserved table.');await page.getByRole('button',{name:'Review event',exact:true}).click();await page.getByRole('button',{name:'Publish sample event',exact:true}).click();await page.locator('#header').getByText('Friday Social').waitFor();
 await choose('member','join');await page.getByLabel('Full name',{exact:true}).fill('Sample Member');await page.getByLabel('Email',{exact:true}).fill('sample@example.com');await page.getByLabel('Instagram handle',{exact:true}).fill('sample.member');await page.getByRole('button',{name:'Continue',exact:true}).click();await page.getByLabel('Six digit code').fill('123456');await page.getByRole('button',{name:'Verify sample code',exact:true}).click();await choose('founder','members');await page.getByRole('button',{name:'Approve access',exact:true}).click();await choose('member','pending');await page.locator('#header').getByText('You’re on the list').waitFor();
 await page.setViewportSize({width:1100,height:1000});
 for(const m of ['black','light']){await page.locator('#mode').click();if(await page.evaluate(()=>document.body.dataset.theme)!==m)throw new Error(`mode ${m}`);await page.evaluate(()=>document.fonts.ready);await choose('member','profile');await fit(`mode ${m}`);}
 await page.locator('#scene').selectOption('error');await page.getByRole('button',{name:'Try again',exact:true}).click();await page.locator('#scene').selectOption('empty');await page.getByRole('button',{name:'Show sample content',exact:true}).click();
 assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
 await choose('member','home');await page.getByRole('button',{name:'Rooftop Sessions Confirmed · Show your pass',exact:true}).click();await choose('venue','guests');assert.equal(await page.getByText('Maya Nassar',{exact:true}).count(),0);
 await choose('member','story');await page.getByText('Proof due',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Reset sample data',exact:true}).click();await page.locator('#toast').waitFor({state:'hidden'});
 if(process.env.QA_SCREENSHOT){await page.screenshot({path:process.env.QA_SCREENSHOT});await page.setViewportSize({width:390,height:844});await page.screenshot({path:process.env.QA_SCREENSHOT.replace('.png','-mobile.png')});await choose('venue','requests');await page.screenshot({path:process.env.QA_SCREENSHOT.replace('.png','-requests.png')});await choose('venue','create');await page.screenshot({path:process.env.QA_SCREENSHOT.replace('.png','-create.png')});}
 console.log(`Passed ${screens} screen/viewport combinations, full apply-to-Story loop, event publishing, onboarding/approval, fonts, states and zero network writes.`);
}finally{await browser.close();}
