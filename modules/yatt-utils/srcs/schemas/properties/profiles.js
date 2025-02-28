'use-strict';

const profilesProperties = {
  username: {
    type: "string",
    minLength: 4,
    maxLength: 10,
    description: "The user unique name",
  },

  avatar: {
    type: "string",
    format: "uri",
    description: "The path to a user avatar picture",
  },
};

export default profilesProperties;
