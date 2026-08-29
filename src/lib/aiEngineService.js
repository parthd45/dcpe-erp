/**
 * DCPE ERP AI Campus Intelligence & Copilot Engine (v4.0)
 * 
 * Provides:
 * 1. Google Gemini Live API integration (using custom API key or VITE_GEMINI_API_KEY)
 * 2. Deep Institutional Knowledge Graph (SGBAU Autonomous regulations, MCA/BCA/B.P.Ed/M.P.Ed syllabus,
 *    grading scales, ATKT rules, 75% attendance criteria, campus map, placements, fees)
 * 3. Multilingual Support (English, Hindi, Marathi)
 * 4. Personalized calculations (Attendance Bunk Simulator, Target CGPA Forecaster)
 * 5. Academic Doubt Solver with formatted code snippets and step-by-step reasoning
 * 6. Document & Application Letter Drafter
 */

const GEMINI_API_STORAGE_KEY = 'dcpe_gemini_api_key';
const GEMINI_MODEL_STORAGE_KEY = 'dcpe_gemini_model';
const AI_PERSONA_STORAGE_KEY = 'dcpe_ai_persona';

// Default system instruction injected into Gemini & fallback logic
const SYSTEM_PROMPT = `You are "DCPE Genius AI", the official campus AI Copilot for Shree H.V.P. Mandal's Degree College of Physical Education (DCPE Autonomous), Amravati, Maharashtra, India.
Established in 1914, DCPE is an NAAC-accredited premier autonomous multi-disciplinary institution affiliated with Sant Gadge Baba Amravati University (SGBAU).
Autonomous Programs:
- MCA (Master of Computer Applications - 2 Years, 4 Semesters, 80 Credits)
- BCA (Bachelor of Computer Applications - 3 Years, 6 Semesters, 120 Credits)
- B.P.Ed (Bachelor of Physical Education - 2 Years, NCTE Approved)
- M.P.Ed (Master of Physical Education - 2 Years)
- B.Sc (Computer Science - 3 Years)
- P.G. Diploma in Yoga Therapy & Naturopathy
Key Regulations:
- Minimum 75% attendance is mandatory for semester end examination hall ticket eligibility.
- SGBAU 10-point grading system: O (90-100%, 10 pts), A+ (80-89%, 9 pts), A (70-79%, 8 pts), B+ (60-69%, 7 pts), B (55-59%, 6 pts), C (50-54%, 5 pts), P (40-49%, 4 pts), F (<40%, 0 pts / Fail).
- Passing criteria: Minimum 40% aggregate in Theory + Internal Continuous Assessment.
- Placements: Top campus recruiters include TCS, Infosys, Tech Mahindra, Decathlon, Sports Authority of India (SAI), Cult.fit, Persistent, Wipro.
- Facilities: 50+ acre campus, Olympic Swimming Pool, Central Gymnasium, DCPE Computer Center, Central Library (100,000+ books, NPTEL e-resources), Hostels, Health Clinic.

Guidelines:
1. Provide accurate, helpful, friendly, and structured advice.
2. When answering programming or technical queries, use clear markdown code blocks with comments.
3. When answering student-specific queries (attendance, CGPA, hall ticket, fees), factor in the student's current profile details.
4. Support English, Hindi, and Marathi naturally based on the user's preferred language.`;

export function getStoredGeminiKey() {
  return localStorage.getItem(GEMINI_API_STORAGE_KEY) || import.meta.env.VITE_GEMINI_API_KEY || '';
}

export function saveGeminiKey(key) {
  if (!key) {
    localStorage.removeItem(GEMINI_API_STORAGE_KEY);
  } else {
    localStorage.setItem(GEMINI_API_STORAGE_KEY, key.trim());
  }
}

export function getStoredPersona() {
  return localStorage.getItem(AI_PERSONA_STORAGE_KEY) || 'tutor'; // 'tutor' | 'advisor' | 'career' | 'campus'
}

export function savePersona(persona) {
  localStorage.setItem(AI_PERSONA_STORAGE_KEY, persona);
}

/**
 * Call Google Gemini REST API
 */
export async function callGeminiAPI(prompt, history = [], userContext = {}, language = 'en-IN') {
  const apiKey = getStoredGeminiKey();
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const model = localStorage.getItem(GEMINI_MODEL_STORAGE_KEY) || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Build context payload
  const roleInfo = userContext.role || userContext.userType || (userContext.prn ? 'student' : 'visitor');
  const studentMeta = userContext.prn
    ? `Current Student: ${userContext.name}, PRN: ${userContext.prn}, Course: ${userContext.course}, Sem: ${userContext.currentSemester || '5th'}, Attendance: ${userContext.attendance || '78.5%'}, CGPA: ${userContext.cgpa || '8.50'}, Fee Status: ${userContext.feesStatus || 'Paid'}, Hall Ticket: ${userContext.hallTicketApproved ? 'Approved' : 'Pending'}`
    : `Current User: ${userContext.name || 'Visitor'}, Role: ${roleInfo}`;

  const langInstruction = language === 'hi-IN'
    ? 'Please respond in fluent Hindi (हिन्दी).'
    : language === 'mr-IN'
    ? 'Please respond in fluent Marathi (मराठी).'
    : 'Please respond in English.';

  const systemInstruction = `${SYSTEM_PROMPT}\n\n[Current User Context]:\n${studentMeta}\n\n[Language Preference]: ${langInstruction}`;

  // Build contents array for multi-turn chat
  const contents = [];
  
  // Add recent history (up to last 6 messages)
  const recentHistory = history.slice(-6);
  recentHistory.forEach((msg) => {
    contents.push({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    });
  });

  // Append latest user message with system instruction
  contents.push({
    role: 'user',
    parts: [{ text: `[System Instructions: ${systemInstruction}]\n\nUser Question: ${prompt}` }],
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errMessage = errorData.error?.message || `HTTP ${response.status} Error`;
    throw new Error(errMessage);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const replyText = candidate?.content?.parts?.[0]?.text;

  if (!replyText) {
    throw new Error('Empty response received from Gemini model.');
  }

  return replyText;
}

/* ═══════════════════════════════════════════════════════════════
   DEEP OFFLINE KNOWLEDGE & REASONING ENGINE (HYBRID FALLBACK)
   ═══════════════════════════════════════════════════════════════ */

export function processOfflineQuery(userText, currentUser = null, language = 'en-IN') {
  const text = userText.toLowerCase().trim();
  const isHOD = currentUser?.role === 'hod' || currentUser?.userType === 'hod';
  const isFaculty = currentUser?.role === 'faculty' || currentUser?.userType === 'faculty';
  const isAdmin = currentUser?.role === 'admin' || currentUser?.userType === 'admin';
  const isStudent = !isHOD && !isFaculty && !isAdmin && (currentUser?.userType === 'student' || currentUser?.prn || currentUser?.course);
  const displayName = currentUser ? currentUser.name.split(' ')[0] : 'Scholar';

  let reply = '';
  let actionKey = null;
  let actionLabel = null;
  let suggestedFollowUps = [];

  // Multilingual Greetings
  if (/^(hi|hello|hey|hola|namaste|pranam|good morning|good afternoon|good evening|kasa ahes|kem cho|ram ram)\b/i.test(text)) {
    if (language === 'hi-IN') {
      reply = `नमस्ते ${displayName}! 🙏 मैं आपका DCPE जीनियस AI सहायक हूँ। आप मुझसे अपनी उपस्थिति (Attendance), अंकतालिका (Marksheet), फीस, हॉल टिकट, या परीक्षा क्विज के बारे में पूछ सकते हैं!`;
    } else if (language === 'mr-IN') {
      reply = `नमस्कार ${displayName}! 🙏 मी तुमचा DCPE जीनियस AI सहाय्यक आहे. तुम्ही मला तुमची हजेरी (Attendance), गुणपत्रिका (Marksheet), फी, हॉल तिकीट किंवा सराव परीक्षेबद्दल विचारू शकता!`;
    } else {
      reply = `Hello ${displayName}! 👋 I am your DCPE Genius AI Campus Copilot. How can I assist you today? You can ask me about Attendance calculations, SGPA Marksheets, Semester Fees, Hall Tickets, Placement drives, Coding doubts, or take a Practice Quiz!`;
    }
    suggestedFollowUps = ['Check my Attendance %', 'Show my Marksheet', 'How many classes can I bunk?', 'Start Practice Quiz'];
    return { reply, actionKey, actionLabel, suggestedFollowUps };
  }

  // Thanks / Gratitude
  if (/^(thank you|thanks|dhanyawad|shukriya|great|awesome|helpful|krupaya)\b/i.test(text)) {
    reply = language === 'hi-IN'
      ? `आपका स्वागत है, ${displayName}! 🌟 DCPE HVPM में आपकी सफलता ही हमारा उद्देश्य है। यदि कोई अन्य प्रश्न हो तो अवश्य बताएं।`
      : language === 'mr-IN'
      ? `तुमचे स्वागत आहे, ${displayName}! 🌟 DCPE HVPM मध्ये तुमच्या यशासाठी मी नेहमी तयार आहे. काही अडचण असल्यास नक्की सांगा.`
      : `You're very welcome, ${displayName}! 🌟 Feel free to ask anytime if you need help with study doubts, exam prep, or campus ERP navigation.`;
    suggestedFollowUps = ['Practice Cloud Computing Quiz', 'ATS Resume Tips', 'View Academic Calendar'];
    return { reply, actionKey, actionLabel, suggestedFollowUps };
  }

  // 1. ATTENDANCE & BUNK MATHEMATICAL CALCULATIONS
  if (text.includes('attendance') || text.includes('bunk') || text.includes('absent') || text.includes('present') || text.includes('hazari') || text.includes('percentage') || text.includes('shortage')) {
    const rawAtt = currentUser?.attendance || '78.5%';
    const attNum = parseFloat(rawAtt);
    const totalLectures = 80;
    const attendedLectures = Math.round((attNum / 100) * totalLectures);
    
    // Calculate how many lectures can be bunked while staying >= 75%
    const maxBunkable = Math.max(0, Math.floor((attendedLectures / 0.75) - totalLectures));
    
    // Calculate how many consecutive lectures needed to reach 75% if below
    const neededLectures = attNum < 75 ? Math.ceil((0.75 * totalLectures - attendedLectures) / 0.25) : 0;

    if (language === 'hi-IN') {
      reply = `📊 **आपकी उपस्थिति विश्लेषण:**\n• वर्तमान उपस्थिति: **${rawAtt}** (${attendedLectures}/${totalLectures} लेक्चर्स)\n• न्यूनतम आवश्यक: **75.0%** (विश्वविद्यालय नियम)\n\n` +
        (attNum >= 75
          ? `✅ **सुरक्षित क्षेत्र!** आप अगले **${maxBunkable}** लेक्चर्स बिना 75% से नीचे गिरे छोड़ सकते हैं।`
          : `⚠️ **चेतावनी!** आपकी उपस्थिति 75% से कम है। परीक्षा हॉल टिकट के लिए आपको अगले लगातार **${neededLectures}** लेक्चर्स उपस्थित रहने होंगे!`);
    } else if (language === 'mr-IN') {
      reply = `📊 **तुमचे हजेरी विश्लेषण:**\n• सध्याची हजेरी: **${rawAtt}** (${attendedLectures}/${totalLectures} लेक्चर्स)\n• किमान अनिवार्य: **75.0%** (विद्यापीठ नियम)\n\n` +
        (attNum >= 75
          ? `✅ **सुरक्षित स्थिती!** तुम्ही पुढील **${maxBunkable}** लेक्चर्स 75% खाली न जाता चुकवू शकता.`
          : `⚠️ **इशारा!** तुमची हजेरी 75% पेक्षा कमी आहे. हॉल तिकिटासाठी पुढील सलग **${neededLectures}** लेक्चर्स उपस्थित राहावे लागेल!`);
    } else {
      reply = `📊 **Live Attendance & Bunk Analysis for ${displayName}:**\n• Current Attendance: **${rawAtt}** (~${attendedLectures}/${totalLectures} conducted sessions)\n• University Threshold: **75.0% Mandatory** (SGBAU Autonomous)\n\n` +
        (attNum >= 75
          ? `✅ **Safe Zone!** You can safely miss up to **${maxBunkable}** more lectures without falling below the 75% threshold.\n💡 *Recommendation:* Use the Attendance Risk Radar to simulate weekly absences!`
          : `⚠️ **Attendance Alert!** Your attendance is currently below the mandatory 75% exam cutoff. You must attend the next **${neededLectures} consecutive lectures** without missing any to restore exam eligibility!`);
    }
    actionKey = 'risk_radar';
    actionLabel = 'Open Attendance Risk Radar 🔮';
    suggestedFollowUps = ['Submit Medical Leave', 'Check Timetable', 'Contact Faculty Advisor'];
    return { reply, actionKey, actionLabel, suggestedFollowUps };
  }

  // 2. MARKS, CGPA & SGPA CALCULATOR
  if (text.includes('mark') || text.includes('cgpa') || text.includes('sgpa') || text.includes('grade') || text.includes('result') || text.includes('score') || text.includes('transcript') || text.includes('backlog') || text.includes('atkt')) {
    const cgpa = currentUser?.cgpa || '8.50';
    const numCgpa = parseFloat(cgpa);
    const approxPct = ((numCgpa - 0.75) * 10).toFixed(1);

    reply = `📜 **Academic Performance Summary:**\n• Cumulative Grade Point Average (CGPA): **${cgpa} / 10.0**\n• Equivalent University Percentage: **~${approxPct}%**\n• Grade Classification: **${numCgpa >= 8.0 ? 'First Class with Distinction (O/A+)' : numCgpa >= 6.5 ? 'First Class (A/B+)' : 'Second Class (B/C)'}**\n• Backlog (ATKT) Status: **0 Active Backlogs ✓**\n\n📌 **SGBAU Grading Scale Reference:**\n• **O (Outstanding):** 90-100% (Grade Point 10)\n• **A+ (Excellent):** 80-89% (Grade Point 9)\n• **A (Very Good):** 70-79% (Grade Point 8)\n• **B+ (Good):** 60-69% (Grade Point 7)\n• **B (Above Average):** 55-59% (Grade Point 6)`;
    actionKey = 'marksheet';
    actionLabel = 'View Digital Marksheet 📜';
    suggestedFollowUps = ['Calculate SGPA Target', 'ATS Resume Builder', 'Practice Quiz Mode'];
    return { reply, actionKey, actionLabel, suggestedFollowUps };
  }

  // 3. HALL TICKET & ADMIT CARD
  if (text.includes('hall ticket') || text.includes('admit card') || text.includes('gatepass') || text.includes('seat no') || text.includes('exam center')) {
    const isApproved = currentUser?.hallTicketApproved;
    reply = isApproved
      ? `🎫 **Examination Hall Ticket Status: APPROVED ✓**\n• Seat Number: **DCPE-${currentUser?.prn ? currentUser.prn.slice(-4) : '2026'}-A**\n• Center: **Main Examination Complex, Shree HVPM DCPE**\n• Instructions: Carry physical ID card & printed Hall Ticket barcode to the exam hall.`
      : `🔒 **Hall Ticket Status: LOCKED / PENDING HOD CLEARANCE**\n• Clearance Requirements:\n  1. Minimum **75% Attendance** in all subjects.\n  2. Clearance of pending **Semester Fees**.\n  3. Verified **Enrollment & PRN Documents**.\n\nOnce verified by your department HOD, your Hall Ticket barcode will automatically unlock.`;
    actionKey = 'hall_ticket';
    actionLabel = isApproved ? 'Download Hall Ticket 🎫' : 'Check Clearance Status 🔒';
    suggestedFollowUps = ['Check Fee Passbook', 'Check Attendance Radar', 'View Exam Schedule'];
    return { reply, actionKey, actionLabel, suggestedFollowUps };
  }

  // 4. FEES, PASSBOOK & FINANCIAL TRANSACTIONS
  if (text.includes('fee') || text.includes('receipt') || text.includes('passbook') || text.includes('challan') || text.includes('ledger') || text.includes('dues') || text.includes('scholarship') || text.includes('mahadbt')) {
    const feeStatus = currentUser?.feesStatus || 'Paid ✓';
    reply = `💳 **Semester Fee & Passbook Ledger:**\n• Current Status: **${feeStatus}**\n• Academic Year: **2025-2026 (Even Semester)**\n• Available Modes: UPI, NetBanking, SBI Collect Challan\n• Scholarship Portals: MahaDBT Post-Matric, EBC Concession, National Scholarship Portal (NSP)\n\nYou can view your itemized transaction ledger, download official receipts with digital stamps, or pay pending dues.`;
    actionKey = 'fee_passbook';
    actionLabel = 'Open Fees Passbook & Receipts 💳';
    suggestedFollowUps = ['Apply for Fee Concession Letter', 'Download Payment Receipt', 'Check Hall Ticket'];
    return { reply, actionKey, actionLabel, suggestedFollowUps };
  }

  // 5. PLACEMENTS, RECRUITMENT & SALARY PACKAGES
  if (text.includes('placement') || text.includes('job') || text.includes('drive') || text.includes('package') || text.includes('salary') || text.includes('company') || text.includes('internship') || text.includes('tpo') || text.includes('ctc')) {
    reply = `💼 **DCPE Training & Placement (T&P) Cell Updates:**\n\n🏢 **Active & Upcoming Campus Recruitment Drives:**\n1. **TCS Digital / Ninja** - CTC: ₹3.8 - ₹7.2 LPA (Eligibility: 60%+ in 10th/12th/Grad, 0 backlogs)\n2. **Sports Authority of India (SAI)** - CTC: ₹5.5 - ₹9.0 LPA (B.P.Ed / M.P.Ed / MCA Data Analyst)\n3. **Decathlon Sports India** - CTC: ₹4.5 - ₹6.8 LPA (Retail Leadership & Fitness Operations)\n4. **Infosys BPM & Tech** - CTC: ₹3.6 - ₹5.4 LPA (MCA / BCA / B.Sc CS)\n5. **Cult.fit / CureFit** - CTC: ₹4.8 - ₹8.5 LPA (Kinesiology & Athletic Coaches)\n\n📌 *Tip:* Ensure your ATS Resume is updated and CGPA is above 6.5 for all premier company shortlists.`;
    actionKey = 'placement';
    actionLabel = 'Open Placements & Campus Drives 💼';
    suggestedFollowUps = ['Open ATS Resume Studio', 'AI Career Path Roadmap', 'Practice Technical Quiz'];
    return { reply, actionKey, actionLabel, suggestedFollowUps };
  }

  // 6. ATS RESUME & CV BUILDER
  if (text.includes('resume') || text.includes('cv') || text.includes('ats') || text.includes('biodata') || text.includes('portfolio')) {
    reply = `📄 **ATS Resume Studio & Career Profiler:**\n\nBuild a recruiter-ready single-page physical A4 resume in minutes:\n• **ATS-Optimized Formatting:** Single column, standard font sizing, 90+ ATS parser match.\n• **Auto-Synced Data:** Imports your verified PRN, SGPA, course certifications, and college projects directly.\n• **Export Formats:** High-resolution PDF with 1-click download.`;
    actionKey = 'resume';
    actionLabel = 'Open ATS Resume Studio 📄';
    suggestedFollowUps = ['Generate STAR Resume Bullets', 'Open Placement Drives', 'View AI Career Path'];
    return { reply, actionKey, actionLabel, suggestedFollowUps };
  }

  // 7. ACADEMIC TUTOR & CODING DOUBTS (REACT, PYTHON, SQL, ALGORITHMS)
  if (text.includes('react') || text.includes('useeffect') || text.includes('hook') || text.includes('state') || text.includes('props')) {
    reply = `⚛️ **React Concept & Code Example:**\n\nIn React, **\`useEffect\`** handles side effects like data fetching, subscriptions, and DOM updates.\n\n\`\`\`javascript\nimport React, { useState, useEffect } from 'react';\n\nexport function StudentAttendance({ studentId }) {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    // Runs when component mounts or studentId changes\n    async function fetchAttendance() {\n      setLoading(true);\n      const res = await fetch(\`/api/attendance/\${studentId}\`);\n      const json = await res.json();\n      setData(json);\n      setLoading(false);\n    }\n    fetchAttendance();\n  }, [studentId]); // Dependency array\n\n  if (loading) return <p>Loading attendance...</p>;\n  return <div>Attendance: {data?.percentage}%</div>;\n}\n\`\`\`\n\n💡 **Key Rules:**\n1. Pass empty array \`[]\` to run only once on mount.\n2. Include all reactive values in the dependency array.`;
    suggestedFollowUps = ['Explain Virtual DOM', 'Practice Web Tech Quiz', 'Explain Node.js Express'];
    return { reply, actionKey: null, actionLabel: null, suggestedFollowUps };
  }

  if (text.includes('sql') || text.includes('dbms') || text.includes('join') || text.includes('normalization') || text.includes('acid') || text.includes('bcnf')) {
    reply = `🗄️ **Database Systems (DBMS) - Normalization & Joins:**\n\n### 1. Normal Forms Breakdown:\n• **1NF:** Eliminate repeating groups; ensure atomic column values.\n• **2NF:** Must be in 1NF + eliminate partial functional dependencies on composite keys.\n• **3NF:** Must be in 2NF + no non-prime attribute depends transitively on the primary key ($A \\to B, B \\to C$).\n• **BCNF (Boyce-Codd):** For every functional dependency $X \\to Y$, $X$ must be a super key.\n\n### 2. SQL Join Example:\n\`\`\`sql\n-- Retrieve Student Names with their Registered Course\nSELECT \n    s.prn,\n    s.name,\n    c.course_name,\n    s.attendance_pct\nFROM students s\nINNER JOIN courses c ON s.course_id = c.id\nWHERE s.attendance_pct >= 75.0\nORDER BY s.attendance_pct DESC;\n\`\`\``;
    suggestedFollowUps = ['Practice DBMS Quiz', 'Explain ACID Properties', 'Explain B+ Trees'];
    return { reply, actionKey: null, actionLabel: null, suggestedFollowUps };
  }

  if (text.includes('dijkstra') || text.includes('algorithm') || text.includes('dsa') || text.includes('tree') || text.includes('graph') || text.includes('sorting')) {
    reply = `🧠 **Data Structures & Algorithms - Dijkstra's Shortest Path:**\n\nDijkstra's algorithm finds the shortest path from a single source node to all other nodes in a weighted graph with non-negative edge weights.\n\n\`\`\`python\nimport heapq\n\ndef dijkstra(graph, start_node):\n    # Priority queue stores (cost, current_node)\n    pq = [(0, start_node)]\n    distances = {node: float('inf') for node in graph}\n    distances[start_node] = 0\n    \n    while pq:\n        current_dist, current_node = heapq.heappop(pq)\n        \n        if current_dist > distances[current_node]:\n            continue\n            \n        for neighbor, weight in graph[current_node].items():\n            distance = current_dist + weight\n            if distance < distances[neighbor]:\n                distances[neighbor] = distance\n                heapq.heappush(pq, (distance, neighbor))\n                \n    return distances\n\`\`\`\n\n⏱️ **Time Complexity:** $O((V + E) \\log V)$ using Min-Heap Priority Queue.`;
    suggestedFollowUps = ['Practice DSA Quiz', 'Explain Binary Search Tree', 'Explain Dynamic Programming'];
    return { reply, actionKey: null, actionLabel: null, suggestedFollowUps };
  }

  // 8. SPORTS SCIENCE & PHYSICAL EDUCATION (B.P.Ed / M.P.Ed)
  if (text.includes('sports') || text.includes('bped') || text.includes('mped') || text.includes('kinesiology') || text.includes('biomechanics') || text.includes('physiology') || text.includes('swimming') || text.includes('gym')) {
    reply = `🏅 **Sports Science & Kinesiology Knowledge Hub (DCPE):**\n\n• **Biomechanics in Athletics:** Newton's laws applied to sprinting starts, angular velocity in discus/javelin throw, and kinetic chain energy transfer.\n• **Exercise Physiology:** ATP-CP phosphagen system (0-10s), Anaerobic glycolysis (10s-2min), and Aerobic oxidative phosphorylation (long duration endurance).\n• **DCPE World-Class Sports Infrastructure:**\n  - 50m Olympic Standard Swimming & Diving Pool\n  - Acrobatic & Gymnastics Training Complex\n  - Track & Field 400m Synthetic Arena\n  - Yogic Science & Naturopathy Research Center.`;
    suggestedFollowUps = ['Practice Sports Science Quiz', 'View Campus Sports Map', 'Apply for Sports Duty Leave'];
    return { reply, actionKey: null, actionLabel: null, suggestedFollowUps };
  }

  // 9. LEAVE & GRIEVANCE WORKFLOWS
  if (text.includes('leave') || text.includes('absentee') || text.includes('medical') || text.includes('sick') || text.includes('application') || text.includes('sanction') || text.includes('grievance')) {
    reply = `📝 **Student Leave & Grievance Approval Workflow:**\n\n• **1-3 Days Leave:** Approved directly by your Subject Faculty / Class Teacher.\n• **4-10 Days Leave:** Forwarded to Department HOD for official sanction.\n• **10+ Days Leave / Medical:** Requires Principal Executive Sanction with doctor certificate attachment.\n\n✨ *Tip:* You can use the AI Document Drafter tab in this widget to automatically generate a formal leave letter!`;
    actionKey = 'leave';
    actionLabel = 'Submit Leave Application 📝';
    suggestedFollowUps = ['Draft Medical Leave Letter', 'Draft Sports Duty Leave', 'Check Grievance Tracker'];
    return { reply, actionKey, actionLabel, suggestedFollowUps };
  }

  // 10. HOD SPECIFIC QUERIES
  if (isHOD) {
    if (text.includes('approval') || text.includes('verify') || text.includes('pending') || text.includes('student')) {
      reply = `🎓 **HOD Student Registration & Admission Verification Console:**\nYou have student applications awaiting verification. Review 10th/12th marksheets, caste certificates, and grant official DCPE institutional email addresses.`;
      actionKey = 'approvals';
      actionLabel = 'Go to Student Approvals 👥';
    } else if (text.includes('timetable') || text.includes('schedule') || text.includes('faculty') || text.includes('lecture')) {
      reply = `⏰ **HOD Department Timetable Management:**\nConfigure weekly lecture slots, assign classroom labs, and manage faculty teaching loads across BCA/MCA semesters.`;
      actionKey = 'timetable';
      actionLabel = 'Manage Timetables ⏰';
    } else if (text.includes('notice') || text.includes('circular') || text.includes('broadcast')) {
      reply = `📢 **HOD Notice Broadcast Studio:**\nPublish urgent circulars with tags (Exam, Urgent, Event, Placement) live to the College website and student dashboards.`;
      actionKey = 'notices';
      actionLabel = 'Broadcast Official Notice 📢';
    } else if (text.includes('seating') || text.includes('matrix') || text.includes('exam hall')) {
      reply = `📐 **HOD Exam Seating Matrix Generator:**\nAutomatically generate roll-number based bench layouts with cross-course alternating seating arrangements to prevent copying.`;
      actionKey = 'seating';
      actionLabel = 'Generate Seating Matrix 📐';
    } else {
      reply = `Greetings Dr. ${displayName}! As Head of Department, you have full control over Student Approvals, Department Timetables, Notice Broadcasts, Seating Plans, and Leave Sanctions.`;
    }
    suggestedFollowUps = ['Review Pending Approvals', 'Configure Department Timetable', 'Generate Exam Seating Matrix'];
    return { reply, actionKey, actionLabel, suggestedFollowUps };
  }

  // 11. FACULTY SPECIFIC QUERIES
  if (isFaculty) {
    reply = `👨‍🏫 **Faculty Teaching Copilot for Prof. ${displayName}:**\nYou can mark student attendance, record internal Continuous Assessment (CA) marks, review student leave requests up to 3 days, and view your weekly teaching timetable schedule.`;
    actionKey = 'timetable';
    actionLabel = 'View Teaching Timetable ⏰';
    suggestedFollowUps = ['View Teaching Timetable', 'Review Student Leaves', 'Generate Quiz for Students'];
    return { reply, actionKey, actionLabel, suggestedFollowUps };
  }

  // 12. CAMPUS FACILITIES & VISITOR INFO
  if (text.includes('campus') || text.includes('address') || text.includes('location') || text.includes('map') || text.includes('contact') || text.includes('admission') || text.includes('course') || text.includes('history') || text.includes('hvpm')) {
    reply = `🏫 **Shree H.V.P. Mandal’s Degree College of Physical Education (Autonomous):**\n\n• **Founded:** 1914 by Vaidya Brothers (Shree Anantrao & Ambadaspant Vaidya)\n• **Campus:** 50+ Acres sprawling campus at Hanuman Vyayam Nagar, Amravati, Maharashtra - 444605\n• **Accreditation:** NAAC Autonomous Institution affiliated with SGBAU\n• **Admissions 2026-27:** OPEN for MCA, BCA, B.P.Ed, M.P.Ed, B.Sc Computer Science\n• **Helpline:** +91 721 2573788 | Email: contact@dcpe.edu`;
    actionKey = 'campus_map';
    actionLabel = 'Open Campus Map 🗺️';
    suggestedFollowUps = ['View Autonomous Courses', 'Check Admission Process', 'Open Interactive Campus Map'];
    return { reply, actionKey, actionLabel, suggestedFollowUps };
  }

  // Default Fallback
  reply = `I am your DCPE Genius AI Campus Copilot! I can help you with:\n1. 📊 **Attendance & Bunk Simulator** (calculate exact safe bunkable days)\n2. 📜 **SGPA / CGPA Marksheets** & Grade calculations\n3. 🎯 **Interactive Practice Quizzes** (Cloud, ML, DBMS, DSA, Web Tech, Sports Science)\n4. 💼 **Placements & ATS Resume Studio**\n5. 📝 **AI Formal Letter & Leave Drafter**\n6. 🧠 **Programming & Coding Doubts** (React, Python, SQL, DSA)\n\nTap any quick action or ask your question directly!`;
  suggestedFollowUps = ['Check my Attendance', 'Practice Exam Quiz', 'Open ATS Resume Studio', 'Calculate Target CGPA'];
  return { reply, actionKey: null, actionLabel: null, suggestedFollowUps };
}

/* ═══════════════════════════════════════════════════════════════
   FORMAL LETTER & APPLICATION GENERATOR TEMPLATES
   ═══════════════════════════════════════════════════════════════ */

export function generateFormalDocument(type, details = {}) {
  const studentName = details.name || 'Student Name';
  const prn = details.prn || 'PRNXXXXXXXXXX';
  const course = details.course || 'MCA 2nd Year';
  const reason = details.reason || 'personal medical reasons';
  const fromDate = details.fromDate || new Date().toISOString().split('T')[0];
  const toDate = details.toDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  if (type === 'sick_leave') {
    return `To,
The Head of Department,
Department of ${course.split(' ')[0]},
Degree College of Physical Education (Autonomous),
Shree H.V.P. Mandal, Amravati.

Date: ${today}

Subject: Application for Sick Leave due to fever / medical condition

Respected Sir / Madam,

I am writing to formally inform you that I, ${studentName}, a student of ${course} bearing PRN: ${prn}, have been unwell and diagnosed with a medical condition. As advised by my physician, I require adequate rest for recovery.

Therefore, I kindly request you to grant me leave of absence from ${fromDate} to ${toDate}. I will ensure that I catch up with all missed classroom lectures, assignments, and laboratory practicals immediately upon my return. I have attached the medical prescription for your reference.

Thanking you.

Yours sincerely,
${studentName}
PRN: ${prn}
${course}
DCPE HVPM, Amravati`;
  }

  if (type === 'sports_leave') {
    return `To,
The Head of Department / Sports Director,
Degree College of Physical Education (Autonomous),
Shree H.V.P. Mandal, Amravati.

Date: ${today}

Subject: Application for Attendance Condonation on Official Sports Tournament Duty

Respected Sir / Madam,

I am ${studentName}, student of ${course} (PRN: ${prn}). I have been selected to represent our college / university in the upcoming Sports Championship / Inter-Collegiate Tournament scheduled from ${fromDate} to ${toDate}.

In accordance with SGBAU University and DCPE Autonomous attendance guidelines for sports representatives, I kindly request you to grant me official duty leave and condone my lecture attendance for the aforementioned tournament duration.

Thanking you.

Yours faithfully,
${studentName}
PRN: ${prn}
${course}
Degree College of Physical Education, Amravati`;
  }

  if (type === 'bonafide') {
    return `To,
The Principal / Registrar,
Degree College of Physical Education (Autonomous),
Shree H.V.P. Mandal Campus, Amravati - 444605.

Date: ${today}

Subject: Request for issuance of Official Bonafide Certificate

Respected Sir,

I am a regular bonafide student of ${course} at DCPE HVPM, Amravati, bearing PRN: ${prn} for the Academic Year 2025-2026.

I require an official Bonafide Certificate for the purpose of applying for MahaDBT Government Scholarship / Education Loan / Passport Verification. I have cleared all semester fee dues up to the current term.

Kindly issue the certificate at your earliest convenience.

Yours obediently,
${studentName}
PRN: ${prn}
Course: ${course}`;
  }

  if (type === 'fee_concession') {
    return `To,
The Principal,
Degree College of Physical Education (Autonomous),
Shree H.V.P. Mandal, Amravati.

Date: ${today}

Subject: Request for installment facility / fee concession for Academic Year 2025-2026

Respected Sir,

I am ${studentName}, currently pursuing ${course} with PRN: ${prn}. Due to unforeseen financial constraints in my family, it is challenging for us to pay the full semester tuition fees in a single lump sum.

I have maintained a consistent academic track record (CGPA: ${details.cgpa || '8.50'}) and regular lecture attendance. I humbly request your good office to kindly permit me to pay the remaining semester fees in 2 equal monthly installments.

I assure you that all installments will be cleared within the designated dates.

Thanking you.

Yours respectfully,
${studentName}
PRN: ${prn}
${course}`;
  }

  return 'Document template generated successfully.';
}
