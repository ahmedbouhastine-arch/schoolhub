/**
 * Google Drive Sync Service
 * Handles recursive folder discovery and file detection using the Google Drive API v3.
 */

// MIME types to exclude (Google Workspace apps that aren't downloadable files)
const EXCLUDED_MIME_TYPES = [
  'application/vnd.google-apps.folder',
  'application/vnd.google-apps.form',
  'application/vnd.google-apps.script',
  'application/vnd.google-apps.script+json'
];

/**
 * Extract Folder ID from a Google Drive URL
 * @param {string} url - The Drive folder URL
 * @returns {string|null} - The extracted ID or null if invalid
 */
export const extractFolderId = (url) => {
  if (!url) return null;
  
  // Clean the URL of trailing slashes and extra whitespace
  const cleanUrl = url.trim().replace(/\/$/, '');

  // Standard folder link: /folders/ID
  // Shared link: /open?id=ID
  const folderMatch = cleanUrl.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch) return folderMatch[1];
  
  const idMatch = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];
  
  // If it's already an ID (not a full URL)
  // Ensure it doesn't look like a URL (no slashes, no dots, etc.)
  if (/^[a-zA-Z0-9_-]{25,}$/.test(cleanUrl) && !cleanUrl.includes('/') && !cleanUrl.includes('.')) {
    return cleanUrl;
  }
  
  console.warn('Failed to extract Google Drive Folder ID from:', url);
  return null;
};

// Map file extensions to material categories
const getFileCategory = (fileName) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (['pdf'].includes(ext)) return 'document';
  if (['doc', 'docx'].includes(ext)) return 'document';
  if (['ppt', 'pptx'].includes(ext)) return 'presentation';
  if (['xls', 'xlsx'].includes(ext)) return 'spreadsheet';
  if (['mp4', 'avi', 'mov', 'webm'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'ogg'].includes(ext)) return 'audio';
  if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) return 'image';
  return 'file';
};

/**
 * Fetch files (not folders) from a specific folder with pagination
 */
export const fetchFolderMaterials = async (apiKey, folderId) => {
  let materials = [];
  let pageToken = '';
  
  do {
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+not+mimeType='application/vnd.google-apps.folder'+and+trashed=false&fields=nextPageToken,files(id,name,webViewLink,mimeType,size,createdTime,modifiedTime,thumbnailLink)&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ''}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.warn(`Error fetching files for ${folderId}:`, data.error.message);
      break;
    }
    
    const fetchedMaterials = (data.files || [])
      .filter(file => !EXCLUDED_MIME_TYPES.includes(file.mimeType))
      .map(file => ({
        id: file.id,
        title: file.name,
        url: file.webViewLink,
        mimeType: file.mimeType,
        size: file.size,
        createdTime: file.createdTime,
        modifiedTime: file.modifiedTime,
        thumbnailLink: file.thumbnailLink,
        category: getFileCategory(file.name)
      }));
      
    materials = [...materials, ...fetchedMaterials];
    pageToken = data.nextPageToken || '';
  } while (pageToken);
  
  return materials;
};

/**
 * Sync folders and files from Google Drive recursively
 * @param {string} apiKey - Google Drive API Key
 * @param {string} rootFolderId - Root folder ID to start syncing from
 * @returns {Promise<Array>} Array of folder objects with materials
 */
export const syncDriveFolders = async (apiKey, rootFolderId) => {
  const cleanId = extractFolderId(rootFolderId);
  if (!apiKey || !cleanId) {
    throw new Error('Valid API Key and Root Folder ID/Link are required');
  }

  const allFolders = [];
  const processedIds = new Set();

  /**
   * Fetch child folders recursively with pagination
   */
  const fetchChildrenTree = async (parentId, parentDepth = 0) => {
    if (processedIds.has(parentId)) return;
    processedIds.add(parentId);

    let pageToken = '';
    const children = [];

    do {
      const url = `https://www.googleapis.com/drive/v3/files?q='${parentId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'+and+trashed=false&fields=nextPageToken,files(id,name,webViewLink)&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ''}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      if (data.files) {
        children.push(...data.files);
      }
      pageToken = data.nextPageToken || '';
    } while (pageToken);

    for (const folder of children) {
      // Fetch materials for this folder
      const materials = await fetchFolderMaterials(apiKey, folder.id);

      allFolders.push({
        id: folder.id,
        name: folder.name,
        link: folder.webViewLink,
        parentId: parentId === cleanId ? null : parentId,
        color: '#6366f1', // Default theme color
        materials
      });

      // Recurse into sub-folders
      await fetchChildrenTree(folder.id, parentDepth + 1);
    }
  };

  await fetchChildrenTree(cleanId);
  return allFolders;
};

/**
 * Sync only materials for a specific folder ID or URL
 */
export const syncFolderMaterialsOnly = async (apiKey, folderUrlOrId) => {
  const folderId = extractFolderId(folderUrlOrId);
  if (!apiKey || !folderId) {
    throw new Error('API Key and Folder ID/Link are required');
  }

  return await fetchFolderMaterials(apiKey, folderId);
};
