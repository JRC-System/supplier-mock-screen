  // 表示件数を更新する関数
  function updateDisplayCount() {
    const isInput = document.getElementById('modeInput').checked;
    const isHistory = document.getElementById('modeHistory').checked;
    const displayCountElement = document.getElementById('displayCount');
    
    let container = null;
    
    if (isInput) {
        // 回答するモード: contentModeInput内のカードをカウント
        container = document.getElementById('contentModeInput');
    } else if (isHistory) {
        // 履歴確認モード: contentModeHistory内のカードをカウント
        container = document.getElementById('contentModeHistory');
    }
    
    if (!container || container.style.display === 'none') {
        displayCountElement.textContent = 0 ;
        return;
    }
    
    // フィルターに応じてカウント
    const filterAll = document.getElementById('filterAll').checked;
    const filterQuote = document.getElementById('filterQuote').checked;
    const filterOrder = document.getElementById('filterOrder').checked;
    
    const allCards = container.querySelectorAll('.order-card');
    let count = 0;
    
    allCards.forEach(card => {
        // カードが表示されているかチェック
        const isVisible = card.offsetParent !== null;
        if (isVisible) {
            if (filterAll) {
                count++;
            } else if (filterQuote && card.classList.contains('type-quote')) {
                count++;
            } else if (filterOrder && card.classList.contains('type-order')) {
                count++;
            }
        }
    });
    
    displayCountElement.textContent = count + "件";
}

function toggleMode() {
    const isInput = document.getElementById('modeInput').checked;
    const isHistory = document.getElementById('modeHistory').checked;
    const historyControls = document.querySelector('.history-controls');
    const contentModeInput = document.getElementById('contentModeInput');
    const contentModeHistory = document.getElementById('contentModeHistory');
    const displayFilterSection = document.getElementById('displayFilterSection');
    const sendButton = document.getElementById('sendButton');

    if (isInput) {
        // 回答するモード: demo.htmlスタイルを表示
        contentModeInput.style.display = 'block';
        contentModeHistory.style.display = 'none';
        
        // Hide History Controls
        historyControls.style.display = 'none';
        
        // Show Display Filter
        displayFilterSection.style.display = 'block';

        // Show send button
        if (sendButton) {
            sendButton.style.display = 'inline-flex';
        }
        
        document.body.style.backgroundColor = "#f4f6f9";
    } else if (isHistory) {
        // 履歴確認モード: demo2.htmlスタイルを表示
        contentModeInput.style.display = 'none';
        contentModeHistory.style.display = 'block';
        
        // Show History Controls (Prev/Next Month)
        historyControls.style.display = 'flex';
        
        // Show Display Filter (履歴モードでもフィルターを使用可能)
        displayFilterSection.style.display = 'block';

        // Hide send button
        if (sendButton) {
            sendButton.style.display = 'none';
        }
        
        // Visual feedback for History Mode
        document.body.style.backgroundColor = "#eef2f7"; // Slightly darker background
    }
    
    // モード切り替え後に表示件数を更新
    setTimeout(function() {
        updateDisplayCount();
        // フィルターも適用
        if (typeof applyDisplayFilter === 'function') {
            applyDisplayFilter();
        }
    }, 100);
}

// 送信機能（見積・発注回答）
function sendResponses() {
    const isInput = document.getElementById('modeInput').checked;
    if (!isInput) {
        alert('回答するモードで送信してください。');
        return;
    }

    const container = document.getElementById('contentModeInput');
    if (!container) return;

    // チェックされたカードを取得
    const checkedCards = container.querySelectorAll('.order-card input[type="checkbox"]:checked');
    
    if (checkedCards.length === 0) {
        alert('送信する項目を選択してください。');
        return;
    }

    const responses = [];
    checkedCards.forEach(checkbox => {
        const card = checkbox.closest('.order-card');
        const orderNo = card.querySelector('.font-monospace, .data-value')?.textContent?.trim() || '不明';
        const isQuote = card.classList.contains('type-quote');
        const type = isQuote ? '見積' : '発注';
        
        responses.push({
            orderNo: orderNo,
            type: type,
            card: card
        });
    });

    if (confirm(`${responses.length}件の回答を送信してもよろしいですか？`)) {
        // 各回答を送信
        responses.forEach(response => {
            sendResponseNotification(response.orderNo, response.type);
        });
        
        alert(`${responses.length}件の回答を送信しました。\nJRC購買担当へ通知メールを送信しました。`);
    }
}

// 見積・発注回答通知送信
function sendResponseNotification(orderNo, type) {
    // 仕入先コードを取得（サンプル）
    const supplierCode = 'SUP001'; // 実際の実装では、カードから取得
    
    // 通知先メールアドレスを取得
    const notificationEmail = getNotificationEmail(supplierCode);
    if (!notificationEmail) {
        console.log('通知先メールアドレスが設定されていません。');
        return;
    }
    
    // 通知設定をチェック
    const notificationType = type === '見積' ? 'notifyQuoteResponse' : 'notifyOrderResponse';
    if (!isNotificationEnabled(supplierCode, notificationType)) {
        console.log('通知機能が無効になっています。');
        return;
    }
    
    const emailData = {
        to: notificationEmail,
        subject: `【JRC】${type}回答の通知 - ${orderNo}`,
        body: `
${type}の回答が行われました。

${type}No: ${orderNo}
仕入先コード: ${supplierCode}
回答日時: ${new Date().toLocaleString('ja-JP')}

詳細はシステムでご確認ください。

株式会社ミガロ
JRC購買担当
        `
    };
    
    console.log(`${type}回答通知メール送信:`, emailData);
    // 実際の実装では、サーバーAPIを呼び出してメール送信
}

// 通知先メールアドレス取得（サンプル）
function getNotificationEmail(supplierCode) {
    // 実際の実装では、仕入先データから通知先メールアドレスを取得
    const supplierData = {
        'SUP001': 'purchase@jrc.co.jp',
        'SUP002': 'purchase@jrc.co.jp'
    };
    return supplierData[supplierCode] || null;
}

// 通知機能が有効かチェック（サンプル）
function isNotificationEnabled(supplierCode, notificationType) {
    // 実際の実装では、仕入先データから通知設定を取得
    const notificationSettings = {
        'SUP001': {
            enabled: true,
            notifyQuoteResponse: true,
            notifyOrderResponse: true,
            notifyReception: true,
            notifyInfoChange: true
        },
        'SUP002': {
            enabled: true,
            notifyQuoteResponse: true,
            notifyOrderResponse: true,
            notifyReception: true,
            notifyInfoChange: true
        }
    };
    
    const settings = notificationSettings[supplierCode];
    if (!settings || !settings.enabled) {
        return false;
    }
    
    return settings[notificationType] || false;
}

// ページ読み込み時に初期状態を設定
document.addEventListener('DOMContentLoaded', function() {
    toggleMode();
    updateDisplayCount();
});