// =============================================
//  WEDDING PLANNER — Adil & Nadiya 26/06/2026
// =============================================

const WEDDING_DATE = new Date('2026-06-26T14:00:00');

// ─── STATE ─────────────────────────────────────
const state = {
  guests: [],
  tables: [],
  menuSections: [
    { id: 'cocktail', name: 'Cocktail & Amuse-bouches', icon: '🥂', items: [] },
    { id: 'entrees', name: 'Entrées', icon: '🥗', items: [] },
    { id: 'plats', name: 'Plats principaux', icon: '🍽️', items: [] },
    { id: 'desserts', name: 'Desserts & Pièce montée', icon: '🎂', items: [] },
    { id: 'boissons', name: 'Boissons', icon: '🍾', items: [] },
  ],
  budget: [],
  tasks: [],
  events: [
    { id: uid(), name: 'Cérémonie civile', date: '2026-06-26', time: '11:00', location: 'Mairie', notes: '' },
    { id: uid(), name: 'Cérémonie religieuse', date: '2026-06-26', time: '14:30', location: 'À définir', notes: '' },
    { id: uid(), name: 'Cocktail', date: '2026-06-26', time: '16:30', location: 'À définir', notes: '' },
    { id: uid(), name: 'Soirée & Dîner', date: '2026-06-26', time: '19:30', location: 'À définir', notes: '' },
  ],
  editingGuestId: null,
  editingTableId: null,
  guestFilter: 'tous',
  taskFilter: 'tous',
};

// ─── UTILS ────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function save() {
  localStorage.setItem('adil-nadiya-wedding', JSON.stringify({
    guests: state.guests,
    tables: state.tables,
    menuSections: state.menuSections,
    budget: state.budget,
    tasks: state.tasks,
    events: state.events,
    tablePositions: state.tablePositions,
    seatOffsets: state.seatOffsets,
  }));
}

function load() {
  const raw = localStorage.getItem('adil-nadiya-wedding');
  if (!raw) return;
  const data = JSON.parse(raw);
  Object.assign(state, data);
  if (!state.tablePositions) state.tablePositions = {};
  if (!state.seatOffsets) state.seatOffsets = {};
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2400);
}

function daysUntil() {
  const now = new Date();
  const diff = WEDDING_DATE - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function initials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function avatarColor(role) {
  const map = {
    'témoin-marié': 'avatar-gold',
    'témoin-mariée': 'avatar-gold',
    'demoiselle-honneur': 'avatar-sage',
    'garçon-honneur': 'avatar-sage',
    'famille-marié': '',
    'famille-mariée': '',
  };
  return map[role] || '';
}

function roleBadge(role) {
  const labels = {
    'invité': ['Invité', 'badge-gray'],
    'témoin-marié': ['Témoin ♂', 'badge-gold'],
    'témoin-mariée': ['Témoin ♀', 'badge-gold'],
    'demoiselle-honneur': ["Demoiselle d'honneur", 'badge-sage'],
    'garçon-honneur': ["Garçon d'honneur", 'badge-sage'],
    'famille-marié': ['Famille Adil', 'badge-wine'],
    'famille-mariée': ['Famille Nadiya', 'badge-wine'],
    'enfant': ['Enfant', 'badge-gray'],
  };
  const [label, cls] = labels[role] || [role, 'badge-gray'];
  return `<span class="badge ${cls}">${label}</span>`;
}

function rsvpBadge(rsvp) {
  const map = {
    'confirmé': ['Confirmé', 'badge-green'],
    'décliné': ['Décliné', 'badge-red'],
    'en-attente': ['En attente', 'badge-gray'],
  };
  const [label, cls] = map[rsvp] || [rsvp, 'badge-gray'];
  return `<span class="badge ${cls}">${label}</span>`;
}

function sideBadge(side) {
  const map = {
    'adil': ['Adil', 'badge-wine'],
    'nadiya': ['Nadiya', 'badge-sage'],
    'commun': ['Commun', 'badge-gray'],
  };
  const [label, cls] = map[side] || [side, 'badge-gray'];
  return `<span class="badge ${cls}">${label}</span>`;
}

// ─── COUNTDOWN ────────────────────────────────
function updateCountdown() {
  const days = daysUntil();
  const el = document.getElementById('sidebar-countdown');
  if (el) {
    el.innerHTML = `<strong>${days}</strong>jours avant le grand jour`;
  }
  const hero = document.getElementById('hero-days');
  if (hero) hero.textContent = days;
}

// ─── NAVIGATION ────────────────────────────────
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  document.querySelector(`[data-page="${page}"]`).classList.add('active');
  renderPage(page);
}

function renderPage(page) {
  const renderers = {
    dashboard: renderDashboard,
    guests: renderGuests,
    seating: renderSeating,
    menu: renderMenu,
    budget: renderBudget,
    checklist: renderChecklist,
    planning: renderPlanning,
  };
  if (renderers[page]) renderers[page]();
}

// ─── MODALS ────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add('active');
  document.getElementById('modal-overlay').classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  document.getElementById('modal-overlay').classList.remove('active');
}

document.getElementById('modal-overlay').addEventListener('click', () => {
  document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
  document.getElementById('modal-overlay').classList.remove('active');
});

// ─── DASHBOARD ────────────────────────────────
function renderDashboard() {
  const pg = document.getElementById('page-dashboard');
  const confirmed = state.guests.filter(g => g.rsvp === 'confirmé').length;
  const pending = state.guests.filter(g => g.rsvp === 'en-attente').length;
  const total = state.guests.length;
  const doneTasks = state.tasks.filter(t => t.done).length;
  const totalTasks = state.tasks.length;
  const totalBudget = state.budget.reduce((s, b) => s + (b.planned || 0), 0);
  const paidBudget = state.budget.reduce((s, b) => s + (b.paid || 0), 0);
  const days = daysUntil();

  const nextTask = state.tasks.filter(t => !t.done && t.due).sort((a, b) => a.due.localeCompare(b.due))[0];
  const recentGuests = [...state.guests].slice(-3).reverse();

  pg.innerHTML = `
    <div class="hero-banner">
      <div>
        <div class="hero-title">Adil <em>&</em> Nadiya</div>
        <div class="hero-subtitle" style="margin-top:.3rem;letter-spacing:.18em">26 · Juin · 2026 &nbsp;·&nbsp; Le grand jour</div>
      </div>
      <div class="hero-countdown">
        <span class="hero-countdown-num" id="hero-days">${days}</span>
        <span class="hero-countdown-label">jours restants</span>
      </div>
    </div>

    <div class="page-body">
      <div class="stat-grid">
        <div class="stat-card" style="cursor:pointer" onclick="navigate('guests')">
          <div class="stat-label">Invités total</div>
          <div class="stat-value">${total}</div>
          <div class="stat-meta">${confirmed} confirmé${confirmed>1?'s':''} · ${pending} en attente</div>
        </div>
        <div class="stat-card" style="cursor:pointer" onclick="navigate('budget')">
          <div class="stat-label">Budget prévu</div>
          <div class="stat-value">${totalBudget > 0 ? totalBudget.toLocaleString('fr-FR') + ' €' : '—'}</div>
          <div class="stat-meta">${paidBudget > 0 ? paidBudget.toLocaleString('fr-FR') + ' € réglés' : 'Aucun paiement'}</div>
        </div>
        <div class="stat-card" style="cursor:pointer" onclick="navigate('checklist')">
          <div class="stat-label">Tâches</div>
          <div class="stat-value">${doneTasks}/${totalTasks}</div>
          <div class="stat-meta">${totalTasks > 0 ? Math.round(doneTasks/totalTasks*100) : 0}% complétées</div>
          <div class="progress-bar" style="margin-top:.6rem"><div class="progress-fill" style="width:${totalTasks > 0 ? Math.round(doneTasks/totalTasks*100) : 0}%"></div></div>
        </div>
        <div class="stat-card" style="cursor:pointer" onclick="navigate('seating')">
          <div class="stat-label">Tables créées</div>
          <div class="stat-value">${state.tables.length}</div>
          <div class="stat-meta">${state.tables.reduce((s,t) => s + t.guests.length, 0)} invités placés</div>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="dashboard-card">
          <div class="dashboard-card-header">
            <span class="dashboard-card-title">Derniers invités ajoutés</span>
            <button class="btn btn-sm btn-primary" onclick="navigate('guests')">Voir tout</button>
          </div>
          <div class="dashboard-card-body">
            ${recentGuests.length === 0 ? `<div class="empty-state" style="padding:1.5rem"><p>Aucun invité pour l'instant</p></div>` :
              recentGuests.map(g => `
                <div style="display:flex;align-items:center;gap:.7rem;padding:.5rem 0;border-bottom:1px solid var(--border)">
                  <div class="avatar ${avatarColor(g.role)}">${initials(g.firstname + ' ' + g.lastname)}</div>
                  <div style="flex:1">
                    <div style="font-size:.88rem;font-weight:500">${g.firstname} ${g.lastname}</div>
                    <div style="font-size:.75rem;color:var(--muted)">${g.role === 'invité' ? 'Invité' : g.role}</div>
                  </div>
                  ${rsvpBadge(g.rsvp)}
                </div>
              `).join('')}
          </div>
        </div>

        <div class="dashboard-card">
          <div class="dashboard-card-header">
            <span class="dashboard-card-title">Programme du 26 juin</span>
            <button class="btn btn-sm btn-ghost" onclick="navigate('planning')">Voir tout</button>
          </div>
          <div class="dashboard-card-body">
            ${state.events.slice(0,4).map(ev => `
              <div style="display:flex;gap:.8rem;align-items:flex-start;padding:.5rem 0;border-bottom:1px solid var(--border)">
                <div style="min-width:48px;font-size:.8rem;font-weight:500;color:var(--gold);font-family:var(--font-display)">${ev.time || '—'}</div>
                <div>
                  <div style="font-size:.88rem;font-weight:500">${ev.name}</div>
                  ${ev.location ? `<div style="font-size:.75rem;color:var(--muted)">${ev.location}</div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="dashboard-card">
          <div class="dashboard-card-header">
            <span class="dashboard-card-title">Prochaine tâche</span>
            <button class="btn btn-sm btn-ghost" onclick="navigate('checklist')">Checklist</button>
          </div>
          <div class="dashboard-card-body">
            ${nextTask ? `
              <div style="display:flex;gap:.8rem;align-items:flex-start">
                <span class="task-priority-dot priority-${nextTask.priority}"></span>
                <div>
                  <div style="font-size:.9rem;font-weight:500">${nextTask.name}</div>
                  ${nextTask.due ? `<div style="font-size:.78rem;color:var(--muted);margin-top:.2rem">Avant le ${formatDate(nextTask.due)}</div>` : ''}
                  <span class="badge badge-gray" style="margin-top:.4rem">${nextTask.category}</span>
                </div>
              </div>
            ` : `<div class="empty-state" style="padding:1rem"><p>Aucune tâche urgente 🎉</p></div>`}
          </div>
        </div>

        <div class="dashboard-card">
          <div class="dashboard-card-header">
            <span class="dashboard-card-title">Répartition RSVP</span>
          </div>
          <div class="dashboard-card-body">
            ${total === 0 ? `<div class="empty-state" style="padding:1rem"><p>Ajoutez vos invités pour voir les stats</p></div>` : `
              ${[
                ['Confirmés', confirmed, '#3A7D44'],
                ['En attente', pending, '#C19B5E'],
                ['Déclinés', state.guests.filter(g=>g.rsvp==='décliné').length, '#C0392B'],
              ].map(([label, count, color]) => count > 0 ? `
                <div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.6rem">
                  <div style="width:10px;height:10px;border-radius:2px;background:${color};flex-shrink:0"></div>
                  <div style="flex:1;font-size:.85rem">${label}</div>
                  <div style="font-size:.85rem;font-weight:500">${count}</div>
                  <div style="width:80px;background:var(--ivory-2);border-radius:4px;height:6px;overflow:hidden">
                    <div style="width:${Math.round(count/total*100)}%;height:100%;background:${color};border-radius:4px"></div>
                  </div>
                </div>
              ` : '').join('')}
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ─── GUESTS ────────────────────────────────────
function renderGuests() {
  const pg = document.getElementById('page-guests');
  let filtered = [...state.guests];

  if (state.guestFilter !== 'tous') {
    if (['confirmé', 'décliné', 'en-attente'].includes(state.guestFilter)) {
      filtered = filtered.filter(g => g.rsvp === state.guestFilter);
    } else if (['adil', 'nadiya'].includes(state.guestFilter)) {
      filtered = filtered.filter(g => g.side === state.guestFilter);
    } else {
      filtered = filtered.filter(g => g.role === state.guestFilter);
    }
  }

  const searchQ = pg.querySelector?.('#guest-search')?.value?.toLowerCase() || '';
  if (searchQ) {
    filtered = filtered.filter(g =>
      `${g.firstname} ${g.lastname}`.toLowerCase().includes(searchQ) ||
      g.role?.toLowerCase().includes(searchQ)
    );
  }

  pg.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Liste des invités</div>
        <div class="page-subtitle">${state.guests.length} personne${state.guests.length > 1 ? 's' : ''} · ${state.guests.filter(g=>g.rsvp==='confirmé').length} confirmée${state.guests.filter(g=>g.rsvp==='confirmé').length > 1 ? 's' : ''}</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="openGuestModal()">
          <svg viewBox="0 0 20 20"><path d="M10 4v12M4 10h12"/></svg>
          Ajouter un invité
        </button>
      </div>
    </div>

    <div class="filters">
      <input type="text" class="search-box" id="guest-search" placeholder="Rechercher..." oninput="filterGuests(this.value)">
      ${['tous','confirmé','en-attente','décliné','adil','nadiya'].map(f => `
        <button class="filter-btn ${state.guestFilter === f ? 'active' : ''}" onclick="setGuestFilter('${f}')">
          ${f === 'tous' ? 'Tous' : f === 'confirmé' ? 'Confirmés' : f === 'en-attente' ? 'En attente' : f === 'décliné' ? 'Déclinés' : f === 'adil' ? 'Côté Adil' : 'Côté Nadiya'}
        </button>
      `).join('')}
    </div>

    <div class="page-body" style="padding-top:1.5rem">
      ${filtered.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">👰</div>
          <h4>Aucun invité</h4>
          <p>Commencez par ajouter vos invités avec le bouton ci-dessus.</p>
        </div>
      ` : `
        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th>Invité</th>
                <th>Rôle</th>
                <th>Côté</th>
                <th>RSVP</th>
                <th>Régime</th>
                <th>Table</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(g => {
                const table = state.tables.find(t => t.guests.includes(g.id));
                return `
                  <tr>
                    <td>
                      <div style="display:flex;align-items:center;gap:.7rem">
                        <div class="avatar ${avatarColor(g.role)}">${initials(g.firstname + ' ' + g.lastname)}</div>
                        <div>
                          <div style="font-weight:500">${g.firstname} ${g.lastname}</div>
                          ${g.email ? `<div style="font-size:.73rem;color:var(--muted)">${g.email}</div>` : ''}
                        </div>
                      </div>
                    </td>
                    <td>${roleBadge(g.role)}</td>
                    <td>${sideBadge(g.side)}</td>
                    <td>${rsvpBadge(g.rsvp)}</td>
                    <td><span style="font-size:.8rem;color:var(--muted)">${g.diet === 'standard' ? '—' : g.diet}</span></td>
                    <td><span style="font-size:.8rem">${table ? table.name : '<span style="color:var(--muted);font-style:italic">Non placé</span>'}</span></td>
                    <td>
                      <div style="display:flex;gap:.3rem">
                        <button class="btn btn-sm btn-icon" onclick="openGuestModal('${g.id}')" title="Modifier">
                          <svg viewBox="0 0 20 20" style="width:13px;height:13px"><path d="M13.5 2.5L17.5 6.5L7 17H3v-4L13.5 2.5z"/></svg>
                        </button>
                        <button class="btn btn-sm btn-icon" onclick="deleteGuest('${g.id}')" title="Supprimer" style="color:#C0392B">
                          <svg viewBox="0 0 20 20" style="width:13px;height:13px"><path d="M4 6h12M8 6V4h4v2M7 6v10h6V6"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

function setGuestFilter(f) {
  state.guestFilter = f;
  renderGuests();
}

function filterGuests(q) {
  // Re-render with search; the search box value is read inside renderGuests
  renderGuests();
}

function openGuestModal(id = null) {
  state.editingGuestId = id;
  document.getElementById('guest-modal-title').textContent = id ? 'Modifier l\'invité' : 'Ajouter un invité';

  if (id) {
    const g = state.guests.find(x => x.id === id);
    document.getElementById('guest-firstname').value = g.firstname;
    document.getElementById('guest-lastname').value = g.lastname;
    document.getElementById('guest-email').value = g.email || '';
    document.getElementById('guest-phone').value = g.phone || '';
    document.getElementById('guest-role').value = g.role;
    document.getElementById('guest-side').value = g.side;
    document.getElementById('guest-rsvp').value = g.rsvp;
    document.getElementById('guest-diet').value = g.diet;
    document.getElementById('guest-notes').value = g.notes || '';
  } else {
    document.getElementById('guest-firstname').value = '';
    document.getElementById('guest-lastname').value = '';
    document.getElementById('guest-email').value = '';
    document.getElementById('guest-phone').value = '';
    document.getElementById('guest-role').value = 'invité';
    document.getElementById('guest-side').value = 'adil';
    document.getElementById('guest-rsvp').value = 'en-attente';
    document.getElementById('guest-diet').value = 'standard';
    document.getElementById('guest-notes').value = '';
  }
  openModal('guest-modal');
  setTimeout(() => document.getElementById('guest-firstname').focus(), 50);
}

function saveGuest() {
  const firstname = document.getElementById('guest-firstname').value.trim();
  const lastname = document.getElementById('guest-lastname').value.trim();
  if (!firstname || !lastname) { toast('Veuillez renseigner le prénom et le nom.'); return; }

  const guest = {
    id: state.editingGuestId || uid(),
    firstname, lastname,
    email: document.getElementById('guest-email').value.trim(),
    phone: document.getElementById('guest-phone').value.trim(),
    role: document.getElementById('guest-role').value,
    side: document.getElementById('guest-side').value,
    rsvp: document.getElementById('guest-rsvp').value,
    diet: document.getElementById('guest-diet').value,
    notes: document.getElementById('guest-notes').value.trim(),
  };

  if (state.editingGuestId) {
    const idx = state.guests.findIndex(g => g.id === state.editingGuestId);
    state.guests[idx] = guest;
  } else {
    state.guests.push(guest);
  }

  save();
  closeModal('guest-modal');
  toast(state.editingGuestId ? 'Invité mis à jour !' : `${firstname} ajouté(e) !`);
  renderGuests();
}

function deleteGuest(id) {
  if (!confirm('Supprimer cet invité ?')) return;
  state.guests = state.guests.filter(g => g.id !== id);
  state.tables.forEach(t => { t.guests = t.guests.filter(gid => gid !== id); });
  save();
  renderGuests();
  toast('Invité supprimé.');
}

// ─── SEATING ───────────────────────────────────

if (!state.tablePositions) state.tablePositions = {};
if (!state.seatOffsets) state.seatOffsets = {}; // { "tableId:seatIndex": {dx, dy} }
let seatingSelectedId = null;
let seatingZoom = 1;
let seatingSnap = false;

function renderSeating() {
  const pg = document.getElementById('page-seating');
  const placedCount = state.tables.reduce((s, t) => s + t.guests.length, 0);
  const unplaced = state.guests.filter(g => !state.tables.some(t => t.guests.includes(g.id)));
  seatingSelectedId = null;

  pg.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Plan de table</div>
        <div class="page-subtitle">${state.tables.length} table${state.tables.length > 1 ? 's' : ''} · ${placedCount} / ${state.guests.length} invités placés</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-ghost" onclick="seatingToggleSnap()" id="btn-snap" title="Aligner sur grille">
          <svg viewBox="0 0 20 20" style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round"><path d="M3 3h3v3H3zM9 3h3v3H9zM15 3h2v2h-2zM3 9h3v3H3zM9 9h3v3H9zM15 9h2v2h-2zM3 15h3v2H3zM9 15h3v2H9zM15 15h2v2h-2z"/></svg>
          Grille
        </button>
        <button class="btn btn-ghost" onclick="seatingZoomOut()" title="Zoom -">
          <svg viewBox="0 0 20 20" style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round"><circle cx="9" cy="9" r="6"/><path d="M6 9h6M15 15l3 3"/></svg>
        </button>
        <button class="btn btn-ghost" onclick="seatingZoomIn()" title="Zoom +">
          <svg viewBox="0 0 20 20" style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round"><circle cx="9" cy="9" r="6"/><path d="M9 6v6M6 9h6M15 15l3 3"/></svg>
        </button>
        <button class="btn btn-ghost" onclick="exportPDF()">
          <svg viewBox="0 0 20 20" style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round"><path d="M4 4h8l4 4v8a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z"/><path d="M12 4v4h4M7 12h6M7 15h4"/></svg>
          PDF
        </button>
        <button class="btn btn-primary" onclick="openTableModal()">
          <svg viewBox="0 0 20 20"><path d="M10 4v12M4 10h12"/></svg>
          Nouvelle table
        </button>
      </div>
    </div>

    ${unplaced.length > 0 ? `
      <div style="padding:.5rem 2.5rem;background:var(--wine-pale);border-bottom:1px solid rgba(107,45,62,.15);font-size:.82rem;color:var(--wine)">
        <strong>${unplaced.length} non placé${unplaced.length > 1 ? 's' : ''} :</strong>
        ${unplaced.map(g => `<span style="margin-right:.4rem">${g.firstname} ${g.lastname}</span>`).join('')}
      </div>
    ` : state.guests.length > 0 && state.tables.length > 0 ? `
      <div style="padding:.5rem 2.5rem;background:#EAF4EA;border-bottom:1px solid #8FC98A;font-size:.82rem;color:#3A7D44">
        ✓ Tous les invités sont placés !
      </div>
    ` : ''}

    ${state.tables.length === 0 ? `
      <div class="page-body">
        <div class="empty-state">
          <div class="empty-state-icon">🪑</div>
          <h4>Aucune table créée</h4>
          <p>Créez vos tables et assignez-y vos invités.</p>
        </div>
      </div>
    ` : `
      <div style="display:flex;height:calc(100vh - ${unplaced.length > 0 || (state.guests.length > 0 && state.tables.length > 0) ? '195' : '160'}px)">

        <!-- Canvas zone -->
        <div id="seating-scroll" style="flex:1;overflow:auto;background:var(--ivory-2);position:relative;cursor:default"
             onclick="seatingDeselectAll(event)">
          <div id="seating-canvas" style="position:relative;width:1820px;min-height:1040px;transform-origin:top left;transform:scale(${seatingZoom})">
            <!-- Room outline -->
            <div style="position:absolute;inset:16px;border:2px dashed rgba(44,37,32,.1);border-radius:20px;pointer-events:none;z-index:0"></div>
            <div style="position:absolute;top:22px;left:50%;transform:translateX(-50%);font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(44,37,32,.3);pointer-events:none;white-space:nowrap">— Salle de réception —</div>
            ${seatingSnap ? buildSnapGrid() : ''}
            ${state.tables.map(table => renderTableNode(table)).join('')}
          </div>
          <div style="position:sticky;bottom:.8rem;left:.8rem;display:inline-flex;gap:.4rem;z-index:10;pointer-events:none">
            <span style="background:white;border:1px solid var(--border);border-radius:20px;padding:.3rem .7rem;font-size:.7rem;color:var(--muted)">
              Cliquer pour sélectionner · Glisser pour déplacer
            </span>
          </div>
        </div>

        <!-- Side panel -->
        <div id="seating-panel" style="width:260px;flex-shrink:0;background:white;border-left:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden">
          <div id="seating-panel-content" style="flex:1;overflow-y:auto;padding:1.2rem">
            <div style="text-align:center;padding:2rem 1rem;color:var(--muted)">
              <div style="font-size:1.8rem;margin-bottom:.5rem;opacity:.3">🪑</div>
              <div style="font-family:var(--font-display);font-size:1rem;font-weight:400;color:var(--charcoal-2);margin-bottom:.3rem">Sélectionner une table</div>
              <div style="font-size:.78rem">Cliquez sur une table pour voir ses détails et options</div>
            </div>
          </div>
          <div style="padding:1rem;border-top:1px solid var(--border)">
            <div style="font-size:.72rem;color:var(--muted);margin-bottom:.6rem;letter-spacing:.06em;text-transform:uppercase">Légende des rôles</div>
            ${[['invité','#4A3F38'],['famille-marié','#6B2D3E'],['famille-mariée','#8B3D52'],['témoin-marié','#C19B5E'],['demoiselle-honneur','#7A8C6E'],['enfant','#4A7C9F']].map(([role,color]) => `
              <div style="display:flex;align-items:center;gap:.4rem;margin-bottom:.3rem">
                <div style="width:10px;height:10px;border-radius:50%;background:${color};flex-shrink:0"></div>
                <span style="font-size:.72rem;color:var(--charcoal-2)">${role.replace('-', ' ')}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `}
  `;

  if (state.tables.length > 0) {
    initSeatingDrag();
  }
}

function buildSnapGrid() {
  let lines = '';
  for (let x = 0; x <= 1820; x += 40) {
    lines += `<div style="position:absolute;left:${x}px;top:0;bottom:0;width:1px;background:rgba(44,37,32,.05);pointer-events:none"></div>`;
  }
  for (let y = 0; y <= 1040; y += 40) {
    lines += `<div style="position:absolute;top:${y}px;left:0;right:0;height:1px;background:rgba(44,37,32,.05);pointer-events:none"></div>`;
  }
  return lines;
}

function renderTableNode(table) {
  const pos = state.tablePositions[table.id] || autoPosition(table.id);
  const tableGuests = state.guests.filter(g => table.guests.includes(g.id));
  const isRound = table.shape === 'ronde';
  const isLong = table.shape === 'longue';
  const isRect = table.shape === 'rectangulaire';
  const isSelected = seatingSelectedId === table.id;

  const tableW = isLong ? 240 : isRound ? 130 : 170;
  const tableH = isLong ? 75 : isRound ? 130 : 105;
  const pad = 32;

  const seats = buildSeats(table, tableGuests, tableW, tableH, isRound, isLong, pad);
  const fill = Math.round(tableGuests.length / table.capacity * 100);

  return `
    <div class="seating-node" data-table-id="${table.id}"
      style="position:absolute;left:${pos.x}px;top:${pos.y}px;z-index:${isSelected ? 20 : 2};cursor:grab;user-select:none;transition:filter .15s"
      onclick="seatingSelectTable(event, '${table.id}')">

      <div style="position:relative;width:${tableW + pad * 2}px;height:${tableH + pad * 2}px">
        ${seats}

        <!-- Table surface -->
        <div style="
          position:absolute;
          left:${pad}px;top:${pad}px;
          width:${tableW}px;height:${tableH}px;
          background:white;
          border:${isSelected ? '2.5px solid var(--wine)' : '2px solid var(--gold)'};
          border-radius:${isRound ? '50%' : isLong ? '10px' : '12px'};
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          box-shadow:${isSelected ? '0 0 0 4px rgba(107,45,62,.12), 0 6px 24px rgba(107,45,62,.18)' : '0 3px 14px rgba(107,45,62,.1)'};
          padding:.3rem .5rem;
          text-align:center;
          pointer-events:none;
        ">
          <div style="font-family:var(--font-display);font-size:${isLong ? '.75rem' : '.82rem'};font-weight:${isSelected ? 600 : 400};color:${isSelected ? 'var(--wine)' : 'var(--charcoal)'};line-height:1.2;margin-bottom:.1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:${tableW - 12}px">${table.name}</div>
          <div style="font-size:.6rem;color:${fill === 100 ? '#3A7D44' : 'var(--gold)'};letter-spacing:.04em">${tableGuests.length}/${table.capacity}</div>
          ${fill === 100 ? '<div style="font-size:.55rem;color:#3A7D44;margin-top:.1rem">✓ complet</div>' : ''}
        </div>
      </div>
    </div>
  `;
}

function defaultSeatPos(i, total, tableW, tableH, isRound, isLong, pad) {
  const seatSize = 26;
  const cx = tableW / 2 + pad;
  const cy = tableH / 2 + pad;
  let sx, sy;
  if (isRound) {
    const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
    const rx = tableW / 2 + 20;
    const ry = tableH / 2 + 20;
    sx = cx + rx * Math.cos(angle) - seatSize / 2;
    sy = cy + ry * Math.sin(angle) - seatSize / 2;
  } else if (isLong) {
    const topCount = Math.ceil(total / 2);
    const botCount = total - topCount;
    if (i < topCount) {
      sx = pad + (tableW / (topCount + 1)) * (i + 1) - seatSize / 2;
      sy = pad - seatSize - 4;
    } else {
      const j = i - topCount;
      sx = pad + (tableW / (botCount + 1)) * (j + 1) - seatSize / 2;
      sy = pad + tableH + 4;
    }
  } else {
    const sides = distributeSeatsSides(total);
    let sideIdx = 0, posInSide = 0, counted = 0;
    for (let s = 0; s < 4; s++) {
      if (i < counted + sides[s]) { sideIdx = s; posInSide = i - counted; break; }
      counted += sides[s];
    }
    const n = sides[sideIdx];
    if (sideIdx === 0) { sx = pad + (tableW / (n + 1)) * (posInSide + 1) - seatSize / 2; sy = pad - seatSize - 4; }
    else if (sideIdx === 1) { sx = pad + tableW + 4; sy = pad + (tableH / (n + 1)) * (posInSide + 1) - seatSize / 2; }
    else if (sideIdx === 2) { sx = pad + (tableW / (n + 1)) * (posInSide + 1) - seatSize / 2; sy = pad + tableH + 4; }
    else { sx = pad - seatSize - 4; sy = pad + (tableH / (n + 1)) * (posInSide + 1) - seatSize / 2; }
  }
  return { sx: Math.round(sx), sy: Math.round(sy) };
}

function buildSeats(table, tableGuests, tableW, tableH, isRound, isLong, pad) {
  const total = table.capacity;
  const seatSize = 26;
  let seats = '';

  for (let i = 0; i < total; i++) {
    const guest = tableGuests[i] || null;
    const key = table.id + ':' + i;
    const offset = state.seatOffsets[key] || { dx: 0, dy: 0 };
    const def = defaultSeatPos(i, total, tableW, tableH, isRound, isLong, pad);
    const sx = def.sx + offset.dx;
    const sy = def.sy + offset.dy;

    const bg = guest ? roleColor(guest.role) : 'var(--ivory-3)';
    const label = guest ? initials(guest.firstname + ' ' + guest.lastname) : '';
    const title = guest ? guest.firstname + ' ' + guest.lastname : 'Place libre';
    const hasMoved = offset.dx !== 0 || offset.dy !== 0;

    // Draw anchor line from default position to current if moved
    const linePart = hasMoved ? (() => {
      const defX = def.sx + seatSize / 2;
      const defY = def.sy + seatSize / 2;
      const curX = sx + seatSize / 2;
      const curY = sy + seatSize / 2;
      const len = Math.hypot(curX - defX, curY - defY);
      const angle = Math.atan2(curY - defY, curX - defX) * 180 / Math.PI;
      return '<div style="position:absolute;left:' + defX + 'px;top:' + defY + 'px;width:' + len + 'px;height:1px;background:rgba(193,155,94,.4);transform-origin:0 50%;transform:rotate(' + angle + 'deg);pointer-events:none;z-index:1"></div>';
    })() : '';

    seats += linePart + '<div class="draggable-seat" data-table-id="' + table.id + '" data-seat-idx="' + i + '" title="' + title + '" style="position:absolute;left:' + sx + 'px;top:' + sy + 'px;width:' + seatSize + 'px;height:' + seatSize + 'px;border-radius:50%;background:' + bg + ';border:2px solid ' + (guest ? 'rgba(255,255,255,.4)' : 'var(--border-hover)') + ';display:flex;align-items:center;justify-content:center;font-size:.5rem;font-weight:600;color:' + (guest ? 'white' : 'var(--muted)') + ';font-family:var(--font-body);box-shadow:' + (guest ? '0 1px 4px rgba(0,0,0,.2)' : 'none') + ';z-index:4;cursor:grab;' + (hasMoved ? 'outline:1.5px dashed rgba(193,155,94,.6);outline-offset:2px;' : '') + '">' + label + '</div>';
  }
  return seats;
}

function distributeSeatsSides(total) {
  // Distribute seats on 4 sides of a rectangle as evenly as possible
  const base = Math.floor(total / 4);
  const rem = total % 4;
  // top, right, bottom, left — put extras on top/bottom first
  return [
    base + (rem > 0 ? 1 : 0),
    base + (rem > 3 ? 1 : 0),
    base + (rem > 1 ? 1 : 0),
    base + (rem > 2 ? 1 : 0),
  ];
}

function roleColor(role) {
  const map = {
    'témoin-marié': '#C19B5E', 'témoin-mariée': '#C19B5E',
    'demoiselle-honneur': '#7A8C6E', 'garçon-honneur': '#7A8C6E',
    'famille-marié': '#6B2D3E', 'famille-mariée': '#8B3D52',
    'enfant': '#4A7C9F', 'invité': '#4A3F38',
  };
  return map[role] || '#4A3F38';
}

function autoPosition(tableId) {
  const idx = state.tables.findIndex(t => t.id === tableId);
  const cols = 3;
  const col = idx % cols;
  const row = Math.floor(idx / cols);
  const pos = { x: 60 + col * 280, y: 70 + row * 280 };
  state.tablePositions[tableId] = pos;
  return pos;
}

function seatingSelectTable(e, tableId) {
  e.stopPropagation();
  if (seatingSelectedId === tableId) return; // already selected, let drag work
  seatingSelectedId = tableId;
  refreshSeatingCanvas();
  renderSeatingPanel(tableId);
}

function seatingDeselectAll(e) {
  if (e.target.closest('.seating-node')) return;
  seatingSelectedId = null;
  refreshSeatingCanvas();
  const panel = document.getElementById('seating-panel-content');
  if (panel) panel.innerHTML = `
    <div style="text-align:center;padding:2rem 1rem;color:var(--muted)">
      <div style="font-size:1.8rem;margin-bottom:.5rem;opacity:.3">🪑</div>
      <div style="font-family:var(--font-display);font-size:1rem;font-weight:400;color:var(--charcoal-2);margin-bottom:.3rem">Sélectionner une table</div>
      <div style="font-size:.78rem">Cliquez sur une table pour voir ses détails et options</div>
    </div>`;
}

function refreshSeatingCanvas() {
  // Re-render only the table nodes without full page re-render
  state.tables.forEach(table => {
    const node = document.querySelector(`.seating-node[data-table-id="${table.id}"]`);
    if (!node) return;
    const pos = state.tablePositions[table.id] || autoPosition(table.id);
    node.outerHTML; // read it
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = renderTableNode(table);
    const newNode = tempDiv.firstElementChild;
    // preserve position
    newNode.style.left = node.style.left || pos.x + 'px';
    newNode.style.top = node.style.top || pos.y + 'px';
    node.parentNode.replaceChild(newNode, node);
  });
  initSeatingDrag();
}

function renderSeatingPanel(tableId) {
  const table = state.tables.find(t => t.id === tableId);
  if (!table) return;
  const tableGuests = state.guests.filter(g => table.guests.includes(g.id));
  const empty = table.capacity - tableGuests.length;
  const panel = document.getElementById('seating-panel-content');
  if (!panel) return;

  const dietLabels = { végétarien: '🥗', végétalien: '🌱', halal: '☪️', 'sans-gluten': '🌾', autre: '⚠️' };
  const roleLabels = {
    'invité': 'Invité', 'témoin-marié': 'Témoin ♂', 'témoin-mariée': 'Témoin ♀',
    'demoiselle-honneur': "Dem. d'honneur", 'garçon-honneur': "Garçon d'honneur",
    'famille-marié': 'Famille Adil', 'famille-mariée': 'Famille Nadiya', 'enfant': 'Enfant',
  };

  panel.innerHTML = `
    <div>
      <!-- Table header -->
      <div style="margin-bottom:1rem;padding-bottom:.8rem;border-bottom:1px solid var(--border)">
        <div style="font-family:var(--font-display);font-size:1.3rem;font-weight:400;color:var(--charcoal);margin-bottom:.25rem">${table.name}</div>
        <div style="display:flex;gap:.4rem;flex-wrap:wrap">
          <span class="badge badge-gray">${table.shape}</span>
          <span class="badge ${empty === 0 ? 'badge-green' : 'badge-gold'}">${tableGuests.length}/${table.capacity} places</span>
          ${empty > 0 ? `<span class="badge badge-gray">${empty} libre${empty > 1 ? 's' : ''}</span>` : ''}
        </div>
      </div>

      <!-- Actions -->
      <div style="display:flex;gap:.4rem;margin-bottom:.5rem">
        <button class="btn btn-primary btn-sm" style="flex:1" onclick="openTableModal('${table.id}')">
          <svg viewBox="0 0 20 20" style="width:12px;height:12px"><path d="M13.5 2.5L17.5 6.5L7 17H3v-4L13.5 2.5z" stroke="currentColor" fill="none" stroke-width="1.8" stroke-linecap="round"/></svg>
          Modifier
        </button>
        <button class="btn btn-ghost btn-sm" style="color:#C0392B;border-color:rgba(192,57,43,.3)" onclick="deleteTable('${table.id}')">
          <svg viewBox="0 0 20 20" style="width:12px;height:12px"><path d="M4 6h12M8 6V4h4v2M7 6v10h6V6" stroke="currentColor" fill="none" stroke-width="1.8" stroke-linecap="round"/></svg>
        </button>
      </div>
      <button class="btn btn-ghost btn-sm" style="width:100%;font-size:.72rem;margin-bottom:1rem;color:var(--muted)" onclick="resetSeatOffsets('${table.id}')">
        <svg viewBox="0 0 20 20" style="width:11px;height:11px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round"><path d="M4 4v5h5M16 16v-5h-5M4.09 9A8 8 0 1116 15.91"/></svg>
        Réinitialiser positions des sièges
      </button>

      <!-- Guests list -->
      <div style="font-size:.72rem;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:.5rem">Invités (${tableGuests.length})</div>

      ${tableGuests.length === 0 ? `
        <div style="font-size:.8rem;color:var(--muted);font-style:italic;text-align:center;padding:.8rem 0">Aucun invité assigné</div>
      ` : tableGuests.map(g => `
        <div style="display:flex;align-items:center;gap:.5rem;padding:.45rem 0;border-bottom:1px solid var(--border)">
          <div style="width:26px;height:26px;border-radius:50%;background:${roleColor(g.role)};display:flex;align-items:center;justify-content:center;font-size:.58rem;font-weight:600;color:white;flex-shrink:0">${initials(g.firstname + ' ' + g.lastname)}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:.82rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${g.firstname} ${g.lastname}</div>
            <div style="font-size:.68rem;color:var(--muted)">${roleLabels[g.role] || g.role}${g.diet !== 'standard' ? ` · ${dietLabels[g.diet] || ''} ${g.diet}` : ''}</div>
          </div>
          ${g.rsvp === 'confirmé' ? '<span style="color:#3A7D44;font-size:.75rem">✓</span>' : g.rsvp === 'décliné' ? '<span style="color:#C0392B;font-size:.75rem">✗</span>' : '<span style="color:var(--muted);font-size:.75rem">⏳</span>'}
        </div>
      `).join('')}

      ${empty > 0 ? `
        <div style="margin-top:.6rem">
          ${Array.from({length: empty}).map(() => `
            <div style="display:flex;align-items:center;gap:.5rem;padding:.35rem 0;border-bottom:1px solid var(--border)">
              <div style="width:26px;height:26px;border-radius:50%;border:1.5px dashed var(--border-hover);flex-shrink:0"></div>
              <div style="font-size:.78rem;color:var(--muted);font-style:italic">Place libre</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Dietary summary -->
      ${tableGuests.some(g => g.diet !== 'standard') ? `
        <div style="margin-top:1rem;padding:.6rem .8rem;background:var(--ivory-2);border-radius:var(--radius);font-size:.75rem">
          <div style="font-weight:500;margin-bottom:.3rem;color:var(--charcoal-2)">Régimes alimentaires</div>
          ${Object.entries(tableGuests.filter(g => g.diet !== 'standard').reduce((acc, g) => { acc[g.diet] = (acc[g.diet] || 0) + 1; return acc; }, {})).map(([diet, count]) => `
            <div style="color:var(--charcoal-2)">${dietLabels[diet] || ''} ${diet} × ${count}</div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function seatingZoomIn() {
  seatingZoom = Math.min(1.5, seatingZoom + 0.1);
  const canvas = document.getElementById('seating-canvas');
  if (canvas) canvas.style.transform = `scale(${seatingZoom})`;
}

function seatingZoomOut() {
  seatingZoom = Math.max(0.4, seatingZoom - 0.1);
  const canvas = document.getElementById('seating-canvas');
  if (canvas) canvas.style.transform = `scale(${seatingZoom})`;
}

function seatingToggleSnap() {
  seatingSnap = !seatingSnap;
  const btn = document.getElementById('btn-snap');
  if (btn) {
    btn.style.background = seatingSnap ? 'var(--ivory-2)' : '';
    btn.style.borderColor = seatingSnap ? 'var(--border-hover)' : '';
    btn.style.fontWeight = seatingSnap ? '500' : '';
  }
  const canvas = document.getElementById('seating-canvas');
  if (!canvas) return;
  // rebuild grid
  const existing = canvas.querySelector('.snap-grid');
  if (existing) existing.remove();
  if (seatingSnap) {
    const grid = document.createElement('div');
    grid.className = 'snap-grid';
    grid.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:0';
    grid.innerHTML = buildSnapGrid();
    canvas.insertBefore(grid, canvas.firstChild);
  }
}

function resetSeatOffsets(tableId) {
  const table = state.tables.find(t => t.id === tableId);
  if (!table) return;
  for (let i = 0; i < table.capacity; i++) {
    delete state.seatOffsets[tableId + ':' + i];
  }
  save();
  refreshSeatingCanvas();
  renderSeatingPanel(tableId);
  toast('Sièges repositionnés à leur place par défaut.');
}

function initSeatingDrag() {
  // ── Table drag ──────────────────────────────
  document.querySelectorAll('.seating-node').forEach(node => {
    const tableId = node.dataset.tableId;
    let dragging = false, startX, startY, origX, origY, moved = false;

    node.addEventListener('mousedown', e => {
      if (e.target.closest('button') || e.target.closest('.draggable-seat')) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
      origX = parseInt(node.style.left) || 0;
      origY = parseInt(node.style.top) || 0;
      node.style.cursor = 'grabbing';
      node.style.zIndex = 50;
      e.preventDefault();
    });

    const onMove = e => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
      let newX = Math.max(0, origX + dx / seatingZoom);
      let newY = Math.max(0, origY + dy / seatingZoom);
      if (seatingSnap) { newX = Math.round(newX / 40) * 40; newY = Math.round(newY / 40) * 40; }
      node.style.left = newX + 'px';
      node.style.top = newY + 'px';
    };

    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      node.style.cursor = 'grab';
      node.style.zIndex = seatingSelectedId === tableId ? 20 : 2;
      if (moved) {
        state.tablePositions[tableId] = { x: parseInt(node.style.left), y: parseInt(node.style.top) };
        save();
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  // ── Seat drag ───────────────────────────────
  document.querySelectorAll('.draggable-seat').forEach(seat => {
    const tableId = seat.dataset.tableId;
    const seatIdx = parseInt(seat.dataset.seatIdx);
    const key = tableId + ':' + seatIdx;
    let dragging = false, startX, startY, origDx, origDy;

    seat.addEventListener('mousedown', e => {
      e.stopPropagation(); // prevent table drag
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const cur = state.seatOffsets[key] || { dx: 0, dy: 0 };
      origDx = cur.dx;
      origDy = cur.dy;
      seat.style.cursor = 'grabbing';
      seat.style.zIndex = 60;
      e.preventDefault();
    });

    const onMove = e => {
      if (!dragging) return;
      const rawDx = (e.clientX - startX) / seatingZoom;
      const rawDy = (e.clientY - startY) / seatingZoom;
      const newDx = origDx + rawDx;
      const newDy = origDy + rawDy;

      // Apply offset to seat visually
      const table = state.tables.find(t => t.id === tableId);
      if (!table) return;
      const isRound = table.shape === 'ronde';
      const isLong = table.shape === 'longue';
      const tableW = isLong ? 240 : isRound ? 130 : 170;
      const tableH = isLong ? 75 : isRound ? 130 : 105;
      const pad = 32;
      const def = defaultSeatPos(seatIdx, table.capacity, tableW, tableH, isRound, isLong, pad);
      seat.style.left = (def.sx + newDx) + 'px';
      seat.style.top = (def.sy + newDy) + 'px';

      // Update anchor line
      updateAnchorLine(seat, def, newDx, newDy);
    };

    const onUp = e => {
      if (!dragging) return;
      dragging = false;
      seat.style.cursor = 'grab';
      seat.style.zIndex = 4;
      const rawDx = (e.clientX - startX) / seatingZoom;
      const rawDy = (e.clientY - startY) / seatingZoom;
      state.seatOffsets[key] = { dx: origDx + rawDx, dy: origDy + rawDy };
      save();
    };

    // Double-click to reset seat to default position
    seat.addEventListener('dblclick', e => {
      e.stopPropagation();
      delete state.seatOffsets[key];
      save();
      refreshSeatingCanvas();
      if (seatingSelectedId) renderSeatingPanel(seatingSelectedId);
    });

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

function updateAnchorLine(seat, def, newDx, newDy) {
  // Find or create anchor line preceding the seat
  const seatSize = 26;
  const defX = def.sx + seatSize / 2;
  const defY = def.sy + seatSize / 2;
  const curX = def.sx + newDx + seatSize / 2;
  const curY = def.sy + newDy + seatSize / 2;
  const len = Math.hypot(curX - defX, curY - defY);
  const angle = Math.atan2(curY - defY, curX - defX) * 180 / Math.PI;

  let line = seat.previousElementSibling;
  if (!line || !line.style.transformOrigin) {
    line = document.createElement('div');
    line.style.cssText = 'position:absolute;height:1px;background:rgba(193,155,94,.4);transform-origin:0 50%;pointer-events:none;z-index:1';
    seat.parentNode.insertBefore(line, seat);
  }
  if (len < 2) {
    line.style.display = 'none';
  } else {
    line.style.display = '';
    line.style.left = defX + 'px';
    line.style.top = defY + 'px';
    line.style.width = len + 'px';
    line.style.transform = 'rotate(' + angle + 'deg)';
  }
}

function buildSeatingListView() {
  return `<div class="page-body" style="padding-top:1.5rem">
    <div class="seating-grid">
      ${state.tables.map(table => {
        const tableGuests = state.guests.filter(g => table.guests.includes(g.id));
        const empty = table.capacity - tableGuests.length;
        const shapeIcons = { ronde: '⬤', rectangulaire: '▬', longue: '━' };
        return `
          <div class="table-card-seating">
            <div class="table-card-header">
              <div>
                <div class="table-card-name">${table.name}</div>
                <div class="table-card-meta">${shapeIcons[table.shape] || ''} ${table.shape} · ${tableGuests.length}/${table.capacity} places</div>
              </div>
              <div style="display:flex;gap:.3rem">
                <button class="btn btn-sm btn-icon" style="color:var(--gold-light);border-color:rgba(255,255,255,.2)" onclick="openTableModal('${table.id}')">
                  <svg viewBox="0 0 20 20" style="width:13px;height:13px"><path d="M13.5 2.5L17.5 6.5L7 17H3v-4L13.5 2.5z" stroke-width="1.5"/></svg>
                </button>
                <button class="btn btn-sm btn-icon" style="color:#E8A0A0;border-color:rgba(255,255,255,.2)" onclick="deleteTable('${table.id}')">
                  <svg viewBox="0 0 20 20" style="width:13px;height:13px"><path d="M4 6h12M8 6V4h4v2M7 6v10h6V6" stroke-width="1.5"/></svg>
                </button>
              </div>
            </div>
            <div class="table-guests">
              ${tableGuests.map(g => `
                <div class="table-guest-item">
                  <div class="avatar ${avatarColor(g.role)}" style="width:24px;height:24px;font-size:.65rem">${initials(g.firstname + ' ' + g.lastname)}</div>
                  <span>${g.firstname} ${g.lastname}</span>
                  ${g.diet !== 'standard' ? `<span style="font-size:.68rem;color:var(--muted)">(${g.diet})</span>` : ''}
                </div>
              `).join('')}
              ${Array.from({length: empty}).map(() => `<div class="table-empty-seats">— place libre</div>`).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  </div>`;
}


function openTableModal(id = null) {
  state.editingTableId = id;
  document.getElementById('table-modal-title').textContent = id ? 'Modifier la table' : 'Nouvelle table';

  if (id) {
    const t = state.tables.find(x => x.id === id);
    document.getElementById('table-name').value = t.name;
    document.getElementById('table-capacity').value = t.capacity;
    document.getElementById('table-shape').value = t.shape;
  } else {
    document.getElementById('table-name').value = '';
    document.getElementById('table-capacity').value = 8;
    document.getElementById('table-shape').value = 'ronde';
  }

  const currentTableGuests = id ? state.tables.find(t => t.id === id)?.guests || [] : [];
  const list = document.getElementById('guest-assign-list');
  list.innerHTML = state.guests.map(g => {
    const otherTable = state.tables.find(t => t.id !== id && t.guests.includes(g.id));
    const isSelected = currentTableGuests.includes(g.id);
    return `
      <div class="guest-assign-item ${isSelected ? 'selected' : ''} ${otherTable ? 'assigned-other' : ''}"
           onclick="toggleGuestAssign('${g.id}', this)"
           data-guest-id="${g.id}">
        <div class="avatar ${avatarColor(g.role)}" style="width:22px;height:22px;font-size:.62rem">${initials(g.firstname + ' ' + g.lastname)}</div>
        <span>${g.firstname} ${g.lastname}</span>
        ${otherTable ? `<span style="font-size:.68rem">(${otherTable.name})</span>` : ''}
      </div>
    `;
  }).join('') || '<p style="font-size:.8rem;color:var(--muted);padding:.5rem">Aucun invité enregistré.</p>';

  openModal('table-modal');
}

function toggleGuestAssign(guestId, el) {
  el.classList.toggle('selected');
}

function saveTable() {
  const name = document.getElementById('table-name').value.trim();
  if (!name) { toast('Veuillez nommer la table.'); return; }
  const capacity = parseInt(document.getElementById('table-capacity').value) || 8;
  const shape = document.getElementById('table-shape').value;
  const selected = [...document.querySelectorAll('.guest-assign-item.selected')].map(el => el.dataset.guestId);

  if (selected.length > capacity) {
    toast(`Trop d'invités pour cette table (max ${capacity}).`); return;
  }

  // Remove selected guests from other tables
  state.tables.forEach(t => {
    if (t.id !== state.editingTableId) {
      t.guests = t.guests.filter(gid => !selected.includes(gid));
    }
  });

  const table = {
    id: state.editingTableId || uid(),
    name, capacity, shape,
    guests: selected,
  };

  if (state.editingTableId) {
    const idx = state.tables.findIndex(t => t.id === state.editingTableId);
    state.tables[idx] = table;
  } else {
    state.tables.push(table);
  }

  // Reset seat offsets when table is modified (seats may have moved)
  if (state.editingTableId) {
    const oldTable = state.tables.find(t => t.id === state.editingTableId);
    if (oldTable) {
      for (let i = 0; i < Math.max(oldTable.capacity, capacity); i++) {
        delete state.seatOffsets[(state.editingTableId || table.id) + ':' + i];
      }
    }
  }
  save();
  closeModal('table-modal');
  toast(state.editingTableId ? 'Table mise à jour !' : 'Table créée !');
  renderSeating();
}

function deleteTable(id) {
  if (!confirm('Supprimer cette table ?')) return;
  const table = state.tables.find(t => t.id === id);
  if (table) {
    for (let i = 0; i < table.capacity; i++) delete state.seatOffsets[id + ':' + i];
  }
  state.tables = state.tables.filter(t => t.id !== id);
  if (seatingSelectedId === id) {
    seatingSelectedId = null;
    const panel = document.getElementById('seating-panel-content');
    if (panel) panel.innerHTML = '<div style="text-align:center;padding:2rem 1rem;color:var(--muted)"><div style="font-size:1.8rem;margin-bottom:.5rem;opacity:.3">🪑</div><div style="font-family:var(--font-display);font-size:1rem;font-weight:400;color:var(--charcoal-2);margin-bottom:.3rem">Sélectionner une table</div></div>';
  }
  save();
  renderSeating();
  toast('Table supprimée.');
}

// ─── MENU ─────────────────────────────────────
function renderMenu() {
  const pg = document.getElementById('page-menu');
  pg.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Menu du mariage</div>
        <div class="page-subtitle">Composez le festin de votre grand jour</div>
      </div>
    </div>
    <div class="page-body">
      <div class="ornament" style="margin-bottom:1.5rem">✦ ── ✦ ── ✦</div>
      ${state.menuSections.map(section => `
        <div class="menu-section">
          <div class="menu-section-header">
            <div>
              <div class="menu-section-title">${section.name}</div>
              <div class="menu-section-subtitle">${section.items.length} plat${section.items.length > 1 ? 's' : ''}</div>
            </div>
          </div>
          <div class="menu-items-list">
            ${section.items.length === 0 ? `
              <div style="padding:.8rem 1.5rem;color:var(--muted);font-size:.82rem;font-style:italic">Aucun élément · ajoutez des plats ci-dessous</div>
            ` : section.items.map((item, i) => `
              <div class="menu-item">
                <div>
                  <div class="menu-item-name">${item.name}</div>
                  ${item.desc ? `<div class="menu-item-desc">${item.desc}</div>` : ''}
                </div>
                <div class="menu-item-actions">
                  ${item.vege ? `<span class="badge badge-sage" style="margin-right:.3rem">Végé</span>` : ''}
                  ${item.halal ? `<span class="badge badge-gold" style="margin-right:.3rem">Halal</span>` : ''}
                  <button class="btn btn-sm btn-icon" onclick="deleteMenuItem('${section.id}', ${i})" style="color:#C0392B">
                    <svg viewBox="0 0 20 20" style="width:12px;height:12px"><path d="M4 6h12M8 6V4h4v2M7 6v10h6V6"/></svg>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="menu-add-form">
            <input type="text" id="menu-name-${section.id}" placeholder="Nom du plat...">
            <input type="text" id="menu-desc-${section.id}" placeholder="Description (optionnel)">
            <label style="display:flex;align-items:center;gap:.3rem;font-size:.78rem;cursor:pointer;white-space:nowrap">
              <input type="checkbox" id="menu-vege-${section.id}"> Végé
            </label>
            <label style="display:flex;align-items:center;gap:.3rem;font-size:.78rem;cursor:pointer;white-space:nowrap">
              <input type="checkbox" id="menu-halal-${section.id}"> Halal
            </label>
            <button class="btn btn-primary btn-sm" onclick="addMenuItem('${section.id}')">Ajouter</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function addMenuItem(sectionId) {
  const name = document.getElementById(`menu-name-${sectionId}`).value.trim();
  if (!name) return;
  const desc = document.getElementById(`menu-desc-${sectionId}`).value.trim();
  const vege = document.getElementById(`menu-vege-${sectionId}`).checked;
  const halal = document.getElementById(`menu-halal-${sectionId}`).checked;
  const section = state.menuSections.find(s => s.id === sectionId);
  section.items.push({ name, desc, vege, halal });
  save();
  renderMenu();
  toast(`${name} ajouté !`);
}

function deleteMenuItem(sectionId, idx) {
  const section = state.menuSections.find(s => s.id === sectionId);
  section.items.splice(idx, 1);
  save();
  renderMenu();
}

// ─── BUDGET ────────────────────────────────────
function renderBudget() {
  const pg = document.getElementById('page-budget');
  const total = state.budget.reduce((s, b) => s + (b.planned || 0), 0);
  const paid = state.budget.reduce((s, b) => s + (b.paid || 0), 0);
  const remaining = total - paid;

  const byCategory = {};
  state.budget.forEach(b => {
    if (!byCategory[b.category]) byCategory[b.category] = { planned: 0, paid: 0 };
    byCategory[b.category].planned += b.planned || 0;
    byCategory[b.category].paid += b.paid || 0;
  });

  const categoryColors = {
    salle: '#6B2D3E', traiteur: '#C19B5E', musique: '#7A8C6E', photo: '#4A7C9F',
    fleurs: '#9B7DB8', tenues: '#E27D5F', alliances: '#C19B5E', transport: '#8A7D74',
    invitations: '#5A8A7A', 'lune-de-miel': '#D4607A', autre: '#888',
  };

  const categoryLabels = {
    salle: 'Salle & lieu', traiteur: 'Traiteur', musique: 'Musique & DJ', photo: 'Photo & vidéo',
    fleurs: 'Décoration', tenues: 'Tenues', alliances: 'Alliances', transport: 'Transport',
    invitations: 'Papeterie', 'lune-de-miel': 'Lune de miel', autre: 'Autre',
  };

  pg.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Budget</div>
        <div class="page-subtitle">Suivi des dépenses du mariage</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="openBudgetModal()">
          <svg viewBox="0 0 20 20"><path d="M10 4v12M4 10h12"/></svg>
          Ajouter une dépense
        </button>
      </div>
    </div>
    <div class="page-body">
      <div class="stat-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:2rem">
        <div class="stat-card">
          <div class="stat-label">Budget total prévu</div>
          <div class="stat-value" style="font-size:1.6rem">${total.toLocaleString('fr-FR')} €</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Montant payé</div>
          <div class="stat-value" style="font-size:1.6rem;color:var(--sage)">${paid.toLocaleString('fr-FR')} €</div>
          <div class="progress-bar" style="margin-top:.5rem"><div class="progress-fill" style="width:${total > 0 ? Math.round(paid/total*100) : 0}%"></div></div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Reste à payer</div>
          <div class="stat-value" style="font-size:1.6rem;color:var(--wine)">${remaining.toLocaleString('fr-FR')} €</div>
        </div>
      </div>

      ${Object.keys(byCategory).length > 0 ? `
        <div style="margin-bottom:1.5rem">
          <div class="section-title">Par catégorie</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.7rem">
            ${Object.entries(byCategory).map(([cat, data]) => `
              <div class="stat-card" style="padding:.9rem 1.1rem">
                <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.5rem">
                  <div style="width:10px;height:10px;border-radius:2px;background:${categoryColors[cat] || '#888'};flex-shrink:0"></div>
                  <div class="stat-label" style="margin:0">${categoryLabels[cat] || cat}</div>
                </div>
                <div style="font-size:1.1rem;font-family:var(--font-display);font-weight:400">${data.planned.toLocaleString('fr-FR')} €</div>
                <div class="progress-bar" style="margin-top:.4rem"><div class="progress-fill" style="width:${data.planned > 0 ? Math.round(data.paid/data.planned*100) : 0}%;background:${categoryColors[cat] || '#888'}"></div></div>
                <div style="font-size:.72rem;color:var(--muted);margin-top:.3rem">${data.paid.toLocaleString('fr-FR')} € payés</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div class="section-title">Dépenses détaillées</div>
      ${state.budget.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">💰</div>
          <h4>Aucune dépense enregistrée</h4>
          <p>Ajoutez vos premières lignes budgétaires.</p>
        </div>
      ` : `
        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th>Catégorie</th>
                <th>Description</th>
                <th>Prévu</th>
                <th>Payé</th>
                <th>Reste</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${state.budget.map((b, i) => {
                const rest = (b.planned || 0) - (b.paid || 0);
                const statusMap = { prévu: ['Prévu', 'badge-gray'], déposé: ['Acompte', 'badge-gold'], payé: ['Payé ✓', 'badge-green'] };
                const [statusLabel, statusCls] = statusMap[b.status] || ['?', 'badge-gray'];
                return `
                  <tr>
                    <td>
                      <div style="display:flex;align-items:center;gap:.5rem">
                        <div style="width:8px;height:8px;border-radius:2px;background:${categoryColors[b.category] || '#888'};flex-shrink:0"></div>
                        <span style="font-size:.8rem">${categoryLabels[b.category] || b.category}</span>
                      </div>
                    </td>
                    <td style="font-weight:400">${b.desc}</td>
                    <td style="font-weight:500">${(b.planned || 0).toLocaleString('fr-FR')} €</td>
                    <td style="color:var(--sage)">${(b.paid || 0).toLocaleString('fr-FR')} €</td>
                    <td style="color:${rest > 0 ? 'var(--wine)' : 'var(--sage)'}">${rest.toLocaleString('fr-FR')} €</td>
                    <td><span class="badge ${statusCls}">${statusLabel}</span></td>
                    <td>
                      <button class="btn btn-sm btn-icon" onclick="deleteBudget(${i})" style="color:#C0392B">
                        <svg viewBox="0 0 20 20" style="width:12px;height:12px"><path d="M4 6h12M8 6V4h4v2M7 6v10h6V6"/></svg>
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

function openBudgetModal() { openModal('budget-modal'); }

function saveBudget() {
  const desc = document.getElementById('budget-desc').value.trim();
  if (!desc) { toast('Veuillez décrire la dépense.'); return; }
  state.budget.push({
    category: document.getElementById('budget-category').value,
    desc,
    planned: parseFloat(document.getElementById('budget-planned').value) || 0,
    paid: parseFloat(document.getElementById('budget-paid').value) || 0,
    status: document.getElementById('budget-status').value,
  });
  save();
  closeModal('budget-modal');
  document.getElementById('budget-desc').value = '';
  document.getElementById('budget-planned').value = '';
  document.getElementById('budget-paid').value = '';
  toast('Dépense ajoutée !');
  renderBudget();
}

function deleteBudget(idx) {
  if (!confirm('Supprimer cette ligne ?')) return;
  state.budget.splice(idx, 1);
  save();
  renderBudget();
}

// ─── CHECKLIST ─────────────────────────────────
const DEFAULT_TASKS = [
  { id: uid(), name: 'Réserver la salle de réception', category: 'lieu', due: '2025-09-01', priority: 'haute', done: false },
  { id: uid(), name: 'Choisir le traiteur', category: 'prestataires', due: '2025-10-01', priority: 'haute', done: false },
  { id: uid(), name: 'Envoyer les faire-part', category: 'invitations', due: '2026-01-01', priority: 'haute', done: false },
  { id: uid(), name: 'Choisir la robe / le costume', category: 'tenues', due: '2026-02-01', priority: 'haute', done: false },
  { id: uid(), name: 'Réserver le photographe', category: 'prestataires', due: '2025-10-15', priority: 'haute', done: false },
  { id: uid(), name: 'Réserver le DJ / groupe musical', category: 'prestataires', due: '2025-11-01', priority: 'haute', done: false },
  { id: uid(), name: 'Rendez-vous à la mairie', category: 'administratif', due: '2026-01-15', priority: 'haute', done: false },
  { id: uid(), name: 'Commander les alliances', category: 'tenues', due: '2026-02-01', priority: 'moyenne', done: false },
  { id: uid(), name: 'Organiser la lune de miel', category: 'voyage', due: '2026-03-01', priority: 'moyenne', done: false },
  { id: uid(), name: 'Préparer le plan de table', category: 'autre', due: '2026-05-01', priority: 'moyenne', done: false },
  { id: uid(), name: 'Confirmer le menu avec le traiteur', category: 'prestataires', due: '2026-05-15', priority: 'haute', done: false },
  { id: uid(), name: 'Choisir les fleurs et la décoration', category: 'décoration', due: '2026-03-01', priority: 'moyenne', done: false },
];

function renderChecklist() {
  const pg = document.getElementById('page-checklist');
  const tasks = state.tasks.length > 0 ? state.tasks : DEFAULT_TASKS;
  if (state.tasks.length === 0) state.tasks = tasks;

  const filtered = state.taskFilter === 'tous' ? tasks :
    state.taskFilter === 'fait' ? tasks.filter(t => t.done) :
    state.taskFilter === 'àfaire' ? tasks.filter(t => !t.done) :
    tasks.filter(t => t.priority === state.taskFilter);

  const byCategory = {};
  filtered.forEach(t => {
    if (!byCategory[t.category]) byCategory[t.category] = [];
    byCategory[t.category].push(t);
  });

  const done = tasks.filter(t => t.done).length;
  const total = tasks.length;

  pg.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Checklist</div>
        <div class="page-subtitle">${done}/${total} tâches complétées</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="openModal('task-modal')">
          <svg viewBox="0 0 20 20"><path d="M10 4v12M4 10h12"/></svg>
          Ajouter une tâche
        </button>
      </div>
    </div>

    <div style="padding:.7rem 2.5rem;border-bottom:1px solid var(--border)">
      <div class="progress-bar" style="height:8px"><div class="progress-fill" style="width:${total > 0 ? Math.round(done/total*100) : 0}%"></div></div>
      <div style="font-size:.72rem;color:var(--muted);margin-top:.4rem">${total > 0 ? Math.round(done/total*100) : 0}% complété</div>
    </div>

    <div class="filters">
      ${['tous','àfaire','fait','haute','moyenne','basse'].map(f => `
        <button class="filter-btn ${state.taskFilter === f ? 'active' : ''}" onclick="setTaskFilter('${f}')">
          ${f === 'tous' ? 'Tout' : f === 'àfaire' ? 'À faire' : f === 'fait' ? 'Faits' : f === 'haute' ? '● Urgent' : f === 'moyenne' ? '● Normal' : '● Basse priorité'}
        </button>
      `).join('')}
    </div>

    <div class="page-body">
      ${Object.keys(byCategory).length === 0 ? `<div class="empty-state"><h4>Aucune tâche</h4></div>` :
        Object.entries(byCategory).map(([cat, catTasks]) => `
          <div class="checklist-section">
            <div class="checklist-section-title">${cat.charAt(0).toUpperCase() + cat.slice(1)}</div>
            ${catTasks.map(task => `
              <div class="task-item ${task.done ? 'done' : ''}">
                <div class="task-checkbox ${task.done ? 'checked' : ''}" onclick="toggleTask('${task.id}')"></div>
                <div class="task-content">
                  <div class="task-name">${task.name}</div>
                  <div class="task-meta">
                    <span class="task-priority-dot priority-${task.priority}"></span>
                    Priorité ${task.priority}
                    ${task.due ? ` · Avant le ${formatDate(task.due)}` : ''}
                  </div>
                </div>
                <div class="task-actions">
                  <button class="btn btn-sm btn-icon" onclick="deleteTask('${task.id}')" style="color:#C0392B">
                    <svg viewBox="0 0 20 20" style="width:12px;height:12px"><path d="M4 6h12M8 6V4h4v2M7 6v10h6V6"/></svg>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `).join('')}
    </div>
  `;
}

function setTaskFilter(f) {
  state.taskFilter = f;
  renderChecklist();
}

function toggleTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (task) task.done = !task.done;
  save();
  renderChecklist();
}

function saveTask() {
  const name = document.getElementById('task-name').value.trim();
  if (!name) { toast('Veuillez saisir une tâche.'); return; }
  state.tasks.push({
    id: uid(),
    name,
    category: document.getElementById('task-category').value,
    due: document.getElementById('task-due').value,
    priority: document.getElementById('task-priority').value,
    done: false,
  });
  save();
  closeModal('task-modal');
  document.getElementById('task-name').value = '';
  document.getElementById('task-due').value = '';
  toast('Tâche ajoutée !');
  renderChecklist();
}

function deleteTask(id) {
  state.tasks = state.tasks.filter(t => t.id !== id);
  save();
  renderChecklist();
}

// ─── PLANNING ──────────────────────────────────
function renderPlanning() {
  const pg = document.getElementById('page-planning');
  const sorted = [...state.events].sort((a, b) => {
    const da = new Date((a.date || '2026-06-26') + 'T' + (a.time || '00:00'));
    const db = new Date((b.date || '2026-06-26') + 'T' + (b.time || '00:00'));
    return da - db;
  });

  pg.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Planning</div>
        <div class="page-subtitle">Programme des festivités</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="openModal('event-modal')">
          <svg viewBox="0 0 20 20"><path d="M10 4v12M4 10h12"/></svg>
          Ajouter un événement
        </button>
      </div>
    </div>

    <div class="page-body">
      <div style="margin-bottom:1.5rem;background:white;border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.5rem;box-shadow:var(--shadow)">
        <div style="font-family:var(--font-display);font-size:1.3rem;font-weight:400;margin-bottom:1rem">Vendredi 26 juin 2026</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.7rem">
          ${sorted.filter(e => e.date === '2026-06-26').map(e => `
            <div style="background:var(--charcoal);color:white;border-radius:var(--radius);padding:.9rem 1.1rem">
              <div style="font-size:.75rem;color:var(--gold-light);letter-spacing:.08em;margin-bottom:.3rem">${e.time || '—'}</div>
              <div style="font-size:.9rem;font-weight:400">${e.name}</div>
              ${e.location ? `<div style="font-size:.75rem;color:rgba(255,255,255,.5);margin-top:.2rem">${e.location}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <div class="section-title">Tous les événements</div>
      ${sorted.length === 0 ? `
        <div class="empty-state"><h4>Aucun événement</h4></div>
      ` : `
        <div class="timeline">
          ${sorted.map(ev => {
            const d = new Date((ev.date || '2026-06-26') + 'T00:00:00');
            const now = new Date();
            const isPast = d < now;
            return `
              <div class="timeline-item">
                <div class="timeline-dot ${isPast ? 'past' : ''}"></div>
                <div class="timeline-card">
                  <div class="timeline-date">${formatDate(ev.date || '2026-06-26')} ${ev.time ? '· ' + ev.time : ''}</div>
                  <div class="timeline-title">${ev.name}</div>
                  ${ev.location ? `<div class="timeline-location">${ev.location}</div>` : ''}
                  ${ev.notes ? `<div style="font-size:.8rem;color:var(--muted);margin-top:.4rem">${ev.notes}</div>` : ''}
                  <button class="btn btn-sm btn-icon" onclick="deleteEvent('${ev.id}')" style="position:absolute;top:.7rem;right:.7rem;color:#C0392B">
                    <svg viewBox="0 0 20 20" style="width:12px;height:12px"><path d="M4 6h12M8 6V4h4v2M7 6v10h6V6"/></svg>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
  // Fix absolute positions in timeline cards
  document.querySelectorAll('.timeline-card').forEach(c => c.style.position = 'relative');
}

function saveEvent() {
  const name = document.getElementById('event-name').value.trim();
  if (!name) { toast('Veuillez nommer l\'événement.'); return; }
  state.events.push({
    id: uid(),
    name,
    date: document.getElementById('event-date').value,
    time: document.getElementById('event-time').value,
    location: document.getElementById('event-location').value.trim(),
    notes: document.getElementById('event-notes').value.trim(),
  });
  save();
  closeModal('event-modal');
  document.getElementById('event-name').value = '';
  document.getElementById('event-date').value = '';
  document.getElementById('event-time').value = '';
  document.getElementById('event-location').value = '';
  document.getElementById('event-notes').value = '';
  toast('Événement ajouté !');
  renderPlanning();
}

function deleteEvent(id) {
  if (!confirm('Supprimer cet événement ?')) return;
  state.events = state.events.filter(e => e.id !== id);
  save();
  renderPlanning();
}

// ─── EXPORT PDF ────────────────────────────────
function exportPDF() {
  const win = window.open('', '_blank');
  const guestRows = state.guests.map(g => {
    const table = state.tables.find(t => t.guests.includes(g.id));
    const roleLabels = {
      'invité': 'Invité', 'témoin-marié': 'Témoin ♂', 'témoin-mariée': 'Témoin ♀',
      'demoiselle-honneur': "Dem. d'honneur", 'garçon-honneur': "Garçon d'honneur",
      'famille-marié': 'Famille Adil', 'famille-mariée': 'Famille Nadiya', 'enfant': 'Enfant',
    };
    const rsvpLabel = { 'confirmé': '✓ Confirmé', 'décliné': '✗ Décliné', 'en-attente': '⏳ En attente' };
    return `<tr>
      <td>${g.firstname} ${g.lastname}</td>
      <td>${roleLabels[g.role] || g.role}</td>
      <td>${g.side === 'adil' ? 'Adil' : g.side === 'nadiya' ? 'Nadiya' : 'Commun'}</td>
      <td>${rsvpLabel[g.rsvp] || g.rsvp}</td>
      <td>${g.diet !== 'standard' ? g.diet : '—'}</td>
      <td>${table ? table.name : '—'}</td>
    </tr>`;
  }).join('');

  const tableRows = state.tables.map(table => {
    const guests = state.guests.filter(g => table.guests.includes(g.id));
    return `
      <div class="table-block">
        <div class="table-header">${table.name} <span class="table-meta">${table.shape} · ${guests.length}/${table.capacity} places</span></div>
        ${guests.length > 0 ? `<ul>${guests.map(g => `<li>${g.firstname} ${g.lastname}${g.diet !== 'standard' ? ` <em>(${g.diet})</em>` : ''}</li>`).join('')}</ul>` : '<p class="empty">Aucun invité assigné</p>'}
      </div>
    `;
  }).join('');

  const menuHTML = state.menuSections.map(s => {
    if (s.items.length === 0) return '';
    return `
      <div class="menu-block">
        <div class="menu-header">${s.name}</div>
        <ul>${s.items.map(item => `<li><strong>${item.name}</strong>${item.desc ? ` — ${item.desc}` : ''}${item.vege ? ' <span class="tag">Végé</span>' : ''}${item.halal ? ' <span class="tag halal">Halal</span>' : ''}</li>`).join('')}</ul>
      </div>
    `;
  }).join('');

  win.document.write(`<!DOCTYPE html><html lang="fr"><head>
  <meta charset="UTF-8">
  <title>Adil & Nadiya — 26 juin 2026</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Jost', sans-serif; color: #2C2520; background: white; font-size: 11pt; line-height: 1.5; }
    .page { padding: 2cm 2.5cm; max-width: 21cm; margin: 0 auto; }
    h1 { font-family: 'Cormorant Garamond', serif; font-size: 28pt; font-weight: 300; text-align: center; color: #2C2520; margin-bottom: .3cm; }
    .subtitle { text-align: center; font-size: 9pt; letter-spacing: .2em; text-transform: uppercase; color: #8A7D74; margin-bottom: 1cm; }
    .ornament { text-align: center; color: #C19B5E; font-size: 14pt; margin: .6cm 0; letter-spacing: .3em; }
    h2 { font-family: 'Cormorant Garamond', serif; font-size: 18pt; font-weight: 400; color: #6B2D3E; margin: .8cm 0 .3cm; padding-bottom: .2cm; border-bottom: 1px solid #e8ddd0; }
    table { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-top: .3cm; }
    th { background: #2C2520; color: white; padding: .25cm .4cm; text-align: left; font-size: 8pt; letter-spacing: .08em; text-transform: uppercase; font-weight: 400; }
    td { padding: .2cm .4cm; border-bottom: 1px solid #e8ddd0; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tr:nth-child(even) td { background: #faf5ee; }
    .tables-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: .5cm; margin-top: .3cm; }
    .table-block { background: #faf5ee; border: 1px solid #e8ddd0; border-radius: 6px; padding: .4cm; break-inside: avoid; }
    .table-header { font-family: 'Cormorant Garamond', serif; font-size: 13pt; font-weight: 400; color: #2C2520; margin-bottom: .2cm; }
    .table-meta { font-size: 8pt; color: #C19B5E; font-family: 'Jost', sans-serif; }
    .table-block ul { list-style: none; padding: 0; }
    .table-block li { font-size: 9pt; padding: .08cm 0; border-bottom: 1px solid #e8ddd0; color: #4A3F38; }
    .table-block li:last-child { border-bottom: none; }
    .table-block em { color: #8A7D74; font-style: normal; }
    .empty { font-size: 9pt; color: #8A7D74; font-style: italic; }
    .menu-block { margin-bottom: .5cm; break-inside: avoid; }
    .menu-header { font-family: 'Cormorant Garamond', serif; font-size: 14pt; font-weight: 400; color: #6B2D3E; margin-bottom: .2cm; }
    .menu-block ul { list-style: none; padding: 0; }
    .menu-block li { padding: .15cm .3cm; border-bottom: 1px solid #e8ddd0; font-size: 9.5pt; }
    .menu-block li:last-child { border-bottom: none; }
    .tag { background: #edf2eb; color: #7A8C6E; font-size: 7.5pt; padding: .05cm .2cm; border-radius: 4px; margin-left: .2cm; }
    .tag.halal { background: #faf3e8; color: #C19B5E; }
    .page-break { page-break-before: always; padding-top: 1cm; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .no-print { display: none; }
    }
    .print-btn { display: block; margin: 1cm auto; padding: .3cm 1cm; background: #6B2D3E; color: white; border: none; border-radius: 6px; font-size: 11pt; cursor: pointer; font-family: 'Jost', sans-serif; }
  </style>
</head><body>
  <div class="page">
    <button class="print-btn no-print" onclick="window.print()">🖨️ Imprimer / Enregistrer en PDF</button>

    <h1>Adil <em style="color:#C19B5E;font-style:italic">&</em> Nadiya</h1>
    <div class="subtitle">26 · Juin · 2026 &nbsp;·&nbsp; Plan de mariage</div>
    <div class="ornament">✦ ── ✦ ── ✦</div>

    ${state.tables.length > 0 ? `
      <h2>Plan de table</h2>
      <div class="tables-grid">${tableRows}</div>
    ` : ''}

    <div class="page-break">
      <h2>Liste des invités</h2>
      ${state.guests.length === 0 ? '<p class="empty">Aucun invité enregistré.</p>' : `
        <table>
          <thead><tr><th>Nom</th><th>Rôle</th><th>Côté</th><th>RSVP</th><th>Régime</th><th>Table</th></tr></thead>
          <tbody>${guestRows}</tbody>
        </table>
      `}
    </div>

    ${menuHTML ? `
      <div class="page-break">
        <h2>Menu du mariage</h2>
        <div class="ornament" style="font-size:11pt;margin:.3cm 0">✦ ── ✦ ── ✦</div>
        ${menuHTML}
      </div>
    ` : ''}

    <div class="ornament" style="margin-top:1cm">✦ ── ✦ ── ✦</div>
    <div class="subtitle" style="margin-top:.3cm">Généré avec Wedding Planner · Adil & Nadiya 2026</div>
  </div>
</body></html>`);
  win.document.close();
}

// ─── INIT ─────────────────────────────────────
function init() {
  load();
  updateCountdown();
  setInterval(updateCountdown, 60000);

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      navigate(link.dataset.page);
    });
  });

  renderDashboard();
}

document.addEventListener('DOMContentLoaded', init);
