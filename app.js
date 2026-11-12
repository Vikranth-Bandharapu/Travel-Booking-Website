/* ==========================================================================
   Meridian — LocalStorage Persistence Utility
   Safe wrapper around localStorage for wishlist, search state, promos,
   newsletter subscriptions, and saved booking quotes.
   ========================================================================== */

(function (global) {
  'use strict';

  const Meridian = (global.Meridian = global.Meridian || {});

  const STORAGE_KEYS = {
    WISHLIST: 'meridian_wishlist_v1',
    APPLIED_PROMO: 'meridian_applied_promo_v1',
    SEARCH_STATE: 'meridian_search_state_v1',
    NEWSLETTER: 'meridian_newsletter_v1',
    RECENT_QUOTES: 'meridian_saved_quotes_v1'
  };

  function safeRead(key, fallback) {
    try {
      const raw = global.localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  function safeWrite(key, value) {
    try {
      global.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false;
    }
  }

  const storage = {
    getWishlist() {
      const data = safeRead(STORAGE_KEYS.WISHLIST, []);
      return Array.isArray(data) ? data : [];
    },

    saveWishlist(ids) {
      return safeWrite(STORAGE_KEYS.WISHLIST, Array.from(new Set(ids)));
    },

    getAppliedPromo() {
      return safeRead(STORAGE_KEYS.APPLIED_PROMO, null);
    },

    saveAppliedPromo(code) {
      if (!code) {
        try {
          global.localStorage.removeItem(STORAGE_KEYS.APPLIED_PROMO);
        } catch (err) {
          /* ignore */
        }
        return true;
      }
      return safeWrite(STORAGE_KEYS.APPLIED_PROMO, code);
    },

    getSearchState() {
      return safeRead(STORAGE_KEYS.SEARCH_STATE, null);
    },

    saveSearchState(state) {
      return safeWrite(STORAGE_KEYS.SEARCH_STATE, state);
    },

    getNewsletterSubscription() {
      return safeRead(STORAGE_KEYS.NEWSLETTER, null);
    },

    saveNewsletterSubscription(email) {
      return safeWrite(STORAGE_KEYS.NEWSLETTER, {
        email: email,
        subscribedAt: new Date().toISOString()
      });
    },

    getSavedQuotes() {
      const quotes = safeRead(STORAGE_KEYS.RECENT_QUOTES, []);
      return Array.isArray(quotes) ? quotes : [];
    },

    addSavedQuote(quote) {
      const quotes = this.getSavedQuotes();
      quotes.unshift(quote);
      return safeWrite(STORAGE_KEYS.RECENT_QUOTES, quotes.slice(0, 10));
    }
  };

  Meridian.storage = storage;
})(window);


/* ==========================================================================
   Meridian — Formatting & Calculation Utilities
   ========================================================================== */

(function (global) {
  'use strict';

  const Meridian = (global.Meridian = global.Meridian || {});

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });

  function formatCurrency(amount) {
    const num = Number(amount) || 0;
    return currencyFormatter.format(Math.round(num));
  }

  function toISODate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function addDays(dateStr, days) {
    const date = parseLocalDate(dateStr);
    date.setDate(date.getDate() + days);
    return toISODate(date);
  }

  function parseLocalDate(dateStr) {
    const parts = String(dateStr || '').split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) {
      return new Date();
    }
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function diffNights(checkInStr, checkOutStr) {
    if (!checkInStr || !checkOutStr) return 0;
    const start = parseLocalDate(checkInStr);
    const end = parseLocalDate(checkOutStr);
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((end.getTime() - start.getTime()) / msPerDay);
  }

  function formatShortDate(dateStr) {
    if (!dateStr) return '';
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  function getTodayISO() {
    return toISODate(new Date());
  }

  /**
   * Compute itemized booking price estimation for a hotel stay.
   */
  function calculateEstimate(options) {
    const {
      nightlyRate = 0,
      nights = 3,
      rooms = 1,
      adults = 2,
      children = 0,
      addOnsTotal = 0,
      promo = null
    } = options;

    const validNights = Math.max(1, Number(nights) || 1);
    const validRooms = Math.max(1, Number(rooms) || 1);
    const totalGuests = Math.max(1, (Number(adults) || 1) + (Number(children) || 0));

    // Base room subtotal
    const roomSubtotal = nightlyRate * validNights * validRooms;

    // Extra guest occupancy surcharge if guests exceed 2 per room ($35/extra guest/night)
    const standardCapacity = validRooms * 2;
    const extraGuests = Math.max(0, totalGuests - standardCapacity);
    const extraGuestFee = extraGuests * 35 * validNights;

    const preDiscountSubtotal = roomSubtotal + extraGuestFee + addOnsTotal;

    // Promo evaluation
    let discountAmount = 0;
    let promoApplied = false;
    let promoReason = '';

    if (promo) {
      const minNights = promo.minNights || 1;
      const minSpend = promo.minSpend || 0;
      const categoryFilter = promo.eligibleCategories || null;

      if (validNights < minNights) {
        promoReason = `Requires at least ${minNights} nights`;
      } else if (preDiscountSubtotal < minSpend) {
        promoReason = `Requires stay subtotal of ${formatCurrency(minSpend)}+`;
      } else if (categoryFilter && options.category && !categoryFilter.includes(options.category)) {
        promoReason = `Valid on ${categoryFilter.join(' / ')} stays`;
      } else {
        promoApplied = true;
        if (promo.type === 'percent') {
          discountAmount = Math.round((preDiscountSubtotal * promo.value) / 100);
        } else if (promo.type === 'fixed') {
          discountAmount = Math.min(preDiscountSubtotal, promo.value);
        }
      }
    }

    const discountedSubtotal = Math.max(0, preDiscountSubtotal - discountAmount);
    const taxesAndFees = Math.round(discountedSubtotal * 0.12);
    const grandTotal = discountedSubtotal + taxesAndFees;

    return {
      nights: validNights,
      rooms: validRooms,
      totalGuests,
      extraGuests,
      roomSubtotal,
      extraGuestFee,
      addOnsTotal,
      preDiscountSubtotal,
      discountAmount,
      promoApplied,
      promoReason,
      taxesAndFees,
      grandTotal
    };
  }

  function escapeHTML(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  Meridian.utils = {
    formatCurrency,
    toISODate,
    addDays,
    parseLocalDate,
    diffNights,
    formatShortDate,
    getTodayISO,
    calculateEstimate,
    escapeHTML
  };
})(window);


/* ==========================================================================
   Meridian — Toast Notification Utility
   ========================================================================== */

(function (global) {
  'use strict';

  const Meridian = (global.Meridian = global.Meridian || {});

  function show(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'status');
    toast.textContent = message;

    container.appendChild(toast);

    global.setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'opacity 220ms ease, transform 220ms ease';
      global.setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 240);
    }, 3000);
  }

  Meridian.toast = { show };
})(window);


/* ==========================================================================
   Meridian — Header Scroll State & Responsive Mobile Navigation
   ========================================================================== */

(function (global) {
  'use strict';

  const Meridian = (global.Meridian = global.Meridian || {});

  function init() {
    const header = document.getElementById('site-header');
    const toggleBtn = document.getElementById('nav-toggle');
    const closeBtn = document.getElementById('mobile-nav-close');
    const mobileNav = document.getElementById('mobile-nav');
    const backdrop = document.getElementById('mobile-nav-backdrop');
    const navLinks = document.querySelectorAll('.primary-nav__link, .mobile-nav__link');

    function updateHeaderScroll() {
      if (!header) return;
      header.classList.toggle('is-scrolled', global.scrollY > 28);
    }

    function openMenu() {
      if (!mobileNav || !backdrop || !toggleBtn) return;
      mobileNav.classList.add('is-open');
      backdrop.classList.add('is-open');
      mobileNav.setAttribute('aria-hidden', 'false');
      toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('no-scroll');
    }

    function closeMenu() {
      if (!mobileNav || !backdrop || !toggleBtn) return;
      mobileNav.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      mobileNav.setAttribute('aria-hidden', 'true');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
    }

    if (toggleBtn) toggleBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    if (backdrop) backdrop.addEventListener('click', closeMenu);

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('is-open')) {
        closeMenu();
      }
    });

    // Active section highlight on scroll
    const sectionIds = ['destinations', 'experiences', 'hotels', 'offers', 'itineraries', 'seasons', 'testimonials', 'faq'];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    function updateActiveNav() {
      const scrollPos = global.scrollY + 130;
      let currentId = '';
      sections.forEach((sec) => {
        if (scrollPos >= sec.offsetTop) {
          currentId = sec.id;
        }
      });

      document.querySelectorAll('.primary-nav__link').forEach((link) => {
        const href = link.getAttribute('href');
        link.classList.toggle('is-active', href === `#${currentId}`);
      });
    }

    function updateScrollProgress() {
      const bar = document.getElementById('scroll-progress');
      if (!bar) return;
      const docHeight = document.documentElement.scrollHeight - global.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (global.scrollY / docHeight) * 100)) : 0;
      bar.style.width = `${pct.toFixed(1)}%`;
    }

    global.addEventListener(
      'scroll',
      () => {
        updateHeaderScroll();
        updateActiveNav();
        updateScrollProgress();
      },
      { passive: true }
    );

    updateHeaderScroll();
    updateActiveNav();
    updateScrollProgress();
  }

  Meridian.navigation = { init };
})(window);


/* ==========================================================================
   Meridian — Hero Search, Destination Autocomplete, Date Validation & Guests
   ========================================================================== */

(function (global) {
  'use strict';

  const Meridian = (global.Meridian = global.Meridian || {});

  function init() {
    const form = document.getElementById('hero-search-form');
    const destInput = document.getElementById('search-destination');
    const destClearBtn = document.getElementById('search-dest-clear');
    const destDropdown = document.getElementById('destination-autocomplete');
    const checkInInput = document.getElementById('search-checkin');
    const checkOutInput = document.getElementById('search-checkout');
    const datesField = document.getElementById('search-dates-field');
    const nightsBadge = document.getElementById('search-nights-badge');
    const errorEl = document.getElementById('search-error-msg');
    const summaryEl = document.getElementById('search-summary-text');

    const guestField = document.getElementById('search-guest-field');
    const guestTrigger = document.getElementById('guest-popover-trigger');
    const guestSummaryLabel = document.getElementById('guest-summary-label');
    const guestPopover = document.getElementById('guest-popover');
    const guestDoneBtn = document.getElementById('guest-popover-done');
    const guestNoteEl = document.getElementById('guest-capacity-note');

    if (!form) return;

    const { getTodayISO, addDays, diffNights, formatShortDate, escapeHTML } = Meridian.utils;
    const today = getTodayISO();

    // Initialize default valid dates if not set
    if (!Meridian.state.checkIn || Meridian.state.checkIn < today) {
      Meridian.state.checkIn = addDays(today, 3);
    }
    if (!Meridian.state.checkOut || diffNights(Meridian.state.checkIn, Meridian.state.checkOut) < 1) {
      Meridian.state.checkOut = addDays(Meridian.state.checkIn, 3);
    }

    checkInInput.min = today;
    checkOutInput.min = addDays(Meridian.state.checkIn, 1);

    function syncInputsFromState() {
      destInput.value = Meridian.state.destinationQuery || '';
      destClearBtn.hidden = !destInput.value.trim();
      checkInInput.value = Meridian.state.checkIn;
      checkOutInput.min = addDays(Meridian.state.checkIn || today, 1);
      checkOutInput.value = Meridian.state.checkOut;

      const nights = diffNights(Meridian.state.checkIn, Meridian.state.checkOut);
      nightsBadge.textContent = nights > 0 ? `${nights} night${nights === 1 ? '' : 's'}` : 'Select dates';

      const { adults, children, rooms } = Meridian.state;
      const totalGuests = adults + children;
      guestSummaryLabel.textContent = `${totalGuests} Guest${totalGuests === 1 ? '' : 's'} · ${rooms} Room${rooms === 1 ? '' : 's'}`;

      document.getElementById('val-adults').textContent = adults;
      document.getElementById('val-children').textContent = children;
      document.getElementById('val-rooms').textContent = rooms;

      // Stepper limits
      updateStepperButtons();
      updateSummaryBar(nights);
    }

    function updateStepperButtons() {
      const { adults, children, rooms } = Meridian.state;
      const setDisabled = (id, cond) => {
        const el = document.getElementById(id);
        if (el) el.disabled = cond;
      };
      setDisabled('adults-dec', adults <= 1);
      setDisabled('adults-inc', adults >= 10);
      setDisabled('children-dec', children <= 0);
      setDisabled('children-inc', children >= 6);
      setDisabled('rooms-dec', rooms <= 1);
      setDisabled('rooms-inc', rooms >= 5);

      const totalGuests = adults + children;
      const maxRecommended = rooms * 4;
      if (totalGuests > maxRecommended) {
        const neededRooms = Math.ceil(totalGuests / 4);
        Meridian.state.rooms = Math.min(5, neededRooms);
        document.getElementById('val-rooms').textContent = Meridian.state.rooms;
        if (guestNoteEl) {
          guestNoteEl.textContent = `Adjusted to ${Meridian.state.rooms} rooms (max 4 guests per room).`;
        }
      } else if (guestNoteEl) {
        guestNoteEl.textContent = 'Up to 4 guests per room · Children under 12 stay complimentary.';
      }
    }

    function updateSummaryBar(nights) {
      if (!summaryEl) return;
      const destText = Meridian.state.destinationQuery
        ? `in "${Meridian.state.destinationQuery}"`
        : 'across all destinations';
      const dateText =
        nights > 0
          ? `${formatShortDate(Meridian.state.checkIn)} – ${formatShortDate(Meridian.state.checkOut)} (${nights}n)`
          : 'flexible dates';
      summaryEl.textContent = `Live pricing ${destText} · ${dateText}`;
    }

    function showError(msg) {
      datesField.classList.add('has-error');
      errorEl.textContent = msg;
      errorEl.classList.add('is-visible');
    }

    function clearError() {
      datesField.classList.remove('has-error');
      errorEl.textContent = '';
      errorEl.classList.remove('is-visible');
    }

    function validateDates(autoFixCheckOut = false) {
      const inVal = checkInInput.value;
      const outVal = checkOutInput.value;

      if (!inVal || !outVal) {
        showError('Please select both check-in and check-out dates.');
        return false;
      }

      if (inVal < today) {
        showError('Check-in date cannot be in the past.');
        return false;
      }

      checkOutInput.min = addDays(inVal, 1);

      let nights = diffNights(inVal, outVal);
      if (nights < 1) {
        if (autoFixCheckOut) {
          const nextDay = addDays(inVal, 2);
          checkOutInput.value = nextDay;
          Meridian.state.checkOut = nextDay;
          nights = 2;
          clearError();
          return true;
        }
        showError('Check-out must be at least 1 night after check-in.');
        return false;
      }

      if (nights > 30) {
        showError('Online stays are limited to 30 nights per reservation.');
        return false;
      }

      clearError();
      return true;
    }

    // Autocomplete rendering
    function renderAutocomplete(query) {
      const q = (query || '').trim().toLowerCase();
      const destinations = Meridian.data.destinations;
      const matches = q
        ? destinations.filter(
            (d) =>
              d.name.toLowerCase().includes(q) ||
              d.country.toLowerCase().includes(q) ||
              d.vibe.toLowerCase().includes(q)
          )
        : destinations;

      if (!matches.length) {
        destDropdown.innerHTML = `
          <div class="autocomplete-item" role="option" aria-disabled="true">
            <div>
              <div class="autocomplete-item__title">No matching destination</div>
              <div class="autocomplete-item__sub">Try Santorini, Kyoto, Bali, Amalfi, or Maldives</div>
            </div>
          </div>`;
      } else {
        destDropdown.innerHTML = matches
          .map(
            (d) => `
          <button type="button" class="autocomplete-item" role="option" data-dest-id="${escapeHTML(d.id)}" data-dest-name="${escapeHTML(d.name)}">
            <div>
              <div class="autocomplete-item__title">${escapeHTML(d.name)}, ${escapeHTML(d.country)}</div>
              <div class="autocomplete-item__sub">${escapeHTML(d.vibe)} · ${d.stayCount} stays</div>
            </div>
            <span class="autocomplete-item__meta">From ${Meridian.utils.formatCurrency(d.startingPrice)}</span>
          </button>`
          )
          .join('');
      }
    }

    function openAutocomplete() {
      renderAutocomplete(destInput.value);
      destDropdown.classList.add('is-open');
    }

    function closeAutocomplete() {
      destDropdown.classList.remove('is-open');
    }

    destInput.addEventListener('focus', openAutocomplete);
    destInput.addEventListener('input', () => {
      const val = destInput.value;
      Meridian.state.destinationQuery = val.trim();
      Meridian.state.selectedDestinationId = 'all';
      destClearBtn.hidden = !val.trim();
      renderAutocomplete(val);
      destDropdown.classList.add('is-open');

      Meridian.storage.saveSearchState({
        destinationQuery: Meridian.state.destinationQuery,
        checkIn: Meridian.state.checkIn,
        checkOut: Meridian.state.checkOut,
        adults: Meridian.state.adults,
        children: Meridian.state.children,
        rooms: Meridian.state.rooms
      });

      Meridian.destinations.render();
      Meridian.hotels.syncDestinationFilter();
      Meridian.hotels.render();
      updateSummaryBar(diffNights(Meridian.state.checkIn, Meridian.state.checkOut));
    });

    destDropdown.addEventListener('click', (e) => {
      const item = e.target.closest('[data-dest-id]');
      if (!item) return;
      const destId = item.getAttribute('data-dest-id');
      const destName = item.getAttribute('data-dest-name');

      Meridian.state.destinationQuery = destName;
      Meridian.state.selectedDestinationId = destId;
      destInput.value = destName;
      destClearBtn.hidden = false;
      closeAutocomplete();

      Meridian.destinations.render();
      Meridian.hotels.syncDestinationFilter();
      Meridian.hotels.render();
      updateSummaryBar(diffNights(Meridian.state.checkIn, Meridian.state.checkOut));
    });

    destClearBtn.addEventListener('click', () => {
      Meridian.state.destinationQuery = '';
      Meridian.state.selectedDestinationId = 'all';
      destInput.value = '';
      destClearBtn.hidden = true;
      destInput.focus();
      Meridian.destinations.render();
      Meridian.hotels.syncDestinationFilter();
      Meridian.hotels.render();
      updateSummaryBar(diffNights(Meridian.state.checkIn, Meridian.state.checkOut));
    });

    // Quick destination tag pills below search bar
    document.querySelectorAll('[data-quick-dest]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const destId = btn.getAttribute('data-quick-dest');
        const dest = Meridian.data.destinations.find((d) => d.id === destId);
        if (!dest) return;
        Meridian.state.destinationQuery = dest.name;
        Meridian.state.selectedDestinationId = dest.id;
        syncInputsFromState();
        Meridian.destinations.render();
        Meridian.hotels.syncDestinationFilter();
        Meridian.hotels.render();
      });
    });

    // Date change listeners
    checkInInput.addEventListener('change', () => {
      Meridian.state.checkIn = checkInInput.value;
      if (validateDates(true)) {
        Meridian.state.checkOut = checkOutInput.value;
        syncInputsFromState();
        Meridian.storage.saveSearchState({
          destinationQuery: Meridian.state.destinationQuery,
          checkIn: Meridian.state.checkIn,
          checkOut: Meridian.state.checkOut,
          adults: Meridian.state.adults,
          children: Meridian.state.children,
          rooms: Meridian.state.rooms
        });
        Meridian.hotels.render();
      }
    });

    checkOutInput.addEventListener('change', () => {
      Meridian.state.checkOut = checkOutInput.value;
      if (validateDates(false)) {
        syncInputsFromState();
        Meridian.storage.saveSearchState({
          destinationQuery: Meridian.state.destinationQuery,
          checkIn: Meridian.state.checkIn,
          checkOut: Meridian.state.checkOut,
          adults: Meridian.state.adults,
          children: Meridian.state.children,
          rooms: Meridian.state.rooms
        });
        Meridian.hotels.render();
      }
    });

    // Guest & Room popover
    function toggleGuestPopover(forceState) {
      const next = typeof forceState === 'boolean' ? forceState : !guestPopover.classList.contains('is-open');
      guestPopover.classList.toggle('is-open', next);
      guestField.classList.toggle('is-open', next);
      guestTrigger.setAttribute('aria-expanded', String(next));
    }

    guestTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleGuestPopover();
    });

    guestDoneBtn.addEventListener('click', () => {
      toggleGuestPopover(false);
    });

    const stepperMap = [
      { id: 'adults-inc', key: 'adults', delta: 1, min: 1, max: 10 },
      { id: 'adults-dec', key: 'adults', delta: -1, min: 1, max: 10 },
      { id: 'children-inc', key: 'children', delta: 1, min: 0, max: 6 },
      { id: 'children-dec', key: 'children', delta: -1, min: 0, max: 6 },
      { id: 'rooms-inc', key: 'rooms', delta: 1, min: 1, max: 5 },
      { id: 'rooms-dec', key: 'rooms', delta: -1, min: 1, max: 5 }
    ];

    stepperMap.forEach((item) => {
      const btn = document.getElementById(item.id);
      if (!btn) return;
      btn.addEventListener('click', () => {
        const nextVal = Meridian.state[item.key] + item.delta;
        if (nextVal < item.min || nextVal > item.max) return;
        Meridian.state[item.key] = nextVal;
        syncInputsFromState();
        Meridian.storage.saveSearchState({
          destinationQuery: Meridian.state.destinationQuery,
          checkIn: Meridian.state.checkIn,
          checkOut: Meridian.state.checkOut,
          adults: Meridian.state.adults,
          children: Meridian.state.children,
          rooms: Meridian.state.rooms
        });
        Meridian.hotels.render();
      });
    });

    // Close popovers on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#search-dest-field')) {
        closeAutocomplete();
      }
      if (!e.target.closest('#search-guest-field')) {
        toggleGuestPopover(false);
      }
    });

    // Form submit -> validate & scroll to results
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateDates(false)) {
        checkOutInput.focus();
        return;
      }

      closeAutocomplete();
      toggleGuestPopover(false);

      Meridian.storage.saveSearchState({
        destinationQuery: Meridian.state.destinationQuery,
        checkIn: Meridian.state.checkIn,
        checkOut: Meridian.state.checkOut,
        adults: Meridian.state.adults,
        children: Meridian.state.children,
        rooms: Meridian.state.rooms
      });

      Meridian.destinations.render();
      Meridian.hotels.syncDestinationFilter();
      Meridian.hotels.render();

      const hotelsSection = document.getElementById('hotels');
      if (hotelsSection) {
        hotelsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    syncInputsFromState();
    Meridian.search = { syncInputsFromState };
  }

  Meridian.search = { init };
})(window);


/* ==========================================================================
   Meridian — Popular Destinations Dynamic Rendering & Filtering
   ========================================================================== */

(function (global) {
  'use strict';

  const Meridian = (global.Meridian = global.Meridian || {});

  function resetDestinationsFilter() {
    Meridian.state.destinationQuery = '';
    Meridian.state.selectedDestinationId = 'all';
    Meridian.state.destinationVibe = 'All';
    updateVibeButtons();
    if (Meridian.search.syncInputsFromState) Meridian.search.syncInputsFromState();
    render();
    Meridian.hotels.syncDestinationFilter();
    Meridian.hotels.render();
  }

  function render() {
    const grid = document.getElementById('destinations-grid');
    if (!grid) return;

    const { escapeHTML, formatCurrency } = Meridian.utils;
    const query = (Meridian.state.destinationQuery || '').trim().toLowerCase();
    const activeVibe = Meridian.state.destinationVibe || 'All';

    const filtered = Meridian.data.destinations.filter((dest) => {
      const matchesVibe = activeVibe === 'All' || dest.vibe === activeVibe;
      const matchesQuery =
        !query ||
        dest.name.toLowerCase().includes(query) ||
        dest.country.toLowerCase().includes(query) ||
        dest.region.toLowerCase().includes(query) ||
        dest.vibe.toLowerCase().includes(query);
      return matchesVibe && matchesQuery;
    });

    // Adapt grid columns cleanly so 1, 2, or 3 results never leave empty gaps
    grid.classList.remove('destinations-grid--1', 'destinations-grid--2', 'destinations-grid--3');
    if (filtered.length === 1) {
      grid.classList.add('destinations-grid--1');
    } else if (filtered.length === 2) {
      grid.classList.add('destinations-grid--2');
    } else if (filtered.length === 3) {
      grid.classList.add('destinations-grid--3');
    }

    if (!filtered.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <h3 class="empty-state__title">No destinations match "${escapeHTML(Meridian.state.destinationQuery)}"</h3>
          <p class="empty-state__text">Try clearing your search or switching to All Regions to browse all 8 curated destinations.</p>
          <button type="button" class="btn btn--outline" id="reset-destinations-btn">Show All 8 Destinations</button>
        </div>`;
      const resetBtn = document.getElementById('reset-destinations-btn');
      if (resetBtn) resetBtn.addEventListener('click', resetDestinationsFilter);
      return;
    }

    const isFiltered = Boolean(query || activeVibe !== 'All');
    const filterNoticeHtml = isFiltered
      ? `<div class="grid-filter-banner">
           <span>Showing <strong>${filtered.length}</strong> of ${Meridian.data.destinations.length} destinations${query ? ` matching &ldquo;${escapeHTML(Meridian.state.destinationQuery)}&rdquo;` : ` (${escapeHTML(activeVibe)})`}</span>
           <button type="button" class="btn btn--outline btn--sm" id="dest-banner-reset-btn">Show All 8 Regions</button>
         </div>`
      : '';

    const cardsHtml = filtered
      .map(
        (dest, idx) => `
      <article class="destination-card ${filtered.length === 1 ? 'destination-card--spotlight' : ''}" data-aos="fade-up" data-aos-delay="${(idx % 4) * 60}">
        <div class="destination-card__media">
          <img
            src="${escapeHTML(dest.image)}"
            alt="${escapeHTML(dest.alt)}"
            class="destination-card__img"
            loading="lazy"
          />
          <span class="destination-card__badge">${escapeHTML(dest.vibe)} &middot; ${dest.stayCount} stays</span>
          <span class="destination-card__season">${escapeHTML(dest.bestSeason)}</span>
        </div>
        <div class="destination-card__body">
          <div class="destination-card__top">
            <h3 class="destination-card__title">${escapeHTML(dest.name)}</h3>
            <span class="destination-card__country">${escapeHTML(dest.country)}</span>
          </div>
          <p class="destination-card__tagline">${escapeHTML(dest.tagline)}</p>
          <div class="destination-card__footer">
            <div class="destination-card__price">
              From <strong class="tabular-nums">${formatCurrency(dest.startingPrice)}</strong> / night
            </div>
            <button type="button" class="btn btn--primary btn--sm" data-explore-dest="${escapeHTML(dest.id)}">
              Explore Stays <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </article>`
      )
      .join('');

    grid.innerHTML = filterNoticeHtml + cardsHtml;

    const bannerResetBtn = document.getElementById('dest-banner-reset-btn');
    if (bannerResetBtn) {
      bannerResetBtn.addEventListener('click', resetDestinationsFilter);
    }

    if (typeof Meridian.refreshAnimations === 'function') {
      Meridian.refreshAnimations();
    }
  }

  function updateVibeButtons() {
    document.querySelectorAll('[data-vibe-filter]').forEach((btn) => {
      const vibe = btn.getAttribute('data-vibe-filter');
      btn.classList.toggle('is-active', vibe === Meridian.state.destinationVibe);
    });
  }

  function init() {
    const vibeBar = document.getElementById('destination-vibe-filters');
    const grid = document.getElementById('destinations-grid');

    if (vibeBar) {
      vibeBar.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-vibe-filter]');
        if (!btn) return;
        Meridian.state.destinationVibe = btn.getAttribute('data-vibe-filter');
        updateVibeButtons();
        render();
      });
    }

    if (grid) {
      grid.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-explore-dest]');
        if (!btn) return;
        global.location.href = '404.html';
      });
    }

    render();
  }

  Meridian.destinations = { init, render };
})(window);


/* ==========================================================================
   Meridian — Curated Experiences Tab Switcher
   ========================================================================== */

(function (global) {
  'use strict';

  const Meridian = (global.Meridian = global.Meridian || {});
  let activeExpId = 'coastal-romance';

  function renderTabs() {
    const tabsEl = document.getElementById('experience-tabs');
    if (!tabsEl) return;

    const { escapeHTML } = Meridian.utils;
    tabsEl.innerHTML = Meridian.data.experiences
      .map((exp) => {
        const isActive = exp.id === activeExpId;
        return `
        <button
          type="button"
          role="tab"
          aria-selected="${isActive ? 'true' : 'false'}"
          class="exp-tab-btn ${isActive ? 'is-active' : ''}"
          data-exp-tab="${escapeHTML(exp.id)}"
        >
          ${escapeHTML(exp.tabLabel)}
        </button>`;
      })
      .join('');
  }

  function renderPanel() {
    const panelEl = document.getElementById('experience-panel');
    if (!panelEl) return;

    const exp = Meridian.data.experiences.find((item) => item.id === activeExpId) || Meridian.data.experiences[0];
    if (!exp) return;

    const { escapeHTML, formatCurrency } = Meridian.utils;

    panelEl.innerHTML = `
      <div class="experience-showcase" role="tabpanel">
        <div class="experience-showcase__media">
          <img src="${escapeHTML(exp.image)}" alt="${escapeHTML(exp.alt)}" class="experience-showcase__img" />
          <span class="experience-showcase__pill">${escapeHTML(exp.featuredDestinations.join(' · '))}</span>
        </div>
        <div class="experience-showcase__body">
          <span class="section__eyebrow">${escapeHTML(exp.eyebrow)}</span>
          <h3 class="experience-showcase__title">${escapeHTML(exp.title)}</h3>
          <p class="experience-showcase__desc">${escapeHTML(exp.description)}</p>
          <ul class="experience-showcase__list">
            ${exp.highlights
              .map(
                (item) => `
              <li>
                <span class="exp-check" aria-hidden="true"><i class="fa-solid fa-check"></i></span>
                <span>${escapeHTML(item)}</span>
              </li>`
              )
              .join('')}
          </ul>
          <div class="experience-showcase__footer">
            <div>
              <span style="font-size: var(--text-xs); color: var(--color-ink-muted); display: block;">Curated stays starting at</span>
              <strong class="tabular-nums" style="font-size: 1.35rem; font-family: var(--font-display);">${formatCurrency(exp.startingEstimate)}</strong>
              <span style="font-size: var(--text-xs); color: var(--color-ink-muted);">/ night</span>
            </div>
            <button type="button" class="btn btn--primary" data-exp-filter-category="${escapeHTML(exp.filterCategory)}">
              View ${escapeHTML(exp.filterCategory)} Stays <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>`;
  }

  function init() {
    const tabsEl = document.getElementById('experience-tabs');
    const panelEl = document.getElementById('experience-panel');

    renderTabs();
    renderPanel();

    if (tabsEl) {
      tabsEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-exp-tab]');
        if (!btn) return;
        activeExpId = btn.getAttribute('data-exp-tab');
        renderTabs();
        renderPanel();
      });
    }

    if (panelEl) {
      panelEl.addEventListener('click', (e) => {
        const filterBtn = e.target.closest('[data-exp-filter-category]');
        if (!filterBtn) return;
        const category = filterBtn.getAttribute('data-exp-filter-category');

        Meridian.state.selectedDestinationId = 'all';
        Meridian.state.destinationQuery = '';
        Meridian.state.hotelCategory = category;

        document.querySelectorAll('[data-hotel-category]').forEach((btn) => {
          btn.classList.toggle('is-active', btn.getAttribute('data-hotel-category') === category);
        });
        if (Meridian.search.syncInputsFromState) Meridian.search.syncInputsFromState();
        Meridian.hotels.syncDestinationFilter();
        Meridian.hotels.render();

        const hotelsSection = document.getElementById('hotels');
        if (hotelsSection) {
          hotelsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  }

  Meridian.experiences = { init };
})(window);


/* ==========================================================================
   Stackly — Multi-Day Itineraries Rendering & Day-by-Day Toggle
   ========================================================================== */

(function (global) {
  'use strict';

  const Meridian = (global.Meridian = global.Meridian || {});

  function render() {
    const grid = document.getElementById('itineraries-grid');
    if (!grid) return;

    const { escapeHTML, formatCurrency } = Meridian.utils;

    grid.innerHTML = Meridian.data.itineraries
      .map(
        (pkg, idx) => `
      <article class="itinerary-card" data-aos="fade-up" data-aos-delay="${idx * 80}">
        <div class="itinerary-card__media">
          <img
            src="${escapeHTML(pkg.image)}"
            alt="${escapeHTML(pkg.alt)}"
            class="itinerary-card__img"
            loading="lazy"
          />
          <span class="itinerary-card__duration">
            <i class="fa-regular fa-calendar" aria-hidden="true"></i> ${escapeHTML(pkg.duration)}
          </span>
        </div>

        <div class="itinerary-card__body">
          <span class="itinerary-card__region">${escapeHTML(pkg.region)}</span>
          <h3 class="itinerary-card__title">${escapeHTML(pkg.title)}</h3>

          <div class="itinerary-route" aria-label="Route stops">
            ${pkg.route
              .map((stop, sIdx) =>
                sIdx < pkg.route.length - 1
                  ? `<span>${escapeHTML(stop)}</span> <i class="fa-solid fa-arrow-right" aria-hidden="true"></i> `
                  : `<span>${escapeHTML(stop)}</span>`
              )
              .join('')}
          </div>

          <ul class="itinerary-inclusions">
            ${pkg.inclusions
              .map(
                (inc) => `
              <li><i class="fa-solid fa-check" aria-hidden="true"></i> ${escapeHTML(inc)}</li>`
              )
              .join('')}
          </ul>

          <div class="itinerary-days" id="itinerary-days-${escapeHTML(pkg.id)}" hidden>
            <ol>
              ${pkg.days.map((d) => `<li>${escapeHTML(d)}</li>`).join('')}
            </ol>
          </div>

          <div class="itinerary-card__footer">
            <div>
              <span style="font-size: var(--text-xs); color: var(--color-ink-muted); display: block;">From per guest</span>
              <strong class="tabular-nums" style="font-size: 1.25rem;">${formatCurrency(pkg.perPersonPrice)}</strong>
            </div>
            <div class="itinerary-card__actions">
              <button
                type="button"
                class="btn btn--outline btn--sm"
                data-toggle-itinerary="${escapeHTML(pkg.id)}"
                aria-expanded="false"
                aria-controls="itinerary-days-${escapeHTML(pkg.id)}"
              >
                Day Plan <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
              </button>
              <button
                type="button"
                class="btn btn--primary btn--sm"
                data-estimate-itinerary="${escapeHTML(pkg.anchorHotelId)}"
              >
                Estimate Stay
              </button>
            </div>
          </div>
        </div>
      </article>`
      )
      .join('');
  }

  function init() {
    render();

    const grid = document.getElementById('itineraries-grid');
    if (!grid) return;

    grid.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('[data-toggle-itinerary]');
      if (toggleBtn) {
        const id = toggleBtn.getAttribute('data-toggle-itinerary');
        const panel = document.getElementById(`itinerary-days-${id}`);
        if (!panel) return;
        const isOpen = !panel.hidden;
        panel.hidden = isOpen;
        toggleBtn.setAttribute('aria-expanded', String(!isOpen));
        toggleBtn.innerHTML = isOpen
          ? 'Day Plan <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>'
          : 'Hide Plan <i class="fa-solid fa-chevron-up" aria-hidden="true"></i>';
        return;
      }

      const estBtn = e.target.closest('[data-estimate-itinerary]');
      if (estBtn) {
        const hotelId = estBtn.getAttribute('data-estimate-itinerary');
        if (Meridian.hotels && Meridian.hotels.openEstimator) {
          Meridian.hotels.openEstimator(hotelId);
        }
      }
    });
  }

  Meridian.itineraries = { init, render };
})(window);


/* ==========================================================================
   Stackly — Best Time to Visit · Interactive Seasonal Planner
   ========================================================================== */

(function (global) {
  'use strict';

  const Meridian = (global.Meridian = global.Meridian || {});
  let activeSeasonId = 'spring';

  function renderTabs() {
    const tabsEl = document.getElementById('season-tabs');
    if (!tabsEl) return;

    const { escapeHTML } = Meridian.utils;

    tabsEl.innerHTML = Meridian.data.seasons
      .map((s) => {
        const isActive = s.id === activeSeasonId;
        return `
        <button
          type="button"
          role="tab"
          aria-selected="${isActive ? 'true' : 'false'}"
          class="season-tab-btn ${isActive ? 'is-active' : ''}"
          data-season-tab="${escapeHTML(s.id)}"
        >
          <i class="${escapeHTML(s.iconClass)}" aria-hidden="true"></i>
          <span>${escapeHTML(s.label)}</span>
          <span class="season-tab-months">${escapeHTML(s.months)}</span>
        </button>`;
      })
      .join('');
  }

  function renderPanel() {
    const panelEl = document.getElementById('season-panel');
    if (!panelEl) return;

    const season =
      Meridian.data.seasons.find((s) => s.id === activeSeasonId) || Meridian.data.seasons[0];
    if (!season) return;

    const { escapeHTML } = Meridian.utils;

    panelEl.innerHTML = `
      <p class="season-headline">
        <i class="${escapeHTML(season.iconClass)}" aria-hidden="true"></i>
        <span>${escapeHTML(season.headline)}</span>
      </p>
      <div class="season-picks-grid">
        ${season.picks
          .map(
            (pick) => `
          <article class="season-pick-card">
            <div class="season-pick-card__top">
              <h3 class="season-pick-card__title">${escapeHTML(pick.name)}</h3>
              <span class="season-crowd-pill">${escapeHTML(pick.crowd)}</span>
            </div>
            <div class="season-pick-card__temp">
              <i class="fa-solid fa-temperature-half" aria-hidden="true"></i>
              <span>${escapeHTML(pick.temp)}</span>
            </div>
            <p class="season-pick-card__desc">${escapeHTML(pick.highlight)}</p>
            <button type="button" class="btn btn--ghost btn--sm season-pick-card__cta" data-season-dest="${escapeHTML(pick.destinationId)}">
              Check Stays <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </button>
          </article>`
          )
          .join('')}
      </div>`;
  }

  function init() {
    renderTabs();
    renderPanel();

    const tabsEl = document.getElementById('season-tabs');
    const panelEl = document.getElementById('season-panel');

    if (tabsEl) {
      tabsEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-season-tab]');
        if (!btn) return;
        activeSeasonId = btn.getAttribute('data-season-tab');
        renderTabs();
        renderPanel();
      });
    }

    if (panelEl) {
      panelEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-season-dest]');
        if (!btn) return;
        const destId = btn.getAttribute('data-season-dest');
        const dest = Meridian.data.destinations.find((d) => d.id === destId);
        if (!dest) return;

        Meridian.state.selectedDestinationId = dest.id;
        Meridian.state.destinationQuery = dest.name;
        Meridian.state.hotelCategory = 'All';
        if (Meridian.search.syncInputsFromState) Meridian.search.syncInputsFromState();
        Meridian.hotels.syncDestinationFilter();
        Meridian.hotels.render();

        const hotelsSection = document.getElementById('hotels');
        if (hotelsSection) {
          hotelsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  }

  Meridian.seasons = { init };
})(window);


/* ==========================================================================
   Meridian — Featured Hotels Filtering, Sorting & Booking Price Estimator
   ========================================================================== */

(function (global) {
  'use strict';

  const Meridian = (global.Meridian = global.Meridian || {});

  let activeModalHotelId = null;

  function getActivePromo() {
    const code = Meridian.state.appliedPromoCode;
    if (!code) return null;
    return Meridian.data.offers.find((o) => o.code.toUpperCase() === code.toUpperCase()) || null;
  }

  function getFilteredAndSortedHotels() {
    const {
      selectedDestinationId,
      destinationQuery,
      hotelCategory,
      maxPrice,
      minRating,
      sortBy
    } = Meridian.state;

    const query = (destinationQuery || '').trim().toLowerCase();

    const filtered = Meridian.data.hotels.filter((hotel) => {
      if (selectedDestinationId && selectedDestinationId !== 'all') {
        if (hotel.destinationId !== selectedDestinationId) return false;
      } else if (query) {
        const destObj = Meridian.data.destinations.find((d) => d.id === hotel.destinationId);
        const destName = destObj ? `${destObj.name} ${destObj.country}`.toLowerCase() : '';
        const haystack = `${hotel.name} ${hotel.location} ${hotel.country} ${hotel.category} ${destName}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      if (hotelCategory && hotelCategory !== 'All' && hotel.category !== hotelCategory) {
        return false;
      }

      if (hotel.pricePerNight > maxPrice) {
        return false;
      }

      if (hotel.rating < minRating) {
        return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.pricePerNight - b.pricePerNight;
        case 'price-desc':
          return b.pricePerNight - a.pricePerNight;
        case 'rating-desc':
          return b.rating - a.rating;
        case 'reviews-desc':
          return b.reviews - a.reviews;
        case 'recommended':
        default:
          return a.featuredRank - b.featuredRank;
      }
    });

    return filtered;
  }

  function syncDestinationFilter() {
    const destSelect = document.getElementById('hotel-destination-filter');
    if (!destSelect) return;
    destSelect.value = Meridian.state.selectedDestinationId || 'all';
  }

  function updateCategoryButtons() {
    document.querySelectorAll('[data-hotel-category]').forEach((btn) => {
      const cat = btn.getAttribute('data-hotel-category');
      btn.classList.toggle('is-active', cat === Meridian.state.hotelCategory);
    });
  }

  function renderActivePromoChip() {
    const container = document.getElementById('active-promo-container');
    if (!container) return;
    const promo = getActivePromo();
    if (!promo) {
      container.innerHTML = '';
      return;
    }

    const { escapeHTML } = Meridian.utils;
    container.innerHTML = `
      <span class="active-promo-chip">
        Promo active: <strong>${escapeHTML(promo.code)}</strong> (${escapeHTML(promo.discountLabel)})
        <button type="button" id="clear-active-promo-btn" aria-label="Remove promo code">&times;</button>
      </span>`;

    const clearBtn = document.getElementById('clear-active-promo-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        Meridian.state.appliedPromoCode = null;
        Meridian.storage.saveAppliedPromo(null);
        render();
        if (Meridian.offers && Meridian.offers.render) Meridian.offers.render();
        Meridian.toast.show('Promo code removed.', 'success');
      });
    }
  }

  function render() {
    const grid = document.getElementById('hotels-grid');
    const countEl = document.getElementById('hotels-results-count');
    if (!grid) return;

    const { escapeHTML, formatCurrency, diffNights, calculateEstimate } = Meridian.utils;
    const hotels = getFilteredAndSortedHotels();
    const nights = Math.max(1, diffNights(Meridian.state.checkIn, Meridian.state.checkOut));
    const activePromo = getActivePromo();
    const wishlistSet = new Set(Meridian.state.wishlist || []);

    if (countEl) {
      countEl.innerHTML = `Showing <strong>${hotels.length}</strong> of ${Meridian.data.hotels.length} curated stays · <span class="tabular-nums">${nights} night${nights === 1 ? '' : 's'}, ${Meridian.state.rooms} room${Meridian.state.rooms === 1 ? '' : 's'}</span>`;
    }

    renderActivePromoChip();

    grid.classList.remove('hotels-grid--1', 'hotels-grid--2');
    if (hotels.length === 1) {
      grid.classList.add('hotels-grid--1');
    } else if (hotels.length === 2) {
      grid.classList.add('hotels-grid--2');
    }

    if (!hotels.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <h3 class="empty-state__title">No stays match your current filters</h3>
          <p class="empty-state__text">Try raising your maximum nightly rate, lowering the minimum rating, or clearing destination filters.</p>
          <button type="button" class="btn btn--primary" id="hotels-empty-reset-btn">Reset All Filters</button>
        </div>`;
      const resetBtn = document.getElementById('hotels-empty-reset-btn');
      if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);
      return;
    }

    grid.innerHTML = hotels
      .map((hotel, idx) => {
        const isSaved = wishlistSet.has(hotel.id);
        const estimate = calculateEstimate({
          nightlyRate: hotel.pricePerNight,
          nights,
          rooms: Meridian.state.rooms,
          adults: Meridian.state.adults,
          children: Meridian.state.children,
          category: hotel.category,
          promo: activePromo
        });

        const starsStr = '<i class="fa-solid fa-star" aria-hidden="true"></i>'.repeat(hotel.stars);
        const estimateText = estimate.promoApplied
          ? `Est. ${formatCurrency(estimate.grandTotal)} total (${nights}n · ${activePromo.code} -${formatCurrency(estimate.discountAmount)})`
          : `Est. ${formatCurrency(estimate.grandTotal)} total (${nights}n · incl. tax)`;

        return `
        <article class="hotel-card ${hotels.length === 1 ? 'hotel-card--spotlight' : ''}" data-aos="fade-up" data-aos-delay="${(idx % 3) * 70}">
          <div class="hotel-card__media">
            <img
              src="${escapeHTML(hotel.image)}"
              alt="${escapeHTML(hotel.name)} in ${escapeHTML(hotel.location)}"
              class="hotel-card__img"
              loading="lazy"
            />
            <div class="hotel-card__badges">
              <span class="badge-pill">${escapeHTML(hotel.category)}</span>
              ${hotel.badge ? `<span class="badge-pill badge-pill--accent">${escapeHTML(hotel.badge)}</span>` : ''}
            </div>
            <button
              type="button"
              class="wishlist-btn ${isSaved ? 'is-saved' : ''}"
              data-wishlist-toggle="${escapeHTML(hotel.id)}"
              aria-label="${isSaved ? 'Remove from saved stays' : 'Save to wishlist'}"
              aria-pressed="${isSaved ? 'true' : 'false'}"
            >
              <i class="${isSaved ? 'fa-solid' : 'fa-regular'} fa-heart" aria-hidden="true"></i>
            </button>
          </div>
          <div class="hotel-card__body">
            <div class="hotel-card__meta-top">
              <span class="hotel-card__stars" aria-label="${hotel.stars} star hotel">${starsStr}</span>
              <span class="hotel-card__rating tabular-nums">
                <i class="fa-solid fa-star" aria-hidden="true" style="color: var(--color-gold);"></i> ${hotel.rating.toFixed(2)}
                <span style="font-weight: 500; color: var(--color-ink-muted);">(${hotel.reviews})</span>
              </span>
            </div>
            <h3 class="hotel-card__title">${escapeHTML(hotel.name)}</h3>
            <p class="hotel-card__location">${escapeHTML(hotel.location)}, ${escapeHTML(hotel.country)}</p>
            <p class="hotel-card__desc">${escapeHTML(hotel.description)}</p>
            <div class="hotel-card__amenities">
              ${hotel.amenities
                .slice(0, 3)
                .map((a) => `<span class="amenity-chip">${escapeHTML(a)}</span>`)
                .join('')}
            </div>
            <div class="hotel-card__footer">
              <div>
                <div class="hotel-card__price-night tabular-nums">
                  <strong>${formatCurrency(hotel.pricePerNight)}</strong> / night
                </div>
                <div class="hotel-card__estimate tabular-nums ${estimate.promoApplied ? 'has-discount' : ''}">
                  ${escapeHTML(estimateText)}
                </div>
              </div>
              <button type="button" class="btn btn--primary btn--sm" data-estimate-hotel="${escapeHTML(hotel.id)}">
                Estimate &amp; Book
              </button>
            </div>
          </div>
        </article>`;
      })
      .join('');

    if (typeof Meridian.refreshAnimations === 'function') {
      Meridian.refreshAnimations();
    }
  }

  function resetAllFilters() {
    Meridian.state.destinationQuery = '';
    Meridian.state.selectedDestinationId = 'all';
    Meridian.state.hotelCategory = 'All';
    Meridian.state.maxPrice = 950;
    Meridian.state.minRating = 0;
    Meridian.state.sortBy = 'recommended';

    const priceSlider = document.getElementById('hotel-price-filter');
    const priceVal = document.getElementById('hotel-price-value');
    const ratingSelect = document.getElementById('hotel-rating-filter');
    const sortSelect = document.getElementById('hotel-sort');
    const destSelect = document.getElementById('hotel-destination-filter');

    if (priceSlider) priceSlider.value = '950';
    if (priceVal) priceVal.textContent = 'Up to $950';
    if (ratingSelect) ratingSelect.value = '0';
    if (sortSelect) sortSelect.value = 'recommended';
    if (destSelect) destSelect.value = 'all';

    updateCategoryButtons();
    if (Meridian.search.syncInputsFromState) Meridian.search.syncInputsFromState();
    Meridian.destinations.render();
    render();
  }

  /* ========================================================================
     Dynamic Booking Price Estimator Modal
     ======================================================================== */
  function openEstimator(hotelId) {
    const hotel = Meridian.data.hotels.find((h) => h.id === hotelId);
    if (!hotel) return;

    activeModalHotelId = hotelId;

    const modalBackdrop = document.getElementById('estimator-backdrop');
    const thumb = document.getElementById('est-hotel-thumb');
    const title = document.getElementById('est-hotel-title');
    const loc = document.getElementById('est-hotel-location');
    const checkInEl = document.getElementById('est-checkin');
    const checkOutEl = document.getElementById('est-checkout');
    const roomsEl = document.getElementById('est-rooms');
    const adultsEl = document.getElementById('est-adults');
    const childrenEl = document.getElementById('est-children');
    const promoInput = document.getElementById('est-promo-input');

    const { getTodayISO, addDays } = Meridian.utils;
    const today = getTodayISO();

    thumb.src = hotel.image;
    thumb.alt = hotel.name;
    title.textContent = hotel.name;
    loc.textContent = `${hotel.location}, ${hotel.country} · ${Meridian.utils.formatCurrency(hotel.pricePerNight)}/night`;

    checkInEl.min = today;
    checkInEl.value = Meridian.state.checkIn;
    checkOutEl.min = addDays(checkInEl.value, 1);
    checkOutEl.value = Meridian.state.checkOut;

    roomsEl.value = String(Meridian.state.rooms);
    adultsEl.value = String(Meridian.state.adults);
    childrenEl.value = String(Meridian.state.children);
    promoInput.value = Meridian.state.appliedPromoCode || '';

    document.querySelectorAll('.est-addon-checkbox').forEach((cb) => {
      cb.checked = false;
    });

    updateEstimatorBreakdown();

    modalBackdrop.classList.add('is-open');
    modalBackdrop.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }

  function closeEstimator() {
    const modalBackdrop = document.getElementById('estimator-backdrop');
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('is-open');
    modalBackdrop.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    activeModalHotelId = null;
  }

  function updateEstimatorBreakdown() {
    const hotel = Meridian.data.hotels.find((h) => h.id === activeModalHotelId);
    if (!hotel) return;

    const { diffNights, addDays, getTodayISO, formatCurrency, calculateEstimate, escapeHTML } =
      Meridian.utils;

    const checkInEl = document.getElementById('est-checkin');
    const checkOutEl = document.getElementById('est-checkout');
    const dateErrorEl = document.getElementById('est-date-error');
    const rooms = Number(document.getElementById('est-rooms').value) || 1;
    const adults = Number(document.getElementById('est-adults').value) || 2;
    const children = Number(document.getElementById('est-children').value) || 0;
    const promoInputVal = (document.getElementById('est-promo-input').value || '').trim().toUpperCase();
    const promoNoteEl = document.getElementById('est-promo-note');
    const breakdownEl = document.getElementById('est-breakdown');
    const saveBtn = document.getElementById('est-save-quote-btn');

    const today = getTodayISO();
    const inVal = checkInEl.value;
    const outVal = checkOutEl.value;
    checkOutEl.min = addDays(inVal || today, 1);

    const nights = diffNights(inVal, outVal);
    if (!inVal || !outVal || inVal < today || nights < 1 || nights > 30) {
      dateErrorEl.textContent =
        inVal < today
          ? 'Check-in cannot be in the past.'
          : nights > 30
            ? 'Maximum stay length is 30 nights.'
            : 'Check-out must be at least 1 night after check-in.';
      dateErrorEl.hidden = false;
      saveBtn.disabled = true;
      return;
    }

    dateErrorEl.hidden = true;
    saveBtn.disabled = false;

    const totalGuests = adults + children;
    let addOnsTotal = 0;
    document.querySelectorAll('.est-addon-checkbox:checked').forEach((cb) => {
      const price = Number(cb.getAttribute('data-price')) || 0;
      const mode = cb.getAttribute('data-mode');
      if (mode === 'per-guest-night') {
        addOnsTotal += price * totalGuests * nights;
      } else {
        addOnsTotal += price;
      }
    });

    const promoObj = promoInputVal
      ? Meridian.data.offers.find((o) => o.code.toUpperCase() === promoInputVal)
      : null;

    const est = calculateEstimate({
      nightlyRate: hotel.pricePerNight,
      nights,
      rooms,
      adults,
      children,
      addOnsTotal,
      category: hotel.category,
      promo: promoObj
    });

    if (promoInputVal && !promoObj) {
      promoNoteEl.textContent = `Code "${promoInputVal}" not recognized. Try EARLYBIRD20, STACKLY15, ISLAND100, or WEEKEND12.`;
      promoNoteEl.style.color = 'var(--color-error)';
    } else if (promoObj && !est.promoApplied) {
      promoNoteEl.textContent = `${promoObj.code}: ${est.promoReason}.`;
      promoNoteEl.style.color = 'var(--color-accent)';
    } else if (promoObj && est.promoApplied) {
      promoNoteEl.textContent = `${promoObj.code} applied — saving ${formatCurrency(est.discountAmount)}!`;
      promoNoteEl.style.color = 'var(--color-success)';
    } else {
      promoNoteEl.textContent = 'Tip: Try EARLYBIRD20, STACKLY15, ISLAND100, or WEEKEND12.';
      promoNoteEl.style.color = 'var(--color-ink-muted)';
    }

    breakdownEl.innerHTML = `
      <div class="breakdown-row tabular-nums">
        <span>${formatCurrency(hotel.pricePerNight)} &times; ${est.nights} night${est.nights === 1 ? '' : 's'} &times; ${est.rooms} room${est.rooms === 1 ? '' : 's'}</span>
        <span>${formatCurrency(est.roomSubtotal)}</span>
      </div>
      ${
        est.extraGuestFee > 0
          ? `<div class="breakdown-row tabular-nums">
              <span>Extra guest fee (${est.extraGuests} guest${est.extraGuests === 1 ? '' : 's'} &times; ${est.nights}n)</span>
              <span>${formatCurrency(est.extraGuestFee)}</span>
            </div>`
          : ''
      }
      ${
        est.addOnsTotal > 0
          ? `<div class="breakdown-row tabular-nums">
              <span>Selected curated add-ons</span>
              <span>${formatCurrency(est.addOnsTotal)}</span>
            </div>`
          : ''
      }
      ${
        est.promoApplied
          ? `<div class="breakdown-row breakdown-row--discount tabular-nums">
              <span>Promo discount (${escapeHTML(promoObj.code)})</span>
              <span>-${formatCurrency(est.discountAmount)}</span>
            </div>`
          : ''
      }
      <div class="breakdown-row tabular-nums">
        <span>Estimated taxes &amp; hospitality fees (12%)</span>
        <span>${formatCurrency(est.taxesAndFees)}</span>
      </div>
      <div class="breakdown-row breakdown-row--total tabular-nums">
        <span>Estimated Grand Total</span>
        <span>${formatCurrency(est.grandTotal)}</span>
      </div>`;
  }

  function init() {
    const destSelect = document.getElementById('hotel-destination-filter');
    const priceSlider = document.getElementById('hotel-price-filter');
    const priceValue = document.getElementById('hotel-price-value');
    const ratingSelect = document.getElementById('hotel-rating-filter');
    const sortSelect = document.getElementById('hotel-sort');
    const categoryBar = document.getElementById('hotel-category-filters');
    const resetFiltersBtn = document.getElementById('hotels-reset-btn');
    const grid = document.getElementById('hotels-grid');

    // Populate destination select dynamically
    if (destSelect) {
      const optionsHtml = [
        '<option value="all">All Destinations (8)</option>',
        ...Meridian.data.destinations.map(
          (d) =>
            `<option value="${Meridian.utils.escapeHTML(d.id)}">${Meridian.utils.escapeHTML(d.name)}, ${Meridian.utils.escapeHTML(d.country)}</option>`
        )
      ].join('');
      destSelect.innerHTML = optionsHtml;
      destSelect.value = Meridian.state.selectedDestinationId || 'all';

      destSelect.addEventListener('change', () => {
        Meridian.state.selectedDestinationId = destSelect.value;
        if (destSelect.value === 'all') {
          Meridian.state.destinationQuery = '';
        } else {
          const d = Meridian.data.destinations.find((item) => item.id === destSelect.value);
          Meridian.state.destinationQuery = d ? d.name : '';
        }
        if (Meridian.search.syncInputsFromState) Meridian.search.syncInputsFromState();
        Meridian.destinations.render();
        render();
      });
    }

    if (priceSlider && priceValue) {
      priceSlider.addEventListener('input', () => {
        const val = Number(priceSlider.value);
        Meridian.state.maxPrice = val;
        priceValue.textContent = val >= 950 ? 'Up to $950 (All)' : `Up to $${val}`;
        render();
      });
    }

    if (ratingSelect) {
      ratingSelect.addEventListener('change', () => {
        Meridian.state.minRating = Number(ratingSelect.value) || 0;
        render();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        Meridian.state.sortBy = sortSelect.value;
        render();
      });
    }

    if (categoryBar) {
      categoryBar.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-hotel-category]');
        if (!btn) return;
        Meridian.state.hotelCategory = btn.getAttribute('data-hotel-category');
        updateCategoryButtons();
        render();
      });
    }

    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', resetAllFilters);
    }

    if (grid) {
      grid.addEventListener('click', (e) => {
        const wishlistBtn = e.target.closest('[data-wishlist-toggle]');
        if (wishlistBtn) {
          const hotelId = wishlistBtn.getAttribute('data-wishlist-toggle');
          Meridian.wishlist.toggle(hotelId, wishlistBtn);
          return;
        }

        const estBtn = e.target.closest('[data-estimate-hotel]');
        if (estBtn) {
          openEstimator(estBtn.getAttribute('data-estimate-hotel'));
        }
      });
    }

    // Modal wiring
    const modalBackdrop = document.getElementById('estimator-backdrop');
    const modalCloseBtn = document.getElementById('estimator-close-btn');
    const applyPromoBtn = document.getElementById('est-apply-promo-btn');
    const saveQuoteBtn = document.getElementById('est-save-quote-btn');

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeEstimator);
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeEstimator();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && activeModalHotelId) {
        closeEstimator();
      }
    });

    ['est-checkin', 'est-checkout', 'est-rooms', 'est-adults', 'est-children'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', updateEstimatorBreakdown);
    });

    document.querySelectorAll('.est-addon-checkbox').forEach((cb) => {
      cb.addEventListener('change', updateEstimatorBreakdown);
    });

    if (applyPromoBtn) {
      applyPromoBtn.addEventListener('click', () => {
        const code = (document.getElementById('est-promo-input').value || '').trim().toUpperCase();
        const found = Meridian.data.offers.find((o) => o.code.toUpperCase() === code);
        if (found) {
          Meridian.state.appliedPromoCode = found.code;
          Meridian.storage.saveAppliedPromo(found.code);
          render();
        }
        updateEstimatorBreakdown();
      });
    }

    if (saveQuoteBtn) {
      saveQuoteBtn.addEventListener('click', () => {
        const hotel = Meridian.data.hotels.find((h) => h.id === activeModalHotelId);
        if (!hotel) return;
        const checkIn = document.getElementById('est-checkin').value;
        const checkOut = document.getElementById('est-checkout').value;
        const rooms = Number(document.getElementById('est-rooms').value) || 1;
        const adults = Number(document.getElementById('est-adults').value) || 2;
        const children = Number(document.getElementById('est-children').value) || 0;
        const nights = Math.max(1, Meridian.utils.diffNights(checkIn, checkOut));

        const totalGuests = adults + children;
        let addOnsTotal = 0;
        document.querySelectorAll('.est-addon-checkbox:checked').forEach((cb) => {
          const price = Number(cb.getAttribute('data-price')) || 0;
          const mode = cb.getAttribute('data-mode');
          addOnsTotal += mode === 'per-guest-night' ? price * totalGuests * nights : price;
        });

        const promoVal = (document.getElementById('est-promo-input').value || '').trim().toUpperCase();
        const promoObj = promoVal
          ? Meridian.data.offers.find((o) => o.code.toUpperCase() === promoVal)
          : null;

        const est = Meridian.utils.calculateEstimate({
          nightlyRate: hotel.pricePerNight,
          nights,
          rooms,
          adults,
          children,
          addOnsTotal,
          category: hotel.category,
          promo: promoObj
        });

        Meridian.storage.addSavedQuote({
          hotelId: hotel.id,
          hotelName: hotel.name,
          checkIn,
          checkOut,
          rooms,
          adults,
          children,
          grandTotal: est.grandTotal,
          savedAt: new Date().toISOString()
        });

        if (Meridian.wishlist && Meridian.wishlist.updateBadge) Meridian.wishlist.updateBadge();
        Meridian.toast.show(`Reservation quote saved (${Meridian.utils.formatCurrency(est.grandTotal)}) for ${hotel.name}!`, 'success');
        closeEstimator();
      });
    }

    render();
  }

  Meridian.hotels = {
    init,
    render,
    syncDestinationFilter,
    openEstimator
  };
})(window);


/* ==========================================================================
   Meridian — Special Offers & Coupon Code Copying
   ========================================================================== */

(function (global) {
  'use strict';

  const Meridian = (global.Meridian = global.Meridian || {});

  function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    }
    return fallbackCopy(text);
  }

  function fallbackCopy(text) {
    return new Promise((resolve) => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        /* ignore */
      }
      document.body.removeChild(textarea);
      resolve();
    });
  }

  function render() {
    const grid = document.getElementById('offers-grid');
    if (!grid) return;

    const { escapeHTML } = Meridian.utils;
    const activeCode = (Meridian.state.appliedPromoCode || '').toUpperCase();

    grid.innerHTML = Meridian.data.offers
      .map((offer, idx) => {
        const isApplied = activeCode && activeCode === offer.code.toUpperCase();
        return `
      <article class="offer-card offer-card--${escapeHTML(offer.tone)} ${isApplied ? 'is-applied' : ''}" data-aos="fade-up" data-aos-delay="${(idx % 2) * 80}">
        <div>
          <div class="offer-card__header">
            <span class="offer-card__badge">${escapeHTML(offer.badge)}</span>
            <span class="offer-card__discount">${escapeHTML(offer.discountLabel)}</span>
          </div>
          <h3 class="offer-card__title">${escapeHTML(offer.title)}</h3>
          <p class="offer-card__desc">${escapeHTML(offer.description)}</p>
        </div>
        <div class="offer-card__footer">
          <span class="offer-card__valid">${escapeHTML(offer.validUntil)}</span>
          <div class="offer-actions">
            <button
              type="button"
              class="coupon-copy-btn"
              data-copy-code="${escapeHTML(offer.code)}"
              aria-label="Copy coupon code ${escapeHTML(offer.code)}"
            >
              <span>${escapeHTML(offer.code)}</span>
              <span data-copy-label><i class="fa-regular fa-copy" aria-hidden="true"></i> Copy</span>
            </button>
            <button
              type="button"
              class="btn btn--sm ${offer.tone === 'primary' || offer.tone === 'dark' ? 'btn--accent' : 'btn--primary'}"
              data-apply-offer="${escapeHTML(offer.code)}"
            >
              ${isApplied ? 'Applied <i class="fa-solid fa-check" aria-hidden="true"></i>' : 'Apply to Stays'}
            </button>
          </div>
        </div>
      </article>`;
      })
      .join('');

    if (typeof Meridian.refreshAnimations === 'function') {
      Meridian.refreshAnimations();
    }
  }

  function init() {
    render();

    const grid = document.getElementById('offers-grid');
    if (!grid) return;

    grid.addEventListener('click', (e) => {
      const copyBtn = e.target.closest('[data-copy-code]');
      if (copyBtn) {
        const code = copyBtn.getAttribute('data-copy-code');
        copyTextToClipboard(code).then(() => {
          const labelSpan = copyBtn.querySelector('[data-copy-label]');
          copyBtn.classList.add('is-copied');
          if (labelSpan) labelSpan.innerHTML = 'Copied <i class="fa-solid fa-check" aria-hidden="true"></i>';

          Meridian.toast.show(`Coupon code ${code} copied to clipboard!`, 'success');

          global.setTimeout(() => {
            copyBtn.classList.remove('is-copied');
            if (labelSpan) labelSpan.innerHTML = '<i class="fa-regular fa-copy" aria-hidden="true"></i> Copy';
          }, 2400);
        });
        return;
      }

      const applyBtn = e.target.closest('[data-apply-offer]');
      if (applyBtn) {
        const code = applyBtn.getAttribute('data-apply-offer');
        Meridian.state.appliedPromoCode = code;
        Meridian.storage.saveAppliedPromo(code);
        render();
        Meridian.hotels.render();
        Meridian.toast.show(`${code} applied to all live stay estimates.`, 'success');

        const hotelsSection = document.getElementById('hotels');
        if (hotelsSection) {
          hotelsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  }

  Meridian.offers = { init, render };
})(window);


/* ==========================================================================
   Meridian — Accessible Responsive Customer Testimonial Slider
   ========================================================================== */

(function (global) {
  'use strict';

  const Meridian = (global.Meridian = global.Meridian || {});

  let currentIndex = 0;
  let autoplayTimer = null;

  function getVisibleCount() {
    if (global.innerWidth <= 640) return 1;
    if (global.innerWidth <= 1020) return 2;
    return 3;
  }

  function getMaxIndex() {
    const total = Meridian.data.testimonials.length;
    return Math.max(0, total - getVisibleCount());
  }

  function renderSlides() {
    const track = document.getElementById('testimonials-track');
    if (!track) return;

    const { escapeHTML } = Meridian.utils;

    track.innerHTML = Meridian.data.testimonials
      .map(
        (item) => `
      <div class="testimonial-slide">
        <article class="testimonial-card">
          <div>
            <div class="testimonial-card__stars" aria-label="${item.rating} out of 5 stars">
              ${'<i class="fa-solid fa-star" aria-hidden="true"></i>'.repeat(item.rating)}
            </div>
            <blockquote class="testimonial-card__quote" style="margin-top: 0.7rem;">
              &ldquo;${escapeHTML(item.quote)}&rdquo;
            </blockquote>
          </div>
          <div class="testimonial-card__author">
            <div class="testimonial-avatar" style="background-color: ${escapeHTML(item.avatarColor)};" aria-hidden="true">
              ${escapeHTML(item.initials)}
            </div>
            <div>
              <div class="testimonial-author__name">${escapeHTML(item.name)}</div>
              <div class="testimonial-author__meta">${escapeHTML(item.stayedAt)} &middot; ${escapeHTML(item.date)}</div>
            </div>
          </div>
        </article>
      </div>`
      )
      .join('');
  }

  function renderDots() {
    const dotsContainer = document.getElementById('slider-dots');
    if (!dotsContainer) return;

    const maxIdx = getMaxIndex();
    const totalPages = maxIdx + 1;

    dotsContainer.innerHTML = Array.from({ length: totalPages }, (_, i) => {
      const isActive = i === currentIndex;
      return `<button type="button" class="slider-dot ${isActive ? 'is-active' : ''}" data-slide-dot="${i}" aria-label="Go to testimonial set ${i + 1}" aria-current="${isActive ? 'true' : 'false'}"></button>`;
    }).join('');
  }

  function updateSlider() {
    const track = document.getElementById('testimonials-track');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    if (!track) return;

    const maxIdx = getMaxIndex();
    if (currentIndex > maxIdx) currentIndex = maxIdx;
    if (currentIndex < 0) currentIndex = 0;

    const visibleCount = getVisibleCount();
    const shiftPercent = (100 / visibleCount) * currentIndex;
    track.style.transform = `translate3d(-${shiftPercent}%, 0, 0)`;

    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= maxIdx;

    renderDots();
  }

  function goTo(idx) {
    const maxIdx = getMaxIndex();
    if (idx > maxIdx) {
      currentIndex = 0;
    } else if (idx < 0) {
      currentIndex = maxIdx;
    } else {
      currentIndex = idx;
    }
    updateSlider();
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = global.setInterval(() => {
      goTo(currentIndex + 1);
    }, 6000);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      global.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function init() {
    renderSlides();
    updateSlider();

    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    const dotsContainer = document.getElementById('slider-dots');
    const viewport = document.getElementById('testimonials-viewport');

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

    if (dotsContainer) {
      dotsContainer.addEventListener('click', (e) => {
        const dot = e.target.closest('[data-slide-dot]');
        if (!dot) return;
        goTo(Number(dot.getAttribute('data-slide-dot')) || 0);
      });
    }

    if (viewport) {
      viewport.addEventListener('mouseenter', stopAutoplay);
      viewport.addEventListener('mouseleave', startAutoplay);

      // Touch swipe support
      let touchStartX = 0;
      viewport.addEventListener(
        'touchstart',
        (e) => {
          touchStartX = e.changedTouches[0].clientX;
          stopAutoplay();
        },
        { passive: true }
      );
      viewport.addEventListener(
        'touchend',
        (e) => {
          const deltaX = e.changedTouches[0].clientX - touchStartX;
          if (Math.abs(deltaX) > 45) {
            goTo(deltaX < 0 ? currentIndex + 1 : currentIndex - 1);
          }
          startAutoplay();
        },
        { passive: true }
      );
    }

    global.addEventListener('resize', updateSlider);
    startAutoplay();
  }

  Meridian.testimonials = { init };
})(window);


/* ==========================================================================
   Meridian — Interactive Traveler FAQ Accordion
   ========================================================================== */

(function (global) {
  'use strict';

  const Meridian = (global.Meridian = global.Meridian || {});

  function init() {
    const container = document.getElementById('faq-accordion');
    if (!container) return;

    const { escapeHTML } = Meridian.utils;

    container.innerHTML = Meridian.data.faqs
      .map((item, idx) => {
        const isOpen = idx === 0;
        return `
        <div class="faq-item ${isOpen ? 'is-open' : ''}" data-faq-item>
          <button
            type="button"
            class="faq-trigger"
            aria-expanded="${isOpen ? 'true' : 'false'}"
            aria-controls="faq-panel-${escapeHTML(item.id)}"
          >
            <span>${escapeHTML(item.question)}</span>
            <span class="faq-icon" aria-hidden="true"><i class="fa-solid fa-plus"></i></span>
          </button>
          <div
            id="faq-panel-${escapeHTML(item.id)}"
            class="faq-panel"
            ${isOpen ? '' : 'hidden'}
          >
            <p>${escapeHTML(item.answer)}</p>
          </div>
        </div>`;
      })
      .join('');

    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.faq-trigger');
      if (!btn) return;

      const currentItem = btn.closest('[data-faq-item]');
      const currentPanel = document.getElementById(btn.getAttribute('aria-controls'));
      const wasOpen = currentItem.classList.contains('is-open');

      // Close others for clean single-open accordion focus
      container.querySelectorAll('[data-faq-item]').forEach((item) => {
        item.classList.remove('is-open');
        const t = item.querySelector('.faq-trigger');
        const p = item.querySelector('.faq-panel');
        if (t) t.setAttribute('aria-expanded', 'false');
        if (p) p.hidden = true;
      });

      if (!wasOpen) {
        currentItem.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        if (currentPanel) currentPanel.hidden = false;
      }
    });
  }

  Meridian.faq = { init };
})(window);


/* ==========================================================================
   Meridian — LocalStorage Wishlist & Saved Quotes Slide-Over Drawer
   ========================================================================== */

(function (global) {
  'use strict';

  const Meridian = (global.Meridian = global.Meridian || {});
  let activeDrawerTab = 'wishlist';

  function updateBadge() {
    const count = (Meridian.state.wishlist || []).length;
    document.querySelectorAll('.wishlist-count-target').forEach((el) => {
      el.textContent = count;
    });
    const quotesCountEl = document.getElementById('drawer-quotes-count');
    if (quotesCountEl) {
      quotesCountEl.textContent = Meridian.storage.getSavedQuotes().length;
    }
  }

  function renderDrawerTabs() {
    const wishlistTabBtn = document.getElementById('drawer-tab-wishlist');
    const quotesTabBtn = document.getElementById('drawer-tab-quotes');
    if (wishlistTabBtn) {
      wishlistTabBtn.classList.toggle('is-active', activeDrawerTab === 'wishlist');
      wishlistTabBtn.setAttribute('aria-selected', String(activeDrawerTab === 'wishlist'));
    }
    if (quotesTabBtn) {
      quotesTabBtn.classList.toggle('is-active', activeDrawerTab === 'quotes');
      quotesTabBtn.setAttribute('aria-selected', String(activeDrawerTab === 'quotes'));
    }
  }

  function renderDrawer() {
    const body = document.getElementById('wishlist-drawer-body');
    const clearBtn = document.getElementById('wishlist-clear-btn');
    if (!body) return;

    renderDrawerTabs();
    const { escapeHTML, formatCurrency, formatShortDate } = Meridian.utils;

    if (activeDrawerTab === 'quotes') {
      const quotes = Meridian.storage.getSavedQuotes();
      if (clearBtn) clearBtn.hidden = true;

      if (!quotes.length) {
        body.innerHTML = `
          <div class="empty-state" style="padding: 2rem 1rem;">
            <h3 class="empty-state__title">No saved quotes yet</h3>
            <p class="empty-state__text">Open "Estimate &amp; Book" on any hotel to configure dates, add-ons, and save an instant quote.</p>
            <a href="#hotels" class="btn btn--primary btn--sm" id="quotes-browse-btn">Browse Stays</a>
          </div>`;
        const browseBtn = document.getElementById('quotes-browse-btn');
        if (browseBtn) browseBtn.addEventListener('click', closeDrawer);
        return;
      }

      body.innerHTML = quotes
        .map(
          (q, idx) => `
        <div class="saved-quote-card">
          <div class="saved-quote-card__top">
            <strong>${escapeHTML(q.hotelName)}</strong>
            ${q.grandTotal ? `<span class="saved-quote-card__total tabular-nums">${formatCurrency(q.grandTotal)}</span>` : ''}
          </div>
          <div class="wishlist-item__meta tabular-nums">
            ${escapeHTML(formatShortDate(q.checkIn))} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i> ${escapeHTML(formatShortDate(q.checkOut))} &middot; ${q.rooms} room${q.rooms === 1 ? '' : 's'} &middot; ${q.adults + q.children} guests
          </div>
          <div class="wishlist-item__actions" style="margin-top: 0.65rem;">
            <button type="button" class="btn btn--primary btn--sm" data-drawer-estimate="${escapeHTML(q.hotelId)}">Reopen Estimator</button>
            <button type="button" class="btn btn--ghost btn--sm" data-quote-remove="${idx}">Delete</button>
          </div>
        </div>`
        )
        .join('');
      return;
    }

    const savedIds = Meridian.state.wishlist || [];
    if (clearBtn) {
      clearBtn.hidden = savedIds.length === 0;
    }

    if (!savedIds.length) {
      body.innerHTML = `
        <div class="empty-state" style="padding: 2rem 1rem;">
          <h3 class="empty-state__title">Your wishlist is empty</h3>
          <p class="empty-state__text">Tap the heart icon on any stay to save favorites across visits.</p>
          <a href="#hotels" class="btn btn--primary btn--sm" id="wishlist-browse-btn">Browse Stays</a>
        </div>`;
      const browseBtn = document.getElementById('wishlist-browse-btn');
      if (browseBtn) browseBtn.addEventListener('click', closeDrawer);
      return;
    }

    const hotels = savedIds
      .map((id) => Meridian.data.hotels.find((h) => h.id === id))
      .filter(Boolean);

    body.innerHTML = hotels
      .map(
        (hotel) => `
      <div class="wishlist-item">
        <img src="${escapeHTML(hotel.image)}" alt="${escapeHTML(hotel.name)}" class="wishlist-item__img" />
        <div class="wishlist-item__info">
          <div>
            <div class="wishlist-item__title">${escapeHTML(hotel.name)}</div>
            <div class="wishlist-item__meta">${escapeHTML(hotel.location)} &middot; ${formatCurrency(hotel.pricePerNight)}/night</div>
          </div>
          <div class="wishlist-item__actions">
            <button type="button" class="btn btn--primary btn--sm" data-drawer-estimate="${escapeHTML(hotel.id)}">Estimate Stay</button>
            <button type="button" class="btn btn--ghost btn--sm" data-drawer-remove="${escapeHTML(hotel.id)}" aria-label="Remove ${escapeHTML(hotel.name)}">Remove</button>
          </div>
        </div>
      </div>`
      )
      .join('');
  }

  function openDrawer(defaultTab) {
    const drawer = document.getElementById('wishlist-drawer');
    const backdrop = document.getElementById('wishlist-drawer-backdrop');
    if (!drawer || !backdrop) return;
    if (typeof defaultTab === 'string') activeDrawerTab = defaultTab;
    updateBadge();
    renderDrawer();
    drawer.classList.add('is-open');
    backdrop.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }

  function closeDrawer() {
    const drawer = document.getElementById('wishlist-drawer');
    const backdrop = document.getElementById('wishlist-drawer-backdrop');
    if (!drawer || !backdrop) return;
    drawer.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  function toggle(hotelId, buttonEl) {
    const list = Meridian.state.wishlist || [];
    const idx = list.indexOf(hotelId);
    const hotel = Meridian.data.hotels.find((h) => h.id === hotelId);
    const hotelName = hotel ? hotel.name : 'Stay';

    if (idx === -1) {
      list.push(hotelId);
      Meridian.toast.show(`${hotelName} added to your saved wishlist.`, 'success');
    } else {
      list.splice(idx, 1);
      Meridian.toast.show(`${hotelName} removed from your wishlist.`, 'success');
    }

    Meridian.state.wishlist = list;
    Meridian.storage.saveWishlist(list);
    updateBadge();
    renderDrawer();
    Meridian.hotels.render();

    if (buttonEl) {
      buttonEl.classList.add('just-toggled');
      global.setTimeout(() => buttonEl.classList.remove('just-toggled'), 360);
    }
  }

  function init() {
    const triggers = document.querySelectorAll('[data-open-wishlist]');
    const closeBtn = document.getElementById('wishlist-close-btn');
    const backdrop = document.getElementById('wishlist-drawer-backdrop');
    const body = document.getElementById('wishlist-drawer-body');
    const clearBtn = document.getElementById('wishlist-clear-btn');
    const exploreBtn = document.getElementById('wishlist-explore-btn');
    const wishlistTabBtn = document.getElementById('drawer-tab-wishlist');
    const quotesTabBtn = document.getElementById('drawer-tab-quotes');

    triggers.forEach((btn) => btn.addEventListener('click', () => openDrawer('wishlist')));
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);
    if (exploreBtn) exploreBtn.addEventListener('click', closeDrawer);

    if (wishlistTabBtn) {
      wishlistTabBtn.addEventListener('click', () => {
        activeDrawerTab = 'wishlist';
        renderDrawer();
      });
    }
    if (quotesTabBtn) {
      quotesTabBtn.addEventListener('click', () => {
        activeDrawerTab = 'quotes';
        renderDrawer();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        Meridian.state.wishlist = [];
        Meridian.storage.saveWishlist([]);
        updateBadge();
        renderDrawer();
        Meridian.hotels.render();
        Meridian.toast.show('Wishlist cleared.', 'success');
      });
    }

    if (body) {
      body.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('[data-drawer-remove]');
        if (removeBtn) {
          toggle(removeBtn.getAttribute('data-drawer-remove'));
          return;
        }
        const removeQuoteBtn = e.target.closest('[data-quote-remove]');
        if (removeQuoteBtn) {
          const idx = Number(removeQuoteBtn.getAttribute('data-quote-remove'));
          const quotes = Meridian.storage.getSavedQuotes();
          quotes.splice(idx, 1);
          try {
            global.localStorage.setItem('meridian_saved_quotes_v1', JSON.stringify(quotes));
          } catch (err) {
            /* ignore */
          }
          updateBadge();
          renderDrawer();
          Meridian.toast.show('Saved quote removed.', 'success');
          return;
        }
        const estBtn = e.target.closest('[data-drawer-estimate]');
        if (estBtn) {
          const id = estBtn.getAttribute('data-drawer-estimate');
          closeDrawer();
          Meridian.hotels.openEstimator(id);
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      const drawer = document.getElementById('wishlist-drawer');
      if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) {
        closeDrawer();
      }
    });

    updateBadge();
    renderDrawer();
  }

  Meridian.wishlist = { init, toggle, openDrawer, closeDrawer, updateBadge, renderDrawer };
})(window);


/* ==========================================================================
   Meridian — Newsletter Form Validation & LocalStorage Persistence
   ========================================================================== */

(function (global) {
  'use strict';

  const Meridian = (global.Meridian = global.Meridian || {});

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function init() {
    const form = document.getElementById('newsletter-form');
    const emailInput = document.getElementById('newsletter-email');
    const inputGroup = document.getElementById('newsletter-input-group');
    const consentCheckbox = document.getElementById('newsletter-consent');
    const statusEl = document.getElementById('newsletter-status');

    if (!form || !emailInput || !statusEl) return;

    // Restore prior subscription status from LocalStorage
    const existing = Meridian.storage.getNewsletterSubscription();
    if (existing && existing.email) {
      statusEl.textContent = `Subscribed with ${existing.email} — welcome code STACKLY15 is ready to use.`;
      statusEl.className = 'newsletter-status is-success';
    }

    function setError(msg) {
      inputGroup.classList.add('has-error');
      statusEl.textContent = msg;
      statusEl.className = 'newsletter-status is-error';
    }

    function setSuccess(msg) {
      inputGroup.classList.remove('has-error');
      statusEl.textContent = msg;
      statusEl.className = 'newsletter-status is-success';
    }

    emailInput.addEventListener('input', () => {
      if (inputGroup.classList.contains('has-error')) {
        inputGroup.classList.remove('has-error');
        statusEl.textContent = '';
        statusEl.className = 'newsletter-status';
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();

      if (!email) {
        setError('Please enter your email address.');
        emailInput.focus();
        return;
      }

      if (!EMAIL_REGEX.test(email)) {
        setError('Please enter a valid email address (e.g. alex@domain.com).');
        emailInput.focus();
        return;
      }

      if (consentCheckbox && !consentCheckbox.checked) {
        setError('Please agree to receive seasonal travel dispatches before subscribing.');
        consentCheckbox.focus();
        return;
      }

      const prev = Meridian.storage.getNewsletterSubscription();
      if (!prev || prev.email.toLowerCase() !== email.toLowerCase()) {
        Meridian.storage.saveNewsletterSubscription(email);
      }

      global.location.href = '404.html';
    });
  }

  Meridian.newsletter = { init };
})(window);


/* ==========================================================================
   Meridian — Application Bootstrap & AOS Initialization
   ========================================================================== */

(function (global) {
  'use strict';

  const Meridian = (global.Meridian = global.Meridian || {});

  function initState() {
    const savedSearch = Meridian.storage.getSearchState() || {};
    const { getTodayISO, addDays, diffNights } = Meridian.utils;
    const today = getTodayISO();

    let checkIn = savedSearch.checkIn || addDays(today, 3);
    if (checkIn < today) checkIn = addDays(today, 3);

    let checkOut = savedSearch.checkOut || addDays(checkIn, 3);
    if (diffNights(checkIn, checkOut) < 1) checkOut = addDays(checkIn, 3);

    Meridian.state = {
      destinationQuery: '',
      selectedDestinationId: 'all',
      checkIn,
      checkOut,
      adults: Number(savedSearch.adults) || 2,
      children: Number(savedSearch.children) || 0,
      rooms: Number(savedSearch.rooms) || 1,
      destinationVibe: 'All',
      hotelCategory: 'All',
      maxPrice: 950,
      minRating: 0,
      sortBy: 'recommended',
      appliedPromoCode: Meridian.storage.getAppliedPromo(),
      wishlist: Meridian.storage.getWishlist()
    };
  }

  function initAOS() {
    if (typeof global.AOS !== 'undefined') {
      global.AOS.init({
        duration: 680,
        easing: 'ease-out-cubic',
        once: true,
        offset: 55
      });
      return;
    }

    // Graceful offline fallback if AOS CDN is unreachable
    document.documentElement.classList.add('aos-fallback');
    const targets = document.querySelectorAll('[data-aos]');
    if (!('IntersectionObserver' in global)) {
      targets.forEach((el) => el.classList.add('aos-animate'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    targets.forEach((el) => observer.observe(el));
  }

  function refreshAnimations() {
    if (typeof global.AOS !== 'undefined') {
      global.AOS.refreshHard();
    }
    // Ensure dynamically re-rendered cards never remain stuck hidden waiting for scroll
    document
      .querySelectorAll('#destinations-grid [data-aos], #hotels-grid [data-aos]')
      .forEach((el) => {
        el.classList.add('aos-animate');
      });
  }

  function initGalleryLinks() {
    document.querySelectorAll('[data-gallery-dest]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const destId = btn.getAttribute('data-gallery-dest');
        const dest = Meridian.data.destinations.find((d) => d.id === destId);
        if (!dest) return;
        Meridian.state.selectedDestinationId = dest.id;
        Meridian.state.destinationQuery = dest.name;
        Meridian.state.hotelCategory = 'All';
        if (Meridian.search.syncInputsFromState) Meridian.search.syncInputsFromState();
        Meridian.hotels.syncDestinationFilter();
        Meridian.hotels.render();
        const hotelsSection = document.getElementById('hotels');
        if (hotelsSection) {
          hotelsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initState();

    Meridian.navigation.init();
    Meridian.search.init();
    Meridian.destinations.init();
    if (Meridian.experiences) Meridian.experiences.init();
    if (Meridian.itineraries) Meridian.itineraries.init();
    if (Meridian.seasons) Meridian.seasons.init();
    Meridian.hotels.init();
    Meridian.offers.init();
    Meridian.testimonials.init();
    if (Meridian.faq) Meridian.faq.init();
    Meridian.wishlist.init();
    Meridian.newsletter.init();
    initGalleryLinks();

    initAOS();
  });

  Meridian.refreshAnimations = refreshAnimations;
})(window);
