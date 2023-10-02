const axios = require('axios');

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
    url += `?maxResults=1000&jql=${jiraCustomFilter}`;
  }

  console.log(`Jira API URL: ${url}`);

  try {
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
  } catch (error) {
    console.error(`Failed to get Jira issues: ${error}`);
    console.error(error.response.data);
    throw new Error(error);
  }
}

module.exports = {
  getJiraIssues,
};
