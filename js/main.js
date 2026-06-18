// ====================== 首页内置搜索逻辑（整合后专用，无跨页面时序问题）
let currentSearchType = "game";
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const searchResultBox = document.getElementById("searchResultBox");
const searchTabs = document.querySelectorAll(".search-tab");

// 切换搜索分类标签
searchTabs.forEach(tab => {
    tab.onclick = function () {
        searchTabs.forEach(t => t.classList.remove("active"));
        this.classList.add("active");
        currentSearchType = this.dataset.type;
        const key = searchInput.value.trim();
        if (key) localSearch(key, currentSearchType);
    }
});

// 点击搜索按钮
searchBtn.onclick = function () {
    const key = searchInput.value.trim();
    if (!key) {
        searchResultBox.innerHTML = "<div style='color:#aaa;padding:20px;'>请输入搜索关键词</div>";
        return;
    }
    localSearch(key, currentSearchType);
};

// 回车触发搜索
searchInput.onkeydown = function (e) {
    if (e.key === "Enter") {
        const key = searchInput.value.trim();
        if (key) localSearch(key, currentSearchType);
    }
};

// 单页本地搜索核心函数（仅当前页面渲染结果，不跳转新页面）
function localSearch(keyword, type) {
    const key = keyword.toLowerCase();
    searchResultBox.innerHTML = "";

    // 搜索游戏
    if (type === "game") {
        const gameList = getGameList().filter(g => g.name.toLowerCase().includes(key));
        if (gameList.length === 0) {
            searchResultBox.innerHTML = "<div style='color:#aaa;padding:20px 0;'>未找到相关游戏</div>";
            return;
        }
        gameList.forEach(game => {
            const item = document.createElement("div");
            item.className = "search-item";
            item.style.cursor = "pointer";
            item.innerHTML = `
                <div style="font-size:17px;font-weight:bold;">${game.name}</div>
                <div style="font-size:13px;color:#aaa;">发布者：${game.author}</div>
            `;
            // 点击直接打开游戏游玩页
            item.onclick = () => openPlay(game.url);
            searchResultBox.appendChild(item);
        });
    }
    // 搜索帖子（删除详情跳转，仅展示文字预览）
    else if (type === "post") {
        const postList = getPostList().filter(p => p.content.toLowerCase().includes(key) || p.user.toLowerCase().includes(key));
        if (postList.length === 0) {
            searchResultBox.innerHTML = "<div style='color:#aaa;padding:20px 0;'>未找到相关帖子</div>";
            return;
        }
        postList.forEach(post => {
            const item = document.createElement("div");
            item.className = "search-item";
            item.innerHTML = `
                <div style="font-size:17px;font-weight:bold;">帖子 · ${post.user}</div>
                <div style="font-size:13px;color:#aaa;">${post.content.slice(0, 80)}${post.content.length > 80 ? "..." : ""}</div>
            `;
            searchResultBox.appendChild(item);
        });
    }
    // 搜索用户
    else if (type === "user") {
        const userList = getUserList().filter(u => u.name.toLowerCase().includes(key));
        if (userList.length === 0) {
            searchResultBox.innerHTML = "<div style='color:#aaa;padding:20px 0;'>未找到相关用户</div>";
            return;
        }
        userList.forEach(user => {
            const item = document.createElement("div");
            item.className = "search-item search-user-name";
            item.style.cursor = "pointer";
            item.innerHTML = `
                <div>${user.name} ${user.isAdmin ? "【管理员】" : ""}</div>
                <div style="font-size:13px;color:#aaa;margin-top:4px;">点击查看该用户发布内容</div>
            `;
            item.onclick = () => openOtherUserPage(user.name);
            searchResultBox.appendChild(item);
        });
    }
}

// 打开他人用户主页（原有函数保留，补充定义）
function openOtherUserPage(userName) {
    homePage.style.display = "none";
    forumPage.style.display = "none";
    minePage.style.display = "none";
    playPage.style.display = "none";
    otherUserPage.style.display = "block";
    document.getElementById("otherUserName").innerText = userName;
    renderOtherGame(userName);
    renderOtherPost(userName);
}