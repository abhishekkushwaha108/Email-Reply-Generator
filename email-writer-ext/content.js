console.log("Email Writer Extension - Content Script Loaded");

/* ================= BUTTON ================= */

function createAIButton() {
    const button = document.createElement('div');
    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3 ai-reply-button';
    button.style.marginRight = '8px';
    button.innerHTML = 'AI Reply';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');
    return button;
}

/* ================= EXTRACT RECEIVER NAME ================= */
function extractReceiverFromEmailContent(emailText) {
    if (!emailText) return "";

    const patterns = [
        /dear\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
        /hello\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
        /hi\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
    ];

    for (const pattern of patterns) {
        const match = emailText.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    return "";
}


/* ================= EMAIL CONTENT ================= */

function getEmailContent() {
    const selectors = ['.h7', '.a3s.aiL', '.gmail_quote', '[role="presentation"]'];
    for (const s of selectors) {
        const el = document.querySelector(s);
        if (el?.innerText.trim()) return el.innerText.trim();
    }
    return "";
}



/* ================= SENDER NAME ================= */

function getSenderName() {
    const sender =
        document.querySelector('span.gD span') ||
        document.querySelector('span.gD') ||
        document.querySelector('span.go');

    return sender?.innerText.trim() || "";
}

/* ================= TOOLBAR ================= */

function findComposeToolBar() {
    const selectors = ['.btC', '.aDh', '[role="toolbar"]', '.gU.Up'];
    for (const s of selectors) {
        const el = document.querySelector(s);
        if (el) return el;
    }
    return null;
}

/* ================= INSERT TEXT SAFELY ================= */

function insertIntoCompose(text, retries = 10) {
    const box = document.querySelector('[role="textbox"][g_editable="true"]');
    if (box) {
        box.focus();
        document.execCommand('insertText', false, text);
        return;
    }
    if (retries > 0) {
        setTimeout(() => insertIntoCompose(text, retries - 1), 300);
    } else {
        console.warn("Compose box not found");
    }
}

/* ================= INJECT BUTTON ================= */

function injectButton() {
    // ✅ DO NOT REMOVE existing button
    if (document.querySelector('.ai-reply-button')) return;

    const toolbar = findComposeToolBar();
    if (!toolbar) return;

    const button = createAIButton();

    button.addEventListener('click', async () => {
        try {
            button.innerHTML = 'Generating...';
            button.disabled = true;

            const emailContent = getEmailContent();

            const receiverName =
                extractReceiverFromEmailContent(emailContent);

            const payload = {
                emailContent,
                senderName: getSenderName(),
                receiverName
            };

            console.log("AI REPLY PAYLOAD →", payload);

            const res = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("API failed");

            const reply = await res.text();
            insertIntoCompose(reply);

        } catch (e) {
            console.error(e);
            alert("Failed to generate reply");
        } finally {
            button.innerHTML = 'AI Reply';
            button.disabled = false;
        }
    });

    toolbar.insertBefore(button, toolbar.firstChild);
}

/* ================= OBSERVER ================= */

const observer = new MutationObserver(() => {
    setTimeout(injectButton, 500);
});

observer.observe(document.body, { childList: true, subtree: true });
