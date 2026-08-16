// ======================================================
// Mini Social Media - Frontend App
// ======================================================

const API_BASE = "/api";

// ======================================================
// DOM ELEMENTS
// ======================================================

const authSection =
    document.getElementById("authSection");

const feedSection =
    document.getElementById("feedSection");

const currentUser =
    document.getElementById("currentUser");

// ======================================================
// NOTIFICATIONS DOM
// ======================================================

const notificationBtn =
    document.getElementById(
        "notificationBtn"
    );

const notificationBadge =
    document.getElementById(
        "notificationBadge"
    );

const notificationPanel =
    document.getElementById(
        "notificationPanel"
    );

const notificationsContainer =
    document.getElementById(
        "notificationsContainer"
    );

const markAllNotificationsReadBtn =
    document.getElementById(
        "markAllNotificationsReadBtn"
    );

let notificationRefreshTimer = null;

const myProfileBtn =
    document.getElementById("myProfileBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");

const feedContainer =
    document.getElementById("feedContainer");

const createPostForm =
    document.getElementById("createPostForm");

const createPostMessage =
    document.getElementById("createPostMessage");

// ======================================================
// PROFILE DOM
// ======================================================

const profileSection =
    document.getElementById("profileSection");

const profilePicture =
    document.getElementById("profilePicture");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const profileBio =
    document.getElementById("profileBio");

const profilePostsCount =
    document.getElementById(
        "profilePostsCount"
    );

const profileFollowersCount =
    document.getElementById(
        "profileFollowersCount"
    );

const profileFollowingCount =
    document.getElementById(
        "profileFollowingCount"
    );

const followButton =
    document.getElementById(
        "followButton"
    );

const profileMessage =
    document.getElementById(
        "profileMessage"
    );

// ======================================================
// EDIT PROFILE DOM
// ======================================================

const editProfileBtn =
    document.getElementById(
        "editProfileBtn"
    );

const editProfileSection =
    document.getElementById(
        "editProfileSection"
    );

const editProfileForm =
    document.getElementById(
        "editProfileForm"
    );

const editProfileName =
    document.getElementById(
        "editProfileName"
    );

const editProfileBio =
    document.getElementById(
        "editProfileBio"
    );

const editProfilePicture =
    document.getElementById(
        "editProfilePicture"
    );

const cancelEditProfileBtn =
    document.getElementById(
        "cancelEditProfileBtn"
    );

const editProfileMessage =
    document.getElementById(
        "editProfileMessage"
    );

// ======================================================
// FOLLOWERS / FOLLOWING DOM
// ======================================================

const followersBtn =
    document.getElementById(
        "followersBtn"
    );

const followingBtn =
    document.getElementById(
        "followingBtn"
    );

const followListPanel =
    document.getElementById(
        "followListPanel"
    );

// ======================================================
// DISCOVER USERS DOM
// ======================================================

const usersContainer =
    document.getElementById(
        "usersContainer"
    );

const discoverUsersSection =
    document.getElementById(
        "discoverUsersSection"
    );

const userSearchInput =
    document.getElementById(
        "userSearchInput"
    );

// Store the full Discover Users list so
// searching does not require another API call.
let allDiscoverUsers = [];

// ======================================================
// CURRENT USER / PROFILE STATE
// ======================================================

let loggedInUser = null;

let viewedProfileId = null;

let viewedProfileFollowing = false;

// ======================================================
// TOKEN MANAGEMENT
// ======================================================

function getToken() {
    return localStorage.getItem("token");
}

function setToken(token) {
    localStorage.setItem(
        "token",
        token
    );
}

function removeToken() {
    localStorage.removeItem("token");
}

// ======================================================
// API REQUEST HELPER
// ======================================================

async function apiRequest(
    url,
    options = {}
) {
    const token = getToken();

    const headers = {
        ...(options.headers || {}),
    };

    if (token) {
        headers.Authorization =
            `Bearer ${token}`;
    }

    const response = await fetch(
        `${API_BASE}${url}`,
        {
            ...options,
            headers,
        }
    );

    let data;

    try {
        data =
            await response.json();
    } catch {
        data = {
            success: false,
            message:
                "Invalid server response.",
        };
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Request failed."
        );
    }

    return data;
}

// ======================================================
// LOGIN
// ======================================================

if (loginForm) {
    loginForm.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            if (loginMessage) {
                loginMessage.textContent =
                    "Logging in...";
            }

            const emailInput =
                document.getElementById(
                    "loginEmail"
                );

            const passwordInput =
                document.getElementById(
                    "loginPassword"
                );

            const email =
                emailInput?.value.trim() ||
                "";

            const password =
                passwordInput?.value ||
                "";

            if (!email || !password) {
                if (loginMessage) {
                    loginMessage.textContent =
                        "Email and password are required.";
                }

                return;
            }

            try {
                const data =
                    await apiRequest(
                        "/auth/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body: JSON.stringify({
                                email,
                                password,
                            }),
                        }
                    );

                if (!data.token) {
                    throw new Error(
                        "Login succeeded but no token was returned."
                    );
                }

                setToken(
                    data.token
                );

                loggedInUser =
                    data.user || null;

                if (loginMessage) {
                    loginMessage.textContent =
                        "Login successful.";
                }

                showAuthenticatedUI(
                    loggedInUser
                );

                await loadUsers();
                await loadFeed();
                await loadUnreadNotificationCount();
                startNotificationRefresh();

            } catch (error) {
                console.error(
                    "LOGIN ERROR:",
                    error
                );

                if (loginMessage) {
                    loginMessage.textContent =
                        error.message;
                }
            }
        }
    );
}

// ======================================================
// AUTHENTICATED UI
// ======================================================

function showAuthenticatedUI(
    user = null
) {
    if (authSection) {
        authSection.classList.add(
            "hidden"
        );
    }

    if (feedSection) {
        feedSection.classList.remove(
            "hidden"
        );
    }

    if (logoutBtn) {
        logoutBtn.classList.remove(
            "hidden"
        );
    }

    if (notificationBtn) {
        notificationBtn.classList.remove(
            "hidden"
        );
    }

    if (myProfileBtn) {
        myProfileBtn.classList.remove(
            "hidden"
        );
    }

    if (currentUser) {
        currentUser.textContent =
            user?.name ||
            user?.email ||
            "Logged in";
    }
}

// ======================================================
// LOGGED OUT UI
// ======================================================

function showLoggedOutUI() {
    loggedInUser = null;

    viewedProfileId = null;

    viewedProfileFollowing = false;

    if (authSection) {
        authSection.classList.remove(
            "hidden"
        );
    }

    if (feedSection) {
        feedSection.classList.add(
            "hidden"
        );
    }

    if (logoutBtn) {
        logoutBtn.classList.add(
            "hidden"
        );
    }

    stopNotificationRefresh();

    if (notificationBtn) {
        notificationBtn.classList.add(
            "hidden"
        );

        notificationBtn.setAttribute(
            "aria-expanded",
            "false"
        );
    }

    if (notificationPanel) {
        notificationPanel.classList.add(
            "hidden"
        );
    }

    if (notificationBadge) {
        notificationBadge.classList.add(
            "hidden"
        );

        notificationBadge.textContent = "0";
    }

    if (myProfileBtn) {
        myProfileBtn.classList.add(
            "hidden"
        );
    }

    if (profileSection) {
        profileSection.classList.add(
            "hidden"
        );
    }

    if (currentUser) {
        currentUser.textContent =
            "Not logged in";
    }
}


// ======================================================
// NOTIFICATIONS
// ======================================================

function formatNotificationTime(dateValue) {
    if (!dateValue) {
        return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(
        diffMs / 60000
    );

    if (diffMinutes < 1) {
        return "just now";
    }

    if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
    }

    const diffHours = Math.floor(
        diffMinutes / 60
    );

    if (diffHours < 24) {
        return `${diffHours}h ago`;
    }

    const diffDays = Math.floor(
        diffHours / 24
    );

    if (diffDays < 7) {
        return `${diffDays}d ago`;
    }

    return date.toLocaleDateString();
}


// ======================================================
// NOTIFICATION PAGINATION STATE
// ======================================================

const NOTIFICATION_PAGE_SIZE = 20;

let notificationItems = [];

let notificationPage = 1;

let notificationTotalPages = 0;

let notificationHasNextPage = false;

let notificationLoading = false;


// ======================================================
// RENDER NOTIFICATIONS
// ======================================================

function renderNotificationItem(
    notification
) {
    const sender =
        notification?.sender || {};

    const senderName =
        sender?.name ||
        "Someone";

    const message =
        notification?.message ||
        `${senderName} interacted with you.`;

    const time =
        formatNotificationTime(
            notification?.createdAt
        );

    const isRead =
        Boolean(notification?.isRead);

    const readClass =
        isRead
            ? "read"
            : "unread";

    const notificationId =
        notification?._id || "";

    const type =
        String(
            notification?.type || ""
        ).toLowerCase();

    const postId =
        notification?.post?._id ||
        notification?.post?.id ||
        (
            typeof notification?.post ===
            "string"
                ? notification.post
                : ""
        );

    const senderId =
        sender?._id ||
        sender?.id ||
        (
            typeof notification?.sender ===
            "string"
                ? notification.sender
                : ""
        );

    const typeIcon =
        type === "like"
            ? "❤️"
            : type === "comment"
                ? "💬"
                : type === "follow"
                    ? "👤"
                    : "🔔";

    const profilePicture =
        typeof sender?.profilePicture ===
        "string"
            ? sender.profilePicture.trim()
            : "";

    const initial =
        senderName
            .trim()
            .charAt(0)
            .toUpperCase() ||
        "?";

    const avatarMarkup =
        profilePicture
            ? `
                <img
                    src="${escapeAttribute(
                        profilePicture
                    )}"
                    alt="${escapeAttribute(
                        senderName
                    )}"
                    loading="lazy"
                >
            `
            : escapeHtml(initial);

    return `
        <button
            type="button"
            class="notification-item ${readClass}"
            data-notification-id="${escapeAttribute(
                notificationId
            )}"
            data-notification-type="${escapeAttribute(
                type
            )}"
            data-post-id="${escapeAttribute(
                postId
            )}"
            data-sender-id="${escapeAttribute(
                senderId
            )}"
            data-read="${
                isRead
                    ? "true"
                    : "false"
            }"
            aria-label="${escapeAttribute(
                `${senderName} ${message}`
            )}"
        >

            <span
                class="notification-avatar"
                aria-hidden="true"
            >
                ${avatarMarkup}
            </span>

            <span
                class="notification-content"
            >

                <span
                    class="notification-message"
                >
                    <span
                        class="notification-sender"
                    >
                        ${escapeHtml(
                            senderName
                        )}
                    </span>

                    <span>
                        ${escapeHtml(
                            message.replace(
                                new RegExp(
                                    `^${senderName.replace(
                                        /[.*+?^${}()|[\]\\]/g,
                                        "\\$&"
                                    )}\\s*`,
                                    "i"
                                ),
                                ""
                            ).trim()
                        )}
                    </span>
                </span>

                <small
                    class="notification-time"
                >
                    ${escapeHtml(time)}
                </small>

            </span>

            <span
                class="notification-type-icon"
                aria-hidden="true"
            >
                ${typeIcon}
            </span>

            <span
                class="notification-unread-dot"
                aria-hidden="true"
            ></span>

        </button>
    `;
}


function renderNotifications(
    notifications = notificationItems
) {
    if (!notificationsContainer) {
        return;
    }

    if (
        !Array.isArray(notifications) ||
        !notifications.length
    ) {
        notificationsContainer.innerHTML = `
            <div class="notification-empty">
                <div
                    class="notification-empty-icon"
                    aria-hidden="true"
                >
                    🔔
                </div>

                <div class="notification-empty-title">
                    No notifications
                </div>

                <div class="notification-empty-text">
                    You're all caught up.
                </div>
            </div>
        `;

        return;
    }

    const itemsHtml =
        notifications
            .map(
                renderNotificationItem
            )
            .join("");

    const loadMoreHtml =
        notificationHasNextPage
            ? `
                <div class="notification-load-more-wrap">
                    <button
                        type="button"
                        class="btn btn-secondary notification-load-more"
                        ${
                            notificationLoading
                                ? "disabled"
                                : ""
                        }
                    >
                        ${
                            notificationLoading
                                ? "Loading..."
                                : "Load more"
                        }
                    </button>
                </div>
            `
            : "";

    notificationsContainer.innerHTML =
        itemsHtml +
        loadMoreHtml;
}


// ======================================================
// UNREAD NOTIFICATION COUNT
// ======================================================

async function loadUnreadNotificationCount() {
    if (!getToken()) {
        return;
    }

    try {
        const data =
            await apiRequest(
                "/notifications/unread-count"
            );

        const count =
            Math.max(
                0,
                Number(data?.count || 0)
            );

        if (notificationBadge) {
            notificationBadge.textContent =
                count > 99
                    ? "99+"
                    : String(count);

            notificationBadge.classList.toggle(
                "hidden",
                count === 0
            );
        }

    } catch (error) {
        console.error(
            "NOTIFICATION COUNT ERROR:",
            error
        );
    }
}


// ======================================================
// LOAD NOTIFICATIONS - PAGE 1
// ======================================================

async function loadNotifications() {
    if (!notificationsContainer) {
        return;
    }

    if (!getToken()) {
        return;
    }

    if (notificationLoading) {
        return;
    }

    notificationLoading = true;

    notificationItems = [];

    notificationPage = 1;

    notificationTotalPages = 0;

    notificationHasNextPage = false;

    notificationsContainer.innerHTML = `
        <div class="loading">
            Loading notifications...
        </div>
    `;

    try {
        const data =
            await apiRequest(
                `/notifications?page=1&limit=${NOTIFICATION_PAGE_SIZE}`
            );

        notificationItems =
            Array.isArray(
                data?.notifications
            )
                ? data.notifications
                : [];

        const pagination =
            data?.pagination || {};

        notificationPage =
            Number(
                pagination.page || 1
            );

        notificationTotalPages =
            Number(
                pagination.totalPages || 0
            );

        notificationHasNextPage =
            Boolean(
                pagination.hasNextPage
            );

        renderNotifications(
            notificationItems
        );

        await loadUnreadNotificationCount();

    } catch (error) {
        console.error(
            "NOTIFICATIONS ERROR:",
            error
        );

        notificationsContainer.innerHTML = `
            <div class="message">
                ${escapeHtml(
                    error.message ||
                    "Failed to load notifications."
                )}
            </div>
        `;
    } finally {
        notificationLoading = false;
    }
}


// ======================================================
// LOAD MORE NOTIFICATIONS
// ======================================================

async function loadMoreNotifications() {
    if (!getToken()) {
        return;
    }

    if (
        notificationLoading ||
        !notificationHasNextPage
    ) {
        return;
    }

    const nextPage =
        notificationPage + 1;

    if (
        notificationTotalPages &&
        nextPage > notificationTotalPages
    ) {
        notificationHasNextPage = false;

        renderNotifications(
            notificationItems
        );

        return;
    }

    notificationLoading = true;

    renderNotifications(
        notificationItems
    );

    try {
        const data =
            await apiRequest(
                `/notifications?page=${nextPage}&limit=${NOTIFICATION_PAGE_SIZE}`
            );

        const nextNotifications =
            Array.isArray(
                data?.notifications
            )
                ? data.notifications
                : [];

        const existingIds =
            new Set(
                notificationItems
                    .map(
                        (notification) =>
                            String(
                                notification?._id ||
                                ""
                            )
                    )
                    .filter(Boolean)
            );

        const uniqueNextNotifications =
            nextNotifications.filter(
                (notification) => {
                    const id =
                        String(
                            notification?._id ||
                            ""
                        );

                    if (
                        id &&
                        existingIds.has(id)
                    ) {
                        return false;
                    }

                    if (id) {
                        existingIds.add(id);
                    }

                    return true;
                }
            );

        notificationItems.push(
            ...uniqueNextNotifications
        );

        const pagination =
            data?.pagination || {};

        notificationPage =
            Number(
                pagination.page ||
                nextPage
            );

        notificationTotalPages =
            Number(
                pagination.totalPages ||
                notificationTotalPages
            );

        notificationHasNextPage =
            Boolean(
                pagination.hasNextPage
            );

        renderNotifications(
            notificationItems
        );

    } catch (error) {
        console.error(
            "LOAD MORE NOTIFICATIONS ERROR:",
            error
        );

        alert(
            error.message ||
            "Failed to load more notifications."
        );
    } finally {
        notificationLoading = false;

        renderNotifications(
            notificationItems
        );
    }
}


// ======================================================
// MARK ONE NOTIFICATION AS READ
// ======================================================

async function markNotificationAsRead(
    notificationId
) {
    if (!notificationId) {
        return;
    }

    try {
        await apiRequest(
            `/notifications/${encodeURIComponent(
                notificationId
            )}/read`,
            {
                method: "PUT",
            }
        );

        notificationItems =
            notificationItems.map(
                (notification) =>
                    String(
                        notification?._id ||
                        ""
                    ) ===
                    String(
                        notificationId
                    )
                        ? {
                              ...notification,
                              isRead: true,
                          }
                        : notification
            );

        renderNotifications(
            notificationItems
        );

        await loadUnreadNotificationCount();

    } catch (error) {
        console.error(
            "MARK NOTIFICATION READ ERROR:",
            error
        );

        alert(
            error.message ||
            "Failed to mark notification as read."
        );
    }
}


// ======================================================
// MARK ALL NOTIFICATIONS AS READ
// ======================================================

async function markAllNotificationsAsRead() {
    if (!getToken()) {
        return;
    }

    if (markAllNotificationsReadBtn) {
        markAllNotificationsReadBtn.disabled =
            true;
    }

    try {
        await apiRequest(
            "/notifications/read-all",
            {
                method: "PUT",
            }
        );

        notificationItems =
            notificationItems.map(
                (notification) => ({
                    ...notification,
                    isRead: true,
                })
            );

        renderNotifications(
            notificationItems
        );

        await loadUnreadNotificationCount();

    } catch (error) {
        console.error(
            "MARK ALL NOTIFICATIONS READ ERROR:",
            error
        );

        alert(
            error.message ||
            "Failed to mark notifications as read."
        );
    } finally {
        if (
            markAllNotificationsReadBtn
        ) {
            markAllNotificationsReadBtn.disabled =
                false;
        }
    }
}


function startNotificationRefresh() {
    stopNotificationRefresh();

    if (!getToken()) {
        return;
    }

    notificationRefreshTimer =
        window.setInterval(
            () => {
                loadUnreadNotificationCount();
            },
            30000
        );
}


function stopNotificationRefresh() {
    if (
        notificationRefreshTimer !== null
    ) {
        window.clearInterval(
            notificationRefreshTimer
        );

        notificationRefreshTimer = null;
    }
}


// Notification bell.
if (notificationBtn) {
    notificationBtn.addEventListener(
        "click",
        async (event) => {
            event.preventDefault();
            event.stopPropagation();

            const isOpen =
                !notificationPanel?.classList.contains(
                    "hidden"
                );

            if (notificationPanel) {
                notificationPanel.classList.toggle(
                    "hidden",
                    isOpen
                );
            }

            notificationBtn.setAttribute(
                "aria-expanded",
                String(!isOpen)
            );

            if (!isOpen) {
                await loadNotifications();
            }
        }
    );
}


// Mark all notifications as read.
if (markAllNotificationsReadBtn) {
    markAllNotificationsReadBtn.addEventListener(
        "click",
        async (event) => {
            event.preventDefault();

            await markAllNotificationsAsRead();
        }
    );
}


// ======================================================
// NOTIFICATION NAVIGATION
// ======================================================
// ======================================================

async function navigateFromNotification(item) {
    if (!item) {
        return;
    }

    const type =
        item.dataset.notificationType ||
        "";

    const postId =
        item.dataset.postId || "";

    const senderId =
        item.dataset.senderId || "";

    if (notificationPanel) {
        notificationPanel.classList.add("hidden");
    }

    if (notificationBtn) {
        notificationBtn.setAttribute(
            "aria-expanded",
            "false"
        );
    }

    if (type === "follow") {
        if (!senderId) {
            console.warn(
                "Follow notification has no sender ID."
            );
            return;
        }

        await loadUserProfile(senderId);

        if (profileSection) {
            profileSection.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }

        return;
    }

    if (
        (type === "like" || type === "comment") &&
        postId
    ) {
        let postCard =
            document.querySelector(
                `.post-card[data-post-id="${CSS.escape(
                    postId
                )}"]`
            );

        if (!postCard && typeof loadFeed === "function") {
            await loadFeed();

            postCard =
                document.querySelector(
                    `.post-card[data-post-id="${CSS.escape(
                        postId
                    )}"]`
                );
        }

        if (!postCard) {
            console.warn(
                "Notification post was not found:",
                postId
            );
            return;
        }

        postCard.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });

        if (type === "comment") {
            const commentButton =
                postCard.querySelector(
                    'button[data-action="comment"]'
                );

            if (commentButton) {
                window.setTimeout(() => {
                    commentButton.click();
                }, 250);
            }
        }
    }
}


// Click an individual notification or Load More.
if (notificationsContainer) {
    notificationsContainer.addEventListener(
        "click",
        async (event) => {
            const loadMoreButton =
                event.target.closest(
                    ".notification-load-more"
                );

            if (loadMoreButton) {
                event.preventDefault();

                await loadMoreNotifications();

                return;
            }

            const item =
                event.target.closest(
                    ".notification-item"
                );

            if (!item) {
                return;
            }

            const notificationId =
                item.dataset.notificationId;

            if (!notificationId) {
                return;
            }

            if (
                item.dataset.read !==
                "true"
            ) {
                await markNotificationAsRead(
                    notificationId
                );
            }

            await navigateFromNotification(
                item
            );
        }
    );
}


// Close notifications when clicking outside.
document.addEventListener(
    "click",
    (event) => {
        if (
            !notificationPanel ||
            notificationPanel.classList.contains(
                "hidden"
            )
        ) {
            return;
        }

        const clickedInside =
            notificationPanel.contains(
                event.target
            );

        const clickedButton =
            notificationBtn?.contains(
                event.target
            );

        if (
            !clickedInside &&
            !clickedButton
        ) {
            notificationPanel.classList.add(
                "hidden"
            );

            notificationBtn?.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    }
);

// ======================================================
// LOAD FEED
// ======================================================

async function loadFeed() {
    if (!feedContainer) {
        return;
    }

    feedContainer.innerHTML = `
        <div class="loading">
            Loading feed...
        </div>
    `;

    try {
        const data =
            await apiRequest(
                "/feed"
            );

        const posts =
            Array.isArray(data.posts)
                ? data.posts
                : [];

        renderFeed(posts);

    } catch (error) {
        console.error(
            "FEED ERROR:",
            error
        );

        feedContainer.innerHTML = `
            <div class="message">
                ${escapeHtml(
                    error.message
                )}
            </div>
        `;
    }
}

// ======================================================
// RENDER FEED
// ======================================================

function renderFeed(posts) {
    if (!feedContainer) {
        return;
    }

    if (!posts.length) {
        feedContainer.innerHTML = `
            <div class="loading">
                No posts yet.
            </div>
        `;

        return;
    }

    feedContainer.innerHTML =
        posts
            .map(
                renderPost
            )
            .join("");
}

// ======================================================
// GET CURRENT USER ID
// ======================================================

function getCurrentUserId() {
    if (loggedInUser?._id) {
        return String(
            loggedInUser._id
        );
    }

    if (loggedInUser?.id) {
        return String(
            loggedInUser.id
        );
    }

    const token =
        getToken();

    if (!token) {
        return null;
    }

    try {
        const parts =
            token.split(".");

        if (parts.length !== 3) {
            return null;
        }

        const payload =
            JSON.parse(
                atob(parts[1])
            );

        return String(
            payload.id ||
            payload._id ||
            payload.userId ||
            ""
        );

    } catch {
        return null;
    }
}

// ======================================================
// RENDER POST
// ======================================================

function renderPost(post) {
    const postId =
        post?._id || "";

    const authorName =
        post?.author?.name ||
        "Unknown User";

    const authorId =
        post?.author?._id ||
        post?.author?.id ||
        "";

    const caption =
        post?.caption || "";

    const likes =
        Array.isArray(post?.likes)
            ? post.likes
            : [];

    const likesCount =
        likes.length;

    const commentsCount =
        Number(
            post?.commentsCount || 0
        );

    const currentUserId =
        getCurrentUserId();

    const isLiked =
        currentUserId &&
        likes.some(
            (likeId) =>
                String(likeId) ===
                String(
                    currentUserId
                )
        );

    const isOwner =
        currentUserId &&
        authorId &&
        String(currentUserId) ===
            String(authorId);

    const imageHtml =
        post?.image
            ? `
                <img
                    class="post-image"
                    src="${escapeAttribute(
                        post.image
                    )}"
                    alt="Post image"
                    loading="lazy"
                    onerror="
                        console.error(
                            'Failed to load post image:',
                            this.src
                        );
                        this.alt =
                            'Image could not be loaded';
                    "
                >
            `
            : "";

    const captionHtml =
        caption
            ? `
                <div class="post-caption">
                    ${escapeHtml(
                        caption
                    )}
                </div>
            `
            : "";

    const authorHtml =
        authorId
            ? `
                <button
                    type="button"
                    class="post-author post-author-button"
                    data-action="profile"
                    data-user-id="${escapeAttribute(
                        authorId
                    )}"
                >
                    ${escapeHtml(
                        authorName
                    )}
                </button>
            `
            : `
                <div class="post-author">
                    ${escapeHtml(
                        authorName
                    )}
                </div>
            `;

    const ownerActions =
        isOwner
            ? `
                <button
                    type="button"
                    class="btn btn-secondary"
                    data-action="edit-post"
                    data-post-id="${escapeAttribute(
                        postId
                    )}"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="btn btn-danger"
                    data-action="delete-post"
                    data-post-id="${escapeAttribute(
                        postId
                    )}"
                >
                    Delete
                </button>
            `
            : "";

    return `
        <article
            class="post-card"
            data-post-id="${escapeAttribute(
                postId
            )}"
        >

            ${authorHtml}

            ${captionHtml}

            ${imageHtml}

            <div class="post-actions">

                <button
                    type="button"
                    class="btn btn-like ${
                        isLiked
                            ? "liked"
                            : ""
                    }"
                    data-action="like"
                    data-post-id="${escapeAttribute(
                        postId
                    )}"
                >
                    ${
                        isLiked
                            ? "Unlike"
                            : "Like"
                    }
                </button>

                <button
                    type="button"
                    class="btn btn-comment"
                    data-action="comment"
                    data-post-id="${escapeAttribute(
                        postId
                    )}"
                >
                    Comments
                </button>

                ${ownerActions}

            </div>

            <div
                class="post-meta"
                data-meta-post-id="${escapeAttribute(
                    postId
                )}"
            >
                Likes: ${likesCount}
                · Comments: ${commentsCount}
            </div>

        </article>
    `;
}

// ======================================================
// CREATE POST
// ======================================================

if (createPostForm) {
    createPostForm.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            if (createPostMessage) {
                createPostMessage.textContent =
                    "Publishing...";
            }

            const captionInput =
                document.getElementById(
                    "postCaption"
                );

            const imageInput =
                document.getElementById(
                    "postImage"
                );

            const caption =
                captionInput?.value.trim() ||
                "";

            const image =
                imageInput?.files?.[0] ||
                null;

            if (!caption && !image) {
                if (createPostMessage) {
                    createPostMessage.textContent =
                        "Add a caption or select an image.";
                }

                return;
            }

            const formData =
                new FormData();

            if (caption) {
                formData.append(
                    "caption",
                    caption
                );
            }

            if (image) {
                formData.append(
                    "image",
                    image
                );
            }

            try {
                await apiRequest(
                    "/posts",
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                if (createPostMessage) {
                    createPostMessage.textContent =
                        "Post published successfully.";
                }

                createPostForm.reset();

                await loadFeed();

            } catch (error) {
                console.error(
                    "CREATE POST ERROR:",
                    error
                );

                if (createPostMessage) {
                    createPostMessage.textContent =
                        error.message;
                }
            }
        }
    );
}

// ======================================================
// POST / PROFILE / COMMENT ACTIONS
// ======================================================

document.addEventListener(
    "click",
    async (event) => {
        const button =
            event.target.closest(
                "button[data-action]"
            );

        if (!button) {
            return;
        }

        const action =
            button.dataset.action;

        // ==========================================
        // OPEN PROFILE
        // ==========================================

        if (action === "profile") {
            const userId =
                button.dataset.userId;

            if (!userId) {
                return;
            }

            await loadUserProfile(
                userId
            );

            if (profileSection) {
                profileSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }

            return;
        }

        // ==========================================
        // LIKE
        // ==========================================

        const postId =
            button.dataset.postId;

        if (action === "like") {
            if (!postId) {
                return;
            }

            await handleLike(
                button,
                postId
            );

            return;
        }

        // ==========================================
        // COMMENTS
        // ==========================================

        if (action === "comment") {
            if (!postId) {
                return;
            }

            await toggleComments(
                button,
                postId
            );

            return;
        }

        // ==========================================
        // EDIT POST
        // ==========================================

        if (action === "edit-post") {
            if (!postId) {
                return;
            }

            await editPost(postId);
            return;
        }

        // ==========================================
        // DELETE POST
        // ==========================================

        if (action === "delete-post") {
            if (!postId) {
                return;
            }

            await deletePost(postId);
            return;
        }

        // ==========================================
        // EDIT COMMENT
        // ==========================================

        if (
            action ===
            "edit-comment"
        ) {
            await editComment(
                button.dataset.commentId
            );

            return;
        }

        // ==========================================
        // DELETE COMMENT
        // ==========================================

        if (
            action ===
            "delete-comment"
        ) {
            await deleteComment(
                button.dataset.commentId
            );

            return;
        }
    }
);

// ======================================================
// MY PROFILE BUTTON
// ======================================================

if (myProfileBtn) {
    myProfileBtn.addEventListener(
        "click",
        async () => {
            const userId =
                getCurrentUserId();

            if (!userId) {
                console.error(
                    "Unable to determine current user ID."
                );

                return;
            }

            await loadUserProfile(
                userId
            );

            if (profileSection) {
                profileSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        }
    );
}

// ======================================================
// FOLLOWERS / FOLLOWING BUTTONS
// ======================================================

if (followersBtn) {
    followersBtn.addEventListener(
        "click",
        async () => {
            if (!viewedProfileId) {
                return;
            }

            await loadFollowList(
                "followers",
                viewedProfileId
            );
        }
    );
}

if (followingBtn) {
    followingBtn.addEventListener(
        "click",
        async () => {
            if (!viewedProfileId) {
                return;
            }

            await loadFollowList(
                "following",
                viewedProfileId
            );
        }
    );
}

// ======================================================
// LOAD FOLLOWERS / FOLLOWING
// ======================================================

async function loadFollowList(
    type,
    userId
) {
    if (!followListPanel || !userId) {
        return;
    }

    if (
        type !== "followers" &&
        type !== "following"
    ) {
        return;
    }

    followListPanel.classList.remove(
        "hidden"
    );

    const title =
        type === "followers"
            ? "Followers"
            : "Following";

    followListPanel.innerHTML = `
        <div class="follow-list-header">
            <h3>${title}</h3>
        </div>

        <div class="loading">
            Loading ${title.toLowerCase()}...
        </div>
    `;

    try {
        const data =
            await apiRequest(
                `/follow/${type}/${encodeURIComponent(
                    userId
                )}`
            );

        const items =
            type === "followers"
                ? (
                      Array.isArray(
                          data.followers
                      )
                          ? data.followers
                          : []
                  )
                : (
                      Array.isArray(
                          data.following
                      )
                          ? data.following
                          : []
                  );

        if (!items.length) {
            followListPanel.innerHTML = `
                <div class="follow-list-header">
                    <h3>${title}</h3>
                </div>

                <div class="no-comments">
                    No ${type} yet.
                </div>
            `;

            return;
        }

        const listHtml =
            items
                .map((item) => {
                    const user =
                        type === "followers"
                            ? item?.follower
                            : item?.following;

                    if (!user) {
                        return "";
                    }

                    const userId =
                        user._id ||
                        user.id ||
                        "";

                    return `
                        <button
                            type="button"
                            class="follow-user-item"
                            data-action="profile"
                            data-user-id="${escapeAttribute(
                                userId
                            )}"
                        >
                            <strong>
                                ${escapeHtml(
                                    user.name ||
                                    "Unknown User"
                                )}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    user.email ||
                                    ""
                                )}
                            </span>
                        </button>
                    `;
                })
                .join("");

        followListPanel.innerHTML = `
            <div class="follow-list-header">
                <h3>${title}</h3>
            </div>

            <div class="follow-list">
                ${listHtml}
            </div>
        `;

    } catch (error) {
        console.error(
            `${type.toUpperCase()} LIST ERROR:`,
            error
        );

        followListPanel.innerHTML = `
            <div class="follow-list-header">
                <h3>${title}</h3>
            </div>

            <div class="message">
                ${escapeHtml(
                    error.message ||
                    `Failed to load ${type}.`
                )}
            </div>
        `;
    }
}

// ======================================================
// DISCOVER USERS
// ======================================================

async function loadUsers() {
    if (!usersContainer) {
        return;
    }

    usersContainer.innerHTML = `
        <div class="loading">
            Loading users...
        </div>
    `;

    try {
        const data = await apiRequest(
            "/users"
        );

        const users = Array.isArray(
            data.users
        )
            ? data.users
            : [];

        const currentUserId =
            getCurrentUserId();

        const otherUsers = users.filter(
            (user) =>
                String(user?._id || "") !==
                String(currentUserId || "")
        );

        allDiscoverUsers = otherUsers;

        if (!otherUsers.length) {
            usersContainer.innerHTML = `
                <div class="loading">
                    No other users found.
                </div>
            `;
            return;
        }

        renderDiscoverUsers(
            allDiscoverUsers
        );

        await refreshDiscoverFollowButtons();

    } catch (error) {
        console.error(
            "LOAD USERS ERROR:",
            error
        );

        usersContainer.innerHTML = `
            <div class="message">
                ${escapeHtml(
                    error.message ||
                        "Failed to load users."
                )}
            </div>
        `;
    }
}

// ======================================================
// RENDER DISCOVER USERS
// ======================================================

function renderDiscoverUsers(
    users
) {
    if (!usersContainer) {
        return;
    }

    if (!users.length) {
        usersContainer.innerHTML = `
            <div class="loading">
                No users found.
            </div>
        `;

        return;
    }

    usersContainer.innerHTML = `
        <div class="follow-list">
            ${users
                .map((user) => {
                    const userId =
                        user?._id || "";

                    return `
                        <div
                            class="follow-user-item"
                            data-user-id="${escapeAttribute(
                                userId
                            )}"
                        >

                            <strong>
                                ${escapeHtml(
                                    user?.name ||
                                        "Unknown User"
                                )}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    user?.email ||
                                        ""
                                )}
                            </span>

                            <div class="discover-user-actions">

                                <button
                                    type="button"
                                    class="btn btn-secondary discover-profile-btn"
                                    data-action="profile"
                                    data-user-id="${escapeAttribute(
                                        userId
                                    )}"
                                >
                                    View Profile
                                </button>

                                <button
                                    type="button"
                                    class="btn btn-primary discover-follow-btn"
                                    data-discover-follow="true"
                                    data-user-id="${escapeAttribute(
                                        userId
                                    )}"
                                >
                                    Follow
                                </button>

                            </div>

                        </div>
                    `;
                })
                .join("")}
        </div>
    `;

    refreshDiscoverFollowButtons();
}


// ======================================================
// USER SEARCH
// ======================================================

function filterUsers(
    searchTerm
) {
    const term =
        String(searchTerm || "")
            .trim()
            .toLowerCase();

    const filteredUsers =
        !term
            ? allDiscoverUsers
            : allDiscoverUsers.filter(
                (user) => {
                    const name =
                        String(
                            user?.name || ""
                        ).toLowerCase();

                    const email =
                        String(
                            user?.email || ""
                        ).toLowerCase();

                    return (
                        name.includes(term) ||
                        email.includes(term)
                    );
                }
            );

    renderDiscoverUsers(
        filteredUsers
    );
}

if (userSearchInput) {
    userSearchInput.addEventListener(
        "input",
        (event) => {
            filterUsers(
                event.target.value
            );
        }
    );
}

// ======================================================
// DISCOVER USERS - FOLLOW STATE
// ======================================================

async function refreshDiscoverFollowButtons() {
    if (!usersContainer) {
        return;
    }

    const currentUserId =
        getCurrentUserId();

    if (!currentUserId) {
        return;
    }

    try {
        const data =
            await apiRequest(
                `/follow/following/${encodeURIComponent(
                    currentUserId
                )}`
            );

        const following =
            Array.isArray(
                data.following
            )
                ? data.following
                : [];

        const followingIds =
            new Set(
                following
                    .map((relation) => {
                        const user =
                            relation?.following;

                        return String(
                            user?._id ||
                                user?.id ||
                                user ||
                                ""
                        );
                    })
                    .filter(Boolean)
            );

        usersContainer
            .querySelectorAll(
                ".discover-follow-btn"
            )
            .forEach((button) => {
                const userId =
                    String(
                        button.dataset.userId ||
                            ""
                    );

                const isFollowing =
                    followingIds.has(userId);

                button.dataset.following =
                    String(isFollowing);

                button.textContent =
                    isFollowing
                        ? "Unfollow"
                        : "Follow";

                button.classList.toggle(
                    "following",
                    isFollowing
                );

                if (
                    isFollowing
                ) {
                    button.classList.remove(
                        "btn-primary"
                    );
                    button.classList.add(
                        "btn-secondary"
                    );
                } else {
                    button.classList.remove(
                        "btn-secondary"
                    );
                    button.classList.add(
                        "btn-primary"
                    );
                }
            });
    } catch (error) {
        console.error(
            "DISCOVER FOLLOW STATE ERROR:",
            error
        );
    }
}

// ======================================================
// DISCOVER USERS - FOLLOW / UNFOLLOW
// ======================================================

async function handleDiscoverFollow(
    button
) {
    if (
        !button ||
        button.disabled
    ) {
        return;
    }

    const userId =
        button.dataset.userId;

    const currentUserId =
        getCurrentUserId();

    if (!userId) {
        return;
    }

    if (
        currentUserId &&
        String(currentUserId) ===
            String(userId)
    ) {
        return;
    }

    const wasFollowing =
        button.dataset.following ===
        "true";

    button.disabled = true;

    const previousText =
        button.textContent;

    button.textContent =
        "Please wait...";

    try {
        if (wasFollowing) {
            await apiRequest(
                `/follow/${encodeURIComponent(
                    userId
                )}`,
                {
                    method: "DELETE",
                }
            );
        } else {
            await apiRequest(
                `/follow/${encodeURIComponent(
                    userId
                )}`,
                {
                    method: "POST",
                }
            );
        }

        // Update this button immediately.
        const newFollowing =
            !wasFollowing;

        button.dataset.following =
            String(newFollowing);

        button.textContent =
            newFollowing
                ? "Unfollow"
                : "Follow";

        button.classList.toggle(
            "following",
            newFollowing
        );

        button.classList.toggle(
            "btn-primary",
            !newFollowing
        );

        button.classList.toggle(
            "btn-secondary",
            newFollowing
        );

        // Refresh the user's profile if it is open.
        if (
            viewedProfileId &&
            String(viewedProfileId) ===
                String(userId)
        ) {
            viewedProfileFollowing =
                newFollowing;

            updateFollowButton();
            await loadUserProfile(
                viewedProfileId
            );
        }

    } catch (error) {
        console.error(
            "DISCOVER FOLLOW ERROR:",
            error
        );

        button.textContent =
            previousText;

        alert(
            error.message ||
                "Failed to update follow status."
        );
    } finally {
        button.disabled = false;
    }
}

// ======================================================
// DISCOVER USER CLICK HANDLER
// ======================================================

document.addEventListener(
    "click",
    async (event) => {
        const followButton =
            event.target.closest(
                ".discover-follow-btn"
            );

        if (followButton) {
            event.preventDefault();

            await handleDiscoverFollow(
                followButton
            );

            return;
        }
    }
);

// ======================================================
// LOAD USER PROFILE
// ======================================================

async function loadUserProfile(
    userId
) {
    if (!userId) {
        return;
    }

    viewedProfileId =
        String(userId);

    viewedProfileFollowing =
        false;

    if (followListPanel) {
        followListPanel.classList.add(
            "hidden"
        );

        followListPanel.innerHTML = "";
    }

    if (profileSection) {
        profileSection.classList.remove(
            "hidden"
        );
    }

    if (profileMessage) {
        profileMessage.textContent =
            "Loading profile...";
    }

    try {
        const data =
            await apiRequest(
                `/users/${encodeURIComponent(
                    userId
                )}`
            );

        const user =
            data.user ||
            data.data ||
            data;

        if (!user || !user._id) {
            throw new Error(
                "Profile data was not returned."
            );
        }

        renderUserProfile(
            user
        );

        await determineFollowState(
            userId
        );

        if (profileMessage) {
            profileMessage.textContent =
                "";
        }

    } catch (error) {
        console.error(
            "PROFILE ERROR:",
            error
        );

        if (profileMessage) {
            profileMessage.textContent =
                error.message;
        }
    }
}

// ======================================================
// RENDER USER PROFILE
// ======================================================

function renderUserProfile(
    user
) {
    if (!user) {
        return;
    }

    if (profileName) {
        profileName.textContent =
            user.name ||
            "User";
    }

    if (profileEmail) {
        profileEmail.textContent =
            user.email ||
            "";
    }

    if (profileBio) {
        profileBio.textContent =
            user.bio ||
            "No bio available.";
    }

    const profileAvatarInitial =
        document.getElementById(
            "profileAvatarInitial"
        );

    if (profilePicture) {
        if (user.profilePicture) {
            profilePicture.src =
                user.profilePicture;

            profilePicture.classList.remove(
                "hidden"
            );

            profileAvatarInitial?.parentElement.classList.add(
                "hidden"
            );
        } else {
            profilePicture.classList.add(
                "hidden"
            );

            if (profileAvatarInitial) {
                profileAvatarInitial.textContent =
                    (
                        user.name ||
                        "U"
                    )
                        .charAt(0)
                        .toUpperCase();

                profileAvatarInitial.parentElement.classList.remove(
                    "hidden"
                );
            }
        }
    }

    if (profilePostsCount) {
        profilePostsCount.textContent =
            user.postsCount ||
            0;
    }

    if (profileFollowersCount) {
        profileFollowersCount.textContent =
            user.followersCount ||
            0;
    }

    if (profileFollowingCount) {
        profileFollowingCount.textContent =
            user.followingCount ||
            0;
    }

    // Show or hide Edit Profile button
    // depending on whether this is the
    // logged-in user's own profile.
    const currentUserId =
        getCurrentUserId();

    const isOwnProfile =
        currentUserId &&
        String(currentUserId) ===
            String(user._id || user.id || "");

    if (editProfileBtn) {
        if (isOwnProfile) {
            editProfileBtn.classList.remove(
                "hidden"
            );
        } else {
            editProfileBtn.classList.add(
                "hidden"
            );
        }
    }

    if (editProfileSection) {
        editProfileSection.classList.add(
            "hidden"
        );
    }
}

// ======================================================
// EDIT PROFILE - OPEN
// ======================================================

if (editProfileBtn) {
    editProfileBtn.addEventListener(
        "click",
        () => {
            if (editProfileSection) {
                editProfileSection.classList.remove(
                    "hidden"
                );
            }

            if (editProfileName) {
                editProfileName.value =
                    profileName?.textContent.trim() ||
                    "";
            }

            if (editProfileBio) {
                const currentBio =
                    profileBio?.textContent.trim() ||
                    "";

                editProfileBio.value =
                    currentBio === "No bio available."
                        ? ""
                        : currentBio;
            }

            if (editProfilePicture) {
                editProfilePicture.value =
                    profilePicture?.src &&
                    !profilePicture.classList.contains(
                        "hidden"
                    )
                        ? profilePicture.src
                        : "";
            }

            if (editProfileMessage) {
                editProfileMessage.textContent =
                    "";
            }

            editProfileSection?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    );
}

// ======================================================
// EDIT PROFILE - CANCEL
// ======================================================

if (cancelEditProfileBtn) {
    cancelEditProfileBtn.addEventListener(
        "click",
        () => {
            if (editProfileSection) {
                editProfileSection.classList.add(
                    "hidden"
                );
            }

            if (editProfileMessage) {
                editProfileMessage.textContent =
                    "";
            }
        }
    );
}

// ======================================================
// EDIT PROFILE - SAVE
// ======================================================

if (editProfileForm) {
    editProfileForm.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            if (editProfileMessage) {
                editProfileMessage.textContent =
                    "Saving...";
            }

            const name =
                editProfileName?.value.trim() ||
                "";

            const bio =
                editProfileBio?.value.trim() ||
                "";

            const profilePictureUrl =
                editProfilePicture?.value.trim() ||
                "";

            if (!name) {
                if (editProfileMessage) {
                    editProfileMessage.textContent =
                        "Name is required.";
                }

                return;
            }

            try {
                const data =
                    await apiRequest(
                        "/users/profile",
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type":
                                    "application/json",
                            },
                            body: JSON.stringify({
                                name,
                                bio,
                                profilePicture:
                                    profilePictureUrl,
                            }),
                        }
                    );

                const updatedUser =
                    data.user ||
                    data.data ||
                    data;

                // Update loggedInUser if
                // editing own profile.
                if (loggedInUser) {
                    loggedInUser.name =
                        updatedUser.name ||
                        name;

                    if (currentUser) {
                        currentUser.textContent =
                            loggedInUser.name ||
                            loggedInUser.email ||
                            "Logged in";
                    }
                }

                renderUserProfile(
                    updatedUser
                );

                if (editProfileMessage) {
                    editProfileMessage.textContent =
                        "Profile updated successfully.";
                }

                if (editProfileSection) {
                    editProfileSection.classList.add(
                        "hidden"
                    );
                }

            } catch (error) {
                console.error(
                    "EDIT PROFILE ERROR:",
                    error
                );

                if (editProfileMessage) {
                    editProfileMessage.textContent =
                        error.message ||
                        "Failed to update profile.";
                }
            }
        }
    );
}

// ======================================================
// DETERMINE FOLLOW STATE
// ======================================================

async function determineFollowState(
    userId
) {
    const currentUserId =
        getCurrentUserId();

    if (!currentUserId) {
        viewedProfileFollowing =
            false;

        updateFollowButton();

        return;
    }

    // Own profile
    if (
        String(currentUserId) ===
        String(userId)
    ) {
        viewedProfileFollowing =
            false;

        if (followButton) {
            followButton.classList.add(
                "hidden"
            );
        }

        if (followListPanel) {
            followListPanel.classList.add(
                "hidden"
            );

            followListPanel.innerHTML = "";
        }

        return;
    }

    try {
        const data =
            await apiRequest(
                `/follow/following/${encodeURIComponent(
                    currentUserId
                )}`
            );

        const following =
            Array.isArray(
                data.following
            )
                ? data.following
                : [];

        viewedProfileFollowing =
            following.some(
                (relation) => {
                    const followingUser =
                        relation.following;

                    const followingId =
                        followingUser?._id ||
                        followingUser?.id ||
                        followingUser;

                    return (
                        String(
                            followingId
                        ) ===
                        String(userId)
                    );
                }
            );

        updateFollowButton();

    } catch (error) {
        console.error(
            "FOLLOW STATE ERROR:",
            error
        );

        viewedProfileFollowing =
            false;

        updateFollowButton();
    }
}

// ======================================================
// UPDATE FOLLOW BUTTON
// ======================================================

function updateFollowButton() {
    if (!followButton) {
        return;
    }

    followButton.classList.remove(
        "hidden"
    );

    followButton.textContent =
        viewedProfileFollowing
            ? "Unfollow"
            : "Follow";

    followButton.classList.toggle(
        "following",
        viewedProfileFollowing
    );
}

// ======================================================
// FOLLOW / UNFOLLOW
// ======================================================

if (followButton) {
    followButton.addEventListener(
        "click",
        async () => {
            if (!viewedProfileId) {
                return;
            }

            const currentUserId =
                getCurrentUserId();

            if (
                currentUserId &&
                String(currentUserId) ===
                    String(
                        viewedProfileId
                    )
            ) {
                return;
            }

            followButton.disabled =
                true;

            const previousText =
                followButton.textContent;

            followButton.textContent =
                "Please wait...";

            try {
                if (
                    viewedProfileFollowing
                ) {
                    await apiRequest(
                        `/follow/${encodeURIComponent(
                            viewedProfileId
                        )}`,
                        {
                            method: "DELETE",
                        }
                    );

                    viewedProfileFollowing =
                        false;

                    updateFollowerCount(
                        -1
                    );

                } else {
                    await apiRequest(
                        `/follow/${encodeURIComponent(
                            viewedProfileId
                        )}`,
                        {
                            method: "POST",
                        }
                    );

                    viewedProfileFollowing =
                        true;

                    updateFollowerCount(
                        1
                    );
                }

                updateFollowButton();

                if (profileMessage) {
                    profileMessage.textContent =
                        "";
                }

                await refreshDiscoverFollowButtons();

            } catch (error) {
                console.error(
                    "FOLLOW ERROR:",
                    error
                );

                followButton.textContent =
                    previousText;

                alert(
                    error.message ||
                    "Failed to update follow status."
                );

            } finally {
                followButton.disabled =
                    false;
            }
        }
    );
}

// ======================================================
// UPDATE FOLLOWER COUNT
// ======================================================

function updateFollowerCount(
    change
) {
    if (!profileFollowersCount) {
        return;
    }

    const current =
        Number(
            profileFollowersCount.textContent
        ) || 0;

    profileFollowersCount.textContent =
        Math.max(
            0,
            current + change
        );
}

// ======================================================
// HANDLE LIKE
// ======================================================

async function handleLike(
    button,
    postId
) {
    if (button.disabled) {
        return;
    }

    button.disabled = true;

    const originalText =
        button.textContent;

    button.textContent =
        "Loading...";

    try {
        const data =
            await apiRequest(
                `/posts/${encodeURIComponent(
                    postId
                )}/like`,
                {
                    method: "PUT",
                }
            );

        updateLikeUI(
            postId,
            data
        );

    } catch (error) {
        console.error(
            "LIKE ERROR:",
            error
        );

        button.textContent =
            originalText;

        alert(
            error.message ||
            "Failed to update like."
        );

    } finally {
        button.disabled =
            false;
    }
}

// ======================================================
// UPDATE LIKE UI
// ======================================================

function updateLikeUI(
    postId,
    data
) {
    const postCard =
        document.querySelector(
            `.post-card[data-post-id="${CSS.escape(
                postId
            )}"]`
        );

    if (!postCard) {
        return;
    }

    const likeButton =
        postCard.querySelector(
            '[data-action="like"]'
        );

    const meta =
        postCard.querySelector(
            ".post-meta"
        );

    const likesCount =
        Number(
            data?.likesCount || 0
        );

    const liked =
        Boolean(
            data?.liked
        );

    if (likeButton) {
        likeButton.textContent =
            liked
                ? "Unlike"
                : "Like";

        likeButton.classList.toggle(
            "liked",
            liked
        );
    }

    if (meta) {
        const commentMatch =
            meta.textContent.match(
                /Comments:\s*\d+/
            );

        const commentsText =
            commentMatch
                ? commentMatch[0]
                : "Comments: 0";

        meta.textContent =
            `Likes: ${likesCount} · ${commentsText}`;
    }
}

// ======================================================
// COMMENTS - TOGGLE
// ======================================================

async function toggleComments(
    button,
    postId
) {
    console.log(
        "Loading comments for post:",
        postId
    );

    const postCard =
        document.querySelector(
            `.post-card[data-post-id="${CSS.escape(
                postId
            )}"]`
        );

    if (!postCard) {
        console.error(
            "Post card not found:",
            postId
        );

        return;
    }

    let panel =
        postCard.querySelector(
            ".comments-panel"
        );

    if (panel) {
        panel.remove();

        button.textContent =
            "Comments";

        return;
    }

    button.disabled = true;

    button.textContent =
        "Loading...";

    try {
        const data =
            await apiRequest(
                `/comments/posts/${encodeURIComponent(
                    postId
                )}/comments`
            );

        console.log(
            "Comments API response:",
            data
        );

        panel =
            createCommentsPanel(
                postId,
                Array.isArray(
                    data.comments
                )
                    ? data.comments
                    : []
            );

        postCard.appendChild(
            panel
        );

        button.textContent =
            "Hide Comments";

    } catch (error) {
        console.error(
            "COMMENTS LOAD ERROR:",
            error
        );

        button.textContent =
            "Comments";

        alert(
            error.message ||
            "Failed to load comments."
        );

    } finally {
        button.disabled =
            false;
    }
}

// ======================================================
// EDIT POST
// ======================================================

async function editPost(postId) {
    if (!postId) {
        return;
    }

    const postCard =
        document.querySelector(
            `.post-card[data-post-id="${CSS.escape(
                postId
            )}"]`
        );

    if (!postCard) {
        alert("Post not found.");
        return;
    }

    // ------------------------------------------
    // Existing caption
    // ------------------------------------------

    const currentCaption =
        postCard
            .querySelector(".post-caption")
            ?.textContent
            .trim() || "";

    // ------------------------------------------
    // Ask for new caption
    // ------------------------------------------

    const newCaption =
        window.prompt(
            "Edit post caption:",
            currentCaption
        );

    if (newCaption === null) {
        return;
    }

    const caption =
        newCaption.trim();

    if (!caption) {
        alert(
            "Post caption cannot be empty."
        );

        return;
    }

    // ------------------------------------------
    // Create temporary file input
    // ------------------------------------------

    const imageInput =
        document.createElement("input");

    imageInput.type = "file";

    imageInput.accept =
        ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

    imageInput.style.display =
        "none";

    document.body.appendChild(
        imageInput
    );

    // ------------------------------------------
    // Ask user whether to replace image
    // ------------------------------------------

    const replaceImage =
        window.confirm(
            "Do you want to replace the post image?\n\nOK = Choose a new image\nCancel = Keep the current image"
        );

    let selectedImage = null;

    if (replaceImage) {
        imageInput.click();

        await new Promise(
            (resolve) => {
                imageInput.addEventListener(
                    "change",
                    resolve,
                    { once: true }
                );
            }
        );

        selectedImage =
            imageInput.files?.[0] ||
            null;

        // User opened picker but selected nothing.
        if (!selectedImage) {
            document.body.removeChild(
                imageInput
            );

            return;
        }

        // ------------------------------------------
        // Validate image type
        // ------------------------------------------

        const allowedTypes =
            [
                "image/jpeg",
                "image/png",
                "image/webp",
            ];

        if (
            !allowedTypes.includes(
                selectedImage.type
            )
        ) {
            document.body.removeChild(
                imageInput
            );

            alert(
                "Only JPG, JPEG, PNG and WEBP images are allowed."
            );

            return;
        }

        // ------------------------------------------
        // Validate image size
        // ------------------------------------------

        const maxSize =
            5 * 1024 * 1024;

        if (
            selectedImage.size >
            maxSize
        ) {
            document.body.removeChild(
                imageInput
            );

            alert(
                "Image must be 5MB or smaller."
            );

            return;
        }
    }

    // ------------------------------------------
    // Build FormData
    // ------------------------------------------

    const formData =
        new FormData();

    formData.append(
        "caption",
        caption
    );

    if (selectedImage) {
        formData.append(
            "image",
            selectedImage
        );
    }

    try {
        // ------------------------------------------
        // Update post
        // ------------------------------------------

        await apiRequest(
            `/posts/${encodeURIComponent(
                postId
            )}`,
            {
                method: "PUT",
                body: formData,
            }
        );

        alert(
            "Post updated successfully."
        );

        // ------------------------------------------
        // Refresh feed
        // ------------------------------------------

        await loadFeed();

        // ------------------------------------------
        // Refresh profile if currently open
        // ------------------------------------------

        const currentUserId =
            getCurrentUserId();

        if (
            currentUserId &&
            viewedProfileId &&
            String(currentUserId) ===
                String(viewedProfileId)
        ) {
            await loadUserProfile(
                viewedProfileId
            );
        }

    } catch (error) {
        console.error(
            "EDIT POST ERROR:",
            error
        );

        alert(
            error.message ||
                "Failed to edit post."
        );
    } finally {
        // ------------------------------------------
        // Remove temporary file input
        // ------------------------------------------

        if (
            imageInput.parentNode
        ) {
            imageInput.parentNode.removeChild(
                imageInput
            );
        }
    }
}


// ======================================================
// DELETE POST
// ======================================================

async function deletePost(postId) {
    if (!postId) {
        return;
    }

    const confirmed =
        window.confirm(
            "Delete this post? This action cannot be undone."
        );

    if (!confirmed) {
        return;
    }

    try {
        await apiRequest(
            `/posts/${encodeURIComponent(
                postId
            )}`,
            {
                method: "DELETE",
            }
        );

        await loadFeed();

        const currentUserId =
            getCurrentUserId();

        if (
            currentUserId &&
            viewedProfileId &&
            String(currentUserId) ===
                String(viewedProfileId)
        ) {
            await loadUserProfile(
                viewedProfileId
            );
        }

    } catch (error) {
        console.error(
            "DELETE POST ERROR:",
            error
        );

        alert(
            error.message ||
            "Failed to delete post."
        );
    }
}

// ======================================================
// CREATE COMMENTS PANEL
// ======================================================

function createCommentsPanel(
    postId,
    comments
) {
    const panel =
        document.createElement(
            "div"
        );

    panel.className =
        "comments-panel";

    const commentsHtml =
        comments.length > 0
            ? comments
                  .map(
                      renderComment
                  )
                  .join("")
            : `
                <div class="no-comments">
                    No comments yet.
                </div>
            `;

    panel.innerHTML = `
        <div class="comments-header">
            <h3>Comments</h3>
        </div>

        <div
            class="comments-list"
            data-comments-list="${escapeAttribute(
                postId
            )}"
        >
            ${commentsHtml}
        </div>

        <form
            class="comment-form"
            data-comment-form="${escapeAttribute(
                postId
            )}"
        >
            <input
                type="text"
                name="text"
                maxlength="500"
                placeholder="Write a comment..."
                autocomplete="off"
                required
            >

            <button
                type="submit"
                class="btn btn-primary"
            >
                Add Comment
            </button>
        </form>
    `;

    return panel;
}

// ======================================================
// RENDER COMMENT
// ======================================================

function renderComment(
    comment
) {
    const commentId =
        comment?._id || "";

    const userId =
        comment?.user?._id ||
        comment?.user?.id ||
        "";

    const userName =
        comment?.user?.name ||
        "Unknown User";

    const text =
        comment?.text || "";

    const currentUserId =
        getCurrentUserId();

    const isOwner =
        currentUserId &&
        userId &&
        String(
            currentUserId
        ) ===
            String(userId);

    return `
        <div
            class="comment-item"
            data-comment-id="${escapeAttribute(
                commentId
            )}"
        >

            <div class="comment-author">
                ${escapeHtml(
                    userName
                )}
            </div>

            <div class="comment-text">
                ${escapeHtml(
                    text
                )}
            </div>

            ${
                comment?.isEdited
                    ? `
                        <div class="comment-meta">
                            Edited
                        </div>
                    `
                    : ""
            }

            ${
                isOwner
                    ? `
                        <div class="comment-actions">

                            <button
                                type="button"
                                class="btn btn-edit-comment"
                                data-action="edit-comment"
                                data-comment-id="${escapeAttribute(
                                    commentId
                                )}"
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                class="btn btn-delete-comment"
                                data-action="delete-comment"
                                data-comment-id="${escapeAttribute(
                                    commentId
                                )}"
                            >
                                Delete
                            </button>

                        </div>
                    `
                    : ""
            }

        </div>
    `;
}

// ======================================================
// ADD COMMENT
// ======================================================

document.addEventListener(
    "submit",
    async (event) => {
        const form =
            event.target.closest(
                "form[data-comment-form]"
            );

        if (!form) {
            return;
        }

        event.preventDefault();

        const postId =
            form.dataset.commentForm;

        const input =
            form.querySelector(
                'input[name="text"]'
            );

        const submitButton =
            form.querySelector(
                'button[type="submit"]'
            );

        const text =
            input?.value.trim() ||
            "";

        if (!postId) {
            console.error(
                "Comment form missing post ID."
            );

            return;
        }

        if (!text) {
            return;
        }

        submitButton.disabled =
            true;

        submitButton.textContent =
            "Adding...";

        try {
            const data =
                await apiRequest(
                    `/comments/posts/${encodeURIComponent(
                        postId
                    )}/comments`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            text,
                        }),
                    }
                );

            const list =
                form
                    .closest(
                        ".comments-panel"
                    )
                    ?.querySelector(
                        ".comments-list"
                    );

            if (!list) {
                throw new Error(
                    "Comments list not found."
                );
            }

            const emptyMessage =
                list.querySelector(
                    ".no-comments"
                );

            if (emptyMessage) {
                emptyMessage.remove();
            }

            if (data.comment) {
                list.insertAdjacentHTML(
                    "beforeend",
                    renderComment(
                        data.comment
                    )
                );
            }

            input.value = "";

            updateCommentCount(
                postId,
                1
            );

        } catch (error) {
            console.error(
                "ADD COMMENT ERROR:",
                error
            );

            alert(
                error.message ||
                "Failed to add comment."
            );

        } finally {
            submitButton.disabled =
                false;

            submitButton.textContent =
                "Add Comment";
        }
    }
);

// ======================================================
// EDIT COMMENT
// ======================================================

async function editComment(
    commentId
) {
    if (!commentId) {
        return;
    }

    const commentItem =
        document.querySelector(
            `.comment-item[data-comment-id="${CSS.escape(
                commentId
            )}"]`
        );

    if (!commentItem) {
        return;
    }

    const textElement =
        commentItem.querySelector(
            ".comment-text"
        );

    const currentText =
        textElement?.textContent.trim() ||
        "";

    const newText =
        window.prompt(
            "Edit comment:",
            currentText
        );

    if (newText === null) {
        return;
    }

    const text =
        newText.trim();

    if (!text) {
        alert(
            "Comment cannot be empty."
        );

        return;
    }

    try {
        const data =
            await apiRequest(
                `/comments/${encodeURIComponent(
                    commentId
                )}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        text,
                    }),
                }
            );

        if (data.comment) {
            commentItem.outerHTML =
                renderComment(
                    data.comment
                );
        }

    } catch (error) {
        console.error(
            "EDIT COMMENT ERROR:",
            error
        );

        alert(
            error.message ||
            "Failed to edit comment."
        );
    }
}

// ======================================================
// DELETE COMMENT
// ======================================================

async function deleteComment(
    commentId
) {
    if (!commentId) {
        return;
    }

    const confirmed =
        window.confirm(
            "Delete this comment?"
        );

    if (!confirmed) {
        return;
    }

    const commentItem =
        document.querySelector(
            `.comment-item[data-comment-id="${CSS.escape(
                commentId
            )}"]`
        );

    if (!commentItem) {
        return;
    }

    const postCard =
        commentItem.closest(
            ".post-card"
        );

    const postId =
        postCard?.dataset.postId;

    try {
        await apiRequest(
            `/comments/${encodeURIComponent(
                commentId
            )}`,
            {
                method: "DELETE",
            }
        );

        commentItem.remove();

        if (postId) {
            updateCommentCount(
                postId,
                -1
            );
        }

        const commentsList =
            postCard?.querySelector(
                ".comments-list"
            );

        if (
            commentsList &&
            !commentsList.querySelector(
                ".comment-item"
            )
        ) {
            commentsList.innerHTML = `
                <div class="no-comments">
                    No comments yet.
                </div>
            `;
        }

    } catch (error) {
        console.error(
            "DELETE COMMENT ERROR:",
            error
        );

        alert(
            error.message ||
            "Failed to delete comment."
        );
    }
}

// ======================================================
// UPDATE COMMENT COUNT
// ======================================================

function updateCommentCount(
    postId,
    change
) {
    const postCard =
        document.querySelector(
            `.post-card[data-post-id="${CSS.escape(
                postId
            )}"]`
        );

    if (!postCard) {
        return;
    }

    const meta =
        postCard.querySelector(
            ".post-meta"
        );

    if (!meta) {
        return;
    }

    const likesMatch =
        meta.textContent.match(
            /Likes:\s*(\d+)/
        );

    const commentsMatch =
        meta.textContent.match(
            /Comments:\s*(\d+)/
        );

    const likes =
        likesMatch
            ? Number(
                  likesMatch[1]
              )
            : 0;

    const comments =
        commentsMatch
            ? Number(
                  commentsMatch[1]
              )
            : 0;

    const newComments =
        Math.max(
            0,
            comments + change
        );

    meta.textContent =
        `Likes: ${likes} · Comments: ${newComments}`;
}

// ======================================================
// LOGOUT
// ======================================================

if (logoutBtn) {
    logoutBtn.addEventListener(
        "click",
        () => {
            removeToken();

            showLoggedOutUI();

            if (loginForm) {
                loginForm.reset();
            }

            if (feedContainer) {
                feedContainer.innerHTML =
                    "";
            }

            if (profileMessage) {
                profileMessage.textContent =
                    "";
            }

            allDiscoverUsers = [];

            stopNotificationRefresh();

            if (notificationPanel) {
                notificationPanel.classList.add(
                    "hidden"
                );
            }

            if (notificationBtn) {
                notificationBtn.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }

            if (notificationBadge) {
                notificationBadge.textContent =
                    "0";

                notificationBadge.classList.add(
                    "hidden"
                );
            }

            if (notificationsContainer) {
                notificationsContainer.innerHTML =
                    "";
            }

            if (userSearchInput) {
                userSearchInput.value = "";
            }
        }
    );
}

// ======================================================
// SECURITY HELPERS
// ======================================================

function escapeHtml(value) {
    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}

function escapeAttribute(value) {
    return escapeHtml(value);
}

// ======================================================
// INITIALIZE APP
// ======================================================

async function initializeApp() {
    const token =
        getToken();

    if (!token) {
        showLoggedOutUI();
        return;
    }

    try {
        const data =
            await apiRequest(
                "/users/profile"
            );

        loggedInUser =
            data.user || null;

        showAuthenticatedUI(
            loggedInUser
        );

        await loadUsers();
        await loadFeed();
        await loadUnreadNotificationCount();
        startNotificationRefresh();

    } catch (error) {
        console.error(
            "SESSION ERROR:",
            error
        );

        removeToken();

        showLoggedOutUI();
    }
}

// ======================================================
// START APPLICATION
// ======================================================

initializeApp();

// ======================================================
// EXPOSE PROFILE FUNCTIONS FOR DEBUGGING
// ======================================================

window.loadUserProfile = loadUserProfile;
window.loadFollowList = loadFollowList;