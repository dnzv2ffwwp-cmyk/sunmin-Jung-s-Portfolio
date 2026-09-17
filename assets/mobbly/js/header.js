const btnMenu = document.querySelector('.btn-menu');
const smartOverlayMenu = document.querySelector('.smart-overlay-menu');
const btnMenuClose = document.querySelector('.btn-menu-close');

// store previously focused element to restore focus after closing overlay
let _prevFocused = null;

// 스마트 디바이스 메뉴 열기 닫기 기능
if(btnMenu && smartOverlayMenu){
    btnMenu.addEventListener('click',()=>{
        _prevFocused = document.activeElement;
        smartOverlayMenu.classList.add('on');
        document.body.classList.add('overlay-open');
        btnMenu.setAttribute('aria-expanded','true');
        // focus first focusable inside overlay (close button if present)
        const firstFocusable = smartOverlayMenu.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if(firstFocusable) firstFocusable.focus();
        // attach keydown listener to trap Escape/Tab
        document.addEventListener('keydown', _overlayKeydown);
    });
}

if(btnMenuClose && smartOverlayMenu){
    btnMenuClose.addEventListener('click',()=>{
        _closeOverlay();
    });
}

// close overlay helper
function _closeOverlay(){
    if(!smartOverlayMenu) return;
    smartOverlayMenu.classList.remove('on');
    document.body.classList.remove('overlay-open');
    if(btnMenu) btnMenu.setAttribute('aria-expanded','false');
    // restore focus
    if(_prevFocused && typeof _prevFocused.focus === 'function') _prevFocused.focus();
    document.removeEventListener('keydown', _overlayKeydown);
}

const smartLists = document.querySelectorAll('.gnb-smart>li');
const gnb2depthSmarts = document.querySelectorAll('.gnb2depth-smart');

smartLists.forEach((li,idx)=>{
    li.addEventListener('click',(e)=>{
        if(idx===0){return}
        e.preventDefault();
        smartLists.forEach(litag=>litag.classList.remove('on'));
        li.classList.add('on');
        gnb2depthSmarts.forEach(div=>div.classList.remove('on'));
        gnb2depthSmarts[idx-1].classList.add('on');
    });
})

// close when clicking on overlay background (not content)
if(smartOverlayMenu){
    smartOverlayMenu.addEventListener('click', (e)=>{
        if(e.target === smartOverlayMenu){
            _closeOverlay();
        }
    });
}

// keydown handler to support Escape to close and basic focus trap
function _overlayKeydown(e){
    if(!smartOverlayMenu || !smartOverlayMenu.classList.contains('on')) return;
    if(e.key === 'Escape'){
        _closeOverlay();
        return;
    }
    if(e.key === 'Tab'){
        // simple focus trap within overlay
        const focusable = Array.from(smartOverlayMenu.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(el=>el.offsetParent !== null);
        if(focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length -1];
        if(e.shiftKey){
            if(document.activeElement === first){
                e.preventDefault();
                last.focus();
            }
        } else {
            if(document.activeElement === last){
                e.preventDefault();
                first.focus();
            }
        }
    }
}