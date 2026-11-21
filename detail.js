import {state} from './state.js';
import {emit} from './events.js';
import {websiteRepo} from './storage.js';
import {$,esc,icon,icons,thumb,favicon} from './dom.js';
import {catName,catColor,webId} from './library.js';
import {statusOf,STATUSES} from './search.js';
import {formatDate} from './date.js';
export function openDetail(w){
  const rel=state.websites.filter(x=>x.id!==w.id&&(x.categoryId===w.categoryId||(x.tags||[]).some(t=>(w.tags||[]).includes(t)))).slice(0,4);
  const d=$('#detail'),st=statusOf(w);
  d.innerHTML=`<div class="detail" data-id="${esc(w.id)}" style="--accent:${catColor(w.categoryId)}"><button class="icon-btn close" data-close-detail aria-label="Close">${icon('x')}</button>
<div class="d-cover">${thumb(w)}</div><div class="d-body"><p class="kicker"><span class="idlabel">${webId(w)}</span><span class="dot"></span>${esc(catName(w.categoryId))}</p>
<h2>${esc(w.title)}</h2><a class="d-url" href="${esc(w.url)}" target="_blank" rel="noopener noreferrer" data-action="visit">${esc(w.url)}</a>
${w.description?`<p class="d-desc">${esc(w.description)}</p>`:''}${w.notes?`<h3>Personal notes</h3><p class="d-notes">${esc(w.notes)}</p>`:''}
<dl class="d-meta"><dt>Status</dt><dd><select id="d-status" aria-label="Visit status">${STATUSES.map(s=>`<option value="${s}" ${s===st?'selected':''}>${s[0].toUpperCase()+s.slice(1)}</option>`).join('')}</select></dd>
<dt>Tags</dt><dd>${(w.tags||[]).map(t=>'#'+esc(t)).join(' ')||'—'}</dd><dt>Date added</dt><dd>${formatDate(w.createdAt)}</dd><dt>Last visited</dt><dd>${w.lastVisitedAt?formatDate(w.lastVisitedAt):'Never'}</dd></dl>
${rel.length?`<h3>Related websites</h3><div class="d-rel">${rel.map(r=>`<button data-action="detail" data-id="${esc(r.id)}">${esc(r.title)}</button>`).join('')}</div>`:''}
<div class="d-acts"><a class="btn primary" href="${esc(w.url)}" target="_blank" rel="noopener noreferrer" data-action="visit">${icon('arrow-up-right')}Open website</a><button class="btn" data-action="edit">Edit</button><button class="btn" data-action="archive">Archive</button></div></div></div>`;
  if(!d.open)d.showModal();icons();
}
export function initDetail(){
  const d=$('#detail');
  d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-close-detail]'))d.close()});
  d.addEventListener('change',async e=>{if(e.target.id!=='d-status')return;
    try{await websiteRepo.update(d.querySelector('[data-id]').dataset.id,{status:e.target.value},false);emit('websites:changed',{msg:'Status updated'})}catch(err){alert(err.message)}});
}
