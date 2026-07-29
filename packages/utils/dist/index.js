export function calculateEloPvP(winnerElo, loserElo, options) {
    const floor = options?.floor ?? 800;
    const winnerChange = options?.winBonus ?? 25;
    const loserChange = options?.lossPenalty ?? -15;
    return {
        newWinnerElo: winnerElo + winnerChange,
        newLoserElo: Math.max(floor, loserElo + loserChange),
        winnerChange,
        loserChange,
    };
}
// 2. Hàm format dung lượng bộ nhớ và thời gian thực thi
export function formatMemoryKb(kb) {
    if (!kb && kb !== 0)
        return '0 KB';
    if (kb >= 1024) {
        return `${(kb / 1024).toFixed(1)} MB`;
    }
    return `${kb} KB`;
}
export function formatMemoryMb(mb) {
    if (!mb && mb !== 0)
        return '0 MB';
    if (mb >= 1024) {
        return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
}
export function formatExecutionTime(ms) {
    const msVal = typeof ms === 'string' ? parseFloat(ms) : ms;
    if (isNaN(msVal))
        return '0ms';
    if (msVal >= 1000) {
        return `${(msVal / 1000).toFixed(2)}s`;
    }
    return `${msVal}ms`;
}
// 3. Hàm parse/hiển thị thông điệp lỗi hoặc định dạng Markdown
export function parseErrorMessage(error) {
    if (!error) {
        return 'Đã xảy ra lỗi không xác định.';
    }
    if (typeof error === 'string') {
        return error;
    }
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    if (error.response?.data?.error) {
        return error.response.data.error;
    }
    if (error.message) {
        return error.message;
    }
    return JSON.stringify(error);
}
export function renderMarkdownToHtml(markdown) {
    if (!markdown)
        return '';
    let html = markdown;
    // Tiêu đề (Headers)
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    // Chữ đậm và chữ nghiêng (Bold & Italic)
    html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');
    // Khối mã (Code blocks)
    html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
    // Mã dòng (Inline code)
    html = html.replace(/`(.*?)`/gim, '<code>$1</code>');
    // Danh sách không thứ tự (Unordered lists)
    html = html.replace(/^\s*\n\* (.*)/gim, '<ul>\n<li>$1</li>\n</ul>');
    html = html.replace(/^\s*\n- (.*)/gim, '<ul>\n<li>$1</li>\n</ul>');
    // Xuống dòng
    html = html.replace(/\n/g, '<br />');
    return html;
}
