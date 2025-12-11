/**
 * 共通ヘッダー生成スクリプト
 * 各ページでこのスクリプトを読み込むことで、統一されたヘッダーを表示します
 */

(function() {
    'use strict';

    // ヘッダーを生成する関数
    function createHeader() {
        // ログインユーザー情報取得用
        let loggedInUser = null;
        try {
            loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
        } catch(e) {
            // 無視
        }

        // 仕入先登録メニュー（管理者のみ表示）
        let supplierRegistrationMenu = '';
        if (loggedInUser && String(loggedInUser.role_cd) === '1') {
            supplierRegistrationMenu = `
                <li><a class="dropdown-item" href="supplier-registration.html" id="navRegistration">
                    <i class="fa-solid fa-user-plus"></i>
                    <span>仕入先登録</span>
                </a></li>
            `;
        }
        
        // 通知先設定メニュー（管理者の場合は非表示）
        let notificationMenu = '';
        if (!loggedInUser || loggedInUser.user_id !== 'admin') {
            notificationMenu = `
                <li><a class="dropdown-item" href="#" id="navNotification">
                    <i class="fa-solid fa-bell"></i>
                    <span>通知先設定</span>
                </a></li>
            `;
        }

        // <li><a class="dropdown-item" href="password_reset.html" id="navPasswordReset">
        //                             <i class="fa-solid fa-key"></i>
        //                             <span>パスワード再設定</span>
        //                         </a></li>

        
        const headerHTML = `
            <!-- Header -->
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
                <div class="container-fluid">
                    <a class="navbar-brand d-flex align-items-center gap-3" href="supplier_ui.html">
                        <div class="logo-placeholder">JRC</div>
                        <span class="navbar-brand-text d-none d-md-block">株式会社JRC</span>
                    </a>
                    
                    <!-- トップメニュー（ドロップダウン） -->
                    <div class="d-flex align-items-center ms-auto me-4">
                        <!-- ユーザー情報表示 -->
                        <div class="me-3 d-flex flex-column align-items-end">
                            <small id="companyNameDisplay" class="text-light fw-bold"></small>
                            <span id="userNameDisplay" class="text-light small"></span>
                        </div>
                        <!-- メニュードロップダウン -->
                        <div class="dropdown">
                            <a class="dropdown-toggle" href="#" id="dropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fa-solid fa-bars"></i>
                                <span>メニュー</span>
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuLink">
                                <li><a class="dropdown-item" href="supplier_ui.html" id="navHome">
                                    <i class="fa-solid fa-house"></i>
                                    <span>ホーム</span>
                                </a></li>
                                ${supplierRegistrationMenu}
                                ${notificationMenu}
                                <li><a class="dropdown-item" href="AccountSettings.html" id="navAccount">
                                    <i class="fa-solid fa-user-cog"></i>
                                    <span>アカウント設定</span>
                                </a></li>
                        
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item text-danger" href="#" onclick="handleLogout(); return false;">
                                    <i class="fa-solid fa-right-from-bracket"></i>
                                    <span>ログアウト</span>
                                </a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>
        `;
        return headerHTML;
    }

    // ヘッダーを挿入する関数
    function insertHeader() {
        const headerContainer = document.getElementById('common-header');
        if (headerContainer) {
            headerContainer.innerHTML = createHeader();
            initializeHeader();
        }
    }

    // ヘッダーの初期化処理
    function initializeHeader() {
        // ログインユーザー情報を表示
        let loggedInUser = null;
        try {
            loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
        } catch(e) {
            console.error('ユーザー情報の読み込みに失敗しました:', e);
        }

        if (loggedInUser) {
            // ユーザー情報を表示
            const companyDisplay = document.getElementById('companyNameDisplay');
            const userDisplay = document.getElementById('userNameDisplay');
            
            if (companyDisplay) {
                companyDisplay.textContent = loggedInUser.company_name || '';
            }
            if (userDisplay) {
                userDisplay.textContent = (loggedInUser.user_name || '') + ' 様';
            }

            // 通知先設定リンクをユーザーロールに応じて設定
            const notificationLink = document.getElementById('navNotification');
            if (notificationLink) {
                if (loggedInUser.user_id === 'admin') {
                    notificationLink.href = 'admin_supplier_config.html';
                } else {
                    notificationLink.href = 'user_notification_settings.html';
                }
            }
        }

        // 現在のページに応じてアクティブなメニュー項目を設定
        setActiveMenu();
    }

    // アクティブなメニュー項目を設定
    function setActiveMenu() {
        const currentPage = window.location.pathname.split('/').pop() || 'supplier_ui.html';
        const navLinks = document.querySelectorAll('.dropdown-item');
        
        navLinks.forEach(link => {
            if (link.onclick) return; // ログアウトリンクは除外
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href && (currentPage === href || (currentPage === '' && href === 'supplier_ui.html'))) {
                link.classList.add('active');
            }
        });
    }

    // ログアウト処理
    window.handleLogout = function() {
        if (confirm('ログアウトしてもよろしいですか？')) {
            sessionStorage.removeItem('loggedInUser');
            window.location.href = 'login.html';
        }
    };

    // ログイン状態をチェック
    function checkLoginStatus() {
        const loggedInUser = sessionStorage.getItem('loggedInUser');
        const currentPage = window.location.pathname.split('/').pop();

        // ログインページ以外でログインしていない場合はリダイレクト
        if (!loggedInUser && currentPage !== 'login.html') {
            alert('ログインが必要です。');
            window.location.href = 'login.html';
            return false;
        }

        return true;
    }

    // DOMContentLoaded時に実行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            insertHeader();
            checkLoginStatus();
        });
    } else {
        insertHeader();
        checkLoginStatus();
    }

})();

