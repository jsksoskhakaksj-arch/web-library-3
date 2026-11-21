import {state} from './state.js';
import {icon,esc} from './dom.js';
import {renderSiteList} from './library.js';
const sec=(t,body,link='library')=>`<section class="section"><div class="sec-head"><h2>${t}</h2><a href="#/${link}">View all</a></div>${body}</section>`;
export function renderDashboard(root){
  const s=state.websites,h=new Date().getHours(),hi=h<12?'Good morning':h<18?'Good afternoon':'Good evening';
  const recent=[...s].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,4),favs=s.filter(w=>w.favorite);
  const seen=s.filter(w=>w.lastVisitedAt).sort((a,b)=>b.lastVisitedAt.localeCompare(a.lastVisitedAt)).slice(0,4);
  root.innerHTML=`<header class="hero"><p class="kicker-l">The Main Hall · ${hi}</p><h1 class="display">Welcome to your private library.</h1>
<p class="note" style="max-width:52ch;margin-bottom:28px">A quiet place to keep the websites worth returning to, shelved by category and ready to revisit.</p>
<div class="stats-inline"><span><b>${s.length}</b>websites</span><span><b>${state.collections.length}</b>collections</span><span><b>${state.categories.length}</b>categories</span><span><b>${favs.length}</b>favorites</span></div>
<button class="btn primary" data-action="add">${icon('plus')}Add website</button> <button class="btn" data-action="random">${icon('shuffle')}Random discovery</button></header>
${sec('Favorite Shelf',favs.length?renderSiteList(favs.slice(0,4),'grid'):'<p class="note">Star a website to place it on this shelf.</p>','favorites')}
${sec('Recently Added',recent.length?renderSiteList(recent,'grid'):'<p class="note">Nothing saved yet. Add your first website.</p>')}
${sec('Continue Exploring',seen.length?renderSiteList(seen,'grid'):'<p class="note">Websites you open will appear here.</p>')}
<section class="section"><div class="sec-head"><h2>Library Sections</h2><a href="#/categories">Index</a></div><p>${state.categories.map(c=>`<a class="chip" href="#/library" data-action="open-cat" data-cat="${esc(c.id)}">${esc(c.name)}</a>`).join(' ')}</p></section>`;
}
