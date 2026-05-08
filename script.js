/**
 * SRMIST GPA Calculator - 21st Regulation
 * Frontend-only application logic
 */

const app = {
    // Current state
    subjects: [],
    semesters: [],
    chartInstance: null,

    // Initialize the app
    init() {
        this.loadData();
        this.setupNavigation();
        this.renderDashboard();
        this.renderCurrentSubjects();
        this.renderSemesters();
        
        if (this.subjects.length === 0) {
            this.addSubjectRow(); // Add an empty row initially
        }
    },

    // --- Navigation & UI ---
    setupNavigation() {
        const links = document.querySelectorAll('.nav-links a, .mobile-menu a');
        const sections = document.querySelectorAll('.section');
        const menuBtn = document.getElementById('menuBtn');
        const mobileMenu = document.getElementById('mobileMenu');

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                
                // Update active link
                links.forEach(l => l.classList.remove('active'));
                document.querySelectorAll(`a[href="#${targetId}"]`).forEach(l => l.classList.add('active'));
                
                // Show active section
                sections.forEach(sec => sec.classList.remove('active'));
                document.getElementById(targetId).classList.add('active');

                // Close mobile menu if open
                mobileMenu.classList.remove('open');
                
                // Render specific section data if needed
                if(targetId === 'dashboard') this.renderDashboard();
            });
        });

        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
        });
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'fa-info-circle';
        if(type === 'success') icon = 'fa-check-circle';
        if(type === 'error') icon = 'fa-exclamation-circle';

        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // --- Data Management ---
    loadData() {
        const savedSubjects = localStorage.getItem('srmgpa_current_subjects');
        if (savedSubjects) this.subjects = JSON.parse(savedSubjects);

        const savedSemesters = localStorage.getItem('srmgpa_semesters');
        if (savedSemesters) this.semesters = JSON.parse(savedSemesters);
    },

    saveCurrentSubjects() {
        localStorage.setItem('srmgpa_current_subjects', JSON.stringify(this.subjects));
        this.calculateCurrentSgpa();
    },

    saveSemestersData() {
        localStorage.setItem('srmgpa_semesters', JSON.stringify(this.semesters));
        this.renderDashboard();
        this.renderSemesters();
    },

    // --- Core Logic ---
    getGradeInfo(grade) {
        const grades = {
            'O': { point: 10, class: 'badge-o' },
            'A+': { point: 9, class: 'badge-ap' },
            'A': { point: 8, class: 'badge-a' },
            'B+': { point: 7, class: 'badge-bp' },
            'B': { point: 6, class: 'badge-b' },
            'C': { point: 5, class: 'badge-c' },
            'F': { point: 0, class: 'badge-f' }
        };
        return grades[grade] || { point: 0, class: 'badge-f' };
    },

    // --- SGPA Calculator Section ---
    addSubjectRow() {
        this.subjects.push({
            id: Date.now().toString(),
            code: '',
            credit: 3,
            grade: 'O'
        });
        this.renderCurrentSubjects();
        this.saveCurrentSubjects();
    },

    removeSubject(id) {
        this.subjects = this.subjects.filter(s => s.id !== id);
        this.renderCurrentSubjects();
        this.saveCurrentSubjects();
    },

    clearCurrentSubjects() {
        if(confirm("Are you sure you want to clear all current subjects?")) {
            this.subjects = [];
            this.addSubjectRow();
            this.showToast('Subjects cleared', 'info');
        }
    },

    updateSubject(id, field, value) {
        const subject = this.subjects.find(s => s.id === id);
        if (subject) {
            let parsedVal = field === 'credit' ? (parseFloat(value) || 0) : value;
            
            subject[field] = parsedVal;
            
            // Re-render only that specific row row visually
            this.updateSubjectRowUI(subject);
            this.saveCurrentSubjects();
        }
    },

    updateSubjectRowUI(subject) {
        const row = document.getElementById(`row-${subject.id}`);
        if (!row) return;

        const result = this.getGradeInfo(subject.grade);
        
        // Find select to update if needed, normally it updates itself.
        // We might just re-render to avoid complex DOM queries or recalculate SGPA
        this.calculateCurrentSgpa();
    },

    renderCurrentSubjects() {
        const tbody = document.getElementById('subjectsList');
        tbody.innerHTML = '';

        this.subjects.forEach(subject => {
            const result = this.getGradeInfo(subject.grade);

            const tr = document.createElement('tr');
            tr.id = `row-${subject.id}`;
            tr.innerHTML = `
                <td><input type="text" placeholder="e.g. CSC101" value="${subject.code}" onchange="app.updateSubject('${subject.id}', 'code', this.value)"></td>
                <td><input type="number" min="1" max="10" value="${subject.credit}" oninput="app.updateSubject('${subject.id}', 'credit', this.value)"></td>
                <td>
                    <select class="grade-select" onchange="app.updateSubject('${subject.id}', 'grade', this.value)">
                        <option value="O" ${subject.grade === 'O' ? 'selected' : ''}>O (10)</option>
                        <option value="A+" ${subject.grade === 'A+' ? 'selected' : ''}>A+ (9)</option>
                        <option value="A" ${subject.grade === 'A' ? 'selected' : ''}>A (8)</option>
                        <option value="B+" ${subject.grade === 'B+' ? 'selected' : ''}>B+ (7)</option>
                        <option value="B" ${subject.grade === 'B' ? 'selected' : ''}>B (6)</option>
                        <option value="C" ${subject.grade === 'C' ? 'selected' : ''}>C (5)</option>
                        <option value="F" ${subject.grade === 'F' ? 'selected' : ''}>F (0)</option>
                    </select>
                </td>
                <td><button class="btn btn-icon btn-danger" onclick="app.removeSubject('${subject.id}')"><i class="fa-solid fa-xmark"></i></button></td>
            `;
            tbody.appendChild(tr);
        });
        this.calculateCurrentSgpa();
    },

    calculateCurrentSgpa() {
        let totalCredits = 0;
        let earnedPoints = 0;

        this.subjects.forEach(sub => {
            const result = this.getGradeInfo(sub.grade);

            totalCredits += sub.credit;
            earnedPoints += (sub.credit * result.point);
        });

        const sgpa = totalCredits > 0 ? (earnedPoints / totalCredits).toFixed(2) : "0.00";
        
        document.getElementById('currentSemCredits').innerText = totalCredits;
        document.getElementById('currentSgpa').innerText = sgpa;
        
        return { sgpa: parseFloat(sgpa), credits: totalCredits };
    },

    saveSemesterData() {
        const { sgpa, credits } = this.calculateCurrentSgpa();
        
        if (credits === 0) {
            this.showToast('Add subjects with credits first!', 'error');
            return;
        }

        const semNumber = this.semesters.length + 1;
        
        this.semesters.push({
            id: Date.now().toString(),
            title: `Semester ${semNumber}`,
            sgpa: sgpa,
            credits: credits,
            date: new Date().toLocaleDateString()
        });

        this.saveSemestersData();
        
        // Clear current form
        this.subjects = [];
        this.addSubjectRow();
        
        this.showToast('Semester saved successfully!', 'success');
        
        // Go to CGPA tab
        document.querySelector('a[href="#cgpa"]').click();
    },

    // --- CGPA & History Section ---
    calculateOverallCgpa() {
        let totalCredits = 0;
        let totalWeightedSgpa = 0;

        this.semesters.forEach(sem => {
            totalCredits += sem.credits;
            totalWeightedSgpa += (sem.sgpa * sem.credits);
        });

        if (totalCredits === 0) return 0;
        return (totalWeightedSgpa / totalCredits).toFixed(2);
    },

    renderSemesters() {
        const list = document.getElementById('semestersList');
        list.innerHTML = '';
        
        const cgpa = this.calculateOverallCgpa();
        document.getElementById('overallCgpa').innerText = cgpa > 0 ? cgpa : "0.00";

        if(this.semesters.length === 0) {
            list.innerHTML = '<p style="color: var(--text-sec); grid-column: 1/-1; text-align: center;">No semester data saved yet.</p>';
            return;
        }

        this.semesters.forEach(sem => {
            const card = document.createElement('div');
            card.className = 'semester-card glass';
            card.innerHTML = `
                <div class="semester-header">
                    <h3>${sem.title}</h3>
                    <button class="btn btn-icon btn-danger" onclick="app.removeSemester('${sem.id}')" title="Delete Semester">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
                <div class="semester-stats">
                    <div class="sem-stat-item">
                        <span class="lbl">SGPA</span>
                        <span class="val" style="color: var(--accent-blue)">${sem.sgpa.toFixed(2)}</span>
                    </div>
                    <div class="sem-stat-item">
                        <span class="lbl">Credits</span>
                        <span class="val">${sem.credits}</span>
                    </div>
                    <div class="sem-stat-item">
                        <span class="lbl">Date</span>
                        <span class="val" style="font-size: 0.9rem">${sem.date}</span>
                    </div>
                </div>
            `;
            list.appendChild(card);
        });
    },

    removeSemester(id) {
        if(confirm("Delete this semester record?")) {
            this.semesters = this.semesters.filter(s => s.id !== id);
            this.saveSemestersData();
            this.showToast('Semester removed', 'info');
        }
    },

    addManualSemester() {
        const nameInput = document.getElementById('manualSemName');
        const sgpaInput = document.getElementById('manualSgpa');
        const creditsInput = document.getElementById('manualCredits');

        const title = nameInput.value.trim() || `Semester ${this.semesters.length + 1}`;
        const sgpa = parseFloat(sgpaInput.value);
        const credits = parseFloat(creditsInput.value);

        if (isNaN(sgpa) || isNaN(credits) || sgpa < 0 || sgpa > 10 || credits <= 0) {
            this.showToast('Please enter a valid SGPA (0-10) and Credits (>0).', 'error');
            return;
        }

        this.semesters.push({
            id: Date.now().toString(),
            title: title,
            sgpa: sgpa,
            credits: credits,
            date: new Date().toLocaleDateString()
        });

        this.saveSemestersData();
        
        // Clear manual  inputs
        nameInput.value = '';
        sgpaInput.value = '';
        creditsInput.value = '';
        
        this.showToast('Previous semester added manually!', 'success');
    },

    resetAllData() {
        if(confirm("WARNING: Doing this will wipe out all your subjects and semester histories. Are you SURE?")) {
            this.subjects = [];
            this.semesters = [];
            this.saveCurrentSubjects();
            this.saveSemestersData();
            this.addSubjectRow();
            this.showToast('All data has been reset.', 'success');
        }
    },

    // --- Dashboard & Chart ---
    renderDashboard() {
        const cgpa = parseFloat(this.calculateOverallCgpa());
        let totalCredits = 0;
        this.semesters.forEach(s => totalCredits += s.credits);

        document.getElementById('dashCgpa').innerText = cgpa > 0 ? cgpa.toFixed(2) : "0.00";
        document.getElementById('dashCredits').innerText = totalCredits;
        
        let overallGrade = "-";
        if (cgpa > 0) {
            // Rough mapping based on CGPA for overall classification
            if(cgpa >= 9) overallGrade = "O / A+";
            else if (cgpa >= 8) overallGrade = "A";
            else if (cgpa >= 7) overallGrade = "B+";
            else if (cgpa >= 6) overallGrade = "B";
            else if (cgpa >= 5) overallGrade = "C";
            else overallGrade = "F";
        }
        document.getElementById('dashGrade').innerText = overallGrade;

        this.renderChart();
    },

    renderChart() {
        const ctx = document.getElementById('gpaChart');
        if (!ctx) return;

        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        const labels = this.semesters.map(s => s.title);
        const data = this.semesters.map(s => s.sgpa);

        // If no data, show placeholder instead
        if (data.length === 0) {
            const container = ctx.parentElement;
            let placeholder = document.getElementById('chartPlaceholder');
            if(!placeholder) {
                placeholder = document.createElement('div');
                placeholder.id = 'chartPlaceholder';
                placeholder.style.textAlign = 'center';
                placeholder.style.padding = '3rem 1rem';
                placeholder.style.color = 'var(--text-sec)';
                placeholder.innerText = 'No semester data available yet. Save or add a semester to view your trend.';
                container.insertBefore(placeholder, ctx);
            }
            placeholder.style.display = 'block';
            ctx.style.display = 'none';
            return;
        } else {
            const placeholder = document.getElementById('chartPlaceholder');
            if(placeholder) placeholder.style.display = 'none';
            ctx.style.display = 'block';
        }

        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Your SGPA Trend',
                    data: data,
                    borderColor: '#0A84FF',
                    backgroundColor: 'rgba(10, 132, 255, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#0A84FF',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#fff' }
                    }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 10,
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        ticks: { color: '#8E8E93' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#8E8E93' }
                    }
                }
            }
        });
    },

    // --- Estimators Logic ---
    calculateEstExternal() {
        const internal = parseFloat(document.getElementById('estInternal').value) || 0;
        const targetMarks = parseFloat(document.getElementById('estTargetGrade').value);
        
        const resultDiv = document.getElementById('estExtResult');

        if (internal > 60) {
            resultDiv.innerHTML = '<span style="color: var(--danger)">Internal marks cannot exceed 60.</span>';
            return;
        }

        // total = internal + (ext/75)*40
        // targetMarks = internal + (ext/75)*40
        // targetMarks - internal = (ext/75)*40
        // ((targetMarks - internal) / 40) * 75 = ext

        let requiredConverted = targetMarks - internal;
        let requiredExternal = (requiredConverted / 40) * 75;

        // Round up because you want AT LEAST that mark
        requiredExternal = Math.ceil(requiredExternal);

        if (requiredExternal > 75) {
            resultDiv.innerHTML = `<span style="color: var(--danger)">Impossible! You need ${requiredExternal}/75 in external, which is greater than the max marks.</span>`;
        } else if (requiredExternal <= 0) {
            resultDiv.innerHTML = `<span style="color: var(--grade-o)">You already achieved this target with just internals!</span>`;
        } else {
            resultDiv.innerHTML = `<span style="color: var(--accent-blue)">You need at least <strong>${requiredExternal}/75</strong> in your external exam.</span>`;
        }
    }
};

// Start app when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
