
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
// @ts-ignore
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchPostContent, fetchSiteContent } from '../services/blogService';
import { Post, SiteContent } from '../types';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface ZoomState {
  src: string;
  rect: DOMRect;
  scale: number;
  pan: { x: number; y: number };
}

const BLUEBERRY_PHOTOS = [
  "https://image-host.blueberryowo.me/72d6ef0b-1ef9-40ad-8a16-d3e157532c0f.jpg",
  "https://image-host.blueberryowo.me/fd369747-66f5-4d4b-8c55-d2bae984cba0.jpg",
  "https://image-host.blueberryowo.me/2d0f3c7c-8bd8-4cb2-b5ca-d0f1f2ea4063.jpg",
  "https://image-host.blueberryowo.me/e3933c10-0a1b-4477-8c88-88b3fa51720b.jpg",
  "https://image-host.blueberryowo.me/e7991253-7b82-45a9-bf67-14397d1ea6f4.jpg",
  "https://image-host.blueberryowo.me/cf2c784d-5edc-45fd-9cf6-a8246a4c0439.jpg",
  "https://image-host.blueberryowo.me/a9d90b56-3aa3-4458-82bd-c5ea471be35a.jpg",
  "https://image-host.blueberryowo.me/a7915356-091b-4e91-a88c-f166a644f65c.jpg",
  "https://image-host.blueberryowo.me/1f64ee6b-39df-4035-8b87-217eee2b310e.jpg"
];

const PostDetail: React.FC = () => {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  
  const [zoomedImage, setZoomedImage] = useState<ZoomState | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Randomly select a cat photo for this session
  const blueberryPhoto = useMemo(() => {
    return BLUEBERRY_PHOTOS[Math.floor(Math.random() * BLUEBERRY_PHOTOS.length)];
  }, [slug]);

  const performSmoothScroll = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.pageYOffset - 110;
    window.scrollTo({ top, behavior: 'smooth' });
    element.classList.add('highlight-flash');
    setTimeout(() => {
      if (element) element.classList.remove('highlight-flash');
    }, 2000);
  };

  useEffect(() => {
    if (zoomedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [zoomedImage]);

  useEffect(() => {
    if (category && slug) {
      setLoading(true);
      fetchPostContent(category, slug).then(data => {
        setPost(data);
        setLoading(false);
      });
      fetchSiteContent().then(setSiteContent);
    }
  }, [category, slug]);

  useEffect(() => {
    if (post && !loading && contentRef.current) {
      contentRef.current.innerHTML = '';
      // @ts-ignore
      const marked = window.marked;
      // @ts-ignore
      const markedFootnote = window.markedFootnote;
      
      marked.setOptions({ gfm: true, breaks: true, headerIds: true, mangle: false });
      if (markedFootnote) { marked.use(markedFootnote()); }

      const htmlContent = marked.parse(post.content);
      contentRef.current.innerHTML = htmlContent;
      
      // @ts-ignore
      if (window.Prism) { window.Prism.highlightAllUnder(contentRef.current); }

      const headings = contentRef.current.querySelectorAll('h2, h3');
      const items: TocItem[] = Array.from(headings).map((h: any, idx) => {
        const id = `marker-${idx}`;
        h.id = id;
        return { id, text: h.innerText, level: parseInt(h.tagName.substring(1)) };
      });
      setToc(items);
      addCopyButtons(contentRef.current);

      const imgs = contentRef.current.querySelectorAll('img');
      imgs.forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', (e) => {
          e.stopPropagation();
          const rect = img.getBoundingClientRect();
          setZoomedImage({
            src: img.src,
            rect: rect,
            scale: 1,
            pan: { x: 0, y: 0 }
          });
        });
      });
    }
  }, [post, loading]);

  useEffect(() => {
    const handleOverlayWheel = (e: WheelEvent) => {
      if (zoomedImage) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.2 : 0.2;
        setZoomedImage(prev => {
          if (!prev) return null;
          const newScale = Math.min(Math.max(prev.scale + delta, 1), 5);
          const newPan = newScale === 1 ? { x: 0, y: 0 } : prev.pan;
          return { ...prev, scale: newScale, pan: newPan };
        });
      }
    };

    const overlay = overlayRef.current;
    if (overlay) {
      overlay.addEventListener('wheel', handleOverlayWheel, { passive: false });
    }
    return () => {
      if (overlay) {
        overlay.removeEventListener('wheel', handleOverlayWheel);
      }
    };
  }, [zoomedImage]);

  useEffect(() => {
    const handleInternalLinks = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.hash && anchor.hash.startsWith('#')) {
        e.preventDefault();
        const id = decodeURIComponent(anchor.hash.slice(1));
        performSmoothScroll(id);
      }
    };
    const container = contentRef.current;
    if (container) { container.addEventListener('click', handleInternalLinks); }
    return () => container?.removeEventListener('click', handleInternalLinks);
  }, [post, loading]);

  const addCopyButtons = (container: HTMLElement) => {
    const pres = container.querySelectorAll('pre');
    pres.forEach(pre => {
      if (pre.querySelector('.copy-btn')) return;
      const button = document.createElement('button');
      button.className = 'copy-btn p-1.5 px-2.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-[9px] font-black uppercase tracking-widest border border-slate-700/50 backdrop-blur-md z-10';
      const copyIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
      const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      button.innerHTML = `${copyIcon}<span>Copy</span>`;
      button.addEventListener('click', async () => {
        const code = pre.querySelector('code')?.innerText || '';
        try {
          await navigator.clipboard.writeText(code);
          button.innerHTML = `${checkIcon}<span class="text-blue-400">Copied</span>`;
          setTimeout(() => { button.innerHTML = `${copyIcon}<span>Copy</span>`; }, 2000);
        } catch (err) { console.error(err); }
      });
      pre.appendChild(button);
    });
  };

  const handleCloseZoom = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setZoomedImage(null);
      setIsClosing(false);
    }, 400); 
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!zoomedImage || zoomedImage.scale <= 1) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !zoomedImage) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) hasDraggedRef.current = true;
    setZoomedImage({
      ...zoomedImage,
      pan: {
        x: zoomedImage.pan.x + dx,
        y: zoomedImage.pan.y + dy
      }
    });
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => setIsDragging(false);

  const isLongToc = toc.length > 15;

  if (loading) {
    return (
      <div className="py-40 text-center">
        <div className="flex flex-col items-center gap-6">
           <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Deciphering Entry...</span>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-40 text-center space-y-6">
        <h1 className="text-6xl font-black text-slate-200 uppercase tracking-tighter">NULL_DATA</h1>
        <button onClick={() => navigate('/posts')} className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold uppercase text-[10px] tracking-widest">Return to Archive</button>
      </div>
    );
  }

  return (
    <div className="relative pb-24">
      <div className="max-w-6xl mx-auto">
        <nav className="mb-10 flex items-center justify-start gap-3 text-[9px] font-black uppercase tracking-widest text-slate-400">
          <Link to="/" className="hover:text-blue-600 transition-colors">Front</Link>
          <span>/</span>
          <Link to="/posts" className="hover:text-blue-600 transition-colors">Archive</Link>
          <span>/</span>
          <span className="text-blue-600 truncate opacity-60 italic">{post.title}</span>
        </nav>

        <article className="space-y-12">
          <header className="space-y-8 text-left max-w-4xl">
            <div className="flex items-center gap-4">
              <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase rounded-md tracking-widest border border-blue-100">{post.category}</span>
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em] mono">{post.date}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[1.05] uppercase">
              {post.title}
            </h1>
          </header>

          {toc.length > 0 && (
            <div className="p-10 md:p-12 bg-white/60 backdrop-blur-sm rounded-[2.5rem] border border-slate-100 shadow-sm w-full">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-8 h-[2px] bg-blue-600"></div>
                <h3 className="text-[9px] font-black text-slate-900 tracking-[0.4em] uppercase">Document Map</h3>
              </div>
              
              <div className={`grid gap-12 ${isLongToc ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-12'}`}>
                <div className={isLongToc ? 'col-span-1' : 'md:col-span-8'}>
                  <nav className={`grid gap-x-12 gap-y-3 ${isLongToc ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                    {toc.map(item => (
                      <a 
                        key={item.id} 
                        href={`#${item.id}`} 
                        onClick={(e) => { e.preventDefault(); performSmoothScroll(item.id); }}
                        className={`group text-xs font-bold text-slate-500 hover:text-blue-600 transition-all py-1.5 flex items-center gap-4 border-b border-transparent hover:border-blue-100/50 ${item.level === 3 ? 'pl-8 text-[10px] text-slate-400 font-medium' : 'pl-0'}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full bg-blue-600/20 group-hover:bg-blue-600 transition-colors shrink-0 ${item.level === 3 ? 'w-1 h-1' : ''}`}></span>
                        <span className="truncate">{item.text}</span>
                      </a>
                    ))}
                  </nav>
                </div>

                {!isLongToc && (
                  <div className="md:col-span-4 flex flex-col justify-center">
                    <div className="bg-white/40 p-4 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 group">
                      <div className="relative overflow-hidden rounded-[1.5rem] aspect-[4/5]">
                        <img 
                          src={blueberryPhoto} 
                          alt="Blueberry the Kitten" 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 cursor-zoom-in"
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setZoomedImage({
                              src: blueberryPhoto,
                              rect: rect,
                              scale: 1,
                              pan: { x: 0, y: 0 }
                            });
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                      </div>
                      <div className="px-2 pb-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">
                          My Kitten Blueberry
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-[3rem] p-8 md:p-16 lg:p-20 shadow-2xl shadow-slate-200/50 border border-slate-50 relative w-full flex justify-center">
            <div ref={contentRef} className="prose-container max-w-4xl w-full" />
          </div>

          <div className="mt-16 p-10 md:p-12 bg-slate-900 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800 shadow-xl">
            <div className="space-y-2">
              <p className="text-[8px] font-black text-blue-400 uppercase tracking-[0.4em]">Operational Status</p>
              <h4 className="text-xl md:text-2xl font-bold text-white tracking-tight">Technical documentation sequence complete.</h4>
            </div>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-8 py-4 bg-slate-800 text-white border border-slate-700 rounded-full font-bold hover:bg-slate-700 transition-all text-[10px] uppercase tracking-widest"
              >
                Start Over
              </button>
              <Link to="/posts" className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-500 transition-all shadow-xl uppercase tracking-widest text-[10px] font-black">
                Full Index &rarr;
              </Link>
            </div>
          </div>
        </article>
      </div>

      {zoomedImage && (
        <div 
          ref={overlayRef}
          className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${isClosing ? 'opacity-0' : 'opacity-100'}`}
          style={{ 
            backdropFilter: isClosing ? 'blur(0px)' : 'blur(15px)', 
            backgroundColor: isClosing ? 'transparent' : 'rgba(0,0,0,0.6)',
            touchAction: 'none',
            cursor: isDragging ? 'grabbing' : zoomedImage.scale > 1 ? 'grab' : 'zoom-out'
          }}
          onClick={() => { if (!hasDraggedRef.current) handleCloseZoom(); }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <button 
            className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center bg-slate-900/60 backdrop-blur-md border border-white/50 rounded-xl text-white hover:text-white hover:bg-slate-900 transition-all duration-300 z-[110] shadow-xl"
            onClick={(e) => { e.stopPropagation(); handleCloseZoom(); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <img 
              src={zoomedImage.src}
              alt="Zoomed"
              className={`max-w-[85%] max-h-[85%] object-contain shadow-2xl pointer-events-none ${isDragging ? '' : 'transition-transform duration-300 ease-out'}`}
              style={{
                transform: `scale(${zoomedImage.scale}) translate(${zoomedImage.pan.x / zoomedImage.scale}px, ${zoomedImage.pan.y / zoomedImage.scale}px)`,
                borderRadius: '8px'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;
