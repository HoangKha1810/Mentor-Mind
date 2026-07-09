export type StoredFile = {
  key: string;
  url: string;
  size: number;
  mimeType: string;
  filename: string;
};

export interface StorageProvider {
  readonly name: string;
  put(input: { ownerId: string; filename: string; mimeType: string; buffer: Buffer }): Promise<StoredFile>;
  signedUrl(key: string): Promise<string>;
  remove(key: string): Promise<void>;
}
