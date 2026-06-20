// ========== 全局用户状态 ==========
const nowUserDom = document.getElementById('nowUser');
const logoutBtn = document.getElementById('logoutBtn');
const openLogin = document.getElementById('openLogin');
const openReg = document.getElementById('openReg');
const loginMask = document.getElementById('loginMask');
const regMask = document.getElementById('regMask');
const closeLogin = document.getElementById('closeLogin');
const closeReg = document.getElementById('closeReg');
const submitLogin = document.getElementById('submitLogin');
const submitReg = document.getElementById('submitReg');
const loginName = document.getElementById('loginName');
const loginPwd = document.getElementById('loginPwd');
const regName = document.getElementById('regName');
const regPwd = document.getElementById('regPwd');
let loginUser = null;

// ========== 搜索模块全局变量（全屏覆盖版） ==========
// 首页搜索入口
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
// 全屏搜索结果层
const searchPageOverlay = document.getElementById("searchPageOverlay");
const searchInputOverlay = document.getElementById("searchInputOverlay");
const searchBtnOverlay = document.getElementById("searchBtnOverlay");
const searchResultBoxOverlay = document.getElementById("searchResultBoxOverlay");
const searchTabsOverlay = document.querySelectorAll(".search-page-overlay .search-tab");
const closeSearchPage = document.getElementById("closeSearchPage");
let currentSearchType = "game";

// 用户数据
function getUserList(){
    let data = localStorage.getItem('userList');
    return data ? JSON.parse(data) : [{name:'admin',pwd:'123456',isAdmin:true}];
}
function saveUserList(arr){
    localStorage.setItem('userList',JSON.stringify(arr));
}
function updateUserUI(){
    if(loginUser){
        nowUserDom.innerText = loginUser.isAdmin ? `管理员：${loginUser.name}` : `用户：${loginUser.name}`;
        openLogin.style.display = 'none';
        openReg.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
    }else{
        nowUserDom.innerText = "游客";
        openLogin.style.display = 'inline-block';
        openReg.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
    }
    refreshAllBtnStatus();
}
function refreshAllBtnStatus(){
    const addGameBtn = document.getElementById('openModal');
    const writePostBtn = document.getElementById('openPostModal');
    const gameTip = document.getElementById('gameTip');
    const forumTip = document.getElementById('forumTip');
    if(!loginUser){
        addGameBtn.disabled = true;
        writePostBtn.disabled = true;
        gameTip.innerText = "提示：登录后才可添加游戏";
        forumTip.innerText = "提示：登录后才可发帖、评论";
    }else{
        addGameBtn.disabled = false;
        writePostBtn.disabled = false;
        gameTip.innerText = "";
        forumTip.innerText = "";
    }
}
// 登录注册退出
submitLogin.onclick = function(){
    const un = loginName.value.trim();
    const pw = loginPwd.value.trim();
    if(!un||!pw){alert("账号密码不能为空");return;}
    const userArr = getUserList();
    const find = userArr.find(u=>u.name===un&&u.pwd===pw);
    if(!find){alert("账号或密码错误");return;}
    loginUser = {name:find.name,isAdmin:!!find.isAdmin};
    loginMask.style.display = 'none';
    loginName.value = "";loginPwd.value = "";
    updateUserUI();renderGame();renderPost();renderMinePage();
}
submitReg.onclick = function(){
    const un = regName.value.trim();
    const pw = regPwd.value.trim();
    if(!un||!pw){alert("账号密码不能为空");return;}
    if(un==="admin"){alert("禁止注册admin管理员账号");return;}
    const userArr = getUserList();
    if(userArr.find(u=>u.name===un)){alert("账号已存在");return;}
    userArr.push({name:un,pwd:pw,isAdmin:false});
    saveUserList(userArr);
    regMask.style.display = 'none';
    regName.value = "";regPwd.value = "";
    alert("注册成功，请登录");
}
logoutBtn.onclick = function(){
    loginUser = null;
    updateUserUI();renderGame();renderPost();renderMinePage();
}
openLogin.onclick = ()=>loginMask.style.display='flex';
openReg.onclick = ()=>regMask.style.display='flex';
closeLogin.onclick = ()=>loginMask.style.display='none';
closeReg.onclick = ()=>regMask.style.display='none';

// ====================== 页面导航切换 ======================
const homePage = document.querySelector('.home-page');
const playPage = document.querySelector('.play-page');
const forumPage = document.querySelector('.forum-page');
const minePage = document.querySelector('.mine-page');
const otherUserPage = document.querySelector('.other-user-page');
const navBtns = document.querySelectorAll('.nav-btn');
navBtns.forEach(btn=>{
    btn.addEventListener('click',()=>{
        navBtns.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.dataset.page;
        // 隐藏所有页面
        homePage.style.display = 'none';
        playPage.style.display = 'none';
        forumPage.style.display = 'none';
        minePage.style.display = 'none';
        otherUserPage.style.display = 'none';
        if(target === 'home') {homePage.style.display = 'block';renderGame();}
        if(target === 'forum') {forumPage.style.display = 'block';renderPost();}
        if(target === 'mine'){
            if(!loginUser){alert("请先登录再进入个人中心");return;}
            minePage.style.display = 'block';renderMinePage();
        }
    })
})
// 个人中心标签切换
const mineTabs = document.querySelectorAll('.mine-tab');
const mineContents = document.querySelectorAll('.mine-content');
mineTabs.forEach(tab=>{
    tab.onclick = function(){
        const t = this.dataset.tab;
        mineTabs.forEach(i=>i.classList.remove('active'));
        this.classList.add('active');
        mineContents.forEach(c=>c.classList.remove('show'));
        if(t==='game') document.getElementById('mineGameBox').classList.add('show');
        if(t==='post') document.getElementById('minePostBox').classList.add('show');
        if(t==='comment') document.getElementById('mineCommentBox').classList.add('show');
        renderMinePage();
    }
})
// 他人主页标签切换
const otherTabs = document.querySelectorAll('.other-user-page .mine-tab');
const otherContents = document.querySelectorAll('.other-user-page .mine-content');
otherTabs.forEach(tab=>{
    tab.onclick = function(){
        const t = this.dataset.tab;
        otherTabs.forEach(i=>i.classList.remove('active'));
        this.classList.add('active');
        otherContents.forEach(c=>c.classList.remove('show'));
        if(t==='otherGame') document.getElementById('otherGameBox').classList.add('show');
        if(t==='otherPost') document.getElementById('otherPostBox').classList.add('show');
        renderOtherUserPage();
    }
})

// ====================== 游戏模块 ======================
const gameBox = document.getElementById('gameBox');
const mineGameBox = document.getElementById('mineGameBox');
const otherGameBox = document.getElementById('otherGameBox');
const gameMask = document.getElementById('gameMask');
const openModal = document.getElementById('openModal');
const closeModal = document.getElementById('closeModal');
const saveGame = document.getElementById('saveGame');
const backHome = document.getElementById('backHome');
const gameIframe = document.getElementById('gameIframe');
const gameName = document.getElementById('gameName');
const gameUrl = document.getElementById('gameUrl');
const gameImg = document.getElementById('gameImg');
function getGameList() {
    let list = localStorage.getItem('gameList');
    return list ? JSON.parse(list) : [];
}
function saveGameList(arr) {
    localStorage.setItem('gameList', JSON.stringify(arr));
}
function renderGame() {
    const list = getGameList();
    gameBox.innerHTML = '';
    if(list.length === 0) {
        gameBox.innerHTML = '<div class="empty-tip">暂无游戏，登录后添加第一款游戏</div>';
        return;
    }
    list.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'game-card';
        const canDel = loginUser && (loginUser.isAdmin || loginUser.name === item.author);
        card.innerHTML = `
            <img class="card-img" src="${item.img || 'https://picsum.photos/id/237/300/160'}" alt="${item.name}">
            <div class="card-info">
                <div>
                    <span class="card-name">${item.name}</span>
                    <div class="card-author">发布者：${item.author}</div>
                </div>
                <div style="display:flex;gap:6px;">
                    <button class="edit-game-btn" data-index="${index}" ${canDel?"":"disabled"}>编辑</button>
                    <button class="del-btn" data-index="${index}" ${canDel?"":"disabled"}>删除</button>
                </div>
            </div>
        `;
        card.addEventListener('click', (e) => {
            if(e.target.classList.contains('del-btn') || e.target.classList.contains('edit-game-btn')) return;
            openPlay(item.url);
        })
        gameBox.appendChild(card);
    })
    document.querySelectorAll('.del-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            let idx = e.target.dataset.index;
            let arr = getGameList();
            arr.splice(idx, 1);
            saveGameList(arr);
            renderGame();renderMinePage();
        })
    })
    bindGameEditBtn();
}
// 渲染我的游戏
function renderMineGame(){
    mineGameBox.innerHTML = '';
    const allGame = getGameList();
    const myGame = allGame.filter(g=>g.author === loginUser.name);
    if(myGame.length===0){
        mineGameBox.innerHTML = '<div class="empty-tip">你还没有发布任何游戏</div>';
        return;
    }
    myGame.forEach((item,idx)=>{
        const div = document.createElement('div');
        div.className = 'game-card';
        div.innerHTML = `
            <img class="card-img" src="${item.img || 'https://picsum.photos/id/237/300/160'}">
            <div class="card-info">
                <span class="card-name">${item.name}</span>
                <div style="display:flex;gap:6px;">
                    <button class="mine-edit-btn" data-mineidx="${idx}">编辑</button>
                    <button class="del-btn" data-mineidx="${idx}">删除</button>
                </div>
            </div>
        `;
        div.onclick = e=>{
            if(e.target.classList.contains('del-btn') || e.target.classList.contains('mine-edit-btn')) return;
            openPlay(item.url);
        }
        mineGameBox.appendChild(div);
    })
    mineGameBox.querySelectorAll('.del-btn').forEach(btn=>{
        btn.onclick = function(){
            const mineIdx = this.dataset.mineidx;
            const all = getGameList();
            const myGame = all.filter(g=>g.author===loginUser.name);
            const targetGame = myGame[mineIdx];
            const realIndex = all.findIndex(g=>g.name===targetGame.name&&g.author===loginUser.name&&g.url===targetGame.url);
            all.splice(realIndex,1);
            saveGameList(all);renderGame();renderMinePage();
        }
    })
    bindMineGameEditBtn();
}
// 渲染他人发布的游戏（他人主页）
function renderOtherGame(targetUserName){
    otherGameBox.innerHTML = '';
    const allGame = getGameList();
    const targetGame = allGame.filter(g=>g.author === targetUserName);
    if(targetGame.length===0){
        otherGameBox.innerHTML = '<div class="empty-tip">该用户没有发布游戏</div>';
        return;
    }
    targetGame.forEach(item=>{
        const div = document.createElement('div');
        div.className = 'game-card';
        div.innerHTML = `
            <img class="card-img" src="${item.img || 'https://picsum.photos/id/237/300/160'}">
            <div class="card-info">
                <span class="card-name">${item.name}</span>
            </div>
        `;
        div.onclick = ()=> openPlay(item.url);
        otherGameBox.appendChild(div);
    })
}
function openPlay(url) {
    homePage.style.display = 'none';
    forumPage.style.display = 'none';
    minePage.style.display = 'none';
    otherUserPage.style.display = 'none';
    playPage.style.display = 'block';
    gameIframe.src = url;
}
backHome.addEventListener('click', () => {
    playPage.style.display = 'none';
    homePage.style.display = 'block';
    gameIframe.src = '';
    navBtns.forEach(b=>b.classList.remove('active'));
    navBtns[0].classList.add('active');
    renderGame();
})
openModal.addEventListener('click', () => gameMask.style.display = 'flex');
closeModal.addEventListener('click', () => {
    gameMask.style.display = 'none';
    gameName.value = '';gameUrl.value = '';gameImg.value = '';
})
saveGame.addEventListener('click', () => {
    let name = gameName.value.trim();
    let url = gameUrl.value.trim();
    let img = gameImg.value.trim();
    if(!name || !url) {alert('游戏名称和游戏链接不能为空！');return;}
    const list = getGameList();
    list.push({name, url, img, author:loginUser.name});
    saveGameList(list);
    gameMask.style.display = 'none';
    gameName.value = '';gameUrl.value = '';gameImg.value = '';
    renderGame();renderMinePage();
})

// ====================== 编辑游戏模块 ======================
const editGameMask = document.getElementById('editGameMask');
const closeEditGame = document.getElementById('closeEditGame');
const submitEditGame = document.getElementById('submitEditGame');
const editGameIndex = document.getElementById('editGameIndex');
const editGameName = document.getElementById('editGameName');
const editGameUrl = document.getElementById('editGameUrl');
const editGameImg = document.getElementById('editGameImg');

closeEditGame.onclick = function () {
    editGameMask.style.display = 'none';
    editGameIndex.value = '';
    editGameName.value = '';
    editGameUrl.value = '';
    editGameImg.value = '';
}
function bindGameEditBtn() {
    document.querySelectorAll('.edit-game-btn').forEach(btn => {
        btn.onclick = function (e) {
            e.stopPropagation();
            const idx = this.dataset.index;
            const allGames = getGameList();
            const target = allGames[idx];
            editGameIndex.value = idx;
            editGameName.value = target.name;
            editGameUrl.value = target.url;
            editGameImg.value = target.img || '';
            editGameMask.style.display = 'flex';
        }
    })
}
function bindMineGameEditBtn() {
    document.querySelectorAll('.mine-edit-btn').forEach(btn => {
        btn.onclick = function (e) {
            e.stopPropagation();
            const mineIdx = this.dataset.mineidx;
            const allGames = getGameList();
            const myGameArr = allGames.filter(g => g.author === loginUser.name);
            const target = myGameArr[mineIdx];
            const realIndex = allGames.findIndex(g => g.name === target.name && g.author === loginUser.name && g.url === target.url);
            editGameIndex.value = realIndex;
            editGameName.value = target.name;
            editGameUrl.value = target.url;
            editGameImg.value = target.img || '';
            editGameMask.style.display = 'flex';
        }
    })
}
submitEditGame.onclick = function () {
    const idx = editGameIndex.value;
    const newName = editGameName.value.trim();
    const newUrl = editGameUrl.value.trim();
    const newImg = editGameImg.value.trim();
    if (!newName || !newUrl) {
        alert('游戏名称和游戏链接不能为空！');
        return;
    }
    const allGames = getGameList();
    allGames[idx].name = newName;
    allGames[idx].url = newUrl;
    allGames[idx].img = newImg;
    saveGameList(allGames);
    editGameMask.style.display = 'none';
    editGameIndex.value = '';
    editGameName.value = '';
    editGameUrl.value = '';
    editGameImg.value = '';
    renderGame();
    renderMinePage();
}

// ====================== 论坛帖子评论模块 ======================
const postMask = document.getElementById('postMask');
const openPostModal = document.getElementById('openPostModal');
const closePostModal = document.getElementById('closePostModal');
const submitPost = document.getElementById('submitPost');
const postList = document.getElementById('postList');
const minePostBox = document.getElementById('minePostBox');
const otherPostBox = document.getElementById('otherPostBox');
const postText = document.getElementById('postText');
function getPostList(){
    let data = localStorage.getItem('postList');
    return data ? JSON.parse(data) : [];
}
function savePostList(arr){
    localStorage.setItem('postList', JSON.stringify(arr));
}
function renderPost(){
    const arr = getPostList();
    postList.innerHTML = '';
    if(arr.length === 0){
        postList.innerHTML = '<div class="empty-tip">暂无帖子，登录后发布第一条分享吧！</div>';
        return;
    }
    arr.forEach((postItem,postIndex)=>{
        const canDelPost = loginUser && (loginUser.isAdmin || loginUser.name === postItem.user);
        let commentHtml = '';
        const commentArr = postItem.comments || [];
        if(commentArr.length > 0){
            commentArr.forEach((com,comIdx)=>{
                const canDelCom = loginUser && (loginUser.isAdmin || loginUser.name === com.user || loginUser.name === postItem.user);
                commentHtml += `
                    <div class="comment-item">
                        <div class="comment-top">
                            <span><span class="floor">${com.floor}楼</span> <span class="comment-user">${com.user}</span></span>
                            <span>${com.time} <span class="del-comment" data-post="${postIndex}" data-com="${comIdx}" ${canDelCom?"":"disabled"}>删除</span></span>
                        </div>
                        <div class="comment-text">${com.text}</div>
                    </div>
                `;
            })
        }else commentHtml = '<div style="color:#aaa;">暂无评论，快来抢沙发！</div>';
        const div = document.createElement('div');
        div.className = 'post-item';
        const canSendCom = !!loginUser;
        div.innerHTML = `
            <div class="post-head">
                <span class="post-name">${postItem.user}</span>
                <span>${postItem.time}</span>
            </div>
            <div class="post-content">${postItem.content}</div>
            <button class="post-del" data-postidx="${postIndex}" ${canDelPost?"":"disabled"}>删除整篇帖子</button>
            <div class="comment-wrap">
                <div class="comment-title">评论区</div>
                <div class="comment-input-box">
                    <input class="com-user" placeholder="昵称" value="${loginUser?loginUser.name:''}" ${loginUser?"readonly":"disabled"}>
                    <input class="com-text" placeholder="输入评论内容" ${canSendCom?"":"disabled"}>
                    <button class="send-comment" data-pid="${postIndex}" ${canSendCom?"":"disabled"}>发送评论</button>
                </div>
                <div class="comment-list">${commentHtml}</div>
            </div>
        `;
        postList.appendChild(div);
    })
    bindPostEvent();
}
function bindPostEvent(){
    document.querySelectorAll('.post-del').forEach(btn=>{
        btn.onclick = function(){
            let pid = this.dataset.postidx;
            let list = getPostList();
            list.splice(pid,1);savePostList(list);renderPost();renderMinePage();
        }
    })
    document.querySelectorAll('.send-comment').forEach(btn=>{
        btn.onclick = function(){
            const pid = this.dataset.pid;
            const textInput = this.parentElement.querySelector('.com-text');
            const ctext = textInput.value.trim();
            if(!ctext){alert("评论内容不能为空！");return;}
            let allPost = getPostList();
            let targetPost = allPost[pid];
            if(!targetPost.comments) targetPost.comments = [];
            const floorNum = targetPost.comments.length + 1;
            const now = new Date();
            const timeStr = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}`;
            targetPost.comments.push({user: loginUser.name,text: ctext,time: timeStr,floor: floorNum});
            savePostList(allPost);renderPost();renderMinePage();
        }
    })
    document.querySelectorAll('.del-comment').forEach(btn=>{
        btn.onclick = function(){
            const pid = this.dataset.post;
            const cid = this.dataset.com;
            let allPost = getPostList();
            let comments = allPost[pid].comments;
            comments.splice(cid,1);
            comments.forEach((item,i)=>{item.floor = i + 1;})
            savePostList(allPost);renderPost();renderMinePage();
        }
    })
}
openPostModal.addEventListener('click',()=>postMask.style.display = 'flex');
closePostModal.addEventListener('click',()=>{postMask.style.display = 'none';postText.value = '';})
submitPost.addEventListener('click',()=>{
    let content = postText.value.trim();
    if(!content){alert('帖子内容不能为空！');return;}
    const now = new Date();
    const time = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} ${now.getHours()}`;
    const arr = getPostList();
    arr.unshift({user: loginUser.name,content,time,comments: []});
    savePostList(arr);
    postMask.style.display = 'none';postText.value = '';
    renderPost();renderMinePage();
})

// ====================== 个人中心渲染（自己） ======================
function renderMinePage(){
    if(!loginUser) return;
    renderMineGame();renderMinePost();renderMineComment();
}
// 我的帖子
function renderMinePost(){
    const minePostBox = document.getElementById('minePostBox');
    minePostBox.innerHTML = '';
    const allPost = getPostList();
    const myPostList = allPost.filter(p=>p.user === loginUser.name);
    if(myPostList.length===0){
        minePostBox.innerHTML = '<div class="empty-tip">你还没有发布任何帖子</div>';
        return;
    }
    myPostList.forEach((postItem,postIndex)=>{
        const realIdx = allPost.findIndex(p=>p.user===loginUser.name&&p.content===postItem.content&&p.time===postItem.time);
        let commentHtml = '';
        const commentArr = postItem.comments || [];
        commentArr.forEach((com,comIdx)=>{
            commentHtml += `
                <div class="comment-item">
                    <div class="comment-top">
                        <span><span class="floor">${com.floor}楼</span> <span class="comment-user">${com.user}</span></span>
                        <span>${com.time}</span>
                    </div>
                    <div class="comment-text">${com.text}</div>
                </div>
            `;
        })
        const div = document.createElement('div');
        div.className = 'post-item';
        div.innerHTML = `
            <div class="post-head">
                <span class="post-name">我的帖子</span>
                <span>${postItem.time}</span>
            </div>
            <div class="post-content">${postItem.content}</div>
            <button class="post-del" data-mypostidx="${realIdx}">删除整篇帖子</button>
            <div class="comment-wrap">
                <div class="comment-title">帖子评论</div>
                <div class="comment-list">${commentHtml || '<div style="color:#aaa;">暂无评论</div>'}</div>
            </div>
        `;
        minePostBox.appendChild(div);
    })
    minePostBox.querySelectorAll('.post-del').forEach(btn=>{
        btn.onclick = function(){
            const ridx = this.dataset.mypostidx;
            const all = getPostList();
            all.splice(ridx,1);savePostList(all);renderPost();renderMinePage();
        }
    })
}
// 我的评论
function renderMineComment(){
    const mineCommentBox = document.getElementById('mineCommentBox');
    mineCommentBox.innerHTML = '';
    const allPost = getPostList();
    let myCommentList = [];
    allPost.forEach((post,pIdx)=>{
        if(!post.comments) return;
        post.comments.forEach((com,cIdx)=>{
            if(com.user === loginUser.name){
                myCommentList.push({postIndex:pIdx,comment:cIdx,postContent:post.content,com});
            }
        })
    })
    if(myCommentList.length===0){
        mineCommentBox.innerHTML = '<div class="empty-tip">你还没有发表任何评论</div>';
        return;
    }
    myCommentList.forEach(item=>{
        const div = document.createElement('div');
        div.className = 'my-comment-item';
        div.innerHTML = `
            <div class="my-comment-post-info">原帖内容：${item.postContent.slice(0,60)}${item.postContent.length>60?'...':''}</div>
            <div>我的评论 <span class="floor">${item.com.floor}楼</span> ${item.com.time}</div>
            <div class="my-comment-text">${item.com.text}</div>
            <button class="del-btn" data-p="${item.postIndex}" data-c="${item.comment}">删除这条评论</button>
        `;
        mineCommentBox.appendChild(div);
    })
    mineCommentBox.querySelectorAll('.del-btn').forEach(btn=>{
        btn.onclick = function(){
            const p = this.dataset.p;
            const c = this.dataset.c;
            const all = getPostList();
            all[p].comments.splice(c,1);
            all[p].comments.forEach((cm,i)=>cm.floor=i+1);
            savePostList(all);renderPost();renderMinePage();
        }
    })
}

// ====================== 他人用户主页（搜索跳转专用，无评论） ======================
let targetOtherUserName = "";
function openOtherUserPage(userName){
    targetOtherUserName = userName;
    document.getElementById("otherUserName").innerText = userName;
    // 隐藏全部原有页面
    homePage.style.display = 'none';
    playPage.style.display = 'none';
    forumPage.style.display = 'none';
    minePage.style.display = 'none';
    otherUserPage.style.display = 'block';
    renderOtherUserPage();
}
function renderOtherUserPage(){
    renderOtherGame(targetOtherUserName);
    renderOtherPost(targetOtherUserName);
}
// 他人帖子
function renderOtherPost(userName){
    otherPostBox.innerHTML = '';
    const allPost = getPostList();
    const userPost = allPost.filter(p=>p.user === userName);
    if(userPost.length===0){
        otherPostBox.innerHTML = '<div class="empty-tip">该用户没有发布帖子</div>';
        return;
    }
    userPost.forEach(postItem=>{
        let commentHtml = '';
        const commentArr = postItem.comments || [];
        commentArr.forEach(com=>{
            commentHtml += `
                <div class="comment-item">
                    <div class="comment-top">
                        <span><span class="floor">${com.floor}楼</span> <span class="comment-user">${com.user}</span></span>
                        <span>${com.time}</span>
                    </div>
                    <div class="comment-text">${com.text}</div>
                </div>
            `;
        })
        const div = document.createElement('div');
        div.className = 'post-item';
        div.innerHTML = `
            <div class="post-head">
                <span class="post-name">用户：${userName}</span>
                <span>${postItem.time}</span>
            </div>
            <div class="post-content">${postItem.content}</div>
            <div class="comment-wrap">
                <div class="comment-title">帖子评论</div>
                <div class="comment-list">${commentHtml || '<div style="color:#aaa;">暂无评论</div>'}</div>
            </div>
        `;
        otherPostBox.appendChild(div);
    })
}

// ====================== 全屏搜索页面交互逻辑 ======================
// 打开全屏搜索层
function openSearchPage() {
    searchPageOverlay.style.display = "flex";
    searchInputOverlay.value = searchInput.value.trim();
    searchInputOverlay.focus();
    const key = searchInputOverlay.value.trim();
    if (key) doSearchOverlay(key);
}
// 关闭全屏搜索层
function closeSearchPageFunc() {
    searchPageOverlay.style.display = "none";
    searchResultBoxOverlay.innerHTML = "";
    searchInputOverlay.value = "";
}
// 首页搜索按钮点击
searchBtn.onclick = function(){
    openSearchPage();
}
searchInput.onkeydown = function(e){
    if(e.key === "Enter") openSearchPage();
}
// 关闭搜索按钮
closeSearchPage.onclick = closeSearchPageFunc;
// 搜索层内搜索按钮
searchBtnOverlay.onclick = function(){
    const key = searchInputOverlay.value.trim();
    if(!key){
        searchResultBoxOverlay.innerHTML = "<div style='color:#aaa;'>请输入搜索关键词</div>";
        return;
    }
    doSearchOverlay(key);
}
searchInputOverlay.onkeydown = function(e){
    if(e.key === "Enter"){
        const key = searchInputOverlay.value.trim();
        if(!key){
            searchResultBoxOverlay.innerHTML = "<div style='color:#aaa;'>请输入搜索关键词</div>";
            return;
        }
        doSearchOverlay(key);
    }
}
// 搜索分类标签切换
searchTabsOverlay.forEach(tab=>{
    tab.onclick = function(){
        searchTabsOverlay.forEach(t=>t.classList.remove('active'));
        this.classList.add('active');
        currentSearchType = this.dataset.type;
        const key = searchInputOverlay.value.trim();
        if(key) doSearchOverlay(key);
        else searchResultBoxOverlay.innerHTML = "";
    }
})
// 执行搜索（全屏层专用）
function doSearchOverlay(keyword){
    const key = keyword.toLowerCase();
    searchResultBoxOverlay.innerHTML = "";
    if(currentSearchType === "game"){
        const gameList = getGameList().filter(g=>g.name.toLowerCase().includes(key));
        if(gameList.length === 0){
            searchResultBoxOverlay.innerHTML = "<div style='color:#aaa;'>未找到相关游戏</div>";
            return;
        }
        gameList.forEach(game=>{
            const item = document.createElement("div");
            item.className = "search-item";
            item.innerHTML = `
                <div style="font-size:17px;font-weight:bold;">${game.name}</div>
                <div style="font-size:13px;color:#aaa;">发布者：${game.author}</div>
            `;
            item.onclick = ()=>{
                const newTab = window.open();
                newTab.document.write(`<iframe style="width:100%;height:100vh;border:none;" src="${game.url}"></iframe>`);
            }
            searchResultBoxOverlay.appendChild(item);
        })
    }else if(currentSearchType === "post"){
        const postList = getPostList().filter(p=>p.content.toLowerCase().includes(key) || p.user.toLowerCase().includes(key));
        if(postList.length === 0){
            searchResultBoxOverlay.innerHTML = "<div style='color:#aaa;'>未找到相关帖子</div>";
            return;
        }
        postList.forEach(post=>{
            const item = document.createElement("div");
            item.className = "search-item";
            item.innerHTML = `
                <div style="font-size:17px;font-weight:bold;">帖子（发布者：${post.user}）</div>
                <div style="font-size:13px;color:#aaa;">${post.content.slice(0,80)}${post.content.length>80?"...":""}</div>
            `;
            item.onclick = ()=>{
                closeSearchPageFunc();
                const newTab = window.open(location.href);
                newTab.onload = function(){
                    newTab.document.querySelector('[data-page="forum"]').click();
                }
            }
            searchResultBoxOverlay.appendChild(item);
        })
    }else if(currentSearchType === "user"){
        const userList = getUserList().filter(u=>u.name.toLowerCase().includes(key));
        if(userList.length === 0){
            searchResultBoxOverlay.innerHTML = "<div style='color:#aaa;'>未找到相关用户</div>";
            return;
        }
        userList.forEach(user=>{
            const item = document.createElement("div");
            item.className = "search-item";
            item.innerHTML = `
                <div class="search-user-name">${user.name} ${user.isAdmin?"【管理员】":""}</div>
                <div style="font-size:13px;color:#aaa;">点击查看该用户主页</div>
            `;
            item.onclick = ()=>{
                closeSearchPageFunc();
                openOtherUserPage(user.name);
            }
            searchResultBoxOverlay.appendChild(item);
        })
    }
}

// 初始化页面
updateUserUI();
renderGame();