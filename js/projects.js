/**
 * HYPER STEEL — PROJECTS & LIGHTBOX MODULE
 */

export function initProjects() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectItems = document.querySelectorAll('.project-item');
  const lightbox = document.querySelector('.project-lightbox');
  const lightboxImg = document.querySelector('.lightbox__image');
  const lightboxTitle = document.querySelector('.lightbox__title');
  const lightboxTag = document.querySelector('.lightbox__tag');
  const lightboxDesc = document.querySelector('.lightbox__desc');
  const lightboxClose = document.querySelector('.lightbox__close');
  const lightboxBackdrop = document.querySelector('.lightbox__backdrop');

  // Filter functionality
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const filterValue = btn.getAttribute('data-filter');

      projectItems.forEach((item) => {
        const itemCategory = item.getAttribute('data-category');
        if (filterValue === 'all' || itemCategory === filterValue) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });

      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    });
  });

  // Lightbox view
  function openLightbox(item) {
    if (!lightbox) return;
    const img = item.querySelector('.project-item__img');
    const title = item.querySelector('.project-item__title')?.textContent || '';
    const tag = item.querySelector('.project-item__tag')?.textContent || '';
    const desc = item.getAttribute('data-detail-desc') || '';

    if (lightboxImg && img) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
    }
    if (lightboxTitle) lightboxTitle.textContent = title;
    if (lightboxTag) lightboxTag.textContent = tag;
    if (lightboxDesc) lightboxDesc.textContent = desc;

    lightbox.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  projectItems.forEach((item) => {
    item.addEventListener('click', () => openLightbox(item));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(item);
      }
    });
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxBackdrop?.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox?.classList.contains('is-active')) {
      closeLightbox();
    }
  });
}
