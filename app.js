import {state} from './state.js';
import {on,emit} from './events.js';
import {currentRoute,renderNav,navigate,ROUTES} from './router.js';
import {websiteRepo,categoryRepo,collectionRepo} from './storage.js';
import {$,$$,icon,icons,toast,initImageFallbacks} from './dom.js';
import {nowIso} from './date.js';
import {initTheme,setTheme} from './theme.js';
import {initDetail,openDetail} from './detail.js';
import {renderArchive,renderCollections,renderCategories,renderFavorites,renderSettings} from './pages.js';
import {loadView,saveView} from './view-toggle.js';
import {renderDashboard} from './dashboard.js';
import {renderLibrary,initLibrary,refreshResults} from './library.js';
import {initModal,openModal} from './website-modal.js';

const PAGES={home:renderDashboard,library:renderLibrary,collections:renderCollections,categories:renderCategories,favorites:renderFavorites,settings:renderSettings,archive:renderArchive};
function render(){const r=state.ui.route=currentRoute();renderNav(r);PAGES[r]($('#view'));$('#side-foot').textContent=`${state.websites.length} websites · ${state.archived.length} archived`;icons()}
async function load(){
  const [all,cats,cols]=await Promise.all([websiteRepo.list(),categoryRepo.list(),collectionRepo.list()]);
  state.websites=all.filter(w=>!w.archived);state.archived=all.filter(w=>w.archived);state.categories=cats;state.collections=cols;
}
const closeMenus=()=>$$('.menu:not([hidden])').forEach(m=>{m.hidden=true;m.previousElementSibling?.setAttribute('aria-expanded','false')});

document.addEventListener('click',async e=>{
  const el=e.target.closest('[data-action]');
  if(!el)return closeMenus();
  const {action}=el.dataset,id=el.closest('[data-id]')?.dataset.id,site=[...state.websites,...state.archived].find(w=>w.id===id);
  if(['edit','archive','delete'].includes(action))$('#detail').open&&$('#detail').close();
  if(action==='menu'){const m=el.nextElementSibling,open=m.hidden;closeMenus();m.hidden=!open;el.setAttribute('aria-expanded',open);return}
  closeMenus();
  try{
    if(action==='add')openModal();
    else if(action==='edit'&&site)openModal(site);
    else if(action==='fav'&&site){await websiteRepo.update(id,{favorite:!site.favorite},false);emit('websites:changed')}
    else if(action==='archive'&&site){await websiteRepo.update(id,{archived:true},false);emit('websites:changed',{msg:'Moved to archive'})}
    else if(action==='restore'&&site){await websiteRepo.update(id,{archived:false},false);emit('websites:changed',{msg:'Restored to library'})}
    else if(action==='purge'&&site&&confirm(`Permanently delete "${site.title}"? This cannot be undone.`)){await websiteRepo.remove(id);emit('websites:changed',{msg:'Deleted permanently'})}
    else if(action==='detail'&&site)openDetail(site)
    else if(action==='random'&&state.websites.length)openDetail(state.websites[Math.floor(Math.random()*state.websites.length)])
    else if(action==='import')$('#import-file').click()
    else if(action==='delete'&&site&&confirm(`Delete "${site.title}"? This cannot be undone.`)){await websiteRepo.remove(id);emit('websites:changed',{msg:'Website deleted'})}
    else if(action==='visit'&&site){const st=site.status||'unvisited';site.lastVisitedAt=nowIso();site.status=st==='unvisited'?'visited':st;websiteRepo.update(id,{lastVisitedAt:site.lastVisitedAt,status:site.status},false).catch(()=>{})}
    else if(action==='open-cat'){state.ui.category=el.dataset.cat;state.ui.favOnly=false}
    else if(action==='set-theme'){setTheme(el.dataset.v);render()}
    else if(action==='set-view'){state.ui.view=el.dataset.v;saveView(el.dataset.v);render()}
    else if(action==='export'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({websites:state.websites,categories:state.categories,collections:state.collections},null,2)],{type:'application/json'}));a.download='web-library-export.json';a.click();URL.revokeObjectURL(a.href)}
    else if(action==='show-favs'){state.ui.favOnly=true;navigate('library')}
  }catch(err){alert(err.message)}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenus()});
on('websites:changed',async e=>{await load();render();if(e.detail?.msg)toast(e.detail.msg)});
document.addEventListener('change',async e=>{if(e.target.id!=='import-file'||!e.target.files[0])return;try{const d=JSON.parse(await e.target.files[0].text()),n=await websiteRepo.merge(d.websites);emit('websites:changed',{msg:`${n} websites imported`})}catch{toast('Could not read that file')}});
window.addEventListener('hashchange',render);

let timer;
$('#search').addEventListener('input',e=>{
  clearTimeout(timer);timer=setTimeout(()=>{state.ui.query=e.target.value;currentRoute()==='library'?refreshResults():navigate('library')},150);
});
(async function init(){
  initImageFallbacks();initTheme();initModal();initDetail();initLibrary();state.ui.view=loadView();
  await load();render();
})();
