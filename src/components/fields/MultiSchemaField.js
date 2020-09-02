import React, { Component } from "react";
import PropTypes from "prop-types";
import * as types from "../../types";
import {
  getUiOptions,
  getWidget,
  guessType,
  getDefaultRegistry,
  getDefaultFormState,
  retrieveSchema,
} from "../../utils";
import { isValid } from "../../validate";

import { FormContext } from "../Form";

const debug = false;

// Used as AnyOfField and OneOfField, see src/components/fields/index.js
class MultiSchemaField extends Component {
  constructor(props) {
    super(props);

    const { formData, options } = this.props;

    this.state = {
      selectedOption: this.getMatchingOption(formData, options),
    };

    if (debug) {
      console.log("MultiSchemaField: constructor state", this.state);
    }
  }

  componentWillReceiveProps(nextProps) {
    const matchingOption = this.getMatchingOption(
      nextProps.formData,
      nextProps.options,
      this.state.selectedOption
    );
    if (debug) {
      console.log("MultiSchemaField: matching option", matchingOption, {
        nextProps,
        "this.state.selectedOption": this.state.selectedOption,
      });
    }

    if (matchingOption === this.state.selectedOption) {
      if (debug) {
        console.log(
          "MultiSchemaField: matching option unchanged, not setting state"
        );
      }
      return;
    }

    if (debug) {
      console.log(
        "MultiSchemaField: matching option changed, updating selectedOption in state"
      );
    }

    this.setState({ selectedOption: matchingOption });
  }

  checkMatchingOption(formData, option) {
    // Assign the definitions to the option, otherwise the match can fail if
    // the new option uses a $ref
    option = {
      definitions: this.props.registry.definitions,
      ...option,
    };

    if (!option.properties) {
      const result = isValid(this.props.injectedContext.ajv, option, formData);
      if (debug) {
        console.log(
          "MultiSchemaField.checkMatchingOption without properties (therefore no object type)",
          {
            formData,
            option,
            result,
          }
        );
      }
      return result;
    }

    // Force type to object if not set
    // option = { type: 'object', ...option };

    // The schema describes an object, so we need to add slightly more
    // strict matching to the schema, because unless the schema uses the
    // "requires" keyword, an object will match the schema as long as it
    // doesn't have matching keys with a conflicting type. To do this we use an
    // "anyOf" with an array of requires. This augmentation expresses that the
    // schema should match if any of the keys in the schema are present on the
    // object and pass validation.

    // Create an "anyOf" schema that requires at least one of the keys in the
    // "properties" object
    const requiresAnyOf = {
      anyOf: Object.keys(option.properties).map(key => ({
        required: [key],
      })),
    };

    let augmentedSchema;

    // If the "anyOf" keyword already exists, wrap the augmentation in an "allOf"
    if (option.anyOf) {
      // Create a shallow clone of the option
      const { ...shallowClone } = option;

      if (!shallowClone.allOf) {
        shallowClone.allOf = [];
      } else {
        // If "allOf" already exists, shallow clone the array
        shallowClone.allOf = shallowClone.allOf.slice();
      }

      shallowClone.allOf.push(requiresAnyOf);

      augmentedSchema = shallowClone;
    } else {
      augmentedSchema = Object.assign({}, option, requiresAnyOf);
    }

    // Remove the "required" field as it's likely that not all fields have
    // been filled in yet, which will mean that the schema is not valid
    delete augmentedSchema.required;

    const result = isValid(
      this.props.injectedContext.ajv,
      augmentedSchema,
      formData
    );
    if (debug) {
      console.log("MultiSchemaField.checkMatchingOption() with properties", {
        formData,
        augmentedSchema,
        result,
      });
    }
    return result;
  }

  getMatchingOption = (formData, options, preferredOption) => {
    if (debug) {
      console.group("MultiSchemaField.getMatchingOption()", {
        formData,
        options,
        preferredOption,
      });
    }

    // Check an preferred option first
    if (preferredOption != undefined) {
      if (
        options.length > 0 &&
        preferredOption >= 0 &&
        preferredOption < options.length
      ) {
        if (this.checkMatchingOption(formData, options[preferredOption])) {
          if (debug) {
            console.log(
              "MultiSchemaField.getMatchingOption() result: preferred option",
              preferredOption
            );
            console.groupEnd();
          }
          return preferredOption;
        }
      } else {
        // Explicitly set to undefined to handle index being out of bounds
        preferredOption = undefined;
      }
    }

    for (let i = 0; i < options.length; i++) {
      // Skip already-checked preferred option (if any)
      if (preferredOption === i) {
        continue;
      }
      if (this.checkMatchingOption(formData, options[i])) {
        if (debug) {
          console.log("MultiSchemaField.getMatchingOption() result: index", i);
          console.groupEnd();
        }
        return i;
      }
    }

    // If the form data matches none of the options, use the preferred (= currently
    // selected) option, assuming it's available; otherwise use the first option,
    // assuming there's at least one option available
    const result = preferredOption != undefined ? preferredOption : 0;
    if (debug) {
      console.log(
        "MultiSchemaField.getMatchingOption() result: not found, return preferredOption or 0",
        { result, preferredOption }
      );
      console.groupEnd();
    }
    return result;
  };

  onOptionChange = option => {
    const {
      formData,
      onChange,
      options,
      registry = getDefaultRegistry(),
    } = this.props;

    const selectedOption = parseInt(option, 10);

    const newOption = retrieveSchema(
      options[selectedOption],
      registry.definitions,
      formData
    );

    // If the new option is of type object and the current data is an object,
    // discard properties added using the old option.
    if (
      guessType(formData) === "object" &&
      (newOption.type === "object" || newOption.properties)
    ) {
      const { definitions } = registry;
      if (debug) {
        console.log(
          "MultiSchemaField onOptionChange getDefaultFormState test",
          getDefaultFormState(
            this.props.injectedContext.ajv,
            { type: "object", ...newOption },
            formData,
            definitions
          ),
          getDefaultFormState(
            this.props.injectedContext.ajv,
            { type: "object", ...newOption },
            undefined,
            definitions
          ),
          { newOption, formData, definitions }
        );
      }

      // const newFormData = Object.assign({}, formData);
      const newFormData = getDefaultFormState(
        this.props.injectedContext.ajv,
        { type: "object", ...newOption },
        formData,
        definitions
      );

      const optionsToDiscard = options.slice();
      optionsToDiscard.splice(selectedOption, 1);

      // Discard any data added using other options
      for (const option of optionsToDiscard) {
        if (option.properties) {
          for (const key in option.properties) {
            if (newFormData.hasOwnProperty(key)) {
              delete newFormData[key];
            }
          }
        }
      }

      onChange(newFormData);
    } else {
      onChange(undefined);
    }

    this.setState({
      selectedOption: parseInt(option, 10),
    });
  };

  render() {
    const {
      baseType,
      disabled,
      errorSchema,
      formData,
      idPrefix,
      idSchema,
      onBlur,
      onChange,
      onFocus,
      options,
      registry,
      safeRenderCompletion,
      uiSchema,
    } = this.props;

    const _SchemaField = registry.fields.SchemaField;
    const { widgets } = registry;
    const { selectedOption } = this.state;
    const { widget = "select", ...uiOptions } = getUiOptions(uiSchema);
    const Widget = getWidget({ type: "number" }, widget, widgets);

    const option = options[selectedOption] || null;
    let optionSchema;

    if (option) {
      // If the subschema doesn't declare a type, infer the type from the
      // parent schema
      optionSchema = option.type
        ? option
        : Object.assign({}, option, { type: baseType });
    }

    const enumOptions = options.map((option, index) => ({
      label: option.title || `Option ${index + 1}`,
      value: index,
    }));

    return (
      <div className="panel panel-default panel-body">
        <div className="form-group">
          <Widget
            id={`${idSchema.$id}_anyof_select`}
            schema={{ type: "number", default: 0 }}
            onChange={this.onOptionChange}
            onBlur={onBlur}
            onFocus={onFocus}
            value={selectedOption}
            options={{ enumOptions }}
            {...uiOptions}
          />
        </div>

        {option !== null && (
          <_SchemaField
            schema={optionSchema}
            uiSchema={uiSchema}
            errorSchema={errorSchema}
            idSchema={idSchema}
            idPrefix={idPrefix}
            formData={formData}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            registry={registry}
            safeRenderCompletion={safeRenderCompletion}
            disabled={disabled}
          />
        )}
      </div>
    );
  }
}

MultiSchemaField.defaultProps = {
  disabled: false,
  errorSchema: {},
  idSchema: {},
  uiSchema: {},
};

if (process.env.NODE_ENV !== "production") {
  MultiSchemaField.propTypes = {
    options: PropTypes.arrayOf(PropTypes.object).isRequired,
    baseType: PropTypes.string,
    uiSchema: PropTypes.object,
    idSchema: PropTypes.object,
    formData: PropTypes.any,
    errorSchema: PropTypes.object,
    registry: types.registry.isRequired,
  };
}

// WORKAROUND: wrapper as a workaround for missing static variable contextType.
// The contextType feature is available starting with React 16.6.
// mini-create-react-context does not polyfill/ponyfill this feature and we're not
// aware of any other solutions backporting this. As soon as the peer dependency to
// React has been bumped up to >= 16.6:
// - declare contextType static variable: static contextType = FormContext;
// - replace this.props.injectedContext with: this.context
// - simplify default export statement back to: export default MultiSchemaField;
export default props => (
  <FormContext.Consumer>
    {context => <MultiSchemaField injectedContext={context} {...props} />}
  </FormContext.Consumer>
);
