// Global Firebase database variable
let db;

// Firebase Configuration (จากที่คุณให้มา)
const firebaseConfig = {
    apiKey: "AIzaSyC3qLldkD50IFhrz3Yvkrz2RtjQshdNrVQ",
    authDomain: "electionlive-fda55.firebaseapp.com",
    databaseURL: "https://electionlive-fda55-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "electionlive-fda55",
    storageBucket: "electionlive-fda55.firebasestorage.app",
    messagingSenderId: "80080280220",
    appId: "1:80080280220:web:40cdfb792698bb1849eb59",
    measurementId: "G-KMSJ7F5PTR"
  };

// --- Helper Functions ---
// Helper function to escape HTML special characters for attributes and text content
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function updateElementText(elementId, text, defaultValue = 'รอข้อมูล') {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text !== undefined && text !== null ? String(text) : defaultValue;
    } else {
        // console.warn(`Element with ID '${elementId}' not found for text update.`);
    }
}

function formatNumber(num) {
    return num !== undefined && num !== null && !isNaN(Number(num)) ? Number(num).toLocaleString() : 'N/A';
}

// Helper function to add a temporary "pressed" class to a button
function animateButtonPressed(buttonElement) {
    if (!buttonElement) return;
    buttonElement.classList.add('button-pressed');
    setTimeout(() => {
        buttonElement.classList.remove('button-pressed');
    }, 150); // Remove class after 150ms
}

// --- Global Variables for Public Page Zone Cycling ---
let publicZoneCycleInterval = null;
let publicZoneIds = [];
let currentPublicZoneIndex = 0;
const ZONE_CYCLE_INTERVAL_MS = 20000; // 20 seconds


// --- Public Page (index.html) Functions ---
function initializePublicPage() {
    console.log("Public Page: Initializing...");

    db.ref('mayors').on('value', (snapshot) => {
        console.log("Public Page: Mayors data received from Firebase:", snapshot.val() ? "Data" : "No Data/Null");
        updateMayorsUI(snapshot.val());
    }, (error) => {
        console.error("Public Page: Error fetching mayors data:", error);
    });

    db.ref('zones').on('value', (snapshot) => {
        console.log("Public Page: Zones data received from Firebase:", snapshot.val() ? "Data" : "No Data/Null");
        initializeZoneDisplay(snapshot.val());
    }, (error) => {
        console.error("Public Page: Error fetching zones data:", error);
    });

    db.ref('electionStats').on('value', (snapshot) => { // Added for election stats on public page if needed
        console.log("Public Page: Election stats received:", snapshot.val() ? "Data" : "No Data/Null");
        // You can call a function here to update any election stats displayed on the public page
        // e.g., updatePublicElectionStats(snapshot.val());
    }, (error) => {
        console.error("Public Page: Error fetching election stats:", error);
    });

    updateCurrentTime();
    setInterval(updateCurrentTime, 60000);
}

function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    updateElementText('current-time', `เวลา ${timeString} น.`);
}

function updateMayorsUI(mayorsData) {
    const mayorListContainer = document.getElementById('mayor-list');
    if (!mayorListContainer) {
        console.error("Public Page: Mayor list container 'mayor-list' not found.");
        return;
    }
    mayorListContainer.innerHTML = ''; // ล้างรายการนายกเดิม

    // Data normalization and filtering (ตรวจสอบว่าข้อมูล mayorsData มีโครงสร้างที่ถูกต้อง)
    const mayors = mayorsData ? (Array.isArray(mayorsData) ? mayorsData.filter(m => m && typeof m.name === 'string') : Object.values(mayorsData).filter(m => m && typeof m.name === 'string')) : [];

    if (mayors.length === 0) {
        mayorListContainer.innerHTML = '<p class="col-span-full text-center text-gray-500">ไม่พบข้อมูลผู้สมัครนายกเทศมนตรี</p>';
        return;
    }

    // ไม่จำเป็นต้อง sort ใน JavaScript แล้วถ้า Firebase จัดเรียงให้ หรือถ้าลำดับไม่สำคัญมาก
    // mayors.sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));

    mayors.forEach((mayor) => {
        const mayorCard = document.createElement('div');
        mayorCard.className = 'mayor-card-official bg-white p-4 rounded-lg shadow-md flex flex-col items-center text-center';

        const placeholderImageUrl = `https://placehold.co/120x120/E2E8F0/718096?text=Mayor`;
        const imageUrl = (mayor.imageUrl && String(mayor.imageUrl).startsWith('http')) ? mayor.imageUrl : placeholderImageUrl;
        const mayorName = escapeHTML(mayor.name || 'ไม่มีชื่อ');
        const mayorScore = mayor.score !== undefined && mayor.score !== null ? mayor.score.toLocaleString() : '0';

        let mayorNumberHtml = ''; // เตรียมส่วน HTML สำหรับแสดงหมายเลข
        // ตรวจสอบว่า mayor.number มีค่าและไม่ใช่สตริงว่าง
        if (mayor.number !== undefined && mayor.number !== null && mayor.number.toString().trim() !== '') {
            // สร้าง HTML สำหรับหมายเลข โดยใช้คลาส 'mayor-number-display' เพื่อให้ CSS จัดสไตล์ได้
            mayorNumberHtml = `<p class="mayor-number-display mt-1">หมายเลข ${escapeHTML(mayor.number.toString())}</p>`;
        }

        // **สำคัญ:** ตรวจสอบ Console Log นี้เพื่อดูว่า mayor.number ถูกดึงมาถูกต้องหรือไม่
        console.log(`Public Page - Mayor: ${mayorName}, Original mayor.number from Firebase: `, mayor.number, `, HTML for number: ${mayorNumberHtml}`);

        mayorCard.innerHTML = `
            <img src="${imageUrl}" alt="รูปผู้สมัคร ${mayorName}" class="rounded-full mx-auto mb-3">
            
            <h3 class="text-lg font-semibold text-gray-800 mb-1">${mayorName}</h3>
            ${mayorNumberHtml} 

            <p class="score-value mt-4 mb-1">${mayorScore}</p>
            <p class="text-xs text-gray-500">คะแนน</p>
        `;
        mayorListContainer.appendChild(mayorCard);
    });
}


function initializeZoneDisplay(zonesData) {
    console.log("Public Page: Initializing S.T. zones with data:", JSON.parse(JSON.stringify(zonesData || {})));
    const zoneButtonsContainer = document.getElementById('zone-buttons');
    const zoneContentsContainer = document.getElementById('zone-contents');

    if (!zoneButtonsContainer || !zoneContentsContainer) {
        console.error("Public Page: CRITICAL - Zone buttons or contents container not found in HTML!");
        return;
    }

    zoneButtonsContainer.innerHTML = '';
    zoneContentsContainer.innerHTML = '';

    const rawZones = zonesData || {};
    let zoneIds = [];

    if (Array.isArray(rawZones)) {
        for (let i = 1; i < rawZones.length; i++) { // Start from index 1, assuming index 0 is null or not a zone
            if (rawZones[i]) { // Check if there's actual data for this zone index
                zoneIds.push(String(i));
            }
        }
    } else if (typeof rawZones === 'object' && rawZones !== null) {
        zoneIds = Object.keys(rawZones).sort((a, b) => parseInt(a) - parseInt(b));
    }

    console.log("Public Page: Processed S.T. zone IDs for display:", zoneIds);

    if (zoneIds.length === 0) {
        zoneButtonsContainer.innerHTML = '<p class="text-sm text-gray-500">ไม่พบเขตการเลือกตั้งสมาชิกสภา</p>';
        zoneContentsContainer.innerHTML = '<p class="text-center text-gray-500 py-4">ไม่มีข้อมูลเขตให้แสดง</p>';
        publicZoneIds = []; // Ensure it's empty
        return;
    }

    zoneIds.forEach(zoneId => {
        const zoneName = `เขต ${zoneId}`;

        const button = document.createElement('button');
        // ใช้คลาส .zone-tab-button จาก CSS และเพิ่ม Tailwind สำหรับ focus state
        button.className = 'zone-tab-button focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500';
        button.textContent = zoneName;
        button.setAttribute('data-zone-id', zoneId);
        button.onclick = (event) => {
            const clickedZoneId = event.currentTarget.getAttribute('data-zone-id');
            animateButtonPressed(event.currentTarget);
            showZoneContent(clickedZoneId);

            // Update current index and restart cycling on manual click
            currentPublicZoneIndex = publicZoneIds.indexOf(clickedZoneId);
            if (publicZoneIds.length > 1) {
                startZoneCycling(); // Reset the interval timer
            }
        };
        zoneButtonsContainer.appendChild(button);

        console.log(`Public Page: Creating content structure for S.T. zone ID: ${zoneId}`);
        const contentDiv = document.createElement('div');
        contentDiv.id = `zone-content-${zoneId}`;
        contentDiv.className = 'zone-content hidden p-1'; // Initially hidden

        const candidatesInZoneRaw = Array.isArray(rawZones) ? rawZones[parseInt(zoneId)] : rawZones[zoneId];
        console.log(`Public Page: Raw S.T. candidates data for zone ${zoneId}:`, JSON.parse(JSON.stringify(candidatesInZoneRaw || {})));

        const candidatesInZone = Array.isArray(candidatesInZoneRaw)
            ? candidatesInZoneRaw.filter(c => c && typeof c.name === 'string') // Ensure name is a string
            : (candidatesInZoneRaw ? Object.values(candidatesInZoneRaw).filter(c => c && typeof c.name === 'string') : []);

        console.log(`Public Page: Processed S.T. candidates for zone ${zoneId}:`, candidatesInZone.length, "candidates");

        candidatesInZone.sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));

        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-gray-200';
        let tableHTML = `
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลำดับ</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อผู้สมัคร</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">คะแนน</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">`;

        if (candidatesInZone.length > 0) {
            candidatesInZone.forEach((candidate, index) => {
                tableHTML += `
                    <tr class="candidate-row">
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">${index + 1}</td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${escapeHTML(candidate.name || 'N/A')}</td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-right text-blue-600 font-semibold score-update">${formatNumber(candidate.score)}</td>
                    </tr>`;
            });
        } else {
            tableHTML += '<tr><td colspan="3" class="text-center py-4 text-gray-500">ไม่พบข้อมูลผู้สมัครในเขตนี้</td></tr>';
        }
        tableHTML += '</tbody>';
        table.innerHTML = tableHTML;
        contentDiv.appendChild(table);

        zoneContentsContainer.appendChild(contentDiv);
        console.log(`Public Page: Appended contentDiv for S.T. zone ${zoneId} (id: ${contentDiv.id}) to zone-contents container.`);
    });

    publicZoneIds = [...zoneIds]; // Store for cycling

    if (zoneIds.length > 0) {
        console.log(`Public Page: Defaulting to show S.T. zone: ${zoneIds[0]}`);
        currentPublicZoneIndex = 0; // Set initial index
        showZoneContent(zoneIds[0]);
        startZoneCycling(); // Start auto-cycling
    }
}
function displayAdminSTCandidates(zoneId, candidates) {
    const contentDiv = document.getElementById('admin-zone-content');
    if (!contentDiv) {
        console.error("Admin Page: CRITICAL - Admin zone content div 'admin-zone-content' not found!");
        return;
    }

    if (!zoneId) {
        contentDiv.innerHTML = '<p class="text-gray-500">เกิดข้อผิดพลาด: ไม่พบ Zone ID</p>';
        return;
    }

    console.log(`Admin Page: Displaying S.T. candidates for zone ${zoneId}`);

    let tableHTML = `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-100">
                    <tr>
                        <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ลำดับ</th>
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ชื่อ-สกุล</th>
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">หมายเลข</th>
                        <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">คะแนน</th>
                        <th scope="col" class="relative px-4 py-3">
                            <span class="sr-only">อัปเดต</span>
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
    `;

    if (candidates && Object.keys(candidates).length > 0) {
        Object.entries(candidates).forEach(([id, candidate], index) => { // เพิ่ม index สำหรับลำดับ
            tableHTML += `
                <tr class="bg-white hover:bg-gray-50 transition-colors duration-150">
                    <td class="px-3 py-3 whitespace-nowrap text-sm text-gray-500">${index + 1}.</td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">${candidate.name}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${candidate.number || '-'}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                        <input type="number" id="score-st-${zoneId}-${id}" value="${candidate.score || 0}"
                               class="w-24 p-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right">
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="animateButtonPressed(this); updateSTScore('${zoneId}', '${id}')"
                                class="button-official button-primary text-xs px-3 py-1.5">
                            อัปเดต
                        </button>
                    </td>
                </tr>
            `;
        });
    } else {
        tableHTML += `
            <tr>
                <td colspan="5" class="px-4 py-4 text-center text-sm text-gray-500">ยังไม่มีข้อมูลผู้สมัครสำหรับเขตนี้</td>
            </tr>
        `;
    }

    tableHTML += `
                </tbody>
            </table>
        </div>
    `;
    contentDiv.innerHTML = tableHTML;
}

function startZoneCycling() {
    if (publicZoneCycleInterval) {
        clearInterval(publicZoneCycleInterval);
    }
    if (publicZoneIds.length <= 1) { // No need to cycle if 0 or 1 zone
        console.log("Public Page: S.T. zone auto-cycling not started (0 or 1 zone).");
        return;
    }
    publicZoneCycleInterval = setInterval(() => {
        currentPublicZoneIndex = (currentPublicZoneIndex + 1) % publicZoneIds.length;
        const nextZoneId = publicZoneIds[currentPublicZoneIndex];
        const nextZoneButton = document.querySelector(`.zone-tab-button[data-zone-id="${nextZoneId}"]`);
        if (nextZoneButton) {
            animateButtonPressed(nextZoneButton); // Animate the button as if clicked by the system
        }
        showZoneContent(nextZoneId);
    }, ZONE_CYCLE_INTERVAL_MS);
    console.log(`Public Page: Started S.T. zone auto-cycling every ${ZONE_CYCLE_INTERVAL_MS / 1000}s.`);
}

function showZoneContent(zoneId) {
    console.log(`Public Page: Attempting to show S.T. content for zone: ${zoneId}`);
    const zoneContentsContainer = document.getElementById('zone-contents');
    if (!zoneContentsContainer) {
        console.error("Public Page: CRITICAL - Main zone contents container 'zone-contents' not found!");
        return;
    }

    let activeContent = null;
    const allZoneContentDivs = document.querySelectorAll('.zone-content');

    // --- Height Preservation: Start ---
    // Get current height of the container before making changes to its children
    const currentContainerHeight = zoneContentsContainer.offsetHeight;
    // Set a fixed height to prevent collapse during content switching.
    // This height should respect the min-height set in CSS if the container was previously shorter.
    if (currentContainerHeight > 0) { // Avoid setting height to 0 if something went wrong
        zoneContentsContainer.style.height = `${currentContainerHeight}px`;
    }
    // --- Height Preservation: End ---

    // Update tab button styles
    document.querySelectorAll('.zone-tab-button').forEach(button => {
        // สลับคลาส .active โดยขึ้นอยู่กับ zoneId ที่ถูกเลือก
        // CSS ใน index.html จะจัดการสไตล์ของ .active เอง
        button.classList.toggle('active', button.getAttribute('data-zone-id') === zoneId);
    });

    // Hide all non-target content divs first, then find the active one
    allZoneContentDivs.forEach(content => {
        if (content.id === `zone-content-${zoneId}`) {
            activeContent = content;
        } else {
            if (!content.classList.contains('hidden')) {
                content.classList.add('hidden');
            }
        }
    });

    console.log(`Public Page: In showZoneContent, looking for element with ID: 'zone-content-${zoneId}'`);

    if (activeContent) {
        console.log(`Public Page: In showZoneContent, SUCCESS - Found element with ID 'zone-content-${zoneId}'. Making it visible.`);
        if (activeContent.classList.contains('hidden')) { // Ensure it's shown if it was hidden
            activeContent.classList.remove('hidden');
        }

        // Animate candidate rows within this activeContent (existing logic)
        const candidateRows = activeContent.querySelectorAll('.candidate-row');
        candidateRows.forEach(row => { row.classList.remove('visible'); void row.offsetWidth; });
        candidateRows.forEach((row, index) => { setTimeout(() => row.classList.add('visible'), index * 50 + 20); });
    } else {
        console.warn(`Public Page: In showZoneContent, FAILED - Element with ID 'zone-content-${zoneId}' NOT FOUND in DOM.`);
    }

    // --- Height Preservation: Release ---
    // Use requestAnimationFrame to ensure the browser has processed visibility changes
    // before resetting the container's height to auto.
    requestAnimationFrame(() => {
        zoneContentsContainer.style.height = ''; // or 'auto'
    });
    // --- Height Preservation: End Release ---
}


// --- Admin Page (admin.html) Functions ---
function initializeAdminPage() {
    console.log("Admin Page: Initializing...");

    db.ref('mayors').on('value', (snapshot) => {
        console.log("Admin Page: Mayors data received:", snapshot.val() ? "Data" : "No Data/Null");
        populateAdminMayorList(snapshot.val());
    }, (error) => console.error("Admin Page: Error fetching mayors data:", error));

    db.ref('zones').on('value', (snapshot) => {
        console.log("Admin Page: Zones data received:", snapshot.val() ? "Data" : "No Data/Null");
        initializeAdminZoneTabs(snapshot.val());
    }, (error) => console.error("Admin Page: Error fetching zones data:", error));

    db.ref('electionStats').on('value', (snapshot) => {
        console.log("Admin Page: Election stats received:", snapshot.val() ? "Data" : "No Data/Null");
        populateAdminElectionStats(snapshot.val());
    }, (error) => console.error("Admin Page: Error fetching election stats:", error));
}

function populateAdminMayorList(mayorsData) {
    const mayorListDiv = document.getElementById('admin-mayor-list');
    if (!mayorListDiv) {
        console.error("Admin Page: Mayor list container 'admin-mayor-list' not found.");
        return;
    }
    console.log("Admin Page: Populating mayor list with data:", JSON.parse(JSON.stringify(mayorsData || {})));
    mayorListDiv.innerHTML = '';

    let mayorsArray = [];
    if (Array.isArray(mayorsData)) {
        mayorsArray = mayorsData.map((mayor, index) => (mayor && typeof mayor.name === 'string') ? { ...mayor, _key: String(index), originalIndex: index } : null).filter(m => m);
    } else if (typeof mayorsData === 'object' && mayorsData !== null) {
        mayorsArray = Object.keys(mayorsData).map(key => (mayorsData[key] && typeof mayorsData[key].name === 'string') ? { ...mayorsData[key], _key: key } : null).filter(m => m);
    }
    console.log("Admin Page: Processed mayorsArray for UI:", mayorsArray);

    if (mayorsArray.length === 0) {
        mayorListDiv.innerHTML = '<p class="text-gray-500">ไม่พบข้อมูลนายกเทศมนตรี</p>';
        console.log("Admin Page: No valid mayor data to display in admin list.");
        return;
    }

    mayorsArray.forEach((mayor) => {
        const mayorDiv = document.createElement('div');
        mayorDiv.className = 'bg-white p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-3 gap-4 items-center';
        mayorDiv.innerHTML = `
            <!-- Mayor Key: ${mayor._key}, Name: ${escapeHTML(mayor.name || 'N/A')} -->
            <div>
                <label class="block text-sm font-medium text-gray-700">ชื่อ: ${escapeHTML(mayor.name || 'N/A')}</label>
                <label class="block text-sm font-medium text-gray-700">หมายเลข: ${escapeHTML(mayor.number || 'N/A')}</label>
            </div>
            <div class="md:col-span-2">
                <label for="mayor-score-${mayor._key}" class="block text-sm font-medium text-gray-700">คะแนน</label>
                <div class="mt-1 flex rounded-md shadow-sm">
                    <input type="number" id="mayor-score-${mayor._key}" value="${(mayor.score !== undefined && mayor.score !== null && !isNaN(Number(mayor.score))) ? Number(mayor.score) : 0}" class="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 p-2" min="0">
                    <button onclick="animateButtonPressed(this); updateMayorScore('${mayor._key}', document.getElementById('mayor-score-${mayor._key}').value)"
                            class="button-official button-secondary px-3 rounded-l-none rounded-r-md border border-l-0 border-gray-300 text-sm">
                        อัปเดต
                    </button>
                </div>
            </div>
        `;
        mayorListDiv.appendChild(mayorDiv);
    });
}

window.updateMayorScore = function(mayorKey, newScore) {
    const score = parseInt(newScore);
    if (isNaN(score) || score < 0) {
        alert("กรุณาใส่คะแนนเป็นตัวเลขจำนวนเต็มบวก");
        return;
    }
    const path = `mayors/${mayorKey}/score`;
    db.ref(path).set(score)
        .then(() => console.log(`Admin Page: Mayor ${mayorKey} score updated to ${score}`))
        .catch(error => console.error("Admin Page: Error updating mayor score:", error));
}

function initializeAdminZoneTabs(zonesData) {
    const zoneTabsContainer = document.getElementById('zone-tabs');
    if (!zoneTabsContainer) {
        console.error("Admin Page: Zone tabs container 'zone-tabs' not found.");
        return;
    }
    console.log("Admin Page: Initializing zone tabs with data:", JSON.parse(JSON.stringify(zonesData || {})));
    zoneTabsContainer.innerHTML = '';

    const rawZones = zonesData || {};
    let zoneIds = [];

    if (Array.isArray(rawZones)) {
        for (let i = 1; i < rawZones.length; i++) {
            if (rawZones[i]) zoneIds.push(String(i));
        }
    } else if (typeof rawZones === 'object' && rawZones !== null) {
        zoneIds = Object.keys(rawZones).sort((a, b) => parseInt(a) - parseInt(b));
    }
    console.log("Admin Page: Processed zoneIds for tabs:", zoneIds);

    if (zoneIds.length === 0) {
        zoneTabsContainer.innerHTML = '<p class="text-gray-500">ไม่พบเขตการเลือกตั้ง</p>';
        const adminZoneContent = document.getElementById('admin-zone-content');
        console.log("Admin Page: No zone IDs to create admin tabs.");
        if (adminZoneContent) adminZoneContent.innerHTML = '';
        return;
    }

    zoneIds.forEach(zoneId => {
        const tabButton = document.createElement('button');
        tabButton.className = 'px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100 admin-zone-tab';
        tabButton.textContent = `เขต ${zoneId}`;
        tabButton.setAttribute('data-zone-id', zoneId);
        tabButton.onclick = (event) => {
            animateButtonPressed(event.currentTarget); // Animate the tab button itself
            console.log(`Admin Page: Clicked zone tab for zoneId: ${zoneId}`);
            showAdminZoneCandidates(zoneId, rawZones);
        };
        zoneTabsContainer.appendChild(tabButton);
    });

    if (zoneIds.length > 0) {
        console.log(`Admin Page: Defaulting to show admin candidates for zone: ${zoneIds[0]}`);
        showAdminZoneCandidates(zoneIds[0], rawZones);
        const firstButton = zoneTabsContainer.querySelector(`button[data-zone-id="${zoneIds[0]}"]`);
        if (firstButton) {
            console.log(`Admin Page: Styling first admin zone tab button for zoneId: ${zoneIds[0]}`);
            firstButton.classList.add('bg-indigo-50', 'text-indigo-700', 'border-indigo-300');
            firstButton.classList.remove('bg-white', 'text-gray-600');
        } else {
            console.warn(`Admin Page: Could not find the first admin button for zone ${zoneIds[0]} to style.`);
        }
    }
}

function showAdminZoneCandidates(zoneId, allZonesData) {
    const contentDiv = document.getElementById('admin-zone-content');
    if (!contentDiv) {
        console.error("Admin Page: Admin zone content div 'admin-zone-content' not found.");
        return;
    }
    contentDiv.innerHTML = '';
    console.log(`Admin Page: showAdminZoneCandidates called for zoneId: ${zoneId}. Styling tabs.`);

    document.querySelectorAll('.admin-zone-tab').forEach(button => {
        const btnZoneId = button.getAttribute('data-zone-id');
        if (btnZoneId === zoneId) {
            button.classList.add('bg-indigo-50', 'text-indigo-700', 'border-indigo-300');
            button.classList.remove('bg-white', 'text-gray-600');
        } else {
            button.classList.remove('bg-indigo-50', 'text-indigo-700', 'border-indigo-300');
            button.classList.add('bg-white', 'text-gray-600');
        }
    });

    const candidatesInZoneRaw = Array.isArray(allZonesData) ? allZonesData[parseInt(zoneId)] : allZonesData[zoneId];
    console.log(`Admin Page: Raw candidates data for zone ${zoneId}:`, JSON.parse(JSON.stringify(candidatesInZoneRaw || {})));
    let candidatesArray = [];

    if (Array.isArray(candidatesInZoneRaw)) {
        candidatesArray = candidatesInZoneRaw.map((candidate, index) => (candidate && typeof candidate.name === 'string') ? { ...candidate, _key: String(index), originalIndex: index } : null).filter(c => c);
    } else if (typeof candidatesInZoneRaw === 'object' && candidatesInZoneRaw !== null) {
        candidatesArray = Object.keys(candidatesInZoneRaw).map(key => (candidatesInZoneRaw[key] && typeof candidatesInZoneRaw[key].name === 'string') ? { ...candidatesInZoneRaw[key], _key: key } : null).filter(c => c);
    }
    console.log(`Admin Page: Processed candidatesArray for zone ${zoneId}:`, candidatesArray);

    if (candidatesArray.length === 0) {
        contentDiv.innerHTML = '<p class="text-gray-500">ไม่พบผู้สมัครในเขตนี้</p>';
        console.log(`Admin Page: No valid candidates to display in admin content for zoneId: ${zoneId}`);
        return;
    }

    const listContainer = document.createElement('div');
    listContainer.className = 'space-y-3';

    candidatesArray.forEach((candidate, index) => { // เพิ่ม index เข้ามาใน forEach
        const candidateDiv = document.createElement('div');
        candidateDiv.className = 'bg-white p-3 rounded-md shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3 items-center';
        candidateDiv.innerHTML = `
            <!-- Candidate Key: ${candidate._key}, Name: ${escapeHTML(candidate.name || 'N/A')} -->
            <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-500 w-6 text-right">${index + 1}.</span>
                <p class="text-sm font-medium text-gray-800 truncate" title="${escapeHTML(candidate.name || 'N/A')}">${escapeHTML(candidate.name || 'N/A')}</p>
            </div>
            <div class="md:col-span-2">
                <label for="candidate-score-${zoneId}-${candidate._key}" class="sr-only">คะแนนของ ${escapeHTML(candidate.name)}</label>
                <div class="flex rounded-md shadow-sm">
                    <input type="number" id="candidate-score-${zoneId}-${candidate._key}" value="${(candidate.score !== undefined && candidate.score !== null && !isNaN(Number(candidate.score))) ? Number(candidate.score) : 0}" class="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 p-2" min="0">
                    <button onclick="animateButtonPressed(this); updateCandidateScore('${zoneId}', '${candidate._key}', document.getElementById('candidate-score-${zoneId}-${candidate._key}').value)"
                            class="button-official button-secondary px-3 rounded-l-none rounded-r-md border border-l-0 border-gray-300 text-sm">
                        อัปเดต
                    </button>
                </div>
            </div>
        `;
        listContainer.appendChild(candidateDiv);
    });
    contentDiv.appendChild(listContainer);
}

window.updateCandidateScore = function(zoneId, candidateKey, newScore) {
    const score = parseInt(newScore);
    if (isNaN(score) || score < 0) {
        alert("กรุณาใส่คะแนนเป็นตัวเลขจำนวนเต็มบวก");
        return;
    }
    const path = `zones/${zoneId}/${candidateKey}/score`;
    db.ref(path).set(score)
        .then(() => console.log(`Admin Page: Candidate ${candidateKey} in zone ${zoneId} score updated to ${score}`))
        .catch(error => console.error("Admin Page: Error updating candidate score:", error));
}

function populateAdminElectionStats(statsData) {
    console.log("Admin Page: Populating election stats with data:", JSON.parse(JSON.stringify(statsData || {})));
    const stats = statsData || {};
    const fields = ['totalEligibleVoters', 'totalPollingStations', 'actualVoters', 'validBallots', 'invalidBallots', 'noVoteBallots'];
    fields.forEach(field => {
        const inputElement = document.getElementById(`admin-${field}`);
        if (inputElement) {
            inputElement.value = (stats[field] !== undefined && stats[field] !== null && !isNaN(Number(stats[field]))) ? Number(stats[field]) : '';
        } else {
            // console.warn(`Admin Page: Input element 'admin-${field}' not found for stats.`);
        }
    });
}

/*
Reminder for Admin Page (admin.html) Election Stats Buttons:
To enable the button press animation for election statistics update buttons,
you need to modify their `onclick` attributes in the `admin.html` file.
For example, change:
  onclick="updateElectionStat('totalEligibleVoters')"
To:
  onclick="animateButtonPressed(this); updateElectionStat('totalEligibleVoters')"
Apply this pattern to all election stat update buttons.
*/
window.updateElectionStat = function(statName) {
    const inputElement = document.getElementById(`admin-${statName}`);
    if (!inputElement) {
        console.error(`Admin Page: Input element for stat '${statName}' not found.`);
        return;
    }
    const value = parseInt(inputElement.value);
    if (isNaN(value) || value < 0) {
        alert("กรุณาใส่ค่าเป็นตัวเลขจำนวนเต็มบวก");
        return;
    }
    db.ref(`electionStats/${statName}`).set(value)
        .then(() => console.log(`Admin Page: Election stat ${statName} updated to ${value}`))
        .catch(error => console.error(`Admin Page: Error updating election stat ${statName}:`, error));
}


// --- Voter Info Page (voter-info.html) Functions ---
function initializeVoterInfoPage() {
    console.log("Voter Info Page: Initializing...");
    updateElementText('current-year', new Date().getFullYear() + 543);

    db.ref('electionStats').on('value', (snapshot) => {
        console.log("Voter Info Page: Election stats received:", snapshot.val() ? "Data" : "No Data/Null");
        const stats = snapshot.val() || {};
        updateElementText('total-eligible-voters', formatNumber(stats.totalEligibleVoters));
        // updateElementText('total-polling-stations', `${formatNumber(stats.totalPollingStations)} หน่วย`); // Element removed from HTML
        updateElementText('actual-voters', formatNumber(stats.actualVoters));
        updateElementText('valid-ballots', formatNumber(stats.validBallots));
        updateElementText('invalid-ballots', formatNumber(stats.invalidBallots));
        updateElementText('no-vote-ballots', formatNumber(stats.noVoteBallots));

        if (stats.totalEligibleVoters && stats.actualVoters && Number(stats.totalEligibleVoters) > 0) {
            const turnout = (Number(stats.actualVoters) / Number(stats.totalEligibleVoters) * 100).toFixed(2);
            updateElementText('voter-turnout-percentage', turnout);
        } else {
            updateElementText('voter-turnout-percentage', 'รอคำนวณ');
        }
    }, (error) => {
        console.error("Voter Info Page: Error fetching election stats:", error);
    });
}


// --- Main Initialization Logic ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed.");

    if (typeof firebase === 'undefined' || !firebase.app || !firebase.database) {
        console.error("Firebase SDKs not loaded correctly or firebase object is undefined!");
        alert("เกิดข้อผิดพลาดในการโหลด Firebase SDKs กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองอีกครั้ง");
        return;
    }

    if (!firebase.apps.length) {
        console.log("Initializing Firebase app...");
        try {
            firebase.initializeApp(firebaseConfig);
            console.log("Firebase app initialized successfully.");
        } catch (error) {
            console.error("Firebase initialization error:", error);
            alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับฐานข้อมูล (Initialization Error) กรุณาลองใหม่อีกครั้ง");
            return;
        }
    } else {
        console.log("Firebase app already initialized.");
    }

    db = firebase.database();

    const pageTitle = document.title;
    const pathname = window.location.pathname;
    console.log(`Current page title: "${pageTitle}", pathname: "${pathname}"`);

    if (pathname.endsWith('/') || pathname.endsWith('index.html') || pageTitle.includes("ผลการเลือกตั้งเทศบาล")) {
        console.log("Detected Public Page (index.html). Calling initializePublicPage().");
        initializePublicPage();
    } else if (pathname.endsWith('admin.html') || pageTitle.includes("Admin Panel")) {
        console.log("Detected Admin Page (admin.html). Calling initializeAdminPage().");
        initializeAdminPage();
    } else if (pathname.endsWith('voter-info.html') || pageTitle.includes("ข้อมูลผู้มีสิทธิ์เลือกตั้ง")) {
        console.log("Detected Voter Info Page (voter-info.html). Calling initializeVoterInfoPage().");
        initializeVoterInfoPage();
    } else {
        console.warn("No specific page initialization logic found for this page.");
    }
});

/*
CSS for S.T. Candidate Row Animation (Public Page - index.html):
Please add the following CSS rules to your stylesheet or within a <style> tag in index.html.

.candidate-row {
    opacity: 0;
    transform: translateX(-30px);
    transition: opacity 0.4s ease-out, transform 0.4s ease-out;
}

.candidate-row.visible {
    opacity: 1;
    transform: translateX(0);
}
*/
