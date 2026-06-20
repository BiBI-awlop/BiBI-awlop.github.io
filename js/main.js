// ========== Supabase 云端数据库配置 ==========
const SUPABASE_URL = "https://osxjcvkosjnfurcejgoh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_jggrm7d8MCMVrnHCF7bSzw_SApTVNsG";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========== 全局变量 ==========
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

// ========== 全屏搜索模块全局变量 ==========
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const searchPageOverlay = document.getElementById("searchPageOverlay");
const searchInputOverlay = document.getElementById("searchInputOverlay");
const searchBtnOverlay = document.getElementById("searchBtnOverlay");
const searchResultBoxOverlay = document.getElementById("searchResultBoxOverlay");
const searchTabsOverlay = document.querySelectorAll(".search-page-overlay .search-tab");
const closeSearchPage = document.getElementById("closeSearchPage");
let currentSearchType = "game";

// ========== 页面容器DOM ==========
const homePage = document.querySelector('.home-page');
const playPage = document.querySelector('.play-page');
const forumPage = document.querySelector('.forum-page');
const minePage = document.querySelector('.mine-page');
const otherUserPage = document.querySelector('.other-user-page');
const navBtns = document.querySelectorAll('.nav-btn');
const gameBox = document.getElementById('gameBox');
const mineGameBox = document.getElementById('mineGameBox');
const otherGameBox = document.getElementById('otherGameBox');
const minePostBox = document.getElementById('minePostBox');
const otherPostBox = document.getElementById('otherPostBox');
const mineCommentBox = document.getElementById('mineCommentBox');
const postList = document.getElementById('postList');
const backHome = document.getElementById('backHome');
const gameIframe = document.getElementById('gameIframe');
const openModal = document.getElementById('openModal');
const gameMask = document.getElementById('gameMask');
const closeModal = document.getElementById('closeModal');
const saveGame = document.getElementById('saveGame');
const gameName = document.getElementById('gameName');
const gameUrl = document.getElementById('gameUrl');
const gameImg = document.getElementById('gameImg');
const editGameMask = document.getElementById('editGameMask');
const closeEditGame = document.getElementById('closeEditGame');
const submitEditGame = document.getElementById('submitEditGame');
const editGameId = document.getElementById('editGameId');
const editGameName = document.getElementById('editGameName');
const editGameUrl = document.getElementById('editGameUrl');
const editGameImg = document.getElementById('editGameImg');
const openPostModal = document.getElementById('openPostModal');
const postMask = document.getElementById('postMask');
const closePostModal = document.getElementById('closePostModal');
const submitPost = document.getElementById('submitPost');
const postText = document.getElementById('postText');
const gameTip = document.getElementById('gameTip');
const forumTip = document.getElementById('forumTip');
const mineTabs = document.querySelectorAll('.mine-tab');
const mineContents = document.querySelectorAll('.mine-content');
const otherTabs = document.querySelectorAll('.other-user-page .mine-tab');
const otherContents = document.querySelectorAll('.other-user-page .mine-content');
const otherUserNameDom = document.getElementById('otherUserName');
let targetOtherUserName = "";

// ========== 云端数据库读写函数（完全替代localStorage） ==========
/** 获取全部用户 */
async function getUserList(){
    const { data, error } = await supabase.from('app_users').select('*');
    if(error){
        console.error("读取用户失败",error);
        // 初始化默认管理员账号
        await supabase.from('app_users').insert([{name:"admin",pwd:"123456",is_admin:true}]);
        return [{name:'admin',pwd:'123456',isAdmin:true}];
    }
    return data.map(item=>{
        return {
            name: item.name,
            pwd: item.pwd,
            isAdmin: item.is_admin
        }
    });
}
/** 注册新增用户 */
async function addNewUser(userObj){
    await supabase.from('app_users').insert([userObj]);
}
/** 获取全部游戏 */
async function getGameList() {
    const { data, error } = await supabase.from('games').select('*').order('create_at',{asc:false});
    if(error){
        console.error("读取游戏失败",error);
        return [];
    }
    return data.map(item=>{
        return {
            id: item.id,
            name: item.name,
            url: item.url,
            img: item.img,
            author: item.author
        }
    })
}
/** 新增游戏 */
async function addGame(gameObj){
    await supabase.from('games').insert([gameObj]);
}
/** 修改游戏 */
async function updateGame(gameId, newData){
    await supabase.from('games').update(newData).eq('id',gameId);
}
/** 删除游戏 */
async function deleteGame(gameId){
    await supabase.from('games').delete().eq('id',gameId);
}
/** 获取全部帖子 */
async function getPostList(){
    const { data } = await supabase.from('posts').select('*').order('create_at',{asc:false});
    return data.map(item=>{
        return {
            id: item.id,
            user: item.user_name,
            content: item.content,
            time: item.time,
            comments: item.comments
        }
    })
}
/** 新增帖子 */
async function addPost(postObj){
    await supabase.from('posts').insert([postObj]);
}
/** 更新帖子（评论/删除） */
async function updatePost(postId, data){
    await supabase.from('posts').update(data).eq('id',postId);
}
async function deletePost(postId){
    await supabase.from('posts').delete().eq('id',postId);
}

// ========== 用户登录注册逻辑 ==========
// 打开登录弹窗
openLogin.onclick = ()=> loginMask.style.display = 'flex';
closeLogin.onclick = ()=> loginMask.style.display = 'none';
// 打开注册弹窗
openReg.onclick = ()=> regMask.style.display = 'flex';
closeReg.onclick = ()=> regMask.style.display = 'none';
// 登录提交
submitLogin.onclick = async function(){
    const name = loginName.value.trim();
    const pwd = loginPwd.value.trim();
    if(!name || !pwd) return alert("账号密码不能为空");
    const userList = await getUserList();
    const findUser = userList.find(u=>u.name === name && u.pwd === pwd);
    if(!findUser) return alert("账号或密码错误");
    loginUser = findUser;
    nowUserDom.innerText = loginUser.name;
    logoutBtn.style.display = 'inline-block';
    openLogin.style.display = 'none';
    openReg.style.display = 'none';
    loginMask.style.display = 'none';
    loginName.value = "";
    loginPwd.value = "";
    refreshAllPage();
}
// 注册提交
submitReg.onclick = async function(){
    const name = regName.value.trim();
    const pwd = regPwd.value.trim();
    if(!name || !pwd) return alert("账号密码不能为空");
    const userList = await getUserList();
    if(userList.find(u=>u.name === name)) return alert("账号已存在");
    await addNewUser({name,pwd,is_admin:false});
    alert("注册成功，请登录");
    regMask.style.display = 'none';
    regName.value = "";
    regPwd.value = "";
}
// 退出登录
logoutBtn.onclick = function(){
    loginUser = null;
    nowUserDom.innerText = "游客";
    logoutBtn.style.display = 'none';
    openLogin.style.display = 'inline-block';
    openReg.style.display = 'inline-block';
    refreshAllPage();
}
// 更新登录状态按钮
function refreshLoginBtnState(){
    if(!loginUser){
        openModal.disabled = true;
        openPostModal.disabled = true;
        gameTip.innerText = "提示：登录后才可添加游戏";
        forumTip.innerText = "提示：登录后才可发布帖子";
    }else{
        openModal.disabled = false;
        openPostModal.disabled = false;
        gameTip.innerText = "";
        forumTip.innerText = "";
    }
}

// ========== 页面导航切换 ==========
navBtns.forEach(btn=>{
    btn.onclick = async function(){
        navBtns.forEach(b=>b.classList.remove('active'));
        this.classList.add('active');
        const page = this.dataset.page;
        homePage.style.display = 'none';
        playPage.style.display = 'none';
        forumPage.style.display = 'none';
        minePage.style.display = 'none';
        otherUserPage.style.display = 'none';
        if(page === 'home'){
            homePage.style.display = 'block';
            await renderGame();
        }else if(page === 'forum'){
            forumPage.style.display = 'block';
            await renderPost();
        }else if(page === 'mine'){
            minePage.style.display = 'block';
            await renderMinePage();
        }
    }
})
backHome.onclick = function(){
    playPage.style.display = 'none';
    homePage.style.display = 'block';
    navBtns.forEach(b=>b.classList.remove('active'));
    navBtns[0].classList.add('active');
    gameIframe.src = "";
}

// ========== 游戏大厅渲染 ==========
async function renderGame() {
    refreshLoginBtnState();
    const list = await getGameList();
    gameBox.innerHTML = '';
    if(list.length === 0){
        gameBox.innerHTML = '<div class="empty-tip">暂无游戏，登录后添加新游戏</div>';
        return;
    }
    list.forEach(item => {
        const card = document.createElement('div');
        card.className = 'game-card';
        const canEdit = loginUser && (loginUser.name === item.author || loginUser.isAdmin);
        card.innerHTML = `
            <img class="card-img" src="${item.img || 'https://picsum.photos/id/237/300/160'}" alt="${item.name}">
            <div class="card-info">
                <div>
                    <div class="card-name">${item.name}</div>
                    <div class="card-author">发布者：${item.author}</div>
                </div>
                <div style="display:flex;gap:4px;">
                    <button class="edit-game-btn" data-id="${item.id}" ${canEdit ? '' : 'disabled'}>编辑</button>
                    <button class="del-btn" data-id="${item.id}" ${canEdit ? '' : 'disabled'}>删除</button>
                </div>
            </div>
        `;
        // 点击卡片打开游戏
        card.onclick = (e)=>{
            if(e.target.classList.contains('edit-game-btn') || e.target.classList.contains('del-btn')) return;
            openPlayGame(item.url);
        }
        gameBox.appendChild(card);
    })
    // 编辑游戏按钮
    document.querySelectorAll('.edit-game-btn').forEach(btn=>{
        btn.onclick = async function(e){
            e.stopPropagation();
            const gameId = Number(this.dataset.id);
            const allGame = await getGameList();
            const target = allGame.find(g=>g.id === gameId);
            editGameId.value = gameId;
            editGameName.value = target.name;
            editGameUrl.value = target.url;
            editGameImg.value = target.img || "";
            editGameMask.style.display = 'flex';
        }
    })
    // 删除游戏按钮
    document.querySelectorAll('.del-btn').forEach(btn=>{
        btn.onclick = async function(e){
            e.stopPropagation();
            const gameId = Number(this.dataset.id);
            if(!confirm("确定删除该游戏？")) return;
            await deleteGame(gameId);
            await renderGame();
            await renderMinePage();
        }
    })
}
function openPlayGame(url){
    homePage.style.display = 'none';
    forumPage.style.display = 'none';
    minePage.style.display = 'none';
    otherUserPage.style.display = 'none';
    playPage.style.display = 'block';
    gameIframe.src = url;
}

// ========== 添加游戏弹窗 ==========
openModal.onclick = ()=> gameMask.style.display = 'flex';
closeModal.onclick = ()=>{
    gameMask.style.display = 'none';
    gameName.value = "";
    gameUrl.value = "";
    gameImg.value = "";
}
saveGame.onclick = async function(){
    if(!loginUser) return alert("请先登录");
    const name = gameName.value.trim();
    const url = gameUrl.value.trim();
    const img = gameImg.value.trim();
    if(!name || !url) return alert("游戏名称和链接不能为空");
    await addGame({name, url, img, author:loginUser.name});
    gameMask.style.display = 'none';
    gameName.value = "";
    gameUrl.value = "";
    gameImg.value = "";
    await renderGame();
    await renderMinePage();
}
// 编辑游戏弹窗
closeEditGame.onclick = ()=> editGameMask.style.display = 'none';
submitEditGame.onclick = async function(){
    const id = Number(editGameId.value);
    const name = editGameName.value.trim();
    const url = editGameUrl.value.trim();
    const img = editGameImg.value.trim();
    if(!name || !url) return alert("名称和链接不能为空");
    await updateGame(id, {name, url, img});
    editGameMask.style.display = 'none';
    await renderGame();
    await renderMinePage();
}

// ========== 论坛帖子渲染 ==========
async function renderPost(){
    refreshLoginBtnState();
    const list = await getPostList();
    postList.innerHTML = '';
    if(list.length === 0){
        postList.innerHTML = '<div class="empty-tip">暂无帖子，登录发布第一条分享</div>';
        return;
    }
    list.forEach(item=>{
        const postDom = document.createElement('div');
        postDom.className = 'post-item';
        const canDel = loginUser && (loginUser.name === item.user || loginUser.isAdmin);
        let commentHtml = "";
        item.comments.forEach((com,idx)=>{
            commentHtml += `
                <div class="comment-item">
                    <div class="comment-top">
                        <span class="comment-user">${com.user}</span>
                        <span>${com.time}</span>
                        ${loginUser && loginUser.name === com.user ? `<span class="del-comment" data-postid="${item.id}" data-comidx="${idx}">删除</span>` : ""}
                    </div>
                    <div>${com.content}</div>
                </div>
            `
        })
        postDom.innerHTML = `
            <div class="post-head">
                <span class="post-author">${item.user}</span>
                <span>${item.time}</span>
            </div>
            <div class="post-content">${item.content}</div>
            <button class="del-post-btn" data-id="${item.id}" ${canDel ? '' : 'disabled'}>删除帖子</button>
            <div class="comment-wrap">
                <div class="comment-title">评论区</div>
                <div class="comment-input-box">
                    <input class="com-user-input" placeholder="你的昵称" value="${loginUser ? loginUser.name : ''}" ${loginUser ? 'readonly' : ''}>
                    <input class="com-content-input" placeholder="输入评论内容">
                    <button class="send-comment-btn" data-postid="${item.id}" ${loginUser ? '' : 'disabled'}>发送评论</button>
                </div>
                <div class="comment-list">
                    ${commentHtml || "<div style='color:#aaa;'>暂无评论</div>"}
                </div>
            </div>
        `;
        postList.appendChild(postDom);
    })
    // 删除帖子
    document.querySelectorAll('.del-post-btn').forEach(btn=>{
        btn.onclick = async function(){
            const pid = Number(this.dataset.id);
            if(!confirm("删除这条帖子？")) return;
            await deletePost(pid);
            await renderPost();
            await renderMinePage();
        }
    })
    // 发送评论
    document.querySelectorAll('.send-comment-btn').forEach(btn=>{
        btn.onclick = async function(){
            const pid = Number(this.dataset.postid);
            const userInput = this.parentElement.querySelector('.com-user-input');
            const contentInput = this.parentElement.querySelector('.com-content-input');
            const comUser = userInput.value.trim();
            const comContent = contentInput.value.trim();
            if(!comUser || !comContent) return alert("昵称和评论不能为空");
            const allPost = await getPostList();
            const targetPost = allPost.find(p=>p.id === pid);
            const newCom = {
                user: comUser,
                content: comContent,
                time: new Date().toLocaleString()
            };
            const newComments = [...targetPost.comments, newCom];
            await updatePost(pid, {comments:newComments});
            contentInput.value = "";
            await renderPost();
        }
    })
    // 删除评论
    document.querySelectorAll('.del-comment').forEach(el=>{
        el.onclick = async function(){
            const pid = Number(this.dataset.postid);
            const comIdx = Number(this.dataset.comidx);
            const allPost = await getPostList();
            const targetPost = allPost.find(p=>p.id === pid);
            targetPost.comments.splice(comIdx,1);
            await updatePost(pid, {comments:targetPost.comments});
            await renderPost();
        }
    })
}
// 发帖弹窗
openPostModal.onclick = ()=> postMask.style.display = 'flex';
closePostModal.onclick = ()=>{
    postMask.style.display = 'none';
    postText.value = "";
}
submitPost.onclick = async function(){
    if(!loginUser) return alert("请先登录");
    const content = postText.value.trim();
    if(!content) return alert("帖子内容不能为空");
    const now = new Date().toLocaleString();
    await addPost({
        user_name: loginUser.name,
        content,
        time: now,
        comments: []
    });
    postMask.style.display = 'none';
    postText.value = "";
    await renderPost();
    await renderMinePage();
}

// ========== 个人中心渲染 ==========
async function renderMinePage(){
    if(!loginUser) return;
    mineTabs.forEach(t=>t.onclick = function(){
        mineTabs.forEach(i=>i.classList.remove('active'));
        this.classList.add('active');
        const tab = this.dataset.tab;
        mineContents.forEach(c=>c.classList.remove('show'));
        document.getElementById(`mine${tab.charAt(0).toUpperCase()+tab.slice(1)}Box`).classList.add('show');
    })
    // 我的游戏
    mineGameBox.innerHTML = "";
    const allGame = await getGameList();
    const myGame = allGame.filter(g=>g.author === loginUser.name);
    if(myGame.length === 0){
        mineGameBox.innerHTML = '<div class="empty-tip">你还没有发布游戏</div>';
    }else{
        myGame.forEach(item=>{
            const card = document.createElement('div');
            card.className = 'game-card';
            card.innerHTML = `
                <img class="card-img" src="${item.img || 'https://picsum.photos/id/237/300/160'}">
                <div class="card-info">
                    <div class="card-name">${item.name}</div>
                    <div style="display:flex;gap:4px;">
                        <button class="mine-edit-btn" data-id="${item.id}">编辑</button>
                        <button class="del-btn" data-id="${item.id}">删除</button>
                    </div>
                </div>
            `;
            card.onclick = (e)=>{
                if(e.target.classList.contains('mine-edit-btn') || e.target.classList.contains('del-btn')) return;
                openPlayGame(item.url);
            }
            mineGameBox.appendChild(card);
        })
        // 编辑删除按钮复用逻辑
        document.querySelectorAll('.mine-edit-btn').forEach(btn=>{
            btn.onclick = async function(e){
                e.stopPropagation();
                const gameId = Number(this.dataset.id);
                const allGame = await getGameList();
                const target = allGame.find(g=>g.id === gameId);
                editGameId.value = gameId;
                editGameName.value = target.name;
                editGameUrl.value = target.url;
                editGameImg.value = target.img || "";
                editGameMask.style.display = 'flex';
            }
        })
        document.querySelectorAll('.mine-game-box .del-btn').forEach(btn=>{
            btn.onclick = async function(e){
                e.stopPropagation();
                const gameId = Number(this.dataset.id);
                if(!confirm("删除该游戏？")) return;
                await deleteGame(gameId);
                await renderMinePage();
                await renderGame();
            }
        })
    }
    // 我的帖子
    minePostBox.innerHTML = "";
    const allPost = await getPostList();
    const myPost = allPost.filter(p=>p.user === loginUser.name);
    if(myPost.length === 0){
        minePostBox.innerHTML = '<div class="empty-tip">你还没有发布帖子</div>';
    }else{
        myPost.forEach(item=>{
            const postDom = document.createElement('div');
            postDom.className = 'post-item';
            postDom.innerHTML = `
                <div class="post-head">
                    <span>我</span>
                    <span>${item.time}</span>
                </div>
                <div class="post-content">${item.content}</div>
                <button class="del-post-btn" data-id="${item.id}">删除帖子</button>
            `;
            minePostBox.appendChild(postDom);
        })
        document.querySelectorAll('#minePostBox .del-post-btn').forEach(btn=>{
            btn.onclick = async function(){
                const pid = Number(this.dataset.id);
                if(!confirm("删除帖子？")) return;
                await deletePost(pid);
                await renderMinePage();
                await renderPost();
            }
        })
    }
    // 我的评论
    mineCommentBox.innerHTML = "";
    let myCommentList = [];
    allPost.forEach(post=>{
        post.comments.forEach((com,idx)=>{
            if(com.user === loginUser.name){
                myCommentList.push({
                    postId: post.id,
                    postContent: post.content.slice(0,60),
                    comment: com,
                    comIndex: idx
                })
            }
        })
    })
    if(myCommentList.length === 0){
        mineCommentBox.innerHTML = '<div class="empty-tip">你没有发布过评论</div>';
    }else{
        myCommentList.forEach(item=>{
            const comDom = document.createElement('div');
            comDom.className = 'post-item';
            comDom.innerHTML = `
                <div style="color:#aaa;margin-bottom:8px;">原帖：${item.postContent}...</div>
                <div class="comment-item">
                    <div class="comment-top">
                        <span class="comment-user">我的评论</span>
                        <span>${item.comment.time}</span>
                        <span class="del-comment" data-postid="${item.postId}" data-comidx="${item.comIndex}">删除</span>
                    </div>
                    <div>${item.comment.content}</div>
                </div>
            `;
            mineCommentBox.appendChild(comDom);
        })
        document.querySelectorAll('#mineCommentBox .del-comment').forEach(el=>{
            el.onclick = async function(){
                const pid = Number(this.dataset.postid);
                const cidx = Number(this.dataset.comidx);
                const allPost = await getPostList();
                const target = allPost.find(p=>p.id === pid);
                target.comments.splice(cidx,1);
                await updatePost(pid, {comments:target.comments});
                await renderMinePage();
                await renderPost();
            }
        })
    }
}

// ========== 他人用户主页渲染（搜索跳转） ==========
async function openOtherUserPage(userName){
    targetOtherUserName = userName;
    otherUserNameDom.innerText = userName;
    homePage.style.display = 'none';
    forumPage.style.display = 'none';
    minePage.style.display = 'none';
    playPage.style.display = 'none';
    otherUserPage.style.display = 'block';
    // 标签切换
    otherTabs.forEach(t=>t.onclick = function(){
        otherTabs.forEach(i=>i.classList.remove('active'));
        this.classList.add('active');
        const tab = this.dataset.tab;
        otherContents.forEach(c=>c.classList.remove('show'));
        document.getElementById(`other${tab.charAt(0).toUpperCase()+tab.slice(1)}Box`).classList.add('show');
    })
    // 他人游戏
    otherGameBox.innerHTML = "";
    const allGame = await getGameList();
    const userGame = allGame.filter(g=>g.author === userName);
    if(userGame.length === 0){
        otherGameBox.innerHTML = '<div class="empty-tip">该用户暂无发布游戏</div>';
    }else{
        userGame.forEach(item=>{
            const card = document.createElement('div');
            card.className = 'game-card';
            card.innerHTML = `
                <img class="card-img" src="${item.img || 'https://picsum.photos/id/237/300/160'}">
                <div class="card-info">
                    <div class="card-name">${item.name}</div>
                    <div class="card-author">发布者：${userName}</div>
                </div>
            `;
            card.onclick = ()=> openPlayGame(item.url);
            otherGameBox.appendChild(card);
        })
    }
    // 他人帖子
    otherPostBox.innerHTML = "";
    const allPost = await getPostList();
    const userPost = allPost.filter(p=>p.user === userName);
    if(userPost.length === 0){
        otherPostBox.innerHTML = '<div class="empty-tip">该用户暂无发布帖子</div>';
    }else{
        userPost.forEach(item=>{
            const postDom = document.createElement('div');
            postDom.className = 'post-item';
            postDom.innerHTML = `
                <div class="post-head">
                    <span class="post-author">${userName}</span>
                    <span>${item.time}</span>
                </div>
                <div class="post-content">${item.content}</div>
            `;
            otherPostBox.appendChild(postDom);
        })
    }
}

// ========== 全屏搜索页面交互逻辑 ==========
function openSearchPage() {
    searchPageOverlay.style.display = "flex";
    searchInputOverlay.value = searchInput.value.trim();
    searchInputOverlay.focus();
    const key = searchInputOverlay.value.trim();
    if (key) doSearchOverlay(key);
}
function closeSearchPageFunc() {
    searchPageOverlay.style.display = "none";
    searchResultBoxOverlay.innerHTML = "";
    searchInputOverlay.value = "";
}
// 首页搜索按钮
searchBtn.onclick = openSearchPage;
searchInput.onkeydown = function(e){
    if(e.key === "Enter") openSearchPage();
}
closeSearchPage.onclick = closeSearchPageFunc;
// 搜索层内搜索
searchBtnOverlay.onclick = async function(){
    const key = searchInputOverlay.value.trim();
    if(!key){
        searchResultBoxOverlay.innerHTML = "<div style='color:#aaa;'>请输入搜索关键词</div>";
        return;
    }
    await doSearchOverlay(key);
}
searchInputOverlay.onkeydown = async function(e){
    if(e.key === "Enter"){
        const key = searchInputOverlay.value.trim();
        if(!key){
            searchResultBoxOverlay.innerHTML = "<div style='color:#aaa;'>请输入搜索关键词</div>";
            return;
        }
        await doSearchOverlay(key);
    }
}
// 搜索标签切换
searchTabsOverlay.forEach(tab=>{
    tab.onclick = async function(){
        searchTabsOverlay.forEach(t=>t.classList.remove('active'));
        this.classList.add('active');
        currentSearchType = this.dataset.type;
        const key = searchInputOverlay.value.trim();
        if(key) await doSearchOverlay(key);
        else searchResultBoxOverlay.innerHTML = "";
    }
})
// 云端搜索逻辑
async function doSearchOverlay(keyword){
    const key = keyword.toLowerCase();
    searchResultBoxOverlay.innerHTML = "";
    if(currentSearchType === "game"){
        const allGame = await getGameList();
        const filter = allGame.filter(g=>g.name.toLowerCase().includes(key));
        if(filter.length === 0){
            searchResultBoxOverlay.innerHTML = "<div style='color:#aaa;'>未找到相关游戏</div>";
            return;
        }
        filter.forEach(game=>{
            const item = document.createElement("div");
            item.className = "search-item";
            item.innerHTML = `
                <div style="font-size:17px;font-weight:bold;">${game.name}</div>
                <div style="font-size:13px;color:#aaa;">发布者：${game.author}</div>
            `;
            item.onclick = ()=>{
                closeSearchPageFunc();
                openPlayGame(game.url);
            }
            searchResultBoxOverlay.appendChild(item);
        })
    }else if(currentSearchType === "post"){
        const allPost = await getPostList();
        const filter = allPost.filter(p=>p.content.toLowerCase().includes(key) || p.user.toLowerCase().includes(key));
        if(filter.length === 0){
            searchResultBoxOverlay.innerHTML = "<div style='color:#aaa;'>未找到相关帖子</div>";
            return;
        }
        filter.forEach(post=>{
            const item = document.createElement("div");
            item.className = "search-item";
            item.innerHTML = `
                <div style="font-size:17px;font-weight:bold;">帖子（发布者：${post.user}）</div>
                <div style="font-size:13px;color:#aaa;">${post.content.slice(0,80)}${post.content.length>80?"...":""}</div>
            `;
            item.onclick = ()=>{
                closeSearchPageFunc();
                const newTab = window.open(location.href);
                newTab.onload = ()=>{
                    newTab.document.querySelector('[data-page="forum"]').click();
                }
            }
            searchResultBoxOverlay.appendChild(item);
        })
    }else if(currentSearchType === "user"){
        const userList = await getUserList();
        const filter = userList.filter(u=>u.name.toLowerCase().includes(key));
        if(filter.length === 0){
            searchResultBoxOverlay.innerHTML = "<div style='color:#aaa;'>未找到相关用户</div>";
            return;
        }
        filter.forEach(user=>{
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

// ========== 全局刷新页面 ==========
async function refreshAllPage(){
    refreshLoginBtnState();
    await renderGame();
    await renderPost();
}

// ========== 页面初始化 ==========
(async function init(){
    refreshLoginBtnState();
    await renderGame();
})();