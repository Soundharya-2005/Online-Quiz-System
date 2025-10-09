/* ==========
   GLOBAL STATE
   ========== */
let currentUser = null;
let DATA = {}; // This will now store only the fetched topics
let currentTopicKey = null;
let currentSubtopic = null;
let quizState = null; // { questions, index, selections[], timePerQ, remain, timerId }

/* ==========
   Helpers (DOM)
   ========== */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const show = (id) => document.querySelectorAll('.view').forEach(v => v.id === id ? v.classList.add('active') : v.classList.remove('active'));
const setText = (sel, txt) => { const el = $(sel); if (el) el.textContent = txt; };
const setIframe = (iframe, ytId) => {
    if (!iframe) return;
    if (!ytId) { iframe.src = ''; return; }
    iframe.src = `https://www.youtube.com/embed/${ytId}?rel=0`;
};

/* ==========
   Init + Events
   ========== */
window.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    show('view-login');
});

function bindEvents() {
    $('#loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const u = $('#username').value.trim();
        const p = $('#password').value.trim();
        if (!u || !p) return alert('Enter username & password');
        currentUser = u;
        setText('#welcomeUser', `Hi, ${currentUser}`);
        // Now we only need to fetch the list of topics, not all the data.
        fetchAllTopicsForDashboard(); 
        show('view-dashboard');
    });

    $$('.topic-card').forEach(c => {
        c.addEventListener('click', () => {
            const key = c.getAttribute('data-topic');
            openTopic(key);
        });
    });

    $('#logoutBtn').addEventListener('click', () => {
        currentUser = null;
        show('view-login');
    });

    $('#backToDashboard').addEventListener('click', () => show('view-dashboard'));
    $('#backToDashboard2').addEventListener('click', () => show('view-dashboard'));
    $('#backToDashboardHub').addEventListener('click', () => show('view-dashboard'));

    $('#backToSubtopics').addEventListener('click', () => show('view-subtopics'));

    $('#takeTestBtn').addEventListener('click', () => {
        if (currentSubtopic) startQuiz(currentSubtopic);
    });

    // Quiz navigation
    $('#prevBtn').addEventListener('click', prevQuestion);
    $('#nextBtn').addEventListener('click', nextQuestion);
    $('#submitBtn').addEventListener('click', submitQuiz);
    $('#quitQuizBtn').addEventListener('click', () => {
        stopTimer();
        show('view-dashboard');
    });

    $('#tryAgainBtn').addEventListener('click', () => {
        if (currentSubtopic) startQuiz(currentSubtopic);
    });
    $('#viewAnswersBtn').addEventListener('click', showAnswers);
    $('#backHomeBtn').addEventListener('click', () => show('view-dashboard'));
    $('#backFromAnswers').addEventListener('click', () => show('view-result'));
}

/* ==========
   Backend Data Fetching
   ========== */

// This function only fetches a list of topics to populate the dashboard.
function fetchAllTopicsForDashboard() {
    fetch('http://localhost:8080/api/topics')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Update the DATA object with just the topic titles for the dashboard.
            DATA = {};
            data.forEach(topic => {
                DATA[topic.id] = {
                    title: topic.title,
                    subtopics: topic.subtopics // Store subtopics but they won't have quizzes yet
                };
            });
            console.log('Topics loaded for dashboard:', DATA);
        })
        .catch(error => {
            console.error('Error fetching topics:', error);
            alert("Failed to load quiz data. Please check if the backend is running and the data has been loaded via http://localhost:8080/api/data/load.");
        });
}

// This function fetches all the details for a single topic.
function fetchSpecificTopic(topicId) {
    return fetch(`http://localhost:8080/api/topics/${topicId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(topicData => {
            // Re-format the data to match the old structure
            let formattedSubtopics = [];
            if (topicData.subtopics) {
                formattedSubtopics = topicData.subtopics.map(sub => ({
                    id: sub.id,
                    name: sub.name,
                    videoId: sub.videoId,
                    quiz: sub.questions ? sub.questions.map(q => ({
                        id: q.id,
                        q: q.questionText,
                        options: q.options,
                        answer: q.correctAnswerIndex
                    })) : []
                }));
            }
            
            const fullTopicData = {
                title: topicData.title,
                videoId: topicData.videoId,
                subtopics: formattedSubtopics
            };

            // Store the full topic data
            DATA[topicId] = fullTopicData;

            return fullTopicData;
        })
        .catch(error => {
            console.error('Error fetching topic:', error);
            alert(`Failed to load data for topic: ${topicId}`);
            return null;
        });
}

/* ==========
   Open Topic
   ========== */
async function openTopic(key) {
    currentTopicKey = key;
    
    // Fetch the specific topic's full data
    const topic = await fetchSpecificTopic(key);

    if (!topic) return alert('Topic not found');

    const hasVideoPerSubtopic = topic.subtopics.some(s => s.videoId);
    const hasSingleVideo = topic.videoId;
    const hasNoVideo = !hasVideoPerSubtopic && !hasSingleVideo;

    if (hasVideoPerSubtopic) {
        setText('#subtopicsTitle', `${topic.title} — Subtopics`);
        // The CTA here remains "Watch & Test" for the subtopic list
        renderSubtopicsList('#subtopicsList', topic.subtopics, (sub) => {
            currentSubtopic = sub;
            setText('#videoTitle', `${topic.title} • ${sub.name}`);
            setIframe($('#ytPlayer'), sub.videoId);

            // Here's the key change: Find the button and set its text to "Take Test"
            // We need to make sure your HTML has a unique ID for this button, like `takeTestBtn`
            const takeTestBtn = document.getElementById('takeTestBtn');
            if (takeTestBtn) {
                takeTestBtn.innerText = 'Take Test →';
            }

            show('view-video');
        }, { cta: 'Watch & Test' }); // The button on this page will say Watch & Test
        show('view-subtopics');
    } else if (hasSingleVideo) {
        setText('#topicHubTitle', topic.title);
        setIframe($('#hubPlayer'), topic.videoId);
        renderSubtopicsList('#hubSubtopicsList', topic.subtopics, (sub) => {
            currentSubtopic = sub;
            startQuiz(sub);
        }, { cta: 'Start Quiz' });
        show('view-topic-hub');
    } else if (hasNoVideo) {
        setText('#subtopicsTitle', `${topic.title} — Subtopics`);
        renderSubtopicsList('#subtopicsList', topic.subtopics, (sub) => {
            currentSubtopic = sub;
            startQuiz(sub);
        }, { cta: 'Take Quiz' });
        show('view-subtopics');
    }
}

function renderSubtopicsList(containerSel, subtopics, onClick, opts = {}) {
    const box = document.querySelector(containerSel);
    if (!box) return;
    box.innerHTML = '';
    subtopics.forEach((s, i) => {
        const div = document.createElement('div');
        div.className = 'item';
        const left = document.createElement('div');
        left.className = 'meta';
        const num = document.createElement('span');
        num.className = 'badge';
        num.textContent = i + 1;
        const title = document.createElement('div');
        title.textContent = s.name;
        left.append(num, title);
        const btn = document.createElement('button');
        btn.className = 'btn primary';
        btn.textContent = opts.cta || 'Open';
        btn.addEventListener('click', () => onClick(s));
        div.append(left, btn);
        box.append(div);
    });
}

/* ==========
   Quiz engine
   ========== */
function startQuiz(sub) {
    if (!sub || !sub.quiz || sub.quiz.length === 0) {
        alert("No quiz questions available for this subtopic.");
        return;
    }

    const topicTitle = DATA[currentTopicKey]?.title || 'Quiz';
    $('#quizTitle').textContent = `${topicTitle} - ${sub.name}`;
    $('#qTotal').textContent = sub.quiz.length;
    quizState = {
        questions: sub.quiz,
        index: 0,
        selections: new Array(sub.quiz.length).fill(null),
        timePerQ: 20,
        remain: 20,
        timerId: null
    };

    renderQuestion();
    show('view-quiz');
    restartTimer();
}

function renderQuestion() {
    const q = quizState.questions[quizState.index];
    $('#questionText').textContent = q.q;
    $('#qIndex').textContent = quizState.index + 1;
    const optsBox = $('#optionsBox');
    optsBox.innerHTML = '';

    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'option';
        btn.textContent = opt;
        if (quizState.selections[quizState.index] === i) btn.classList.add('selected');
        btn.addEventListener('click', () => {
            quizState.selections[quizState.index] = i;
            $$('.option').forEach(o => o.classList.remove('selected'));
            btn.classList.add('selected');
        });
        optsBox.appendChild(btn);
    });

    $('#prevBtn').disabled = quizState.index === 0;
    const isLast = quizState.index === quizState.questions.length - 1;
    $('#nextBtn').style.display = isLast ? 'none' : 'inline-block';
    $('#submitBtn').style.display = isLast ? 'inline-block' : 'none';
}

function prevQuestion() {
    if (quizState.index > 0) {
        quizState.index--;
        renderQuestion();
        restartTimer();
    }
}

function nextQuestion() {
    if (quizState.index < quizState.questions.length - 1) {
        quizState.index++;
        renderQuestion();
        restartTimer();
    }
}

/* Timer */
function restartTimer() {
    stopTimer();
    quizState.remain = quizState.timePerQ;
    setText('#timer', quizState.remain);
    quizState.timerId = setInterval(() => {
        quizState.remain--;
        setText('#timer', quizState.remain);
        if (quizState.remain <= 0) {
            if (quizState.index < quizState.questions.length - 1) {
                quizState.index++;
                renderQuestion();
                restartTimer();
            } else {
                submitQuiz();
            }
        }
    }, 1000);
}

function stopTimer() {
    if (quizState?.timerId) {
        clearInterval(quizState.timerId);
        quizState.timerId = null;
    }
}

/* Submit & results */
function submitQuiz() {
    stopTimer();
    const { questions, selections } = quizState;

    // Build the submission payload to send to the backend
    const submissionPayload = {
        subtopicId: currentSubtopic.id,
        answers: selections.map((chosenIndex, index) => ({
            questionId: questions[index].id,
            chosenOptionIndex: chosenIndex
        }))
    };

    fetch('http://localhost:8080/api/quiz/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(submissionPayload),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Server response was not ok');
            }
            return response.json();
        })
        .then(result => {
            // Use the result directly from the backend
            $('#scoreLine').textContent = `You scored ${result.score}/${result.totalQuestions} (${Math.round(result.percentage)}%)`;
            $('#messageLine').textContent = result.message;
            show('view-result');
        })
        .catch(error => {
            console.error('Error submitting quiz:', error);
            alert('An error occurred while submitting your quiz. Please try again.');
            show('view-dashboard');
        });
}

/* Answers */
function showAnswers() {
    const list = $('#answersList');
    list.innerHTML = '';
    const { questions, selections } = quizState;
    questions.forEach((q, i) => {
        const card = document.createElement('div');
        card.className = 'answer-card';
        const h = document.createElement('h4');
        h.textContent = `Q${i + 1}. ${q.q}`;
        const chosen = selections[i];
        const correct = q.answer;
        const p1 = document.createElement('p');
        p1.innerHTML = `Your answer: ${
            chosen === null ? '<span class="no">Not answered</span>'
            : chosen === correct ? `<span class="ok">${q.options[chosen]}</span>`
            : `<span class="no">${q.options[chosen]}</span>`
        }`;
        const p2 = document.createElement('p');
        p2.innerHTML = `Correct answer: <span class="ok">${q.options[correct]}</span>`;
        card.append(h, p1, p2);
        list.append(card);
    });
    show('view-answers');
}