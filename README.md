ระบบแสดงผลการเลือกตั้งแบบเรียลไทม์สำหรับ เทศบาลเมืองพิชัย — ออกแบบมาเพื่อให้ประชาชนติดตามผลคะแนนนายกเทศมนตรีและสมาชิกสภาเทศบาลได้ทันทีในคืนวันเลือกตั้ง 11 พฤษภาคม 2568 โดยไม่มี downtime แม้แต่วินาทีเดียว

Showcase Edition: ข้อมูลผู้สมัครและคะแนนจริงถูกล้างออกแล้ว (PII-safe) คงไว้เฉพาะ architecture และ UI สำหรับแสดงเป็น engineering portfolio


✨ ฟีเจอร์หลัก

📡 Real-Time Score Updates — คะแนนอัพเดทอัตโนมัติผ่าน Firebase Realtime Database ทันทีที่เจ้าหน้าที่กรอกข้อมูล ไม่ต้อง refresh
🏛️ Mayor Candidate Cards — แสดงการ์ดผู้สมัครนายกพร้อมรูปภาพ หมายเลข และคะแนนสะสมแบบ live
📊 Council Results by Zone — แสดงผลสมาชิกสภาแยกตามเขตเลือกตั้ง พร้อมระบบแท็บสลับเขต
🔐 Admin Panel — หน้าจัดการสำหรับเจ้าหน้าที่กรอกคะแนนแบบ real-time
📋 Voter Information Page — หน้าข้อมูลผู้มีสิทธิ์และสถิติการเลือกตั้ง
🕐 Live Buddhist Calendar Clock — นาฬิกาเรียลไทม์แสดงวันเวลาตามปฏิทินไทย (พ.ศ.)
🎬 Candidate Row Animation — Slide-in animation เมื่อโหลดรายชื่อผู้สมัคร


🛠️ Tech Stack
LayerTechnologyหน้าที่FrontendVanilla JavaScript (ES6+), HTML5UI หลักและ DOM manipulationStylingTailwindCSS 2.x (CDN) + Custom CSSResponsive layout และ component stylesDatabaseFirebase Realtime Databaseเก็บและ sync คะแนนแบบ real-time ผ่าน WebSocketHostingFirebase HostingStatic site deployment พร้อม CDN globalFontSarabun (Google Fonts)ฟอนต์ภาษาไทยสำหรับ UI

📊 System Architecture
#mermaid-r14f-r1{font-family:"Anthropic Sans",system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-r14f-r1 .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-r14f-r1 .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-r14f-r1 .error-icon{fill:#CC785C;}#mermaid-r14f-r1 .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-r14f-r1 .edge-thickness-normal{stroke-width:1px;}#mermaid-r14f-r1 .edge-thickness-thick{stroke-width:3.5px;}#mermaid-r14f-r1 .edge-pattern-solid{stroke-dasharray:0;}#mermaid-r14f-r1 .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-r14f-r1 .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-r14f-r1 .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-r14f-r1 .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-r14f-r1 .marker.cross{stroke:#A1A1A1;}#mermaid-r14f-r1 svg{font-family:"Anthropic Sans",system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;font-size:16px;}#mermaid-r14f-r1 p{margin:0;}#mermaid-r14f-r1 .label{font-family:"Anthropic Sans",system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#E5E5E5;}#mermaid-r14f-r1 .cluster-label text{fill:#3387a3;}#mermaid-r14f-r1 .cluster-label span{color:#3387a3;}#mermaid-r14f-r1 .cluster-label span p{background-color:transparent;}#mermaid-r14f-r1 .label text,#mermaid-r14f-r1 span{fill:#E5E5E5;color:#E5E5E5;}#mermaid-r14f-r1 .node rect,#mermaid-r14f-r1 .node circle,#mermaid-r14f-r1 .node ellipse,#mermaid-r14f-r1 .node polygon,#mermaid-r14f-r1 .node path{fill:transparent;stroke:#A1A1A1;stroke-width:1px;}#mermaid-r14f-r1 .rough-node .label text,#mermaid-r14f-r1 .node .label text,#mermaid-r14f-r1 .image-shape .label,#mermaid-r14f-r1 .icon-shape .label{text-anchor:middle;}#mermaid-r14f-r1 .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#mermaid-r14f-r1 .rough-node .label,#mermaid-r14f-r1 .node .label,#mermaid-r14f-r1 .image-shape .label,#mermaid-r14f-r1 .icon-shape .label{text-align:center;}#mermaid-r14f-r1 .node.clickable{cursor:pointer;}#mermaid-r14f-r1 .root .anchor path{fill:#A1A1A1!important;stroke-width:0;stroke:#A1A1A1;}#mermaid-r14f-r1 .arrowheadPath{fill:#0b0b0b;}#mermaid-r14f-r1 .edgePath .path{stroke:#A1A1A1;stroke-width:1px;}#mermaid-r14f-r1 .flowchart-link{stroke:#A1A1A1;fill:none;}#mermaid-r14f-r1 .edgeLabel{background-color:transparent;text-align:center;}#mermaid-r14f-r1 .edgeLabel p{background-color:transparent;}#mermaid-r14f-r1 .edgeLabel rect{opacity:0.5;background-color:transparent;fill:transparent;}#mermaid-r14f-r1 .labelBkg{background-color:rgba(0, 0, 0, 0.5);}#mermaid-r14f-r1 .cluster rect{fill:#CC785C;stroke:hsl(15, 12.3364485981%, 48.0392156863%);stroke-width:1px;}#mermaid-r14f-r1 .cluster text{fill:#3387a3;}#mermaid-r14f-r1 .cluster span{color:#3387a3;}#mermaid-r14f-r1 div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:"Anthropic Sans",system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;font-size:12px;background:#CC785C;border:1px solid hsl(15, 12.3364485981%, 48.0392156863%);border-radius:2px;pointer-events:none;z-index:100;}#mermaid-r14f-r1 .flowchartTitleText{text-anchor:middle;font-size:18px;fill:#E5E5E5;}#mermaid-r14f-r1 rect.text{fill:none;stroke-width:0;}#mermaid-r14f-r1 .icon-shape,#mermaid-r14f-r1 .image-shape{background-color:transparent;text-align:center;}#mermaid-r14f-r1 .icon-shape p,#mermaid-r14f-r1 .image-shape p{background-color:transparent;padding:2px;}#mermaid-r14f-r1 .icon-shape .label rect,#mermaid-r14f-r1 .image-shape .label rect{opacity:0.5;background-color:transparent;fill:transparent;}#mermaid-r14f-r1 .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#mermaid-r14f-r1 .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#mermaid-r14f-r1 .node .neo-node{stroke:#A1A1A1;}#mermaid-r14f-r1 [data-look="neo"].node rect,#mermaid-r14f-r1 [data-look="neo"].cluster rect,#mermaid-r14f-r1 [data-look="neo"].node polygon{stroke:url(#mermaid-r14f-r1-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#mermaid-r14f-r1 [data-look="neo"].node path{stroke:url(#mermaid-r14f-r1-gradient);stroke-width:1px;}#mermaid-r14f-r1 [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#mermaid-r14f-r1 [data-look="neo"].node .neo-line path{stroke:#A1A1A1;filter:none;}#mermaid-r14f-r1 [data-look="neo"].node circle{stroke:url(#mermaid-r14f-r1-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#mermaid-r14f-r1 [data-look="neo"].node circle .state-start{fill:#000000;}#mermaid-r14f-r1 [data-look="neo"].icon-shape .icon{fill:url(#mermaid-r14f-r1-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#mermaid-r14f-r1 [data-look="neo"].icon-shape .icon-neo path{stroke:url(#mermaid-r14f-r1-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#mermaid-r14f-r1 :root{--mermaid-font-family:"Anthropic Sans",system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;}📋 Voter Info (voter-info.html)🌐 Public Display (index.html)🔐 Admin Panel (admin.html)Write ScoreonValue ListeneronValue ListeneronValue Listenerดูผลคะแนนกรอกข้อมูลเจ้าหน้าที่กรอกคะแนนFirebase Realtime DBMayor Cards ComponentCouncil Zone TabsComponentLive Score DisplayZone-filtered TableVoter Statisticsประชาชนทั่วไปเจ้าหน้าที่เลือกตั้ง

🗄️ Firebase Data Structure
json{
  "mayors": [
    {
      "name": "ชื่อผู้สมัคร",
      "number": 1,
      "party": "ชื่อพรรค/กลุ่ม",
      "imageUrl": "url_to_image",
      "score": 0
    }
  ],
  "zones": [
    {
      "id": "zone1",
      "name": "เขต 1",
      "candidates": [
        {
          "name": "ชื่อผู้สมัคร",
          "number": 1,
          "score": 0
        }
      ]
    }
  ]
}

🚀 วิธีรันในเครื่อง
ข้อกำหนด

Node.js 16+
Firebase CLI (npm install -g firebase-tools)
Firebase project (สร้างได้ที่ console.firebase.google.com)

ขั้นตอน
bash# 1. Clone repository
git clone https://github.com/kyosuke11z/election-live-results.git
cd election-live-results

# 2. ตั้งค่า Firebase config ใน docs/script.js
# แทนที่ firebaseConfig ด้วยค่าจาก Firebase project ของคุณ

# 3. รัน local server
npx serve docs
# หรือเปิด docs/index.html ใน browser โดยตรง
Deploy ด้วย Firebase Hosting
bashfirebase login
firebase use --add   # เลือก project
firebase deploy

📁 โครงสร้างไฟล์
election-live-results/
├── docs/
│   ├── index.html          # หน้าแสดงผลสาธารณะ (Mayor + Council)
│   ├── admin.html          # หน้า Admin สำหรับกรอกคะแนน
│   ├── voter-info.html     # หน้าข้อมูลผู้มีสิทธิ์เลือกตั้ง
│   ├── script.js           # Firebase listeners + UI logic
│   └── img_placeholder_person.png
├── firebase.json           # Firebase Hosting config
├── .firebaserc             # Firebase project alias
└── package.json

🎯 Key Engineering Decisions
ใช้ Firebase onValue listener แทน polling — ทำให้ UI อัพเดทอัตโนมัติผ่าน WebSocket ทันทีที่ข้อมูลเปลี่ยน ไม่มี latency จาก interval-based polling
ไม่ sort คะแนน real-time — จงใจไม่ sort mayor cards ตามคะแนน เพื่อป้องกัน layout shift ที่ทำให้ผู้ชมสับสนขณะนับคะแนน
DocumentFragment สำหรับ batch DOM update — render candidate cards ทั้งหมดใน fragment ก่อนแล้วค่อย append ครั้งเดียว ลด reflow/repaint

📝 License
MIT License — สามารถนำ architecture ไปปรับใช้กับการเลือกตั้งท้องถิ่นอื่นได้อย่างอิสระ
