import React from 'react';
import { createRoot } from 'react-dom/client';
import { supabaseClient } from '../client.js';
const { useState, useRef, useEffect, useCallback } = React;


  // === COPIED VERBATIM from index.html: IMG, Icon + HICONS ===

  /* ========== curated imagery ========== */
  const IMG = {
    beachClub:  "../assets/pool-day.jpg",
    pool:       "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80&auto=format&fit=crop",
    rooftop:    "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=900&q=80&auto=format&fit=crop",
    restaurant: "https://images.unsplash.com/photo-1592861956120-e524fc739696?w=900&q=80&auto=format&fit=crop",
    club:       "https://images.unsplash.com/photo-1545128485-c400e7702796?w=900&q=80&auto=format&fit=crop",
    clubRed:    "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=900&q=80&auto=format&fit=crop",
    gym:        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80&auto=format&fit=crop",
    lounge:     "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80&auto=format&fit=crop",
    cocktail:   "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=900&q=80&auto=format&fit=crop",
    beirut:     "https://images.unsplash.com/photo-1620553967747-50fdadc4b606?w=1200&q=80&auto=format&fit=crop",
    saraFull:   "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&q=80&auto=format&fit=crop",
  };

  /* Applicant portraits – people, not venues. Unsplash, editorial quality. */
  const FACE = {
    sara:    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&q=80&auto=format&fit=crop",
    lina:    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&q=80&auto=format&fit=crop",
    maya:    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&q=80&auto=format&fit=crop",
    nour:    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=900&q=80&auto=format&fit=crop",
    yasmine: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&q=80&auto=format&fit=crop",
    karim:   "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&q=80&auto=format&fit=crop",
    rami:    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&q=80&auto=format&fit=crop",
    tala:    "https://images.unsplash.com/photo-1517841905260-fc24eaa86c50?w=900&q=80&auto=format&fit=crop",
  };

  /* ========== Icon helper (Heroicons, inline) ==========
     Heroicons outline, inlined as SVG so there's no icon CDN dependency at all.
     Closest free stand-in for SF Symbols, which the SwiftUI build will use.
     Call sites keep their lucide-style names; we map to Heroicon glyphs here.
     `stroke` drives stroke-width (Heroicons outline is 1.5 by default).
     instagram has no Heroicon (no brand glyphs) so it's a small custom mark.
  ====================================================== */
  const HICONS = {
    "battery-full": '<path stroke-linecap="round" stroke-linejoin="round" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M4.5 10.5H18V15H4.5v-4.5ZM3.75 18h15A2.25 2.25 0 0 0 21 15.75v-6a2.25 2.25 0 0 0-2.25-2.25h-15A2.25 2.25 0 0 0 1.5 9.75v6A2.25 2.25 0 0 0 3.75 18Z"/>',
    "sparkle": '<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"/>',
    "compass": '<path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"/>',
    "bookmark": '<path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"/>',
    "bookmark-fill": '<path fill="currentColor" stroke="none" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z"/>',
    "link": '<path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/>',
    "paper-plane": '<path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"/>',
    "bell": '<path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"/>',
    "user": '<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/>',
    "search": '<path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>',
    "arrow-right": '<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/>',
    "arrow-left": '<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/>',
    "sliders-horizontal": '<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"/>',
    "x": '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/>',
    "share": '<path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"/>',
    "map-pin": '<path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>',
    "check": '<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/>',
    "calendar": '<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/>',
    "settings": '<path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>',
    "instagram": '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/>',
    "sparkles": '<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"/>',
    "tiktok": '<path stroke-linecap="round" stroke-linejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553z"/>',
    "home": '<path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>',
    "plus": '<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>',
    "magnifying-glass": '<path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>',
    "users": '<path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/>',
    "building-storefront": '<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.999 2.999 0 0 0 4.5 0A3.001 3.001 0 0 0 20.25 9c.896 0 1.7-.393 2.25-1.015m-18 0A2.993 2.993 0 0 1 3.75 6.75v-.265M21.75 9c.343-.36.59-.808.71-1.299a3 3 0 0 0-.21-2.183l-1.135-2.27A1.5 1.5 0 0 0 19.5 2.25h-15a1.5 1.5 0 0 0-1.382.918L1.04 5.55a3 3 0 0 0-.17 2.133c.124.49.37.937.71 1.298"/>',
  };
  function Icon({ name, size=18, stroke=1.5, className="" }){
    const inner = HICONS[name] || HICONS["sparkle"];
    return (
      <svg className={"inline-block "+className} width={size} height={size}
           viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}
           aria-hidden="true" style={{flexShrink:0}}
           dangerouslySetInnerHTML={{__html: inner}}/>
    );
  }

  // Transient toast inside the app surface.
  // Gives minor controls a visible reply.
  function Toast({ msg }){
    // The live region stays mounted so screen readers announce each new message.
    return (
      <div role="status" aria-live="polite" className="absolute left-0 right-0 flex justify-center z-[65] pointer-events-none" style={{bottom:"calc(env(safe-area-inset-bottom, 0px) + 104px)"}}>
        {msg && <div key={msg} className="anim-up px-4 py-2.5 rounded-full glass-over-image text-[13px] flex items-center gap-2" style={{maxWidth:"82%"}}>
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:"var(--ice)"}}/>
          <span>{msg}</span>
        </div>}
      </div>
    );
  }

  // Renders an image cropped to a fixed aspect frame using a stored transform.
  // value: { src, scale, x, y } | null. ratio: e.g. "4/5". Empty state when null.
  function FramedImage({ value, ratio="4/5", className="", empty="No image", radius }){
    return (
      <div className={"relative overflow-hidden rounded-[14px] "+className}
           style={{aspectRatio:ratio, background:"var(--bg-elev)", ...(radius != null ? {borderRadius:radius} : {})}}>
        {value && value.src ? (
          <img src={value.src} alt="" draggable={false}
            style={{position:"absolute", left:"50%", top:"50%",
                    transform:`translate(-50%,-50%) translate(${value.x||0}px,${value.y||0}px) scale(${value.scale||1})`,
                    maxWidth:"none", minWidth:"100%", minHeight:"100%", userSelect:"none"}}/>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center stamp" style={{color:"var(--ink-mute)"}}>{empty}</div>
        )}
      </div>
    );
  }

  // Pick a local file, drag + zoom inside a fixed-aspect frame, return its transform.
  function ImageCropper({ ratio="4/5", value, onChange, onCancel, label="Position your image" }){
    const [src, setSrc]   = useState(value?.src || null);
    const [scale, setScale] = useState(value?.scale || 1);
    const [pos, setPos]   = useState({ x: value?.x || 0, y: value?.y || 0 });
    const drag = useRef(null);
    const fileRef = useRef(null);
    const frameRef = useRef(null);

    const pick = (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => { setSrc(r.result); setScale(1); setPos({x:0,y:0}); };
      r.readAsDataURL(f);
    };
    const onDown = (e) => { const p = e.touches?e.touches[0]:e; drag.current = { x:p.clientX-pos.x, y:p.clientY-pos.y }; };
    const onMove = (e) => { if(!drag.current) return; const p = e.touches?e.touches[0]:e;
                            setPos({ x:p.clientX-drag.current.x, y:p.clientY-drag.current.y }); };
    const onUp   = () => { drag.current = null; };

    return (
      <div className="flex flex-col gap-4">
        <div className="stamp" style={{color:"var(--ink-mute)"}}>{label}</div>
        <div ref={frameRef} className="relative overflow-hidden rounded-[14px] mx-auto w-full"
             style={{aspectRatio:ratio, background:"var(--bg-elev)", touchAction:"none"}}
             onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
             onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}>
          {src ? (
            <img src={src} alt="" draggable={false}
              style={{position:"absolute", left:"50%", top:"50%",
                      transform:`translate(-50%,-50%) translate(${pos.x}px,${pos.y}px) scale(${scale})`,
                      maxWidth:"none", minWidth:"100%", minHeight:"100%", userSelect:"none"}}/>
          ) : (
            <button onClick={()=>fileRef.current.click()}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <Icon name="plus" size={28} stroke={1.4}/>
              <span className="stamp">Choose a file</span>
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={pick} style={{display:"none"}}/>
        {src && (
          <div className="flex items-center gap-3">
            <Icon name="magnifying-glass" size={16}/>
            <input type="range" min="1" max="3" step="0.01" value={scale} aria-label="Zoom"
                   onChange={e=>setScale(parseFloat(e.target.value))} className="flex-1 h-11"/>
            <button onClick={()=>fileRef.current.click()} className="press min-h-[44px] px-4 rounded-full text-[13px] font-medium" style={{border:"1px solid var(--line-2)", color:"var(--ink)"}}>Choose another photo</button>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onCancel} className="press flex-1 h-[52px] rounded-full text-[12px] font-medium"
                  style={{border:"1px solid var(--line-2)", color:"var(--ink)"}}>Cancel</button>
          <button disabled={!src} onClick={()=>onChange({ src, scale, x:pos.x, y:pos.y, frameW: frameRef.current ? frameRef.current.clientWidth : null })}
                  className="press flex-1 h-[52px] rounded-full text-[12px] font-semibold"
                  style={{background: src?"var(--ice)":"var(--bg-elev2)", color: src?"var(--ice-ink)":"var(--ink-mute)"}}>
            Use this
          </button>
        </div>
      </div>
    );
  }

  function loadBrowserImage(src){
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Could not read that image"));
      image.crossOrigin = "anonymous";
      image.src = src;
    });
  }

  async function bakeCroppedJpeg(value){
    if (!value?.src) return null;
    const image = await loadBrowserImage(value.src);
    const frameW = Math.max(1, Number(value.frameW) || 320);
    const frameH = frameW * 5 / 4;
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    const outputScale = canvas.width / frameW;
    const imageScale = Math.max(.5, Number(value.scale) || 1);
    const coverScale = Math.max(frameW / image.naturalWidth, frameH / image.naturalHeight);
    const baseWidth = image.naturalWidth * coverScale;
    const baseHeight = image.naturalHeight * coverScale;
    const drawWidth = baseWidth * imageScale * outputScale;
    const drawHeight = baseHeight * imageScale * outputScale;
    const drawX = (canvas.width - drawWidth) / 2 + (Number(value.x) || 0) * outputScale;
    const drawY = (canvas.height - drawHeight) / 2 + (Number(value.y) || 0) * outputScale;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    return new Promise((resolve, reject) => canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error("Could not prepare that image")),
      "image/jpeg",
      .85
    ));
  }

  async function uploadCroppedMedia(value, path){
    if (!value?.src) return null;
    if (value.remote && /^https?:/i.test(value.src)) return value.src;
    const blob = await bakeCroppedJpeg(value);
    const { error } = await supabaseClient.storage.from("media").upload(path, blob, {
      upsert:true,
      contentType:"image/jpeg",
    });
    if (error) throw error;
    return supabaseClient.storage.from("media").getPublicUrl(path).data.publicUrl;
  }

  const VENUE_TYPES = ["Club","Restaurant","Beach","Lounge","Gym"];
  const BEIRUT_AREAS = ["Mar Mikhael","Gemmayze","Achrafieh","Hamra","Badaro","Saifi","Manara","Jiyeh","Batroun"];

  function makeVenue(over={}){ return {
    id: "venue-1", name: "", type: "Club", area: "Mar Mikhael",
    description: "", igHandle: "", heroImage: null, images: [null,null,null,null], ...over,
  }; }

  let _evt = 0;
  function makeEvent(over={}){ return {
    id: "evt-"+(++_evt), venueId: "venue-1", title: "", type: "Club", date: "", time: "",
    mix: null,   // null === any mix
    seats: 20, storyHours: 24, heroImage: null, exchange: "1 Story + venue tag", status: "draft", ...over,
  }; }

  const TODAY = "Sun · 25 May"; // canonical demo today – time never advances
  // Live mode derives today from the clock; format matches liveEvent's date field.
  // "Sun · 25 May", the same shape the demo seeds use.
  const dayLabel = date => date.toLocaleDateString("en-GB", {weekday:"short"}) + " · " + date.toLocaleDateString("en-GB", {day:"numeric", month:"short"});
  const todayLabel = () => dayLabel(new Date());

  // Event stages
  const STAGE = { draft:"draft", open:"open", locked:"locked", past:"past", cancelled:"cancelled" };
  // Guest attendance states (one axis)
  const GS = { applied:"applied", waitlist:"waitlist", picked:"picked", confirmed:"confirmed",
    declined:"declined", expired:"expired", withdrawn:"withdrawn", checkedIn:"checked_in",
    noShow:"no_show", notSelected:"not_selected", cancelled:"cancelled" };
  // Story states (second axis; only meaningful after checked_in + event past)
  const SS = { due:"due", review:"review", needsReview:"needs_review", rejected:"rejected", missed:"missed", verified:"verified" };

  // open AND locked both fold to legacy "live" until Task 4 migrates filters to stage –
  // so two events can sit in the old Live segment at once. Expected interim state.
  // Derive legacy status from stage so current renders don't crash.
  function stageToStatus(stage){
    if (stage === STAGE.draft)      return "draft";
    if (stage === STAGE.open)       return "live";
    if (stage === STAGE.locked)     return "live";
    if (stage === STAGE.past)       return "past";
    if (stage === STAGE.cancelled)  return "past";
    return "draft";
  }

  function makeGuest(applicantId, state, opts = {}) {
    return { applicantId, state, story: opts.story || null, code: opts.code || null,
             rating: opts.rating ?? null, inAt: opts.inAt || null,
             storyId: opts.storyId || null, storyMedia: opts.storyMedia || null,
             verdict: opts.verdict || null };
  }

  const SARA_INSIGHTS = {
    dataStatus: "estimated",
    freshness: "Refreshed 2 days ago",
    engagementRate: 0.058,
    overview: {
      localFollowers: 20400,
      trend: [23800, 24600, 25100, 26300, 27200, 28400],
      trendLabel: "+19% followers in 90 days",
    },
    audience: {
      lebanon: 0.72,
      cities: [["Beirut",0.46],["Jounieh",0.14],["Tripoli",0.07],["Byblos",0.05]],
      ages: [["13-17",0.04],["18-24",0.41],["25-34",0.38],["35-44",0.13],["45+",0.04]],
      female: 0.68,
      male: 0.32,
      credibility: 0.91,
      languages: ["Arabic","English","French"],
      activeHours: ["6-9 PM","Friday","Sunday"],
    },
    content: {
      performance: [["Reels",1.42],["Carousels",1.16],["Stories",0.94]],
      topContent: [
        { thumbnail:IMG.pool, label:"Reel", reach:48200 },
        { thumbnail:IMG.rooftop, label:"Reel", reach:41600 },
        { thumbnail:IMG.restaurant, label:"Carousel", reach:33700 },
        { thumbnail:IMG.cocktail, label:"Story", reach:28900 },
      ],
      averageLikes: 1650,
      averageComments: 74,
      averageViews: 14600,
      averageReelsViews: 32400,
      postingFrequency: "4.2 posts / week",
      sponsoredShare: 0.12,
    },
    theList: {
      reliability: 0.94,
      showUpRate: 17/18,
      storyCompletion: 0.94,
      venueRating: 4.8,
      events: 18,
      verifiedReach: 342000,
      noShows: 1,
      strikes: 0,
      trend: [0.82,0.90,0.88,0.96,1],
    },
  };

  function makeCompactDemoInsights(applicant, index){
    const lebanon = (applicant.audience?.countries || []).find(([name]) => name === "Lebanon")?.[1] ?? null;
    const reliability = applicant.reputation?.nights > 0
      ? applicant.reputation.shows / applicant.reputation.nights
      : null;
    const followers = applicant.instagram_followers;
    const engagementRate = [0.041,0.052,0.048,0.039,0.063,0.046][index % 6];
    const female = applicant.audience?.female ?? null;
    return {
      dataStatus: index % 4 === 1 ? "connected" : "estimated",
      freshness: index % 4 === 1 ? "Synced today" : "Refreshed 3 days ago",
      engagementRate,
      overview: {
        localFollowers: followers != null && lebanon != null ? Math.round(followers * lebanon) : null,
        trend: followers == null ? null : [0.82,0.87,0.91,0.95,0.98,1].map(x => Math.round(followers * x)),
        trendLabel: "+8% followers in 90 days",
      },
      audience: {
        lebanon,
        cities: lebanon == null ? null : [["Beirut",lebanon*.62],["Jounieh",lebanon*.18],["Byblos",lebanon*.09]],
        ages: [["18-24",0.44],["25-34",0.36],["35-44",0.14],["45+",0.06]],
        female,
        male: female == null ? null : 1-female,
        credibility: applicant.quality_score,
        languages: ["Arabic","English"],
        activeHours: ["7-10 PM","Thursday","Saturday"],
      },
      content: {
        performance: [["Reels",1.18],["Carousels",1.02],["Stories",0.88]],
        topContent: [
          { thumbnail:IMG.rooftop, label:"Reel", reach:followers == null ? null : Math.round(followers*1.34) },
          { thumbnail:IMG.pool, label:"Story", reach:followers == null ? null : Math.round(followers*.92) },
          { thumbnail:IMG.cocktail, label:"Reel", reach:followers == null ? null : Math.round(followers*.81) },
          { thumbnail:IMG.restaurant, label:"Carousel", reach:followers == null ? null : Math.round(followers*.68) },
        ],
        averageLikes: followers == null ? null : Math.round(followers*engagementRate*.86),
        averageComments: followers == null ? null : Math.round(followers*engagementRate*.04),
        averageViews: followers == null ? null : Math.round(followers*.54),
        averageReelsViews: followers == null ? null : Math.round(followers*.88),
        postingFrequency: `${3 + (index % 3)} posts / week`,
        sponsoredShare: [0.08,0.12,0.16][index % 3],
      },
      theList: {
        reliability,
        showUpRate: reliability,
        storyCompletion: reliability == null ? null : Math.max(0, reliability-.03),
        venueRating: 4.4 + (index % 5)*.1,
        events: applicant.reputation?.nights ?? null,
        verifiedReach: followers == null || reliability == null ? null : Math.round(followers*reliability*2.8),
        noShows: applicant.reputation?.noShows ?? null,
        strikes: applicant.reputation?.strikes ?? null,
        trend: [0.72,0.84,0.80,0.92,reliability].filter(v => v != null),
      },
    };
  }

  // Applicants for the swipe deck (vendor-neutral; mirrors a normalized provider row).
  const APPLICANTS = [
    // ---- original 8 (kept exactly, with added reputation + audience) ----
    { id:"a1", name:"Sara Capriotti", gender:"female", quality_score:0.94, photo:FACE.sara,
      instagram_followers:28400, tiktok_followers:51200,
      socials:{ instagram:"https://instagram.com/capriottisara", tiktok:"https://tiktok.com/@capriottisara", other:null },
      reputation:{ score:9.1, nights:18, shows:17, noShows:1, strikes:0, withYou:3 },
      audience:{ female:0.68, countries:[["Lebanon",0.72],["UAE",0.12],["France",0.08]] },
      insights:SARA_INSIGHTS },
    { id:"a2", name:"Karim Haddad", gender:"male", quality_score:0.88, photo:FACE.karim,
      instagram_followers:14200, tiktok_followers:9800,
      socials:{ instagram:"https://instagram.com/karim", tiktok:"https://tiktok.com/@karim", other:null },
      reputation:{ score:8.7, nights:12, shows:11, noShows:1, strikes:0, withYou:2 },
      audience:{ female:0.42, countries:[["Lebanon",0.70],["UAE",0.14],["KSA",0.06]] } },
    { id:"a3", name:"Lea Nassar", gender:"female", quality_score:0.91, photo:FACE.lina,
      instagram_followers:46100, tiktok_followers:120300,
      socials:{ instagram:"https://instagram.com/lea", tiktok:null, other:"https://leanassar.com" },
      reputation:{ score:9.4, nights:22, shows:22, noShows:0, strikes:0, withYou:4 },
      audience:{ female:0.71, countries:[["Lebanon",0.65],["UAE",0.18],["KSA",0.07]] } },
    { id:"a4", name:"Tariq Bou", gender:"male", quality_score:0.79, photo:FACE.rami,
      instagram_followers:8200, tiktok_followers:21000,
      socials:{ instagram:"https://instagram.com/tariq", tiktok:"https://tiktok.com/@tariq", other:null },
      reputation:{ score:8.2, nights:7, shows:6, noShows:1, strikes:0, withYou:1 },
      audience:{ female:0.38, countries:[["Lebanon",0.74],["Cyprus",0.10],["UAE",0.08]] } },
    { id:"a5", name:"Nour Khoury", gender:"female", quality_score:0.86, photo:FACE.nour,
      instagram_followers:33000, tiktok_followers:5400,
      socials:{ instagram:"https://instagram.com/nour", tiktok:"https://tiktok.com/@nour", other:null },
      reputation:{ score:8.9, nights:14, shows:13, noShows:1, strikes:0, withYou:2 },
      audience:{ female:0.64, countries:[["Lebanon",0.70],["UAE",0.14],["KSA",0.06]] } },
    { id:"a6", name:"Maya Fares", gender:"female", quality_score:0.97, photo:FACE.maya,
      instagram_followers:88000, tiktok_followers:240000,
      socials:{ instagram:"https://instagram.com/maya", tiktok:"https://tiktok.com/@maya", other:null },
      reputation:{ score:9.6, nights:24, shows:24, noShows:0, strikes:0, withYou:4 },
      audience:{ female:0.78, countries:[["Lebanon",0.60],["UAE",0.20],["France",0.08]] } },
    { id:"a7", name:"Jad Aoun", gender:"male", quality_score:0.72, photo:FACE.karim,
      instagram_followers:5100, tiktok_followers:3200,
      socials:{ instagram:"https://instagram.com/jad", tiktok:null, other:null },
      reputation:{ score:7.9, nights:5, shows:4, noShows:1, strikes:1, withYou:0 },
      audience:{ female:0.41, countries:[["Lebanon",0.80],["Cyprus",0.09],["Qatar",0.05]] } },
    { id:"a8", name:"Yara Saad", gender:"female", quality_score:0.83, photo:FACE.yasmine,
      instagram_followers:19500, tiktok_followers:42000,
      socials:{ instagram:"https://instagram.com/yara", tiktok:"https://tiktok.com/@yara", other:null },
      reputation:{ score:8.6, nights:10, shows:10, noShows:0, strikes:0, withYou:2 },
      audience:{ female:0.66, countries:[["Lebanon",0.68],["UAE",0.16],["KSA",0.08]] } },
    // ---- 18 new applicants (female first, then male) ----
    { id:"a9", name:"Lea Khoury", gender:"female", quality_score:0.82, photo:FACE.sara,
      instagram_followers:22000, tiktok_followers:38000,
      socials:{ instagram:"https://instagram.com/leakhoury", tiktok:"https://tiktok.com/@leakhoury", other:null },
      reputation:{ score:8.8, nights:9, shows:9, noShows:0, strikes:0, withYou:1 },
      audience:{ female:0.65, countries:[["Lebanon",0.71],["UAE",0.13],["KSA",0.07]] } },
    { id:"a10", name:"Maya Rahme", gender:"female", quality_score:0.87, photo:FACE.maya,
      instagram_followers:34000, tiktok_followers:61000,
      socials:{ instagram:"https://instagram.com/mayarahme", tiktok:"https://tiktok.com/@mayarahme", other:null },
      reputation:{ score:9.0, nights:11, shows:11, noShows:0, strikes:0, withYou:2 },
      audience:{ female:0.70, countries:[["Lebanon",0.66],["UAE",0.17],["France",0.09]] } },
    { id:"a11", name:"Nour Saab", gender:"female", quality_score:0.79, photo:FACE.nour,
      instagram_followers:15000, tiktok_followers:27000,
      socials:{ instagram:"https://instagram.com/noursaab", tiktok:"https://tiktok.com/@noursaab", other:null },
      reputation:{ score:8.3, nights:6, shows:6, noShows:0, strikes:0, withYou:1 },
      audience:{ female:0.62, countries:[["Lebanon",0.75],["UAE",0.12],["Qatar",0.06]] } },
    { id:"a12", name:"Yara Chami", gender:"female", quality_score:0.84, photo:FACE.yasmine,
      instagram_followers:27000, tiktok_followers:45000,
      socials:{ instagram:"https://instagram.com/yarachami", tiktok:"https://tiktok.com/@yarachami", other:null },
      reputation:{ score:8.7, nights:13, shows:12, noShows:1, strikes:0, withYou:2 },
      audience:{ female:0.67, countries:[["Lebanon",0.69],["UAE",0.15],["KSA",0.07]] } },
    { id:"a13", name:"Tala Aoun", gender:"female", quality_score:0.76, photo:FACE.tala,
      instagram_followers:12000, tiktok_followers:19000,
      socials:{ instagram:"https://instagram.com/talaaoun", tiktok:"https://tiktok.com/@talaaoun", other:null },
      reputation:{ score:8.1, nights:5, shows:5, noShows:0, strikes:0, withYou:0 },
      audience:{ female:0.63, countries:[["Lebanon",0.76],["Cyprus",0.10],["UAE",0.07]] } },
    { id:"a14", name:"Rita Sleiman", gender:"female", quality_score:0.88, photo:FACE.sara,
      instagram_followers:41000, tiktok_followers:78000,
      socials:{ instagram:"https://instagram.com/ritasleiman", tiktok:"https://tiktok.com/@ritasleiman", other:null },
      reputation:{ score:9.2, nights:19, shows:18, noShows:1, strikes:0, withYou:3 },
      audience:{ female:0.72, countries:[["Lebanon",0.64],["UAE",0.18],["France",0.10]] } },
    { id:"a15", name:"Dana Fakhry", gender:"female", quality_score:0.81, photo:FACE.lina,
      instagram_followers:18000, tiktok_followers:30000,
      socials:{ instagram:"https://instagram.com/danafakhry", tiktok:"https://tiktok.com/@danafakhry", other:null },
      reputation:{ score:8.5, nights:8, shows:8, noShows:0, strikes:0, withYou:1 },
      audience:{ female:0.66, countries:[["Lebanon",0.72],["UAE",0.14],["Qatar",0.07]] } },
    { id:"a16", name:"Lana Matar", gender:"female", quality_score:0.92, photo:FACE.maya,
      instagram_followers:55000, tiktok_followers:92000,
      socials:{ instagram:"https://instagram.com/lanamatar", tiktok:"https://tiktok.com/@lanamatar", other:null },
      reputation:{ score:9.3, nights:20, shows:20, noShows:0, strikes:0, withYou:4 },
      audience:{ female:0.75, countries:[["Lebanon",0.62],["UAE",0.20],["KSA",0.09]] } },
    { id:"a17", name:"Cyrine Nassar", gender:"female", quality_score:0.78, photo:FACE.nour,
      instagram_followers:11000, tiktok_followers:16000,
      socials:{ instagram:"https://instagram.com/cyrinenassar", tiktok:"https://tiktok.com/@cyrinenassar", other:null },
      reputation:{ score:8.2, nights:4, shows:4, noShows:0, strikes:0, withYou:0 },
      audience:{ female:0.61, countries:[["Lebanon",0.78],["Cyprus",0.08],["UAE",0.07]] } },
    { id:"a18", name:"Joelle Abou Jaoude", gender:"female", quality_score:0.85, photo:FACE.yasmine,
      instagram_followers:31000, tiktok_followers:54000,
      socials:{ instagram:"https://instagram.com/joelleaj", tiktok:"https://tiktok.com/@joelleaj", other:null },
      reputation:{ score:8.9, nights:15, shows:14, noShows:1, strikes:0, withYou:2 },
      audience:{ female:0.68, countries:[["Lebanon",0.68],["UAE",0.16],["France",0.08]] } },
    { id:"a19", name:"Karen Daou", gender:"female", quality_score:0.71, photo:FACE.tala,
      instagram_followers:9000, tiktok_followers:12000,
      socials:{ instagram:"https://instagram.com/karendaou", tiktok:"https://tiktok.com/@karendaou", other:null },
      reputation:{ score:8.0, nights:3, shows:3, noShows:0, strikes:0, withYou:0 },
      audience:{ female:0.60, countries:[["Lebanon",0.80],["UAE",0.10],["Qatar",0.05]] } },
    { id:"a20", name:"Mira Haddad", gender:"female", quality_score:0.89, photo:FACE.lina,
      instagram_followers:47000, tiktok_followers:88000,
      socials:{ instagram:"https://instagram.com/mirahaddad", tiktok:"https://tiktok.com/@mirahaddad", other:null },
      reputation:{ score:9.1, nights:16, shows:16, noShows:0, strikes:0, withYou:3 },
      audience:{ female:0.73, countries:[["Lebanon",0.65],["UAE",0.19],["KSA",0.08]] } },
    { id:"a21", name:"Omar Khalil", gender:"male", quality_score:0.80, photo:FACE.karim,
      instagram_followers:17000, tiktok_followers:25000,
      socials:{ instagram:"https://instagram.com/omarkhalil", tiktok:"https://tiktok.com/@omarkhalil", other:null },
      reputation:{ score:8.4, nights:8, shows:7, noShows:1, strikes:0, withYou:1 },
      audience:{ female:0.40, countries:[["Lebanon",0.73],["UAE",0.14],["KSA",0.06]] } },
    { id:"a22", name:"Ziad Karam", gender:"male", quality_score:0.75, photo:FACE.rami,
      instagram_followers:10000, tiktok_followers:0,
      socials:{ instagram:"https://instagram.com/ziadkaram", tiktok:null, other:null },
      reputation:{ score:8.1, nights:4, shows:4, noShows:0, strikes:0, withYou:0 },
      audience:{ female:0.39, countries:[["Lebanon",0.77],["Cyprus",0.11],["UAE",0.07]] } },
    { id:"a23", name:"Jad Nassif", gender:"male", quality_score:0.83, photo:FACE.karim,
      instagram_followers:23000, tiktok_followers:41000,
      socials:{ instagram:"https://instagram.com/jadnassif", tiktok:"https://tiktok.com/@jadnassif", other:null },
      reputation:{ score:8.6, nights:11, shows:10, noShows:1, strikes:0, withYou:2 },
      audience:{ female:0.44, countries:[["Lebanon",0.70],["UAE",0.15],["France",0.08]] } },
    { id:"a24", name:"Marc Abboud", gender:"male", quality_score:0.77, photo:FACE.rami,
      instagram_followers:13000, tiktok_followers:18000,
      socials:{ instagram:"https://instagram.com/marcabboud", tiktok:"https://tiktok.com/@marcabboud", other:null },
      reputation:{ score:8.3, nights:6, shows:6, noShows:0, strikes:0, withYou:1 },
      audience:{ female:0.43, countries:[["Lebanon",0.74],["Qatar",0.10],["UAE",0.08]] } },
    { id:"a25", name:"Rami Saliba", gender:"male", quality_score:0.85, photo:FACE.karim,
      instagram_followers:30000, tiktok_followers:52000,
      socials:{ instagram:"https://instagram.com/ramisaliba", tiktok:"https://tiktok.com/@ramisaliba", other:null },
      reputation:{ score:8.8, nights:14, shows:13, noShows:1, strikes:0, withYou:2 },
      audience:{ female:0.46, countries:[["Lebanon",0.67],["UAE",0.17],["KSA",0.09]] } },
    { id:"a26", name:"Elie Tannous", gender:"male", quality_score:0.73, photo:FACE.rami,
      instagram_followers:9000, tiktok_followers:0,
      socials:{ instagram:"https://instagram.com/elietannous", tiktok:null, other:null },
      reputation:{ score:8.0, nights:3, shows:3, noShows:0, strikes:0, withYou:0 },
      audience:{ female:0.38, countries:[["Lebanon",0.79],["Cyprus",0.09],["UAE",0.06]] } },
  ].map((applicant, index) => ({
    ...applicant,
    insights: applicant.insights || makeCompactDemoInsights(applicant, index),
  }));

  const applicantById = Object.fromEntries(APPLICANTS.map(a => [a.id, a]));

  // ---- demo world events ----
  // canonical today = Sun 25 May
  const SEED_EVENTS = [
    // 1. Pool Day – stage:locked (today, 18 confirmed + 1 picked + 2 waitlist)
    (() => {
      const guests = [
        makeGuest("a3",  GS.confirmed, { code:"LST-2A", inAt:null, rating:null }),
        makeGuest("a4",  GS.confirmed, { code:"LST-2B", inAt:null, rating:null }),
        makeGuest("a5",  GS.confirmed, { code:"LST-2C", inAt:null, rating:null }),
        makeGuest("a6",  GS.confirmed, { code:"LST-2D", inAt:null, rating:null }),
        makeGuest("a8",  GS.confirmed, { code:"LST-2E", inAt:null, rating:null }),
        makeGuest("a9",  GS.confirmed, { code:"LST-2F", inAt:null, rating:null }),
        makeGuest("a11", GS.confirmed, { code:"LST-2G", inAt:null, rating:null }),
        makeGuest("a12", GS.confirmed, { code:"LST-2H", inAt:null, rating:null }),
        makeGuest("a13", GS.confirmed, { code:"LST-2J", inAt:null, rating:null }),
        makeGuest("a14", GS.confirmed, { code:"LST-2K", inAt:null, rating:null }),
        makeGuest("a15", GS.confirmed, { code:"LST-2L", inAt:null, rating:null }),
        makeGuest("a16", GS.confirmed, { code:"LST-2M", inAt:null, rating:null }),
        makeGuest("a17", GS.confirmed, { code:"LST-2N", inAt:null, rating:null }),
        makeGuest("a18", GS.confirmed, { code:"LST-2P", inAt:null, rating:null }),
        makeGuest("a19", GS.confirmed, { code:"LST-2R", inAt:null, rating:null }),
        makeGuest("a20", GS.confirmed, { code:"LST-2S", inAt:null, rating:null }),
        makeGuest("a21", GS.confirmed, { code:"LST-2T", inAt:null, rating:null }),
        // Sara Capriotti – code MUST be LST-4F
        makeGuest("a1",  GS.confirmed, { code:"LST-4F", inAt:null, rating:null }),
        // expired – Maya Rahme, code LST-9Q (expired-pick demo – T7 seed flip)
        makeGuest("a10", GS.expired, { code:"LST-9Q" }),
        // 2 waitlist
        makeGuest("a22", GS.waitlist),
        makeGuest("a23", GS.waitlist),
      ];
      return {
        ...makeEvent({ id:"pool", title:"Pool Day", type:"Beach", date:"Sun · 25 May", time:"14:00",
          mix:{girls:15,guys:5}, seats:20, exchange:"1 Story + venue tag",
          heroImage:{ src:IMG.beachClub, scale:1, x:0, y:0 } }),
        stage: STAGE.locked,
        status: stageToStatus(STAGE.locked),
        closesAt: "Sat · 24 May · 20:00",
        bundle: { name:"The twenty", price:700 },
        brief: { arrival:"14:00 – 15:00", dress:"Beach chic", meeting:"Host stand – ask for Rami", rules:"1 Story + venue tag during the event" },
        appliedTotal: 137,
        guests,
      };
    })(),

    // 2. Late Lounge – stage:open (24 applied, Sara among them)
    (() => {
      const guests = [
        makeGuest("a1",  GS.applied),
        makeGuest("a2",  GS.applied),
        makeGuest("a3",  GS.applied),
        makeGuest("a4",  GS.applied),
        makeGuest("a5",  GS.applied),
        makeGuest("a6",  GS.applied),
        makeGuest("a7",  GS.applied),
        makeGuest("a8",  GS.applied),
        makeGuest("a9",  GS.applied),
        makeGuest("a11", GS.applied),
        makeGuest("a12", GS.applied),
        makeGuest("a13", GS.applied),
        makeGuest("a14", GS.applied),
        makeGuest("a15", GS.applied),
        makeGuest("a16", GS.applied),
        makeGuest("a17", GS.applied),
        makeGuest("a18", GS.applied),
        makeGuest("a19", GS.applied),
        makeGuest("a20", GS.applied),
        makeGuest("a21", GS.applied),
        makeGuest("a22", GS.applied),
        makeGuest("a23", GS.applied),
        makeGuest("a24", GS.applied),
        makeGuest("a25", GS.applied),
      ];
      return {
        ...makeEvent({ id:"lounge", title:"Late Lounge", type:"Lounge", date:"Fri · 30 May", time:"22:00",
          mix:{girls:15,guys:5}, seats:20, exchange:"1 Story + venue tag",
          heroImage:{ src:IMG.lounge, scale:1, x:0, y:0 } }),
        stage: STAGE.open,
        status: stageToStatus(STAGE.open),
        closesAt: "Fri · 30 May · 20:00",
        bundle: { name:"The twenty", price:700 },
        brief: { arrival:"21:30 – 22:30", dress:"Smart dark", meeting:"Door host", rules:"1 Story + venue tag during the event" },
        appliedTotal: 137,
        guests,
      };
    })(),

    // 3. Rooftop Session – stage:draft (no guests, no bundle yet)
    (() => {
      return {
        ...makeEvent({ id:"roof", title:"Rooftop Session", type:"Club", date:"Sat · 31 May", time:"21:00",
          mix:null, seats:30, exchange:"1 Story + venue tag",
          heroImage:{ src:IMG.rooftop, scale:1, x:0, y:0 } }),
        stage: STAGE.draft,
        status: stageToStatus(STAGE.draft),
        bundle: null,
        brief: null,
        guests: [],
      };
    })(),

    // 4. Sound Bath – stage:past (last night, story windows still open)
    (() => {
      // 18 checked_in: 14 verified, 1 review, 3 due – Sara is checked_in + story "due"
      const guests = [
        makeGuest("a3",  GS.checkedIn, { inAt:"19:04", rating:8.8, story:SS.verified }),
        makeGuest("a4",  GS.checkedIn, { inAt:"19:07", rating:8.5, story:SS.verified }),
        makeGuest("a5",  GS.checkedIn, { inAt:"19:09", rating:8.9, story:SS.verified }),
        makeGuest("a6",  GS.checkedIn, { inAt:"19:11", rating:9.0, story:SS.verified }),
        makeGuest("a8",  GS.checkedIn, { inAt:"19:14", rating:8.7, story:SS.verified }),
        makeGuest("a9",  GS.checkedIn, { inAt:"19:16", rating:8.4, story:SS.verified }),
        makeGuest("a11", GS.checkedIn, { inAt:"19:19", rating:8.6, story:SS.verified }),
        makeGuest("a12", GS.checkedIn, { inAt:"19:21", rating:8.8, story:SS.verified }),
        makeGuest("a13", GS.checkedIn, { inAt:"19:24", rating:8.5, story:SS.verified }),
        makeGuest("a14", GS.checkedIn, { inAt:"19:28", story:SS.review }),
        makeGuest("a15", GS.checkedIn, { inAt:"19:31", rating:8.6, story:SS.verified }),
        makeGuest("a16", GS.checkedIn, { inAt:"19:33", rating:8.7, story:SS.verified }),
        makeGuest("a17", GS.checkedIn, { inAt:"19:36", story:SS.due }),
        makeGuest("a18", GS.checkedIn, { inAt:"19:39", story:SS.due }),
        // Sara – story "due" (member-side upload demo)
        makeGuest("a1",  GS.checkedIn, { inAt:"19:08", story:SS.due }),
        makeGuest("a20", GS.checkedIn, { inAt:"19:43", rating:8.9, story:SS.verified }),
        makeGuest("a21", GS.checkedIn, { inAt:"19:45", rating:8.5, story:SS.verified }),
        makeGuest("a22", GS.checkedIn, { inAt:"19:47", rating:8.6, story:SS.verified }),
        makeGuest("a2",  GS.noShow),
        makeGuest("a7",  GS.noShow),
      ];
      return {
        ...makeEvent({ id:"bath", title:"Sound Bath", type:"Gym", date:"Sat · 24 May", time:"19:00",
          mix:{girls:15,guys:5}, seats:20, exchange:"1 Story + venue tag",
          heroImage:{ src:IMG.gym, scale:1, x:0, y:0 } }),
        stage: STAGE.past,
        status: stageToStatus(STAGE.past),
        bundle: { name:"The twenty", price:700 },
        brief: { arrival:"18:30 – 19:00", dress:"Comfortable active", meeting:"Front desk", rules:"1 Story + venue tag during the event" },
        guests,
        invoice: { bundle:"The twenty", price:700, status:"pending" },
      };
    })(),

    // 5. Vinyl Night – stage:past (two weeks ago, invoiced+paid)
    (() => {
      // 12 checked_in: 10 verified + 2 "missed" (story string literal)
      // Sara is checked_in + story verified with a verdict
      const guests = [
        makeGuest("a3",  GS.checkedIn, { inAt:"21:10", rating:8.9, story:SS.verified }),
        makeGuest("a4",  GS.checkedIn, { inAt:"21:14", rating:8.7, story:SS.verified }),
        makeGuest("a5",  GS.checkedIn, { inAt:"21:17", rating:9.0, story:SS.verified }),
        makeGuest("a6",  GS.checkedIn, { inAt:"21:20", rating:9.1, story:SS.verified }),
        makeGuest("a8",  GS.checkedIn, { inAt:"21:24", rating:8.8, story:SS.verified }),
        makeGuest("a9",  GS.checkedIn, { inAt:"21:27", rating:8.6, story:SS.verified }),
        makeGuest("a11", GS.checkedIn, { inAt:"21:31", rating:8.9, story:SS.verified }),
        makeGuest("a12", GS.checkedIn, { inAt:"21:35", rating:8.7, story:SS.verified }),
        makeGuest("a14", GS.checkedIn, { inAt:"21:38", story:SS.missed }),
        makeGuest("a16", GS.checkedIn, { inAt:"21:41", story:SS.missed }),
        makeGuest("a18", GS.checkedIn, { inAt:"21:44", rating:8.8, story:SS.verified }),
        // Sara – checked_in + story verified with verdict
        { ...makeGuest("a1", GS.checkedIn, { inAt:"21:22", rating:9.2, story:SS.verified }),
          verdict: { score:92, reason:"Tag visible, posted in window" } },
      ];
      return {
        ...makeEvent({ id:"vinyl", title:"Vinyl Night", type:"Lounge", date:"Sun · 11 May", time:"21:00",
          mix:{girls:10,guys:2}, seats:12, exchange:"1 Story + venue tag",
          heroImage:{ src:IMG.lounge, scale:1, x:0, y:0 } }),
        stage: STAGE.past,
        status: stageToStatus(STAGE.past),
        bundle: { name:"The ten", price:400 },
        brief: { arrival:"21:00 – 22:00", dress:"Smart casual", meeting:"Host at door", rules:"1 Story + venue tag during the event" },
        guests,
        invoice: { bundle:"The ten", price:400, status:"paid" },
      };
    })(),

    // 6. Harbor Club Night – stage:cancelled (6 guests all cancelled)
    (() => {
      const guests = [
        makeGuest("a2",  GS.cancelled),
        makeGuest("a7",  GS.cancelled),
        makeGuest("a21", GS.cancelled),
        makeGuest("a23", GS.cancelled),
        makeGuest("a24", GS.cancelled),
        makeGuest("a25", GS.cancelled),
      ];
      return {
        ...makeEvent({ id:"harbor", title:"Harbor Club Night", type:"Club", date:"Thu · 22 May", time:"22:00",
          mix:{girls:15,guys:5}, seats:20, exchange:"1 Story + venue tag",
          heroImage:{ src:IMG.club, scale:1, x:0, y:0 } }),
        stage: STAGE.cancelled,
        status: stageToStatus(STAGE.cancelled),
        bundle: { name:"The twenty", price:700 },
        brief: null,
        guests,
      };
    })(),
  ];

  const isNumber = (value) => typeof value === "number" && Number.isFinite(value);
  const fmtK = (n) => !isNumber(n) ? "Not available" : n>=1000 ? (n/1000).toFixed(n>=10000?0:1)+"k" : ""+n;
  const fmtPct = (n, digits=0) => !isNumber(n) ? "Not available" : (n*100).toFixed(digits)+"%";
  const fmtCount = (n) => !isNumber(n) ? "Not available" : n.toLocaleString("en-US");

  /* Demo seed – lets Will (or a venue in a pitch) see the whole desk with zero
     typing. Entered via "Preview the desk" on the intro screen. */
  const DEMO_VENUE = makeVenue({
    name: "Cyan Beach Club", type: "Beach", area: "Jiyeh",
    description: "Daybeds, shallow pool, golden-hour sets. Jiyeh's calmest room.",
    heroImage: { src: IMG.beachClub, scale: 1, x: 0, y: 0 },
    images: [
      { src: IMG.pool,     scale: 1, x: 0, y: 0 },
      { src: IMG.cocktail, scale: 1, x: 0, y: 0 },
      { src: IMG.lounge,   scale: 1, x: 0, y: 0 },
      { src: IMG.rooftop,  scale: 1, x: 0, y: 0 },
    ],
  });

  /* ========== shared pieces – the redesign restyles these once ========== */
  const HOUR = 60*60*1000;

  function StatusPill({ label, tone="neutral" }){
    const style = tone==="ice" ? {background:"var(--ice)", color:"var(--ice-ink)"}
      : tone==="outline" ? {border:"1px solid var(--line-2)", color:"var(--ink)"}
      : {background:"var(--bg-elev2)", color:"var(--ink)"};
    return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap" style={style}>{label}</span>;
  }

  function SectionHead({ label, right, className="" }){
    return (
      <div className={"px-5 flex items-center justify-between "+className}>
        <h2 className="flex items-center gap-2.5">
          <span className="rounded-full" style={{ width:3, height:15, background:"var(--ice)" }}/>
          <span className="section-label">{label}</span>
        </h2>
        {right != null && <span className="text-[12px] font-medium">{right}</span>}
      </div>
    );
  }

  function BackButton({ onClick, label="Back" }){
    return (
      <button onClick={onClick} className="press h-11 -ml-2 px-2 inline-flex items-center gap-1.5 text-[14px] font-medium" style={{color:"var(--ink)"}}>
        <Icon name="arrow-left" size={16} stroke={1.8}/> {label}
      </button>
    );
  }

  function BigButton({ children, onClick, disabled=false, quiet=false, ...rest }){
    return (
      <button onClick={onClick} disabled={disabled} {...rest}
        className={"press w-full min-h-[52px] px-5 rounded-full text-[14px] font-semibold flex items-center justify-center gap-2 text-center" + (quiet || disabled ? "" : " glow-primary")}
        style={disabled ? {background:"var(--bg-elev2)", color:"var(--ink)", opacity:.6}
          : quiet ? {border:"1px solid var(--line-2)", color:"var(--ink)", background:"transparent"}
          : {background:"var(--ice)", color:"var(--ice-ink)"}}>
        {children}
      </button>
    );
  }

  function Chip({ on, onClick, children, label }){
    return (
      <button onClick={onClick} aria-pressed={on} aria-label={label}
        className="press min-h-[44px] px-4 rounded-full text-[13px] font-medium"
        style={on ? {background:"var(--ice)", color:"var(--ice-ink)"} : {border:"1px solid var(--line-2)", color:"var(--ink)"}}>
        {children}
      </button>
    );
  }

  const inputCls = "w-full h-12 px-3 rounded-[12px] text-[16px]";
  const inputStyle = {background:"var(--bg-elev)", border:"1px solid var(--line-2)", color:"var(--ink)"};

  function Field({ label, hint, children }){
    return (
      <label className="block">
        <span className="block text-[13px] font-semibold mb-2">{label}</span>
        {children}
        {hint && <span className="block text-[12px] mt-2 leading-snug">{hint}</span>}
      </label>
    );
  }

  // Chip rows use a fieldset: a <label> around several buttons would click the first one.
  function ChoiceGroup({ label, hint, children }){
    return (
      <fieldset>
        <legend className="text-[13px] font-semibold mb-2">{label}</legend>
        <div className="flex flex-wrap gap-2">{children}</div>
        {hint && <div className="text-[12px] mt-2 leading-snug">{hint}</div>}
      </fieldset>
    );
  }

  function Stepper({ label, value, onChange, min=0, max=500 }){
    const word = label.toLowerCase();
    return (
      <div className="flex items-center justify-between min-h-[52px]">
        <span className="text-[15px]">{label}</span>
        <div className="flex items-center gap-3">
          <button onClick={()=>onChange(Math.max(min, value-1))} disabled={value<=min} aria-label={"Fewer " + word}
            className="press w-11 h-11 rounded-full text-[18px]" style={{border:"1px solid var(--line-2)", opacity: value<=min ? .4 : 1}}>–</button>
          <span className="font-mono text-[18px] w-10 text-center" aria-live="polite">{value}</span>
          <button onClick={()=>onChange(Math.min(max, value+1))} disabled={value>=max} aria-label={"More " + word}
            className="press w-11 h-11 rounded-full text-[18px]" style={{border:"1px solid var(--line-2)", opacity: value>=max ? .4 : 1}}>+</button>
        </div>
      </div>
    );
  }

  function Switch({ label, hint, on, onChange }){
    return (
      <button role="switch" aria-checked={on} onClick={()=>onChange(!on)} className="press w-full min-h-[52px] flex items-center justify-between gap-3 text-left">
        <span>
          <span className="block text-[15px]">{label}</span>
          {hint && <span className="block text-[12px] mt-0.5">{hint}</span>}
        </span>
        <span aria-hidden="true" className="shrink-0 w-12 h-7 rounded-full relative" style={{background: on ? "var(--ice)" : "var(--bg-elev2)", border:"1px solid var(--line-2)"}}>
          <span className="absolute top-[3px] w-5 h-5 rounded-full" style={{left: on ? 23 : 3, background: on ? "var(--ice-ink)" : "var(--ink)", transition:"left .18s ease"}}/>
        </span>
      </button>
    );
  }

  function Avatar({ ap, size=44 }){
    const initials = (ap.name || "?").split(" ").map(part => part[0]).join("").slice(0,2).toUpperCase();
    return ap.photo
      ? <img src={ap.photo} alt="" className="rounded-full object-cover shrink-0" style={{width:size, height:size, background:"var(--bg-elev2)"}}/>
      : <span aria-hidden="true" className="rounded-full shrink-0 flex items-center justify-center text-[12px] font-semibold" style={{width:size, height:size, background:"var(--bg-elev2)"}}>{initials}</span>;
  }

  function CountTile({ n, label }){
    return (
      <div className="card rounded-[14px] p-3 min-w-0">
        <div className="font-black font-mono text-[24px] leading-none">{n}</div>
        <div className="text-[11px] leading-tight mt-1.5">{label}</div>
      </div>
    );
  }

  function Sheet({ title, onClose, children }){
    useEffect(() => {
      const onKey = e => { if (e.key === "Escape") onClose(); };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    });
    return (
      <>
        <div onClick={onClose} className="absolute inset-0 z-40 sheet-backdrop" style={{background:"rgba(0,0,0,.55)", backdropFilter:"blur(4px)"}}/>
        <div role="dialog" aria-modal="true" aria-label={title} className="absolute left-0 right-0 bottom-0 z-50 sheet rounded-t-[24px] px-5 pt-3" style={{background:"var(--bg)", borderTop:"1px solid var(--line-2)"}}>
          <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{background:"var(--ink)", opacity:.4}}/>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="font-black text-[22px] leading-tight min-w-0 truncate">{title}</div>
            <button onClick={onClose} aria-label="Close" autoFocus className="press w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{background:"var(--bg-elev)"}}>
              <Icon name="x" size={16}/>
            </button>
          </div>
          {children}
        </div>
      </>
    );
  }

  // Waits for the save. A failed save keeps the dialog open, says why, and lets the venue retry.
  // onConfirm rethrows to signal a failure.
  function ConfirmDialog({ title, body, confirmLabel, cancelLabel="Not now", onConfirm, onClose }){
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState(null);
    useEffect(() => {
      const onKey = e => { if (e.key === "Escape" && !busy) onClose(); };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    });
    const confirm = async () => {
      if (busy) return;
      setBusy(true); setErr(null);
      try { await onConfirm(); onClose(); }
      catch (error) { setErr(plainError(error, "That didn't save. Try again.")); setBusy(false); }
    };
    return (
      <>
        <div onClick={busy ? undefined : onClose} className="absolute inset-0 z-[60] sheet-backdrop" style={{background:"rgba(0,0,0,.55)", backdropFilter:"blur(4px)"}}/>
        <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-body" className="absolute left-0 right-0 bottom-0 z-[70] sheet rounded-t-[24px] px-5 pt-4" style={{background:"var(--bg)", borderTop:"1px solid var(--line-2)"}}>
          <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{background:"var(--ink)", opacity:.4}}/>
          <div id="confirm-title" className="font-black font-display-l text-[26px] leading-tight mb-2">{title}</div>
          <div id="confirm-body" className="text-[14px] leading-relaxed mb-6">{body}</div>
          {err && <div role="alert" className="text-[14px] font-semibold mb-4">{err}</div>}
          <div className="flex gap-3">
            <button onClick={onClose} disabled={busy} autoFocus className="press flex-1 min-h-[52px] rounded-full text-[14px] font-medium" style={{border:"1px solid var(--line-2)", color:"var(--ink)", background:"transparent"}}>
              {cancelLabel}
            </button>
            <button onClick={confirm} disabled={busy} aria-busy={busy} className="press glow-primary flex-1 min-h-[52px] px-3 rounded-full text-[14px] font-semibold" style={{background:"var(--ice)", color:"var(--ice-ink)"}}>
              {busy ? "Saving…" : confirmLabel}
            </button>
          </div>
        </div>
      </>
    );
  }

  function Gone({ onBack, text="This event isn't here anymore.", action }){
    return (
      <div className="absolute inset-0 flex flex-col px-5 app-safe-top app-safe-bottom">
        <div><BackButton onClick={onBack}/></div>
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-5">
          <div className="text-[16px] font-medium">{text}</div>
          {action && <div className="w-full"><BigButton onClick={action[1]}>{action[0]}</BigButton></div>}
        </div>
      </div>
    );
  }

  /* ========== plain words and counts ========== */
  // ponytail: server errors are short codes; map the ones a venue can hit to plain words.
  const PLAIN_ERRORS = {
    "not pickable": "Already decided, maybe on another phone.",
    "not checkable": "Already checked in, or no longer confirmed. The list is updated.",
    "not markable": "Only confirmed guests can be marked as didn't come. The list is updated.",
    "not rateable": "Only guests who came or didn't come can be rated.",
    "rating 0-10": "That rating isn't allowed.",
    "lock applications before closing the night": "This event was already closed or cancelled, maybe on another phone.",
    "the night has not started": "You can close once the event has started.",
    "not editable": "This event can't be edited anymore.",
    "not cancellable": "This event can't be cancelled anymore.",
    "only drafts can be deleted": "Only drafts can be deleted.",
    "not yours": "This event belongs to another venue.",
  };
  const plainError = (error, fallback) => PLAIN_ERRORS[error?.message] || fallback;
  const plural = (n, one, many) => n + " " + (n === 1 ? one : many);
  const money = n => "$" + Number(n || 0).toLocaleString("en-US");

  // A pass saves nothing on the server (skip_applicant is a no-op), so this phone remembers it.
  // ponytail: per-phone memory; another phone still shows passed people. Upgrade: a server column.
  const demoPassed = new Map();
  function passedFor(eventId){
    if (DEMO_PREVIEW) return new Set(demoPassed.get(eventId) || []);
    try { return new Set(JSON.parse(localStorage.getItem("the-list:passed:" + eventId) || "[]")); }
    catch (_) { return new Set(); }
  }
  function savePassed(eventId, set){
    if (DEMO_PREVIEW) { demoPassed.set(eventId, [...set]); return; }
    try { localStorage.setItem("the-list:passed:" + eventId, JSON.stringify([...set])); } catch (_) {}
  }

  // A pick that dropped out: said no, ran out of time, or cancelled after being picked.
  const droppedOut = g => g.state === GS.declined || g.state === GS.expired || (g.state === GS.cancelled && !!g.code);

  // Picked, awaiting confirmation and confirmed stay three separate numbers everywhere.
  function tally(e){
    const guests = e.guests || [];
    const n = state => guests.filter(g => g.state === state).length;
    const passed = passedFor(e.id);
    const pool = e.stage === STAGE.locked ? GS.waitlist : GS.applied;
    const awaiting = n(GS.picked), confirmed = n(GS.confirmed), inside = n(GS.checkedIn), noShow = n(GS.noShow);
    const yes = confirmed + inside + noShow;
    return {
      waiting: guests.filter(g => g.state === pool && !passed.has(g.applicantId)).length,
      passed: guests.filter(g => g.state === pool && passed.has(g.applicantId)).length,
      waitlist: n(GS.waitlist), awaiting, confirmed, inside, noShow, yes,
      picked: awaiting + yes,
      coming: confirmed + inside,
      dropped: e.stage === STAGE.cancelled ? 0 : guests.filter(droppedOut).length,
    };
  }
  const running = e => e.stage === STAGE.open || e.stage === STAGE.locked;
  const needsReplacement = (e, t) => running(e) && t.dropped > 0 && t.picked < (e.seats || 0) && t.waiting + t.passed > 0;

  function startOf(e){
    const d = e.startsAt ? new Date(e.startsAt) : (e.date ? eventStart(e) : null);
    return d && !Number.isNaN(d.valueOf()) ? d : null;
  }

  // "today" | "over" | null. Demo mode keeps its frozen TODAY; live mode uses the clock.
  // "Today" also covers 6 hours before a start just after midnight and 12 hours after any start.
  function dayOf(e, today, live){
    if (!running(e)) return null;
    if (!live) return e.date === today ? "today" : null;
    const start = startOf(e), now = new Date();
    if (!start) return null;
    const since = now - start;
    if (toLocalDate(start) === toLocalDate(now) || (since > -6*HOUR && since < 12*HOUR)) return "today";
    return start < now ? "over" : null;
  }

  function statusLabel(e, day){
    if (e.stage === STAGE.draft) return "Draft";
    if (e.stage === STAGE.cancelled) return "Cancelled";
    if (e.stage === STAGE.past) return "Done";
    if (day === "today") return "Today";
    if (day === "over") return "Needs closing";
    return e.stage === STAGE.open ? "Taking requests" : "Requests closed";
  }

  function countLine(e, t, day){
    if (e.stage === STAGE.draft) return plural(e.seats || 0, "person", "people") + (e.bundle?.price ? " · " + money(e.bundle.price) : "");
    if (e.stage === STAGE.cancelled) return "Guests were told";
    if (e.stage === STAGE.past) return t.inside + " came · " + t.noShow + " didn't come";
    if (day) return t.coming + " coming" + (t.inside ? " · " + t.inside + " inside" : "");
    if (e.stage === STAGE.open) return t.waiting + " waiting";
    return t.yes + " confirmed of " + (e.seats || 0);
  }

  function closesLabel(e){
    if (!e.closesAt) return null;
    if (/before doors/.test(e.closesAt)) {
      const start = eventStart(e), closes = eventCloses(e, start);
      return closes && !Number.isNaN(closes.valueOf()) ? formatEventDateTime(closes) : e.closesAt;
    }
    const custom = /^\d{4}-\d{2}-\d{2}T/.test(e.closesAt) ? new Date(e.closesAt) : null;
    return custom && !Number.isNaN(custom.valueOf()) ? formatEventDateTime(custom) : e.closesAt;
  }

  function confirmNote(g){
    if (!g.pickExpiresAt) return "Waiting for them to confirm";
    const hours = Math.ceil((new Date(g.pickExpiresAt) - Date.now()) / HOUR);
    return hours > 0 ? plural(hours, "hour", "hours") + " left to confirm" : "Confirm window ended";
  }
  const dropNote = g => g.state === GS.declined ? "Said no" : g.state === GS.expired ? "Didn't confirm in time" : "Cancelled";

  // Home is a to-do list: one card per thing to do, most urgent first.
  function homeTasks(events, today, live){
    const tasks = [];
    const add = (rank, e, text, button, go) => tasks.push({ key: go + ":" + e.id, rank, e, text, button, go });
    for (const e of events) {
      const t = tally(e), day = dayOf(e, today, live);
      if (day === "today") add(0, e, e.title + " is today. " + t.coming + " coming.", "Open door list", "door");
      if (day === "over") add(1, e, e.title + " is over. Close it to get the summary.", "Open door list", "door");
      if (day !== "over" && needsReplacement(e, t)) add(2, e, plural(t.dropped, "pick", "picks") + " can't make it to " + e.title + ".", "Pick a replacement", "deck");
      if (running(e) && t.awaiting && !day) add(3, e, plural(t.awaiting, "pick hasn't", "picks haven't") + " confirmed " + e.title + " yet.", "See event", "event");
      if (e.stage === STAGE.open && t.waiting && day !== "over") add(4, e, plural(t.waiting, "person wants", "people want") + " in to " + e.title + ".", "Start picking", "deck");
      if (e.stage === STAGE.draft) add(5, e, e.title + " isn't posted yet.", "Finish posting", "post");
      if (e.stage === STAGE.past) {
        const inside = (e.guests || []).filter(g => g.state === GS.checkedIn);
        const verified = inside.filter(g => g.story === SS.verified).length;
        const storiesOpen = inside.some(g => g.story === SS.due || g.story === SS.review);
        const unpaid = e.invoice && e.invoice.status !== "paid";
        if (storiesOpen || unpaid) add(6, e, e.title + " is done. " + verified + " of " + plural(inside.length, "Story", "Stories") + " verified" + (unpaid ? ", bill " + e.invoice.status + "." : "."), "See summary", "summary");
      }
    }
    return tasks.sort((a, b) => a.rank - b.rank);
  }

  /* ========== Activity (demo rows are derived; live rows come from notifications) ========== */
  function venueNotifs(events){
    const rows = [];
    events.forEach(e => {
      const t = tally(e);
      if (e.stage === STAGE.open && t.waiting) rows.push({ id:"n-wait-"+e.id, text: e.title + ": " + plural(t.waiting, "person wants", "people want") + " in", eventId:e.id, action:"review" });
      if (e.stage === STAGE.locked && t.yes) rows.push({ id:"n-yes-"+e.id, text: e.title + ": " + t.yes + " confirmed", eventId:e.id, action:"event" });
      if (needsReplacement(e, t)) rows.push({ id:"n-drop-"+e.id, text: e.title + ": " + plural(t.dropped, "pick", "picks") + " can't make it", eventId:e.id, action:"review" });
      if (e.stage === STAGE.past) {
        const inside = (e.guests || []).filter(g => g.state === GS.checkedIn);
        const pending = inside.filter(g => g.story === SS.due || g.story === SS.review).length;
        if (pending) rows.push({ id:"n-story-"+e.id, text: e.title + ": " + inside.filter(g => g.story === SS.verified).length + " Stories verified, " + pending + " pending", eventId:e.id, action:"recap" });
        if (e.invoice && e.invoice.status !== "paid") rows.push({ id:"n-bill-"+e.id, text: e.title + ": bill " + e.invoice.status + ", " + money(e.invoice.price), eventId:e.id, action:"recap" });
      }
    });
    return rows;
  }

  function NotifSheet({ rows, events, onClose, onGo, onToast }){
    const open = r => {
      onClose();
      const evt = r.eventId ? events.find(e => e.id === r.eventId) : null;
      if (!evt) { onToast("Nothing to open for this update"); return; }
      onGo(r.action, evt);
    };
    return (
      <Sheet title="Activity" onClose={onClose}>
        <div className="space-y-2">
          {rows.length === 0 && <div className="card rounded-[14px] p-4 text-center text-[14px]">No activity yet</div>}
          {rows.map(r => (
            <button key={r.id} onClick={() => open(r)} className="press card w-full text-left rounded-[14px] px-4 py-3 min-h-[52px] flex items-center gap-3">
              {r.read === false && <span className="w-2 h-2 rounded-full shrink-0" style={{background:"var(--ice)"}} aria-label="New"/>}
              <span className="flex-1 text-[14px] leading-snug">{r.text}</span>
              <Icon name="arrow-right" size={14} stroke={1.8}/>
            </button>
          ))}
        </div>
      </Sheet>
    );
  }

  /* ========== Home ========== */
  function TaskCard({ task, onGo }){
    const photo = task.go === "door" ? task.e.heroImage?.src : null;
    return (
      <div className={"card rounded-[18px] overflow-hidden relative" + (photo ? " grain" : "")}>
        {photo && <>
          <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover"/>
          <div className="absolute inset-0" style={{background:"linear-gradient(180deg, rgba(0,0,0,.2) 0%, rgba(0,0,0,.86) 100%)"}}/>
        </>}
        <div className="relative p-4" style={photo ? {color:"#F7F6F3", paddingTop:96} : undefined}>
          <div className={photo ? "font-black font-display text-[22px] leading-tight" : "text-[16px] font-semibold leading-snug"}>{task.text}</div>
          <button onClick={onGo} aria-label={task.button + ", " + task.e.title}
            className="press mt-3 min-h-[44px] px-5 rounded-full text-[14px] font-semibold inline-flex items-center gap-2"
            style={photo ? {background:"#F7F6F3", color:"#000"} : {background:"var(--ice)", color:"var(--ice-ink)"}}>
            {task.button} <Icon name="arrow-right" size={14} stroke={1.8}/>
          </button>
        </div>
      </div>
    );
  }

  function ScreenHome({ venue, events, notifications, today, live, onTask, onPost, onGo, onToast, onNotifsOpened }){
    const [notifOpen, setNotifOpen] = useState(false);
    const tasks = homeTasks(events, today, live);
    const rows = live ? (notifications || []) : venueNotifs(events);
    const unread = live ? rows.filter(n => !n.read).length : rows.length;
    return (
      <div className="absolute inset-0 flex flex-col">
        <div className="flex-1 overflow-y-auto noscroll app-dock-space">
          <div className="app-safe-top px-5 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[13px] font-medium">Home</div>
              <h1 className="font-black font-display-l text-[30px] leading-[1.05] mt-1 line-clamp-2 break-words">{venue.name || "Your venue"}</h1>
            </div>
            <button onClick={() => setNotifOpen(true)} aria-label={unread > 0 ? "Activity, " + unread + " new" : "Activity"}
              className="press glass w-11 h-11 rounded-full flex items-center justify-center relative shrink-0">
              <Icon name="bell" size={18}/>
              {unread > 0 && <span aria-hidden="true" className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-semibold" style={{background:"var(--ice)", color:"var(--ice-ink)"}}>{unread}</span>}
            </button>
          </div>
          <div className="px-5 mt-5">
            <BigButton quiet onClick={onPost}><Icon name="plus" size={16} stroke={1.8}/> New event</BigButton>
          </div>
          <SectionHead label="To do" className="pt-7 pb-3"/>
          <div className="px-5 space-y-3 stagger">
            {tasks.length === 0 && (
              <div className="card rounded-[18px] p-5">
                <div className="text-[16px] font-semibold">Nothing to do right now.</div>
                <div className="text-[14px] mt-1">Post your next event and people can start asking to come.</div>
              </div>
            )}
            {tasks.map((task, i) => <div key={task.key} style={{"--i":i}}><TaskCard task={task} onGo={() => onTask(task)}/></div>)}
          </div>
        </div>
        {notifOpen && <NotifSheet rows={rows} events={events} onGo={onGo} onToast={onToast}
          onClose={() => { setNotifOpen(false); if (onNotifsOpened) onNotifsOpened(); }}/>}
      </div>
    );
  }

  /* ========== Events: one list ========== */
  function ScreenEvents({ events, today, live, onOpen, onPost }){
    const at = e => startOf(e)?.valueOf() || 0;
    const upcoming = events.filter(e => e.stage !== STAGE.past && e.stage !== STAGE.cancelled).sort((a, b) => at(a) - at(b));
    const past = events.filter(e => e.stage === STAGE.past || e.stage === STAGE.cancelled).sort((a, b) => at(b) - at(a));
    const row = e => {
      const t = tally(e), day = dayOf(e, today, live), status = statusLabel(e, day), line = countLine(e, t, day);
      return (
        <button key={e.id} onClick={() => onOpen(e)} aria-label={(e.title || "Untitled") + ", " + status + ", " + line}
          className="press card w-full text-left rounded-[16px] p-3 flex items-center gap-3">
          <FramedImage value={e.heroImage} ratio="4/5" radius={10} className="w-14 shrink-0"/>
          <div className="flex-1 min-w-0">
            <div className="font-black text-[17px] leading-tight line-clamp-2 break-words">{e.title || "Untitled"}</div>
            <div className="text-[12px] mt-1 break-words">{[e.date, e.time].filter(Boolean).join(" · ")}</div>
            <div className="text-[12px] mt-0.5 break-words">{line}</div>
          </div>
          <StatusPill label={status} tone={day === "today" || e.stage === STAGE.open ? "ice" : "outline"}/>
        </button>
      );
    };
    return (
      <div className="absolute inset-0 flex flex-col">
        <div className="shrink-0 px-5 app-safe-top pb-4">
          <h1 className="font-black font-display-l text-[34px] leading-none">Events</h1>
        </div>
        <div className="flex-1 overflow-y-auto noscroll px-5 pb-4">
          {upcoming.length === 0 && <div className="card rounded-[16px] p-5 text-[14px]">No upcoming events. Post one below.</div>}
          <div className="space-y-2.5">{upcoming.map(row)}</div>
          {past.length > 0 && <>
            <h2 className="section-label mt-7 mb-3">Past</h2>
            <div className="space-y-2.5">{past.map(row)}</div>
          </>}
        </div>
        <div className="shrink-0 px-5 pt-3 app-dock-space">
          <BigButton onClick={onPost}><Icon name="plus" size={16} stroke={1.8}/> New event</BigButton>
        </div>
      </div>
    );
  }

  /* ========== Event page ========== */
  function GuestGroup({ title, rows, note }){
    if (!rows.length) return null;
    return (
      <section className="mt-6">
        <div className="flex items-baseline justify-between mb-1">
          <h2 className="section-label">{title}</h2>
          <span className="text-[13px]">{rows.length}</span>
        </div>
        <ul style={{borderTop:"1px solid var(--line)"}}>
          {rows.map(g => {
            const ap = applicantById[g.applicantId] || {};
            return (
              <li key={g.applicantId} className="flex items-center gap-3 py-2.5" style={{borderBottom:"1px solid var(--line)"}}>
                <Avatar ap={ap} size={40}/>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium truncate">{ap.name || "Guest"}</div>
                  {note && <div className="text-[12px]">{note(g)}</div>}
                </div>
                {g.code && <span className="font-mono text-[12px] shrink-0">{g.code}</span>}
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  function EventDetails({ event }){
    const b = event.brief || {};
    const rows = [
      ["Price", event.bundle?.price ? money(event.bundle.price) + " for " + plural(event.seats || 0, "person", "people") + ", paid after the event" : "Not set"],
      ["Requests close", closesLabel(event) || "Not set"],
      ["Arrival", b.arrival || "Not set"],
      ["Dress code", b.dress], ["Meeting point", b.meeting], ["House rules", b.rules],
      ["Story", "1 Story and a venue tag within " + (event.storyHours || 24) + " hours of check-in"],
    ].filter(([, value]) => value);
    return (
      <dl className="card rounded-[16px] px-4 mt-6">
        {rows.map(([label, value], i) => (
          <div key={label} className="flex justify-between gap-4 py-3" style={i ? {borderTop:"1px solid var(--line)"} : undefined}>
            <dt className="text-[13px] font-semibold shrink-0">{label}</dt>
            <dd className="text-[13px] text-right">{value}</dd>
          </div>
        ))}
      </dl>
    );
  }

  // Shared by the event page and the deck, so the words never drift apart.
  function askCloseRequests(askConfirm, act, event, onToast, then){
    askConfirm({
      title: "Close requests?",
      body: "No one new can ask to come. People you haven't picked move to the waitlist, so you can still pick replacements. Picks keep their 24 hours to confirm.",
      confirmLabel: "Close requests",
      onConfirm: async () => {
        try { await act.closeRequests(event.id); }
        catch (error) { onToast(plainError(error, "Couldn't close requests. Try again.")); throw error; }
        onToast("Requests closed");
        if (then) then();
      },
    });
  }

  function ScreenEvent({ event, today, live, act, askConfirm, onToast, onBack, onDeck, onDoor, onSummary, onEdit }){
    if (!event) return <Gone onBack={onBack}/>;
    const t = tally(event), day = dayOf(event, today, live), status = statusLabel(event, day);
    const guests = event.guests || [];
    const replace = day !== "over" && needsReplacement(event, t);
    // If everyone left was passed on, the deck is still one tap away.
    const canPick = event.stage === STAGE.open && day !== "over" && (t.waiting || t.passed);
    const pickLabel = t.waiting ? "Pick people" : "Look again at the " + plural(t.passed, "person", "people") + " you passed on";
    const main = event.stage === STAGE.draft ? ["Finish posting", () => onEdit(event)]
      : event.stage === STAGE.past ? ["See summary", () => onSummary(event.id)]
      : day ? ["Open door list", () => onDoor(event.id)]
      : replace ? ["Pick a replacement", () => onDeck(event.id)]
      : canPick ? [pickLabel, () => onDeck(event.id)]
      : null;
    const extra = [
      replace && main?.[0] !== "Pick a replacement" && ["Pick a replacement", () => onDeck(event.id)],
      canPick && !replace && main?.[0] !== pickLabel && [pickLabel, () => onDeck(event.id)],
    ].filter(Boolean);
    const confirmed = guests.filter(g => [GS.confirmed, GS.checkedIn, GS.noShow].includes(g.state));
    const yesNote = g => g.state === GS.checkedIn ? "Inside" : g.state === GS.noShow ? "Didn't come" : "Coming";
    const guarded = (message, run, done, after) => async () => {
      try { await run(); } catch (error) { onToast(plainError(error, message)); throw error; }
      onToast(done);
      if (after) after();
    };
    return (
      <div className="absolute inset-0 flex flex-col">
        <div className="shrink-0 px-5 app-safe-top"><BackButton onClick={onBack}/></div>
        <div className="flex-1 min-h-0 overflow-y-auto noscroll px-5" style={{paddingBottom:"calc(env(safe-area-inset-bottom, 0px) + 32px)"}}>
          <div className="flex gap-4 items-start mt-1">
            <FramedImage value={event.heroImage} ratio="4/5" radius={14} className="w-24 shrink-0"/>
            <div className="min-w-0 pt-1">
              <StatusPill label={status} tone={day === "today" || event.stage === STAGE.open ? "ice" : "outline"}/>
              <h1 className="font-black font-display-l text-[28px] leading-[1.05] mt-2 break-words">{event.title || "Untitled"}</h1>
              <div className="text-[13px] mt-1">{[event.type, event.date, event.time].filter(Boolean).join(" · ")}</div>
            </div>
          </div>

          {event.stage !== STAGE.draft && <>
            <div className="grid grid-cols-3 gap-2 mt-5">
              <CountTile n={t.picked} label="Picked"/>
              <CountTile n={t.awaiting} label="Awaiting confirmation"/>
              <CountTile n={t.yes} label="Confirmed"/>
            </div>
            <div className="text-[13px] mt-2">
              {t.yes} of {plural(event.seats || 0, "seat", "seats")} confirmed
              {event.stage === STAGE.open ? " · " + t.waiting + " waiting" : event.stage === STAGE.locked ? " · " + t.waitlist + " on the waitlist" : ""}
            </div>
          </>}

          {(main || extra.length > 0) && <div className="mt-5 space-y-2">
            {main && <BigButton onClick={main[1]}>{main[0]} <Icon name="arrow-right" size={16} stroke={1.8}/></BigButton>}
            {extra.map(([label, go]) => <BigButton key={label} quiet onClick={go}>{label}</BigButton>)}
          </div>}

          <GuestGroup title="Confirmed" rows={confirmed} note={yesNote}/>
          <GuestGroup title="Awaiting confirmation" rows={guests.filter(g => g.state === GS.picked)} note={confirmNote}/>
          <GuestGroup title={event.stage === STAGE.cancelled ? "Told it's cancelled" : "Can't make it"} rows={guests.filter(droppedOut)} note={dropNote}/>

          <EventDetails event={event}/>

          <div className="mt-6 space-y-2">
            {(event.stage === STAGE.draft || event.stage === STAGE.open) &&
              <BigButton quiet onClick={() => onEdit(event)}>Edit event</BigButton>}
            {event.stage === STAGE.open &&
              <BigButton quiet onClick={() => askCloseRequests(askConfirm, act, event, onToast)}>Close requests</BigButton>}
            {running(event) && <BigButton quiet onClick={() => askConfirm({
              title: "Cancel this event?",
              body: "Everyone who asked, was picked or confirmed is told it's cancelled. This can't be undone.",
              confirmLabel: "Cancel event",
              onConfirm: guarded("Couldn't cancel. Try again.", () => act.cancelEvent(event.id), "Event cancelled. Guests were told."),
            })}>Cancel event</BigButton>}
            {event.stage === STAGE.draft && <BigButton quiet onClick={() => askConfirm({
              title: "Delete this draft?",
              body: "It's gone for good. No one was told about it.",
              confirmLabel: "Delete draft",
              onConfirm: guarded("Couldn't delete. Try again.", () => act.deleteDraft(event.id), "Draft deleted", onBack),
            })}>Delete draft</BigButton>}
          </div>
        </div>
      </div>
    );
  }

  /* ========== Picking: Tinder-style deck ========== */
  function ScreenReview({ event, act, askConfirm, onToast, onBack }){
    const isLocked = event.stage === STAGE.locked;
    const pool = isLocked ? GS.waitlist : GS.applied;
    const buildDeck = again => {
      const passed = passedFor(event.id);
      return (event.guests || [])
        .filter(g => g.state === pool && passed.has(g.applicantId) === again && applicantById[g.applicantId])
        .map(g => g.applicantId);
    };
    const [again, setAgain] = useState(false);
    // A snapshot: refreshes never reshuffle the cards under a moving finger.
    const [deck, setDeck] = useState(() => buildDeck(false));
    const [idx, setIdx] = useState(0);
    const [lastPass, setLastPass] = useState(null);   // { idx, id } – only a pass can be undone
    const [saving, setSaving] = useState(false);
    const [dx, setDx] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [sheetId, setSheetId] = useState(null);
    const busy = useRef(false), drag = useRef(null), moved = useRef(false), dxRef = useRef(0);
    const moveTo = x => { dxRef.current = x; setDx(x); };

    const current = deck[idx];
    const ap = current ? applicantById[current] : null;
    const name = ap?.name || "this person";

    // One decision at a time. A failed save snaps the card back and keeps the person.
    const decide = async yes => {
      if (!current || busy.current) return;
      busy.current = true; setSaving(true); moveTo(yes ? 150 : -150);
      try {
        if (yes) await act.pick(event.id, current);
        else {
          await act.pass(event.id, current);
          const passed = passedFor(event.id); passed.add(current); savePassed(event.id, passed);
        }
        setLastPass(yes ? null : { idx, id: current });
        setIdx(i => i + 1);
      } catch (error) {
        onToast(plainError(error, "That didn't save. " + name + " is still here."));
        if (error?.message === "not pickable") setIdx(i => i + 1);
      } finally {
        busy.current = false; setSaving(false); moveTo(0);
      }
    };

    // Undo only goes back after a pass, because a pass saved nothing. A pick already told the member.
    const undo = () => {
      if (!lastPass || busy.current) return;
      const passed = passedFor(event.id); passed.delete(lastPass.id); savePassed(event.id, passed);
      setIdx(lastPass.idx); setLastPass(null);
    };

    const lookAgain = () => { setAgain(true); setDeck(buildDeck(true)); setIdx(0); setLastPass(null); };

    useEffect(() => {
      const onKey = e => {
        // A held key or a browser shortcut (Alt+Arrow is Back/Forward) must never pick anyone.
        if (e.repeat || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
        if (sheetId || e.target.closest?.("input, textarea, select, [role=dialog]")) return;
        if (e.key === "ArrowRight") { e.preventDefault(); decide(true); }
        if (e.key === "ArrowLeft") { e.preventDefault(); decide(false); }
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    });

    // Horizontal drags decide; vertical ones are left to the page (touch-action: pan-y).
    const onDown = e => {
      if (busy.current || !e.isPrimary || (e.pointerType === "mouse" && e.button !== 0)) return;
      drag.current = { x:e.clientX, y:e.clientY, id:e.pointerId, axis:null };
      moved.current = false;
    };
    const onMove = e => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      const mx = e.clientX - d.x, my = e.clientY - d.y;
      if (!d.axis) {
        if (Math.abs(mx) < 10 && Math.abs(my) < 10) return;
        d.axis = Math.abs(mx) > Math.abs(my) ? "x" : "y";
        moved.current = true;   // any real drag, even a vertical one, must not end in a tap
        if (d.axis === "y") { drag.current = null; return; }
        setDragging(true);
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
      }
      moveTo(mx);
    };
    const onUp = e => {
      const d = drag.current;
      if (d && d.id !== e.pointerId) return;   // a second finger never ends the first finger's drag
      drag.current = null; setDragging(false);
      if (!d || d.axis !== "x") return;
      const line = Math.min(120, e.currentTarget.offsetWidth * 0.28);
      if (Math.abs(dxRef.current) >= line) decide(dxRef.current > 0); else moveTo(0);
    };
    const onCancel = e => { if (drag.current && drag.current.id !== e.pointerId) return; drag.current = null; setDragging(false); if (!busy.current) moveTo(0); };
    // A drag must never open the profile or follow a social link.
    const onClickCapture = e => { if (moved.current) { e.preventDefault(); e.stopPropagation(); moved.current = false; } };

    const t = tally(event);
    // People who asked after this deck opened: offered at the end instead of claiming everyone was seen.
    const passedNow = passedFor(event.id);
    const fresh = (event.guests || []).filter(g => g.state === pool && !deck.includes(g.applicantId)
      && !passedNow.has(g.applicantId) && applicantById[g.applicantId]).map(g => g.applicantId);
    const picked = (event.guests || []).filter(g => [GS.picked, GS.confirmed, GS.checkedIn, GS.noShow].includes(g.state));
    const gender = sex => picked.filter(g => applicantById[g.applicantId]?.gender === sex).length;
    const left = Math.max(0, deck.length - idx);
    const stamp = { position:"absolute", top:20, zIndex:20, padding:"6px 12px", borderRadius:10, fontSize:20, fontWeight:900, border:"2px solid #F7F6F3", color:"#F7F6F3", background:"rgba(0,0,0,.25)" };
    const undoButton = lastPass && (
      <button onClick={undo} aria-label={"Undo pass on " + (applicantById[lastPass.id]?.name || "the last person")}
        className="press min-h-[44px] px-4 rounded-full text-[13px] font-medium inline-flex items-center gap-2" style={{border:"1px solid var(--line-2)"}}>
        <Icon name="arrow-left" size={14} stroke={1.8}/> Undo pass
      </button>
    );

    return (
      <div className="absolute inset-0 flex flex-col">
        <div className="shrink-0 px-5 app-safe-top">
          <div className="flex items-center justify-between gap-3">
            <BackButton onClick={onBack}/>
            {current && <span className="text-[13px]">{left} left to see</span>}
          </div>
          <h1 className="font-black font-display-l text-[24px] leading-tight mt-1 truncate">{event.title}</h1>
          <div className="text-[13px] mt-1">
            {isLocked ? "Replacements · " : ""}Picked {t.picked} of {event.seats || 0} · {t.yes} confirmed
            {event.mix ? " · Girls " + gender("female") + " of " + event.mix.girls + " · Guys " + gender("male") + " of " + event.mix.guys : ""}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto noscroll px-5 pt-4" style={{paddingBottom:"calc(env(safe-area-inset-bottom, 0px) + 20px)"}}>
          {!ap ? (
            <div className="flex flex-col items-center text-center gap-3 pt-8">
              <div className="font-black font-display-l text-[26px] leading-tight">
                {fresh.length ? plural(fresh.length, "new person wants", "new people want") + " in."
                  : isLocked && !t.waitlist ? "No one left on the waitlist." : "You've seen everyone."}
              </div>
              <div className="text-[14px]">Picked {t.picked} of {event.seats || 0} · {t.yes} confirmed</div>
              {undoButton}
              <div className="w-full flex flex-col gap-2 mt-3">
                {fresh.length > 0 && <BigButton onClick={() => { setAgain(false); setDeck(fresh); setIdx(0); setLastPass(null); }}>See the {plural(fresh.length, "new person", "new people")}</BigButton>}
                {!again && t.passed > 0 && <BigButton quiet onClick={lookAgain}>Look again at the {plural(t.passed, "person", "people")} you passed on</BigButton>}
                {event.stage === STAGE.open && <BigButton quiet onClick={() => askCloseRequests(askConfirm, act, event, onToast, onBack)}>Close requests</BigButton>}
                <BigButton onClick={onBack}>Done</BigButton>
              </div>
            </div>
          ) : (
            <>
              <div role="group" aria-roledescription="swipe card" aria-label={name + ", drag right to pick, left to pass"}
                onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onCancel} onClickCapture={onClickCapture}
                className="relative select-none mx-auto"
                // ponytail: shrink the card on short phones so Pass and Pick stay near the fold; 260px keeps it readable.
                style={{width:"min(100%, max(260px, calc((var(--app-height, 100dvh) - 300px) * .8)))", touchAction:"pan-y",
                  transform:"translateX(" + dx + "px) rotate(" + (dx / 22) + "deg)", transition: dragging ? "none" : "transform .22s ease"}}>
                <SwipeCard a={ap}/>
                <button className="absolute inset-x-0 top-0 z-10" style={{bottom:CARD_LINK_ZONE, background:"transparent", border:"none"}}
                  onClick={() => { if (!busy.current) setSheetId(current); }} aria-label={"View " + name}/>
                <span aria-hidden="true" style={{...stamp, left:20, transform:"rotate(-12deg)", opacity:Math.max(0, Math.min(1, dx / 100))}}>PICK</span>
                <span aria-hidden="true" style={{...stamp, right:20, transform:"rotate(12deg)", opacity:Math.max(0, Math.min(1, -dx / 100))}}>PASS</span>
                {saving && <span className="absolute inset-x-0 z-20 text-center text-[14px] font-semibold" style={{bottom:CARD_LINK_ZONE + 16, color:"#F7F6F3"}}>Saving…</span>}
              </div>
              <div className="flex items-start justify-center gap-12 mt-5">
                <div className="flex flex-col items-center gap-1.5">
                  <button onClick={() => decide(false)} aria-disabled={saving} aria-label={"Pass on " + name}
                    className="press w-16 h-16 rounded-full flex items-center justify-center" style={{border:"1px solid var(--line-2)"}}>
                    <Icon name="x" size={26}/>
                  </button>
                  <span aria-hidden="true" className="text-[13px] font-medium">Pass</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <button onClick={() => decide(true)} aria-disabled={saving} aria-label={"Pick " + name}
                    className="press glow-primary w-16 h-16 rounded-full flex items-center justify-center" style={{background:"var(--ice)", color:"var(--ice-ink)"}}>
                    <Icon name="check" size={26}/>
                  </button>
                  <span aria-hidden="true" className="text-[13px] font-medium">Pick</span>
                </div>
              </div>
              {undoButton && <div className="flex justify-center mt-3">{undoButton}</div>}
              <p className="text-[12px] text-center mt-3 leading-snug">Swipe right to pick, left to pass. A pick tells them right away, so it can't be undone.</p>
            </>
          )}
        </div>

        {sheetId && applicantById[sheetId] && (
          <ApplicantSheet applicant={applicantById[sheetId]}
            onDecide={yes => { const shown = sheetId; setSheetId(null); if (shown === current) decide(yes); }}
            onClose={() => setSheetId(null)}/>
        )}
      </div>
    );
  }

  /* ========== Door list ========== */
  function DoorGroup({ title, rows, empty, render }){
    if (!rows.length && !empty) return null;
    return (
      <section className="mb-5">
        <h2 className="section-label mb-1">{title} · {rows.length}</h2>
        {rows.length === 0 ? <div className="text-[14px] py-3">{empty}</div> : (
          <ul>
            {rows.map(g => <li key={g.applicantId} className="flex items-center gap-3 py-2" style={{borderBottom:"1px solid var(--line)"}}>{render(g)}</li>)}
          </ul>
        )}
      </section>
    );
  }

  function ScreenDoor({ event, live, act, askConfirm, onToast, onBack, onRefresh, onClosed, onSummary }){
    const [query, setQuery] = useState("");
    const [busy, setBusy] = useState({});          // applicantId -> true while its save runs
    const [sheetFor, setSheetFor] = useState(null);
    const [closing, setClosing] = useState(false);   // the close dialog lives here so its count follows every poll
    const countRef = useRef(null);
    const polling = !!event && running(event);

    // Two phones on one login: realtime only carries notifications, so the list polls while open.
    // ponytail: 5-second poll of the whole venue. Upgrade: publish applications to realtime.
    useEffect(() => {
      if (!onRefresh || !polling) return;
      const timer = setInterval(onRefresh, 5000);
      const wake = () => { if (document.visibilityState === "visible") onRefresh(); };
      document.addEventListener("visibilitychange", wake);
      return () => { clearInterval(timer); document.removeEventListener("visibilitychange", wake); };
    }, [onRefresh, polling]);

    if (!event) return <Gone onBack={onBack}/>;
    if (event.stage === STAGE.past) return <Gone onBack={onBack} text="This event is closed." action={["See summary", () => onSummary(event.id)]}/>;
    if (event.stage === STAGE.cancelled) return <Gone onBack={onBack} text="This event was cancelled."/>;

    const guests = event.guests || [];
    const name = g => applicantById[g.applicantId]?.name || "Guest";
    const first = g => name(g).split(" ")[0];
    const q = query.trim().toLowerCase();
    const match = g => !q || (name(g) + " " + (g.code || "")).toLowerCase().includes(q);
    const az = (a, b) => name(a).localeCompare(name(b));
    const expected = guests.filter(g => g.state === GS.confirmed).sort(az);
    const inside = guests.filter(g => g.state === GS.checkedIn).sort(az);
    const noShows = guests.filter(g => g.state === GS.noShow).sort(az);
    const awaiting = guests.filter(g => g.state === GS.picked).length;
    const start = startOf(event);
    const canClose = !live || (start && start <= new Date());

    const checkIn = async g => {
      if (busy[g.applicantId]) return;
      setBusy(b => ({ ...b, [g.applicantId]: true }));
      try { await act.checkIn(event.id, g.applicantId); onToast(first(g) + " is inside"); }
      catch (error) { onToast(plainError(error, "That didn't save. Try again.")); if (onRefresh) onRefresh(); }
      finally {
        setBusy(b => { const next = { ...b }; delete next[g.applicantId]; return next; });
        // The row just moved away; keep keyboard and screen reader focus on the page.
        setTimeout(() => { if (document.activeElement === document.body) countRef.current?.focus(); }, 60);
      }
    };

    const markNoShow = g => askConfirm({
      title: "Mark " + first(g) + " as didn't come?",
      body: "It goes on their record and can't be undone.",
      confirmLabel: "Mark as didn't come",
      onConfirm: async () => {
        try { await act.noShow(event.id, g.applicantId); }
        catch (error) { onToast(plainError(error, "That didn't save. Try again.")); if (onRefresh) onRefresh(); throw error; }
        onToast(first(g) + " marked as didn't come");
      },
    });

    const closeEvent = () => { setClosing(true); if (onRefresh) onRefresh(); };
    const closeBody = (expected.length
        ? plural(expected.length, "confirmed guest hasn't", "confirmed guests haven't") + " checked in. They'll be marked as didn't come."
        : "No confirmed guests are left to check in.")
      + (awaiting ? " " + plural(awaiting, "pick is", "picks are") + " still awaiting confirmation and stay as they are." : "")
      + (event.stage === STAGE.open ? " Requests close too." : "")
      + " Stories, optional ratings and the bill are in the summary.";
    const confirmClose = async () => {
      try { await act.closeNight(event); }
      catch (error) { onToast(plainError(error, "Couldn't close the event. Try again.")); if (onRefresh) onRefresh(); throw error; }
      onToast("Event closed");
      onClosed(event.id);
    };

    return (
      <div className="absolute inset-0 flex flex-col">
        <div className="shrink-0 px-5 app-safe-top">
          <BackButton onClick={onBack}/>
          <h1 className="font-black font-display-l text-[30px] leading-none mt-1">Door list</h1>
          <div className="text-[13px] mt-1.5 truncate">{[event.title, event.date, event.time].filter(Boolean).join(" · ")}</div>
          <div ref={countRef} tabIndex={-1} className="text-[16px] font-semibold mt-3" aria-live="polite">{inside.length} of {inside.length + expected.length} inside</div>
          {awaiting > 0 && <div className="text-[12px] mt-0.5">{plural(awaiting, "pick is", "picks are")} still awaiting confirmation</div>}
          <input type="search" value={query} onChange={e => setQuery(e.target.value)} aria-label="Search guests"
            placeholder="Search name or code" className={inputCls + " mt-3"} style={inputStyle}/>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto noscroll px-5 pt-4 pb-2">
          <DoorGroup title="Expected" rows={expected.filter(match)} empty={q ? "No one matches." : "No one left to check in."} render={g => (
            <>
              <button onClick={() => setSheetFor(g)} aria-label={"Options for " + name(g)} className="press flex-1 min-w-0 min-h-[44px] flex items-center gap-3 text-left">
                <Avatar ap={applicantById[g.applicantId] || {}}/>
                <span className="min-w-0">
                  <span className="block text-[15px] font-medium truncate">{name(g)}</span>
                  <span className="block font-mono text-[12px]">{g.code || "No code"}</span>
                </span>
              </button>
              <button onClick={() => checkIn(g)} disabled={!!busy[g.applicantId]} aria-label={"Here, check in " + name(g)}
                className="press min-h-[44px] min-w-[76px] px-5 rounded-full text-[14px] font-semibold shrink-0" style={{background:"var(--ice)", color:"var(--ice-ink)"}}>
                {busy[g.applicantId] ? "…" : "Here"}
              </button>
            </>
          )}/>
          <DoorGroup title="Inside" rows={inside.filter(match)} render={g => (
            <>
              <Avatar ap={applicantById[g.applicantId] || {}} size={40}/>
              <span className="flex-1 min-w-0 text-[15px] font-medium truncate">{name(g)}</span>
              <span className="text-[12px] shrink-0">{g.inAt ? "In at " + g.inAt : "Inside"}</span>
            </>
          )}/>
          <DoorGroup title="Didn't come" rows={noShows.filter(match)} render={g => (
            <>
              <Avatar ap={applicantById[g.applicantId] || {}} size={40}/>
              <span className="flex-1 min-w-0 text-[15px] font-medium truncate">{name(g)}</span>
            </>
          )}/>
        </div>

        <div className="shrink-0 px-5 pt-3" style={{paddingBottom:"calc(env(safe-area-inset-bottom, 0px) + 16px)"}}>
          <BigButton quiet onClick={closeEvent} disabled={!canClose}>Close the event</BigButton>
          {!canClose && <div className="text-[12px] text-center mt-2">You can close it once it starts{event.time ? " at " + event.time : ""}.</div>}
        </div>

        {sheetFor && (
          <Sheet title={name(sheetFor)} onClose={() => setSheetFor(null)}>
            <div className="text-[14px] mb-4">Pass code <span className="font-mono">{sheetFor.code || "none"}</span></div>
            <BigButton quiet onClick={() => { const g = sheetFor; setSheetFor(null); markNoShow(g); }}>Mark as didn't come</BigButton>
          </Sheet>
        )}
        {closing && <ConfirmDialog title="Close the event?" body={closeBody} confirmLabel="Close the event"
          onConfirm={confirmClose} onClose={() => setClosing(false)}/>}
      </div>
    );
  }

  /* ========== Summary: attendance, Stories and the bill together ========== */
  const RATINGS = [["Great", 9], ["Fine", 6], ["Problem", 3]];
  const ratingWord = r => r == null ? null : r >= 7.5 ? "Great" : r >= 4.5 ? "Fine" : "Problem";
  const STORY_WORDS = { [SS.verified]:"Story verified", [SS.review]:"Story under review", [SS.needsReview]:"Story under review",
    [SS.due]:"Story due", [SS.rejected]:"Story not posted", [SS.missed]:"Story not posted" };

  function ScreenSummary({ event, act, onToast, onBack }){
    const [busy, setBusy] = useState({});
    if (!event) return <Gone onBack={onBack}/>;
    const guests = event.guests || [];
    const inside = guests.filter(g => g.state === GS.checkedIn);
    const noShows = guests.filter(g => g.state === GS.noShow);
    const story = s => inside.filter(g => g.story === s).length;
    const verified = story(SS.verified), review = story(SS.review) + story(SS.needsReview), due = story(SS.due);
    const rejected = inside.filter(g => g.story === SS.rejected && g.storyMedia).length;   // posted, turned down in review
    const notPosted = story(SS.rejected) + story(SS.missed) - rejected;
    const followers = inside.filter(g => g.story === SS.verified)
      .reduce((sum, g) => sum + (applicantById[g.applicantId]?.instagram_followers || 0), 0);
    const invoice = event.invoice || (event.bundle ? { bundle: event.bundle.name, price: event.bundle.price, status: "pending" } : null);
    const billWord = { pending:"Pending", invoiced:"Invoiced", paid:"Paid" }[invoice?.status] || "Pending";

    // Ratings are optional and can happen any time after the event. Nobody steps through a queue.
    const rate = async (g, value) => {
      if (busy[g.applicantId]) return;
      setBusy(b => ({ ...b, [g.applicantId]: true }));
      try { await act.rate(event.id, g.applicantId, value); onToast("Rating saved"); }
      catch (error) { onToast(plainError(error, "Couldn't save the rating. Try again.")); }
      finally { setBusy(b => { const next = { ...b }; delete next[g.applicantId]; return next; }); }
    };

    return (
      <div className="absolute inset-0 flex flex-col">
        <div className="shrink-0 px-5 app-safe-top">
          <BackButton onClick={onBack}/>
          <div className="text-[13px] font-medium mt-1">Summary</div>
          <h1 className="font-black font-display-l text-[30px] leading-tight break-words">{event.title}</h1>
          <div className="text-[13px] mt-1">{[event.date, event.time].filter(Boolean).join(" · ")}</div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto noscroll px-5 pt-2" style={{paddingBottom:"calc(env(safe-area-inset-bottom, 0px) + 32px)"}}>
          <h2 className="section-label mt-5 mb-3">Attendance</h2>
          <div className="grid grid-cols-3 gap-2">
            <CountTile n={inside.length + noShows.length} label="Confirmed"/>
            <CountTile n={inside.length} label="Came"/>
            <CountTile n={noShows.length} label="Didn't come"/>
          </div>

          <h2 className="section-label mt-7 mb-2">Stories</h2>
          <div className="text-[15px] font-semibold">{verified} of {plural(inside.length, "Story", "Stories")} verified</div>
          <div className="text-[13px] mt-1">{review} under review · {due} due · {notPosted} not posted{rejected ? " · " + rejected + " rejected" : ""}</div>
          <div className="card rounded-[16px] p-4 mt-3">
            <div className="text-[13px] font-semibold">Followers of verified posters</div>
            <div className="font-black font-mono text-[28px] leading-none mt-2">{fmtCount(followers)}</div>
            <div className="text-[12px] mt-2">A follower count, not measured reach.</div>
          </div>

          <h2 className="section-label mt-7 mb-2">Bill</h2>
          {invoice ? (
            <div className="card rounded-[16px] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-[24px] leading-none">{money(invoice.price)}</div>
                  <div className="text-[13px] mt-1.5">{invoice.bundle}</div>
                </div>
                <StatusPill label={billWord} tone={invoice.status === "paid" ? "neutral" : "outline"}/>
              </div>
              {invoice.status !== "paid" && <div className="text-[13px] mt-3 leading-snug">The List will contact you to settle by Whish, OMT or USD cash.</div>}
            </div>
          ) : <div className="text-[14px]">No bill for this event.</div>}

          <h2 className="section-label mt-7">Rate guests (optional)</h2>
          <div className="text-[13px] mt-1 mb-2 leading-snug">Skip anyone. Guests see their average venue rating.</div>
          <ul style={{borderTop:"1px solid var(--line)"}}>
            {[...inside, ...noShows].map(g => {
              const ap = applicantById[g.applicantId] || {};
              const current = ratingWord(g.rating);
              return (
                <li key={g.applicantId} className="py-3" style={{borderBottom:"1px solid var(--line)"}}>
                  <div className="flex items-center gap-3">
                    <Avatar ap={ap} size={40}/>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium truncate">{ap.name || "Guest"}</div>
                      <div className="text-[12px]">{g.state === GS.noShow ? "Didn't come" : (g.story === SS.rejected && g.storyMedia ? "Story rejected" : STORY_WORDS[g.story]) || "Came"}</div>
                    </div>
                    {g.story === SS.verified && g.storyMedia && (
                      <a href={g.storyMedia} target="_blank" rel="noreferrer" className="press min-h-[44px] px-3 inline-flex items-center text-[13px] font-medium underline shrink-0">See Story</a>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2" role="group" aria-label={"Rate " + (ap.name || "guest")}>
                    {RATINGS.map(([word, value]) => (
                      <Chip key={word} on={current === word} label={word + " for " + (ap.name || "guest")} onClick={() => rate(g, value)}>
                        {word}
                      </Chip>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
          {inside.length + noShows.length === 0 && <div className="text-[14px] py-3">No one to rate.</div>}
        </div>
      </div>
    );
  }

  /* ========== Venue tab ========== */
  function DemoPanel({ demo }){
    const [open, setOpen] = useState(false);
    const Row = ({ label, onTap }) => (
      <button onClick={onTap} className="press w-full text-left min-h-[48px] text-[14px]" style={{borderTop:"1px solid var(--line)"}}>{label}</button>
    );
    return (
      <div className="px-5 pt-6 pb-2">
        <button onClick={() => setOpen(o => !o)} aria-expanded={open} className="press w-full min-h-[44px] flex items-center justify-between text-[13px] font-medium">
          <span>Demo controls</span>
          <Icon name="arrow-right" size={14} stroke={1.5} className={"chev " + (open ? "rotate-90" : "")}/>
        </button>
        {open && (
          <div>
            <Row label="New people want in" onTap={() => demo.newApplicants()}/>
            <Row label="A pick drops out" onTap={() => demo.pickDeclines()}/>
            <Row label="Make Late Lounge today" onTap={() => demo.advanceToTonight()}/>
            <Row label="Reset demo" onTap={() => demo.reset()}/>
          </div>
        )}
      </div>
    );
  }

  function ScreenVenueProfile({ venue, onEdit, onLogout, demo, light, onTheme }){
    const handle = (venue.igHandle || "").replace(/^@/, "");
    const Row = ({ label, onTap }) => (
      <button onClick={onTap} className="press w-full min-h-[52px] flex items-center justify-between text-left" style={{borderTop:"1px solid var(--line)"}}>
        <span className="text-[15px]">{label}</span>
        <Icon name="arrow-right" size={15} stroke={1.5}/>
      </button>
    );
    return (
      <div className="absolute inset-0 flex flex-col">
        <div className="shrink-0 px-5 app-safe-top pb-4">
          <h1 className="font-black font-display-l text-[34px] leading-none">Venue</h1>
        </div>
        <div className="flex-1 overflow-y-auto noscroll app-dock-space">
          <div className="px-5 flex gap-4 items-start">
            <FramedImage value={venue.heroImage} ratio="4/5" radius={14} className="w-28 shrink-0"/>
            <div className="min-w-0 pt-1">
              <div className="font-black text-[22px] leading-tight break-words">{venue.name || "Unnamed venue"}</div>
              <div className="text-[13px] mt-1">{venue.type} · {venue.area}</div>
              {handle && <a href={"https://instagram.com/" + handle} target="_blank" rel="noreferrer" className="press inline-flex items-center min-h-[44px] text-[13px] font-medium underline">@{handle}</a>}
            </div>
          </div>
          {venue.description && <p className="px-5 mt-4 text-[14px] leading-relaxed">{venue.description}</p>}
          <div className="px-5 pt-5">
            <div className="grid grid-cols-4 gap-2">
              {venue.images.map((im, i) => <FramedImage key={i} value={im} ratio="4/5" className="w-full" empty="–"/>)}
            </div>
          </div>
          <div className="px-5 pt-6">
            <h2 className="section-label mb-2">Settings</h2>
            <Row label="Edit venue" onTap={onEdit}/>
            <div style={{borderTop:"1px solid var(--line)"}}><Switch label="Dark mode" on={!light} onChange={onTheme}/></div>
            <Row label="Switch to member" onTap={() => { window.location.href = "/"; }}/>
            <Row label="Log out" onTap={onLogout}/>
          </div>
          {demo && <DemoPanel demo={demo}/>}
        </div>
      </div>
    );
  }

  /* ========== Three tabs: Home, Events, Venue ========== */
  function VenueTabBar({ tab, onTab }){
    const items = [
      { id:"home",   icon:"home",                label:"Home" },
      { id:"events", icon:"calendar",            label:"Events" },
      { id:"venue",  icon:"building-storefront", label:"Venue" },
    ];
    return (
      <div className="tabbar" role="navigation" aria-label="Venue navigation" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
        {items.map(it => {
          const active = tab === it.id;
          return (
            <button key={it.id} onClick={() => onTab(it.id)} aria-current={active ? "page" : undefined} className={"press " + (active ? "active" : "")}>
              <Icon name={it.icon} size={20} stroke={1.5}/>
              <span>{it.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  /* ========== New event: one screen ========== */
  const BUNDLES = [
    { id:"ten",    name:"The ten",    seats:10, price:400 },
    { id:"twenty", name:"The twenty", seats:20, price:700 },
    { id:"forty",  name:"The forty",  seats:40, price:1200 },
  ];
  const CLOSE_CHOICES = [["24h before doors", "1 day before"], ["2h before doors", "2 hours before"]];

  function ScreenPostEvent({ venue, onPublish, onSaveDraft, onCancel, initialDraft, draftId, live=false }){
    const editingOpen = initialDraft?.stage === STAGE.open;
    const [saving, setSaving] = useState(null);
    const [cropping, setCropping] = useState(false);
    const [draft, setDraft] = useState(() => {
      if (initialDraft) return {
        ...initialDraft,
        date: live && initialDraft.startsAt ? toLocalDate(new Date(initialDraft.startsAt)) : initialDraft.date,
        time: live && initialDraft.startsAt ? toLocalTime(new Date(initialDraft.startsAt)) : initialDraft.time,
        closesAt: initialDraft.closesInput || initialDraft.closesAt || "24h before doors",
        bundle: initialDraft.bundle || { name:"Custom", price:0 },
        seats: initialDraft.seats || 20,
      };
      return makeEvent({ venueId: venue.id, type: venue.type || "Club", heroImage: venue.heroImage,
        closesAt:"24h before doors", bundle:{ name:"The twenty", price:700 }, seats:20, mix:null });
    });
    const set = patch => setDraft(d => ({ ...d, ...patch }));
    const brief = draft.brief || {};
    const setBrief = patch => set({ brief: { ...brief, ...patch } });
    const custom = draft.bundle?.name === "Custom";
    const customClose = !CLOSE_CHOICES.some(([value]) => value === draft.closesAt);
    const setSeats = seats => set({ seats, mix: draft.mix ? { girls: Math.min(draft.mix.girls, seats), guys: seats - Math.min(draft.mix.girls, seats) } : null });

    // Real times, so the venue sees exactly when requests close. Live checks them against the clock.
    const starts = draft.date && draft.time ? eventStart(draft) : null;
    const startsOk = !!starts && !Number.isNaN(starts.valueOf());
    const closes = startsOk ? eventCloses(draft, starts) : null;
    const closesOk = !!closes && !Number.isNaN(closes.valueOf());
    const now = new Date();
    const problem = !startsOk ? (draft.date && draft.time ? "Use a real date and time." : null)
      : !closesOk ? "Pick when requests close."
      : closes >= starts ? "Requests must close before the event starts."
      : live && starts <= now ? "That start time has already passed."
      : live && closes <= now ? "That close time has already passed. Pick 2 hours before, or your own time."
      : null;
    const shortNotice = live && startsOk && starts - now < 24*HOUR;
    const price = draft.bundle?.price || 0;
    const basics = draft.title.trim().length >= 2 && startsOk;
    const ready = basics && !problem && draft.seats >= 1 && price > 0;

    const persist = async mode => {
      if (saving || (mode === "publish" ? !ready : !basics)) return;
      setSaving(mode);
      try { await (mode === "publish" ? onPublish : onSaveDraft)(draft, draftId); }
      catch (_) { /* the app shows why and keeps the form open */ }
      finally { setSaving(null); }
    };

    if (cropping) return (
      <div className="absolute inset-0 flex flex-col px-5 app-form-scroll" style={{paddingTop:"calc(env(safe-area-inset-top, 0px) + 16px)", paddingBottom:"calc(env(safe-area-inset-bottom, 0px) + 24px)"}}>
        <ImageCropper ratio="4/5" value={draft.heroImage} label="Event photo"
          onChange={value => { set({ heroImage:value }); setCropping(false); }} onCancel={() => setCropping(false)}/>
      </div>
    );

    const check = [
      ["Price", price ? money(price) + " for " + plural(draft.seats, "person", "people") + ". Paid after the event by Whish, OMT or cash." : "Add a price."],
      ["Requests close", closesOk ? formatEventDateTime(closes) : "Not set"],
      ["Arrival", brief.arrival || "Not set. Add it under More details."],
      ["Story", "Each guest posts 1 Story and tags the venue within " + (draft.storyHours || 24) + " hours of checking in."],
      ["Confirming", shortNotice ? "People you pick get 24 hours to confirm, even though the event starts sooner. Pick early." : "People you pick get 24 hours to confirm."],
    ];

    return (
      <div className="absolute inset-0 flex flex-col">
        <div className="shrink-0 px-5 app-safe-top pb-2">
          <BackButton onClick={onCancel} label="Cancel"/>
          <h1 className="font-black font-display-l text-[30px] leading-none mt-1">{initialDraft ? "Edit event" : "New event"}</h1>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto noscroll app-form-scroll px-5 pt-3 space-y-6" style={{paddingBottom:"calc(env(safe-area-inset-bottom, 0px) + 24px)"}}>
          <div className="flex items-end gap-4">
            <FramedImage value={draft.heroImage} ratio="4/5" radius={14} className="w-24 shrink-0" empty="No photo"/>
            <div className="pb-1">
              <div className="text-[13px] font-semibold">Photo</div>
              <div className="text-[12px] mt-0.5">Your venue photo is used unless you change it.</div>
              <button onClick={() => setCropping(true)} className="press mt-2 min-h-[44px] px-4 rounded-full text-[13px] font-medium" style={{border:"1px solid var(--line-2)"}}>Change photo</button>
            </div>
          </div>

          <Field label="Event name">
            <input value={draft.title} onChange={e => set({ title:e.target.value })} placeholder="e.g. Pool Day" className={inputCls} style={inputStyle}/>
          </Field>

          <ChoiceGroup label="Type">
            {VENUE_TYPES.map(type => <Chip key={type} on={draft.type === type} onClick={() => set({ type })}>{type}</Chip>)}
          </ChoiceGroup>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Date">
              <input value={draft.date} onChange={e => set({ date:e.target.value })} type={live ? "date" : "text"}
                placeholder={live ? undefined : "Sun · 25 May"} className={inputCls} style={inputStyle}/>
            </Field>
            <Field label="Start time">
              <input value={draft.time} onChange={e => set({ time:e.target.value })} type={live ? "time" : "text"}
                placeholder={live ? undefined : "22:00"} className={inputCls} style={inputStyle}/>
            </Field>
          </div>

          <div>
            <ChoiceGroup label="How many people">
              {BUNDLES.map(b => (
                <Chip key={b.id} on={draft.bundle?.name === b.name}
                  onClick={() => { set({ bundle:{ name:b.name, price:b.price } }); setSeats(b.seats); }}>
                  {b.seats} for {money(b.price)}
                </Chip>
              ))}
              <Chip on={custom} onClick={() => set({ bundle:{ name:"Custom", price: custom ? price : 0 } })}>Custom</Chip>
            </ChoiceGroup>
            {custom && <div className="mt-3 card rounded-[16px] px-4 py-2">
              <Stepper label="Seats" value={draft.seats} min={1} onChange={setSeats}/>
              <div className="pb-3">
                <Field label="Price in dollars">
                  <input value={price || ""} inputMode="numeric" placeholder="e.g. 500" className={inputCls} style={inputStyle}
                    onChange={e => set({ bundle:{ name:"Custom", price: parseInt(e.target.value.replace(/\D/g, ""), 10) || 0 } })}/>
                </Field>
              </div>
            </div>}
          </div>

          <div className="card rounded-[16px] px-4">
            <Switch label="Girls and guys" hint={draft.mix ? "Split set below" : "Off means any mix"} on={!!draft.mix}
              onChange={on => set({ mix: on ? { girls: Math.round(draft.seats * .75), guys: draft.seats - Math.round(draft.seats * .75) } : null })}/>
            {draft.mix && <div className="pb-2" style={{borderTop:"1px solid var(--line)"}}>
              <Stepper label="Girls" value={draft.mix.girls} max={draft.seats} onChange={girls => set({ mix:{ girls, guys: draft.seats - girls } })}/>
              <div className="text-[14px] pb-2">Guys: {draft.mix.guys}</div>
            </div>}
          </div>

          <div>
            <ChoiceGroup label="Requests close">
              {CLOSE_CHOICES.map(([value, label]) => <Chip key={value} on={draft.closesAt === value} onClick={() => set({ closesAt:value })}>{label}</Chip>)}
              <Chip on={customClose} onClick={() => { if (!customClose) set({ closesAt: closesOk ? toLocalDateTime(closes) : "" }); }}>Pick a time</Chip>
            </ChoiceGroup>
            {customClose && <div className="mt-3">
              <Field label="Pick a close time">
                <input type="datetime-local" value={draft.closesAt} onChange={e => set({ closesAt:e.target.value })} className={inputCls} style={inputStyle}/>
              </Field>
            </div>}
            <div className="text-[13px] mt-2">{closesOk ? "Requests close " + formatEventDateTime(closes) + "." : "Set the date and time to see when requests close."}</div>
            {problem && <div role="alert" className="text-[13px] font-semibold mt-2">{problem}</div>}
          </div>

          <details className="card rounded-[16px] px-4">
            <summary className="min-h-[52px] flex items-center justify-between text-[15px] font-medium cursor-pointer">More details <Icon name="plus" size={16}/></summary>
            <div className="space-y-4 pb-4">
              <Field label="Arrival window"><input value={brief.arrival || ""} onChange={e => setBrief({ arrival:e.target.value })} placeholder="21:30 – 22:30" className={inputCls} style={inputStyle}/></Field>
              <Field label="Dress code"><input value={brief.dress || ""} onChange={e => setBrief({ dress:e.target.value })} placeholder="Smart dark" className={inputCls} style={inputStyle}/></Field>
              <Field label="Meeting point"><input value={brief.meeting || ""} onChange={e => setBrief({ meeting:e.target.value })} placeholder="Door host" className={inputCls} style={inputStyle}/></Field>
              <Field label="House rules"><input value={brief.rules || ""} onChange={e => setBrief({ rules:e.target.value })} placeholder="1 Story and a venue tag" className={inputCls} style={inputStyle}/></Field>
              <ChoiceGroup label="Story window">
                {[24, 48].map(hours => <Chip key={hours} on={(draft.storyHours || 24) === hours} onClick={() => set({ storyHours:hours })}>{hours} hours</Chip>)}
              </ChoiceGroup>
            </div>
          </details>

          <section className="card rounded-[16px] px-4 py-2" aria-label="Check before posting">
            <h2 className="text-[15px] font-semibold py-2">Check before posting</h2>
            <dl>
              {check.map(([label, value]) => (
                <div key={label} className="py-2.5" style={{borderTop:"1px solid var(--line)"}}>
                  <dt className="text-[12px] font-semibold">{label}</dt>
                  <dd className="text-[14px] mt-0.5 leading-snug">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="space-y-2">
            <BigButton onClick={() => persist("publish")} disabled={!ready || !!saving}>
              {saving === "publish" ? "Posting…" : editingOpen ? "Save changes" : "Post event"}
            </BigButton>
            {!editingOpen && <BigButton quiet onClick={() => persist("draft")} disabled={!basics || !!saving}>
              {saving === "draft" ? "Saving…" : "Save for later"}
            </BigButton>}
          </div>
        </div>
      </div>
    );
  }

  /* ========== ScreenVenueIntro – business splash ========== */
  function ScreenVenueIntro({ onList, onLogin, onDemo }){
    return (
      <div className="absolute inset-0 anim-fade" style={{background:"#000000", color:"#F7F6F3"}}>
        {/* Static dark background – no video assets needed */}
        <div className="absolute inset-0 grain" style={{background:"#000000"}}/>
        {/* Radial vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{boxShadow:"inset 0 0 170px 46px rgba(0,0,0,.82)"}}/>
        {/* Top + bottom scrims */}
        <div className="absolute inset-0 pointer-events-none" style={{background:"linear-gradient(180deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,0) 24%, rgba(0,0,0,0) 46%, rgba(0,0,0,.92) 100%)"}}/>



        <div className="absolute inset-0 z-10 flex flex-col px-7 app-safe-top app-safe-bottom app-form-scroll">
          {/* Centered wordmark lockup – large serif, brand name keeps its capitals */}
          <div className="flex-1 flex flex-col items-center justify-center text-center -mt-6">
            <div className="anim-fade stamp" style={{color:"rgba(247,246,243,.78)"}}>Est. MMXXVI · Beirut</div>
            <div className="font-black font-display-l anim-up" style={{fontSize:66, lineHeight:.92, marginTop:14, textShadow:"0 2px 40px rgba(0,0,0,.6)"}}>The<br/>List</div>
            <div className="anim-up" style={{marginTop:18, fontSize:12, letterSpacing:".02em", color:"rgba(247,246,243,.82)"}}>For the rooms that matter</div>
          </div>

          {/* Bottom actions */}
          <div className="flex flex-col gap-3 anim-up">
            <button onClick={onList} className="press glow-primary w-full h-[58px] rounded-full font-semibold text-[14px] flex items-center justify-center gap-2" style={{background:"var(--ice)", color:"var(--ice-ink)"}}>
              List your venue <Icon name="arrow-right" size={16} stroke={1.8}/>
            </button>
            <button onClick={onLogin} className="press w-full h-[58px] rounded-full font-medium text-[13px]" style={{background:"transparent", color:"#F7F6F3", border:"1px solid rgba(247,246,243,.32)"}}>
              Business login
            </button>
          </div>

          {/* Member link + zero-typing demo path */}
          <div className="text-center mt-4 anim-up flex flex-col gap-2">
            <button onClick={()=>{ window.location.href = "/"; }} className="press min-h-[44px]" style={{color:"rgba(247,246,243,.82)", fontSize:13, background:"transparent", border:"none"}}>
              I'm a member
            </button>
            <button onClick={onDemo} className="press min-h-[44px]" style={{color:"#F7F6F3", fontSize:13, fontWeight:600, background:"transparent", border:"none"}}>
              Try the demo
            </button>
          </div>
        </div>


      </div>
    );
  }

  /* ========== ScreenVenueLogin – founder-created venue email OTP ========== */
  function ScreenVenueLogin({ onDone }){
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [sent, setSent] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const canSubmit = sent ? otp.length === 6 : email.includes("@");
    const submit = async () => {
      if (!canSubmit || busy) return;
      setBusy(true); setError("");
      try {
        if (!sent) {
          const { error } = await supabaseClient.auth.signInWithOtp({
            email: email.trim(), options: { shouldCreateUser: false },
          });
          if (error) throw error;
          setSent(true);
        } else {
          const { data, error } = await supabaseClient.auth.verifyOtp({
            email: email.trim(), token: otp, type: "email",
          });
          if (error) throw error;
          await onDone(data.session);
        }
      } catch (err) { setError(err.message || "Could not sign in"); }
      finally { setBusy(false); }
    };

    return (
      <div className="absolute inset-0 anim-fade" style={{background:"transparent"}}>

        <div className="absolute inset-0 flex flex-col px-7 app-safe-top app-safe-bottom app-form-scroll">
          <div className="font-black font-display-l text-[44px] leading-[.95] tracking-tight">Sign in</div>
          <div className="text-[14px] mt-3" style={{color:"var(--ink-2)"}}>Post events, pick who comes, run the door.</div>

          <div className="mt-10 space-y-5">
            <div>
              <div className="stamp mb-2">Work email</div>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                aria-label="Work email"
                placeholder="you@yourvenue.com"
                className="w-full h-12 px-3 rounded-[12px] text-[16px]"
                style={{background:"var(--bg-elev)", border:"1px solid var(--line-2)", color:"var(--ink)"}}
              />
            </div>
            {sent && <div>
              <div className="stamp mb-2">Six-digit code</div>
              <input
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                aria-label="Six-digit code"
                placeholder="000000"
                className="w-full h-12 px-3 rounded-[12px] text-[16px]"
                style={{background:"var(--bg-elev)", border:"1px solid var(--line-2)", color:"var(--ink)"}}
              />
            </div>}
            {error && <div role="alert" className="text-[13px] font-semibold">{error}</div>}
          </div>

          <div className="flex-1"/>

          <button
            onClick={submit}
            disabled={!canSubmit}
            className={"press w-full h-[58px] rounded-full font-semibold text-[14px] flex items-center justify-center gap-2 "+(canSubmit ? "glow-primary" : "")}
            style={{
              background: canSubmit ? "var(--ice)" : "var(--bg-elev2)",
              color: canSubmit ? "var(--ice-ink)" : "var(--ink-mute)"
            }}
          >
            {busy ? "Working…" : sent ? "Verify code" : "Email me a code"} <Icon name="arrow-right" size={16} stroke={1.8}/>
          </button>
          <div className="text-center text-[11px] mt-3" style={{color:"var(--ink-mute)"}}>Venue accounts are created by The List.</div>
        </div>

      </div>
    );
  }

  /* ========== ScreenOnboardVenue – edit the venue; nothing changes until Save ========== */
  function ScreenOnboardVenue({ venue: initial, onDone, onCancel }){
    const [venue, setVenue] = useState(initial);
    const [editing, setEditing] = useState(null); // null | "hero" | 0..3
    const [saving, setSaving] = useState(false);

    const canSave = venue.name && venue.name.trim().length >= 2 && venue.heroImage;
    const handleDone = async () => {
      if (!canSave || saving) return;
      setSaving(true);
      try { await onDone(venue); }
      catch (_) { /* parent reports the actionable error */ }
      finally { setSaving(false); }
    };

    if (editing !== null) {
      const hero = editing === "hero";
      return (
        <div className="absolute inset-0 anim-fade">
          <div className="absolute inset-0 flex flex-col px-6 overflow-y-auto noscroll" style={{paddingTop:"calc(env(safe-area-inset-top, 0px) + 16px)", paddingBottom:"calc(env(safe-area-inset-bottom, 0px) + 24px)"}}>
            <ImageCropper
              ratio="4/5"
              value={hero ? venue.heroImage : venue.images[editing]}
              label={hero ? "Main photo" : "Photo " + (editing + 1)}
              onChange={(v) => { setVenue(p => hero ? {...p, heroImage:v} : {...p, images: p.images.map((im, idx) => idx === editing ? v : im)}); setEditing(null); }}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="absolute inset-0 anim-fade flex flex-col">
        <div className="shrink-0 px-5 app-safe-top pb-2">
          <BackButton onClick={onCancel} label="Cancel"/>
          <h1 className="font-black font-display-l text-[30px] leading-none mt-1">Edit venue</h1>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto noscroll app-form-scroll px-5 pt-3 pb-4 space-y-6">
          <Field label="Venue name">
            <input value={venue.name} onChange={e => setVenue(v => ({...v, name:e.target.value}))} placeholder="e.g. Skybar" className={inputCls} style={inputStyle}/>
          </Field>

          <ChoiceGroup label="Type">
            {VENUE_TYPES.map(t => <Chip key={t} on={venue.type === t} onClick={() => setVenue(v => ({...v, type:t}))}>{t}</Chip>)}
          </ChoiceGroup>

          <ChoiceGroup label="Area">
            {BEIRUT_AREAS.map(a => <Chip key={a} on={venue.area === a} onClick={() => setVenue(v => ({...v, area:a}))}>{a}</Chip>)}
          </ChoiceGroup>

          <Field label="Description">
            <textarea rows={3} value={venue.description} onChange={e => setVenue(v => ({...v, description:e.target.value}))}
              placeholder="Tell guests what makes this venue worth posting."
              className="w-full px-3 py-3 rounded-[12px] text-[16px] resize-none" style={inputStyle}/>
          </Field>

          <Field label="Instagram handle" hint="Shown to guests in the event brief.">
            <input value={venue.igHandle || ""} onChange={e => setVenue(v => ({...v, igHandle:e.target.value.replace(/^@/, "")}))}
              autoCapitalize="none" autoCorrect="off" placeholder="yourvenue" className={inputCls} style={inputStyle}/>
          </Field>

          <div>
            <div className="text-[13px] font-semibold mb-2">Main photo</div>
            {venue.heroImage ? (
              <div className="flex items-end gap-4">
                <FramedImage value={venue.heroImage} ratio="4/5" radius={14} className="w-28 shrink-0"/>
                <button onClick={() => setEditing("hero")} className="press min-h-[44px] px-4 rounded-full text-[13px] font-medium" style={{border:"1px solid var(--line-2)"}}>Change main photo</button>
              </div>
            ) : (
              <button onClick={() => setEditing("hero")} className="press w-28 flex items-center justify-center rounded-[14px] text-[13px] font-medium"
                style={{aspectRatio:"4/5", border:"1px dashed var(--line-2)"}}>Add main photo</button>
            )}
          </div>

          <div>
            <div className="text-[13px] font-semibold">More photos</div>
            <div className="text-[12px] mt-0.5 mb-3">Four photos guests swipe through.</div>
            <div className="grid grid-cols-4 gap-2">
              {[0,1,2,3].map(i => (
                <button key={i} onClick={() => setEditing(i)} aria-label={(venue.images[i] ? "Change photo " : "Add photo ") + (i + 1)}
                  className="press rounded-[12px] overflow-hidden flex items-center justify-center"
                  style={{aspectRatio:"4/5", border: venue.images[i] ? "none" : "1px dashed var(--line-2)", padding:0}}>
                  {venue.images[i] ? <FramedImage value={venue.images[i]} ratio="4/5" radius={12} className="w-full h-full"/> : <Icon name="plus" size={18}/>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="shrink-0 px-5 pt-3" style={{paddingBottom:"calc(env(safe-area-inset-bottom, 0px) + 16px)"}}>
          <BigButton onClick={handleDone} disabled={!canSave || saving}>{saving ? "Saving…" : "Save venue"}</BigButton>
          {!canSave && <div className="text-[12px] text-center mt-2">A name and a main photo are needed.</div>}
        </div>
      </div>
    );
  }


  // px reserved at card bottom for the social pill row (p-4 + h-9 + mt-3) – keep in sync with SwipeCard's footer
  const CARD_LINK_ZONE = 80;

  function connectionLabel(status){
    if (status === "connected") return "Connected";
    if (status === "estimated") return "Estimated";
    return "Not available";
  }

  function applicantLebanon(applicant){
    const direct = applicant.insights?.audience?.lebanon;
    if (isNumber(direct)) return direct;
    const row = (applicant.audience?.countries || []).find(([name]) => name === "Lebanon");
    return row && isNumber(row[1]) ? row[1] : null;
  }

  function InsightMetric({ label, value, detail=null }){
    return (
      <div className="insight-metric">
        <div className="text-[10px] font-medium leading-tight mb-1" style={{color:"var(--ink-2)"}}>{label}</div>
        <div className="font-mono text-[17px] leading-tight break-words">{value}</div>
        {detail && <div className="text-[10px] leading-snug mt-1" style={{color:"var(--ink-2)"}}>{detail}</div>}
      </div>
    );
  }

  function SheetSection({ title, children }){
    return (
      <section className="mb-5">
        <div className="section-label text-[13px] mb-2">{title}</div>
        {children}
      </section>
    );
  }

  function MiniTrend({ values, label }){
    const clean = Array.isArray(values) ? values.filter(isNumber) : [];
    if (!clean.length) return <div className="text-[12px] py-5" style={{color:"var(--ink-2)"}}>Not available</div>;
    const min = Math.min(...clean);
    const max = Math.max(...clean);
    const range = max-min;
    return (
      <div>
        <div className="h-[78px] flex items-end gap-2 px-1 pt-2" aria-label={label || "Recent trend"}>
          {clean.map((value, index) => {
            const height = range === 0 ? 54 : 22 + ((value-min)/range)*50;
            return <span key={index} className="flex-1 rounded-t-[5px]" style={{height, background:"var(--ice)", opacity:.45 + index/clean.length*.5}}/>;
          })}
        </div>
        {label && <div className="text-[11px] mt-2" style={{color:"var(--ink-2)"}}>{label}</div>}
      </div>
    );
  }

  function BarList({ rows, max=1 }){
    const clean = Array.isArray(rows) ? rows.filter(row => row && isNumber(row[1])) : [];
    if (!clean.length) return <div className="text-[12px] py-3" style={{color:"var(--ink-2)"}}>Not available</div>;
    return (
      <div className="flex flex-col gap-3">
        {clean.map(([label,value]) => (
          <div key={label}>
            <div className="flex items-center justify-between gap-3 text-[11px] mb-1.5">
              <span className="truncate">{label}</span>
              <span className="font-mono shrink-0">{max === 1 ? fmtPct(value) : value.toFixed(2)+"x"}</span>
            </div>
            <div className="insight-bar"><span style={{width:`${Math.max(0,Math.min(100,value/max*100))}%`}}/></div>
          </div>
        ))}
      </div>
    );
  }

  function Donut({ value, label, secondaryLabel }){
    if (!isNumber(value)) return <div className="text-[12px] py-5" style={{color:"var(--ink-2)"}}>Not available</div>;
    const pct = Math.max(0,Math.min(100,value*100));
    return (
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative w-[74px] h-[74px] rounded-full shrink-0" role="img" aria-label={`${label} ${Math.round(pct)}%`}
             style={{background:`conic-gradient(var(--ice) ${pct}%, var(--bg-elev2) 0)`}}>
          <div className="absolute inset-[9px] rounded-full flex items-center justify-center font-mono text-[13px]" style={{background:"var(--bg)"}}>{Math.round(pct)}%</div>
        </div>
        <div className="min-w-0 text-[10px] leading-relaxed">
          <div className="font-semibold truncate">{label}</div>
          <div className="truncate" style={{color:"var(--ink-2)"}}>{secondaryLabel} {Math.round(100-pct)}%</div>
        </div>
      </div>
    );
  }

  function TagList({ values }){
    if (!Array.isArray(values) || !values.length) return <div className="text-[12px]" style={{color:"var(--ink-2)"}}>Not available</div>;
    return (
      <div className="flex flex-wrap gap-1.5">
        {values.map(value => <span key={value} className="px-2.5 py-1 rounded-full text-[10px]" style={{background:"var(--bg-elev2)", border:"1px solid var(--line)"}}>{value}</span>)}
      </div>
    );
  }

  /* ========== SwipeCard - one applicant card ========== */
  function SwipeCard({ a }){
    const insights = a.insights || {};
    const reliability = insights.theList?.reliability;
    const Social = ({label, href, icon}) => href ? (
      <a href={href} target="_blank" rel="noreferrer" draggable={false}
         className="press hit flex items-center gap-1.5 px-3 h-9 rounded-full text-[12px]"
         style={{border:"1px solid rgba(247,246,243,.32)", color:"#F7F6F3"}}>
        <Icon name={icon} size={14}/>{label}
      </a>
    ) : null;
    const metrics = [
      ["Followers",fmtK(a.instagram_followers)],
      ["Engagement",fmtPct(insights.engagementRate,1)],
      ["Lebanon",fmtPct(applicantLebanon(a))],
      ["Reliability",fmtPct(reliability)],
    ];
    return (
      <div className="relative w-full rounded-[18px] overflow-hidden" style={{aspectRatio:"4/5", background:"var(--bg-elev)"}}>
        {/* same box as the 18px card – matching radius keeps the corners concentric */}
        <FramedImage
          value={a.photo ? {src:a.photo, scale:1, x:0, y:0} : null}
          empty={(a.name || "Member").split(" ").map(part=>part[0]).join("").slice(0,2).toUpperCase()}
          ratio="4/5" radius={18} className="absolute inset-0"/>
        <div className="absolute inset-x-0 bottom-0 p-4 pt-24"
             style={{background:"linear-gradient(to top, rgba(0,0,0,.94) 0%, rgba(0,0,0,.76) 58%, rgba(0,0,0,0) 100%)", color:"#F7F6F3"}}>
          <div className="flex items-end justify-between gap-3">
            <div className="font-black font-display-l text-[24px] leading-[1.02] min-w-0">{a.name}</div>
            <span className="shrink-0 px-2 py-1 rounded-full text-[9px] font-semibold" style={{border:"1px solid rgba(247,246,243,.36)"}}>
              {connectionLabel(insights.dataStatus)}
            </span>
          </div>
          <div className="grid grid-cols-4 mt-3 py-2.5" style={{borderTop:"1px solid rgba(247,246,243,.22)", borderBottom:"1px solid rgba(247,246,243,.22)"}}>
            {metrics.map(([label,value], index) => (
              <div key={label} className="min-w-0 px-2 first:pl-0 last:pr-0" style={index ? {borderLeft:"1px solid rgba(247,246,243,.18)"} : {}}>
                <div className="font-mono text-[12px] leading-tight truncate">{value}</div>
                <div className="text-[10px] leading-tight mt-1 truncate">{label}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Social label="Instagram" href={a.socials?.instagram} icon="instagram"/>
            <Social label="TikTok" href={a.socials?.tiktok} icon="tiktok"/>
            <Social label="Link" href={a.socials?.other} icon="link"/>
          </div>
        </div>
      </div>
    );
  }

  /* ========== ApplicantSheet - venue-only analytics for applied members ========== */
  function ApplicantSheet({ applicant, onDecide, onClose }){
    const [tab, setTab] = useState("Overview");
    const scrollRef = useRef(null);
    useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [tab]);
    useEffect(() => {
      const onKey = e => { if (e.key === "Escape") onClose(); };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    });
    if (!applicant) return null;
    const insights = applicant.insights || {};
    const audience = insights.audience || {};
    const content = insights.content || {};
    const list = insights.theList || {};
    const status = connectionLabel(insights.dataStatus);
    const localFollowers = insights.overview?.localFollowers;
    const tabs = ["Overview","Audience","Content","The List"];

    const Overview = () => (
      <div>
        <div className="card rounded-[14px] p-4 mb-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{background:"var(--ice)", color:"var(--ice-ink)"}}>{status}</span>
            <span className="text-[10px] text-right" style={{color:"var(--ink-2)"}}>{insights.freshness || "Freshness not available"}</span>
          </div>
          <div className="text-[11px] font-medium" style={{color:"var(--ink-2)"}}>Estimated local followers</div>
          <div className="font-black font-display-l text-[42px] leading-none mt-1">{fmtK(localFollowers)}</div>
          <div className="text-[11px] leading-relaxed mt-2" style={{color:"var(--ink-2)"}}>A quick view of the reachable Lebanon audience before you pick.</div>
        </div>
        <SheetSection title="Decision metrics">
          <div className="insight-grid">
            <InsightMetric label="Followers" value={fmtK(applicant.instagram_followers)}/>
            <InsightMetric label="Engagement" value={fmtPct(insights.engagementRate,1)}/>
            <InsightMetric label="Lebanon audience" value={fmtPct(applicantLebanon(applicant))}/>
            <InsightMetric label="Reliability" value={fmtPct(list.reliability)}/>
          </div>
        </SheetSection>
        <SheetSection title="Follower trend">
          <div className="card rounded-[14px] px-3 py-2">
            <MiniTrend values={insights.overview?.trend} label={insights.overview?.trendLabel}/>
          </div>
        </SheetSection>
      </div>
    );

    const Audience = () => (
      <div>
        <SheetSection title="Audience location">
          <div className="insight-grid">
            <div className="insight-metric"><Donut value={audience.lebanon} label="Lebanon" secondaryLabel="International"/></div>
            <div className="insight-metric"><Donut value={audience.female} label="Female" secondaryLabel="Male"/></div>
          </div>
        </SheetSection>
        <SheetSection title="Top cities"><BarList rows={audience.cities}/></SheetSection>
        <SheetSection title="Age"><BarList rows={audience.ages}/></SheetSection>
        <SheetSection title="Audience quality">
          <div className="insight-grid mb-3">
            <InsightMetric label="Credibility" value={fmtPct(audience.credibility)}/>
            <InsightMetric label="Lebanon share" value={fmtPct(audience.lebanon)}/>
          </div>
          <div className="text-[11px] font-semibold mb-2">Languages</div>
          <TagList values={audience.languages}/>
          <div className="text-[11px] font-semibold mt-4 mb-2">Most active</div>
          <TagList values={audience.activeHours}/>
        </SheetSection>
      </div>
    );

    const Content = () => (
      <div>
        <SheetSection title="Format performance"><BarList rows={content.performance} max={1.5}/></SheetSection>
        <SheetSection title="Top content">
          {Array.isArray(content.topContent) && content.topContent.length ? (
            <div className="grid grid-cols-2 gap-2">
              {content.topContent.slice(0,4).map((item,index) => (
                <div key={index} className="analytics-thumb">
                  <img src={item.thumbnail} alt="" loading="lazy" decoding="async"/>
                  <div className="absolute inset-x-0 bottom-0 px-2.5 py-2 text-[9px] flex justify-between gap-2" style={{background:"linear-gradient(transparent,rgba(0,0,0,.9))", color:"#F7F6F3"}}>
                    <span>{item.label || "Post"}</span><span className="font-mono">{fmtK(item.reach)} est. reach</span>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="text-[12px]" style={{color:"var(--ink-2)"}}>Not available</div>}
        </SheetSection>
        <SheetSection title="Content metrics">
          <div className="insight-grid">
            <InsightMetric label="Average likes" value={fmtCount(content.averageLikes)}/>
            <InsightMetric label="Average comments" value={fmtCount(content.averageComments)}/>
            <InsightMetric label="Average views" value={fmtK(content.averageViews)}/>
            <InsightMetric label="Average Reel views" value={fmtK(content.averageReelsViews)}/>
            <InsightMetric label="Posting frequency" value={content.postingFrequency || "Not available"}/>
            <InsightMetric label="Sponsored share" value={fmtPct(content.sponsoredShare)}/>
          </div>
        </SheetSection>
      </div>
    );

    const TheList = () => (
      <div>
        <SheetSection title="Reliability">
          <div className="insight-grid">
            <InsightMetric label="Reliability" value={fmtPct(list.reliability)}/>
            <InsightMetric label="Show-up rate" value={fmtPct(list.showUpRate)}/>
            <InsightMetric label="Story completion" value={fmtPct(list.storyCompletion)}/>
            <InsightMetric label="Venue rating" value={isNumber(list.venueRating) ? list.venueRating.toFixed(1)+" / 5" : "Not available"}/>
            <InsightMetric label="Events" value={fmtCount(list.events)}/>
            <InsightMetric label="Estimated Story reach" value={fmtK(list.verifiedReach)} detail="An estimate, not measured"/>
          </div>
        </SheetSection>
        <SheetSection title="Accountability">
          <div className="insight-grid">
            <InsightMetric label="No-shows" value={fmtCount(list.noShows)} detail="Exact recorded count"/>
            <InsightMetric label="Strikes" value={fmtCount(list.strikes)} detail="Exact active count"/>
          </div>
        </SheetSection>
        <SheetSection title="Recent event trend">
          <div className="card rounded-[14px] px-3 py-2">
            <MiniTrend values={list.trend} label="Completion across the last five events"/>
          </div>
        </SheetSection>
      </div>
    );

    return (
      <>
        <div onClick={onClose} className="absolute inset-0 z-40 sheet-backdrop" style={{background:"rgba(0,0,0,.62)", backdropFilter:"blur(4px)"}}/>
        <div role="dialog" aria-modal="true" aria-label={applicant.name + " profile"} className="absolute left-0 right-0 bottom-0 z-50 sheet rounded-t-[24px] px-4 pt-3 pb-7"
             style={{background:"var(--bg)", borderTop:"1px solid var(--line-2)", height:"calc(100% - env(safe-area-inset-top, 0px) - 12px)", display:"flex", flexDirection:"column"}}>
          <div className="w-10 h-1 rounded-full mx-auto mb-3 shrink-0" style={{background:"var(--ink)", opacity:.4}}/>

          <div className="shrink-0 flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-[14px] overflow-hidden shrink-0" style={{background:"var(--bg-elev)"}}>
              <img src={applicant.photo} alt="" className="w-full h-full object-cover"/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black font-display text-[19px] leading-tight truncate">{applicant.name}</div>
              <div className="text-[10px] mt-1 flex items-center gap-2 min-w-0" style={{color:"var(--ink-2)"}}>
                <span className="truncate">Applied to this event</span>
                <span aria-hidden="true">/</span>
                <span className="font-mono shrink-0">{status}</span>
              </div>
            </div>
            <button onClick={onClose} autoFocus className="press hit w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{border:"1px solid var(--line-2)"}} aria-label="Close applicant details">
              <Icon name="x" size={17}/>
            </button>
          </div>

          <div className="applicant-tabs shrink-0 mb-3" role="tablist" aria-label="Applicant analytics">
            {tabs.map(name => (
              <button key={name} className={tab === name ? "active press" : "press"} onClick={() => setTab(name)} role="tab" aria-selected={tab === name}>{name}</button>
            ))}
          </div>

          <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto noscroll pr-1" style={{overscrollBehavior:"contain"}}>
            {tab === "Overview" && <Overview/>}
            {tab === "Audience" && <Audience/>}
            {tab === "Content" && <Content/>}
            {tab === "The List" && <TheList/>}
          </div>

          {/* Footer decide pills */}
          <div className="shrink-0 flex gap-3 pt-3" style={{borderTop:"1px solid var(--line)"}}>
            <button onClick={()=> onDecide(false)}
              className="press flex-1 h-[52px] rounded-full text-[14px] font-semibold flex items-center justify-center"
              style={{border:"1px solid var(--line-2)", color:"var(--ink)"}}>
              <Icon name="x" size={20} className="mr-1.5"/> Pass
            </button>
            <button onClick={()=> onDecide(true)}
              className="press flex-1 h-[52px] rounded-full text-[14px] font-semibold flex items-center justify-center glow-primary"
              style={{background:"var(--ice)", color:"var(--ice-ink)"}}>
              <Icon name="check" size={20} className="mr-1.5"/> Pick
            </button>
          </div>
        </div>
      </>
    );
  }

  function optionalNumber(value){
    if (value == null || value === "") return null;
    const number = typeof value === "number" ? value : Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function normalizeBreakdown(value){
    const labels = { LB:"Lebanon", AE:"UAE", SA:"Saudi Arabia" };
    if (Array.isArray(value)) {
      return value.map(row => {
        if (Array.isArray(row)) return [row[0], optionalNumber(row[1])];
        if (!row || typeof row !== "object") return null;
        const label = row.label || row.name || row.country || row.city || row.age || row.code;
        return label ? [labels[label] || label, optionalNumber(row.pct ?? row.value ?? row.share)] : null;
      }).filter(row => row && isNumber(row[1]));
    }
    if (value && typeof value === "object") {
      return Object.entries(value).map(([label, share]) => [labels[label] || label, optionalNumber(share)])
        .filter(row => isNumber(row[1]));
    }
    return [];
  }

  function normalizeConnectionStatus(value){
    const status = String(value || "").toLowerCase();
    if (status === "verified" || status.startsWith("connected")) return "connected";
    if (status === "estimated" || status === "public_estimate") return "estimated";
    return null;
  }

  function freshnessLabel(value){
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return null;
    const days = Math.max(0, Math.floor((Date.now()-date.valueOf())/(24*60*60*1000)));
    if (days === 0) return "Synced today";
    if (days === 1) return "Refreshed yesterday";
    return `Refreshed ${days} days ago`;
  }

  function normalizeApplicant(application){
    const profile = Array.isArray(application.profiles) ? application.profiles[0] : application.profiles || {};
    const creator = profile.creator_data || {};
    const creatorInsights = creator.insights || creator.creator_insights || {};
    const audience = { ...(creator.audience || {}), ...(creatorInsights.audience || {}) };
    const content = { ...(creator.content_metrics || {}), ...(creatorInsights.content || {}) };
    const listSource = { ...(creator.the_list || {}), ...(creatorInsights.theList || creatorInsights.the_list || {}) };
    const reputationSource = profile.reputation || {};
    const reputation = {
      score: optionalNumber(reputationSource.score),
      nights: optionalNumber(reputationSource.nights ?? reputationSource.events),
      shows: optionalNumber(reputationSource.shows ?? reputationSource.showed),
      noShows: optionalNumber(reputationSource.noShows ?? reputationSource.no_shows),
      strikes: optionalNumber(reputationSource.strikes),
      withYou: optionalNumber(reputationSource.withYou ?? reputationSource.with_you),
    };
    const followers = optionalNumber(creator.followers_count);
    const engagementRate = optionalNumber(creatorInsights.engagementRate ?? creatorInsights.engagement_rate ?? creator.engagement_rate);
    const countries = normalizeBreakdown(audience.country_split ?? audience.countries);
    const lebanon = optionalNumber(audience.lebanon) ?? countries.find(([label]) => label === "Lebanon")?.[1] ?? null;
    const female = optionalNumber(audience.gender_split?.female ?? audience.female);
    const male = optionalNumber(audience.gender_split?.male ?? audience.male) ?? (isNumber(female) ? 1-female : null);
    const localFollowers = optionalNumber(creatorInsights.overview?.localFollowers ?? creatorInsights.overview?.local_followers)
      ?? (isNumber(followers) && isNumber(lebanon) ? Math.round(followers*lebanon) : null);
    const showUpRate = optionalNumber(listSource.showUpRate ?? listSource.show_up_rate)
      ?? (isNumber(reputation.shows) && isNumber(reputation.nights) && reputation.nights > 0 ? reputation.shows/reputation.nights : null);
    const reliability = optionalNumber(listSource.reliability)
      ?? (isNumber(reputation.score) ? reputation.score/10 : showUpRate);
    const postingFrequency = content.postingFrequency ?? content.posting_frequency;
    const topContent = Array.isArray(content.topContent || content.top_content)
      ? (content.topContent || content.top_content).map(item => ({
          thumbnail: item?.thumbnail || item?.thumbnail_url || item?.image_url || null,
          label: item?.label || item?.type || "Post",
          reach: optionalNumber(item?.reach),
        })).filter(item => item.thumbnail).slice(0,4)
      : [];
    const status = normalizeConnectionStatus(creatorInsights.dataStatus ?? creatorInsights.data_status ?? creator.data_status);
    const insights = {
      dataStatus: status,
      freshness: creatorInsights.freshness || freshnessLabel(creator.fetched_at),
      engagementRate,
      overview: {
        localFollowers,
        trend: Array.isArray(creatorInsights.overview?.trend) ? creatorInsights.overview.trend.map(optionalNumber).filter(isNumber) : null,
        trendLabel: creatorInsights.overview?.trendLabel || creatorInsights.overview?.trend_label || null,
      },
      audience: {
        lebanon,
        cities: normalizeBreakdown(audience.cities ?? audience.city_split),
        ages: normalizeBreakdown(audience.ages ?? audience.age_split),
        female,
        male,
        credibility: optionalNumber(audience.credibility ?? audience.credibility_score ?? creator.quality_score),
        languages: Array.isArray(audience.languages) ? audience.languages.map(item => typeof item === "string" ? item : item?.label).filter(Boolean) : null,
        activeHours: Array.isArray(audience.activeHours || audience.active_hours) ? (audience.activeHours || audience.active_hours).filter(Boolean) : null,
      },
      content: {
        performance: normalizeBreakdown(content.performance),
        topContent,
        averageLikes: optionalNumber(content.averageLikes ?? content.average_likes),
        averageComments: optionalNumber(content.averageComments ?? content.average_comments),
        averageViews: optionalNumber(content.averageViews ?? content.average_views),
        averageReelsViews: optionalNumber(content.averageReelsViews ?? content.average_reels_views),
        postingFrequency: isNumber(optionalNumber(postingFrequency)) ? `${optionalNumber(postingFrequency)} posts / week` : postingFrequency || null,
        sponsoredShare: optionalNumber(content.sponsoredShare ?? content.sponsored_share),
      },
      theList: {
        reliability,
        showUpRate,
        storyCompletion: optionalNumber(listSource.storyCompletion ?? listSource.story_completion ?? reputationSource.storyCompletion ?? reputationSource.story_completion),
        venueRating: optionalNumber(listSource.venueRating ?? listSource.venue_rating ?? reputationSource.venueRating ?? reputationSource.venue_rating),
        events: optionalNumber(listSource.events ?? reputation.nights),
        verifiedReach: optionalNumber(listSource.verifiedReach ?? listSource.verified_reach),
        noShows: optionalNumber(listSource.noShows ?? listSource.no_shows ?? reputation.noShows),
        strikes: optionalNumber(listSource.strikes ?? reputation.strikes),
        trend: Array.isArray(listSource.trend) ? listSource.trend.map(optionalNumber).filter(isNumber) : null,
      },
    };
    return {
      id: application.id,
      name: profile.full_name || profile.ig_handle || "Member",
      gender: creator.gender || null,
      quality_score: optionalNumber(creator.quality_score),
      photo: profile.avatar_url || creator.profile_picture_url || null,
      instagram_followers: followers,
      tiktok_followers: optionalNumber(creator.tiktok_followers),
      socials: { instagram: profile.ig_handle ? "https://instagram.com/" + profile.ig_handle.replace(/^@/, "") : null, tiktok:null, other:null },
      reputation,
      audience: { female, countries },
      insights,
    };
  }

  function liveEvent(row, applications=[], stories=[], booking=null){
    const storyByApp = new Map(stories.map(s => [s.application_id, s]));
    const guests = applications.map(application => {
      applicantById[application.id] = normalizeApplicant(application);
      const story = storyByApp.get(application.id);
      const storyState = !story ? null
        : story.verdict === "pending" ? (story.media_url ? SS.review : SS.due)
        : story.verdict === "needs_review" ? SS.needsReview
        : story.verdict === "rejected" ? SS.rejected
        : story.verdict === "verified" ? SS.verified
        : story.verdict;
      return {
        applicantId: application.id,
        state: application.status,
        code: application.pass_code || null,
        inAt: application.checked_in_at ? toLocalTime(new Date(application.checked_in_at)) : null,
        pickExpiresAt: application.pick_expires_at || null,
        rating: application.rating ?? null,
        story: storyState,
        storyId: story?.id || null,
        storyMedia: story?.media_url || null,
        verdict: story ? {score:story.score ?? null, reason:story.reason || null} : null,
      };
    });
    const start = new Date(row.starts_at);
    const end = new Date(row.ends_at);
    const closes = row.closes_at ? new Date(row.closes_at) : null;
    const status = row.status || "draft";
    const stage = status === "draft" ? STAGE.draft
      : status === "cancelled" ? STAGE.cancelled
      : status === "locked" ? STAGE.locked
      : ["closed","completed","past"].includes(status) || booking ? STAGE.past
      : STAGE.open;
    const mix = row.mix_girls == null || row.mix_guys == null ? null : {girls:Number(row.mix_girls), guys:Number(row.mix_guys)};
    const bundleName = row.bundle || "Custom";
    return makeEvent({
      id: row.id, venueId: row.venue_id, title: row.title || "Untitled", type: row.kind || "Club",
      date: Number.isNaN(start.valueOf()) ? "" : dayLabel(start),
      time: Number.isNaN(start.valueOf()) ? "" : start.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit", hour12:false}),
      startsAt: row.starts_at || null, endsAt: row.ends_at || null,
      endTime: Number.isNaN(end.valueOf()) ? "" : end.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit", hour12:false}),
      description: row.description || "", closesAt: closes && !Number.isNaN(closes.valueOf()) ? formatEventDateTime(closes) : null,
      closesInput: closes && !Number.isNaN(closes.valueOf()) ? toLocalDateTime(closes) : null,
      mix, storyHours:Number(row.story_window_hours || 24), brief:row.brief || null,
      seats: row.seats ?? 0, heroImage: row.image_url ? {src:row.image_url,scale:1,x:0,y:0,remote:true} : null,
      exchange: "1 Story + venue tag", stage, status:stageToStatus(stage), guests,
      appliedTotal: applications.length, bundle:{name:bundleName, price:Number(row.bundle_price || 0)},
      invoice: booking ? {id:booking.id, bundle:bundleName, price:Number(booking.bundle_price ?? row.bundle_price ?? 0), status:booking.invoice_status || "pending"} : null,
    });
  }

  function toLocalDate(date){
    if (!date || Number.isNaN(date.valueOf())) return "";
    return [date.getFullYear(), String(date.getMonth()+1).padStart(2,"0"), String(date.getDate()).padStart(2,"0")].join("-");
  }

  function toLocalTime(date){
    if (!date || Number.isNaN(date.valueOf())) return "";
    return String(date.getHours()).padStart(2,"0") + ":" + String(date.getMinutes()).padStart(2,"0");
  }

  function toLocalDateTime(date){
    const day = toLocalDate(date);
    return day ? day + "T" + toLocalTime(date) : "";
  }

  function formatEventDateTime(date){
    return dayLabel(date) + " · " + toLocalTime(date);
  }

  function eventStart(draft){
    const clock = /^\d{2}:\d{2}$/.test(draft.time) ? draft.time : "20:00";
    if (/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) return new Date(draft.date + "T" + clock + ":00");
    const clean = draft.date.replace(/^[A-Za-z]{3}\s*·\s*/, "").replace(/·/g, " ");
    return new Date(clean + " " + new Date().getFullYear() + " " + clock);
  }

  function eventCloses(draft, starts){
    if (draft.closesAt === "24h before doors") return new Date(starts.getTime() - 24*60*60*1000);
    if (draft.closesAt === "48h before doors") return new Date(starts.getTime() - 48*60*60*1000);
    if (draft.closesAt === "2h before doors") return new Date(starts.getTime() - 2*60*60*1000);
    const custom = new Date(draft.closesAt);
    return Number.isNaN(custom.valueOf()) ? null : custom;
  }

  function ScreenNoVenue({ onLogout }){
    return <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center gap-4">
      <div className="font-black font-display-l text-[34px]">This login has no venue</div>
      <button onClick={onLogout} className="press h-11 px-6 rounded-full" style={{border:"1px solid var(--line-2)"}}>Sign out</button>
    </div>;
  }

  function venueNotificationAction(kind){
    const targets = {
      story_submitted:"recap", post_event_report:"recap",
      invoice_pending:"recap", invoice_invoiced:"recap", invoice_paid:"recap",
      applications_digest:"review", pick_expired_venue:"review", pick_declined:"review",
      picked:"review", pick_expired:"review", confirm_reminder:"review",
      pick_confirmed:"guestlist", pass_ready:"guestlist", no_show:"guestlist",
      tonight_lineup:"door",
      event_filled:"event", event_changed:"event", new_drop:"event",
      list_closed:"event", not_selected:"event", waitlist_promoted:"event",
      story_due:"recap", story_deadline:"recap", story_missed:"recap", story_verified:"recap",
      account_paused:"event",
    };
    return targets[kind] || "event";
  }

  /* ========== APP ========== */
  const DEMO_PREVIEW = new URLSearchParams(window.location.search).get("demo") === "1";
  function App(){
    const [step, setStep] = useState(DEMO_PREVIEW ? "done" : "intro");
    const currentStep = useRef(step);
    useEffect(() => { currentStep.current = step; }, [step]);
    // intro | login | no-venue | onboard-venue | done | post | event | deck | door | summary
    const [light, setLight] = useState(false);
    const [venue, setVenue] = useState(DEMO_PREVIEW ? DEMO_VENUE : makeVenue());
    const [events, setEvents] = useState(SEED_EVENTS);
    const [tab, setTab] = useState("home");            // home | events | venue
    const [focusId, setFocusId] = useState(null);      // the event behind event / deck / door / summary
    const [from, setFrom] = useState("done");          // where Back goes
    const [toast, setToast] = useState(null);
    const toastTimer = useRef(null);
    const demoTimers = useRef({});
    const [confirm, setConfirm] = useState(null);      // {title,body,confirmLabel,onConfirm} | null
    const [editingDraft, setEditingDraft] = useState(null);
    const [session, setSession] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [syncNotice, setSyncNotice] = useState(null);
    const [roleMismatch, setRoleMismatch] = useState(false);
    // Polls, realtime and saves all refresh. A slow older answer must never overwrite a newer one.
    const hydrateStarted = useRef(0), hydrateApplied = useRef(0);

    const hydrateVenue = async (uid, replaceVenue = false) => {
      const seq = ++hydrateStarted.current;
      const [profileResult, venueResult, notificationResult] = await Promise.all([
        supabaseClient.from("profiles").select("*").eq("id", uid).single(),
        supabaseClient.from("venues").select("*").eq("owner_id", uid).limit(1),
        supabaseClient.from("notifications").select("*").eq("user_id", uid).order("created_at", {ascending:false}),
      ]);
      const firstError = [profileResult, venueResult, notificationResult].find(result => result.error)?.error;
      if (firstError) throw firstError;
      if (profileResult.data.role !== "venue" || !(venueResult.data || []).length) {
        if (seq < hydrateApplied.current) return false;
        hydrateApplied.current = seq;
        setVenue(makeVenue()); setEvents([]); setNotifications([]);
        setRoleMismatch(true); setStep("no-venue"); return false;
      }
      const venueRow = venueResult.data[0];
      const eventResult = await supabaseClient.from("events").select("*")
        .eq("venue_id", venueRow.id).order("starts_at", {ascending:true});
      if (eventResult.error) throw eventResult.error;
      const ownRows = eventResult.data || [];
      const liveEvents = await Promise.all(ownRows.map(async row => {
        const applicationResult = await supabaseClient.from("applications")
          .select("*, profiles(full_name, ig_handle, avatar_url, creator_data, reputation)")
          .eq("event_id", row.id);
        if (applicationResult.error) throw applicationResult.error;
        const apps = applicationResult.data || [];
        const appIds = apps.map(a => a.id);
        const [storyResult, bookingResult] = await Promise.all([
          appIds.length ? supabaseClient.from("stories").select("*").in("application_id", appIds) : Promise.resolve({data:[],error:null}),
          supabaseClient.from("bookings").select("*").eq("event_id", row.id).maybeSingle(),
        ]);
        if (storyResult.error) throw storyResult.error;
        if (bookingResult.error) throw bookingResult.error;
        return liveEvent(row, apps, storyResult.data || [], bookingResult.data || null);
      }));
      const gallery = Array.isArray(venueRow.gallery) ? venueRow.gallery : [];
      const images = gallery.slice(0,4).map(item => {
        const src = typeof item === "string" ? item : item?.src;
        return src ? {src,scale:1,x:0,y:0,remote:true} : null;
      });
      while (images.length < 4) images.push(null);
      const refreshedVenue = makeVenue({
        id:venueRow.id, name:venueRow.name || "", type:venueRow.kind || venueRow.type || "Club",
        area:venueRow.area || "", description:venueRow.description || "", igHandle:venueRow.ig_handle || "",
        heroImage:venueRow.image_url ? {src:venueRow.image_url,scale:1,x:0,y:0,remote:true} : null,
        images,
      });
      if (seq < hydrateApplied.current) return true;   // a newer refresh already landed
      hydrateApplied.current = seq;
      if (replaceVenue || currentStep.current !== "onboard-venue") setVenue(refreshedVenue);
      setEvents(liveEvents);
      setNotifications((notificationResult.data || []).map(n => ({
        id:n.id, kind:n.kind, text:[n.title,n.body].filter(Boolean).join(" · "), eventId:n.event_id,
        action:venueNotificationAction(n.kind), read:n.read === true,
      })));
      setRoleMismatch(false);
      setSyncNotice(null);
      return true;
    };

    const completeLogin = async nextSession => {
      setSession(nextSession);
      if (await hydrateVenue(nextSession.user.id)) setStep("done");
    };

    useEffect(() => {
      if (DEMO_PREVIEW) return;
      supabaseClient.auth.getSession().then(({data}) => {
        if (!data.session) return;
        setSession(data.session);
        hydrateVenue(data.session.user.id)
          .then(loaded => { if (loaded) setStep("done"); })
          .catch(error => { setStep("login"); showToast(error.message || "Could not load venue"); });
      });
    }, []);

    useEffect(() => {
      // ponytail: use the browser viewport so sheets remain above the keyboard.
      const viewport = window.visualViewport;
      if (!viewport) return;
      const syncViewport = () => {
        if (viewport.scale !== 1) return;
        document.documentElement.style.setProperty("--app-height", `${viewport.height}px`);
        document.documentElement.style.setProperty("--app-offset", `${viewport.offsetTop}px`);
      };
      syncViewport();
      viewport.addEventListener("resize", syncViewport);
      viewport.addEventListener("scroll", syncViewport);
      return () => {
        viewport.removeEventListener("resize", syncViewport);
        viewport.removeEventListener("scroll", syncViewport);
      };
    }, []);

    useEffect(() => {
      if (!session) return;
      const channel = supabaseClient.channel("venue-notifications-" + session.user.id)
        .on("postgres_changes", {event:"INSERT", schema:"public", table:"notifications", filter:"user_id=eq." + session.user.id}, () => {
          hydrateVenue(session.user.id).catch(() => {});
        }).subscribe();
      return () => { supabaseClient.removeChannel(channel); };
    }, [session?.user?.id]);

    // The door list polls with this while it is open (see ScreenDoor).
    const refreshDoor = useCallback(() => { if (session) hydrateVenue(session.user.id).catch(() => {}); }, [session]);

    const showToast = (msg) => { setToast(msg); if (toastTimer.current) clearTimeout(toastTimer.current); toastTimer.current = setTimeout(()=>setToast(null), 2600); };
    const askConfirm = (cfg) => setConfirm(cfg);
    const liveToday = session ? todayLabel() : TODAY;

    // A failed refresh must never turn a committed write into a retryable save.
    const refreshAfterMutation = async (savedMessage, replaceVenue = false) => {
      try {
        await hydrateVenue(session.user.id, replaceVenue);
        setSyncNotice(null);
        return true;
      } catch (error) {
        setSyncNotice(savedMessage);
        return false;
      }
    };

    const runRpc = async (name, args) => {
      const { error } = await supabaseClient.rpc(name, args);
      if (error) throw error;
      await refreshAfterMutation("Change saved");
    };

    const markNotificationsRead = async () => {
      if (!session) return;
      const ids = notifications.filter(row => !row.read).map(row => row.id);
      if (!ids.length) return;
      setNotifications(rows => rows.map(row => ids.includes(row.id) ? {...row, read:true} : row));
      const { error } = await supabaseClient.from("notifications").update({read:true})
        .eq("user_id", session.user.id).in("id", ids);
      if (error) {
        showToast("Could not mark activity as read");
        hydrateVenue(session.user.id).catch(() => {});
      }
    };

    const logout = async () => {
      if (DEMO_PREVIEW) { window.location.href = window.location.pathname; return; }
      if (session) await supabaseClient.auth.signOut();
      setSession(null); setRoleMismatch(false); setNotifications([]); setSyncNotice(null);
      setVenue(makeVenue()); setEvents(SEED_EVENTS);
      setFocusId(null); setTab("home"); setStep("intro");
    };

    const saveVenue = async venueDraft => {
      if (!session) { setVenue(venueDraft); setStep("done"); setTab("venue"); showToast("Venue saved"); return; }
      try {
        const stamp = Date.now();
        const heroUrl = await uploadCroppedMedia(venueDraft.heroImage, `${session.user.id}/venue-${stamp}.jpg`);
        const galleryUrls = (await Promise.all((venueDraft.images || []).map((image,index) =>
          image ? uploadCroppedMedia(image, `${session.user.id}/venue-${stamp}-${index}.jpg`) : null
        ))).filter(Boolean);
        const { error } = await supabaseClient.from("venues").update({
          name:venueDraft.name,
          kind:venueDraft.type,
          area:venueDraft.area,
          description:venueDraft.description || null,
          image_url:heroUrl,
          gallery:galleryUrls,
          ig_handle:(venueDraft.igHandle || "").replace(/^@/, "") || null,
        }).eq("id", venueDraft.id);
        if (error) throw error;
        setStep("done"); setTab("venue"); showToast("Venue saved");
        await refreshAfterMutation("Venue saved", true);
      } catch (error) {
        showToast(error.message || "Could not save venue");
        throw error;
      }
    };

    useEffect(() => { document.documentElement.classList.toggle('light', light); }, [light]);

    // Every venue write goes through act. Live calls Supabase; demo changes the seeded world the same way,
    // so the investor demo behaves like the real thing.
    const writeGuest = (eventId, appId, patch) => setEvents(es => es.map(e => e.id !== eventId ? e : {
      ...e, guests: (e.guests || []).map(g => g.applicantId === appId ? { ...g, ...patch } : g),
    }));
    const writeEvent = (eventId, change) => setEvents(es => es.map(e => e.id === eventId ? change(e) : e));
    const act = {
      pick: async (eventId, appId) => {
        if (session) return runRpc("pick_applicant", {p_app:appId});
        writeGuest(eventId, appId, { state: GS.picked, code: "LST-" + appId.replace(/\D/g, "").padStart(2, "0") + "P" });
        // Demo stand-in for the member tapping confirm, so a pitch shows the whole loop.
        clearTimeout(demoTimers.current[appId]);
        demoTimers.current[appId] = setTimeout(() => setEvents(es => es.map(e => e.id !== eventId ? e : {
          ...e, guests: e.guests.map(g => g.applicantId === appId && g.state === GS.picked ? { ...g, state: GS.confirmed } : g),
        })), 12000);
      },
      pass: async (eventId, appId) => {
        if (!session) return;
        // ponytail: skip_applicant saves nothing server-side, so skip the full refresh; this phone remembers the pass.
        const { error } = await supabaseClient.rpc("skip_applicant", {p_app:appId});
        if (error) throw error;
      },
      checkIn: async (eventId, appId) => session ? runRpc("check_in", {p_app:appId})
        : writeGuest(eventId, appId, { state: GS.checkedIn, inAt: toLocalTime(new Date()) }),
      noShow: async (eventId, appId) => session ? runRpc("mark_no_show", {p_app:appId})
        : writeGuest(eventId, appId, { state: GS.noShow }),
      rate: async (eventId, appId, rating) => session ? runRpc("rate_guest", {p_app:appId, p_rating:rating})
        : writeGuest(eventId, appId, { rating }),
      closeRequests: async eventId => session ? runRpc("close_applications", {p_event:eventId})
        : writeEvent(eventId, e => ({ ...e, stage: STAGE.locked, status: stageToStatus(STAGE.locked),
            guests: e.guests.map(g => g.state === GS.applied ? { ...g, state: GS.waitlist } : g) })),
      cancelEvent: async eventId => session ? runRpc("cancel_event", {p_event:eventId})
        : writeEvent(eventId, e => ({ ...e, stage: STAGE.cancelled, status: stageToStatus(STAGE.cancelled),
            guests: e.guests.map(g => [GS.applied, GS.waitlist, GS.picked, GS.confirmed].includes(g.state) ? { ...g, state: GS.cancelled } : g) })),
      deleteDraft: async eventId => session ? runRpc("delete_event", {p_event:eventId})
        : setEvents(es => es.filter(e => e.id !== eventId)),
      closeNight: async event => {
        if (session) {
          // close_event needs requests closed first; do both so the door never gets stuck.
          if (event.stage === STAGE.open) {
            const { error } = await supabaseClient.rpc("close_applications", {p_event:event.id});
            if (error) throw error;
          }
          try { await runRpc("close_event", {p_event:event.id}); }
          catch (error) { if (event.stage === STAGE.open) await refreshAfterMutation("Requests closed"); throw error; }
          return;
        }
        writeEvent(event.id, e => ({ ...e, stage: STAGE.past, status: stageToStatus(STAGE.past),
          guests: e.guests.map(g => [GS.applied, GS.waitlist].includes(g.state) ? { ...g, state: GS.notSelected }
            : g.state === GS.confirmed ? { ...g, state: GS.noShow }
            : g.state === GS.checkedIn && !g.story ? { ...g, story: SS.due } : g),
          invoice: { bundle: e.bundle?.name || "Custom", price: e.bundle?.price ?? 0, status: "pending" } }));
      },
    };

    // One wrapper so every screen shares the toast, sync banner and confirm dialog.
    const wrap = (node) => (
      <div className="app-shell">
        <div className="app-frame"><div className="app-surface">
          {node}
          <Toast msg={toast}/>
          {syncNotice && <div role="status" className="absolute left-3 right-3 z-[60] glass rounded-[14px] px-4 py-2 flex items-center gap-3" style={{top:"calc(env(safe-area-inset-top, 0px) + 12px)"}}>
            <div className="flex-1 text-[12px]">{syncNotice}. Updates are delayed.</div>
            <button onClick={()=>refreshAfterMutation(syncNotice)} className="press h-11 px-3 text-[12px] font-semibold">Retry refresh</button>
            <button onClick={()=>setSyncNotice(null)} aria-label="Dismiss" className="press w-11 h-11 -mr-2 inline-flex items-center justify-center"><Icon name="x" size={16}/></button>
          </div>}
          {confirm && <ConfirmDialog {...confirm} onClose={() => setConfirm(null)}/>}
        </div></div>
      </div>
    );

    if (step === "intro") return wrap(<ScreenVenueIntro onList={()=>setStep("login")} onLogin={()=>setStep("login")}
      onDemo={()=>{ window.location.href = "?demo=1"; }}/>);
    if (step === "login") return wrap(<ScreenVenueLogin onDone={completeLogin}/>);
    if (step === "no-venue" || roleMismatch) return wrap(<ScreenNoVenue onLogout={logout}/>);
    if (step === "onboard-venue") return wrap(<ScreenOnboardVenue venue={venue} onDone={saveVenue} onCancel={() => { setStep("done"); setTab("venue"); }}/>);

    // Back returns to the event page when that is where the venue came from, else to the tabs.
    const go = (next, eventId) => { setFrom(step === "event" ? "event" : "done"); if (eventId !== undefined) setFocusId(eventId); setStep(next); };
    const back = () => setStep(from === "event" && step !== "event" ? "event" : "done");
    const editDraft = (event) => { setEditingDraft(event); go("post", event.id); };
    const openEvent = (e) => go("event", e.id);
    const runTask = (task) => task.go === "post" ? editDraft(task.e) : go(task.go, task.e.id);
    const openActivity = (action, e) => {
      if (action === "review" && running(e) && dayOf(e, liveToday, !!session) !== "over") return go("deck", e.id);
      if (action === "door" && running(e)) return go("door", e.id);
      if (action === "recap" && e.stage === STAGE.past) return go("summary", e.id);
      return openEvent(e);
    };

    // ---- Demo switchboard – the rig behind Venue › Demo controls ----
    const genDoorCode = (taken) => {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code;
      do { code = "LST-" + chars[Math.floor(Math.random()*chars.length)] + chars[Math.floor(Math.random()*chars.length)]; }
      while (taken.has(code));
      taken.add(code);
      return code;
    };
    const demoActions = {
      newApplicants: () => {
        const open = events.find(e => e.stage === STAGE.open);
        if (!open) { showToast("No event is taking requests. Post one first."); return; }
        const present = new Set(open.guests.map(g => g.applicantId));
        const fresh = APPLICANTS.filter(a => !present.has(a.id)).slice(0, 6).map(a => makeGuest(a.id, GS.applied));
        if (!fresh.length) { showToast("Everyone in the demo has asked already. Reset the demo."); return; }
        setEvents(es => es.map(e => e.id !== open.id ? e : { ...e, guests: [...e.guests, ...fresh], appliedTotal: (e.appliedTotal || 0) + fresh.length }));
        showToast(plural(fresh.length, "new person wants", "new people want") + " in to " + open.title);
      },
      pickDeclines: () => {
        const pool = events.find(e => e.id === "pool");
        const victim = pool && pool.guests.find(g => g.state === GS.confirmed && g.code !== "LST-4F");
        if (!victim) { showToast("No confirmed guest left to drop out"); return; }
        setEvents(es => es.map(e => e.id !== "pool" ? e : {
          ...e, guests: e.guests.map(g => g === victim ? { ...g, state: GS.declined } : g),
        }));
        const a = APPLICANTS.find(x => x.id === victim.applicantId);
        showToast((a ? a.name : "A pick") + " can't make it. Pick a replacement.");
      },
      advanceToTonight: () => {
        const lounge = events.find(e => e.id === "lounge");
        if (!lounge || lounge.stage !== STAGE.open) { showToast("Late Lounge is already today. Reset first."); return; }
        const taken = new Set(events.flatMap(e => e.guests.map(g => g.code)).filter(Boolean));
        setEvents(es => es.map(e => e.id !== "lounge" ? e : {
          ...e,
          stage: STAGE.locked,
          status: stageToStatus(STAGE.locked),
          date: TODAY,
          guests: e.guests.map(g =>
            g.state === GS.applied ? { ...g, state: GS.waitlist } :
            g.state === GS.picked  ? { ...g, state: GS.confirmed, code: g.code || genDoorCode(taken) } : g),
        }));
        setTab("home");
        showToast("Late Lounge is on today");
      },
      reset: () => {
        Object.values(demoTimers.current).forEach(clearTimeout);
        demoPassed.clear();
        setEvents(SEED_EVENTS);
        setTab("home");
        showToast("Demo reset");
      },
    };

    const persistEvent = async (draft, draftId, publish) => {
      if (session) {
        try {
          const starts = eventStart(draft);
          if (Number.isNaN(starts.valueOf())) throw new Error("Use a valid date and time");
          const closes = eventCloses(draft, starts);
          if (!closes || Number.isNaN(closes.valueOf())) throw new Error("Use a valid time for requests to close");
          if (closes >= starts) throw new Error("Requests must close before the event starts");
          // Posting only: a draft may sit with old dates, but a live event must still be ahead of us.
          if (publish && starts <= new Date()) throw new Error("That start time has already passed");
          if (publish && closes <= new Date()) throw new Error("That close time has already passed");
          const originalStart = draft.startsAt ? new Date(draft.startsAt) : null;
          const originalEnd = draft.endsAt ? new Date(draft.endsAt) : null;
          const originalDuration = originalStart && originalEnd && !Number.isNaN(originalStart.valueOf()) && !Number.isNaN(originalEnd.valueOf())
            ? Math.max(60*60*1000, originalEnd - originalStart)
            : 4*60*60*1000;
          const imageValue = draft.heroImage || venue.heroImage;
          const imageUrl = imageValue ? await uploadCroppedMedia(imageValue, `${session.user.id}/event-${Date.now()}.jpg`) : null;
          const args = {
            p_title:draft.title.trim(),
            p_kind:draft.type,
            p_description:draft.description || null,
            p_image:imageUrl,
            p_starts:starts.toISOString(),
            p_ends:new Date(starts.getTime() + originalDuration).toISOString(),
            p_seats:draft.seats,
            p_price:draft.bundle?.price || 0,
            p_story_hours:draft.storyHours || 24,
            p_closes_at:closes.toISOString(),
            p_mix_girls:draft.mix ? draft.mix.girls : null,
            p_mix_guys:draft.mix ? draft.mix.guys : null,
            p_brief:draft.brief || null,
            p_bundle:draft.bundle?.name || null,
          };
          const result = draftId
            ? await supabaseClient.rpc("update_event", {...args, p_event:draftId, p_publish:publish})
            : await supabaseClient.rpc("post_event", {...args, p_draft:!publish});
          if (result.error) throw result.error;
          setEditingDraft(null); setStep("done"); setTab("events");
          showToast(publish ? "Event posted" : "Saved for later");
          await refreshAfterMutation(publish ? "Event posted" : "Saved for later");
          return;
        } catch (error) {
          showToast(plainError(error, error?.message || (publish ? "Could not post the event" : "Could not save the draft")));
          throw error;
        }
      }
      const saved = {
        ...draft,
        title: draft.title.trim(),
        stage: publish ? STAGE.open : STAGE.draft,
        status: stageToStatus(publish ? STAGE.open : STAGE.draft),
        guests: draft.guests || [],
        appliedTotal: draft.appliedTotal || 0,
      };
      if (draftId) {
        setEvents(es => es.map(e => e.id === draftId ? { ...saved, id: draftId } : e));
      } else {
        setEvents(es => [saved, ...es]);
      }
      setEditingDraft(null);
      setStep("done"); setTab("events");
      showToast(publish ? "Event posted" : "Saved for later");
    };
    const publishEvent = (draft, draftId) => persistEvent(draft, draftId, true);
    const saveDraft = (draft, draftId) => persistEvent(draft, draftId, false);
    const cancelPost = () => {
      if (editingDraft) showToast("No changes saved");
      setEditingDraft(null);
      setStep(editingDraft && from === "event" ? "event" : "done");
    };

    const focused = events.find(e => e.id === focusId) || null;
    const common = { act, askConfirm, onToast: showToast, onBack: back };

    if (step === "post") return wrap(<ScreenPostEvent venue={venue}
      onCancel={cancelPost}
      onPublish={publishEvent}
      onSaveDraft={saveDraft}
      live={!!session}
      initialDraft={editingDraft || undefined}
      draftId={editingDraft ? editingDraft.id : undefined}
    />);
    if (step === "event") return wrap(<ScreenEvent {...common} event={focused} today={liveToday} live={!!session}
      onDeck={id => go("deck", id)} onDoor={id => go("door", id)} onSummary={id => go("summary", id)} onEdit={editDraft}/>);
    if (step === "deck") return wrap(focused
      ? <ScreenReview key={focusId} {...common} event={focused}/>
      : <Gone onBack={back}/>);
    if (step === "door") return wrap(<ScreenDoor {...common} event={focused} live={!!session}
      onRefresh={session ? refreshDoor : null}
      onClosed={id => { setFocusId(id); setFrom("done"); setStep("summary"); }}
      onSummary={id => go("summary", id)}/>);
    if (step === "summary") return wrap(<ScreenSummary {...common} event={focused}/>);
    if (step === "done") return wrap(
      <>
        {tab === "home" && <ScreenHome venue={venue} events={events} notifications={notifications}
          today={liveToday} live={!!session} onTask={runTask} onPost={() => setStep("post")} onGo={openActivity}
          onToast={showToast} onNotifsOpened={markNotificationsRead}/>}
        {tab === "events" && <ScreenEvents events={events} today={liveToday} live={!!session}
          onOpen={openEvent} onPost={() => setStep("post")}/>}
        {tab === "venue" && <ScreenVenueProfile venue={venue} onEdit={()=>setStep("onboard-venue")} onLogout={logout}
          demo={session ? null : demoActions} light={light} onTheme={()=>setLight(value=>!value)}/>}
        <VenueTabBar tab={tab} onTab={setTab}/>
      </>
    );

    // Generic fallback for steps not yet built.
    return wrap(
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="font-black font-display-l text-[34px]">{step}</div>
      </div>
    );
  }
  createRoot(document.getElementById("root")).render(<App/>);
