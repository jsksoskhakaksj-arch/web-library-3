export const STATUSES=['unvisited','visited','reading','completed'];
export const statusOf=w=>STATUSES.includes(w.status)?w.status:(w.lastVisitedAt?'visited':'unvisited');
export function filterSites(sites,ui,cats){
  const q=ui.query.trim().toLowerCase(),cn=Object.fromEntries(cats.map(c=>[c.id,c.name]));
  const r=sites.filter(w=>(ui.category==='all'||w.categoryId===ui.category)&&(!ui.favOnly||w.favorite)&&(ui.tag==='all'||(w.tags||[]).includes(ui.tag))&&(ui.status==='all'||statusOf(w)===ui.status)&&
    (!q||[w.title,w.url,w.description,(w.tags||[]).join(' '),w.notes||'',cn[w.categoryId]||''].join(' ').toLowerCase().includes(q)));
  const [k,d]=ui.sort.split('-');
  r.sort((a,b)=>{const c=k==='name'?a.title.localeCompare(b.title):a.createdAt.localeCompare(b.createdAt);return d==='desc'?-c:c});
  return r;
}
