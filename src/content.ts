window.addEventListener("load", loadChatArea, false);

const SVG_ICON_OPEN = '<svg class="svg-icon" viewBox="0 0 20 20"><path fill="none" d="M11.611,10.049l-4.76-4.873c-0.303-0.31-0.297-0.804,0.012-1.105c0.309-0.304,0.803-0.293,1.105,0.012l5.306,5.433c0.304,0.31,0.296,0.805-0.012,1.105L7.83,15.928c-0.152,0.148-0.35,0.223-0.547,0.223c-0.203,0-0.406-0.08-0.559-0.236c-0.303-0.309-0.295-0.803,0.012-1.104L11.611,10.049z"></path></svg>';
const SVG_ICON_CLOSE = '<svg class="svg-icon" viewBox="0 0 20 20"><path fill="none" d="M8.388,10.049l4.76-4.873c0.303-0.31,0.297-0.804-0.012-1.105c-0.309-0.304-0.803-0.293-1.105,0.012L6.726,9.516c-0.303,0.31-0.296,0.805,0.012,1.105l5.433,5.307c0.152,0.148,0.35,0.223,0.547,0.223c0.203,0,0.406-0.08,0.559-0.236c0.303-0.309,0.295-0.803-0.012-1.104L8.388,10.049z"></path></svg>';

function insertResizer(observer: MutationObserver) {
    const sections = document.getElementsByTagName("section") as HTMLCollectionOf<HTMLElement>;
    const userAreaSection = sections[0] as HTMLElement;
    const headerSection = sections[1] as HTMLElement;

    // ISSUE:  The user area section is hidden by toggling sidebars.
    userAreaSection.classList.add("user-area");

    const buttonContainer = document.createElement("div") as HTMLDivElement;
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
                displayVoiceChat(userAreaSection);
            } else {
                target.classList.add("unclicked");
                target.classList.remove("clicked");
                target.innerHTML = SVG_ICON_CLOSE;
            }
        }

    });

    buttonContainer.appendChild(buttonC);
    headerSection.insertBefore(buttonContainer, headerSection.firstChild);
};

function observeDOMRendering(observedNode: HTMLElement) {
    const config = { childList : true };
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

        const targetNode = document.getElementsByClassName("content-1jQy2l")[0] as HTMLElement;

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
function displayVoiceChat(userAreaSection: HTMLElement) {
    let isVoiceChatConnected = false as boolean;
    let voiceChat =  document.createElement("li") as HTMLElement;
    const userName = userAreaSection.textContent;
    const userAvatorURL = userAreaSection.getElementsByTagName("img")[0].getAttribute("src") as string;
    const userID = userAvatorURL.includes("https://cdn.discordapp.com/avatars/") 
                    ? userAvatorURL.split("/")[4]
                    : "non-user";
    console.log(userID);

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
        console.log(channel);

        // detect the channel you are in
        const usersInVCContainer = channel.childNodes[1] as HTMLElement;
        const usersInVC = usersInVCContainer.querySelectorAll('div[class^="userAvatar-') as NodeListOf<HTMLElement>;

        // userAvatarURL = https://cdn.discordapp.com/avatars/[userID]/[resourceID].webp?size=32
        // Avatar in VC = style="background-image: url("https://cdn.discordapp.com/avatars/[userID]/[resourceID].webp?size=28");"
        for (let j = 0; j < usersInVC.length; j++) {
            const user = usersInVC[j] as HTMLElement;
            const userStyle = user.getAttribute("style") as string;
            if ( userStyle.includes(userID) ) {
                console.log(userStyle);
                isVoiceChatConnected = true;
                voiceChat = channel.cloneNode(true) as HTMLElement;
                break;
            }
        }
    }

    if (isVoiceChatConnected) {
        const voiceChatContainerFloating = document.createElement("div") as HTMLDivElement;
        voiceChatContainerFloating.classList.add("voice-chat-container-floating");
        voiceChatContainerFloating.appendChild(voiceChat);
        document.body.appendChild(voiceChatContainerFloating);
    }
};