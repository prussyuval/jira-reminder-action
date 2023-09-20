const axios = require('axios');
const core = require('@actions/core');

/**
 * Get Jira issues using Jira API
 * @param {String} username Jira username
 * @param {String} password Jira API Key
 * @param {String} jiraHost Jira hostname
 * @param {String} jiraBoardId Jira board ID
 * @param {String} jiraCustomFilter Jira custom filter for the query URL
 * @return {object} Response object from Jira API
 */
async function getJiraIssues(username, password, jiraHost, jiraBoardId, jiraCustomFilter) {
  let url = `https://${jiraHost}/rest/agile/1.0/board/${jiraBoardId}/issue`;
  if (jiraCustomFilter) {
    url += `?jql=${jiraCustomFilter}`;
  }

  return await axios({
    method: 'GET',
    url: url,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    auth: {
      username: username,
      password: password,
    },
  });
}

module.exports = {
  getJiraIssues,
};
