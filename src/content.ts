window.addEventListener("load", loadChatArea, true);

const SVG_ICON_OPEN = '<svg class="svg-icon" viewBox="0 0 20 20"><path fill="none" d="M11.611,10.049l-4.76-4.873c-0.303-0.31-0.297-0.804,0.012-1.105c0.309-0.304,0.803-0.293,1.105,0.012l5.306,5.433c0.304,0.31,0.296,0.805-0.012,1.105L7.83,15.928c-0.152,0.148-0.35,0.223-0.547,0.223c-0.203,0-0.406-0.08-0.559-0.236c-0.303-0.309-0.295-0.803,0.012-1.104L11.611,10.049z"></path></svg>';
const SVG_ICON_CLOSE = '<svg class="svg-icon" viewBox="0 0 20 20"><path fill="none" d="M8.388,10.049l4.76-4.873c0.303-0.31,0.297-0.804-0.012-1.105c-0.309-0.304-0.803-0.293-1.105,0.012L6.726,9.516c-0.303,0.31-0.296,0.805,0.012,1.105l5.433,5.307c0.152,0.148,0.35,0.223,0.547,0.223c0.203,0,0.406-0.08,0.559-0.236c0.303-0.309,0.295-0.803-0.012-1.104L8.388,10.049z"></path></svg>';
const SVG_ICON_CLOSE_CIRCLE = '<svg class="svg-icon" viewBox="0 0 20 20"><path d="M14.776,10c0,0.239-0.195,0.434-0.435,0.434H5.658c-0.239,0-0.434-0.195-0.434-0.434s0.195-0.434,0.434-0.434h8.684C14.581,9.566,14.776,9.762,14.776,10 M18.25,10c0,4.558-3.693,8.25-8.25,8.25c-4.557,0-8.25-3.691-8.25-8.25c0-4.557,3.693-8.25,8.25-8.25C14.557,1.75,18.25,5.443,18.25,10 M17.382,10c0-4.071-3.312-7.381-7.382-7.381C5.929,2.619,2.619,5.93,2.619,10c0,4.07,3.311,7.382,7.381,7.382C14.07,17.383,17.382,14.07,17.382,10"></path></svg>';

function insertResizer(observer: MutationObserver) {
    const isVCFloating = document.getElementById("voice-chat-container-floating") ? true : false;
    const sections = document.getElementsByTagName("section") as HTMLCollectionOf<HTMLElement>;
    const userAreaSection = sections[0] as HTMLElement;
    const headerSection = sections[1] as HTMLElement;

    // ISSUE:  The user area section is hidden by toggling sidebars.
    userAreaSection.classList.add("user-area");

    if (document.getElementById("resizer-container") == null) {
        
        const buttonContainer = document.createElement("div") as HTMLDivElement;
        buttonContainer.setAttribute("id", "resizer-container");
        const buttonC = document.createElement("button") as HTMLButtonElement;
    
        buttonC.classList.add("resizer-button-container");
        buttonC.classList.add("unclicked");
        buttonC.innerHTML = SVG_ICON_CLOSE;
    
        buttonC.addEventListener('click', (e: MouseEvent)=> {
    
            const target = e.target as HTMLButtonElement;
    
            const servers_nav = document.getElementsByTagName("nav")[0] as HTMLElement;
    
            if (servers_nav.style.display == "none") {
                servers_nav.style.display = "block";
            } else {
                servers_nav.style.display = "none";
            }
    
            const server_nav = document.getElementsByTagName("nav")[1].parentNode as HTMLElement;
    
            if (server_nav.style.display == "none") {
                server_nav.style.display = "block";
            } else {
                server_nav.style.display = "none";
            }
    
            if (target && target.classList) {
                if (target.classList.contains("unclicked")) {
                    target.classList.add("clicked");
                    target.classList.remove("unclicked");
                    target.innerHTML = SVG_ICON_OPEN;
                    document.getElementById("voice-chat-container-floating") ? null : displayVoiceChat(userAreaSection);
                } else {
                    target.classList.add("unclicked");
                    target.classList.remove("clicked");
                    target.innerHTML = SVG_ICON_CLOSE;
                }
            }
    
        });
    
        buttonContainer.appendChild(buttonC);
        if (headerSection != null) {
            headerSection.insertBefore(buttonContainer, headerSection.firstChild);
        }
       
    } 
    if (isVCFloating) {
        displayVoiceChat(userAreaSection);
    }
};

function observeDOMRendering(observedNode: HTMLElement, config? : MutationObserverInit) {
    // const config = { childList : true , subtree : true };
    if (config == null) {
        config={ childList: true, subtree: true }
    }
    const observer = new MutationObserver((mutaionList, observer) => {
        console.log(mutaionList, observer);
        insertResizer(observer); 
    });

    observer.observe(observedNode, config);

    // Insert resizer
    insertResizer(observer);
}

function loadChatArea() {
    const jsInitCheckTimer = setInterval(() => {

        // const targetNode = document.getElementsByClassName("content-1jQy2l")[0] as HTMLElement;
        const targetNode = document.getElementsByClassName("sidebar-1tnWFu")[0] as HTMLElement;

        if (targetNode != null) {
            
            // Completely load the chat area and stop observing DOM loading.
            clearInterval(jsInitCheckTimer);
        
            // Initialize observer
            const observedNode = targetNode;
            observeDOMRendering(observedNode);
        }
    });
}

// DEVELOPMENT:  This is a temporary solution.
function displayVoiceChat(userAreaSection: HTMLElement, x=0, y=0) {

    const voiceChatContainerFloating = document.getElementById("voice-chat-container-floating") as HTMLDivElement;

    if (voiceChatContainerFloating == null) {

        let isVoiceChatConnected = false as boolean;
        let voiceChat =  document.createElement("li") as HTMLElement;

        const userName = userAreaSection.textContent;
        const userAvatorURL = userAreaSection.getElementsByTagName("img")[0].getAttribute("src") as string;
        const userID = userAvatorURL.includes("https://cdn.discordapp.com/avatars/") 
                        ? userAvatorURL.split("/")[4]
                        : "non-user";
        // console.log(userID);

        // Notes: The voice channel element is implemented in the following way:
        // <a role="button" ~ data-list-item-id="~" tabindex="~" aria-label="{channel_name}, {n} users">...</a>
        // Notes: The text channel element is implemented in the following way:
        // <a role="link" href="/channels/~" data-list-item-id="~" tabindex="~" aria-label="{channel_name}">...</a>
        const channelsContainer = document.querySelector("ul.content-2a4AW9") as HTMLElement;
        const channels = channelsContainer.getElementsByTagName("li") as HTMLCollectionOf<HTMLElement>;


        for (let i = 0; i < channels.length; i++) {
            const channel = channels[i] as HTMLElement;
            // if participant is in the channel, this parameter is 2 otherwise it is 1.
            if (channel.childElementCount != 2) {
                continue;
            }
            // console.log(channel);

            // detect the channel you are in
            const usersInVCContainer = channel.childNodes[1] as HTMLElement;
            const usersInVC = usersInVCContainer.querySelectorAll('div[class^="userAvatar-') as NodeListOf<HTMLElement>;

            // userAvatarURL = https://cdn.discordapp.com/avatars/[userID]/[resourceID].webp?size=32
            // Avatar in VC = style="background-image: url("https://cdn.discordapp.com/avatars/[userID]/[resourceID].webp?size=28");"
            for (let j = 0; j < usersInVC.length; j++) {
                const user = usersInVC[j] as HTMLElement;
                const userStyle = user.getAttribute("style") as string;
                if ( userStyle.includes(userID) ) {
                    // console.log(userStyle);
                    isVoiceChatConnected = true;
                    voiceChat = channel.cloneNode(true) as HTMLElement;
                    break;
                }
            }
        }

        if (isVoiceChatConnected) {
            const voiceChatContainerFloating = document.createElement("div") as HTMLDivElement;
            voiceChat.classList.add("voice-chat-users");
            voiceChatContainerFloating.setAttribute("id", "voice-chat-container-floating");
            voiceChatContainerFloating.classList.add("voice-chat-container-floating");
            voiceChatContainerFloating.classList.add("drag-and-drop");

            

            if (x != 0 && y != 0) {
                voiceChatContainerFloating.style.right= x + "px";
                voiceChatContainerFloating.style.top = y + "px";
            } else {
                if (document.getElementsByTagName("aside")[0] != null) {
                    voiceChatContainerFloating.classList.add("container-floating-if-aside-visible");
                } else {
                    voiceChatContainerFloating.classList.add("container-floating-if-aside-invisible");
                }
            }

            const closeButton = document.createElement("div") as HTMLElement;
            closeButton.classList.add("voice-chat-close-button");
            closeButton.innerHTML = SVG_ICON_CLOSE_CIRCLE;
            closeButton.addEventListener("click", () => {
                voiceChatContainerFloating.remove();
            });

            voiceChatContainerFloating.appendChild(voiceChat);
            voiceChatContainerFloating.appendChild(closeButton);
            document.body.appendChild(voiceChatContainerFloating);
            dragAndDrop();
        }
    } else {
        voiceChatContainerFloating.remove();
        const x_pos = voiceChatContainerFloating.style.right === '' ? 20 : parseInt(voiceChatContainerFloating.style.right);
        const y_pos = voiceChatContainerFloating.style.top  === '' ? 58: parseInt(voiceChatContainerFloating.style.top);
        displayVoiceChat(userAreaSection, x_pos, y_pos);
        console.log(x_pos, y_pos);
    }


};

function dragAndDrop (){
    function translateLeftToRight(leftX : number) {
        let doucmentWidth = document.documentElement.clientWidth;
        return (doucmentWidth - leftX);
    }

    var elements = document.getElementsByClassName("drag-and-drop") as HTMLCollectionOf<HTMLElement>;

    var x = 0;
    var y = 0;

    
    for(var i = 0; i < elements.length; i++) {
        elements[i].addEventListener("mousedown", mdown, false);
        elements[i].addEventListener("touchstart", mdown, false);
    }
    
    function mdown(e) {
        e.target.classList.add("drag");

        
        if(e.type === "mousedown") {
            var event = e;
        } else {
            var event = e.changedTouches[0];
        }

        //要素内の相対座標を取得
        x = event.pageX - e.target.offsetLeft - 300;
        y = event.pageY - e.target.offsetTop;

        document.body.addEventListener("mousemove", mmove, false);
        document.body.addEventListener("touchmove", mmove, false);
    }

    
    function mmove(e) {
        
        var drag = document.getElementsByClassName("drag")[0] as HTMLElement;

    
        if(e.type === "mousemove") {
            var event = e;
        } else {
            var event = e.changedTouches[0];
        }

    
        e.preventDefault();

        drag.style.top = event.pageY - y + "px";
        drag.style.right = translateLeftToRight(event.pageX - x) + "px";

        
        drag.addEventListener("mouseup", mup, false);
        document.body.addEventListener("mouseleave", mup, false);
        drag.addEventListener("touchend", mup, false);
        document.body.addEventListener("touchleave", mup, false);

    }

    
    function mup(e) {
        var drag = document.getElementsByClassName("drag")[0];

        if (drag != null) {

            document.body.removeEventListener("mousemove", mmove, false);
            drag.removeEventListener("mouseup", mup, false);
            document.body.removeEventListener("touchmove", mmove, false);
            drag.removeEventListener("touchend", mup, false);

            drag.classList.remove("drag");
        }
    }

};