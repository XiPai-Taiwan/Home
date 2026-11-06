function initMenu() {
  const menuItems = [...document.querySelectorAll('#nav li')]
    .map(item => ({ item, menu: item.querySelector(':scope > ul.subnav'), control: item.querySelector(':scope > a, :scope > div > a') }))
    .filter(({ menu, control }) => menu && control);

  function closeMenus() {
    menuItems.forEach(({ item, control }) => {
      item.classList.remove('menu-open');
      control.setAttribute('aria-expanded', 'false');
    });
  }

  menuItems.forEach(({ control }) => {
    control.setAttribute('aria-haspopup', 'true');
    control.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('click', event => {
    const control = event.target.closest('a[data-local-control]');
    if (!control) return closeMenus();
    event.preventDefault();
    const entry = menuItems.find(entry => entry.control === control);
    if (entry) control.setAttribute('aria-expanded', String(entry.item.classList.toggle('menu-open')));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenus();
  });
}

function initAgencyLogos() {
  const products = document.querySelectorAll('#nicedit_1 .col-4 img');
  const brands = [...document.querySelectorAll('.agency-brand')].map((element, index) => ({
    element,
    reference: products[index === 0 ? 4 : 6],
    upper: element.querySelector('.agency-logo'),
    lower: element.querySelector('.agency-logo-next')
  }));

  function alignAgencyLogos() {
    brands.forEach(({ element, reference, upper }) => {
      if (!reference || !upper) return;
      const offset = reference.getBoundingClientRect().left - element.getBoundingClientRect().left;
      element.style.paddingLeft = Math.max(0, offset) + 'px';
      element.style.setProperty('--agency-upper-width', upper.getBoundingClientRect().width + 'px');
    });
    const bottoms = brands.map(({ upper }) => upper?.getBoundingClientRect().bottom || 0);
    const rowBottom = Math.max(0, ...bottoms);
    const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--agency-row-gap')) || 30;
    const twoColumns = window.matchMedia('(min-width:577px)').matches;
    brands.forEach(({ lower }, index) => {
      if (lower) lower.style.marginTop = (gap + (twoColumns ? rowBottom - bottoms[index] : 0)) + 'px';
    });
  }

  let resizeFrame;
  alignAgencyLogos();
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(alignAgencyLogos);
  });
}

function initCarousel() {
  const carousel = document.querySelector('.hero-carousel');
    if (!carousel) return;
    const slides = [...carousel.querySelectorAll('.hero-slide')];
    if (slides.length < 2) return;
    let current = 0;
    setInterval(() => {
      slides[current].classList.remove('is-active');
      slides[current].setAttribute('aria-hidden', 'true');
      current = (current + 1) % slides.length;
      slides[current].classList.add('is-active');
      slides[current].setAttribute('aria-hidden', 'false');
    }, Number(carousel.dataset.interval) || 3000);
}

function initFixedHeader() {
  const navbar = document.querySelector('.topnavbar');
  if (navbar) {
    const updateNavbarHeight = () => {
      document.documentElement.style.setProperty('--navbar-height', navbar.getBoundingClientRect().height + 'px');
    };
    updateNavbarHeight();
    new ResizeObserver(updateNavbarHeight).observe(navbar);
  }
}

initMenu();
initFixedHeader();
window.addEventListener('load', () => {
  initAgencyLogos();
  initCarousel();
});


// Choose the opening direction before a submenu reaches the screen edge.
function positionSubmenu(item) {
  const menu = item?.querySelector(':scope > ul.subnav');
  if (!menu) return;
  const bounds = item.getBoundingClientRect();
  const nested = item.parentElement.matches('ul.subnav');
  if (!menu.querySelector('ul.subnav') && menu.scrollHeight > innerHeight - 24) {
    menu.style.maxHeight = (innerHeight - 24) + 'px';
    menu.style.overflowY = 'auto';
  }
  const preferredTop = nested ? 0 : bounds.height;
  const lastTop = innerHeight - bounds.top - menu.offsetHeight - 12;
  menu.style.top = Math.max(12 - bounds.top, Math.min(preferredTop, lastTop)) + 'px';
  if (nested) {
    item.classList.toggle('submenu-flip', bounds.right + menu.offsetWidth > innerWidth - 12);
  } else {
    const left = Math.min(10, innerWidth - bounds.left - menu.offsetWidth - 12);
    menu.style.left = Math.max(12 - bounds.left, left) + 'px';
  }
}

document.querySelectorAll('#nav li').forEach(item => {
  if (!item.querySelector(':scope > ul.subnav')) return;
  item.addEventListener('pointerenter', () => positionSubmenu(item));
  item.addEventListener('focusin', () => positionSubmenu(item));
  item.addEventListener('click', () => positionSubmenu(item));
});

// Show expansion arrows only where a submenu exists.
document.querySelectorAll('#nav li.has-subnav').forEach(item => {
  if (!item.querySelector(':scope > ul.subnav')) item.classList.remove('has-subnav');
});
