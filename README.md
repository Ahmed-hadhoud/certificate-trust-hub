# Certificate Trust Hub

D4 – Prototype Build Prompt
Paste everything below the line into Claude Code, v0, Lovable or a similar builder. It describes a working prototype of the Career-180 certificate trust layer.
Role and goal
You are a senior product engineer. Build a working prototype (not production code) of a certificate verification experience for an EdTech platform called Career-180. Anyone who receives a certificate can enter a certificate ID or code, see whether the certificate is authentic (layer 1), and then see how much to trust it based on evidence (layer 2, the trust layer). Everything must run in the browser with no backend: React + TypeScript + Tailwind, state in memory and persisted to localStorage, seed data loaded from JSON. Include a Reset demo data button.
The prototype must make these decisions visible and testable. Follow the rules in Section 3 exactly; they are product decisions, not suggestions.
1. Areas to build
1. Verifier page (public, no login): the main screen. Enter an ID or code, see the result, open the evidence.
2. Learner area (demo login dropdown listing all 24 learners): level, missing items, attempts, upgrade, sharing setting, access requests, policy notice.
3. Admin area (demo, no login): revoke, disputes, course configuration, policy publishing, event log.
4. Course page: the enrollment disclosure.
5. Demo tools (small floating panel): fast-forward days, reset data, export data.
2. Visual direction
The layer-1 screen must look like the reference screenshots the product owner shared of an existing certificate verification page. Reproduce the style and layout, but use Career-180 naming and a neutral logo placeholder (do not reuse another company’s name or logo):
• Near-black page with a subtle grid and a soft blue-to-purple glow at the top; a pill badge with a shield icon and the text “Secure Verification System”.
• Large two-line title: “Certificate” in white, “Verification” below it with a blue-to-purple gradient; a muted one-line subtitle.
• A rounded dark card with the label “Certificate ID” and a segmented input (one box per character, auto-advance, paste support). Two tabs above the boxes: Certificate ID (6 digits) and Verification code (8 characters). Pressing Enter or filling all boxes verifies.
• On success, a green result panel with a check icon and “Certificate Verified Successfully”, showing Full Name, Course, Certificate Number, Status (a green dot and “Valid”). Under it, a light certificate preview card (rendered with HTML, not an image) and two buttons: a blue-to-purple “Download Certificate” and a blue “Add to LinkedIn Profile” (both can be mock).
• Footer: “© 2027 Career-180. All rights reserved.”
• The certificate preview shows the learner name, course name, a QR code and the short code and certificate ID (“To verify, scan the QR or enter the ID”). It does not need to show the issue date.
• Keep every other screen in the same dark style. Mobile friendly. English only.
The trust layer (Section 4) is added below the green panel as extra cards, so the first thing a verifier sees is still the layer-1 result.
3. Domain rules (implement exactly)
Terms. Verifier is anyone who checks a certificate (employer, recruiter, partner or other). Level is Completed or Verified. Required items are the graded quizzes, exams and project flagged required for the course version.
Certificate states (four): Completed, Verified, Legacy, Revoked. Lookup results are Valid, Revoked or Not found; Not found is a lookup result, not a state. There is no expiry and no Expired state.
Transitions.
• Finish a course: Completed, unless every required item is at 70 or more, then Verified.
• Completed to Verified when the last missing required item reaches 70 or more. Same certificate ID.
• Legacy to Verified when every required item of the current course version reaches 70 or more. Same ID. The shown issue date becomes the upgrade date; the previous date and state stay in the certificate history (visible in Admin only).
• Existing certificates issued before 1 Jan 2027 are Legacy.
• Any state to Revoked by an admin, with a reason (error, fraud or legal) and a date. Revoked is final.
• A certificate never moves down. Changing a course’s required flags never downgrades an existing certificate.
• No state change for: a course revision (a notice only), a policy change (a notice only), a failed attempt.
Grading. Each item is scored 0–100. Bands: 70–79 Good, 80–89 Very good, 90–100 Excellent; below 70 is “Not passed”. The best attempt counts. 5 attempts per item; after 5 failed attempts the item is locked until the learner retakes the course, which resets attempts. Final course grade: if the course has a project it counts 50% and the other items share the other 50% equally; otherwise all items count equally. The final grade band is informational. Verified depends only on every required item being at 70 or more. A course with no required items always ends at Completed and says “This course has no assessment.”
Verified explanation (the (i) icon next to Verified). “Verified means the learner passed all the quizzes and assessments, and the course project where the course has one, each with at least 70%. It shows how much the learner benefited from the course and how far their skills in it can be trusted.”
Legacy. A Legacy certificate shows the badge “Legacy”, the notice “Issued under the previous standard”, and an (i) that opens the old policy text: “Before 1 Jan 2027 a certificate meant the learner finished the course. No assessment results were checked or shown.” The learner can upgrade for free by passing the current required items.
Newer course version. Every certificate stores the course version it was earned on. If the course has a later version, show a notice: “A newer version of this course exists (vN): <change note>”. The state does not change.
Flags shown on every Valid result: learner source (“Corporate-enrolled” or “Self-directed”), course name and version, policy in force at issue.
Sharing. One general setting per learner for all their certificates: results public (default) or private. Public: any verifier can open the evidence. Private: the verifier sees validity and level only and can request access.
Access requests. The verifier enters an email and a name or company. At most 3 requests per email per learner (the fourth shows a clear message). The learner sees who is asking and approves or declines in the Learner area; the requester sees the answer. Approved access lasts 14 days from approval. A pending request expires 14 days after it was created and the requester sees “Expired”. The verifier’s email is remembered in localStorage so they can check status and reopen the results while access is valid. Company admin login is out of scope.
Lookup slowdown. After 5 Not found lookups within 60 seconds, block further lookups for 30 seconds with a friendly message.
Disputes. On Valid and Revoked results, a “Dispute this result” link opens a form (reason, contact email) and creates a dispute record. In Admin, a dispute is reviewed: upheld (then the admin corrects the certificate by editing name, course or dates, with a history entry, or revokes it) or rejected (nothing changes). The outcome is recorded.
Policy change notice. Admin can publish a new policy version with a summary. Learners see a banner that explains what changed and links to the sharing setting. It is information only: no acceptance, nothing is blocked.
Course configuration. Admin can toggle which items are required per course and publish a new course version, which requires a change note. Existing certificates keep their state.
4. Screens and behavior
4.1 Verifier page (result states)
• Valid: the green panel (layer 1) plus a trust card: level badge (Completed, or Completed and Verified with the (i) popover), learner source badge, course and version, certificate ID and short code, the Legacy notice and newer-version notice where they apply, and a View results button on Verified certificates. Below, the links “Dispute this result”.
• Revoked: a red panel with “Revoked on <date>”, the certificate is not presented as valid, evidence is hidden, dispute link visible.
• Not found: an amber panel: “We could not find a certificate with this ID or code. Check the characters and try again, or contact Career-180.” Never show suggestions.
• Completed certificates have no evidence page. If the course has no assessment the card says so.
• Sample chips under the input (“Try a sample”) grouped by case, so a reviewer can jump to any record in one click.
4.2 Evidence page (View results)
• If results are public (or the verifier has valid approved access): a page listing every required item with its type (quiz, exam, project; label proctored exams), score, band, attempts used; the project with its instructor feedback text; the final course grade with its band; the (i) explanation. Mark the page “Public results” or “Shared with you until <date>”.
• If private and no valid access: a “Results are private” card with a Request access form (email, name or company) and the request status (pending, approved, declined, expired) if one exists.
4.3 AI summary (working in the prototype)
On the evidence page, a Summarize performance button opens a dialog with an AI-style summary and a chat box. Show three suggested questions as buttons: “Summarize this learner’s performance”, “What are the strengths and weaknesses?”, “Which skills are best evidenced, and which are not?”. Free-text questions also work. Implement the answers with a deterministic generator built from the learner’s items (highest and lowest items, bands, missing items, project feedback), so it works offline; optionally call an LLM if an API key is configured. Always show the label “AI-generated summary. It is not evidence.” For questions outside the evidence, answer “I can only answer from the evidence on this page.” This feature is a prototype only and is out of the MVP.
4.4 Learner area
A demo login dropdown. For the selected learner show: their certificate (level, state, issue date), an items table with score, band, attempts used and remaining, and a missing items card for Completed certificates that lists what is missing and explains Completed versus Verified. Buttons for the demo: Simulate passing remaining items (sets missing or failed items to 85 and recalculates; Completed becomes Verified on the same ID), Upgrade for free for Legacy certificates (lists the current required items; Simulate passing all upgrades the same ID, sets the issue date to the prototype’s today and keeps the old record in history), Retake course when an item is locked. The sharing setting toggle (public or private). An access requests inbox with Approve and Decline. The policy banner when a new policy has been published.
4.5 Admin area (tabs)
• Certificates: list with state filter, history view, and Revoke (reason and date).
• Disputes: list with status; review actions as in Section 3.
• Courses: required toggles per item, version history, Publish new version with a required change note.
• Policy: publish a policy change with a summary.
• Events: the event log table with filters and a CSV export, plus tiles for total lookups, Not found rate, evidence opens, Verified share of certificates, access requests by status, and upheld disputes.
4.6 Course page
For each course: name, version, the items required for Verified, and the disclosure text: “Your results are public by default. Anyone who has your certificate ID or QR can see your scores and project feedback. You can switch to private at any time in your profile settings.”
4.7 Demo tools
The prototype clock starts at 15 March 2027. A Fast-forward 14 days button advances it (access and requests expire accordingly). Reset demo data restores the seed. Export data downloads certificates, results, requests, disputes and events as JSON and CSV.
5. Seed data
Courses (current version in bold).
Course
Versions and required items
Change note for the latest version
Intro to Digital Marketing
v1: none
–
Excel for Business
v1: none; v2: Q1, Q2, Q3 (auto-graded quizzes)
v2: Added three graded quizzes and a module on pivot tables.
SQL Fundamentals
v1: Q1, Q2 (quizzes), Exam (proctored)
–
Product Management Essentials
v1: none; v2: Q1, Q2; v3: Q1, Q2, Project
v3: Added a graded final project and a module on discovery interviews.
Data Analysis with Python
v1: Q1, Q2, Exam (proctored), Project
–
Customer Service Skills
v1: none
–
Project Management Basics
v1: Q1; v2: Q1, Q2
v2: Added a second quiz on risk management.
UX Design Fundamentals
v1: Q1, Q2, Project
–
Item format below: score (attempts used). IDs are 6 digits; codes use the alphabet ABCDEFGHJKMNPQRSTUVWXYZ23456789 (no look-alike characters).
Certificates (24). Corporate learners belong to Nile Telecom, Delta Bank or Cairo Logistics.
#
Cert ID
Code
Learner
Source
Course (version at issue)
Issued
State
Results
Items
Case
1
483201
K7M2QX9P
Mona Hassan
Self-directed
Intro to Digital Marketing (v1)
2027-01-20
Completed
public
none
No-assessment course
2
517764
H4R8TW3N
Karim Adel
Nile Telecom
Customer Service Skills (v1)
2027-02-02
Completed
public
none
No assessment, corporate
3
629038
P9D5VC6J
Salma Nabil
Self-directed
Excel for Business (v2)
2027-01-28
Verified
public
Q1 88 (1), Q2 92 (1), Q3 79 (2)
Auto-graded quizzes only
4
704455
W3F7ZB2K
Omar Fathy
Delta Bank
Excel for Business (v2)
2027-02-10
Completed
public
Q1 90 (1), Q2 65 (3), Q3 not taken
Corporate, unfinished items
5
316982
T6N4XK8D
Nour Ibrahim
Self-directed
SQL Fundamentals (v1)
2027-02-14
Verified
public
Q1 85 (1), Q2 81 (2), Exam 91 (1)
Proctored exam path
6
852147
B8Q2MR5Y
Youssef Ali
Self-directed
SQL Fundamentals (v1)
2027-02-16
Completed
public
Q1 78 (1), Q2 74 (2), Exam 62 (5, locked)
Attempts exhausted
7
245890
G5K9HC4V
Hana Samir
Self-directed
Product Management Essentials (v2)
2027-01-12
Verified
public
Q1 84 (1), Q2 87 (1)
Course revised after issue (v3 adds a project)
8
931626
S2Y6PJ7K
Ahmed Mostafa
Cairo Logistics
Product Management Essentials (v3)
2027-03-01
Verified
private
Q1 80 (1), Q2 83 (2), Project 76 (1)
Private, corporate
9
478053
D7C3NV9R
Laila Khaled
Self-directed
Data Analysis with Python (v1)
2027-02-20
Verified
public
Q1 91, Q2 88, Exam 95, Project 97 (1 each)
All three assessment types, Excellent
10
660219
M4H8GT2X
Mahmoud Zaki
Self-directed
Data Analysis with Python (v1)
2027-02-22
Completed
public
Q1 82, Q2 79, Exam 71, Project not submitted
Missing project
11
394871
R9K5WD6B
Dina Farouk
Self-directed
UX Design Fundamentals (v1)
2027-03-05
Verified
private
Q1 76 (1), Q2 81 (1), Project 84 (1)
Private, self-directed
12
187326
X3V7QP4C
Tarek Hamdy
Nile Telecom
UX Design Fundamentals (v1)
2027-03-06
Completed
public
Q1 58 (4), Q2 62 (3), Project not submitted
Corporate, low engagement
13
752904
J6B2KN8T
Rana Wael
Self-directed
Project Management Basics (v1)
2027-01-25
Completed
public
Q1 68 (2)
Below 70, course since revised
14
603518
F8Z4KS3M
Sherif Magdy
Delta Bank
Project Management Basics (v2)
2027-03-02
Verified
public
Q1 90 (1), Q2 86 (1)
Corporate, Verified
15
218443
N5W9DG7H
Amira Tawfik
Self-directed
Intro to Digital Marketing (v1)
2025-11-04
Legacy
public
no stored results
Legacy, no-assessment course
16
549077
V2T6RC5Q
Hossam Naguib
Self-directed
Excel for Business (v1)
2025-09-18
Legacy
public
no stored results
Legacy, can upgrade, course now has quizzes
17
826391
Z7M3YX9F
Nadine Sherif
Cairo Logistics
Customer Service Skills (v1)
2025-12-10
Legacy
public
none
Legacy, corporate
18
371560
Q4P8JH2W
Walid Saad
Self-directed
SQL Fundamentals (v1)
2026-06-30
Legacy
public
no stored results
Legacy, course has a proctored exam
19
940285
Q9S5BN6E
Reem Gaber
Self-directed
Product Management Essentials (v1)
2026-03-15
Legacy
private
no stored results
Legacy and newer version (v3)
20
135792
C3G7FK4Z
Mostafa Ragab
Self-directed
Excel for Business (v2)
2027-01-30
Revoked (error, 2027-02-12)
public
hidden
Issued by mistake
21
468210
Y8D2VT5N
Heba Mansour
Nile Telecom
Data Analysis with Python (v1)
2027-02-25
Revoked (fraud, 2027-03-10)
public
hidden
Fraud confirmed
22
697134
U6X4HM9A
Ali Hassan
Self-directed
UX Design Fundamentals (v1)
shown 2027-03-08 (original 2026-04-02, Legacy)
Verified
public
Q1 79 (2), Q2 82 (1), Project 88 (1)
Upgraded from Legacy, same ID
23
285946
E5R9WC3S
Farida Younis
Self-directed
Customer Service Skills (v1)
2027-03-09
Completed
public
none
No assessment, self-directed
24
713859
K2J6NB8G
Karim Samir
Delta Bank
SQL Fundamentals (v1)
2027-02-27
Verified
public
Q1 72 (3), Q2 74 (2), Exam 83 (1)
Corporate, Good band minimum
Project feedback texts. #8: “Good structure; trade-offs were explained briefly. Add more evidence for the assumptions.” #9: “Excellent analysis and a clear story. The code is clean and well documented.” #11: “Solid research and readable prototypes; the accessibility notes were thin.” #22: “Thoughtful flows and clear rationale; strong visual hierarchy.”
Also seed:
• Lookups that must return Not found: ID 000000 and code ZZZZZZZZ.
• Access requests: on #11, pending from recruiter@acme-hr.example (Acme HR) created 2027-03-12; on #8, approved on 2027-03-10 for talent@sample-partner.example, valid until 2027-03-24.
• Disputes: on #7, open, reason “The course now has a project and this certificate does not reflect it”, contact verifier@sample-employer.example; on #3, rejected, outcome “Evidence checked; certificate unchanged”.
• Policy versions: v1 “Pre-standard” (until 2026-12-31); v2 “Trust Standard 1.0” (from 2027-01-01): results are public by default, Verified requires all required items at 70 or more, certificates are never downgraded.
• Sharing setting: private for #8, #11 and #19; public for everyone else.
• Learner ID format: the 24 learners above; one certificate each.
6. Events to log
Log every key action with a timestamp, certificate ID and payload: lookup found, lookup not found, lookup blocked, evidence opened, AI summary opened, access requested, approved, declined, expired, setting changed, assessment passed (simulated), certificate upgraded, certificate revoked, dispute opened, dispute closed, policy published, policy banner seen, course version published.
7. Acceptance checklist
1. Entering 245890 shows the green panel, Completed and Verified with the (i), the newer-version notice for v3, and a working View results button.
2. Entering 483201 shows Completed with “This course has no assessment” and no evidence page.
3. Entering 940285 or its code shows Legacy, the old-policy (i) and the newer-version notice; the evidence is private.
4. Entering 135792 shows Revoked with its date and no evidence; 000000 shows Not found; six quick wrong lookups trigger the slowdown message.
5. On 394871 (private) a verifier can request access; the fourth request from one email for one learner is refused; the learner can approve or decline; approved access opens the evidence for 14 days; Fast-forward 14 days expires it.
6. The AI summary dialog works with the three suggested questions and always shows the “not evidence” label.
7. In the Learner area, simulating the missing items for Omar Fathy (#4) turns Completed into Verified on the same ID.
8. Upgrading Hossam Naguib (#16) keeps ID 549077, makes the issue date the current prototype date, and keeps the old date in the history.
9. Admin revoke makes the verifier page show Revoked immediately; a revoked certificate cannot be restored.
10. Publishing a new course version with a change note adds the newer-version notice to older certificates without changing any state.
11. Changing a required flag never downgrades an existing certificate.
12. A dispute submitted on a result appears in Admin, and its outcome is recorded.
13. Publishing a policy change shows the info-only banner to learners; nothing is blocked.
14. The Events tab shows every action above and exports CSV.
15. All data can be exported and reset.
8. Suggested three-minute demo path
1. Enter 245890: layer 1, then the trust card, the notice and View results; open the AI summary.
2. Enter 394871 (private): request access; switch to the learner Dina Farouk, approve; return and open the results.
3. Enter 549077 (Legacy): show the notice and (i); in the Learner area upgrade it; verify again with the same ID.
4. Enter 135792 (Revoked) and 000000 (Not found).
5. Open Admin: disputes, course version publish, the Events tab and the metrics tiles.
9. Non-goals
No real authentication, no real email, no payments, no real proctoring or anti-cheating (assume they exist), no company admin login or dashboard, no access-management screen, no identity matching. Keep the code simple and readable; include a short README with how to run it and where the seed data lives.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9d1cf3fb-19fc-5b56-b8fb-295ec920ef83).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
