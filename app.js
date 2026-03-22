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
  }));
}

function load() {
  const raw = localStorage.getItem('adil-nadiya-wedding');
  if (!raw) return;
  const data = JSON.parse(raw);
  Object.assign(state, data);
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
function renderSeating() {
  const pg = document.getElementById('page-seating');
  const placedCount = state.tables.reduce((s, t) => s + t.guests.length, 0);
  const unplaced = state.guests.filter(g => !state.tables.some(t => t.guests.includes(g.id)));

  pg.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Plan de table</div>
        <div class="page-subtitle">${state.tables.length} table${state.tables.length > 1 ? 's' : ''} · ${placedCount} / ${state.guests.length} invités placés</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="openTableModal()">
          <svg viewBox="0 0 20 20"><path d="M10 4v12M4 10h12"/></svg>
          Nouvelle table
        </button>
      </div>
    </div>

    <div class="page-body">
      ${unplaced.length > 0 ? `
        <div style="background:var(--wine-pale);border:1px solid rgba(107,45,62,.15);border-radius:var(--radius);padding:.8rem 1.2rem;margin-bottom:1.5rem;font-size:.83rem;color:var(--wine)">
          <strong>${unplaced.length} invité${unplaced.length > 1 ? 's' : ''} non placé${unplaced.length > 1 ? 's' : ''} :</strong>
          ${unplaced.map(g => `${g.firstname} ${g.lastname}`).join(', ')}
        </div>
      ` : state.guests.length > 0 ? `
        <div style="background:#EAF4EA;border:1px solid #8FC98A;border-radius:var(--radius);padding:.8rem 1.2rem;margin-bottom:1.5rem;font-size:.83rem;color:#3A7D44">
          ✓ Tous les invités sont placés !
        </div>
      ` : ''}

      ${state.tables.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">🪑</div>
          <h4>Aucune table créée</h4>
          <p>Créez vos tables et assignez-y vos invités.</p>
        </div>
      ` : `
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
                    <button class="btn btn-sm btn-icon" style="color:var(--gold-light);border-color:rgba(255,255,255,.2)" onclick="openTableModal('${table.id}')" title="Modifier">
                      <svg viewBox="0 0 20 20" style="width:13px;height:13px"><path d="M13.5 2.5L17.5 6.5L7 17H3v-4L13.5 2.5z" stroke-width="1.5"/></svg>
                    </button>
                    <button class="btn btn-sm btn-icon" style="color:#E8A0A0;border-color:rgba(255,255,255,.2)" onclick="deleteTable('${table.id}')" title="Supprimer">
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
      `}
    </div>
  `;
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

  save();
  closeModal('table-modal');
  toast(state.editingTableId ? 'Table mise à jour !' : 'Table créée !');
  renderSeating();
}

function deleteTable(id) {
  if (!confirm('Supprimer cette table ?')) return;
  state.tables = state.tables.filter(t => t.id !== id);
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
