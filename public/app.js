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
    const cover = make('div', 'cover-placeholder carousel-cover cover-' + (book.tone || 'dark'));
    cover.setAttribute('role', 'img');
    cover.setAttribute('aria-label', 'Cover placeholder for ' + book.title);
    cover.append(make('span', 'cover-placeholder-text', 'Cover image coming soon'));
    const copy = make('div', 'featured-book-copy');
    copy.append(make('h3', '', book.title), make('p', 'featured-book-description', book.description || 'Explore stories of folklore, the supernatural and African horror.'));
    const link = make('a', 'button button-dark', 'Explore the book');
    link.href = book.url || '#contact';

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
function turnBook() {
  if (bookTurning) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion) {
    bookTurning = true;
    setTimeout(() => { bookTurning = false; }, 950);
  }
  const turned = bookJacket.classList.toggle('is-turned');
  bookJacket.setAttribute('aria-pressed', String(turned));
  bookJacket.setAttribute('aria-label', turned ? 'Turn back to the book cover' : 'Turn the book to read a quote');
  document.querySelector('.book-edge-note').textContent = turned ? 'back to the cover ↻' : 'turn to read reviews ↻';
  document.querySelector('.book-back').setAttribute('aria-hidden', String(!turned));
  document.querySelector('.book-front').setAttribute('aria-hidden', String(turned));
}
bookJacket.addEventListener('click', turnBook);
bookJacket.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); turnBook(); }
});


