// IFA Care - Main Application JavaScript
// LocalStorage Keys
const STORAGE_KEYS = {
    user: 'ifa_user',
    medicines: 'ifa_medicines',
    symptoms: 'ifa_symptoms',
    appointments: 'ifa_appointments',
    emergencyContacts: 'ifa_emergency_contacts',
    reminderSettings: 'ifa_reminder_settings'
};

// Initialize Data Structures
function initializeStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.medicines)) {
        localStorage.setItem(STORAGE_KEYS.medicines, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.symptoms)) {
        localStorage.setItem(STORAGE_KEYS.symptoms, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.appointments)) {
        localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.emergencyContacts)) {
        const defaultContacts = [
            { name: 'Spouse', phone: '+91 9876543210', relation: 'Husband' },
            { name: 'Mother', phone: '+91 9876543211', relation: 'Mother' }
        ];
        localStorage.setItem(STORAGE_KEYS.emergencyContacts, JSON.stringify(defaultContacts));
    }
    if (!localStorage.getItem(STORAGE_KEYS.reminderSettings)) {
        const defaultSettings = {
            medicineName: 'Iron & Folic Acid',
            time: '20:30',
            dosage: '1',
            frequency: 'daily',
            days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            sound: true,
            vibration: true,
            messageStyle: 'baby'
        };
        localStorage.setItem(STORAGE_KEYS.reminderSettings, JSON.stringify(defaultSettings));
    }
}

// Login Functionality
let currentLoginType = 'patient';

function switchTab(type) {
    currentLoginType = type;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Demo credentials
    if ((currentLoginType === 'patient' && username === 'patient' && password === 'admin123') ||
        (currentLoginType === 'admin' && username === 'admin' && password === 'admin123')) {
        
        const user = {
            type: currentLoginType,
            name: currentLoginType === 'patient' ? 'Priya Sharma' : 'Admin',
            phone: '+91 9876543210',
            dob: '1995-06-15',
            lmp: '2025-07-20',
            address: 'Pimpri, Maharashtra',
            bloodGroup: 'O+',
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
        initializeStorage();
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid credentials! Use: patient/admin123 or admin/admin123');
    }
}

function goToRegister() {
    window.location.href = 'register.html';
}

// Register Functionality
function handleRegister(event) {
    event.preventDefault();
    
    const password = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    const user = {
        type: 'patient',
        name: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value,
        dob: document.getElementById('dob').value,
        lmp: document.getElementById('lmp').value,
        address: document.getElementById('address').value,
        emergencyContact: document.getElementById('emergencyContact').value,
        bloodGroup: '',
        registeredDate: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    initializeStorage();
    alert('Registration successful! Welcome to IFA Care 🎉');
    window.location.href = 'dashboard.html';
}

// Dashboard Functionality
function initializeDashboard() {
    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.user));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Update user info
    document.getElementById('userName').textContent = `Welcome, ${user.name.split(' ')[0]}`;
    document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
    
    // Calculate pregnancy week
    if (user.lmp) {
        const lmpDate = new Date(user.lmp);
        const today = new Date();
        const diffTime = Math.abs(today - lmpDate);
        const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
        const trimester = diffWeeks <= 12 ? 1 : diffWeeks <= 26 ? 2 : 3;
        document.getElementById('pregnancyWeek').textContent = `Week ${diffWeeks} | Trimester ${trimester}`;
    }
    
    // Load medicine data
    loadMedicineData();
    loadAppointmentPreview();
}

function loadMedicineData() {
    const medicines = JSON.parse(localStorage.getItem(STORAGE_KEYS.medicines));
    const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.reminderSettings));
    
    // Calculate streak
    let streak = 0;
    let consecutiveDays = 0;
    const sortedMeds = medicines.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    for (let i = 0; i < sortedMeds.length; i++) {
        if (sortedMeds[i].taken) {
            consecutiveDays++;
        } else {
            break;
        }
    }
    streak = consecutiveDays;
    
    // Update UI
    if (document.getElementById('streakCount')) {
        document.getElementById('streakCount').textContent = `${streak} Days Streak`;
    }
    if (document.getElementById('reminderTime')) {
        document.getElementById('reminderTime').textContent = formatTime(settings.time);
    }
    if (document.getElementById('medicineName')) {
        document.getElementById('medicineName').textContent = settings.medicineName;
    }
    
    // Calculate adherence
    const totalDoses = medicines.length;
    const takenDoses = medicines.filter(m => m.taken).length;
    const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
    
    if (document.getElementById('adherenceRate')) {
        document.getElementById('adherenceRate').textContent = `${adherenceRate}%`;
    }
    if (document.getElementById('totalDoses')) {
        document.getElementById('totalDoses').textContent = totalDoses;
    }
    if (document.getElementById('progressFill')) {
        document.getElementById('progressFill').style.width = `${adherenceRate}%`;
    }
    
    // Last taken
    const lastTaken = sortedMeds.find(m => m.taken);
    if (document.getElementById('lastTaken') && lastTaken) {
        document.getElementById('lastTaken').textContent = formatDate(lastTaken.date);
    }
}

function markMedicineTaken() {
    const medicines = JSON.parse(localStorage.getItem(STORAGE_KEYS.medicines));
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already marked today
    const todayEntry = medicines.find(m => m.date === today);
    if (todayEntry && todayEntry.taken) {
        alert('Already marked as taken today! 🎉');
        return;
    }
    
    medicines.push({
        date: today,
        time: new Date().toTimeString().split(' ')[0],
        taken: true,
        missed: false
    });
    
    localStorage.setItem(STORAGE_KEYS.medicines, JSON.stringify(medicines));
    
    // Show success message
    const messages = [
        'Great job! Your baby thanks you! 💕',
        'Excellent! Keep up the healthy streak! 🌟',
        'Well done! Every tablet counts! 👏',
        'Amazing dedication! You\'re doing great! 🎉'
    ];
    alert(messages[Math.floor(Math.random() * messages.length)]);
    
    loadMedicineData();
}

function markMedicineMissed() {
    const medicines = JSON.parse(localStorage.getItem(STORAGE_KEYS.medicines));
    const today = new Date().toISOString().split('T')[0];
    
    medicines.push({
        date: today,
        time: new Date().toTimeString().split(' ')[0],
        taken: false,
        missed: true
    });
    
    localStorage.setItem(STORAGE_KEYS.medicines, JSON.stringify(medicines));
    alert('Noted. Try to take it tomorrow! Stay healthy. 💪');
    loadMedicineData();
}

// Symptoms Functionality
function submitSymptoms(event) {
    event.preventDefault();
    
    const selectedSymptoms = [];
    document.querySelectorAll('input[name="symptom"]:checked').forEach(input => {
        selectedSymptoms.push(input.value);
    });
    
    if (selectedSymptoms.length === 0) {
        alert('Please select at least one symptom');
        return;
    }
    
    const severity = document.querySelector('input[name="severity"]:checked').value;
    const notes = document.getElementById('symptomNotes').value;
    
    const symptoms = JSON.parse(localStorage.getItem(STORAGE_KEYS.symptoms));
    symptoms.push({
        date: new Date().toISOString(),
        symptoms: selectedSymptoms,
        severity: severity,
        notes: notes
    });
    
    localStorage.setItem(STORAGE_KEYS.symptoms, JSON.stringify(symptoms));
    alert('Symptoms logged successfully! 📝');
    
    event.target.reset();
    loadRecentSymptoms();
}

function loadRecentSymptoms() {
    const symptoms = JSON.parse(localStorage.getItem(STORAGE_KEYS.symptoms));
    const container = document.getElementById('recentSymptoms');
    
    if (!container) return;
    
    if (symptoms.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No symptoms logged yet</p>';
        return;
    }
    
    const recent = symptoms.slice(-5).reverse();
    container.innerHTML = recent.map(symptom => `
        <div class="timeline-item fade-in">
            <div class="timeline-date">${formatDate(symptom.date)}</div>
            <div class="timeline-content">
                <strong>${symptom.symptoms.join(', ')}</strong> - ${symptom.severity}
                ${symptom.notes ? `<p style="font-size: 13px; color: #666; margin-top: 4px;">${symptom.notes}</p>` : ''}
            </div>
        </div>
    `).join('');
}

// Awareness Videos
const videos = [
    {
        title: 'Importance of Iron & Folic Acid',
        duration: '5:30',
        instructor: 'Dr. Anjali Sharma',
        category: 'ifa',
        url: 'https://www.youtube.com/watch?v=example1',
        color: 'linear-gradient(135deg, #FFE8D6 0%, #C89A7C 100%)'
    },
    {
        title: 'Nutrition for Pregnancy',
        duration: '8:15',
        instructor: 'Nutritionist Team',
        category: 'nutrition',
        url: 'https://www.youtube.com/watch?v=example2',
        color: 'linear-gradient(135deg, #E1F5E1 0%, #A8D5BA 100%)'
    },
    {
        title: 'Managing Side Effects',
        duration: '6:45',
        instructor: 'Dr. Priya Patel',
        category: 'ifa',
        url: 'https://www.youtube.com/watch?v=example3',
        color: 'linear-gradient(135deg, #E3F2FD 0%, #90CAF9 100%)'
    },
    {
        title: 'Gentle Pregnancy Exercises',
        duration: '12:20',
        instructor: 'Fitness Expert',
        category: 'exercise',
        url: 'https://www.youtube.com/watch?v=example4',
        color: 'linear-gradient(135deg, #F3E5F5 0%, #CE93D8 100%)'
    },
    {
        title: 'Mental Wellness During Pregnancy',
        duration: '7:30',
        instructor: 'Counselor',
        category: 'wellness',
        url: 'https://www.youtube.com/watch?v=example5',
        color: 'linear-gradient(135deg, #FFF3E0 0%, #FFCC80 100%)'
    },
    {
        title: 'Iron-Rich Diet Tips',
        duration: '9:15',
        instructor: 'Chef & Nutritionist',
        category: 'nutrition',
        url: 'https://www.youtube.com/watch?v=example6',
        color: 'linear-gradient(135deg, #E8F5E9 0%, #81C784 100%)'
    }
];

let currentCategory = 'all';

function loadVideos() {
    renderVideos();
}

function filterCategory(category) {
    currentCategory = category;
    document.querySelectorAll('.category-chip').forEach(chip => chip.classList.remove('active'));
    event.target.classList.add('active');
    renderVideos();
}

function filterVideos() {
    renderVideos();
}

function renderVideos() {
    const searchTerm = document.getElementById('searchVideos')?.value.toLowerCase() || '';
    const filtered = videos.filter(video => {
        const matchesCategory = currentCategory === 'all' || video.category === currentCategory;
        const matchesSearch = video.title.toLowerCase().includes(searchTerm) || 
                            video.instructor.toLowerCase().includes(searchTerm);
        return matchesCategory && matchesSearch;
    });
    
    const container = document.getElementById('videoGrid');
    if (!container) return;
    
    container.innerHTML = filtered.map(video => `
        <div class="video-card fade-in" onclick="playVideo('${video.url}')">
            <div class="video-thumbnail" style="background: ${video.color}">
                <div class="play-btn">
                    <span class="material-icons-round" style="color: #C89A7C; font-size: 32px;">play_arrow</span>
                </div>
            </div>
            <div class="video-info">
                <div class="video-title">${video.title}</div>
                <div class="video-meta">Duration: ${video.duration} | ${video.instructor}</div>
            </div>
        </div>
    `).join('');
}

function playVideo(url) {
    alert(`Opening video: ${url}\n\nIn production, this would open the video player.`);
}

// Appointments
function submitAppointment(event) {
    event.preventDefault();
    
    const appointments = JSON.parse(localStorage.getItem(STORAGE_KEYS.appointments));
    const appointment = {
        id: Date.now(),
        type: document.getElementById('appointmentType').value,
        date: document.getElementById('appointmentDate').value,
        time: document.querySelector('input[name="timeSlot"]:checked').value,
        doctor: document.getElementById('doctorPreference').value || 'Any Available',
        reason: document.getElementById('visitReason').value,
        status: 'Scheduled',
        createdAt: new Date().toISOString()
    };
    
    appointments.push(appointment);
    localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(appointments));
    
    alert('Appointment booked successfully! 📅\nYou will receive a confirmation shortly.');
    event.target.reset();
    loadAppointments();
}

function loadAppointments() {
    const appointments = JSON.parse(localStorage.getItem(STORAGE_KEYS.appointments));
    const container = document.getElementById('upcomingAppointments');
    
    if (!container) return;
    
    const upcoming = appointments.filter(apt => new Date(apt.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (upcoming.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No upcoming appointments</p>';
        return;
    }
    
    container.innerHTML = upcoming.map(apt => `
        <div class="contact-card fade-in">
            <div class="contact-info">
                <span class="material-icons-round">event</span>
                <div>
                    <h4>${apt.type.charAt(0).toUpperCase() + apt.type.slice(1)}</h4>
                    <p>${formatDate(apt.date)} at ${formatTime(apt.time)}</p>
                    <p style="font-size: 12px;">Dr. ${apt.doctor}</p>
                </div>
            </div>
            <button class="call-btn" onclick="cancelAppointment(${apt.id})">
                <span class="material-icons-round">close</span>
            </button>
        </div>
    `).join('');
}

function loadAppointmentPreview() {
    const appointments = JSON.parse(localStorage.getItem(STORAGE_KEYS.appointments));
    const container = document.getElementById('appointmentPreview');
    
    if (!container) return;
    
    const upcoming = appointments.filter(apt => new Date(apt.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (upcoming.length === 0) {
        container.innerHTML = '<p>No upcoming appointments. <a href="appointment.html" style="color: var(--primary);">Book now</a></p>';
        return;
    }
    
    const next = upcoming[0];
    container.innerHTML = `
        <div class="appointment-preview" style="background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%); border-radius: 16px; padding: 16px;">
            <h4 style="color: #2E7D32; margin-bottom: 8px;">${next.type.charAt(0).toUpperCase() + next.type.slice(1)}</h4>
            <p style="font-size: 18px; font-weight: 700; color: #1B5E20;">${formatDate(next.date)} at ${formatTime(next.time)}</p>
        </div>
    `;
}

function cancelAppointment(id) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
        let appointments = JSON.parse(localStorage.getItem(STORAGE_KEYS.appointments));
        appointments = appointments.filter(apt => apt.id !== id);
        localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(appointments));
        alert('Appointment cancelled');
        loadAppointments();
    }
}

// Diet Plan
const dietPlans = [
    {
        type: '🌅 Breakfast',
        name: 'Fortified Cereal with Milk',
        description: 'Whole grain cereal fortified with iron, served with milk and fresh fruits. Add a glass of orange juice for vitamin C.',
        badges: ['Iron Rich', 'Vitamin C', 'Calcium']
    },
    {
        type: '🌞 Mid-Morning',
        name: 'Fresh Fruits & Nuts',
        description: 'Pomegranate, dates, and almonds. Great source of natural iron and healthy fats.',
        badges: ['Antioxidants', 'Healthy Fats']
    },
    {
        type: '🍽️ Lunch',
        name: 'Spinach Dal with Rice',
        description: 'Lentils cooked with spinach, brown rice, mixed vegetables, and a side salad with lemon dressing.',
        badges: ['Protein', 'Iron Rich', 'Fiber']
    },
    {
        type: '☕ Evening Snack',
        name: 'Beetroot Juice & Dry Fruits',
        description: 'Fresh beetroot juice with a handful of raisins and walnuts.',
        badges: ['Iron Boost', 'Energy']
    },
    {
        type: '🌙 Dinner',
        name: 'Grilled Chicken with Vegetables',
        description: 'Lean protein with steamed broccoli, carrots, and sweet potato. Include a glass of milk.',
        badges: ['Protein', 'Calcium', 'Vitamins']
    }
];

function loadDietPlan() {
    const container = document.getElementById('dietPlan');
    if (!container) return;
    
    container.innerHTML = dietPlans.map(meal => `
        <div class="meal-card fade-in">
            <div class="meal-type">${meal.type}</div>
            <div class="meal-name">${meal.name}</div>
            <div class="meal-description">${meal.description}</div>
            <div class="nutrition-badges">
                ${meal.badges.map(badge => `<span class="nutrition-badge">${badge}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

// Health History with Charts
function initializeHealthHistory() {
    const medicines = JSON.parse(localStorage.getItem(STORAGE_KEYS.medicines));
    const symptoms = JSON.parse(localStorage.getItem(STORAGE_KEYS.symptoms));
    
    // Calculate statistics
    const totalDoses = medicines.length;
    const takenDoses = medicines.filter(m => m.taken).length;
    const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
    
    // Calculate streak
    let streak = 0;
    let bestStreak = 0;
    let currentStreak = 0;
    
    const sortedMeds = medicines.sort((a, b) => new Date(a.date) - new Date(b.date));
    for (let i = 0; i < sortedMeds.length; i++) {
        if (sortedMeds[i].taken) {
            currentStreak++;
            bestStreak = Math.max(bestStreak, currentStreak);
        } else {
            currentStreak = 0;
        }
    }
    streak = currentStreak;
    
    // Update stats
    if (document.getElementById('totalDosesStat')) {
        document.getElementById('totalDosesStat').textContent = totalDoses;
    }
    if (document.getElementById('adherenceRateStat')) {
        document.getElementById('adherenceRateStat').textContent = `${adherenceRate}%`;
    }
    if (document.getElementById('currentStreak')) {
        document.getElementById('currentStreak').textContent = streak;
    }
    if (document.getElementById('bestStreak')) {
        document.getElementById('bestStreak').textContent = bestStreak;
    }
    
    // Create charts
    createAdherenceChart(medicines);
    createMonthlyChart(medicines);
    createSymptomChart(symptoms);
    loadActivityTimeline();
}

function createAdherenceChart(medicines) {
    const ctx = document.getElementById('adherenceChart');
    if (!ctx) return;
    
    // Last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toISOString().split('T')[0]);
    }
    
    const data = last7Days.map(date => {
        const med = medicines.find(m => m.date === date);
        return med && med.taken ? 1 : 0;
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: last7Days.map(date => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })),
            datasets: [{
                label: 'Taken',
                data: data,
                backgroundColor: 'rgba(200, 154, 124, 0.8)',
                borderColor: '#C89A7C',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            return value === 1 ? 'Yes' : 'No';
                        }
                    }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function createMonthlyChart(medicines) {
    const ctx = document.getElementById('monthlyChart');
    if (!ctx) return;
    
    // Group by month
    const monthlyData = {};
    medicines.forEach(med => {
        const month = med.date.substring(0, 7);
        if (!monthlyData[month]) {
            monthlyData[month] = { taken: 0, missed: 0 };
        }
        if (med.taken) {
            monthlyData[month].taken++;
        } else {
            monthlyData[month].missed++;
        }
    });
    
    const months = Object.keys(monthlyData).sort();
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: months.map(m => new Date(m + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
            datasets: [
                {
                    label: 'Taken',
                    data: months.map(m => monthlyData[m].taken),
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Missed',
                    data: months.map(m => monthlyData[m].missed),
                    borderColor: '#F44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true, position: 'top' }
            }
        }
    });
}

function createSymptomChart(symptoms) {
    const ctx = document.getElementById('symptomChart');
    if (!ctx) return;
    
    // Count symptom frequency
    const symptomCount = {};
    symptoms.forEach(entry => {
        entry.symptoms.forEach(symptom => {
            symptomCount[symptom] = (symptomCount[symptom] || 0) + 1;
        });
    });
    
    const sortedSymptoms = Object.entries(symptomCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: sortedSymptoms.map(s => s[0]),
            datasets: [{
                data: sortedSymptoms.map(s => s[1]),
                backgroundColor: [
                    'rgba(200, 154, 124, 0.8)',
                    'rgba(168, 213, 186, 0.8)',
                    'rgba(248, 177, 149, 0.8)',
                    'rgba(144, 202, 249, 0.8)',
                    'rgba(206, 147, 216, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true, position: 'bottom' }
            }
        }
    });
}

function loadActivityTimeline() {
    const container = document.getElementById('activityTimeline');
    if (!container) return;
    
    const medicines = JSON.parse(localStorage.getItem(STORAGE_KEYS.medicines));
    const symptoms = JSON.parse(localStorage.getItem(STORAGE_KEYS.symptoms));
    const appointments = JSON.parse(localStorage.getItem(STORAGE_KEYS.appointments));
    
    const activities = [
        ...medicines.map(m => ({ type: 'medicine', date: m.date, data: m })),
        ...symptoms.map(s => ({ type: 'symptom', date: s.date.split('T')[0], data: s })),
        ...appointments.map(a => ({ type: 'appointment', date: a.date, data: a }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
    
    container.innerHTML = activities.map(activity => {
        let content = '';
        if (activity.type === 'medicine') {
            content = activity.data.taken ? '✅ Medicine taken' : '❌ Medicine missed';
        } else if (activity.type === 'symptom') {
            content = `📝 Logged: ${activity.data.symptoms.join(', ')}`;
        } else {
            content = `📅 Appointment: ${activity.data.type}`;
        }
        
        return `
            <div class="timeline-item fade-in">
                <div class="timeline-date">${formatDate(activity.date)}</div>
                <div class="timeline-content">${content}</div>
            </div>
        `;
    }).join('');
}

// Profile Management
function loadProfile() {
    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.user));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    document.getElementById('profileName').value = user.name;
    document.getElementById('profilePhone').value = user.phone;
    document.getElementById('profileDob').value = user.dob;
    document.getElementById('profileLmp').value = user.lmp;
    document.getElementById('profileAddress').value = user.address;
    document.getElementById('bloodGroup').value = user.bloodGroup || '';
    
    document.getElementById('profileAvatarLarge').textContent = user.name.charAt(0).toUpperCase();
}

function updateProfile(event) {
    event.preventDefault();
    
    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.user));
    user.name = document.getElementById('profileName').value;
    user.phone = document.getElementById('profilePhone').value;
    user.dob = document.getElementById('profileDob').value;
    user.lmp = document.getElementById('profileLmp').value;
    user.address = document.getElementById('profileAddress').value;
    user.bloodGroup = document.getElementById('bloodGroup').value;
    
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    alert('Profile updated successfully! ✅');
}

function changeAvatar() {
    alert('Avatar upload feature coming soon! 📸');
}

function toggleNotifications() {
    const isEnabled = document.getElementById('notificationsToggle').checked;
    alert(isEnabled ? 'Notifications enabled ✅' : 'Notifications disabled ❌');
}

function changeLanguage() {
    alert('Language selection:\n1. English\n2. हिंदी\n3. मराठी\n\nComing soon!');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem(STORAGE_KEYS.user);
        window.location.href = 'login.html';
    }
}

// Emergency Contacts
function loadEmergencyContacts() {
    const contacts = JSON.parse(localStorage.getItem(STORAGE_KEYS.emergencyContacts));
    const container = document.getElementById('emergencyContactsList');
    
    if (!container) return;
    
    container.innerHTML = contacts.map((contact, index) => `
        <div class="contact-card fade-in">
            <div class="contact-info">
                <span class="material-icons-round">person</span>
                <div>
                    <h4>${contact.name}</h4>
                    <p>${contact.phone}</p>
                    <p style="font-size: 12px; color: #999;">${contact.relation}</p>
                </div>
            </div>
            <div style="display: flex; gap: 8px;">
                <a href="tel:${contact.phone}" class="call-btn">
                    <span class="material-icons-round">phone</span>
                </a>
                <button class="call-btn" style="background: var(--error);" onclick="deleteContact(${index})">
                    <span class="material-icons-round">delete</span>
                </button>
            </div>
        </div>
    `).join('');
}

function addEmergencyContact() {
    const name = prompt('Enter contact name:');
    if (!name) return;
    
    const phone = prompt('Enter phone number:');
    if (!phone) return;
    
    const relation = prompt('Enter relation:');
    if (!relation) return;
    
    const contacts = JSON.parse(localStorage.getItem(STORAGE_KEYS.emergencyContacts));
    contacts.push({ name, phone, relation });
    localStorage.setItem(STORAGE_KEYS.emergencyContacts, JSON.stringify(contacts));
    
    alert('Contact added successfully! ✅');
    loadEmergencyContacts();
}

function deleteContact(index) {
    if (confirm('Delete this contact?')) {
        const contacts = JSON.parse(localStorage.getItem(STORAGE_KEYS.emergencyContacts));
        contacts.splice(index, 1);
        localStorage.setItem(STORAGE_KEYS.emergencyContacts, JSON.stringify(contacts));
        loadEmergencyContacts();
    }
}

// Reminder Settings
function loadReminderSettings() {
    const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.reminderSettings));
    
    document.getElementById('medicineName').value = settings.medicineName;
    document.getElementById('reminderTime').value = settings.time;
    document.getElementById('dosage').value = settings.dosage;
    document.getElementById('frequency').value = settings.frequency;
    document.getElementById('snoozeDuration').value = '10';
    document.getElementById('soundToggle').checked = settings.sound;
    document.getElementById('vibrationToggle').checked = settings.vibration;
    document.getElementById('messageStyle').value = settings.messageStyle;
    
    // Set days
    settings.days.forEach(day => {
        const checkbox = document.querySelector(`input[name="day"][value="${day}"]`);
        if (checkbox) checkbox.checked = true;
    });
}

function saveReminderSettings(event) {
    event.preventDefault();
    
    const selectedDays = [];
    document.querySelectorAll('input[name="day"]:checked').forEach(input => {
        selectedDays.push(input.value);
    });
    
    const settings = {
        medicineName: document.getElementById('medicineName').value,
        time: document.getElementById('reminderTime').value,
        dosage: document.getElementById('dosage').value,
        frequency: document.getElementById('frequency').value,
        days: selectedDays,
        sound: document.getElementById('soundToggle').checked,
        vibration: document.getElementById('vibrationToggle').checked,
        messageStyle: document.getElementById('messageStyle').value
    };
    
    localStorage.setItem(STORAGE_KEYS.reminderSettings, JSON.stringify(settings));
    alert('Reminder settings saved! ⏰');
}

// Chat Functionality
function toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    if (chatWindow) {
        chatWindow.classList.toggle('active');
    }
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const container = document.getElementById('chatMessages');
    
    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message user';
    userMsg.textContent = message;
    container.appendChild(userMsg);
    
    input.value = '';
    container.scrollTop = container.scrollHeight;
    
    // Simulate bot response
    setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = 'chat-message bot';
        
        const responses = {
            'nausea': 'Try taking your IFA tablet with food or before bed. Ginger tea can also help with nausea. If it persists, please consult your doctor.',
            'pain': 'I\'ve noted your pain. Can you describe where it hurts? Back pain is common during pregnancy. Gentle stretches and warm compress might help.',
            'tired': 'Fatigue is normal. Ensure you\'re taking your IFA tablets regularly as they boost energy. Also, get adequate rest and stay hydrated.',
            'side effect': 'Common IFA side effects include nausea and constipation. Take the tablet with food, drink plenty of water, and include fiber in your diet.',
            'diet': 'Focus on iron-rich foods like spinach, lentils, and dates. Include vitamin C (citrus fruits) to enhance absorption. Avoid tea/coffee near meal times.',
            'default': 'I\'m here to help! You can ask me about symptoms, diet, IFA tablets, or any pregnancy-related concerns. How can I assist you today?'
        };
        
        let response = responses.default;
        for (const [key, value] of Object.entries(responses)) {
            if (message.toLowerCase().includes(key)) {
                response = value;
                break;
            }
        }
        
        botMsg.textContent = response;
        container.appendChild(botMsg);
        container.scrollTop = container.scrollHeight;
    }, 1000);
}

function handleChatEnter(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

function showNotifications() {
    alert('🔔 Notifications:\n\n1. Time to take your IFA tablet! (Now)\n2. Upcoming appointment tomorrow\n3. Weekly health summary available');
}

// Utility Functions
function goToPage(page) {
    window.location.href = page;
}

function goBack() {
    window.history.back();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const user = localStorage.getItem(STORAGE_KEYS.user);
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!user && currentPage !== 'login.html' && currentPage !== 'register.html' && currentPage !== '') {
        window.location.href = 'login.html';
    }
});
