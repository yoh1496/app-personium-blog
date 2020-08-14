import { useState, useEffect } from 'react';
import Dexie from 'dexie';
import { OutputBlockData } from '@editorjs/editorjs';
import { ImageImage } from 'material-ui/svg-icons';

class DraftDatabase extends Dexie {
  images: Dexie.Table<IImageFile, number>;
  drafts: Dexie.Table<IDraft, number>;

  constructor(databaseName: string) {
    super(databaseName);
    this.version(1).stores({
      drafts: '++id, time, blocks, version',
      images: '++id, file',
    });

    this.images = this.table('images');
    this.drafts = this.table('drafts');
  }
}

interface IDraft {
  id?: number;
  time?: number;
  blocks: Array<OutputBlockData>;
  version?: string;
}

interface IImageFile {
  id?: number;
  file: File;
}

export const useDraftContextIndexedDB = () => {
  const [db] = useState(new DraftDatabase('drafts_database'));

  useEffect(() => {
    db.version(1).stores({
      drafts: '++id,blocks',
      images: '++id,file',
    });
  }, [db]);

  return db;
};
