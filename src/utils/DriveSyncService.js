/**
 * Google Drive Sync Service
 * Handles recursive folder discovery using the Google Drive API v3.
 */

export const syncDriveFolders = async (apiKey, rootFolderId) => {
  if (!apiKey || !rootFolderId) {
    throw new Error('API Key and Root Folder ID are required');
  }

  const allFolders = [];
  const processedIds = new Set();

  const fetchChildren = async (parentId, parentDepth = 0) => {
    // Avoid infinite loops
    if (processedIds.has(parentId)) return;
    processedIds.add(parentId);

    const url = `https://www.googleapis.com/drive/v3/files?q='${parentId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'+and+trashed=false&fields=files(id,name,webViewLink)&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    for (const file of data.files) {
      allFolders.push({
        id: file.id, // Using Drive ID as unique ID
        name: file.name,
        link: file.webViewLink,
        parentId: parentId === rootFolderId ? null : parentId,
        color: '#6366f1', // Default color
        materials: []
      });

      // Recurse into sub-folders
      await fetchChildren(file.id, parentDepth + 1);
    }
  };

  await fetchChildren(rootFolderId);
  return allFolders;
};
