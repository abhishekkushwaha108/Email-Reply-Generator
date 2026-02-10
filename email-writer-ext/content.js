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
  const composeBox = document.querySelector('[role="dialog"], .AD');
  if (!composeBox) return null;

  return composeBox.querySelector('.btC');
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
  if (document.querySelector('.ai-reply-button')) return;

  const toolbar = findComposeToolBar();
  if (!toolbar) return;

  const button = createAIButton();

  button.addEventListener('click', async () => {
    try {
      button.innerText = 'Generating...';
      button.style.pointerEvents = 'none';

      const emailContent = getEmailContent();
      const receiverName = extractReceiverFromEmailContent(emailContent);

      const payload = {
        emailContent,
        senderName: getSenderName(),
        receiverName
      };

      const res = await fetch(
        'https://email-reply-generator-production-1037.up.railway.app/api/email/generate',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      const reply = await res.text();
      insertIntoCompose(reply);

    } catch (err) {
      console.error(err);
    } finally {
      button.innerText = 'AI Reply';
      button.style.pointerEvents = 'auto';
    }
  });

  toolbar.appendChild(button);
}


/* ================= OBSERVER ================= */

const observer = new MutationObserver(() => {
    setTimeout(injectButton, 500);
});

observer.observe(document.body, { childList: true, subtree: true });
