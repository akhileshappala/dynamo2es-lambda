'use strict';

const marshaler = require('dynamodb-marshaler');
const uuid = require('uuid');

module.exports = function(records) {
  if (!records) {
    records = [{}]; // eslint-disable-line no-param-reassign
  }

  if (!Array.isArray(records)) {
    records = [records]; // eslint-disable-line no-param-reassign
  }

  return {
    Records: records.map(record => {
      const eventName = record.name || 'INSERT';
      const keys = record.keys || { id: uuid.v4() };
      const newImage = eventName === 'REMOVE' ? null : Object.assign({}, record.new, keys);
      const oldImage = eventName === 'INSERT' ? null : Object.assign({}, keys, record.old);

      return {
        eventName,
        eventSource: 'aws:dynamodb',
        dynamodb: {
          Keys: marshaler.toDDB(keys),
          NewImage: newImage ? marshaler.toDDB(newImage) : undefined,
          OldImage: oldImage ? marshaler.toDDB(oldImage) : undefined,
          StreamViewType: 'NEW_AND_OLD_IMAGES'
        }
      };
    })
  };
};
