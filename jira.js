const axios = require('axios');
const core = require('@actions/core');

/**
 * Get Jira issues using Jira API
 * @param {String} username Jira username
 * @param {String} password Jira API Key
 * @param {String} jiraHost Jira hostname
 * @return {object} Response object from Jira API
 */
async function getJiraIssues(username, password, jiraHost) {
  return await axios({
    method: 'GET',
    url: `https://${jiraHost}/rest/agile/1.0/board/12/issue`,
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

/**
 * Filter issues by desired category
 * @param {Array} issues Array of issues
 * @param {String} desiredCategory The desired category to filter
 * @return {Array} issues Array of issues with the desired category
 */
function getIssuesToNotify(issues, desiredCategory) {
  if (issues.length === 0) {
    return [];
  }

  if (desiredCategory === null || desiredCategory === undefined) {
    return issues;
  }

  let statuses = {};
  issues.forEach((issue) => {
    if (!(issue.fields.status.name.toLowerCase() in statuses)) {
      statuses[issue.fields.status.name.toLowerCase()] = 0;
    }
    statuses[issue.fields.status.name.toLowerCase()]++;
  });

  Object.keys(statuses).forEach(key => {
    const value = statuses[key];
    core.info(`There are ${value} issues for status '${key}'`);
  });

  core.info(`There are ${statuses[desiredCategory.toLowerCase()]} issues for status '${desiredCategory}'`);
  return issues.filter(issue => issue.fields.status.name.toLowerCase() === desiredCategory.toLowerCase());
}

module.exports = {
  getJiraIssues,
  getIssuesToNotify,
};
