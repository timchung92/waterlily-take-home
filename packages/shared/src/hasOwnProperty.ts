
const realHasOwnProperty = Object.prototype.hasOwnProperty;

export function hasOwnProperty<ObjectType, Key extends PropertyKey>(
  obj: ObjectType,
  property: Key,
): obj is ObjectType & Record<Key, unknown> {
  return realHasOwnProperty.call(obj, property);
}
