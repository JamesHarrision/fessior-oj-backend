// Biểu thức chính quy (Regex)
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
export const ROOM_CODE_REGEX = /^[a-zA-Z0-9]{6}$/;
// Các hàm validation cơ bản
export const validateEmail = (email) => EMAIL_REGEX.test(email);
export const validateUsername = (username) => USERNAME_REGEX.test(username);
export const validateRoomCode = (roomCode) => ROOM_CODE_REGEX.test(roomCode);
export function checkPasswordStrength(password) {
    const feedback = [];
    let score = 0;
    if (password.length >= 8) {
        score++;
    }
    else {
        feedback.push('Mật khẩu phải dài ít nhất 8 ký tự.');
    }
    if (/[A-Z]/.test(password)) {
        score++;
    }
    else {
        feedback.push('Mật khẩu nên chứa ít nhất 1 chữ hoa.');
    }
    if (/[a-z]/.test(password)) {
        score++;
    }
    if (/[0-9]/.test(password)) {
        score++;
    }
    else {
        feedback.push('Mật khẩu nên chứa ít nhất 1 chữ số.');
    }
    if (/[^A-Za-z0-9]/.test(password)) {
        score++;
    }
    else {
        feedback.push('Mật khẩu nên chứa ít nhất 1 ký tự đặc biệt.');
    }
    const finalScore = Math.min(score, 4);
    return {
        score: finalScore,
        feedback,
        isStrong: finalScore >= 3 && password.length >= 6,
    };
}
