import { getMetadataStorage } from '../MetadataStorage';
import { InstanstiableIEntity, RelationshipType } from '..';
import { getPath } from 'ts-object-path';
import { TInstanstiableIEntity, IEntity } from '../types';

type IRelationshipOptions = {
  lazy?: boolean;
};

export function OneToMany<T extends IEntity>(
  foreignEntity: TInstanstiableIEntity<T>,
  foreignKeyFactory: (t: T) => any,
  opt: IRelationshipOptions = { lazy: true }
): Function {
  return function(primary: InstanstiableIEntity, propertyKey: string) {
    const primaryEntity = primary.constructor as InstanstiableIEntity;
    const name = [primaryEntity.name, foreignEntity.name]
      .sort((a, b) => a.localeCompare(b))
      .join('_');

    const foreignKey = getPath(foreignKeyFactory) as string[];

    getMetadataStorage().setRelationships({
      primaryEntity,
      primaryKey: 'id', // id o result de @Primary
      foreignEntity,
      foreignKey,
      propertyKey,
      type: RelationshipType.OneToMany,
      name,
      lazy: opt.lazy,
    });
  };
}
