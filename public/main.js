/**
 * Frontend Main Logic
 * C Analojisi: Bu dosya bizim 'Main Loop' ve 'Event Handler' merkezimizdir.
 * 
 * switchView() -> SPA görünümünü değiştirir.
 * filterExpressions() -> Keşfet sayfasında kümülatif filtreleme yapar.
 */

const PREDEFINED_TAGS = ["Matematik", "Fizik", "Kimya", "Analiz", "Cebir", "Geometri", "İstatistik", "Mühendislik"];
let allPublicData = [];
let currentEditingId = null;

document.addEventListener('DOMContentLoaded', () => {
    initUI();
    switchView('discovery');
});

function initUI() {
    const tagSelector = document.getElementById('tag-selector');
    const filterTag = document.getElementById('filter-tag');

    PREDEFINED_TAGS.forEach(tag => {
        // Form için checkboxlar
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" name="tags" value="${tag}"> ${tag}`;
        tagSelector.appendChild(label);

        // Filtreleme için dropdown
        const opt = document.createElement('option');
        opt.value = tag;
        opt.textContent = tag;
        filterTag.appendChild(opt);
    });

    document.getElementById('latex-form').addEventListener('submit', handleFormSubmit);
}

window.switchView = (viewId) => {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(`view-${viewId}`).style.display = 'block';
    
    if (viewId === 'create') {
        if (!currentEditingId) {
            document.getElementById('latex-form').reset();
            document.querySelectorAll('input[name="tags"]').forEach(cb => cb.checked = false);
        }
    }
    if (viewId === 'discovery') { currentEditingId = null; loadDiscovery(); }
    if (viewId === 'my-projects') { currentEditingId = null; loadMyProjects(); }
};

async function loadDiscovery() {
    try {
        const res = await fetch('/api/expressions');
        allPublicData = await res.json();
        renderList(allPublicData, 'discovery-list');
    } catch (err) { console.error(err); }
}

async function loadMyProjects() {
    try {
        const res = await fetch('/api/expressions/my/all');
        const data = await res.json();
        renderList(data, 'my-list');
    } catch (err) { console.error(err); }
}

function renderList(data, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = data.length ? '' : '<p>Gösterilecek proje bulunamadı.</p>';
    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'expression-card';
        div.innerHTML = `
            <h3>${item.title} <small>(${item.visibility})</small></h3>
            <code>${item.latexCode}</code>
            <p>${item.description}</p>
            <div class="tags">${(item.tags || []).map(t => `<span class="tag-badge">${t}</span>`).join('')}</div>
            <div class="actions">
                <a href="/api/expressions/${item.latex_id}/pdf" target="_blank">PDF</a>` +
                // Sadece "Projelerim" sayfasında Düzenle ve Sil butonlarını göster
                (containerId === 'my-list' ? `
                    <button onclick="editItem('${item.latex_id}')">Düzenle</button>
                    <button onclick="deleteItem('${item.latex_id}')">Sil</button>
                ` : '') +
            `
            </div>
        `;
        container.appendChild(div);
    });
}

window.filterExpressions = () => {
    const text = document.getElementById('search-input').value.toLowerCase();
    const tag = document.getElementById('filter-tag').value;

    const filtered = allPublicData.filter(item => {
        const matchesText = item.title.toLowerCase().includes(text) || item.description.toLowerCase().includes(text);
        const matchesTag = tag === "" || (item.tags && item.tags.includes(tag));
        return matchesText && matchesTag;
    });
    renderList(filtered, 'discovery-list');
};

window.editItem = async (id) => {
    const res = await fetch(`/api/expressions/${id}`);
    const item = await res.json();
    currentEditingId = id;
    switchView('create');
    document.getElementById('title').value = item.title;
    document.getElementById('latexCode').value = item.latexCode;
    document.getElementById('description').value = item.description;
    document.getElementById('visibility').value = item.visibility;
    
    // Tagleri işaretle
    const checkboxes = document.querySelectorAll('input[name="tags"]');
    checkboxes.forEach(cb => cb.checked = item.tags && item.tags.includes(cb.value));
};

async function handleFormSubmit(e) {
    e.preventDefault();
    const selectedTags = Array.from(document.querySelectorAll('input[name="tags"]:checked')).map(cb => cb.value);
    
    const payload = {
        title: document.getElementById('title').value,
        latexCode: document.getElementById('latexCode').value,
        description: document.getElementById('description').value,
        visibility: document.getElementById('visibility').value,
        tags: selectedTags
    };
    
    const url = currentEditingId ? `/api/expressions/${currentEditingId}` : '/api/expressions';
    const method = currentEditingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        currentEditingId = null;
        e.target.reset();
        switchView('my-projects');
    }
}

window.deleteItem = async (id) => {
    if (confirm('Silmek istediğine emin misin?')) {
        try {
            await fetch(`/api/expressions/${id}`, { method: 'DELETE' });
            loadMyProjects();
        } catch (err) { console.error(err); }
    }
};