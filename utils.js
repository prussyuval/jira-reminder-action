const axios = require('axios');

/**
 * Format the message to print
 * @param {String} mention Username to mention as the reviewer
 * @param {String} title PR title
 * @param {String} priority Priority of the issue
 * @param {String} lastCommenter Last commenter on the issue
 * @param {String} url PR URL
 * @param {String} messageTemplate Message template to render
 */
function formatMessage(mention, title, priority, lastCommenter, url, messageTemplate) {
  let message = messageTemplate.replace('{mention}', mention);
  message = message.replace('{title}', title);
  message = message.replace('{url}', url);

  let priority_sign = '';
  if (priority === 'high') {
    priority_sign = ':arrow_up:';
  }
  if (priority === 'medium') {
    priority_sign = ':left_right_arrow:';
  }
  if (priority === 'low') {
    priority_sign = ':arrow_down:';
  }

  message = message.replace('{priority_sign}', priority_sign);
  message = message.replace('{last_commenter}', lastCommenter);
  return message;
}

/**
 * Create a pretty message to print
 * @param {String} jiraHost Jira hostname
 * @param {Array} issues Array of issues
 * @param {Object} jiraToGithubMapping Object with the mapping between Jira and GitHub users
 * @param {String} messageTemplate The message template to use
 * @param {String} channel Channel to send the message
 * @param {String} defaultMentionUnassigned Default mention for unassigned issues
 * @return {object} Response object from Jira API
 */
function formatSlackMessage(jiraHost, issues, jiraToGithubMapping, messageTemplate, channel, defaultMentionUnassigned) {
  if (messageTemplate === null || messageTemplate === undefined) {
    messageTemplate = 'Hey {mention}, {priority_sign} issue "{title}" is waiting for your review: {url}';
  }

  let message = '';

  if (issues.length > 0) {
    message += `*Reminder of ${issues.length} issues:*\n`;
  }

  for (const issue of issues) {
    const issueFields = issue.fields;

    let mention;
    if (!('assignee' in issueFields) || issueFields.assignee === null) {
      mention = defaultMentionUnassigned;
    } else {
      const assignee = issueFields.assignee;
      mention = jiraToGithubMapping[assignee.accountId] ?
        `<@${jiraToGithubMapping[assignee.accountId]}>` :
        `${assignee.displayName} (${assignee.accountId})`;
    }

    let summary = issueFields.summary;
    let priority = issueFields.priority ? issueFields.priority.name.toLowerCase() : null;

    let comments = issue.fields.comment.comments;
    let lastCommenter = '';
    if (comments.length > 0) {
        lastCommenter = comments[comments.length - 1].author.displayName;
    }

    message += formatMessage(mention, summary, priority, lastCommenter, `https://${jiraHost}/browse/${issue.key}`, messageTemplate) + "\n";
  }

  return {
    channel: channel,
    username: 'Jira issues reminder',
    text: message,
  };
}

/**
 * Send notification to a channel
 * @param {String} webhookUrl Webhook URL
 * @param {Object} messageData Message data object to send into the channel
 * @return {Promise} Axios promise
 */
async function sendNotification(webhookUrl, messageData) {
  return await axios({
    method: 'POST',
    url: webhookUrl,
    data: messageData,
  });
}

/**
 * Convert a string like "name1->ID123,name2->ID456" to an Object { name1: "ID123", name2: "ID456"}
 * @param {String} str String to convert to Object
 * @return {Object} Object with Account IDs as properties and IDs as values
 */
function stringToObject(str) {
  const map = {};
  if (!str) {
    return map;
  }

  const userPattern = /([\w-:]+->\w+)/g;
  let users = [];
  let match = null;
  do {
      match = userPattern.exec(str);
      if(match) {
          users.push(match[0]);
      }
  } while (match);

  users.forEach((user) => {
    const [github, provider] = user.split('->');
    map[github] = provider;
  });
  return map;
}

module.exports = {
  formatSlackMessage,
  sendNotification,
  stringToObject,
};


