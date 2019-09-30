import { Firestore } from '@google-cloud/firestore';
import { BaseRepository } from './BaseRepository';
let store: IMetadataStore = null;

export const StoreScopes = {
  global: 'global' as const,
  local: 'local' as const,
};
export type MetadataStoreScope = keyof typeof StoreScopes;

export interface IMetadataStore {
  metadataStorage: MetadataStorage;
  scope: MetadataStoreScope;
  initialized?: boolean;
}

function getGlobalStore(): IMetadataStore {
  (global as any).scope = 'global';
  return global as any;
}

export interface CollectionMetadata {
  entity: Function;
  name: string;
}

export interface SubCollectionMetadata {
  parentEntity: Function;
  name: string;
  entity: Function;
  propertyKey: string;
}

export interface RepositoryMetadata {
  target: Function;
  entity: Function;
}

export class MetadataStorage {
  readonly collections: Array<CollectionMetadata> = [];
  readonly subCollections: Array<SubCollectionMetadata> = [];
  readonly repositories: Map<unknown, RepositoryMetadata> = new Map();

  public getCollection = (param: string | Function) => {
    if (typeof param === 'string') {
      return this.collections.find(c => c.name === param);
    }
    return this.collections.find(c => c.entity === param);
  };

  public setCollection = (col: CollectionMetadata) => {
    const existing = this.getCollection(col.entity);
    if (!existing) {
      this.collections.push(col);
    }
  };

  public getSubCollectionsFromParent = (parentEntity: Function) => {
    return this.subCollections.filter(s => s.parentEntity === parentEntity);
  };

  public getSubCollection = (
    param: string | Function
  ): SubCollectionMetadata => {
    if (typeof param === 'string') {
      return this.subCollections.find(c => c.name === param);
    }
    return this.subCollections.find(c => c.entity === param);
  };

  public setSubCollection = (subCol: SubCollectionMetadata) => {
    this.subCollections.push(subCol);
  };

  public getRepository = (param: Function) => {
    return this.repositories.get(param);
  };

  public setRepository = (repo: RepositoryMetadata) => {
    const savedRepo = this.getRepository(repo.entity);

    if (savedRepo && repo.target !== savedRepo.target) {
      throw new Error(
        'Cannot register a custom repository twice with two different targets'
      );
    }

    if (!(repo.target.prototype instanceof BaseRepository)) {
      throw new Error(
        'Cannot register a custom repository on a class that does not inherit from BaseFirestoreRepository'
      );
    }

    this.repositories.set(repo.entity, repo);
  };

  public firestoreRef: Firestore = null;
}

export const getMetadataStorage = (): MetadataStorage => {
  if (!store) {
    initializeMetadataStorage();
  }

  return store.metadataStorage;
};

export function initializeMetadataStorage(localMetadataStore?: IMetadataStore) {
  if (store && store.initialized) {
    throw new Error(
      `The store has already been initialized in scope: ${store.scope}`
    );
  }

  store = localMetadataStore || getGlobalStore();
  store.initialized = true;

  if (!store.metadataStorage) {
    store.metadataStorage = new MetadataStorage();
  }
}

export const Initialize = (
  firestore: Firestore,
  localMetadataStore?: IMetadataStore
): void => {
  initializeMetadataStorage({...localMetadataStore, scope: StoreScopes.local});

  store.metadataStorage.firestoreRef = firestore;
};