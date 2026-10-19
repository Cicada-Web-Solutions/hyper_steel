/**
 * HYPER STEEL — PROJECT CONSULTATION MODULE
 */

export function initEnquiry() {
  const modal = document.querySelector('.enquiry-modal');
  const openBtns = document.querySelectorAll('.js-open-enquiry');
  const closeBtn = document.querySelector('.enquiry-modal__close');
  const backdrop = document.querySelector('.enquiry-modal__backdrop');
  const form = document.querySelector('#enquiry-form');

  if (!modal) return;

  function openModal(defaultService = '') {
    modal.classList.add('is-active');
    document.body.style.overflow = 'hidden';
    if (defaultService) {
      const serviceSelect = modal.querySelector('#enquiry-service');
      if (serviceSelect) serviceSelect.value = defaultService;
    }
    const firstInput = modal.querySelector('input');
    setTimeout(() => firstInput?.focus(), 100);
  }

  function closeModal() {
    modal.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  openBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const service = btn.getAttribute('data-service') || '';
      openModal(service);
    });
  });

  closeBtn?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-active')) {
      closeModal();
    }
  });

  // Handle Form Submission -> WhatsApp Link
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('#enquiry-name')?.value.trim() || 'Client';
      const phone = form.querySelector('#enquiry-phone')?.value.trim() || '';
      const service = form.querySelector('#enquiry-service')?.value || 'Architectural Steel Project';
      const location = form.querySelector('#enquiry-location')?.value.trim() || 'Madurai';
      const message = form.querySelector('#enquiry-message')?.value.trim() || '';

      const text = `Hello Hyper Steel,\n\nI am interested in discussing an architectural project:\n- Name: ${name}\n- Phone: ${phone}\n- Discipline: ${service}\n- Project Location: ${location}\n- Notes: ${message}\n\nPlease let me know when we can schedule a consultation.`;

      const encodedText = encodeURIComponent(text);
      const whatsappUrl = `https://wa.me/919944020815?text=${encodedText}`;

      closeModal();
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    });
  }
}
