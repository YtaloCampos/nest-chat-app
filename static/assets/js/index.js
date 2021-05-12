const generateUniqueIdentificator = () => {
    return '_' + Math.random().toString(36).substr(2, 9);
};

const socketInstance = (() => {
    let socket = null;
    return {
        init: () => socket = io('https://nestjs-chat-app.herokuapp.com/chat'), // todo temp, use enviroments
        runEvent: (path, payload, cb) => {
            socket.emit(path, payload);
            cb();
        },
        addListener: (path, cb) => socket.on(path, payload => cb(payload))
    }
})();

const headerEl = (() => {
    const currentUser = document.querySelector('.header-options > .me');

    return {
        init: () => currentUser.textContent = `You (${localStorage.getItem('user_id')})`
    }
})()

const listMessagesEl = (() => {
    const payloads = JSON.parse(localStorage.getItem('payloads')) || [];
    const mainWrapperMessages = document.querySelector('.body');

    // private build
    function renderPayloads(payload) {
        const newtext = document.createTextNode(payload.msg);
        const boxMessagesEl = document.querySelector('.box-messages');
        const recipientEl = document.createElement('div');
        const wrapperContentBoxEl = document.createElement('div');
        const contentBoxEl = document.createElement('p');
        const recipientInfoLabel = document.createElement('span');

        recipientEl.setAttribute('class', `${payload.user_id === localStorage.getItem('user_id') ? 'emissary' : 'sender'}`);
        wrapperContentBoxEl.setAttribute('class', 'wrapper-content-box');
        contentBoxEl.setAttribute('class', 'content-box');
        recipientInfoLabel.setAttribute('class', 'user_info');

        recipientInfoLabel.appendChild(
            document.createTextNode(localStorage.getItem('user_id') === payload.user_id ? 'You' : payload.user_id)
        );
        contentBoxEl.appendChild(newtext);
        wrapperContentBoxEl.appendChild(contentBoxEl);
        wrapperContentBoxEl.appendChild(recipientInfoLabel);
        recipientEl.appendChild(wrapperContentBoxEl);
        boxMessagesEl.appendChild(recipientEl);
    }

    // private treat scroll to bottom
    function scrollToBottom(cb) {
        const tot_scroll = mainWrapperMessages.scrollHeight;
        const box_height = mainWrapperMessages.offsetHeight; 
        const scroll_position = mainWrapperMessages.scrollTop;
        
        if (((tot_scroll - box_height) === scroll_position) || scroll_position === 0) {
            setTimeout(() => mainWrapperMessages.scrollTop = mainWrapperMessages.scrollHeight, 100)
        }
        if (cb) {
            cb();
        }
    }

    return {
        init: () => {
            if (payloads.length > 0) {
                for (let i = 0; i < payloads.length; i++) {
                    renderPayloads(payloads[i]);
                }
                scrollToBottom();
            }
        },
        build: payload => {
            payloads.push(payload);
            localStorage.setItem('payloads', JSON.stringify(payloads));
            scrollToBottom(() => renderPayloads(payload))
        }
    }
})();

// manage send area
const footerEl = (() => {
    const areaEl = document.querySelector('.send-message-area');
    const btnSendEl = document.querySelector('.send-button');
    
    return {
        init: () => {
            btnSendEl.addEventListener('click', () => {
                if (areaEl.value.length > 0) {
                    socketInstance.runEvent('sendNewMessage', { 
                        msg: areaEl.value, 
                        user_id: localStorage.getItem('user_id') 
                    }, () => {
                        areaEl.value = '';
                    });
                }
            });

            areaEl.addEventListener('keydown', event => {
                const keyCode = event.which || event.keyCode;
                
                if (keyCode === 13) {
                    event.preventDefault();

                    if (event.target.value) {
                        socketInstance.runEvent('sendNewMessage', { 
                            msg: event.target.value, 
                            user_id: localStorage.getItem('user_id') 
                        }, () => {
                            areaEl.value = '';
                        });
                    }
                }
            })

            // listen new messages
            socketInstance.addListener('newReceivedMessage', payload => listMessagesEl.build(payload));
        }
    }
})(socketInstance, listMessagesEl);

// set unique identificator
if (!localStorage.getItem('user_id')) {
    localStorage.setItem('user_id', generateUniqueIdentificator());
}

socketInstance.init();
headerEl.init();
listMessagesEl.init();
footerEl.init();