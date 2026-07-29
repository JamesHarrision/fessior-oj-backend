export declare const EMAIL_REGEX: RegExp;
export declare const USERNAME_REGEX: RegExp;
export declare const ROOM_CODE_REGEX: RegExp;
export declare const validateEmail: (email: string) => boolean;
export declare const validateUsername: (username: string) => boolean;
export declare const validateRoomCode: (roomCode: string) => boolean;
export interface PasswordStrengthResult {
    score: number;
    feedback: string[];
    isStrong: boolean;
}
export declare function checkPasswordStrength(password: string): PasswordStrengthResult;
