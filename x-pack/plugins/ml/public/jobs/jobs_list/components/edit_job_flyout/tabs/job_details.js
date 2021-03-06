/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */


import PropTypes from 'prop-types';
import React, {
  Component
} from 'react';

import {
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiSpacer,
  EuiComboBox,
} from '@elastic/eui';

import '../styles/main.less';
import { ml } from 'plugins/ml/services/ml_api_service';

export class JobDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      description: '',
      groups: [],
      selectedGroups: [],
      mml: '',
      mmlValidationError: '',
      groupsValidationError: '',
    };

    this.setJobDetails = props.setJobDetails;
  }

  componentDidMount() {
    // load groups to populate the select options
    ml.jobs.groups()
      .then((resp) => {
        const groups = resp.map(g => ({ label: g.id }));
        this.setState({ groups });
      })
      .catch((error) => {
        console.error('Could not load groups', error);
      });
  }

  static getDerivedStateFromProps(props) {
    const selectedGroups = (props.jobGroups !== undefined) ?
      props.jobGroups.map(g => ({ label: g })) :
      [];

    return {
      description: props.jobDescription,
      selectedGroups,
      mml: props.jobModelMemoryLimit,
      mmlValidationError: props.jobModelMemoryLimitValidationError,
      groupsValidationError: props.jobGroupsValidationError,
    };
  }

  onDescriptionChange = (e) => {
    this.setJobDetails({ jobDescription: e.target.value });
  }

  onMmlChange = (e) => {
    this.setJobDetails({ jobModelMemoryLimit: e.target.value });
  }

  onGroupsChange = (selectedGroups) => {
    this.setJobDetails({ jobGroups: selectedGroups.map(g => g.label) });
  }

  onCreateGroup = (input, flattenedOptions) => {
    const normalizedSearchValue = input.trim().toLowerCase();

    if (!normalizedSearchValue) {
      return;
    }

    const newGroup = {
      label: input,
    };

    const groups = this.state.groups;
    // Create the option if it doesn't exist.
    if (flattenedOptions.findIndex(option =>
      option.label.trim().toLowerCase() === normalizedSearchValue
    ) === -1) {
      groups.push(newGroup);
    }

    const selectedGroups = this.state.selectedGroups.concat(newGroup);

    // update the groups in local state and call onGroupsChange to
    // update the selected groups in the component above which manages this
    // component's state
    this.setState({ groups }, () => this.onGroupsChange(selectedGroups));
  };

  render() {
    const {
      description,
      selectedGroups,
      mml,
      groups,
      mmlValidationError,
      groupsValidationError,
    } = this.state;
    return (
      <React.Fragment>
        <EuiSpacer size="m" />
        <EuiForm>
          <EuiFormRow
            label="Job description"
          >
            <EuiFieldText
              value={description}
              onChange={this.onDescriptionChange}
            />
          </EuiFormRow>
          <EuiFormRow
            label="Job groups"
            isInvalid={(groupsValidationError !== '')}
            error={groupsValidationError}
          >
            <EuiComboBox
              placeholder="Select or create groups"
              options={groups}
              selectedOptions={selectedGroups}
              onChange={this.onGroupsChange}
              onCreateOption={this.onCreateGroup}
              isClearable={true}
              isInvalid={(groupsValidationError !== '')}
              error={groupsValidationError}
            />
          </EuiFormRow>
          <EuiFormRow
            label="Model memory limit"
            isInvalid={(mmlValidationError !== '')}
            error={mmlValidationError}
          >
            <EuiFieldText
              value={mml}
              onChange={this.onMmlChange}
              isInvalid={(mmlValidationError !== '')}
              error={mmlValidationError}
            />
          </EuiFormRow>
        </EuiForm>
      </React.Fragment>
    );
  }
}
JobDetails.propTypes = {
  jobDescription: PropTypes.string.isRequired,
  jobGroups: PropTypes.array.isRequired,
  jobModelMemoryLimit: PropTypes.string.isRequired,
  setJobDetails: PropTypes.func.isRequired,
};
