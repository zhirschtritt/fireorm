import { expect } from 'chai';
import { MetadataStorage, Initialize } from "./MetadataStorage";

describe.only(MetadataStorage.name, function () {  
  it('makes a new MetadataStorage', function() {
    expect(() => new MetadataStorage()).not.to.throw()
  })

  context(Initialize.name, function() {
    it('sets metadata store and sets firestore ref', function() {
      const firestore = {} as any;
      const store = {scope: 'local'} as any;
      expect(() => Initialize(firestore, store)).to.be.ok
      expect(store.scope).to.equal('local')
      expect(store.metadataStorage).to.be.instanceOf(MetadataStorage)
      expect(store.metadataStorage.firestoreRef).to.equal(firestore)
    })
  })
});