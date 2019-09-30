# CHANGELOG.md

## Unreleased
- Change changelog order 😅

## v6.2.0
- `addwebhook` now allows a trello board url instead of a short link (board id)
- `addwebhook` now strips extra information from the end of a webhook url, i.e. `/github` on the end of a webhook
- The timeout for pagination reactions has been increased from 10 seconds to 30 seconds

## v6.1.0
- Fix typo in changelog 🤔
- Add aeval command (`T!aeval`)
- Make errors more descriptive in addwebhook
- Update remwebhook so that it actually deletes internal webhooks as well
- Add LICENSE file and update README.md

## v6.0.1
- Hotfix for webhooks not working

## v6.0.0
- Another breaking change 😒
- Config files are neater, and now you don't need to edit the actual bot files for links, this is done in Config/links.js

## v5.0.0
- Change branding
- Create a changelog
