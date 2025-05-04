import request from "supertest";
import { profilesURL } from "../URLs.js";
import { createUsers, users } from "../dummy/dummy-account.js";

createUsers(1);

const pass = [
  "user123",          // Simple alphanumeric
  "valid_name",       // Underscore in the middle
  "test-user",        // Hyphen in the middle
  "alpha_123",        // Mixed underscore and numbers
  "user-name_15",     // Mixed hyphen and underscore
  "abcd",             // Minimum length (4 characters)
  "1234",             // Minimum length with numbers only
  "user_1-2",         // Combination of underscore and hyphen
  "test12345",        // Alphanumeric with length > 10
  "valid_123_user",   // Underscore surrounded by alphanumeric characters
  "name-name_name",   // Multiple special characters (hyphen and underscore)
  "USERNAME123",      // Uppercase letters allowed
  "lower_case_user",  // Lowercase letters with underscores
  "user_name_test1",  // Complex but valid structure
  "test_test-test1",  // Multiple underscores and hyphens, valid structure
  "validname12345",   // Long alphanumeric username (15 characters max)
  "-username-",       // Leading and trailing hyphen
  "_username_",       // Leading and trailing underscore
  "-user_name-",      // Leading hyphen, trailing underscore
  "__username__",     // Multiple underscores at the beginning and end
  "---username---",   // Multiple hyphens at the beginning and end
  "-_username_-_",    // Mixed leading/trailing special characters
  "_-_-_-_-_-_-_",    // Only special characters, no alphanumeric
  "-abc-",            // Valid length but invalid structure (leading/trailing hyphen)
];

const invalid = [
  " user123",         // Leading space
  "user123 ",         // Trailing space
  " user123 ",        // Leading and trailing space
  "\tuser123",        // Tab character at the beginning
  "\nuser123",        // Newline character at the beginning
  "user\tname",       // Tab character in the middle
  "user name",        // Space character in the middle
  "user\nname",       // Newline character in the middle
  "test@user",        // Invalid character '@'
  "alpha#123",        // Invalid character '#'
  "$username$",       // Invalid character '$'
  "!username!",       // Invalid character '!'
  "(username)",       // Invalid parentheses '(' and ')'
  "[username]",       // Invalid brackets '[' and ']'
  "{username}",       // Invalid braces '{' and '}'
  "*username*",       // Invalid asterisk '*'
  "~username~",       // Invalid tilde '~'
  "`username`",       // Invalid backtick '`'
  "+username+",       // Invalid plus sign '+'
  "=username=",       // Invalid equal sign '='
  "|username|",       // Invalid pipe '|'
  
  "ainvalidusername", // Too long (16 characters)
  "abc",              // Too short (3 characters)
  "ab",               // Too short (2 characters)
  "",                 // Empty string
  
  "user name",        // Space in the middle
  "user\tname",       // Tab character in the middle
  "user\nname",       // Newline character in the middle  
];

describe("USERNAME REGEX", () => {
  describe("pass", () => {
    for (const username of pass) {
      it(username, async () => {
        const response = await request(profilesURL)
          .patch(`/${users[0].account_id}`)
          .send({ username });

        expect(response.statusCode).toBe(200);
      })
    }
  })

  describe("invalid", () => {
    for (const username of invalid) {
      it(username, async () => {
        const response = await request(profilesURL)
          .patch(`/${users[0].account_id}`)
          .send({ username });

        expect(response.statusCode).toBe(400);
      })
    }
  })
})
