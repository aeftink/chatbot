import { faker } from 'https://cdn.skypack.dev/@faker-js/faker';

// The two users chatting
const viewer = {
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  avatarUrl: faker.image.avatar()
};
const buddy = {
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  avatarUrl: faker.image.avatar()
};

const stompClient = new StompJs.Client({ brokerURL: 'ws://localhost:8080/chat-websocket' });
stompClient.onConnect = (frame) => {
    console.log('Connected: ', frame);
    // setConnected(true);
    stompClient.subscribe('/topic/chatroom', (message) => {
      console.log('message received', message);
      try {
        const response = JSON.parse(message.body);
        const nodes = createIncomingMessage({ name: buddy.firstName, message: response.message, avatarUrl: buddy.avatarUrl});
        messagesContainer.prepend(render(nodes));
      } catch(e) {
        console.log('unable to parse message')
      }
    });
    sendChatMessage('cool')
}
stompClient.onWebSocketError = (error) => {
  console.error('Error with websocket', error);
};
stompClient.onStompError = (frame) => {
  console.error('Broker reported error: ' + frame.headers['message']);
  console.error('Additional details: ' + frame.body);
};

function connect() {
  stompClient.activate();
}

function disconnect() {
  stompClient.deactivate();
  // setConnected(false);
  console.log("Disconnected");
}

function sendChatMessage(message) {
  console.log('sending message', message)
  stompClient.publish({
    destination: '/app/chat',
    body: JSON.stringify({ 'message': message })
  });
}

connect();

const page = document.getElementById("page");

// User info in the toolbar
const userinfo = function({ name, status, avatarUrl }) {
  return [
    'div',
    {class:'flex items-center'},
      ['img',
        {class:'rounded-full w-10 h-10', src: avatarUrl}],
      ['div', {class:'pl-2'},
       ['div', {class:'font-semibold'}, ['button', {class:'hover:underline', type: 'button'}, name]],
       ['div', {class:'text-xs text-gray-600'}, status]
    ]
  ];
}

// Fullscreen and close buttons in the toolbar
const chatboxAction = [
  'div',
  ['button', {class:'inline-flex hover:bg-indigo-50 rounded-full p-2', type: 'button'},
    ['svg', {xmlns: "http://www.w3.org/2000/svg", class: "h-6 w-6", fill: "none",
             viewBox: "0 0 24 24", stroke: "currentColor"},
      ['path', {'stroke-linecap': "round", 'stroke-linejoin': "round", 'stroke-width': "1",
          'd': "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"}]
    ]
  ],
  ['button',
    {class:"inline-flex hover:bg-indigo-50 rounded-full p-2", type:"button"},
    ['svg',
      {xmlns: "http://www.w3.org/2000/svg", class: "h-6 w-6", fill: "none",
       viewBox: "0 0 24 24", stroke: "currentColor"},
      ['path', {'stroke-linecap': "round", 'stroke-linejoin': "round",
                'stroke-width': "1", d: "M6 18L18 6M6 6l12 12"}]
    ]
  ]
];

// Function for generating incoming message elements
function createIncomingMessage({ name, message, avatarUrl }){
  return [
    'div',
    {class: 'flex items-center mb-4'},
    ['div', {class: 'flex-none flex flex-col items-center space-y-1 mr-4'},
      ['img', {class:'rounded-full w-10 h-10', src: avatarUrl}],
      ['a', {class:'block text-xs hover:underline'}, name]
    ],
    ['div', {class: 'flex-1 bg-indigo-400 text-white p-2 rounded-lg mb-2 relative'},
      ['div', {}, message],
      ['div', {class:'absolute left-0 top-1/2 transform -translate-x-1/2 rotate-45 w-2 h-2 bg-indigo-400'}]
    ]
  ]
}

// Function for generating current user's message elements
function createOutgoingMessage({ name, message, avatarUrl }) {
  return [
    'div',
    {class: 'flex items-center flex-row-reverse mb-4'},
    ['div', {class: 'flex-none flex flex-col items-center space-y-1 ml-4'},
      ['img', {class:'rounded-full w-10 h-10', src: avatarUrl}],
      ['a', {class:'block text-xs hover:underline' }, name]
    ],
    ['div', {class: 'flex-1 bg-indigo-100 text-gray-800 p-2 rounded-lg mb-2 relative'},
      ['div', {}, message],
      ['div', {class:'absolute right-0 top-1/2 transform translate-x-1/2 rotate-45 w-2 h-2 bg-indigo-100'}]
    ]
  ]
}

// Action button for message attachments
const chatInputAction = [
  'div',
  ['button', {class:'inline-flex hover:bg-indigo-50 rounded-full p-2', type: 'button'},
    ['svg', {class:"h-6 w-6", fill:"none", viewBox:"0 0 24 24", stroke:"currentColor"},
      ['path', {'stroke-linecap': "round", 'stroke-linejoin': "round",
                'stroke-width': "1", 'd': "M12 6v6m0 0v6m0-6h6m-6 0H6"}]
    ]
  ]
];

// Create text input element so we have a reference for the button click event
const textInput = render(['input', {
  class:'w-full rounded-full border border-gray-200',
  type:'text',
  placeholder:'Aa',
  onkeypress: (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage(e.target.value);
      e.target.value = '';
    }
  }}
]);

// Message send button
const chatSendAction = [
  'div',
  ['button', {
    class:'inline-flex hover:bg-indigo-50 rounded-full p-2',
    type:'button',
    onclick: function() {
      const text = textInput.value;
      sendMessage(text);
      textInput.value = '';
     }
  },
    ['svg', {class:"h-6 w-6", fill:"none", viewBox:"0 0 24 24", stroke:"currentColor"},
      ['path', {'stroke-linecap': "round", 'stroke-linejoin': "round", 'stroke-width': "1", d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"}]
    ]
  ]
];

// Create containter and populate with a few initial messages.
// 'flex-col-reverse' to keep scrollbar at bottom
const messagesContainer = render(
  ['div', {class:'flex-1 px-4 py-4 overflow-y-auto flex flex-col-reverse'},
    createIncomingMessage({ name: buddy.firstName, message: faker.lorem.lines({ min: 1, max: 2 }), avatarUrl: buddy.avatarUrl}),
    createOutgoingMessage({ name: viewer.firstName, message: faker.lorem.lines({ min: 1, max: 2 }), avatarUrl: viewer.avatarUrl }),
    createIncomingMessage({ name: buddy.firstName, message: faker.lorem.lines({ min: 1, max: 2 }), avatarUrl: buddy.avatarUrl})
  ]
);

// Prepend user sent message to the container since it is reversed
function sendMessage(message) {
  if (!message || typeof message !== 'string') return;
  sendChatMessage(message);
  messagesContainer.prepend(render(createOutgoingMessage({ name: viewer.firstName, message, avatarUrl: viewer.avatarUrl })));
}

// Put it all together
const chatbox = [
  'div',
  {class: 'w-80 h-96 flex flex-col border shadow-md bg-white'},
  ['div', {class:'flex items-center justify-between border-b p-2'},
    userinfo({ name: `${buddy.firstName} ${buddy.lastName}`, status: 'Online', avatarUrl: buddy.avatarUrl }),
    chatboxAction
  ],
  messagesContainer,
  ['div', {class:'flex items-center border-t p-2'},
    chatInputAction,
    [
      'div', {class:'w-full mx-2'},
      textInput
    ],
    chatSendAction
  ]
];

// Position the chatbox on the page
const main = [
  'main',
  ['h1', { class: 'text-3xl text-indigo-500 pb-4' }, 'CHAT BOX'],
  ['div', {class:'flex justify-between'},
   chatbox
  ]
];

page.appendChild(render(main));