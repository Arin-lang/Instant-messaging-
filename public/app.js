const socket = io();

const joinOverlay = document.getElementById('join-overlay');
const joinForm = document.getElementById('join-form');
const usernameInput = document.getElementById('username');
const joinError = document.getElementById('join-error');

const messages = document.getElementById('messages');
const users = document.getElementById('users');
const typing = document.getElementById('typing');

const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

let joined = false;
let currentUserName = '';
let typingTimeout;
let lastTypingSentAt = 0;

const isNearBottom = () =>
  messages.scrollHeight - messages.scrollTop - messages.clientHeight < 60;

const scrollToBottom = (force = false) => {
  if (force || isNearBottom()) {
    messages.scrollTop = messages.scrollHeight;
  }
};

const appendMessage = ({ type, name, text, timestamp }) => {
  const item = document.createElement('li');
  item.className = `message${type === 'system' ? ' system' : ''}`;

  if (type === 'system') {
    const content = document.createElement('span');
    content.textContent = text;
    item.appendChild(content);
  } else {
    const author = document.createElement('strong');
    author.textContent = name;

    const content = document.createElement('span');
    content.textContent = text;

    item.append(author, content);
  }

  const time = document.createElement('span');
  time.className = 'timestamp';
  time.textContent = timestamp;
  item.appendChild(time);

  messages.appendChild(item);
  scrollToBottom();
};

const setComposerEnabled = (enabled) => {
  messageInput.disabled = !enabled;
  sendBtn.disabled = !enabled;
};

joinForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = usernameInput.value.trim();

  if (!username) {
    joinError.textContent = 'Display name is required.';
    return;
  }

  socket.emit('join', username, (response) => {
    if (!response || !response.ok) {
      joinError.textContent = response?.error || 'Unable to join chat.';
      return;
    }

    joined = true;
    currentUserName = response.name;
    joinError.textContent = '';
    joinOverlay.classList.add('hidden');
    setComposerEnabled(true);
    messageInput.focus();
    appendMessage({
      type: 'system',
      text: `You joined as ${response.name}.`,
      timestamp:
        response.timestamp ||
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
    });
  });
});

messageForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!joined) {
    return;
  }

  const text = messageInput.value.trim();
  if (!text) {
    return;
  }

  socket.emit('chat:message', text);
  messageInput.value = '';
  socket.emit('typing', false);
});

messageInput.addEventListener('input', () => {
  if (!joined) {
    return;
  }

  const now = Date.now();
  if (now - lastTypingSentAt > 500) {
    socket.emit('typing', true);
    lastTypingSentAt = now;
  }

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('typing', false);
  }, 900);
});

socket.on('chat:message', (message) => {
  appendMessage({ type: 'chat', ...message });
});

socket.on('system:message', (message) => {
  appendMessage({ type: 'system', ...message });
});

socket.on('users:update', (onlineUsers) => {
  users.innerHTML = '';

  onlineUsers.forEach((name) => {
    const item = document.createElement('li');
    item.textContent = name;
    users.appendChild(item);
  });
});

socket.on('typing:update', (payload) => {
  const incomingUsers = Array.isArray(payload?.users) ? payload.users : [];
  const typingUsers = incomingUsers.filter((name) => Boolean(name) && name !== currentUserName);

  if (typingUsers.length === 0) {
    typing.textContent = '';
  } else if (typingUsers.length === 1) {
    typing.textContent = `${typingUsers[0]} is typing...`;
  } else {
    typing.textContent = 'Several people are typing...';
  }
});

setComposerEnabled(false);
