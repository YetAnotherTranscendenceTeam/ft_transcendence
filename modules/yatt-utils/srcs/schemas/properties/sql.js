'use-strict';

const sqlProperties = {
  limit: {
    type: "integer",
    minimum: 10,
    maximum: 100,
    default: 30,
    description: "Number of items to return (10-100)",
  },

  offset: {
    type: "integer",
    minimum: 0,
    default: 0,
    description: "Number of items to skip",
  },

  created_at: {
    type: "string",
    format: "date-time",
    description: "Timestamp when the record was first created in the database",
  },

  updated_at: {
    type: "string",
    format: "date-time",
    description: "Timestamp of the most recent update to the record",
  },
};

export default sqlProperties;
