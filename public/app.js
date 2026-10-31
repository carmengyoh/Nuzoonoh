let bookWorlds = {};
let bookReviews = [];
const text = (element, value) => {
  if (element && value != null) element.textContent = value;
};

const make = (tag, className, value) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  text(element, value);
  return element;
};

function renderList(selector, items, renderItem) {
  const container = document.querySelector(selector);
  if (!container || !Array.isArray(items)) return;
  items.forEach((item, index) => container.append(renderItem(item, index)));
}

function renderUpcoming(item) {
  const row = make("article", "upcoming-item");
  row.append(make("div", "mini-cover", ""));
  const copy = make("div", "upcoming-copy");
  copy.append(make("h3", "", item.title), make("p", "", item.type), make("p", "upcoming-meta", item.details));
  row.append(copy);
  return row;
}

function renderBook(book, index) {
  const item = make("article", "book-item");
  const cover = make("div", `cover-placeholder cover-${book.tone || "dark"}`, "");
  cover.setAttribute("role", "img");
  cover.setAttribute("aria-label", `Placeholder for book cover ${index + 1}`);
  cover.append(make("span", "cover-placeholder-text", "Cover image"));
  item.append(cover, make("h3", "book-title", book.title));
  if (book.year) item.append(make("p", "book-year", book.year));
  return item;
}

function renderNews(story) {
  const item = make("article", "news-item");
  item.append(make("div", `news-image news-image-${story.kind || "default"}`, ""));
  const copy = make("div", "news-copy");
  copy.append(make("h3", "", story.title), make("p", "", story.source));
  item.append(copy, make("span", "news-arrow", "→"));
  return item;
}

async function loadContent() {
  try {
    const response = await fetch("/api/content");
    if (!response.ok) throw new Error("Content request failed");
    const content = await response.json();
    bookReviews = content.featuredRelease.reviews || [];
    bookWorlds = content.bookWorlds || {};

    document.querySelectorAll("[data-content]").forEach((element) => {
      const value = element.dataset.content.split(".").reduce((current, key) => current?.[key], content);
      text(element, value);
    });

    setupBookCarousel(content.books);
    renderList('[data-list="news"]', content.news, renderNews);
  } catch (error) {
    document.querySelector("main").classList.add("content-unavailable");
    console.error(error);
  }
}

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");
menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
  navigation.classList.toggle("is-open", !isOpen);
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    navigation.classList.remove("is-open");
  }
});

document.querySelector("[data-year]").textContent = new Date().getFullYear();
document.querySelector("#signup-form").addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelector(".form-status").textContent = "Newsletter sign-up will be available soon.";
});

loadContent();
function setupBookCarousel(allBooks) {
  const books = (allBooks || []).slice(0, 3);
  const carousel = document.querySelector('.book-carousel');
  const stage = document.querySelector('.featured-book-stage');
  const indicators = document.querySelector('.carousel-indicators');
  if (!books.length) { document.querySelector('#books').hidden = true; return; }
  let current = 0;
  const dots = books.map((book, index) => {
    const dot = make('button', 'carousel-indicator');
    dot.type = 'button';
    dot.setAttribute('aria-label', 'Show featured book ' + (index + 1));
    dot.addEventListener('click', () => show(index));
    indicators.append(dot);
    return dot;
  });
  function show(index) {
    current = (index + books.length) % books.length;
    const book = books[current];
    const article = make('article', 'featured-book');
    article.setAttribute('aria-label', 'Book ' + (current + 1) + ' of ' + books.length);
    const cover = book.cover ? make('img', 'carousel-cover') : make('div', 'cover-placeholder carousel-cover cover-' + (book.tone || 'dark'));
    if (book.cover) { cover.src = book.cover; cover.alt = book.title + ' book cover'; }
    cover.setAttribute('role', 'img');
    cover.setAttribute('aria-label', (book.cover ? 'Book cover for ' : 'Cover placeholder for ') + book.title);
    if (!book.cover) cover.append(make('span', 'cover-placeholder-text', 'Cover image coming soon'));
    const copy = make('div', 'featured-book-copy');
    copy.append(make('h3', '', book.title), make('p', 'featured-book-description', book.description || 'Explore stories of folklore, the supernatural and African horror.'));
    const link = make('a', 'button button-dark', 'Explore the book');
    link.href = '#book-world';
    link.dataset.bookWorld = book.id;

    copy.append(link);
    const count = make('span', 'carousel-count', String(current + 1).padStart(2, '0') + ' / ' + String(books.length).padStart(2, '0'));
    article.append(cover, copy, count);
    stage.replaceChildren(article);
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === current)));
  }
  document.querySelector('.carousel-prev').addEventListener('click', () => show(current - 1));
  document.querySelector('.carousel-next').addEventListener('click', () => show(current + 1));
  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); show(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  show(0);
}



const bookScene = document.querySelector('.release-book-scene');
const bookJacket = document.querySelector('.release-book');
const bookMotionAllowed = matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)');
bookScene.addEventListener('pointermove', (event) => {
  if (!bookMotionAllowed.matches) return;
  const rect = bookScene.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - .5;
  const y = (event.clientY - rect.top) / rect.height - .5;
  bookJacket.style.setProperty('--book-x', `${-y * 7}deg`);
  bookJacket.style.setProperty('--book-y', `${x * 12 - 5}deg`);
});
bookScene.addEventListener('pointerleave', () => {
  bookJacket.style.removeProperty('--book-x');
  bookJacket.style.removeProperty('--book-y');
});



let bookTurning = false;
let reviewPage = -1;
const reviewBack = document.querySelector('.book-back');
function turnBook() {
  if (bookTurning || !bookReviews.length) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const next = reviewPage + 1 >= bookReviews.length ? -1 : reviewPage + 1;
  let leaf;
  if (reviewPage >= 0 && next >= 0 && !reducedMotion) {
    leaf = reviewBack.cloneNode(true);
    leaf.classList.add('review-leaf');
    leaf.setAttribute('aria-hidden', 'true');
    document.querySelector('.book-turner').append(leaf);
  }
  if (next >= 0) {
    reviewBack.querySelector('blockquote').textContent = '“' + bookReviews[next].quote + '”';
    reviewBack.querySelector('.book-quote-source').textContent = bookReviews[next].reviewer;
  }
  reviewPage = next;
  const open = reviewPage >= 0;
  bookJacket.classList.toggle('is-turned', open);
  bookJacket.setAttribute('aria-pressed', String(open));
  const hint = !open ? 'turn to read reviews' : reviewPage === bookReviews.length - 1 ? 'back to the cover' : 'turn page';
  document.querySelector('.book-edge-note').textContent = hint + ' ↻';
  bookJacket.setAttribute('aria-label', open ? 'Review ' + (reviewPage + 1) + ' of ' + bookReviews.length + '. ' + hint : 'Turn the book to read reviews');
  reviewBack.setAttribute('aria-hidden', String(!open));
  document.querySelector('.book-front').setAttribute('aria-hidden', String(open));
  if (!reducedMotion) {
    bookTurning = true;
    setTimeout(() => { leaf?.remove(); bookTurning = false; }, 950);
  }
}
bookJacket.addEventListener('click', turnBook);
bookJacket.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); turnBook(); }
});

// Each gallery is a native modal: focus is contained, Escape closes it, and the
// underlying page retains its scroll position. Audio starts only with user input.
const worldDialog = document.querySelector('.book-world');
const worldScroller = worldDialog.querySelector('.world-scroll');
const worldAudio = worldDialog.querySelector('.world-audio');
let worldTrigger;
let previousBodyOverflow;
const worldObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    entry.target.classList.toggle('is-in-view', entry.isIntersecting);
    if (entry.target.classList.contains('world-listening') && !entry.isIntersecting) worldAudio.pause();
  }
}, {root: worldScroller, threshold:.3});
worldDialog.querySelectorAll('.world-panel').forEach(panel => worldObserver.observe(panel));
function openBookWorld(id, trigger) {
  const world = bookWorlds[id];
  if (!world) return;
  worldTrigger = trigger;
  const origin = (trigger.closest('.featured-release')?.querySelector('.release-cover-image') || trigger.closest('.featured-book')?.querySelector('.carousel-cover'))?.getBoundingClientRect();
  worldDialog.style.setProperty('--world-bg',world.background);
  worldDialog.style.setProperty('--world-glow',world.glow);
  worldDialog.style.setProperty('--world-accent',world.accent);
  const cover = worldDialog.querySelector('.world-cover');
  cover.src = world.cover; cover.alt = world.title + ' book cover';
  worldDialog.querySelector('#world-title').textContent = world.title;
  worldDialog.querySelector('.world-subtitle').textContent = world.subtitle;
  worldDialog.querySelector('.world-summary-copy').textContent = world.summary || 'Story summary coming soon.';
  worldDialog.querySelector('.world-excerpt').textContent = world.excerpt || '';
  worldDialog.querySelector('.world-audio-status').hidden = Boolean(world.audio);
  worldAudio.pause(); worldAudio.removeAttribute('src'); worldAudio.load();
  worldAudio.hidden = !world.audio;
  worldDialog.querySelector('.world-listen-note').hidden = !world.audio;
  if (world.audio) worldAudio.src = world.audio;
  const review = worldDialog.querySelector('.world-review');
  review.hidden = !world.quote;
  // Hidden panels must not inherit the flex display used by gallery sections.
  review.style.display = world.quote ? '' : 'none';
  worldDialog.querySelector('.world-review-quote').textContent = world.quote ? '“' + world.quote + '”' : '';
  worldDialog.querySelector('.world-review-source').textContent = world.reviewer || '';
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  worldDialog.showModal(); worldScroller.scrollTop = 0;
  worldDialog.querySelector('.world-close').focus({preventScroll:true});
  if (origin && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    requestAnimationFrame(() => {
      const destination = cover.getBoundingClientRect();
      cover.animate([
        {transform:`translate(${origin.left-destination.left}px, ${origin.top-destination.top}px) scale(${origin.width/destination.width}, ${origin.height/destination.height})`,opacity:.65},
        {transform:'translate(0,0) scale(1)',opacity:1}
      ],{duration:900,easing:'cubic-bezier(.22,.75,.2,1)'});
    });
  }
}
document.addEventListener('click',(event) => {
  const trigger = event.target.closest('[data-book-world]');
  if (trigger) { event.preventDefault(); openBookWorld(trigger.dataset.bookWorld,trigger); }
});
worldDialog.querySelector('.world-close').addEventListener('click',()=>worldDialog.close());
worldDialog.querySelector('.world-return').addEventListener('click',()=>worldDialog.close());
worldDialog.querySelector('.world-scroll-hint').addEventListener('click',event=>{
  event.preventDefault(); worldDialog.querySelector('.world-summary').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
});
worldDialog.addEventListener('close',()=>{
  worldAudio.pause(); document.body.style.overflow = previousBodyOverflow || '';
  worldTrigger?.focus({preventScroll:true});
});

