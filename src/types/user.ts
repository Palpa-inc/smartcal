export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  isAnonymous: boolean;
  lastSignInTime: Date;
  hideKeywords: string[];
}
