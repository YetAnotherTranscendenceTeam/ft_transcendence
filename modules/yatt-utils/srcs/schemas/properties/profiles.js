'use-strict';

const profilesProperties = {
  username: {
    type: "string",
    minLength: 4,
    maxLength: 15,
    description: "The user unique name",
    pattern: '^[a-zA-Z0-9_-]{4,15}$',
  },

  avatar: {
    type: "string",
    format: "uri",
    description: "The path to a user avatar picture",
  },

  image: {
    type: "string",
    description: "A base64 encoded image",
  }
};

export default profilesProperties;
