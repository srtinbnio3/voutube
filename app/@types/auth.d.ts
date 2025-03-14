declare module '@/app/actions/auth' {
  export function signUpAction(formData: FormData): Promise<{ status: string; message: string }>;
  export function signInAction(formData: FormData): Promise<{ status: string; message: string }>;
  export function signInWithGoogleAction(): Promise<{ status: string; message?: string }>;
  export function signOutAction(): Promise<{ status: string; message: string }>;
  export function resetPasswordRequestAction(formData: FormData): Promise<{ status: string; message: string }>;
  export function resetPasswordAction(formData: FormData): Promise<{ status: string; message: string }>;
  export function verifyEmailAction(token: string, type: string): Promise<{ status: string; message: string }>;
  export function resendVerificationEmailAction(email: string): Promise<{ status: string; message: string }>;
} 