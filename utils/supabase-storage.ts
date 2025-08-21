// This file has been temporarily disabled while we fix navigation issues
export const uploadProductImage = async (file: File): Promise<string> => {
  return URL.createObjectURL(file);
}

export const uploadMultipleProductImages = async (files: File[]): Promise<string[]> => {
  return files.map(file => URL.createObjectURL(file));
}
