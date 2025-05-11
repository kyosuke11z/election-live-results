// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyC3qLldkD50IFhrz3Yvkrz2RtjQshdNrVQ",
    authDomain: "electionlive-fda55.firebaseapp.com",
    databaseURL: "https://electionlive-fda55-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "electionlive-fda55",
    storageBucket: "electionlive-fda55.appspot.com", // Adjusted to common .appspot.com, verify if yours is different
    messagingSenderId: "80080280220",
    appId: "1:80080280220:web:40cdfb792698bb1849eb59",
    measurementId: "G-KMSJ7F5PTR"
  };

// Initialize Firebase
console.log("Attempting to initialize Firebase...");
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();
console.log("Firebase initialized:", database ? "Success" : "Failed or database object is null");

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired. Starting main script logic.");
    // Function to update current time
    function updateCurrentTime() {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Bangkok' };
        const thaiLocale = 'th-TH-u-ca-buddhist';
        let formattedDate = new Intl.DateTimeFormat(thaiLocale, options).format(now);

        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = `อัปเดตล่าสุด: ${formattedDate}`;
        }
    }

    if (document.getElementById('current-time')) {
        updateCurrentTime();
        setInterval(updateCurrentTime, 1000);
    }

    // Footer year updates
    const setupFooterYear = (elementId, useBuddhistYear = true) => {
        const element = document.getElementById(elementId);
        if (element) {
            const year = new Date().getFullYear();
            element.textContent = useBuddhistYear ? year + 543 : year;
        }
    };
    setupFooterYear('current-year-footer');
    setupFooterYear('current-year'); // For voter-info.html
    setupFooterYear('current-year-footer-admin', false); // For admin.html

    // --- Mayor Data ---
    const mayorListElement = document.getElementById('mayor-list');
    if (mayorListElement) {
        console.log("Mayor list element found. Attaching Firebase listener for mayors.");
        database.ref('mayors').on('value', (snapshot) => { // Path 'mayors'
            console.log("Firebase 'mayors' data received snapshot:", snapshot);
            const mayorsData = snapshot.val();
            console.log("Raw mayorsData from Firebase:", mayorsData);
            // Check if mayorsData is an array and has items
            if (Array.isArray(mayorsData) && mayorsData.length > 0) {
                console.log("Processing mayorsData (Array):", mayorsData);
                displayMayors(mayorsData);
            } else {
                console.log("No mayorsData found or it's not a non-empty array.");
                mayorListElement.innerHTML = '<p class="text-center col-span-full text-gray-500">ไม่มีข้อมูลผู้สมัครนายกเทศมนตรี</p>';
            }
        }, (error) => {
            console.error("Firebase error fetching mayor data: ", error);
            if (mayorListElement) mayorListElement.innerHTML = '<p class="text-center col-span-full text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูลนายกเทศมนตรี</p>';
        });
    }

    function displayMayors(mayorsArray) { // Parameter is an array based on JSON
        if (!mayorListElement) return;
        mayorListElement.innerHTML = '';
        console.log("displayMayors called with (Array):", mayorsArray);

        // Data is already an array, so just sort it.
        // Ensure all items are objects before sorting.
        const validMayorsArray = mayorsArray.filter(mayor => typeof mayor === 'object' && mayor !== null);

        const sortedMayors = [...validMayorsArray] // Create a shallow copy before sorting
            .sort((a, b) => (b.score || 0) - (a.score || 0));

        if (sortedMayors.length === 0) {
            mayorListElement.innerHTML = '<p class="text-center col-span-full text-gray-500">ไม่มีข้อมูลผู้สมัครนายกเทศมนตรี</p>';
            console.log("displayMayors: No valid mayor objects to display after processing and sorting.");
            return;
        }

        const fragment = document.createDocumentFragment();
        sortedMayors.forEach(mayor => {
            const div = document.createElement('div');
            div.className = 'mayor-card-official bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center';
            // Use mayor.imageUrl (capital L)
            // IMPORTANT: Replace 'YOUR_DEFAULT_EXTERNAL_IMAGE_URL.jpg' with an actual URL if you want a default online image.
            // If you have a local 'img_placeholder_person.png' in the same folder as index.html, you can use that.
            const placeholderImage = 'img_placeholder_person.png'; // Or 'YOUR_DEFAULT_EXTERNAL_IMAGE_URL.jpg'
            div.innerHTML = `
                <img src="${mayor.imageUrl || placeholderImage}" alt="${mayor.name || 'ผู้สมัคร'}" class="rounded-full w-24 h-24 md:w-32 md:h-32 object-cover mb-4 border-4 border-blue-300" onerror="this.onerror=null;this.src='${placeholderImage}';">
                <h3 class="text-md md:text-lg font-semibold text-gray-800 mb-1">${mayor.name || 'N/A'}</h3>
                <p class="text-xs text-gray-500">หมายเลข</p>
                <p class="mayor-number-display text-2xl md:text-3xl mb-2">${mayor.number || '-'}</p>
                <p class="text-xs md:text-sm text-gray-600 mb-2">${mayor.party || ''}</p> 
                <p class="text-xs text-gray-500">คะแนน</p>
                <div class="score-value font-bold text-blue-700 text-3xl md:text-4xl">${(mayor.score || 0).toLocaleString()}</div>
            `;
            fragment.appendChild(div);
        });
        mayorListElement.appendChild(fragment);
    }

    // --- Council Members (S.T.) Data ---
    const councilZoneButtonsContainer = document.getElementById('zone-buttons');
    const councilZoneContentsContainer = document.getElementById('zone-contents');
    let councilZonesDataCache = []; // Data is an array of zones [null, zone1Array, zone2Array, ...]
    let activeZoneId = null; // Will now be an index (1, 2, 3...)

    if (councilZoneButtonsContainer && councilZoneContentsContainer) {
        console.log("Council zone elements found. Attaching Firebase listener for 'zones'.");
        database.ref('zones').on('value', (snapshot) => { // Changed path to 'zones'
            console.log("Firebase 'zones' data received snapshot:", snapshot);
            const zonesData = snapshot.val();
            console.log("Raw council_zones data (from 'zones' path) from Firebase:", zonesData);

            if (Array.isArray(zonesData) && zonesData.length > 1) { // Check if it's an array and has more than the initial null
                councilZonesDataCache = zonesData; // Store the whole array, including the null at index 0
                console.log("Processing council_zones data (Array):", councilZonesDataCache);

                const availableZoneIndices = [];
                for (let i = 1; i < councilZonesDataCache.length; i++) { // Start from 1 to skip the null at index 0
                    if (councilZonesDataCache[i]) { // Ensure the zone data itself is not null/undefined
                        availableZoneIndices.push(i);
                    }
                }
                console.log("Available zone indices for tabs:", availableZoneIndices);
                displayZoneTabs(availableZoneIndices);

                let currentActiveZoneIsValid = activeZoneId !== null &&
                                               activeZoneId >= 1 &&
                                               activeZoneId < councilZonesDataCache.length &&
                                               councilZonesDataCache[activeZoneId];

                console.log(`Initial activeZoneId: ${activeZoneId}, currentActiveZoneIsValid: ${currentActiveZoneIsValid}`);

                if (!currentActiveZoneIsValid && availableZoneIndices.length > 0) {
                    activeZoneId = availableZoneIndices[0]; // Default to the first valid zone index
                    console.log("Defaulting activeZoneId to index:", activeZoneId);
                }

                if (activeZoneId !== null && councilZonesDataCache[activeZoneId]) {
                    console.log("Attempting to display/update zone with index:", activeZoneId, "and data:", councilZonesDataCache[activeZoneId]);
                    displayOrUpdateCouncilZone(activeZoneId, councilZonesDataCache[activeZoneId]); // Pass index and zone data (which is an array of candidates)
                    const activeTabButton = councilZoneButtonsContainer.querySelector(`.zone-tab-button[data-zone-id="${activeZoneId}"]`);
                    if (activeTabButton) {
                        setActiveTab(activeTabButton);
                    }
                } else if (availableZoneIndices.length > 0) {
                    console.log("Active zone ID is invalid or no data for it, but zones exist. Showing default message.");
                    councilZoneContentsContainer.innerHTML = '<p class="text-center p-4 text-gray-500">กรุณาเลือกเขตเพื่อดูผลคะแนน</p>';
                } else {
                    console.log("No available zone indices to display.");
                    councilZoneContentsContainer.innerHTML = '<p class="text-center p-4 text-gray-500">ไม่มีข้อมูลสมาชิกสภาเทศบาลสำหรับแสดงผล</p>';
                }

            } else {
                console.log("No 'zones' data found, or it's not a valid array structure (e.g., only null or empty).");
                councilZoneButtonsContainer.innerHTML = '<p class="text-gray-500">ไม่มีข้อมูลเขต</p>';
                councilZoneContentsContainer.innerHTML = '<p class="text-center p-4 text-gray-500">ไม่มีข้อมูลสมาชิกสภาเทศบาล</p>';
                activeZoneId = null;
                councilZonesDataCache = [];
            }
        }, (error) => {
            console.error("Firebase error fetching 'zones' data: ", error);
            if (councilZoneButtonsContainer) councilZoneButtonsContainer.innerHTML = '<p class="text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูลเขต</p>';
            if (councilZoneContentsContainer) councilZoneContentsContainer.innerHTML = '<p class="text-center p-4 text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล สท.</p>';
        });
    }

    function displayZoneTabs(zoneIndices) { // Parameter is now an array of indices
        if (!councilZoneButtonsContainer) return;
        councilZoneButtonsContainer.innerHTML = '';
        console.log("displayZoneTabs called with zoneIndices:", zoneIndices);
        const fragment = document.createDocumentFragment();
        zoneIndices.forEach((zoneIndex) => {
            const zoneName = `เขต ${zoneIndex}`; // Zone index starts from 1
            const button = document.createElement('button');
            button.className = 'zone-tab-button';
            button.textContent = zoneName;
            button.dataset.zoneId = zoneIndex; // Store the index
            button.onclick = function() {
                activeZoneId = zoneIndex; // Update activeZoneId to the index
                const currentZoneCandidatesArray = councilZonesDataCache[activeZoneId];
                if (currentZoneCandidatesArray) {
                    console.log("Zone tab clicked, displaying zone with index:", activeZoneId);
                    displayOrUpdateCouncilZone(activeZoneId, currentZoneCandidatesArray);
                } else {
                    console.error("Zone tab clicked, but no data in cache for zoneIndex:", activeZoneId);
                    councilZoneContentsContainer.innerHTML = `<p class="text-center p-4 text-gray-500">ไม่พบข้อมูลสำหรับเขต ${zoneName}</p>`;
                }
                setActiveTab(this);
            };
            fragment.appendChild(button);
        });
        councilZoneButtonsContainer.appendChild(fragment);
    }

    function setActiveTab(activeButton) {
        if (!councilZoneButtonsContainer) return;
        const buttons = councilZoneButtonsContainer.querySelectorAll('.zone-tab-button');
        buttons.forEach(button => button.classList.remove('active'));
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    // zoneIndex is the index from the 'zones' array (e.g., 1, 2, 3)
    // candidatesInZoneArray is the array of candidate objects for that specific zone
    function displayOrUpdateCouncilZone(zoneIndex, candidatesInZoneArray) {
        if (!councilZoneContentsContainer) return;
        console.log(`displayOrUpdateCouncilZone called for zoneIndex: ${zoneIndex}`, "with candidates array:", candidatesInZoneArray);

        if (!Array.isArray(candidatesInZoneArray) || candidatesInZoneArray.length === 0) {
            const zoneName = `เขต ${zoneIndex}`;
            console.log(`No candidates found for zone ${zoneName}. Displaying message.`);
            councilZoneContentsContainer.innerHTML = `<p class="text-center p-4 text-gray-500">ไม่พบข้อมูลผู้สมัครสำหรับ${zoneName}</p>`;
            return;
        }

        let candidatesToDisplay = [...candidatesInZoneArray]; // Create a shallow copy
        console.log("Candidates array for display (original order from Firebase):", JSON.parse(JSON.stringify(candidatesToDisplay)));

        // Since 'number' is not available in the JSON for council members,
        // we will display them in the order they appear in the array.
        // The original request was to keep the order fixed, which this achieves by not sorting
        // if 'number' is absent or if sorting by 'number' is not desired.

        councilZoneContentsContainer.innerHTML = '';
        const table = document.createElement('table');
        table.className = 'table-official w-full';

        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        headerRow.innerHTML = `
            <th class="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">หมายเลข</th>
            <th class="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">ชื่อ - สกุล</th>
            <th class="px-2 sm:px-4 py-2 text-right text-xs sm:text-sm">คะแนน</th>
        `;

        const tbody = table.createTBody();
        candidatesToDisplay.forEach((candidate, index) => {
            const row = tbody.insertRow();

            const cellNumber = row.insertCell();
            // Use candidate.number if it exists in your data, otherwise use index + 1
            cellNumber.textContent = candidate.number || (index + 1).toString();
            cellNumber.className = 'px-2 sm:px-4 py-2 whitespace-nowrap';

            const cellName = row.insertCell();
            cellName.textContent = candidate.name || 'N/A';
            cellName.className = 'px-2 sm:px-4 py-2';

            const cellScore = row.insertCell();
            cellScore.textContent = (candidate.score || 0).toLocaleString();
            cellScore.className = 'px-2 sm:px-4 py-2 text-right font-bold';
        });
        councilZoneContentsContainer.appendChild(table);
    }

    // --- Voter Info Page Logic (voter-info.html) ---
    if (document.getElementById('total-eligible-voters')) {
        console.log("Voter info page detected. Loading voter stats.");
        loadVoterStats();
    }

    function loadVoterStats() {
        const statsRef = database.ref('electionStats'); // Corrected path to 'electionStats'
        console.log("Attaching Firebase listener for electionStats.");
        statsRef.on('value', (snapshot) => {
            console.log("Firebase 'electionStats' data received snapshot:", snapshot);
            const stats = snapshot.val();
            const setText = (id, value, isNumber = true) => {
                const el = document.getElementById(id);
                if (el) {
                    if (value === null || typeof value === 'undefined') {
                        el.textContent = 'รอข้อมูล';
                    } else {
                        el.textContent = isNumber ? (parseInt(value, 10) || 0).toLocaleString() : value;
                    }
                }
            };

            console.log("Raw electionStats from Firebase:", stats);
            if (stats) {
                const totalEligible = parseInt(stats.totalEligibleVoters, 10) || 0;
                const actualVoters = parseInt(stats.actualVoters, 10) || 0;

                setText('total-eligible-voters', stats.totalEligibleVoters);
                setText('actual-voters', stats.actualVoters);
                setText('valid-ballots', stats.validBallots);
                setText('invalid-ballots', stats.invalidBallots);
                setText('no-vote-ballots', stats.noVoteBallots);

                if (totalEligible > 0 && actualVoters >= 0) {
                    const turnoutPercentage = ((actualVoters / totalEligible) * 100).toFixed(2);
                    setText('voter-turnout-percentage', `${turnoutPercentage}%`, false);
                } else {
                    setText('voter-turnout-percentage', 'รอคำนวณ', false);
                }
            } else {
                console.log("No electionStats data found.");
                ['total-eligible-voters', 'actual-voters', 'valid-ballots', 'invalid-ballots', 'no-vote-ballots', 'voter-turnout-percentage'].forEach(id => setText(id, null, id !== 'voter-turnout-percentage'));
            }
        }, (error) => {
            console.error("Firebase error fetching electionStats: ", error);
             ['total-eligible-voters', 'actual-voters', 'valid-ballots', 'invalid-ballots', 'no-vote-ballots'].forEach(id => setText(id, 'ผิดพลาด'));
             setText('voter-turnout-percentage', 'ผิดพลาด', false);
        });
    }

    // --- Admin Page Logic (admin.html) ---
    if (document.getElementById('admin-mayor-list')) {
        console.log("Admin page detected. Initializing admin functions...");
        initializeAdminPage();
    }
});

// --- Admin Page Specific Functions ---
function initializeAdminPage() {
    loadAdminMayorList();
    loadAdminCouncilZoneTabs();
    loadAdminElectionStats();
}

function loadAdminMayorList() {
    const adminMayorList = document.getElementById('admin-mayor-list');
    if (!adminMayorList) return;

    database.ref('mayors').on('value', snapshot => { // Path 'mayors'
        adminMayorList.innerHTML = '';
        const mayors = snapshot.val(); // Expecting an array
        if (Array.isArray(mayors)) {
            // Sort by number if 'number' field exists and is parseable
            const sortedMayorsAdmin = [...mayors].sort((a,b) => (parseInt(a.number, 10) || 0) - (parseInt(b.number, 10) || 0));
            
            sortedMayorsAdmin.forEach((mayor, index) => { // Use index for unique IDs if 'number' isn't reliable
                const mayorIdForAdmin = mayor.number || index; // Use number or index for unique element ID
                const dbPathForMayorScore = `mayors/${index}/score`; // Path to update score in the array

                const div = document.createElement('div');
                div.className = 'p-3 border rounded-md bg-gray-50 flex items-center justify-between';
                div.innerHTML = `
                    <div class="flex-grow">
                        <span class="font-semibold">${mayor.number || '-'}. ${mayor.name || 'N/A'}</span>
                    </div>
                    <input type="number" id="mayor-score-${mayorIdForAdmin}" value="${mayor.score || 0}" class="w-24 text-right p-1 border rounded-md mr-2">
                    <button onclick="animateButtonPressed(this); updateScore('${dbPathForMayorScore}', 'mayor-score-${mayorIdForAdmin}')" class="button-official button-primary text-sm px-3 py-1">อัปเดต</button>
                `;
                adminMayorList.appendChild(div);
            });
        } else {
            adminMayorList.innerHTML = '<p>ไม่พบข้อมูลผู้สมัครนายก หรือรูปแบบไม่ถูกต้อง</p>';
        }
    });
}

function loadAdminCouncilZoneTabs() {
    const zoneTabsContainer = document.getElementById('zone-tabs');
    let previouslySelectedAdminZoneId = null; // Variable to store the last selected zone ID (index)
    if (!zoneTabsContainer) return;

    database.ref('zones').on('value', snapshot => { // Path 'zones'
        // Before clearing, check if there was a previously selected tab
        const currentActiveTab = zoneTabsContainer.querySelector('.admin-zone-tab.bg-indigo-100');
        if (currentActiveTab) {
            previouslySelectedAdminZoneId = currentActiveTab.dataset.zoneId;
        }

        zoneTabsContainer.innerHTML = ''; // Clear existing tabs
        const zonesArray = snapshot.val(); // This is an array: [null, zone1Array, zone2Array, ...]
        
        if (Array.isArray(zonesArray) && zonesArray.length > 1) {
            for (let i = 1; i < zonesArray.length; i++) { // Start from index 1
                if (!zonesArray[i]) continue; // Skip if a zone entry is unexpectedly null

                const zoneAdminId = i; // Use index as the ID for admin purposes
                const zoneAdminName = `เขต ${i}`;

                const button = document.createElement('button');
                button.className = 'admin-zone-tab px-3 py-1.5 border rounded-md text-sm hover:bg-indigo-100';
                button.textContent = zoneAdminName;
                button.dataset.zoneId = zoneAdminId.toString(); // Store index as string
                button.onclick = (e) => {
                    loadAdminCouncilCandidatesForZone(zoneAdminId); // Pass the index
                    document.querySelectorAll('.admin-zone-tab').forEach(btn => btn.classList.remove('bg-indigo-100', 'font-semibold'));
                    e.target.classList.add('bg-indigo-100', 'font-semibold');
                };
                zoneTabsContainer.appendChild(button);
            }

            // Restore selection or default to first tab
            let tabToSelectId = previouslySelectedAdminZoneId || (zonesArray.length > 1 && zonesArray[1] ? '1' : null);

            if (tabToSelectId) {
                const tabToSelect = zoneTabsContainer.querySelector(`.admin-zone-tab[data-zone-id="${tabToSelectId}"]`);
                if (tabToSelect) {
                    loadAdminCouncilCandidatesForZone(parseInt(tabToSelectId, 10));
                    tabToSelect.classList.add('bg-indigo-100', 'font-semibold');
                } else if (zonesArray.length > 1 && zonesArray[1]) { // Fallback if previous selection is no longer valid
                    loadAdminCouncilCandidatesForZone(1);
                    const firstFallbackTab = zoneTabsContainer.querySelector('.admin-zone-tab[data-zone-id="1"]');
                    if (firstFallbackTab) {
                        firstFallbackTab.classList.add('bg-indigo-100', 'font-semibold');
                    }
                }
            }
        } else {
            zoneTabsContainer.innerHTML = '<p>ไม่พบข้อมูลเขต สท. หรือรูปแบบไม่ถูกต้อง</p>';
        }
    });
}

function loadAdminCouncilCandidatesForZone(zoneIndex) { // Parameter is now zoneIndex
    const adminZoneContent = document.getElementById('admin-zone-content');
    if (!adminZoneContent) return;

    database.ref(`zones/${zoneIndex}`).on('value', snapshot => { // Path to candidates for a specific zone index
        adminZoneContent.innerHTML = '';
        const candidatesArrayForZone = snapshot.val(); // This is an array of candidate objects

        if (Array.isArray(candidatesArrayForZone)) {
            candidatesArrayForZone.forEach((candidate, candidateIndex) => {
                const candidateIdInArray = candidateIndex; // Use array index as part of the ID
                const dbPathForCouncilScore = `zones/${zoneIndex}/${candidateIdInArray}/score`;

                const div = document.createElement('div');
                div.className = 'p-3 border rounded-md bg-gray-50 flex items-center justify-between';
                div.innerHTML = `
                    <div class="flex-grow">
                        <span class="font-semibold">${candidate.number || (candidateIndex + 1)}. ${candidate.name || 'N/A'}</span>
                    </div>
                    <input type="number" id="council-score-${zoneIndex}-${candidateIdInArray}" value="${candidate.score || 0}" class="w-24 text-right p-1 border rounded-md mr-2">
                    <button onclick="animateButtonPressed(this); updateScore('${dbPathForCouncilScore}', 'council-score-${zoneIndex}-${candidateIdInArray}')" class="button-official button-primary text-sm px-3 py-1">อัปเดต</button>
                `;
                adminZoneContent.appendChild(div);
            });
        } else {
            adminZoneContent.innerHTML = '<p>ไม่พบข้อมูลผู้สมัคร สท. ในเขตนี้ หรือรูปแบบไม่ถูกต้อง</p>';
        }
    });
}

function loadAdminElectionStats() {
    const statsRef = database.ref('electionStats'); // Corrected path
    statsRef.once('value', (snapshot) => {
        const stats = snapshot.val();
        if (stats) {
            const fields = ['totalEligibleVoters', 'totalPollingStations', 'actualVoters', 'validBallots', 'invalidBallots', 'noVoteBallots'];
            fields.forEach(field => {
                const inputElement = document.getElementById(`admin-${field}`);
                if (inputElement && typeof stats[field] !== 'undefined' && stats[field] !== null) {
                    inputElement.value = stats[field];
                } else if (inputElement) {
                    inputElement.value = ''; // Clear if null or undefined
                }
            });
        }
    });
}

function updateScore(dbPath, inputElementId) {
    const inputElement = document.getElementById(inputElementId);
    if (!inputElement) {
        console.error(`Element ${inputElementId} not found.`);
        return;
    }
    const value = inputElement.value;
    let numericValue;
    if (value === '') {
        numericValue = 0; // Or null, depending on how you want to store empty scores
    } else if (isNaN(parseInt(value))) {
        alert('กรุณาป้อนค่าเป็นตัวเลข');
        inputElement.style.borderColor = 'red';
        setTimeout(() => { inputElement.style.borderColor = ''; }, 2000);
        return;
    } else {
        numericValue = parseInt(value, 10);
    }

    inputElement.style.borderColor = ''; // Clear previous error/success states

    database.ref(dbPath).set(numericValue)
        .then(() => {
            // console.log(`Updated ${dbPath} to ${numericValue}`);
            inputElement.style.borderColor = 'green';
            setTimeout(() => { inputElement.style.borderColor = ''; }, 1500);
        })
        .catch((error) => {
            console.error(`Error updating ${dbPath}: `, error);
            alert(`เกิดข้อผิดพลาดในการอัปเดตข้อมูล: ${error.message}`);
            inputElement.style.borderColor = 'red';
        });
}

function updateElectionStat(statName) {
    const inputElementId = `admin-${statName}`;
    const dbPath = `electionStats/${statName}`; // Corrected path
    updateScore(dbPath, inputElementId);
}

function animateButtonPressed(button) {
    if (button) {
        button.classList.add('button-pressed');
        setTimeout(() => {
            button.classList.remove('button-pressed');
        }, 150);
    }
}
