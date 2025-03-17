'use-strict';

const profilesProperties = {
  username: {
    type: "string",
    minLength: 4,
    maxLength: 15,
    description: "The user unique name",
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
