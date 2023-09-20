const core = require('@actions/core');

const {
  getJiraIssues,
  getIssuesToNotify,
} = require('./jira');
const {
  formatSlackMessage,
  sendNotification,
} = require('./utils');


/**
 * Main function for the GitHub Action
 */
async function main() {
  try {
    const webhookUrl = core.getInput('webhook-url');
    const channel = core.getInput('channel');
    const jiraToGithubMapping = core.getInput('jira-github-map');
    const messageTemplate = core.getInput('message-template');
    const jiraUsername = core.getInput('jira-username');
    const jiraPassword = core.getInput('jira-password');
    const desiredCategory = core.getInput('jira-desired-category');

    // Get jira issues
    core.info('Getting jira issues...');
    const jiraResponse = await getJiraIssues(jiraUsername, jiraPassword);
    core.info(`There are ${jiraResponse.data.issues} issues`);
    const issuesToNotify = getIssuesToNotify(jiraResponse.data.issues, desiredCategory);
    core.info(`There are ${issuesToNotify.length} issues for notification`);

    if (issuesToNotify.length) {
      const message = formatSlackMessage(issuesToNotify, jiraToGithubMapping, messageTemplate, channel);
      await sendNotification(webhookUrl, message);
      core.info(`Notification was sent successfully!`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
