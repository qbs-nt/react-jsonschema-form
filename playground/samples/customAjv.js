import { createAjvInstance } from "../../src/utils";

const ajv = createAjvInstance();

// FIXME Sebu fork of https://github.com/epoberezkin/ajv-keywords/blob/master/keywords/transform.js
ajv.addKeyword("rjsfTransform", {
  type: "string",
  errors: false,
  modifying: true,
  valid: true,
  compile: function(schema, parentSchema) {
    const transform = {
      trimLeft: function(value) {
        return value.replace(/^[\s]+/, "");
      },
      trimRight: function(value) {
        return value.replace(/[\s]+$/, "");
      },
      trim: function(value) {
        const trimmed = value.trim();
        return trimmed || undefined;
      },
      toLowerCase: function(value) {
        return value.toLowerCase();
      },
      toUpperCase: function(value) {
        return value.toUpperCase();
      },
    };

    return function(data, dataPath, object, key) {
      console.log("rjsfTransform", { data, dataPath, object, key }); // FIXME sebu
      // skip if value only
      if (!object) {
        return;
      }

      // skip undefined data
      if (data === undefined) {
        return;
      }
      // apply transform in order provided
      for (var j = 0, l = schema.length; j < l; j++) {
        data = transform[schema[j]](data);
      }

      object[key] = data;
    };
  },
  metaSchema: {
    type: "array",
    items: {
      type: "string",
      enum: [
        "trimLeft",
        "trimRight",
        "trim",
        "toLowerCase",
        "toUpperCase",
        "toEnumCase",
      ],
    },
  },
});

// https://github.com/epoberezkin/ajv-keywords#transform
const ajvKeywords = require("ajv-keywords");
ajvKeywords(ajv, "transform");
// require("ajv-keywords")(ajv, ['transform']);

module.exports = {
  ajv,
  schema: {
    title: "Custom Ajv validator",
    // Standalone strings cannot be transformed by ajv (see ajv-keywords docs for transform keyword),
    // so we nest the string into an object
    type: "object",
    properties: {
      alwaysUppercase: {
        type: "string",
        rjsfTransform: ["toUpperCase"],
      },
      trimmed: {
        type: "string",
        rjsfTransform: ["trim"],
      },
    },
    required: ["trimmed"],
  },
  formData: {
    alwaysUppercase: "i am always in uppercase",
    trimmed: "I am always trimmed",
  },
};
