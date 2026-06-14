import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Google sign in helper
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// -------------------------------------------------------------
// GOOGLE DRIVE API OPERATION HELPERS
// -------------------------------------------------------------

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
}

/**
 * Searches and lists PDF/image pathology report folders or files saved inside user's Google Drive.
 */
export const listFilesFromDrive = async (accessToken: string): Promise<DriveFile[]> => {
  try {
    const q = "name contains 'shahnazpathology' and trashed = false";
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,createdTime)&orderBy=createdTime%20desc`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Google Drive API error listing files: ${response.statusText}`);
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Failed to list files from Google Drive:', error);
    throw error;
  }
};

/**
 * Uploads a text/json or image/pdf file to Google Drive under a specialized naming scheme.
 */
export const uploadFileToDrive = async (
  accessToken: string,
  fileName: string,
  mimeType: string,
  contentStr: string
): Promise<DriveFile> => {
  try {
    // We can use multipart upload to include metadata and clean content body
    const metadata = {
      name: fileName,
      mimeType: mimeType,
      description: 'Shahnaz Pathology Clinical Cloud Backup Report Document',
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}\r\n\r\n` +
      contentStr +
      closeDelimiter;

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!response.ok) {
      throw new Error(`Google Drive API upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to upload file to Google Drive:', error);
    throw error;
  }
};

/**
 * Downloads a text/JSON file contents from Google Drive.
 */
export const downloadFileFromDrive = async (accessToken: string, fileId: string): Promise<string> => {
  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Google Drive API download failed: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error('Failed to download file from Google Drive:', error);
    throw error;
  }
};

/**
 * Deletes a file from Google Drive with user permission.
 */
export const deleteFileFromDrive = async (accessToken: string, fileId: string): Promise<boolean> => {
  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Google Drive API deletion failed: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Failed to delete file from Google Drive:', error);
    throw error;
  }
};

// -------------------------------------------------------------
// COMPATIBILITY ALIASES FOR APP.TSX
// -------------------------------------------------------------
export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  size?: string;
}

export const listDriveFiles = async (accessToken: string): Promise<GoogleDriveFile[]> => {
  const files = await listFilesFromDrive(accessToken);
  return files.map(f => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    createdTime: f.createdTime
  }));
};

export const downloadDriveFile = async (
  accessToken: string,
  fileId: string,
  mimeType: string
): Promise<{ name: string; type: string; data: string }> => {
  try {
    const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=name`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const filename = metaRes.ok ? (await metaRes.json()).name : 'imported_clinical_file';

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`Google Drive API download failed: ${response.statusText}`);
    }

    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    return {
      name: filename,
      type: mimeType,
      data: dataUrl,
    };
  } catch (error) {
    console.error('Failed to download drive file:', error);
    throw error;
  }
};

export const uploadDriveFile = async (
  accessToken: string,
  fileName: string,
  mimeType: string,
  contentStrBuf: string
): Promise<any> => {
  return uploadFileToDrive(accessToken, fileName, mimeType, contentStrBuf);
};

