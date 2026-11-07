// --- 1. CORE DATA MODEL (STATE MANAGEMENT) ---
const state = {
    residents: [
        { id: 1, name: "Arthur Morgan", age: 78, room: "101", notes: "No allergies" },
        { id: 2, name: "Evelyn Carter", age: 82, room: "102", notes: "Penicillin allergy" }
    ],
    medications: [
        { id: 101, resId: 1, medName: "Lisinopril", dosage: "10mg", time: "08:00", status: "Pending" },
        { id: 102, resId: 2, medName: "Metformin", dosage: "500mg", time: "13:00", status: "Pending" }
    ],
    logs: []
};

// --- 2. INITIALIZATION & NAVIGATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Setup Navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active classes
            navButtons.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));
            
            // Add active class to clicked
            e.currentTarget.classList.add('active');
            const targetId = e.currentTarget.getAttribute('data-target');
            document.getElementById(targetId).classList.remove('hidden');
        });
    });

    // Initial Renders
    renderDashboard();
    renderResidents();
    renderResidentDropdown();
    renderAuditLogs();
});

// --- 3. PAGE LOGIC: DASHBOARD ---
function renderDashboard() {
    const container = document.getElementById('medication-timeline');
    const emptyState = document.getElementById('dashboard-empty');
    container.innerHTML = '';

    const pendingMeds = state.medications.filter(m => m.status === "Pending");
    
    if (pendingMeds.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        // Sort chronologically
        pendingMeds.sort((a, b) => a.time.localeCompare(b.time));

        pendingMeds.forEach(med => {
            const resident = state.residents.find(r => r.id == med.resId);
            const card = document.createElement('div');
            card.className = 'med-card';
            card.innerHTML = `
                <div class="med-info">
                    <h3>${med.time} - ${med.medName} (${med.dosage})</h3>
                    <p><i class="fa-solid fa-user"></i> ${resident.name} | Room ${resident.room}</p>
                </div>
                <div class="btn-actions">
                    <button class="btn btn-success" onclick="handleMedAction(${med.id}, 'Administered')">
                        <i class="fa-solid fa-check"></i> Give
                    </button>
                    <button class="btn btn-danger" onclick="handleMedAction(${med.id}, 'Missed')">
                        <i class="fa-solid fa-xmark"></i> Missed
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    }
}

function handleMedAction(medId, action) {
    // Update Medication State
    const med = state.medications.find(m => m.id === medId);
    med.status = action;

    const resident = state.residents.find(r => r.id == med.resId);

    // Update Audit Log State
    state.logs.unshift({
        timestamp: new Date().toLocaleString(),
        caregiver: "Nurse Sarah",
        action: action,
        details: `${med.medName} for ${resident.name} (Room ${resident.room})`
    });

    // Trigger Toast Notification
    showToast(`Successfully marked ${med.medName} as ${action}`);

    // Re-render UI seamlessly
    renderDashboard();
    renderAuditLogs();
}

// --- 4. PAGE LOGIC: RESIDENTS ---
function renderResidents() {
    const tbody = document.getElementById('residents-table-body');
    tbody.innerHTML = '';
    state.residents.forEach(r => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${r.room}</strong></td>
                <td>${r.name}</td>
                <td>${r.age}</td>
                <td>${r.notes || "N/A"}</td>
            </tr>
        `;
    });
}

document.getElementById('add-resident-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const newRes = {
        id: Date.now(), // Generate mock ID
        name: document.getElementById('res-name').value,
        age: document.getElementById('res-age').value,
        room: document.getElementById('res-room').value,
        notes: document.getElementById('res-notes').value
    };
    state.residents.push(newRes);
    e.target.reset();
    showToast("Resident added successfully");
    renderResidents();
    renderResidentDropdown(); // Update prescription form dropdown
});

// --- 5. PAGE LOGIC: PRESCRIPTIONS ---
function renderResidentDropdown() {
    const select = document.getElementById('med-resident-select');
    select.innerHTML = '<option value="">Select Resident...</option>';
    state.residents.forEach(r => {
        select.innerHTML += `<option value="${r.id}">${r.name} (Room ${r.room})</option>`;
    });
}

document.getElementById('assign-med-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const newMed = {
        id: Date.now(),
        resId: document.getElementById('med-resident-select').value,
        medName: document.getElementById('med-name').value,
        dosage: document.getElementById('med-dosage').value,
        time: document.getElementById('med-time').value,
        status: "Pending"
    };
    state.medications.push(newMed);
    e.target.reset();
    showToast("Medication added to schedule");
    renderDashboard(); // Immediately show in dashboard
});

// --- 6. PAGE LOGIC: AUDIT LOGS ---
function renderAuditLogs() {
    const tbody = document.getElementById('audit-table-body');
    tbody.innerHTML = '';
    state.logs.forEach(log => {
        const badgeClass = log.action === 'Administered' ? 'badge-success' : 'badge-danger';
        tbody.innerHTML += `
            <tr>
                <td>${log.timestamp}</td>
                <td>${log.caregiver}</td>
                <td><span class="badge ${badgeClass}">${log.action}</span></td>
                <td>${log.details}</td>
            </tr>
        `;
    });
}

// --- 7. UTILITIES: TOAST NOTIFICATIONS ---
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-bell"></i> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}