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
    const jiraHost = core.getInput('jira-host');
    const jiraBoardId = core.getInput('jira-board-id');
    const desiredCategory = core.getInput('jira-desired-category');
    const defaultMentionUnassigned = core.getInput('default-mention-unassigned');

    // Get jira issues
    core.info('Getting jira issues...');
    const jiraResponse = await getJiraIssues(jiraUsername, jiraPassword, jiraHost, jiraBoardId);
    core.info(`There are ${jiraResponse.data.issues.length} issues`);
    const issuesToNotify = getIssuesToNotify(jiraResponse.data.issues, desiredCategory);
    core.info(`There are ${issuesToNotify.length} issues for notification`);

    if (issuesToNotify.length) {
      const message = formatSlackMessage(
          jiraHost, issuesToNotify, jiraToGithubMapping, messageTemplate, channel, defaultMentionUnassigned
      );
      await sendNotification(webhookUrl, message);
      core.info(`Notification was sent successfully!`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
