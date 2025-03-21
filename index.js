const core = require('@actions/core');

const {
  getJiraIssues,
} = require('./jira');
const {
  formatSlackMessage,
  sendNotification,
  stringToObject,
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
    const messageTitleTemplate = core.getInput('message-title-template');
    const jiraUsername = core.getInput('jira-username');
    const jiraPassword = core.getInput('jira-password');
    const jiraHost = core.getInput('jira-host');
    const jiraBoardId = core.getInput('jira-board-id');
    const jiraCustomFilter = core.getInput('jira-custom-filter');
    const defaultMentionUnassigned = core.getInput('default-mention-unassigned');
    const defaultMentionUnassignedByFieldName = core.getInput('default-mention-unassigned-by-field');
    const defaultMentionUnassignedByFieldMapping = core.getInput('default-mention-unassigned-by-field-mapping');

    // Get jira issues
    core.info('Getting jira issues...');
    const jiraResponse = await getJiraIssues(jiraUsername, jiraPassword, jiraHost, jiraBoardId, jiraCustomFilter);
    const issues = jiraResponse.data.issues;
    core.info(`There are ${issues.length} issues for notification`);

    if (issues.length) {
      const usersMap = stringToObject(jiraToGithubMapping);
      const defaultMentionUnassignedByFieldMappingParsed = stringToObject(defaultMentionUnassignedByFieldMapping);
      core.info('Users map:');
      for (const [github, provider] of Object.entries(usersMap)) {
        core.info(`${github} => ${provider}`);
      }

      console.log("defaultMentionUnassignedByFieldName");
      console.log(defaultMentionUnassignedByFieldName);
      console.log("defaultMentionUnassignedByFieldMappingParsed");
      console.log(defaultMentionUnassignedByFieldMappingParsed);

      const message = formatSlackMessage(
          jiraHost, 
          issues, 
          usersMap, 
          messageTemplate, 
          messageTitleTemplate, 
          channel, 
          defaultMentionUnassigned,
          defaultMentionUnassignedByFieldName,
          defaultMentionUnassignedByFieldMappingParsed,
      );
      const response = await sendNotification(webhookUrl, message);
      core.info(`Request message: ${JSON.stringify(message)}`);
      core.info(`Response status: ${response.status}`);
      core.info(`Response data: ${JSON.stringify(response.data)}`);
      core.info(`Notification was sent successfully!`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
